import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Building,
  Users,
  DollarSign,
  CheckCircle,
  Star,
  Award,
  Target,
  Zap,
  ArrowLeft,
  Edit,
  Eye,
  Globe,
  Layers,
  Lock,
} from "lucide-react";

interface JobData {
  _id: string;
  title: string;
  description: string;
  company?: string;
  budget: string;
  category: string;
  jobType: string;
  workLocation: string;
  deadline?: string;
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
  address?: string;
  country?: string;
  city?: string;
  jobLink?: string;
  jobSite?: string;
  jobSector?: string;
  compensationType?: string;
  visibility?: string;
  currency?: string;
}

const PreviewJob: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  // Get job data from location state
  const jobData = location.state?.jobData as JobData;

  if (!jobData) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-black" : "bg-white"} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"} mb-4`}>
            No Job Data Found
          </h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
            Please go back and try posting a job again.
          </p>
          <button
            onClick={() => navigate("/post-job")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all"
          >
            Post a Job
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleNext = () => {
    navigate("/job-listings", {
      state: {
        message: "Job posted successfully!",
        newJobId: jobData._id,
      },
    });
  };

  const handleEdit = () => {
    navigate(`/edit-job/${jobData._id}`, {
      state: { jobData }
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[800px] h-[800px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full top-0 left-0  ${darkMode ? "" : "opacity-5"
            }`}
        />
        <div
          className={`absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-10 blur-3xl rounded-full bottom-0 right-0  ${darkMode ? "" : "opacity-5"
            }`}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className={`border-b ${darkMode
            ? "border-cyan-500/20 bg-black/20"
            : "border-cyan-500/10 bg-white/20"
            } backdrop-blur-xl shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
        >
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/post-job")}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
                  ? "bg-black/40 text-cyan-400 border-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40"
                  : "bg-white/40 text-cyan-600 border-cyan-500/10 hover:text-cyan-500 hover:border-cyan-400/20"
                  }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Post Job
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm font-inter flex items-center gap-2`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header */}
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
                    <h1
                      className={`text-4xl font-bold mb-3 drop-shadow-lg font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    >
                      {jobData.title}
                    </h1>
                    {jobData.company && (
                      <div
                        className={`flex items-center gap-2 text-xl mb-4 font-inter ${darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        <Building
                          className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                        />
                        {jobData.company}
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatDate(jobData.createdAt || new Date().toISOString())}</span>
                    </div>
                  </div>
                  <div
                    className={`bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-2xl font-bold text-lg shadow-cyan-500/25 font-inter ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {jobData.budget} ETB
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      {jobData.workLocation || "Remote"}
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
                      Type
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {jobData.jobType || "Contract"}
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
                      {jobData.vacancies || 1}
                    </p>
                  </div>
                  <div
                    className={`${darkMode
                      ? "bg-gray-900/50 border-gray-700/50"
                      : "bg-gray-100/50 border-gray-300/50"
                      } border rounded-xl p-4 text-center font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                  >
                    <Calendar
                      className={`w-6 h-6 mx-auto mb-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Deadline
                    </p>
                    <p
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {formatDate(jobData.deadline || "")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Job Description */}
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
                    {jobData.description}
                  </p>
                </div>
              </motion.div>

              {/* Skills */}
              {jobData.skills && jobData.skills.length > 0 && (
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
                    <Zap className="w-6 h-6" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {jobData.skills.map((skill, index) => (
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Overview */}
              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
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
                      {jobData.experience || "Any Level"}
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
                      {jobData.education || "Any"}
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
                      {jobData.gender || "Any"}
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
                      {jobData.category}
                    </span>
                  </div>
                  {jobData.jobSite && (
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
                        {jobData.jobSite}
                      </span>
                    </div>
                  )}
                  {jobData.jobSector && (
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
                        {jobData.jobSector}
                      </span>
                    </div>
                  )}
                  {jobData.compensationType && (
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
                        {jobData.compensationType}
                      </span>
                    </div>
                  )}
                  {jobData.visibility && (
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 font-inter ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {jobData.visibility === "public" ? (
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
                        {jobData.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl border rounded-3xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="space-y-4">
                  <button
                    onClick={handleNext}
                    className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-4 px-6 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    <Eye className="inline w-5 h-5 mr-2" />
                    View in Job Listings
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-blue-500/25 hover:shadow-blue-400/40 hover:scale-105 text-lg font-inter shadow-[0_4px_6px_rgba(0,0,0,0.3)] text-white`}
                  >
                    <Edit className="inline w-5 h-5 mr-2" />
                    Edit Job Details
                  </button>
                </div>
                <p
                  className={`text-center text-sm font-inter mt-4 ${darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  Your job has been successfully submitted and is waiting approval!
                </p>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreviewJob;
