/**
 * React Native FindFreelancersTab Component
 * Adapted from web version with React Native components
 * Shows all signed up freelancers with search and filtering
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const CACHE_KEY = "freelancers_cache";
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface Freelancer {
  _id: string;
  email: string;
  status?: "online" | "offline" | "available" | "busy";
  lastActive?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experienceLevel?: string;
    yearsOfExperience?: string;
    portfolioUrl?: string;
    certifications?: string[];
    cvUrl?: string;
    availability?: string;
    monthlyRate?: string;
    currency?: string;
    preferredJobTypes?: string[];
    workLocation?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    // Legacy fields for backward compatibility
    linkedin?: string;
    github?: string;
    portfolio?: string;
    experience?: string;
    education?: string;
    workExperience?: string;
    avatar?: string;
    // Profile completion tracking
    isProfileComplete?: boolean;
    profileCompletedAt?: Date;
    // Primary skill for display
    primarySkill?: string;
    // Profile picture field
    profilePicture?: string;
  };
  roles?: string[];
}

interface FindFreelancersTabProps {
  sharedFreelancers?: Freelancer[];
  setSharedFreelancers?: (freelancers: Freelancer[]) => void;
}

const FindFreelancersTab: React.FC<FindFreelancersTabProps> = ({
  sharedFreelancers,
  setSharedFreelancers,
}) => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  // Use shared state if provided, otherwise use local state
  const [localFreelancers, setLocalFreelancers] = useState<Freelancer[]>([]);
  const freelancers = sharedFreelancers || localFreelancers;

  const setFreelancers = useCallback(
    (newFreelancers: Freelancer[]) => {
      if (setSharedFreelancers) {
        setSharedFreelancers(newFreelancers);
      } else {
        setLocalFreelancers(newFreelancers);
      }
    },
    [setSharedFreelancers]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const hasFetchedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const fetchFreelancers = useCallback(async (retries = 3) => {
    try {
      console.log("[FindFreelancersTab] fetchFreelancers called, retries:", retries);
      setLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("[FindFreelancersTab] Request timeout, stopping loading");
        setLoading(false);
      }, 30000); // 30 second timeout

      const result = await apiService.getFreelancers();
      console.log("[FindFreelancersTab] Fetched freelancers data:", result);

      // Clear timeout on success
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Handle API response - it might return { freelancers: [...] } or just [...]
      const data = Array.isArray(result) ? result : result?.freelancers || [];
      console.log("[FindFreelancersTab] Number of freelancers before deduplication:", data.length);

      // Deduplicate freelancers by _id - keep the first occurrence
      const uniqueFreelancers = data.reduce((acc: Freelancer[], current: Freelancer) => {
        const existingIndex = acc.findIndex((f) => f._id === current._id);

        if (existingIndex === -1) {
          // New freelancer, add it
          acc.push(current);
        }
        // If duplicate found, skip it (keep the first one)
        return acc;
      }, []);

      console.log("[FindFreelancersTab] Number of freelancers after deduplication:", uniqueFreelancers.length);

      // Only update if we got valid data
      if (Array.isArray(uniqueFreelancers)) {
        console.log("[FindFreelancersTab] Setting freelancers:", uniqueFreelancers.length);
        setFreelancers(uniqueFreelancers);
        setError(null);
        // Clear any retry timeout on success
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } else {
        console.warn("[FindFreelancersTab] Invalid freelancers data received:", data);
        setError("Invalid data received from server");
        // Keep existing freelancers if API returns invalid data
      }
    } catch (error: any) {
      console.error("[FindFreelancersTab] Error fetching freelancers:", error);

      // Clear timeout on error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Check if it's a network error (backend not running)
      const isNetworkError =
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNREFUSED" ||
        error?.message?.includes("Network Error") ||
        error?.message?.includes("CONNECTION_REFUSED");

      if (isNetworkError) {
        const errorMsg = "Unable to connect to server. Please ensure the backend is running.";
        console.warn("[FindFreelancersTab]", errorMsg);
        setError(errorMsg);

        // Retry logic for network errors
        if (retries > 0) {
          console.log(`[FindFreelancersTab] Retrying in 2 seconds... (${retries} attempts remaining)`);
          retryTimeoutRef.current = setTimeout(() => {
            fetchFreelancers(retries - 1);
          }, 2000);
        } else {
          // Final failure - keep existing freelancers if we have any
          const currentFreelancers = sharedFreelancers || localFreelancers;
          if (currentFreelancers.length === 0) {
            // Try to load from cache as last resort
            try {
              const cached = await AsyncStorage.getItem(CACHE_KEY);
              if (cached) {
                const { data } = JSON.parse(cached);
                if (Array.isArray(data) && data.length > 0) {
                  // Deduplicate cached data as well
                  const uniqueCached = data.reduce((acc: Freelancer[], current: Freelancer) => {
                    const existingIndex = acc.findIndex((f) => f._id === current._id);
                    if (existingIndex === -1) {
                      acc.push(current);
                    }
                    return acc;
                  }, []);
                  console.log("[FindFreelancersTab] Loading from cache as last resort:", uniqueCached.length);
                  setFreelancers(uniqueCached);
                  setError(null);
                }
              }
            } catch (e) {
              console.error("[FindFreelancersTab] Failed to load from cache:", e);
            }
          }
        }
      } else {
        // For other errors, only clear if we have no freelancers yet
        setError(error?.message || "Failed to load freelancers");
        const currentFreelancers = sharedFreelancers || localFreelancers;
        if (currentFreelancers.length === 0) {
          setFreelancers([]);
        }
      }
    } finally {
      console.log("[FindFreelancersTab] Setting loading to false");
      setLoading(false);
    }
  }, [setFreelancers, sharedFreelancers, localFreelancers]);

  // Load from cache on mount - only run once
  useEffect(() => {
    const loadCachedFreelancers = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          // Use cache if less than timeout old
          if (age < CACHE_TIMEOUT && Array.isArray(data) && data.length > 0) {
            // Deduplicate cached data
            const uniqueCached = data.reduce((acc: Freelancer[], current: Freelancer) => {
              const existingIndex = acc.findIndex((f) => f._id === current._id);
              if (existingIndex === -1) {
                acc.push(current);
              }
              return acc;
            }, []);
            console.log("[FindFreelancersTab] Loading freelancers from cache:", uniqueCached.length);
            setFreelancers(uniqueCached);
            setLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.error("[FindFreelancersTab] Failed to load cached freelancers:", error);
      }
      return false;
    };

    // Try to load from cache first
    loadCachedFreelancers().then((cacheLoaded) => {
      // Always fetch fresh data, but cache provides instant display
      if (!hasFetchedRef.current) {
        console.log("[FindFreelancersTab] Fetching fresh data...");
        fetchFreelancers();
        hasFetchedRef.current = true;
      }
    });

    // Safety timeout to prevent infinite loading (only runs once on mount)
    const safetyTimeout = setTimeout(() => {
      console.warn("[FindFreelancersTab] Safety timeout triggered, ensuring loading stops");
      setLoading(false);
    }, 35000); // 35 second safety timeout

    return () => {
      clearTimeout(safetyTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save to cache when freelancers change
  useEffect(() => {
    if (freelancers.length > 0) {
      try {
        AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: freelancers,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("[FindFreelancersTab] Failed to cache freelancers:", error);
      }
    }
  }, [freelancers]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Get unique skills and locations from freelancers
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    freelancers.forEach((f) => {
      f.profile?.skills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [freelancers]);

  const allLocations = useMemo(() => {
    const locationsSet = new Set<string>();
    freelancers.forEach((f) => {
      if (f.profile?.location) {
        locationsSet.add(f.profile.location);
      }
    });
    return Array.from(locationsSet).sort();
  }, [freelancers]);

  // Filter freelancers based on search
  const filteredFreelancers = useMemo(() => {
    console.log("[FindFreelancersTab] Filtering freelancers. Total:", freelancers.length);
    const filtered = freelancers.filter((freelancer) => {
      // Filter out the current user to prevent self-messaging
      if (user?._id && freelancer._id === user._id) {
        return false;
      }

      const profile = freelancer.profile || {};
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim().toLowerCase();
      const email = (freelancer.email || "").toLowerCase();
      const skills = profile.skills || [];
      const primarySkill = profile.primarySkill || "";

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !fullName.includes(searchLower) &&
          !email.includes(searchLower) &&
          !skills.some((s) => s.toLowerCase().includes(searchLower)) &&
          !primarySkill.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
    console.log("[FindFreelancersTab] Filtered freelancers count:", filtered.length);
    return filtered;
  }, [freelancers, searchTerm, user?._id]);

  // Calculate cards per row and card width based on screen width
  const getCardStyle = () => {
    if (screenWidth < 400) {
      return { width: screenWidth * 0.95 }; // Convert percentage to actual pixel value
    }
    if (screenWidth < 600) {
      return { width: screenWidth * 0.95 };
    }
    if (screenWidth < 1000) {
      return { width: screenWidth * 0.47 };
    }
    if (screenWidth < 1400) {
      return { width: screenWidth * 0.31 };
    }
    return { width: screenWidth * 0.23 };
  };

  const cardStyle = getCardStyle();

  const handleMessage = (freelancer: Freelancer) => {
    // Navigate to messages tab with freelancer selected
    (navigation as any).navigate("FreelancingDashboard", {
      tab: "messages",
      freelancerId: freelancer._id,
    });
  };

  const handleViewProfile = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedFreelancer(null);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      ...(Platform.OS === "web" && { minHeight: "100%" }),
    },
    searchContainer: {
      padding: 16,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.9)",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    headerIcon: {
      padding: 12,
      borderRadius: 16,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: Platform.OS === "android" ? 24 : Math.max(24, 20),
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    headerSubtitle: {
      fontSize: Platform.OS === "android" ? 14 : Math.max(14, 12),
      color: darkMode ? "#9ca3af" : "#6b7280",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    searchInput: {
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: Platform.OS === "android" ? 16 : Math.max(16, 14),
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 2,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    searchInputFocused: {
      borderColor: "#06b6d4",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.95)",
    },
    freelancersList: {
      flex: 1,
    },
    freelancersListContent: {
      padding: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      ...Platform.select({
        web: {
          minHeight: "100%",
        },
      }),
    },
    freelancerCard: {
      backgroundColor: darkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.9)",
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    freelancerHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    },
    freelancerAvatar: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.5)" : "rgba(6, 182, 212, 0.3)",
    },
    freelancerAvatarText: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#06b6d4" : "#06b6d4",
    },
    freelancerInfo: {
      flex: 1,
      minWidth: 0,
    },
    freelancerName: {
      fontSize: Platform.OS === "android" ? 18 : Math.max(18, 16),
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 4,
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    freelancerSkill: {
      fontSize: Platform.OS === "android" ? 14 : Math.max(14, 12),
      fontWeight: "600",
      color: darkMode ? "#06b6d4" : "#06b6d4",
      marginBottom: 8,
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    freelancerDetail: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    freelancerDetailText: {
      fontSize: Platform.OS === "android" ? 12 : Math.max(12, 10),
      color: darkMode ? "#9ca3af" : "#6b7280",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    freelancerSkills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 12,
      marginBottom: 12,
    },
    skillBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    skillBadgeText: {
      fontSize: Platform.OS === "android" ? 11 : Math.max(11, 9),
      color: "#06b6d4",
      fontWeight: "600",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    freelancerActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    viewProfileButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderWidth: 2,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
      alignItems: "center",
    },
    viewProfileButtonText: {
      fontSize: Platform.OS === "android" ? 13 : Math.max(13, 11),
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    messageButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: "#06b6d4",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: Platform.OS === "android" ? 16 : Math.max(16, 14),
      color: darkMode ? "#06b6d4" : "#06b6d4",
      fontWeight: "600",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      fontSize: Platform.OS === "android" ? 16 : Math.max(16, 14),
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      marginTop: 16,
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    emptyTitle: {
      fontSize: Platform.OS === "android" ? 20 : Math.max(20, 18),
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: darkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
      padding: 16,
      margin: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(239, 68, 68, 0.3)",
      gap: 12,
    },
    errorText: {
      flex: 1,
      fontSize: Platform.OS === "android" ? 14 : Math.max(14, 12),
      color: "#ef4444",
      ...(Platform.OS === "android" && { letterSpacing: 0 }),
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 16,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    closeButton: {
      padding: 8,
    },
    modalBody: {
      flex: 1,
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 2,
      borderColor: 'rgba(6, 182, 212, 0.3)',
    },
    profileName: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 5,
    },
    profileEmail: {
      fontSize: 16,
      marginBottom: 10,
    },
    profileSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    profileBio: {
      fontSize: 16,
      lineHeight: 24,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    skillTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    skillText: {
      fontSize: 14,
      fontWeight: '500',
    },
    detailsGrid: {
      gap: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 16,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalActionButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    modalActionText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  console.log("[FindFreelancersTab] Render - loading:", loading, "freelancers:", freelancers.length, "filtered:", filteredFreelancers.length, "error:", error);

  if (loading && freelancers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Discovering Elite Talent...</Text>
          {error && (
            <Text style={[styles.loadingText, { color: "#ef4444", marginTop: 8, fontSize: 12 }]}>
              {error}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={24} color={darkMode ? "#06b6d4" : "#06b6d4"} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Find Elite Freelancers</Text>
            <Text style={styles.headerSubtitle}>Discover top talent ready to work</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, skill, or expertise..."
          placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Error Message */}
      {error && freelancers.length === 0 && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Freelancers Grid */}
      <ScrollView
        style={styles.freelancersList}
        contentContainerStyle={[styles.freelancersListContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {filteredFreelancers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={darkMode ? "#9ca3af" : "#6b7280"} />
            <Text style={styles.emptyTitle}>No freelancers found</Text>
            <Text style={styles.emptyText}>
              {searchTerm
                ? "Try adjusting your search"
                : error
                  ? error
                  : "No freelancers available at the moment"}
            </Text>
          </View>
        ) : (
          filteredFreelancers.map((freelancer, index) => {
            const profile = freelancer.profile || {};
            const fullName =
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email;
            const primarySkill = profile.primarySkill || profile.skills?.[0] || "Freelancer";
            const location = profile.location || "Not specified";
            const monthlyRate = profile.monthlyRate || "0";
            const currency = profile.currency || "ETB";

            return (
              <Animated.View
                key={freelancer._id}
                entering={FadeIn.duration(300).delay(index * 50)}
                style={[styles.freelancerCard, typeof cardStyle === 'object' ? cardStyle : {}]}
              >
                <View style={styles.freelancerHeader}>
                  {/* Avatar */}
                  <View style={styles.freelancerAvatar}>
                    {profile.profilePicture ? (
                      <Image
                        source={{ uri: apiService.getFileUrl(profile.profilePicture) }}
                        style={{ width: 64, height: 64, borderRadius: 16 }}
                      />
                    ) : (
                      <Text style={styles.freelancerAvatarText}>
                        {fullName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.freelancerInfo}>
                    <Text style={styles.freelancerName} numberOfLines={1}>
                      {fullName}
                    </Text>
                    <Text style={styles.freelancerSkill} numberOfLines={1}>
                      {primarySkill}
                    </Text>
                    <View style={styles.freelancerDetail}>
                      <Ionicons
                        name="location"
                        size={14}
                        color={darkMode ? "#06b6d4" : "#06b6d4"}
                      />
                      <Text style={styles.freelancerDetailText} numberOfLines={1}>
                        {location}
                      </Text>
                    </View>

                  </View>
                </View>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <View style={styles.freelancerSkills}>
                    {profile.skills.slice(0, 3).map((skill, idx) => (
                      <View key={idx} style={styles.skillBadge}>
                        <Text style={styles.skillBadgeText} numberOfLines={1}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                    {profile.skills.length > 3 && (
                      <View style={styles.skillBadge}>
                        <Text style={styles.skillBadgeText}>
                          +{profile.skills.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.freelancerActions}>
                  <TouchableOpacity
                    style={styles.viewProfileButton}
                    onPress={() => handleViewProfile(freelancer)}
                  >
                    <Text style={styles.viewProfileButtonText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => handleMessage(freelancer)}
                  >
                    <Ionicons name="chatbubble" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Freelancer Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeProfileModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#1f2937' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
                Freelancer Profile
              </Text>
              <TouchableOpacity onPress={closeProfileModal} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? '#ffffff' : '#111827'}
                />
              </TouchableOpacity>
            </View>

            {selectedFreelancer && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Ionicons
                      name="person"
                      size={48}
                      color={darkMode ? '#06b6d4' : '#06b6d4'}
                    />
                  </View>
                  <Text style={[styles.profileName, { color: darkMode ? '#ffffff' : '#111827' }]}>
                    {selectedFreelancer.profile?.firstName || ''} {selectedFreelancer.profile?.lastName || ''}
                  </Text>
                  <Text style={[styles.profileEmail, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                    {selectedFreelancer.email}
                  </Text>
                </View>

                {selectedFreelancer.profile?.bio && (
                  <View style={styles.profileSection}>
                    <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
                      About
                    </Text>
                    <Text style={[styles.profileBio, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                      {selectedFreelancer.profile.bio}
                    </Text>
                  </View>
                )}

                {selectedFreelancer.profile?.skills && selectedFreelancer.profile.skills.length > 0 && (
                  <View style={styles.profileSection}>
                    <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
                      Skills
                    </Text>
                    <View style={styles.skillsContainer}>
                      {selectedFreelancer.profile.skills.map((skill, index) => (
                        <View
                          key={index}
                          style={[styles.skillTag, { backgroundColor: darkMode ? '#374151' : '#e5e7eb' }]}
                        >
                          <Text style={[styles.skillText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                            {skill}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.profileSection}>
                  <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
                    Details
                  </Text>
                  <View style={styles.detailsGrid}>
                    {selectedFreelancer.profile?.location && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="location"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.location}
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.experienceLevel && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="briefcase"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.experienceLevel}
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.yearsOfExperience && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="calendar"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.yearsOfExperience} years experience
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.availability && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.availability}
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.workLocation && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="home"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.workLocation}
                        </Text>
                      </View>
                    )}

                    {selectedFreelancer.profile?.phone && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="call"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.phone}
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.portfolioUrl && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="link"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          {selectedFreelancer.profile.portfolioUrl}
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.linkedinUrl && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="logo-linkedin"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          LinkedIn
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.githubUrl && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="logo-github"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          GitHub
                        </Text>
                      </View>
                    )}
                    {selectedFreelancer.profile?.cvUrl && (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="document"
                          size={16}
                          color={darkMode ? '#06b6d4' : '#06b6d4'}
                        />
                        <Text style={[styles.detailText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                          CV Available
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: darkMode ? '#374151' : '#e5e7eb' }]}
                    onPress={closeProfileModal}
                  >
                    <Text style={[styles.modalActionText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: '#06b6d4' }]}
                    onPress={() => {
                      handleMessage(selectedFreelancer);
                      closeProfileModal();
                    }}
                  >
                    <Ionicons name="chatbubble" size={18} color="#ffffff" />
                    <Text style={[styles.modalActionText, { color: '#ffffff', marginLeft: 8 }]}>
                      Message
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FindFreelancersTab;
