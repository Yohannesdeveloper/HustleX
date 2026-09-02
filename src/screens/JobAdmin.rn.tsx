/**
 * React Native JobAdmin Screen
 * Admin interface for approving/declining job listings
 * Incorporates password protection and moderated workflow
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
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const SECRET_ID = "JobModeration";

const JobAdmin: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const darkMode = useAppSelector((s) => s.theme.darkMode);
    const { user, isAuthenticated } = useAuth();

    // Auth State
    const [hasAccess, setHasAccess] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    // Jobs State
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const initializeAccess = async () => {
            // Check if user is known admin first
            if (isAuthenticated && user?.roles?.includes('admin')) {
                setHasAccess(true);
                fetchPendingJobs();
                setVerifying(false);
                return;
            }
            // Otherwise check stored access
            await checkStoredAccess();
        };
        initializeAccess();
    }, [isAuthenticated, user]);

    const checkStoredAccess = async () => {
        try {
            const access = await AsyncStorage.getItem("jobAdminAccess");
            if (access === "true") {
                setHasAccess(true);
                fetchPendingJobs();
            }
        } catch (err) {
            console.error("Error checking access status:", err);
        } finally {
            setVerifying(false);
        }
    };

    const handleVerify = async () => {
        if (code === SECRET_ID) {
            try {
                await AsyncStorage.setItem("jobAdminAccess", "true");
                await AsyncStorage.setItem("adminCode", code);
                setError("");
                setHasAccess(true);
                fetchPendingJobs();
            } catch (err) {
                Alert.alert("Error", "Failed to save access status");
            }
        } else {
            setError("Invalid ID. Please try again.");
        }
    };

    const fetchPendingJobs = async () => {
        setLoading(true);
        try {
            const response = await apiService.fetchPendingJobs();
            setJobs(response.jobs || []);
        } catch (err: any) {
            console.error("Error fetching pending jobs:", err);
            Alert.alert("Error", "Failed to load pending jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (jobId: string) => {
        Alert.alert("Approve Job", "Are you sure you want to approve this listing?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Approve",
                onPress: async () => {
                    try {
                        await apiService.approveJob(jobId);
                        setJobs(prev => prev.filter((j) => j._id !== jobId));
                        Alert.alert("Approved", "The job is now public.");
                    } catch (err: any) {
                        console.error("Approve job error:", err);
                        Alert.alert("Error", `Failed to approve job: ${err.message || "Unknown error"}`);
                    }
                },
            },
        ]);
    };

    const handleDecline = async (jobId: string) => {
        if (Platform.OS === "ios") {
            Alert.prompt(
                "Decline Job",
                "Please enter the reason for declining this job listing:",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Decline",
                        style: "destructive",
                        onPress: async (reason?: string) => {
                            await executeDecline(jobId, reason || "Does not meet requirements");
                        },
                    },
                ],
                "plain-text"
            );
        } else {
            // Android doesn't support Alert.prompt
            Alert.alert(
                "Decline Job",
                "Are you sure you want to decline this job? This will remove it from the moderation queue.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Decline",
                        style: "destructive",
                        onPress: async () => {
                            await executeDecline(jobId, "Does not meet requirements");
                        },
                    },
                ]
            );
        }
    };

    const executeDecline = async (jobId: string, reason: string) => {
        try {
            console.log(`Declining job ${jobId} with reason: ${reason}`);
            await apiService.declineJob(jobId, reason);
            setJobs(prev => prev.filter((j) => j._id !== jobId));
            Alert.alert("Declined", "The job has been declined.");
        } catch (err: any) {
            console.error("Error declining job:", err);
            Alert.alert("Error", `Failed to decline job: ${err.message || "Unknown error"}`);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: darkMode ? "#000000" : "#f8fafc",
        },
        // Verification Styles
        verifyContainer: {
            flex: 1,
            justifyContent: "center",
            padding: 24,
        },
        verifyTitle: {
            fontSize: 28,
            fontWeight: "800",
            color: darkMode ? "#ffffff" : "#1e293b",
            marginBottom: 8,
        },
        verifySubtitle: {
            fontSize: 16,
            color: darkMode ? "#94a3b8" : "#64748b",
            marginBottom: 32,
        },
        input: {
            width: "100%",
            backgroundColor: darkMode ? "#111827" : "#ffffff",
            borderWidth: 1,
            borderColor: darkMode ? "#334155" : "#e2e8f0",
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 14,
            fontSize: 16,
            color: darkMode ? "#ffffff" : "#000000",
            marginBottom: 12,
        },
        errorText: {
            color: "#ef4444",
            fontSize: 14,
            marginBottom: 16,
            marginLeft: 4,
        },
        verifyButton: {
            width: "100%",
            height: 56,
            borderRadius: 16,
            backgroundColor: "#06b6d4",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
        },
        verifyButtonText: {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "700",
        },
        // Admin List Styles
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingBottom: 16,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: "800",
            color: darkMode ? "#ffffff" : "#1e293b",
        },
        refreshButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: darkMode ? "#1e293b" : "#e2e8f0",
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        jobCard: {
            backgroundColor: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            ...Platform.select({
                web: { boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
                default: { elevation: 3 },
            }),
        },
        jobHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
        },
        jobCategory: {
            fontSize: 12,
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#06b6d4",
            letterSpacing: 1,
        },
        jobPrice: {
            fontSize: 16,
            fontWeight: "700",
            color: darkMode ? "#ffffff" : "#1e293b",
        },
        jobTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: darkMode ? "#ffffff" : "#1e293b",
            marginBottom: 4,
        },
        jobEmail: {
            fontSize: 14,
            color: darkMode ? "#94a3b8" : "#64748b",
            marginBottom: 16,
        },
        jobDescription: {
            fontSize: 14,
            lineHeight: 20,
            color: darkMode ? "#cbd5e1" : "#475569",
            marginBottom: 20,
        },
        cardActions: {
            flexDirection: "row",
            gap: 12,
        },
        btnApprove: {
            flex: 1,
            height: 44,
            backgroundColor: "#10b981",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 6,
        },
        btnDecline: {
            flex: 1,
            height: 44,
            backgroundColor: "#ef4444",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 6,
        },
        btnText: {
            color: "#ffffff",
            fontSize: 14,
            fontWeight: "700",
        },
        emptyContainer: {
            paddingVertical: 100,
            justifyContent: "center",
            alignItems: "center",
        },
        emptyText: {
            marginTop: 16,
            fontSize: 16,
            color: darkMode ? "#64748b" : "#94a3b8",
        },
    });

    if (verifying) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#06b6d4" />
            </View>
        );
    }

    if (!hasAccess) {
        return (
            <View style={styles.container}>
                <View style={[styles.verifyContainer, { paddingTop: insets.top + 40 }]}>
                    <Animated.View entering={FadeIn.duration(800)}>
                        <Text style={styles.verifyTitle}>Job Admin Access</Text>
                        <Text style={styles.verifySubtitle}>
                            Please enter the admin code to moderate job postings.
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter Admin Job ID"
                            placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                            value={code}
                            onChangeText={setCode}
                            secureTextEntry
                            autoFocus
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                            <Text style={styles.verifyButtonText}>Enter Job Moderation</Text>
                            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainSwipeableTabs' as never }],
                        });
                    }
                }}>
                    <Ionicons name="chevron-back" size={28} color={darkMode ? "#ffffff" : "#1e293b"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Moderation</Text>
                <TouchableOpacity
                    style={[styles.refreshButton, { marginRight: 8 }]}
                    onPress={() => navigation.navigate("BlogAdmin" as never)}
                >
                    <Ionicons name="newspaper" size={20} color={darkMode ? "#ffffff" : "#1e293b"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchPendingJobs}>
                    <Ionicons name="refresh" size={20} color={darkMode ? "#ffffff" : "#1e293b"} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color="#06b6d4" />
                    </View>
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <Animated.View key={job._id} entering={FadeIn.delay(200)} style={styles.jobCard}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobCategory}>{job.category}</Text>
                                <Text style={styles.jobPrice}>{job.budget}</Text>
                            </View>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <Text style={styles.jobEmail}>{job.postedBy?.email}</Text>
                            <Text style={styles.jobDescription} numberOfLines={3}>
                                {job.description}
                            </Text>

                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={styles.btnApprove}
                                    onPress={() => handleApprove(job._id)}
                                >
                                    <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                                    <Text style={styles.btnText}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnDecline}
                                    onPress={() => handleDecline(job._id)}
                                >
                                    <Ionicons name="close-circle" size={18} color="#ffffff" />
                                    <Text style={styles.btnText}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="document-text-outline"
                            size={64}
                            color={darkMode ? "#334155" : "#e2e8f0"}
                        />
                        <Text style={styles.emptyText}>No jobs pending moderation.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default JobAdmin;
