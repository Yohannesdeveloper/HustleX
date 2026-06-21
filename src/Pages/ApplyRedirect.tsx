import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiService from "../services/api";

interface TelegramUser {
  phone_number?: string;
  [key: string]: any;
}

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Persist the pending job redirect in sessionStorage so it survives
    // across registration, profile setup, and page refreshes.
    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    const checkRegistration = async () => {
      try {
        // Determine the effective redirect (URL param or sessionStorage fallback)
        const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

        // Check if running in Telegram mini app
        if (window.Telegram && window.Telegram.WebApp) {
          const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user as TelegramUser;
          
          if (telegramUser && telegramUser.phone_number) {
            // Check if phone number is registered
            const response = await fetch(`${apiService['baseUrl']}/applications/check-phone/${telegramUser.phone_number}`);
            const data = await response.json();
            
            if (data.isRegistered) {
              // User is registered — check profile completeness
              if (data.isProfileComplete && effectiveRedirect) {
                // Profile complete — go straight to job details
                sessionStorage.removeItem('pendingJobRedirect');
                window.location.href = `https://hustlexet.vercel.app${effectiveRedirect}`;
              } else {
                // Profile incomplete — send to profile setup first
                const profileSetupUrl = effectiveRedirect
                  ? `https://hustlexet.vercel.app/freelancer-profile-setup?redirect=${encodeURIComponent(effectiveRedirect)}`
                  : "https://hustlexet.vercel.app/freelancer-profile-setup";
                window.location.href = profileSetupUrl;
              }
            } else {
              // User is not registered, redirect to registration
              const registerUrl = effectiveRedirect 
                ? `https://hustlexet.vercel.app/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
                : "https://hustlexet.vercel.app/Register";
              window.location.href = registerUrl;
            }
          } else {
            // No phone number available, redirect to registration
            const registerUrl = effectiveRedirect 
              ? `https://hustlexet.vercel.app/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
              : "https://hustlexet.vercel.app/Register";
            window.location.href = registerUrl;
          }
        } else {
          // Not in Telegram mini app, redirect to registration
          const registerUrl = effectiveRedirect 
            ? `https://hustlexet.vercel.app/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
            : "https://hustlexet.vercel.app/Register";
          window.location.href = registerUrl;
        }
      } catch (err: any) {
        console.error("Error checking registration:", err);
        setError("Failed to check registration status");
        // Fallback to registration
        const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');
        const registerUrl = effectiveRedirect 
          ? `https://hustlexet.vercel.app/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
          : "https://hustlexet.vercel.app/Register";
        window.location.href = registerUrl;
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [redirectParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p>Checking registration status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ApplyRedirect;
