import axios from "axios";

interface User {
  _id: string;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    education?: string;
  };
}

interface Job {
  _id: string;
  title: string;
  company?: string;
  description: string;
  budget: string;
  category: string;
  jobType: string;
  workLocation: string;
  postedBy: string | User;
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
}

interface Application {
  _id: string;
  job: string;
  jobTitle: string;
  company?: string;
  applicant: User;
  applicantEmail: string;
  coverLetter: string;
  cvUrl: string;
  appliedAt: string;
  status: "pending" | "in_review" | "hired" | "rejected";
  notes?: string;
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  message?: string;
}

class ApiService {
  private baseUrl = "http://localhost:5000/api";
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
    if (this.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    }
  }

  // Login
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await axios.post(`${this.baseUrl}/auth/login`, {
      email,
      password,
    });
    const data = response.data as { token: string };
    if (data.token) this.setToken(data.token);
    return data;
  }

  // Register
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

  // Get current user
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

  // Jobs
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
    postedBy: string;
    isActive?: boolean;
    applicationCount?: number;
  }): Promise<{ message: string; job: Job }> {
    const response = await axios.post(`${this.baseUrl}/jobs`, jobData);
    return response.data as { message: string; job: Job };
  }

  // NEW: Delete a job
  async deleteJob(jobId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/jobs/${jobId}`);
  }

  // Applications
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
    coverLetter: string;
    resumeLink: string;
  }): Promise<Application> {
    const response = await axios.post(`${this.baseUrl}/applications`, data);
    return response.data as Application;
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

  async checkApplication(jobId: string): Promise<Application | null> {
    const response = await axios.get(
      `${this.baseUrl}/applications/check/${jobId}`
    );
    return response.data as Application | null;
  }

  // Notifications
  async sendNotificationEmail(data: EmailData): Promise<void> {
    await axios.post(`${this.baseUrl}/notifications/email`, data);
  }

  // File uploads
  async uploadCV(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("cv", file);
    const response = await axios.post(`${this.baseUrl}/upload/cv`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (response.data as { fileUrl: string }).fileUrl;
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/files/${filePath}`;
  }
}

export default new ApiService();
