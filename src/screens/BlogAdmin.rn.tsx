/**
 * React Native BlogAdmin Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Admin interface for managing and creating blog posts
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAppSelector, useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECRET_ID = "BlogPost";

const categories = [
  "Technology",
  "Design",
  "Business",
  "Lifestyle",
  "Tutorial",
  "News",
  "AI & Machine Learning",
  "Data Science",
  "Programming",
  "Product",
  "Startups",
  "Marketing",
  "Remote Work",
  "Education",
  "Health",
  "Finance",
  "Case Study",
  "Interview",
  "Opinion",
  "Guides",
  "Announcements",
];

const BlogAdmin: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'moderate' | 'create'>('moderate');
  const [idInput, setIdInput] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  // Blog List State
  const [blogs, setBlogs] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [imageFile, setImageFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readTime, setReadTime] = useState("1 min read");
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (isAuthenticated && user?.roles?.includes('admin')) {
        setHasAccess(true);
        fetchBlogs();
        return;
      }
      try {
        const access = await AsyncStorage.getItem("blogAdminAccess");
        if (access === "true") {
          setHasAccess(true);
          fetchBlogs();
        }
      } catch (error) {
        console.error("Error checking access:", error);
      }
    };
    checkAccess();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setReadTime(`${Math.max(1, Math.ceil(words / 200))} min read`);
  }, [content]);

  const fetchBlogs = async () => {
    setListLoading(true);
    try {
      const res = await apiService.fetchAdminBlogs();
      setBlogs(res.blogs || []);
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleVerify = async () => {
    if (idInput === SECRET_ID) {
      setHasAccess(true);
      await AsyncStorage.setItem("blogAdminAccess", "true");
      await AsyncStorage.setItem("adminCode", idInput);
      setError("");
      fetchBlogs();
    } else {
      setError("Invalid ID");
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageFile(asset);
        setImagePreview(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const submit = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill in title and content");
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const res = await apiService.uploadBlogImage(imageFile);
        imageUrl = res.fileUrl;
      }

      await apiService.createBlog({
        title,
        content,
        category,
        readTime,
        imageUrl,
      });

      setSuccess("Published successfully");
      setTitle("");
      setContent("");
      setCategory("Technology");
      setImageFile(null);
      setImagePreview(null);

      // Auto switch back to list
      setTimeout(() => {
        setSuccess("");
        setActiveTab('moderate');
        fetchBlogs();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to publish");
      Alert.alert("Error", err?.message || "Failed to publish");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTogglePublish = async (blog: any) => {
    try {
      await apiService.updateBlog(blog._id, { isPublished: !blog.isPublished });
      setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, isPublished: !b.isPublished } : b));
    } catch (err: any) {
      Alert.alert("Error", "Failed to update blog status");
    }
  };

  const handleDelete = async (blogId: string) => {
    Alert.alert("Delete Blog", "Are you sure you want to delete this blog post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.deleteBlog(blogId);
            setBlogs(prev => prev.filter(b => b._id !== blogId));
          } catch (err) {
            Alert.alert("Error", "Failed to delete blog");
          }
        }
      }
    ]);
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
    // Header
    header: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)",
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#1e293b",
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 16,
      marginTop: 8,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: "#06b6d4",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "700",
      color: darkMode ? "#94a3b8" : "#64748b",
    },
    activeTabText: {
      color: "#ffffff",
    },
    // Content
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    // Form Styles
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
      marginBottom: 8,
    },
    textArea: {
      minHeight: 200,
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "#334155" : "#e2e8f0",
      textAlignVertical: "top",
    },
    categoryButton: {
      height: 50,
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: darkMode ? "#334155" : "#e2e8f0",
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginTop: 12,
    },
    imageButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      alignSelf: "flex-start",
    },
    submitButton: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 20,
    },
    // List Styles
    blogCard: {
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
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    cardCategory: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: "#06b6d4",
      letterSpacing: 1,
    },
    cardStatus: {
      fontSize: 12,
      fontWeight: "700",
      color: "#10b981",
    },
    unpublishedStatus: {
      color: "#f59e0b",
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#1e293b",
      marginBottom: 8,
    },
    cardActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    btnAction: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
    },
    btnPublish: {
      backgroundColor: "#10b981",
    },
    btnUnpublish: {
      backgroundColor: "#f59e0b",
    },
    btnDelete: {
      backgroundColor: "#ef4444",
    },
    btnText: {
      color: "#ffffff",
      fontSize: 12,
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
    pickerModal: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    pickerContent: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "50%",
    },
    pickerItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    pickerItemText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
  });

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <View style={[styles.verifyContainer, { paddingTop: insets.top + 40 }]}>
          <Animated.View entering={FadeIn.duration(800)}>
            <Text style={styles.verifyTitle}>Blog Admin Access</Text>
            <Text style={styles.verifySubtitle}>
              Please enter the admin code to manage blog posts.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Admin Blog ID"
              placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
              value={idInput}
              onChangeText={setIdInput}
              secureTextEntry
              autoFocus
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
              <Text style={styles.verifyButtonText}>Enter Admin Blog</Text>
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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={darkMode ? "#ffffff" : "#1e293b"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blog Admin</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.navigate("JobAdmin" as never)}>
              <Ionicons name="briefcase" size={24} color={darkMode ? "#ffffff" : "#1e293b"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchBlogs}>
              <Ionicons name="refresh" size={24} color={darkMode ? "#ffffff" : "#1e293b"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'moderate' && styles.activeTab]}
            onPress={() => setActiveTab('moderate')}
          >
            <Text style={[styles.tabText, activeTab === 'moderate' && styles.activeTabText]}>Moderate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === 'moderate' ? (
          <>
            {listLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
              </View>
            ) : blogs.length > 0 ? (
              blogs.map((blog) => (
                <Animated.View key={blog._id} entering={FadeIn} style={styles.blogCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardCategory}>{blog.category}</Text>
                    <Text style={[styles.cardStatus, !blog.isPublished && styles.unpublishedStatus]}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{blog.title}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.btnAction, blog.isPublished ? styles.btnUnpublish : styles.btnPublish]}
                      onPress={() => handleTogglePublish(blog)}
                    >
                      <Ionicons name={blog.isPublished ? "eye-off" : "eye"} size={16} color="#ffffff" />
                      <Text style={styles.btnText}>{blog.isPublished ? "Unpublish" : "Publish"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnAction, styles.btnDelete]}
                      onPress={() => handleDelete(blog._id)}
                    >
                      <Ionicons name="trash" size={16} color="#ffffff" />
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="reader-outline" size={64} color={darkMode ? "#334155" : "#e2e8f0"} />
                <Text style={styles.emptyText}>No blog posts found.</Text>
              </View>
            )}
          </>
        ) : (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, { marginBottom: 0 }]}
                placeholder="Enter title"
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={{ color: darkMode ? '#ffffff' : '#000' }}>{category}</Text>
                <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Featured Image</Text>
              <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                <Ionicons name="image" size={16} color="#ffffff" />
                <Text style={styles.btnText}>Choose Image</Text>
              </TouchableOpacity>
              {imagePreview && (
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} resizeMode="cover" />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your content..."
                placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={10}
              />
            </View>

            {success ? <Text style={{ color: '#10b981', marginBottom: 16 }}>{success}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, formLoading && { opacity: 0.7 }]}
              onPress={submit}
              disabled={formLoading}
            >
              {formLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#ffffff" />
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>Publish Blog Post</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <Modal
          visible={showCategoryPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContent}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "700", color: darkMode ? "#ffffff" : "#000000" }}>
                  Select Category
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color={darkMode ? "#ffffff" : "#000000"} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View >
  );
};

export default BlogAdmin;
