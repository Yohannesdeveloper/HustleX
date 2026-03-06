import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Briefcase, Users } from "lucide-react";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import Footer from "../components/Footer";
import { HowItWorksSEO } from "../components/SEO";

const HowItWorks: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      title: t.howItWorks.steps.step1.title,
      description: t.howItWorks.steps.step1.desc,
    },
    {
      title: t.howItWorks.steps.step2.title,
      description: t.howItWorks.steps.step2.desc,
    },
    {
      title: t.howItWorks.steps.step3.title,
      description: t.howItWorks.steps.step3.desc,
    },
    {
      title: t.howItWorks.steps.step4.title,
      description: t.howItWorks.steps.step4.desc,
    },
  ];

  const testimonials = [
    t.testimonials.user1,
    t.testimonials.user2,
  ];

  const faqs = [
    {
      question: t.faq.howDoIGetStartedAsFreelancer,
      answer: t.faq.howDoIGetStartedAsFreelancerAnswer,
    },
    {
      question: t.faq.whatAreTheFees,
      answer: t.faq.whatAreTheFeesAnswer,
    },
    {
      question: t.faq.ratePlatform,
      answer: t.faq.ratePlatformAnswer,
    },
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    const element = document.getElementById(`step-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <HowItWorksSEO />
      <div
        className={`relative min-h-screen transition-colors duration-300 ${darkMode
            ? "bg-black"
            : "bg-white"
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
              : "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
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

      <div className="relative z-10 flex flex-col items-center px-6 py-16">
        <h1
          className={`text-5xl font-extrabold mb-12 drop-shadow-lg text-center ${darkMode ? "text-cyan-400" : "text-cyan-600"
            }`}
        >
          {t.howItWorks.title}
        </h1>

        {/* Step Indicators */}
        <div className="flex justify-center gap-4 mb-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${activeStep === index
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black"
                  : darkMode
                    ? "bg-gray-800/50 text-white hover:bg-cyan-500/20 hover:text-cyan-400"
                    : "bg-gray-200/50 text-black hover:bg-cyan-500/10 hover:text-cyan-600"
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">
          {steps.map((step, idx) => (
            <div
              key={idx}
              id={`step-${idx}`}
              className={`${darkMode
                  ? "bg-black/40 border-cyan-500/20"
                  : "bg-white/40 border-cyan-500/10"
                } backdrop-blur-xl p-6 rounded-3xl shadow-lg border ${activeStep === idx ? "border-cyan-400" : ""
                } flex flex-col items-start hover:shadow-cyan-500/20 transition-all duration-300`}
            >
              <h2
                className={`text-2xl font-bold mb-3 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
              >
                {step.title}
              </h2>
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="mt-16 flex flex-col md:flex-row gap-6">
          <Link
            to="/job-listings"
            className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-500 ${darkMode ? "text-white" : "text-black"
              } font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 flex items-center gap-2`}
          >
            <Briefcase className="w-5 h-5" />
            Find Jobs
          </Link>
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate("/post-job");
              } else {
                navigate("/signup?redirect=/post-job");
              }
            }}
            className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 ${darkMode ? "text-white" : "text-black"
              } font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 hover:scale-105 flex items-center gap-2`}
          >
            <Users className="w-5 h-5" />
            Post a Job
          </button>
        </div>

        {/* Testimonial Section */}
        <div className="mt-16 max-w-6xl w-full">
          <h2
            className={`text-3xl font-bold mb-8 text-center ${darkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
          >
            {t.testimonials.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl p-6 rounded-3xl shadow-lg border hover:shadow-cyan-500/20 transition-all duration-300`}
              >
                <p
                  className={`text-lg mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    <span className="font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-6xl w-full">
          <h2
            className={`text-3xl font-bold mb-8 text-center ${darkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
          >
            {t.helpCenter.frequentlyAskedQuestions}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`${darkMode
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-white/40 border-cyan-500/10"
                  } backdrop-blur-xl p-4 rounded-3xl border`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`w-full flex justify-between items-center text-left text-lg font-medium ${darkMode
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-cyan-600 hover:text-cyan-500"
                    }`}
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp
                      className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                    />
                  )}
                </button>
                {openFaq === idx && (
                  <div
                    className={`${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default HowItWorks;
