import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Globe,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";

const ClientProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getPublicProfile(slug);
        if (data && data.user) {
          setClient(data.user);
        } else {
          setError("Profile not found");
        }
      } catch (err: any) {
        console.error("Error loading public profile:", err);
        setError(err.response?.data?.message || "Failed to load client profile.");
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
          <p className="text-lg font-medium animate-pulse text-cyan-400">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${darkMode ? "bg-gray-900/60 border-white/10" : "bg-white border-gray-200"} shadow-xl`}>
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error || "We couldn't find the company profile you were looking for. It may have been deactivated or removed."}
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

  const companyProfile = client.companyProfile || {};
  const companyName = companyProfile.companyName || `${client.profile?.firstName || ""} ${client.profile?.lastName || ""}`.trim() || "Elite HustleX Client";
  const logo = companyProfile.logo
    ? companyProfile.logo.startsWith("http") || companyProfile.logo.startsWith("data:")
      ? companyProfile.logo
      : apiService.getFileUrl(companyProfile.logo)
    : null;
  const description = companyProfile.description || "No company description available.";
  const industry = companyProfile.industry || "General / Technology";
  const website = companyProfile.website || "";
  const location = companyProfile.location || client.profile?.location || "Remote";
  const jobs = client.jobs || [];

  // Organization structured data
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyName,
    "description": description,
    "logo": logo || undefined,
    "url": website || undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location,
    },
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
        "name": "Clients",
        "item": "https://hustlex.com/job-listings",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": companyName,
        "item": `https://hustlex.com/clients/${slug}`,
      },
    ],
  };

  return (
    <div className={`min-h-screen pb-16 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <SEO
        title={`${companyName} | Hire Freelancers & Active Jobs | HustleX`}
        description={description.substring(0, 160)}
        keywords={[companyName, industry, "hire freelancers", "remote jobs", "company listings"]}
        canonical={`https://hustlex.com/clients/${slug}`}
        ogTitle={`${companyName} | Premium Client Company`}
        ogDescription={description.substring(0, 160)}
        ogImage={logo || "https://hustlex.com/og-image-home.jpg"}
        structuredData={[orgSchema, breadcrumbsSchema]}
      />

      {/* Decorative Top Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-sky-100 to-indigo-50" />
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
          {/* Company Sidebar Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md ${
                darkMode ? "bg-gray-900/90 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              {/* Logo / Initials */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="relative mb-4">
                  {logo ? (
                    <img
                      src={logo}
                      alt={companyName}
                      className={`w-28 h-28 rounded-3xl object-cover border-4 ${
                        darkMode ? "border-gray-800" : "border-white"
                      } shadow-lg`}
                    />
                  ) : (
                    <div
                      className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white border-4 shadow-lg ${
                        darkMode ? "border-gray-800" : "border-white"
                      }`}
                    >
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold">{companyName}</h1>
                <p className="text-indigo-500 font-semibold mt-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> {industry}
                </p>

                <div className="flex items-center gap-1.5 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" /> {location}
                </div>
              </div>

              {/* Meta details */}
              <div className="py-6 space-y-4 text-sm border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Industry</span>
                  <span className="font-semibold">{industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Open Jobs</span>
                  <span className="font-bold text-indigo-500 text-base">{jobs.length} Gigs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                  <span className="font-semibold">{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Contacts and Links */}
              <div className="pt-6 space-y-3">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">Connect</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.profile?.phone && (
                    <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.profile.phone}</span>
                    </div>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-indigo-500 hover:text-indigo-400 font-medium transition-colors text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">Visit Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-3xl border p-6 shadow-lg ${
                darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" />
                About {companyName}
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{description}</p>
            </motion.div>

            {/* Active Job Openings */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-3xl border p-6 shadow-lg ${
                darkMode ? "bg-gray-900/50 border-white/5" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Active Freelance Openings ({jobs.length})
              </h2>

              {jobs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">💼</div>
                  <p className="text-gray-500 dark:text-gray-400">No active job listings posted by this client at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job: any) => (
                    <div
                      key={job._id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        darkMode ? "bg-gray-800/40 border-gray-700 hover:border-indigo-500/40" : "bg-gray-50 border-gray-200 hover:border-indigo-400/50"
                      } hover:shadow-md group`}
                    >
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                          <Link to={`/job-details/${job._id}`}>{job.title}</Link>
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                          <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.category}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.workLocation} ({job.jobType})</span>
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Apply by {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-200 dark:border-gray-800">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Budget / Pay</p>
                          <p className="font-bold text-gray-900 dark:text-white mt-0.5">{job.budget}</p>
                        </div>
                        <Link
                          to={`/job-details/${job._id}`}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            darkMode
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          View Gig
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
