import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import apiService from "../services/api";
import { useAppSelector } from "../store/hooks";

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
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<"freelancer" | "client" | "guest">(
    "guest"
  );
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userFromApi = await apiService.getCurrentUser();
          const user: AppUser = {
            id: userFromApi._id,
            email: userFromApi.email,
            role: userFromApi.role,
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
          setUserRole(user.role as "freelancer" | "client");
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
        setLoading(false);
        return;
      }
      try {
        const jobData = (await apiService.getJob(jobId)) as JobPost;
        setJob({
          ...jobData,
          duration: jobData.duration || "Flexible",
          jobType: jobData.jobType || "Contract",
          workLocation: jobData.workLocation || "Remote",
        });
      } catch (error) {
        console.error("Error fetching job:", error);
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

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      navigate("/login?redirect=" + encodeURIComponent(location.pathname));
      return;
    }
    if (!job) {
      alert("Job information not available. Please refresh the page.");
      return;
    }
    if (userRole === "client" && job.postedBy?._id === currentUser.id) {
      alert("You cannot apply to your own job posting.");
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async () => {
    if (!currentUser || !job) {
      alert("Please ensure you are logged in and job details are available.");
      return;
    }
    setApplying(true);
    try {
      let cvUrl = "";
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
          alert("Only PDF, DOC, and DOCX files are allowed.");
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
      const payload: any = {
        jobId: job._id,
        coverLetter: coverLetter.trim(),
        cvUrl: cvUrl || undefined,
      };
      const application = await apiService.submitApplication(payload);
      setApplied(true);
      setCoverLetter("");
      setCvFile(null);
      setShowApplicationForm(false);
      alert(
        "Application submitted successfully! The employer will review your application."
      );
      navigate("/dashboard/hiring", {
        state: {
          tab: "applications",
          previewApplicationId: application._id,
          focusJobId: job._id,
        },
      });
    } catch (error: any) {
      console.error("Error applying to job:", error);
      alert(
        error.message ||
          "An error occurred while submitting your application. Please try again."
      );
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
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-black" : "bg-white"
        } flex items-center justify-center`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4 animate-pulse ${
              darkMode ? "" : "opacity-10"
            }`}
          />
          <div
            className={`absolute w-[300px] h-[300px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-15 blur-3xl rounded-full bottom-1/4 right-1/4 animate-pulse ${
              darkMode ? "" : "opacity-10"
            }`}
          />
        </div>
        <div
          className={`relative z-10 text-center shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
            darkMode
              ? "bg-black/40 border-cyan-500/20"
              : "bg-white/40 border-cyan-500/10"
          } backdrop-blur-xl border rounded-3xl p-8`}
        >
          <div
            className={`w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <Briefcase className="w-8 h-8" />
          </div>
          <p
            className={`text-xl animate-pulse font-semibold font-inter ${
              darkMode ? "text-cyan-400" : "text-cyan-600"
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
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-black" : "bg-white"
        } flex items-center justify-center`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4 animate-pulse ${
              darkMode ? "" : "opacity-10"
            }`}
          />
          <div
            className={`absolute w-[300px] h-[300px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-15 blur-3xl rounded-full bottom-1/4 right-1/4 animate-pulse ${
              darkMode ? "" : "opacity-10"
            }`}
          />
        </div>
        <div
          className={`relative z-10 text-center space-y-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
            darkMode
              ? "bg-black/40 border-cyan-500/20"
              : "bg-white/40 border-cyan-500/10"
          } backdrop-blur-xl border rounded-3xl p-8`}
        >
          <div
            className={`w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <Briefcase className="w-8 h-8" />
          </div>
          <p
            className={`text-xl font-inter ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } mb-4`}
          >
            Job not found. It may have been removed or doesn't exist.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/job-listings")}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 font-inter ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Back to Jobs
            </button>
            <button
              onClick={() => navigate("/")}
              className={`px-6 py-3 font-medium rounded-xl hover:scale-105 transition-all duration-300 font-inter border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                darkMode
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[800px] h-[800px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full top-0 left-0 animate-pulse ${
            darkMode ? "" : "opacity-5"
          }`}
        />
        <div
          className={`absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-10 blur-3xl rounded-full bottom-0 right-0 animate-pulse ${
            darkMode ? "" : "opacity-5"
          }`}
        />
        <div
          className={`absolute w-[400px] h-[400px] bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 opacity-15 blur-3xl rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse ${
            darkMode ? "" : "opacity-5"
          }`}
        />
      </div>

      <div className="relative z-10">
        <header
          className={`border-b ${
            darkMode
              ? "border-cyan-500/20 bg-black/20"
              : "border-cyan-500/10 bg-white/20"
          } backdrop-blur-xl shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
        >
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/job-listings")}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                  darkMode
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
                  className={`p-3 rounded-xl transition-all duration-300 font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                    liked
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
                  className={`p-3 rounded-xl transition-all duration-300 font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                    bookmarked
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
                  className={`p-3 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                    darkMode
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
                className={`${
                  darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1
                      className={`text-4xl font-bold mb-3 drop-shadow-lg font-inter ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    >
                      {job.title}
                    </h1>
                    {job.company && (
                      <div
                        className={`flex items-center gap-2 text-xl mb-4 font-inter ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Building
                          className={`w-6 h-6 ${
                            darkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                        {job.company}
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-2 font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
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
                    className={`bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-2xl font-bold text-lg shadow-cyan-500/25 font-inter ${
                      darkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {job.budget} ETB
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700/50"
                        : "bg-gray-100/50 border-gray-300/50"
                    } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <MapPin
                      className={`w-6 h-6 mx-auto mb-2 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Location
                    </p>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.workLocation || "Remote"}
                    </p>
                  </div>
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700/50"
                        : "bg-gray-100/50 border-gray-300/50"
                    } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Clock
                      className={`w-6 h-6 mx-auto mb-2 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Duration
                    </p>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.duration || "Flexible"}
                    </p>
                  </div>
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700/50"
                        : "bg-gray-100/50 border-gray-300/50"
                    } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Briefcase
                      className={`w-6 h-6 mx-auto mb-2 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Type
                    </p>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.jobType || "Contract"}
                    </p>
                  </div>
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700/50"
                        : "bg-gray-100/50 border-gray-300/50"
                    } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Users
                      className={`w-6 h-6 mx-auto mb-2 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Positions
                    </p>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.vacancies || 1}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`${
                  darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2
                  className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  <Target className="w-6 h-6" />
                  Job Description
                </h2>
                <div className="prose max-w-none">
                  <p
                    className={`leading-relaxed text-lg whitespace-pre-line font-inter ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {job.description}
                  </p>
                </div>
              </motion.div>

              {job.requirements && job.requirements.length > 0 && (
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/40 border-cyan-500/20"
                      : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-3 font-inter ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            darkMode ? "bg-cyan-400" : "bg-cyan-600"
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
                  className={`${
                    darkMode
                      ? "bg-black/40 border-cyan-500/20"
                      : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    <Zap className="w-6 h-6" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-4 py-2 rounded-xl font-medium font-inter border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                          darkMode
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
                  className={`${
                    darkMode
                      ? "bg-black/40 border-cyan-500/20"
                      : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2
                    className={`text-2xl font-bold mb-4 flex items-center gap-2 font-inter ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    <Award className="w-6 h-6" />
                    Benefits & Perks
                  </h2>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-3 font-inter ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            darkMode ? "text-yellow-400" : "text-yellow-600"
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
                className={`${
                  darkMode
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
                      className={`w-12 h-12 mx-auto mb-4 ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <h3
                      className={`text-xl font-bold mb-2 font-inter ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Application Sent!
                    </h3>
                    <p
                      className={`mb-4 font-inter ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      We'll be in touch soon.
                    </p>
                    <button
                      onClick={() => navigate("/job-listings")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                        darkMode
                          ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                          : "bg-gray-200/50 text-gray-600 hover:bg-gray-300/50"
                      }`}
                    >
                      Browse More Jobs
                    </button>
                  </div>
                ) : userRole === "client" &&
                  job.postedBy?._id === currentUser?.id ? (
                  <div className="text-center">
                    <Briefcase
                      className={`w-12 h-12 mx-auto mb-4 ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <h3
                      className={`text-xl font-bold mb-2 font-inter ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    >
                      Your Job Posting
                    </h3>
                    <p
                      className={`mb-4 font-inter ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      This is your own job posting.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/hiring")}
                      className={`px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Manage Applications
                    </button>
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
                      className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-4 px-6 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Apply
                    </button>
                    <p
                      className={`text-center text-sm font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sign in to submit your application
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleApply}
                      className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-4 px-6 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Apply Now
                    </button>
                    <p
                      className={`text-center text-sm font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Join thousands of successful applicants
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                className={`${
                  darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3
                  className={`text-xl font-bold mb-4 font-inter ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  Job Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Experience</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.experience || "Any Level"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Education</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.education || "Any"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Gender</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.gender || "Any"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 font-inter ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Category</span>
                    </div>
                    <span
                      className={`font-medium font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {job.category}
                    </span>
                  </div>
                </div>
              </motion.div>

              {(job.contactEmail || job.contactPhone || job.companyWebsite) && (
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/40 border-cyan-500/20"
                      : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3
                    className={`text-xl font-bold mb-4 font-inter ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {job.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail
                          className={`w-5 h-5 ${
                            darkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className={`transition-colors font-inter ${
                            darkMode
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
                          className={`w-5 h-5 ${
                            darkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                        <a
                          href={`tel:${job.contactPhone}`}
                          className={`transition-colors font-inter ${
                            darkMode
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
                          className={`w-5 h-5 ${
                            darkMode ? "text-cyan-400" : "text-cyan-600"
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
                          className={`transition-colors font-inter ${
                            darkMode
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border ${
                  darkMode
                    ? "bg-black/90 border-cyan-500/20 text-white"
                    : "bg-white/90 border-cyan-500/10 text-black"
                }`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-2xl font-bold font-inter ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    Apply for {(job as JobPost).title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className={`p-2 rounded-xl transition-all font-inter ${
                      darkMode
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
                      className={`block text-sm font-medium mb-2 font-inter ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={8}
                      maxLength={2000}
                      className={`w-full px-4 py-3 rounded-xl placeholder:font-inter focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 resize-none font-inter ${
                        darkMode
                          ? "bg-gray-900/60 text-white border border-gray-700/50 placeholder:text-gray-400"
                          : "bg-gray-100 text-gray-800 border border-gray-300/60 placeholder:text-gray-500"
                      }`}
                      placeholder="Tell us why you're perfect for this role..."
                    />
                    <p
                      className={`mt-1 text-xs font-inter ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {coverLetter.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 font-inter ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Upload CV (PDF, DOC, DOCX — max 5MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 font-inter file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium ${
                        darkMode
                          ? "bg-gray-900/60 text-white border border-gray-700/50 file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                          : "bg-gray-100 text-gray-800 border border-gray-300/60 file:bg-cyan-500/10 file:text-cyan-600 hover:file:bg-cyan-500/20"
                      }`}
                    />
                    {cvFile && (
                      <div
                        className={`mt-2 p-3 rounded-lg font-inter ${
                          darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                        }`}
                      >
                        <p
                          className={`text-sm font-inter ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Selected:</span>{" "}
                          {(cvFile as File).name}
                        </p>
                        <p
                          className={`text-xs font-inter ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Size:{" "}
                          {((cvFile as File).size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className={`px-6 py-2 font-medium rounded-xl transition-all font-inter border ${
                      darkMode
                        ? "bg-gray-800/60 text-gray-300 border-gray-700/60 hover:bg-gray-700/60"
                        : "bg-gray-100 text-gray-700 border-gray-300/60 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!job?.id) {
                        console.error("Job ID is missing");
                        return;
                      }

                      setApplying(true);

                      try {
                        let cvFileUrl: string | undefined;

                        // Upload CV first if selected
                        if (cvFile) {
                          const uploadResult = await apiService.uploadCV(
                            cvFile as File
                          );
                          cvFileUrl = uploadResult.fileUrl;
                        }

                        // Prepare application payload
                        const applicationData = {
                          jobId: job.id,
                          coverLetter: coverLetter || undefined,
                          cvUrl: cvFileUrl,
                        };

                        await apiService.submitApplication(applicationData);
                        console.log("Application submitted successfully!");

                        setShowApplicationForm(false);
                        setCoverLetter("");
                        setCvFile(null);
                        alert("Application submitted successfully!");
                      } catch (err: any) {
                        if (err.response) {
                          console.error(
                            "Backend rejected request:",
                            err.response.data
                          );
                          alert(
                            `Failed to apply: ${
                              err.response.data.message || "Bad Request"
                            }`
                          );
                        } else {
                          console.error("Network or Axios error:", err.message);
                          alert("Failed to apply: Network error");
                        }
                      } finally {
                        setApplying(false);
                      }
                    }}
                    disabled={applying}
                    className={`px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-inter ${
                      darkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {applying ? (
                      <>
                        <div
                          className={`w-4 h-4 border-2 rounded-full animate-spin ${
                            darkMode
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
    </div>
  );
};

export default JobDetailsMongo;
