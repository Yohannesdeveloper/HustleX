import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  GraduationCap,
  Cpu,
  CheckCircle2,
  DollarSign,
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
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "credentials">("overview");

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
    <div className={`min-h-screen pb-24 relative overflow-hidden font-body ${darkMode ? "bg-[#090f1e] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --cyan: #06f2f2;
          --cyan-dark: #05b8b8;
          --cyan-glow: 0 0 20px rgba(6, 242, 242, 0.3), 0 0 60px rgba(6, 242, 242, 0.1);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(6, 242, 242, 0.15);
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 242, 242, 0.2); }
          50% { box-shadow: 0 0 40px rgba(6, 242, 242, 0.4); }
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(40px, 10px) scale(1.05); }
        }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-blob-drift { animation: blob-drift 20s ease-in-out infinite; }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
        }
        .cyan-gradient-text {
          background: linear-gradient(135deg, #06f2f2 0%, #0af 50%, #06f2f2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .glass-card { background: rgba(0, 0, 0, 0.4); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 242, 242, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 242, 242, 0.5); }
      `}</style>

      {/* Ambient animated blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-blob-drift" />
        <motion.div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" style={{ animationDelay: "-7s" }} />
        <motion.div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[130px]" style={{ animationDelay: "-14s" }} />
      </div>

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

      {/* Modern Mesh Gradient & Pattern Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-950">
        {/* Mesh Gradient blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.22),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.22),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[linear-gradient(to_bottom,transparent_30%,rgba(9,15,30,0.85)_80%,#090f1e_100%)]" />
        
        {/* Colorful glows */}
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute top-10 right-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        {/* Back navigation */}
        <div className="max-w-7xl mx-auto px-6 h-full flex items-start pt-6">
          <button
            onClick={() => navigate(-1)}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold backdrop-blur-md transition-all duration-300 border ${
              darkMode
                ? "bg-slate-900/60 hover:bg-slate-800/80 text-cyan-400 border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                : "bg-white/85 hover:bg-white text-cyan-600 border-cyan-100 hover:border-cyan-200 shadow-sm"
            }`}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 md:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Profile Info Card (Sticky on Desktop) */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 self-start space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
              className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                darkMode 
                  ? "bg-slate-900/70 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-cyan-500/20" 
                  : "bg-white border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.05)] hover:border-cyan-200"
              }`}
            >
              {/* Avatar & Verification Status */}
              <div className="flex flex-col items-center text-center pb-8 border-b border-slate-800/50">
                <div className="relative mb-6 group cursor-pointer">
                  {/* Decorative glowing gradient ring */}
                  <div className="absolute -inset-1 rounded-[2.3rem] bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 opacity-60 blur-md group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
                  <div className={`relative p-[3px] rounded-[2.25rem] ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-32 h-32 rounded-[2rem] object-cover shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-5xl font-extrabold text-white shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {freelancer.status && (
                    <div className="absolute -bottom-1 -right-1 scale-125 bg-slate-950 dark:bg-slate-900 p-1.5 rounded-full border border-slate-800/80 shadow-md">
                      <StatusIndicator status={freelancer.status} size="md" />
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2 tracking-tight">
                  {fullName}
                  {isProfileComplete && (
                    <motion.span 
                      animate={{ scale: [1, 1.15, 1] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      title="Verified Professional"
                      className="flex-shrink-0"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    </motion.span>
                  )}
                </h1>
                
                <p className="text-cyan-400 font-bold text-xs mt-3.5 tracking-wider uppercase px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 inline-block">
                  {primarySkill}
                </p>

                <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 dark:text-slate-500 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{location}</span>
                </div>

                {/* Message Freelancer Button */}
                <button
                  onClick={handleMessage}
                  className="mt-8 relative group overflow-hidden w-full py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-center gap-2.5">
                    <MessageCircle className="w-5 h-5" />
                    <span>Message Freelancer</span>
                  </div>
                </button>
              </div>

              {/* Grid of Key Stats */}
              <div className="grid grid-cols-2 gap-3.5 py-8 border-b border-slate-800/50">
                {/* Rate Card */}
                <div className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-slate-800/25 border-slate-800 hover:bg-slate-800/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rate</span>
                  </div>
                  <p className="text-sm font-black mt-2 text-slate-200">
                    {monthlyRate !== "0" ? `${currency} ${monthlyRate}/mo` : "Neg."}
                  </p>
                </div>

                {/* Experience Card */}
                <div className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-slate-800/25 border-slate-800 hover:bg-slate-800/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tenure</span>
                  </div>
                  <p className="text-sm font-black mt-2 text-slate-200">
                    {yearsOfExperience ? `${yearsOfExperience} Yrs` : experience}
                  </p>
                </div>

                {/* Availability Card */}
                <div className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-slate-800/25 border-slate-800 hover:bg-slate-800/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status</span>
                  </div>
                  <p className="text-sm font-black mt-2 text-emerald-400">
                    {availability}
                  </p>
                </div>

                {/* Education Card */}
                <div className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                  darkMode ? "bg-slate-800/25 border-slate-800 hover:bg-slate-800/40" : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Education</span>
                  </div>
                  <p className="text-sm font-black mt-2 text-slate-200 truncate" title={education}>
                    {education !== "Not specified" ? education : "Degree"}
                  </p>
                </div>
              </div>

              {/* Social and External Links */}
              <div className="pt-8 space-y-4">
                <h3 className="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Connect & Contact</h3>
                <div className="flex flex-col gap-2.5">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
                    darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-100"
                  }`}>
                    <Mail className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate text-sm font-semibold text-slate-350">{freelancer.email}</span>
                  </div>
                  {profile.phone && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
                      darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-100"
                    }`}>
                      <Phone className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-350">{profile.phone}</span>
                    </div>
                  )}
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 group ${
                        darkMode 
                          ? "bg-slate-800/20 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-slate-350 hover:text-cyan-400" 
                          : "bg-slate-50 border-slate-100 hover:border-cyan-200 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4.5 h-4.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-sm font-bold">Portfolio Site</span>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 group ${
                        darkMode 
                          ? "bg-slate-800/20 border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/5 text-slate-350 hover:text-blue-400" 
                          : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-4.5 h-4.5 text-[#0077b5] group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-sm font-bold">LinkedIn Profile</span>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 group ${
                        darkMode 
                          ? "bg-slate-800/20 border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-350 hover:text-purple-400" 
                          : "bg-slate-50 border-slate-100 hover:border-purple-200 hover:bg-purple-50 text-slate-600 hover:text-purple-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-4.5 h-4.5 text-[#24292e] dark:text-white group-hover:rotate-6 transition-transform duration-300" />
                        <span className="text-sm font-bold">GitHub Profile</span>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>

              {/* CV Download Button */}
              {cvUrl && (
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                  <a
                    href={cvUrl}
                    download
                    className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                      darkMode
                        ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                    }`}
                  >
                    <Download className="w-4.5 h-4.5 animate-bounce" /> 
                    <span>Download CV / Resume</span>
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Panel: Interactive Tabs and Dynamic Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Control Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`p-1.5 rounded-2xl flex gap-1.5 max-w-lg shadow-lg ${
                darkMode ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md" : "bg-slate-100 border border-slate-200/60"
              }`}
            >
              {(["overview", "portfolio", "credentials"] as const).map((tab) => {
                const label = tab === "overview" ? "Overview" : tab === "portfolio" ? "Portfolio Projects" : "Background";
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 py-3.5 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-300 z-10 ${
                      isActive 
                        ? "text-white"
                        : darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-xl z-[-1] shadow-md bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span>{label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Dynamic Tab Panes */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Bio Description */}
                  <div className={`rounded-3xl border p-8 shadow-xl text-left ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 tracking-tight text-slate-100 dark:text-white">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                      <span>Professional Biography</span>
                    </h2>
                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
                      <p className={`pl-5 leading-relaxed text-base font-semibold whitespace-pre-line ${
                        darkMode ? "text-slate-300" : "text-slate-600"
                      }`}>
                        {bio}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid Section */}
                  {skills.length > 0 && (
                    <div className={`rounded-3xl border p-8 shadow-xl text-left ${
                      darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                    }`}>
                      <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 tracking-tight text-slate-100 dark:text-white">
                        <Cpu className="w-6 h-6 text-cyan-400" />
                        <span>Core Tech Stack & Expertise</span>
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {skills.map((skill: string) => (
                          <motion.span
                            key={skill}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`px-5 py-3 rounded-2xl text-xs font-black tracking-wide transition-all border flex items-center gap-2 shadow-sm ${
                              darkMode
                                ? "bg-slate-800/35 hover:bg-cyan-500/10 text-cyan-300 border-slate-700/60 hover:border-cyan-500/40"
                                : "bg-cyan-50 hover:bg-cyan-100/50 text-cyan-700 border-cyan-100 hover:border-cyan-200"
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>{skill}</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "portfolio" && (
                <motion.div
                  key="portfolio-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className={`rounded-3xl border p-8 shadow-xl text-left ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 tracking-tight text-slate-100 dark:text-white">
                      <Globe className="w-6 h-6 text-cyan-400" />
                      <span>Case Studies & Projects</span>
                    </h2>
                    {freelancer.projects && freelancer.projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {freelancer.projects.map((proj: any, idx: number) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -6 }}
                            className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                              darkMode
                                ? "bg-slate-800/20 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/40 shadow-lg hover:shadow-cyan-500/5"
                                : "bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-white shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="font-extrabold text-lg text-slate-200 dark:text-white leading-snug">
                                  {proj.title}
                                </h4>
                                {proj.url && (
                                  <a
                                    href={proj.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                              <p className={`text-sm mt-3 leading-relaxed font-semibold ${
                                darkMode ? "text-slate-400" : "text-slate-650"
                              }`}>
                                {proj.description}
                              </p>
                            </div>
                            {proj.tags && proj.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-slate-800/50">
                                {proj.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className={`text-[9px] px-2.5 py-1 rounded-lg font-black tracking-wider uppercase border ${
                                      darkMode
                                        ? "bg-slate-900/60 border-slate-700/50 text-slate-400"
                                        : "bg-slate-200/50 border-slate-350 text-slate-505"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-550 font-bold">No case studies uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "credentials" && (
                <motion.div
                  key="credentials-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Certifications and Badges Grid */}
                  <div className={`rounded-3xl border p-8 shadow-xl text-left ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 tracking-tight text-slate-100 dark:text-white">
                      <Star className="w-6 h-6 text-cyan-400" />
                      <span>Verified Certifications</span>
                    </h2>
                    {certifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {certifications.map((cert: string, index: number) => (
                          <div
                            key={index}
                            className={`flex gap-4 p-5 rounded-2xl border ${
                              darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-150"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                              <Award className="w-5.5 h-5.5 text-cyan-400" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-extrabold text-sm text-slate-200 leading-snug">{cert}</h4>
                              <p className="text-xs text-slate-500 mt-1 font-semibold">Verified Credential</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-550 font-bold">No verified credentials listed yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Preferences grid */}
                  <div className={`rounded-3xl border p-8 shadow-xl text-left ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 tracking-tight text-slate-100 dark:text-white">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                      <span>Work Setup & Preferences</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`p-5 rounded-2xl border text-center ${
                        darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-150"
                      }`}>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Job Setup</p>
                        <p className="text-base font-extrabold text-slate-200 mt-2">{profile.workLocation || "Remote"}</p>
                      </div>
                      <div className={`p-5 rounded-2xl border text-center ${
                        darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-150"
                      }`}>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Experience Level</p>
                        <p className="text-base font-extrabold text-slate-200 mt-2">{experience}</p>
                      </div>
                      <div className={`p-5 rounded-2xl border text-center ${
                        darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-50 border-slate-150"
                      }`}>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Preferred Arrangement</p>
                        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                          {profile.preferredJobTypes && profile.preferredJobTypes.length > 0 ? (
                            profile.preferredJobTypes.map((type: string) => (
                              <span key={type} className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-extrabold uppercase tracking-wide">{type}</span>
                            ))
                          ) : (
                            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-extrabold uppercase tracking-wide">Contract / Full-time</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Similar Specialists Panel */}
            {freelancer.similarFreelancers && freelancer.similarFreelancers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-3xl border p-8 shadow-xl text-left ${
                  darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                }`}
              >
                <h3 className="text-xl font-extrabold mb-5 flex items-center gap-2.5 text-slate-100 dark:text-white">
                  <Clock className="w-5.5 h-5.5 text-cyan-400" />
                  <span>Related Specialists on HustleX</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freelancer.similarFreelancers.map((sf: any) => {
                    const sfName = `${sf.profile?.firstName || ""} ${sf.profile?.lastName || ""}`.trim() || sf.email;
                    return (
                      <Link
                        key={sf.slug}
                        to={`/freelancers/${sf.slug}`}
                        className={`p-4 rounded-2xl border text-sm font-semibold transition-all duration-300 flex items-center justify-between group ${
                          darkMode 
                            ? "bg-slate-800/20 border-slate-805 hover:bg-slate-800/40 hover:border-cyan-500/30 text-slate-200" 
                            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-cyan-300 text-slate-700 shadow-sm"
                        }`}
                      >
                        <div className="truncate pr-3 text-left">
                          <p className="font-extrabold truncate text-slate-200 group-hover:text-cyan-400 transition-colors">{sfName}</p>
                          <p className="text-xs text-cyan-500 font-bold truncate mt-0.5">{sf.profile?.primarySkill || "Freelancer"}</p>
                        </div>
                        <span className="text-cyan-400 font-black flex-shrink-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom bar for mobile screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-950/85 backdrop-blur-xl border-t border-slate-850 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 truncate">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-11 h-11 rounded-xl object-cover border-2 border-cyan-500/30 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 scale-90 bg-slate-950 p-0.5 rounded-full border border-slate-850">
              <StatusIndicator status={freelancer.status || "available"} size="sm" />
            </div>
          </div>
          <div className="truncate text-left">
            <p className="text-xs font-black text-white truncate">{fullName}</p>
            <p className="text-[10px] text-cyan-400 font-bold truncate mt-0.5">{primarySkill}</p>
          </div>
        </div>
        <button
          onClick={handleMessage}
          className="flex-shrink-0 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-transform"
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
