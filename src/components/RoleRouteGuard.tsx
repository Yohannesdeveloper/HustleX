import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { getActiveRole, dashboardPathForRole } from "../utils/activeRole";

/**
 * Keeps users on the dashboard that matches their active role.
 * Redirects authenticated users with no roles to /select-role.
 * Logs out authenticated users who leave profile setup without completing it.
 * Never calls switchRole — only redirects when route and currentRole disagree.
 */
const RoleRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading || !isAuthenticated || !user) {
    return <>{children}</>;
  }

  const currentPath = location.pathname;

  // Pages where incomplete-profile users are allowed to stay
  const isSetupPage =
    currentPath === "/select-role" ||
    currentPath === "/signup" ||
    currentPath === "/login" ||
    currentPath === "/forgot-password" ||
    currentPath === "/register" ||
    currentPath === "/Register" ||
    currentPath === "/profile-setup" ||
    currentPath === "/freelancer-profile-setup" ||
    currentPath === "/company-profile";

  // If user has no roles assigned, redirect to role selection
  // (unless already on a setup/auth page to avoid loops)
  if ((!user.roles || user.roles.length === 0) && !isSetupPage) {
    return <Navigate to="/select-role" replace state={{ redirectPath: currentPath }} />;
  }

  // ── Profile-completion guard ──────────────────────────────────────────
  // If the user is authenticated but their profile isn't complete for their
  // current role, and they navigated away from setup pages (e.g. browser
  // back button), log them out so they don't stay in a half-registered state.
  if (!isSetupPage && user.roles && user.roles.length > 0) {
    const hasFreelancerRole = user.roles.includes("freelancer");
    const hasClientRole = user.roles.includes("client");
    const isAdmin = user.roles.includes("admin");

    const hasFreelancerProfile =
      user.profile?.freelancerProfileCompleted ||
      user.profile?.isProfileComplete ||
      (user.profile?.skills && user.profile.skills.length > 0);

    const hasClientProfile = user.hasCompanyProfile;

    // Skip this check for admin users — they don't need a profile
    if (!isAdmin) {
      // Check if the user's current role has a completed profile
      const currentRole = user.currentRole;
      let profileIncomplete = false;

      if (currentRole === "freelancer" && hasFreelancerRole && !hasFreelancerProfile) {
        profileIncomplete = true;
      } else if (currentRole === "client" && hasClientRole && !hasClientProfile) {
        profileIncomplete = true;
      } else if (!currentRole) {
        // No current role set — profile is definitely not done
        profileIncomplete = true;
      }

      if (profileIncomplete) {
        // Log them out and redirect to signup
        logout();
        return <Navigate to="/signup" replace />;
      }
    }
  }

  // ── Role-dashboard alignment guard ────────────────────────────────────
  const activeRole = getActiveRole(user);
  if (!activeRole) {
    return <>{children}</>;
  }

  const path = location.pathname;
  const onHiringDashboard = path === "/dashboard/hiring" || path.startsWith("/dashboard/hiring/");
  const onFreelancerDashboard =
    path === "/dashboard/freelancer" || path.startsWith("/dashboard/freelancer/");

  if (onHiringDashboard && activeRole !== "client") {
    const target = dashboardPathForRole(activeRole);
    if (target) {
      return <Navigate to={target} replace state={{ roleGuard: true }} />;
    }
  }

  if (onFreelancerDashboard && activeRole !== "freelancer") {
    const target = dashboardPathForRole(activeRole);
    if (target) {
      return <Navigate to={target} replace state={{ roleGuard: true }} />;
    }
  }

  return <>{children}</>;
};

export default RoleRouteGuard;