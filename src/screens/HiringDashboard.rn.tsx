/**
 * React Native HiringDashboard Screen
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
  Alert,
  Modal,
  Image,
  Platform,
  BackHandler,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";
import ApplicationsManagementMongo from "./ApplicationsManagementMongo.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import MessagesTab from "../components/MessagesTab.rn";
import FindFreelancersTab from "../components/FindFreelancersTab.rn";

type TabType = "overview" | "applications" | "jobs" | "analytics" | "profile" | "messages" | "findFreelancers" | "jobAdmin";
type MessagesSubTabType = "find" | "messages";

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

const HiringDashboard: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();

  const routeParams = (route.params as any) || {};
  const initialTab = routeParams.tab || "overview";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);
  const [messagesSubTab, setMessagesSubTab] = useState<MessagesSubTabType>("messages");
  const [sharedFreelancers, setSharedFreelancers] = useState<any[]>([]);

  // Memoize setSharedFreelancers to prevent unnecessary re-renders
  const memoizedSetSharedFreelancers = useCallback((freelancers: any[]) => {
    setSharedFreelancers(freelancers);
  }, []);

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
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingJobs, setClearingJobs] = useState(false);

  // Profile state
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

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
    if (user) {
      if (activeTab === "analytics") {
        fetchAnalyticsData();
      }
      if (activeTab === "overview") {
        fetchAnalyticsData();
        fetchUserJobs();
      }
      if (activeTab === "jobs") {
        fetchUserJobs();
      }
      if (activeTab === "profile") {
        navigation.navigate("CompanyProfile" as never);
        return;
      }
      fetchCompanyProfile();
    }
  }, [activeTab, user]);

  // Handle navigation to messages tab with freelancerId
  useEffect(() => {
    const freelancerId = routeParams.freelancerId;
    if (freelancerId) {
      // Switch to messages tab
      setActiveTab("messages");
      // Switch to messages sub-tab to show the conversation
      setMessagesSubTab("messages");
    }
  }, [routeParams.freelancerId]);

  // Reset messages sub-tab when switching away from messages tab
  useEffect(() => {
    if (activeTab !== "messages") {
      setMessagesSubTab("messages");
    }
  }, [activeTab]);

  const fetchUserJobs = async () => {
    if (!user) return;
    setJobsLoading(true);
    try {
      const jobs = await apiService.getMyJobs();
      setUserJobs(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
    } finally {
      setJobsLoading(false);
    }
  };



  const handleClearAllJobs = async () => {
    if (!user) return;
    setClearingJobs(true);
    try {
      await apiService.clearAllJobs();
      await fetchUserJobs();
      if (activeTab === "analytics") {
        await fetchAnalyticsData();
      }
      setShowClearConfirm(false);
      Alert.alert("Success", "All jobs cleared successfully.");
    } catch (error) {
      console.error("Error clearing jobs:", error);
      Alert.alert("Error", "Failed to clear jobs.");
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
      if (profile.logo) {
        if (profile.logo.startsWith('http') || profile.logo.startsWith('data:')) {
          setCompanyLogo(profile.logo);
        } else {
          setCompanyLogo(apiService.getFileUrl(profile.logo));
        }
      } else {
        setCompanyLogo(null);
      }
    } catch (error: any) {
      // Only log error if it's not a 404 (expected for new users without company profile)
      if (error?.status !== 404 && !error?.isNotFound) {
        console.error("Error fetching company profile:", error);
      }
      // Handle 404 gracefully - create fallback profile from user data
      if (user?.profile) {
        const companyNameFromUser = user.profile.firstName && user.profile.lastName
          ? `${user.profile.firstName} ${user.profile.lastName} Company`
          : user.profile.firstName
            ? `${user.profile.firstName} Company`
            : '';
        setCompanyProfile({
          companyName: companyNameFromUser,
          industry: '',
          companySize: '',
          website: user.profile.websiteUrl || user.profile.website || '',
          location: user.profile.location || '',
          description: user.profile.bio || '',
          contactEmail: user.email || '',
          contactPhone: user.profile.phone || '',
        });
        setCompanyLogo(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteJob(jobId);
              await fetchUserJobs();
              if (activeTab === "analytics") {
                await fetchAnalyticsData();
              }
              Alert.alert("Success", "Job deleted successfully.");
            } catch (error) {
              console.error("Error deleting job:", error);
              Alert.alert("Error", "Failed to delete job. Please try again.");
            }
          },
        },
      ]
    );
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;
    setAnalyticsLoading(true);
    try {
      const userJobs = await apiService.getMyJobs();
      const applicationsPromises = userJobs.map((job: any) =>
        apiService.getApplications(job._id)
      );
      const applicationsResponses = await Promise.all(applicationsPromises);
      const allApplications = applicationsResponses.flatMap(
        (response: any) => response || []
      );

      const totalJobs = userJobs.length;
      const totalApplications = allApplications.length;

      const statusCounts = allApplications.reduce((acc: Record<string, number>, app: any) => {
        const status = app.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hiredCount = statusCounts.hired || 0;
      const pendingCount = statusCounts.pending || 0;
      const rejectedCount = statusCounts.rejected || 0;
      const inReviewCount = statusCounts.in_review || 0;

      const successRate =
        totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;

      const hiredApplications = allApplications.filter(
        (app: any) => app.status === "hired" && app.updatedAt
      );
      const avgDaysToHire =
        hiredApplications.length > 0
          ? hiredApplications.reduce((sum, app) => {
            const hireDate = new Date(app.updatedAt);
            const postDate = new Date(app.job?.createdAt || app.createdAt);
            const days = Math.ceil(
              (hireDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / hiredApplications.length
          : 0;

      const categoryStats = userJobs.reduce((acc, job) => {
        const category = job.category || "Other";
        if (!acc[category]) {
          acc[category] = { jobs: 0, applications: 0, hired: 0 };
        }
        acc[category].jobs += 1;
        return acc;
      }, {} as Record<string, { jobs: number; applications: number; hired: number }>);

      allApplications.forEach((app: any) => {
        const category = app.job?.category || "Other";
        if (categoryStats[category]) {
          categoryStats[category].applications += 1;
          if (app.status === "hired") {
            categoryStats[category].hired += 1;
          }
        }
      });

      const categoryPerformance = Object.entries(categoryStats)
        .map(([category, stats]: [string, any]) => ({
          category,
          applications: stats.applications,
          conversion:
            stats.applications > 0
              ? `${((stats.hired / stats.applications) * 100).toFixed(1)}%`
              : "0%",
        }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 5);

      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString("en-US", { month: "short" });
        const monthApplications = allApplications.filter((app) => {
          const appDate = new Date(app.createdAt);
          return (
            appDate.getMonth() === monthDate.getMonth() &&
            appDate.getFullYear() === monthDate.getFullYear()
          );
        });
        const monthHired = monthApplications.filter((app) => app.status === "hired");
        monthlyTrends.push({
          month: monthName,
          applications: monthApplications.length,
          hired: monthHired.length,
        });
      }

      const respondedApplications = allApplications.filter(
        (app) => app.updatedAt && app.createdAt
      );
      const responseTime =
        respondedApplications.length > 0
          ? respondedApplications.reduce((sum, app) => {
            const responseDate = new Date(app.updatedAt);
            const submitDate = new Date(app.createdAt);
            const hours = (responseDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }, 0) / respondedApplications.length
          : 0;

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
        monthlyTrends,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentContainer}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>

            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name="briefcase" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalJobs}</Text>
                <Text style={styles.metricLabel}>Total Jobs</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#22c55e" }]}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.totalApplications}</Text>
                <Text style={styles.metricLabel}>Applications</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#a855f7" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.hiredCount}</Text>
                <Text style={styles.metricLabel}>Hired</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: "#f59e0b" }]}>
                  <Ionicons name="hourglass" size={24} color="#ffffff" />
                </View>
                <Text style={styles.metricValue}>{analyticsData.pendingCount}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
            </View>

            {jobsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading jobs...</Text>
              </View>
            ) : userJobs.length > 0 ? (
              <>
                {userJobs.slice(0, 3).map((job: any) => (
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
                        <Ionicons name="people" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>
                          {job.applicationsCount || 0} applications
                        </Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="eye" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>{job.views || 0} views</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewApplicationsButton}
                      onPress={() => setActiveTab("applications")}
                    >
                      <Text style={styles.viewApplicationsButtonText}>
                        View Applications
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {userJobs.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setActiveTab("jobs")}
                  >
                    <Text style={styles.viewAllButtonText}>
                      View All {userJobs.length} Jobs
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}
          </ScrollView>
        );

      case "applications":
        return <ApplicationsManagementMongo />;

      case "jobs":
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentContainer}
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>My Jobs</Text>
                  <Text style={styles.sectionSubtitle}>
                    Manage and track all your posted job listings
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.postJobButton}
                  onPress={() => navigation.navigate("PostJob" as never)}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.postJobButtonText}>Post New Job</Text>
                </TouchableOpacity>
              </View>
            </View>

            {jobsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading your jobs...</Text>
              </View>
            ) : userJobs.length > 0 ? (
              <>
                {userJobs.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setShowClearConfirm(true)}
                    disabled={clearingJobs}
                  >
                    {clearingJobs ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="trash" size={16} color="#ffffff" />
                        <Text style={styles.clearButtonText}>
                          Clear All Jobs ({userJobs.length})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {userJobs.map((job: any) => (
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
                        <Ionicons name="people" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>
                          {job.applicationsCount || 0} applications
                        </Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="eye" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>{job.views || 0} views</Text>
                      </View>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="calendar" size={16} color="#06b6d4" />
                        <Text style={styles.jobInfoText}>
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.jobActions}>
                      <TouchableOpacity
                        style={styles.viewApplicationsButton}
                        onPress={() => setActiveTab("applications")}
                      >
                        <Text style={styles.viewApplicationsButtonText}>
                          View Applications ({job.applicationsCount || 0})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteJob(job._id)}
                      >
                        <Ionicons name="trash" size={16} color="#ffffff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            ) : null}
          </ScrollView>
        );

      case "messages":
        return (
          <View style={[styles.tabContent, { flex: 1 }]}>
            <View style={styles.messagesHeader}>
              <Text style={styles.messagesHeaderTitle}>Messages</Text>
            </View>
            <View style={{ flex: 1 }}>
              <MessagesTab />
            </View>
          </View>
        );

      case "findFreelancers":
        return (
          <SafeAreaView style={[styles.tabContent, { flex: 1 }]} edges={["top"]}>
            <View style={styles.messagesHeader}>
              <TouchableOpacity
                style={styles.messagesHeaderBackButton}
                onPress={() => {
                  setActiveTab("overview");
                }}
              >
                <Ionicons name="arrow-back" size={20} color={darkMode ? "#ffffff" : "#111827"} />
              </TouchableOpacity>
              <Text style={styles.messagesHeaderTitle}>Find Freelancers</Text>
            </View>
            <View style={{ flex: 1 }}>
              <FindFreelancersTab
                sharedFreelancers={sharedFreelancers}
                setSharedFreelancers={memoizedSetSharedFreelancers}
              />
            </View>
          </SafeAreaView>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderBottomWidth: 2,
      borderBottomColor: "#06b6d4",
      marginBottom: 0,
      ...(Platform.OS === 'web' ? {
        boxShadow: darkMode
          ? "0 4px 6px rgba(6, 182, 212, 0.2)"
          : "0 2px 4px rgba(0, 0, 0, 0.1)",
      } : {
        shadowColor: "#06b6d4",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    headerBackButton: {
      padding: 6,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: "#06b6d4",
      textAlign: "center",
      marginBottom: 0,
    },

    headerQuickActions: {
      marginBottom: 16,
    },
    tabsContainer: {
      flex: 1,
      marginLeft: 8,
      backgroundColor: "transparent",
    },
    tabsScrollView: {
      flexDirection: "row",
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: "#06b6d4",
    },
    tabText: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    tabTextActive: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    tabContent: {
      flex: 1,
    },
    tabContentContainer: {
      paddingBottom: 20,
    },
    messagesHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.8)" : "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    messagesHeaderBackButton: {
      padding: 6,
      marginRight: 8,
    },
    messagesHeaderTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#111827",
    },
    messagesSubTabsContainer: {
      flexDirection: "row",
      paddingTop: 0,
      marginTop: 0,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(255, 255, 255, 0.9)",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    messagesSubTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
      gap: 8,
    },
    messagesSubTabActive: {
      borderBottomColor: "#06b6d4",
    },
    messagesSubTabText: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    messagesSubTabTextActive: {
      color: "#06b6d4",
    },
    section: {
      padding: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    quickActionsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 12,
    },
    quickActionsGrid: {
      flexDirection: "row",
      gap: 12,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginTop: 12,
      marginBottom: 4,
    },
    quickActionSubtitle: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    postJobButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#06b6d4",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    postJobButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    jobCard: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    jobHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    jobTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginRight: 12,
      flexShrink: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusActive: {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    statusInactive: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
    },
    jobInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 16,
    },
    jobInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    jobInfoText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    jobActions: {
      flexDirection: "row",
      gap: 12,
    },
    viewApplicationsButton: {
      flex: 1,
      backgroundColor: "#06b6d4",
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    viewApplicationsButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    viewAllText: {
      color: "#06b6d4",
      fontSize: 14,
      fontWeight: "600",
    },
    viewAllButton: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.1)",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#06b6d4",
    },
    viewAllButtonText: {
      color: "#06b6d4",
      fontSize: 14,
      fontWeight: "600",
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ef4444",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 6,
    },
    deleteButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ef4444",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 20,
      marginBottom: 16,
      gap: 8,
      justifyContent: "center",
    },
    clearButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 40,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 24,
    },
    placeholderBox: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 32,
      marginHorizontal: 16,
      marginVertical: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    placeholderText: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginTop: 16,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    metricCard: {
      width: "47%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    metricIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    chartCard: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    trendItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    trendMonth: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    trendValues: {
      flexDirection: "row",
      gap: 16,
    },
    trendValue: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    trendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    trendText: {
      fontSize: 14,
      color: darkMode ? "#ffffff" : "#000000",
      fontWeight: "600",
    },
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
    },
    categoryStats: {
      flexDirection: "row",
      gap: 12,
    },
    categoryApplications: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    categoryConversion: {
      fontSize: 14,
      color: "#06b6d4",
      fontWeight: "600",
    },
    noDataText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      paddingVertical: 20,
    },
    modal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
      borderRadius: 20,
      padding: 24,
      width: "80%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    modalText: {
      fontSize: 16,
      color: darkMode ? "#d1d5db" : "#4b5563",
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: "row",
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    modalButtonCancel: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    modalButtonConfirm: {
      backgroundColor: "#ef4444",
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
    },
    modalButtonTextConfirm: {
      color: "#ffffff",
    },
  });

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: "stats-chart" },
    { id: "applications" as TabType, label: "Applications", icon: "people" },
    { id: "jobs" as TabType, label: "My Jobs", icon: "briefcase" },
    ...(user?.roles?.includes('admin') ? [
      { id: "jobAdmin" as TabType, label: "Job Moderation", icon: "shield-checkmark" }
    ] : []),
    { id: "findFreelancers" as TabType, label: "Find Freelancers", icon: "people" },
    { id: "messages" as TabType, label: "Messages", icon: "chatbubbles" },
    { id: "profile" as TabType, label: "Profile", icon: "person" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#000000" : "#ffffff"}
      />
      {/* Header Container */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={20} color={darkMode ? "#ffffff" : "#111827"} />
          </TouchableOpacity>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <View style={styles.tabsScrollView}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => {
                    if (tab.id === "profile") {
                      navigation.navigate("CompanyProfile" as never);
                    } else if (tab.id === "messages") {
                      (navigation as any).navigate("ChatMessages");
                      return;
                    } else if (tab.id === "findFreelancers") {
                      (navigation as any).navigate("FindFreelancers");
                      return;
                    } else if (tab.id === "jobAdmin") {
                      (navigation as any).navigate("JobAdmin");
                      return;
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                >
                  {tab.id === "profile" && companyLogo ? (
                    <Image
                      source={{ uri: companyLogo }}
                      style={{ width: 20, height: 20, borderRadius: 10 }}
                    />
                  ) : (
                    <Ionicons
                      name={tab.icon as any}
                      size={20}
                      color={activeTab === tab.id
                        ? (darkMode ? "#ffffff" : "#000000")
                        : (darkMode ? "#9ca3af" : "#6b7280")}
                    />
                  )}
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {renderTabContent()}
      <Modal
        visible={showClearConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear All Jobs</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete all your jobs? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowClearConfirm(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleClearAllJobs}
                disabled={clearingJobs}
              >
                {clearingJobs ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    Clear All
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
};

export default HiringDashboard;
