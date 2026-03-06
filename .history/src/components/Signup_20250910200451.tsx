import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useAppSelector } from "../store/hooks";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setError("Google sign-up failed: " + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
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
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-black-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900"
      }`}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-[500px] h-[500px] rounded-full top-1/4 left-1/4  ${
            darkMode ? "opacity-20" : "opacity-10"
          }`}
        />
        <div
          className={`absolute w-[300px] h-[300px]  rounded-full bottom-1/4 right-1/4  ${
            darkMode ? "opacity-15" : "opacity-8"
          }`}
        />
      </div>

      <div
        className={`relative z-10 backdrop-blur-xl border rounded-3xl shadow-2xl p-10 w-full max-w-md ${
          darkMode
            ? "bg-black/40 border-black-500/20 shadow-cyan-500/10"
            : "bg-white/80 border-cyan-500/10 shadow-cyan-500/5"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-6 text-center drop-shadow-lg ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`}
        >
          Create Account
        </h2>

        <button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 w-full bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-100 mb-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-xl" /> Sign up with Google
        </button>

        <button
          disabled
          className={`flex items-center justify-center gap-3 w-full font-medium py-3 px-4 rounded-xl mb-6 transition-all duration-300 opacity-50 cursor-not-allowed border ${
            darkMode
              ? "bg-gray-900/50 text-white hover:bg-gray-800/50 border-gray-700/50"
              : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-gray-300/50"
          }`}
        >
          <FaApple className="text-xl" /> Sign up with Apple (Coming Soon)
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
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${
                darkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                  : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${
                darkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                  : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${
              darkMode
                ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
            }`}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${
                darkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                  : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
              }`}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 ${
                darkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                  : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("freelancer")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  role === "freelancer"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : darkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50"
                    : "bg-gray-100/50 border-gray-300/50 text-gray-600 hover:border-gray-400/50"
                }`}
              >
                🚀 Hire Freelancers
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  role === "client"
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : darkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50"
                    : "bg-gray-100/50 border-gray-300/50 text-gray-600 hover:border-gray-400/50"
                }`}
              >
                💼 Find Work
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
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
            }`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p
          className={`text-center mt-6 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Already have an account?{" "}
          <a
            href="/login"
            className={`underline transition-colors duration-300 ${
              darkMode
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-cyan-600 hover:text-cyan-500"
            }`}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
