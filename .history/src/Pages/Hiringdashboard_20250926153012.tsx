import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks"; // Import to access theme state
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";
import {
  Plus,
  Users,
  Briefcase,
  BarChart3,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import ApplicationsManagementMongo from "./ApplicationsManagementMongo";

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
    "overview" | "applications" | "jobs" | "freelancers" | "analytics" | "profile"
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
    categoryPerformance: [] as Array<{category: string, applications: number, conversion: string}>,
    monthlyTrends: [] as Array<{month: string, applications: number, hired: number}>
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

  // Freelancers state
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [deletingFreelancer, setDeletingFreelancer] = useState<string | null>(null);
  const [deletingJob, setDeletingJob] = useState<string | null>(null);



  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "applications" as const, label: "Applications", icon: Users },
    { id: "jobs" as const, label: "My Jobs", icon: Briefcase },
    { id: "freelancers" as const, label: "Freelancers", icon: User },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  React.useEffect(() => {
    const state = location.state as any;
    if (state?.tab && ["overview", "applications", "jobs", "analytics"].includes(state.tab)) {
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
    if (activeTab === "jobs" && user) {
      fetchUserJobs();
    }
  }, [activeTab, user]);

  // Fetch profile data when profile tab is selected
  useEffect(() => {
    if (activeTab === "profile" && user) {
      fetchCompanyProfile();
    }
  }, [activeTab, user]);

  // Fetch freelancers data when freelancers tab is selected
  useEffect(() => {
    if (activeTab === "freelancers" && user) {
      fetchFreelancers();
    }
  }, [activeTab, user]);









  const fetchUserJobs = async () => {
    if (!user) return;

    setJobsLoading(true);
    try {
      const jobs = await apiService.getMyJobs();
      setUserJobs(jobs);
    } catch (error) {
      console.error('Error fetching user jobs:', error);
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
      console.log('Jobs cleared:', result);
      // Refresh the jobs list
      await fetchUserJobs();
      // Refresh analytics data
      if (activeTab === "analytics") {
        await fetchAnalyticsData();
      }
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing jobs:', error);
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
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setCompanyProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchFreelancers = async () => {
    if (!user) return;

    setFreelancersLoading(true);
    try {
      const freelancersData = await apiService.getFreelancers();
      setFreelancers(freelancersData);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setFreelancers([]);
    } finally {
      setFreelancersLoading(false);
    }
  };

  const handleDeleteFreelancer = async (freelancerId: string) => {
    if (!window.confirm('Are you sure you want to delete this freelancer? This action cannot be undone.')) {
      return;
    }

    setDeletingFreelancer(freelancerId);
    try {
      await apiService.deleteFreelancer(freelancerId);
      // Refresh the freelancers list
      await fetchFreelancers();
    } catch (error) {
      console.error('Error deleting freelancer:', error);
      alert('Failed to delete freelancer. Please try again.');
    } finally {
      setDeletingFreelancer(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeletingJob(jobId);
    try {
      await apiService.deleteJob(jobId);
      // Refresh the jobs list
      await fetchUserJobs();
      // Refresh analytics data
      if (activeTab === "analytics") {
        await fetchAnalyticsData();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setDeletingJob(null);
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
      const allApplications = applicationsResponses.flatMap((response: any) => response || []);

      // Calculate analytics
      const totalJobs = userJobs.length;
      const totalApplications = allApplications.length;

      // Count applications by status
      const statusCounts = allApplications.reduce((acc, app) => {
        const status = app.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hiredCount = statusCounts.hired || 0;
      const pendingCount = statusCounts.pending || 0;
      const rejectedCount = statusCounts.rejected || 0;
      const inReviewCount = statusCounts.in_review || 0;

      // Calculate success rate
      const successRate = totalApplications > 0 ? ((hiredCount / totalApplications) * 100) : 0;

      // Calculate average days to hire
      const hiredApplications = allApplications.filter(app => app.status === 'hired' && app.updatedAt);
      const avgDaysToHire = hiredApplications.length > 0
        ? hiredApplications.reduce((sum, app) => {
            const hireDate = new Date(app.updatedAt);
            const postDate = new Date(app.job?.createdAt || app.createdAt);
            const days = Math.ceil((hireDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / hiredApplications.length
        : 0;

      // Calculate category performance
      const categoryStats = userJobs.reduce((acc, job) => {
        const category = job.category || 'Other';
        if (!acc[category]) {
          acc[category] = { jobs: 0, applications: 0, hired: 0 };
        }
        acc[category].jobs += 1;
        return acc;
      }, {} as Record<string, { jobs: number, applications: number, hired: number }>);

      // Add application counts to categories
      allApplications.forEach(app => {
        const category = app.job?.category || 'Other';
        if (categoryStats[category]) {
          categoryStats[category].applications += 1;
          if (app.status === 'hired') {
            categoryStats[category].hired += 1;
          }
        }
      });

      const categoryPerformance = Object.entries(categoryStats)
        .map(([category, stats]) => ({
          category,
          applications: stats.applications,
          conversion: stats.applications > 0 ? `${((stats.hired / stats.applications) * 100).toFixed(1)}%` : '0%'
        }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 5);

      // Calculate monthly trends (last 6 months)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

        const monthApplications = allApplications.filter(app => {
          const appDate = new Date(app.createdAt);
          return appDate.getMonth() === monthDate.getMonth() &&
                 appDate.getFullYear() === monthDate.getFullYear();
        });

        const monthHired = monthApplications.filter(app => app.status === 'hired');

        monthlyTrends.push({
          month: monthName,
          applications: monthApplications.length,
          hired: monthHired.length
        });
      }

      // Calculate response time (average time to respond to applications)
      const respondedApplications = allApplications.filter(app => app.updatedAt && app.createdAt);
      const responseTime = respondedApplications.length > 0
        ? respondedApplications.reduce((sum, app) => {
            const responseDate = new Date(app.updatedAt);
            const submitDate = new Date(app.createdAt);
            const hours = (responseDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }, 0) / respondedApplications.length
        : 0;

      // Calculate total job views
      const jobViews = userJobs.reduce((sum, job) => sum + ((job as any).views || 0), 0);

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
        monthlyTrends
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
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
        monthlyTrends: []
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
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 sm:mb-8">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    My Jobs
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage and track all your posted job listings
                  </p>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <motion.button
                    onClick={() => navigate("/post-job")}
                    className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30 font-medium`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="inline w-5 h-5 mr-2" />
                    Post New Job
                  </motion.button>

                  {userJobs.length > 0 && (
                    <motion.button
                      onClick={() => setShowClearConfirm(true)}
                      className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-red-500/30 font-medium`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={clearingJobs}
                    >
                      {clearingJobs ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          🗑️ Clear All Jobs ({userJobs.length})
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>

                {/* Jobs List */}
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
                    Your Posted Jobs
                  </h3>

                  {/* Loading State */}
                  {jobsLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin`} />
                      <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Loading your jobs...
                      </span>
                    </div>
                  )}

                  {/* Jobs Grid */}
                  {!jobsLoading && (
                    <div className="space-y-4">
                      {/* Real Job Cards */}
                      {userJobs.length > 0 ? userJobs.map((job: any, index: number) => (
                        <motion.div
                          key={job._id}
                          className={`${
                            darkMode
                              ? "bg-gray-800/50 border-white/10"
                              : "bg-gray-50 border-black/10"
                          } border rounded-lg p-4 hover:shadow-md transition-all duration-300`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 * index }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                                  {job.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : job.status === 'expired'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.status || 'active'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  📂 {job.category || 'General'}
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  👥 {job.applicationsCount || 0} applications
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  👁️ {job.views || 0} views
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  📅 Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                                {job.deadline && (
                                  <span className={`${
                                    darkMode ? "text-gray-300" : "text-gray-600"
                                  }`}>
                                    ⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <motion.button
                                onClick={() => navigate(`/job/${job._id}`)}
                                className={`px-4 py-2 border ${
                                  darkMode
                                    ? "border-white/20 hover:bg-white/10"
                                    : "border-black/20 hover:bg-gray-50"
                                } rounded-lg transition-all duration-300 text-sm font-medium`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View Job
                              </motion.button>
                              <motion.button
                                onClick={() => setActiveTab("applications")}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm font-medium`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View Applications ({job.applicationsCount || 0})
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteJob(job._id)}
                                disabled={deletingJob === job._id}
                                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {deletingJob === job._id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>🗑️ Delete Job</>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-12">
                          <Briefcase className={`w-16 h-16 mx-auto mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-300"
                          }`} />
                          <h4 className={`text-lg font-semibold mb-2 ${
                            darkMode ? "text-white" : "text-black"
                          }`}>
                            No jobs posted yet
                          </h4>
                          <p className={`mb-6 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Start by posting your first job to find great talent
                          </p>
                          <motion.button
                            onClick={() => navigate("/post-job")}
                            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="inline w-5 h-5 mr-2" />
                            Post Your First Job
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 sm:mb-8">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    Hiring Analytics
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Comprehensive insights into your hiring performance
                  </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.totalJobs}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Jobs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Live data</span>
                    </div>
                  </motion.div>
 
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.totalApplications}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Applications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Live data</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.hiredCount}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Hired</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Live data</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.avgDaysToHire}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Avg. Days to Hire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Live data</span>
                    </div>
                  </motion.div>
                </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Application Trends */}
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
                      Application Trends
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.monthlyTrends.length > 0 ? analyticsData.monthlyTrends.map((item, index) => (
                        <div key={item.month} className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {item.month}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {item.applications}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {item.hired}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          No data available yet
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Job Categories Performance */}
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
                      Top Performing Categories
                    </h3>
                    <div className="space-y-4">
                      {analyticsData.categoryPerformance.length > 0 ? analyticsData.categoryPerformance.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-black"}`}>
                              {item.category}
                            </p>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {item.applications} applications
                            </p>
                          </div>
                          <div className={`text-sm font-semibold ${
                            parseFloat(item.conversion) >= 20 ? "text-green-500" :
                            parseFloat(item.conversion) >= 15 ? "text-blue-500" :
                            parseFloat(item.conversion) >= 10 ? "text-purple-500" :
                            parseFloat(item.conversion) >= 5 ? "text-orange-500" : "text-gray-500"
                          }`}>
                            {item.conversion}
                          </div>
                        </div>
                      )) : (
                        <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          No category data available yet
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Additional Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h4 className={`text-base font-semibold mb-3 ${darkMode ? "text-white" : "text-black"}`}>
                      Response Time
                    </h4>
                    <div className="text-center">
                      <p className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.responseTime}h</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Average response time
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h4 className={`text-base font-semibold mb-3 ${darkMode ? "text-white" : "text-black"}`}>
                      Job Views
                    </h4>
                    <div className="text-center">
                      <p className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.jobViews.toLocaleString()}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Total job views this month
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <h4 className={`text-base font-semibold mb-3 ${darkMode ? "text-white" : "text-black"}`}>
                      Success Rate
                    </h4>
                    <div className="text-center">
                      <p className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-black"}`}>{analyticsData.successRate}%</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Application to hire rate
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      case "freelancers":
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 sm:mb-8">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    Browse Freelancers
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Discover talented freelancers for your projects
                  </p>
                </div>

                {/* Freelancers List */}
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
                    Available Freelancers
                  </h3>

                  {/* Loading State */}
                  {freelancersLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin`} />
                      <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Loading freelancers...
                      </span>
                    </div>
                  )}

                  {/* Freelancers Grid */}
                  {!freelancersLoading && (
                    <div className="space-y-4">
                      {freelancers.length > 0 ? freelancers.map((freelancer: any, index: number) => (
                        <motion.div
                          key={freelancer._id}
                          className={`${
                            darkMode
                              ? "bg-gray-800/50 border-white/10"
                              : "bg-gray-50 border-black/10"
                          } border rounded-lg p-4 hover:shadow-md transition-all duration-300`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 * index }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                                {freelancer.profile?.avatar ? (
                                  <img
                                    src={apiService.getFileUrl(freelancer.profile.avatar)}
                                    alt={`${freelancer.profile?.firstName || ''} ${freelancer.profile?.lastName || ''}`}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-lg">
                                    {(freelancer.profile?.firstName || freelancer.email)?.charAt(0)?.toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Freelancer Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                                      {freelancer.profile?.firstName && freelancer.profile?.lastName
                                        ? `${freelancer.profile.firstName} ${freelancer.profile.lastName}`
                                        : freelancer.email.split('@')[0]
                                      }
                                    </h4>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                      {freelancer.profile?.primarySkill || 'Freelancer'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  {freelancer.profile?.experienceLevel && (
                                    <span className={`${
                                      darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                      📊 {freelancer.profile.experienceLevel}
                                    </span>
                                  )}
                                  {freelancer.profile?.location && (
                                    <span className={`${
                                      darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                      📍 {freelancer.profile.location}
                                    </span>
                                  )}
                                  {freelancer.profile?.yearsOfExperience && (
                                    <span className={`${
                                      darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                      💼 {freelancer.profile.yearsOfExperience} experience
                                    </span>
                                  )}
                                </div>

                                {freelancer.profile?.bio && (
                                  <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {freelancer.profile.bio}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <motion.button
                                onClick={() => {/* Message removed */}}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg opacity-60 cursor-not-allowed transition-all duration-300 text-sm font-medium`}
                                whileHover={{ scale: 1.0 }}
                                whileTap={{ scale: 1.0 }}
                              >
                                💬 Message (disabled)
                              </motion.button>
                              <motion.button
                                onClick={() => {/* Hire action placeholder */}}
                                className={`px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg transition-all duration-300 text-sm font-medium`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                🤝 Hire Now
                              </motion.button>
                              <motion.button
                                onClick={() => {/* View profile */}}
                                className={`px-4 py-2 border ${
                                  darkMode
                                    ? "border-white/20 hover:bg-white/10"
                                    : "border-black/20 hover:bg-gray-50"
                                } rounded-lg transition-all duration-300 text-sm font-medium`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                👁️ View Profile
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteFreelancer(freelancer._id)}
                                disabled={deletingFreelancer === freelancer._id}
                                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {deletingFreelancer === freelancer._id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>🗑️ Delete</>
                                )}
                              </motion.button>

                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-12">
                          <Users className={`w-16 h-16 mx-auto mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-300"
                          }`} />
                          <h4 className={`text-lg font-semibold mb-2 ${
                            darkMode ? "text-white" : "text-black"
                          }`}>
                            No freelancers available
                          </h4>
                          <p className={`mb-6 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Check back later for available freelancers
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );

      case "messages":




      case "profile":
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 sm:mb-8">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    Company Profile
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage your company profile and settings
                  </p>
                </div>

                {/* Profile Content */}
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white border-black/10"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {/* Loading State */}
                  {profileLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin`} />
                      <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Loading your profile...
                      </span>
                    </div>
                  )}

                  {/* Profile Display */}
                  {!profileLoading && companyProfile && (
                    <div className="space-y-6">
                      {/* Company Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                          {companyProfile.logo ? (
                            <img
                              src={companyProfile.logo}
                              alt={companyProfile.companyName}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {companyProfile.companyName?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
                            {companyProfile.companyName}
                          </h2>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {companyProfile.description}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => navigate("/company-profile")}
                          className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm font-medium`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit Profile
                        </motion.button>
                      </div>

                      {/* Company Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                            Company Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Company Name
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.companyName}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Description
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.description}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Industry
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.industry || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Email
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.email || user?.email}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Phone
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.phone || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Location
                              </label>
                              <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
                                {companyProfile.location || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Profile State */}
                  {!profileLoading && !companyProfile && (
                    <div className="text-center py-12">
                      <User className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? "text-gray-400" : "text-gray-300"
                      }`} />
                      <h4 className={`text-lg font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-black"
                      }`}>
                        No company profile found
                      </h4>
                      <p className={`mb-6 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Create your company profile to start connecting with freelancers
                      </p>
                      <motion.button
                        onClick={() => navigate("/company-profile")}
                        className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create Company Profile
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      default:
        return (
          <div
            className={`min-h-screen ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6 sm:mb-8">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      scale: 1.05,
                      textShadow: darkMode
                        ? "0 0 8px rgba(255, 255, 255, 0.8)"
                        : "0 0 8px rgba(59, 130, 246, 0.8)",
                      transition: { duration: 0.3 },
                    }}
                  >
                    Hiring Dashboard
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage your hiring process and find the best talent
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={() => setActiveTab("applications")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <motion.div
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                          variants={headingVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{
                            scale: 1.05,
                            textShadow: darkMode
                              ? "0 0 8px rgba(255, 255, 255, 0.8)"
                              : "0 0 8px rgba(59, 130, 246, 0.8)",
                            transition: { duration: 0.3 },
                          }}
                        >
                          Applications
                        </motion.h3>
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
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={() => navigate("/post-job")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <motion.div
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                          variants={headingVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{
                            scale: 1.05,
                            textShadow: darkMode
                              ? "0 0 8px rgba(255, 255, 255, 0.8)"
                              : "0 0 8px rgba(59, 130, 246, 0.8)",
                            transition: { duration: 0.3 },
                          }}
                        >
                          Post Job
                        </motion.h3>
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
                  </motion.div>

                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={() => setActiveTab("jobs")}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <motion.div
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.h3
                          className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${
                            darkMode
                              ? "from-blue-300 to-blue-500"
                              : "from-blue-400 to-blue-600"
                          } bg-clip-text text-transparent font-inter tracking-tight`}
                          variants={headingVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{
                            scale: 1.05,
                            textShadow: darkMode
                              ? "0 0 8px rgba(255, 255, 255, 0.8)"
                              : "0 0 8px rgba(59, 130, 246, 0.8)",
                            transition: { duration: 0.3 },
                          }}
                        >
                          My Jobs
                        </motion.h3>
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
                  </motion.div>
                </div>

                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-white/10"
                      : "bg-white/80 border-black/10"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                >
                  <motion.h2
                    className={`text-lg sm:text-xl font-semibold bg-gradient-to-r ${
                      darkMode
                        ? "from-blue-300 to-blue-500"
                        : "from-blue-400 to-blue-600"
                    } bg-clip-text text-transparent mb-3 sm:mb-4 font-inter tracking-tight`}
                    variants={headingVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      scale: 1.05,
                      textShadow: darkMode
                        ? "0 0 8px rgba(255, 255, 255, 0.8)"
                        : "0 0 8px rgba(59, 130, 246, 0.8)",
                      transition: { duration: 0.3 },
                    }}
                  >
                    Quick Actions
                  </motion.h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <motion.button
                      onClick={() => setActiveTab("applications")}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border ${
                        darkMode
                          ? "border-white/10 hover:bg-white/10"
                          : "border-black/10 hover:bg-gray-50"
                      } rounded-lg transition-all duration-300 shadow-md`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>
                    <motion.button
                      onClick={() => navigate("/post-job")}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border ${
                        darkMode
                          ? "border-white/10 hover:bg-white/10"
                          : "border-black/10 hover:bg-gray-50"
                      } rounded-lg transition-all duration-300 shadow-md`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
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
          {/* Mobile: Horizontal scrollable tabs */}
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
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Clear All Jobs Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className={`${
              darkMode ? "bg-gray-800 border-white/10" : "bg-white border-black/10"
            } border rounded-2xl p-6 max-w-md w-full shadow-2xl`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                Clear All Jobs?
              </h3>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                This action will permanently delete all {userJobs.length} jobs you have posted.
                This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowClearConfirm(false)}
                className={`flex-1 px-4 py-3 border ${
                  darkMode ? "border-white/20 hover:bg-white/10" : "border-black/20 hover:bg-gray-50"
                } rounded-lg transition-all duration-300 font-medium`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={clearingJobs}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleClearAllJobs}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 font-medium"
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
        </div>
      )}


    </div>
  );
};

export default HiringDashboard;
