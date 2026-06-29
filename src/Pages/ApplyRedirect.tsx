import React from "react";
import { useSearchParams, Navigate } from "react-router-dom";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get('redirect');
  const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

  if (redirectParam) {
    sessionStorage.setItem('pendingJobRedirect', redirectParam);
  }

  const existingToken = localStorage.getItem('token');

  if (existingToken) {
    const dest = effectiveRedirect ? effectiveRedirect : '/dashboard/freelancer';
    return <Navigate to={dest} replace />;
  }

  const url = effectiveRedirect
    ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
    : "/Register";
  return <Navigate to={url} replace />;
};

export default ApplyRedirect;
