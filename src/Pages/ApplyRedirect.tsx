import React, { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { isFreelancerProfileComplete, setPendingJobRedirect, freelancerProfileSetupPath } from "../utils/activeRole";

const PAGE_BG = "#111827";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [ready, setReady] = useState(false);

  const redirectParam = searchParams.get("redirect");
  const effectiveRedirect = redirectParam || sessionStorage.getItem("pendingJobRedirect");

  useEffect(() => {
    document.body.style.backgroundColor = PAGE_BG;
    document.documentElement.style.backgroundColor = PAGE_BG;
    const tg = window.Telegram?.WebApp as any;
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      try {
        tg.setHeaderColor?.(PAGE_BG);
        tg.setBackgroundColor?.(PAGE_BG);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (redirectParam) {
      setPendingJobRedirect(redirectParam);
    }

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      sessionStorage.setItem("telegramUser", JSON.stringify(tgUser));
    }

    checkAuth().finally(() => setReady(true));
  }, [redirectParam, checkAuth]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PAGE_BG }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
          <p className="text-gray-400">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (isFreelancerProfileComplete(user)) {
      const dest = effectiveRedirect || "/dashboard/freelancer";
      return <Navigate to={dest} replace />;
    }

    const profileSetupUrl = effectiveRedirect
      ? freelancerProfileSetupPath(effectiveRedirect)
      : "/freelancer-profile-setup";
    return <Navigate to={profileSetupUrl} replace />;
  }

  const url = effectiveRedirect
    ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
    : "/Register";
  return <Navigate to={url} replace />;
};

export default ApplyRedirect;
