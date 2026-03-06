import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { setLanguage, type Language } from "../store/languageSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaSun, FaMoon, FaBars, FaTimes, FaSearch, FaGlobe, FaStar } from "react-icons/fa";
import { useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import FloatingDarkModeToggle from "./FloatingDarkModeToggle";

const HomeNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role || "guest";

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "am", name: "አማርኛ", nativeName: "አማርኛ" },
    { code: "ti", name: "ትግርኛ", nativeName: "ትግርኛ" },
    { code: "om", name: "Oromoo", nativeName: "Afaan Oromoo" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

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

  // Don't show navbar on job-listings and job-details pages
  if (location.pathname === "/job-listings" || location.pathname.startsWith("/job-details") || location.pathname === "/preview-job" || location.pathname === "/blog/post") {
    return null;
  }

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.header
          className={`absolute top-0 left-0 right-0 z-40 min-h-[52px] ${darkMode ? "border-black/30 bg-black/95" : "border-black/10 bg-white/95"
            } border-b shadow-2xl backdrop-blur-sm`}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
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
                { to: "/", label: t.nav.home },
                { to: "/job-listings", label: t.nav.exploreJobs, icon: <FaSearch /> },
                { to: "/blog", label: t.nav.blog },
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
                      navigate("/signup?redirect=" + encodeURIComponent(location.pathname))
                    }
                    className="px-4 py-1.5 text-xs rounded-full font-semibold shadow-md transition duration-300 bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    {t.nav.logIn}
                  </button>
                  <button
                    onClick={() =>
                      navigate("/signup?redirect=" + encodeURIComponent(location.pathname))
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
                      className={`absolute right-0 top-full mt-2 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[160px] ${darkMode
                        ? "bg-gray-900 border border-gray-700"
                        : "bg-white border border-gray-200"
                        }`}
                    >
                      {languages.map((lang) => (
                        <motion.button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${language === lang.code
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
                            <span className="font-medium text-xs">{lang.nativeName}</span>
                            <span
                              className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              {lang.name}
                            </span>
                          </div>
                          {language === lang.code && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-1.5 h-1.5 rounded-full ${darkMode ? "bg-cyan-400" : "bg-cyan-600"
                                }`}
                            />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Attach dark mode/profile menu to navbar (was a floating component) */}
              <div className="flex items-center">
                <FloatingDarkModeToggle />
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
                        className={`${darkMode ? "text-white" : "text-black"}`}
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
                        className={`${darkMode ? "text-white" : "text-black"}`}
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
                    { to: "/blog", label: t.nav.blog },
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
                            navigate("/signup?redirect=" + encodeURIComponent(location.pathname));
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
                            navigate("/signup?redirect=" + encodeURIComponent(location.pathname));
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
      )}
    </AnimatePresence>
  );
};

export default HomeNavbar;
