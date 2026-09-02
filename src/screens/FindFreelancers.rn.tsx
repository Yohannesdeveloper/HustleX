/**
 * React Native FindFreelancers Screen
 * Dedicated screen for Find Freelancers interface only (FindFreelancersTab component)
 */

import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useAppSelector } from "../store/hooks";
import FindFreelancersTab from "../components/FindFreelancersTab.rn";

const FindFreelancers: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [sharedFreelancers, setSharedFreelancers] = useState<any[]>([]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => handleBackPress();
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );

  // Fix web background color issues
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const bgColor = darkMode ? "#000000" : "#ffffff";
      document.documentElement.style.backgroundColor = bgColor;
      document.body.style.backgroundColor = bgColor;
      const rootEl = document.getElementById("root") || document.getElementById("app");
      if (rootEl) {
        (rootEl as HTMLElement).style.backgroundColor = bgColor;
      }
    }
  }, [darkMode]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      ...(Platform.OS === "web" && { minHeight: "100vh" }),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      ...(Platform.OS === "web" && { position: "sticky" as any, top: 0, zIndex: 100 }),
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
    content: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      ...(Platform.OS === "web" && { minHeight: "calc(100vh - 60px)" }),
    },
  });

  // Use View instead of SafeAreaView on web to avoid rendering issues
  const Container = Platform.OS === "web" ? View : SafeAreaView;

  return (
    <Container style={styles.container} edges={Platform.OS === "web" ? undefined : ["top"]}>
      {Platform.OS !== "web" && (
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={darkMode ? "#000000" : "#ffffff"}
        />
      )}
      {/* Header with back button to navigate back to dashboard */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#111827"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Freelancers</Text>
      </View>

      {/* Find Freelancers Tab Content */}
      <View style={styles.content}>
        <FindFreelancersTab
          sharedFreelancers={sharedFreelancers}
          setSharedFreelancers={setSharedFreelancers}
        />
      </View>
    </Container>
  );
};

export default FindFreelancers;
