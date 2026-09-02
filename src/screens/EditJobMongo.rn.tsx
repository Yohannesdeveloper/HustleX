/**
 * React Native EditJobMongo Screen
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

// Constants
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other",
];

const categories = [
  "Software Development", "Web Development", "Mobile App Development", "Game Development",
  "DevOps Engineering", "Cloud Computing", "Cybersecurity", "Data Science",
  "Machine Learning & AI", "Business Intelligence", "Data Analysis", "Database Administration",
  "UI/UX Design", "Graphic Design", "Motion Graphics", "3D Animation",
  "Video Editing", "Content Writing", "Technical Writing", "Copywriting",
  "Translation & Localization", "Digital Marketing", "SEO & SEM", "Social Media Marketing",
  "Email Marketing", "Sales & Business Development", "Customer Success", "Technical Support",
  "Customer Service", "Human Resources Management", "Recruitment & Talent Acquisition",
  "Payroll & Benefits Administration", "Financial Analysis", "Accounting & Bookkeeping",
  "Tax Consulting", "Legal Services", "Contract Management", "Compliance & Risk Management",
  "Project Management", "Program Management", "Agile Coaching", "Product Management",
  "Operations Management", "Supply Chain & Logistics", "Healthcare & Medical Services",
  "Nursing", "Pharmacy", "Education & Training", "Instructional Design",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Environmental Consulting",
  "Event Planning", "Public Relations", "Market Research", "Real Estate Management",
  "Hospitality & Tourism", "Other",
];

const experienceLevels = [
  "Internship", "Entry Level", "Junior", "Mid Level", "Senior",
  "Lead", "Manager", "Director", "Executive", "Expert",
];

const jobTypes = ["Remote", "Freelance", "Part-time", "Full-time", "Contract"];

const skillsOptions = [
  "JavaScript", "React", "Node.js", "Python", "Django", "UI/UX", "Graphic Design",
  "SEO", "Content Writing", "Project Management", "Marketing", "Sales", "Other",
];

const genders = ["Any", "Male", "Female", "Other"];
const workLocations = ["Remote", "Onsite", "Hybrid"];

const EditJobMongo: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const jobId = (route.params as any)?.id;

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [workLocation, setWorkLocation] = useState<string>("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobLink, setJobLink] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [vacancies, setVacancies] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      (navigation as any).navigate("Signup", {
        redirect: `/edit-job/${jobId}`,
      });
    }
  }, [isAuthenticated, navigation, jobId]);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        const jobData = await apiService.getJob(jobId);

        // Check if current user is the job owner
        const jobOwnerId =
          typeof jobData.postedBy === "string"
            ? jobData.postedBy
            : jobData.postedBy?._id;

        if (jobOwnerId !== user?._id) {
          Alert.alert("Error", "You don't have permission to edit this job.");
          (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" });
          return;
        }

        // Populate form fields
        setTitle(jobData.title || "");
        setDescription(jobData.description || "");
        setCompany(jobData.company || "");
        setCategory(jobData.category || "");
        setSalary(String(jobData.budget || ""));
        setDeadline(jobData.deadline || "");
        setExperience(jobData.experience || "");
        setJobType(jobData.jobType || "");
        setWorkLocation(jobData.workLocation || "Remote");
        setSkills(jobData.skills || []);
        setJobLink(jobData.jobLink || "");
        setGender(jobData.gender || "");
        setVacancies(jobData.vacancies?.toString() || "");
        setAddress(jobData.address || "");
        setCountry(jobData.country || "");
        setCity(jobData.city || "");
        setEducation(jobData.education || "");

        // Parse deadline date
        if (jobData.deadline) {
          const deadlineDate = new Date(jobData.deadline);
          if (!isNaN(deadlineDate.getTime())) {
            setSelectedDate(deadlineDate);
            setDeadline(deadlineDate.toISOString().split("T")[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        Alert.alert("Error", "Failed to load job data.");
        (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && jobId) {
      fetchJob();
    }
  }, [jobId, isAuthenticated, user, navigation]);

  const handleSubmit = async () => {
    if (!jobId) return;

    setIsSubmitting(true);

    try {
      const jobData = {
        title,
        description,
        company,
        category,
        budget: salary,
        deadline,
        experience,
        jobType,
        workLocation,
        skills,
        jobLink: jobLink.trim() || null,
        gender,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        address: address.trim() || null,
        country,
        city: city.trim() || null,
        education: education.trim() || null,
      };

      await apiService.updateJob(jobId, jobData);

      Alert.alert("Success", "Job updated successfully!", [
        {
          text: "OK",
          onPress: () => (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" }),
        },
      ]);
    } catch (error: any) {
      console.error("Error updating job:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to update job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDeadline(date.toISOString().split("T")[0]);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#FFFFFF",
    },
    scrollContent: {
      padding: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: darkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
    },
    backButtonText: {
      color: darkMode ? "#22d3ee" : "#0891b2",
      fontWeight: "600",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    },
    section: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
    formRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 16,
    },
    formGroup: {
      flex: 1,
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
    input: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    picker: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
      borderRadius: 12,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
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
      borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
    },
    skillButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#000000",
    },
    skillButtonTextUnselected: {
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    submitButton: {
      backgroundColor: "#06b6d4",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
    },
    submitButtonDisabled: {
      backgroundColor: "#6b7280",
    },
    submitButtonText: {
      color: "#000000",
      fontSize: 16,
      fontWeight: "bold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={darkMode ? "#22d3ee" : "#0891b2"} />
        <Text style={styles.loadingText}>Loading job data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" })}
          >
            <Ionicons name="arrow-back" size={20} color={darkMode ? "#22d3ee" : "#0891b2"} />
            <Text style={styles.backButtonText}>Back to Jobs</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeIn}>
          <Text style={styles.title}>Edit Job</Text>
          <Text style={styles.subtitle}>Update your job listing details</Text>
        </Animated.View>

        {/* Job Details Section */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase" size={24} color={darkMode ? "#22d3ee" : "#0891b2"} />
            <Text style={styles.sectionTitle}>Job Details</Text>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter job title"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Company *</Text>
              <TextInput
                value={company}
                onChangeText={setCompany}
                placeholder="Enter company name"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Job Type *</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={jobType}
                  onValueChange={setJobType}
                  style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
                >
                  <Picker.Item label="Select Job Type" value="" />
                  {jobTypes.map((jt) => (
                    <Picker.Item key={jt} label={jt} value={jt} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Work Location *</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={workLocation}
                  onValueChange={setWorkLocation}
                  style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
                >
                  {workLocations.map((wl) => (
                    <Picker.Item key={wl} label={wl} value={wl} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
              >
                <Picker.Item label="Select Category" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Salary *</Text>
            <TextInput
              value={salary}
              onChangeText={setSalary}
              placeholder="Enter salary range (e.g., 50,000-70,000 ETB)"
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the job"
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={5}
            />
          </View>
        </Animated.View>

        {/* Location Section */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={darkMode ? "#22d3ee" : "#0891b2"} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={country}
                  onValueChange={setCountry}
                  style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countries.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address (Optional)</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={styles.input}
            />
          </View>
        </Animated.View>

        {/* Requirements Section */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color={darkMode ? "#22d3ee" : "#0891b2"} />
            <Text style={styles.sectionTitle}>Requirements</Text>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Experience Level</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={experience}
                  onValueChange={setExperience}
                  style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
                >
                  <Picker.Item label="Select Experience Level" value="" />
                  {experienceLevels.map((exp) => (
                    <Picker.Item key={exp} label={exp} value={exp} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={gender}
                  onValueChange={setGender}
                  style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
                >
                  <Picker.Item label="Select Gender" value="" />
                  {genders.map((g) => (
                    <Picker.Item key={g} label={g} value={g} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Number of Vacancies (Optional)</Text>
              <TextInput
                value={vacancies}
                onChangeText={setVacancies}
                placeholder="Enter number of vacancies"
                keyboardType="numeric"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Educational Qualification</Text>
              <TextInput
                value={education}
                onChangeText={setEducation}
                placeholder="Enter required education"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Skills & Expertise (Select all that apply)</Text>
            <View style={styles.skillsContainer}>
              {skillsOptions.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  onPress={() => toggleSkill(skill)}
                  style={[
                    styles.skillButton,
                    skills.includes(skill)
                      ? styles.skillButtonSelected
                      : styles.skillButtonUnselected,
                  ]}
                >
                  <Text
                    style={
                      skills.includes(skill)
                        ? styles.skillButtonText
                        : styles.skillButtonTextUnselected
                    }
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Additional Info Section */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={24} color={darkMode ? "#22d3ee" : "#0891b2"} />
            <Text style={styles.sectionTitle}>Additional Information</Text>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Deadline *</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text style={{ color: darkMode ? "#FFFFFF" : "#000000" }}>
                  {deadline || "Select deadline"}
                </Text>
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
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Job Link (Optional)</Text>
              <TextInput
                value={jobLink}
                onChangeText={setJobLink}
                placeholder="Enter job application link"
                placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                style={styles.input}
                keyboardType="url"
              />
            </View>
          </View>
        </Animated.View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#000000" />
              <Text style={styles.submitButtonText}>Update Job</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditJobMongo;
