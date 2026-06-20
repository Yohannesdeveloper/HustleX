import axios from "axios";
import {
  User,
  Job,
  Application,
  EmailData,
  ApplicationResponse,
  FreelancerWithStatus,
} from "../types";
import { getBackendApiUrlSync, getBackendApiUrl } from "../utils/portDetector";

declare const window: any;

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 200; // Minimum 200ms between requests
  private requestCache: Map<string, { promise: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5000; // Cache requests for 5 seconds
  private portDetectionPromise: Promise<void> | null = null;

  constructor() {
    // Initialize with sync version (uses cache or default)
    if (window.location.hostname.includes("devtunnels")) {
      this.baseUrl = `https://${window.location.hostname}/api`;
    } else {
      this.baseUrl = getBackendApiUrlSync();
    }

    // Detect port asynchronously and update baseUrl
    this.detectAndUpdatePort();

    this.token = localStorage.getItem("token");
    if (this.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    }

    axios.interceptors.request.use((config) => {
      const latestToken = localStorage.getItem("token");
      if (latestToken && config.headers) {
        config.headers.Authorization = `Bearer ${latestToken}`;
      }
      const adminCode = localStorage.getItem("adminCode");
      if (adminCode && config.headers) {
        config.headers['x-admin-code'] = adminCode;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Auto-clear token on 401 to avoid stuck sessions
    axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error?.response?.status === 401) {
          this.clearToken();
        }

        // Handle 429 (Too Many Requests) with exponential backoff
        if (error?.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 1;
          const delay = Math.min(parseInt(retryAfter) * 1000, 30000); // Max 30 seconds

          console.warn(`Rate limited. Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry the original request
          const config = error.config;
          if (config && !config._retry) {
            config._retry = true;
            return axios(config);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Detect backend port and update baseUrl
   */
  private async detectAndUpdatePort(): Promise<void> {
    if (this.portDetectionPromise) {
      return this.portDetectionPromise;
    }

    this.portDetectionPromise = (async () => {
      try {
        if (!window.location.hostname.includes("devtunnels")) {
          const detectedUrl = await getBackendApiUrl();
          this.baseUrl = detectedUrl;
          console.log(`✅ Detected backend API URL: ${detectedUrl}`);
        }
      } catch (error) {
        console.warn("Failed to detect backend port, using default:", error);
      }
    })();

    return this.portDetectionPromise;
  }

  private async withPortRetry<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
    try {
      return await fn(this.baseUrl);
    } catch (error: any) {
      const isNetwork = !error?.response;
      if (isNetwork) {
        await this.detectAndUpdatePort();
        return await fn(this.baseUrl);
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    return this.withPortRetry(async (base) => {
      const response = await axios.post(`${base}/auth/login`, {
        email,
        password,
      });
      const data = response.data as { token: string };
      if (data.token) this.setToken(data.token);
      return data;
    });
  }

  async telegramLogin(telegramData: any): Promise<{ token: string; user: any }> {
    return this.withPortRetry(async (base) => {
      const response = await axios.post(`${base}/auth/telegram-login`, {
        telegramData,
      });
      const data = response.data as { token: string; user: any };
      if (data.token) this.setToken(data.token);
      return data;
    });
  }

  async getTelegramConfig(): Promise<{ botUsername: string | null; configured: boolean }> {
    return this.withPortRetry(async (base) => {
      const response = await axios.get(`${base}/auth/telegram-config`);
      return response.data as { botUsername: string | null; configured: boolean };
    });
  }

  async register(userData: {
    email: string;
    password: string;
    role: "freelancer" | "client";
    firstName?: string;
    lastName?: string;
  }): Promise<{ token: string }> {
    return this.withPortRetry(async (base) => {
      const response = await axios.post(
        `${base}/auth/register`,
        userData
      );
      const data = response.data as { token: string };
      if (data.token) this.setToken(data.token);
      return data;
    });
  }

  clearUserCache(): void {
    this.requestCache.delete("getCurrentUser");
  }

  async getCurrentUser(): Promise<User> {
    const cacheKey = 'getCurrentUser';
    const now = Date.now();

    // Check if we have a cached request that's still valid
    const cached = this.requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.promise;
    }

    // Create new request and cache it
    const promise = axios.get(`${this.baseUrl}/auth/me`).then(response => {
      return (response.data as { user: User }).user;
    });

    // Cache the promise
    this.requestCache.set(cacheKey, { promise, timestamp: now });

    // Clean up cache after timeout
    setTimeout(() => {
      this.requestCache.delete(cacheKey);
    }, this.cacheTimeout);

    return promise;
  }

  async switchRole(role: "freelancer" | "client"): Promise<User> {
    const response = await axios.post(`${this.baseUrl}/auth/switch-role`, { role });
    this.clearUserCache();
    return (response.data as { user: User }).user;
  }

  async addRole(role: "freelancer" | "client"): Promise<User> {
    const response = await axios.post(`${this.baseUrl}/auth/add-role`, { role });
    this.clearUserCache();
    return (response.data as { user: User }).user;
  }

  async updateMyProfile(profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    bio?: string;
    avatar?: string;
  }): Promise<User> {
    const response = await axios.put(`${this.baseUrl}/auth/profile`, { profile });
    return (response.data as { user: User }).user;
  }

  async saveFreelancerProfile(profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    skills: string[];
    primarySkill: string;
    experienceLevel: string;
    yearsOfExperience: string;
    portfolioUrl: string;
    certifications: string[];
    availability: string;
    monthlyRate: string;
    currency: string;
    preferredJobTypes: string[];
    workLocation: string;
    linkedinUrl: string;
    githubUrl: string;
    websiteUrl: string;
    cvUrl?: string;
    avatar?: string;
  }): Promise<User> {
    const response = await axios.post(`${this.baseUrl}/auth/freelancer-profile`, { profile: profileData });
    return (response.data as { user: User }).user;
  }

  async saveFreelancerProfileDraft(draftData: any): Promise<void> {
    await axios.put(`${this.baseUrl}/auth/profile-draft`, { draft: draftData });
  }

  async getFreelancerProfileDraft(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/auth/profile-draft`);
    return response.data.draft;
  }

  logout(): void {
    this.clearUserCache();
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!(this.token || localStorage.getItem("token"));
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/refresh`);
    const data = response.data as { token: string };
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getJobs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    jobType?: string;
    workLocation?: string;
    sortBy?: string;
  }): Promise<{
    jobs: Job[];
    pagination: { current: number; pages: number; total: number };
  }> {
    // Jobs endpoint is public, don't require authentication
    const response = await axios.get(`${this.baseUrl}/jobs`, {
      params,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data as {
      jobs: Job[];
      pagination: { current: number; pages: number; total: number };
    };
  }

  async getJob(jobId: string): Promise<Job> {
    // Job details endpoint is public, don't require authentication
    const response = await axios.get(`${this.baseUrl}/jobs/${jobId}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data as Job;
  }

  async getMyJobs(): Promise<Job[]> {
    const response = await axios.get(`${this.baseUrl}/jobs/user/my-jobs`);
    return response.data as Job[];
  }

  async getJobPostingStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/jobs/posting-status`);
      return response.data;
    } catch (error: any) {
      console.error("Get job posting status error:", error);
      throw error;
    }
  }

  async createJob(jobData: {
    title: string;
    description: string;
    company?: string;
    budget: string;
    category: string;
    jobType: string;
    workLocation: string;
    deadline?: string;
    experience?: string;
    education?: string | null;
    gender?: string;
    vacancies?: number;
    skills?: string[];
    requirements?: string[];
    benefits?: string[];
    contactEmail?: string;
    contactPhone?: string;
    companyWebsite?: string;
    visibility?: string;
    jobLink?: string | null;
    address?: string | null;
    country?: string;
    city?: string | null;
    status?: string;
    applicants?: number;
    views?: number;
    jobId: string;
    coverLetter?: string;
    cvUrl?: string;
    postedBy: string;
    isActive?: boolean;
    applicationCount?: number;
  }): Promise<{ message: string; job: Job }> {
    const token = localStorage.getItem("token") || this.token;
    const response = await axios.post(`${this.baseUrl}/jobs`, jobData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data as { message: string; job: Job };
  }

  // Admin moderation
  async getPendingJobs(): Promise<{ jobs: Job[] }> {
    const response = await axios.get(`${this.baseUrl}/jobs/pending/list`);
    return response.data as { jobs: Job[] };
  }

  async approveJob(jobId: string): Promise<{ message: string; job: Job }> {
    const response = await axios.put(`${this.baseUrl}/jobs/${jobId}/approve`);
    return response.data as { message: string; job: Job };
  }

  async declineJob(jobId: string, reason?: string): Promise<{ message: string; job: Job }> {
    const response = await axios.put(`${this.baseUrl}/jobs/${jobId}/decline`, { reason });
    return response.data as { message: string; job: Job };
  }

  async updateJob(jobId: string, jobData: any): Promise<{ job: Job }> {
    const response = await axios.put(`${this.baseUrl}/jobs/${jobId}`, jobData);
    return response.data as { job: Job };
  }

  async deleteJob(jobId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/jobs/${jobId}`);
  }

  async clearAllJobs(): Promise<{ message: string; deletedCount: number }> {
    const response = await axios.delete(`${this.baseUrl}/jobs/user/clear-all`);
    return response.data as { message: string; deletedCount: number };
  }

  async getJobApplications(jobId: string): Promise<Application[]> {
    const response = await axios.get(
      `${this.baseUrl}/applications/job/${jobId}`
    );
    return response.data as Application[];
  }

  async getMyJobsApplications(): Promise<Application[]> {
    const response = await axios.get(
      `${this.baseUrl}/applications/my-jobs-applications`
    );
    return response.data as Application[];
  }

  async getMyApplications(): Promise<Application[]> {
    const response = await axios.get(`${this.baseUrl}/applications/my-applications`);
    return response.data as Application[];
  }

  async submitApplication(data: {
    jobId: string;
    coverLetter?: string;
    cvUrl?: string;
  }): Promise<Application> {
    // Application submission requires authentication
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required to submit application");
    }
    const response = await axios.post(`${this.baseUrl}/applications`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payload = response.data as {
      message: string;
      application: Application;
    };
    return payload.application;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: Application["status"],
    notes?: string
  ): Promise<void> {
    await axios.put(`${this.baseUrl}/applications/${applicationId}/status`, {
      status,
      notes,
    });
  }

  async checkApplication(jobId: string): Promise<ApplicationResponse> {
    // Check application requires authentication
    if (!this.token) {
      return { hasApplied: false };
    }
    const response = await axios.get(
      `${this.baseUrl}/applications/check/${jobId}`
    );
    const data = response.data as {
      hasApplied: boolean;
      application: Application | null;
    };
    return { hasApplied: !!data.hasApplied };
  }

  async sendNotificationEmail(data: EmailData): Promise<void> {
    await axios.post(`${this.baseUrl}/notifications/email`, data);
  }

  async uploadCV(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("cv", file);
    const response = await axios.post(`${this.baseUrl}/upload/cv`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  async uploadAvatar(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axios.post(`${this.baseUrl}/upload/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  getFileUrl(filePath: string): string {
    if (!filePath) return "";

    // Derive the backend origin from this.baseUrl (which is kept up-to-date
    // by async port detection).  Strip trailing /api if present.
    let origin: string;
    if (window.location.hostname.includes("devtunnels")) {
      origin = `https://${window.location.hostname}`;
    } else {
      origin = this.baseUrl.replace(/\/api\/?$/, "");
    }

    // If it's already an absolute URL, check if it's a phantom CDN URL
    // that doesn't actually exist (e.g. CDN_ENABLED=false but CDN_URL was set).
    // Rewrite those to use the real backend origin instead.
    if (/^https?:\/\//i.test(filePath)) {
      try {
        const parsed = new URL(filePath);
        const originUrl = new URL(origin);
        // If the host is NOT the current backend host, it might be a phantom CDN.
        // Check if the path looks like an /uploads/... path and rewrite it.
        if (parsed.host !== originUrl.host && parsed.pathname.startsWith("/uploads/")) {
          return `${origin}${parsed.pathname}`;
        }
      } catch {
        // fall through if URL parsing fails
      }
      return filePath;
    }

    if (filePath.startsWith("/")) {
      return `${origin}${filePath}`;
    }
    return `${origin}/${filePath}`;
  }

  // ✅ Updated sendPasswordResetOTP to send OTP via email
  async sendPasswordResetOTP(email: string): Promise<void> {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP temporarily in localStorage (optional)
      localStorage.setItem(`otp-${email}`, otp);

      // Send OTP to backend to email the user
      await axios.post(`${this.baseUrl}/auth/send-otp`, { email, otp });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to send OTP"
      );
    }
  }

  async verifyPasswordResetOTP(email: string, otp: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/auth/verify-otp`, { email, otp });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message
          ? error.response.data.message
          : "Invalid OTP"
      );
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message
          ? error.response.data.message
          : "Failed to reset password"
      );
    }
  }

  // Company Profile Methods
  async getCompanyProfile(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/companies/profile`);
    return response.data;
  }

  async updateCompanyProfile(profileData: any): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/companies/profile`, profileData);
    return response.data;
  }

  async submitVerificationRequest(data: { representative: string }): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/companies/verify`, data);
    return response.data;
  }

  async uploadLogo(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await axios.post(`${this.baseUrl}/upload/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  async uploadTradeLicense(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("tradeLicense", file);
    const response = await axios.post(`${this.baseUrl}/upload/trade-license`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  async uploadPortfolio(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("portfolio", file);
    const response = await axios.post(`${this.baseUrl}/upload/portfolio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  async uploadBlogImage(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("blogImage", file);
    const response = await axios.post(`${this.baseUrl}/upload/blog-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  async addJobAlternative(data: { title: string; category: string; skills: string[] }): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/companies/job-alternatives`, data);
    return response.data;
  }

  async updateJobAlternative(id: string, data: any): Promise<any> {
    const response = await axios.put(`${this.baseUrl}/companies/job-alternatives/${id}`, data);
    return response.data;
  }

  async deleteJobAlternative(id: string): Promise<any> {
    const response = await axios.delete(`${this.baseUrl}/companies/job-alternatives/${id}`);
    return response.data;
  }

  // Blog Methods
  async getBlogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{
    blogs: any[];
    pagination: { currentPage: number; totalPages: number; totalBlogs: number; hasNext: boolean; hasPrev: boolean };
  }> {
    // Blogs GET endpoint is public, don't require authentication
    const response = await axios.get(`${this.baseUrl}/blogs`, {
      params,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data as {
      blogs: any[];
      pagination: { currentPage: number; totalPages: number; totalBlogs: number; hasNext: boolean; hasPrev: boolean };
    };
  }

  async getBlog(blogId: string): Promise<any> {
    // Blog details GET endpoint is public, don't require authentication
    const response = await axios.get(`${this.baseUrl}/blogs/${blogId}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data;
  }

  async createBlog(blogData: {
    title: string;
    content: string;
    category: string;
    readTime: string;
    imageUrl?: string;
  }): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/blogs`, blogData);
    return response.data;
  }

  async updateBlog(blogId: string, blogData: {
    title?: string;
    content?: string;
    category?: string;
    readTime?: string;
    imageUrl?: string;
  }): Promise<any> {
    const response = await axios.put(`${this.baseUrl}/blogs/${blogId}`, blogData);
    return response.data;
  }

  async deleteBlog(blogId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/blogs/${blogId}`);
  }

  async likeBlog(blogId: string): Promise<{ likes: number }> {
    const response = await axios.post(`${this.baseUrl}/blogs/${blogId}/like`);
    return response.data as { likes: number };
  }

  async unlikeBlog(blogId: string): Promise<{ likes: number }> {
    const response = await axios.post(`${this.baseUrl}/blogs/${blogId}/unlike`);
    return response.data as { likes: number };
  }

  async getBlogCategories(): Promise<string[]> {
    const response = await axios.get(`${this.baseUrl}/blogs/meta/categories`);
    return response.data as string[];
  }

  async getBlogStats(): Promise<{
    totalBlogs: number;
    categories: Record<string, number>;
    totalViews: number;
    totalLikes: number;
  }> {
    const response = await axios.get(`${this.baseUrl}/blogs/meta/stats`);
    return response.data as {
      totalBlogs: number;
      categories: Record<string, number>;
      totalViews: number;
      totalLikes: number;
    };
  }

  // Messaging Methods have been removed

  // Get freelancers with created profiles
  async getFreelancers(): Promise<Array<{
    _id: string;
    email: string;
    profile?: any;
    roles: string[];
    currentRole: string;
    createdAt: string;
  }>> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await axios.get(`${this.baseUrl}/users/freelancers`, {
      params: { page: 1, limit: 100 },
    });
    const data = response.data as any;
    return (data.freelancers || []) as Array<{
      _id: string;
      email: string;
      profile?: any;
      roles: string[];
      currentRole: string;
      createdAt: string;
    }>;
  }

  // Get clients with created profiles
  async getClients(): Promise<Array<{
    _id: string;
    email: string;
    profile?: any;
    roles: string[];
    currentRole: string;
    createdAt: string;
    avatar?: string;
    companyProfile?: {
      companyName: string;
      logo: string;
      description: string;
      industry: string;
    };
  }>> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await axios.get(`${this.baseUrl}/users/clients`);
    const data = response.data as any;
    return (data.clients || []) as Array<{
      _id: string;
      email: string;
      profile?: any;
      roles: string[];
      currentRole: string;
      createdAt: string;
      avatar?: string;
      companyProfile?: {
        companyName: string;
        logo: string;
        description: string;
        industry: string;
      };
    }>;
  }

  // Get a specific user's profile by ID
  async getUserProfile(userId: string): Promise<{
    _id: string;
    email: string;
    profile?: any;
    roles: string[];
    currentRole: string;
    createdAt: string;
    companyProfile?: any;
  }> {
    if (!this.token) {
      throw new Error("Authentication required");
    }
    const response = await axios.get(`${this.baseUrl}/users/${userId}`);
    const data = response.data as any;
    return data.user as {
      _id: string;
      email: string;
      profile?: any;
      roles: string[];
      currentRole: string;
      createdAt: string;
      companyProfile?: any;
    };
  }

  /** Paginated freelancer directory (loads up to maxPages for client UI). */
  async getFreelancersWithStatus(options?: {
    search?: string;
    maxPages?: number;
  }): Promise<FreelancerWithStatus[]> {
    const maxPages = options?.maxPages ?? 10;
    const search = options?.search?.trim();
    const all: FreelancerWithStatus[] = [];
    let page = 1;
    let hasNext = true;

    try {
      while (hasNext && page <= maxPages) {
        const response = await axios.get(`${this.baseUrl}/users/freelancers`, {
          params: { page, limit: 50, ...(search ? { search } : {}) },
        });
        const data = response.data as {
          freelancers?: FreelancerWithStatus[];
          pagination?: { hasNext?: boolean };
        };
        const batch = data.freelancers || [];
        all.push(...batch);
        hasNext = Boolean(data.pagination?.hasNext);
        page += 1;
        if (batch.length === 0) break;
      }

      return all.map((freelancer) => ({
        ...freelancer,
        status: (freelancer as FreelancerWithStatus).status || ("offline" as const),
        lastActive: (freelancer as FreelancerWithStatus).lastActive,
        portfolio: freelancer.profile?.portfolioUrl
          ? { url: freelancer.profile.portfolioUrl }
          : undefined,
      }));
    } catch (error: unknown) {
      console.error("Error fetching freelancers with status:", error);
      throw error;
    }
  }

  // Get freelancer portfolio details
  async getFreelancerPortfolio(freelancerId: string): Promise<{
    url: string;
    projects?: any[];
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/freelancers/${freelancerId}`);
      const data = response.data as any;
      const freelancer = data.freelancer as any;

      return {
        url: freelancer.profile?.portfolioUrl || freelancer.profile?.portfolio || "",
        projects: [],
      };
    } catch (error: any) {
      console.error("Error fetching freelancer portfolio:", error);
      throw error;
    }
  }

  // Get conversation messages (paginated; fetches all pages up to maxPages)
  async getConversationMessages(
    conversationId: string,
    maxPages = 5
  ): Promise<any[]> {
    try {
      const messages: any[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext && page <= maxPages) {
        const response = await axios.get(
          `${this.baseUrl}/messages/conversation/${conversationId}`,
          { params: { page, limit: 100 } }
        );
        const data = response.data as { messages?: any[]; pagination?: { hasNext?: boolean } };
        if (Array.isArray(data)) {
          return data as any[];
        }
        messages.push(...(data.messages || []));
        hasNext = Boolean(data.pagination?.hasNext);
        page += 1;
        if (!data.messages?.length) break;
      }

      return messages;
    } catch (error: unknown) {
      console.error("Error fetching conversation messages:", error);
      throw error;
    }
  }

  // Edit a message
  async editMessage(messageId: string, message: string): Promise<any> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    try {
      const response = await axios.put(`${this.baseUrl}/messages/${messageId}`, { message });
      return response.data;
    } catch (error: any) {
      console.error("Error editing message:", error);
      throw error;
    }
  }

  // Send payment request to phone number via Santim Pay
  async sendPaymentRequest(phoneNumber: string, planId: string, amount: number, currency: string): Promise<any> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    try {
      const response = await axios.post(`${this.baseUrl}/pricing/send-payment-request`, {
        phoneNumber,
        planId,
        amount,
        currency,
      });
      return response.data;
    } catch (error: any) {
      console.error("Send payment request error:", error);
      throw error;
    }
  }

  // Subscribe to a pricing plan
  async subscribeToPlan(planId: string, paymentMethod: string, paymentReceipt?: string): Promise<any> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    try {
      const response = await axios.post(`${this.baseUrl}/pricing/subscribe`, {
        planId,
        paymentMethod,
        paymentReceipt,
      });
      return response.data;
    } catch (error: any) {
      console.error("Subscribe to plan error:", error);
      throw error;
    }
  }

  // Upload payment receipt
  async uploadReceipt(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append("receipt", file);
    const response = await axios.post(`${this.baseUrl}/upload/receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileUrl: string };
  }

  // Delete a freelancer
  async deleteFreelancer(freelancerId: string): Promise<{
    message: string;
    freelancer: string;
  }> {
    const token = localStorage.getItem("token") || this.token;
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await axios.delete(`${this.baseUrl}/users/freelancers/${freelancerId}`);
    return response.data as {
      message: string;
      freelancer: string;
    };
  }

  // Get public profile of user (freelancer or client) by ID or slug (public endpoint)
  async getPublicProfile(idOrSlug: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/users/public/profile/${idOrSlug}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data;
  }

  // Get programmatic SEO landing page data (public endpoint)
  async getProgrammaticSEOData(type: string, slug: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/seo/programmatic/${type}/${slug}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
    });
    return response.data;
  }
}

export default new ApiService();
