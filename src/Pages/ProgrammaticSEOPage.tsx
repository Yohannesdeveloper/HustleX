import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  HelpCircle,
  Link2,
  AlertCircle,
  Briefcase,
  Users,
  DollarSign,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";

interface ProgrammaticData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  headline: string;
  introduction: string;
  stats: {
    count: number;
    avgRate: string;
  };
  listHeadline: string;
  items: Array<{
    title: string;
    subtitle: string;
    snippet: string;
    url: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  breadcrumbsName: string;
  relatedLinks: Array<{
    name: string;
    url: string;
  }>;
}

const ProgrammaticSEOPage: React.FC = () => {
  const { skill, locationOrSkill, jobTitle } = useParams<any>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgrammaticData | null>(null);

  useEffect(() => {
    const fetchProgrammaticData = async () => {
      setLoading(true);
      setError(null);

      let type = "";
      let slug = "";

      // Determine page type and slug based on route URL structure
      if (pathname.startsWith("/hire-") && pathname.endsWith("-developers")) {
        type = "hire-developers";
        slug = pathname.replace("/hire-", "").replace("-developers", "");
      } else if (pathname.startsWith("/freelancers/") && locationOrSkill) {
        slug = locationOrSkill;
        // Try fetching freelancers-skill first, if it fails fallback to freelancers-location
        try {
          const res = await apiService.getProgrammaticSEOData("freelancers-skill", slug);
          if (res) {
            setData(res);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to location search
          type = "freelancers-location";
        }
      } else if (pathname.startsWith("/jobs/") && jobTitle) {
        type = "jobs-title";
        slug = jobTitle;
      } else if (pathname.startsWith("/skills/") && skill) {
        type = "skills-page";
        slug = skill;
      }

      if (!type && !data) {
        setError("Invalid URL parameters for landing page");
        setLoading(false);
        return;
      }

      try {
        const res = await apiService.getProgrammaticSEOData(type, slug);
        if (res) {
          setData(res);
        } else {
          setError("Landing page data not available for this keyword");
        }
      } catch (err: any) {
        console.error("Programmatic page data fetch failed:", err);
        setError(err.response?.data?.message || "Failed to load custom landing page.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammaticData();
  }, [pathname, skill, locationOrSkill, jobTitle]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium animate-pulse text-cyan-400">Loading custom directory...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${darkMode ? "bg-gray-900/60 border-white/10" : "bg-white border-gray-200"} shadow-xl`}>
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold mb-2">Directory Landing Page</h1>
          <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error || "This specific category directory is empty. Browse our standard job listings or search for freelancers."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/job-listings")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg"
            >
              Browse Open Jobs
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold border border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FAQ Schema Structured Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
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
        "name": data.breadcrumbsName,
        "item": `https://hustlex.com${pathname}`,
      },
    ],
  };

  const isFreelancerList = pathname.includes("freelancers") || pathname.includes("hire-") || pathname.includes("skills");

  return (
    <div className={`min-h-screen pb-16 relative overflow-hidden ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <SEO
        title={data.metaTitle}
        description={data.metaDescription}
        keywords={data.keywords}
        canonical={`https://hustlex.com${pathname}`}
        ogTitle={data.headline}
        ogDescription={data.metaDescription}
        ogImage="https://hustlex.com/og-image-home.jpg"
        structuredData={[faqSchema, breadcrumbsSchema]}
      />

      {/* Hero section */}
      <div className="relative py-20 bg-gradient-to-br from-cyan-900/40 via-blue-900/20 to-gray-950/10 border-b border-gray-200/50 dark:border-white/5">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-blue-500 to-transparent blur-2xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
                darkMode ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-cyan-50 text-cyan-700 border-cyan-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Premium Verified Talent Directory
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              {data.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-lg md:text-xl mt-6 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {data.introduction}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <button
                onClick={() => navigate("/signup?role=client")}
                className="px-6 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(isFreelancerList ? "/job-listings" : "/")}
                className={`px-6 py-3.5 rounded-2xl font-bold border transition-all ${
                  darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                }`}
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Listings Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-800"
            >
              <h2 className="text-2xl font-extrabold">{data.listHeadline}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                darkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"
              }`}>
                Live Feed
              </span>
            </motion.div>

            <div className="space-y-4">
              {data.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    darkMode ? "bg-gray-900/40 border-white/5 hover:border-cyan-500/30" : "bg-white border-gray-100 hover:border-cyan-400/50"
                  } hover:shadow-lg group`}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-extrabold text-xl group-hover:text-cyan-500 transition-colors">
                          <Link to={item.url}>{item.title}</Link>
                        </h3>
                        <p className={`text-sm mt-1.5 font-bold ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <p className={`text-sm mt-3 leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {item.snippet}
                    </p>
                  </div>
                  <div className="border-t border-gray-200/50 dark:border-gray-800 pt-3 flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Vetted Member</span>
                    <Link to={item.url} className="text-cyan-500 hover:underline flex items-center gap-1">
                      View Profile <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Semantic SEO detailed benefits */}
            <div className={`p-8 rounded-3xl border ${darkMode ? "bg-gray-900/20 border-white/5" : "bg-white border-gray-200"} space-y-6`}>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-500" /> Why Hire on HustleX?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-bold mb-1.5 text-gray-900 dark:text-white">🚀 Verified Portfolio Vetting</h4>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    Every freelancer undergoes rigorous screening of their code projects, past ratings, and skill sets to ensure you interact with top talent.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-gray-900 dark:text-white">🔒 100% Escrow Protection</h4>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    Payments are released only after you review and approve deliverables. No upfront risk for your business development.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-gray-900 dark:text-white">⏱️ Swift Hiring Cycles</h4>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    From posting your job description to final candidate onboarding, our average hiring timeline is under 24 hours.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-gray-900 dark:text-white">💬 Direct Live Messaging</h4>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    Chat live with applicants immediately, negotiate rates, set scope expectations, and manage tasks seamlessly from our platform dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Search FAQ Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-cyan-500" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {data.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border ${
                      darkMode ? "bg-gray-900/30 border-white/5" : "bg-white border-gray-200"
                    }`}
                  >
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                    <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Columns (Stats & Related links) */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-6 shadow-xl ${
                darkMode ? "bg-gray-900/90 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-3 border-gray-200 dark:border-gray-800">
                <TrendingUp className="w-5 h-5 text-cyan-500" /> Market Statistics
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    darkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400 font-semibold">Active Pool</span>
                    <span className="text-2xl font-black text-cyan-500">{data.stats.count} Experts</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}>
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400 font-semibold">Average Pay</span>
                    <span className="text-xl font-black">{data.stats.avgRate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                  }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400 font-semibold">Avg. Onboarding</span>
                    <span className="text-xl font-bold">24 Hours</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Related Queries Linking Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-3xl border p-6 shadow-xl ${
                darkMode ? "bg-gray-900/90 border-white/10" : "bg-white border-gray-200"
              }`}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-3 border-gray-200 dark:border-gray-800">
                <Link2 className="w-5 h-5 text-cyan-500" /> Related Searches
              </h3>
              <div className="flex flex-col gap-2.5">
                {data.relatedLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.url}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                      darkMode
                        ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/70 hover:border-cyan-500/30 text-gray-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100/50 hover:border-cyan-500/30 text-gray-700"
                    }`}
                  >
                    <span className="truncate pr-2">{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammaticSEOPage;
