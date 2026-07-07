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
  Sparkles,
  Eye,
  Activity,
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

  // Get active tab from URL
  const getActiveTabFromPath = (): "overview" | "browseJobs" | "profile" | "myApplications" | "messages" => {
    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    
    switch (lastPart) {
      case "overview": return "overview";
      case "browse-jobs": return "browseJobs";
      case "my-applications": return "myApplications";
      case "messages": return "messages";
      default: return "overview";
    }
  };

  const activeTab = getActiveTabFromPath();

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
    { id: "overview" as const, label: "Overview", icon: BarChart3, path: "overview" },
    { id: "browseJobs" as const, label: "Browse Jobs", icon: Briefcase, navigate: "/job-listings" },
    { id: "myApplications" as const, label: "My Applications", icon: FileText, navigate: "/my-applications" },
    { id: "messages" as const, label: "Messages", icon: MessageSquare, navigate: "/chat" },
    { id: "profile" as const, label: "Profile", icon: User, navigate: "/freelancer-profile-setup" },
  ];

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
        { location: "Addis Ababa", opportunities: Math.floor(Math.random() * 100) + 30, avgSalary: 4500 },
        { location: "Dire Dawa", opportunities: Math.floor(Math.random() * 60) + 15, avgSalary: 3500 },
        { location: "Mekelle", opportunities: Math.floor(Math.random() * 50) + 10, avgSalary: 3200 },
        { location: "Gondar", opportunities: Math.floor(Math.random() * 40) + 8, avgSalary: 3000 },
        { location: "Hawassa", opportunities: Math.floor(Math.random() * 30) + 5, avgSalary: 2800 },
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
      `}      </style>

      {/* Animated Background Blobs */}
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
                  if ((tab as any).navigate) {
                    navigate((tab as any).navigate);
                  } else if ((tab as any).path) {
                    navigate(`/dashboard/freelancer/${(tab as any).path}`);
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
                {tab.id === "profile" && freelancerAvatar ? (
                  <img
                    src={freelancerAvatar}
                    alt="Profile"
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-cyan-500/30"
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
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
              </motion.button>
            ))}
            </div>
            <div className="flex-shrink-0 ml-2">
              <FloatingDarkModeToggle />
            </div>
          </div>
         </div>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight mb-2"
                variants={headingVariants}
                initial="hidden"
                animate="visible"
              >
                <span className="cyan-gradient-text animate-shimmer">Freelance Dashboard</span>
                <Sparkles className="inline-block w-6 h-6 sm:w-8 sm:h-8 ml-2 md:ml-3 text-cyan-400 animate-float" />
              </motion.h1>
              <p className={`text-base sm:text-lg font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Track your applications, discover opportunities, and grow your freelance career
              </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-8">
              {[
                { label: "Applications", value: analyticsData.totalApplications, icon: Users, color: "from-cyan-500 to-blue-600", glow: "rgba(6,242,242,0.3)" },
                { label: "Jobs Available", value: analyticsData.totalJobs, icon: Briefcase, color: "from-emerald-500 to-teal-700", glow: "rgba(52,211,153,0.3)" },
                { label: "Jobs Won", value: analyticsData.hiredCount, icon: CheckCircle, color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.3)" },
                { label: "Rating", value: analyticsData.averageRating, icon: Star, color: "from-amber-400 to-orange-500", glow: "rgba(251,191,36,0.3)" },
                { label: "Availability", value: profile?.availability || 'Not Set', icon: User, color: profile?.availability === 'Available' ? "from-green-400 to-emerald-600" : profile?.availability === 'Busy' ? "from-yellow-500 to-orange-600" : "from-gray-400 to-gray-600", glow: "rgba(74,222,128,0.3)" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className={`group relative rounded-2xl p-5 glass-card transition-all duration-500 ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
                  whileHover={{ scale: 1.03, y: -4 }}
                  style={darkMode ? { boxShadow: `0 0 30px ${card.glow}` } : {}}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <card.icon className={`w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`} />
                    </div>
                    <div className="relative z-10">
                      <p className={`text-2xl sm:text-3xl font-bold font-display mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {card.value}
                      </p>
                      <p className={`text-sm font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {card.label}
                      </p>
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div
              className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Recent Activity
              </h3>
              <div className="space-y-3 custom-scrollbar max-h-80 overflow-y-auto">
                {applications.slice(0, 5).map((app, index) => (
                  <div
                    key={app._id}
                    className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? "bg-white/5" : "bg-gray-50/80"}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      app.status === "hired" ? "bg-emerald-400" :
                      app.status === "rejected" ? "bg-red-400" :
                      app.status === "in_review" ? "bg-cyan-400" :
                      "bg-amber-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium font-body ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Applied to {app.jobTitle || "a job"}
                      </p>
                      <p className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      app.status === "hired"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : app.status === "rejected"
                          ? "bg-red-500/15 text-red-400 border-red-500/20"
                          : app.status === "in_review"
                            ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/20"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                    }`}>
                      {app.status ? app.status.replace("_", " ") : "pending"}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className={`text-center py-8 font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    No recent activity. Start applying to jobs!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skill Demand & Location Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              {/* Skill Demand */}
              <motion.div
                className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <TrendingUp className="inline w-5 h-5 mr-2 text-cyan-400" />
                  Skill Demand
                </h3>
                <div className="space-y-3">
                  {analyticsData.skillDemand.map((skill, i) => (
                    <div key={skill.skill}>
                      <div className="flex justify-between text-sm font-body mb-1">
                        <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{skill.skill}</span>
                        <span className="text-cyan-400 font-semibold">{skill.demand} openings</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? "bg-white/5" : "bg-gray-100"}`}>
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, skill.demand)}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Location Stats */}
              <motion.div
                className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <MapPin className="inline w-5 h-5 mr-2 text-cyan-400" />
                  Top Locations
                </h3>
                <div className="space-y-3">
                  {analyticsData.locationStats.map((loc, i) => (
                    <div key={loc.location} className="flex items-center justify-between p-3 rounded-xl glass-card">
                      <div>
                        <p className={`text-sm font-medium font-body ${darkMode ? "text-white" : "text-gray-900"}`}>{loc.location}</p>
                        <p className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{loc.opportunities} opportunities</p>
                      </div>
                      <span className="text-cyan-400 font-semibold text-sm">ETB {loc.avgSalary.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Performance Overview */}
            <motion.div
              className={`rounded-2xl p-5 glass-card mt-5 ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className={`text-lg font-semibold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <Activity className="inline w-5 h-5 mr-2 text-cyan-400" />
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Profile Views", value: analyticsData.profileViews, icon: Eye, color: "from-cyan-500 to-blue-600" },
                  { label: "Completed", value: analyticsData.completedProjects, icon: CheckCircle, color: "from-emerald-500 to-teal-700" },
                  { label: "Success Rate", value: `${analyticsData.successRate}%`, icon: TrendingUp, color: "from-violet-500 to-purple-600" },
                  { label: "Earnings", value: `$${(analyticsData.earnings / 1000).toFixed(1)}k`, icon: Award, color: "from-amber-400 to-orange-500" },
                ].map((perf, i) => (
                  <div key={perf.label} className={`p-4 rounded-xl glass-card ${darkMode ? "" : "bg-white/50"}`}>
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${perf.color} flex items-center justify-center mb-2`}>
                      <perf.icon className={`w-4 h-4 ${darkMode ? "text-white" : "text-gray-900"}`} />
                    </div>
                    <p className={`text-xl font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>{perf.value}</p>
                    <p className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{perf.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}


        {activeTab === "browseJobs" && (
          <motion.div
            className={`rounded-2xl p-5 glass-card ${darkMode ? "" : "bg-white/70 border-black/10 shadow-sm shadow-black/5"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-2xl font-bold font-display mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <Briefcase className="inline w-6 h-6 mr-2 text-cyan-400" />
              Browse Jobs
            </h2>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className={`ml-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                No jobs found. Check back later for new opportunities!
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job._id || idx}
                    className={`rounded-xl p-4 glass-card ${darkMode ? "" : "bg-white/50 border-black/10 shadow-sm shadow-black/5"}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * idx }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`text-lg font-semibold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>{job.title}</h4>
                          <span
                            className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${job.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                              : job.status === "expired"
                                ? "bg-red-500/15 text-red-400 border-red-500/20"
                                : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                              }`}
                          >
                            {job.status || "active"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-body">
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            📂 {job.category || "General"}
                          </span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            👥 {job.applicationsCount || 0} applications
                          </span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            👁️ {job.views || 0} views
                          </span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            📅 Posted{" "}
                            {job.createdAt
                              ? new Date(
                                job.createdAt
                              ).toLocaleDateString()
                              : "N/A"}
                          </span>
                          {job.deadline && (
                            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                              ⏰ Deadline{" "}
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className={`mt-2 font-body ${darkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                          {job.description?.slice(0, 120) || "No description."}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          onClick={() => { window.location.href = `/job-details/${job._id}`; }}
                          className={`px-4 py-2 border rounded-lg transition-all duration-300 text-sm font-medium font-body ${darkMode
                            ? "border-cyan-500/20 text-gray-300 hover:bg-white/5"
                            : "border-black/10 text-gray-600 hover:bg-gray-50"
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          onClick={() => { window.location.href = `/job-details/${job._id}`; }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg transition-all duration-300 text-sm font-medium font-body"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Apply for this Job
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}


        {activeTab === "profile" && null}
      </div>
    </div>
  );
};

export default FreelancingDashboard;
