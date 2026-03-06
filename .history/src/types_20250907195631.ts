// src/types.ts

// Standard user object
export interface User {
  _id: string; // MongoDB ID
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
  id?: string; // Optional alias for frontend convenience
}

// Job entity
export interface Job {
  _id: string;
  title: string;
  company?: string;
  description: string;
  budget: string | number;
  category: string;
  jobType: string;
  workLocation: string;
  postedBy: string | User;
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
}

// Application entity
export interface Application {
  _id: string;
  job: string;
  jobId: string;
  userId: string;
  jobTitle: string;
  company?: string;
  applicant: User;
  applicantEmail: string;
  coverLetter: string;
  cvUrl: string;
  portfolioUrl?: string;
  appliedAt: string;
  status: "pending" | "in_review" | "hired" | "rejected";
  notes?: string;
}

// Email payload
export interface EmailData {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  message?: string;
}

// Optional JobType entity
export interface JobType {
  id: string;
  
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline?: string;
  duration?: string;
  createdAt?: { seconds: number };
  userId: string;
  jobType?: string;
  workLocation?: string;
  experience?: string;
  education?: string;
  gender?: string;
  company?: string;
  vacancies?: number;
  address?: string;
  city?: string;
  country?: string;
  skills?: string[];
  jobLink?: string | null;

  website?: string;
  jobId: string;
}

// Response for checking if user has applied
export type ApplicationResponse = {
  hasApplied: boolean;
};

// Updated to match apiService.uploadCV
export type UploadResponse = {
  fileUrl: string;
};
