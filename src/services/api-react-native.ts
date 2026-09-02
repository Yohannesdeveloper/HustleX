/**
 * API Service for React Native
 * Handles all API calls to the backend
 * Integrated with enterprise rate limiter
 */

import { getBackendApiUrlSync, getBackendUrlSync, getBackendUrl, clearPortCache } from '../utils/portDetector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enterpriseRequestHandler from '../utils/enterpriseRequestHandler';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  // Rate limiting for checkUser
  private lastCheckUserCall: number = 0;
  private checkUserRetryDelay: number = 2000; // Start with 2 seconds
  private checkUserCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // Cache for 30 seconds

  getBaseUrl(): string {
    return getBackendUrlSync();
  }

  private getApiUrl(): string {
    return getBackendApiUrlSync();
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    // Use enterprise request handler for automatic rate limit handling
    return enterpriseRequestHandler.execute(
      async () => {
        const token = await this.getAuthToken();
        const apiUrl = this.getApiUrl();
        const url = `${apiUrl}${endpoint}`;

        const headers: any = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        try {
          const response = await fetch(url, {
            ...options,
            headers,
          });

          // Update rate limit info from headers (even on success)
          enterpriseRequestHandler.updateRateLimitInfo(endpoint, response.headers);

          if (!response.ok) {
            let errorData: any = { message: 'Request failed' };
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
              } else {
                const text = await response.text();
                errorData = { message: text || `HTTP error! status: ${response.status}` };
              }
            } catch (parseError) {
              errorData = { message: `HTTP error! status: ${response.status}` };
            }

            const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
            (error as any).status = response.status;
            (error as any).isNotFound = response.status === 404;
            (error as any).errorData = errorData;
            throw error;
          }

          return await response.json();
        } catch (error: any) {
          // Log connection errors
          if (error?.message?.includes('Failed to fetch') ||
            error?.message?.includes('Network Error') ||
            error?.code === 'ERR_NETWORK') {
            console.error(`❌ Cannot connect to backend at ${url}`);
            console.error(`   Make sure the backend server is running on port 5001 (or check port.json)`);
          } else if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
            const isCompanyProfile404 = endpoint === '/companies/profile' && error?.status === 404;
            const isMessages404 = endpoint === '/messages' && (error?.status === 404 || error?.message?.includes('Route not found'));
            if (!isCompanyProfile404 && !isMessages404) {
              console.error(`❌ API Error (${endpoint}):`, error.message);
              if (error.errorData) {
                console.error(`📦 Error Details:`, JSON.stringify(error.errorData, null, 2));
              }
            }
          }
          throw error;
        }
      },
      endpoint,
      priority
    );
  }

  // Auth API
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await this.request<{ token: string; user?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
    }
    return { token: response.token };
  }

  async register(userData: {
    email: string;
    password: string;
    role: "freelancer" | "client";
    roles?: string[];
    firstName?: string;
    lastName?: string;
  }): Promise<{ token: string }> {
    const response = await this.request<{ token: string; user?: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
    }
    return { token: response.token };
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/me');
    return response.user;
  }

  async switchRole(role: "freelancer" | "client"): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    return response.user;
  }

  async addRole(role: "freelancer" | "client"): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/add-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    return response.user;
  }

  async saveFreelancerProfile(profileData: any): Promise<any> {
    return this.request('/auth/freelancer-profile', {
      method: 'POST',
      body: JSON.stringify({ profile: profileData }),
    });
  }

  async updateMyProfile(profileData: any): Promise<any> {
    const response = await this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ profile: profileData }),
    });
    return response.user;
  }

  isAuthenticated(): boolean {
    // Check if token exists in AsyncStorage synchronously
    // Note: This is a best-effort check. For accurate check, use getAuthToken()
    try {
      // We can't check AsyncStorage synchronously, so we'll return true
      // and let the actual API call fail if token is invalid
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    AsyncStorage.removeItem('authToken').catch(() => { });
  }

  // Password Reset API
  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyPasswordResetOTP(email: string, otp: string): Promise<{ message: string }> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  // Check if user exists by email (for signup flow)
  async checkUser(email: string): Promise<{ user: any } | null> {
    try {
      // Check cache first
      const cached = this.checkUserCache.get(email.toLowerCase());
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log(`[checkUser] Using cached result for: ${email}`);
        return cached.result;
      }

      // Rate limiting: Don't make requests too frequently
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCheckUserCall;
      if (timeSinceLastCall < this.checkUserRetryDelay) {
        const waitTime = this.checkUserRetryDelay - timeSinceLastCall;
        console.log(`[checkUser] Rate limiting: waiting ${waitTime}ms before next request`);
        // Return cached result if available, otherwise return null to allow signup
        if (cached) {
          return cached.result;
        }
        return null;
      }

      this.lastCheckUserCall = now;
      const apiUrl = this.getApiUrl();
      const baseUrl = this.getBaseUrl();
      const url = `${apiUrl}/auth/check-user?email=${encodeURIComponent(email)}`;

      console.log(`[checkUser] Checking user at: ${url}`);

      // Skip health check if we're rate-limited (health check also hits rate limits)
      // Only do health check if we haven't been rate-limited recently
      if (this.checkUserRetryDelay <= 2000) {
        try {
          const healthUrl = `${baseUrl}/api/health`;
          const healthResponse = await fetch(healthUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (healthResponse.ok) {
            console.log('[checkUser] Backend health check passed');
          } else if (healthResponse.status === 429) {
            console.warn(`[checkUser] Health check rate limited (429) - skipping health check`);
            // Increase retry delay
            this.checkUserRetryDelay = Math.min(this.checkUserRetryDelay * 2, 30000);
          } else {
            console.warn(`[checkUser] Health check returned ${healthResponse.status}`);
          }
        } catch (healthError: any) {
          console.warn('[checkUser] Health check failed:', healthError?.message);
          // Continue anyway - might be a CORS issue with health endpoint
        }
      }

      // Use the same pattern as request method but handle 404s gracefully
      const token = await this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`[checkUser] Making request with headers:`, Object.keys(headers));

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log(`[checkUser] Response status: ${response.status}`);

      // 404 means user doesn't exist - this is expected for new signups
      if (response.status === 404) {
        console.log('[checkUser] User not found (404) - this is normal for new users');
        const result = null;
        // Cache the result
        this.checkUserCache.set(email.toLowerCase(), { result, timestamp: Date.now() });
        // Reset retry delay on success
        this.checkUserRetryDelay = 2000;
        return result;
      }

      // 429 means rate limited - use exponential backoff
      if (response.status === 429) {
        // Exponential backoff: double the delay, max 30 seconds
        this.checkUserRetryDelay = Math.min(this.checkUserRetryDelay * 2, 30000);
        console.warn(`[checkUser] Rate limited (429). Next retry delay: ${this.checkUserRetryDelay}ms`);
        // Return cached result if available, otherwise return null to allow signup
        if (cached) {
          return cached.result;
        }
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('[checkUser] User found:', data.user?.email);
        // Cache the result
        this.checkUserCache.set(email.toLowerCase(), { result: data, timestamp: Date.now() });
        // Reset retry delay on success
        this.checkUserRetryDelay = 2000;
        return data;
      }

      // Other error statuses - try to get error message
      try {
        const errorData = await response.json();
        console.warn(`[checkUser] Unexpected status ${response.status}:`, errorData.message || errorData);
      } catch {
        const errorText = await response.text().catch(() => 'Could not read response');
        console.warn(`[checkUser] Unexpected status ${response.status}, response: ${errorText}`);
      }

      // Cache null result for errors (but shorter cache duration)
      this.checkUserCache.set(email.toLowerCase(), { result: null, timestamp: Date.now() });
      return null;
    } catch (error: any) {
      // Network errors are expected if backend is offline - don't throw
      // Just return null to allow signup to proceed
      const errorMsg = error?.message || String(error);
      console.warn(`[checkUser] Error: ${errorMsg}`);

      // Log full error details for debugging
      if (error?.name) console.warn(`[checkUser] Error name: ${error.name}`);
      if (error?.code) console.warn(`[checkUser] Error code: ${error.code}`);
      if (error?.stack) console.warn(`[checkUser] Stack: ${error.stack.substring(0, 200)}`);

      // Check if it's a network/connection error
      if (errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('Network Error') ||
        errorMsg.includes('Network request failed') ||
        error?.code === 'ERR_NETWORK' ||
        error?.name === 'TypeError') {
        console.warn('[checkUser] Backend appears unreachable - allowing signup to proceed');
        console.warn('[checkUser] This may be due to:');
        console.warn('  - Backend server not running');
        console.warn('  - CORS configuration issue');
        console.warn('  - Network connectivity problem');
        console.warn('  - MongoDB connection issue (backend running but DB unreachable)');
      }

      // Return cached result if available on error
      const cached = this.checkUserCache.get(email.toLowerCase());
      if (cached) {
        return cached.result;
      }
      return null;
    }
  }

  // Jobs API
  async getJobs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    jobType?: string;
    workLocation?: string;
    sortBy?: string;
  }): Promise<{ jobs: any[]; pagination: { current: number; pages: number; total: number } }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.jobType) queryParams.append('jobType', params.jobType);
    if (params?.workLocation) queryParams.append('workLocation', params.workLocation);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    const endpoint = `/jobs${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getJob(jobId: string): Promise<any> {
    return this.request(`/jobs/${jobId}`);
  }

  async getMyJobs(): Promise<any[]> {
    return this.request('/jobs/user/my-jobs');
  }

  async getJobPostingStatus(): Promise<{
    planId: string;
    planName: string;
    status: string;
    isExpired: boolean;
    expiresAt: string | null;
    subscribedAt: string | null;
    canPost: boolean;
    message: string;
    limits: {
      type: string;
      limit: number;
      current: number;
      remaining: number;
    };
    stats: {
      totalJobs: number;
      monthlyJobs: number;
    };
  }> {
    return this.request('/jobs/posting-status');
  }

  async createJob(jobData: any): Promise<any> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(jobId: string, jobData: any): Promise<any> {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(jobId: string): Promise<void> {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async clearAllJobs(): Promise<void> {
    return this.request('/jobs/user/clear-all', {
      method: 'DELETE',
    });
  }

  // Job Moderation API (Admin)
  async fetchPendingJobs(): Promise<any> {
    return this.request('/jobs/pending/list', {
      headers: { 'x-admin-code': 'JobModeration' }
    });
  }

  async approveJob(jobId: string): Promise<any> {
    return this.request(`/jobs/${jobId}/approve`, {
      method: 'PUT',
      headers: { 'x-admin-code': 'JobModeration' }
    });
  }

  async declineJob(jobId: string, reason?: string): Promise<any> {
    return this.request(`/jobs/${jobId}/decline`, {
      method: 'PUT',
      headers: { 'x-admin-code': 'JobModeration' },
      body: JSON.stringify({ reason })
    });
  }

  // Applications API
  async submitApplication(applicationData: any): Promise<any> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async checkApplication(jobId: string): Promise<{ hasApplied: boolean }> {
    return this.request(`/applications/check/${jobId}`);
  }

  async getApplications(jobId?: string): Promise<any[]> {
    // For freelancers: use /my-applications to get their own applications
    // For clients: use /job/:jobId to get applications for a specific job
    if (jobId) {
      return this.request(`/applications/job/${jobId}`);
    }
    // Default: get current user's applications
    return this.request('/applications/my-applications');
  }

  async updateApplicationStatus(applicationId: string, status: string, feedback?: string): Promise<any> {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback }),
    });
  }

  async getMyJobsApplications(): Promise<any[]> {
    return this.request('/applications/my-jobs-applications');
  }

  async sendNotificationEmail(data: { to: string; subject: string; body: string }): Promise<any> {
    return this.request('/notifications/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payment API
  async sendPaymentRequest(phoneNumber: string, planId: string, amount: number, currency: string): Promise<any> {
    return this.request('/pricing/send-payment-request', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, planId, amount, currency }),
    });
  }

  async subscribeToPlan(planId: string, paymentMethod: string): Promise<any> {
    return this.request('/pricing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    });
  }

  // Admin Subscription API
  async fetchPendingSubscriptions(): Promise<any> {
    return this.request('/pricing/admin/pending-subscriptions', {
      headers: { 'x-admin-code': 'JobModeration' }
    });
  }

  async approveSubscription(userId: string): Promise<any> {
    return this.request(`/pricing/admin/approve/${userId}`, {
      method: 'POST',
      headers: { 'x-admin-code': 'JobModeration' }
    });
  }

  async rejectSubscription(userId: string): Promise<any> {
    return this.request(`/pricing/admin/reject/${userId}`, {
      method: 'POST',
      headers: { 'x-admin-code': 'JobModeration' }
    });
  }

  // File uploads
  async uploadCV(file: any): Promise<{ fileUrl: string }> {
    const token = await this.getAuthToken();
    const apiUrl = this.getApiUrl();
    const formData = new FormData();

    const fileUri = file.uri;

    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    // Generate a filename if not provided
    let fileName = file.fileName || file.name || '';

    // Determine file type - DocumentPicker might not always provide mimeType
    let fileType = file.mimeType || file.type;
    if (!fileType) {
      // Try to infer from URI or filename
      if (fileUri.includes('.pdf') || fileName.includes('.pdf')) {
        fileType = 'application/pdf';
      } else if (fileUri.includes('.doc') || fileName.includes('.doc')) {
        fileType = 'application/msword';
      } else if (fileUri.includes('.docx') || fileName.includes('.docx')) {
        fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        fileType = 'application/pdf'; // Default
      }
    }

    if (!fileName) {
      const extension = fileType.includes('pdf') ? 'pdf' :
        fileType.includes('docx') ? 'docx' : 'doc';
      fileName = `cv_${Date.now()}.${extension}`;
    }

    // Check if this is a blob URL (web platform)
    const isBlobUrl = fileUri.startsWith('blob:');

    let fileToUpload: any;

    if (isBlobUrl) {
      // For web blob URLs, we need to convert to a File object
      try {
        console.log(`[uploadCV] Converting blob URL to File object`);
        const response = await fetch(fileUri);
        const blob = await response.blob();
        // Create a File object from the blob
        fileToUpload = new File([blob], fileName, { type: fileType });
        console.log(`[uploadCV] Created File object:`, {
          name: fileToUpload.name,
          type: fileToUpload.type,
          size: fileToUpload.size
        });
      } catch (blobError: any) {
        console.error(`[uploadCV] Error converting blob to File:`, blobError);
        throw new Error(`Failed to process file: ${blobError.message}`);
      }
    } else {
      // For React Native (file:// or content:// URIs), use the object structure
      fileToUpload = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      };
    }

    // Log the file object structure for debugging
    console.log(`[uploadCV] File object:`, {
      uri: fileUri,
      type: fileType,
      name: fileName,
      isBlobUrl,
      hasMimeType: !!file.mimeType,
      hasType: !!file.type,
      hasFileName: !!file.fileName,
      hasName: !!file.name,
      allKeys: Object.keys(file),
    });

    console.log(`[uploadCV] FormData file object:`, fileToUpload);

    // Append to FormData
    formData.append('cv', fileToUpload as any);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const uploadUrl = `${apiUrl}/upload/cv`;
      console.log(`[uploadCV] Uploading to: ${uploadUrl}`);
      console.log(`[uploadCV] File URI: ${fileUri}`);
      console.log(`[uploadCV] File type: ${fileType}`);
      console.log(`[uploadCV] File name: ${fileName}`);
      console.log(`[uploadCV] Is blob URL: ${isBlobUrl}`);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'CV upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        console.error(`[uploadCV] Upload failed: ${errorMessage}`);
        console.error(`[uploadCV] Response status: ${response.status}`);
        console.error(`[uploadCV] Response text: ${errorText}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`[uploadCV] Upload successful:`, result);
      return result;
    } catch (error: any) {
      // Provide more detailed error information
      if (error?.message?.includes('Network request failed') ||
        error?.message?.includes('Failed to fetch')) {
        console.error(`❌ Network error uploading CV to ${apiUrl}/upload/cv`);
        console.error(`   Check if backend is running and accessible`);
        throw new Error('Network error: Could not connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async uploadAvatar(file: any): Promise<{ fileUrl: string }> {
    const token = await this.getAuthToken();
    const apiUrl = this.getApiUrl();
    const formData = new FormData();

    // Handle expo-image-picker asset structure
    // Asset from ImagePicker has: uri, mimeType, fileName, width, height, fileSize
    // The uri might be file://, content://, blob://, or http://
    const fileUri = file.uri;

    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    // Determine file type - ImagePicker might not always provide mimeType
    // Try to infer from URI extension or use default
    let fileType = file.mimeType || file.type;
    if (!fileType) {
      // Try to infer from URI
      if (fileUri.includes('.png')) {
        fileType = 'image/png';
      } else if (fileUri.includes('.gif')) {
        fileType = 'image/gif';
      } else if (fileUri.includes('.webp')) {
        fileType = 'image/webp';
      } else {
        fileType = 'image/jpeg'; // Default
      }
    }

    // Generate a filename if not provided
    let fileName = file.fileName || file.name;
    if (!fileName) {
      const extension = fileType.split('/')[1] || 'jpg';
      fileName = `avatar_${Date.now()}.${extension}`;
    }

    // Check if this is a blob URL (web platform)
    const isBlobUrl = fileUri.startsWith('blob:');

    let fileToUpload: any;

    if (isBlobUrl) {
      // For web blob URLs, we need to convert to a File object
      try {
        console.log(`[uploadAvatar] Converting blob URL to File object`);
        const response = await fetch(fileUri);
        const blob = await response.blob();
        // Create a File object from the blob
        fileToUpload = new File([blob], fileName, { type: fileType });
        console.log(`[uploadAvatar] Created File object:`, {
          name: fileToUpload.name,
          type: fileToUpload.type,
          size: fileToUpload.size
        });
      } catch (blobError: any) {
        console.error(`[uploadAvatar] Error converting blob to File:`, blobError);
        throw new Error(`Failed to process image: ${blobError.message}`);
      }
    } else {
      // For React Native (file:// or content:// URIs), use the object structure
      fileToUpload = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      };
    }

    // Log the file object structure for debugging
    console.log(`[uploadAvatar] File object:`, {
      uri: fileUri,
      type: fileType,
      name: fileName,
      isBlobUrl,
      hasMimeType: !!file.mimeType,
      hasType: !!file.type,
      hasFileName: !!file.fileName,
      hasName: !!file.name,
      allKeys: Object.keys(file),
    });

    console.log(`[uploadAvatar] FormData file object:`, fileToUpload);

    // Append to FormData
    formData.append('avatar', fileToUpload as any);

    // Don't set Content-Type header - let fetch set it automatically with boundary for multipart/form-data
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Explicitly do NOT set Content-Type - FormData will set it with boundary

    try {
      const uploadUrl = `${apiUrl}/upload/avatar`;
      console.log(`[uploadAvatar] Uploading to: ${uploadUrl}`);
      console.log(`[uploadAvatar] File URI: ${fileUri}`);
      console.log(`[uploadAvatar] File type: ${fileType}`);
      console.log(`[uploadAvatar] File name: ${fileName}`);
      console.log(`[uploadAvatar] Is blob URL: ${isBlobUrl}`);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Avatar upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        console.error(`[uploadAvatar] Upload failed: ${errorMessage}`);
        console.error(`[uploadAvatar] Response status: ${response.status}`);
        console.error(`[uploadAvatar] Response text: ${errorText}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`[uploadAvatar] Upload successful:`, result);
      return result;
    } catch (error: any) {
      // Provide more detailed error information
      if (error?.message?.includes('Network request failed') ||
        error?.message?.includes('Failed to fetch')) {
        console.error(`❌ Network error uploading avatar to ${apiUrl}/upload/avatar`);
        console.error(`   Check if backend is running and accessible`);
        throw new Error('Network error: Could not connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async uploadLogo(file: any): Promise<{ fileUrl: string }> {
    const token = await this.getAuthToken();
    const apiUrl = this.getApiUrl();
    const formData = new FormData();
    const fileUri = file.uri;

    if (!fileUri) throw new Error('No file URI provided');

    let fileName = file.fileName || file.name || `logo_${Date.now()}.jpg`;
    let fileType = file.mimeType || file.type || 'image/jpeg';

    const isBlobUrl = fileUri.startsWith('blob:');
    let fileToUpload: any;

    if (isBlobUrl) {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      fileToUpload = new File([blob], fileName, { type: fileType });
    } else {
      fileToUpload = { uri: fileUri, type: fileType, name: fileName };
    }

    formData.append('logo', fileToUpload as any);

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${apiUrl}/upload/logo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Logo upload failed');
    }

    return await response.json();
  }

  async uploadTradeLicense(file: any): Promise<{ fileUrl: string }> {
    const token = await this.getAuthToken();
    const apiUrl = this.getApiUrl();
    const formData = new FormData();
    const fileUri = file.uri;

    if (!fileUri) throw new Error('No file URI provided');

    let fileName = file.fileName || file.name || `license_${Date.now()}.pdf`;
    let fileType = file.mimeType || file.type || 'application/pdf';

    const isBlobUrl = fileUri.startsWith('blob:');
    let fileToUpload: any;

    if (isBlobUrl) {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      fileToUpload = new File([blob], fileName, { type: fileType });
    } else {
      fileToUpload = { uri: fileUri, type: fileType, name: fileName };
    }

    formData.append('tradeLicense', fileToUpload as any);

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${apiUrl}/upload/trade-license`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Trade license upload failed');
    }

    return await response.json();
  }

  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  }

  // Company Profile API
  async getCompanyProfile(): Promise<any> {
    return this.request('/companies/profile');
  }

  async updateCompanyProfile(profileData: any): Promise<any> {
    return this.request('/companies/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Conversations API - Integrated with enterprise rate limiter
  async getConversations(userId: string): Promise<any[]> {
    return this.request(`/messages/conversations`, {}, 'normal');
  }

  async getMessages(userId1: string, userId2: string): Promise<any[]> {
    const rawKey = [userId1, userId2].sort().join("_");
    const canonicalId = `conversation_${rawKey}`;
    try {
      const msgs = (await this.request(`/messages/conversation/${canonicalId}`, {}, 'high')) as any[];
      if (Array.isArray(msgs) && msgs.length > 0) {
        return msgs;
      }
    } catch (err) {
      console.warn('[apiService] Error fetching canonical conversation, falling back:', err);
    }

    try {
      const fallbackMsgs = (await this.request(`/messages/conversation/${rawKey}`, {}, 'high')) as any[];
      if (Array.isArray(fallbackMsgs)) {
        return fallbackMsgs;
      }
    } catch (fallbackErr) {
      console.warn('[apiService] Fallback conversation fetch failed:', fallbackErr);
    }

    return [];
  }

  async sendMessage(messageData: {
    senderId: string;
    receiverId: string;
    message: string;
    conversationId?: string;
    type?: string;
  }): Promise<any> {
    const conversationId =
      messageData.conversationId ||
      `conversation_${[messageData.senderId, messageData.receiverId].sort().join("_")}`;
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...messageData,
        conversationId,
      }),
    });
  }

  async editMessage(messageId: string, message: string): Promise<any> {
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  }

  async deleteMessage(messageId: string): Promise<any> {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getFreelancers(params?: {
    skills?: string;
    location?: string;
    experienceLevel?: string;
    search?: string;
  }): Promise<{ freelancers: any[] }> {
    const queryParams = new URLSearchParams();
    if (params?.skills) queryParams.append('skills', params.skills);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/users/freelancers${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Blogs API
  async getBlogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ blogs: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/blogs${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getBlog(blogId: string): Promise<any> {
    return this.request(`/blogs/${blogId}`);
  }

  async createBlog(blogData: any): Promise<any> {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(blogId: string, blogData: any): Promise<any> {
    return this.request(`/blogs/${blogId}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(blogId: string): Promise<void> {
    return this.request(`/blogs/${blogId}`, {
      method: 'DELETE',
    });
  }

  async fetchAdminBlogs(): Promise<{ blogs: any[] }> {
    return this.request('/blogs/admin/list', {
      headers: { 'x-admin-code': 'BlogPost' }
    });
  }

  async likeBlog(blogId: string): Promise<{ likes: number }> {
    return this.request(`/blogs/${blogId}/like`, {
      method: 'POST',
    });
  }

  async unlikeBlog(blogId: string): Promise<{ likes: number }> {
    return this.request(`/blogs/${blogId}/unlike`, {
      method: 'POST',
    });
  }

  async uploadBlogImage(file: any): Promise<{ fileUrl: string }> {
    const token = await this.getAuthToken();
    const apiUrl = this.getApiUrl();
    const formData = new FormData();

    const fileUri = file.uri;

    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    // Determine file type
    let fileType = file.mimeType || file.type;
    if (!fileType) {
      if (fileUri.includes('.png')) {
        fileType = 'image/png';
      } else if (fileUri.includes('.gif')) {
        fileType = 'image/gif';
      } else if (fileUri.includes('.webp')) {
        fileType = 'image/webp';
      } else {
        fileType = 'image/jpeg'; // Default
      }
    }

    // Generate a filename if not provided
    let fileName = file.fileName || file.name;
    if (!fileName) {
      const extension = fileType.split('/')[1] || 'jpg';
      fileName = `blog_${Date.now()}.${extension}`;
    }

    // Check if this is a blob URL (web platform)
    const isBlobUrl = fileUri.startsWith('blob:');

    let fileToUpload: any;

    if (isBlobUrl) {
      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        fileToUpload = new File([blob], fileName, { type: fileType });
      } catch (blobError: any) {
        console.error(`[uploadBlogImage] Error converting blob to File:`, blobError);
        throw new Error(`Failed to process image: ${blobError.message}`);
      }
    } else {
      fileToUpload = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      };
    }

    formData.append('blogImage', fileToUpload as any);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const uploadUrl = `${apiUrl}/upload/blog-image`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Blog image upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      if (error?.message?.includes('Network request failed') ||
        error?.message?.includes('Failed to fetch')) {
        console.error(`❌ Network error uploading blog image to ${apiUrl}/upload/blog-image`);
        throw new Error('Network error: Could not connect to server. Please check your connection.');
      }
      throw error;
    }
  }
}

const apiService = new ApiService();

// Clear any stale port cache on startup to ensure fresh detection
// This helps when the backend port changes (e.g., from 5001 to 5002)
clearPortCache();

// Initialize port detection on startup to populate cache
// This ensures the correct port (5002) is detected and cached
getBackendUrl().catch((error) => {
  console.warn('[apiService] Failed to initialize port detection:', error);
});

// Ensure all methods are properly bound
if (!apiService.register) {
  throw new Error('apiService.register is not defined');
}
if (!apiService.login) {
  throw new Error('apiService.login is not defined');
}
if (!apiService.getCurrentUser) {
  throw new Error('apiService.getCurrentUser is not defined');
}

// Export both as default and named export for compatibility
export default apiService;
export { apiService };
