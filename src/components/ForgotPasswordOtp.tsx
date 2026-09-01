import React, { useState, useRef } from "react";
import ApiService from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const ForgotPasswordOtp: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleSendOtp = async () => {
    try {
      setError(null);
      await ApiService.sendPasswordResetOTP(email);
      setMessage("OTP sent to your email");
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleChangeOtp = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndReset = async () => {
    try {
      const otpValue = otp.join("");
      if (otpValue.length !== 6) {
        setError("Please enter a 6-digit OTP");
        return;
      }
      setError(null);
      await ApiService.verifyPasswordResetOTP(email, otpValue);
      await ApiService.resetPassword(email, otpValue, newPassword);
      setMessage("Password reset successfully");
      setTimeout(() => navigate("/signup"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
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
            ? "bg-black/40 border-cyan-500/20 shadow-cyan-500/10"
            : "bg-white/80 border-cyan-500/10 shadow-cyan-500/5"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-6 text-center drop-shadow-lg ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`}
        >
          Forgot Password
        </h2>

        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                darkMode
                  ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
                  : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
              }`}
            />
            <button
              onClick={handleSendOtp}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                darkMode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
              }`}
            >
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p
              className={`mb-4 text-center ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Enter 6-digit OTP
            </p>
            <div className="flex justify-between mb-4 gap-2">
              {otp.map((value, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChangeOtp(e.target.value, i)}
                  onKeyDown={(e) => handleBackspace(e, i)}
                  ref={(el: HTMLInputElement | null) => {
                    inputsRef.current[i] = el;
                  }}
                  className={`w-12 h-12 text-center font-bold rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                    darkMode
                      ? "bg-gray-900/50 text-white border-gray-700/50"
                      : "bg-white/50 text-gray-900 border-gray-300/50"
                  }`}
                />
              ))}
            </div>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                darkMode
                  ? "bg-gray-900/50 text-white border-gray-700/50 placeholder:text-gray-400"
                  : "bg-white/50 text-gray-900 border-gray-300/50 placeholder:text-gray-500"
              }`}
            />
            <button
              onClick={handleVerifyOtpAndReset}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                darkMode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
              }`}
            >
              Reset Password
            </button>
          </>
        )}

        {message && (
          <p className="text-green-400 text-center mt-4 font-semibold bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-400 text-center mt-4 font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordOtp;
