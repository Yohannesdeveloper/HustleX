import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import {
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
  FaHeart,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { isAuthenticated } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();

  return (
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
                { text: t.footer.howToHire, href: "/HowItWorks" },
                { text: t.footer.talentMarketplace, href: "#" },
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
                { text: t.footer.careers, href: "#" },
                { text: t.footer.contactUs, href: "/contact-us" },
              ],
            },
            {
              title: t.footer.resources,
              links: [
                { text: t.footer.helpCenter, href: "/help-center" },
                { text: t.footer.blog, href: "/blog" },
                { text: t.footer.community, href: "https://t.me/HustleXet" },
                { text: t.footer.api, href: "/api", isInternal: true },
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
  );
};

export default Footer;
