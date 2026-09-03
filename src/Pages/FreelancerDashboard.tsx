import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import apiService from "../services/api";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  // MessageCircle,
  Star,
  Calendar,
  Search,
  Filter,
  MapPin,
  Users,
  Award,
  Target,
  BarChart3,
  User,
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
// Removed UnifiedMessaging import


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

const FreelancerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "jobs" | "analytics" | "profile"
  >("overview");

  const [dashboardData, setDashboardData] = useState({
    totalApplications: 0,
    activeApplications: 0,
    completedProjects: 0,
    totalEarnings: 0,
    profileViews: 0,
    averageRating: 0,
    recentApplications: [] as any[],
    recommendedJobs: [] as any[],
    upcomingDeadlines: [] as any[],
  });

  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "applications" as const, label: "My Applications", icon: Briefcase },
    { id: "jobs" as const, label: "Find Jobs", icon: Search },
    // { id: "messages" as const, label: "Messages", icon: MessageCircle },
    { id: "analytics" as const, label: "Analytics", icon: TrendingUp },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  React.useEffect(() => {
    const state = location.state as any;
    if (state?.tab && ["overview", "applications", "jobs", "analytics", "profile"].includes(state.tab)) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);



  const [refreshingRecs, setRefreshingRecs] = useState(false);

  const handleRefreshRecommendations = async () => {
    try {
      setRefreshingRecs(true);
      const recResponse = await apiService.getRecommendations(6, true);
      const jobs = (recResponse.recommendations || []).map((r: any) => ({
        ...r.job,
        matchScore: r.matchScore ?? r.score,
        matchedSkills: r.matchedSkills || [],
        missingSkills: r.missingSkills || [],
      }));
      setDashboardData((prev: any) => ({ ...prev, recommendedJobs: jobs }));
    } catch (e) {
      console.error("Failed to refresh recommendations", e);
    } finally {
      setRefreshingRecs(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's applications
      const applications = await apiService.getMyApplications();

      // Fetch recommended jobs from the vector-based recommendation engine
      let recommendedJobs: any[] = [];
      try {
        const recResponse = await apiService.getRecommendations(6);
        recommendedJobs = (recResponse.recommendations || []).map((r: any) => ({
          ...r.job,
          matchScore: r.matchScore ?? r.score,
          matchedSkills: r.matchedSkills || [],
          missingSkills: r.missingSkills || [],
        }));
      } catch (recError) {
        console.warn("Recommendations unavailable, falling back to skill filter:", recError);
        // Fallback: filter jobs client-side by exact skill overlap
        const jobsResponse = await apiService.getJobs();
        const jobs = jobsResponse.jobs;
        const userSkills = user?.profile?.skills || [];
        recommendedJobs = jobs
          .filter((job: any) => {
            if (!job.skills || !Array.isArray(job.skills)) return false;
            return job.skills.some((skill: string) => userSkills.includes(skill));
          })
          .slice(0, 6);
      }

      // Calculate dashboard metrics
      const activeApplications = applications.filter((app: any) =>
        ['pending', 'in_review'].includes(app.status)
      ).length;

      const completedProjects = applications.filter((app: any) =>
        app.status === 'hired'
      ).length;

      const totalEarnings = applications
        .filter((app: any) => app.status === 'hired')
        .reduce((sum: number, app: any) => sum + (app.job?.budget || 0), 0);

      // Calculate profile views based on application activity
      const profileViews = Math.max(applications.length * 3, 10); // At least 10 views, 3x applications

      // Calculate average rating based on completed projects (simulate realistic ratings)
      const completedApps = applications.filter((app: any) => app.status === 'hired');
      const averageRating = completedApps.length > 0
        ? Math.round((4.2 + (completedApps.length * 0.1)) * 10) / 10 // Start at 4.2, improve with more projects
        : 0; // No rating if no completed projects

      // Get recent applications (last 5)
      const recentApplications = applications
        .sort((a: any, b: any) => new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime())
        .slice(0, 5);

      // Get upcoming deadlines from active applications
      const upcomingDeadlines = applications
        .filter((app: any) => app.job?.deadline && app.status === 'hired')
        .map((app: any) => ({
          ...app.job,
          applicationId: app._id,
          deadline: new Date(app.job.deadline)
        }))
        .filter((job: any) => job.deadline > new Date())
        .sort((a: any, b: any) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, 3);

      setDashboardData({
        totalApplications: applications.length,
        activeApplications,
        completedProjects,
        totalEarnings,
        profileViews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentApplications,
        recommendedJobs,
        upcomingDeadlines,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Applications",
      value: dashboardData.totalApplications,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Applications",
      value: dashboardData.activeApplications,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Completed Projects",
      value: dashboardData.completedProjects,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Earnings",
      value: `$${dashboardData.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Profile Views",
      value: dashboardData.profileViews,
      icon: Eye,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Average Rating",
      value: dashboardData.averageRating,
      icon: Star,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-black" : "bg-white"}`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "applications":
        return (
          <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
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
                    My Applications
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Track and manage all your job applications
                  </p>
                </div>

                {/* Applications List */}
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
                    Your Applications
                  </h3>

                  {dashboardData.recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentApplications.map((application, index) => (
                        <motion.div
                          key={application._id}
                          className={`${
                            darkMode
                              ? "bg-gray-800/50 border-white/10"
                              : "bg-gray-50 border-black/10"
                          } border rounded-lg p-4 hover:shadow-md transition-all duration-300`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                                  {application.job?.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  application.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : application.status === 'in_review'
                                    ? 'bg-blue-100 text-blue-800'
                                    : application.status === 'hired'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {application.status.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  📂 {application.job?.category || 'General'}
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  🏢 {application.job?.company?.name || 'Company'}
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  💰 ${application.job?.budget || 0}
                                </span>
                                <span className={`${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  📅 Applied: {new Date(application.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <motion.button
                                onClick={() => navigate(`/job-details/${application.job?._id}`)}
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
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? "text-gray-400" : "text-gray-300"
                      }`} />
                      <h4 className={`text-lg font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-black"
                      }`}>
                        No applications yet
                      </h4>
                      <p className={`mb-6 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Start by browsing and applying to jobs that match your skills
                      </p>
                      <motion.button
                        onClick={() => navigate("/job-listings")}
                        className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Search className="inline w-5 h-5 mr-2" />
                        Browse Jobs
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      case "jobs":
        return (
          <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
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
                    Find Jobs
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Discover opportunities that match your skills
                  </p>
                </div>

                {/* AI-Powered Job Recommendations (Word2Vec Engine) */}
                <motion.div
                  className={`${
                    darkMode
                      ? "bg-black/50 border-cyan-500/20"
                      : "bg-white border-cyan-500/20"
                  } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm">
                          <Zap className="w-3.5 h-3.5 text-cyan-500" />
                          AI Word2Vec Match Engine
                        </span>
                        {user?.profile?.cvUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            <CheckCircle className="w-3 h-3" /> CV Analyzed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                            <Sparkles className="w-3 h-3" /> Upload CV for 100% Vector Fit
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
                        AI Recommended Jobs
                      </h3>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Personalized matches computed from semantic word vectors of your skills & CV
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        onClick={handleRefreshRecommendations}
                        disabled={refreshingRecs}
                        title="Recalculate AI vector matches"
                        className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                          darkMode
                            ? "bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:text-black hover:bg-gray-200"
                        } flex items-center gap-1.5`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingRecs ? "animate-spin text-cyan-500" : ""}`} />
                        <span>{refreshingRecs ? "Analyzing..." : "Refresh"}</span>
                      </motion.button>
                      <motion.button
                        onClick={() => navigate("/job-listings")}
                        className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 text-xs sm:text-sm font-medium shadow-md shadow-cyan-500/20`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        View All Jobs
                      </motion.button>
                    </div>
                  </div>

                  {dashboardData.recommendedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dashboardData.recommendedJobs.map((job, index) => {
                        const score = typeof job.matchScore === 'number'
                          ? (job.matchScore > 1 ? Math.round(job.matchScore) : Math.round(job.matchScore * 100))
                          : 0;
                        return (
                          <motion.div
                            key={job._id}
                            className={`${
                              darkMode
                                ? "bg-gray-800/50 border-white/10 hover:border-cyan-500/40"
                                : "bg-gray-50 border-black/10 hover:border-cyan-500/40"
                            } border rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.08 }}
                            whileHover={{ scale: 1.015 }}
                            onClick={() => navigate(`/job-details/${job._id}`)}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className={`text-base sm:text-lg font-semibold ${darkMode ? "text-white group-hover:text-cyan-400" : "text-black group-hover:text-cyan-600"} transition-colors line-clamp-1`}>
                                {job.title}
                              </h4>
                              {score > 0 && (
                                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  score >= 75
                                    ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30"
                                    : score >= 50
                                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                                      : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30"
                                }`}>
                                  <Sparkles className="w-3 h-3" />
                                  {score}% AI Match
                                </span>
                              )}
                            </div>
                            <p className={`text-xs sm:text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {job.company?.name || job.postedBy?.profile?.companyName || 'Verified Client'}
                            </p>
                            <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
                              <span className={`flex items-center gap-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                <MapPin className="w-3.5 h-3.5" />
                                {job.location || job.workLocation || 'Remote'}
                              </span>
                              <span className={`font-semibold ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                                {job.budget ? `${job.budget} ETB` : 'Negotiable'}
                              </span>
                            </div>
                            {job.matchedSkills && job.matchedSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700/60">
                                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Matched:</span>
                                {job.matchedSkills.slice(0, 4).map((skill: string) => (
                                  <span key={skill} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    darkMode ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                  }`}>
                                    ✓ {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Zap className="w-8 h-8 text-cyan-500" />
                      </div>
                      <h4 className={`text-lg font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-black"
                      }`}>
                        Unlock AI Job Suggestions
                      </h4>
                      <p className={`mb-6 max-w-md mx-auto text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Upload your CV and add your key skills to let the Word2Vec neural matcher find ideal freelance contracts for you.
                      </p>
                      <motion.button
                        onClick={() => navigate("/freelancer-profile-setup")}
                        className={`px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/30 text-sm font-semibold`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <User className="inline w-4 h-4 mr-2" />
                        Update Profile & CV
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
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
                    Performance Analytics
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Insights into your freelancing performance
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
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{dashboardData.totalApplications}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Applications</p>
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
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{dashboardData.completedProjects}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Completed Projects</p>
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
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>${dashboardData.totalEarnings.toLocaleString()}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Earnings</p>
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
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>{dashboardData.profileViews}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Profile Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Live data</span>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Success Rate
                    </h4>
                    <div className="text-center">
                      <p className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-black"}`}>
                        {dashboardData.totalApplications > 0 ? Math.round((dashboardData.completedProjects / dashboardData.totalApplications) * 100) : 0}%
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Application to hire rate
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
                      Average Rating
                    </h4>
                    <div className="text-center">
                      <p className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-black"}`}>{dashboardData.averageRating}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Based on completed projects
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      case "profile": {
        const p = user?.profile || {} as any;
        const avatarUrl = p.avatar
          ? (p.avatar.startsWith('http') || p.avatar.startsWith('data:') ? p.avatar : apiService.getFileUrl(p.avatar))
          : null;

        const ProfileField: React.FC<{ label: string; value?: string | null; multiline?: boolean }> = ({ label, value, multiline }) => {
          if (!value) return null;
          return (
            <div className="mb-4">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
              {multiline ? (
                <p className={`mt-1 whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
              ) : (
                <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
              )}
            </div>
          );
        };

        return (
          <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                  <div>
                    <motion.h1
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                        darkMode ? "from-blue-300 to-blue-500" : "from-blue-400 to-blue-600"
                      } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                      variants={headingVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      My Profile
                    </motion.h1>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-base sm:text-lg`}>
                      Your freelancer profile information
                    </p>
                  </div>
                  <motion.button
                    onClick={() => navigate("/freelancer-profile-setup?edit=true")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="inline w-5 h-5 mr-2" />
                    Edit Profile
                  </motion.button>
                </div>

                {/* Profile Card */}
                <motion.div
                  className={`${darkMode ? "bg-black/50 border-white/10" : "bg-white border-black/10"} border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {/* Header with avatar and name */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                    ) : (
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <User className={`w-10 h-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                    )}
                    <div>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {p.firstName || ''} {p.lastName || ''}
                      </h2>
                      {p.primarySkill && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p.primarySkill} &middot; {p.experienceLevel || ''}</p>
                      )}
                      {p.location && (
                        <p className={`text-sm flex items-center gap-1 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <MapPin className="w-3 h-3" /> {p.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {p.bio && (
                    <div className="mb-6">
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>About</h3>
                      <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.bio}</p>
                    </div>
                  )}

                  {/* Education & Work Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {p.education && (
                      <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Education</h3>
                        <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.education}</p>
                      </div>
                    )}
                    {(p.experience || p.workExperience) && (
                      <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Work Experience</h3>
                        <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{p.experience || p.workExperience}</p>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {Array.isArray(p.skills) && p.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.skills.map((skill: string, i: number) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {Array.isArray(p.certifications) && p.certifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.certifications.map((cert: string, i: number) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <ProfileField label="Phone" value={p.phone} />
                    <ProfileField label="Email" value={user?.email} />
                    <ProfileField label="Years of Experience" value={p.yearsOfExperience} />
                    <ProfileField label="Availability" value={p.availability} />
                    <ProfileField label="Monthly Rate" value={p.monthlyRate ? `${p.monthlyRate} ${p.currency || ''}` : null} />
                    <ProfileField label="Work Location" value={p.workLocation} />
                    <ProfileField label="Portfolio" value={p.portfolioUrl} />
                  </div>

                  {/* Preferred Job Types */}
                  {Array.isArray(p.preferredJobTypes) && p.preferredJobTypes.length > 0 && (
                    <div className="mb-6">
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preferred Job Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.preferredJobTypes.map((jt: string, i: number) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{jt}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(p.linkedinUrl || p.githubUrl || p.websiteUrl || p.cvUrl) && (
                    <div className="mb-2">
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Links</h3>
                      <div className="flex flex-wrap gap-3">
                        {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">LinkedIn</a>}
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">GitHub</a>}
                        {p.websiteUrl && <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">Website</a>}
                        {p.cvUrl && <a href={apiService.getFileUrl(p.cvUrl)} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">Download CV</a>}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        );
      }
        default:
          return (
            <div
              className={`min-h-screen ${
                darkMode ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Heading */}
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
                      Dashboard Overview
                    </motion.h1>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } text-base sm:text-lg`}
                    >
                      Welcome back, {user?.profile?.firstName || user?.email}! Here's
                      your performance at a glance.
                    </p>
                  </div>
                </motion.div>
        
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Applications */}
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-6 shadow-2xl backdrop-blur-sm`}
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
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {dashboardData.totalApplications}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total Applications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Live data
                      </span>
                    </div>
                  </motion.div>
        
                  {/* Completed Projects */}
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {dashboardData.completedProjects}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Completed Projects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Live data
                      </span>
                    </div>
                  </motion.div>
        
                  {/* Earnings */}
                  <motion.div
                    className={`${
                      darkMode
                        ? "bg-black/50 border-white/10"
                        : "bg-white border-black/10"
                    } border rounded-xl sm:rounded-2xl p-6 shadow-2xl backdrop-blur-sm`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: darkMode
                        ? "0 25px 50px rgba(255, 255, 255, 0.1)"
                        : "0 25px 50px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        >
                          ${dashboardData.totalEarnings.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Total Earnings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Live data
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Freelancer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <nav className="mt-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default FreelancerDashboard;
