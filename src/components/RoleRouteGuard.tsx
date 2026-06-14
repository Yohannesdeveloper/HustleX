import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { getActiveRole, dashboardPathForRole } from "../utils/activeRole";

/**
 * Keeps users on the dashboard that matches their active role.
 * Never calls switchRole — only redirects when route and currentRole disagree.
 */
const RoleRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading || !isAuthenticated || !user) {
    return <>{children}</>;
  }

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