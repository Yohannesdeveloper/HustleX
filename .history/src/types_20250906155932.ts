// src/types.ts

export interface User {
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

export interface Job {
  _id: string;
  title: string;
  company?: string;
  description: string;
  budget: string | number;
  category: string;
  jobType: string;
  workLocation: string;
  postedBy: string | User; // matches your APIService
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
}

export interface Application {
  _id: string;
  job: string;
  jobId: string;
  userId: string;
  // add other fields if needed
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

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  message?: string;
}

// Optional: keep your existing JobType
export interface JobType {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
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
  jobLink?: string;
  website?: string;
  jobId: string;
}
export type ApplicationResponse = {
  hasApplied: boolean;
};

export type UploadResponse = {
  url: string;
  name: string;
};
