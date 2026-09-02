/**
 * React Native ContactUs Screen
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
  Linking,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import apiService from "../services/api-react-native";
import Footer from "../components/Footer.rn";
import BottomNav from "../components/BottomNav.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const ContactUs: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiService.getBaseUrl()}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        Alert.alert("Success", data.message || "Message sent successfully!");
      } else {
        if (data.errors) {
          const errorMessages = data.errors.map((error: any) => error.msg).join("\n");
          Alert.alert(
            t.contactUs?.validationFailed || "Validation Failed",
            errorMessages
          );
        } else {
          Alert.alert("Error", data.message || t.contactUs?.failedToSendMessage || "Failed to send message");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert(
        "Error",
        t.contactUs?.failedToSendMessageCheckConnection || "Failed to send message. Please check your connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "call",
      title: t.contactUs?.phone || "Phone",
      details: "+251 942927999",
      description: t.contactUs?.monFriHours || "Mon-Fri 9AM-6PM",
      action: () => Linking.openURL("tel:+251942927999"),
    },
    {
      icon: "mail",
      title: t.contactUs?.email || "Email",
      details: "HustleXet@gmail.com",
      description: t.contactUs?.respondWithin24Hours || "We respond within 24 hours",
      action: () => Linking.openURL("mailto:HustleXet@gmail.com"),
    },
    {
      icon: "location",
      title: t.contactUs?.office || "Office",
      details: "Addis Ababa, Ethiopia",
      description: "",
      action: null,
    },
    {
      icon: "time",
      title: t.contactUs?.businessHours || "Business Hours",
      details: "Mon - Fri: 9AM - 6PM",
      description: t.contactUs?.weekendSupportAvailable || "Weekend support available",
      action: null,
    },
  ];

  const socialLinks = [
    { icon: "logo-facebook", name: "Facebook", color: "#1877f2", href: "#" },
    { icon: "logo-twitter", name: "Twitter", color: "#1da1f2", href: "#" },
    { icon: "logo-linkedin", name: "LinkedIn", color: "#0077b5", href: "#" },
    { icon: "logo-instagram", name: "Instagram", color: "#e4405f", href: "#" },
    { icon: "logo-youtube", name: "YouTube", color: "#ff0000", href: "https://youtube.com/@HustleXet" },
    { icon: "send", name: "Telegram", color: "#0088cc", href: "https://t.me/HustleXet" },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingTop: 20,
      paddingBottom: 140,
    },
    heroSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
      textAlign: "center",
    },
    heroTitleGradient: {
      color: "#06b6d4",
    },
    heroDescription: {
      fontSize: 18,
      lineHeight: 28,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      maxWidth: "100%",
    },
    contactInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },
    contactCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    contactIcon: {
      marginBottom: 12,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
    },
    contactDetails: {
      fontSize: 14,
      color: darkMode ? "#06b6d4" : "#0891b2",
      marginBottom: 4,
      textAlign: "center",
    },
    contactDescription: {
      fontSize: 12,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    formSection: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      marginBottom: 40,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 24,
      textAlign: "center",
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
      marginBottom: 16,
    },
    textArea: {
      minHeight: 120,
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.5)" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.5)" : "rgba(209, 213, 219, 0.5)",
      marginBottom: 16,
      textAlignVertical: "top",
    },
    submitButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    socialSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    socialTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    socialGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "center",
    },
    socialButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    backNavContainer: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backText: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* HomeNavbar removed */}
      {/* Back Navigation Bar */}
      <View style={[styles.backNavContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "MainSwipeableTabs" as never }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          <Text style={styles.backText}>Contact Us</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {t.contactUs?.getInTouchWith || "Get in Touch with"}{" "}
            <Text style={styles.heroTitleGradient}>HustleX</Text>
          </Text>
          <Text style={styles.heroDescription}>
            {t.contactUs?.haveQuestions ||
              "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </Text>
        </Animated.View>

        {/* Contact Info Cards */}
        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View style={styles.contactInfoGrid}>
            {contactInfo.map((info, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={info.action || undefined}
                disabled={!info.action}
              >
                <Ionicons
                  name={info.icon as any}
                  size={32}
                  color="#06b6d4"
                  style={styles.contactIcon}
                />
                <Text style={styles.contactTitle}>{info.title}</Text>
                <Text style={styles.contactDetails}>{info.details}</Text>
                {info.description && <Text style={styles.contactDescription}>{info.description}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Contact Form */}
        <Animated.View entering={FadeIn.duration(800).delay(400)} style={styles.formSection}>
          <Text style={styles.formTitle}>Send us a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={formData.subject}
            onChangeText={(text) => handleInputChange("subject", text)}
          />
          <TextInput
            style={styles.textArea}
            placeholder="Your Message"
            placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
            value={formData.message}
            onChangeText={(text) => handleInputChange("message", text)}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Social Links */}
        <Animated.View entering={FadeIn.duration(800).delay(600)} style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => social.href !== "#" && Linking.openURL(social.href)}
              >
                <Ionicons name={social.icon as any} size={24} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        <Footer />
      </ScrollView>
    </View>
  );
};

export default ContactUs;
