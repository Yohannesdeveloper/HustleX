import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const MAX_RETRIES = 5;

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const retryCount = useRef(0);
  const [status, setStatus] = useState("Starting...");
  const [telegramAvailable, setTelegramAvailable] = useState<boolean | null>(null);

  const redirectParam = searchParams.get('redirect');
  const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

  if (redirectParam) {
    sessionStorage.setItem('pendingJobRedirect', redirectParam);
  }

  const goToRegister = useCallback(() => {
    const url = effectiveRedirect
      ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
      : "/Register";
    navigate(url, { replace: true });
  }, [effectiveRedirect, navigate]);

  // Called by the Telegram Login Widget after user authorizes
  const onTelegramAuth = useCallback((user: TelegramUser) => {
    setStatus("Logging in via Telegram...");
    apiService.telegramLogin(user).then((result: any) => {
      if (result.token) {
        setStatus("Login successful — redirecting");
        const dest = effectiveRedirect
          ? `${effectiveRedirect}?autoApply=true`
          : '/dashboard/freelancer';
        navigate(dest, { replace: true });
      } else if (result.loginRequestId) {
        setStatus("Waiting for Telegram confirmation...");
        const pollTimeout = setTimeout(() => {
          clearInterval(interval);
          goToRegister();
        }, 15000);
        const interval = setInterval(async () => {
          try {
            const poll: any = await apiService.telegramLoginStatus(result.loginRequestId);
            if (poll.status === 'confirmed' && poll.token) {
              clearInterval(interval);
              clearTimeout(pollTimeout);
              setStatus("Confirmed — redirecting");
              const dest = effectiveRedirect
                ? `${effectiveRedirect}?autoApply=true`
                : '/dashboard/freelancer';
              navigate(dest, { replace: true });
            } else if (poll.status === 'declined' || poll.status === 'expired') {
              clearInterval(interval);
              clearTimeout(pollTimeout);
              setStatus("Declined");
              goToRegister();
            }
          } catch {
            clearInterval(interval);
            clearTimeout(pollTimeout);
            goToRegister();
          }
        }, 2000);
      } else {
        goToRegister();
      }
    }).catch((err: any) => {
      setStatus(`Login failed: ${err?.response?.data?.message || err.message}`);
      setTimeout(goToRegister, 2000);
    });
  }, [effectiveRedirect, navigate, goToRegister]);

  const doLogin = useCallback(() => {
    // Already logged in
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      const dest = effectiveRedirect
        ? `${effectiveRedirect}?autoApply=true`
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return;
    }

    // Try Mini App initData (works inside Telegram Mini App)
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      setTelegramAvailable(true);
      setStatus("Logging in via Telegram...");
      apiService.telegramLogin({ initData: tg.initData }).then((result: any) => {
        if (result.token) {
          setStatus("Login successful — redirecting");
          const dest = effectiveRedirect
            ? `${effectiveRedirect}?autoApply=true`
            : '/dashboard/freelancer';
          navigate(dest, { replace: true });
        } else if (result.loginRequestId) {
          setStatus("Waiting for Telegram confirmation...");
          const pollTimeout = setTimeout(() => {
            clearInterval(interval);
            goToRegister();
          }, 15000);
          const interval = setInterval(async () => {
            try {
              const poll: any = await apiService.telegramLoginStatus(result.loginRequestId);
              if (poll.status === 'confirmed' && poll.token) {
                clearInterval(interval);
                clearTimeout(pollTimeout);
                onTelegramAuth({ ...poll });
              } else if (poll.status === 'declined' || poll.status === 'expired') {
                clearInterval(interval);
                clearTimeout(pollTimeout);
                goToRegister();
              }
            } catch {
              clearInterval(interval);
              clearTimeout(pollTimeout);
              goToRegister();
            }
          }, 2000);
        } else {
          goToRegister();
        }
      }).catch((err: any) => {
        setStatus(`Login failed: ${err?.response?.data?.message || err.message}`);
        setTimeout(goToRegister, 1000);
      });
      return;
    } else if (tg) {
      // Telegram context exists but no initData — can't auto-login
      setTelegramAvailable(true);
      setStatus("Telegram context found but no init data — use button below");
      return;
    }

    // Retry: window.Telegram might load async
    if (retryCount.current < MAX_RETRIES) {
      retryCount.current++;
      setStatus(`Waiting for Telegram... (${retryCount.current})`);
      setTimeout(doLogin, 400);
      return;
    }

    // No Telegram context at all — show Login Widget
    setTelegramAvailable(false);
    setStatus("Log in with Telegram to continue");
  }, [effectiveRedirect, navigate, goToRegister, onTelegramAuth]);

  useEffect(() => {
    doLogin();
  }, [doLogin]);

  // Load Telegram Login Widget when Telegram Mini App is unavailable
  useEffect(() => {
    if (telegramAvailable !== false) return;

    // Expose callback globally for the widget
    (window as any).onTelegramAuth = onTelegramAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'HustleXet_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    document.getElementById('telegram-login-container')?.appendChild(script);
  }, [telegramAvailable, onTelegramAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6 max-w-md w-full">
        {telegramAvailable === null && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">{status}</p>
          </>
        )}
        {telegramAvailable === false && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 mb-6">Click below to log in with your Telegram account</p>
            <div id="telegram-login-container" className="flex justify-center mb-4"></div>
            <button
              onClick={goToRegister}
              className="text-gray-500 hover:text-gray-300 text-sm underline mt-4"
            >
              Continue to registration instead
            </button>
          </>
        )}
        {telegramAvailable === true && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">{status}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplyRedirect;
