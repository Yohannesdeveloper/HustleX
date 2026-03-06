import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import apiService from "../services/api";

const SECRET_ID = (import.meta as any).env?.VITE_BLOG_ADMIN_CODE || "BlogPost";

const BlogAdmin: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [idInput, setIdInput] = useState("");
  const [hasAccess, setHasAccess] = useState(
    localStorage.getItem("blogAdminAccess") === "true"
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readTime, setReadTime] = useState("1 min read");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setReadTime(`${Math.max(1, Math.ceil(words / 200))} min read`);
  }, [content]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (idInput === SECRET_ID) {
      setHasAccess(true);
      localStorage.setItem("blogAdminAccess", "true");
      // Store admin code for backend header bypass
      localStorage.setItem("adminCode", idInput);
      setError("");
      navigate("/admin/blog");
    } else {
      setError("Invalid ID");
    }
  };

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
        setError("Please log in to publish a blog post");
        navigate("/signup?redirect=/admin/blog");
        return;
      }

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
      setTimeout(() => navigate("/blog"), 800);
    } catch (err: any) {
      setError(err?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className={darkMode ? "bg-black min-h-screen" : "bg-white min-h-screen"}>
        <div className="max-w-md mx-auto pt-24 px-6">
          <h1 className={darkMode ? "text-white text-2xl font-bold mb-6" : "text-black text-2xl font-bold mb-6"}>Blog Post</h1>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="password"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="Enter Admin Blog ID"
              className={(darkMode ? "bg-black/70 text-white border-white/10" : "bg-white text-black border-black/10") + " w-full px-4 py-3 rounded-xl border"}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold">Enter Admin Blog</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "bg-black min-h-screen" : "bg-white min-h-screen"}>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className={darkMode ? "text-white text-2xl font-bold" : "text-black text-2xl font-bold"}>Blog Post</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/blog?manage=true")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-black font-semibold">Manage Blogs</button>
            <button onClick={() => navigate("/blog")} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold">View Blog</button>
          </div>
        </div>

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
                "Food & Cooking",
                "Drinks & Beverages",
                "Media & Entertainment",
                "Sports & Fitness",
                "Travel",
                "Photography",
                "Music",
                "Movies & TV",
                "Gaming",
                "Fashion & Beauty",
                "Parenting",
                "Relationships",
                "Personal Development",
                "Environment & Sustainability",
                "Politics",
                "Science",
                "Books & Literature",
                "Automotive",
                "Real Estate",
                "Cryptocurrency",
                "Web3 & Blockchain",
                "Art & Creativity",
                "Pets & Animals",
                "DIY & Crafts",
                "Home & Garden",
                "Career Development",
                "Productivity",
                "Mental Health",
                "Wellness & Spa",
                "Entrepreneurship",
                "Social Media",
                "E-commerce",
                "SaaS",
                "Mobile Apps",
                "Cloud Computing",
                "Cybersecurity",
                "DevOps",
                "UX/UI Design",
                "Content Writing",
                "SEO & Analytics",
                "Video Production",
                "Podcasting",
                "Freelancing",
                "Culture & Society",
                "History",
                "Philosophy",
                "Religion & Spirituality",
                "Law & Legal",
                "Architecture",
                "Interior Design",
                "Agriculture & Farming",
                "Economics",
                "Psychology",
                "Meditation & Mindfulness",
                "Yoga",
                "Nutrition & Diet",
                "Fitness Training",
                "Running & Marathon",
                "Cycling",
                "Swimming",
                "Martial Arts",
                "Dance",
                "Theater & Performing Arts",
                "Comedy",
                "Stand-up",
                "Craft Beer & Wine",
                "Coffee & Tea",
                "Street Food",
                "Vegan & Vegetarian",
                "Baking & Pastry",
                "BBQ & Grilling",
                "Seafood",
                "International Cuisine",
                "Desserts & Sweets",
                "Aviation & Aerospace",
                "Space & Astronomy",
                "Physics",
                "Chemistry",
                "Biology",
                "Medicine",
                "Nursing",
                "Pharmacy",
                "Dentistry",
                "Veterinary",
                "Marine Biology",
                "Geology",
                "Meteorology",
                "Robotics",
                "Engineering",
                "Mechanical Engineering",
                "Electrical Engineering",
                "Civil Engineering",
                "Software Engineering",
                "Chemical Engineering",
                "Mathematics",
                "Statistics",
                "Quantum Computing",
                "Nanotechnology",
                "Biotechnology",
                "Genetics",
                "Neuroscience",
                "Investing & Stock Market",
                "Insurance",
                "Banking",
                "Trading & Forex",
                "Personal Finance",
                "Retirement Planning",
                "Tax Planning",
                "Accounting",
                "Auditing",
                "Nonprofit & Charity",
                "Human Rights",
                "Social Justice",
                "Immigration",
                "International Relations",
                "Military & Defense",
                "Public Policy",
                "Urban Planning",
                "Smart Cities",
                "Renewable Energy",
                "Solar Power",
                "Wind Energy",
                "Electric Vehicles",
                "Climate Change",
                "Conservation",
                "Wildlife",
                "Recycling & Waste Management",
                "Sustainable Living",
                "Zero Waste",
                "Minimalism",
                "Tiny Houses",
                "Van Life",
                "Digital Nomad",
                "Expat Living",
                "Study Abroad",
                "Language Learning",
                "Teaching & Tutoring",
                "Online Learning",
                "Higher Education",
                "Homeschooling",
                "Early Childhood Education",
                "Special Education",
                "STEM Education",
                "EdTech",
                "Competitive Exams",
                "Scholarships",
                "Student Life",
                "Greek Life",
                "College Sports",
                "Professional Sports",
                "Olympic Sports",
                "Fantasy Sports",
                "Sports Analytics",
                "Extreme Sports",
                "Adventure Travel",
                "Luxury Travel",
                "Budget Travel",
                "Solo Travel",
                "Family Travel",
                "Backpacking",
                "Camping & Hiking",
                "Beach & Ocean",
                "Mountain & Skiing",
                "Road Trips",
                "Cruises",
                "Hotels & Hospitality",
                "Airlines",
                "Travel Hacking",
                "Digital Photography",
                "Film Photography",
                "Portrait Photography",
                "Landscape Photography",
                "Wedding Photography",
                "Wildlife Photography",
                "Street Photography",
                "Drone Photography",
                "Mobile Photography",
                "Photo Editing",
                "Videography",
                "Animation",
                "Graphic Design",
                "Web Design",
                "Logo Design",
                "Typography",
                "Illustration",
                "3D Modeling",
                "Game Design",
                "Level Design",
                "Character Design",
                "Sound Design",
                "Music Production",
                "DJing",
                "Audio Engineering",
                "Songwriting",
                "Classical Music",
                "Rock & Metal",
                "Hip Hop & Rap",
                "Electronic & EDM",
                "Jazz & Blues",
                "Country & Folk",
                "K-Pop & J-Pop",
                "Latin Music",
                "Reggae",
                "Concert Reviews",
                "Music Festivals",
                "Indie Films",
                "Documentaries",
                "Anime",
                "TV Series Reviews",
                "Netflix & Streaming",
                "Film Criticism",
                "Screenwriting",
                "Acting",
                "Directing",
                "Cinematography",
                "PC Gaming",
                "Console Gaming",
                "Mobile Gaming",
                "Esports",
                "Game Reviews",
                "Gaming Hardware",
                "Retro Gaming",
                "Board Games",
                "Card Games",
                "Puzzle Games",
                "RPG",
                "FPS",
                "MOBA",
                "Battle Royale",
                "Simulation Games",
                "Strategy Games",
                "Indie Games"
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
            {loading ? "Publishing…" : "Publish"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default BlogAdmin;


