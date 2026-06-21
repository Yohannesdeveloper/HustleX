import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiService from "../services/api";

interface TelegramUser {
  phone_number?: string;
  [key: string]: any;
}

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Persist the pending job redirect in sessionStorage so it survives
    // across registration, profile setup, and page refreshes.
    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

    const redirectToRegister = () => {
      const registerUrl = effectiveRedirect
        ? `https://hustlexet.vercel.app/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
        : "https://hustlexet.vercel.app/Register";
      window.location.href = registerUrl;
    };

    const redirectToJob = (path: string) => {
      sessionStorage.removeItem('pendingJobRedirect');
      window.location.href = `https://hustlexet.vercel.app${path}?autoApply=true`;
    };

    const redirectToProfileSetup = () => {
      const profileSetupUrl = effectiveRedirect
        ? `https://hustlexet.vercel.app/freelancer-profile-setup?redirect=${encodeURIComponent(effectiveRedirect)}`
        : "https://hustlexet.vercel.app/freelancer-profile-setup";
      window.location.href = profileSetupUrl;
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
          } catch (_) {
            // Token invalid — fall through to Telegram check or registration
          }
        }

        // Second check: Telegram mini app with phone number
        if (window.Telegram && window.Telegram.WebApp) {
          const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user as TelegramUser;

          if (telegramUser && telegramUser.phone_number) {
            const response = await fetch(`${apiService['baseUrl']}/applications/check-phone/${telegramUser.phone_number}`);
            const data = await response.json();

            if (data.isRegistered) {
              if (data.isProfileComplete && effectiveRedirect) {
                redirectToJob(effectiveRedirect);
              } else {
                redirectToProfileSetup();
              }
            } else {
              redirectToRegister();
            }
            return;
          }
        }

        // Fallback: no auth, no Telegram — go to registration
        redirectToRegister();
      } catch (err: any) {
        console.error("Error checking registration:", err);
        setError("Failed to check registration status");
        redirectToRegister();
      }
    };

    checkRegistration();
  }, [redirectParam]);

  // Always show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-400">
          {error ? error : "Checking your account..."}
        </p>
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-500 rounded-lg text-white"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplyRedirect;
