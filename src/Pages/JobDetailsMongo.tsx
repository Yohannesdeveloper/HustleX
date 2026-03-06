import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Briefcase,
  Users,
  Share2,
  Heart,
  Bookmark,
  Send,
  Building,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  Star,
  Award,
  Target,
  Zap,
  X,
  UserCheck,
  Building2,
  DollarSign,
  ExternalLink,
  Layers,
  Eye,
  Lock,
} from "lucide-react";
import apiService from "../services/api";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext";
import ApplicationSuccessAnimation from "../components/ApplicationSuccessAnimation";

// Role Switcher Component
const RoleSwitcher: React.FC<{
  currentRole: string;
  onSwitchRole: (role: "freelancer" | "client") => void;
  darkMode: boolean;
}> = ({ currentRole, onSwitchRole, darkMode }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        Current Role:
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onSwitchRole("freelancer")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${currentRole === "freelancer"
            ? "bg-blue-500 text-white"
            : darkMode
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
          Freelancer
        </button>
        <button
          onClick={() => onSwitchRole("client")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${currentRole === "client"
            ? "bg-green-500 text-white"
            : darkMode
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
          Client
        </button>
      </div>
    </div>
  );
};

interface JobPost {
  _id: string;
  title: string;
  description: string;
  company?: string;
  budget: string;
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
  createdAt?: string;
  postedBy?: {
    _id: string;
    email: string;
    profile: any;
  };
  jobSite?: string;
  jobSector?: string;
  compensationType?: string;
  compensationAmount?: string;
  currency?: string;
  deadline?: string;
  address?: string;
  country?: string;
  city?: string;
  jobLink?: string;
  visibility?: string;
}

interface AppUser {
  id: string;
  email: string;
  role: string;
  profile: any;
}

interface ApplicationResponse {
  hasApplied: boolean;
}

interface UploadResponse {
  fileUrl: string;
}

const JobDetailsMongo: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { onNewApplication, offNewApplication } = useWebSocket();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<"freelancer" | "client" | "guest">(
    "guest"
  );
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userFromApi = await apiService.getCurrentUser();
          console.log('JobDetails - User profile data:', userFromApi.profile); // Debug log
          console.log('JobDetails - CV URL:', userFromApi.profile?.cvUrl); // Debug log
          const user: AppUser = {
            id: userFromApi._id,
            email: userFromApi.email,
            role: userFromApi.currentRole, // Use currentRole for backward compatibility
            profile: userFromApi.profile || {
              firstName: "",
              lastName: "",
              phone: "",
              skills: [],
              experience: "",
              education: "",
            },
          };
          setCurrentUser(user);
          setUserRoles(userFromApi.roles || []);
          setUserRole(userFromApi.currentRole as "freelancer" | "client");
        } catch (error) {
          console.error("Auth check failed:", error);
          apiService.logout();
        }
      } else {
        setUserRole("guest");
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const jobData = (await apiService.getJob(jobId)) as JobPost;
        if (!jobData) {
          setError("Job not found");
          setLoading(false);
          return;
        }
        setJob({
          ...jobData,
          duration: jobData.duration || "Flexible",
          jobType: jobData.jobType || "Contract",
          workLocation: jobData.workLocation || "Remote",
        });
        setError(null);
      } catch (error: any) {
        console.error("Error fetching job:", error);
        const errorMessage = error?.response?.data?.message ||
          error?.message ||
          "Failed to load job details. Please try again.";
        setError(errorMessage);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    const checkApplication = async () => {
      if (!currentUser || !job) return;
      try {
        const response: ApplicationResponse = await apiService.checkApplication(
          job._id
        );
        setApplied(response.hasApplied);
      } catch (error) {
        console.error("Error checking application:", error);
      }
    };
    checkApplication();
  }, [currentUser, job]);

  // Listen for real-time application submission events
  useEffect(() => {
    if (!onNewApplication || !offNewApplication) return;

    const handleApplicationSubmitted = (data: any) => {
      console.log('Application submitted event received:', data);
      if (data.application && data.application.jobId === job?._id) {
        // Immediately show the green badge
        setApplied(true);
        // Close the application form if it's open
        setShowApplicationForm(false);
        // Clear form data
        setCoverLetter("");
        setCvFile(null);
        setPortfolioLink("");
      }
    };

    onNewApplication(handleApplicationSubmitted);

    return () => {
      offNewApplication(handleApplicationSubmitted);
    };
  }, [job?._id, onNewApplication, offNewApplication]);

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      // Add protocol if missing
      let url = string.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      navigate("/signup?redirect=" + encodeURIComponent(location.pathname));
      return;
    }
    if (!job) {
      alert("Job information not available. Please refresh the page.");
      return;
    }
    if (job.postedBy?._id === currentUser.id) {
      alert("You cannot apply to your own job posting.");
      return;
    }

    // Auto-populate portfolio link and CV from freelancer profile
    if (currentUser.profile) {
      // Set portfolio link from profile (inherit from profile wizard)
      if (currentUser.profile.portfolioUrl || currentUser.profile.portfolio) {
        setPortfolioLink(currentUser.profile.portfolioUrl || currentUser.profile.portfolio);
      }

      // Note: CV from profile will be handled in the application submission
      // The user can choose to upload a new CV or use their existing one
      // CV is inherited from profile wizard via cvUrl field
    }

    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async () => {
    if (!currentUser || !job) {
      alert("Please ensure you are logged in and job details are available.");
      return;
    }

    // Validate required fields
    if (!coverLetter.trim()) {
      alert("Please provide a cover letter.");
      return;
    }

    if (!cvFile && !currentUser?.profile?.cvUrl) {
      alert("Please upload a CV or ensure you have one in your profile.");
      return;
    }

    setApplying(true);
    try {
      let cvUrl = "";

      // Handle CV upload
      if (cvFile) {
        if (cvFile.size > 5 * 1024 * 1024) {
          alert("CV file size must be less than 5MB.");
          setApplying(false);
          return;
        }
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(cvFile.type)) {
          alert("Only PDF, DOC, and DOCX files are allowed for CV.");
          setApplying(false);
          return;
        }
        try {
          const uploadResponse = (await apiService.uploadCV(
            cvFile
          )) as UploadResponse;
          cvUrl = apiService.getFileUrl(uploadResponse.fileUrl);
        } catch (uploadError: any) {
          console.error("CV upload error:", uploadError);
          alert(
            uploadError.message || "Failed to upload CV. Please try again."
          );
          setApplying(false);
          return;
        }
      }

      // Process portfolio link if provided
      let processedPortfolioUrl = "";
      if (portfolioLink.trim()) {
        if (!isValidUrl(portfolioLink.trim())) {
          alert("Please enter a valid portfolio URL (e.g., https://example.com)");
          setApplying(false);
          return;
        }
        // Add protocol if missing
        let url = portfolioLink.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        processedPortfolioUrl = url;
      }

      const payload: any = {
        jobId: job._id,
        coverLetter: coverLetter.trim(),
      };

      // Only include cvUrl if it's a valid non-empty string
      if (cvUrl && cvUrl.trim() !== "") {
        payload.cvUrl = cvUrl;
      }

      // Only include portfolioUrl if it's a valid non-empty string
      if (processedPortfolioUrl) {
        payload.portfolioUrl = processedPortfolioUrl;
      }
      const application = await apiService.submitApplication(payload);
      setApplied(true);
      setCoverLetter("");
      setCvFile(null);
      setPortfolioLink("");
      setShowApplicationForm(false);

      // Show animation instead of alert
      setShowSuccessAnimation(true);

      // Delay navigation to let animation play
      setTimeout(() => {
        navigate("/dashboard/freelancer", {
          state: {
            tab: "myApplications",
            previewApplicationId: application._id,
            focusJobId: job._id,
          },
        });
      }, 3500); // Wait for animation to finish
    } catch (error: any) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Backend rejected request:", error.response.data);
        console.error("Response status:", error.response.status);
        const errorMessage = error.response.data.errors?.[0]?.message ||
          error.response.data.message ||
          "Bad Request";
        alert(`Failed to apply: ${errorMessage}`);
      } else {
        console.error("Error applying to job:", error);
        alert(
          error.message ||
          "An error occurred while submitting your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently posted";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  if (loading) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
          } flex items-center justify-center`}
      >

        <div
          className={`relative z-10 text-center shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
            ? "bg-black/40 border-cyan-500/20"
            : "bg-white/40 border-cyan-500/10"
            } backdrop-blur-xl border rounded-3xl p-8`}
        >
          <div
            className={`w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin ${darkMode ? "text-white" : "text-black"
              }`}
          >
            <Briefcase className="w-8 h-8" />
          </div>
          <p
            className={`text-xl animate-pulse font-semibold font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
          >
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
          } flex items-center justify-center`}
      >

        <div
          className={`relative z-10 text-center space-y-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
            ? "bg-black/40 border-cyan-500/20"
            : "bg-white/40 border-cyan-500/10"
            } backdrop-blur-xl border rounded-3xl p-8`}
        >
          <div
            className={`w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? "text-white" : "text-black"
              }`}
          >
            <Briefcase className="w-8 h-8" />
          </div>
          <p
            className={`text-xl font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
              } mb-2`}
          >
            {error || "Job not found. It may have been removed or doesn't exist."}
          </p>
          {jobId && (
            <p
              className={`text-sm font-inter mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              Job ID: {jobId}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/job-listings")}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 font-inter ${darkMode ? "text-white" : "text-black"
                }`}
            >
              Back to Jobs
            </button>
            <button
              onClick={() => navigate("/")}
              className={`px-6 py-3 font-medium rounded-xl hover:scale-105 transition-all duration-300 font-inter border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                ? "bg-black/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50"
                : "bg-white/50 text-gray-600 border-gray-300/50 hover:bg-gray-200/50"
                }`}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TypeScript assertion: job is guaranteed non-null here due to early returns above
  if (!job) return null; // Extra safety check for TypeScript

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
        }`}
    >


      <div className="relative z-10">
        <header
          className={`border-b ${darkMode
            ? "border-cyan-500/20 bg-black/20"
            : "border-cyan-500/10 bg-white/20"
            } backdrop-blur-xl shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
        >
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/job-listings")}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                  ? "bg-black/40 text-cyan-400 border-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40"
                  : "bg-white/40 text-cyan-600 border-cyan-500/10 hover:text-cyan-500 hover:border-cyan-400/20"
                  }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Jobs
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiked(!liked)}
                  aria-label={liked ? "Unlike job" : "Like job"}
                  className={`p-3 rounded-xl transition-all duration-300 font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${liked
                    ? darkMode
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-red-500/10 text-red-600 border border-red-500/20"
                    : darkMode
                      ? "bg-black/40 text-gray-400 border border-gray-700/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                      : "bg-white/40 text-gray-600 border border-gray-300/50 hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/20"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark job"}
                  className={`p-3 rounded-xl transition-all duration-300 font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${bookmarked
                    ? darkMode
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                    : darkMode
                      ? "bg-black/40 text-gray-400 border border-gray-700/50 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30"
                      : "bg-white/40 text-gray-600 border border-gray-300/50 hover:bg-yellow-500/5 hover:text-yellow-600 hover:border-yellow-500/20"
                    }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  aria-label="Copy job link"
                  onClick={async () => {
                    const jobUrl = `${window.location.origin}/job-details/${job._id}`;
                    try {
                      await navigator.clipboard.writeText(jobUrl);
                      alert("Job link copied to clipboard!");
                    } catch {
                      window.prompt("Copy this job link:", jobUrl);
                    }
                  }}
                  className={`p-3 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                    ? "bg-black/40 text-gray-400 border-gray-700/50 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30"
                    : "bg-white/40 text-gray-600 border-gray-300/50 hover:bg-cyan-500/5 hover:text-cyan-600 hover:border-cyan-500/20"
                    }`}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1
                        className={`text-4xl font-bold drop-shadow-lg font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                      >
                        {job.title}
                      </h1>
                      {job.visibility && (
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${job.visibility === "public"
                            ? darkMode
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-green-500/10 text-green-700 border border-green-500/20"
                            : darkMode
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                            }`}
                        >
                          {job.visibility === "public" ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Public Job</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Private Job</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {job.company && (
                      <div
                        className={`flex items-center gap-2 text-xl mb-4 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        <Building
                          className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                        />
                        {job.company}
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {job.createdAt ? (
                        <span>Posted {formatDate(job.createdAt)}</span>
                      ) : (
                        <span>Recently posted</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-2xl font-bold text-lg shadow-cyan-500/25 font-inter ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {job.compensationAmount && job.currency
                      ? `${job.compensationAmount} ${job.currency}`
                      : job.budget || "Not specified"}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className={`${darkMode
                      ? "bg-gray-900/50 border-gray-700/50"
                      : "bg-gray-100/50 border-gray-300/50"
                      } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <MapPin
                      className={`w-6 h-6 mx-auto mb-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Location
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.workLocation || "Remote"}
                    </p>
                  </div>
                  <div
                    className={`${darkMode
                      ? "bg-gray-900/50 border-gray-700/50"
                      : "bg-gray-100/50 border-gray-300/50"
                      } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Clock
                      className={`w-6 h-6 mx-auto mb-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Duration
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.duration || "Flexible"}
                    </p>
                  </div>
                  <div
                    className={`${darkMode
                      ? "bg-gray-900/50 border-gray-700/50"
                      : "bg-gray-100/50 border-gray-300/50"
                      } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Briefcase
                      className={`w-6 h-6 mx-auto mb-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Type
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.jobType || "Contract"}
                    </p>
                  </div>
                  <div
                    className={`${darkMode
                      ? "bg-gray-900/50 border-gray-700/50"
                      : "bg-gray-100/50 border-gray-300/50"
                      } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Users
                      className={`w-6 h-6 mx-auto mb-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Positions
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.vacancies || 1}
                    </p>
                  </div>
                </div>

                {/* Additional Job Information */}
                {(job.jobSite || job.jobSector || job.deadline || job.compensationType || job.address || job.country || job.city || job.jobLink) && (
                  <div className="mt-6 space-y-4">
                    <h3
                      className={`text-xl font-bold mb-4 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    >
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.jobSite && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <Globe
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Job Site
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {job.jobSite}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.jobSector && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <Layers
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Job Sector
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {job.jobSector}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.deadline && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <Calendar
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Application Deadline
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {formatDate(job.deadline)}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.compensationType && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <DollarSign
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Compensation Type
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {job.compensationType}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.address && (
                        <div
                          className={`flex items-start gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <MapPin
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Work Address
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {job.address}
                            </p>
                          </div>
                        </div>
                      )}

                      {(job.country || job.city) && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <MapPin
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div>
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Location Details
                            </p>
                            <p
                              className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                              {[job.city, job.country].filter(Boolean).join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.jobLink && (
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                            ? "bg-gray-900/50 border-gray-700/50"
                            : "bg-gray-100/50 border-gray-300/50"
                            }`}
                        >
                          <ExternalLink
                            className={`w-5 h-5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                              }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              Job Link
                            </p>
                            <a
                              href={
                                /^https?:\/\//i.test(job.jobLink)
                                  ? job.jobLink
                                  : `https://${job.jobLink}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`font-semibold truncate block hover:underline ${darkMode
                                ? "text-cyan-400 hover:text-cyan-300"
                                : "text-cyan-600 hover:text-cyan-700"
                                }`}
                            >
                              {job.jobLink}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2
                  className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                >
                  <Target className="w-6 h-6" />
                  Job Description
                </h2>
                <div className="prose max-w-none">
                  <p
                    className={`leading-relaxed text-lg whitespace-pre-line font-inter ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    {job.description}
                  </p>
                </div>
              </motion.div>

              {job.requirements && job.requirements.length > 0 && (
                <motion.div
                  className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                    } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-3 font-inter ${darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darkMode ? "bg-cyan-400" : "bg-cyan-600"
                            }`}
                        />
                        <span className="text-lg">{req}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {job.skills && job.skills.length > 0 && (
                <motion.div
                  className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                    } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                  >
                    <Zap className="w-6 h-6" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-4 py-2 rounded-xl font-medium font-inter border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          : "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                          }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <motion.div
                  className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                    } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                  >
                    <Award className="w-6 h-6" />
                    Benefits & Perks
                  </h2>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-3 font-inter ${darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        <Star
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? "text-yellow-400" : "text-yellow-600"
                            }`}
                        />
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {applied ? (
                  <div className="text-center">
                    <CheckCircle
                      className={`w-12 h-12 mx-auto mb-4 ${darkMode ? "text-green-400" : "text-green-600"
                        }`}
                    />
                    <h3
                      className={`text-xl font-bold mb-2 font-inter ${darkMode ? "text-green-400" : "text-green-600"
                        }`}
                    >
                      Application Sent!
                    </h3>
                    <p
                      className={`mb-4 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      We'll be in touch soon.
                    </p>
                    <button
                      onClick={() => navigate("/job-listings")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                        ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                        : "bg-gray-200/50 text-gray-600 hover:bg-gray-300/50"
                        }`}
                    >
                      Browse More Jobs
                    </button>
                  </div>
                ) : job.postedBy?._id === currentUser?.id ? (
                  <div className="text-center space-y-4">
                    <Briefcase
                      className={`w-12 h-12 mx-auto mb-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <h3
                      className={`text-xl font-bold mb-2 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    >
                      {userRole === "client" ? "Your Job Posting" : "Cannot Apply to Your Own Job"}
                    </h3>
                    <p
                      className={`mb-4 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      {userRole === "client"
                        ? "This is your own job posting."
                        : "You cannot apply to your own job posting. Switch to client mode to manage this job."
                      }
                    </p>
                    <div className="space-y-3">
                      {userRole === "client" ? (
                        <>
                          <button
                            onClick={() => navigate("/dashboard/hiring")}
                            className={`w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode ? "text-white" : "text-black"
                              }`}
                          >
                            Manage Applications
                          </button>
                          <button
                            onClick={() => navigate(`/edit-job/${job._id}`)}
                            className={`w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-white`}
                          >
                            Edit Job
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate("/job-listings")}
                          className={`w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode ? "text-white" : "text-black"
                            }`}
                        >
                          Browse Other Jobs
                        </button>
                      )}
                    </div>
                  </div>
                ) : userRole === "guest" ? (
                  <div className="space-y-4">
                    <button
                      onClick={() =>
                        navigate(
                          "/login?redirect=" +
                          encodeURIComponent(location.pathname)
                        )
                      }
                      className={`w-full bg-gradient-to-r from-green-500 to-green-600 font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-green-500/25 hover:shadow-green-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-white`}
                    >
                      Sign In to Apply
                    </button>
                    <p
                      className={`text-center text-sm font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Create an account or sign in to submit your application
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleApply}
                      className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-4 px-6 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      Apply Now
                    </button>
                    <p
                      className={`text-center text-sm font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Join thousands of successful applicants
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3
                  className={`text-xl font-bold mb-4 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                >
                  Job Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Experience</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.experience || "Any Level"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Education</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.education || "Any"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Gender</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.gender || "Any"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Category</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {job.category}
                    </span>
                  </div>
                  {job.jobSite && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Job Site</span>
                      </div>
                      <span
                        className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {job.jobSite}
                      </span>
                    </div>
                  )}
                  {job.jobSector && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Job Sector</span>
                      </div>
                      <span
                        className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {job.jobSector}
                      </span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Deadline</span>
                      </div>
                      <span
                        className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {formatDate(job.deadline)}
                      </span>
                    </div>
                  )}
                  {job.compensationType && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Compensation</span>
                      </div>
                      <span
                        className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {job.compensationType}
                        {job.compensationAmount && job.currency
                          ? ` (${job.compensationAmount} ${job.currency})`
                          : ""}
                      </span>
                    </div>
                  )}
                  {job.visibility && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {job.visibility === "public" ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span>Visibility</span>
                      </div>
                      <span
                        className={`font-medium font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {job.visibility === "public" ? "Public Job" : "Private Job"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {(job.contactEmail || job.contactPhone || job.companyWebsite) && (
                <motion.div
                  className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                    } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3
                    className={`text-xl font-bold mb-4 font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {job.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail
                          className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                        />
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className={`transition-colors font-inter ${darkMode
                            ? "text-gray-300 hover:text-cyan-400"
                            : "text-gray-600 hover:text-cyan-600"
                            }`}
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                    {job.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone
                          className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                        />
                        <a
                          href={`tel:${job.contactPhone}`}
                          className={`transition-colors font-inter ${darkMode
                            ? "text-gray-300 hover:text-cyan-400"
                            : "text-gray-600 hover:text-cyan-600"
                            }`}
                        >
                          {job.contactPhone}
                        </a>
                      </div>
                    )}
                    {job.companyWebsite && (
                      <div className="flex items-center gap-3">
                        <Globe
                          className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                        />
                        <a
                          href={
                            /^https?:\/\//i.test(job.companyWebsite)
                              ? job.companyWebsite
                              : `https://${job.companyWebsite}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-colors font-inter ${darkMode
                            ? "text-gray-300 hover:text-cyan-400"
                            : "text-gray-600 hover:text-cyan-600"
                            }`}
                        >
                          Company Website
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Application Modal */}
          {showApplicationForm && job && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border my-8 ${darkMode
                  ? "bg-black/90 border-cyan-500/20 text-white"
                  : "bg-white/90 border-cyan-500/10 text-black"
                  }`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-2xl font-bold font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                  >
                    Apply for {(job as JobPost).title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className={`p-2 rounded-xl transition-all font-inter ${darkMode
                      ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                      : "bg-black/10 text-black hover:bg-red-500/20 hover:text-red-600"
                      }`}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={8}
                      maxLength={2000}
                      className={`w-full px-4 py-3 rounded-xl placeholder:font-inter focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 resize-none font-inter ${darkMode
                        ? "bg-gray-900/60 text-white border border-gray-700/50 placeholder:text-gray-400"
                        : "bg-gray-100 text-gray-800 border border-gray-300/60 placeholder:text-gray-500"
                        }`}
                      placeholder="Tell us why you're perfect for this role..."
                    />
                    <p
                      className={`mt-1 text-xs font-inter ${darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                      {coverLetter.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      Upload CV (PDF, DOC, DOCX — max 5MB) <span className="text-red-500">*</span>
                      {currentUser?.profile?.cvUrl && !cvFile && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                          }`}>
                          ✓ From Profile
                        </span>
                      )}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 font-inter file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium ${darkMode
                        ? "bg-gray-900/60 text-white border border-gray-700/50 file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                        : "bg-gray-100 text-gray-800 border border-gray-300/60 file:bg-cyan-500/10 file:text-cyan-600 hover:file:bg-cyan-500/20"
                        }`}
                    />
                    {cvFile && (
                      <div
                        className={`mt-2 p-3 rounded-lg font-inter ${darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                          }`}
                      >
                        <p
                          className={`text-sm font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                        >
                          <span className="font-medium">Selected:</span>{" "}
                          {(cvFile as File).name}
                        </p>
                        <p
                          className={`text-xs font-inter ${darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                        >
                          Size:{" "}
                          {((cvFile as File).size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    {currentUser?.profile?.cvUrl && !cvFile && (
                      <div
                        className={`mt-2 p-3 rounded-lg font-inter border ${darkMode ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-green-500/20" : "bg-green-100"
                              }`}>
                              📄
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-green-400" : "text-green-700"
                                }`}>
                                CV from Profile
                              </p>
                              <p className={`text-xs ${darkMode ? "text-green-300" : "text-green-600"
                                }`}>
                                Your existing CV will be used for this application
                              </p>
                            </div>
                          </div>
                          <a
                            href={apiService.getFileUrl(currentUser.profile.cvUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs px-3 py-1 rounded ${darkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"
                              }`}
                          >
                            View CV
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                      Portfolio Link (Optional)
                      {portfolioLink && currentUser?.profile && (
                        currentUser.profile.portfolioUrl === portfolioLink ||
                        currentUser.profile.portfolio === portfolioLink
                      ) && (
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                            }`}>
                            ✓ From Profile
                          </span>
                        )}
                    </label>
                    <input
                      type="url"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://your-portfolio.com or https://github.com/yourusername"
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 font-inter ${darkMode
                        ? "bg-gray-900/60 text-white border border-gray-700/50 placeholder:text-gray-400"
                        : "bg-gray-100 text-gray-800 border border-gray-300/60 placeholder:text-gray-500"
                        }`}
                    />
                    <p
                      className={`mt-1 text-xs font-inter ${darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                      Share your portfolio, GitHub, Behance, or any relevant work samples
                    </p>
                    {portfolioLink && currentUser?.profile && (
                      (currentUser.profile.portfolioUrl === portfolioLink ||
                        currentUser.profile.portfolio === portfolioLink) && (
                        <div
                          className={`mt-2 p-3 rounded-lg font-inter border ${darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-blue-500/20" : "bg-blue-100"
                              }`}>
                              🔗
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-700"
                                }`}>
                                Portfolio from Profile
                              </p>
                              <p className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-600"
                                }`}>
                                Your portfolio link from profile wizard will be used
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className={`px-6 py-2 font-medium rounded-xl transition-all font-inter border ${darkMode
                      ? "bg-gray-800/60 text-gray-300 border-gray-700/60 hover:bg-gray-700/60"
                      : "bg-gray-100 text-gray-700 border-gray-300/60 hover:bg-gray-200"
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={applying}
                    className={`px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-inter ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {applying ? (
                      <>
                        <div
                          className={`w-4 h-4 border-2 rounded-full animate-spin ${darkMode
                            ? "border-white/30 border-t-white"
                            : "border-black/30 border-t-black"
                            }`}
                        />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
      <ApplicationSuccessAnimation
        isVisible={showSuccessAnimation}
        darkMode={darkMode}
        onComplete={() => setShowSuccessAnimation(false)}
      />
      <Footer />
    </div>
  );
};

export default JobDetailsMongo;
