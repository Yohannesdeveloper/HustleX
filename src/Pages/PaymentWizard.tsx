import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { setLanguage, Language } from "../store/languageSlice";
import { FaCheck, FaMobileAlt, FaArrowLeft, FaGlobe } from "react-icons/fa";
import apiService from "../services/api";
import { useTranslation } from "../hooks/useTranslation";
import { getBackendUrlSync } from "../utils/portDetector";

const PaymentWizard: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [planId, setPlanId] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [transactionId, setTransactionId] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("telebirr");
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate("/signup?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    // Generate transaction ID
    const txId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTransactionId(txId);

    // Get plan and method from URL params
    const plan = searchParams.get("plan") || "basic";
    const method = searchParams.get("method") || "telebirr";
    const manualMethods = ["telebirr", "cbe"];
    setPlanId(plan);
    setSelectedMethod(manualMethods.includes(method) ? method : "telebirr");

    // Fetch plan details
    const fetchPlanDetails = async () => {
      try {
        const baseUrl = window.location.hostname.includes("devtunnels")
          ? `https://${window.location.hostname}`
          : process.env.NODE_ENV === "production"
            ? "https://your-domain.com"
            : getBackendUrlSync();
        const response = await fetch(`${baseUrl}/api/pricing/plans/${plan}`);
        const data = await response.json();
        setPlanDetails(data.plan);
      } catch (error) {
        console.error("Error fetching plan details:", error);
      }
    };
    fetchPlanDetails();
  }, [isAuthenticated, navigate, searchParams]);

  const steps = [
    { number: 1, label: t.payment.stepPhoneNumber, active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, label: t.payment.stepPaymentProcess, active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, label: t.payment.stepConfirmation, active: currentStep === 3, completed: currentStep > 3 },
  ];

  const handlePhoneNumberSubmit = async () => {
    if (!phoneNumber || !/^09\d{8}$/.test(phoneNumber)) {
      alert("Please enter a valid Telebirr phone number (09XXXXXXXX)");
      return;
    }

    setIsProcessing(true);

    try {
      // Send payment request to phone number via Santim Pay
      const amount = planDetails?.price || 0;
      const currency = planDetails?.currency || "ETB";

      const response = await apiService.sendPaymentRequest(phoneNumber, planId, amount, currency);

      // No alert, just move to next step
      // No alert, just move to next step
      console.log("Payment request sent:", response);

      // Move to payment processing step
      setCurrentStep(2);
      setIsProcessing(false);

    } catch (error: any) {
      console.error("Payment request error:", error);
      // We can keep this alert for errors, or show in UI. 
      // For now, let's keep it simple but maybe less intrusive in future.
      alert(`Failed to send payment request: ${error.response?.data?.message || error.message || "Please try again"}`);
      setIsProcessing(false);
    }
  };

  const handleManualConfirmation = async () => {
    setIsProcessing(true);
    try {
      // After user confirms on phone, subscribe to plan
      const response = await apiService.subscribeToPlan(planId, selectedMethod);

      if (response && response.message && response.message.includes("pending approval")) {
        setIsPendingApproval(true);
      }

      // Move to confirmation
      setCurrentStep(3);
      setIsProcessing(false);

      if (response && response.message && response.message.includes("pending approval")) {
        // Don't auto-redirect for pending approval
      } else {
        // Redirect after 5 seconds
        setTimeout(() => {
          navigate("/dashboard/hiring");
        }, 5000);
      }
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      alert(`Payment confirmation failed: ${error.message || "Please try again"}`);
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="bg-gray-800 h-12 flex items-center justify-between px-4">
        <button
          onClick={() => navigate("/pricing")}
          className="text-white hover:text-gray-300 flex items-center gap-2"
        >
          <FaArrowLeft />
          <span>{t.payment.backToPricing}</span>
        </button>
        <div className="flex items-center gap-2">
          <FaGlobe className="text-white" />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="bg-transparent text-white border-none outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="ti">ትግርኛ</option>
            <option value="om">Afan Oromo</option>
          </select>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Santim Pay Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-orange-500">PAY</span>
            <span className="text-orange-500">MENT</span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step.completed
                      ? "bg-orange-500 text-white"
                      : step.active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {step.completed ? (
                      <FaCheck className="text-white" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${step.active ? "text-orange-500 font-semibold" : "text-gray-600"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${step.completed || step.active ? "bg-orange-500" : "bg-gray-300"
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Transaction ID */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500">{transactionId}</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-6">
                <p className="text-gray-600 mb-4">{t.payment.selectBank || "Select your payment method"}</p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { id: "telebirr", name: "Telebirr", image: "/logos/telebirr.jpg" },
                    { id: "cbe", name: "CBE", image: "/logos/CBE-Birr-01.jpg" }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedMethod === method.id
                        ? `border-orange-500 bg-orange-50`
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 overflow-hidden`}>
                        <img
                          src={method.image}
                          alt={method.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{method.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  {selectedMethod === "telebirr" && (
                    <>
                      <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logos/telebirr.jpg" alt="Telebirr" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-2xl font-bold text-blue-900">Telebirr</span>
                    </>
                  )}
                  {selectedMethod === "cbe" && (
                    <>
                      <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logos/CBE-Birr-01.jpg" alt="CBE" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-2xl font-bold text-purple-900">CBE Birr</span>
                    </>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{t.payment.enterPhoneNumber}</p>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t.payment.enterPhoneNumberPlaceholder}
                  className="w-full max-w-md mx-auto px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handlePhoneNumberSubmit}
                disabled={!phoneNumber || phoneNumber.length !== 10}
                className={`w-full max-w-md py-3 px-6 rounded-lg font-semibold text-white transition-all ${phoneNumber && phoneNumber.length === 10
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {t.payment.continue}
              </button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">{t.payment.paymentRequestSent}</h2>
              <p className="text-gray-600 mb-2">
                {t.payment.paymentRequestSentTo} <strong>{phoneNumber}</strong>
              </p>

              <p className="text-sm text-gray-500 mb-8">
                {t.payment.waitingForConfirmation}
              </p>

              <button
                onClick={handleManualConfirmation}
                disabled={isProcessing}
                className={`w-full max-w-md py-3 px-6 rounded-lg font-semibold text-white transition-all ${isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
                  }`}
              >
                {isProcessing ? t.common.loading : t.payment.confirmPayment || "I have completed payment"}
              </button>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className={`w-20 h-20 ${isPendingApproval ? 'bg-orange-500' : 'bg-green-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {isPendingApproval ? (
                  <span className="text-white text-4xl font-bold">!</span>
                ) : (
                  <FaCheck className="text-white text-4xl" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {isPendingApproval ? "Pending Approval" : t.payment.paymentSuccessful}
              </h2>
              <p className="text-gray-600 mb-4">
                {isPendingApproval ? t.payment.paymentPendingApproval : t.payment.subscriptionActivated}
              </p>

              {isPendingApproval && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 mb-6 text-sm">
                  <p className="text-blue-800 mb-2">
                    <strong>Payment Pending:</strong><br />
                    Since this is a manual {selectedMethod === 'telebirr' ? 'Telebirr' : selectedMethod.toUpperCase()} payment, it requires approval.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500">{t.payment.redirectingToDashboard}</p>

              <button
                onClick={() => navigate("/dashboard/hiring")}
                className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </div>

        {/* Plan Summary */}
        {planDetails && currentStep < 3 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{planDetails.name}</span> -{" "}
              {planDetails.price.toLocaleString()} {planDetails.currency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentWizard;
