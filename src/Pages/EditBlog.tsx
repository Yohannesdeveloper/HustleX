import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api";

const EditBlog: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      if (!id) return;

      try {
        const blog = await apiService.getBlog(id);
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
  }, [id]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      const r = new FileReader();
      r.onload = (ev) => setImagePreview(ev.target?.result as string);
      r.readAsDataURL(f);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!apiService.isAuthenticated()) {
        setError("Please log in to update a blog post");
        navigate("/signup?redirect=/blog/edit/" + id);
        return;
      }

      let imageUrl = currentImageUrl;
      if (imageFile) {
        const res = await apiService.uploadBlogImage(imageFile);
        imageUrl = res.fileUrl;
      }

      await apiService.updateBlog(id!, {
        title,
        content,
        category,
        readTime,
        imageUrl: imageUrl || undefined,
      });

      setSuccess("Blog post updated successfully");
      setTimeout(() => navigate("/blog"), 800);
    } catch (err: any) {
      setError(err?.message || "Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className={darkMode ? "bg-black min-h-screen" : "bg-white min-h-screen"}>
        <div className="max-w-5xl mx-auto pt-24 px-6">
          <div className={darkMode ? "text-white" : "text-black"}>Loading blog post...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "bg-black min-h-screen" : "bg-white min-h-screen"}>
      <header className={(darkMode ? "bg-black/60 border-white/10" : "bg-white/60 border-black/10") + " sticky top-0 z-10 backdrop-blur-md border-b"}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className={darkMode ? "text-white text-2xl font-bold" : "text-black text-2xl font-bold"}>Edit Blog Post</h1>
          <button onClick={() => navigate("/blog")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold">Back to Blog</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className={darkMode ? "text-white/80 text-sm" : "text-black/70 text-sm"}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
              className={(darkMode ? "bg-black/70 text-white border-white/10" : "bg-white text-black border-black/10") + " w-full px-4 py-3 rounded-xl border"}
            />
          </div>

          <div>
            <label className={darkMode ? "text-white/80 text-sm" : "text-black/70 text-sm"}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={(darkMode ? "bg-black/70 text-white border-white/10" : "bg-white text-black border-black/10") + " w-full px-4 py-3 rounded-xl border"}
            >
              {[
                "Technology",
                "Design",
                "Business",
                "Lifestyle",
                "Tutorial",
                "News",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={darkMode ? "text-white/80 text-sm" : "text-black/70 text-sm"}>Featured Image</label>
            <input type="file" accept="image/*" onChange={onImageChange} className="block" />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl mt-3" />
            )}
            {!imageFile && currentImageUrl && (
              <p className={darkMode ? "text-white/60 text-sm mt-2" : "text-black/60 text-sm mt-2"}>
                Current image will be kept if no new image is selected
              </p>
            )}
          </div>

          <div>
            <label className={darkMode ? "text-white/80 text-sm" : "text-black/70 text-sm"}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder="Write your content..."
              className={(darkMode ? "bg-black/70 text-white border-white/10" : "bg-white text-black border-black/10") + " w-full px-4 py-3 rounded-xl border"}
            />
            <div className={darkMode ? "text-white/60 text-sm mt-1" : "text-black/60 text-sm mt-1"}>{readTime}</div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update Post"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditBlog;
