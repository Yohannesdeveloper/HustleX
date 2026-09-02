/**
 * React Native CompanyProfile Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const CompanyProfile: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();

  const [companyData, setCompanyData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    foundedYear: "",
    registrationNumber: "",
    taxId: "",
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<any>(null);
  const [tradeLicense, setTradeLicense] = useState<string | null>(null);
  const [tradeLicensePath, setTradeLicensePath] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Consulting",
    "Media & Entertainment",
    "Transportation",
    "Agriculture",
    "Construction",
    "Other",
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const companyProfile = await apiService.getCompanyProfile();

        const mapCompanySizeBack = (size: string) => {
          const sizeMap: { [key: string]: string } = {
            "1-10": "1-10 employees",
            "11-50": "11-50 employees",
            "51-200": "51-200 employees",
            "201-500": "201-500 employees",
            "500+": "1000+ employees",
          };
          return sizeMap[size] || size;
        };

        setCompanyData({
          companyName: companyProfile.companyName || "",
          industry: companyProfile.industry || "",
          companySize: mapCompanySizeBack(companyProfile.companySize) || "",
          website: companyProfile.website || "",
          description: companyProfile.description || "",
          address: companyProfile.location || "",
          phone: companyProfile.contactPhone || "",
          email: companyProfile.contactEmail || "",
          foundedYear: companyProfile.foundedYear?.toString() || "",
          registrationNumber: companyProfile.registrationNumber || "",
          taxId: companyProfile.taxId || "",
        });

        if (companyProfile.logo) {
          if (companyProfile.logo.startsWith("http") || companyProfile.logo.startsWith("data:")) {
            setLogo(companyProfile.logo);
            setLogoPath(companyProfile.logo);
          } else {
            setLogo(apiService.getFileUrl(companyProfile.logo));
            setLogoPath(companyProfile.logo);
          }
        } else {
          setLogo(null);
          setLogoPath(null);
        }

        if (companyProfile.tradeLicense) {
          if (
            companyProfile.tradeLicense.startsWith("http") ||
            companyProfile.tradeLicense.startsWith("data:")
          ) {
            setTradeLicense(companyProfile.tradeLicense);
            setTradeLicensePath(companyProfile.tradeLicense);
          } else {
            setTradeLicense(apiService.getFileUrl(companyProfile.tradeLicense));
            setTradeLicensePath(companyProfile.tradeLicense);
          }
        } else {
          setTradeLicense(null);
          setTradeLicensePath(null);
        }
        setIsVerified(companyProfile.verificationStatus === "verified");

        if (companyProfile.verificationStatus === "verified") {
          navigation.navigate("HiringDashboard" as never);
        }
      } catch (error: any) {
        // Only log if it's not a 404 (expected for new users without company profile)
        if (error?.status !== 404 && !error?.isNotFound) {
          console.error("Error fetching company profile:", error);
        } else {
          console.log("No existing company profile found, inheriting from user profile");
        }
        if (user?.profile) {
          const companyNameFromUser =
            user.profile.firstName && user.profile.lastName
              ? `${user.profile.firstName} ${user.profile.lastName} Company`
              : user.profile.firstName
                ? `${user.profile.firstName} Company`
                : "";

          setCompanyData((prev) => ({
            ...prev,
            companyName: companyNameFromUser,
            phone: user.profile.phone || "",
            email: user.email || "",
            address: user.profile.location || "",
            description: user.profile.bio || "",
            website: user.profile.websiteUrl || user.profile.website || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [navigation, user]);

  const handleLogoPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setLogoFile(asset);
        setLogo(asset.uri);
        setLogoPath(null);
      }
    } catch (error) {
      console.error("Error picking logo:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTradeLicensePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setTradeLicenseFile(file);
        if (file.uri) {
          setTradeLicense(file.uri);
        }
        setTradeLicensePath(null);
      }
    } catch (error) {
      console.error("Error picking trade license:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSave = async () => {
    const isPrivateClient = !companyData.companyName.trim();

    const requiredFields = [
      { field: "industry", value: companyData.industry, label: "Industry" },
      { field: "companySize", value: companyData.companySize, label: "Company Size" },
      { field: "phone", value: companyData.phone, label: "Phone" },
      { field: "email", value: companyData.email, label: "Email" },
      { field: "description", value: companyData.description, label: "Company Description" },
      { field: "address", value: companyData.address, label: "Address" },
    ];

    if (!isPrivateClient) {
      requiredFields.unshift({
        field: "companyName",
        value: companyData.companyName,
        label: "Company Name",
      });
    }

    const missingFields = requiredFields.filter((field) => !field.value.trim());

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((field) => field.label).join(", ");
      Alert.alert("Missing Fields", `Please fill in all required fields: ${fieldNames}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (companyData.phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number");
      return;
    }

    setSaving(true);
    try {
      let logoUrl = "";
      let tradeLicenseUrl = "";

      if (logoFile) {
        try {
          const uploadResult = await apiService.uploadLogo(logoFile);
          logoUrl = uploadResult.fileUrl;
          setLogoPath(uploadResult.fileUrl);
          setLogoFile(null);
        } catch (uploadError) {
          console.error("Logo upload failed:", uploadError);
          Alert.alert("Warning", "Failed to upload logo. Continuing without logo.");
        }
      }

      if (tradeLicenseFile) {
        try {
          const uploadResult = await apiService.uploadTradeLicense(tradeLicenseFile);
          tradeLicenseUrl = uploadResult.fileUrl;
          setTradeLicensePath(uploadResult.fileUrl);
          setTradeLicenseFile(null);
        } catch (uploadError) {
          console.error("Trade license upload failed:", uploadError);
        }
      }

      const mapCompanySize = (size: string) => {
        const sizeMap: { [key: string]: string } = {
          "1-10 employees": "1-10",
          "11-50 employees": "11-50",
          "51-200 employees": "51-200",
          "201-500 employees": "201-500",
          "501-1000 employees": "201-500",
          "1000+ employees": "500+",
        };
        return sizeMap[size] || size;
      };

      const companyProfileData = {
        companyName: companyData.companyName,
        industry: companyData.industry,
        companySize: mapCompanySize(companyData.companySize),
        website: companyData.website,
        location: companyData.address,
        description: companyData.description,
        contactEmail: companyData.email,
        contactPhone: companyData.phone,
        foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
        registrationNumber: companyData.registrationNumber,
        taxId: companyData.taxId,
        logo: logoUrl || logoPath,
        tradeLicense: tradeLicenseUrl || tradeLicensePath,
      };

      await apiService.updateCompanyProfile(companyProfileData);
      setIsVerified(true);
      Alert.alert("Success", "Company profile saved successfully!");
      setTimeout(() => {
        navigation.navigate("HiringDashboard" as never);
      }, 2000);
    } catch (error) {
      console.error("Error saving company profile:", error);
      Alert.alert("Error", "Failed to save company profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
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
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    verifiedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    verifiedText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#22c55e",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingTop: 30,
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
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    logoPreview: {
      width: 96,
      height: 96,
      borderRadius: 12,
      borderWidth: 4,
      borderStyle: "dashed",
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
    },
    logoImage: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    logoInfo: {
      flex: 1,
    },
    logoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    logoDescription: {
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
    documentContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    documentPreview: {
      flex: 1,
      padding: 16,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.5)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
    },
    documentText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    saveButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>
          Loading company profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Profile</Text>
        </View>
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Logo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={24} color="#a855f7" />
            <Text style={styles.sectionTitle}>Company Logo</Text>
          </View>

          <View style={styles.logoContainer}>
            <TouchableOpacity style={styles.logoPreview} onPress={handleLogoPick}>
              {logo ? (
                <Image source={{ uri: logo }} style={styles.logoImage} />
              ) : (
                <Ionicons name="business" size={32} color={darkMode ? "#9ca3af" : "#6b7280"} />
              )}
            </TouchableOpacity>
            <View style={styles.logoInfo}>
              <Text style={styles.logoTitle}>Upload Company Logo</Text>
              <Text style={styles.logoDescription}>
                Choose a professional logo. Recommended size: 400x400px
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleLogoPick}>
                <Ionicons name="camera" size={16} color="#ffffff" />
                <Text style={styles.uploadButtonText}>Choose Logo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Company Information</Text>
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>
              Company Name{" "}
              {!companyData.companyName.trim() && (
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>(optional for private clients)</Text>
              )}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                companyData.companyName.trim()
                  ? "Enter your company name"
                  : "Leave blank for private clients"
              }
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={companyData.companyName}
              onChangeText={(text) => setCompanyData((prev) => ({ ...prev, companyName: text }))}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Industry *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowIndustryPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {companyData.industry || "Select Industry"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Company Size *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSizePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {companyData.companySize || "Select Size"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="https://yourcompany.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.website}
                onChangeText={(text) => setCompanyData((prev) => ({ ...prev, website: text }))}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="+251 XXX XXX XXX"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.phone}
                onChangeText={(text) => setCompanyData((prev) => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="contact@yourcompany.com"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.email}
                onChangeText={(text) => setCompanyData((prev) => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Founded Year</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.foundedYear}
                onChangeText={(text) => setCompanyData((prev) => ({ ...prev, foundedYear: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>Company Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your company, mission, and what you do..."
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={companyData.description}
              onChangeText={(text) => setCompanyData((prev) => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputFull}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Company address"
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={companyData.address}
              onChangeText={(text) => setCompanyData((prev) => ({ ...prev, address: text }))}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#22c55e" />
            <Text style={styles.sectionTitle}>Legal Documents (Optional)</Text>
          </View>

          <View style={styles.documentContainer}>
            <View style={styles.documentPreview}>
              <Text style={styles.documentText}>
                {tradeLicense ? "Trade License uploaded" : "No trade license uploaded"}
              </Text>
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={handleTradeLicensePick}>
              <Ionicons name="document" size={16} color="#ffffff" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.registrationNumber}
                onChangeText={(text) =>
                  setCompanyData((prev) => ({ ...prev, registrationNumber: text }))
                }
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Tax ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={companyData.taxId}
                onChangeText={(text) => setCompanyData((prev) => ({ ...prev, taxId: text }))}
              />
            </View>
          </View>
        </View>

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
              <Text style={styles.saveButtonText}>Save Company Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Industry Picker Modal */}
      {showIndustryPicker && (
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
              <Text style={styles.sectionTitle}>Select Industry</Text>
              <TouchableOpacity onPress={() => setShowIndustryPicker(false)}>
                <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {industries.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCompanyData((prev) => ({ ...prev, industry }));
                    setShowIndustryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{industry}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Size Picker Modal */}
      {showSizePicker && (
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
              <Text style={styles.sectionTitle}>Select Company Size</Text>
              <TouchableOpacity onPress={() => setShowSizePicker(false)}>
                <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {companySizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCompanyData((prev) => ({ ...prev, companySize: size }));
                    setShowSizePicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CompanyProfile;
