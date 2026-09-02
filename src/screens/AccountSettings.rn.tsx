/**
 * React Native AccountSettings Screen (Profile)
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const AccountSettings: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user, refreshUser } = useAuth();

  const [settings, setSettings] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    status: user?.roles?.includes("freelancer") ? "freelancer" : "client",
    location: user?.profile?.location || "",
    linkedin: user?.profile?.linkedinUrl || "",
    github: user?.profile?.githubUrl || "",
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.profile?.avatar ? apiService.getFileUrl(user.profile.avatar) : null
  );
  const [profilePictureFile, setProfilePictureFile] = useState<any>(null);
  const [cvFile, setCvFile] = useState<any>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string>(user?.profile?.portfolioUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
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
        setProfilePictureFile(asset);
        setProfilePicture(asset.uri);
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
        setCvFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking CV:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSave = async () => {
    if (!settings.firstName || !settings.lastName || !settings.email || !settings.phone || !settings.location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const desiredRole = settings.status as "freelancer" | "client";
      if (!user?.roles?.includes(desiredRole)) {
        await apiService.addRole(desiredRole);
      }

      let avatarUrl: string | undefined = undefined;
      let cvUrl: string | undefined = undefined;

      if (profilePictureFile) {
        const up = await apiService.uploadAvatar(profilePictureFile);
        avatarUrl = up.fileUrl;
      }
      if (cvFile) {
        const up = await apiService.uploadCV(cvFile);
        cvUrl = up.fileUrl;
      }

      await apiService.updateMyProfile({
        firstName: settings.firstName,
        lastName: settings.lastName,
        phone: settings.phone,
        location: settings.location,
        linkedin: settings.linkedin || undefined,
        github: settings.github || undefined,
        portfolio: portfolioUrl,
        avatar: avatarUrl,
      });

      setSuccess("Settings saved successfully!");
      if (refreshUser) {
        await refreshUser();
      }
      setTimeout(() => {
        (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" });
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Failed to save settings");
      Alert.alert("Error", e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    {
      value: "freelancer",
      label: "Freelancer",
      icon: "briefcase",
      description: "Offer your skills and services",
    },
    {
      value: "client",
      label: "Client",
      icon: "business",
      description: "Hire talented freelancers",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    section: {
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    profilePictureContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    profilePictureButton: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 4,
      borderStyle: "dashed",
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
    },
    profilePicture: {
      width: "100%",
      height: "100%",
    },
    profilePictureInfo: {
      flex: 1,
    },
    profilePictureTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    profilePictureDescription: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 12,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: "#a855f7",
      gap: 8,
    },
    uploadButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
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
    statusGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    statusCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
    },
    statusCardSelected: {
      borderColor: "#3b82f6",
      backgroundColor: darkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
    },
    statusCardUnselected: {
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    statusIcon: {
      marginBottom: 8,
    },
    statusLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    statusDescription: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      backgroundColor: "#3b82f6",
      gap: 8,
      alignSelf: "flex-end",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    errorText: {
      fontSize: 14,
      color: "#ef4444",
      marginTop: 8,
    },
    successText: {
      fontSize: 14,
      color: "#10b981",
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Picture */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>Profile Picture *</Text>
          </View>

          <View style={styles.profilePictureContainer}>
            <TouchableOpacity style={styles.profilePictureButton} onPress={handleProfilePicturePick}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
              ) : (
                <Ionicons name="person" size={32} color={darkMode ? "#9ca3af" : "#6b7280"} />
              )}
            </TouchableOpacity>
            <View style={styles.profilePictureInfo}>
              <Text style={styles.profilePictureTitle}>Upload Profile Picture</Text>
              <Text style={styles.profilePictureDescription}>
                Choose a photo that represents you. Recommended size: 400x400px
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleProfilePicturePick}>
                <Ionicons name="camera" size={16} color="#ffffff" />
                <Text style={styles.uploadButtonText}>Choose Image</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Upload CV (PDF/DOC) *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleCvPick}>
                <Ionicons name="document" size={16} color="#ffffff" />
                <Text style={styles.uploadButtonText}>
                  {cvFile ? cvFile.name : "Choose CV"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Portfolio URL *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://yourportfolio.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={settings.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={settings.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
              />
            </View>
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={settings.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={settings.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="City, Country"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={settings.location}
                onChangeText={(text) => handleInputChange("location", text)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>LinkedIn</Text>
              <TextInput
                style={styles.input}
                placeholder="https://linkedin.com/in/..."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={settings.linkedin}
                onChangeText={(text) => handleInputChange("linkedin", text)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>GitHub</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/..."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={settings.github}
                onChangeText={(text) => handleInputChange("github", text)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Account Status</Text>
          </View>

          <Text style={styles.label}>Select Your Status *</Text>
          <View style={styles.statusGrid}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusCard,
                  settings.status === status.value
                    ? styles.statusCardSelected
                    : styles.statusCardUnselected,
                ]}
                onPress={() => handleInputChange("status", status.value)}
              >
                <Ionicons
                  name={status.icon as any}
                  size={24}
                  color={settings.status === status.value ? "#3b82f6" : darkMode ? "#9ca3af" : "#6b7280"}
                  style={styles.statusIcon}
                />
                <Text style={styles.statusLabel}>{status.label}</Text>
                <Text style={styles.statusDescription}>{status.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Complete Registration</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && <Text style={styles.successText}>{success}</Text>}
      </ScrollView>
    </View>
  );
};

export default AccountSettings;
