import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../store/hooks";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, addRole: addRoleToUser } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/job-listings";

  // Check for state passed from signup
  const locationState = location.state as any;
  const prefilledEmail = locationState?.email || "";
  const suggestedRole = locationState?.suggestedRole;
  const fromSignup = locationState?.fromSignup;
  const addRole = locationState?.addRole;
  const signupMessage = locationState?.message;

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      setError(
        "Google login will be implemented soon. Please use email/password."
      );
    } catch (err) {
      console.error(err);
      setError(t.login.googleLoginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Updated to navigate to ForgotPasswordOtp page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      console.log("Login successful");

      // Handle add role flow
      if (addRole && !loggedInUser.roles?.includes(addRole)) {
        try {
          await addRoleToUser(addRole);
          console.log(`Added ${addRole} role successfully`);

          // Navigate to the appropriate setup page for the new role
          if (addRole === 'freelancer') {
            navigate('/freelancer-profile-setup');
            setIsLoading(false);
            return;
          } else if (addRole === 'client') {
            navigate('/company-profile');
            setIsLoading(false);
            return;
          }
        } catch (roleError) {
          console.error('Error adding role:', roleError);
          setError('Failed to add role. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Determine redirect path based on user role and profile completion
      let finalRedirectPath = redirectPath;

      if (!searchParams.get("redirect")) {
        // Navigate based on role
        if (loggedInUser.currentRole === "client") {
          finalRedirectPath = "/dashboard/hiring";
        } else {
          // Default to freelancer dashboard for freelancer or other roles
          finalRedirectPath = "/dashboard/freelancer";
        }
      }

      navigate(finalRedirectPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.login.incorrectEmailOrPassword);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode
        ? "bg-gradient-to-br from-black via-gray-900 to-black-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900"
        }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[500px] h-[500px]  blur-3xl rounded-full top-1/4 left-1/4  ${darkMode ? "opacity-20" : "opacity-10"
            }`}
        />
        <div
          className={`absolute w-[300px] h-[300px]  blur-3xl rounded-full bottom-1/4 right-1/4  ${darkMode ? "opacity-15" : "opacity-8"
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
          Login
        </h2>

        {signupMessage && (
          <div className={`p-4 rounded-xl border mb-4 ${darkMode ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
            }`}>
            <p className={`text-sm ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
              {signupMessage}
            </p>
          </div>
        )}

        <button
          disabled
          className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-4 transition-all duration-300 opacity-50 cursor-not-allowed border ${darkMode
            ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
            : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
            }`}
        >
          <FcGoogle className="text-xl" /> {t.login.signInWithGoogle} {t.login.comingSoon}
        </button>

        <button
          disabled
          className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-6 transition-all duration-300 opacity-50 cursor-not-allowed border ${darkMode
            ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
            : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
            }`}
        >
          <FaApple className="text-xl" /> {t.login.signInWithApple} {t.login.comingSoon}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t.login.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${darkMode
              ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
              : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
              }`}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.login.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${darkMode
                ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
                : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
                }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className={`text-sm transition-colors duration-300 underline ${darkMode
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-cyan-600 hover:text-cyan-500"
                }`}
            >
              {t.login.forgotPassword}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </p>
          )}

          {resetMessage && (
            <p className="text-green-400 text-sm font-semibold bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              {resetMessage}
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          className={`text-center mt-6 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
            }`}
        >
          {t.login.dontHaveAccount}{" "}
          <a
            href={`/signup${location.search ? `?${location.search.split("?")[1]}` : ""
              }`}
            className={`underline transition-colors duration-300 ${darkMode
              ? "text-cyan-400 hover:text-cyan-300"
              : "text-cyan-600 hover:text-cyan-500"
              }`}
          >
            {t.login.signUp}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
