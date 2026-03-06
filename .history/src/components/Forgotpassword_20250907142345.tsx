import React, { useState } from "react";
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
  React.useEffect(() => {
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
      const response = await apiService.sendPasswordResetOTP(email);
      setSuccess("OTP sent successfully! Please check your email.");
      setStep("otp");
      setResendCooldown(60); // 60 second cooldown
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
      const response = await apiService.verifyPasswordResetOTP(email, otp);
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
      const response = await apiService.resetPassword(email, otp, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
          placeholder="Confirm New Password"
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

      <div className="text-xs text-gray-400 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li className={newPassword.length >= 6 ? "text-green-400" : ""}>
            At least 6 characters
          </li>
          <li
            className={
              newPassword === confirmPassword && newPassword
                ? "text-green-400"
                : ""
            }
          >
            Passwords match
          </li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={
          isLoading || newPassword !== confirmPassword || newPassword.length < 6
        }
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 px-4 text-white">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4 animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-15 blur-3xl rounded-full bottom-1/4 right-1/4 animate-pulse" />
      </div>

      <div className="relative z-10 bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() =>
            step === "email"
              ? navigate("/login")
              : setStep(step === "otp" ? "email" : "otp")
          }
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">
            {step === "email" ? "Back to Login" : "Back"}
          </span>
        </button>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                step === "email" ? "bg-cyan-400" : "bg-cyan-400"
              }`}
            />
            <div
              className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                ["otp", "reset"].includes(step) ? "bg-cyan-400" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                step === "otp"
                  ? "bg-cyan-400"
                  : ["otp", "reset"].includes(step)
                  ? "bg-cyan-400"
                  : "bg-gray-600"
              }`}
            />
            <div
              className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                step === "reset" ? "bg-cyan-400" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                step === "reset" ? "bg-cyan-400" : "bg-gray-600"
              }`}
            />
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-sm font-semibold">{success}</p>
          </div>
        )}

        {/* Render current step */}
        {step === "email" && renderEmailStep()}
        {step === "otp" && renderOTPStep()}
        {step === "reset" && renderResetStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;
