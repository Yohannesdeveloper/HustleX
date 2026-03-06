import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";
import {
  Briefcase,
  Users,
  BarChart3,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";

// Animation for individual letters in headings
const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

// Animation for the entire heading
const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const FreelancingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "myApplications" | "myJobs" | "analytics" | "profile"
  >("overview");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalJobs: 0,
    totalApplications: 0,
    hiredCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    inReviewCount: 0,
    avgDaysToHire: 0,
    responseTime: 0,
    jobViews: 0,
    successRate: 0,
    categoryPerformance: [] as Array<{
      category: string;
      applications: number;
      conversion: string;
    }>,
    monthlyTrends: [] as Array<{
      month: string;
      applications: number;
      hired: number;
    }>,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "myApplications" as const, label: "My Applications", icon: Users },
    { id: "myJobs" as const, label: "My Jobs", icon: Briefcase },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  useEffect(() => {
    const state = location.state as any;
    if (
      state?.tab &&
      ["overview", "myApplications", "myJobs", "analytics"].includes(state.tab)
    ) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  // Fetch analytics data when analytics tab is selected
  useEffect(() => {
    if (activeTab === "analytics" && user) {
      fetchAnalyticsData();
    }
  }, [activeTab, user]);

  // Fetch jobs data when jobs tab is selected
  useEffect(() => {
    if (activeTab === "myJobs" && user) {
      fetchJobs();
    }
  }, [activeTab, user]);

  // Fetch applications data when applications tab is selected
  useEffect(() => {
    if (activeTab === "myApplications" && user) {
      fetchApplications();
    }
  }, [activeTab, user]);

  // Fetch profile data when profile tab is selected
  useEffect(() => {
    if (activeTab === "profile" && user) {
      fetchProfile();
    }
  }, [activeTab, user]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const { jobs } = await apiService.getJobs();
      setJobs(jobs);
    } catch (error) {
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    setApplicationsLoading(true);
    try {
      const apps = await apiService.getMyApplications();
      setApplications(apps);
    } catch (error) {
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const userData = await apiService.getCurrentUser();
      setProfile(userData.profile || null);
    } catch (error) {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch jobs and applications
      const { jobs } = await apiService.getJobs();
      const apps = await apiService.getMyApplications();
      // ...analytics calculations similar to hiring dashboard...
      setAnalyticsData((prev) => ({
        ...prev,
        totalJobs: jobs.length,
        totalApplications: apps.length,
      }));
    } catch (error) {
      setAnalyticsData((prev) => ({
        ...prev,
        totalJobs: 0,
        totalApplications: 0,
      }));
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ...UI rendering logic similar to HiringDashboard, with tab navigation and content...
  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Navigation Tabs */}
      <motion.div
        className={`${
          darkMode
            ? "bg-black/50 border-white/10"
            : "bg-white/80 border-black/10"
        } border-b sticky top-0 z-10 backdrop-blur-sm shadow-2xl`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium transition-all duration-300 font-inter tracking-tight text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? darkMode
                      ? "border-blue-500 text-white"
                      : "border-blue-600 text-gray-900"
                    : darkMode
                    ? "border-transparent text-gray-300 hover:text-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    activeTab === tab.id
                      ? darkMode
                        ? "text-white"
                        : "text-gray-900"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4 font-inter tracking-tight leading-tight">
              Welcome, {user?.profile?.firstName || user?.email || "Freelancer"}
              !
            </h1>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-lg mb-8`}
            >
              Your freelance journey starts here. Track your applications, jobs,
              and performance all in one place.
            </p>
            {/* Analytics Cards */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 flex-1">
              </div>
              <div className="flex flex-col gap-4 md:ml-8 min-w-[220px]">
                <button
                  onClick={() => navigate('/job-listings')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                >
                  🔍 Find Jobs
                </button>
                <button
                  onClick={() => navigate('/profile-setup')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  📝 Create Portfolio
                </button>
              </div>
            </div>
              <div
                className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                  darkMode
                    ? "bg-black/50 border-white/10"
                    : "bg-white border-black/10"
                } border`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-semibold">Applications</span>
                </div>
                <div className="text-3xl font-bold">
                  {analyticsData.totalApplications}
                </div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
              <div
                className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                  darkMode
                    ? "bg-black/50 border-white/10"
                    : "bg-white border-black/10"
                } border`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-semibold">Jobs</span>
                </div>
                <div className="text-3xl font-bold">
                  {analyticsData.totalJobs}
                </div>
                <div className="text-sm text-gray-500">Jobs Available</div>
              </div>
              <div
                className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                  darkMode
                    ? "bg-black/50 border-white/10"
                    : "bg-white border-black/10"
                } border`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                  <span className="text-lg font-semibold">Hired</span>
                </div>
                <div className="text-3xl font-bold">
                  {analyticsData.hiredCount}
                </div>
                <div className="text-sm text-gray-500">Jobs Won</div>
              </div>
              <div
                className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                  darkMode
                    ? "bg-black/50 border-white/10"
                    : "bg-white border-black/10"
                } border`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Success Rate</span>
                </div>
                <div className="text-3xl font-bold">
                  {analyticsData.successRate}%
                </div>
                <div className="text-sm text-gray-500">
                  Application to hire rate
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "myApplications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">My Applications</h2>
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">
                  Loading your applications...
                </span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No applications yet. Start applying to jobs!
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, idx) => (
                    <motion.div
                      key={app._id || idx}
                      className={`border rounded-lg p-4 shadow-md ${
                        darkMode
                          ? "bg-gray-800/50 border-white/10"
                          : "bg-gray-50 border-black/10"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * idx }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold">
                              {app.job?.title || "Job Title"}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === "hired"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {app.status || "pending"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              📂 {app.job?.category || "General"}
                            </span>
                            <span className="text-gray-500">
                              🕒 {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-2 text-gray-600 line-clamp-2">
                            {app.job?.description?.slice(0, 120) ||
                              "No description."}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                              onClick={() => alert('Withdraw application (demo)')}
                            >
                              Withdraw
                            </button>
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                              onClick={() => app.job?._id && navigate(`/job-details/${app.job._id}`)}
                            >
                              View Job
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "myJobs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found. Explore and apply to jobs!
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                    <motion.div
                      key={job._id || idx}
                      className={`border rounded-lg p-4 shadow-md ${
                        darkMode
                          ? "bg-gray-800/50 border-white/10"
                          : "bg-gray-50 border-black/10"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * idx }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold">{job.title}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : job.status === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status || "active"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              📂 {job.category || "General"}
                            </span>
                            <span className="text-gray-500">
                              🕒 {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-2 text-gray-600 line-clamp-2">
                            {job.description?.slice(0, 120) || "No description."}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                              onClick={() => navigate(`/job-details/${job._id}`)}
                            >
                              View Details
                            </button>
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                              onClick={() => alert('Save job (demo)')}
                            >
                              Save Job
                            </button>
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                              onClick={() => alert('Share job (demo)')}
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            {analyticsLoading ? (
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500">Loading analytics...</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow hover:scale-105 transition-all duration-200"
                      onClick={() => alert('Download analytics (demo)')}
                    >
                      ⬇️ Download Analytics
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border`}
                >
                  <h4 className="text-base font-semibold mb-3">
                    Response Time
                  </h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">
                      {analyticsData.responseTime}h
                    </p>
                    <p className="text-sm text-gray-500">
                      Average response time
                    </p>
                  </div>
                </div>
                <div
                  className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border`}
                >
                  <h4 className="text-base font-semibold mb-3">Success Rate</h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">
                      {analyticsData.successRate}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Application to hire rate
                    </p>
                  </div>
                </div>
                <div
                  className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border`}
                >
                  <h4 className="text-base font-semibold mb-3">Jobs Applied</h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">
                      {analyticsData.totalApplications}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total applications submitted
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            {profileLoading ? (
              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500">Loading profile...</span>
                </div>
              ) : !profile ? (
                <div className="text-center py-8 text-gray-500">
                  No profile data found.
                </div>
              ) : (
                <div
                  className={`rounded-xl p-6 shadow-2xl backdrop-blur-sm ${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border max-w-xl mx-auto`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow hover:scale-105 transition-all duration-200"
                      onClick={() => navigate('/profile-setup')}
                    >
                      Edit Profile
                    </button>
                  </div>
                  <p className="text-gray-500 mb-2">{user?.email}</p>
                  <p className="mb-2">{profile.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.skills?.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Location: {profile.location}
                  </div>
                  <div className="text-sm text-gray-500">
                    Experience: {profile.experienceLevel} ({profile.yearsOfExperience} years)
                  </div>
                </div>
              )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FreelancingDashboard;
