import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
}

interface AdminSection {
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  badge?: string;
}

const AdminDashboard: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: "—",
    jobs: "—",
    blogs: "—",
    subscriptions: "—",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const apiUrl = (apiService as any).baseURL || "/api";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch stats in parallel (best-effort; ignore failures)
        const [usersRes, jobsRes, blogsRes] = await Promise.allSettled([
          fetch(`${apiUrl}/users?limit=1`, { headers }),
          fetch(`${apiUrl}/jobs?limit=1`, { headers }),
          fetch(`${apiUrl}/blog?limit=1`, { headers }),
        ]);

        const parseCount = async (res: PromiseSettledResult<Response>) => {
          if (res.status === "fulfilled" && res.value.ok) {
            try {
              const data = await res.value.json();
              return data?.total ?? data?.count ?? (Array.isArray(data) ? data.length : "—");
            } catch {
              return "—";
            }
          }
          return "—";
        };

        const [userCount, jobCount, blogCount] = await Promise.all([
          parseCount(usersRes),
          parseCount(jobsRes),
          parseCount(blogsRes),
        ]);

        setStats({
          users: userCount,
          jobs: jobCount,
          blogs: blogCount,
          subscriptions: "—",
        });
      } catch {
        // silently fail — stats are decorative
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      label: "Total Users",
      value: loadingStats ? "…" : stats.users,
      icon: "👥",
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    },
    {
      label: "Active Jobs",
      value: loadingStats ? "…" : stats.jobs,
      icon: "💼",
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    },
    {
      label: "Blog Posts",
      value: loadingStats ? "…" : stats.blogs,
      icon: "📝",
      color: "text-purple-400",
      bg: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    },
    {
      label: "Subscriptions",
      value: loadingStats ? "…" : stats.subscriptions,
      icon: "⭐",
      color: "text-amber-400",
      bg: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    },
  ];

  const adminSections: AdminSection[] = [
    {
      title: "Blog Management",
      description: "Create, edit, and publish blog posts. Manage content and categories.",
      icon: "📝",
      path: "/admin/blog",
      gradient: "from-purple-600 to-violet-600",
      badge: "Content",
    },
    {
      title: "Job Moderation",
      description: "Review, approve, or reject job postings. Manage job listings quality.",
      icon: "🔍",
      path: "/admin/job",
      gradient: "from-emerald-600 to-green-600",
      badge: "Moderation",
    },
    {
      title: "Subscription Admin",
      description: "Manage user subscriptions, plans, and payment statuses.",
      icon: "⭐",
      path: "/admin/subscriptions",
      gradient: "from-amber-600 to-orange-600",
      badge: "Billing",
    },
    {
      title: "View All Blogs",
      description: "Browse and manage all existing blog posts on the platform.",
      icon: "📖",
      path: "/blog",
      gradient: "from-blue-600 to-cyan-600",
      badge: "Content",
    },
    {
      title: "Job Listings",
      description: "Browse all job listings and oversee platform job activity.",
      icon: "💼",
      path: "/job-listings",
      gradient: "from-cyan-600 to-teal-600",
      badge: "Jobs",
    },
    {
      title: "Platform Home",
      description: "Return to the main HustleX homepage and view it as users see it.",
      icon: "🏠",
      path: "/",
      gradient: "from-gray-600 to-slate-600",
      badge: "General",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const bg = darkMode
    ? "min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] text-white"
    : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-gray-900";

  return (
    <div className={bg}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute w-[600px] h-[600px] rounded-full blur-3xl top-[-100px] left-[-100px] ${
            darkMode ? "bg-purple-900/20" : "bg-purple-200/40"
          }`}
        />
        <div
          className={`absolute w-[400px] h-[400px] rounded-full blur-3xl bottom-[-50px] right-[-50px] ${
            darkMode ? "bg-cyan-900/20" : "bg-cyan-200/40"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🔐</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Welcome back,{" "}
              <span className={`font-semibold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                {user?.profile?.firstName || user?.email || "Admin"}
              </span>{" "}
              · HustleX Control Panel
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
                darkMode
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-purple-50 border-purple-200 text-purple-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse inline-block" />
              Administrator
            </div>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${
                darkMode
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`relative rounded-2xl border bg-gradient-to-br p-5 ${stat.bg} ${
                darkMode ? "border-white/5 backdrop-blur-sm" : "shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span
                  className={`text-2xl font-extrabold tabular-nums ${stat.color}`}
                >
                  {stat.value}
                </span>
              </div>
              <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 h-px ${darkMode ? "bg-white/10" : "bg-gray-200"}`} />
          <span className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Admin Sections
          </span>
          <div className={`flex-1 h-px ${darkMode ? "bg-white/10" : "bg-gray-200"}`} />
        </div>

        {/* Admin Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {adminSections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={`group relative text-left rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                darkMode
                  ? "bg-white/3 border-white/8 hover:border-white/20 backdrop-blur-sm"
                  : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Gradient top bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${section.gradient} opacity-80`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${section.gradient} bg-opacity-20`}
                    style={{ background: "transparent" }}
                  >
                    <span
                      className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl bg-gradient-to-br ${section.gradient} opacity-90`}
                    >
                      {section.icon}
                    </span>
                  </div>
                  {section.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        darkMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {section.badge}
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-bold mb-1.5 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {section.title}
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {section.description}
                </p>

                <div
                  className={`mt-4 flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}
                >
                  Open section
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
            darkMode
              ? "bg-white/3 border-white/8 backdrop-blur-sm"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <span className="text-xl">ℹ️</span>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            You are logged in as an{" "}
            <span className={`font-semibold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
              Administrator
            </span>
            . All platform management tools are available to you. Changes made here affect all users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
