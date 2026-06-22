import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Initialize Telegram WebApp immediately
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand?.();
      document.documentElement.style.backgroundColor = '#17212b';
      document.body.style.backgroundColor = '#17212b';
    }

    // Persist redirect if needed
    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    // Directly navigate to registration page without any checks
    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');
    const registerUrl = effectiveRedirect
      ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
      : "/";

    // Use setTimeout to ensure navigation happens after render
    setTimeout(() => {
      navigate(registerUrl, { replace: true });
    }, 100);
  }, [redirectParam, navigate]);

  // Simple loading screen
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-base">Loading...</p>
      </div>
    </div>
  );
};

export default ApplyRedirect;
