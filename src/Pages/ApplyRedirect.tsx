import React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { isFreelancerProfileComplete } from "../utils/activeRole";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const redirectParam = searchParams.get('redirect');
  const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

  if (redirectParam) {
    sessionStorage.setItem('pendingJobRedirect', redirectParam);
  }

  if (isAuthenticated && user) {
    if (isFreelancerProfileComplete(user)) {
      const dest = effectiveRedirect ? effectiveRedirect : '/dashboard/freelancer';
      return <Navigate to={dest} replace />;
    } else {
      const profileSetupUrl = effectiveRedirect
        ? `/freelancer-profile-setup?redirect=${encodeURIComponent(effectiveRedirect)}`
        : '/freelancer-profile-setup';
      return <Navigate to={profileSetupUrl} replace />;
    }
  }

  const url = effectiveRedirect
    ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
    : "/Register";
  return <Navigate to={url} replace />;
};

export default ApplyRedirect;
