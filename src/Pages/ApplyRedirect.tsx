import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";

const MAX_RETRIES = 5;

const ApplyRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const retryCount = useRef(0);
  const [status, setStatus] = useState("Starting...");

  const redirectParam = searchParams.get('redirect');

  const doLogin = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setStatus(`Waiting for Telegram... (${retryCount.current})`);
        setTimeout(doLogin, 400);
        return;
      }
      setStatus("No Telegram context — redirecting to registration");
      goToRegister(redirectParam, navigate);
      return;
    }

    tg.ready();
    tg.expand?.();
    document.documentElement.style.backgroundColor = '#17212b';
    document.body.style.backgroundColor = '#17212b';

    if (redirectParam) {
      sessionStorage.setItem('pendingJobRedirect', redirectParam);
    }
    const effectiveRedirect = redirectParam || sessionStorage.getItem('pendingJobRedirect');

    // Already logged in
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      setStatus("Already logged in — redirecting");
      const dest = effectiveRedirect
        ? `${effectiveRedirect}?autoApply=true`
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });
      return;
    }

    if (!tg.initData) {
      setStatus("No initData available — going to registration");
      goToRegister(effectiveRedirect, navigate);
      return;
    }

    setStatus("Logging in via Telegram...");
    apiService.telegramLogin({ initData: tg.initData }).then((result: any) => {
      if (result.token) {
        setStatus("Login successful — redirecting");
        const dest = effectiveRedirect
          ? `${effectiveRedirect}?autoApply=true`
          : '/dashboard/freelancer';
        navigate(dest, { replace: true });
        return;
      }
      if (result.loginRequestId) {
        setStatus("Waiting for Telegram confirmation...");
        const pollTimeout = setTimeout(() => {
          clearInterval(interval);
          setStatus("Timed out — going to registration");
          goToRegister(effectiveRedirect, navigate);
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
              setStatus("Declined — going to registration");
              goToRegister(effectiveRedirect, navigate);
            }
          } catch {
            clearInterval(interval);
            clearTimeout(pollTimeout);
            goToRegister(effectiveRedirect, navigate);
          }
        }, 2000);
      } else {
        setStatus("Unexpected response — going to registration");
        goToRegister(effectiveRedirect, navigate);
      }
    }).catch((err: any) => {
      setStatus(`Login failed: ${err?.response?.data?.message || err.message}`);
      setTimeout(() => goToRegister(effectiveRedirect, navigate), 1000);
    });
  };

  useEffect(() => {
    doLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17212b' }}>
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-base">{status}</p>
      </div>
    </div>
  );
};

function goToRegister(redirectParam: string | null, navigate: any) {
  const url = redirectParam
    ? `/Register?redirect=${encodeURIComponent(redirectParam)}`
    : "/Register";
  navigate(url, { replace: true });
}

export default ApplyRedirect;
