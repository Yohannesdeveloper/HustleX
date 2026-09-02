/**
 * React Native BlogPostView Screen
 * Complete conversion maintaining exact UI/UX and functionality
 * Individual blog post view
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api-react-native";
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

const BlogPostView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  const blogId = (route.params as any)?.blogId || (route.params as any)?.id;

  const isAdmin = (user?.roles?.includes("admin") ?? false);

  useEffect(() => {
    const loadBlog = async () => {
      if (!blogId) return;

      try {
        setLoading(true);
        const blogData = await apiService.getBlog(blogId);
        setBlog(blogData);
      } catch (err: any) {
        setError(err?.message || "Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId]);

  const handleDelete = async () => {
    if (!blog || deleting) return;
    Alert.alert("Delete Blog", "Are you sure you want to delete this blog post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await apiService.deleteBlog(blog._id);
            navigation.navigate("Blog" as never);
          } catch (e: any) {
            Alert.alert("Error", `Failed to delete blog post: ${e?.message || "Unknown error"}`);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleLike = async () => {
    if (!blog) return;
    try {
      if (liked) {
        await apiService.unlikeBlog(blog._id);
      } else {
        await apiService.likeBlog(blog._id);
      }
      setLiked(!liked);
      if (blog) {
        setBlog({ ...blog, likes: (blog.likes || 0) + (liked ? -1 : 1) });
      }
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#000000" : "#ffffff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      backgroundColor: darkMode ? "#111827" : "rgba(255, 255, 255, 0.6)",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
    },
    metaInfo: {
      fontSize: 12,
      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    },
    adminActions: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: "#06b6d4",
    },
    editButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: "#ef4444",
    },
    deleteButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 24,
      lineHeight: 40,
    },
    metaContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 32,
      flexWrap: "wrap",
    },
    metaText: {
      fontSize: 14,
      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    },
    featuredImage: {
      width: "100%",
      height: 300,
      borderRadius: 16,
      marginBottom: 32,
    },
    blogContent: {
      fontSize: 18,
      lineHeight: 28,
      color: darkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
      marginBottom: 32,
    },
    footer: {
      marginTop: 32,
      paddingTop: 32,
      borderTopWidth: 1,
      borderTopColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    likeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      alignSelf: "flex-start",
    },
    likeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: darkMode ? "#ffffff" : "#000000",
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
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: darkMode ? "#ffffff" : "#000000",
      marginBottom: 16,
    },
    errorText: {
      fontSize: 16,
      color: darkMode ? "#9ca3af" : "#6b7280",
      marginBottom: 24,
      textAlign: "center",
    },
    errorButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#06b6d4",
    },
    errorButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error || !blog) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Blog Post Not Found</Text>
          <Text style={styles.errorText}>
            {error || "The blog post you're looking for doesn't exist."}
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.navigate("Blog" as never)}>
            <Text style={styles.errorButtonText}>Back to Blog</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={styles.metaInfo}>
            {blog.category} • {blog.readTime}
          </Text>
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("BlogEdit" as never, { blogId: blog._id } as never)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteButtonText}>{deleting ? "Deleting…" : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.metaContainer}>
            {blog.createdAt && <Text style={styles.metaText}>{formatDate(blog.createdAt)}</Text>}
            {blog.author && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{blog.author}</Text>
              </>
            )}
            {blog.likes !== undefined && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{blog.likes} likes</Text>
              </>
            )}
            {blog.views !== undefined && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{blog.views} views</Text>
              </>
            )}
          </View>

          {blog.imageUrl && (
            <Image
              source={{ uri: apiService.getFileUrl(blog.imageUrl) }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          )}

          <Text style={styles.blogContent}>{blog.content}</Text>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#ef4444" : darkMode ? "#ffffff" : "#000000"}
              />
              <Text style={styles.likeButtonText}>
                {liked ? "Liked" : "Like"} ({blog.likes || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default BlogPostView;
