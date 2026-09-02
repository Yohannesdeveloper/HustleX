/**
 * React Native SubscriptionAdmin Screen
 * Admin interface for approving/rejecting pending subscriptions
 */

import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/hooks';
import { useAppSelector } from '../store/hooks';
import apiService from '../services/api-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const SubscriptionAdmin: React.FC = () => {
    const navigation = useNavigation();
    const darkMode = useAppSelector((s) => s.theme.darkMode);
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Password protection state
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const ADMIN_PASSWORD = "0991313700Yf@";

    useEffect(() => {
        if (isPasswordVerified) {
            fetchSubscriptions();
        }
    }, [isPasswordVerified]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const data = await apiService.fetchPendingSubscriptions();
            setSubscriptions(data.subscriptions || []);
        } catch (error: any) {
            console.error("Error fetching subscriptions", error);
            Alert.alert("Error", "Failed to fetch subscriptions. Please ensure you are logged in as admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        Alert.alert(
            "Confirm Approval",
            "Are you sure you want to approve this subscription?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        try {
                            await apiService.approveSubscription(userId);
                            Alert.alert("Success", "Subscription approved!");
                            fetchSubscriptions();
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "Failed to approve subscription");
                        }
                    },
                },
            ]
        );
    };

    const handleReject = async (userId: string) => {
        Alert.alert(
            "Confirm Rejection",
            "Are you sure you want to reject this subscription?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiService.rejectSubscription(userId);
                            Alert.alert("Success", "Subscription rejected!");
                            fetchSubscriptions();
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "Failed to reject subscription");
                        }
                    },
                },
            ]
        );
    };

    const handlePasswordSubmit = () => {
        if (passwordInput === ADMIN_PASSWORD) {
            setIsPasswordVerified(true);
            setPasswordError("");
        } else {
            setPasswordError("Incorrect password. Access denied.");
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: darkMode ? "#000000" : "#f3f4f6",
        },
        verifyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        verifyCard: {
            width: "100%",
            maxWidth: 400,
            backgroundColor: darkMode ? "#111827" : "#ffffff",
            borderRadius: 16,
            padding: 32,
            ...Platform.select({
                web: { boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
                default: { elevation: 4 },
            }),
        },
        verifyTitle: {
            fontSize: 24,
            fontWeight: "800",
            color: darkMode ? "#ffffff" : "#1f2937",
            textAlign: "center",
            marginBottom: 8,
        },
        verifySubtitle: {
            fontSize: 14,
            color: darkMode ? "#9ca3af" : "#6b7280",
            textAlign: "center",
            marginBottom: 32,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: "700",
            color: darkMode ? "#d1d5db" : "#374151",
            marginBottom: 8,
        },
        input: {
            width: "100%",
            height: 48,
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            borderWidth: 1,
            borderColor: darkMode ? "#374151" : "#d1d5db",
            borderRadius: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: darkMode ? "#ffffff" : "#000000",
            marginBottom: 16,
        },
        passwordErrorText: {
            color: "#ef4444",
            fontSize: 14,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: 16,
        },
        verifyButton: {
            backgroundColor: "#06b6d4",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
        },
        verifyButtonText: {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "700",
        },
        header: {
            paddingTop: 60,
            paddingHorizontal: 20,
            paddingBottom: 24,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "800",
            color: darkMode ? "#ffffff" : "#1f2937",
        },
        list: {
            padding: 20,
        },
        subCard: {
            backgroundColor: darkMode ? "#111827" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        subHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
        },
        userName: {
            fontSize: 18,
            fontWeight: "700",
            color: darkMode ? "#ffffff" : "#1f2937",
        },
        userEmail: {
            fontSize: 14,
            color: darkMode ? "#9ca3af" : "#6b7280",
        },
        planBadge: {
            backgroundColor: "#06b6d420",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
        },
        planText: {
            color: "#06b6d4",
            fontSize: 12,
            fontWeight: "700",
        },
        subInfoRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
        },
        subInfoLabel: {
            fontSize: 14,
            color: darkMode ? "#9ca3af" : "#6b7280",
        },
        subInfoValue: {
            fontSize: 14,
            fontWeight: "600",
            color: darkMode ? "#d1d5db" : "#374151",
        },
        actionButtons: {
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
        },
        btnApprove: {
            flex: 1,
            backgroundColor: "#10b981",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
        },
        btnReject: {
            flex: 1,
            backgroundColor: "#ef4444",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
        },
        btnText: {
            color: "#ffffff",
            fontSize: 14,
            fontWeight: "700",
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 100,
        },
        emptyText: {
            fontSize: 16,
            color: darkMode ? "#9ca3af" : "#6b7280",
            marginTop: 12,
        },
        backToPricing: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
        },
        backText: {
            fontSize: 16,
            color: darkMode ? '#9ca3af' : '#6b7280',
        }
    });

    if (!isPasswordVerified) {
        return (
            <View style={styles.container}>
                <View style={styles.verifyContainer}>
                    <TouchableOpacity
                        style={styles.backToPricing}
                        onPress={() => navigation.navigate('Pricing' as never)}
                    >
                        <Ionicons name="arrow-back" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Text style={styles.backText}>Back to Pricing</Text>
                    </TouchableOpacity>
                    <Animated.View entering={FadeIn.duration(600)} style={styles.verifyCard}>
                        <Text style={styles.verifyTitle}>Admin Verification</Text>
                        <Text style={styles.verifySubtitle}>Please enter the admin password to view subscription requests.</Text>

                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            placeholderTextColor={darkMode ? "#4b5563" : "#9ca3af"}
                            secureTextEntry
                            value={passwordInput}
                            onChangeText={setPasswordInput}
                            autoFocus
                        />

                        {passwordError ? <Text style={styles.passwordErrorText}>{passwordError}</Text> : null}

                        <TouchableOpacity style={styles.verifyButton} onPress={handlePasswordSubmit}>
                            <Text style={styles.verifyButtonText}>Verify & Access</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Subscription Approvals</Text>
            </View>

            <ScrollView style={styles.list}>
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color="#06b6d4" />
                        <Text style={styles.emptyText}>Loading subscriptions...</Text>
                    </View>
                ) : subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                        <Animated.View key={sub._id} entering={FadeIn} style={styles.subCard}>
                            <View style={styles.subHeader}>
                                <View>
                                    <Text style={styles.userName}>
                                        {sub.profile?.firstName} {sub.profile?.lastName || ""}
                                    </Text>
                                    <Text style={styles.userEmail}>{sub.email}</Text>
                                </View>
                                <View style={styles.planBadge}>
                                    <Text style={styles.planText}>{sub.subscription?.planName || "N/A"}</Text>
                                </View>
                            </View>

                            <View style={styles.subInfoRow}>
                                <Text style={styles.subInfoLabel}>Price:</Text>
                                <Text style={styles.subInfoValue}>
                                    {sub.subscription?.price} {sub.subscription?.currency}
                                </Text>
                            </View>

                            <View style={styles.subInfoRow}>
                                <Text style={styles.subInfoLabel}>Requested At:</Text>
                                <Text style={styles.subInfoValue}>
                                    {sub.subscription?.subscribedAt
                                        ? new Date(sub.subscription.subscribedAt).toLocaleDateString()
                                        : "N/A"}
                                </Text>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.btnApprove}
                                    onPress={() => handleApprove(sub._id)}
                                >
                                    <Text style={styles.btnText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnReject} onPress={() => handleReject(sub._id)}>
                                    <Text style={styles.btnText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="document-text-outline"
                            size={64}
                            color={darkMode ? "#374151" : "#d1d5db"}
                        />
                        <Text style={styles.emptyText}>No pending subscriptions found.</Text>
                        <TouchableOpacity
                            style={{ marginTop: 20 }}
                            onPress={fetchSubscriptions}
                        >
                            <Text style={{ color: '#06b6d4', fontWeight: 'bold' }}>Refresh List</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default SubscriptionAdmin;
