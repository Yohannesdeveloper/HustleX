/**
 * React Native EditBlog Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const categories = [
  "Technology",
  "Design",
  "Business",
  "Lifestyle",
  "Tutorial",
  "News",
];

const EditBlog: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const blogId = (route.params as any)?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [imageFile, setImageFile] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [readTime, setReadTime] = useState("1 min read");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setReadTime(`${Math.max(1, Math.ceil(words / 200))} min read`);
  }, [content]);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;

      try {
        const blog = await apiService.getBlog(blogId);
        setTitle(blog.title || "");
        setContent(blog.content || "");
        setCategory(blog.category || "Technology");
        setCurrentImageUrl(blog.imageUrl || null);
        if (blog.imageUrl) {
          setImagePreview(apiService.getFileUrl(blog.imageUrl));
        }
      } catch (error: any) {
        setError("Failed to load blog post: " + (error?.message || "Unknown error"));
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageFile(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!apiService.isAuthenticated()) {
        setError("Please log in to update a blog post");
        navigation.navigate("Signup" as never, {
          redirect: `/blog/edit/${blogId}`,
        } as never);
        return;
      }

      let imageUrl = currentImageUrl;
      if (imageFile) {
        const res = await apiService.uploadBlogImage(imageFile);
        imageUrl = res.fileUrl;
      }

      await apiService.updateBlog(blogId!, {
        title,
        content,
        category,
        readTime,
        imageUrl: imageUrl || undefined,
      });

      setSuccess("Blog post updated successfully");
      setTimeout(() => navigation.navigate("Blog" as never), 800);
    } catch (err: any) {
      setError(err?.message || "Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#FFFFFF",
    },
    header: {
      backgroundColor: darkMode ? "#111827" : "rgba(255,255,255,0.6)",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      paddingHorizontal: 24,
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    backButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: darkMode ? "#06b6d4" : "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backButtonText: {
      color: "#000000",
      fontWeight: "600",
    },
    scrollContent: {
      padding: 24,
    },
    formGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      color: darkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
    },
    input: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    textArea: {
      minHeight: 200,
      textAlignVertical: "top",
    },
    picker: {
      backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      borderRadius: 12,
      color: darkMode ? "#FFFFFF" : "#000000",
    },
    imagePicker: {
      marginTop: 8,
    },
    imagePickerButton: {
      backgroundColor: darkMode ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.1)",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(6,182,212,0.5)" : "#06b6d4",
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    imagePickerButtonText: {
      color: darkMode ? "#22d3ee" : "#0891b2",
      fontWeight: "600",
    },
    imagePreview: {
      width: "100%",
      height: 192,
      borderRadius: 12,
      marginTop: 12,
      resizeMode: "cover",
    },
    readTime: {
      fontSize: 12,
      color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      marginTop: 4,
    },
    error: {
      color: "#ef4444",
      fontSize: 14,
      marginBottom: 16,
    },
    success: {
      color: "#22c55e",
      fontSize: 14,
      marginBottom: 16,
    },
    submitButton: {
      backgroundColor: "#06b6d4",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      opacity: loading ? 0.6 : 1,
    },
    submitButtonText: {
      color: "#000000",
      fontSize: 16,
      fontWeight: "bold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      color: darkMode ? "#22d3ee" : "#0891b2",
    },
  });

  if (fetchLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={darkMode ? "#22d3ee" : "#0891b2"} />
        <Text style={styles.loadingText}>Loading blog post...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Blog Post</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Blog" as never)}
        >
          <Ionicons name="arrow-back" size={16} color="#000000" />
          <Text style={styles.backButtonText}>Back to Blog</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={{ color: darkMode ? "#FFFFFF" : "#000000" }}
              >
                {categories.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Featured Image</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Ionicons name="image" size={20} color={darkMode ? "#22d3ee" : "#0891b2"} />
              <Text style={styles.imagePickerButtonText}>
                {imageFile ? "Change Image" : "Select Image"}
              </Text>
            </TouchableOpacity>
            {imagePreview && (
              <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            )}
            {!imageFile && currentImageUrl && (
              <Text style={styles.readTime}>
                Current image will be kept if no new image is selected
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={12}
              placeholder="Write your content..."
              placeholderTextColor={darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={[styles.input, styles.textArea]}
            />
            <Text style={styles.readTime}>{readTime}</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#000000" />
                <Text style={styles.submitButtonText}>Update Post</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default EditBlog;
