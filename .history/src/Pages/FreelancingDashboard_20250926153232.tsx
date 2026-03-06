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
    | "overview"
    | "myApplications"
    | "myJobs"
    | "analytics"
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
      setAnalyticsData((prev) => ({ ...prev, totalJobs: jobs.length, totalApplications: apps.length }));
    } catch (error) {
      setAnalyticsData((prev) => ({ ...prev, totalJobs: 0, totalApplications: 0 }));
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ...UI rendering logic similar to HiringDashboard, with tab navigation and content...
  return (
    <div>
      {/* Navigation Tabs */}
      <motion.div>
        <div>
          <div>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "active" : ""}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <div>Overview Content</div>}
        {activeTab === "myApplications" && <div>My Applications Content</div>}
        {activeTab === "myJobs" && <div>My Jobs Content</div>}
        {activeTab === "analytics" && <div>Analytics Content</div>}
        {activeTab === "profile" && <div>Profile Content</div>}
      </div>
    </div>
  );
};

export default FreelancingDashboard;
