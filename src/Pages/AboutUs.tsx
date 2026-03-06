import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { FaUsers, FaGlobeAfrica, FaRocket, FaHeart, FaStar, FaAward, FaHandshake, FaLightbulb } from "react-icons/fa";
import { useTranslation } from "../hooks/useTranslation";
import Footer from "../components/Footer";
import { AboutSEO } from "../components/SEO";
import yohannesImg from "../Images/Teams/Yohannes.png";
import messieImg from "../Images/Teams/messie.png";
import DagiImg from "../Images/Teams/Dagi.png";
const AboutUs: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    {
      number: "10K+",
      label: t.aboutUs.activeFreelancers,
      icon: <FaUsers className="text-3xl" />,
      color: "from-blue-500 to-cyan-600"
    },
    {
      number: "5K+",
      label: t.stats.happyClients,
      icon: <FaHandshake className="text-3xl" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      number: "20M+",
      label: t.stats.successProjects,
      icon: <FaRocket className="text-3xl" />,
      color: "from-purple-500 to-pink-600"
    },
    {
      number: "98%",
      label: t.stats.successRate,
      icon: <FaStar className="text-3xl" />,
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const values = [
    {
      icon: <FaLightbulb className="text-4xl" />,
      title: t.aboutUs.innovation,
      description: t.aboutUs.innovationDesc,
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: t.aboutUs.community,
      description: t.aboutUs.communityDesc,
      color: "from-red-500 to-pink-600"
    },
    {
      icon: <FaAward className="text-4xl" />,
      title: t.aboutUs.excellence,
      description: t.aboutUs.excellenceDesc,
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <FaGlobeAfrica className="text-4xl" />,
      title: t.aboutUs.globalReach,
      description: t.aboutUs.globalReachDesc,
      color: "from-green-500 to-teal-600"
    }
  ];

  const team = [
    {
      name: "Yohannes Fikre",
      role: t.aboutUs.founderCEO,
      image: yohannesImg,
      bio: t.aboutUs.visionaryLeaderBio
    },
    {
      name: "Messeret Ayalew",
      role: t.aboutUs.frontendDeveloper,
      image: messieImg,
      bio: t.aboutUs.frontendDeveloperBio
    },
    {
      name: "Dagim Debebe",
      role: t.aboutUs.fullstackDeveloper,
      image: DagiImg,
      bio: t.aboutUs.fullstackDeveloperBio
    }
  ];

  return (
    <>
      <AboutSEO />
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
                    {t.aboutUs.ourStory}
                  </h2>
                  <p className={`text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {t.aboutUs.ourStoryDescription}
                  </p>
                </motion.section>

                {/* Stats Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
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
                          className={`mb-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          {stat.icon}
                        </motion.div>
                        <motion.div
                          className={`text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          {stat.number}
                        </motion.div>
                        <p className={`text-sm sm:text-base font-semibold ${darkMode ? "text-gray-400" : "text-gray-700"
                          }`}>
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Founder Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="text-center mb-12">
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                      {t.aboutUs.meetOurFounder}
                    </h3>
                    <p className={`text-lg max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {t.aboutUs.founderVisionary}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <motion.div
                      className={`max-w-md mx-auto ${darkMode
                        ? "bg-black border-white/10"
                        : "bg-white border-black/10"
                        } border rounded-2xl p-8 shadow-xl`}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <motion.div
                        className="text-center mb-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={yohannesImg}
                          alt="Founder"
                          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover mx-auto shadow-lg border-4 border-cyan-500/30"
                        />
                      </motion.div>

                      <div className="text-center">
                        <h4 className="text-2xl font-bold mb-2">{t.aboutUs.founderName}</h4>
                        <p className={`text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent`}>
                          {t.aboutUs.founderRole}
                        </p>
                        <p className={`text-sm leading-relaxed mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {t.aboutUs.founderBio}
                        </p>

                        <div className="flex justify-center space-x-4">
                          <motion.a
                            href="https://portfolio-yohanex.vercel.app/"
                            className={`p-3 rounded-full ${darkMode
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-black/10 hover:bg-black/20"
                              } transition-colors duration-300`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaGlobeAfrica className={`text-xl ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                          </motion.a>

                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>

                {/* Our Story Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <h3 className="text-3xl sm:text-4xl font-bold mb-6">
                        {t.aboutUs.ourStory}
                      </h3>
                      <div className={`space-y-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        <p className="text-lg leading-relaxed">
                          {t.aboutUs.ourStoryDescription}
                        </p>
                        <p className="text-lg leading-relaxed">

                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className={`p-8 rounded-2xl ${darkMode
                        ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-white/10"
                        : "bg-gradient-to-br from-cyan-50 to-blue-50 border-black/10"
                        } border`}>
                        <div className="text-center">
                          <FaRocket className={`text-6xl mx-auto mb-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`} />
                          <h4 className="text-2xl font-bold mb-2">{t.aboutUs.ourMission}</h4>
                          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {t.aboutUs.ourMissionDescription}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>

                {/* Values Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <motion.h3
                    className="text-3xl sm:text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Our Values
                  </motion.h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                      <motion.div
                        key={index}
                        className={`p-6 rounded-2xl text-center ${darkMode
                          ? "bg-black border-white/10"
                          : "bg-white border-black/10"
                          } border shadow-lg`}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{
                          scale: 1.05,
                          y: -10,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
                        }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.6,
                          type: "spring"
                        }}
                      >
                        <motion.div
                          className={`mb-4 bg-gradient-to-r ${value.color} bg-clip-text text-transparent`}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          {value.icon}
                        </motion.div>
                        <h4 className="text-xl font-bold mb-3">{value.title}</h4>
                        <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                          {value.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Team Section */}
                <motion.section
                  className="mb-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <motion.h3
                    className="text-3xl sm:text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {t.aboutUs.meetOurTeam}
                  </motion.h3>
                  <div className="grid md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
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
                          duration: 0.6,
                          type: "spring"
                        }}
                      >
                        <motion.img
                          src={member.image}
                          alt={member.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-gray-700/40"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <h4 className="text-xl font-bold mb-2">{member.name}</h4>
                        <p className={`text-sm font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent`}>
                          {member.role}
                        </p>
                        <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                          {member.bio}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* CTA Section */}
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
                    {t.aboutUs.joinCommunity}
                  </h3>
                  <p className={`mb-8 text-lg max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {t.aboutUs.joinCommunityDesc}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${darkMode
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                        : "bg-cyan-600 hover:bg-cyan-700 text-white"
                        } shadow-lg`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/")}
                    >
                      {t.aboutUs.getStartedToday}
                    </motion.button>
                    <motion.button
                      className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${darkMode
                        ? "border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                        : "border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white"
                        }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open('https://t.me/HustleXet', '_blank', 'noopener,noreferrer')}
                    >
                      {t.aboutUs.community}
                    </motion.button>
                  </div>
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

export default AboutUs;
