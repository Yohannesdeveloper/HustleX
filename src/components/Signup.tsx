import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import apiService from "../services/api";
import { getBackendApiUrlSync } from "../utils/portDetector";
import { RegisterSEO, LoginSEO } from "../components/SEO";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login, addRole, switchRole } = useAuth();
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
  const emailCheckTimeout = useRef<number | null>(null);

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
      const apiUrl = import.meta.env.VITE_API_URL || getBackendApiUrlSync();
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

      // If adding a new role, add it after login
      if (selectedRoleForLogin && !existingUser.roles?.includes(selectedRoleForLogin)) {
        try {
          await addRole(selectedRoleForLogin as 'freelancer' | 'client');
        } catch (roleError: any) {
          console.error('Error adding role:', roleError);
          // Continue anyway - user can add role later
        }
      } else if (selectedRoleForLogin && loggedInUser?.currentRole !== selectedRoleForLogin) {
        // Switch to selected role if different from current
        try {
          await switchRole(selectedRoleForLogin as 'freelancer' | 'client');
        } catch (switchError: any) {
          console.error('Error switching role:', switchError);
          // Continue anyway
        }
      }

      // Navigate based on role and profile completion status
      // Priority 1: Use explicit redirect path if provided (e.g. from pricing/payment)
      if (redirectPath && redirectPath !== "/job-listings") {
        navigate(redirectPath, { replace: true });
        return;
      }

      // Priority 2: Force profile setup for new roles/accounts
      // Priority 3: Fallback to role-specific dashboard
      const isExistingUserWithRole = existingUser?.roles?.includes(targetRole);

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
        className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode
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
          className={`relative z-10 backdrop-blur-xl border rounded-3xl shadow-2xl p-10 w-full max-w-md ${darkMode
            ? "bg-black/40 border-cyan-500/20 shadow-cyan-500/10"
            : "bg-white/80 border-cyan-500/10 shadow-cyan-500/5"
            }`}
        >
          <h2
            className={`text-3xl font-bold mb-6 text-center drop-shadow-lg ${darkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
          >
            {t.signup.createAccount}
          </h2>

          <button
            disabled
            className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-4 transition-all duration-300 opacity-50 cursor-not-allowed border ${darkMode
              ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
              : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
              }`}
          >
            <FcGoogle className="text-xl" /> Sign up with Google
          </button>

          <button
            disabled
            className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-6 transition-all duration-300 opacity-50 cursor-not-allowed border ${darkMode
              ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
              : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
              }`}
          >
            <FaApple className="text-xl" /> {t.signup.signUpWithApple} {t.signup.comingSoon}
          </button>

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
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t.signup.accountExistsMessage || "An account with this email already exists. Please sign in or add a new role."}
              </p>

              {/* Existing Roles */}
              <div className="space-y-2 mb-4">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Continue with existing role:
                </h4>
                {existingUser.roles && existingUser.roles.length > 0 ? (
                  existingUser.roles.map((role: string) => (
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
                          <span className="font-medium">{t.signup.addClientRole}</span>
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
            </div>
          )}

          {/* Create Account Form */}
          {!existingUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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
