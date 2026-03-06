import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const SECRET_ID = (import.meta as any).env?.VITE_BLOG_ADMIN_CODE || "BlogPost";

const BlogAdmin: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === SECRET_ID) {
      // Optional: remember access and pass code for backend header bypass if configured
      localStorage.setItem("blogAdminAccess", "true");
      localStorage.setItem("adminCode", code);
      setError("");
      navigate("/blog/post");
      return;
    }
    setError("Invalid ID. Please try again.");
  };

  return (
    <div className={darkMode ? "bg-black min-h-screen" : "bg-white min-h-screen"}>
      <div className="max-w-md mx-auto pt-28 px-6">
        <h1 className={darkMode ? "text-white text-2xl font-bold mb-6" : "text-black text-2xl font-bold mb-6"}>
          Admin Blog Access
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Admin Blog ID"
            className={(darkMode ? "bg-black/70 text-white border-white/10" : "bg-white text-black border-black/10") + " w-full px-4 py-3 rounded-xl border"}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold"
          >
            Enter Blog
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogAdmin;
