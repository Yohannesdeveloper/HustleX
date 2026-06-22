import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";

interface TelegramUser {
  phone_number?: string;
  [key: string]: any;
}

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Initialize Telegram WebApp immediately — makes window.Telegram.WebApp
    // usable and tells Telegram the Mini App is ready to display.
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand?.();
      // Apply Telegram-like dark background to avoid flash
      document.documentElement.style.backgroundColor = '#17212b';
      document.body.style.backgroundColor = '#17212b';
    }

    // Persist the pending job redirect in sessionStorage so it survives
    // across registration, profile setup, and page refreshes.
    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

    const redirectToRegister = () => {
      const registerUrl = effectiveRedirect
        ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
        : "/Register";
      navigate(registerUrl, { replace: true });
    };

    const redirectToJob = (path: string) => {
      sessionStorage.removeItem('pendingJobRedirect');
      navigate(`${path}?autoApply=true`, { replace: true });
    };

    const redirectToProfileSetup = () => {
      const profileSetupUrl = effectiveRedirect
        ? `/freelancer-profile-setup?redirect=${encodeURIComponent(effectiveRedirect)}`
        : "/freelancer-profile-setup";
      navigate(profileSetupUrl, { replace: true });
    };

    const checkRegistration = async () => {
      try {
        // First check: is user already logged in with a valid token?
        if (apiService.isAuthenticated()) {
          try {
            const user = await apiService.getCurrentUser();
            if (user && effectiveRedirect) {
              if (user.profile?.isProfileComplete) {
                redirectToJob(effectiveRedirect);
              } else {
                redirectToProfileSetup();
              }
              return;
            }
          } catch (error) {
            // Token invalid — clear it and fall through to registration
            localStorage.removeItem("token");
            apiService.clearToken();
          }
        }

        // If not authenticated, always redirect to registration
        // The registration flow will handle: Registration → Share Phone → Profile Setup → Job Details
        redirectToRegister();
      } catch (err: any) {
        setError("Failed to check registration status");
        redirectToRegister();
      }
    };

    checkRegistration();
  }, [redirectParam, navigate]);

  // Always show loading while redirecting — uses Telegram theme colors
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-theme-bg-color, #17212b)' }}>
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
        <p style={{ color: 'var(--tg-theme-text-color, #ffffff)' }} className="text-base">
          {error || "Loading..."}
        </p>
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-cyan-500 rounded-lg text-white font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplyRedirect;
