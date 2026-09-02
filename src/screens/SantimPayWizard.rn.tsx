/**
 * React Native SantimPayWizard Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Payment wizard for Telebirr/Santim Pay integration
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
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { setLanguage, Language } from "../store/languageSlice";
import apiService from "../services/api-react-native";
import { useTranslation } from "../hooks/useTranslation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const SantimPayWizard: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [planId, setPlanId] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("telebirr");

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Signup" as never);
      return;
    }

    const planParam = (route.params as any)?.plan;
    const methodParam = (route.params as any)?.method;

    if (planParam) {
      setPlanId(planParam);
      // Fetch plan details
      const plans = [
        { id: "free", name: "Free", price: 0, currency: "ETB" },
        { id: "basic", name: "Basic", price: 999, currency: "ETB" },
        { id: "premium", name: "Premium", price: 9999, currency: "ETB" },
      ];
      const plan = plans.find((p) => p.id === planParam);
      if (plan) {
        setPlanDetails(plan);
      }
    }

    if (methodParam) {
      setPaymentMethod(methodParam);
    }
  }, [isAuthenticated, navigation, route.params]);

  const steps = [
    { number: 1, label: "Enter Phone", completed: currentStep > 1, active: currentStep === 1 },
    { number: 2, label: "Confirm Payment", completed: currentStep > 2, active: currentStep === 2 },
    { number: 3, label: "Success", completed: currentStep === 3, active: currentStep === 3 },
  ];

  const handlePhoneNumberSubmit = async () => {
    const isCBE = paymentMethod === "cbe_birr";
    const methodName = isCBE ? "CBE Birr" : "Telebirr";

    if (!phoneNumber || !/^(09|07)\d{8}$/.test(phoneNumber)) {
      Alert.alert("Error", `Please enter a valid ${methodName} phone number (09XXXXXXXX or 07XXXXXXXX)`);
      return;
    }

    setIsProcessing(true);

    try {
      const amount = planDetails?.price || 0;
      const currency = planDetails?.currency || "ETB";

      const response = await apiService.sendPaymentRequest(phoneNumber, planId, amount, currency);

      Alert.alert(
        "Payment Request Sent",
        `${t.payment?.paymentRequestSentTo || "Payment request sent to"} ${phoneNumber}!\n\n` +
        `${response.instructions || "Please check your phone and enter your PIN to confirm the payment."}\n\n` +
        `Transaction ID: ${response.transactionId}\n` +
        `Amount: ${response.amount?.toLocaleString()} ${response.currency}\n\n` +
        `${t.payment?.checkPhoneAndEnterPin || "Please check your phone and enter your PIN"}`
      );

      setTransactionId(response.transactionId || "");
      setCurrentStep(2);
      setIsProcessing(false);
    } catch (error: any) {
      console.error("Payment request error:", error);
      Alert.alert(
        "Error",
        `Failed to send payment request: ${error.response?.data?.message || error.message || "Please try again"}`
      );
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Small artificial delay to feel like it's checking
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await apiService.subscribeToPlan(planId, paymentMethod);

      setCurrentStep(3);
      setIsProcessing(false);

      setTimeout(() => {
        const targetDashboard = user?.currentRole === 'client' ? 'HiringDashboard' : 'FreelancingDashboard';
        navigation.navigate(targetDashboard as never);
      }, 3000);
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      Alert.alert("Error", `Payment confirmation failed: ${error.message || "Please try again"}`);
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang as Language));
  };

  if (!isAuthenticated) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#1f2937",
      marginTop: 20,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
    },
    languageSelector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    languageSelect: {
      backgroundColor: "transparent",
      color: "#ffffff",
      borderWidth: 0,
      fontSize: 14,
    },
    content: {
      flex: 1,
      padding: 20,
      marginTop: 60,
    },
    branding: {
      alignItems: "center",
      marginBottom: 32,
    },
    brandingTitle: {
      fontSize: 36,
      fontWeight: "800",
    },
    brandingTitleBlack: {
      color: "#000000",
    },
    brandingTitleOrange: {
      color: "#f97316",
    },
    progressContainer: {
      marginBottom: 32,
    },
    progressSteps: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    stepContainer: {
      flex: 1,
      alignItems: "center",
    },
    stepCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    stepCircleActive: {
      backgroundColor: "#f97316",
    },
    stepCircleCompleted: {
      backgroundColor: "#f97316",
    },
    stepCircleInactive: {
      backgroundColor: "#d1d5db",
    },
    stepNumber: {
      fontSize: 18,
      fontWeight: "700",
      color: "#ffffff",
    },
    stepLabel: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 4,
    },
    stepLabelActive: {
      color: "#f97316",
      fontWeight: "600",
    },
    stepLabelInactive: {
      color: "#6b7280",
    },
    progressLine: {
      flex: 1,
      height: 2,
      marginHorizontal: 8,
    },
    progressLineActive: {
      backgroundColor: "#f97316",
    },
    progressLineInactive: {
      backgroundColor: "#d1d5db",
    },
    transactionId: {
      fontSize: 12,
      color: "#6b7280",
      textAlign: "center",
      marginBottom: 32,
    },
    stepContent: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 32,
      ...Platform.select({
        web: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    telebirrHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 16,
    },
    telebirrIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#2563eb",
      alignItems: "center",
      justifyContent: "center",
    },
    telebirrIconText: {
      fontSize: 24,
      fontWeight: "800",
      color: "#ffffff",
    },
    telebirrTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: "#1e3a8a",
    },
    phoneInput: {
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      height: 50,
      borderWidth: 2,
      borderColor: "#d1d5db",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 18,
      marginBottom: 24,
    },
    phoneInputFocused: {
      borderColor: "#f97316",
    },
    continueButton: {
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonActive: {
      backgroundColor: "#f97316",
    },
    continueButtonDisabled: {
      backgroundColor: "#9ca3af",
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    processingContainer: {
      alignItems: "center",
      paddingVertical: 48,
    },
    spinner: {
      width: 64,
      height: 64,
      borderWidth: 4,
      borderColor: "#f97316",
      borderTopColor: "transparent",
      borderRadius: 32,
      marginBottom: 16,
    },
    processingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: 8,
    },
    processingText: {
      fontSize: 16,
      color: "#4b5563",
      marginBottom: 4,
      textAlign: "center",
    },
    successContainer: {
      alignItems: "center",
      paddingVertical: 48,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#10b981",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: 8,
    },
    successText: {
      fontSize: 16,
      color: "#4b5563",
      marginBottom: 4,
      textAlign: "center",
    },
    planSummary: {
      marginTop: 24,
      alignItems: "center",
    },
    planSummaryText: {
      fontSize: 14,
      color: "#4b5563",
    },
    planSummaryBold: {
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Pricing" as never)}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backButtonText}>
            {t.payment?.backToPricing || "Back to Pricing"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.languageSelector} onPress={() => handleLanguageChange(language === 'en' ? 'am' : 'en')}>
          <Ionicons name="globe" size={20} color="#ffffff" />
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={{ color: "#ffffff", fontSize: 14 }}>{language.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Santim Pay Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandingTitle}>
            <Text style={styles.brandingTitleBlack}>SANTIM</Text>{" "}
            <Text style={styles.brandingTitleOrange}>PAY</Text>
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepCircle,
                      step.completed
                        ? styles.stepCircleCompleted
                        : step.active
                          ? styles.stepCircleActive
                          : styles.stepCircleInactive,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={24} color="#ffffff" />
                    ) : (
                      <Text style={styles.stepNumber}>{step.number}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      step.active ? styles.stepLabelActive : styles.stepLabelInactive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      step.completed || step.active
                        ? styles.progressLineActive
                        : styles.progressLineInactive,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Transaction ID */}
        {transactionId && (
          <Text style={styles.transactionId}>{transactionId}</Text>
        )}

        {/* Step Content */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.stepContent}>
          {currentStep === 1 && (
            <View style={{ alignItems: "center" }}>
              <View style={styles.telebirrHeader}>
                <View style={[styles.telebirrIcon, paymentMethod === "cbe_birr" && { backgroundColor: "#7c3aed" }]}>
                  <Text style={styles.telebirrIconText}>{paymentMethod === "cbe_birr" ? "C" : "T"}</Text>
                </View>
                <Text style={[styles.telebirrTitle, paymentMethod === "cbe_birr" && { color: "#7c3aed" }]}>
                  {paymentMethod === "cbe_birr" ? "CBE Birr" : "Telebirr"}
                </Text>
              </View>
              <Text style={styles.processingText}>
                {paymentMethod === "cbe_birr"
                  ? "Enter your CBE Birr phone number"
                  : (t.payment?.enterPhoneNumber || "Enter your Telebirr phone number")}
              </Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="09XXXXXXXX"
                placeholderTextColor="#9ca3af"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  phoneNumber && phoneNumber.length === 10
                    ? styles.continueButtonActive
                    : styles.continueButtonDisabled,
                ]}
                onPress={handlePhoneNumberSubmit}
                disabled={!phoneNumber || phoneNumber.length !== 10}
              >
                <Text style={styles.continueButtonText}>
                  {t.payment?.continue || "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.processingContainer}>
              <View style={{ marginBottom: 24, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#f97316" style={styles.spinner} />
                <Text style={styles.processingTitle}>
                  {t.payment?.paymentRequestSent || "Payment Request Sent"}
                </Text>
                <Text style={styles.processingText}>
                  {t.payment?.paymentRequestSentTo || "Payment request sent to"}{" "}
                  <Text style={{ fontWeight: "700" }}>{phoneNumber}</Text>
                </Text>
                <Text style={styles.processingText}>
                  {t.payment?.checkPhoneAndEnterPin || "Please check your phone and enter your PIN"}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  styles.continueButtonActive,
                  isProcessing && styles.continueButtonDisabled
                ]}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.continueButtonText}>
                    I Have Paid - Confirm Now
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 16 }}
                onPress={() => setCurrentStep(1)}
                disabled={isProcessing}
              >
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  Wrong number? Go back
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color="#ffffff" />
              </View>
              <Text style={styles.successTitle}>
                {t.payment?.paymentSuccessful || "Payment Received"}
              </Text>
              <Text style={styles.successText}>
                Your subscription request has been submitted.
                {"\n"}Admin will verify your payment and approve your subscription shortly.
              </Text>
              <Text style={[styles.successText, { fontSize: 12, color: "#6b7280" }]}>
                {t.payment?.redirectingToDashboard || "Redirecting to dashboard..."}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Plan Summary */}
        {planDetails && currentStep < 3 && (
          <View style={styles.planSummary}>
            <Text style={styles.planSummaryText}>
              <Text style={styles.planSummaryBold}>{planDetails.name}</Text> -{" "}
              {planDetails.price.toLocaleString()} {planDetails.currency}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SantimPayWizard;
