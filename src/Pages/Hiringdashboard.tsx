import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks"; // Import to access theme state
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import {
  Plus,
  Users,
  Briefcase,
  BarChart3,
  User,
  MessageSquare,
  Search,
  CheckCircle,
  Zap,
  Sparkles,
  Eye,
  Calendar,
  Star,
  Clock,
  Award,
  TrendingUp,
  Activity,
} from "lucide-react";
import ApplicationsManagementMongo from "./ApplicationsManagementMongo";
import FloatingDarkModeToggle from "../components/FloatingDarkModeToggle";
import FindFreelancersTab from "../components/FindFreelancersTab";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const HiringDashboard: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode); // Access dark mode state
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "applications"
    | "jobs"
    | "freelancers"
    | "profile"
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
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingJobs, setClearingJobs] = useState(false);

  // Profile state
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);



  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "applications" as const, label: "Applications", icon: Users },
    { id: "jobs" as const, label: "My Jobs", icon: Briefcase },
    { id: "freelancers" as const, label: "Find Freelancers", icon: Search },
    { id: "messages" as const, label: "Messages", icon: MessageSquare, navigate: "/chat" },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  React.useEffect(() => {
    const state = location.state as any;
    if (
      state?.tab &&
      ["overview", "applications", "jobs", "freelancers", "profile"].includes(state.tab)
    ) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  // Fetch analytics data once when user is available (for potential overview metrics)
  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  // Fetch jobs data when jobs tab is selected
  useEffect(() => {
    if (activeTab === "jobs" && user) {
      fetchUserJobs();
    }
  }, [activeTab, user]);

  // Fetch profile data when profile tab is selected or on initial load
  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
    }
  }, [user]);

  // Redirect to company profile when profile tab is selected
  useEffect(() => {
    if (activeTab === "profile") {
      navigate("/company-profile");
    }
  }, [activeTab, navigate]);



  const fetchUserJobs = async () => {
    if (!user) return;

    setJobsLoading(true);
    try {
      const jobs = await apiService.getMyJobs();
      setUserJobs(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      setUserJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleClearAllJobs = async () => {
    if (!user) return;

    setClearingJobs(true);
    try {
      const result = await apiService.clearAllJobs();
      console.log("Jobs cleared:", result);
      // Refresh the jobs list
      await fetchUserJobs();
      // Refresh analytics data
      await fetchAnalyticsData();
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error clearing jobs:", error);
    } finally {
      setClearingJobs(false);
    }
  };

  const fetchCompanyProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    try {
      const profile = await apiService.getCompanyProfile();
      setCompanyProfile(profile);

      // Set company logo for tab display
      if (profile.logo) {
        if (profile.logo.startsWith('http') || profile.logo.startsWith('data:')) {
          setCompanyLogo(profile.logo);
        } else {
          setCompanyLogo(apiService.getFileUrl(profile.logo));
        }
      } else {
        setCompanyLogo(null);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      // If no existing company profile exists, inherit from user profile (signup data)
      if (user?.profile) {
        // Generate company name from user's name if available
        const companyNameFromUser = user.profile.firstName && user.profile.lastName
          ? `${user.profile.firstName} ${user.profile.lastName} Company`
          : user.profile.firstName
          ? `${user.profile.firstName} Company`
          : '';

        const inheritedProfile = {
          companyName: companyNameFromUser,
          industry: '',
          companySize: '',
          website: user.profile.websiteUrl || user.profile.website || '',
          location: user.profile.location || '',
          description: user.profile.bio || '',
          contactEmail: user.email || '',
          contactPhone: user.profile.phone || '',
          foundedYear: '',
          logo: null,
          tradeLicense: null,
          verificationStatus: 'pending'
        };

        setCompanyProfile(inheritedProfile);
        setCompanyLogo(null);
      } else {
        setCompanyProfile(null);
        setCompanyLogo(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };



  const handleDeleteJob = async (jobId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiService.deleteJob(jobId);
      // Refresh the jobs list
      await fetchUserJobs();
      // Refresh analytics data
      await fetchAnalyticsData();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setAnalyticsLoading(true);
    try {
      // Fetch user's jobs
      const userJobs = await apiService.getMyJobs();

      // Fetch applications for user's jobs
      const applicationsPromises = userJobs.map((job: any) =>
        apiService.getJobApplications(job._id)
      );
      const applicationsResponses = await Promise.all(applicationsPromises);
      const allApplications = applicationsResponses.flatMap(
        (response: any) => response || []
      );

      // Calculate analytics
      const totalJobs = userJobs.length;
      const totalApplications = allApplications.length;

      // Count applications by status
      const statusCounts = allApplications.reduce((acc, app) => {
        const status = app.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hiredCount = statusCounts.hired || 0;
      const pendingCount = statusCounts.pending || 0;
      const rejectedCount = statusCounts.rejected || 0;
      const inReviewCount = statusCounts.in_review || 0;

      // Calculate success rate
      const successRate =
        totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;

      // Calculate average days to hire
      const hiredApplications = allApplications.filter(
        (app) => app.status === "hired" && app.updatedAt
      );
      const avgDaysToHire =
        hiredApplications.length > 0
          ? hiredApplications.reduce((sum, app) => {
              const hireDate = new Date(app.updatedAt);
              const postDate = new Date(app.job?.createdAt || app.createdAt);
              const days = Math.ceil(
                (hireDate.getTime() - postDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / hiredApplications.length
          : 0;

      // Calculate category performance
      const categoryStats = userJobs.reduce((acc, job) => {
        const category = job.category || "Other";
        if (!acc[category]) {
          acc[category] = { jobs: 0, applications: 0, hired: 0 };
        }
        acc[category].jobs += 1;
        return acc;
      }, {} as Record<string, { jobs: number; applications: number; hired: number }>);

      // Add application counts to categories
      allApplications.forEach((app) => {
        const category = app.job?.category || "Other";
        if (categoryStats[category]) {
          categoryStats[category].applications += 1;
          if (app.status === "hired") {
            categoryStats[category].hired += 1;
          }
        }
      });

      const categoryPerformance = Object.entries(categoryStats)
        .map(([category, stats]) => ({
          category,
          applications: stats.applications,
          conversion:
            stats.applications > 0
              ? `${((stats.hired / stats.applications) * 100).toFixed(1)}%`
              : "0%",
        }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 5);

      // Calculate monthly trends (last 6 months)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString("en-US", {
          month: "short",
        });

        const monthApplications = allApplications.filter((app) => {
          const appDate = new Date(app.createdAt);
          return (
            appDate.getMonth() === monthDate.getMonth() &&
            appDate.getFullYear() === monthDate.getFullYear()
          );
        });

        const monthHired = monthApplications.filter(
          (app) => app.status === "hired"
        );

        monthlyTrends.push({
          month: monthName,
          applications: monthApplications.length,
          hired: monthHired.length,
        });
      }

      // Calculate response time (average time to respond to applications)
      const respondedApplications = allApplications.filter(
        (app) => app.updatedAt && app.createdAt
      );
      const responseTime =
        respondedApplications.length > 0
          ? respondedApplications.reduce((sum, app) => {
              const responseDate = new Date(app.updatedAt);
              const submitDate = new Date(app.createdAt);
              const hours =
                (responseDate.getTime() - submitDate.getTime()) /
                (1000 * 60 * 60);
              return sum + hours;
            }, 0) / respondedApplications.length
          : 0;

      // Calculate total job views
      const jobViews = userJobs.reduce(
        (sum, job) => sum + ((job as any).views || 0),
        0
      );

      setAnalyticsData({
        totalJobs,
        totalApplications,
        hiredCount,
        pendingCount,
        rejectedCount,
        inReviewCount,
        avgDaysToHire: Math.round(avgDaysToHire * 10) / 10,
        responseTime: Math.round(responseTime * 10) / 10,
        jobViews,
        successRate: Math.round(successRate * 10) / 10,
        categoryPerformance,
        monthlyTrends,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Set default values if API fails
      setAnalyticsData({
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
        categoryPerformance: [],
        monthlyTrends: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "applications":
        return <ApplicationsManagementMongo />;
      case "freelancers":
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
            style={{ height: "calc(100vh - 60px)" }}
          >
            <FindFreelancersTab />
          </div>
        );
      case "jobs":
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div>
                <div className="mb-6 sm:mb-8">
                  <h1
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-2`}
                  >
                    <span className="cyan-gradient-text animate-shimmer">My Jobs</span>
                    <Briefcase className="inline-block w-6 h-6 sm:w-8 sm:h-8 ml-2 md:ml-3 text-cyan-400 animate-float" />
                  </h1>
                  <p
                    className={`text-base sm:text-lg font-body ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Manage and track all your posted job listings
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={() => navigate("/post-job")}
                    className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium font-body text-sm shadow-lg shadow-cyan-500/20 transition-all duration-300`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="inline w-5 h-5 mr-2" />
                    Post New Job
                  </motion.button>

                  {userJobs.length > 0 && (
                    <motion.button
                      onClick={() => setShowClearConfirm(true)}
                      className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium font-body text-sm shadow-lg shadow-red-500/20 transition-all duration-300`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={clearingJobs}
                    >
                      {clearingJobs ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                          Clearing...
                        </>
                      ) : (
                        <>🗑️ Clear All Jobs ({userJobs.length})</>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 sm:p-6 glass-card ${
                  darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"
                }`}
              >
                <h3
                  className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                  Recent Activity
                </h3>

                {/* Loading State */}
                {jobsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div
                      className={`w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin`}
                    />
                    <span
                      className={`ml-3 font-body ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Loading your jobs...
                    </span>
                  </div>
                )}

                {/* Jobs Grid */}
                {!jobsLoading && (
                  <div className="space-y-4">
                    {/* Real Job Cards */}
                    {userJobs.length > 0 ? (
                      userJobs.map((job: any, index: number) => (
                        <motion.div
                          key={job._id}
                          className={`rounded-2xl p-5 glass-card transition-all duration-300 ${
                            darkMode ? "" : "bg-white/50 border-black/10"
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4
                                  className={`text-lg font-semibold font-display ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {job.title}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium font-body ${
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

                              <div className="flex flex-wrap items-center gap-4 text-sm font-body">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  📂 {job.category || "General"}
                                </span>
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  👥 {job.applicationsCount || 0} applications
                                </span>
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  👁️ {job.views || 0} views
                                </span>
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  📅 Posted:{" "}
                                  {job.createdAt
                                    ? new Date(
                                        job.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                                {job.deadline && (
                                  <span
                                    className={`${
                                      darkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    ⏰ Deadline:{" "}
                                    {new Date(
                                      job.deadline
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <motion.button
                                onClick={() => setActiveTab("applications")}
                                className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium font-body shadow-md transition-all duration-300`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                View Applications (
                                {job.applicationsCount || 0})
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteJob(job._id)}
                                className={`px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium font-body shadow-md transition-all duration-300`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                🗑️ Delete Job
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className={`text-center py-12 rounded-2xl glass-card ${
                        darkMode ? "" : "bg-white/50 border-black/10"
                      }`}>
                        <Briefcase
                          className={`w-16 h-16 mx-auto mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-300"
                          }`}
                        />
                        <h4
                          className={`text-lg font-semibold font-display mb-2 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          No jobs posted yet
                        </h4>
                        <p
                          className={`mb-6 font-body ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Start by posting your first job to find great talent
                        </p>
                        <motion.button
                          onClick={() => navigate("/post-job")}
                          className={`px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 font-medium font-body text-sm transition-all duration-300`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Plus className="inline w-5 h-5 mr-2" />
                          Post Your First Job
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "profile":
        // Profile tab redirects to company profile page
        return null;
      default:
        return (
          <motion.div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div>
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-2">
                    <span className="cyan-gradient-text animate-shimmer">Hiring Dashboard</span>
                    <Sparkles className="inline-block w-6 h-6 sm:w-8 sm:h-8 ml-2 md:ml-3 text-cyan-400 animate-float" />
                  </h1>
                  <p className={`text-base sm:text-lg font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Manage your hiring process and find the best talent
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
                  {[
                    { label: "Applications", value: analyticsData.totalApplications, icon: Users, color: "from-cyan-500 to-blue-600", glow: "rgba(6,242,242,0.3)", action: () => setActiveTab("applications") },
                    { label: "Active Jobs", value: analyticsData.totalJobs, icon: Briefcase, color: "from-cyan-500 to-blue-600", glow: "rgba(6,242,242,0.3)", action: () => setActiveTab("jobs") },
                    { label: "Hired", value: analyticsData.hiredCount, icon: CheckCircle, color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.3)", action: () => setActiveTab("applications") },
                    { label: "Success Rate", value: `${analyticsData.successRate}%`, icon: TrendingUp, color: "from-green-400 to-emerald-600", glow: "rgba(74,222,128,0.3)", action: undefined },
                    { label: "Avg Days to Hire", value: analyticsData.avgDaysToHire, icon: Calendar, color: "from-amber-400 to-orange-500", glow: "rgba(251,191,36,0.3)", action: undefined },
                    { label: "Response Time", value: `${analyticsData.responseTime}h`, icon: Clock, color: "from-blue-400 to-indigo-600", glow: "rgba(96,165,250,0.3)", action: undefined },
                  ].map((card, i) => (
                    <motion.div
                      key={card.label}
                      onClick={card.action}
                      className={`group relative rounded-2xl p-5 glass-card hover:animate-glow-pulse transition-all duration-500 ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"} ${card.action ? "cursor-pointer" : ""}`}
                      variants={statCardVariants}
                      custom={i}
                      whileHover={{ scale: card.action ? 1.03 : 1.02, y: -4 }}
                      style={darkMode ? { boxShadow: `0 0 30px ${card.glow}` } : {}}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                          <card.icon className={`w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`} />
                        </div>
                        {card.action && (
                          <motion.div
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Zap className="w-4 h-4 text-cyan-400" />
                          </motion.div>
                        )}
                      </div>
                      <div className="relative z-10">
                        <p className={`text-2xl sm:text-3xl font-bold font-display mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {card.value}
                        </p>
                        <p className={`text-sm font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {card.label}
                        </p>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                    </motion.div>
                  ))}
                </div>

                {/* Monthly Trends */}
                <div className={`rounded-2xl p-5 glass-card mb-5 ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}>
                  <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    <BarChart3 className="inline w-5 h-5 mr-2 text-cyan-400" />
                    Monthly Trends
                  </h3>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
                      {analyticsData.monthlyTrends.map((month, i) => {
                        const maxVal = Math.max(...analyticsData.monthlyTrends.map(m => m.applications), 1);
                        return (
                          <div key={month.month} className="text-center">
                            <div className="flex flex-col items-center justify-end h-28 sm:h-32 gap-1">
                              <motion.div
                                className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500/60 to-cyan-400/30"
                                initial={{ height: 0 }}
                                animate={{ height: `${(month.applications / maxVal) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                style={{ minHeight: month.applications > 0 ? '8px' : '0px' }}
                              />
                              <motion.div
                                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500/60 to-emerald-400/30"
                                initial={{ height: 0 }}
                                animate={{ height: `${(month.hired / maxVal) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                                style={{ minHeight: month.hired > 0 ? '4px' : '0px' }}
                              />
                            </div>
                            <p className={`text-[10px] sm:text-xs font-body mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{month.month}</p>
                            <p className={`text-[10px] sm:text-xs font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{month.applications}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Performance & Quick Actions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                  <div className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}>
                    <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <Award className="inline w-5 h-5 mr-2 text-cyan-400" />
                      Category Performance
                    </h3>
                    {analyticsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                    ) : analyticsData.categoryPerformance.length === 0 ? (
                      <div className={`text-center py-8 text-sm font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>No category data available yet</div>
                    ) : (
                      <div className="space-y-3">
                        {analyticsData.categoryPerformance.map((cat, i) => (
                          <div key={cat.category}>
                            <div className="flex justify-between text-sm font-body mb-1">
                              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{cat.category}</span>
                              <span className="text-cyan-400 font-semibold">{cat.conversion}</span>
                            </div>
                            <div className={`h-2 rounded-full ${darkMode ? "bg-white/5" : "bg-gray-100"}`}>
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, parseInt(cat.conversion) * 5)}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                              />
                            </div>
                            <span className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{cat.applications} applications</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}>
                    <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <Zap className="inline w-5 h-5 mr-2 text-cyan-400" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { icon: Users, label: "View Applications", desc: "Review pending applications", action: () => setActiveTab("applications"), color: "from-cyan-500 to-blue-600" },
                        { icon: Plus, label: "Post New Job", desc: "Create a job posting", action: () => navigate("/post-job"), color: "from-emerald-500 to-teal-700" },
                      ].map((item) => (
                        <motion.button
                          key={item.label}
                          onClick={item.action}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl glass-card transition-all duration-300 ${darkMode ? "" : "bg-white/50 border-black/10"}`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                            <item.icon className={`w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`} />
                          </div>
                          <div className="text-left">
                            <p className={`font-medium text-sm font-body ${darkMode ? "text-white" : "text-gray-900"}`}>{item.label}</p>
                            <p className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.desc}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
            </div>
          </div>
          </div>
          {/* Tab bar glow separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
       </motion.div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Font Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --cyan: #06f2f2;
          --cyan-dark: #05b8b8;
          --cyan-glow: 0 0 20px rgba(6, 242, 242, 0.3), 0 0 60px rgba(6, 242, 242, 0.1);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(6, 242, 242, 0.15);
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 242, 242, 0.2); }
          50% { box-shadow: 0 0 40px rgba(6, 242, 242, 0.4); }
        }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
        }
        .cyan-gradient-text {
          background: linear-gradient(135deg, #06f2f2 0%, #0af 50%, #06f2f2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .glass-card { background: rgba(0, 0, 0, 0.4); }
        :root:not(.dark) .glass-card { border-color: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6,242,242,0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,242,242,0.5); }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        className={`sticky top-0 z-10 border-b backdrop-blur-xl ${
          darkMode
            ? "bg-black/60 border-cyan-500/10"
            : "bg-white/70 border-black/10 shadow-sm shadow-black/5"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1">
             {tabs.map((tab) => (
               <motion.button
                 key={tab.id}
                 onClick={() => {
                   const navPath = (tab as any).navigate as string | undefined;
                   if (navPath) {
                     navigate(navPath);
                   } else {
                     setActiveTab(tab.id as "overview" | "applications" | "jobs" | "freelancers" | "profile");
                   }
                 }}
                 className={`relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-3 sm:py-4 font-medium transition-all duration-300 font-display tracking-wide text-sm sm:text-base whitespace-nowrap rounded-xl ${
                   activeTab === tab.id
                     ? `${darkMode ? "text-cyan-300 bg-white/5 border border-cyan-500/20" : "text-cyan-600 bg-cyan-50 border border-cyan-200"}`
                     : darkMode
                       ? "text-gray-400 hover:text-gray-200 border border-transparent"
                       : "text-gray-500 hover:text-gray-800 border border-transparent"
                 }`}
                 whileHover={{ scale: 1.04, y: -1 }}
                 whileTap={{ scale: 0.96 }}
               >
                 {activeTab === tab.id && (
                   <motion.div
                     layoutId="tab-underline"
                     className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                     transition={{ type: "spring", stiffness: 400, damping: 30 }}
                   />
                 )}
                 {tab.id === "profile" && companyLogo ? (
                   <img
                     src={companyLogo}
                     alt="Company Logo"
                     className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-cyan-500/30"
                   />
                 ) : (
                   <tab.icon
                     className={`w-4 h-4 sm:w-5 sm:h-5 ${
                       activeTab === tab.id
                         ? darkMode ? "text-cyan-400" : "text-cyan-600"
                         : darkMode
                           ? "text-gray-400"
                           : "text-gray-500"
                     }`}
                   />
                 )}
                 <span className="hidden sm:inline">{tab.label}</span>
                 <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
               </motion.button>
             ))}
            </div>
             <div className="flex-shrink-0 ml-2">
              <FloatingDarkModeToggle />
            </div>
          </div>
         </div>
      </motion.div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Clear All Jobs Confirmation Dialog */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`rounded-2xl p-6 max-w-md w-full glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className={`text-xl font-bold font-display mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Clear All Jobs?
              </h3>
              <p className={`text-sm font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                This action will permanently delete all {userJobs.length} jobs
                you have posted. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowClearConfirm(false)}
                className={`flex-1 px-4 py-3 rounded-xl glass-card font-medium font-body text-sm transition-all duration-300 ${darkMode ? "" : "bg-white/50 border-black/10"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={clearingJobs}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleClearAllJobs}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium font-body text-sm shadow-lg shadow-red-500/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={clearingJobs}
              >
                {clearingJobs ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                    Clearing...
                  </>
                ) : (
                  "Clear All Jobs"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HiringDashboard;
