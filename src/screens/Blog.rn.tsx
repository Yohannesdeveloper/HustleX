/**
 * React Native Blog Screen
 * Complete conversion maintaining exact UI/UX and functionality
 */

import React, { useEffect, useState } from "react";
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
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setTotalBlogsCount } from "../store/blogSlice";
import { useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "../components/Footer.rn";
import BottomNav from "../components/BottomNav.rn";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type Blog = {
  _id: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  imageUrl?: string | null;
  author?: string;
  createdAt?: string;
  likes?: number;
  views?: number;
};

const categories = [
  "All",
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

const Blog: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const blogAdminAccess = await AsyncStorage.getItem("blogAdminAccess");
        const adminStatus = (user?.roles?.includes("admin") ?? false) || blogAdminAccess === "true";
        setIsAdmin(adminStatus);
        // Check manage mode from route params
        const manageParam = (route.params as any)?.manage;
        setIsManageMode(manageParam === "true");
      } catch (error) {
        console.error("Error checking admin access:", error);
      }
    };
    checkAdminAccess();
  }, [user, route.params]);

  const handleEdit = (blogId: string) => {
    navigation.navigate("EditBlog", { id: blogId });
  };

  const handleDelete = async (blogId: string) => {
    Alert.alert("Delete Blog", "Are you sure you want to delete this blog post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(blogId);
          try {
            await apiService.deleteBlog(blogId);
            setBlogs(blogs.filter((b) => b._id !== blogId));
          } catch (error: any) {
            Alert.alert("Error", `Failed to delete blog post: ${error?.message || "Unknown error"}`);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const load = async () => {
    try {
      const res = await apiService.getBlogs({
        search: search || undefined,
        category: category === "All" ? undefined : category,
      });
      setBlogs(res.blogs || []);
      if (res.pagination) {
        dispatch(setTotalBlogsCount(res.pagination.total));
      }
    } catch (e) {
      console.error("Failed to load blogs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = blogs
    .filter((b) => (b.title + " " + b.content).toLowerCase().includes(search.toLowerCase()))
    .filter((b) => (category === "All" ? true : b.category === category))
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    backNavContainer: {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backText: {
      fontSize: 20,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: 20,
      gap: 12,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    searchInput: {
      flex: 1,
      height: 44,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    categoryButton: {
      height: 44,
      paddingHorizontal: 16,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 120,
    },
    categoryButtonText: {
      fontSize: 14,
      color: darkMode ? "#ffffff" : "#000000",
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingTop: 20,
      paddingBottom: 140,
    },
    blogGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    blogCard: {
      flex: 1,
      minWidth: "100%",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      marginBottom: 16,
    },
    blogImageContainer: {
      width: "100%",
      height: 200,
      backgroundColor: darkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.5)",
    },
    blogImage: {
      width: "100%",
      height: "100%",
    },
    blogImageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      padding: 16,
    },
    blogTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 8,
    },
    blogPreview: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 20,
    },
    blogContent: {
      padding: 20,
    },
    blogMeta: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 12,
    },
    blogActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    editButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: "#06b6d4",
      alignItems: "center",
    },
    editButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
    deleteButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: "#ef4444",
      alignItems: "center",
    },
    deleteButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: darkMode ? "#ffffff" : "#000000",
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

  return (
    <View style={styles.container}>
      {/* HomeNavbar removed */}
      {/* Back Navigation Bar */}
      <View style={[styles.backNavContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "MainSwipeableTabs" as never }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          <Text style={styles.backText}>Blog</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor={darkMode ? "#9ca3af" : "#6b7280"}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={styles.categoryButtonText} numberOfLines={1}>
            {category}
          </Text>
          <Ionicons name="chevron-down" size={20} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found.</Text>
          </View>
        ) : (
          <View style={styles.blogGrid}>
            {filtered.map((b) => (
              <Animated.View
                key={b._id}
                entering={FadeIn.duration(500)}
                style={styles.blogCard}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("BlogPost", { id: b._id })}
                >
                  <View style={styles.blogImageContainer}>
                    {b.imageUrl ? (
                      <Image
                        source={{ uri: apiService.getFileUrl(b.imageUrl) }}
                        style={styles.blogImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.blogImageOverlay}>
                      <Text style={styles.blogTitle} numberOfLines={1}>
                        {b.title}
                      </Text>
                      <Text style={styles.blogPreview} numberOfLines={2}>
                        {b.content.length > 150 ? b.content.slice(0, 150) + "…" : b.content}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={styles.blogMeta}>
                      {b.category} • {b.readTime}
                    </Text>
                    {isAdmin && isManageMode && (
                      <View style={styles.blogActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEdit(b._id);
                          }}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDelete(b._id);
                          }}
                          disabled={deletingId === b._id}
                        >
                          <Text style={styles.deleteButtonText}>
                            {deletingId === b._id ? "Deleting..." : "Delete"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
        <Footer />
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
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
              <Text style={[styles.pickerItemText, { fontSize: 20, fontWeight: "700" }]}>
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
      )}
    </View>
  );
};

export default Blog;
