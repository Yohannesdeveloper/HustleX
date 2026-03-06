import React, { useState, useRef } from "react";
import ApiService from "../services/api";
import { useNavigate } from "react-router-dom";

const ForgotPasswordOtp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
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
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 text-white">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          Forgot Password
        </h2>

        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mb-4 text-gray-300 text-center">Enter 6-digit OTP</p>
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
                  className="w-12 h-12 text-center text-black font-bold rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                />
              ))}
            </div>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-900/50 text-white border border-gray-700/50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
            />
            <button
              onClick={handleVerifyOtpAndReset}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Reset Password
            </button>
          </>
        )}

        {message && (
          <p className="text-green-400 text-center mt-4">{message}</p>
        )}
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordOtp;
