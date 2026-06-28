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
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const initDataRef = useRef<string | null>(null);

  const redirectParam = searchParams.get('redirect');
  const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

  console.log("[ApplyRedirect] mounted, redirectParam:", redirectParam, "effectiveRedirect:", effectiveRedirect);

  if (redirectParam) {
    sessionStorage.setItem('pendingJobRedirect', redirectParam);
  }

  const goToRegister = useCallback(() => {
    console.log("[ApplyRedirect] goToRegister called");
    const url = effectiveRedirect
      ? `/Register?redirect=${encodeURIComponent(effectiveRedirect)}`
      : "/Register";
    navigate(url, { replace: true });
  }, [effectiveRedirect, navigate]);

  const handleLoginResult = useCallback((result: any) => {
    if (result.token) {
      console.log("[ApplyRedirect] login success, token received, redirecting to job");
      const dest = effectiveRedirect
        ? effectiveRedirect
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return true;
    }
    if (result.needsRegistration) {
      console.log("[ApplyRedirect] Telegram account not linked — showing login form");
      sessionStorage.setItem('telegramUser', JSON.stringify(result.telegramUser));
      setShowLoginForm(true);
      return true;
    }
    if (result.loginRequestId) {
      console.log("[ApplyRedirect] pending confirmation, requestId:", result.loginRequestId);
      setStatus("Waiting for Telegram confirmation...");
      const pollTimeout = setTimeout(() => {
        clearInterval(interval);
        console.log("[ApplyRedirect] poll timed out");
        setShowLoginForm(true);
      }, 15000);
      const interval = setInterval(async () => {
        try {
          const poll: any = await apiService.telegramLoginStatus(result.loginRequestId);
          console.log("[ApplyRedirect] poll result:", poll.status);
          if (poll.status === 'confirmed' && poll.token) {
            clearInterval(interval);
            clearTimeout(pollTimeout);
            console.log("[ApplyRedirect] confirmed, redirecting");
            const dest = effectiveRedirect
              ? effectiveRedirect
              : '/dashboard/freelancer';
            navigate(dest, { replace: true });
          } else if (poll.status === 'declined' || poll.status === 'expired') {
            clearInterval(interval);
            clearTimeout(pollTimeout);
            console.log("[ApplyRedirect] declined/expired");
            setShowLoginForm(true);
          }
        } catch (e) {
          clearInterval(interval);
          clearTimeout(pollTimeout);
          console.log("[ApplyRedirect] poll error:", e);
          setShowLoginForm(true);
        }
      }, 2000);
      return true;
    }
    return false;
  }, [effectiveRedirect, navigate, goToRegister]);

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const initData = initDataRef.current;
      if (!initData) {
        setLoginError("Telegram session lost. Please try again.");
        setLoginLoading(false);
        return;
      }
      const result: any = await apiService.telegramLogin({ initData, email: loginEmail, password: loginPassword });
      if (result.token) {
        const dest = effectiveRedirect || '/dashboard/freelancer';
        navigate(dest, { replace: true });
      } else {
        setLoginError("Login failed. Check your email and password.");
      }
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }, [loginEmail, loginPassword, effectiveRedirect, navigate]);

  const doLogin = useCallback(() => {
    const existingToken = localStorage.getItem('token');
    console.log("[ApplyRedirect] doLogin, existingToken:", !!existingToken);

    if (existingToken) {
      const dest = effectiveRedirect
        ? effectiveRedirect
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return;
    }

    const tg = window.Telegram?.WebApp;
    console.log("[ApplyRedirect] window.Telegram?.WebApp:", !!tg);
    if (tg) {
      tg.ready?.();
      console.log("[ApplyRedirect] tg.initData:", tg.initData ? tg.initData.substring(0, 80) + '...' : '(empty)');
      console.log("[ApplyRedirect] tg.initDataUnsafe:", tg.initDataUnsafe);
    }

    if (tg?.initData) {
      console.log("[ApplyRedirect] found initData, calling telegramLogin API");
      initDataRef.current = tg.initData;
      setTelegramAvailable(true);
      setStatus("Logging in via Telegram...");

      apiService.telegramLogin({ initData: tg.initData }).then((result: any) => {
        console.log("[ApplyRedirect] telegramLogin response:", result);
        if (!handleLoginResult(result)) {
          console.log("[ApplyRedirect] unexpected response format");
          setStatus("Unexpected response. Try logging in below.");
          setShowLoginForm(true);
        }
      }).catch((err: any) => {
        console.log("[ApplyRedirect] telegramLogin error:", err?.response?.data || err.message);
        setStatus(`Login failed: ${err?.response?.data?.message || err.message}`);
        setShowLoginForm(true);
      });
      return;
    }

    if (tg) {
      console.log("[ApplyRedirect] Telegram WebApp exists but initData is empty");
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        console.log("[ApplyRedirect] retry (empty initData)", retryCount.current, "of", MAX_RETRIES);
        setStatus(`Initializing Telegram... (${retryCount.current})`);
        setTimeout(doLogin, 400);
        return;
      }
      console.log("[ApplyRedirect] Telegram WebApp exists but initData remained empty after retries, showing Login Widget");
      setTelegramAvailable(false);
      setStatus("Log in with Telegram to continue");
      return;
    }

    if (retryCount.current < MAX_RETRIES) {
      retryCount.current++;
      console.log("[ApplyRedirect] retry", retryCount.current, "of", MAX_RETRIES);
      setStatus(`Waiting for Telegram... (${retryCount.current})`);
      setTimeout(doLogin, 400);
      return;
    }

    console.log("[ApplyRedirect] no Telegram context after retries, showing Login Widget");
    setTelegramAvailable(false);
    setStatus("Log in with Telegram to continue");
  }, [effectiveRedirect, navigate, goToRegister, handleLoginResult]);

  useEffect(() => {
    doLogin();
  }, [doLogin]);

  useEffect(() => {
    if (telegramAvailable !== false) return;

    console.log("[ApplyRedirect] loading Telegram Login Widget");
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      console.log("[ApplyRedirect] Login Widget callback received:", user.id);
      setStatus("Logging in via Telegram...");
      apiService.telegramLogin(user).then((result: any) => {
        console.log("[ApplyRedirect] Login Widget login response:", result);
        if (!handleLoginResult(result)) {
          setShowLoginForm(true);
        }
      }).catch((err: any) => {
        console.log("[ApplyRedirect] Login Widget error:", err?.response?.data || err.message);
        setStatus(`Login failed: ${err?.response?.data?.message || err.message}`);
        setShowLoginForm(true);
      });
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'HustleXet_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;
    document.getElementById('telegram-login-container')?.appendChild(script);
  }, [telegramAvailable, handleLoginResult, goToRegister]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6 max-w-md w-full">
        {showLoginForm ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Link your account</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Your Telegram account isn't linked to a HustleX account yet.<br />
              Log in with your existing credentials to link them.
            </p>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-cyan-500 focus:outline-none"
              />
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
              >
                {loginLoading ? "Linking..." : "Log in & link Telegram"}
              </button>
            </form>
            <div className="mt-6 space-y-2">
              <button onClick={goToRegister} className="text-gray-500 hover:text-gray-300 text-sm underline block w-full">
                I don't have an account — Register
              </button>
              <button onClick={() => window.location.href = '/forgot-password'} className="text-gray-500 hover:text-gray-300 text-sm underline block w-full">
                Forgot password?
              </button>
            </div>
          </>
        ) : telegramAvailable === null ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-base">{status}</p>
          </>
        ) : telegramAvailable === false ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 mb-6">Click below to log in with your Telegram account</p>
            <div id="telegram-login-container" className="flex justify-center mb-4"></div>
            <button onClick={goToRegister} className="text-gray-500 hover:text-gray-300 text-sm underline mt-4">
              Continue to registration instead
            </button>
          </>
        ) : (
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
