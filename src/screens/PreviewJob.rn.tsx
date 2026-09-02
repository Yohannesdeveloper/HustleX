/**
 * React Native PreviewJob Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Preview job details before posting
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAuth } from "../store/hooks";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface JobData {
  _id: string;
  title: string;
  description: string;
  company?: string;
  budget: string;
  category: string;
  jobType: string;
  workLocation: string;
  deadline?: string;
  experience?: string;
  education?: string;
  gender?: string;
  vacancies?: number;
  skills?: string[];
  requirements?: string[];
  benefits?: string[];
  contactEmail?: string;
  contactPhone?: string;
  companyWebsite?: string;
  createdAt?: string;
  postedBy?: {
    _id: string;
    email: string;
    profile: any;
  };
  address?: string;
  country?: string;
  city?: string;
  jobLink?: string;
}

const PreviewJob: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();

  const jobData = (route.params as any)?.jobData as JobData;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    backgroundGradient: {
      position: "absolute",
      width: 800,
      height: 800,
      borderRadius: 400,
      opacity: darkMode ? 0.1 : 0.05,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)",
      marginTop: 20,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#06b6d4" : "#0891b2",
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: "#3b82f6",
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    mainContent: {
      gap: 20,
    },
    sidebar: {
      gap: 20,
    },
    jobHeader: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
    },
    jobHeaderTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    jobHeaderLeft: {
      flex: 1,
    },
    jobTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#0891b2",
      marginBottom: 12,
    },
    companyName: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      fontSize: 18,
      color: darkMode ? "#d1d5db" : "#4b5563",
      marginBottom: 16,
    },
    postedDate: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    budgetBadge: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: "#06b6d4",
      alignSelf: 'flex-start',
    },
    budgetText: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 16,
    },
    infoCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.5)",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    infoIcon: {
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#1f2937",
      textAlign: "center",
    },
    section: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#0891b2",
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionText: {
      fontSize: 16,
      lineHeight: 24,
      color: darkMode ? "#d1d5db" : "#374151",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    skillTag: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    skillText: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#06b6d4" : "#0891b2",
    },
    sidebarCard: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
    },
    sidebarTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#0891b2",
      marginBottom: 16,
    },
    sidebarItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    sidebarLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
    },
    sidebarValue: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      flex: 1,
      textAlign: "right",
    },
    actionButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    actionButtonPrimary: {
      backgroundColor: "#06b6d4",
    },
    actionButtonSecondary: {
      backgroundColor: "#3b82f6",
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    successText: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 16,
    },
    errorText: {
      fontSize: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    errorButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
    },
    errorButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

  if (!jobData) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorTitle, { color: darkMode ? "#ffffff" : "#000000" }]}>
          No Job Data Found
        </Text>
        <Text style={[styles.errorText, { color: darkMode ? "#9ca3af" : "#6b7280" }]}>
          Please go back and try posting a job again.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.navigate("PostJob" as never)}
        >
          <Text style={styles.errorButtonText}>Post a Job</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleNext = () => {
    navigation.navigate("MainSwipeableTabs" as never);
  };

  const handleEdit = () => {
    (navigation.navigate as any)("PostJob", {
      jobData,
      editMode: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation.navigate as any)("PostJob")}
        >
          <Ionicons name="arrow-back" size={20} color={darkMode ? "#06b6d4" : "#0891b2"} />
          <Text style={styles.backButtonText}>Back to Post Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create" size={16} color="#ffffff" />
          <Text style={styles.editButtonText}>Edit Job</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={{ flexDirection: isLargeScreen ? "row" : "column", gap: 20 }}>
          <View style={isLargeScreen ? { flex: 2, gap: 20 } : { width: '100%', gap: 20 }}>
            {/* Job Header */}
            <Animated.View entering={FadeIn.duration(500)} style={styles.jobHeader}>
              <View style={[styles.jobHeaderTop, !isLargeScreen && { flexDirection: 'column', gap: 16 }]}>
                <View style={[styles.jobHeaderLeft, !isLargeScreen && { width: '100%' }]}>
                  <Text style={styles.jobTitle}>{jobData.title}</Text>
                  {jobData.company && (
                    <View style={styles.companyName}>
                      <Ionicons name="business" size={20} color={darkMode ? "#06b6d4" : "#0891b2"} />
                      <Text style={{ fontSize: 18, color: darkMode ? "#d1d5db" : "#4b5563" }}>
                        {jobData.company}
                      </Text>
                    </View>
                  )}
                  <View style={styles.postedDate}>
                    <Ionicons name="calendar" size={16} color={darkMode ? "#9ca3af" : "#6b7280"} />
                    <Text style={{ fontSize: 14, color: darkMode ? "#9ca3af" : "#6b7280" }}>
                      Posted {formatDate(jobData.createdAt || new Date().toISOString())}
                    </Text>
                  </View>
                </View>
                <View style={styles.budgetBadge}>
                  <Text style={styles.budgetText}>{jobData.budget} ETB</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="location"
                    size={24}
                    color={darkMode ? "#06b6d4" : "#0891b2"}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{jobData.workLocation || "Remote"}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="time"
                    size={24}
                    color={darkMode ? "#06b6d4" : "#0891b2"}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{jobData.jobType || "Contract"}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="people"
                    size={24}
                    color={darkMode ? "#06b6d4" : "#0891b2"}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Positions</Text>
                  <Text style={styles.infoValue}>{jobData.vacancies || 1}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={darkMode ? "#06b6d4" : "#0891b2"}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Deadline</Text>
                  <Text style={styles.infoValue}>{formatDate(jobData.deadline || "")}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Job Description */}
            <Animated.View entering={FadeIn.duration(500).delay(100)} style={styles.section}>
              <View style={styles.sectionTitle}>
                <Ionicons name="document-text" size={24} color={darkMode ? "#06b6d4" : "#0891b2"} />
                <Text style={styles.sectionTitle}>Job Description</Text>
              </View>
              <Text style={styles.sectionText}>{jobData.description}</Text>
            </Animated.View>

            {/* Skills */}
            {jobData.skills && jobData.skills.length > 0 && (
              <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.section}>
                <View style={styles.sectionTitle}>
                  <Ionicons name="flash" size={24} color={darkMode ? "#06b6d4" : "#0891b2"} />
                  <Text style={styles.sectionTitle}>Required Skills</Text>
                </View>
                <View style={styles.skillsContainer}>
                  {jobData.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>

          {/* Sidebar */}
          <View style={isLargeScreen ? { flex: 1, gap: 20 } : { width: '100%', gap: 20 }}>
            <Animated.View entering={FadeIn.duration(500).delay(300)} style={styles.sidebarCard}>
              <Text style={styles.sidebarTitle}>Job Overview</Text>
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Category:</Text>
                <Text style={styles.sidebarValue}>{jobData.category}</Text>
              </View>
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Experience:</Text>
                <Text style={styles.sidebarValue}>{jobData.experience || "Not specified"}</Text>
              </View>
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Education:</Text>
                <Text style={styles.sidebarValue}>{jobData.education || "Not specified"}</Text>
              </View>
              {jobData.gender && (
                <View style={styles.sidebarItem}>
                  <Text style={styles.sidebarLabel}>Gender:</Text>
                  <Text style={styles.sidebarValue}>{jobData.gender}</Text>
                </View>
              )}
            </Animated.View>

            <Animated.View entering={FadeIn.duration(500).delay(400)} style={styles.sidebarCard}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" })}
              >
                <Ionicons name="eye" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>View Job Listings</Text>
              </TouchableOpacity>

              {user?.roles?.includes('admin') ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate("JobAdmin" as never)}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Moderate Jobs</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={handleEdit}
                >
                  <Ionicons name="create" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Edit Job Details</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.successText}>
                {user?.roles?.includes('admin')
                  ? "As an admin, your job is active and you can moderate others."
                  : "Your job has been submitted and is waiting for admin approval!"}
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PreviewJob;
