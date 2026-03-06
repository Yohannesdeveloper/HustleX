import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks"; // Import to access theme state
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import {
  Plus,
  Users,
  Briefcase,
  BarChart3,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";
import ApplicationsManagementMongo from "./ApplicationsManagementMongo";
import FloatingDarkModeToggle from "../components/FloatingDarkModeToggle";


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

const HiringDashboard: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode); // Access dark mode state
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "applications"
    | "jobs"
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
    { id: "messages" as const, label: "Messages", icon: MessageSquare, navigate: "/chat" },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  React.useEffect(() => {
    const state = location.state as any;
    if (
      state?.tab &&
      ["overview", "applications", "jobs", "profile"].includes(state.tab)
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
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                  >
                    My Jobs
                  </h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage and track all your posted job listings
                  </p>
                </div>

                {/* Action Buttons (no animation) */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate("/post-job")}
                    className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30 font-medium`}
                  >
                    <Plus className="inline w-5 h-5 mr-2" />
                    Post New Job
                  </button>

                  {userJobs.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-red-500/30 font-medium`}
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
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`${
                  darkMode
                    ? "bg-black/50 border-white/10"
                    : "bg-white border-black/10"
                } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"
                    }`}
                >
                  Recent Activity
                </h3>

                {/* Loading State */}
                {jobsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div
                      className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
                    />
                    <span
                      className={`ml-3 ${
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
                        <div
                          key={job._id}
                          className={`${
                            darkMode
                              ? "bg-gray-800/50 border-white/10"
                              : "bg-gray-50 border-black/10"
                          } border rounded-lg p-4 hover:shadow-md transition-all duration-300`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4
                                  className={`text-lg font-semibold ${
                                    darkMode ? "text-white" : "text-black"
                                  }`}
                                >
                                  {job.title}
                                </h4>
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
                              <button
                                onClick={() => setActiveTab("applications")}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm font-medium`}
                              >
                                View Applications (
                                {job.applicationsCount || 0})
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 text-sm font-medium`}
                              >
                                🗑️ Delete Job
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase
                          className={`w-16 h-16 mx-auto mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-300"
                          }`}
                        />
                        <h4
                          className={`text-lg font-semibold mb-2 ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        >
                          No jobs posted yet
                        </h4>
                        <p
                          className={`mb-6 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Start by posting your first job to find great talent
                        </p>
                        <button
                          onClick={() => navigate("/post-job")}
                          className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30`}
                        >
                          <Plus className="inline w-5 h-5 mr-2" />
                          Post Your First Job
                        </button>
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
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div>
                <div className="mb-6 sm:mb-8">
                  <h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                  >
                    Hiring Dashboard
                  </h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage your hiring process and find the best talent
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    onClick={() => setActiveTab("applications")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                        >
                          Applications
                        </h3>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } text-xs sm:text-sm`}
                        >
                          Review freelancer applications
                        </p>
                      </div>
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } text-xs sm:text-sm`}
                    >
                      Manage and review all applications for your posted jobs
                    </p>
                  </div>

                  <div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    onClick={() => navigate("/post-job")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                        >
                          Post Job
                        </h3>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } text-xs sm:text-sm`}
                        >
                          Create a new job posting
                        </p>
                      </div>
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } text-xs sm:text-sm`}
                    >
                      Post a new job and start receiving applications
                    </p>
                  </div>

                  <div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    onClick={() => setActiveTab("jobs")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                        >
                          My Jobs
                        </h3>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } text-xs sm:text-sm`}
                        >
                          Manage your job postings
                        </p>
                      </div>
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } text-xs sm:text-sm`}
                    >
                      View and manage all your posted jobs
                    </p>
                  </div>
                </div>

                <div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white/80 border-black/10"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-semibold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-3 sm:mb-4 font-inter tracking-tight`}
                  >
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => setActiveTab("applications")}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border ${
                        darkMode
                          ? "border-white/10 hover:bg-white/10"
                          : "border-black/10 hover:bg-gray-50"
                      } rounded-lg transition-all duration-300 shadow-md`}
                    >
                      <Users
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div className="text-left">
                        <p
                          className={`font-medium text-sm sm:text-base ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          View Applications
                        </p>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } text-xs sm:text-sm`}
                        >
                          Review pending applications
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("/post-job")}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border ${
                        darkMode
                          ? "border-white/10 hover:bg-white/10"
                          : "border-black/10 hover:bg-gray-50"
                      } rounded-lg transition-all duration-300 shadow-md`}
                    >
                      <Plus
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div className="text-left">
                        <p
                          className={`font-medium text-sm sm:text-base ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Post New Job
                        </p>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } text-xs sm:text-sm`}
                        >
                          Create a job posting
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        href="https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Poppins:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
          .font-inter {
            font-family: 'Inter', 'Poppins', sans-serif;
            font-weight: 700;
            letter-spacing: 0.02em;
            line-height: 1.2;
          }
        `}
      </style>

      {/* Navigation Tabs */}
      <div
        className={`${
          darkMode
            ? "bg-black/50 border-white/10"
            : "bg-white/80 border-black/10"
        } border-b sticky top-0 z-10 backdrop-blur-sm shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: Horizontal scrollable tabs */}
          <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto flex-1">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => {
                   const navPath = (tab as any).navigate as string | undefined;
                   if (navPath) {
                     navigate(navPath);
                   } else {
                     setActiveTab(tab.id as "overview" | "applications" | "jobs" | "profile");
                   }
                 }}
                 className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium transition-all duration-300 font-inter tracking-tight text-sm sm:text-base whitespace-nowrap ${
                   activeTab === tab.id
                     ? darkMode
                       ? "border-blue-500 text-white"
                       : "border-blue-600 text-gray-900"
                     : darkMode
                     ? "border-transparent text-gray-300 hover:text-white"
                     : "border-transparent text-gray-600 hover:text-gray-900"
                 }`}
               >
                 {tab.id === "profile" && companyLogo ? (
                   <img
                     src={companyLogo}
                     alt="Company Logo"
                     className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-gray-300"
                   />
                 ) : (
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
                 )}
                 <span className="hidden xs:inline">{tab.label}</span>
                 <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
               </button>
             ))}
            </div>
            {/* Attach dark mode/profile menu to the dashboard header */}
            <div className="flex-shrink-0 ml-4">
              <FloatingDarkModeToggle />
            </div>
           </div>
         </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Clear All Jobs Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-white/10"
                : "bg-white border-black/10"
            } border rounded-2xl p-6 max-w-md w-full shadow-2xl`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                Clear All Jobs?
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                This action will permanently delete all {userJobs.length} jobs
                you have posted. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className={`flex-1 px-4 py-3 border ${
                  darkMode
                    ? "border-white/20 hover:bg-white/10"
                    : "border-black/20 hover:bg-gray-50"
                } rounded-lg transition-all duration-300 font-medium`}
                disabled={clearingJobs}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllJobs}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 font-medium"
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
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringDashboard;
