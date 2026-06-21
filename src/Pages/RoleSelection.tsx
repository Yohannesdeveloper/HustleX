import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { setUser } from "../store/authSlice";
import { isAdminAccount } from "../utils/admin";
import apiService from "../services/api";
import { persistActiveRole } from "../utils/activeRole";
import { FiBriefcase, FiUsers, FiShield } from "react-icons/fi";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve state passed from previous pages
  const state = location.state as { redirectPath?: string; pendingJobId?: string } | null;
  const redirectPath = state?.redirectPath;
  const pendingJobId = state?.pendingJobId;

  const canSelectAdmin = isAdminAccount(user);

  const handleSelectRole = async (role: "freelancer" | "client" | "admin") => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiService.selectRole(role);
      const updatedUser = response.user;

      // Persist and dispatch
      persistActiveRole(role);
      dispatch(setUser(updatedUser));

      // Navigate based on role
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (role === "freelancer") {
        // If there's a pending job from Telegram apply flow, go straight to it
        if (pendingJobId) {
          navigate(`/job-details/${pendingJobId}`, { replace: true });
          return;
        }
        // Otherwise go to profile setup
        navigate("/profile-setup?role=freelancer", { replace: true });
        return;
      }

      if (role === "client") {
        // If they already have a complete company profile, go to dashboard
        if (updatedUser.hasCompanyProfile) {
          navigate(redirectPath || "/dashboard/hiring", { replace: true });
        } else {
          navigate("/profile-setup?role=client", { replace: true });
        }
        return;
      }
    } catch (err: any) {
      let msg = "Failed to set role. Please try again.";
      if (err?.response?.status === 403) {
        msg = "You are not authorized to access admin features.";
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const allRoles: Array<{
    id: "freelancer" | "client" | "admin";
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    hoverBg: string;
  }> = [
    {
      id: "freelancer",
      icon: <FiBriefcase className="w-8 h-8" />,
      title: "Freelancer",
      description: "Find work, build your portfolio, and grow your career",
      gradient: "from-cyan-500 to-blue-500",
      iconBg: darkMode ? "bg-cyan-500/10" : "bg-cyan-50",
      iconColor: darkMode ? "text-cyan-400" : "text-cyan-600",
      hoverBorder: "hover:border-cyan-500/50",
      hoverBg: darkMode ? "hover:bg-cyan-500/5" : "hover:bg-cyan-50",
    },
    {
      id: "client",
      icon: <FiUsers className="w-8 h-8" />,
      title: "Client",
      description: "Post jobs, hire top talent, and manage your team",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
      iconColor: darkMode ? "text-emerald-400" : "text-emerald-600",
      hoverBorder: "hover:border-emerald-500/50",
      hoverBg: darkMode ? "hover:bg-emerald-500/5" : "hover:bg-emerald-50",
    },
    {
      id: "admin",
      icon: <FiShield className="w-8 h-8" />,
      title: "Admin",
      description: "Manage the platform, users, and content",
      gradient: "from-purple-500 to-pink-500",
      iconBg: darkMode ? "bg-purple-500/10" : "bg-purple-50",
      iconColor: darkMode ? "text-purple-400" : "text-purple-600",
      hoverBorder: "hover:border-purple-500/50",
      hoverBg: darkMode ? "hover:bg-purple-500/5" : "hover:bg-purple-50",
    },
  ];

  // Only show admin option for authorized admin accounts
  const roles = canSelectAdmin ? allRoles : allRoles.filter(r => r.id !== "admin");

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-black-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900"
      }`}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[500px] h-[500px] rounded-full top-1/4 left-1/4 ${
            darkMode ? "opacity-20" : "opacity-10"
          }`}
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
        <div
          className={`absolute w-[300px] h-[300px] rounded-full bottom-1/4 right-1/4 ${
            darkMode ? "opacity-15" : "opacity-8"
          }`}
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)" }}
        />
      </div>

      <div
        className={`relative z-10 backdrop-blur-xl border rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-lg ${
          darkMode
            ? "bg-black/40 border-cyan-500/20 shadow-cyan-500/10"
            : "bg-white/80 border-cyan-500/10 shadow-cyan-500/5"
        }`}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-2 text-center drop-shadow-lg ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`}
        >
          Choose Your Role
        </h2>
        <p
          className={`text-center text-sm mb-6 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Select how you want to use HustleX
        </p>

        {error && (
          <p className="text-red-400 text-sm font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {roles.map((r, index) => (
            <button
              key={r.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectRole(r.id)}
              className={`w-full flex items-center gap-4 px-5 py-5 rounded-2xl border transition-all duration-200 text-left group ${
                darkMode
                  ? `border-white/10 bg-white/[0.03] ${r.hoverBorder} ${r.hoverBg} active:scale-[0.98]`
                  : `border-gray-200 bg-white ${r.hoverBorder} ${r.hoverBg} active:scale-[0.98] shadow-sm hover:shadow-md`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`flex-shrink-0 p-3 rounded-xl transition-colors ${r.iconBg} ${r.iconColor}`}
              >
                {r.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {r.title}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {r.description}
                </p>
              </div>
              <div className={`flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                darkMode ? "text-gray-500 group-hover:text-gray-300" : "text-gray-400 group-hover:text-gray-600"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {isLoading && (
                <div
                  className={`w-5 h-5 border-2 rounded-full animate-spin ${
                    darkMode ? "border-cyan-500/30 border-t-cyan-400" : "border-cyan-400/30 border-t-cyan-600"
                  }`}
                />
              )}
            </button>
          ))}
        </div>


      </div>
    </div>
  );
};

export default RoleSelection;
