/**
 * React Native ApplicationsManagementMongo Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useAppSelector } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext-react-native";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface Application {
  _id: string;
  job: string;
  jobTitle: string;
  company?: string;
  applicant: {
    _id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      skills?: string[];
      experience?: string;
      education?: string;
    };
  };
  applicantEmail: string;
  coverLetter: string;
  cvUrl: string;
  portfolioUrl?: string;
  appliedAt: string;
  status: "pending" | "in_review" | "hired" | "rejected";
  notes?: string;
}

type TabType = "all" | "pending" | "in_review" | "hired" | "rejected";

const ApplicationsManagementMongo: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { onNewApplication, offNewApplication } = useWebSocket();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [notificationStatus, setNotificationStatus] = useState<{
    [key: string]: { success: boolean; message: string } | null;
  }>({});
  const [notesInput, setNotesInput] = useState<{ [key: string]: string }>({});

  const tabs = [
    { id: "all" as TabType, label: "All", icon: "people" },
    { id: "pending" as TabType, label: "Pending", icon: "time" },
    { id: "in_review" as TabType, label: "In Review", icon: "eye" },
    { id: "hired" as TabType, label: "Hired", icon: "checkmark-circle" },
    { id: "rejected" as TabType, label: "Rejected", icon: "close-circle" },
  ];

  const fetchApplications = useCallback(async () => {
    if (!(await apiService.isAuthenticated())) return;
    try {
      setLoading(true);
      const allApplications = await apiService.getMyJobsApplications();
      setApplications(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      Alert.alert("Error", "Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const handleNewApplication = (data: any) => {
      console.log("New application received:", data);
      if (data.application) {
        setApplications((prev) => [data.application, ...prev]);
        setNotificationStatus((prev) => ({
          ...prev,
          global: {
            success: true,
            message: `New application received for "${data.application.jobTitle}" from ${data.application.applicantEmail}!`,
          },
        }));
        setTimeout(() => {
          setNotificationStatus((prev) => {
            const newState = { ...prev };
            delete newState.global;
            return newState;
          });
        }, 5000);
      }
    };

    onNewApplication(handleNewApplication);
    return () => {
      offNewApplication(handleNewApplication);
    };
  }, [onNewApplication, offNewApplication]);

  const baseFilteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.coverLetter || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = selectedJob === "all" || app.jobTitle === selectedJob;
      return matchesSearch && matchesJob;
    });
  }, [applications, searchTerm, selectedJob]);

  const filteredApplications = useMemo(() => {
    return baseFilteredApps.filter((app) => activeTab === "all" || app.status === activeTab);
  }, [baseFilteredApps, activeTab]);

  const tabCounts = useMemo(() => {
    return tabs.map((tab) => {
      if (tab.id === "all") return baseFilteredApps.length;
      return baseFilteredApps.filter((app) => app.status === tab.id).length;
    });
  }, [baseFilteredApps]);

  const uniqueJobTitles = useMemo(() => {
    return Array.from(new Set(applications.map((app) => app.jobTitle)));
  }, [applications]);

  const handleStatusUpdate = useCallback(
    async (applicationId: string, newStatus: Application["status"], notes?: string) => {
      if (updating[applicationId]) return;
      setUpdating((prev) => ({ ...prev, [applicationId]: true }));

      try {
        await apiService.updateApplicationStatus(applicationId, newStatus, notes);

        const application = applications.find((app) => app._id === applicationId);
        if (!application) throw new Error("Application not found");

        const statusMessages: Record<Application["status"], string> = {
          pending: "Your application is pending.",
          in_review: `Your application at ${application.company || "the company"} is currently under review.`,
          hired: `We are pleased to inform you that your application at ${application.company || "the company"} has been successful!`,
          rejected: `We regret to inform you that your application at ${application.company || "the company"} was not successful.`,
        };

        try {
          await apiService.sendNotificationEmail({
            to: application.applicantEmail,
            subject: `Application Status Update for ${application.jobTitle}`,
            body: `Dear ${application.applicant.profile?.firstName || "Applicant"}, ${statusMessages[newStatus]}`,
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
        }

        setNotificationStatus((prev) => ({
          ...prev,
          [applicationId]: {
            success: true,
            message: `Application marked as ${newStatus.toUpperCase()} successfully!`,
          },
        }));

        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus, notes } : app
          )
        );

        setTimeout(() => {
          setNotificationStatus((prev) => {
            const newState = { ...prev };
            delete newState[applicationId];
            return newState;
          });
        }, 5000);
      } catch (error) {
        console.error("Error updating application status:", error);
        Alert.alert("Error", "Failed to update status. Please try again.");
      } finally {
        setUpdating((prev) => {
          const newState = { ...prev };
          delete newState[applicationId];
          return newState;
        });
      }
    },
    [applications, updating]
  );

  const handleDownloadCV = useCallback(async (cvUrl: string, applicantName: string) => {
    if (!cvUrl) {
      Alert.alert("Error", "No CV available for download.");
      return;
    }
    try {
      const fileUrl = apiService.getFileUrl(cvUrl);
      const fileUri = FileSystem.documentDirectory + `${applicantName}_CV.pdf`;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Alert.alert("Success", "CV downloaded successfully.");
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      Alert.alert("Error", "Failed to download CV.");
    }
  }, []);

  const handleOpenPortfolio = useCallback((portfolioUrl: string) => {
    if (!portfolioUrl || portfolioUrl.trim() === "") {
      Alert.alert("Error", "No portfolio link available.");
      return;
    }
    let url = portfolioUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    Linking.openURL(url).catch((error) => {
      console.error("Error opening portfolio:", error);
      Alert.alert("Error", `Invalid portfolio URL: ${portfolioUrl}`);
    });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#fbbf24";
      case "in_review":
        return "#3b82f6";
      case "hired":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    notificationBox: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    notificationSuccess: {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    notificationError: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
    notificationText: {
      fontSize: 14,
      fontWeight: "600",
    },
    searchContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      height: 50,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingLeft: 44,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    searchIcon: {
      position: "absolute",
      left: 16,
      top: 15,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    filterPanel: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
      marginBottom: 8,
    },
    filterSelect: {
      height: 50,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    tabsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    tabActive: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "#000000",
    },
    tabInactive: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
    },
    tabTextActive: {
      color: "#ffffff",
    },
    tabTextInactive: {
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    tabBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    tabBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#ffffff",
    },
    applicationCard: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    applicationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    applicationTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginRight: 12,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#ffffff",
      textTransform: "uppercase",
    },
    applicantInfo: {
      marginBottom: 12,
    },
    applicantName: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    applicantEmail: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    applicationDate: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 16,
    },
    actionButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    buttonHire: {
      backgroundColor: "#22c55e",
    },
    buttonReject: {
      backgroundColor: "#ef4444",
    },
    buttonReview: {
      backgroundColor: "#3b82f6",
    },
    buttonPending: {
      backgroundColor: "#fbbf24",
    },
    buttonSecondary: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    buttonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
    },
    buttonTextSecondary: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    expandedContent: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    coverLetterTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
    },
    coverLetterText: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#374151",
      lineHeight: 20,
      marginBottom: 16,
    },
    notesInput: {
      minHeight: 80,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: darkMode ? "#ffffff" : "#000000",
      textAlignVertical: "top",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>
          Loading applications...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Applications Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage and review job applications from freelancers
          </Text>
        </View>

        {notificationStatus.global && (
          <View
            style={[
              styles.notificationBox,
              notificationStatus.global.success
                ? styles.notificationSuccess
                : styles.notificationError,
            ]}
          >
            <Text
              style={[
                styles.notificationText,
                { color: notificationStatus.global.success ? "#22c55e" : "#ef4444" },
              ]}
            >
              {notificationStatus.global.message}
            </Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <View style={{ flex: 1, position: "relative" }}>
            <Ionicons
              name="search"
              size={20}
              color={darkMode ? "#9ca3af" : "#6b7280"}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by job title, email, or cover letter..."
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={darkMode ? "#ffffff" : "#000000"}
            />
            <Text style={{ color: darkMode ? "#ffffff" : "#000000", marginLeft: 4 }}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.filterLabel}>Filter by Job</Text>
              {(selectedJob !== "all" || searchTerm !== "") && (
                <TouchableOpacity onPress={() => { setSelectedJob("all"); setSearchTerm(""); }}>
                  <Text style={{ color: "#06b6d4", fontSize: 12, fontWeight: "600" }}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => setShowFilters(true)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", width: '100%', height: '100%' }}>
                <Text style={{ color: darkMode ? "#ffffff" : "#000000", flex: 1 }}>
                  {selectedJob === "all" ? "All Jobs" : selectedJob}
                </Text>
                <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: 8, backgroundColor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)", borderRadius: 12, overflow: 'hidden' }}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                <TouchableOpacity
                  style={[
                    { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                    selectedJob === "all" && { backgroundColor: 'rgba(6, 182, 212, 0.1)' }
                  ]}
                  onPress={() => setSelectedJob("all")}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: selectedJob === "all" ? "#06b6d4" : (darkMode ? "#ffffff" : "#000000"), fontWeight: selectedJob === "all" ? "700" : "400" }}>All Jobs</Text>
                    {selectedJob === "all" && <Ionicons name="checkmark" size={18} color="#06b6d4" />}
                  </View>
                </TouchableOpacity>
                {uniqueJobTitles.map((jobTitle) => (
                  <TouchableOpacity
                    key={jobTitle}
                    style={[
                      { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                      selectedJob === jobTitle && { backgroundColor: 'rgba(6, 182, 212, 0.1)' }
                    ]}
                    onPress={() => setSelectedJob(jobTitle)}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: selectedJob === jobTitle ? "#06b6d4" : (darkMode ? "#ffffff" : "#000000"), fontWeight: selectedJob === jobTitle ? "700" : "400" }}>{jobTitle}</Text>
                      {selectedJob === jobTitle && <Ionicons name="checkmark" size={18} color="#06b6d4" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const count = tabCounts[index];
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? "#ffffff" : (darkMode ? "#9ca3af" : "#6b7280")}
                />
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people"
              size={64}
              color={darkMode ? "#9ca3af" : "#d1d5db"}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No applications found</Text>
            <Text style={styles.emptyText}>
              {searchTerm || selectedJob !== "all"
                ? "Try adjusting your search or filters"
                : "Applications will appear here when freelancers apply to your jobs"}
            </Text>
          </View>
        ) : (
          filteredApplications.map((application) => {
            const isExpanded = expandedApplication === application._id;
            const statusColor = getStatusColor(application.status);
            const applicantName =
              application.applicant.profile?.firstName && application.applicant.profile?.lastName
                ? `${application.applicant.profile.firstName} ${application.applicant.profile.lastName}`
                : application.applicantEmail;

            return (
              <View key={application._id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Text style={styles.applicationTitle}>{application.jobTitle}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>
                      {application.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.applicantInfo}>
                  <Text style={styles.applicantName}>{applicantName}</Text>
                  <Text style={styles.applicantEmail}>{application.applicantEmail}</Text>
                </View>

                <Text style={styles.applicationDate}>
                  Applied: {formatDate(application.appliedAt)}
                </Text>

                <View style={styles.actionButtons}>
                  {application.status !== "hired" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.buttonHire]}
                      onPress={() =>
                        handleStatusUpdate(application._id, "hired", notesInput[application._id])
                      }
                      disabled={updating[application._id]}
                    >
                      {updating[application._id] ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                          <Text style={styles.buttonText}>Hire</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  {application.status !== "rejected" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.buttonReject]}
                      onPress={() =>
                        handleStatusUpdate(application._id, "rejected", notesInput[application._id])
                      }
                      disabled={updating[application._id]}
                    >
                      {updating[application._id] ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={18} color="#ffffff" />
                          <Text style={styles.buttonText}>Reject</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  {application.status !== "in_review" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.buttonReview]}
                      onPress={() =>
                        handleStatusUpdate(application._id, "in_review", notesInput[application._id])
                      }
                      disabled={updating[application._id]}
                    >
                      <Ionicons name="eye" size={18} color="#ffffff" />
                      <Text style={styles.buttonText}>Review</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.buttonSecondary]}
                    onPress={() =>
                      setExpandedApplication(isExpanded ? null : application._id)
                    }
                  >
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={darkMode ? "#ffffff" : "#000000"}
                    />
                    <Text style={styles.buttonTextSecondary}>
                      {isExpanded ? "Less" : "More"}
                    </Text>
                  </TouchableOpacity>
                  {application.cvUrl && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.buttonSecondary]}
                      onPress={() => handleDownloadCV(application.cvUrl, applicantName)}
                    >
                      <Ionicons name="download" size={18} color={darkMode ? "#ffffff" : "#000000"} />
                      <Text style={styles.buttonTextSecondary}>CV</Text>
                    </TouchableOpacity>
                  )}
                  {application.portfolioUrl && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.buttonSecondary]}
                      onPress={() => handleOpenPortfolio(application.portfolioUrl!)}
                    >
                      <Ionicons name="globe" size={18} color={darkMode ? "#ffffff" : "#000000"} />
                      <Text style={styles.buttonTextSecondary}>Portfolio</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {notificationStatus[application._id] && (
                  <View
                    style={[
                      styles.notificationBox,
                      notificationStatus[application._id]?.success
                        ? styles.notificationSuccess
                        : styles.notificationError,
                    ]}
                  >
                    <Text
                      style={[
                        styles.notificationText,
                        {
                          color: notificationStatus[application._id]?.success ? "#22c55e" : "#ef4444",
                        },
                      ]}
                    >
                      {notificationStatus[application._id]?.message}
                    </Text>
                  </View>
                )}

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.coverLetterTitle}>Cover Letter</Text>
                    <Text style={styles.coverLetterText}>{application.coverLetter}</Text>

                    <Text style={styles.coverLetterTitle}>Add Notes (Optional)</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes about this application..."
                      placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                      value={notesInput[application._id] || ""}
                      onChangeText={(text) =>
                        setNotesInput((prev) => ({ ...prev, [application._id]: text }))
                      }
                      multiline
                    />

                    {application.notes && (
                      <>
                        <Text style={styles.coverLetterTitle}>Notes</Text>
                        <Text style={styles.coverLetterText}>{application.notes}</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ApplicationsManagementMongo;
