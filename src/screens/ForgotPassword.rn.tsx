/**
 * React Native ForgotPassword Screen
 * Complete conversion maintaining exact UI/UX
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const ForgotPassword: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await apiService.sendPasswordResetOTP(email);
      setMessage("OTP sent to your email");
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOtp = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndReset = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await apiService.verifyPasswordResetOTP(email, otpValue);
      await apiService.resetPassword(email, otpValue, newPassword);
      setMessage("Password reset successfully");
      setTimeout(() => navigation.navigate("Signup" as never), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#f0f9ff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)",
      borderRadius: 24,
      padding: 32,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      ...Platform.select({
        web: {
          boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
        },
        default: {
          shadowColor: "#06b6d4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      textAlign: "center",
      marginBottom: 24,
    },
    input: {
      width: "100%",
      height: 56,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#111827",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
      marginBottom: 16,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    passwordInput: {
      flex: 1,
    },
    passwordToggle: {
      position: "absolute",
      right: 16,
      padding: 8,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 16,
    },
    otpInput: {
      width: 50,
      height: 56,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(209, 213, 219, 0.5)",
      fontSize: 24,
      fontWeight: "700",
      textAlign: "center",
      color: darkMode ? "#ffffff" : "#111827",
    },
    otpLabel: {
      fontSize: 14,
      color: darkMode ? "#d1d5db" : "#4b5563",
      textAlign: "center",
      marginBottom: 16,
    },
    button: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      alignItems: "center",
      justifyContent: "center",
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
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
    messageBox: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
    },
    messageSuccess: {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.2)",
    },
    messageError: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.2)",
    },
    messageText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    messageTextSuccess: {
      color: "#22c55e",
    },
    messageTextError: {
      color: "#ef4444",
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>

          {step === "email" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
              <View style={styles.otpContainer}>
                {otp.map((value, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    style={styles.otpInput}
                    value={value}
                    onChangeText={(text) => handleChangeOtp(text, i)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace") {
                        handleBackspace(i);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="New Password"
                  placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={darkMode ? "#9ca3af" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtpAndReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {message && (
            <View style={[styles.messageBox, styles.messageSuccess]}>
              <Text style={[styles.messageText, styles.messageTextSuccess]}>{message}</Text>
            </View>
          )}

          {error && (
            <View style={[styles.messageBox, styles.messageError]}>
              <Text style={[styles.messageText, styles.messageTextError]}>{error}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
