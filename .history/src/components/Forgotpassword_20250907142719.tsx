import axios from "axios";
import {
  User,
  Job,
  Application,
  EmailData,
  ApplicationResponse,
} from "../types";

class ApiService {
  private baseUrl = "http://localhost:5000/api";
  private token: string | null = null;

  constructor() {
    this.token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (this.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    }
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/login`, {
      email,
      password,
    });
    const data = response.data as { token: string };
    if (data.token) this.setToken(data.token);
    return data;
  }

  async register(userData: {
    email: string;
    password: string;
    role: "freelancer" | "client";
    firstName?: string;
    lastName?: string;
  }): Promise<{ token: string }> {
    const response = await axios.post(
      `${this.baseUrl}/auth/register`,
      userData
    );
    const data = response.data as { token: string };
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${this.baseUrl}/auth/me`);
    return (response.data as { user: User }).user;
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/refresh`);
    const data = response.data as { token: string };
    if (data.token) this.setToken(data.token);
    return data;
  }

  // ==========================
  // Forgot Password Methods
  // ==========================
  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/forgot-password`, {
      email,
    });
    return response.data as { message: string };
  }

  async verifyPasswordResetOTP(
    email: string,
    otp: string
  ): Promise<{ verified: boolean }> {
    const response = await axios.post(`${this.baseUrl}/auth/verify-otp`, {
      email,
      otp,
    });
    return response.data as { verified: boolean };
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/reset-password`, {
      email,
      otp,
      newPassword,
    });
    return response.data as { message: string };
  }

  // ==========================
  // Job & Application Methods
  // ==========================
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
    const response = await axios.get(`${this.baseUrl}/jobs`, { params });
    return response.data as {
      jobs: Job[];
      pagination: { current: number; pages: number; total: number };
    };
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await axios.get(`${this.baseUrl}/jobs/${jobId}`);
    return response.data as Job;
  }

  async getMyJobs(): Promise<Job[]> {
    const response = await axios.get(`${this.baseUrl}/jobs/user/my-jobs`);
    return response.data as Job[];
  }

  async createJob(jobData: any): Promise<{ message: string; job: Job }> {
    const response = await axios.post(`${this.baseUrl}/jobs`, jobData);
    return response.data as { message: string; job: Job };
  }

  async deleteJob(jobId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/jobs/${jobId}`);
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

  async submitApplication(data: {
    jobId: string;
    coverLetter?: string;
    cvUrl?: string;
  }): Promise<Application> {
    const response = await axios.post(`${this.baseUrl}/applications`, data);
    return (response.data as { message: string; application: Application })
      .application;
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

  getFileUrl(filePath: string): string {
    if (!filePath) return "";
    if (/^https?:\/\//i.test(filePath)) return filePath;
    const apiOrigin = this.baseUrl.replace(/\/api\/?$/, "");
    if (filePath.startsWith("/")) return `${apiOrigin}${filePath}`;
    return `${apiOrigin}/${filePath}`;
  }
}

export default new ApiService();
