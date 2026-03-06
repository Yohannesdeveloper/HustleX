import React, { useEffect, useState, useMemo, useCallback } from "react";
import apiService from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext";
// import Messaging from "../components/Messaging";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Mail,
  Calendar,
  FileText,
  User,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Globe,
} from "lucide-react";
import MessageModal from "../components/MessageModal";

interface Application {
  _id: string;
  job: string;
  jobTitle: string;
  company?: string;
  applicant: {
    _id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      skills?: string[];
      experience?: string;
      education?: string;
    };
  };
  applicantEmail: string;
  coverLetter: string;
  cvUrl: string;
  portfolioUrl?: string;
  appliedAt: string;
  status: "pending" | "in_review" | "hired" | "rejected";
  notes?: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized Application Card Component
const ApplicationCard = React.memo(
  ({
    application,
    darkMode,
    expandedApplication,
    setExpandedApplication,
    handleStatusUpdate,
    handleDownloadCV,
    handleOpenPortfolio,
    updating,
    notificationStatus,
    onMessageFreelancer,
  }: {
    application: Application;
    darkMode: boolean;
    expandedApplication: string | null;
    setExpandedApplication: (id: string | null) => void;
    handleStatusUpdate: (
      id: string,
      status: Application["status"],
      notes?: string
    ) => void;
    handleDownloadCV: (cvUrl: string, applicantName: string) => void;
    handleOpenPortfolio: (portfolioUrl: string) => void;
    updating: { [key: string]: boolean };
    notificationStatus: {
      [key: string]: { success: boolean; message: string } | null;
    };
    onMessageFreelancer: (receiverId: string, defaultMessage?: string) => void;
  }) => {
    const formatDate = useCallback((dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }, []);

    const getStatusColor = useCallback((status: string) => {
      switch (status) {
        case "pending":
          return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-400/20";
        case "in_review":
          return "bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-400/20";
        case "hired":
          return "bg-gradient-to-r from-green-400 to-green-600 text-white border-green-400/20";
        case "rejected":
          return "bg-gradient-to-r from-red-400 to-red-600 text-white border-red-400/20";
        default:
          return "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-400/20";
      }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
      switch (status) {
        case "pending":
          return Clock;
        case "in_review":
          return Eye;
        case "hired":
          return CheckCircle;
        case "rejected":
          return XCircle;
        default:
          return Clock;
      }
    }, []);

    const isExpanded = expandedApplication === application._id;
    const StatusIcon = getStatusIcon(application.status);

    const [messageText, setMessageText] = React.useState("Hello, thanks for applying. While this role wasn't a fit, I'd like to keep in touch.");

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${darkMode ? "bg-black/50 border-white/10" : "bg-white border-black/10"
          } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
        whileHover={{
          scale: 1.02,
          boxShadow: darkMode
            ? "0 25px 50px rgba(255, 255, 255, 0.1)"
            : "0 25px 50px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h3
                className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${darkMode
                  ? "from-blue-300 to-blue-500"
                  : "from-blue-400 to-blue-600"
                  } bg-clip-text text-transparent font-inter tracking-tight`}
              >
                {application.jobTitle}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                  application.status
                )} shadow-md`}
              >
                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{application.status.replace("_", " ").toUpperCase()}</span>
                <span className="sm:hidden">{application.status.split('_')[0]}</span>
              </span>
            </div>

            {application.status === "rejected" && (
              <div className={`mt-2 p-3 rounded-lg border ${darkMode ? "bg-black/30 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? "bg-black/50 border-white/10 text-white placeholder-gray-400" : "bg-white border-gray-300 text-black placeholder-gray-500"}`}
                    placeholder="Write a quick message to the freelancer"
                  />
                  <motion.button
                    onClick={() => onMessageFreelancer(application.applicant._id, messageText)}
                    className={`px-4 py-2 rounded-lg font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Message freelancer
                  </motion.button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                />
                <span
                  className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  Applicant:
                </span>
                <span className={`${darkMode ? "text-white" : "text-black"}`}>
                  {application.applicant.profile?.firstName ?? ""}{" "}
                  {application.applicant.profile?.lastName ?? ""} (
                  {application.applicantEmail})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                />
                <span
                  className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  Applied:
                </span>
                <span className={`${darkMode ? "text-white" : "text-black"}`}>
                  {formatDate(application.appliedAt)}
                </span>
              </div>
            </div>

            {application.coverLetter && (
              <div className="mb-4">
                <p
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                    } mb-2`}
                >
                  <strong>Cover Letter:</strong>
                </p>
                <p
                  className={`line-clamp-2 ${darkMode ? "text-white/80" : "text-black/70"
                    }`}
                >
                  {application.coverLetter}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <motion.button
                onClick={() =>
                  setExpandedApplication(isExpanded ? null : application._id)
                }
                className={`flex items-center gap-2 ${darkMode
                  ? "text-white hover:text-gray-300"
                  : "text-black hover:text-gray-600"
                  } transition-colors text-sm sm:text-base`}
                whileHover={{ scale: 1.05 }}
              >
                <MessageSquare
                  className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"
                    }`}
                />
                <span className="hidden sm:inline">{isExpanded ? "Hide Details" : "View Details"}</span>
                <span className="sm:hidden">{isExpanded ? "Hide" : "View"}</span>
                {isExpanded ? (
                  <ChevronUp
                    className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"
                      }`}
                  />
                ) : (
                  <ChevronDown
                    className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"
                      }`}
                  />
                )}
              </motion.button>

              {application.cvUrl && (
                <motion.button
                  onClick={() =>
                    handleDownloadCV(
                      application.cvUrl,
                      `${application.applicant.profile?.firstName ?? ""}_${application.applicant.profile?.lastName ?? ""
                      }`
                    )
                  }
                  className={`flex items-center gap-2 ${darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                    } transition-colors text-sm sm:text-base`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Download
                    className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                  />
                  <span className="hidden sm:inline">Download CV</span>
                  <span className="sm:hidden">CV</span>
                </motion.button>
              )}

              {application.portfolioUrl && (
                <motion.button
                  onClick={() => handleOpenPortfolio(application.portfolioUrl!)}
                  className={`flex items-center gap-2 ${darkMode
                    ? "text-green-400 hover:text-green-300"
                    : "text-green-600 hover:text-green-700"
                    } transition-colors text-sm sm:text-base`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Globe
                    className={`w-4 h-4 ${darkMode ? "text-green-400" : "text-green-600"
                      }`}
                  />
                  <span className="hidden sm:inline">View Portfolio</span>
                  <span className="sm:hidden">Portfolio</span>
                </motion.button>
              )}

              {/* Message Button */}
              <motion.button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onMessageFreelancer(application.applicant._id);
                }}
                className={`flex items-center gap-2 ${darkMode
                  ? "text-pink-400 hover:text-pink-300"
                  : "text-pink-600 hover:text-pink-700"
                  } transition-colors text-sm sm:text-base`}
                whileHover={{ scale: 1.05 }}
              >
                <Mail className={`w-4 h-4 ${darkMode ? "text-pink-400" : "text-pink-600"}`} />
                <span className="hidden sm:inline">Message</span>
                <span className="sm:hidden">Msg</span>
              </motion.button>
            </div>

            {notificationStatus[application._id] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-lg ${notificationStatus[application._id]?.success
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
                  }`}
              >
                {notificationStatus[application._id]?.message}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:ml-4 mt-4 lg:mt-0">
            {application.status === "pending" && (
              <>
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleStatusUpdate(application._id, "in_review");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "In Review"}
                </motion.button>
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleStatusUpdate(application._id, "hired");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:bg-green-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "Hire"}
                </motion.button>
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleStatusUpdate(application._id, "rejected");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "Reject"}
                </motion.button>
              </>
            )}

            {application.status === "in_review" && (
              <>
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    console.log(`Hire button clicked for application ${application._id}`);
                    handleStatusUpdate(application._id, "hired");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:bg-green-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "Hire"}
                </motion.button>
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    console.log(`Reject button clicked for application ${application._id}`);
                    handleStatusUpdate(application._id, "rejected");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "Reject"}
                </motion.button>
              </>
            )}

            {(application.status === "hired" ||
              application.status === "rejected") && (
                <motion.button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleStatusUpdate(application._id, "pending");
                  }}
                  disabled={updating[application._id]}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updating[application._id] ? "Updating..." : "Reset to Pending"}
                </motion.button>
              )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-700/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4
                    className={`font-semibold bg-gradient-to-r ${darkMode
                      ? "from-blue-300 to-blue-500"
                      : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-3 font-inter tracking-tight`}
                  >
                    Applicant Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail
                        className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-gray-400"
                          }`}
                      />
                      <span
                        className={`${darkMode ? "text-white" : "text-black"}`}
                      >
                        {application.applicantEmail}
                      </span>
                    </div>
                    {application.applicant.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-400"
                            }`}
                        >
                          Phone:
                        </span>
                        <span
                          className={`${darkMode ? "text-white" : "text-black"
                            }`}
                        >
                          {application.applicant.profile.phone}
                        </span>
                      </div>
                    )}
                    {application.applicant.profile?.experience && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-400"
                            }`}
                        >
                          Experience:
                        </span>
                        <span
                          className={`${darkMode ? "text-white" : "text-black"
                            }`}
                        >
                          {application.applicant.profile.experience}
                        </span>
                      </div>
                    )}
                    {application.applicant.profile?.education && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-400"
                            }`}
                        >
                          Education:
                        </span>
                        <span
                          className={`${darkMode ? "text-white" : "text-black"
                            }`}
                        >
                          {application.applicant.profile.education}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4
                    className={`font-semibold bg-gradient-to-r ${darkMode
                      ? "from-blue-300 to-blue-500"
                      : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-3 font-inter tracking-tight`}
                  >
                    Skills
                  </h4>
                  {application.applicant.profile &&
                    application.applicant.profile.skills &&
                    application.applicant.profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {application.applicant.profile.skills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 text-xs rounded-full font-semibold ${darkMode
                              ? "bg-black/50 text-white border-white/10"
                              : "bg-gray-100 text-black border-black/10"
                              } shadow-md`}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-500"
                        } text-sm`}
                    >
                      No skills listed
                    </p>
                  )}
                </div>
              </div>

              {application.coverLetter && (
                <div className="mt-6">
                  <h4
                    className={`font-semibold bg-gradient-to-r ${darkMode
                      ? "from-blue-300 to-blue-500"
                      : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-3 font-inter tracking-tight`}
                  >
                    Cover Letter
                  </h4>
                  <div
                    className={`${darkMode
                      ? "bg-black/30 border-white/10"
                      : "bg-gray-50 border-gray-200"
                      } border rounded-lg p-4 shadow-md`}
                  >
                    <p
                      className={`whitespace-pre-wrap ${darkMode ? "text-white/80" : "text-black/70"
                        }`}
                    >
                      {application.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {application.notes && (
                <div className="mt-6">
                  <h4
                    className={`font-semibold bg-gradient-to-r ${darkMode
                      ? "from-blue-300 to-blue-500"
                      : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-3 font-inter tracking-tight`}
                  >
                    Notes
                  </h4>
                  <div
                    className={`${darkMode
                      ? "bg-yellow-900/30 border-yellow-200/20"
                      : "bg-yellow-50 border-yellow-200"
                      } border rounded-lg p-4 shadow-md`}
                  >
                    <p
                      className={`${darkMode ? "text-white/80" : "text-black/70"
                        }`}
                    >
                      {application.notes}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

ApplicationCard.displayName = "ApplicationCard";

const ApplicationsManagementMongo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { onNewApplication, offNewApplication } = useWebSocket();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "in_review" | "hired" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [expandedApplication, setExpandedApplication] = useState<string | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [notificationStatus, setNotificationStatus] = useState<{
    [key: string]: { success: boolean; message: string } | null;
  }>({});
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingReceiverId, setMessagingReceiverId] = useState<string | undefined>(undefined);
  const [messagingInitialMessage, setMessagingInitialMessage] = useState<string | undefined>(undefined);

  const handleMessageFreelancer = useCallback((receiverId: string, defaultMessage?: string) => {
    setMessagingReceiverId(receiverId);
    setMessagingInitialMessage(defaultMessage || "");
    setShowMessaging(true);
  }, []);
  
  // Memoized freelancer object for the messaging modal
  const messagingFreelancer = useMemo(() => {
    if (!messagingReceiverId) return undefined;
    const app = applications.find((a) => a.applicant._id === messagingReceiverId);
    if (!app) return undefined;
    // Map applicant to FreelancerWithStatus shape
    return {
      _id: app.applicant._id,
      email: app.applicant.email,
      profile: app.applicant.profile || {},
    } as any;
  }, [messagingReceiverId, applications]);

  const tabs = [
    { id: "all", label: "All Applications", count: 0, icon: Users },
    { id: "pending", label: "Pending", count: 0, icon: Clock },
    { id: "in_review", label: "In Review", count: 0, icon: Eye },
    { id: "hired", label: "Hired", count: 0, icon: CheckCircle },
    { id: "rejected", label: "Rejected", count: 0, icon: XCircle },
  ];

  // Optimized data fetching - single API call instead of N+1 queries
  const fetchApplications = useCallback(async () => {
    // If user is not authenticated, ensure loading stops and optionally navigate to login
    if (!apiService.isAuthenticated()) {
      console.warn("Not authenticated: skipping applications fetch and stopping loading state.");
      setLoading(false);
      return;
    }

    let mounted = true;
    try {
      setLoading(true);
      const allApplications = await apiService.getMyJobsApplications();
      if (!mounted) return;
      setApplications(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setNotificationStatus((prev) => ({
        ...prev,
        global: {
          success: false,
          message: "Failed to load applications. Please try again.",
        },
      }));
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Listen for real-time new application events
  useEffect(() => {
    const handleNewApplication = (data: any) => {
      console.log('New application received:', data);
      if (data.application) {
        // Add the new application to the state
        setApplications(prev => [data.application, ...prev]);

        // Show a notification
        setNotificationStatus(prev => ({
          ...prev,
          global: {
            success: true,
            message: `New application received for "${data.application.jobTitle}" from ${data.application.applicantEmail}!`,
          },
        }));

        // Clear the notification after 5 seconds
        setTimeout(() => {
          setNotificationStatus(prev => {
            const newState = { ...prev };
            delete newState.global;
            return newState;
          });
        }, 5000);
      }
    };

    onNewApplication(handleNewApplication);

    return () => {
      offNewApplication(handleNewApplication);
    };
  }, [onNewApplication, offNewApplication]);

  // Auto-expand newly submitted application and optionally focus job
  useEffect(() => {
    const state = location.state as any;
    if (!applications.length || !state) return;
    const { previewApplicationId, focusJobId } = state;
    if (previewApplicationId) {
      setExpandedApplication(previewApplicationId);
      const app = applications.find((a) => a._id === previewApplicationId);
      if (app) {
        setSelectedJob(app.jobTitle);
      }
    } else if (focusJobId) {
      const appForJob = applications.find((a) => a.job === focusJobId);
      if (appForJob) {
        setSelectedJob(appForJob.jobTitle);
      }
    }
    // We do not clear navigation state here to preserve back navigation
  }, [applications, location.state]);

  // Memoized filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab = activeTab === "all" || app.status === activeTab;
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.coverLetter || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = selectedJob === "all" || app.jobTitle === selectedJob;
      return matchesTab && matchesSearch && matchesJob;
    });
  }, [applications, activeTab, searchTerm, selectedJob]);

  // Memoized tab counts
  const tabCounts = useMemo(() => {
    return tabs.map((tab) => {
      if (tab.id === "all") return applications.length;
      return applications.filter((app) => app.status === tab.id).length;
    });
  }, [applications]);

  // Memoized unique job titles for filter
  const uniqueJobTitles = useMemo(() => {
    return Array.from(new Set(applications.map((app) => app.jobTitle)));
  }, [applications]);

  // Close messaging modal and clear state
  const handleCloseMessaging = useCallback(() => {
    setShowMessaging(false);
    setMessagingReceiverId(undefined);
    setMessagingInitialMessage(undefined);
  }, []);

  const handleStatusUpdate = useCallback(
    async (
      applicationId: string,
      newStatus: Application["status"],
      notes?: string
    ) => {
      // Prevent multiple simultaneous updates for the same application
      if (updating[applicationId]) {
        console.log(`Application ${applicationId} is already being updated, skipping`);
        return;
      }

      console.log(`Starting update for application ${applicationId} -> ${newStatus}`);
+
+      // Immediate UI feedback
+      setNotificationStatus((prev) => ({ ...prev, [applicationId]: { success: true, message: 'Processing...' } }));
 
       try {
         // Set updating state
         setUpdating(prev => ({ ...prev, [applicationId]: true }));

         // Clear any existing notification for this application
         setNotificationStatus((prev) => ({ ...prev, [applicationId]: null }));

         // Update application status
         await apiService.updateApplicationStatus(
           applicationId,
           newStatus,
           notes
         );

         const application = applications.find(
           (app) => app._id === applicationId
         );
         if (!application) throw new Error("Application not found");

         // Define status messages using application.company
         const statusMessages: Record<Application["status"], string> = {
           pending: "Your application is pending.",
           in_review: `Your application at ${application.company || "the company"
             } is currently under review. We will notify you once a decision has been made regarding your candidacy.`,
           hired: `We are pleased to inform you that your application at ${application.company || "the company"
             } has been successful, and you have been selected for the position.`,
           rejected: `We regret to inform you that your application at ${application.company || "the company"
             } was not successful at this time. We appreciate your interest and encourage you to apply for future opportunities.`,
         };

         // Send Email Notification
         let emailSuccess = true;
         let emailErrorMessage = "";
         try {
           await apiService.sendNotificationEmail({
             to: application.applicantEmail,
             subject: `Application Status Update for ${application.jobTitle}`,
             body: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <h1 style="color: #1a73e8;">Application Status Update</h1>
               <p style="font-size: 16px; color: #111;">
                 Dear ${application.applicant.profile?.firstName || "Applicant"},
               </p>
               <p style="font-size: 16px; color: #333;">
                 Your application for <strong>${application.jobTitle
               }</strong> at
                 <strong>${application.company || "the company"
               }</strong> has been updated to:
                 <strong style="color: ${newStatus === "hired"
                 ? "#2ecc71"
                 : newStatus === "rejected"
                   ? "#e74c3c"
                   : newStatus === "in_review"
                     ? "#3498db"
                     : "#f1c40f"
               }">${statusMessages[newStatus]}</strong>.
               </p>
               <p style="font-size: 16px; color: #333;">
                 Thank you for applying!
               </p>
               <hr style="border-top: 1px solid #eee; margin: 20px 0;">
               <p style="font-size: 14px; color: #666;">
                 If you have any questions, contact us at HustleX@gmail.com.
               </p>
             </div>
           `,
             isHtml: true,
           });
         } catch (emailError: any) {
           console.error("Email notification failed:", emailError);
           emailSuccess = false;
           emailErrorMessage =
             emailError.message === "Route not found"
               ? "Email notification service is unavailable."
               : "Failed to send notification email.";
         }

         // Send SMS Notification
         let smsSuccess = true;
         let smsErrorMessage = "";
         if (application.applicant.profile?.phone) {
           try {
             await apiService.sendNotificationEmail({
               to: application.applicant.email,
               subject: "Application Status Update",
               body: `Hello ${application.applicant.profile?.firstName || ""
                 }, your application status is now ${newStatus}.`,
             });
           } catch (smsError: any) {
             console.error("SMS notification failed:", smsError);
             smsSuccess = false;
             smsErrorMessage = "Failed to send SMS notification.";
           }
         } else {
           smsSuccess = false;
           smsErrorMessage = "";
         }

         // Update notification status based on email and SMS outcomes
         const combinedSuccess = emailSuccess && smsSuccess;
         const statusActionMessages = {
           hired: "Application marked as HIRED successfully!",
           rejected: "Application marked as REJECTED successfully!",
           in_review: "Application marked as IN REVIEW successfully!",
           pending: "Application marked as PENDING successfully!"
         };

         const combinedMessage = combinedSuccess
           ? `${statusActionMessages[newStatus]} Email and SMS notifications sent successfully!`
           : `${statusActionMessages[newStatus]} ${emailErrorMessage
             ? emailErrorMessage + " "
             : smsErrorMessage
               ? smsErrorMessage
               : ""
             }`.trim();

         setNotificationStatus((prev) => ({
           ...prev,
           [applicationId]: {
             success: true, // Always show as success for status updates
             message: combinedMessage,
           },
         }));

         // Update application state
         setApplications((prev) =>
           prev.map((app) =>
             app._id === applicationId
               ? { ...app, status: newStatus, notes }
               : app
           )
         );
       } catch (error: any) {
         console.error("Error updating application status:", error);
         const serverMsg = error?.response?.data?.message || error?.message || "Failed to update status. Please try again.";
         setNotificationStatus((prev) => ({
           ...prev,
           [applicationId]: {
             success: false,
             message: serverMsg,
           },
         }));
       } finally {
         // Always clear the updating state for this application
         setUpdating(prev => {
           const newState = { ...prev };
           delete newState[applicationId];
           return newState;
         });

         // Clear notification after timeout
         setTimeout(() => {
           setNotificationStatus((prev) => {
             const newState = { ...prev };
             delete newState[applicationId];
             return newState;
           });
         }, 7000); // Increased timeout to 7 seconds for better visibility
       }
     },
     [applications, updating]
   );

  const handleDownloadCV = useCallback(
    (cvUrl: string, applicantName: string) => {
      if (!cvUrl) {
        alert("No CV available for download.");
        return;
      }
      const link = document.createElement("a");
      link.href = apiService.getFileUrl(cvUrl);
      link.download = `${applicantName}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const handleOpenPortfolio = useCallback(
    (portfolioUrl: string) => {
      console.log("Opening portfolio URL:", portfolioUrl);

      if (!portfolioUrl || portfolioUrl.trim() === "") {
        console.error("No portfolio URL provided or empty");
        alert("No portfolio link available.");
        return;
      }

      try {
        // Ensure the URL has a protocol
        let url = portfolioUrl.trim();
        console.log("Original URL:", url);

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
          console.log("Added https protocol:", url);
        }

        // Validate URL before opening
        const validatedUrl = new URL(url);
        console.log("Validated URL:", validatedUrl.href);

        // Try to open in new tab first
        const newWindow = window.open(validatedUrl.href, '_blank', 'noopener,noreferrer');

        // If popup is blocked, try alternative methods
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Method 1: Create a temporary link and click it
          const link = document.createElement('a');
          link.href = validatedUrl.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Invalid portfolio URL:", portfolioUrl, "Error:", error);
        alert(`Invalid portfolio URL: ${portfolioUrl}. Please check the link format.`);
      }
    },
    []
  );

  if (loading) {
    return (
      <ErrorBoundary>
        <div
          className={`min-h-screen ${darkMode ? "bg-black" : "bg-white"
            } flex items-center justify-center`}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={`w-16 h-16 border-4 ${darkMode
                ? "border-white border-t-transparent"
                : "border-black border-t-transparent"
                } rounded-full animate-spin mx-auto mb-4`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <p className={`text-lg ${darkMode ? "text-white" : "text-black"}`}>
              Loading applications...
            </p>
          </motion.div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${darkMode
                ? "from-blue-300 to-blue-500"
                : "from-blue-400 to-blue-600"
                } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
            >
              Applications Management
            </h1>
            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-600"
                } text-base sm:text-lg`}
            >
              Manage and review job applications from freelancers
            </p>
          </motion.div>

          {notificationStatus.global && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-lg ${notificationStatus.global.success
                ? "bg-green-500/20 text-green-500"
                : "bg-red-500/20 text-red-500"
                }`}
            >
              {notificationStatus.global.message}
            </motion.div>
          )}

          <motion.div
            className={`${darkMode
              ? "bg-black/50 border-white/10"
              : "bg-white/80 border-black/10"
              } border rounded-2xl p-6 mb-8 shadow-2xl backdrop-blur-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by job title, email, or cover letter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border ${darkMode
                      ? "border-gray-700 bg-black/30 text-white"
                      : "border-gray-300 bg-white text-black"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border ${darkMode
                  ? "border-gray-700 text-white hover:bg-white/10"
                  : "border-gray-300 text-black hover:bg-gray-50"
                  } rounded-xl transition-all duration-300 shadow-md`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter
                  className={`w-5 h-5 ${darkMode ? "text-white" : "text-black"
                    }`}
                />
                Filters
                {showFilters ? (
                  <ChevronUp
                    className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"
                      }`}
                  />
                ) : (
                  <ChevronDown
                    className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"
                      }`}
                  />
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-700/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-2`}
                      >
                        Filter by Job
                      </label>
                      <select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className={`w-full px-3 py-2 border ${darkMode
                          ? "border-gray-700 bg-black/30 text-white"
                          : "border-gray-300 bg-white text-black"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-300`}
                      >
                        <option value="all">All Jobs</option>
                        {uniqueJobTitles.map((jobTitle) => (
                          <option key={jobTitle} value={jobTitle}>
                            {jobTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const count = tabCounts[index];
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-md font-inter tracking-tight text-sm sm:text-base ${activeTab === tab.id
                    ? darkMode
                      ? "bg-white/10 text-white border-blue-500"
                      : "bg-black text-white border-blue-600"
                    : darkMode
                      ? "bg-black/50 text-gray-300 hover:bg-white/10 border-white/10"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-black/10"
                    }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id
                      ? "text-white"
                      : darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                      }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span
                    className={`${activeTab === tab.id ? "bg-white/20" : "bg-gray-500/20"
                      } text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredApplications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Users
                    className={`w-16 h-16 ${darkMode ? "text-gray-300" : "text-gray-400"
                      } mx-auto mb-4`}
                  />
                  <h3
                    className={`text-xl font-semibold bg-gradient-to-r ${darkMode
                      ? "from-blue-300 to-blue-500"
                      : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-2 font-inter tracking-tight`}
                  >
                    No applications found
                  </h3>
                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                  >
                    {searchTerm || selectedJob !== "all"
                      ? "Try adjusting your search or filters"
                      : "Applications will appear here when freelancers apply to your jobs"}
                  </p>
                </motion.div>
              ) : (
                filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application._id}
                    application={application}
                    darkMode={darkMode}
                    expandedApplication={expandedApplication}
                    setExpandedApplication={setExpandedApplication}
                    handleStatusUpdate={handleStatusUpdate}
                    handleDownloadCV={handleDownloadCV}
                    handleOpenPortfolio={handleOpenPortfolio}
                    updating={updating}
                    notificationStatus={notificationStatus}
                    onMessageFreelancer={handleMessageFreelancer}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
          {showMessaging && messagingFreelancer && (
            <MessageModal
              freelancer={messagingFreelancer}
              initialMessage={messagingInitialMessage}
              onClose={handleCloseMessaging}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ApplicationsManagementMongo;
