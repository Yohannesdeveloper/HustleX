import React from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import {
  X,
  MapPin,
  DollarSign,
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
} from "lucide-react";

interface FreelancerProfileViewProps {
  freelancer: any;
  onClose: () => void;
}

const FreelancerProfileView: React.FC<FreelancerProfileViewProps> = ({
  freelancer,
  onClose,
}) => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  if (!freelancer) return null;

  const profile = freelancer.profile || {};
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || freelancer.email;
  const skills = profile.skills || [];
  const primarySkill = profile.primarySkill || '';
  const location = profile.location || 'Not specified';
  const monthlyRate = profile.monthlyRate || '0';
  const currency = profile.currency || 'ETB';
  const bio = profile.bio || 'No bio available';
  const isProfileComplete = profile.isProfileComplete || false;
  const experience = profile.experience || '';
  const education = profile.education || 'Not specified';
  const portfolio = profile.portfolio || [];
  const languages = profile.languages || [];
  const availability = profile.availability || 'Not specified';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
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
      <motion.div
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl glass-card shadow-[0_0_60px_rgba(6,242,242,0.12)] ${
          darkMode ? "bg-black/70 border-cyan-500/20 text-white" : "bg-white/80 border-cyan-400/20 text-gray-900"
        }`}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Ambient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />
        </div>

        {/* Header */}
        <div className={`sticky top-0 z-10 glass-card backdrop-blur-xl border-b ${
          darkMode ? "bg-black/60 border-cyan-500/20" : "bg-white/80 border-cyan-400/20"
        }`}>
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display cyan-gradient-text">Review Your Profile</h1>
                <p className="text-sm font-body text-cyan-400">{fullName}'s professional profile</p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl glass-card transition-all hover:bg-cyan-500/10 ${darkMode ? "text-cyan-400 border-cyan-500/30" : "text-cyan-600 border-cyan-400/50"} border`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className={`rounded-2xl p-6 glass-card ${
                darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
              }`}>
                <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Name:</span>
                    <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{fullName}</span>
                  </div>
                  <div>
                    <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Email:</span>
                    <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{freelancer.email}</span>
                  </div>
                  {profile.phone && (
                    <div>
                      <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Phone:</span>
                      <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{profile.phone}</span>
                    </div>
                  )}
                  {location && location !== 'Not specified' && (
                    <div>
                      <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Location:</span>
                      <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Details Section */}
              {(primarySkill || experience || profile.yearsOfExperience || availability || monthlyRate !== '0' || profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl) && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Professional Details</h3>
                  <div className="space-y-3">
                    {primarySkill && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Primary Skill:</span>
                        <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{primarySkill}</span>
                      </div>
                    )}
                    {experience && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Experience Level:</span>
                        <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{experience}</span>
                      </div>
                    )}
                    {profile.yearsOfExperience && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Years of Experience:</span>
                        <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{profile.yearsOfExperience}</span>
                      </div>
                    )}
                    {availability && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Availability:</span>
                        <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{availability}</span>
                      </div>
                    )}
                    {monthlyRate !== '0' && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Monthly Rate:</span>
                        <span className={`ml-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currency} {monthlyRate}/month</span>
                      </div>
                    )}
                    {profile.portfolioUrl && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Portfolio:</span>
                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-400 hover:text-cyan-300 font-body">
                          {profile.portfolioUrl}
                        </a>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>LinkedIn:</span>
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-400 hover:text-cyan-300 font-body">
                          {profile.linkedinUrl}
                        </a>
                      </div>
                    )}
                    {profile.githubUrl && (
                      <div>
                        <span className={`font-medium font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>GitHub:</span>
                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-400 hover:text-cyan-300 font-body">
                          {profile.githubUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, index: number) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-sm font-body glass-card border border-cyan-500/30 text-cyan-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio Section */}
              {bio && bio !== 'No bio available' && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">About</h3>
                  <p className={`font-body leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {bio}
                  </p>
                </div>
              )}

              {/* Languages Section */}
              {languages.length > 0 && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language: string, index: number) => (
                      <span
                        key={language}
                        className="px-3 py-1 rounded-full text-sm font-body glass-card border border-emerald-500/30 text-emerald-400"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {education && education !== 'Not specified' && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Education</h3>
                  <p className={`font-body ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {education}
                  </p>
                </div>
              )}

              {/* Portfolio Section */}
              {portfolio.length > 0 && (
                <div className={`rounded-2xl p-6 glass-card ${
                  darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
                }`}>
                  <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Portfolio & Projects</h3>
                  <div className="space-y-3">
                    {portfolio.map((item: any, index: number) => (
                      <div key={index} className={`p-4 rounded-xl glass-card ${
                        darkMode ? "bg-black/20 border-cyan-500/20" : "bg-white/60 border-cyan-400/20"
                      } border`}>
                        <h4 className={`font-bold font-body ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {item.title || 'Project Title'}
                        </h4>
                        <p className={`text-sm font-body ${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
                          {item.description || 'Project description'}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-body text-sm mt-2 inline-block transition-colors"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Status */}
              <div className={`rounded-2xl p-6 glass-card ${
                darkMode ? "bg-black/40 border-cyan-500/20" : "bg-white/70 border-cyan-400/20"
              }`}>
                <h3 className="text-xl font-bold font-display mb-4 cyan-gradient-text">Profile Status</h3>
                <div className="flex items-center gap-2">
                  {isProfileComplete && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  <span className={`text-sm px-3 py-1 rounded-full font-body font-bold ${
                    isProfileComplete
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
                  </span>
                </div>
                <p className={`text-sm mt-2 font-body ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Member since {new Date(freelancer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerProfileView;
