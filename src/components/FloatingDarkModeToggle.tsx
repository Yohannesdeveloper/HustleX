import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { FaUser, FaSun, FaMoon, FaSignOutAlt, FaBriefcase, FaUserTie } from "react-icons/fa";
import { MoreVertical, Loader2 } from "lucide-react";
import { toggleTheme } from "../store/themeSlice";
import { logout, switchRole, addRole } from "../store/authSlice";

const FloatingDarkModeToggle: React.FC<{ showProfileOption?: boolean }> = ({ showProfileOption = true }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  const userRole = user?.currentRole || user?.role || "";
  const userRoles: string[] = user?.roles || (userRole ? [userRole] : []);
  const isFreelancer = userRole === "freelancer";
  const isClient = userRole === "client";

  // Determine if the user can switch or add roles
  const hasClientRole = userRoles.includes("client");
  const hasFreelancerRole = userRoles.includes("freelancer");
  const canSwitchToClient = isFreelancer && hasClientRole;
  const canSwitchToFreelancer = isClient && hasFreelancerRole;
  const canAddClientRole = isFreelancer && !hasClientRole;
  const canAddFreelancerRole = isClient && !hasFreelancerRole;
  const canSwitch = isAuthenticated && (isFreelancer || isClient);
  const targetRole = isFreelancer ? "client" : "freelancer";
  const isAdding = isFreelancer ? canAddClientRole : canAddFreelancerRole;

  const handleProfileClick = () => {
    setMenuOpen(false);
    if (isClient) {
      navigate("/company-profile");
    } else if (isFreelancer) {
      navigate("/freelancer-profile-setup");
    } else if (isAuthenticated) {
      navigate("/freelancer-profile-setup");
    } else {
      navigate("/signup");
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate("/");
  };

  const handleSwitchRole = async () => {
    if (switching) return;
    setSwitching(true);
    setMenuOpen(false);
    try {
      if (isAdding) {
        // Add the new role first, then switch to it
        await dispatch(addRole(targetRole as "freelancer" | "client")).unwrap();
        await dispatch(switchRole(targetRole as "freelancer" | "client")).unwrap();
      } else {
        await dispatch(switchRole(targetRole as "freelancer" | "client")).unwrap();
      }
      if (targetRole === "client") {
        // If they already have the client profile, go directly to hiring dashboard
        if (user?.hasCompanyProfile && !isAdding) {
          navigate("/dashboard/hiring");
        } else {
          navigate("/profile-setup?role=client");
        }
      } else {
        navigate("/dashboard/freelancer");
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setSwitching(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuOpen &&
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Position the portal menu
  useEffect(() => {
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const top = Math.round(rect.bottom + 8);
      const right = Math.round(window.innerWidth - rect.right);
      setCoords({ top, right });
    };

    if (menuOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  const hideOnPages = ["/job-listings", "/job-details", "/preview-job"];
  const shouldHide = hideOnPages.some(
    (p) => location.pathname === p || location.pathname.startsWith("/job-details")
  );
  if (shouldHide) return null;

  return (
    <div className="inline-flex">
      <motion.button
        ref={buttonRef}
        onClick={() => setMenuOpen((s) => !s)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 rounded-lg transition-colors duration-300 ${darkMode
          ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
          : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
          }`}
        title="Options"
      >
        {switching ? (
          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        ) : (
          <MoreVertical className="w-6 h-6" />
        )}
      </motion.button>

      {menuOpen && coords && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            style={{ position: "fixed", top: coords.top, right: coords.right, minWidth: 240 }}
            className={`rounded-xl shadow-2xl overflow-hidden z-[9999] backdrop-blur-md ${darkMode
              ? "bg-gray-900/95 border border-white/10"
              : "bg-white/95 border border-black/10"
              }`}
          >
            {/* Current role badge */}
            {isAuthenticated && userRole && (
              <div className={`px-6 py-3 flex items-center gap-3 ${darkMode ? "border-b border-white/5" : "border-b border-black/5"}`}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isFreelancer
                  ? darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-50 text-cyan-700"
                  : darkMode ? "bg-violet-500/20 text-violet-400" : "bg-violet-50 text-violet-700"
                  }`}>
                  {isFreelancer ? <FaBriefcase className="w-3 h-3" /> : <FaUserTie className="w-3 h-3" />}
                  {isFreelancer ? "Freelancer Mode" : "Client Mode"}
                </div>
              </div>
            )}

            {/* Switch Role button */}
            {canSwitch && (
              <button
                onClick={handleSwitchRole}
                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-all duration-200 ${darkMode
                  ? "text-white hover:bg-white/5"
                  : "text-gray-800 hover:bg-black/5"
                  }`}
              >
                {isFreelancer
                  ? <FaUserTie className={`w-3.5 h-3.5 flex-shrink-0 ${darkMode ? "text-violet-400" : "text-violet-600"}`} />
                  : <FaBriefcase className={`w-3.5 h-3.5 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                }
                <span>
                  {isAdding ? "Add " : "Switch to "}
                  <span className={`font-bold ${isFreelancer
                    ? darkMode ? "text-violet-400" : "text-violet-600"
                    : darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}>
                    {isFreelancer ? "Client" : "Freelancer"}
                  </span>
                  {isAdding && <span className={`ml-1 text-[10px] font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mode</span>}
                </span>
              </button>
            )}

            {isAuthenticated && showProfileOption && (
              <button
                onClick={handleProfileClick}
                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-colors ${darkMode
                  ? "text-white hover:bg-white/5 border-t border-white/5"
                  : "text-gray-800 hover:bg-black/5 border-t border-black/5"
                  }`}
              >
                <FaUser className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                Profile
              </button>
            )}
            <button
              onClick={() => {
                dispatch(toggleTheme());
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-colors ${darkMode
                ? "text-white hover:bg-white/5 border-t border-white/5"
                : "text-gray-800 hover:bg-black/5 border-t border-black/5"
                }`}
            >
              {darkMode ? (
                <>
                  <FaSun className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
                  Light Mode
                </>
              ) : (
                <>
                  <FaMoon className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" />
                  Dark Mode
                </>
              )}
            </button>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-colors ${darkMode
                  ? "text-red-400 hover:bg-red-500/10 border-t border-white/5"
                  : "text-red-500 hover:bg-red-50 border-t border-black/5"
                  }`}
              >
                <FaSignOutAlt className="w-3.5 h-3.5 flex-shrink-0" />
                Logout
              </button>
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default FloatingDarkModeToggle;
