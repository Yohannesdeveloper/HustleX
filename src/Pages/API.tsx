import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { FaCode, FaCheck, FaCopy, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { getBackendUrlSync } from "../utils/portDetector";

const API: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState<boolean>(false);

  useEffect(() => {
    // Check token directly first for immediate redirect
    const token = localStorage.getItem("token");
    
    // If no token, redirect immediately
    if (!token) {
      navigate("/signup?redirect=/api", { replace: true });
      return;
    }

    // Wait for auth check to complete
    if (authLoading) {
      return;
    }

    // After auth check completes, verify authentication
    setHasCheckedAuth(true);
    
    // If not authenticated after loading completes, redirect
    if (!isAuthenticated) {
      navigate("/signup?redirect=/api", { replace: true });
      return;
    }

    // User is authenticated, get API key
    setApiKey(token);
    setLoading(false);
  }, [isAuthenticated, authLoading, navigate]);

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === "production") {
      return "https://your-domain.com";
    }
    return getBackendUrlSync();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode("api-key");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Check token immediately on render
  const token = localStorage.getItem("token");
  
  // If no token, redirect immediately using Navigate component
  if (!token) {
    return <Navigate to="/signup?redirect=/api" replace />;
  }
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div
        className={`relative min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-black" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // If auth check completed and user is not authenticated, redirect
  if (hasCheckedAuth && !isAuthenticated) {
    return <Navigate to="/signup?redirect=/api" replace />;
  }

  const maskedApiKey = apiKey
    ? `${apiKey.substring(0, 8)}${"*".repeat(Math.max(0, apiKey.length - 16))}${apiKey.substring(apiKey.length - 8)}`
    : "";

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      {/* Background */}
      {darkMode ? (
        <div className="fixed inset-0 z-0 bg-black" />
      ) : (
        <div className="fixed inset-0 z-0 bg-white" />
      )}

      <div className="relative z-10 pt-20 sm:pt-24 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 ${
              darkMode ? "text-white" : "text-black"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FaKey className="inline mr-4 text-cyan-500" />
            API{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Key
            </span>
          </motion.h1>
          <motion.p
            className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your secret API key for accessing HustleX platform
          </motion.p>
        </motion.div>

        {/* API Key Display */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className={`rounded-2xl overflow-hidden ${
              darkMode
                ? "bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-2 border-cyan-500/50"
                : "bg-gradient-to-br from-cyan-50 to-purple-50 border-2 border-cyan-500"
            } shadow-2xl`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaCode className="text-3xl text-cyan-500" />
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  Your Secret API Key
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Loading API key...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      API Key
                    </label>
                    <div className="relative">
                      <div
                        className={`rounded-lg p-4 pr-24 overflow-x-auto ${
                          darkMode ? "bg-gray-900" : "bg-gray-100"
                        } border-2 ${
                          darkMode ? "border-cyan-500/50" : "border-cyan-500"
                        }`}
                      >
                        <pre className={`text-sm sm:text-base font-mono ${
                          darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}>
                          <code>
                            {showApiKey ? apiKey : maskedApiKey}
                          </code>
                        </pre>
                      </div>
                      <div className="absolute right-2 top-2 flex gap-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className={`p-2 rounded-lg transition-all ${
                            darkMode
                              ? "hover:bg-white/10 text-gray-400 hover:text-white"
                              : "hover:bg-black/5 text-gray-600 hover:text-black"
                          }`}
                          title={showApiKey ? "Hide API Key" : "Show API Key"}
                        >
                          {showApiKey ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey)}
                          className={`p-2 rounded-lg transition-all ${
                            darkMode
                              ? "hover:bg-white/10 text-gray-400 hover:text-white"
                              : "hover:bg-black/5 text-gray-600 hover:text-black"
                          }`}
                          title="Copy API Key"
                        >
                          {copiedCode === "api-key" ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaCopy />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg p-4 ${
                      darkMode ? "bg-yellow-900/20 border border-yellow-500/30" : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <p className={`text-sm ${
                      darkMode ? "text-yellow-300" : "text-yellow-800"
                    }`}>
                      <strong>⚠️ Important:</strong> Keep your API key secure and never share it publicly. 
                      This key provides full access to your account.
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      How to Use Your API Key
                    </h3>
                    <div className={`rounded-lg p-4 overflow-x-auto ${
                      darkMode ? "bg-gray-900" : "bg-gray-100"
                    }`}>
                      <pre className={`text-xs sm:text-sm font-mono ${
                        darkMode ? "text-gray-300" : "text-gray-800"
                      }`}>
                        <code>{`curl -X GET ${getApiBaseUrl()}/api/jobs \\
  -H "Authorization: Bearer ${apiKey ? (showApiKey ? apiKey : maskedApiKey) : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json"`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default API;
