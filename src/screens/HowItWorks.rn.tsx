/**
 * React Native HowItWorks Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import HomeNavbar from "../components/HomeNavbar.rn";
import Footer from "../components/Footer.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const steps = [
  {
    title: "1️⃣ Browse Jobs",
    description:
      "Explore a wide variety of freelance jobs posted by employers. Use filters to find exactly what matches your skills.",
  },
  {
    title: "2️⃣ Apply or Post",
    description:
      "Freelancers can apply to jobs that fit their expertise, and clients can post new jobs with all the necessary details.",
  },
  {
    title: "3️⃣ Connect & Work",
    description:
      "Communicate securely through our platform, complete the tasks, and deliver quality work.",
  },
  {
    title: "4️⃣ Get Paid",
    description:
      "Once the work is completed and approved, you can arrange payments directly with your client.",
  },
];

const testimonials = [
  {
    name: "Abebe Kebede",
    role: "Freelancer",
    quote:
      "HustleX helped me find high-paying clients in just a week! The platform is intuitive and secure.",
  },
  {
    name: "Selam Tesfaye",
    role: "Client",
    quote:
      "Posting jobs and connecting with talented freelancers has never been easier. Highly recommend!",
  },
];

const faqs = [
  {
    question: "How do I get started as a freelancer?",
    answer:
      "Sign up, complete your profile, and browse jobs that match your skills. Apply with a tailored cover letter and CV!",
  },
  {
    question: "What are the fees for using the platform?",
    answer:
      "For now we didn't charge any fees for using the platform, so everyone can use it for free.",
  },
  {
    question: "How would you rate your platform?",
    answer:
      "Our platform is user-friendly and easy to navigate. We are constantly updating and improving it to provide the best experience for our users. But we leave it to our users to rate us.",
  },
];

const HowItWorks: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#FFFFFF",
    },
    scrollContent: {
      padding: 24,
    },
    title: {
      fontSize: 36,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 48,
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
    stepIndicators: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
      marginBottom: 48,
    },
    stepIndicator: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
    },
    stepIndicatorActive: {
      backgroundColor: darkMode ? "#06b6d4" : "#06b6d4",
    },
    stepIndicatorInactive: {
      backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    stepIndicatorText: {
      color: darkMode ? "#000000" : "#000000",
      fontWeight: "bold",
    },
    stepIndicatorTextInactive: {
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    stepsGrid: {
      gap: 24,
      marginBottom: 64,
    },
    stepCard: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
    },
    stepCardActive: {
      borderColor: darkMode ? "#22d3ee" : "#0891b2",
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
    stepDescription: {
      fontSize: 16,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
    ctaButtons: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 64,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    ctaButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    ctaButtonPrimary: {
      backgroundColor: "#3b82f6",
    },
    ctaButtonText: {
      color: "#000000",
      fontWeight: "bold",
      fontSize: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 32,
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
    testimonialsGrid: {
      gap: 24,
      marginBottom: 64,
    },
    testimonialCard: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
    },
    testimonialQuote: {
      fontSize: 16,
      marginBottom: 16,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
    testimonialAuthor: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    testimonialAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: darkMode ? "#06b6d4" : "#06b6d4",
      alignItems: "center",
      justifyContent: "center",
    },
    testimonialAvatarText: {
      color: "#000000",
      fontWeight: "bold",
    },
    testimonialInfo: {
      flex: 1,
    },
    testimonialName: {
      fontWeight: "600",
      color: darkMode ? "#FFFFFF" : "#000000",
      fontSize: 16,
    },
    testimonialRole: {
      fontSize: 14,
      color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    },
    faqSection: {
      marginBottom: 64,
    },
    faqItem: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
      borderRadius: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
      overflow: "hidden",
    },
    faqButton: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    faqQuestion: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
    faqAnswer: {
      padding: 16,
      paddingTop: 0,
      color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
      fontSize: 14,
    },
    backNavContainer: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
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

  return (
    <View style={styles.container}>
      <HomeNavbar />
      {/* Back Navigation Bar */}
      <View style={styles.backNavContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "MainSwipeableTabs" as never }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          <Text style={styles.backText}>How It Works</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How It Works</Text>

        {/* Step Indicators */}
        <View style={styles.stepIndicators}>
          {steps.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveStep(index)}
              style={[
                styles.stepIndicator,
                activeStep === index
                  ? styles.stepIndicatorActive
                  : styles.stepIndicatorInactive,
              ]}
            >
              <Text
                style={
                  activeStep === index
                    ? styles.stepIndicatorText
                    : styles.stepIndicatorTextInactive
                }
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Steps Grid */}
        <View style={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.delay(idx * 100)}
              style={[
                styles.stepCard,
                activeStep === idx && styles.stepCardActive,
              ]}
            >
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Call-to-Action Buttons */}
        <View style={styles.ctaButtons}>
          <TouchableOpacity
            style={[styles.ctaButton, styles.ctaButtonPrimary]}
            onPress={() => (navigation as any).navigate("MainSwipeableTabs", { screen: "JobListings" })}
          >
            <Ionicons name="briefcase" size={20} color="#000000" />
            <Text style={styles.ctaButtonText}>Find Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaButton, styles.ctaButtonPrimary]}
            onPress={() => {
              if (isAuthenticated) {
                (navigation as any).navigate("PostJob");
              } else {
                (navigation as any).navigate("Signup", {
                  redirect: "/post-job",
                });
              }
            }}
          >
            <Ionicons name="people" size={20} color="#000000" />
            <Text style={styles.ctaButtonText}>Post a Job</Text>
          </TouchableOpacity>
        </View>

        {/* Testimonial Section */}
        <Text style={styles.sectionTitle}>What Our Users Say</Text>
        <View style={styles.testimonialsGrid}>
          {testimonials.map((testimonial, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.delay(idx * 100)}
              style={styles.testimonialCard}
            >
              <Text style={styles.testimonialQuote}>
                "{testimonial.quote}"
              </Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>
                    {testimonial.name[0]}
                  </Text>
                </View>
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqSection}>
          {faqs.map((faq, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.delay(idx * 50)}
              style={styles.faqItem}
            >
              <TouchableOpacity
                style={styles.faqButton}
                onPress={() => toggleFaq(idx)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={openFaq === idx ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={darkMode ? "#22d3ee" : "#0891b2"}
                />
              </TouchableOpacity>
              {openFaq === idx && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </Animated.View>
              )}
            </Animated.View>
          ))}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
};

export default HowItWorks;
