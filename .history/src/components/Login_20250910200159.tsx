import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useAppSelector } from "../store/hooks";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/job-listings";

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      setError(
        "Google login will be implemented soon. Please use email/password."
      );
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google");
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
      await login(email, password);
      console.log("Login successful");
      navigate(redirectPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Incorrect email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[500px] h-[500px]  blur-3xl rounded-full top-1/4 left-1/4  ${
            darkMode ? "opacity-20" : "opacity-10"
          }`}
        />
        <div
          className={`absolute w-[300px] h-[300px]  blur-3xl rounded-full bottom-1/4 right-1/4  ${
            darkMode ? "opacity-15" : "opacity-8"
          }`}
        />
      </div>

      <div
        className={`relative z-10 backdrop-blur-xl border rounded-3xl shadow-2xl p-10 w-full max-w-md ${
          darkMode
            ? "bg-black/40 bg-black/40 shadow-cyan-500/10"
            : "bg-white/80 bg-black/40 shadow-cyan-500/5"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-6 text-center drop-shadow-lg ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`}
        >
          Login
        </h2>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 w-full bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-100 mb-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-xl" /> Sign in with Google
        </button>

        <button
          disabled
          className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-6 transition-all duration-300 opacity-50 cursor-not-allowed border ${
            darkMode
              ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
              : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
          }`}
        >
          <FaApple className="text-xl" /> Sign in with Apple (Coming Soon)
        </button>

        <div
          className={`my-6 text-center relative ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <div className="absolute inset-0 flex items-center">
            <div
              className={`w-full border-t ${
                darkMode ? "border-gray-600/50" : "border-gray-300/50"
              }`}
            ></div>
          </div>
          <div
            className={`relative px-4 ${
              darkMode ? "bg-black/40" : "bg-white/80"
            }`}
          >
            or use your email
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
              darkMode
                ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
                : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
            }`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
              darkMode
                ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
                : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
            }`}
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className={`text-sm transition-colors duration-300 underline ${
                darkMode
                  ? "text-cyan-400 hover:text-cyan-300"
                  : "text-cyan-600 hover:text-cyan-500"
              }`}
            >
              Forgot Password?
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
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          className={`text-center mt-6 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Don't have an account?{" "}
          <a
            href={`/signup${
              location.search ? `?${location.search.split("?")[1]}` : ""
            }`}
            className={`underline transition-colors duration-300 ${
              darkMode
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-cyan-600 hover:text-cyan-500"
            }`}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
