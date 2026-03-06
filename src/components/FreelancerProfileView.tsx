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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className={`${
          darkMode ? "bg-gray-800 border-white/10" : "bg-white border-black/10"
        } border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Review Your Profile</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {fullName}'s professional profile
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name:</span>
                    <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{fullName}</span>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
                    <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{freelancer.email}</span>
                  </div>
                  {profile.phone && (
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone:</span>
                      <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.phone}</span>
                    </div>
                  )}
                  {location && location !== 'Not specified' && (
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location:</span>
                      <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Details Section */}
              {(primarySkill || experience || profile.yearsOfExperience || availability || monthlyRate !== '0' || profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl) && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
                  <div className="space-y-3">
                    {primarySkill && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Primary Skill:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{primarySkill}</span>
                      </div>
                    )}
                    {experience && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Experience Level:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{experience}</span>
                      </div>
                    )}
                    {profile.yearsOfExperience && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Years of Experience:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.yearsOfExperience}</span>
                      </div>
                    )}
                    {availability && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Availability:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{availability}</span>
                      </div>
                    )}
                    {monthlyRate !== '0' && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Rate:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currency} {monthlyRate}/month</span>
                      </div>
                    )}
                    {profile.portfolioUrl && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Portfolio:</span>
                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                          {profile.portfolioUrl}
                        </a>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>LinkedIn:</span>
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                          {profile.linkedinUrl}
                        </a>
                      </div>
                    )}
                    {profile.githubUrl && (
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>GitHub:</span>
                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                          {profile.githubUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, index: number) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio Section */}
              {bio && bio !== 'No bio available' && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">About</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    {bio}
                  </p>
                </div>
              )}

              {/* Languages Section */}
              {languages.length > 0 && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language: string, index: number) => (
                      <span
                        key={language}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {education && education !== 'Not specified' && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">Education</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {education}
                  </p>
                </div>
              )}

              {/* Portfolio Section */}
              {portfolio.length > 0 && (
                <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4">Portfolio & Projects</h3>
                  <div className="space-y-3">
                    {portfolio.map((item: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {item.title || 'Project Title'}
                        </h4>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
                          {item.description || 'Project description'}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
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
              <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Profile Status</h3>
                <div className="flex items-center gap-2">
                  {isProfileComplete && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    isProfileComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
