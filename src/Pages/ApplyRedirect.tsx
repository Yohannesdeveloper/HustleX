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
        console.log("ApplyRedirect: Starting checkRegistration");
        console.log("ApplyRedirect: isAuthenticated:", apiService.isAuthenticated());
        console.log("ApplyRedirect: Telegram WebApp available:", !!tg);
        console.log("ApplyRedirect: Telegram user:", tg?.initDataUnsafe?.user);

        // First check: is user already logged in with a valid token?
        if (apiService.isAuthenticated()) {
          console.log("ApplyRedirect: User is authenticated, checking user data");
          try {
            const user = await apiService.getCurrentUser();
            console.log("ApplyRedirect: User data:", user);
            if (user && effectiveRedirect) {
              if (user.profile?.isProfileComplete) {
                console.log("ApplyRedirect: Profile complete, redirecting to job");
                redirectToJob(effectiveRedirect);
              } else {
                console.log("ApplyRedirect: Profile not complete, redirecting to profile setup");
                redirectToProfileSetup();
              }
              return;
            }
          } catch (error) {
            console.log("ApplyRedirect: Token invalid, falling through to Telegram check");
            // Token invalid — fall through to Telegram check or registration
          }
        }

        // Second check: Telegram mini app with phone number
        if (tg && tg.initDataUnsafe?.user) {
          const telegramUser = tg.initDataUnsafe.user as TelegramUser;
          console.log("ApplyRedirect: Telegram user found:", telegramUser);
          console.log("ApplyRedirect: Telegram phone number:", telegramUser.phone_number);

          if (telegramUser.phone_number) {
            const response = await fetch(`${apiService['baseUrl']}/applications/check-phone/${telegramUser.phone_number}`);
            const data = await response.json();
            console.log("ApplyRedirect: Phone check result:", data);

            if (data.isRegistered) {
              if (data.isProfileComplete && effectiveRedirect) {
                redirectToJob(effectiveRedirect);
              } else {
                redirectToProfileSetup();
              }
            } else {
              console.log("ApplyRedirect: Phone not registered, redirecting to registration");
              redirectToRegister();
            }
            return;
          } else {
            console.log("ApplyRedirect: No phone number from Telegram");
          }
        }

        // Fallback: no auth, no Telegram — go to registration
        console.log("ApplyRedirect: Fallback - redirecting to registration");
        redirectToRegister();
      } catch (err: any) {
        console.error("ApplyRedirect: Error checking registration:", err);
        setError("Failed to check registration status");
        redirectToRegister();
      }
    };

    checkRegistration();
  }, [redirectParam]);

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
