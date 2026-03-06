import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import {
  Briefcase,
  Users,
  BarChart3,
  User,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Target,
  Award,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  FileText,
} from "lucide-react";
import FreelancerApplicationsManagement from "./FreelancerApplicationsManagement";
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

const FreelancingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "browseJobs" | "profile" | "myApplications" | "messages"
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
    profileViews: 0,
    averageRating: 0,
    completedProjects: 0,
    earnings: 0,
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
    skillDemand: [] as Array<{
      skill: string;
      demand: number;
      avgSalary: number;
    }>,
    locationStats: [] as Array<{
      location: string;
      opportunities: number;
      avgSalary: number;
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
  const [freelancerAvatar, setFreelancerAvatar] = useState<string | null>(null);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "browseJobs" as const, label: "Browse Jobs", icon: Briefcase },
    { id: "myApplications" as const, label: "My Applications", icon: FileText },
    { id: "messages" as const, label: "Messages", icon: MessageSquare, navigate: "/chat" },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  // If redirected with tab state, default to that tab
  useEffect(() => {
    const state = location.state as any;
    if (
      state?.tab &&
      ["overview", "browseJobs", "myApplications"].includes(state.tab)
    ) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  // Fetch analytics and profile data once when the user is available
  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
      fetchProfile();
    }
  }, [user]);

  // Fetch jobs data when jobs tab is selected
  useEffect(() => {
    if (activeTab === "browseJobs" && user) {
      fetchJobs();
    }
  }, [activeTab, user]);



  // Fetch profile data when profile tab or overview tab is selected
  useEffect(() => {
    if ((activeTab === "profile" || activeTab === "overview") && user) {
      fetchProfile();
      fetchApplications(); // Also fetch applications for overview tab
    }
  }, [activeTab, user]);

  // Redirect to freelancer profile when profile tab is selected
  useEffect(() => {
    if (activeTab === "profile") {
      navigate("/freelancer-profile-setup");
    }
  }, [activeTab, navigate]);

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

      // Set freelancer avatar for tab display
      if (userData.profile?.avatar) {
        if (userData.profile.avatar.startsWith('http') || userData.profile.avatar.startsWith('data:')) {
          setFreelancerAvatar(userData.profile.avatar);
        } else {
          setFreelancerAvatar(apiService.getFileUrl(userData.profile.avatar));
        }
      } else {
        setFreelancerAvatar(null);
      }
    } catch (error) {
      setProfile(null);
      setFreelancerAvatar(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setAnalyticsLoading(true);
    try {
      // Fetch jobs and applications
      const { jobs } = await apiService.getJobs();
      const apps = await apiService.getMyApplications();

      // Calculate analytics
      const totalJobs = jobs.length;
      const totalApplications = apps.length;

      // Count applications by status
      const statusCounts = apps.reduce((acc, app) => {
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

      // Calculate average days to hire (mock calculation since we don't have updatedAt)
      const avgDaysToHire = hiredCount > 0 ? Math.floor(Math.random() * 30) + 7 : 0; // Mock 7-37 days

      // Calculate category performance
      const categoryStats = jobs.reduce((acc, job) => {
        const category = job.category || "Other";
        if (!acc[category]) {
          acc[category] = { jobs: 0, applications: 0, hired: 0 };
        }
        acc[category].jobs += 1;
        return acc;
      }, {} as Record<string, { jobs: number; applications: number; hired: number }>);

      // Add application counts to categories (mock since job is string)
      apps.forEach((app) => {
        const category = "General"; // Mock category since job is string
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

      // Calculate monthly trends (mock data since we don't have proper dates)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString("en-US", {
          month: "short",
        });

        // Mock monthly data
        const monthApplications = Math.floor(Math.random() * totalApplications / 6);
        const monthHired = Math.floor(monthApplications * (successRate / 100));

        monthlyTrends.push({
          month: monthName,
          applications: monthApplications,
          hired: monthHired,
        });
      }

      // Mock response time
      const responseTime = Math.floor(Math.random() * 48) + 1; // 1-48 hours

      // Calculate total job views
      const jobViews = jobs.reduce(
        (sum, job) => sum + ((job as any).views || 0),
        0
      );

      // Mock additional freelancer-specific metrics
      const profileViews = Math.floor(Math.random() * 500) + 100;
      const averageRating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
      const completedProjects = hiredCount;
      const earnings = completedProjects * (Math.random() * 5000 + 1000); // Mock earnings

      // Mock skill demand data
      const skillDemand = [
        { skill: "JavaScript", demand: Math.floor(Math.random() * 50) + 10, avgSalary: 5000 },
        { skill: "React", demand: Math.floor(Math.random() * 40) + 8, avgSalary: 5500 },
        { skill: "Python", demand: Math.floor(Math.random() * 35) + 7, avgSalary: 6000 },
        { skill: "Node.js", demand: Math.floor(Math.random() * 30) + 6, avgSalary: 5200 },
        { skill: "TypeScript", demand: Math.floor(Math.random() * 25) + 5, avgSalary: 5800 },
      ];

      // Mock location stats
      const locationStatsArray = [
        { location: "Remote", opportunities: Math.floor(Math.random() * 100) + 20, avgSalary: 5500 },
        { location: "New York", opportunities: Math.floor(Math.random() * 80) + 15, avgSalary: 6500 },
        { location: "San Francisco", opportunities: Math.floor(Math.random() * 70) + 12, avgSalary: 7000 },
        { location: "London", opportunities: Math.floor(Math.random() * 60) + 10, avgSalary: 6000 },
        { location: "Berlin", opportunities: Math.floor(Math.random() * 50) + 8, avgSalary: 5800 },
      ];

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
        profileViews,
        averageRating: parseFloat(averageRating),
        completedProjects,
        earnings: Math.round(earnings),
        categoryPerformance,
        monthlyTrends,
        skillDemand,
        locationStats: locationStatsArray,
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
        profileViews: 0,
        averageRating: 0,
        completedProjects: 0,
        earnings: 0,
        categoryPerformance: [],
        monthlyTrends: [],
        skillDemand: [],
        locationStats: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ...UI rendering logic similar to HiringDashboard, with tab navigation and content...
  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"
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
        className={`${darkMode
          ? "bg-black/50 border-white/10"
          : "bg-white/80 border-black/10"
          } border-b sticky top-0 z-10 backdrop-blur-sm shadow-2xl`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex items-center gap-2 sm:gap-8 overflow-x-auto flex-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "browseJobs") {
                    navigate("/job-listings");
                  } else if ((tab as any).navigate) {
                    navigate((tab as any).navigate);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium transition-all duration-300 font-inter tracking-tight text-sm sm:text-base whitespace-nowrap ${activeTab === tab.id
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
                {tab.id === "profile" && freelancerAvatar ? (
                  <img
                    src={freelancerAvatar}
                    alt="Profile"
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <tab.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id
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
              </motion.button>
            ))}
            </div>
            <div className="flex-shrink-0 ml-4">
              <FloatingDarkModeToggle />
            </div>
          </div>
         </div>
      </motion.div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 sm:mb-8">
              <motion.h1
                className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${darkMode
                  ? "from-blue-300 to-blue-500"
                  : "from-blue-400 to-blue-600"
                  } bg-clip-text text-transparent mb-2 font-inter tracking-tight leading-tight`}
                variants={headingVariants}
                initial="hidden"
                animate="visible"
              >
                Freelance Dashboard
              </motion.h1>
              <p
                className={`${darkMode ? "text-gray-400" : "text-gray-600"
                  } text-base sm:text-lg`}
              >
                Track your applications, discover opportunities, and grow your freelance career
              </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
              <motion.div
                className={`${darkMode
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
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {analyticsData.totalApplications}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Applications
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Live data
                  </span>
                </div>
              </motion.div>

              <motion.div
                className={`${darkMode
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
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {analyticsData.totalJobs}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Jobs Available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Live data
                  </span>
                </div>
              </motion.div>

              <motion.div
                className={`${darkMode
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
                    <p
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {analyticsData.hiredCount}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Jobs Won
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Live data
                  </span>
                </div>
              </motion.div>

              <motion.div
                className={`${darkMode
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
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {analyticsData.averageRating}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Rating
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Client reviews
                  </span>
                </div>
              </motion.div>

              {/* Freelancer Status Card */}
              <motion.div
                className={`${darkMode
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.availability === 'Available'
                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                    : profile?.availability === 'Busy'
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-700'
                      : profile?.availability === 'Part-time'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700'
                    }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {profile?.availability || 'Not Set'}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Availability Status
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${profile?.availability === 'Available'
                    ? 'bg-green-500'
                    : profile?.availability === 'Busy'
                      ? 'bg-yellow-500'
                      : profile?.availability === 'Part-time'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}></div>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Current status
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              className={`${darkMode
                ? "bg-black/50 border-white/10"
                : "bg-white border-black/10"
                } border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"
                  }`}
              >
                Recent Activity
              </h3>
              <div className="space-y-3">
                {applications.slice(0, 3).map((app, index) => (
                  <div
                    key={app._id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-50"
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${darkMode ? "text-white" : "text-black"
                          }`}
                      >
                        Applied to {app.jobTitle || "a job"}
                      </p>
                      <p
                        className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                      >
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.status === "hired"
                        ? "bg-green-500/20 text-green-500 border-green-500/20"
                        : app.status === "rejected"
                          ? "bg-red-500/20 text-red-500 border-red-500/20"
                          : app.status === "in_review"
                            ? "bg-blue-500/20 text-blue-500 border-blue-500/20"
                            : "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
                        }`}
                    >
                      {app.status ? app.status.replace("_", " ") : "pending"}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div
                    className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    No recent activity. Start applying to jobs!
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}



        {activeTab === "browseJobs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-4">Browse Jobs</h2>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found. Check back later for new opportunities!
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job._id || idx}
                    className={`border rounded-lg p-4 shadow-md ${darkMode
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
                            className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === "active"
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
                            👥 {job.applicationsCount || 0} applications
                          </span>
                          <span className="text-gray-500">
                            👁️ {job.views || 0} views
                          </span>
                          <span className="text-gray-500">
                            📅 Posted{" "}
                            {job.createdAt
                              ? new Date(
                                job.createdAt
                              ).toLocaleDateString()
                              : "N/A"}
                          </span>
                          {job.deadline && (
                            <span className="text-gray-500">
                              ⏰ Deadline{" "}
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-gray-600 line-clamp-2">
                          {job.description?.slice(0, 120) || "No description."}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          onClick={() => navigate(`/job/${job._id}`)}
                          className={`px-4 py-2 border ${darkMode
                            ? "border-white/20 hover:bg-white/10"
                            : "border-black/20 hover:bg-gray-50"
                            } rounded-lg transition-all duration-300 text-sm font-medium`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          onClick={() => navigate(`/job-details/${job._id}`)}
                          className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm font-medium`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Apply Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {activeTab === "myApplications" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FreelancerApplicationsManagement />
          </motion.div>
        )}

        {activeTab === "profile" && null}
      </div>
    </div>
  );
};

export default FreelancingDashboard;
