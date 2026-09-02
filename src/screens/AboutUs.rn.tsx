import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { RootStackParamList } from "../types";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import HomeNavbar from "../components/HomeNavbar.rn";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AboutUs: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const stats = [
    {
      number: "10K+",
      label: t.aboutUs?.activeFreelancers || "Active Freelancers",
      icon: "people",
      color: "#3b82f6",
    },
    {
      number: "5K+",
      label: t.stats?.happyClients || "Happy Clients",
      icon: "handshake",
      color: "#10b981",
    },
    {
      number: "20M+",
      label: t.stats?.successProjects || "Success Projects",
      icon: "rocket",
      color: "#a855f7",
    },
    {
      number: "98%",
      label: t.stats?.successRate || "Success Rate",
      icon: "star",
      color: "#f59e0b",
    },
  ];

  const values = [
    {
      icon: "bulb",
      title: t.aboutUs?.innovation || "Innovation",
      description: t.aboutUs?.innovationDesc || "We continuously innovate to provide cutting-edge solutions for the freelance community.",
      color: "#06b6d4",
    },
    {
      icon: "heart",
      title: t.aboutUs?.community || "Community",
      description: t.aboutUs?.communityDesc || "Building a supportive community where talent meets opportunity in Ethiopia and beyond.",
      color: "#ef4444",
    },
    {
      icon: "trophy",
      title: t.aboutUs?.excellence || "Excellence",
      description: t.aboutUs?.excellenceDesc || "Committed to delivering exceptional quality and fostering professional growth.",
      color: "#f59e0b",
    },
    {
      icon: "globe",
      title: t.aboutUs?.globalReach || "Global Reach",
      description: t.aboutUs?.globalReachDesc || "Connecting Ethiopian talent with opportunities worldwide through our platform.",
      color: "#10b981",
    },
  ];

  const team = [
    {
      name: "Yohannes Fikre",
      role: t.aboutUs?.founderCEO || "Founder & CEO",
      image: require("../Images/Teams/Yohannes.jpg"),
      bio: t.aboutUs?.visionaryLeaderBio || "Visionary leader",
    },
    {
      name: "Messeret Ayalew",
      role: t.aboutUs?.frontendDeveloper || "Frontend Developer",
      image: require("../Images/Teams/messie.png"),
      bio: t.aboutUs?.frontendDeveloperBio || "Frontend developer",
    },
    {
      name: "Abraham Wosenyelhe",
      role: t.aboutUs?.fullstackDeveloper || "Fullstack Developer",
      image: require("../Images/Teams/messie.png"),
      bio: t.aboutUs?.fullstackDeveloperBio || "Fullstack developer",
    },
  ];

  const handleGetStarted = () => {
    navigation.navigate("HomeFinal" as never);
  };

  const handleCommunity = () => {
    Linking.openURL("https://t.me/HustleXet");
  };

  const handlePortfolio = () => {
    Linking.openURL("https://portfolio-yohanex.vercel.app/");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
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
    heroDescription: {
      fontSize: 18,
      lineHeight: 28,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      maxWidth: "100%",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },
    statCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    statIcon: {
      marginBottom: 12,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 24,
      textAlign: "center",
    },
    founderSection: {
      marginBottom: 40,
    },
    founderCard: {
      maxWidth: 400,
      alignSelf: "center",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    founderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: "rgba(6, 182, 212, 0.3)",
      marginBottom: 16,
      alignSelf: "center",
    },
    founderName: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
      textAlign: "center",
    },
    founderRole: {
      fontSize: 18,
      fontWeight: "600",
      color: "#06b6d4",
      marginBottom: 12,
      textAlign: "center",
    },
    founderBio: {
      fontSize: 14,
      lineHeight: 20,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 16,
    },
    founderLinks: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
    },
    founderLinkButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    storySection: {
      marginBottom: 40,
    },
    storyGrid: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: 24,
      alignItems: 'center',
    },
    storyText: {
      flex: 1,
    },
    storyTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    storyDescription: {
      fontSize: 16,
      lineHeight: 24,
      color: darkMode ? "#d1d5db" : "#4b5563",
      marginBottom: 12,
    },
    storyCard: {
      flex: 1,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      alignItems: "center",
    },
    storyIcon: {
      marginBottom: 16,
    },
    storyCardTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
    },
    storyCardText: {
      fontSize: 16,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
    },
    valuesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },
    valueCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    valueIcon: {
      marginBottom: 12,
    },
    valueTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
    },
    valueDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    teamGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },
    teamCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    teamImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      marginBottom: 12,
      overflow: "hidden",
      borderWidth: 4,
      borderColor: darkMode ? "rgba(107, 114, 128, 0.4)" : "rgba(107, 114, 128, 0.2)",
    },
    teamName: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    teamRole: {
      fontSize: 14,
      fontWeight: "600",
      color: "#06b6d4",
      marginBottom: 8,
    },
    teamBio: {
      fontSize: 12,
      lineHeight: 18,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    ctaSection: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
      borderRadius: 16,
      padding: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      alignItems: "center",
      marginBottom: 40,
    },
    ctaTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 12,
      textAlign: "center",
    },
    ctaDescription: {
      fontSize: 16,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      marginBottom: 24,
      maxWidth: "90%",
    },
    ctaButtons: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: 12,
      width: "100%",
      maxWidth: 400,
    },
    ctaButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    ctaButtonPrimary: {
      backgroundColor: "#06b6d4",
    },
    ctaButtonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: "#06b6d4",
    },
    ctaButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
    },
    ctaButtonTextSecondary: {
      color: "#06b6d4",
    },
    titleSection: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(6, 182, 212, 0.1)",
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      }),
    },
    titleText: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      letterSpacing: -0.5,
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
    footer: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: '#1f2937',
    },
    footerDark: {
      backgroundColor: '#111827',
    },
    footerContent: {
      maxWidth: 1200,
      alignSelf: 'center',
    },
    footerGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 32,
      gap: 24,
    },
    footerColumn: {
      flex: 1,
      minWidth: 250,
    },
    footerColumnTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#e5e7eb',
      marginBottom: 16,
    },
    footerColumnTitleDark: {
      color: '#f3f4f6',
    },
    footerLink: {
      fontSize: 14,
      color: '#9ca3af',
      marginBottom: 12,
    },
    footerLinkDark: {
      color: '#6b7280',
    },
    footerBottom: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: '#374151',
    },
    footerBottomLeft: {
      flex: 1,
      minWidth: 250,
    },
    footerCopyright: {
      fontSize: 14,
      color: '#9ca3af',
      marginBottom: 8,
    },
    footerCopyrightDark: {
      color: '#6b7280',
    },
    footerMadeWith: {
      fontSize: 12,
      color: '#6b7280',
    },
    footerMadeWithDark: {
      color: '#4b5563',
    },
    footerSocial: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    footerFollowUs: {
      fontSize: 14,
      fontWeight: '600',
      color: '#9ca3af',
    },
    footerFollowUsDark: {
      color: '#6b7280',
    },
    socialIcons: {
      flexDirection: 'row',
      gap: 12,
    },
    socialIcon: {
      padding: 4,
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
          <Text style={styles.backText}>About Us</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {t.aboutUs?.ourStory || "Our Story"}
          </Text>
          <Text style={styles.heroDescription}>
            {t.aboutUs?.ourStoryDescription ||
              "HustleX is a leading freelancing platform connecting talented professionals with opportunities across Ethiopia and beyond."}
          </Text>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.duration(600).delay(200 + index * 100)}
                style={styles.statCard}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={32}
                  color={stat.color}
                  style={styles.statIcon}
                />
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Founder Section */}
        <Animated.View entering={FadeIn.duration(800).delay(400)} style={styles.founderSection}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>{t.aboutUs?.meetOurFounder || "Meet Our Founder"}</Text>
            <Text style={[styles.heroDescription, { maxWidth: "90%" }]}>
              {t.aboutUs?.visionarySubtitle || "The visionary behind HustleX, dedicated to empowering Ethiopia's digital workforce"}
            </Text>
          </View>

          <Animated.View entering={FadeInUp.duration(800).delay(500)} style={styles.founderCard}>
            <Image
              source={require("../Images/Teams/Yohannes.jpg")}
              style={styles.founderImage}
              resizeMode="cover"
            />
            <Text style={styles.founderName}>{t.aboutUs?.founderName || "Yohannes Fikre"}</Text>
            <Text style={styles.founderRole}>{t.aboutUs?.founder || "Founder & CEO"}</Text>
            <Text style={styles.founderBio}>
              {t.aboutUs?.founderBio || "Driven by a passion for connecting talent with opportunity, I created HustleX to empower freelancers and clients across Ethiopia and beyond. My goal is simple: make finding work and discovering talent seamless, fair, and inspiring. At HustleX, every connection is a step toward growth, creativity, and success."}
            </Text>
            <View style={styles.founderLinks}>
              <TouchableOpacity
                style={styles.founderLinkButton}
                onPress={handlePortfolio}
              >
                <Ionicons name="globe" size={20} color="#06b6d4" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Our Story Section */}
        <Animated.View entering={FadeIn.duration(800).delay(600)} style={styles.storySection}>
          <View style={styles.storyGrid}>
            <View style={styles.storyText}>
              <Text style={styles.storyTitle}>{t.aboutUs?.ourStory || "Our Story"}</Text>
              <Text style={styles.storyDescription}>
                {t.aboutUs?.ourStoryDescription || "Founded in 2023, HustleX was born from a simple idea: Ethiopia's talented professionals deserve better access to global opportunities. Experiencing the challenges of the traditional job market firsthand, our founder set out to create a platform that would make freelance work accessible, fair, and rewarding. Though we are just getting started, HustleX is already building a community that connects skilled professionals with clients worldwide. Our mission goes beyond a marketplace—we're creating a movement that empowers Ethiopia's digital workforce to thrive in the global economy."}
              </Text>
            </View>
            <View style={styles.storyCard}>
              <Ionicons
                name="rocket"
                size={64}
                color="#06b6d4"
                style={styles.storyIcon}
              />
              <Text style={styles.storyCardTitle}>{t.aboutUs?.ourMission || "Our Mission"}</Text>
              <Text style={styles.storyCardText}>
                {t.aboutUs?.ourMissionDescription || "Empowering Ethiopia's digital workforce"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Values Section */}
        <Animated.View entering={FadeIn.duration(800).delay(800)}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {values.map((value, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.duration(600).delay(800 + index * 100)}
                style={styles.valueCard}
              >
                <Ionicons
                  name={value.icon as any}
                  size={32}
                  color={value.color}
                  style={styles.valueIcon}
                />
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueDescription}>{value.description}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Team Section */}
        <Animated.View entering={FadeIn.duration(800).delay(1000)}>
          <Text style={styles.sectionTitle}>
            {t.aboutUs?.meetOurTeam || "Meet Our Team"}
          </Text>
          <View style={styles.teamGrid}>
            {team.map((member, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(600).delay(1000 + index * 100)}
                style={styles.teamCard}
              >
                {member.image ? (
                  <Image source={member.image} style={styles.teamImage} resizeMode="cover" />
                ) : (
                  <View style={styles.teamImage}>
                    <Ionicons name="person" size={40} color={darkMode ? "#9ca3af" : "#6b7280"} />
                  </View>
                )}
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
                <Text style={styles.teamBio}>{member.bio}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* CTA Section */}
        <Animated.View entering={FadeIn.duration(800).delay(1200)} style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>{t.cta?.title || "Join Our Growing Community"}</Text>
          <Text style={styles.ctaDescription}>
            {t.cta?.subtitle || "Whether you're a freelancer looking for opportunities or a business seeking talent, HustleX is your gateway to success in the digital economy."}
          </Text>
          <View style={styles.ctaButtons}>
            <AnimatedTouchable
              style={[styles.ctaButton, styles.ctaButtonPrimary]}
              onPress={handleGetStarted}
            >
              <Text style={styles.ctaButtonText}>{t.cta?.getStarted || "Get Started Today"}</Text>
            </AnimatedTouchable>
            <AnimatedTouchable
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={handleCommunity}
            >
              <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>{t.cta?.learnMore || "Community"}</Text>
            </AnimatedTouchable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AboutUs;
