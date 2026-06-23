import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'confirming' | 'error'>('loading');

  const redirectParam = searchParams.get('redirect');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand?.();
      document.documentElement.style.backgroundColor = '#17212b';
      document.body.style.backgroundColor = '#17212b';
    }

    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

    // Persist redirect URL for later use
    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    // If there's already a token, just redirect
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      const dest = effectiveRedirect
        ? `${effectiveRedirect}?autoApply=true`
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return;
    }

    // Try Telegram silent login via initData
    const initData = tg?.initDataUnsafe;
    if (initData && initData.id) {
      setStatus('confirming');

      apiService.telegramLogin(initData).then((result: any) => {
        if (result.token) {
          // Immediate token (user hasn't started the bot — auto-login fallback)
          const dest = effectiveRedirect
            ? `${effectiveRedirect}?autoApply=true`
            : '/dashboard/freelancer';
          navigate(dest, { replace: true });
          return;
        }

        if (result.loginRequestId) {
          // Poll for confirmation
          pollingRef.current = setInterval(async () => {
            try {
              const pollResult: any = await apiService.telegramLoginStatus(result.loginRequestId);
              if (pollResult.status === 'confirmed' && pollResult.token) {
                clearInterval(pollingRef.current!);
                const dest = effectiveRedirect
                  ? `${effectiveRedirect}?autoApply=true`
                  : '/dashboard/freelancer';
                navigate(dest, { replace: true });
              } else if (pollResult.status === 'declined' || pollResult.status === 'expired') {
                clearInterval(pollingRef.current!);
                fallbackToRegister(effectiveRedirect);
              }
            } catch {
              clearInterval(pollingRef.current!);
              fallbackToRegister(effectiveRedirect);
            }
          }, 2000);
        } else {
          // Unexpected response
          fallbackToRegister(effectiveRedirect);
        }
      }).catch(() => {
        fallbackToRegister(effectiveRedirect);
      });
    } else {
      // No Telegram data available
      fallbackToRegister(effectiveRedirect);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [redirectParam, navigate]);

  function fallbackToRegister(effectiveRedirect: string | null) {
    setStatus('error');
    const registerUrl = effectiveRedirect
      ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
      : "/Register";
    setTimeout(() => navigate(registerUrl, { replace: true }), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">Checking your account...</p>
          </>
        )}
        {status === 'confirming' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">Confirm login in Telegram...</p>
            <p className="text-gray-400 text-sm mt-2">Check your Telegram chat with HustleX bot</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">Redirecting to registration...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplyRedirect;
