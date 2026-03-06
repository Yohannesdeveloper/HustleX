import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";

type UserRole = "freelancer" | "client" | "guest";

const Navbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fix: userRole as state so TypeScript sees full union type
  const [userRole, setUserRole] = useState<UserRole>("freelancer"); // change accordingly or get from auth

  return (
    <motion.header
      className={`sticky top-0 z-50 backdrop-blur-xl ${darkMode ? "bg-white/10 border-white/20" : "bg-white/90 border-gray-200"
        } border-b shadow-md`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.h1
          className={`text-3xl md:text-4xl font-extrabold tracking-tight ${darkMode
            ? "text-accent hover:text-white"
            : "text-indigo-600 hover:text-gray-800"
            } transition duration-300 cursor-pointer`}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
        >
          HustleX
        </motion.h1>

        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-full ${darkMode
              ? "bg-white/10 hover:bg-white/20"
              : "bg-gray-200 hover:bg-gray-300"
              } transition`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className={darkMode ? "text-white" : "text-gray-700"} />
            ) : (
              <FaBars className={darkMode ? "text-white" : "text-gray-700"} />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul
              className={`flex gap-6 font-semibold ${darkMode ? "text-white" : "text-gray-700"
                }`}
            >
              <li>
                <Link to="/" className="hover:underline whitespace-nowrap">
                  Home
                </Link>
              </li>

              {userRole === "freelancer" && (
                <>
                  <li>
                    <Link to="/dashboard/freelancer" className="hover:underline whitespace-nowrap">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/job-listings" className="hover:underline whitespace-nowrap">
                      View Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/apply" className="hover:underline whitespace-nowrap">
                      Apply Now
                    </Link>
                  </li>
                </>
              )}

              {userRole === "client" && (
                <>
                  <li>
                    <Link to="/post-job" className="hover:underline whitespace-nowrap">
                      Post a Job
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard/hiring" className="hover:underline whitespace-nowrap">
                      Dashboard
                    </Link>
                  </li>
                </>
              )}

              {userRole === "guest" && (
                <>
                  <li>
                    <Link to="/job-listings" className="hover:underline whitespace-nowrap">
                      Explore Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:underline whitespace-nowrap">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:underline whitespace-nowrap">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className={`md:hidden absolute top-full left-0 right-0 ${darkMode ? "bg-white/10 border-white/20" : "bg-white/90 border-gray-200"
              } border-b shadow-md backdrop-blur-xl`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="px-6 py-4">
              <ul
                className={`flex flex-col gap-4 font-semibold ${darkMode ? "text-white" : "text-gray-700"
                  }`}
              >
                <li>
                  <Link
                    to="/"
                    className="hover:underline whitespace-nowrap block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>

                {userRole === "freelancer" && (
                  <>
                    <li>
                      <Link
                        to="/dashboard/freelancer"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/job-listings"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/apply"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Apply Now
                      </Link>
                    </li>
                  </>
                )}

                {userRole === "client" && (
                  <>
                    <li>
                      <Link
                        to="/post-job"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Post a Job
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/hiring"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}

                {userRole === "guest" && (
                  <>
                    <li>
                      <Link
                        to="/job-listings"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Explore Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        className="hover:underline whitespace-nowrap block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
