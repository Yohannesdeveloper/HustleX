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
    this.token = localStorage.getItem("token");
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
    jobId: string; // must be a valid ID
    coverLetter?: string;
    cvUrl?: string;
    postedBy: string;
    isActive?: boolean;
    applicationCount?: number;
  }): Promise<{ message: string; job: Job }> {
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
    // Derive API origin by removing trailing '/api'
    const apiOrigin = this.baseUrl.replace(/\/api\/?$/, "");
    if (filePath.startsWith("/")) {
      return `${apiOrigin}${filePath}`;
    }
    return `${apiOrigin}/${filePath}`;
  }
}

export default new ApiService();
