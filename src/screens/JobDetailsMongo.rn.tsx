/**
 * React Native JobDetailsMongo Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal,
  TextInput,
  Share,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import apiService from "../services/api-react-native";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useWebSocket } from "../context/WebSocketContext-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface JobPost {
  _id: string;
  title: string;
  description: string;
  company?: string;
  budget: string;
  duration?: string;
  category: string;
  jobType?: string;
  workLocation?: string;
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
  jobSite?: string;
  jobSector?: string;
  compensationType?: string;
  compensationAmount?: string;
  currency?: string;
  deadline?: string;
  address?: string;
  country?: string;
  city?: string;
  jobLink?: string;
  visibility?: string;
}

const JobDetailsMongo: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { jobId } = (route.params as any) || {};
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { onNewApplication, offNewApplication } = useWebSocket();
  const { user: currentUser } = useAuth();

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<any>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (!currentUser || !job) return;
    checkApplication();
  }, [currentUser, job]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const jobData = await apiService.getJob(jobId);
      setJob(jobData as JobPost);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const response = await apiService.checkApplication(job!._id);
      setApplied(response.hasApplied);
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      navigation.navigate("Signup" as never);
      return;
    }
    if (job?.postedBy?._id === currentUser._id) {
      Alert.alert("Cannot Apply", "You cannot apply to your own job posting.");
      return;
    }
    setShowApplicationForm(true);
  };

  const handleCvPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "CV file size must be less than 5MB.");
          return;
        }
        setCvFile(file);
      }
    } catch (error) {
      console.error("Error picking CV:", error);
    }
  };

  const handleSubmitApplication = async () => {
    if (!currentUser || !job) {
      Alert.alert("Error", "Please ensure you are logged in and job details are available.");
      return;
    }

    if (!coverLetter.trim()) {
      Alert.alert("Error", "Please provide a cover letter.");
      return;
    }

    if (!cvFile && !currentUser?.profile?.cvUrl) {
      Alert.alert("Error", "Please upload a CV or ensure you have one in your profile.");
      return;
    }

    setApplying(true);
    try {
      let cvUrl = "";

      if (cvFile) {
        const uploadResponse = await apiService.uploadCV(cvFile);
        cvUrl = apiService.getFileUrl(uploadResponse.fileUrl);
      } else if (currentUser?.profile?.cvUrl) {
        cvUrl = apiService.getFileUrl(currentUser.profile.cvUrl);
      }

      let processedPortfolioUrl = "";
      if (portfolioLink.trim()) {
        let url = portfolioLink.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        processedPortfolioUrl = url;
      }

      const payload: any = {
        jobId: job._id,
        coverLetter: coverLetter.trim(),
      };

      if (cvUrl) payload.cvUrl = cvUrl;
      if (processedPortfolioUrl) payload.portfolioUrl = processedPortfolioUrl;

      await apiService.submitApplication(payload);
      setApplied(true);
      setCoverLetter("");
      setCvFile(null);
      setPortfolioLink("");
      setShowApplicationForm(false);
      Alert.alert("Success", "Application submitted successfully!");
      navigation.navigate("HiringDashboard" as never);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently posted";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 8,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
    },
    company: {
      fontSize: 18,
      color: darkMode ? "#d1d5db" : "#4b5563",
      marginBottom: 16,
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    infoCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    infoLabel: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      textAlign: "center",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: darkMode ? "#d1d5db" : "#4b5563",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillTag: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    skillText: {
      color: "#06b6d4",
      fontWeight: "600",
    },
    applyButton: {
      backgroundColor: "#06b6d4",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 24,
      marginBottom: 16,
    },
    applyButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
    visibilityBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
      marginBottom: 16,
    },
    visibilityBadgePublic: {
      backgroundColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
    },
    visibilityBadgePrivate: {
      backgroundColor: darkMode ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
    },
    modal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      width: "90%",
      maxWidth: 500,
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
      borderRadius: 20,
      padding: 24,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
    },
    textArea: {
      minHeight: 150,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      textAlignVertical: "top",
      marginBottom: 16,
    },
    fileButton: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    fileButtonText: {
      color: darkMode ? "#ffffff" : "#000000",
      fontSize: 16,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>
          Loading job details...
        </Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={[styles.title, { color: "#ef4444", marginTop: 16 }]}>
          {error || "Job not found"}
        </Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.applyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
            <Text style={{ color: darkMode ? "#ffffff" : "#000000", fontSize: 16 }}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setLiked(!liked)}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? "#ef4444" : darkMode ? "#ffffff" : "#000000"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setBookmarked(!bookmarked)}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color={bookmarked ? "#fbbf24" : darkMode ? "#ffffff" : "#000000"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={async () => {
                const url = job.jobLink || `https://hustlex.app/job-details/${job._id}`;
                await Share.share({ message: url });
              }}
            >
              <Ionicons name="share-social" size={24} color={darkMode ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title and Company */}
        <Text style={styles.title}>{job.title}</Text>
        {job.visibility && (
          <View style={[
            styles.visibilityBadge,
            job.visibility === "public" ? styles.visibilityBadgePublic : styles.visibilityBadgePrivate
          ]}>
            <Ionicons
              name={job.visibility === "public" ? "eye" : "lock-closed"}
              size={16}
              color={job.visibility === "public" ? "#22c55e" : "#a855f7"}
            />
            <Text style={{
              color: job.visibility === "public" ? "#22c55e" : "#a855f7",
              fontWeight: "600",
              fontSize: 12,
            }}>
              {job.visibility === "public" ? "Public Job" : "Private Job"}
            </Text>
          </View>
        )}
        {job.company && (
          <Text style={styles.company}>
            <Ionicons name="business" size={18} color="#06b6d4" /> {job.company}
          </Text>
        )}

        {/* Job Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={24} color="#06b6d4" />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{job.workLocation || "Remote"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color="#06b6d4" />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{job.duration || "Flexible"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="briefcase" size={24} color="#06b6d4" />
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{job.jobType || "Contract"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color="#06b6d4" />
            <Text style={styles.infoLabel}>Positions</Text>
            <Text style={styles.infoValue}>{job.vacancies || 1}</Text>
          </View>
        </View>

        {/* Budget/Compensation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compensation</Text>
          <Text style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#06b6d4",
          }}>
            {job.compensationAmount && job.currency
              ? `${job.compensationAmount} ${job.currency}`
              : job.budget || "Negotiable"}
          </Text>
          {job.compensationType && (
            <Text style={styles.description}>Type: {job.compensationType}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        {(job.jobSite || job.jobSector || job.deadline || job.address || job.country || job.city || job.jobLink) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {job.jobSite && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="globe" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, flex: 1 }]}>Job Site: {job.jobSite}</Text>
              </View>
            )}
            {job.jobSector && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="layers" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, flex: 1 }]}>Job Sector: {job.jobSector}</Text>
              </View>
            )}
            {job.deadline && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="calendar" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, flex: 1 }]}>
                  Deadline: {formatDate(job.deadline)}
                </Text>
              </View>
            )}
            {job.address && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="location" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, flex: 1 }]}>Address: {job.address}</Text>
              </View>
            )}
            {(job.country || job.city) && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="map" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, flex: 1 }]}>
                  {[job.city, job.country].filter(Boolean).join(", ") || "Not specified"}
                </Text>
              </View>
            )}
            {job.jobLink && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}
                onPress={() => Linking.openURL(job.jobLink!)}
              >
                <Ionicons name="link" size={20} color="#06b6d4" style={{ marginTop: 2 }} />
                <Text style={[styles.description, { marginLeft: 8, color: "#06b6d4", flex: 1 }]}>
                  {job.jobLink}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Job Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Overview</Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.experience || "Any Level"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.infoLabel}>Education</Text>
              <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.education || "Any"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.gender || "Any"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.category}</Text>
            </View>
            {job.jobSite && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={styles.infoLabel}>Job Site</Text>
                <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.jobSite}</Text>
              </View>
            )}
            {job.jobSector && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={styles.infoLabel}>Job Sector</Text>
                <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{job.jobSector}</Text>
              </View>
            )}
            {job.deadline && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={styles.infoLabel}>Deadline</Text>
                <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>{formatDate(job.deadline)}</Text>
              </View>
            )}
            {job.compensationType && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={styles.infoLabel}>Compensation</Text>
                <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]}>
                  {job.compensationType}
                  {job.compensationAmount && job.currency
                    ? ` (${job.compensationAmount} ${job.currency})`
                    : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        {(job.contactEmail || job.contactPhone || job.companyWebsite) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {job.contactEmail && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
                onPress={() => Linking.openURL(`mailto:${job.contactEmail}`)}
              >
                <Ionicons name="mail" size={20} color="#06b6d4" />
                <Text style={[styles.description, { marginLeft: 8, color: "#06b6d4" }]}>
                  {job.contactEmail}
                </Text>
              </TouchableOpacity>
            )}
            {job.contactPhone && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
                onPress={() => Linking.openURL(`tel:${job.contactPhone}`)}
              >
                <Ionicons name="call" size={20} color="#06b6d4" />
                <Text style={[styles.description, { marginLeft: 8, color: "#06b6d4" }]}>
                  {job.contactPhone}
                </Text>
              </TouchableOpacity>
            )}
            {job.companyWebsite && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
                onPress={() => {
                  const url = job.companyWebsite!.startsWith('http')
                    ? job.companyWebsite!
                    : `https://${job.companyWebsite}`;
                  Linking.openURL(url);
                }}
              >
                <Ionicons name="globe" size={20} color="#06b6d4" />
                <Text style={[styles.description, { marginLeft: 8, color: "#06b6d4" }]}>
                  Company Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Apply Button */}
        {applied ? (
          <View style={{
            backgroundColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 24,
          }}>
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#22c55e",
              marginTop: 8,
            }}>
              Application Sent!
            </Text>
            <Text style={[styles.description, { marginTop: 4 }]}>
              We'll be in touch soon.
            </Text>
          </View>
        ) : job.postedBy?._id === currentUser?._id ? (
          <View style={{
            backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 24,
          }}>
            <Ionicons name="briefcase" size={48} color="#06b6d4" />
            <Text style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#06b6d4",
              marginTop: 8,
            }}>
              Your Job Posting
            </Text>
            <TouchableOpacity
              style={[styles.applyButton, { marginTop: 16, backgroundColor: "#06b6d4" }]}
              onPress={() => navigation.navigate("HiringDashboard" as never)}
            >
              <Text style={styles.applyButtonText}>Manage Applications</Text>
            </TouchableOpacity>
          </View>
        ) : !currentUser ? (
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: "#22c55e" }]}
            onPress={() => navigation.navigate("Signup" as never)}
          >
            <Text style={styles.applyButtonText}>Sign In to Apply</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Application Modal */}
      <Modal
        visible={showApplicationForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplicationForm(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Apply for {job.title}</Text>
                <TouchableOpacity onPress={() => setShowApplicationForm(false)}>
                  <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
                </TouchableOpacity>
              </View>

              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: darkMode ? "#ffffff" : "#000000",
                marginBottom: 8,
              }}>
                Cover Letter <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us why you're perfect for this role..."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={8}
                maxLength={2000}
              />
              <Text style={{
                fontSize: 12,
                color: darkMode ? "#9ca3af" : "#6b7280",
                marginBottom: 16,
              }}>
                {coverLetter.length}/2000 characters
              </Text>

              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: darkMode ? "#ffffff" : "#000000",
                marginBottom: 8,
              }}>
                Upload CV (PDF, DOC, DOCX — max 5MB) <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TouchableOpacity style={styles.fileButton} onPress={handleCvPick}>
                <Text style={styles.fileButtonText}>
                  {cvFile ? `Selected: ${cvFile.name}` : "Choose CV File"}
                </Text>
              </TouchableOpacity>
              {currentUser?.profile?.cvUrl && !cvFile && (
                <Text style={{
                  fontSize: 12,
                  color: "#22c55e",
                  marginBottom: 16,
                }}>
                  ✓ CV from Profile available
                </Text>
              )}

              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: darkMode ? "#ffffff" : "#000000",
                marginBottom: 8,
              }}>
                Portfolio Link (Optional)
              </Text>
              <TextInput
                style={[styles.textArea, { minHeight: 50 }]}
                placeholder="https://your-portfolio.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={portfolioLink}
                onChangeText={setPortfolioLink}
                keyboardType="url"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    alignItems: "center",
                  }}
                  onPress={() => setShowApplicationForm(false)}
                >
                  <Text style={{ color: darkMode ? "#ffffff" : "#000000", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applyButton, { flex: 1, marginTop: 0 }]}
                  onPress={handleSubmitApplication}
                  disabled={applying}
                >
                  {applying ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.applyButtonText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default JobDetailsMongo;
