/**
 * React Native PostJob Screen
 * Complete conversion maintaining exact UI/UX and all functionality
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

// Constants
const jobSites = ["Remote", "On-site", "Hybrid"];
const jobSectors = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Design",
  "Writing",
  "Consulting",
  "Other",
];
const compensationTypes = ["Fixed", "Hourly", "Project-based", "Negotiable"];
const currencies = ["USD", "ETB", "EUR", "GBP", "CAD", "AUD"];

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const workLocations = ["Remote", "On-site", "Hybrid"];
const experienceLevels = ["Entry Level", "Junior", "Mid-level", "Senior", "Lead", "Executive"];
const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
  "No Formal Education Required",
];
const genderOptions = ["Any", "Male", "Female", "Non-binary"];

const allSkills = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
  "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust",
  "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap",
  "React Native", "Flutter", "Android (Kotlin)", "iOS (Swift)",
  "SQL", "MongoDB", "PostgreSQL", "MySQL",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "UI/UX", "Figma", "Adobe XD", "Photoshop", "Graphic Design",
  "SEO", "Social Media", "Email Marketing", "Content Writing",
];

const PostJob: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [jobSite, setJobSite] = useState<string>("");
  const [jobSector, setJobSector] = useState<string>("");
  const [compensationType, setCompensationType] = useState<string>("");
  const [compensationAmount, setCompensationAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [deadline, setDeadline] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [workLocation, setWorkLocation] = useState<string>("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [jobLink, setJobLink] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [vacancies, setVacancies] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [postingStatus, setPostingStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const maxDescriptionLength = 5000;
  const descriptionCharsLeft = maxDescriptionLength - description.length;

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Signup" as never);
      return;
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (!deadline) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15);
      setSelectedDate(defaultDate);
      setDeadline(defaultDate.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    const checkPostingStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await apiService.getJobPostingStatus();
          setPostingStatus(status);
        } catch (error) {
          console.error("Error checking posting status:", error);
        } finally {
          setLoadingStatus(false);
        }
      }
    };
    checkPostingStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#ffffff", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ marginTop: 16, color: darkMode ? "#ffffff" : "#000000" }}>
          {t.postJob.checkingAuthentication}
        </Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      navigation.navigate("Signup" as never);
      return;
    }

    if (postingStatus && !postingStatus.canPost) {
      Alert.alert("Error", postingStatus.message || "Please upgrade your plan to post jobs.");
      navigation.navigate("Pricing" as never);
      return;
    }

    if (!title.trim() || !description.trim() || !category.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        title,
        description,
        company,
        category,
        jobSite,
        jobSector,
        compensationType,
        compensationAmount,
        currency,
        budget: compensationAmount ? `${compensationAmount} ${currency}` : "",
        deadline,
        experience,
        jobType,
        workLocation: workLocation || "Remote",
        skills,
        visibility,
        jobLink: jobLink.trim() || null,
        gender,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        address: address.trim() || null,
        country,
        city: city.trim() || null,
        education: education.trim() || null,
        status: "active",
        applicants: 0,
        views: 0,
        jobId: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        postedBy: user._id,
        isActive: true,
        applicationCount: 0,
      };

      const response = await apiService.createJob(jobData);

      const successMessage = user?.roles?.includes('admin')
        ? "Job posted and approved successfully! It is now live on the platform."
        : "Job submitted successfully! It will be reviewed by our team shortly.";

      Alert.alert("Success", successMessage);
      (navigation as any).navigate("PreviewJob", { jobData: response.job });
    } catch (error: any) {
      console.error("Error posting job:", error);
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        Alert.alert("Error", errorData.message || "Please upgrade your plan to post jobs.");
        navigation.navigate("Pricing" as never);
      } else {
        Alert.alert("Error", error.response?.data?.message || "Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      if (skills.length < 6) {
        setSkills((prev) => [...prev, skill]);
      } else {
        Alert.alert("Limit Reached", "Maximum 6 skills allowed. Please remove a skill first.");
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDeadline(selectedDate.toISOString().split('T')[0]);
    }
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
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#374151" : "#e5e7eb",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    headerBackButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 32,
    },
    statusBanner: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 2,
    },
    statusBannerSuccess: {
      backgroundColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
      borderColor: darkMode ? "rgba(34, 197, 94, 0.5)" : "#22c55e",
    },
    statusBannerError: {
      backgroundColor: darkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
      borderColor: darkMode ? "rgba(239, 68, 68, 0.5)" : "#ef4444",
    },
    section: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {
      width: "100%",
      height: 50,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    textArea: {
      width: "100%",
      minHeight: 150,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      textAlignVertical: "top",
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#d1d5db" : "#374151",
      marginBottom: 8,
    },
    picker: {
      width: "100%",
      height: 50,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    skillButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    skillButtonSelected: {
      backgroundColor: "#06b6d4",
      borderColor: "#06b6d4",
    },
    skillButtonUnselected: {
      backgroundColor: "transparent",
      borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
    },
    skillText: {
      fontSize: 14,
      fontWeight: "600",
    },
    skillTextSelected: {
      color: "#ffffff",
    },
    skillTextUnselected: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    charCounter: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "right",
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonPrimary: {
      backgroundColor: "#06b6d4",
    },
    buttonSecondary: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
    },
    buttonTextPrimary: {
      color: "#ffffff",
    },
    buttonTextSecondary: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 50,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    dateButtonText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
    gridRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    gridItem: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.navigate("HiringDashboard" as never)}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#111827"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.postJob.postAJob}</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>Create an attractive job listing to find the best talent</Text>

          {/* Subscription Status */}
          {!loadingStatus && postingStatus && (
            <View style={[
              styles.statusBanner,
              postingStatus.canPost ? styles.statusBannerSuccess : styles.statusBannerError
            ]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: darkMode ? "#ffffff" : "#000000",
                    marginBottom: 4,
                  }}>
                    {postingStatus.canPost
                      ? `✅ You can post jobs (${postingStatus.planName})`
                      : `❌ Cannot post jobs`}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: darkMode ? "#d1d5db" : "#4b5563",
                  }}>
                    {postingStatus.canPost
                      ? postingStatus.limits.limit === -1
                        ? `Monthly jobs posted: ${postingStatus.stats.monthlyJobs} (Unlimited)`
                        : `Monthly jobs posted: ${postingStatus.limits.current}/${postingStatus.limits.limit}`
                      : postingStatus.message || "Please upgrade your plan to post jobs."}
                  </Text>
                </View>
                {!postingStatus.canPost && (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: "#06b6d4",
                      borderRadius: 8,
                    }}
                    onPress={() => navigation.navigate("Pricing" as never)}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "700" }}>
                      {t.postJob.upgradePlan}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Job Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="briefcase" size={24} color="#06b6d4" />
              Job Details
            </Text>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.postJob.enterJobTitle}
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Job Site *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={jobSite}
                    onValueChange={setJobSite}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Job Site" value="" />
                    {jobSites.map((site) => (
                      <Picker.Item key={site} label={site} value={site} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Job Type *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={jobType}
                    onValueChange={setJobType}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Job Type" value="" />
                    {jobTypes.map((jt) => (
                      <Picker.Item key={jt} label={jt} value={jt} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Job Sector *</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={jobSector}
                    onValueChange={setJobSector}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Job Sector" value="" />
                    {jobSectors.map((sector) => (
                      <Picker.Item key={sector} label={sector} value={sector} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Category *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Company name"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about your job..."
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={description}
              onChangeText={(text) => {
                if (text.length <= maxDescriptionLength) {
                  setDescription(text);
                }
              }}
              multiline
              numberOfLines={10}
            />
            <Text style={styles.charCounter}>
              {descriptionCharsLeft} chars left
            </Text>

            {/* Skills */}
            <Text style={styles.label}>Skills and Expertise (Max 6)</Text>
            <Text style={{
              fontSize: 12,
              color: darkMode ? "#9ca3af" : "#6b7280",
              marginBottom: 8,
            }}>
              {6 - skills.length} left
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.skillsContainer}>
                {allSkills.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      styles.skillButton,
                      skills.includes(skill) ? styles.skillButtonSelected : styles.skillButtonUnselected
                    ]}
                    onPress={() => toggleSkill(skill)}
                  >
                    <Text style={[
                      styles.skillText,
                      skills.includes(skill) ? styles.skillTextSelected : styles.skillTextUnselected
                    ]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Work Location */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Work Location</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={workLocation}
                    onValueChange={setWorkLocation}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    {workLocations.map((loc) => (
                      <Picker.Item key={loc} label={loc} value={loc} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={country}
                  onChangeText={setCountry}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Address (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Work address"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Compensation */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Compensation Type</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={compensationType}
                    onValueChange={setCompensationType}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Compensation Type" value="" />
                    {compensationTypes.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Amount & Currency</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="Amount"
                    placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                    value={compensationAmount}
                    onChangeText={setCompensationAmount}
                    keyboardType="numeric"
                  />
                  <View style={[styles.picker, { flex: 1, height: 50 }]}>
                    <Picker
                      selectedValue={currency}
                      onValueChange={setCurrency}
                      style={{ color: darkMode ? "#ffffff" : "#000000" }}
                    >
                      {currencies.map((curr) => (
                        <Picker.Item key={curr} label={curr} value={curr} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Other Fields */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Experience Level</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={experience}
                    onValueChange={setExperience}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Experience Level" value="" />
                    {experienceLevels.map((level) => (
                      <Picker.Item key={level} label={level} value={level} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Education</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={education}
                    onValueChange={setEducation}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Education" value="" />
                    {educationLevels.map((edu) => (
                      <Picker.Item key={edu} label={edu} value={edu} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Gender Preference</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={setGender}
                    style={{ color: darkMode ? "#ffffff" : "#000000" }}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    {genderOptions.map((opt) => (
                      <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Vacancies (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Number of vacancies"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={vacancies}
                  onChangeText={setVacancies}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Job Deadline (optional) - Default: 15 days</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {deadline || "Select deadline"}
              </Text>
              <Ionicons name="calendar" size={20} color="#06b6d4" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Job Link (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
              value={jobLink}
              onChangeText={setJobLink}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Visibility</Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonSecondary,
                  visibility === "public" && { backgroundColor: "#06b6d4" }
                ]}
                onPress={() => setVisibility("public")}
              >
                <Text style={[
                  styles.buttonText,
                  visibility === "public" ? styles.buttonTextPrimary : styles.buttonTextSecondary
                ]}>
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonSecondary,
                  visibility === "private" && { backgroundColor: "#06b6d4" }
                ]}
                onPress={() => setVisibility("private")}
              >
                <Text style={[
                  styles.buttonText,
                  visibility === "private" ? styles.buttonTextPrimary : styles.buttonTextSecondary
                ]}>
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonTextSecondary}>Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSubmit}
              disabled={isSubmitting || (postingStatus && !postingStatus.canPost)}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonTextPrimary}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostJob;
