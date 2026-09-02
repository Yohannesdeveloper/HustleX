/**
 * React Native FreelancerProfileSetup Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Multi-step wizard for freelancer profile creation
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiServiceModule from "../services/api-react-native";

// Handle both default export and named export patterns (for React Native/Metro bundler compatibility)
// Some bundlers wrap default exports, so we check both .default and the direct import
const apiService: any = (apiServiceModule as any)?.default || apiServiceModule || (apiServiceModule as any);

// Runtime check to ensure apiService is properly initialized
if (!apiService || typeof apiService.uploadAvatar !== 'function') {
  console.error('CRITICAL: apiService.uploadAvatar is not available. apiService:', apiService);
  console.error('Available methods:', Object.keys(apiService || {}));
  // Don't throw here as it would break rendering - just log the error
}
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  profilePicture: any | null;
  profilePicturePreview: string | null;
  experienceLevel: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  cvFile: any | null;
  existingCvUrl: string;
  bio: string;
  education: string;
  workExperience: string;
  skills: string[];
  primarySkill: string;
  yearsOfExperience: string;
  certifications: string[];
  availability: string;
  monthlyRate: string;
  currency: string;
  preferredJobTypes: string[];
  workLocation: string;
  websiteUrl: string;
}

const steps = [
  { id: 1, title: "Basic Information", description: "Tell us about yourself" },
  { id: 2, title: "Professional Details", description: "Share your experience and links" },
  { id: 3, title: "Review & Submit", description: "Review your profile" },
];

const FreelancerProfileSetup: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    profilePicture: null,
    profilePicturePreview: user?.profile?.avatar && apiService?.getFileUrl ? apiService.getFileUrl(user?.profile?.avatar) : null,
    experienceLevel: user?.profile?.experienceLevel || "",
    portfolioUrl: user?.profile?.portfolioUrl || "",
    linkedinUrl: user?.profile?.linkedinUrl || "",
    githubUrl: user?.profile?.githubUrl || "",
    cvFile: null,
    existingCvUrl: user?.profile?.cvUrl || "",
    bio: user?.profile?.bio || "",
    education: user?.profile?.education || "",
    workExperience: user?.profile?.workExperience || "",
    skills: user?.profile?.skills || [],
    primarySkill: user?.profile?.primarySkill || "",
    yearsOfExperience: user?.profile?.yearsOfExperience || "",
    certifications: user?.profile?.certifications || [],
    availability: user?.profile?.availability || "Available",
    monthlyRate: user?.profile?.monthlyRate || "",
    currency: user?.profile?.currency || "USD",
    preferredJobTypes: user?.profile?.preferredJobTypes || [],
    workLocation: user?.profile?.workLocation || "Remote",
    websiteUrl: user?.profile?.websiteUrl || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);

  const experienceLevels = [
    "Beginner (0-2 years)",
    "Intermediate (2-5 years)",
    "Advanced (5-10 years)",
    "Expert (10+ years)",
  ];

  useEffect(() => {
    if (user && !dataLoaded) {
      setProfileData({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        location: user.profile?.location || "",
        profilePicture: null,
        profilePicturePreview: user.profile?.avatar && apiService?.getFileUrl ? apiService.getFileUrl(user.profile.avatar) : null,
        experienceLevel: user.profile?.experienceLevel || "",
        portfolioUrl: user.profile?.portfolioUrl || "",
        linkedinUrl: user.profile?.linkedinUrl || "",
        githubUrl: user.profile?.githubUrl || "",
        cvFile: null,
        existingCvUrl: user.profile?.cvUrl || "",
        bio: user.profile?.bio || "",
        education: user.profile?.education || "",
        workExperience: user.profile?.workExperience || "",
        skills: user.profile?.skills || [],
        primarySkill: user.profile?.primarySkill || "",
        yearsOfExperience: user.profile?.yearsOfExperience || "",
        certifications: user.profile?.certifications || [],
        availability: user.profile?.availability || "Available",
        monthlyRate: user.profile?.monthlyRate || "",
        currency: user.profile?.currency || "USD",
        preferredJobTypes: user.profile?.preferredJobTypes || [],
        workLocation: user.profile?.workLocation || "Remote",
        websiteUrl: user.profile?.websiteUrl || "",
      });
      setDataLoaded(true);
    }
  }, [user, dataLoaded]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigation.navigate("Signup" as never);
    }
  }, [isAuthenticated, authLoading, navigation]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerTextContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    headerSubtitle: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    progressBar: {
      height: 4,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#06b6d4",
    },
    progressDots: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    progressDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 100, // Adequate padding to ensure content is accessible
    },
    stepContent: {
      gap: 20,
    },
    stepTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
      textAlign: "center",
    },
    stepDescription: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 24,
    },
    profilePictureContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    profilePictureButton: {
      width: 128,
      height: 128,
      borderRadius: 64,
      borderWidth: 4,
      borderStyle: "dashed",
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
      overflow: "hidden",
      marginBottom: 12,
    },
    profilePicture: {
      width: "100%",
      height: "100%",
    },
    profilePicturePlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
    },
    profilePictureText: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginTop: 4,
    },
    inputRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    inputHalf: {
      flex: 1,
    },
    inputFull: {
      width: "100%",
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
      marginBottom: 8,
    },
    input: {
      height: 50,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    textArea: {
      minHeight: 100,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
      textAlignVertical: "top",
    },
    pickerButton: {
      height: 50,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    pickerButtonText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
    cvUploadButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 20,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    cvUploadText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    existingCvBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderRadius: 8,
      marginBottom: 12,
    },
    existingCvText: {
      fontSize: 14,
      color: "#06b6d4",
      fontWeight: "600",
    },
    removeButton: {
      alignSelf: "flex-start",
      marginTop: 8,
    },
    removeButtonText: {
      fontSize: 14,
      color: "#ef4444",
      fontWeight: "600",
    },
    reviewSection: {
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    reviewProfilePicture: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    reviewProfilePicturePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(209, 213, 219, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    reviewInitials: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    reviewNameContainer: {
      flex: 1,
    },
    reviewName: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    reviewSubtitle: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    reviewDetails: {
      gap: 12,
    },
    reviewRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    reviewLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
    },
    reviewValue: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      flex: 1,
      textAlign: "right",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonSecondary: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    buttonPrimary: {
      backgroundColor: "#06b6d4",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
    },
    buttonTextSecondary: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    buttonTextPrimary: {
      color: "#ffffff",
    },
    pickerModal: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    pickerContent: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "50%",
    },
    pickerItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    pickerItemText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
  }), [darkMode]);

  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const updateData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePicturePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        updateData("profilePicture", asset);
        updateData("profilePicturePreview", asset.uri);
      }
    } catch (error) {
      console.error("Error picking profile picture:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCvPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert("Error", "CV file size must be less than 10MB.");
          return;
        }
        updateData("cvFile", file);
      }
    } catch (error) {
      console.error("Error picking CV:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSubmit = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.location) {
      Alert.alert("Error", "Please fill in all required fields in Step 1");
      setCurrentStep(1);
      return;
    }

    if (
      !profileData.bio ||
      !profileData.education ||
      !profileData.workExperience ||
      !profileData.skills.length ||
      !profileData.experienceLevel ||
      !profileData.yearsOfExperience ||
      (!profileData.cvFile && !profileData.existingCvUrl)
    ) {
      Alert.alert("Error", "Please fill in all required fields in Step 2");
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    try {
      let cvUrl = "";
      let avatarUrl = "";

      if (profileData.profilePicture) {
        try {
          const uploadResponse = await apiService.uploadAvatar(profileData.profilePicture);
          avatarUrl = uploadResponse.fileUrl;
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          Alert.alert("Error", "Failed to upload profile picture. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      if (profileData.cvFile) {
        try {
          const uploadResponse = await apiService.uploadCV(profileData.cvFile);
          cvUrl = uploadResponse.fileUrl;
        } catch (uploadError) {
          console.error("Error uploading CV:", uploadError);
          Alert.alert("Error", "Failed to upload CV. Please try again.");
          setSubmitting(false);
          return;
        }
      } else if (profileData.existingCvUrl) {
        cvUrl = profileData.existingCvUrl;
      }

      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        education: profileData.education,
        workExperience: profileData.workExperience,
        skills: profileData.skills,
        primarySkill: profileData.primarySkill || profileData.skills[0] || "",
        experienceLevel: profileData.experienceLevel,
        yearsOfExperience: profileData.yearsOfExperience,
        portfolioUrl: profileData.portfolioUrl,
        certifications: profileData.certifications,
        availability: profileData.availability,
        monthlyRate: profileData.monthlyRate,
        currency: profileData.currency,
        preferredJobTypes: profileData.preferredJobTypes,
        workLocation: profileData.workLocation,
        linkedinUrl: profileData.linkedinUrl,
        githubUrl: profileData.githubUrl,
        websiteUrl: profileData.websiteUrl,
        cvUrl: cvUrl,
        avatar: avatarUrl,
      };

      await apiService.saveFreelancerProfile(payload);

      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert("Success", "Profile submitted successfully! Redirecting to dashboard...");
      navigation.navigate("FreelancingDashboard" as never);
    } catch (error: any) {
      console.error("Error saving freelancer profile:", error);
      if (error?.response?.status === 401) {
        Alert.alert("Session Expired", "Your session has expired. Please log in again.");
        navigation.navigate("Signup" as never);
        return;
      }
      Alert.alert("Error", error?.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>Let's start with your personal details</Text>

            <View style={styles.profilePictureContainer}>
              <TouchableOpacity style={styles.profilePictureButton} onPress={handleProfilePicturePick}>
                {profileData.profilePicturePreview ? (
                  <Image
                    source={{ uri: profileData.profilePicturePreview }}
                    style={styles.profilePicture}
                  />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Ionicons name="person" size={48} color={darkMode ? "#9ca3af" : "#6b7280"} />
                    <Text style={styles.profilePictureText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {profileData.profilePicture && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    updateData("profilePicture", null);
                    updateData("profilePicturePreview", null);
                  }}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={profileData.firstName}
                  onChangeText={(text) => updateData("firstName", text)}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={profileData.lastName}
                  onChangeText={(text) => updateData("lastName", text)}
                />
              </View>
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.email}
                onChangeText={(text) => updateData("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+251 XXX XXX XXX"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.phone}
                onChangeText={(text) => updateData("phone", text)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="City, Country"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.location}
                onChangeText={(text) => updateData("location", text)}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Professional Details</Text>
            <Text style={styles.stepDescription}>Share your experience and professional links</Text>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Bio *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself, your background, and what makes you unique..."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.bio}
                onChangeText={(text) => updateData("bio", text)}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Education *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="List your educational background, degrees, certifications, etc."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.education}
                onChangeText={(text) => updateData("education", text)}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Work Experience *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your professional experience, previous roles, achievements, etc."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.workExperience}
                onChangeText={(text) => updateData("workExperience", text)}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Skills * (comma-separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., JavaScript, React, Node.js, Python"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={(profileData.skills || []).join(", ")}
                onChangeText={(text) =>
                  updateData(
                    "skills",
                    text.split(",").map((s) => s.trim()).filter((s) => s)
                  )
                }
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Experience Level *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowExperiencePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {profileData.experienceLevel || "Select Experience Level"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Years of Experience *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.yearsOfExperience}
                onChangeText={(text) => updateData("yearsOfExperience", text)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>Portfolio URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://yourportfolio.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={profileData.portfolioUrl}
                onChangeText={(text) => updateData("portfolioUrl", text)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>LinkedIn URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://linkedin.com/in/..."
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={profileData.linkedinUrl}
                  onChangeText={(text) => updateData("linkedinUrl", text)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>GitHub URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://github.com/..."
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={profileData.githubUrl}
                  onChangeText={(text) => updateData("githubUrl", text)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputFull}>
              <Text style={styles.label}>CV/Resume *</Text>
              {profileData.existingCvUrl && !profileData.cvFile ? (
                <View style={styles.existingCvBox}>
                  <Ionicons name="document" size={24} color="#06b6d4" />
                  <Text style={styles.existingCvText}>Current CV available</Text>
                </View>
              ) : null}
              <TouchableOpacity style={styles.cvUploadButton} onPress={handleCvPick}>
                <Ionicons name="document" size={24} color="#06b6d4" />
                <Text style={styles.cvUploadText}>
                  {profileData.cvFile?.name || "Click to upload your CV/Resume"}
                </Text>
              </TouchableOpacity>
              {profileData.cvFile ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => updateData("cvFile", null)}
                >
                  <Text style={styles.removeButtonText}>Remove new file</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Your Profile</Text>
            <Text style={styles.stepDescription}>Please review your information before submitting</Text>

            <View style={styles.reviewSection}>
              <View style={styles.reviewHeader}>
                {profileData.profilePicturePreview ? (
                  <Image
                    source={{ uri: profileData.profilePicturePreview }}
                    style={styles.reviewProfilePicture}
                  />
                ) : (
                  <View style={styles.reviewProfilePicturePlaceholder}>
                    <Text style={styles.reviewInitials}>
                      {(profileData.firstName?.charAt(0) ?? '')}
                      {(profileData.lastName?.charAt(0) ?? '')}
                    </Text>
                  </View>
                )}
                <View style={styles.reviewNameContainer}>
                  <Text style={styles.reviewName}>
                    {([profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || '')}
                  </Text>
                  <Text style={styles.reviewSubtitle}>
                    {[profileData.experienceLevel, profileData.location].filter(Boolean).join(' • ') || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewDetails}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Email:</Text>
                  <Text style={styles.reviewValue}>{profileData.email || ''}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Phone:</Text>
                  <Text style={styles.reviewValue}>{profileData.phone || "Not provided"}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Location:</Text>
                  <Text style={styles.reviewValue}>{profileData.location || ''}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Bio:</Text>
                  <Text style={styles.reviewValue}>{profileData.bio || ''}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Skills:</Text>
                  <Text style={styles.reviewValue}>{profileData.skills?.join(", ") || ''}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Experience Level:</Text>
                  <Text style={styles.reviewValue}>{profileData.experienceLevel || ''}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {profileData.profilePicturePreview ? (
            <Image
              source={{ uri: profileData.profilePicturePreview }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#06b6d4",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 18 }}>
                {(profileData.firstName?.charAt(0) ?? '')}
                {(profileData.lastName?.charAt(0) ?? '')}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <TouchableOpacity onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("FreelancingDashboard" as never);
              }
            }} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Freelancer Profile Setup</Text>
              <Text style={styles.headerSubtitle}>
                Step {currentStep} of {steps.length}{(steps[currentStep - 1]?.title ? `: ${steps[currentStep - 1]?.title}` : '')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.progressDots}>
          {steps.map((step) => (
            <View
              key={step.id}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step.id < currentStep
                      ? "#06b6d4"
                      : step.id === currentStep
                        ? "#06b6d4"
                        : darkMode
                          ? "#4b5563"
                          : "#d1d5db",
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${(currentStep / steps.length) * 100}%`,
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled={true}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Animated.View
            key={currentStep}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            {renderStep()}
          </Animated.View>

          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.buttonTextSecondary}>Previous</Text>
              </TouchableOpacity>
            )}
            {currentStep < steps.length ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  (!profileData.firstName ||
                    !profileData.lastName ||
                    !profileData.email ||
                    !profileData.location) &&
                  styles.buttonDisabled,
                ]}
                onPress={() => setCurrentStep(currentStep + 1)}
                disabled={
                  !profileData.firstName ||
                  !profileData.lastName ||
                  !profileData.email ||
                  !profileData.location
                }
              >
                <Text style={styles.buttonTextPrimary}>Next Step</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonTextPrimary}>Submit Profile</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Experience Level Picker Modal */}
      {showExperiencePicker && (
        <Modal
          visible={showExperiencePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowExperiencePicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContent}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={styles.stepTitle}>Select Experience Level</Text>
                <TouchableOpacity onPress={() => setShowExperiencePicker(false)}>
                  <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {experienceLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={styles.pickerItem}
                    onPress={() => {
                      updateData("experienceLevel", level);
                      setShowExperiencePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FreelancerProfileSetup;
