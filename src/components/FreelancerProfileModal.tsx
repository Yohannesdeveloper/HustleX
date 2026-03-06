import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import {
  X,
  MapPin,

  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Star,
  Award,
  Briefcase,
  Globe,
  Clock,
  Download,
  FileText,
  ExternalLink,
  Linkedin,
  Github,
  MessageCircle,
} from "lucide-react";
import StatusIndicator from "./StatusIndicator";
import { User } from "../types";
import { useNavigate } from "react-router-dom";

interface FreelancerProfileModalProps {
  freelancer: User & { status?: "online" | "offline" | "available" | "busy"; lastActive?: string };
  onClose: () => void;
  onMessage?: () => void;
}

const FreelancerProfileModal: React.FC<FreelancerProfileModalProps> = ({
  freelancer,
  onClose,
  onMessage,
}) => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  if (!freelancer) return null;

  const profile = freelancer.profile || {};
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email;
  const skills = profile.skills || [];
  const primarySkill = profile.primarySkill || "";
  const location = profile.location || "Not specified";
  const monthlyRate = profile.monthlyRate || "0";
  const currency = profile.currency || "ETB";
  const bio = profile.bio || "No bio available";
  const isProfileComplete = profile.isProfileComplete || false;
  const experience = profile.experience || (profile as any).workExperience || "";
  const education = profile.education || "Not specified";
  const portfolioUrl = profile.portfolioUrl || profile.portfolio || "";
  const availability = profile.availability || "Not specified";
  const yearsOfExperience = profile.yearsOfExperience || "";
  const certifications = profile.certifications || [];
  const cvUrl = profile.cvUrl || "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          className={`${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-black/10"
            } border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 ${darkMode ? "bg-gray-900/95 backdrop-blur-sm" : "bg-white/95 backdrop-blur-sm"
              } border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="max-w-5xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full ${darkMode ? "bg-cyan-500/20" : "bg-cyan-100"
                        } flex items-center justify-center text-2xl font-bold`}
                    >
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    {freelancer.status && (
                      <div className="absolute bottom-0 right-0">
                        <StatusIndicator status={freelancer.status} size="sm" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {fullName}
                      {isProfileComplete && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </h1>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {primarySkill || "Freelancer"}
                    </p>
                    {freelancer.status && (
                      <div className="mt-1">
                        <StatusIndicator
                          status={freelancer.status}
                          size="sm"
                          showLabel={true}
                          lastActive={freelancer.lastActive}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onMessage && (
                    <motion.button
                      onClick={onMessage}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${darkMode
                          ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                          : "bg-cyan-600 hover:bg-cyan-700 text-white"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </motion.button>
                  )}
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="max-w-5xl mx-auto px-6 py-8">
              <div className="space-y-6">
                {/* Bio Section */}
                <div
                  className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    About
                  </h3>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{bio}</p>
                </div>

                {/* Portfolio Section */}
                {portfolioUrl && (
                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Portfolio
                    </h3>
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${darkMode
                          ? "bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30"
                          : "bg-cyan-100 text-cyan-600 hover:bg-cyan-200"
                        } transition-colors`}
                    >
                      View Portfolio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Skills Section */}
                {skills.length > 0 && (
                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${darkMode
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-cyan-100 text-cyan-700"
                            }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(yearsOfExperience || experience) && (
                    <div
                      className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Experience
                      </h3>
                      {yearsOfExperience && (
                        <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {yearsOfExperience} years
                        </p>
                      )}
                      {experience && (
                        <p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {experience}
                        </p>
                      )}
                    </div>
                  )}

                  {education && (
                    <div
                      className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Education
                      </h3>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {education}
                      </p>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Certifications
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {certifications.map((cert, index) => (
                        <li
                          key={index}
                          className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Availability & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Availability
                    </h3>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {availability}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </h3>
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{location}</p>
                  </div>
                </div>

                {/* Contact & Social Links */}
                <div
                  className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <h3 className="text-xl font-semibold mb-3">Contact & Links</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {freelancer.email}
                      </span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {profile.phone}
                        </span>
                      </div>
                    )}
                    {(profile.linkedinUrl || profile.linkedin) && (
                      <a
                        href={profile.linkedinUrl || profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                      </a>
                    )}
                    {(profile.githubUrl || profile.github) && (
                      <a
                        href={profile.githubUrl || profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Profile
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* CV Download */}
                {cvUrl && (
                  <div
                    className={`rounded-lg border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Resume/CV
                    </h3>
                    <a
                      href={cvUrl}
                      download
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${darkMode
                          ? "bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30"
                          : "bg-cyan-100 text-cyan-600 hover:bg-cyan-200"
                        } transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                      Download CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FreelancerProfileModal;
