/**
 * React Native Pricing Screen
 * Complete conversion maintaining exact UI/UX
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { RootStackParamList } from "../types";
import Footer from "../components/Footer.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const Pricing: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();

  const pricingPlans = [
    {
      id: "free",
      name: t.pricing.freeTrial,
      price: "0",
      currency: "ETB",
      period: t.pricing.forever,
      description: t.pricing.perfectForGettingStarted,
      icon: "rocket",
      color: "#3b82f6",
      features: [
        t.pricing.postUpTo3JobsLifetime,
        t.pricing.multiPlatformPosting,
        t.pricing.browseFreelancerProfiles,
        t.pricing.basicMessaging,
        t.pricing.standardSupport,
        t.pricing.accessToJobListings,
      ],
      limitations: [],
      buttonText: t.pricing.getStarted,
      popular: false,
    },
    {
      id: "basic",
      name: t.pricing.basicPlan,
      price: "999",
      currency: "ETB",
      period: t.pricing.perMonth,
      description: t.pricing.forGrowingBusinesses,
      icon: "crown",
      color: "#a855f7",
      features: [
        t.pricing.postUpTo10JobsPerMonth,
        t.pricing.multiPlatformPosting,
        t.pricing.unlimitedFreelancerBrowsing,
        t.pricing.priorityMessaging,
        t.pricing.prioritySupport,
        t.pricing.advancedSearchFilters,
        t.pricing.jobAnalyticsDashboard,
        t.pricing.featuredJobListings,
      ],
      limitations: [],
      buttonText: t.pricing.choosePlan,
      popular: true,
    },
    {
      id: "premium",
      name: t.pricing.premiumPlan,
      price: "9,999",
      currency: "ETB",
      period: t.pricing.perMonth,
      description: t.pricing.forEnterpriseNeeds,
      icon: "diamond",
      color: "#f59e0b",
      features: [
        t.pricing.unlimitedJobPosts,
        t.pricing.multiPlatformPosting,
        t.pricing.unlimitedFreelancerAccess,
        t.pricing.premiumMessagingVideoCalls,
        t.pricing.dedicatedSupport,
        t.pricing.advancedAnalyticsInsights,
        t.pricing.featuredPromotedListings,
        t.pricing.customBrandingOptions,
        t.pricing.apiAccess,
        t.pricing.dedicatedAccountManager,
        t.pricing.earlyAccessToNewFeatures,
      ],
      limitations: [],
      buttonText: t.pricing.choosePlan,
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (isAuthenticated) {
      if (planId === "free") {
        // If already logged in and selecting free, go to dashboard
        const targetScreen = user?.currentRole === 'client' ? 'HiringDashboard' : 'FreelancingDashboard';
        navigation.navigate(targetScreen as any);
      } else {
        navigation.navigate("Payment" as any, { plan: planId });
      }
    } else {
      if (planId === "free") {
        navigation.navigate("Signup" as any);
      } else {
        navigation.navigate("Payment" as any, { plan: planId });
      }
    }
  };

  const faqs = [
    {
      q: t.pricing.canIChangePlansLater,
      a: t.pricing.canIChangePlansLaterAnswer,
    },
    {
      q: t.pricing.whatPaymentMethodsDoYouAccept,
      a: t.pricing.whatPaymentMethodsDoYouAcceptAnswer,
    },
    {
      q: t.pricing.isThereAContract,
      a: t.pricing.isThereAContractAnswer,
    },
    {
      q: t.pricing.doYouOfferRefunds,
      a: t.pricing.doYouOfferRefundsAnswer,
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
      paddingTop: 0,
      paddingBottom: 140,
    },
    backNavContainer: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    backNavContainerDark: {
      backgroundColor: "#000000",
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
    backTextDark: {
      color: "#ffffff",
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
      textAlign: "center",
    },
    headerTitleGradient: {
      color: "#06b6d4",
    },
    headerSubtitle: {
      fontSize: 18,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      maxWidth: 600,
    },
    plansContainer: {
      paddingHorizontal: 16,
      marginBottom: 80,
    },
    plansRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
    },
    planCard: {
      width: "100%",
      maxWidth: 350,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
      borderRadius: 24,
      padding: 32,
      borderWidth: 2,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      marginBottom: 16,
      ...Platform.select({
        web: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
      }),
    },
    planCardPopular: {
      borderColor: darkMode ? "rgba(168, 85, 247, 0.5)" : "#a855f7",
      backgroundColor: darkMode ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.05)",
    },
    popularBadge: {
      backgroundColor: "#a855f7",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -32,
      marginHorizontal: -32,
      marginBottom: 16,
    },
    popularBadgeText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    planIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: 16,
    },
    planName: {
      fontSize: 24,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      textAlign: "center",
      marginBottom: 8,
    },
    planDescription: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginBottom: 24,
    },
    priceContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    price: {
      fontSize: 48,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
    },
    currency: {
      fontSize: 18,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    period: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginTop: 4,
    },
    featuresList: {
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 8,
    },
    featureIcon: {
      marginTop: 2,
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#374151",
    },
    featureTextStrikethrough: {
      textDecorationLine: "line-through",
      color: darkMode ? "#6b7280" : "#9ca3af",
    },
    planButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    planButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    faqSection: {
      paddingHorizontal: 20,
      maxWidth: 800,
      alignSelf: "center",
    },
    faqTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      textAlign: "center",
      marginBottom: 32,
    },
    faqItem: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    faqQuestion: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
    },
    faqAnswer: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
    },
  });

  const getIconName = (icon: string) => {
    switch (icon) {
      case "rocket":
        return "rocket";
      case "crown":
        return "star";
      case "diamond":
        return "diamond";
      default:
        return "star";
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Navigation Bar */}
      <View style={[styles.backNavContainer, darkMode && styles.backNavContainerDark, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "MainSwipeableTabs" as never }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          <Text style={[styles.backText, darkMode && styles.backTextDark]}>Pricing</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <Text style={styles.headerTitle}>
            {t.pricing.chooseYourPlan}{" "}
            <Text style={styles.headerTitleGradient}>{t.pricing.plan}</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            {t.pricing.selectPerfectPlan}
          </Text>
        </Animated.View>

        <View style={styles.plansContainer}>
          <View style={styles.plansRow}>
            {pricingPlans.map((plan, idx) => (
              <Animated.View
                key={plan.id}
                entering={FadeIn.duration(600).delay(idx * 200)}
                style={[
                  styles.planCard,
                  plan.popular && styles.planCardPopular,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>
                      {t.pricing.mostPopular}
                    </Text>
                  </View>
                )}

                <View style={[
                  styles.planIcon,
                  { backgroundColor: plan.color }
                ]}>
                  <Ionicons
                    name={getIconName(plan.icon) as any}
                    size={32}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>

                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.currency}>{plan.currency}</Text>
                  </View>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, featureIdx) => (
                    <View key={featureIdx} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={plan.popular ? "#a855f7" : "#06b6d4"}
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {plan.limitations.map((limitation, limitIdx) => (
                    <View key={limitIdx} style={styles.featureItem}>
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color="#6b7280"
                        style={styles.featureIcon}
                      />
                      <Text style={[styles.featureText, styles.featureTextStrikethrough]}>
                        {limitation}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.planButton,
                    { backgroundColor: plan.color }
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                >
                  <Text style={styles.planButtonText}>{plan.buttonText}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View
          entering={FadeIn.duration(800).delay(800)}
          style={styles.faqSection}
        >
          <Text style={styles.faqTitle}>
            {t.pricing.frequentlyAskedQuestions}
          </Text>
          {faqs.map((faq, idx) => (
            <Animated.View
              key={idx}
              entering={FadeIn.duration(500).delay(900 + idx * 100)}
              style={styles.faqItem}
            >
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </Animated.View>
          ))}
        </Animated.View>
        <Footer />
      </ScrollView>
    </View>
  );
};

export default Pricing;
