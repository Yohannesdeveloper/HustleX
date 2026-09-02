/**
 * React Native ChatMessages Screen
 * Dedicated screen for chat interface only (MessagesTab component)
 */

import React, { useCallback } from "react";
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
import MessagesTab from "../components/MessagesTab.rn";

const ChatMessages: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

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
      {/* Header with back button and Messages title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#111827"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Messages Tab Content - MessagesTab handles its own internal navigation */}
      <View style={styles.content}>
        <MessagesTab />
      </View>
    </SafeAreaView>
  );
};

export default ChatMessages;
