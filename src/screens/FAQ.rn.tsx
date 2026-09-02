import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { RootStackParamList } from "../types";
import Footer from "../components/Footer.rn";
import BottomNav from "../components/BottomNav.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const FAQ: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  const faqData = [
    {
      question: t.faq?.whatIsHustleX || "What is HustleX?",
      answer: t.faq?.whatIsHustleXAnswer || "HustleX is a freelancing platform connecting talented professionals with opportunities.",
    },
    {
      question: t.faq?.howDoIGetStartedAsFreelancer || "How do I get started as a freelancer?",
      answer:
        t.faq?.howDoIGetStartedAsFreelancerAnswer ||
        "Sign up, complete your profile, and start browsing available jobs.",
    },
    {
      question: t.faq?.howDoIPostJobAsClient || "How do I post a job as a client?",
      answer:
        t.faq?.howDoIPostJobAsClientAnswer ||
        "Create an account, select the client role, and post your job requirements.",
    },
    {
      question: t.faq?.whatAreTheFees || "What are the fees?",
      answer: t.faq?.whatAreTheFeesAnswer || "Our pricing plans are transparent. Check the Pricing page for details.",
    },
    {
      question: t.faq?.whatCategoriesAvailable || "What categories are available?",
      answer:
        t.faq?.whatCategoriesAvailableAnswer ||
        "We support various categories including web development, design, writing, and more.",
    },
    {
      question: t.faq?.howDoICommunicate || "How do I communicate with freelancers/clients?",
      answer:
        t.faq?.howDoICommunicateAnswer ||
        "Use our built-in messaging system to communicate directly with your matches.",
    },
    {
      question: t.faq?.whatIfNotSatisfied || "What if I'm not satisfied with the work?",
      answer:
        t.faq?.whatIfNotSatisfiedAnswer ||
        "We have a dispute resolution process. Contact our support team for assistance.",
    },
    {
      question: t.faq?.canIWorkInternationally || "Can I work internationally?",
      answer:
        t.faq?.canIWorkInternationallyAnswer ||
        "Yes! HustleX connects Ethiopian talent with opportunities worldwide.",
    },
    {
      question: t.faq?.isCustomerSupportAvailable || "Is customer support available?",
      answer:
        t.faq?.isCustomerSupportAvailableAnswer ||
        "Yes, our support team is available to help you with any questions or issues.",
    },
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
    introSection: {
      alignItems: "center",
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    introTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
      textAlign: "center",
    },
    introDescription: {
      fontSize: 16,
      lineHeight: 24,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      maxWidth: "100%",
    },
    faqItem: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    faqHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
      paddingRight: 16,
    },
    faqIcon: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    faqAnswer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    faqAnswerText: {
      fontSize: 14,
      lineHeight: 22,
      color: darkMode ? "#d1d5db" : "#4b5563",
    },
    contactSection: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      marginTop: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    contactTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#0891b2",
      marginBottom: 8,
    },
    contactText: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 16,
    },
    contactButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
    },
    contactButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
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
          <Text style={styles.backText}>FAQ</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Introduction */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.introSection}>
          <Text style={styles.introTitle}>{t.faq?.gotQuestions || "Got Questions? We've Got Answers!"}</Text>
          <Text style={styles.introDescription}>
            {t.faq?.gotAnswers || "Find answers to the most common questions about using HustleX. Can't find what you're looking for? Contact our support team."}
          </Text>
        </Animated.View>

        {/* FAQ Items */}
        {faqData.map((faq, index) => {
          const isOpen = openItems.includes(index);

          return (
            <Animated.View
              key={index}
              entering={FadeIn.duration(500).delay(index * 100)}
              style={styles.faqItem}
            >
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <View style={styles.faqIcon}>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={darkMode ? "#06b6d4" : "#0891b2"}
                    style={{
                      transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                    }}
                  />
                </View>
              </TouchableOpacity>
              {isOpen && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(300)}
                  style={styles.faqAnswer}
                >
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}

        {/* Contact Section */}
        <Animated.View entering={FadeIn.duration(800).delay(900)} style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t.faq?.stillHaveQuestions || "Still Have Questions?"}</Text>
          <Text style={styles.contactText}>
            {t.faq?.contactSupportDesc || "Our support team is here to help you succeed on HustleX."}
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate("ContactUs" as never)}
          >
            <Text style={styles.contactButtonText}>{t.faq?.contactSupport || "Contact Us"}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Footer />
      </ScrollView>
    </View>
  );
};

export default FAQ;
