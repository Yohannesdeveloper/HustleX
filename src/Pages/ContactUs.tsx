import React, { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaFacebook, FaLinkedin, FaInstagram, FaYoutube, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { getBackendApiUrlSync } from "../utils/portDetector";
import Footer from "../components/Footer";
import { ContactSEO } from "../components/SEO";

const ContactUs: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getBackendApiUrlSync()}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        alert(data.message);
      } else {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = data.errors.map((error: any) => error.msg).join('\n');
          alert(`${t.contactUs.validationFailed}\n${errorMessages}`);
        } else {
          alert(data.message || t.contactUs.failedToSendMessage);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(t.contactUs.failedToSendMessageCheckConnection);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone className="text-2xl" />,
      title: t.contactUs.phone,
      details: "+251 942927999",
      description: t.contactUs.monFriHours
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: t.contactUs.email,
      details: "HustleXet@gmail.com",
      description: t.contactUs.respondWithin24Hours
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: t.contactUs.office,
      details: "Addis Ababa, Ethiopia",
      // description: "Bole Medhanealem, Millennium Hall"
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: t.contactUs.businessHours,
      details: "Mon - Fri: 9AM - 6PM",
      description: t.contactUs.weekendSupportAvailable
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, name: "Facebook", color: "hover:text-blue-500", href: "#" },
    { icon: <FaXTwitter />, name: "X", color: "hover:text-cyan-500", href: "#" },
    { icon: <FaLinkedin />, name: "LinkedIn", color: "hover:text-blue-600", href: "#" },
    { icon: <FaInstagram />, name: "Instagram", color: "hover:text-pink-500", href: "#" },
    { icon: <FaYoutube />, name: "YouTube", color: "hover:text-red-600", href: "https://youtube.com/@HustleXet" },
    { icon: <FaTelegramPlane />, name: "Telegram", color: "hover:text-sky-500", href: "https://t.me/HustleXet" }
  ];

  return (
    <>
      <ContactSEO />
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
        <main className="max-w-7xl mx-auto px-6 py-12">
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Hero Section */}
                <motion.section
                  className="text-center mb-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    {t.contactUs.getInTouchWith}{" "}
                    <span className="block bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                      HustleX
                    </span>
                  </h2>
                  <p className={`text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {t.contactUs.haveQuestions}
                  </p>
                </motion.section>

                {/* Contact Info Cards */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        className={`p-6 rounded-2xl text-center ${darkMode
                            ? "bg-black border-white/10"
                            : "bg-white border-black/10"
                          } border shadow-xl`}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{
                          scale: 1.05,
                          y: -10,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
                        }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.8,
                          type: "spring"
                        }}
                      >
                        <motion.div
                          className={`mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent`}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          {info.icon}
                        </motion.div>
                        <h4 className="text-xl font-bold mb-2">{info.title}</h4>
                        <p className={`text-lg font-semibold mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                          {info.details}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                          {info.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Contact Form & Map Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <h3 className="text-3xl font-bold mb-6">{t.contactUs.sendUsMessage}</h3>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                          >
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                              }`}>
                              {t.contactUs.fullName} *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${darkMode
                                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                                }`}
                              placeholder={t.contactUs.yourFullName}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                              }`}>
                              {t.contactUs.emailAddress} *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${darkMode
                                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                                }`}
                              placeholder={t.contactUs.yourEmailPlaceholder}
                            />
                          </motion.div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                            {t.contactUs.subject} *
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${darkMode
                                ? "bg-black/50 border-gray-700/50 text-white"
                                : "bg-white/10 border-gray-300/50 text-black"
                              }`}
                          >
                            <option value="">{t.contactUs.selectSubject}</option>
                            <option value="general">{t.contactUs.generalInquiry}</option>
                            <option value="support">{t.contactUs.technicalSupport}</option>
                            <option value="partnership">{t.contactUs.partnership}</option>
                            <option value="billing">{t.contactUs.billingPayments}</option>
                            <option value="feedback">{t.contactUs.feedback}</option>
                            <option value="other">{t.contactUs.other}</option>
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                            {t.contactUs.message} *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-none ${darkMode
                                ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                                : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                              }`}
                            placeholder={t.contactUs.tellUsHowWeCanHelp}
                          />
                        </motion.div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${isSubmitting
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/25"
                            }`}
                          whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <FaPaperPlane className="inline mr-2" />
                          {isSubmitting ? t.contactUs.sending : t.contactUs.sendMessage}
                        </motion.button>
                      </form>
                    </motion.div>

                    {/* Map/Location Info */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-3xl font-bold mb-6">{t.contactUs.visitOurOffice}</h3>
                        <div className={`p-6 rounded-2xl ${darkMode
                            ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10"
                            : "bg-gradient-to-br from-cyan-50 to-blue-50 border-black/10"
                          } border`}>
                          <div className="rounded-lg overflow-hidden mb-4">
                            <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                              <iframe
                                title="HustleX Office Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d251887.0026268929!2d38.617789835665236!3d8.980603392672893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85d2f2fca0ed%3A0xc0b9a8ad1f2d5a1f!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1732470000000!5m2!1sen!2sus"
                                width="600"
                                height="450"
                                style={{ border: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xl font-semibold">{t.contactUs.hustleXHQ}</h4>
                            <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"
                              }`}>
                              {t.contactUs.officeLocationDescription}
                            </p>
                            <a
                              href="https://maps.google.com/?q=Addis+Ababa+Ethiopia"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                            >
                              {t.contactUs.openInGoogleMaps}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Social Media */}
                      <div>
                        <h4 className="text-xl font-semibold mb-4">{t.contactUs.followUs}</h4>
                        <div className="flex space-x-4">
                          {socialLinks.map((social, index) => (
                            <motion.a
                              key={social.name}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-3 rounded-full transition-all duration-300 ${darkMode
                                  ? "bg-white/10 hover:bg-white/20"
                                  : "bg-black/10 hover:bg-black/20"
                                } ${social.color}`}
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                              <span className="text-xl">{social.icon}</span>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section
                  className={`p-8 sm:p-12 rounded-2xl text-center ${darkMode
                      ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10"
                      : "bg-gradient-to-br from-cyan-50 to-blue-50 border-black/10"
                    } border`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    {t.contactUs.needQuickAnswers}
                  </h3>
                  <p className={`mb-8 text-lg max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {t.contactUs.checkOutFAQ}
                  </p>
                  <motion.button
                    className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${darkMode
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                        : "bg-cyan-600 hover:bg-cyan-700 text-white"
                      } shadow-lg`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/faq')}
                  >
                    {t.contactUs.visitFAQ}
                  </motion.button>
                </motion.section>
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

export default ContactUs;
