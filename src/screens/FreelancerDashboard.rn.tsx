/**
 * React Native FreelancerDashboard Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  BackHandler,
} from "react-native";
import PagerView from "../components/PagerViewWrapper";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";

type TabType = "overview" | "myApplications" | "myJobs" | "analytics" | "profile" | "messages";

interface AnalyticsData {
  totalJobs: number;
  totalApplications: number;
  hiredCount: number;
  pendingCount: number;
  rejectedCount: number;
  inReviewCount: number;
  avgDaysToHire: number;
  responseTime: number;
  jobViews: number;
  successRate: number;
  categoryPerformance: Array<{
    category: string;
    applications: number;
    conversion: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    applications: number;
    hired: number;
  }>;
}

const FreelancerDashboard: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();

  const routeParams = (route.params as any) || {};
  const initialTab = routeParams.tab || "overview";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);
  const pagerRef = React.useRef<any>(null);

  const handleTabPress = (tabId: TabType, index: number) => {
    setActiveTab(tabId);
    pagerRef.current?.setPage(index);

    if (tabId === "messages") {
      (navigation as any).navigate("FreelancerMessages");
    } else if (tabId === "profile") {
      // Profile is now a tab, no navigation needed unless explicitly wanted
    }
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    const tabIds: TabType[] = ["overview", "myApplications", "myJobs", "messages", "profile"];
    if (tabIds[index]) {
      setActiveTab(tabIds[index]);
    }
  };

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
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

  useEffect(() => {
    if (user) {
      if (activeTab === "analytics" || activeTab === "overview") {
        fetchAnalyticsData();
        fetchProfile();
      }
      if (activeTab === "myJobs") {
        fetchJobs();
      }
      if (activeTab === "myApplications") {
        fetchApplications();
      }
      if (activeTab === "profile") {
        fetchProfile();
      }
    }
  }, [activeTab, user]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const result = await apiService.getJobs({ limit: 50 });
      setJobs(result.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    setApplicationsLoading(true);
    try {
      const apps = await apiService.getApplications();
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const userData = await apiService.getCurrentUser();
      setProfile(userData?.profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle navigation to messages page with freelancerId
  useEffect(() => {
    const freelancerId = routeParams.freelancerId;
    if (freelancerId) {
      (navigation as any).navigate("FreelancerMessages", { freelancerId });
      setActiveTab("overview");
    }
  }, [routeParams.freelancerId]);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const result = await apiService.getJobs({ limit: 100 });
      const apps = await apiService.getApplications();
      const allJobs = result.jobs || [];
      const allApplications = apps || [];

      // Calculate analytics
      const hiredApps = allApplications.filter((app: any) => app.status === "hired");
      const pendingApps = allApplications.filter((app: any) => app.status === "pending");
      const rejectedApps = allApplications.filter((app: any) => app.status === "rejected");
      const inReviewApps = allApplications.filter((app: any) => app.status === "in_review");

      const successRate = allApplications.length > 0
        ? Math.round((hiredApps.length / allApplications.length) * 100)
        : 0;

      setAnalyticsData((prev) => ({
        ...prev,
        totalJobs: allJobs.length,
        totalApplications: allApplications.length,
        hiredCount: hiredApps.length,
        pendingCount: pendingApps.length,
        rejectedCount: rejectedApps.length,
        inReviewCount: inReviewApps.length,
        successRate,
      }));
    } finally {
      setAnalyticsLoading(false);
    }
  };



  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: "stats-chart" },
    { id: "myApplications" as TabType, label: "My Applications", icon: "people" },
    { id: "myJobs" as TabType, label: "Browse Jobs", icon: "briefcase" },
    { id: "messages" as TabType, label: "Messages", icon: "chatbubbles" },
    { id: "profile" as TabType, label: "Profile", icon: "person" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Welcome, {user?.profile?.firstName || user?.email || "Freelancer"}!
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your freelance journey starts here. Track your applications, jobs, and performance all in one place.
              </Text>
            </View>

            {/* Analytics Cards */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#06b6d4" }]}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalApplications}</Text>
                <Text style={styles.metricLabel}>Applications</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#22c55e" }]}>
                  <Ionicons name="briefcase" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalJobs}</Text>
                <Text style={styles.metricLabel}>Jobs Available</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#a855f7" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.hiredCount}</Text>
                <Text style={styles.metricLabel}>Jobs Won</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#f59e0b" }]}>
                  <Ionicons name="stats-chart" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.successRate}%</Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
            </View>

            {/* Application Status Summary */}
            {analyticsData.totalApplications > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application Status</Text>
                <View style={styles.statusSummaryGrid}>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="hourglass" size={20} color="#f59e0b" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.pendingCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Pending</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="eye" size={20} color="#3b82f6" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.inReviewCount}</Text>
                    <Text style={styles.statusSummaryLabel}>In Review</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.hiredCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Hired</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.rejectedCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Rejected</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Profile Completion Status */}
            <View style={styles.section}>
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="person-circle" size={24} color="#06b6d4" />
                  <Text style={styles.infoCardTitle}>Profile Status</Text>
                </View>
                {(() => {
                  const calculateCompletion = () => {
                    if (!profile) return { percentage: 0, status: "Incomplete" };

                    const step1Fields = ['firstName', 'lastName', 'email', 'location'];
                    const step2Fields = [
                      'bio',
                      'education',
                      'workExperience',
                      'experienceLevel',
                      'yearsOfExperience'
                    ];

                    let completed = 0;
                    const total = step1Fields.length + step2Fields.length + 2; // +2 for skills and cv

                    step1Fields.forEach(f => {
                      if (profile[f]) completed++;
                    });

                    step2Fields.forEach(f => {
                      if (profile[f]) completed++;
                    });

                    if (profile.skills && profile.skills.length > 0) completed++;
                    if (profile.cvUrl) completed++;

                    const percentage = Math.round((completed / total) * 100);

                    let status = "Getting Started";
                    if (percentage >= 100) status = "Completed";
                    else if (percentage >= 80) status = "Almost Done";
                    else if (percentage >= 50) status = "Halfway There";

                    return { percentage, status };
                  };

                  const { percentage, status } = calculateCompletion();
                  const isProfileCreated = !!profile;

                  return isProfileCreated ? (
                    <>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{percentage}% Complete</Text>
                      </View>
                      <Text style={styles.infoCardText}>
                        Status: <Text style={{ fontWeight: 'bold' }}>{status}</Text>.
                        {percentage < 100
                          ? " Complete your profile to increase visibility."
                          : " Your profile is looking great!"}
                      </Text>
                      {percentage < 100 && (
                        <TouchableOpacity
                          style={styles.infoCardButton}
                          onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                        >
                          <Text style={styles.infoCardButtonText}>Finish Profile</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoCardText}>
                        Complete your profile to increase your chances of getting hired.
                      </Text>
                      <TouchableOpacity
                        style={styles.infoCardButton}
                        onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                      >
                        <Text style={styles.infoCardButtonText}>Complete Profile</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </View>
            </View>

            {/* Tips & Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tips for Success</Text>
              <View style={styles.tipsContainer}>
                <View style={styles.tipCard}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Optimize Your Profile</Text>
                    <Text style={styles.tipText}>
                      Add a professional photo, detailed bio, and showcase your best work samples.
                    </Text>
                  </View>
                </View>
                <View style={styles.tipCard}>
                  <Ionicons name="trending-up" size={20} color="#22c55e" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Apply Strategically</Text>
                    <Text style={styles.tipText}>
                      Focus on jobs that match your skills and write personalized cover letters.
                    </Text>
                  </View>
                </View>
                <View style={styles.tipCard}>
                  <Ionicons name="time" size={20} color="#06b6d4" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Respond Quickly</Text>
                    <Text style={styles.tipText}>
                      Quick responses to client messages can significantly improve your chances.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

          </ScrollView>
        );

      case "myApplications":
        return (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Applications</Text>
            </View>

            {applicationsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading your applications...</Text>
              </View>
            ) : applications.length > 0 ? (
              <>
                {applications.map((app: any) => (
                  <View key={app._id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.applicationTitle}>{app.job?.title || "Job Title"}</Text>
                      <View style={[
                        styles.statusBadge,
                        app.status === "hired" ? styles.statusHired :
                          app.status === "rejected" ? styles.statusRejected :
                            app.status === "in_review" ? styles.statusInReview :
                              styles.statusPending
                      ]}>
                        <Text style={styles.statusText}>
                          {app.status === "in_review" ? "In Review" :
                            app.status === "pending" ? "Pending" :
                              app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Pending"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.applicationInfo}>
                      <View style={styles.applicationInfoItem}>
                        <Ionicons name="folder" size={16} color="#06b6d4" />
                        <Text style={styles.applicationInfoText}>{app.job?.category || "General"}</Text>
                      </View>
                      <View style={styles.applicationInfoItem}>
                        <Ionicons name="calendar" size={16} color="#06b6d4" />
                        <Text style={styles.applicationInfoText}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewJobButton}
                      onPress={() => (navigation as any).navigate("JobDetails", { jobId: app.job?._id })}
                    >
                      <Text style={styles.viewJobButtonText}>View Job Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No applications yet</Text>
                <Text style={styles.emptyStateText}>
                  Start applying to jobs to see your applications here
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => setActiveTab("myJobs")}
                >
                  <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        );

      case "myJobs":
        return (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Jobs</Text>
              <Text style={styles.sectionSubtitle}>
                Find opportunities that match your skills
              </Text>
            </View>

            {jobsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading jobs...</Text>
              </View>
            ) : jobs.length > 0 ? (
              <>
                {jobs.map((job: any) => (
                  <View key={job._id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        job.status === "active" ? styles.statusActive : styles.statusInactive
                      ]}>
                        <Text style={styles.statusText}>{job.status || "active"}</Text>
                      </View>
                    </View>
                    <View style={styles.jobInfo}>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="folder" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>{job.category || "General"}</Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="calendar" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobDescription} numberOfLines={2}>
                      {job.description || "No description available."}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewJobButton}
                      onPress={() => (navigation as any).navigate("JobDetails", { jobId: job._id })}
                    >
                      <Text style={styles.viewJobButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No jobs found</Text>
                <Text style={styles.emptyStateText}>
                  Explore and apply to jobs to get started
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => (navigation as any).navigate("JobListings")}
                >
                  <Text style={styles.browseJobsButtonText}>Browse All Jobs</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        );

      case "profile":
        return (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.sectionHeaderRow}>
              <TouchableOpacity
                style={styles.sectionBackButton}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={20} color={darkMode ? "#ffffff" : "#111827"} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Profile</Text>
            </View>

            {profileLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : !profile ? (
              <View style={styles.emptyState}>
                <Ionicons name="person" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No profile data found</Text>
                <Text style={styles.emptyStateText}>
                  Complete your profile to get started
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                >
                  <Text style={styles.browseJobsButtonText}>Setup Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.profileCard}>
                <Text style={styles.profileName}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                {profile.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
                {profile.skills && profile.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {profile.skills.map((skill: string, idx: number) => (
                      <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {profile.location && (
                  <Text style={styles.profileDetail}>Location: {profile.location}</Text>
                )}
                {profile.experienceLevel && (
                  <Text style={styles.profileDetail}>
                    Experience: {profile.experienceLevel}
                    {profile.yearsOfExperience && ` (${profile.yearsOfExperience} years)`}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                >
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const handleBackPress = useCallback(() => {
    (navigation as any).navigate("MainSwipeableTabs");
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => handleBackPress();
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const bgColor = darkMode ? "#000000" : "#ffffff";

      // Set background on html, body, and root elements immediately
      document.documentElement.style.backgroundColor = bgColor;
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
      document.documentElement.style.marginTop = "0";
      document.documentElement.style.paddingTop = "0";
      document.documentElement.style.top = "0";

      document.body.style.backgroundColor = bgColor;
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.marginTop = "0";
      document.body.style.paddingTop = "0";
      document.body.style.top = "0";

      const rootEl = document.getElementById("root") || document.getElementById("app");
      if (rootEl) {
        const root = rootEl as HTMLElement;
        root.style.backgroundColor = bgColor;
        root.style.margin = "0";
        root.style.padding = "0";
        root.style.marginTop = "0";
        root.style.paddingTop = "0";
        root.style.top = "0";

        // Also style first child if it exists
        const firstChild = root.firstElementChild as HTMLElement | null;
        if (firstChild) {
          firstChild.style.margin = "0";
          firstChild.style.padding = "0";
          firstChild.style.marginTop = "0";
          firstChild.style.paddingTop = "0";
          firstChild.style.top = "0";
          firstChild.style.backgroundColor = bgColor;
        }

        // Force remove any white space from all direct children
        Array.from(root.children).forEach((child) => {
          const el = child as HTMLElement;
          if (el.className && (el.className.includes('headerRow') || el.className.includes('header-row'))) {
            el.style.display = 'none';
            el.style.height = '0';
            el.style.margin = '0';
            el.style.padding = '0';
          }
        });
      }

      // Inject global styles to remove any white strip
      let styleTag = document.getElementById("freelancer-dashboard-style-override");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "freelancer-dashboard-style-override";
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = `
        html, body, #root, #app {
          margin: 0 !important;
          padding: 0 !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
          top: 0 !important;
        }
        body > *:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        div[style*="padding-top"], div[style*="margin-top"] {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        [class*="headerRow"], [class*="header-row"], [class*="header"] {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        [class*="headerRow"], [class*="header-row"] {
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          display: none !important;
        }
        [data-testid*="header"], [aria-label*="header"] {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        div > div[class*="r-"]:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        div[style*="background-color: rgb(255, 255, 255)"],
        div[style*="background-color: #ffffff"],
        div[style*="background-color: white"] {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
      `;
    }
  }, [darkMode]);

  // Define styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      ...(Platform.OS === "web" && { marginTop: 0 as number, paddingTop: 0 as number }),
    },
    header: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      paddingTop: Platform.OS === "web"
        ? 0 as number
        : (Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0),
      paddingBottom: Platform.OS === "web" ? 0 as number : 10,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#374151" : "#e5e7eb",
      ...(Platform.OS === "web" && { marginTop: 0, marginBottom: 0, height: 'auto' as any, minHeight: 0 }),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    headerBackButton: {
      padding: Platform.OS === "web" ? 0 : 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginLeft: 12,
    },

    tabsContainer: {
      flexGrow: 0,
      marginLeft: 8,
    },
    tabsScrollView: {
      flexDirection: "row",
      paddingHorizontal: 8,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 4,
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
    },
    tabText: {
      marginLeft: 8,
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    tabTextActive: {
      color: darkMode ? "#ffffff" : "#000000",
      fontWeight: "600",
    },
    tabContent: {
      flex: 1,
    },
    tabContentContainer: {
      padding: Platform.OS === "web" ? 12 : 16,
      maxWidth: Platform.OS === "web" ? 1200 : undefined,
      alignSelf: Platform.OS === "web" ? "center" : "stretch",
      width: Platform.OS === "web" ? "100%" : undefined,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    sectionBackButton: {
      padding: 8,
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    metricCard: {
      width: "48%",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
    },
    metricIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    metricValue: {
      fontSize: 28,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    statusSummaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    statusSummaryCard: {
      width: "48%",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
    },
    statusSummaryValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginTop: 8,
      marginBottom: 4,
    },
    statusSummaryLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    infoCard: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
    },
    infoCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    infoCardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#111827",
      marginLeft: 8,
    },
    progressBarContainer: {
      marginBottom: 12,
    },
    progressBar: {
      height: 8,
      backgroundColor: darkMode ? "#374151" : "#e5e7eb",
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#06b6d4",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    infoCardText: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
      lineHeight: 20,
    },
    infoCardButton: {
      backgroundColor: "#06b6d4",
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      alignItems: "center",
    },
    infoCardButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    tipsContainer: {
      gap: 12,
    },
    tipCard: {
      flexDirection: "row",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
    },
    tipContent: {
      flex: 1,
      marginLeft: 12,
    },
    tipTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 4,
    },
    tipText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    applicationCard: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    applicationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    applicationTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#111827",
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusHired: {
      backgroundColor: "#22c55e",
    },
    statusRejected: {
      backgroundColor: "#ef4444",
    },
    statusPending: {
      backgroundColor: "#f59e0b",
    },
    statusInReview: {
      backgroundColor: "#3b82f6",
    },
    statusActive: {
      backgroundColor: "#22c55e",
    },
    statusInactive: {
      backgroundColor: "#6b7280",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
      textTransform: "capitalize",
    },
    applicationInfo: {
      flexDirection: "row",
      marginBottom: 12,
    },
    applicationInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    applicationInfoText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginLeft: 6,
    },
    viewJobButton: {
      backgroundColor: "#06b6d4",
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
    },
    viewJobButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    jobCard: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    jobHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    jobTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#111827",
      flex: 1,
    },
    jobInfo: {
      flexDirection: "row",
      marginBottom: 12,
    },
    jobInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    jobInfoText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginLeft: 6,
    },
    jobDescription: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
      lineHeight: 20,
      marginBottom: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#111827",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 32,
    },
    browseJobsButton: {
      backgroundColor: "#06b6d4",
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    browseJobsButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    analyticsCard: {
      width: "48%",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    analyticsCardTitle: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 8,
    },
    analyticsCardValue: {
      fontSize: 28,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 4,
    },
    analyticsCardLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    profileCard: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 12,
      padding: 24,
    },
    profileName: {
      fontSize: 24,
      fontWeight: "bold",
      color: darkMode ? "#ffffff" : "#111827",
      marginBottom: 8,
    },
    profileEmail: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 16,
    },
    profileBio: {
      fontSize: 16,
      color: darkMode ? "#d1d5db" : "#4b5563",
      lineHeight: 24,
      marginBottom: 16,
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    skillTag: {
      backgroundColor: darkMode ? "#1f2937" : "#e5e7eb",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    skillText: {
      fontSize: 14,
      color: darkMode ? "#ffffff" : "#111827",
    },
    profileDetail: {
      fontSize: 16,
      color: darkMode ? "#d1d5db" : "#4b5563",
      marginBottom: 8,
    },
    editProfileButton: {
      backgroundColor: "#06b6d4",
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      marginTop: 16,
    },
    editProfileButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    pagerView: {
      flex: 1,
    }
  });

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={darkMode ? "#000000" : "#ffffff"}
        />
      )}
      {/* Tabs */}
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsScrollView}
        >
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => handleTabPress(tab.id, index)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id
                    ? (darkMode ? "#ffffff" : "#000000")
                    : (darkMode ? "#9ca3af" : "#6b7280")}
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={tabs.findIndex(t => t.id === initialTab)}
        onPageSelected={handlePageSelected}
      >
        <View key="overview" style={{ flex: 1 }}>
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Welcome, {user?.profile?.firstName || user?.email || "Freelancer"}!
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your freelance journey starts here. Track your applications, jobs, and performance all in one place.
              </Text>
            </View>

            {/* Analytics Cards */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#06b6d4" }]}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalApplications}</Text>
                <Text style={styles.metricLabel}>Applications</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#22c55e" }]}>
                  <Ionicons name="briefcase" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalJobs}</Text>
                <Text style={styles.metricLabel}>Jobs Available</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#a855f7" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.hiredCount}</Text>
                <Text style={styles.metricLabel}>Jobs Won</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#f59e0b" }]}>
                  <Ionicons name="stats-chart" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.successRate}%</Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
            </View>

            {/* Application Status Summary */}
            {analyticsData.totalApplications > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application Status</Text>
                <View style={styles.statusSummaryGrid}>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="hourglass" size={20} color="#f59e0b" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.pendingCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Pending</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="eye" size={20} color="#3b82f6" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.inReviewCount}</Text>
                    <Text style={styles.statusSummaryLabel}>In Review</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.hiredCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Hired</Text>
                  </View>
                  <View style={styles.statusSummaryCard}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                    <Text style={styles.statusSummaryValue}>{analyticsData.rejectedCount}</Text>
                    <Text style={styles.statusSummaryLabel}>Rejected</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Profile Completion Status */}
            <View style={styles.section}>
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="person-circle" size={24} color="#06b6d4" />
                  <Text style={styles.infoCardTitle}>Profile Status</Text>
                </View>
                {(() => {
                  const calculateCompletion = () => {
                    if (!profile) return { percentage: 0, status: "Incomplete" };

                    const step1Fields = ['firstName', 'lastName', 'email', 'location'];
                    const step2Fields = [
                      'bio',
                      'education',
                      'workExperience',
                      'experienceLevel',
                      'yearsOfExperience'
                    ];

                    let completed = 0;
                    const total = step1Fields.length + step2Fields.length + 2; // +2 for skills and cv

                    step1Fields.forEach(f => {
                      if (profile[f]) completed++;
                    });

                    step2Fields.forEach(f => {
                      if (profile[f]) completed++;
                    });

                    if (profile.skills && profile.skills.length > 0) completed++;
                    if (profile.cvUrl) completed++;

                    const percentage = Math.round((completed / total) * 100);

                    let status = "Getting Started";
                    if (percentage >= 100) status = "Completed";
                    else if (percentage >= 80) status = "Almost Done";
                    else if (percentage >= 50) status = "Halfway There";

                    return { percentage, status };
                  };

                  const { percentage, status } = calculateCompletion();
                  const isProfileCreated = !!profile;

                  return isProfileCreated ? (
                    <>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{percentage}% Complete</Text>
                      </View>
                      <Text style={styles.infoCardText}>
                        Status: <Text style={{ fontWeight: 'bold' }}>{status}</Text>.
                        {percentage < 100
                          ? " Complete your profile to increase visibility."
                          : " Your profile is looking great!"}
                      </Text>
                      {percentage < 100 && (
                        <TouchableOpacity
                          style={styles.infoCardButton}
                          onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                        >
                          <Text style={styles.infoCardButtonText}>Finish Profile</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoCardText}>
                        Complete your profile to increase your chances of getting hired.
                      </Text>
                      <TouchableOpacity
                        style={styles.infoCardButton}
                        onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                      >
                        <Text style={styles.infoCardButtonText}>Complete Profile</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </View>
            </View>

            {/* Tips & Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tips for Success</Text>
              <View style={styles.tipsContainer}>
                <View style={styles.tipCard}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Optimize Your Profile</Text>
                    <Text style={styles.tipText}>
                      Add a professional photo, detailed bio, and showcase your best work samples.
                    </Text>
                  </View>
                </View>
                <View style={styles.tipCard}>
                  <Ionicons name="trending-up" size={20} color="#22c55e" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Apply Strategically</Text>
                    <Text style={styles.tipText}>
                      Focus on jobs that match your skills and write personalized cover letters.
                    </Text>
                  </View>
                </View>
                <View style={styles.tipCard}>
                  <Ionicons name="time" size={20} color="#06b6d4" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Respond Quickly</Text>
                    <Text style={styles.tipText}>
                      Quick responses to client messages can significantly improve your chances.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View key="myApplications" style={{ flex: 1 }}>
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Applications</Text>
            </View>

            {applicationsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading your applications...</Text>
              </View>
            ) : applications.length > 0 ? (
              <>
                {applications.map((app: any) => (
                  <View key={app._id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.applicationTitle}>{app.job?.title || "Job Title"}</Text>
                      <View style={[
                        styles.statusBadge,
                        app.status === "hired" ? styles.statusHired :
                          app.status === "rejected" ? styles.statusRejected :
                            app.status === "in_review" ? styles.statusInReview :
                              styles.statusPending
                      ]}>
                        <Text style={styles.statusText}>
                          {app.status === "in_review" ? "In Review" :
                            app.status === "pending" ? "Pending" :
                              app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Pending"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.applicationInfo}>
                      <View style={styles.applicationInfoItem}>
                        <Ionicons name="folder" size={16} color="#06b6d4" />
                        <Text style={styles.applicationInfoText}>{app.job?.category || "General"}</Text>
                      </View>
                      <View style={styles.applicationInfoItem}>
                        <Ionicons name="calendar" size={16} color="#06b6d4" />
                        <Text style={styles.applicationInfoText}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewJobButton}
                      onPress={() => (navigation as any).navigate("JobDetails", { jobId: app.job?._id })}
                    >
                      <Text style={styles.viewJobButtonText}>View Job Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No applications yet</Text>
                <Text style={styles.emptyStateText}>
                  Start applying to jobs to see your applications here
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => {
                    setActiveTab("myJobs");
                    pagerRef.current?.setPage(2);
                  }}
                >
                  <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        <View key="myJobs" style={{ flex: 1 }}>
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Jobs</Text>
              <Text style={styles.sectionSubtitle}>
                Find opportunities that match your skills
              </Text>
            </View>

            {jobsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading jobs...</Text>
              </View>
            ) : jobs.length > 0 ? (
              <>
                {jobs.map((job: any) => (
                  <View key={job._id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        job.status === "active" ? styles.statusActive : styles.statusInactive
                      ]}>
                        <Text style={styles.statusText}>{job.status || "active"}</Text>
                      </View>
                    </View>
                    <View style={styles.jobInfo}>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="folder" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>{job.category || "General"}</Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="calendar" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobDescription} numberOfLines={2}>
                      {job.description || "No description available."}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewJobButton}
                      onPress={() => (navigation as any).navigate("JobDetails", { jobId: job._id })}
                    >
                      <Text style={styles.viewJobButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No jobs found</Text>
                <Text style={styles.emptyStateText}>
                  Explore and apply to jobs to get started
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => (navigation as any).navigate("JobListings")}
                >
                  <Text style={styles.browseJobsButtonText}>Browse All Jobs</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        <View key="messages" style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: darkMode ? "#fff" : "#000" }}>Messages will open in a new screen</Text>
            <TouchableOpacity
              style={[styles.browseJobsButton, { marginTop: 16 }]}
              onPress={() => (navigation as any).navigate("FreelancerMessages")}
            >
              <Text style={styles.browseJobsButtonText}>Go to Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View key="profile" style={{ flex: 1 }}>
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.sectionHeaderRow}>
              <TouchableOpacity
                style={styles.sectionBackButton}
                onPress={() => {
                  setActiveTab("overview");
                  pagerRef.current?.setPage(0);
                }}
              >
                <Ionicons name="arrow-back" size={20} color={darkMode ? "#ffffff" : "#111827"} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Profile</Text>
            </View>

            {profileLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : !profile ? (
              <View style={styles.emptyState}>
                <Ionicons name="person" size={64} color={darkMode ? "#9ca3af" : "#d1d5db"} />
                <Text style={styles.emptyStateTitle}>No profile data found</Text>
                <Text style={styles.emptyStateText}>
                  Complete your profile to get started
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                >
                  <Text style={styles.browseJobsButtonText}>Setup Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.profileCard}>
                <Text style={styles.profileName}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                {profile.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
                {profile.skills && profile.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {profile.skills.map((skill: string, idx: number) => (
                      <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {profile.location && (
                  <Text style={styles.profileDetail}>Location: {profile.location}</Text>
                )}
                {profile.experienceLevel && (
                  <Text style={styles.profileDetail}>
                    Experience: {profile.experienceLevel}
                    {profile.yearsOfExperience && ` (${profile.yearsOfExperience} years)`}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => (navigation as any).navigate("FreelancerProfileSetup")}
                >
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </PagerView>
    </View>
  );
};

export default FreelancerDashboard;
