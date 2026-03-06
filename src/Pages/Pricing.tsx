import React from "react";
import { motion } from "framer-motion";
import { useAuth, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaRocket, FaCrown, FaGem } from "react-icons/fa";
import { useTranslation } from "../hooks/useTranslation";
import Footer from "../components/Footer";
import { PricingSEO } from "../components/SEO";

const Pricing: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const t = useTranslation();

  const pricingPlans = [
    {
      id: "free",
      name: t.pricing.freeTrial,
      price: "0",
      currency: "ETB",
      period: t.pricing.forever,
      description: t.pricing.perfectForGettingStarted,
      icon: <FaRocket className="text-3xl" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        t.pricing.postUpTo3JobsLifetime,
        t.pricing.multiPlatformPosting,
        t.pricing.browseFreelancerProfiles,
        t.pricing.basicMessaging,
        t.pricing.standardSupport,
        t.pricing.accessToJobListings,
      ],
      limitations: [],
      buttonText: t.pricing.getStarted,
      popular: false,
    },
    {
      id: "basic",
      name: t.pricing.basicPlan,
      price: "999",
      currency: "ETB",
      period: t.pricing.perMonth,
      description: t.pricing.forGrowingBusinesses,
      icon: <FaCrown className="text-3xl" />,
      color: "from-purple-500 to-pink-500",
      features: [
        t.pricing.postUpTo10JobsPerMonth,
        t.pricing.multiPlatformPosting,
        t.pricing.unlimitedFreelancerBrowsing,
        t.pricing.priorityMessaging,
        t.pricing.prioritySupport,
        t.pricing.advancedSearchFilters,
        t.pricing.jobAnalyticsDashboard,
        t.pricing.featuredJobListings,
      ],
      limitations: [],
      buttonText: t.pricing.choosePlan,
      popular: true,
    },
    {
      id: "premium",
      name: t.pricing.premiumPlan,
      price: "9,999",
      currency: "ETB",
      period: t.pricing.perMonth,
      description: t.pricing.forEnterpriseNeeds,
      icon: <FaGem className="text-3xl" />,
      color: "from-orange-500 to-red-500",
      features: [
        t.pricing.unlimitedJobPosts,
        t.pricing.multiPlatformPosting,
        t.pricing.unlimitedFreelancerAccess,
        t.pricing.premiumMessagingVideoCalls,
        t.pricing.dedicatedSupport,
        t.pricing.advancedAnalyticsInsights,
        t.pricing.featuredPromotedListings,
        t.pricing.customBrandingOptions,
        t.pricing.apiAccess,
        t.pricing.dedicatedAccountManager,
        t.pricing.earlyAccessToNewFeatures,
      ],
      limitations: [],
      buttonText: t.pricing.choosePlan,
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    console.log("Plan selected:", planId, "Auth status:", isAuthenticated, "Loading:", loading);

    if (loading) {
      console.log("Auth is still loading, ignoring click");
      return;
    }

    if (!isAuthenticated) {
      const redirectPath = planId === "free"
        ? "/signup"
        : `/payment-wizard?plan=${planId}&method=telebirr`;

      console.log("Not authenticated, redirecting to signup with path:", redirectPath);
      navigate(`/signup?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    // If already authenticated
    console.log("Authenticated, proceeding to destination");
    if (planId === "free") {
      navigate("/dashboard/freelancer");
    } else {
      navigate(`/payment-wizard?plan=${planId}&method=telebirr`);
    }
  };

  return (
    <>
      <PricingSEO />
      <div
        className={`relative min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
          }`}
      >
      {/* Background */}
      {darkMode ? (
        <div className="fixed inset-0 z-0 bg-black" />
      ) : (
        <div className="fixed inset-0 z-0 bg-white" />
      )}

      <div className="relative z-10 pt-20 sm:pt-24 pb-16">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-black"
              }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.pricing.chooseYourPlan}{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              {t.pricing.plan}
            </span>
          </motion.h1>
          <motion.p
            className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t.pricing.selectPerfectPlan}
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className={`relative rounded-2xl overflow-hidden ${plan.popular
                  ? darkMode
                    ? "bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50"
                    : "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500"
                  : darkMode
                    ? "bg-black/40 border border-white/10"
                    : "bg-white border border-black/10"
                  } shadow-2xl`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 text-center">
                    {t.pricing.mostPopular}
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4 mx-auto`}
                  >
                    {plan.icon}
                  </div>

                  {/* Plan Name */}
                  <h3
                    className={`text-2xl font-bold text-center mb-2 ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-4xl sm:text-5xl font-extrabold ${darkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                      >
                        {plan.currency}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {plan.period}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        <FaCheck
                          className={`mt-1 flex-shrink-0 ${plan.popular ? "text-purple-500" : "text-cyan-500"
                            }`}
                        />
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIdx) => (
                      <li key={limitIdx} className="flex items-start gap-2">
                        <FaTimes className="mt-1 flex-shrink-0 text-gray-500" />
                        <span
                          className={`text-sm line-through ${darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                        >
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 bg-gradient-to-r ${plan.color} hover:shadow-lg hover:shadow-${plan.color.split('-')[1]}-500/50`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {plan.buttonText}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-4xl mx-auto mt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2
            className={`text-3xl sm:text-4xl font-bold text-center mb-8 ${darkMode ? "text-white" : "text-black"
              }`}
          >
            {t.pricing.frequentlyAskedQuestions}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: t.pricing.canIChangePlansLater,
                a: t.pricing.canIChangePlansLaterAnswer,
              },
              {
                q: t.pricing.whatPaymentMethodsDoYouAccept,
                a: t.pricing.whatPaymentMethodsDoYouAcceptAnswer,
              },
              {
                q: t.pricing.isThereAContract,
                a: t.pricing.isThereAContractAnswer,
              },
              {
                q: t.pricing.doYouOfferRefunds,
                a: t.pricing.doYouOfferRefundsAnswer,
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                className={`p-4 sm:p-6 rounded-xl ${darkMode
                  ? "bg-black/40 border border-white/10"
                  : "bg-white border border-black/10"
                  }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
              >
                <h3
                  className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-black"
                    }`}
                >
                  {faq.q}
                </h3>
                <p
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default Pricing;
