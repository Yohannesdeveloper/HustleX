import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";

import { setLanguage, type Language } from "../store/languageSlice";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import FloatingChatBot from "../components/FloatingChatBot";
import FloatingDarkModeToggle from "../components/FloatingDarkModeToggle";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../store/hooks";
import { HomeSEO } from "../components/SEO";

// Import video
import howItWorksVideo from "./videos/HowItWorks.mp4";

// Essential icons only
import { FaBars, FaTimes, FaUser, FaGlobe } from "react-icons/fa";

// Import image
import heroBackground from "../Images/Herobg.jpg";
import avatar1 from "../Images/Freelancers/Yohannes.png";
import avatar2 from "../Images/Freelancers/Samuel.png";
import avatar3 from "../Images/Freelancers/messie.png";
import avatar4 from "../Images/Freelancers/Dagi.png";
import avatar5 from "../Images/testimonials/Messay.jpg";
import beuLogo from "../assets/logos/beu.png";
// Functional icons
import {
  FaCode,
  FaPenNib,
  FaBullhorn,
  FaMobileAlt,
  FaRegEnvelope,
  FaComments,
  FaSuitcase,
  FaUserTie,
  FaGlobeAfrica,
  FaSearch,
  FaShieldAlt,
  FaLayerGroup,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
  FaRocket,
  FaStar,
  FaHeart,
  FaAward,
  FaRobot,
  FaVideo,
  FaShoppingCart,
  FaHeadset,
  FaHeartbeat,
  FaBalanceScale,
  FaBuilding,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const t = useTranslation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const [userRole, setUserRole] = useState<"freelancer" | "client" | "guest">(
    "guest"
  );

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "am", name: "አማርኛ", nativeName: "አማርኛ" },
    { code: "ti", name: "ትግርኛ", nativeName: "ትግርኛ" },
    { code: "om", name: "Oromoo", nativeName: "Afaan Oromoo" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);



  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
    setLanguageMenuOpen(false);
  };

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };

    if (languageMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageMenuOpen]);

  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full opacity-30"
      animate={{
        x: [0, Math.random() * 50 - 25],
        y: [0, Math.random() * 50 - 25],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 3,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  const logos: string[] = [
    "/logos/company1.png",
    "/logos/Airlines.png",
    "/logos/gift.png",
    "/logos/AAU.png",
    beuLogo,

  ];

  return (
    <>
      <HomeSEO />
      <div
        className={`relative overflow-hidden ${darkMode ? "bg-black" : "bg-white"
          }`}
      >
      {/* Background */}
      {darkMode ? (
        <div className="fixed inset-0 z-0 bg-black" />
      ) : (
        <div className="fixed inset-0 z-0 bg-white" />
      )}

      <AnimatePresence>
        {isLoaded && (
          <>
            {/* Header */}
            <motion.header
              className={`absolute top-0 left-0 right-0 z-40 min-h-[52px] ${darkMode
                ? "border-black/30 bg-black/95"
                : "border-black/10 bg-white/95"
                } border-b shadow-2xl backdrop-blur-sm`}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 min-h-[52px]">
                {/* Logo - Left (never shrinks) */}
                <motion.h1
                  className={`flex-shrink-0 text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight cursor-pointer transition duration-300 flex items-center group`}
                  whileHover={{
                    scale: 1.05,
                  }}
                  onClick={() => {
                    navigate("/");
                    setMenuOpen(false);
                  }}
                >
                  <span className={`transition-all duration-300 ${darkMode ? "text-white" : "text-black"}`}>
                    Hustle
                  </span>

                  <span
                    className="text-cyan-500 transition-all duration-300"
                    style={{
                      filter: 'drop-shadow(0 0 0px rgba(6, 182, 212, 0))',
                      transition: 'filter 0.3s ease, text-shadow 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.5))';
                      e.currentTarget.style.textShadow = '0 0 10px rgba(6, 182, 212, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(6, 182, 212, 0))';
                      e.currentTarget.style.textShadow = 'none';
                    }}
                  >
                    X
                  </span>
                </motion.h1>

                {/* Desktop nav - in flow, scrollable at zoom to prevent overlap */}
                <nav className="hidden xl:flex flex-1 min-w-0 justify-center items-center gap-1 xl:gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'thin' }}>
                  <div className="flex items-center gap-1 xl:gap-2 flex-nowrap">
                    {[
                      { to: "/", label: t.nav.home, shortLabel: t.nav.home, icon: null },
                      { to: "/about-us", label: t.nav.aboutUs, shortLabel: t.nav.aboutUs, icon: null },
                      { to: "/job-listings", label: t.nav.exploreJobs, icon: <FaSearch />, shortLabel: t.nav.exploreJobs },
                      { to: "/pricing", label: t.nav.pricing, shortLabel: t.nav.pricing, icon: null },
                      { to: "/blog", label: t.nav.blog, shortLabel: t.nav.blog, icon: null },
                      { to: "/faq", label: t.nav.faq, shortLabel: t.nav.faq, icon: null },
                      { to: "/HowItWorks", label: t.nav.howItWorks, shortLabel: t.nav.howItWorks, icon: null },
                      { to: "/contact-us", label: t.nav.contact, shortLabel: t.nav.contact, icon: null },
                    ].map((link, idx) => (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex-shrink-0"
                      >
                        <Link
                          to={link.to}
                          className={`flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-full transition-all duration-300 whitespace-nowrap text-[10px] xl:text-xs ${darkMode
                            ? "text-white hover:bg-white/10"
                            : "text-black hover:bg-black/5"
                            }`}
                        >
                          {link.icon && <span className="w-2.5 h-2.5 flex-shrink-0">{link.icon}</span>}
                          <span className="hidden xl:inline">{link.label}</span>
                          <span className="xl:hidden">{link.shortLabel || link.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Tablet nav - in flow */}
                <nav className="hidden flex-1 min-w-0 justify-center items-center gap-1.5 flex-nowrap overflow-x-auto py-1" style={{ scrollbarWidth: 'thin' }} aria-hidden="true">
                  {[
                    { to: "/", label: "Home" },
                    { to: "/job-listings", label: "Jobs", icon: <FaSearch /> },
                    { to: "/blog", label: "Blog" },
                  ].map((link, idx) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0"
                    >
                      <Link
                        to={link.to}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all duration-300 whitespace-nowrap text-[10px] ${darkMode
                          ? "text-white hover:bg-white/10"
                          : "text-black hover:bg-black/5"
                          }`}
                      >
                        {link.icon && <span className="w-2.5 h-2.5">{link.icon}</span>}
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Right side: guest buttons (desktop) + dark mode toggle + hamburger (never shrinks) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {/* Guest buttons - desktop only */}
                  {userRole === "guest" && (
                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={() =>
                          navigate("/signup?redirect=/job-listings")
                        }
                        className="px-4 py-1.5 text-xs rounded-full font-semibold shadow-md transition duration-300 bg-cyan-600 text-white hover:bg-cyan-700"
                      >
                        {t.nav.logIn}
                      </button>
                      <button
                        onClick={() =>
                          navigate("/signup?redirect=/job-listings")
                        }
                        className="px-4 py-1.5 text-xs rounded-full font-semibold shadow-md transition duration-300 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white"
                      >
                        {t.nav.signUp}
                      </button>
                    </div>
                  )}

                  {/* Language Selector */}
                  <div className="relative" ref={languageMenuRef}>
                    <motion.button
                      onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-300 ${darkMode
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/5 hover:bg-black/10 text-black"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Select language"
                    >
                      <FaGlobe className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs font-medium">
                        {currentLanguage.nativeName}
                      </span>
                      <span className="sm:hidden text-xs font-medium">
                        {currentLanguage.code.toUpperCase()}
                      </span>
                    </motion.button>

                    {/* Language Dropdown */}
                    <AnimatePresence>
                      {languageMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className={`absolute right-0 top-full mt-1.5 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[140px] ${darkMode
                            ? "bg-gray-900 border border-gray-700"
                            : "bg-white border border-gray-200"
                            }`}
                        >
                          {languages.map((lang) => (
                            <motion.button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between transition-colors ${language === lang.code
                                ? darkMode
                                  ? "bg-cyan-500/20 text-cyan-400"
                                  : "bg-cyan-50 text-cyan-600"
                                : darkMode
                                  ? "text-white hover:bg-gray-800"
                                  : "text-gray-700 hover:bg-gray-50"
                                }`}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-[10px]">{lang.nativeName}</span>
                                <span
                                  className={`text-[9px] ${darkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                                >
                                  {lang.name}
                                </span>
                              </div>
                              {language === lang.code && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`w-1 h-1 rounded-full ${darkMode ? "bg-cyan-400" : "bg-cyan-600"
                                    }`}
                                />
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Dark mode quick toggle + attached profile/menu */}
                  <div className="flex items-center gap-2">


                    {/* Attached menu with profile + dark mode */}
                    <div className="flex items-center">
                      <FloatingDarkModeToggle showProfileOption={false} />
                    </div>
                  </div>


                  {/* Hamburger for mobile */}
                  <motion.button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="xl:hidden text-xl p-2 rounded-full focus:outline-none bg-black/40"
                    aria-label="Toggle menu"
                  >
                    <AnimatePresence mode="wait">
                      {menuOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                        >
                          <FaTimes
                            className={`${darkMode ? "text-white" : "text-black"
                              }`}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="open"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                        >
                          <FaBars
                            className={`${darkMode ? "text-white" : "text-black"
                              }`}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Mobile nav menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.nav
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`xl:hidden backdrop-blur-2xl ${darkMode ? "bg-black/80" : "bg-white/80"
                      } border-t border-black/20`}
                  >
                    <ul className="flex flex-col gap-1.5 p-4">
                      {[
                        { to: "/", label: t.nav.home },
                        {
                          to: "/job-listings",
                          label: t.nav.exploreJobs,
                          icon: <FaSearch />,
                        },
                        { to: "/about-us", label: t.nav.aboutUs },
                        { to: "/Blog", label: t.nav.blog },
                        { to: "/contact-us", label: t.nav.contact },
                        { to: "/faq", label: t.nav.faq },
                        {
                          to: "/HowItWorks",
                          label: t.nav.howItWorks,
                          icon: null,
                        },
                        { to: "/pricing", label: t.nav.pricing, icon: null },
                      ].map((link, idx) => (
                        <motion.li
                          key={link.to}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Link
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                              }`}
                          >
                            {link.icon && <span className="w-3.5 h-3.5">{link.icon}</span>}
                            {link.label}
                          </Link>
                        </motion.li>
                      ))}

                      {/* Language Selector in Mobile Menu */}
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="border-t border-gray-300/20 pt-3 mt-2"
                      >
                        <div className="px-3 py-1.5">
                          <p
                            className={`text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                          >
                            {t.common.language}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {languages.map((lang) => (
                              <motion.button
                                key={lang.code}
                                onClick={() => {
                                  handleLanguageChange(lang.code);
                                  setMenuOpen(false);
                                }}
                                className={`px-2 py-1.5 rounded-lg text-xs transition-all ${language === lang.code
                                  ? darkMode
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "bg-cyan-50 text-cyan-600 border border-cyan-200"
                                  : darkMode
                                    ? "text-white hover:bg-white/10 border border-gray-700"
                                    : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                                  }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="text-left">
                                  <div className="font-medium text-xs">{lang.nativeName}</div>
                                  <div
                                    className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"
                                      }`}
                                  >
                                    {lang.name}
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.li>

                      {/* Guest buttons inside mobile menu */}
                      {userRole === "guest" && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                navigate("/signup?redirect=/homefinal");
                                setMenuOpen(false);
                              }}
                              className="w-full px-4 py-1.5 text-sm rounded-full font-semibold shadow-md transition duration-300 bg-cyan-600 text-white hover:bg-cyan-700"
                            >
                              {t.nav.logIn}
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                navigate("/signup");
                                setMenuOpen(false);
                              }}
                              className="w-full px-4 py-1.5 text-sm rounded-full font-semibold shadow-md transition duration-300 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white"
                            >
                              {t.nav.signUp}
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </motion.nav>
                )}
              </AnimatePresence>
            </motion.header>

            {/* Hero Section - top padding clears fixed header at 125%-150% zoom */}
            <section className="min-h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden pt-[52px] sm:pt-[56px]">
              <motion.div
                className="w-full h-screen relative"
              >
                {/* Full Screen img */}
                <img
                  src={heroBackground}
                  alt="Hero Background"
                  className="absolute inset-0 w-full h-full object-contain z-0"
                  style={{ objectPosition: '90% 75%', transform: 'translateY(5%)' }}
                />
                {/* Video Overlay for Text Readability*/}
                <div className="absolute inset-0 bg-black/3 z-20"></div>
                {/* Text Content */}
                <div className="relative z-30 px-4 sm:px-8 md:px-10 lg:px-16 xl:px-10 pt-16 sm:pt-20 md:pt-24 pb-7 sm:pb-12 md:pb-27">
                  <motion.h2
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 md:mb-10 leading-tight max-w-4xl text-left ${darkMode ? "text-white" : "text-black"
                      }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    "{t.hero.title}
                    <br />
                    <span className="text-cyan-500">
                      {t.hero.titleHighlight}
                    </span>"
                  </motion.h2>

                  <motion.p
                    className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl text-left ${darkMode ? "text-white/90" : "text-black/90"
                      }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    {t.hero.subtitle}
                    <br className="hidden md:block" />
                    <span
                      className={`font-bold ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      {" "}{t.hero.subtitleHighlight}
                    </span>
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    <motion.button
                      onClick={() =>
                        navigate("/signup?redirect=/job-listings")
                      }
                      className="px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-5 md:py-6 rounded-full text-white font-bold text-base sm:text-lg md:text-xl shadow-2xl transition-all duration-300 relative overflow-hidden group bg-cyan-600 hover:bg-cyan-700 hover:shadow-cyan-500/30 w-full sm:w-auto"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        <FaRocket className="text-sm sm:text-base md:text-lg" />
                        {t.hero.getStarted}
                      </span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>


                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* Company Logos Marquee */}
            <motion.section
              className={`${darkMode ? "bg-black/40" : "bg-white/70"
                } py-16 backdrop-blur-sm relative z-10 overflow-hidden`}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[500px] h-[500px] ${darkMode ? "bg-cyan-500/8" : "bg-cyan-500/4"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 80, -30, 0],
                    y: [0, -60, 40, 0],
                    scale: [1, 1.1, 0.9, 1],
                  }}
                  transition={{
                    duration: 22,
                    ease: "easeInOut",
                  }}
                  style={{ top: "20%", left: "15%" }}
                />
                <motion.div
                  className={`absolute w-[350px] h-[350px] ${darkMode ? "bg-purple-500/6" : "bg-purple-500/3"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -90, 60, 0],
                    y: [0, 70, -30, 0],
                    scale: [1, 0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 28,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "15%", right: "20%" }}
                />
              </div>

              <div className="max-w-6xl mx-auto px-6 relative z-10">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-12 text-center"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaAward className="inline mr-3 text-cyan-500" />
                  <span className={darkMode ? "text-white" : "text-black"}>{t.companies.trustedBy} </span>
                  <span className="text-cyan-500">{t.companies.companies}</span>
                </motion.h2>

                <div className="overflow-hidden">
                  <motion.div
                    className="flex items-center gap-16 animate-marquee hover:[animation-play-state:paused]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {logos.concat(logos).map((src, i) => (
                      <motion.img
                        key={i}
                        src={src}
                        alt={`Company Logo ${i + 1}`}
                        className="h-16 md:h-20 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* How It Works Video Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 relative overflow-hidden ${darkMode ? "bg-gradient-to-br from-black via-gray-900 to-black" : "bg-gradient-to-br from-white via-gray-50 to-white"
                }`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[600px] h-[600px] ${darkMode ? "bg-cyan-500/10" : "bg-cyan-500/5"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -80, 60, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 20,
                    ease: "easeInOut",
                  }}
                  style={{ top: "10%", left: "10%" }}
                />
                <motion.div
                  className={`absolute w-[400px] h-[400px] ${darkMode ? "bg-purple-500/10" : "bg-purple-500/5"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 100, -40, 0],
                    scale: [1, 0.9, 1.3, 1],
                  }}
                  transition={{
                    duration: 25,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "10%", right: "10%" }}
                />
                <motion.div
                  className={`absolute w-[300px] h-[300px] ${darkMode ? "bg-blue-500/15" : "bg-blue-500/8"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 60, -80, 0],
                    y: [0, -60, 80, 0],
                    scale: [1, 1.4, 0.7, 1],
                  }}
                  transition={{
                    duration: 18,
                    ease: "easeInOut",
                  }}
                  style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                  className="text-center mb-12 sm:mb-16"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  >
                    <span className={darkMode ? "text-white" : "text-black"}>{t.howItWorks.title.split(' ')[0]} </span>
                    <span className="text-cyan-500">{t.howItWorks.title.split(' ').slice(1).join(' ')}</span>
                  </motion.h2>
                  <motion.p
                    className={`text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12 ${darkMode ? "text-gray-300" : "text-gray-600"
                      } max-w-4xl mx-auto leading-relaxed`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {t.howItWorks.subtitle.split(t.howItWorks.videoSubtitle)[0]}
                    <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                      {t.howItWorks.videoSubtitle}
                    </span>
                    {t.howItWorks.subtitle.split(t.howItWorks.videoSubtitle)[1]}
                  </motion.p>
                </motion.div>

                {/* Video Container */}
                <motion.div
                  className="flex justify-center mb-12 sm:mb-16"
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <motion.div
                    className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gradient-to-r from-cyan-400 to-purple-600"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Actual Video */}
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      poster=""
                      autoPlay
                      loop
                      muted
                      style={{ zIndex: 1, position: 'relative' }}
                    >
                      <source src={howItWorksVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Overlay Effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4">
                      <motion.span
                        className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2 }}
                      >

                      </motion.span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Step-by-Step Process */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {[
                    {
                      step: "01",
                      title: t.howItWorks.steps.step1.title,
                      description: t.howItWorks.steps.step1.desc,
                      icon: "🔍",
                      color: "from-blue-500 to-cyan-500",
                      delay: 0.2
                    },
                    {
                      step: "02",
                      title: t.howItWorks.steps.step2.title,
                      description: t.howItWorks.steps.step2.desc,
                      icon: "📝",
                      color: "from-purple-500 to-pink-500",
                      delay: 0.4
                    },
                    {
                      step: "03",
                      title: t.howItWorks.steps.step3.title,
                      description: t.howItWorks.steps.step3.desc,
                      icon: "💬",
                      color: "from-green-500 to-teal-500",
                      delay: 0.6
                    },
                    {
                      step: "04",
                      title: t.howItWorks.steps.step4.title,
                      description: t.howItWorks.steps.step4.desc,
                      icon: "💰",
                      color: "from-orange-500 to-red-500",
                      delay: 0.8
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className={`relative p-6 sm:p-8 rounded-2xl ${darkMode
                        ? "bg-black/60 border-white/10"
                        : "bg-white/80 border-black/10"
                        } border backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group`}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{
                        y: -10,
                        scale: 1.05,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
                      }}
                      transition={{
                        duration: 0.6,
                        delay: item.delay,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      {/* Step Number */}
                      <motion.div
                        className={`absolute -top-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {item.step}
                      </motion.div>

                      {/* Icon */}
                      <motion.div
                        className="text-4xl sm:text-5xl mb-4 text-cyan-500"
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          ease: "easeInOut",
                          delay: idx * 0.5
                        }}
                      >
                        {item.icon}
                      </motion.div>

                      {/* Content */}
                      <motion.h3
                        className={`text-lg sm:text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-black"
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: item.delay + 0.2 }}
                      >
                        {item.title}
                      </motion.h3>

                      <motion.p
                        className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: item.delay + 0.4 }}
                      >
                        {item.description}
                      </motion.p>

                      {/* Animated Border */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.2 }}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  className="text-center mt-12 sm:mt-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  <motion.button
                    onClick={() => navigate("/login?redirect=/job-listings")}
                    className={`px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold text-lg sm:text-xl rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 relative overflow-hidden group`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 40px rgba(34, 211, 238, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <motion.span
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 2 }}
                      >

                      </motion.span>
                      {t.hero.getStarted}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  <motion.p
                    className={`mt-6 text-sm sm:text-lg text-white/90`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                  >
                    {t.testimonials.subtitle}
                  </motion.p>
                </motion.div>
              </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${darkMode ? "bg-black" : "bg-white"
                } relative z-10 overflow-hidden`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[450px] h-[450px] ${darkMode ? "bg-cyan-500/6" : "bg-cyan-500/3"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 70, -40, 0],
                    y: [0, -50, 30, 0],
                    scale: [1, 1.15, 0.85, 1],
                  }}
                  transition={{
                    duration: 24,
                    ease: "easeInOut",
                  }}
                  style={{ top: "25%", left: "10%" }}
                />
                <motion.div
                  className={`absolute w-[320px] h-[320px] ${darkMode ? "bg-purple-500/5" : "bg-purple-500/2"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -80, 50, 0],
                    y: [0, 60, -25, 0],
                    scale: [1, 0.9, 1.1, 1],
                  }}
                  transition={{
                    duration: 30,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "20%", right: "15%" }}
                />
                <motion.div
                  className={`absolute w-[280px] h-[280px] ${darkMode ? "bg-blue-500/8" : "bg-blue-500/4"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 45, -65, 0],
                    y: [0, -35, 55, 0],
                    scale: [1, 1.25, 0.75, 1],
                  }}
                  transition={{
                    duration: 26,
                    ease: "easeInOut",
                  }}
                  style={{ top: "60%", left: "60%" }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {[
                    {
                      number: "10K+",
                      label: t.categories.eliteFreelancers,
                      color: "from-slate-400 to-gray-500",
                    },
                    {
                      number: "5K+",
                      label: t.stats.happyClients,
                      color: "from-red-400 to-red-500",
                    },
                    {
                      number: "20M+",
                      label: t.stats.successProjects,
                      color: "from-gray-400 to-slate-500",
                    },
                    {
                      number: "98%",
                      label: t.stats.successRate,
                      color: "from-yellow-400 to-yellow-500",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center ${darkMode
                        ? "bg-black border-white/10"
                        : "bg-white border-black/10"
                        } border shadow-xl md:shadow-2xl relative overflow-hidden group cursor-pointer`}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -10,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                      }}
                      transition={{
                        delay: i * 0.2,
                        duration: 0.8,
                        type: "spring",
                      }}
                    >
                      <motion.div
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: i * 0.2 + 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {stat.number}
                      </motion.div>
                      <p
                        className={`text-sm sm:text-base md:text-lg font-semibold ${darkMode ? "text-white/90" : "text-black/90"
                          }`}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Categories Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${darkMode ? "bg-black" : "bg-white"
                } relative z-10 overflow-hidden`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[480px] h-[480px] ${darkMode ? "bg-cyan-500/5" : "bg-cyan-500/2"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 90, -50, 0],
                    y: [0, -70, 40, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 25,
                    ease: "easeInOut",
                  }}
                  style={{ top: "15%", left: "8%" }}
                />
                <motion.div
                  className={`absolute w-[360px] h-[360px] ${darkMode ? "bg-purple-500/4" : "bg-purple-500/2"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -100, 70, 0],
                    y: [0, 80, -35, 0],
                    scale: [1, 0.85, 1.15, 1],
                  }}
                  transition={{
                    duration: 32,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "10%", right: "12%" }}
                />
                <motion.div
                  className={`absolute w-[300px] h-[300px] ${darkMode ? "bg-blue-500/6" : "bg-blue-500/3"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 55, -75, 0],
                    y: [0, -45, 65, 0],
                    scale: [1, 1.3, 0.7, 1],
                  }}
                  transition={{
                    duration: 27,
                    ease: "easeInOut",
                  }}
                  style={{ top: "55%", left: "65%" }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className={darkMode ? "text-white" : "text-black"}>{t.categories.popularCategories.split(' ')[0]} {t.categories.popularCategories.split(' ')[1]} </span>
                  <span className="text-cyan-500">{t.categories.popularCategories.split(' ').slice(2).join(' ')}</span>
                </motion.h2>

                <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
                  {[
                    {
                      icon: (
                        <FaCode
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.development,
                      count: "1,200+",
                      color: "from-blue-500 to-indigo-600",
                    },
                    {
                      icon: (
                        <FaPenNib
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.design,
                      count: "800+",
                      color: "from-purple-500 to-pink-600",
                    },
                    {
                      icon: (
                        <FaBullhorn
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.marketing,
                      count: "650+",
                      color: "from-red-500 to-orange-600",
                    },
                    {
                      icon: (
                        <FaMobileAlt
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.mobile,
                      count: "450+",
                      color: "from-green-500 to-teal-600",
                    },
                    {
                      icon: (
                        <FaRegEnvelope
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.writing,
                      count: "1,000+",
                      color: "from-yellow-500 to-amber-600",
                    },
                    {
                      icon: (
                        <FaComments
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.translation,
                      count: "300+",
                      color: "from-cyan-500 to-blue-600",
                    },
                    {
                      icon: (
                        <FaSuitcase
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.business,
                      count: "900+",
                      color: "from-gray-500 to-slate-600",
                    },
                    {
                      icon: (
                        <FaUserTie
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.consulting,
                      count: "700+",
                      color: "from-indigo-500 to-purple-600",
                    },
                    {
                      icon: (
                        <FaGlobeAfrica
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: "Localization",
                      count: "250+",
                      color: "from-teal-500 to-cyan-600",
                    },
                    {
                      icon: (
                        <FaLayerGroup
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.adminSupport,
                      count: "500+",
                      color: "from-orange-500 to-red-600",
                    },
                    {
                      icon: (
                        <FaRobot
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.aiAndData,
                      count: "400+",
                      color: "from-blue-600 to-cyan-400",
                    },
                    {
                      icon: (
                        <FaVideo
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.videoAndAudio,
                      count: "350+",
                      color: "from-red-600 to-pink-500",
                    },
                    {
                      icon: (
                        <FaShoppingCart
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.ecommerce,
                      count: "900+",
                      color: "from-orange-600 to-yellow-500",
                    },
                    {
                      icon: (
                        <FaHeadset
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.customerSupport,
                      count: "600+",
                      color: "from-teal-600 to-green-500",
                    },
                    {
                      icon: (
                        <FaHeartbeat
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.lifestyleAndHealth,
                      count: "200+",
                      color: "from-pink-600 to-rose-400",
                    },
                    {
                      icon: (
                        <FaBalanceScale
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.financeAndLegal,
                      count: "400+",
                      color: "from-slate-700 to-blue-900",
                    },
                    {
                      icon: (
                        <FaBuilding
                          className={`text-2xl sm:text-3xl ${darkMode ? "text-white" : "text-black"
                            }`}
                        />
                      ),
                      title: t.categories.engineeringAndArch,
                      count: "300+",
                      color: "from-amber-700 to-orange-800",
                    },
                  ].map((category, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${darkMode
                        ? "bg-black border-white/10 hover:bg-white/5"
                        : "bg-white border-black/10 hover:bg-white"
                        } border cursor-pointer transition-all duration-300 relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 30, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{
                        y: -10,
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                      }}
                      transition={{
                        delay: idx * 0.1,
                        duration: 0.6,
                        type: "spring",
                      }}
                    >
                      <motion.div
                        className={`mb-3 sm:mb-4 text-2xl sm:text-3xl text-cyan-500`}
                        whileHover={{ scale: 1.3 }}
                        transition={{ duration: 0.3 }}
                      >
                        {category.icon}
                      </motion.div>
                      <h4
                        className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 ${darkMode ? "text-white/90" : "text-black/90"
                          }`}
                      >
                        {category.title}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                      >
                        {category.count} {t.categories.freelancers}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Featured Freelancers */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${darkMode ? "bg-black" : "bg-white"
                } relative z-10 overflow-hidden`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[420px] h-[420px] ${darkMode ? "bg-cyan-500/4" : "bg-cyan-500/2"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 75, -45, 0],
                    y: [0, -55, 35, 0],
                    scale: [1, 1.18, 0.82, 1],
                  }}
                  transition={{
                    duration: 23,
                    ease: "easeInOut",
                  }}
                  style={{ top: "18%", left: "12%" }}
                />
                <motion.div
                  className={`absolute w-[340px] h-[340px] ${darkMode ? "bg-purple-500/3" : "bg-purple-500/1.5"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -85, 55, 0],
                    y: [0, 65, -40, 0],
                    scale: [1, 0.88, 1.12, 1],
                  }}
                  transition={{
                    duration: 29,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "12%", right: "18%" }}
                />
                <motion.div
                  className={`absolute w-[260px] h-[260px] ${darkMode ? "bg-blue-500/5" : "bg-blue-500/2.5"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 50, -70, 0],
                    y: [0, -40, 60, 0],
                    scale: [1, 1.28, 0.72, 1],
                  }}
                  transition={{
                    duration: 31,
                    ease: "easeInOut",
                  }}
                  style={{ top: "50%", left: "70%" }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className={darkMode ? "text-white" : "text-black"}>{t.categories.eliteFreelancers.split(' ')[0]} </span>
                  <span className="text-cyan-500">{t.categories.eliteFreelancers.split(' ').slice(1).join(' ')}</span>
                </motion.h2>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[
                    {
                      name: "Yohannes F.",
                      title: "Developer",
                      skills: ["React", "TypeScript", "Tailwind Css"],
                      image: avatar1,

                      gradient: "from-slate-500 to-gray-600",
                    },
                    {
                      name: "Samuel T.",
                      title: "Software Engineer",
                      skills: ["React", "Laravel", "Css"],
                      image: avatar2,

                      gradient: "from-gray-500 to-slate-600",
                    },
                    {
                      name: "Messie A.",
                      title: " Developer",
                      skills: ["React", "Html", "Css", "Js"],
                      image: avatar3,

                      gradient: "from-slate-600 to-gray-700",
                    },
                    {
                      name: "Dagim D.",
                      title: "Developer",
                      skills: ["React", "Js", "Tailwind Css"],
                      image: avatar4,

                      gradient: "from-gray-600 to-slate-700",
                    },
                  ].map((freelancer, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl cursor-pointer ${darkMode
                        ? "bg-black border-white/10 hover:bg-white/5"
                        : "bg-white border-black/10 hover:bg-white"
                        } border shadow-xl md:shadow-2xl flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -10,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
                      }}
                      transition={{
                        delay: idx * 0.1,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <motion.div
                        className="relative mb-4 sm:mb-6"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={freelancer.image}
                          alt={freelancer.name}
                          className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full object-cover shadow-xl md:shadow-2xl border-2 sm:border-4 border-gray-700/40"
                        />
                        <div
                          className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${freelancer.gradient} rounded-full flex items-center justify-center`}
                        >
                          <FaStar className="text-white text-base sm:text-lg md:text-xl" />
                        </div>
                      </motion.div>

                      <h4
                        className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${darkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {freelancer.name}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm mb-3 sm:mb-4 font-semibold ${darkMode ? "text-white/90" : "text-black/90"
                          }`}
                      >
                        {freelancer.title}
                      </p>

                      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {freelancer.skills.map((skill, i) => (
                          <motion.span
                            key={i}
                            className={`px-2 sm:px-3 py-1 text-xs rounded-full font-semibold ${darkMode
                              ? "bg-black/50 text-white"
                              : "bg-white text-black"
                              } backdrop-blur-sm border ${darkMode ? "border-white/10" : "border-black/10"
                              }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>

                      <motion.span
                        className={`mt-auto font-bold text-lg sm:text-xl bg-gradient-to-r ${freelancer.gradient} bg-clip-text text-transparent`}
                        whileHover={{ scale: 1.1 }}
                      >

                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${darkMode ? "bg-black" : "bg-white"
                } relative z-10 overflow-hidden`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className={`absolute w-[380px] h-[380px] ${darkMode ? "bg-cyan-500/3" : "bg-cyan-500/1.5"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 60, -35, 0],
                    y: [0, -40, 25, 0],
                    scale: [1, 1.25, 0.75, 1],
                  }}
                  transition={{
                    duration: 28,
                    ease: "easeInOut",
                  }}
                  style={{ top: "15%", left: "8%" }}
                />
                <motion.div
                  className={`absolute w-[300px] h-[300px] ${darkMode ? "bg-purple-500/2.5" : "bg-purple-500/1.25"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, -70, 40, 0],
                    y: [0, 50, -30, 0],
                    scale: [1, 0.85, 1.15, 1],
                  }}
                  transition={{
                    duration: 35,
                    ease: "easeInOut",
                  }}
                  style={{ bottom: "10%", right: "12%" }}
                />
                <motion.div
                  className={`absolute w-[220px] h-[220px] ${darkMode ? "bg-blue-500/4" : "bg-blue-500/2"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 35, -55, 0],
                    y: [0, -25, 45, 0],
                    scale: [1, 1.4, 0.6, 1],
                  }}
                  transition={{
                    duration: 31,
                    ease: "easeInOut",
                  }}
                  style={{ top: "60%", left: "70%" }}
                />
                <motion.div
                  className={`absolute w-[160px] h-[160px] ${darkMode ? "bg-cyan-500/2" : "bg-cyan-500/1"} rounded-full blur-3xl`}
                  animate={{
                    x: [0, 25, -15, 0],
                    y: [0, 20, -10, 0],
                    scale: [1, 1.1, 0.9, 1],
                  }}
                  transition={{
                    duration: 24,
                    ease: "easeInOut",
                  }}
                  style={{ top: "40%", left: "45%" }}
                />
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className={darkMode ? "text-white" : "text-black"}>{t.testimonials.title.split(' ')[0]} {t.testimonials.title.split(' ')[1]} </span>
                  <span className="text-cyan-500">{t.testimonials.title.split(' ').slice(2).join(' ')}</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {[
                    {
                      quote:
                        "HustleX transformed our hiring process. We found the perfect developer in just 3 days!",
                      name: "Messay A.",
                      role: "CEO, Tonetor",
                      image:
                        avatar5,
                      gradient: "from-slate-500 to-gray-600",
                    },
                    {
                      quote:
                        "As a freelancer, I've been able to triple my income while working on projects I'm passionate about.",
                      name: "Messie A.",
                      role: "Web developer",
                      image:
                        avatar3,
                      gradient: "from-gray-500 to-slate-600",
                    },
                    {
                      quote:
                        "HustleX connects me with exceptional talent that delivers outstanding results every time.",
                      name: "Sara M.",
                      role: "Project Manager",
                      image:
                        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
                      gradient: "from-slate-600 to-gray-700",
                    },
                  ].map((testimonial, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl cursor-pointer ${darkMode
                        ? "bg-black border-white/10 hover:bg-white/5"
                        : "bg-white border-black/10 hover:bg-white"
                        } border flex flex-col shadow-xl md:shadow-2xl relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.2 }}
                    >
                      <div className="flex-grow relative z-10">
                        <motion.div
                          className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center`}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <svg
                            className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                        </motion.div>
                        <p
                          className={`mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed ${darkMode ? "text-white/80" : "text-black/70"
                            }`}
                        >
                          "{testimonial.quote}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                        <motion.img
                          src={testimonial.image}
                          alt={`Portrait of ${testimonial.name}`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg border-2 border-gray-700/40"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div>
                          <div
                            className={`font-bold text-sm sm:text-base md:text-lg ${darkMode ? "text-white" : "text-black"
                              }`}
                          >
                            {testimonial.name}
                          </div>
                          <div
                            className={`text-xs sm:text-sm font-semibold ${darkMode ? "text-white/90" : "text-black/90"
                              }`}
                          >
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
              className="py-16 sm:py-20 md:py-24 bg-black relative overflow-hidden"
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0">
                <motion.div
                  className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"
                  animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                  transition={{ duration: 12 }}
                  style={{ left: "10%", top: "20%" }}
                />
                <motion.div
                  className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"
                  animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                  transition={{ duration: 15 }}
                  style={{ right: "10%", bottom: "20%" }}
                />
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-center text-cyan-500"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {t.cta.title}
                </motion.h2>
                <motion.p
                  className="text-white/80 mb-8 sm:mb-10 md:mb-12 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {t.cta.subtitle}
                  <br className="hidden sm:block" />
                  <span className="font-bold text-cyan-500">
                    {" "}{t.cta.subtitleHighlight}
                  </span>
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => navigate("/job-listings")}
                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-transparent border-2 border-cyan-600 text-cyan-600 font-bold text-base sm:text-lg md:text-xl rounded-full hover:bg-cyan-600 hover:text-white transition-all duration-300 shadow-2xl backdrop-blur-sm w-full sm:w-auto"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      <FaSearch className="text-sm sm:text-base md:text-lg" />
                      {t.cta.findDreamWork}
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
              className={`pt-16 sm:pt-20 pb-6 sm:pb-8 ${darkMode
                ? "bg-gradient-to-br from-black/95 to-gray-900/95"
                : "bg-gradient-to-br from-gray-800 to-gray-900"
                } text-white relative overflow-hidden`}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
                  {[
                    {
                      title: t.footer.forClients,
                      links: [
                        { text: t.footer.howToHire, href: "HowItWorks" },

                      ],
                    },
                    {
                      title: t.footer.forFreelancers,
                      links: [
                        { text: t.footer.howToFindWork, href: "/HowItWorks" },
                        { text: t.footer.freelanceJobs, href: "/job-listings" },
                      ],
                    },
                    {
                      title: t.footer.company,
                      links: [
                        { text: t.footer.aboutUs, href: "/about-us" },

                        { text: t.footer.contactUs, href: "/contact-us" },
                      ],
                    },
                    {
                      title: t.footer.resources,
                      links: [
                        { text: t.footer.helpCenter, href: "/help-center" },
                        { text: t.footer.blog, href: "/blog" },
                        { text: t.footer.community, href: "https://t.me/HustleXet" },

                      ],
                    },
                  ].map((section, idx) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.6 }}
                    >
                      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 bg-gradient-to-r from-slate-300 to-gray-400 bg-clip-text text-transparent">
                        {section.title}
                      </h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {section.links.map((link, linkIdx) => (
                          <motion.li key={linkIdx}>
                            {(link as any).isInternal ? (
                              <Link
                                to={link.href}
                                onClick={(e) => {
                                  if (!isAuthenticated) {
                                    e.preventDefault();
                                    navigate(`/signup?redirect=${link.href}`);
                                  }
                                }}
                                className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm sm:text-base"
                              >
                                {link.text}
                              </Link>
                            ) : (
                              <a
                                href={link.href}
                                className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm sm:text-base"
                              >
                                {link.text}
                              </a>
                            )}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="border-t border-gray-800/50 pt-6 sm:pt-8 flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="text-gray-500 order-2 lg:order-1 text-center lg:text-left">
                    <p className="mb-1 sm:mb-2 text-sm sm:text-base">
                      © 2025 HustleX. All rights reserved.
                    </p>
                    <p className="text-xs sm:text-sm">
                      {t.footer.madeWith} <FaHeart className="inline text-red-500 mx-1" />{" "}
                      {t.footer.inEthiopia}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 order-1 lg:order-2">
                    <span className="text-gray-400 font-normal text-sm sm:text-base">
                      {t.footer.followUs}:
                    </span>
                    <div className="flex gap-3 sm:gap-4">
                      {[
                        {
                          icon: <FaFacebook />,
                          color: "hover:text-blue-400",
                          label: "Facebook",
                          href: "https://www.facebook.com/share/14YUagDZDNE/",
                        },
                        {
                          icon: <FaXTwitter />,
                          color: "hover:text-cyan-400",
                          label: "X",
                          href: "https://x.com/HustleX123",
                        },
                        {
                          icon: <FaLinkedin />,
                          color: "hover:text-blue-500",
                          label: "LinkedIn",
                        },
                        {
                          icon: <FaInstagram />,
                          color: "hover:text-pink-400",
                          label: "Instagram",
                          href: "https://www.instagram.com/hustlex123?igsh=cWdiYm8wbzF4ZTFk",
                        },
                        {
                          icon: <FaYoutube />,
                          color: "hover:text-red-400",
                          label: "YouTube",
                          href: "https://youtube.com/@HustleXet",
                        },
                        {
                          icon: <FaTelegramPlane />,
                          color: "hover:text-sky-400",
                          label: "Telegram",
                          href: "https://t.me/HustleXet",
                        },
                      ].map((social, idx) => (
                        <motion.a
                          key={social.label}
                          href={(social as any).href || "#"}
                          target={(social as any).href ? "_blank" : undefined}
                          rel={(social as any).href ? "noopener noreferrer" : undefined}
                          className={`text-gray-500 ${social.color} transition-all duration-300 p-2 rounded-full hover:bg-white/5`}
                          aria-label={social.label}
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                          <span className="text-xl">{social.icon}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.footer>
          </>
        )
        }
      </AnimatePresence >

      {/* Floating Chat Bot */}
      < FloatingChatBot />
      </div>
    </>
  );
};

export default Home;
