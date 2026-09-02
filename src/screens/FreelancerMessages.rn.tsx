/**
 * React Native FreelancerMessages Screen
 * Screen for Find Freelancers and Messages sub-tabs
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import FindFreelancersTab from "../components/FindFreelancersTab.rn";
import MessagesTab from "../components/MessagesTab.rn";

type MessagesSubTabType = "find" | "messages";

const FreelancerMessages: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  
  const routeParams = (route.params as any) || {};
  const freelancerId = routeParams.freelancerId;
  
  // Default to "messages" if freelancerId is provided, otherwise "find"
  const [messagesSubTab, setMessagesSubTab] = useState<MessagesSubTabType>(
    freelancerId ? "messages" : "find"
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "MainSwipeableTabs" as never }],
    });
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => handleBackPress();
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    subTabsContainer: {
      flexDirection: "row",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    subTab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    subTabActive: {
      borderBottomColor: "#06b6d4",
    },
    subTabText: {
      fontSize: Platform.OS === 'android' ? 16 : Math.max(16, 14),
      fontWeight: "600",
      color: darkMode ? "#9ca3af" : "#6b7280",
      ...(Platform.OS === 'android' && { letterSpacing: 0 }),
    },
    subTabTextActive: {
      color: darkMode ? "#ffffff" : "#000000",
    },
    content: {
      flex: 1,
    },
  });





  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#000000" : "#ffffff"}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#111827"} />
        </TouchableOpacity>
        {/* #region agent log */}
        <Text style={styles.headerTitle}>
          Messages
        </Text>
      </View>

      {/* Sub-tabs */}
      <View style={styles.subTabsContainer}>
        <TouchableOpacity
          style={[styles.subTab, messagesSubTab === "find" && styles.subTabActive]}
          onPress={() => setMessagesSubTab("find")}
        >
          <Text style={[styles.subTabText, messagesSubTab === "find" && styles.subTabTextActive]}>
            Find Freelancers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, messagesSubTab === "messages" && styles.subTabActive]}
          onPress={() => setMessagesSubTab("messages")}
        >
          <Text style={[styles.subTabText, messagesSubTab === "messages" && styles.subTabTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {messagesSubTab === "find" ? (
          <FindFreelancersTab />
        ) : (
          <MessagesTab />
        )}
      </View>
    </SafeAreaView>
  );
};

export default FreelancerMessages;
