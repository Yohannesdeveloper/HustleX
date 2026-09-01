import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { setLanguage, Language } from "../store/languageSlice";
import {
  FaCheck,
  FaArrowLeft,
  FaGlobe,
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import apiService from "../services/api";

const PaymentWizard: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [planId, setPlanId] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(
        "/signup?redirect=" +
          encodeURIComponent(window.location.pathname + window.location.search)
      );
      return;
    }

    const plan = searchParams.get("plan") || "basic";
    setPlanId(plan);

    const fetchPlanDetails = async () => {
      try {
        const { getBackendUrlSync } = await import("../utils/portDetector");
        const baseUrl = getBackendUrlSync();
        const response = await fetch(`${baseUrl}/api/pricing/plans/${plan}`);
        const data = await response.json();
        setPlanDetails(data.plan);
      } catch (error) {
        console.error("Error fetching plan details:", error);
      }
    };
    fetchPlanDetails();
  }, [isAuthenticated, navigate, searchParams]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB");
      return;
    }

    setErrorMessage("");
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptFile(null);
    setReceiptPreview(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      setErrorMessage("Please upload your Telebirr receipt");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      // Step 1: Upload receipt image
      const uploadResult = await apiService.uploadReceipt(receiptFile);
      const receiptUrl = uploadResult.fileUrl;

      // Step 2: Subscribe with the receipt URL (Telebirr => pending_approval)
      await apiService.subscribeToPlan(planId, "telebirr", receiptUrl);

      // Move to confirmation step
      setIsSubmitted(true);
      setCurrentStep(2);
    } catch (error: any) {
      console.error("Receipt upload error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit receipt. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  if (!isAuthenticated) {
    return null;
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
          <span>Back to Pricing</span>
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
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <img
              src="/logos/telebirr.jpg"
              alt="Telebirr"
              className="w-14 h-14 rounded-lg object-contain"
            />
            <h1 className="text-3xl font-bold text-blue-900">
              Telebirr Payment
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Upload your Telebirr payment receipt to activate your subscription
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { number: 1, label: "Upload Receipt" },
              { number: 2, label: "Confirmation" },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      currentStep > step.number
                        ? "bg-green-500 text-white"
                        : currentStep === step.number
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <FaCheck className="text-white" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      currentStep === step.number
                        ? "text-blue-600 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Step 1: Upload Receipt */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Plan Summary */}
              {planDetails && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Selected Plan
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {planDetails.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        {planDetails.price.toLocaleString()}{" "}
                        {planDetails.currency}
                      </p>
                      <p className="text-xs text-blue-500">{planDetails.period}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  Payment Instructions
                </h2>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>
                    Open your <strong>Telebirr</strong> app
                  </li>
                  <li>
                    Send{" "}
                    <strong>
                      {planDetails
                        ? `${planDetails.price.toLocaleString()} ${planDetails.currency}`
                        : "the payment"}
                    </strong>{" "}
                    to the HustleX account
                  </li>
                  <li>Take a screenshot of the payment confirmation receipt</li>
                  <li>Upload the receipt image below</li>
                </ol>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />

                {!receiptPreview ? (
                  <label
                    htmlFor="receipt-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      darkMode
                        ? "border-gray-600 hover:border-blue-500 bg-gray-900"
                        : "border-gray-300 hover:border-blue-500 bg-gray-50"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload receipt image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF, WebP (max 10MB)
                    </p>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-48 object-contain bg-gray-50 rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <FaCheck />
                      <span>{receiptFile?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!receiptFile || isUploading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  receiptFile && !isUploading
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading & Submitting...
                  </>
                ) : (
                  "Submit Receipt for Approval"
                )}
              </button>
            </motion.div>
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl font-bold">!</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Receipt Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your Telebirr payment receipt has been submitted for review.
                Your subscription will be activated once approved by our team.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm">
                <p className="text-orange-800">
                  <strong>What happens next?</strong>
                  <br />
                  Our team will verify your receipt within 24 hours. You'll
                  receive an email notification once your subscription is
                  approved and activated.
                </p>
              </div>

              {planDetails && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <span className="font-semibold">{planDetails.name}</span> —{" "}
                  {planDetails.price.toLocaleString()} {planDetails.currency}
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard/hiring")}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentWizard;
