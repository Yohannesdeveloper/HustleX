import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = searchParams.get('redirect');
  const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

  if (redirectParam) {
    sessionStorage.setItem('pendingJobRedirect', redirectParam);
  }

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      const dest = effectiveRedirect ? effectiveRedirect : '/dashboard/freelancer';
      navigate(dest, { replace: true });
    } else {
      const url = effectiveRedirect
        ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
        : "/Register";
      navigate(url, { replace: true });
    }
  }, [effectiveRedirect, navigate]);

  return null;
};

export default ApplyRedirect;
