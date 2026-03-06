// src/types.ts

// Standard user object
export interface User {
  _id: string; // MongoDB ID
  email: string;
  roles: string[]; // Array of roles
  currentRole: string; // Current active role
  role: string; // For backward compatibility
  hasCompanyProfile?: boolean; // For client profile completion check
  profile?: {
    // Basic Information
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;

    // Skills & Expertise
    skills?: string[];
    primarySkill?: string;
    experienceLevel?: string;

    // Experience & Portfolio
    yearsOfExperience?: string;
    portfolioUrl?: string;
    certifications?: string[];
    cvUrl?: string;
    workExperience?: string;

    // Availability & Rates
    availability?: string;
    monthlyRate?: string;
    currency?: string;
    preferredJobTypes?: string[];
    workLocation?: string;

    // Social Links
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;

    // Legacy fields for backward compatibility
    linkedin?: string;
    github?: string;
    portfolio?: string;
    experience?: string;
    education?: string;
    avatar?: string;

    // Profile completion tracking
    isProfileComplete?: boolean;
    profileCompletedAt?: string;
  };
  id?: string; // Optional alias for frontend convenience
}

// Freelancer with status information
export interface FreelancerWithStatus extends User {
  status?: "online" | "offline" | "available" | "busy";
  lastActive?: string;
  isActive?: boolean;
  portfolio?: {
    url: string;
    projects?: PortfolioProject[];
  };
}

// Portfolio project information
export interface PortfolioProject {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  technologies?: string[];
}

// Job entity
export interface Job {
  _id: string;
  title: string;
  company?: string;
  description: string;
  budget: string | number;
  duration?: string;
  category: string;
  jobType?: string;
  workLocation?: string;
  experience?: string;
  education?: string;
  gender?: string;
  vacancies?: number;
  skills?: string[];
  requirements?: string[];
  benefits?: string[];
  contactEmail?: string;
  contactPhone?: string;
  companyWebsite?: string;
  deadline?: string;
  visibility?: string;
  jobLink?: string;
  address?: string;
  country?: string;
  city?: string;
  approved?: boolean;
  status?: string;
  applicants?: number;
  views?: number;
  postedBy: string | User;
  isActive?: boolean;
  applicationCount?: number;
  createdAt?: string;
  updatedAt?: string;
  jobSite?: string;
  jobSector?: string;
  compensationType?: string;
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
  visibility?: string;
  compensationAmount?: string;
  currency?: string;

  website?: string;
  jobId: string;
  jobSite?: string;
  jobSector?: string;
  compensationType?: string;
}

// Response for checking if user has applied
export type ApplicationResponse = {
  hasApplied: boolean;
};

// Updated to match apiService.uploadCV
export type UploadResponse = {
  fileUrl: string;
};
