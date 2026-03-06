import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isAdmin = (user?.roles?.includes('admin') ?? false);

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const blogData = await apiService.getBlog(id);
        setBlog(blogData);
      } catch (err: any) {
        setError(err?.message || "Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} flex items-center justify-center`}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="mb-4">{error || "The blog post you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/blog")}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[800px] h-[800px] ${
            darkMode
              ? "bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900"
              : "bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100"
          } ${
            darkMode ? "opacity-10" : "opacity-5"
          } blur-3xl rounded-full top-0 left-0 `}
        />
        <div
          className={`absolute w-[600px] h-[600px] ${
            darkMode
              ? "bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
              : "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
          } ${
            darkMode ? "opacity-10" : "opacity-5"
          } blur-3xl rounded-full bottom-0 right-0 `}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className={
            (darkMode
              ? "bg-black/60 border-white/10"
              : "bg-white/60 border-black/10") +
            " sticky top-0 z-10 backdrop-blur-md border-b"
          }
        >
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <button
              onClick={() => navigate("/blog")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                darkMode ? "hover:bg-white/10" : "hover:bg-black/10"
              } transition-colors`}
            >
              ← Back to Blog
            </button>
            <div className="flex items-center gap-3">
              <div className="text-sm opacity-70">
                {blog.category} • {blog.readTime}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/blog/edit/${blog._id}`)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!blog || deleting) return;
                      if (!window.confirm('Are you sure you want to delete this blog post?')) return;
                      try {
                        setDeleting(true);
                        await apiService.deleteBlog(blog._id);
                        navigate('/blog');
                      } catch (e: any) {
                        alert('Failed to delete blog post: ' + (e?.message || 'Unknown error'));
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    disabled={deleting}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-8 text-sm opacity-70">
            {blog.createdAt && (
              <span>
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
            {blog.author && <span>• {blog.author}</span>}
            {blog.likes !== undefined && <span>• {blog.likes} likes</span>}
            {blog.views !== undefined && <span>• {blog.views} views</span>}
          </div>

          {/* Featured Image */}
          {blog.imageUrl && (
            <div className="mb-8">
              <img
                src={apiService.getFileUrl(blog.imageUrl)}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className={`${darkMode ? "text-white/90" : "text-black/90"} leading-relaxed`}
              dangerouslySetInnerHTML={{
                __html: blog.content.replace(/\n/g, '<br />')
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">
                Published on HustleX Blog
              </div>
              <button
                onClick={() => navigate("/blog")}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Read More Posts
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { BlogPostView };
