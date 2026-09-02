/**
 * React Native Payment Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { getBackendApiUrlSync } from "../utils/portDetector";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { RootStackParamList } from "../types";

const Payment: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [planId, setPlanId] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("telebirr");

  const routeParams = (route.params as any) || {};
  const planParam = routeParams.plan || "basic";

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Signup", { redirect: `Payment?plan=${planParam}` });
      return;
    }

    setPlanId(planParam);

    const fetchPlanDetails = async () => {
      try {
        const baseUrl = getBackendApiUrlSync();
        const response = await fetch(`${baseUrl}/pricing/plans/${planParam}`);
        const data = await response.json();
        setPlanDetails(data.plan);
      } catch (error) {
        console.error("Error fetching plan details:", error);
      }
    };
    fetchPlanDetails();
  }, [isAuthenticated, navigation, planParam]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Fix: Navigate to "SantimPayWizard" which is the registered name in AppNavigator
      navigation.navigate("SantimPayWizard", { plan: planId, method: selectedMethod });
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert("Error", `Payment failed: ${error.message || "Please try again"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingHorizontal: 20,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
    },
    backButtonText: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
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
    planSummary: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#ffffff",
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    planSummaryTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    planSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    planSummaryLabel: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    planSummaryValue: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    paymentMethod: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#ffffff",
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    paymentMethodTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    paymentMethodCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    paymentMethodCardSelected: {
      borderColor: "#06b6d4",
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.05)",
    },
    paymentMethodIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    paymentMethodInfo: {
      flex: 1,
    },
    paymentMethodName: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
    },
    paymentMethodDescription: {
      fontSize: 14,
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    payButton: {
      width: "100%",
      paddingVertical: 18,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      ...Platform.select({
        web: {
          boxShadow: "0 4px 8px rgba(6, 182, 212, 0.3)",
        },
        default: {
          shadowColor: "#06b6d4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#ffffff",
    },
    securityNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
      padding: 16,
      backgroundColor: darkMode ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.2)",
    },
    securityNoteText: {
      flex: 1,
      fontSize: 14,
      color: darkMode ? "#86efac" : "#166534",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Pricing")}
        >
          <Ionicons name="arrow-back" size={20} color={darkMode ? "#9ca3af" : "#6b7280"} />
          <Text style={styles.backButtonText}>
            {t.payment?.backToPricing || "Back to Pricing"}
          </Text>
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <Text style={styles.headerTitle}>
            {t.payment?.completePayment?.split(" ").slice(0, -1).join(" ") || "Complete"}{" "}
            <Text style={styles.headerTitleGradient}>
              {t.payment?.completePayment?.split(" ").slice(-1) || "Payment"}
            </Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            {t.payment?.payWithTelebirr || "Pay securely using local mobile money"}
          </Text>
        </Animated.View>

        {planDetails && (
          <Animated.View
            entering={FadeIn.duration(600).delay(600)}
            style={styles.planSummary}
          >
            <Text style={styles.planSummaryTitle}>
              {t.payment?.planSummary || "Plan Summary"}
            </Text>
            <View style={styles.planSummaryRow}>
              <Text style={styles.planSummaryLabel}>Plan:</Text>
              <Text style={styles.planSummaryValue}>{planDetails.name || planId}</Text>
            </View>
            <View style={styles.planSummaryRow}>
              <Text style={styles.planSummaryLabel}>Price:</Text>
              <Text style={styles.planSummaryValue}>
                {planDetails.price || "0"} {planDetails.currency || "ETB"}
              </Text>
            </View>
            <View style={styles.planSummaryRow}>
              <Text style={styles.planSummaryLabel}>Period:</Text>
              <Text style={styles.planSummaryValue}>
                {planDetails.period || t.pricing?.perMonth || "per month"}
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeIn.duration(600).delay(800)}
          style={styles.paymentMethod}
        >
          <Text style={styles.paymentMethodTitle}>
            {t.payment?.choosePaymentMethod || "Select Payment Method"}
          </Text>

          <TouchableOpacity
            style={[styles.paymentMethodCard, selectedMethod === "telebirr" && styles.paymentMethodCardSelected]}
            onPress={() => setSelectedMethod("telebirr")}
          >
            <View style={styles.paymentMethodIcon}>
              <Ionicons name="phone-portrait" size={24} color="#ffffff" />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>Telebirr</Text>
              <Text style={styles.paymentMethodDescription}>
                {t.payment?.mobileMoneyPayment || "Pay securely with Telebirr mobile money"}
              </Text>
            </View>
            <Ionicons
              name={selectedMethod === "telebirr" ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={selectedMethod === "telebirr" ? "#06b6d4" : (darkMode ? "#4b5563" : "#d1d5db")}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethodCard, selectedMethod === "cbe_birr" && styles.paymentMethodCardSelected]}
            onPress={() => setSelectedMethod("cbe_birr")}
          >
            <View style={[styles.paymentMethodIcon, { backgroundColor: '#7c3aed' }]}>
              <Ionicons name="wallet" size={24} color="#ffffff" />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>CBE Birr</Text>
              <Text style={styles.paymentMethodDescription}>
                Pay using CBE Birr mobile wallet services
              </Text>
            </View>
            <Ionicons
              name={selectedMethod === "cbe_birr" ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={selectedMethod === "cbe_birr" ? "#06b6d4" : (darkMode ? "#4b5563" : "#d1d5db")}
            />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#ffffff" />
              <Text style={styles.payButtonText}>
                {t.payment?.continue || "Proceed to Payment"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={darkMode ? "#86efac" : "#166534"} />
          <Text style={styles.securityNoteText}>
            Your payment is secure and encrypted. We never store your payment details.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Payment;
