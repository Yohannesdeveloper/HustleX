/**
 * React Native Chat Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Main chat interface with Find Freelancers and Messages tabs
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import FindFreelancersTab from "../components/FindFreelancersTab.rn";
import MessagesTab from "../components/MessagesTab.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const Chat: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [activeTab, setActiveTab] = useState<"find" | "messages">("find");
  const [sharedFreelancers, setSharedFreelancers] = useState<any[]>([]);

  useEffect(() => {
    const state = (route.params as any)?.freelancerId;
    if (state) {
      setActiveTab("messages");
    }
  }, [route.params]);

  const tabs = [
    {
      id: "find" as const,
      label: "Find Freelancers",
      icon: "people",
    },
    {
      id: "messages" as const,
      label: "Messages",
      icon: "chatbubbles",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
    },
    header: {
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(6, 182, 212, 0.2)",
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 8,
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      textAlign: "center",
    },
    tabsContainer: {
      flexDirection: "row",
      padding: 8,
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.6)",
      borderRadius: 16,
      margin: 16,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
    },
    tabActive: {
      backgroundColor: darkMode ? "rgba(6, 182, 212, 0.3)" : "#06b6d4",
    },
    tabInactive: {
      backgroundColor: "transparent",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "700",
    },
    tabTextActive: {
      color: "#ffffff",
    },
    tabTextInactive: {
      color: darkMode ? "#9ca3af" : "#6b7280",
    },
    tabContent: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={24} color="#06b6d4" />
        </View>
        <Text style={styles.headerTitle}>Connect & Collaborate</Text>
        <Text style={styles.headerSubtitle}>
          Find talented freelancers and start meaningful conversations
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={isActive ? "#ffffff" : darkMode ? "#9ca3af" : "#6b7280"}
              />
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent} pointerEvents="box-none">
        {activeTab === "find" && (
          <FindFreelancersTab
            sharedFreelancers={sharedFreelancers}
            setSharedFreelancers={setSharedFreelancers}
          />
        )}
        {activeTab === "messages" && <MessagesTab />}
      </View>
    </View>
  );
};

export default Chat;
