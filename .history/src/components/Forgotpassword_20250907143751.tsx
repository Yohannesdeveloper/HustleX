import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Eye, EyeOff } from "lucide-react";
import apiService from "../services/api";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await apiService.sendPasswordResetOTP(email);
      setSuccess("OTP sent successfully! Please check your email.");
      setStep("otp");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await apiService.verifyPasswordResetOTP(email, otp);
      setSuccess("OTP verified successfully! Please set your new password.");
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.resetPassword(email, otp, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await apiService.sendPasswordResetOTP(email);
      setSuccess("OTP resent successfully!");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Render Steps ----------------
  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-300 text-sm">
          Enter your email address and we'll send you an OTP to reset your
          password.
        </p>
      </div>

      <div className="relative">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 pl-12 rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
          required
        />
        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Verify OTP</h2>
        <p className="text-gray-300 text-sm">
          We've sent a 6-digit code to{" "}
          <span className="text-cyan-400 font-semibold">{email}</span>
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full p-4 text-center text-2xl tracking-widest rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
          maxLength={6}
          required
        />
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || isLoading}
          className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-4 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-300 text-sm">
          Create a new password for your account.
        </p>
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-4 pr-12 rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
          required
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-4 pr-12 rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
          required
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showConfirmPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );

  return (
    <div className="max-w-md mx-auto my-20 p-6 bg-gray-900/60 rounded-2xl shadow-xl">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-400 mb-4 text-center">{success}</p>}

      {step === "email" && renderEmailStep()}
      {step === "otp" && renderOTPStep()}
      {step === "reset" && renderResetStep()}

      <div className="mt-6 text-center">
        <button
          className="text-gray-400 hover:text-white text-sm flex items-center justify-center mx-auto gap-1"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
