import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import {
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
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  Linkedin,
  Github,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import StatusIndicator from "../components/StatusIndicator";

const FreelancerProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [freelancer, setFreelancer] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getPublicProfile(slug);
        if (data && data.user) {
          setFreelancer(data.user);
        } else {
          setError("Profile not found");
        }
      } catch (err: any) {
        console.error("Error loading public profile:", err);
        setError(err.response?.data?.message || "Failed to load freelancer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium animate-pulse text-cyan-400">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${darkMode ? "bg-gray-900/60 border-white/10" : "bg-white border-gray-200"} shadow-xl`}>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error || "We couldn't find the freelancer profile you were looking for. It may have been deactivated or removed."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/20"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = freelancer.profile || {};
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email;
  const skills = profile.skills || [];
  const primarySkill = profile.primarySkill || "Expert Freelancer";
  const location = profile.location || "Remote / Worldwide";
  const monthlyRate = profile.monthlyRate || "0";
  const currency = profile.currency || "ETB";
  const bio = profile.bio || "No professional overview available.";
  const isProfileComplete = profile.isProfileComplete || false;
  const experience = profile.experienceLevel || profile.experience || "Intermediate";
  const education = profile.education || "Not specified";
  const portfolioUrl = profile.portfolioUrl || "";
  const availability = profile.availability || "Available";
  const yearsOfExperience = profile.yearsOfExperience || "";
  const certifications = profile.certifications || [];
  const cvUrl = profile.cvUrl || "";
  const avatarUrl = profile.avatar
    ? profile.avatar.startsWith("http") || profile.avatar.startsWith("data:")
      ? profile.avatar
      : apiService.getFileUrl(profile.avatar)
    : null;

  // Schema structured data
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "description": bio,
    "jobTitle": primarySkill,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location,
    },
    "knowsAbout": skills,
    "image": avatarUrl || undefined,
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://hustlex.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Freelancers",
        "item": "https://hustlex.com/job-listings",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": fullName,
        "item": `https://hustlex.com/freelancers/${slug}`,
      },
    ],
  };

  const handleMessage = () => {
    navigate("/chat", {
      state: {
        freelancerId: freelancer._id,
        freelancer: freelancer,
      },
    });
  };

  return (
    <div className={`min-h-screen pb-16 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <SEO
        title={`${fullName} | Elite ${primarySkill} | HustleX`}
        description={bio.substring(0, 160)}
        keywords={[fullName, primarySkill, ...skills]}
        canonical={`https://hustlex.com/freelancers/${slug}`}
        ogTitle={`${fullName} | Elite ${primarySkill}`}
        ogDescription={bio.substring(0, 160)}
        ogImage={avatarUrl || "https://hustlex.com/og-image-home.jpg"}
        structuredData={[personSchema, breadcrumbsSchema]}
      />

      {/* Decorative Top Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-cyan-100 to-blue-50" />
        <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info Card */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${
                darkMode ? "bg-gray-900/90 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              {/* Avatar & Verification Status */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className={`w-28 h-28 rounded-3xl object-cover border-4 ${
                        darkMode ? "border-gray-800" : "border-white"
                      } shadow-lg`}
                    />
                  ) : (
                    <div
                      className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white border-4 shadow-lg ${
                        darkMode ? "border-gray-800" : "border-white"
                      }`}
                    >
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {freelancer.status && (
                    <div className="absolute bottom-0 right-0 scale-125">
                      <StatusIndicator status={freelancer.status} size="md" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {fullName}
                  {isProfileComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                </h1>
                <p className="text-cyan-500 font-semibold mt-1">{primarySkill}</p>

                <div className="flex items-center gap-1.5 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" /> {location}
                </div>

                <button
                  onClick={handleMessage}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-lg shadow-cyan-500/20"
                >
                  <MessageCircle className="w-5 h-5" /> Message Freelancer
                </button>
              </div>

              {/* Rates & Meta parameters */}
              <div className="py-6 space-y-4 text-sm border-b border-gray-200 dark:border-gray-800">
                {monthlyRate !== "0" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Monthly Rate</span>
                    <span className="font-bold text-base">
                      {currency} {monthlyRate}/mo
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Availability</span>
                  <span className="font-semibold">{availability}</span>
                </div>
                {yearsOfExperience && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Experience</span>
                    <span className="font-semibold">{yearsOfExperience} Years ({experience})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Education</span>
                  <span className="font-semibold text-right max-w-[150px] truncate" title={education}>
                    {education}
                  </span>
                </div>
              </div>

              {/* Social and External links */}
              <div className="pt-6 space-y-3">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">Connect</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{freelancer.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website Portfolio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-blue-500 hover:text-blue-400 font-medium transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-purple-500 hover:text-purple-400 font-medium transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* CV Download */}
              {cvUrl && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <a
                    href={cvUrl}
                    download
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      darkMode
                        ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        : "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                    }`}
                  >
                    <Download className="w-4 h-4" /> Download CV / Resume
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Professional Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Bio */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-3xl border p-6 shadow-lg ${
                darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-500" />
                Professional Summary
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{bio}</p>
            </motion.div>

            {/* Skills */}
            {skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className={`rounded-3xl border p-6 shadow-lg ${
                  darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-500" />
                  Skills & Core Technologies
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill: string) => (
                    <span
                      key={skill}
                      className={`px-4 py-1.5 rounded-2xl text-sm font-semibold transition-all border ${
                        darkMode
                          ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/40 hover:bg-cyan-900/40"
                          : "bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100/50"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Portfolio Projects */}
            {freelancer.projects && freelancer.projects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-3xl border p-6 shadow-lg ${
                  darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  Portfolio Case Studies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancer.projects.map((proj: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        darkMode ? "bg-gray-800/40 border-gray-700 hover:border-cyan-500/40" : "bg-gray-50 border-gray-200 hover:border-cyan-400/50"
                      } hover:shadow-md group`}
                    >
                      <h4 className="font-bold text-base flex items-center justify-between">
                        {proj.title}
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-500">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </h4>
                      <p className={`text-sm mt-2 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {proj.description}
                      </p>
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {proj.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-gray-200/50 dark:bg-gray-700/50 font-semibold text-gray-500 dark:text-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Certifications & Awards */}
            {certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className={`rounded-3xl border p-6 shadow-lg ${
                  darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-cyan-500" />
                  Certifications & Verified Badges
                </h2>
                <ul className="space-y-3">
                  {certifications.map((cert: string, index: number) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Award className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Internal Link Panel: Similar Specialists */}
            {freelancer.similarFreelancers && freelancer.similarFreelancers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`rounded-3xl border p-6 shadow-lg ${
                  darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  Related Specialists on HustleX
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {freelancer.similarFreelancers.map((sf: any) => {
                    const sfName = `${sf.profile?.firstName || ""} ${sf.profile?.lastName || ""}`.trim() || sf.email;
                    return (
                      <Link
                        key={sf.slug}
                        to={`/freelancers/${sf.slug}`}
                        className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          darkMode ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/70 hover:border-cyan-500/30 text-gray-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100/50 hover:border-cyan-500/30 text-gray-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold truncate text-sm">{sfName}</p>
                          <p className="text-xs text-cyan-500 truncate mt-0.5">{sf.profile?.primarySkill || "Freelancer"}</p>
                        </div>
                        <span className="text-cyan-500 font-semibold flex-shrink-0">View Profile &rarr;</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
