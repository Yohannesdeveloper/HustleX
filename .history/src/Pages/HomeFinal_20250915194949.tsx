import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

// Essential icons only
import { FaSun, FaMoon, FaBars, FaTimes, FaUser } from "react-icons/fa";

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
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaRocket,
  FaStar,
  FaHeart,
  FaAward,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const [userRole, setUserRole] = useState<"freelancer" | "client" | "guest">(
    "guest"
  );

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

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
        repeat: Infinity,
        repeatType: "reverse",
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
    "/logos/etc.png",
  ];

  return (
    <div
      className={`relative overflow-hidden ${
        darkMode ? "bg-black" : "bg-white"
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
              className={`sticky top-0 z-40 ${
                darkMode
                  ? "bg-black border-black/60"
                  : "backdrop-blur-2xl bg-white/80 border-black/10"
              } border-b shadow-2xl`}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
            >
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
                <div className="flex items-center gap-12 md:gap-20">
                  <motion.h1
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight cursor-pointer transition duration-300 flex items-center`}
                    whileHover={{
                      scale: 1.1,
                      textShadow: "0 0 20px rgba(148, 163, 184, 0.5)",
                    }}
                    onClick={() => {
                      navigate("/homefinal");
                      setMenuOpen(false);
                    }}
                  >
                    <span className={darkMode ? "text-white" : "text-black"}>
                      Ethio
                    </span>
                    <img
                      src="/logos/Logo.png"
                      alt="logo"
                      className="mx-2 h-12 w-12"
                    />
                    <span className={darkMode ? "text-white" : "text-black"}>
                      Hustle
                    </span>
                  </motion.h1>

                  {/* Desktop nav links */}
                  <nav className="hidden lg:flex gap-3 xl:gap-4 items-center flex-nowrap">
                    {[
                      {
                        to: "/homefinal",
                        label: "Home",
                        icon: <FaRocket />,
                        shortLabel: "Home",
                      },
                      {
                        to: "/job-listings",
                        label: "Explore Jobs",
                        icon: <FaSearch />,
                        shortLabel: "Jobs",
                      },
                      {
                        to: "/blog",
                        label: "Blog",
                        icon: <FaPenNib />,
                        shortLabel: "Blog",
                      },
                      {
                        to: "/HowItWorks",
                        label: "How it works",
                        icon: null,
                        shortLabel: "How it works",
                      },
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
                          className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-sm xl:text-base ${
                            darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                          }`}
                        >
                          {link.icon}
                          <span className="hidden xl:inline">{link.label}</span>
                          <span className="xl:hidden">
                            {link.shortLabel || link.label}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Tablet nav links - simplified */}
                  <nav className="hidden md:flex lg:hidden gap-2 items-center flex-nowrap">
                    {[
                      { to: "/homefinal", label: "Home", icon: <FaRocket /> },
                      {
                        to: "/job-listings",
                        label: "Jobs",
                        icon: <FaSearch />,
                      },
                      { to: "/blog", label: "Blog", icon: <FaPenNib /> },
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
                          className={`flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-sm ${
                            darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                          }`}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Right side: guest buttons (desktop) + dark mode toggle + hamburger */}
                <div className="flex items-center gap-4">
                  {/* Guest buttons - desktop only */}
                  {userRole === "guest" && (
                    <div className="hidden md:flex gap-3">
                      <button
                        onClick={() =>
                          navigate("/login?redirect=/job-listings")
                        }
                        className="px-6 py-2 rounded-full font-semibold shadow-md transition duration-300 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() =>
                          navigate("/login?redirect=/job-listings")
                        }
                        className="px-6 py-2 rounded-full font-semibold shadow-md transition duration-300 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}

                  {/* Dark mode switch */}
                  <motion.button
                    onClick={toggleDarkMode}
                    aria-label="Toggle dark mode"
                    className={`w-14 h-8 rounded-full flex items-center px-1 transition ${
                      darkMode
                        ? "bg-white/20 justify-end"
                        : "bg-black/10 justify-start"
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-6 h-6 rounded-full shadow-md ${
                        darkMode ? "bg-black" : "bg-white"
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30,
                      }}
                    />
                  </motion.button>

                  {/* Hamburger for mobile */}
                  <motion.button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-2xl p-3 rounded-full focus:outline-none bg-black/40"
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
                            className={`${
                              darkMode ? "text-white" : "text-black"
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
                            className={`${
                              darkMode ? "text-white" : "text-black"
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
                    className={`md:hidden backdrop-blur-2xl ${
                      darkMode ? "bg-black/80" : "bg-white/80"
                    } border-t border-black/20`}
                  >
                    <ul className="flex flex-col gap-2 p-6">
                      {[
                        { to: "/home", label: "Home", icon: <FaRocket /> },
                        {
                          to: "/job-listings",
                          label: "Jobs",
                          icon: <FaSearch />,
                        },
                        { to: "/Blog", label: "Blog", icon: <FaPenNib /> },
                        {
                          to: "/HowItWorks",
                          label: "How it works",
                          icon: null,
                        },
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                              darkMode
                                ? "text-white hover:bg-white/10"
                                : "text-black hover:bg-black/5"
                            }`}
                          >
                            {link.icon}
                            {link.label}
                          </Link>
                        </motion.li>
                      ))}

                      {/* Guest buttons inside mobile menu */}
                      {userRole === "guest" && (
                        <>
                          <li>
                            <button
                              onClick={() => {
                                navigate("/login?redirect=/homefinal");
                                setMenuOpen(false);
                              }}
                              className="w-full px-6 py-2 rounded-full font-semibold shadow-md transition duration-300 bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Log In
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                navigate("/signup");
                                setMenuOpen(false);
                              }}
                              className="w-full px-6 py-2 rounded-full font-semibold shadow-md transition duration-300 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                              Sign Up
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </motion.nav>
                )}
              </AnimatePresence>
            </motion.header>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden">
              <motion.div
                className="w-full h-screen relative"
                style={{ y: y1 }}
              >
                {/* Full Screen Video */}
                <video
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  autoPlay
                  muted
                  playsInline
                >
                  <source src="/videos/hero-background.mp4" type="video/mp4" />
                  <source
                    src="/videos/hero-background.webm"
                    type="video/webm"
                  />
                  Your browser does not support the video tag.
                </video>

                {/* Video Overlay for Text Readability */}
                <div className="absolute inset-0 bg-black/50 z-20"></div>

                {/* Text Content */}
                <div className="relative z-30 px-4 sm:px-8 md:px-8 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-16">
                  <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 md:mb-10 leading-tight text-white max-w-4xl text-left"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    " Where
                    <br />
                    <span className="text-blue-400">
                      {" "}
                      Talent <br /> Meets
                    </span>{" "}
                    Opportunity"
                  </motion.h2>

                  <motion.p
                    className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl text-white/90 text-left"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Connecting businesses with top Ethiopian talent
                    <br className="hidden md:block" />
                    <span className="font-bold text-white">
                      across 200+ skills.
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
                        navigate("/login?redirect=/role-selection")
                      }
                      className="px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-5 md:py-6 rounded-full text-white font-bold text-base sm:text-lg md:text-xl shadow-2xl transition-all duration-300 relative overflow-hidden group bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 w-full sm:w-auto"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        <FaRocket className="text-sm sm:text-base md:text-lg" />
                        Hire Elite Talent
                      </span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>

                    <motion.button
                      onClick={() => navigate("/job-listings")}
                      className={`px-8 sm:px-10 md:px-12 lg:px-14 py-4 sm:py-5 md:py-6 rounded-full font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-2xl backdrop-blur-sm border-2 relative overflow-hidden group w-full sm:w-auto ${
                        darkMode
                          ? "border-white/50 text-white hover:bg-white/10"
                          : "border-white/50 text-white hover:bg-white/20"
                      }`}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        <FaSearch className="text-sm sm:text-base md:text-lg" />
                        Find Dream Work
                      </span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* Company Logos Marquee */}
            <motion.section
              className={`${
                darkMode ? "bg-black/40" : "bg-white/70"
              } py-16 backdrop-blur-sm relative z-10`}
              style={{ y: y2 }}
            >
              <div className="max-w-6xl mx-auto px-6">
                <motion.h2
                  className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaAward className="inline mr-3 text-yellow-500" />
                  Trusted by Top Companies
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

            {/* Stats Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${
                darkMode ? "bg-black" : "bg-white"
              } relative z-10`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {[
                    {
                      number: "10K+",
                      label: "Elite Freelancers",
                      icon: <FaUserTie />,
                      color: "from-slate-400 to-gray-500",
                    },
                    {
                      number: "5K+",
                      label: "Happy Clients",
                      icon: <FaHeart />,
                      color: "from-red-400 to-red-500",
                    },
                    {
                      number: "20M+",
                      label: "Success Projects",
                      icon: <FaRocket />,
                      color: "from-gray-400 to-slate-500",
                    },
                    {
                      number: "98%",
                      label: "Success Rate",
                      icon: <FaStar />,
                      color: "from-yellow-400 to-yellow-500",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center ${
                        darkMode
                          ? "bg-black border-white/10"
                          : "bg-white border-black/10"
                      } border shadow-xl md:shadow-2xl relative overflow-hidden group cursor-pointer`}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
                        className={`text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {stat.icon}
                      </motion.div>
                      <motion.div
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{
                          delay: i * 0.2 + 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {stat.number}
                      </motion.div>
                      <p
                        className={`text-sm sm:text-base md:text-lg font-semibold ${
                          darkMode ? "text-gray-400" : "text-gray-700"
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
              className={`py-16 sm:py-20 md:py-24 ${
                darkMode ? "bg-black" : "bg-white"
              } relative z-10`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 bg-clip-text text-transparent`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Popular Freelance Categories
                </motion.h2>

                <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
                  {[
                    {
                      icon: (
                        <FaCode
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Development",
                      count: "1,200+",
                      color: "from-blue-500 to-indigo-600",
                    },
                    {
                      icon: (
                        <FaPenNib
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Design",
                      count: "800+",
                      color: "from-purple-500 to-pink-600",
                    },
                    {
                      icon: (
                        <FaBullhorn
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Marketing",
                      count: "650+",
                      color: "from-red-500 to-orange-600",
                    },
                    {
                      icon: (
                        <FaMobileAlt
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Mobile",
                      count: "450+",
                      color: "from-green-500 to-teal-600",
                    },
                    {
                      icon: (
                        <FaRegEnvelope
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Writing",
                      count: "1,000+",
                      color: "from-yellow-500 to-amber-600",
                    },
                    {
                      icon: (
                        <FaComments
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Translation",
                      count: "300+",
                      color: "from-cyan-500 to-blue-600",
                    },
                    {
                      icon: (
                        <FaSuitcase
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Business",
                      count: "900+",
                      color: "from-gray-500 to-slate-600",
                    },
                    {
                      icon: (
                        <FaUserTie
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Consulting",
                      count: "700+",
                      color: "from-indigo-500 to-purple-600",
                    },
                    {
                      icon: (
                        <FaGlobeAfrica
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
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
                          className={`text-2xl sm:text-3xl ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      ),
                      title: "Admin Support",
                      count: "500+",
                      color: "from-orange-500 to-red-600",
                    },
                  ].map((category, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
                        darkMode
                          ? "bg-black border-white/10 hover:bg-white/5"
                          : "bg-white border-black/10 hover:bg-white"
                      } border cursor-pointer transition-all duration-300 relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 30, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
                        className={`mb-3 sm:mb-4 text-2xl sm:text-3xl bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                        whileHover={{ scale: 1.3 }}
                        transition={{ duration: 0.3 }}
                      >
                        {category.icon}
                      </motion.div>
                      <h4
                        className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {category.title}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                      >
                        {category.count} Freelancers
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Featured Freelancers */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${
                darkMode ? "bg-black" : "bg-white"
              } relative z-10`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Featured Elite Freelancers
                </motion.h2>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[
                    {
                      name: "Samuel T.",
                      title: "Full Stack Developer",
                      skills: ["React", "Node.js", "Tailwind CSS"],
                      image:
                        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
                      rate: "$25/hr",
                      gradient: "from-slate-500 to-gray-600",
                    },
                    {
                      name: "Lily M.",
                      title: "UI/UX Designer",
                      skills: ["Figma", "Adobe XD", "Sketch"],
                      image:
                        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
                      rate: "$30/hr",
                      gradient: "from-gray-500 to-slate-600",
                    },
                    {
                      name: "Daniel K.",
                      title: "Mobile Developer",
                      skills: ["Flutter", "React Native"],
                      image:
                        "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
                      rate: "$28/hr",
                      gradient: "from-slate-600 to-gray-700",
                    },
                    {
                      name: "Martha B.",
                      title: "Content Writer",
                      skills: ["Blogging", "Copywriting", "SEO"],
                      image:
                        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
                      rate: "$20/hr",
                      gradient: "from-gray-600 to-slate-700",
                    },
                  ].map((freelancer, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl cursor-pointer ${
                        darkMode
                          ? "bg-black border-white/10 hover:bg-white/5"
                          : "bg-white border-black/10 hover:bg-white"
                      } border shadow-xl md:shadow-2xl flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
                          <FaStar className="text-white text-xs sm:text-sm" />
                        </div>
                      </motion.div>

                      <h4
                        className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        {freelancer.name}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm mb-3 sm:mb-4 font-semibold bg-gradient-to-r ${freelancer.gradient} bg-clip-text text-transparent`}
                      >
                        {freelancer.title}
                      </p>

                      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {freelancer.skills.map((skill, i) => (
                          <motion.span
                            key={i}
                            className={`px-2 sm:px-3 py-1 text-xs rounded-full font-semibold ${
                              darkMode
                                ? "bg-black/50 text-white"
                                : "bg-white text-black"
                            } backdrop-blur-sm border ${
                              darkMode ? "border-white/10" : "border-black/10"
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
                        {freelancer.rate}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
              className={`py-16 sm:py-20 md:py-24 ${
                darkMode ? "bg-black" : "bg-white"
              } relative z-10`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  What Our Clients Say
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {[
                    {
                      quote:
                        "EthioFreelance transformed our hiring process. We found the perfect developer in just 3 days!",
                      name: "Mesfin T.",
                      role: "CTO, TechEthiopia",
                      image:
                        "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
                      gradient: "from-slate-500 to-gray-600",
                    },
                    {
                      quote:
                        "As a freelancer, I've been able to triple my income while working on projects I'm passionate about.",
                      name: "Bethelhem A.",
                      role: "UI/UX Designer",
                      image:
                        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
                      gradient: "from-gray-500 to-slate-600",
                    },
                    {
                      quote:
                        "The payment protection gives me confidence to hire freelancers without worry.",
                      name: "Yodit K.",
                      role: "Marketing Director",
                      image:
                        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
                      gradient: "from-slate-600 to-gray-700",
                    },
                  ].map((testimonial, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl cursor-pointer ${
                        darkMode
                          ? "bg-black border-white/10"
                          : "bg-white border-black/10"
                      } border flex flex-col shadow-xl md:shadow-2xl relative overflow-hidden group`}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -10,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
                      }}
                      transition={{
                        delay: idx * 0.2,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
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
                          className={`mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed ${
                            darkMode ? "text-white/80" : "text-black/70"
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
                            className={`font-bold text-sm sm:text-base md:text-lg ${
                              darkMode ? "text-white" : "text-black"
                            }`}
                          >
                            {testimonial.name}
                          </div>
                          <div
                            className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent`}
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
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0">
                <motion.div
                  className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"
                  animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                  transition={{ duration: 12, repeat: Infinity }}
                  style={{ left: "10%", top: "20%" }}
                />
                <motion.div
                  className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"
                  animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                  transition={{ duration: 15, repeat: Infinity }}
                  style={{ right: "10%", bottom: "20%" }}
                />
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Ready to Get Started?
                </motion.h2>
                <motion.p
                  className="text-white/80 mb-8 sm:mb-10 md:mb-12 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Join Ethiopia's largest community of talented freelancers and
                  businesses today.
                  <br className="hidden sm:block" />
                  <span className="font-bold text-gray-200">
                    Start your journey to success!
                  </span>
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => navigate("/login?redirect=/role-selection")}
                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-red-600 text-white font-bold text-base sm:text-lg md:text-xl rounded-full hover:bg-red-700 transition-all duration-300 shadow-2xl hover:shadow-red-500/30 relative overflow-hidden group w-full sm:w-auto"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      <FaRocket className="text-sm sm:text-base md:text-lg" />
                      Hire Elite Talent
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate("/job-listings")}
                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-transparent border-2 border-red-600 text-red-600 font-bold text-base sm:text-lg md:text-xl rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-2xl backdrop-blur-sm w-full sm:w-auto"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      <FaSearch className="text-sm sm:text-base md:text-lg" />
                      Find Dream Work
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
              className={`pt-16 sm:pt-20 pb-6 sm:pb-8 ${
                darkMode
                  ? "bg-gradient-to-br from-black/95 to-gray-900/95"
                  : "bg-gradient-to-br from-gray-800 to-gray-900"
              } text-white relative overflow-hidden`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
                  {[
                    {
                      title: "For Clients",
                      links: [
                        { text: "How to Hire", href: "#" },
                        { text: "Talent Marketplace", href: "#" },
                        { text: "Pricing", href: "#" },
                        { text: "Client Reviews", href: "#" },
                      ],
                    },
                    {
                      title: "For Freelancers",
                      links: [
                        { text: "How to Find Work", href: "#" },
                        { text: "Freelance Jobs", href: "#" },
                        { text: "Memberships", href: "#" },
                        { text: "Freelance Resources", href: "#" },
                      ],
                    },
                    {
                      title: "Company",
                      links: [
                        { text: "About Us", href: "#" },
                        { text: "Careers", href: "#" },
                        { text: "Press", href: "#" },
                        { text: "Contact Us", href: "#" },
                      ],
                    },
                    {
                      title: "Resources",
                      links: [
                        { text: "Help Center", href: "#" },
                        { text: "Post Blog", href: "/ConfirmId" },
                        { text: "Community", href: "#" },
                        { text: "Upcoming Events", href: "#" },
                      ],
                    },
                  ].map((section, idx) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.6 }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-300 to-gray-400 bg-clip-text text-transparent">
                        {section.title}
                      </h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {section.links.map((link, linkIdx) => (
                          <motion.li key={linkIdx}>
                            <a
                              href={link.href}
                              className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm sm:text-base"
                            >
                              {link.text}
                            </a>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="border-t border-gray-800/50 pt-6 sm:pt-8 flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="text-gray-500 order-2 lg:order-1 text-center lg:text-left">
                    <p className="mb-1 sm:mb-2 text-sm sm:text-base">
                      © 2025 EthioHustle. All rights reserved.
                    </p>
                    <p className="text-xs sm:text-sm">
                      Made with <FaHeart className="inline text-red-500 mx-1" />{" "}
                      in Ethiopia
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 order-1 lg:order-2">
                    <span className="text-gray-400 font-semibold text-sm sm:text-base">
                      Follow us:
                    </span>
                    <div className="flex gap-3 sm:gap-4">
                      {[
                        {
                          icon: <FaFacebook />,
                          color: "hover:text-blue-400",
                          label: "Facebook",
                        },
                        {
                          icon: <FaTwitter />,
                          color: "hover:text-cyan-400",
                          label: "Twitter",
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
                        },
                        {
                          icon: <FaYoutube />,
                          color: "hover:text-red-400",
                          label: "YouTube",
                        },
                      ].map((social, idx) => (
                        <motion.a
                          key={social.label}
                          href="#"
                          className={`text-gray-500 ${social.color} transition-all duration-300 p-2 rounded-full hover:bg-white/5`}
                          aria-label={social.label}
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
