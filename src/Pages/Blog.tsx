import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import Footer from "../components/Footer";
import { BlogSEO } from "../components/SEO";

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
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasCodeAccess = (() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem("blogAdminAccess") === "true";
    } catch {
      return false;
    }
  })();
  const isAdmin = (user?.roles?.includes('admin') ?? false) || hasCodeAccess;
  const isManageMode = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('manage') === 'true';
    } catch {
      return false;
    }
  })();

  const handleEdit = (blogId: string) => {
    navigate(`/blog/edit/${blogId}`);
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    setDeletingId(blogId);
    try {
      await apiService.deleteBlog(blogId);
      setBlogs(blogs.filter(b => b._id !== blogId));
    } catch (error: any) {
      alert('Failed to delete blog post: ' + (error?.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const load = async () => {
    try {
      const res = await apiService.getBlogs({
        search: search || undefined,
        category: category === "All" ? undefined : category,
      });
      setBlogs(res.blogs || []);
    } catch (e) {
      console.error("Failed to load blogs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = blogs
    .filter((b) =>
      (b.title + " " + b.content).toLowerCase().includes(search.toLowerCase())
    )
    .filter((b) => (category === "All" ? true : b.category === category))
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

  return (
    <>
      <BlogSEO />
      <div
        className={`relative min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-black" : "bg-white"
        } ${darkMode ? "text-white" : "text-black"} font-inter`}
      >
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
        <div
          className={`absolute w-[400px] h-[400px] ${
            darkMode
              ? "bg-gradient-to-br from-cyan-800 via-blue-800 to-purple-800"
              : "bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200"
          } ${
            darkMode ? "opacity-15" : "opacity-5"
          } blur-3xl rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}
        />
      </div>

      <div className="relative z-10 pt-16 sm:pt-20">
        <header
          className={
            (darkMode
              ? "bg-black/60 border-white/10"
              : "bg-white/60 border-black/10") +
            " sticky top-16 sm:top-20 z-10 backdrop-blur-md"
          }
        >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4 justify-end">
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className={
                (darkMode
                  ? "bg-black/70 text-white border-white/10"
                  : "bg-white text-black border-black/10") +
                " px-4 py-2 rounded-xl border outline-none"
              }
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={
                (darkMode
                  ? "bg-black/70 text-white border-white/10"
                  : "bg-white text-black border-black/10") +
                " px-3 py-2 rounded-xl border"
              }
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
           
          </div>
        </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className={darkMode ? "text-white" : "text-black"}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className={darkMode ? "text-white" : "text-black"}>No posts found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((b) => (
                <article
                  key={b._id}
                  onClick={() => navigate(`/blog/${b._id}`)}
                  className={
                    (darkMode
                      ? "bg-black border-white/10 hover:bg-white/5"
                      : "bg-white border-black/10 hover:bg-black/5") +
                    " rounded-2xl overflow-hidden border shadow cursor-pointer transition-colors"
                  }
                >
                  <div className="relative bg-gray-100">
                    {b.imageUrl ? (
                      <img
                        src={apiService.getFileUrl(b.imageUrl)}
                        alt={b.title}
                        loading="lazy"
                        className="w-full h-64 object-cover block"
                      />
                    ) : null}
                    {/* Caption overlay at the bottom of the image */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-4">
                      <h2 className="text-lg font-semibold line-clamp-1">{b.title}</h2>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {b.content.length > 150 ? b.content.slice(0, 150) + "…" : b.content}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {b.category} • {b.readTime}
                    </div>
                    {isAdmin && isManageMode && (
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(b._id);
                          }}
                          className="px-3 py-1 text-xs rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(b._id);
                          }}
                          disabled={deletingId === b._id}
                          className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingId === b._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default Blog;
