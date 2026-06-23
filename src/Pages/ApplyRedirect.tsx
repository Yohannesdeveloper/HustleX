import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand?.();
      document.documentElement.style.backgroundColor = '#17212b';
      document.body.style.backgroundColor = '#17212b';
    }

    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }

    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

    // If there's already a token, go directly
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      const dest = effectiveRedirect
        ? `${effectiveRedirect}?autoApply=true`
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return;
    }

    // Try Telegram login via raw initData
    if (tg?.initData) {
      apiService.telegramLogin({ initData: tg.initData }).then((result: any) => {
        if (result.token) {
          const dest = effectiveRedirect
            ? `${effectiveRedirect}?autoApply=true`
            : '/dashboard/freelancer';
          navigate(dest, { replace: true });
          return;
        }
        if (result.loginRequestId) {
          // Poll for user confirmation in Telegram bot
          const interval = setInterval(async () => {
            try {
              const poll: any = await apiService.telegramLoginStatus(result.loginRequestId);
              if (poll.status === 'confirmed' && poll.token) {
                clearInterval(interval);
                const dest = effectiveRedirect
                  ? `${effectiveRedirect}?autoApply=true`
                  : '/dashboard/freelancer';
                navigate(dest, { replace: true });
              } else if (poll.status === 'declined' || poll.status === 'expired') {
                clearInterval(interval);
                goToRegister(effectiveRedirect, navigate);
              }
            } catch {
              clearInterval(interval);
              goToRegister(effectiveRedirect, navigate);
            }
          }, 2000);
        } else {
          goToRegister(effectiveRedirect, navigate);
        }
      }).catch(() => {
        goToRegister(effectiveRedirect, navigate);
      });
    } else {
      // No initData — pass initData via sessionStorage so Registration.tsx
      // can retry the Telegram login when it loads.
      if (tg?.initDataUnsafe?.user?.id) {
        sessionStorage.setItem('pendingTelegramLogin', '1');
      }
      goToRegister(effectiveRedirect, navigate);
    }
  }, [redirectParam, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-base">Loading...</p>
      </div>
    </div>
  );
};

function goToRegister(effectiveRedirect: string | null, navigate: any) {
  const registerUrl = effectiveRedirect
    ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
    : "/Register";
  navigate(registerUrl, { replace: true });
}

export default ApplyRedirect;
