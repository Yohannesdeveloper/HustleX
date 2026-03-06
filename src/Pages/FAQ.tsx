import React, { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import Footer from "../components/Footer";
import { FAQSEO } from "../components/SEO";

const FAQ: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: t.faq.whatIsHustleX,
      answer: t.faq.whatIsHustleXAnswer
    },
    {
      question: t.faq.howDoIGetStartedAsFreelancer,
      answer: t.faq.howDoIGetStartedAsFreelancerAnswer
    },
    {
      question: t.faq.howDoIPostJobAsClient,
      answer: t.faq.howDoIPostJobAsClientAnswer
    },
    {
      question: t.faq.whatAreTheFees,
      answer: t.faq.whatAreTheFeesAnswer
    },
    {
      question: t.faq.whatCategoriesAvailable,
      answer: t.faq.whatCategoriesAvailableAnswer
    },
    {
      question: t.faq.howDoICommunicate,
      answer: t.faq.howDoICommunicateAnswer
    },
    {
      question: t.faq.whatIfNotSatisfied,
      answer: t.faq.whatIfNotSatisfiedAnswer
    },
    {
      question: t.faq.canIWorkInternationally,
      answer: t.faq.canIWorkInternationallyAnswer
    },
    {
      question: t.faq.isCustomerSupportAvailable,
      answer: t.faq.isCustomerSupportAvailableAnswer
    },
    {
      question: t.faq.ratePlatform,
      answer: t.faq.ratePlatformAnswer
    }
  ];

  return (
    <>
      <FAQSEO />
      <div
        className={`relative min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
          } ${darkMode ? "text-white" : "text-black"} font-inter`}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute w-[800px] h-[800px] ${darkMode
              ? "bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900"
              : "bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100"
              } ${darkMode ? "opacity-10" : "opacity-5"
              } blur-3xl rounded-full top-0 left-0 `}
          />
          <div
            className={`absolute w-[600px] h-[600px] ${darkMode
              ? "bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
              : "bg-gradient-to-br from-blue-100 via-purple-100"
              } ${darkMode ? "opacity-10" : "opacity-5"
              } blur-3xl rounded-full bottom-0 right-0 `}
          />
          <div
            className={`absolute w-[400px] h-[400px] ${darkMode
              ? "bg-gradient-to-br from-cyan-800 via-blue-800 to-purple-800"
              : "bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200"
              } ${darkMode ? "opacity-15" : "opacity-5"
              } blur-3xl rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <motion.header
            className={`sticky top-0 z-10 ${darkMode
              ? "bg-black/60 border-white/10"
              : "bg-white/60 border-black/10"
              } backdrop-blur-md`}
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          >
            <div className="max-w-7xl mx-auto px-6 py-5">
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-6 py-12">
            <AnimatePresence>
              {isLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Introduction */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                      {t.aboutUs.gotQuestions}
                    </h2>
                    <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl mx-auto`}>
                      {t.aboutUs.gotQuestionsDesc}
                    </p>
                  </motion.div>

                  {/* FAQ Items */}
                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <motion.div
                        key={index}
                        className={`rounded-2xl overflow-hidden ${darkMode
                          ? "bg-black border-white/10"
                          : "bg-white border-black/10"
                          } border shadow-lg`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <motion.button
                          onClick={() => toggleItem(index)}
                          className={`w-full px-6 py-5 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors duration-200 ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"
                            }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <h3 className="text-lg font-semibold pr-4">
                            {faq.question}
                          </h3>
                          <motion.div
                            animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown className={`text-xl ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {openItems.includes(index) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className={`px-6 pb-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                <p className="leading-relaxed">{faq.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Contact Section */}
                  <motion.div
                    className={`mt-16 p-8 rounded-2xl text-center ${darkMode
                      ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10"
                      : "bg-gradient-to-br from-cyan-50 to-blue-50 border-black/10"
                      } border`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <h3 className="text-2xl font-bold mb-4">
                      {t.aboutUs.stillHaveQuestions}
                    </h3>
                    <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {t.aboutUs.stillHaveQuestionsDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${darkMode
                          ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                          : "bg-cyan-600 hover:bg-cyan-700 text-white"
                          } shadow-lg`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/contact-us')}
                      >
                        {t.aboutUs.contactSupport}
                      </motion.button>
                      <motion.button
                        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${darkMode
                          ? "border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                          : "border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white"
                          }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/help-center')}
                      >
                        {t.aboutUs.visitHelpCenter}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default FAQ;
