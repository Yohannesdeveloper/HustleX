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
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(6,242,242,0.15);
        }
        .dark .glass-card { background: rgba(0,0,0,0.4); }
        .cyan-gradient-text {
          background: linear-gradient(135deg, #06f2f2 0%, #0af 50%, #06f2f2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 242, 242, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 242, 242, 0.5); }
      `}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <motion.div
          className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl glass-card shadow-[0_0_60px_rgba(6,242,242,0.12)] ${
            darkMode ? "bg-black/70 border-cyan-500/20 text-white" : "bg-white/80 border-cyan-400/20 text-gray-900"
          }`}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Ambient blobs inside modal */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />
          </div>

          {/* Header */}
          <div
            className={`sticky top-0 z-10 glass-card backdrop-blur-xl border-b ${
              darkMode ? "bg-black/60 border-cyan-500/20" : "bg-white/80 border-cyan-400/20"
            }`}
          >
            <div className="max-w-5xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    {freelancer.status && (
                      <div className="absolute bottom-0 right-0">
                        <StatusIndicator status={freelancer.status} size="sm" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold font-display cyan-gradient-text flex items-center gap-2">
                      {fullName}
                      {isProfileComplete && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </h1>
                    <p className="text-sm font-body text-cyan-400">{primarySkill || "Freelancer"}</p>
                    {freelancer.status && (
                      <div className="mt-1">
                        <StatusIndicator
                          status={freelancer.status}
                          size="sm"
                          showLabel={true}
                          lastActive={freelancer.lastActive}
                          labelClassName="text-cyan-300"
                          lastActiveClassName="text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onMessage && (
                    <motion.button
                      onClick={onMessage}
                      className="px-4 py-2 rounded-xl font-bold font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </motion.button>
                  )}
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-xl glass-card transition-all hover:bg-cyan-500/10 ${darkMode ? "text-cyan-400 border-cyan-500/30" : "text-cyan-600 border-cyan-400/50"} border`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
            <div className="max-w-5xl mx-auto px-6 py-8">
              <div className="space-y-6">
                {/* Bio Section */}
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    About
                  </h3>
                  <p className={`leading-relaxed font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{bio}</p>
                </div>

                {/* Portfolio Section */}
                {portfolioUrl && (
                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-xl font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      Portfolio
                    </h3>
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    >
                      View Portfolio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Skills Section */}
                {skills.length > 0 && (
                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-xl font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <Award className="w-5 h-5 text-cyan-400" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-body glass-card border border-cyan-500/30 text-cyan-400"
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
                    <div className={`rounded-2xl p-6 glass-card ${
                      darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                    }`}>
                      <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Experience
                      </h3>
                      {yearsOfExperience && (
                        <p className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {yearsOfExperience} years
                        </p>
                      )}
                      {experience && (
                        <p className={`mt-2 font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {experience}
                        </p>
                      )}
                    </div>
                  )}

                  {education && (
                    <div className={`rounded-2xl p-6 glass-card ${
                      darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                    }`}>
                      <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                        <Award className="w-5 h-5 text-cyan-400" />
                        Education
                      </h3>
                      <p className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {education}
                      </p>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-xl font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <Star className="w-5 h-5 text-cyan-400" />
                      Certifications
                    </h3>
                    <ul className="space-y-2">
                      {certifications.map((cert, index) => (
                        <li key={index} className={`font-body flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Availability & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      Availability
                    </h3>
                    <p className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {availability}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      Location
                    </h3>
                    <p className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{location}</p>
                  </div>
                </div>

                {/* Contact & Social Links */}
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-3 cyan-gradient-text">Contact & Links</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {freelancer.email}
                      </span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span className={`font-body ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {profile.phone}
                        </span>
                      </div>
                    )}
                    {(profile.linkedinUrl || profile.linkedin) && (
                      <a
                        href={profile.linkedinUrl || profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-body transition-colors"
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
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-body transition-colors"
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
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-body transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* CV Download */}
                {cvUrl && (
                  <div className={`rounded-2xl p-6 glass-card ${
                    darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                  }`}>
                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 cyan-gradient-text">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Resume/CV
                    </h3>
                    <a
                      href={cvUrl}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20"
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
