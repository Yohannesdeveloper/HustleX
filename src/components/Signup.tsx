import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash, FaTelegram } from "react-icons/fa";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import apiService from "../services/api";
import { getBackendApiUrlSync } from "../utils/portDetector";
import { isAdminAccount } from "../utils/admin";
import { RegisterSEO, LoginSEO } from "../components/SEO";

declare global {
  interface Window {
    TelegramLoginWidget: any;
    telegramLoginCallback?: (data: any) => void;
  }
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login, addRole, switchRole, setUser } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<{ botUsername: string | null; configured: boolean } | null>(null);
  const [telegramPending, setTelegramPending] = useState<"idle" | "waiting" | "declined" | "expired" | "error">("idle");
  const telegramPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailCheckTimeout = useRef<number | null>(null);

  // Handle Telegram Login callback
  const handleTelegramLogin = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setTelegramPending("idle");
    try {
      const result = await apiService.telegramLogin(data);

      // Case 1: Backend returned a token immediately (fallback when notification fails)
      if (("token" in result) && result.token && result.user) {
        setUser(result.user);
        if (isAdminAccount(result.user)) {
          navigate("/admin/dashboard", { replace: true });
        } else if (result.user.currentRole === "freelancer") {
          navigate("/dashboard/freelancer", { replace: true });
        } else if (result.user.currentRole === "client") {
          navigate("/dashboard/hiring", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return;
      }

      // Case 2: Backend returned a pending login request – start polling
      if (("loginRequestId" in result) && result.loginRequestId) {
        setTelegramPending("waiting");
        setIsLoading(false); // Loading done, now just waiting for Telegram confirmation

        const requestId = result.loginRequestId;
        const startTime = Date.now();
        const POLL_INTERVAL = 2500;
        const TIMEOUT = 5 * 60 * 1000; // 5 minutes
        let consecutiveErrors = 0;
        const MAX_CONSECUTIVE_ERRORS = 10; // Allow up to 10 transient errors

        telegramPollRef.current = setInterval(async () => {
          // Stop polling after timeout
          if (Date.now() - startTime > TIMEOUT) {
            if (telegramPollRef.current) clearInterval(telegramPollRef.current);
            telegramPollRef.current = null;
            setTelegramPending("expired");
            return;
          }

          try {
            const status = await apiService.telegramLoginStatus(requestId);
            consecutiveErrors = 0; // Reset on success

            if (status.status === "confirmed" && status.token && status.user) {
              if (telegramPollRef.current) clearInterval(telegramPollRef.current);
              telegramPollRef.current = null;
              setUser(status.user);
              if (isAdminAccount(status.user)) {
                navigate("/admin/dashboard", { replace: true });
              } else if (status.user.currentRole === "freelancer") {
                navigate("/dashboard/freelancer", { replace: true });
              } else if (status.user.currentRole === "client") {
                navigate("/dashboard/hiring", { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            } else if (status.status === "declined") {
              if (telegramPollRef.current) clearInterval(telegramPollRef.current);
              telegramPollRef.current = null;
              setTelegramPending("declined");
            } else if (status.status === "expired") {
              if (telegramPollRef.current) clearInterval(telegramPollRef.current);
              telegramPollRef.current = null;
              setTelegramPending("expired");
            }
            // status === "pending" → keep polling silently
          } catch (pollErr: any) {
            consecutiveErrors++;
            console.warn(`Polling attempt ${consecutiveErrors} failed:`, pollErr?.message || pollErr);

            // If entry is gone (404) or too many errors, give up
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS || pollErr?.response?.status === 404) {
              if (telegramPollRef.current) clearInterval(telegramPollRef.current);
              telegramPollRef.current = null;
              // 404 means the request expired or server restarted
              if (pollErr?.response?.status === 404) {
                setTelegramPending("expired");
              } else {
                setTelegramPending("error");
                setError("Connection lost. Please try logging in again.");
              }
            }
            // Otherwise keep retrying – transient network/rate-limit issue
          }
        }, POLL_INTERVAL);
      }
    } catch (err: any) {
      console.error("Telegram login error:", err);
      let errorMessage = "Failed to login with Telegram. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Telegram config from backend
  useEffect(() => {
    const fetchTelegramConfig = async () => {
      try {
        const config = await apiService.getTelegramConfig();
        setTelegramConfig(config);
      } catch (err) {
        console.error("Failed to fetch Telegram config:", err);
      }
    };
    fetchTelegramConfig();
  }, []);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (telegramPollRef.current) {
        clearInterval(telegramPollRef.current);
      }
    };
  }, []);

  // Initialize Telegram Widget
  useEffect(() => {
    if (!telegramConfig || !telegramConfig.configured || !telegramConfig.botUsername) {
      return;
    }

    // Only render widget when idle
    if (telegramPending !== "idle") return;

    // Expose callback to global scope
    window.telegramLoginCallback = handleTelegramLogin;

    // Load Telegram Widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.dataset.telegramLogin = telegramConfig.botUsername;
    script.dataset.size = "large";
    script.dataset.avatar = "true";
    script.dataset.theme = darkMode ? "dark" : "light";
    script.dataset.onauth = "window.telegramLoginCallback(user)";
    script.dataset.requestAccess = "write";
    
    // Insert into our div – use a short delay to let the DOM update first
    const timeout = setTimeout(() => {
      const container = document.getElementById("telegram-login-button");
      if (container) {
        container.innerHTML = ""; // Clear any existing content
        container.appendChild(script);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      // Cleanup
      delete window.telegramLoginCallback;
      const container = document.getElementById("telegram-login-button");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [telegramConfig, darkMode, telegramPending]);

  // Get redirect path from URL params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect");

  const checkExistingUser = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setExistingUser(null);
      return;
    }

    setCheckingUser(true);
    setError(null);
    try {
      // Check if user exists by attempting to get user data
      const apiUrl = getBackendApiUrlSync();
      const checkUrl = `${apiUrl}/auth/check-user?email=${encodeURIComponent(emailToCheck)}`;

      const response = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 429) {
        // Rate limited - don't show error, just stop checking
        setCheckingUser(false);
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        if (userData.user) {
          setExistingUser(userData.user);
          setShowCreateForm(false);
        } else {
          console.warn('User data missing in response:', userData);
          setExistingUser(null);
          setShowCreateForm(true);
        }
      } else if (response.status === 404) {
        // User not found - this is expected for new users
        console.log('User not found (404) - showing create form');
        setExistingUser(null);
        setShowCreateForm(true);
      } else {
        // Other error status
        console.warn('Unexpected response status:', response.status);
        setExistingUser(null);
        setShowCreateForm(true);
      }
    } catch (err) {
      // Log error for debugging but don't show to user
      console.error('Error checking existing user:', err);
      setExistingUser(null);
      setShowCreateForm(true);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setExistingUser(null); // Reset existing user when email changes

    // Clear any pending checks so we only fire once after the user stops typing
    if (emailCheckTimeout.current) {
      window.clearTimeout(emailCheckTimeout.current);
    }

    // Debounce the check - 800ms after the last keystroke
    emailCheckTimeout.current = window.setTimeout(() => {
      if (newEmail && newEmail.includes("@")) {
        checkExistingUser(newEmail);
      }
    }, 800);
  };

  const handleAccountSelection = async (selectedRole: string) => {
    setSelectedRoleForLogin(selectedRole);
    setShowLoginForm(true);
    setError(null);
  };

  const handleAddRole = async (newRole: 'freelancer' | 'client') => {
    setSelectedRoleForLogin(newRole);
    setShowLoginForm(true);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(t.signup.pleaseEnterPassword);
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);

      // Determine the role to use (selected role or current role)
      const targetRole = selectedRoleForLogin || loggedInUser?.currentRole || 'freelancer';

      // Admin role is managed server-side — skip add/switch role APIs
      if (selectedRoleForLogin && selectedRoleForLogin !== 'admin') {
        if (!existingUser.roles?.includes(selectedRoleForLogin)) {
          try {
            await addRole(selectedRoleForLogin as 'freelancer' | 'client');
          } catch (roleError: any) {
            console.error('Error adding role:', roleError);
          }
        } else if (loggedInUser?.currentRole !== selectedRoleForLogin) {
          try {
            await switchRole(selectedRoleForLogin as 'freelancer' | 'client');
          } catch (switchError: any) {
            console.error('Error switching role:', switchError);
          }
        }
      }

      // Navigate based on role and profile completion status
      // Priority 1: Admin users always go to admin panel
      console.log("Login redirect check:", {
        user: loggedInUser,
        isAdmin: isAdminAccount(loggedInUser),
        email: loggedInUser?.email,
        roles: loggedInUser?.roles,
        redirectPath
      });
      if (isAdminAccount(loggedInUser)) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Priority 2: Use explicit redirect path if provided (e.g. from pricing/payment)
      if (redirectPath && redirectPath !== "/job-listings") {
        navigate(redirectPath, { replace: true });
        return;
      }

      // Priority 3: Fallback to role-specific dashboard
      if (targetRole === 'freelancer') {
        navigate('/dashboard/freelancer', { replace: true });
      } else if (targetRole === 'client') {
        navigate('/dashboard/hiring', { replace: true });
      } else {
        navigate("/job-listings", { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = "Invalid email or password. Please try again.";

      if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.toString) {
          errorMessage = err.toString();
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // For now, we'll implement a simple Google-like signup
      // You can integrate with Google OAuth later if needed
      setError(
        "Google signup will be implemented soon. Please use email/password."
      );
    } catch (err: any) {
      setError(t.signup.googleSignupFailed.replace("{error}", err.message || ""));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent registration if user already exists
    if (existingUser) {
      setError("An account with this email already exists. Please choose from existing accounts above.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t.signup.passwordsDoNotMatch);
      return;
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one letter and one number");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        role,
        firstName,
        lastName,
      });

      console.log("Registration successful");

      // Priority 1: Use explicit redirect path if provided (e.g. from pricing/payment)
      if (redirectPath && redirectPath !== "/job-listings") {
        navigate(redirectPath, { replace: true });
        return;
      }

      // Priority 2: Redirect to profile setup for new accounts
      if (role === 'freelancer') {
        navigate('/profile-setup?role=freelancer', { replace: true });
      } else if (role === 'client') {
        navigate('/profile-setup?role=client', { replace: true });
      } else {
        navigate('/job-listings', { replace: true });
      }
    } catch (err: any) {
      let errorMessage = t.signup.failedToCreateAccount;

      if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.response?.status === 429) {
          errorMessage = t.signup.tooManyRequests;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
          if (typeof err.message === 'string' && err.message.toLowerCase().includes('network')) {
            errorMessage = 'Cannot connect to the server. Please ensure the backend is running.';
          }
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        }
      }

      // If backend says the user already exists, trigger the existing-account flow
      if (errorMessage?.toLowerCase().includes("user already exists")) {
        setError(t.signup.accountAlreadyExists);
        if (email && email.includes("@")) {
          checkExistingUser(email);
        }
      } else {
        setError(errorMessage);
      }

      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {isLoginPage ? <LoginSEO /> : <RegisterSEO />}
      <div
        className={`min-h-screen flex items-start justify-center px-3 sm:px-4 py-8 transition-colors duration-300 overflow-y-auto ${darkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-black-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900"
          }`}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute w-[500px] h-[500px] rounded-full top-1/4 left-1/4  ${darkMode ? "opacity-20" : "opacity-10"
              }`}
          />
          <div
            className={`absolute w-[300px] h-[300px]  rounded-full bottom-1/4 right-1/4  ${darkMode ? "opacity-15" : "opacity-8"
              }`}
          />
        </div>

        <div
          className={`relative z-10 backdrop-blur-xl border rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md ${darkMode
            ? "bg-black/40 border-cyan-500/20 shadow-cyan-500/10"
            : "bg-white/80 border-cyan-500/10 shadow-cyan-500/5"
            }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center drop-shadow-lg ${darkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
          >
            {t.signup.createAccount}
          </h2>



          {telegramConfig?.configured && telegramPending === "waiting" && (
            <div className={`p-5 rounded-2xl border mb-6 text-center transition-all ${
              darkMode 
                ? "bg-yellow-950/20 border-yellow-500/30 shadow-lg shadow-yellow-500/5" 
                : "bg-yellow-50/70 border-yellow-300/50 shadow-md shadow-yellow-100/50"
            }`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaTelegram className="text-2xl text-[#24A1DE]" />
                <span className={`font-semibold text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                  Awaiting Confirmation
                </span>
              </div>
              <div className="flex justify-center mb-3">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${
                  darkMode ? "border-yellow-500/30 border-t-yellow-400" : "border-yellow-400/30 border-t-yellow-500"
                }`} />
              </div>
              <p className={`text-xs max-w-xs mx-auto leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Check your <b>Telegram chat</b> and tap <b>✅ Confirm Login</b> to continue.
              </p>
              <button
                onClick={() => {
                  if (telegramPollRef.current) clearInterval(telegramPollRef.current);
                  telegramPollRef.current = null;
                  setTelegramPending("idle");
                  setIsLoading(false);
                }}
                className={`mt-3 text-xs underline ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                Cancel
              </button>
            </div>
          )}

          {telegramConfig?.configured && telegramPending === "declined" && (
            <div className={`p-4 rounded-2xl border mb-6 text-center transition-all ${
              darkMode ? "bg-red-950/20 border-red-500/30" : "bg-red-50/70 border-red-300/50"
            }`}>
              <p className={`text-sm font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                ❌ Login was declined. Please try again if this was a mistake.
              </p>
              <button
                onClick={() => setTelegramPending("idle")}
                className={`mt-2 text-xs underline ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                Dismiss
              </button>
            </div>
          )}

          {telegramConfig?.configured && telegramPending === "expired" && (
            <div className={`p-4 rounded-2xl border mb-6 text-center transition-all ${
              darkMode ? "bg-orange-950/20 border-orange-500/30" : "bg-orange-50/70 border-orange-300/50"
            }`}>
              <p className={`text-sm font-semibold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                ⏰ Login request expired. Please try again.
              </p>
              <button
                onClick={() => setTelegramPending("idle")}
                className={`mt-2 text-xs underline ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                Dismiss
              </button>
            </div>
          )}

          {telegramConfig?.configured && telegramPending === "error" && (
            <div className={`p-4 rounded-2xl border mb-6 text-center transition-all ${
              darkMode ? "bg-red-950/20 border-red-500/30" : "bg-red-50/70 border-red-300/50"
            }`}>
              <p className={`text-sm font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
                Connection lost. Please try logging in with Telegram again.
              </p>
              <button
                onClick={() => setTelegramPending("idle")}
                className={`mt-2 text-xs underline ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                Try Again
              </button>
            </div>
          )}

          {telegramConfig?.configured && telegramPending === "idle" && (
            <div className={`p-5 rounded-2xl border mb-6 text-center transition-all ${
              darkMode 
                ? "bg-sky-950/20 border-sky-500/20 shadow-lg shadow-sky-500/5" 
                : "bg-sky-50/50 border-sky-200/50 shadow-md shadow-sky-100/50"
            }`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaTelegram className="text-2xl text-[#24A1DE] animate-pulse" />
                <span className={`font-semibold text-sm ${darkMode ? "text-sky-300" : "text-sky-700"}`}>
                  Secure Telegram Access
                </span>
              </div>
              <p className={`text-xs mb-4 max-w-xs mx-auto leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Click below to sign in using your Telegram account. You'll receive a confirmation notification in Telegram to approve the login.
              </p>
              <div className="flex justify-center">
                <div id="telegram-login-button" className="transition-all hover:scale-105 duration-200" />
              </div>
            </div>
          )}

          <div
            className={`my-6 text-center relative ${darkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${darkMode ? "border-gray-600/50" : "border-gray-300/50"
                  }`}
              ></div>
            </div>
            <div
              className={`relative px-4 ${darkMode ? "bg-black/40" : "bg-white/80"
                }`}
            >
              Use your email
            </div>
          </div>

          {/* Email Input - Always visible */}
          <div className="relative mb-4">
            <input
              type="email"
              placeholder={t.signup.email}
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              name="email"
              onBlur={() => {
                if (email && email.includes("@")) {
                  checkExistingUser(email);
                }
              }}
              className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                }`}
              required
            />
            {checkingUser && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Login Form for Existing Users */}
          {existingUser && showLoginForm && (
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-600/50' : 'bg-gray-100/50 border-gray-300/50'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Sign In
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedRoleForLogin && !existingUser.roles?.includes(selectedRoleForLogin)
                  ? t.signup.signInToAddRole.replace("{role}", selectedRoleForLogin)
                  : t.signup.signInToContinue.replace("{role}", selectedRoleForLogin || existingUser.roles?.[0] || 'user')}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    name="password"
                    required
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                      ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className={`text-sm text-left ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}
                >
                  {t.signup.forgotPassword}
                </button>

                {error && (
                  <p className="text-red-400 text-sm font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                    }`}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false);
                    setSelectedRoleForLogin(null);
                    setPassword("");
                    setError(null);
                  }}
                  className={`w-full text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
                >
                  {t.signup.backToAccountSelection}
                </button>
              </form>
            </div>
          )}

          {/* Existing Accounts Selection */}
          {existingUser && !showLoginForm && (
            <div className={`p-4 rounded-xl border mb-4 ${darkMode ? 'bg-gray-800/50 border-gray-600/50' : 'bg-gray-100/50 border-gray-300/50'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Account Found
              </h3>

              {/* Admin accounts: show ONLY admin option for the designated admin email */}
              {isAdminAccount(existingUser) ? (
                <>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    This is an administrator account. Please sign in with your admin credentials.
                  </p>
                  <button
                    onClick={() => handleAccountSelection('admin')}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      darkMode
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60'
                        : 'bg-purple-500/5 border-purple-500/30 text-purple-700 hover:bg-purple-500/10 hover:border-purple-500/50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔐</span>
                        <div>
                          <span className="font-semibold block">Administrator Account</span>
                          <span className={`text-xs ${darkMode ? 'text-purple-400' : 'text-purple-500'}`}>HustleX Admin Panel</span>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Sign In →</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t.signup.accountExistsMessage || "An account with this email already exists. Please sign in or add a new role."}
                  </p>

                  {/* Non-admin: show all existing roles */}
                  <div className="space-y-2 mb-4">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Continue with existing role:
                    </h4>
                    {existingUser.roles && existingUser.roles.filter((r: string) => r !== 'admin').length > 0 ? (
                      existingUser.roles.filter((r: string) => r !== 'admin').map((role: string) => (
                        <button
                          key={role}
                          onClick={() => handleAccountSelection(role)}
                          disabled={isLoading}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${role === 'freelancer'
                            ? darkMode
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                              : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/10'
                            : darkMode
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10'
                            } disabled:opacity-50`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium capitalize">{role} {t.signup.account}</span>
                              {existingUser.profile?.firstName && (
                                <span className={`text-sm ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({existingUser.profile.firstName} {existingUser.profile.lastName})
                                </span>
                              )}
                            </div>
                            <span className="text-sm">
                              {role === 'freelancer' ? '💼' : '🏢'} {t.signup.signIn}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No roles found for this account.
                      </p>
                    )}
                  </div>

                  {/* Add New Role Option */}
                  <div className={`pt-3 border-t ${darkMode ? 'border-gray-600/50' : 'border-gray-300/50'}`}>
                    <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Or add a new role to your account:
                    </h4>
                    <div className="space-y-2">
                      {!existingUser.roles?.includes('freelancer') && (
                        <button
                          onClick={() => handleAddRole('freelancer')}
                          disabled={isLoading}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${darkMode
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                            : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/10'
                            } disabled:opacity-50`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{t.signup.addFreelancerRole}</span>
                              <span className={`text-sm ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t.signup.offerServices}
                              </span>
                            </div>
                            <span className="text-sm">💼 {t.signup.add}</span>
                          </div>
                        </button>
                      )}
                      {!existingUser.roles?.includes('client') && (
                        <button
                          onClick={() => handleAddRole('client')}
                          disabled={isLoading}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${darkMode
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                            : 'bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10'
                            } disabled:opacity-50`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="span font-medium">{t.signup.addClientRole}</span>
                              <span className={`text-sm ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t.signup.hireFreelancersAndPost}
                              </span>
                            </div>
                            <span className="text-sm">🏢 {t.signup.add}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Create Account Form */}
          {!existingUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  name="firstName"
                  required
                  className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                    : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                    }`}
                />
                <input
                  type="text"
                  placeholder={t.signup.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  name="lastName"
                  required
                  className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                    : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    name="password"
                    required
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                      ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    name="confirmPassword"
                    required
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${darkMode
                      ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  {t.signup.iWantTo}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("freelancer")}
                    className={`px-4 py-3 rounded-xl border transition-all ${role === "freelancer"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : darkMode
                        ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50"
                        : "bg-gray-100/50 border-gray-300/50 text-gray-600 hover:border-gray-400/50"
                      }`}
                  >
                    Find Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    className={`px-4 py-3 rounded-xl border transition-all ${role === "client"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : darkMode
                        ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50"
                        : "bg-gray-100/50 border-gray-300/50 text-gray-600 hover:border-gray-400/50"
                      }`}
                  >
                    {t.signup.hireFreelancers}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                  }`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {!existingUser && (
            <p
              className={`text-center mt-6 text-sm whitespace-nowrap ${darkMode ? "text-gray-300" : "text-gray-600"
                }`}
            >
              {t.signup.alreadyHaveAccount}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup;
