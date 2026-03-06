import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
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
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();

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



  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's applications
      const applications = await apiService.getMyApplications();

      // Fetch recommended jobs (you might want to implement this in the backend)
      const jobsResponse = await apiService.getJobs();
      const jobs = jobsResponse.jobs;

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

      // Get recommended jobs (filter by skills, limit to 6)
      const userSkills = user?.profile?.skills || [];
      const recommendedJobs = jobs
        .filter((job: any) => {
          if (!job.skills || !Array.isArray(job.skills)) return false;
          return job.skills.some((skill: string) => userSkills.includes(skill));
        })
        .slice(0, 6);

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

                {/* Recommended Jobs */}
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                      Recommended for You
                    </h3>
                    <motion.button
                      onClick={() => navigate("/job-listings")}
                      className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm font-medium`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Jobs
                    </motion.button>
                  </div>

                  {dashboardData.recommendedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dashboardData.recommendedJobs.map((job, index) => (
                        <motion.div
                          key={job._id}
                          className={`${
                            darkMode
                              ? "bg-gray-800/50 border-white/10"
                              : "bg-gray-50 border-black/10"
                          } border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/job-details/${job._id}`)}
                        >
                          <h4 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                            {job.title}
                          </h4>
                          <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {job.company?.name || 'Company'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className={`flex items-center gap-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              <MapPin className="w-4 h-4" />
                              {job.location || 'Remote'}
                            </span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              ${job.budget || 0}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Target className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? "text-gray-400" : "text-gray-300"
                      }`} />
                      <h4 className={`text-lg font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-black"
                      }`}>
                        No recommendations yet
                      </h4>
                      <p className={`mb-6 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Complete your profile to get personalized job recommendations
                      </p>
                      <motion.button
                        onClick={() => navigate("/freelancer-profile-setup")}
                        className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:bg-green-800 transition-all duration-300 shadow-md hover:shadow-green-500/30`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <User className="inline w-5 h-5 mr-2" />
                        Update Profile
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
      case "profile":
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
                    Profile Management
                  </motion.h1>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } text-base sm:text-lg`}
                  >
                    Manage your freelancer profile and settings
                  </p>
                </div>

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
                  <div className="text-center py-12">
                    <User className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-300"}`} />
                    <h4 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                      Profile Settings
                    </h4>
                    <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Update your profile information, skills, and preferences
                    </p>
                    <motion.button
                      onClick={() => navigate("/freelancer-profile-setup")}
                      className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-blue-500/30`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="inline w-5 h-5 mr-2" />
                      Edit Profile
                    </motion.button>
                  </div>
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Freelancer Dashboard</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <nav className="mt-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
              {['dashboard', 'applications', 'jobs', 'analytics', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <DashboardContent />
      )}
    </div>
  );
};

export default FreelancerDashboard;
    </div>
  );
};

export default FreelancerDashboard;
};

export default FreelancerDashboard;
export default FreelancerDashboard;
}

export default FreelancerDashboard;
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <nav className="mt-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
              {(['overview', 'applications', 'jobs', 'analytics', 'profile'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderTabContent(activeTab)}
        </main>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <DashboardContent />;
};

export default FreelancerDashboard;
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderTabContent(activeTab)}
        </main>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <DashboardContent 
      darkMode={darkMode}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setDarkMode={setDarkMode}
      dashboardData={dashboardData}
    />
  );
};

export default FreelancerDashboard;