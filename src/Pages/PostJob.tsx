import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import { useTranslation } from "../hooks/useTranslation";
import { Job as JobTypeFromAPI, User, Application, EmailData } from "../types";
import { HireSEO } from "../components/SEO";
import { categories, ALL_SKILLS_WITH_TECH } from "../constants/skills";

// Then, in your code, replace Job with JobTypeFromAPI where needed:

import {
  Briefcase,
  MapPin,
  UserCheck,
  Link as LinkIcon,
  Send,
  ArrowLeft,
  X,
} from "lucide-react";

// Comprehensive list of worldwide countries (ISO 3166-1)
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Other",
];

// Expanded, specific job categories
// (imported from ../constants/skills)

const experienceLevels = [
  "Internship",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "Executive",
  "Expert",
];

const jobTypes = ["Remote", "Freelance", "Part-time", "Full-time", "Contract"];

// New constants
const jobSites = [
  "HustleX",
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Upwork",
  "Freelancer",
  "Fiverr",
  "Toptal",
  "Remote.co",
  "We Work Remotely",
  "SimplyHired",
  "ZipRecruiter",
  "Monster",
  "CareerBuilder",
  "Stack Overflow Jobs",
  "Behance",
  "Dribbble",
  "Other",
];

const jobSectors = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Construction",
  "Transportation",
  "Energy",
  "Media & Entertainment",
  "Government",
  "Non-profit",
  "Agriculture",
  "Legal",
  "Real Estate",
  "Telecommunications",
  "Aerospace",
  "Automotive",
  "Fashion",
  "Food & Beverage",
  "Mining",
  "Pharmaceutical",
  "Sports",
  "Tourism",
  "Architecture",
  "Logistics",
  "Insurance",
  "Other",
];

const compensationTypes = [
  "Fixed",
  "Hourly",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Negotiable",
];

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "AUD",
  "CAD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "BRL",
  "MXN",
  "ZAR",
  "KRW",
  "SGD",
  "HKD",
  "NZD",
  "ETB",
  "NGN",
  "KES",
  "GHS",
  "Other",
];

const skillsOptions = ALL_SKILLS_WITH_TECH;

const genders = ["Any", "Male", "Female", "Other"];

const workLocations = ["Remote", "Onsite", "Hybrid"];

// Animation for individual letters in headings
const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

// Animation for form sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

// Animation for inputs and buttons
const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

const getFieldClass = (darkMode: boolean, hasError?: boolean, touched?: boolean) => {
  const base = "w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none";
  const color = darkMode
    ? "bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 backdrop-blur-xl"
    : "bg-white/80 border-black/10 text-gray-900 placeholder:text-gray-400";
  const focus = "focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50";
  const error = hasError && touched
    ? "!border-red-500 !ring-2 !ring-red-500/20"
    : "";
  return `${base} ${color} ${focus} ${error}`;
};

interface Job {
  _id: string; // Made optional for creation
  title: string;
  description: string;
  company?: string;
  budget?: string;
  category: string;
  jobType: string;
  workLocation: string;
  deadline?: string;
  experience?: string;

  skills?: string[];
  visibility?: "public" | "private";
  jobLink?: string | null;
  gender?: string;
  vacancies?: number;
  address?: string | null;
  country?: string;
  city?: string | null;
  education?: string | null;
  status?: string;
  applicants?: number;
  views?: number;
  postedBy: string | User; // Keep this consistent
  isActive?: boolean;
  applicationCount?: number;
}

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  // Allow all users to access PostJob page (auth not required for Mini App access)
  // Role checking removed for error-free access

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [jobSite, setJobSite] = useState<string>("");
  const [jobSector, setJobSector] = useState<string>("");
  const [compensationType, setCompensationType] = useState<string>("");
  const [compensationAmount, setCompensationAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [deadline, setDeadline] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [workLocation, setWorkLocation] = useState<string>("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState<string>("");
  const [showSkillDropdown, setShowSkillDropdown] = useState<boolean>(false);
  const skillDropdownRef = React.useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [jobLink, setJobLink] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [vacancies, setVacancies] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [postingStatus, setPostingStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Set default deadline to 15 days from today
  useEffect(() => {
    if (!deadline) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15);
      const formattedDate = defaultDate.toISOString().split('T')[0];
      setDeadline(formattedDate);
    }
  }, []);

  // Auto-populate company name from user profile
  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        // Try to get company profile first
        const companyProfile = await apiService.getCompanyProfile();
        if (companyProfile && companyProfile.companyName) {
          setCompany(companyProfile.companyName);
        }
      } catch {
        // If no company profile, try to use user's profile
        if (user?.profile?.firstName || user?.profile?.lastName) {
          const fullName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
          if (fullName) {
            setCompany(fullName);
          }
        }
      }
    };
    
    if (isAuthenticated && user) {
      loadCompanyProfile();
    }
  }, [isAuthenticated, user]);

  // Check subscription status on mount
  useEffect(() => {
    const checkPostingStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await apiService.getJobPostingStatus();
          setPostingStatus(status);
        } catch (error) {
          console.error("Error checking posting status:", error);
        } finally {
          setLoadingStatus(false);
        }
      }
    };
    checkPostingStatus();
  }, [isAuthenticated]);

  // Authentication check moved to form submission

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ONLY required fields validation (matching backend requirements)
    if (!title.trim()) {
      newErrors.title = "Job title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Job description is required";
    } else if (description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    // Budget/Compensation - at least one should be provided
    if (!compensationType) {
      newErrors.compensationType = "Compensation type is required";
    }

    // Optional field validations (only validate if provided)
    if (compensationAmount && (isNaN(Number(compensationAmount)) || Number(compensationAmount) < 0)) {
      newErrors.compensationAmount = "Please enter a valid amount";
    }

    if (vacancies && (isNaN(Number(vacancies)) || Number(vacancies) < 1)) {
      newErrors.vacancies = "Vacancies must be at least 1";
    }

    if (jobLink && jobLink.trim()) {
      try {
        new URL(jobLink);
      } catch {
        newErrors.jobLink = "Please enter a valid URL";
      }
    }

    if (deadline) {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // Mark only required fields as touched to show errors
      const requiredFields = ['title', 'description', 'category', 'compensationType'];
      const allTouched: Record<string, boolean> = {};
      requiredFields.forEach(field => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      
      // Show more helpful error message
      const errorCount = Object.keys(errors).length;
      console.log(`Validation failed with ${errorCount} error(s):`, errors);
      return;
    }

    // Check subscription status before submitting
    if (postingStatus && !postingStatus.canPost) {
      alert(postingStatus.message || t.postJob.upgradeMessage);
      navigate("/pricing");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        title,
        description,
        company,
        category,
        jobSite,
        jobSector,
        compensationType,
        compensationAmount,
        currency,
        budget: compensationAmount ? `${compensationAmount} ${currency}` : "",
        deadline,
        experience,
        jobType,
        workLocation,
        skills,
        visibility,
        jobLink: jobLink.trim() || null,
        gender,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        address: address.trim() || null,
        country,
        city: city.trim() || null,
        education: education.trim() || null,
        status: "active",
        applicants: 0,
        views: 0,
        jobId: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        postedBy: user?._id || "anonymous",
        isActive: true,
        applicationCount: 0,
      };

      const response = await apiService.createJob(jobData);

      console.log("Job posted successfully:", response);

      // Navigate to preview page with job data
      navigate("/preview-job", {
        state: {
          jobData: response.job,
        },
      });
    } catch (error: any) {
      console.error("Error posting job:", error);

      // Handle subscription-related errors
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.code === "FREE_TRIAL_LIFETIME_LIMIT_REACHED" ||
          errorData.code === "FREE_TRIAL_LIMIT_REACHED" ||
          errorData.code === "MONTHLY_LIMIT_REACHED" ||
          errorData.code === "SUBSCRIPTION_EXPIRED" ||
          errorData.code === "SUBSCRIPTION_EXPIRED_LIFETIME_LIMIT" ||
          errorData.code === "SUBSCRIPTION_INACTIVE") {
          const errorMsg = errorData.isLifetimeLimit
            ? `❌ ${errorData.message}\n\nThis is a lifetime limit. You must upgrade to a paid plan to post any more jobs.`
            : `❌ ${errorData.message}\n\nPlease upgrade your plan to continue posting jobs.`;
          alert(errorMsg);
          navigate("/pricing");
          return;
        }
      }

      const errorMessage =
        error.response?.data?.message || error.message || "Please try again.";
      alert(`❌ ${t.postJob.errorPostingJob} ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      if (skills.length < 6) {
        setSkills((prev) => [...prev, skill]);
      } else {
        alert(t.postJob.maximumSkillsReached);
      }
    }
  };

  const maxDescriptionLength = 5000;
  const descriptionCharsLeft = maxDescriptionLength - description.length;

  return (
    <>
      <HireSEO />
      <div
        className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"
          } px-6 pt-20 pb-12 flex flex-col items-center relative z-10`}
      >
      {/* Font Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Poppins:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
          .font-inter {
            font-family: 'Inter', 'Poppins', sans-serif;
            font-weight: 700;
            letter-spacing: 0.02em;
            line-height: 1.2;
          }

          .glass-card {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          :root:not(.dark) .glass-card {
            background: rgba(255, 255, 255, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }
            50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.3); }
          }
          @keyframes blob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -50px) scale(1.1); }
            50% { transform: translate(-20px, -20px) scale(0.9); }
            75% { transform: translate(20px, 20px) scale(1.05); }
          }
          @keyframes blob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-30px, 30px) scale(1.1); }
            50% { transform: translate(20px, -30px) scale(0.9); }
            75% { transform: translate(-20px, 10px) scale(1.05); }
          }
          @keyframes blob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(40px, 20px) scale(1.1); }
            50% { transform: translate(-10px, 40px) scale(0.9); }
            75% { transform: translate(-30px, -10px) scale(1.05); }
          }

          .shimmer-text {
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shimmer 3s linear infinite;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: ${darkMode ? "invert(1) brightness(1.5)" : "none"};
            cursor: pointer;
          }
          input[type="date"] {
            color-scheme: ${darkMode ? "dark" : "light"};
            color: ${darkMode ? "white" : "black"};
          }

          .input-error {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
          }
          .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        `}
      </style>

      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
            animation: "blob1 20s infinite ease-in-out",
          }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
            animation: "blob2 25s infinite ease-in-out",
          }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            animation: "blob3 18s infinite ease-in-out",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mb-12"
      >
        <motion.h2
          className={`text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center font-inter tracking-tight shimmer-text`}
          style={{ backgroundImage: "linear-gradient(135deg, #06b6d4, #3b82f6, #06b6d4)" }}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            textShadow: darkMode
              ? "0 0 20px rgba(6, 182, 212, 0.6)"
              : "0 0 12px rgba(6, 182, 212, 0.5)",
            transition: { duration: 0.3 },
          }}
        >
          {t.postJob.postAJob.split("").map((char, i: number) => (
            <motion.span key={i} variants={letterVariants} custom={i}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
        <p
          className={`text-center text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
            } mt-4`}
        >
          {t.postJob.createAttractiveListing}
        </p>
      </motion.div>

      {/* Subscription Status Banner */}
      {
        !loadingStatus && postingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 w-full max-w-5xl glass-card ${postingStatus.canPost
              ? darkMode
                ? "bg-green-900/20 border-green-500/50"
                : "bg-green-50 border-green-500"
              : darkMode
                ? "bg-red-900/20 border-red-500/50"
                : "bg-red-50 border-red-500"
              }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-black"
                    }`}
                >
                  {postingStatus.canPost
                    ? `${t.postJob.canPostJobs} (${postingStatus.planName})`
                    : t.postJob.cannotPostJobs}
                </h3>
                <p
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  {postingStatus.canPost ? (
                    <>
                      {postingStatus.limits.type === "lifetime"
                        ? `${t.postJob.lifetimeJobsPosted} ${postingStatus.limits.current}/${postingStatus.limits.limit} (${t.postJob.freeTrial})`
                        : postingStatus.limits.type === "total"
                          ? `${t.postJob.totalJobsPosted} ${postingStatus.limits.current}/${postingStatus.limits.limit}`
                          : postingStatus.limits.limit === -1
                            ? `${t.postJob.monthlyJobsPosted} ${postingStatus.stats.monthlyJobs} (${t.postJob.unlimitedLabel})`
                            : `${t.postJob.monthlyJobsPosted} ${postingStatus.limits.current}/${postingStatus.limits.limit} (${postingStatus.limits.remaining} ${t.postJob.remainingLabel})`}
                      {postingStatus.expiresAt && (
                        <span className="ml-2">
                          • {t.postJob.expiresLabel} {new Date(postingStatus.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  ) : (
                    postingStatus.message || t.postJob.upgradeMessage
                  )}
                </p>
              </div>
              {!postingStatus.canPost && (
                <button
                  onClick={() => navigate("/pricing")}
                  className={`px-6 py-2 rounded-lg font-bold shadow-lg transform transition hover:scale-105 active:scale-95 ${darkMode
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white"
                    }`}
                >
                  {t.postJob.upgradePlan}
                </button>
              )}
            </div>
          </motion.div>
        )
      }

      {!loadingStatus && postingStatus && !postingStatus.canPost ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl p-12 rounded-3xl border-2 text-center shadow-2xl glass-card border-cyan-500/30"
        >
          <div className="mb-8 relative inline-block">
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full text-white shadow-xl">
                <Briefcase size={48} className="animate-bounce" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg">
              <Send size={20} />
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-4 font-inter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {postingStatus.limits.type === "lifetime" ? t.postJob.freeTrialLimitReached : t.postJob.upgradeRequired}
          </h3>

          <p className="text-lg mb-8 leading-relaxed text-gray-400">
            {postingStatus.message || t.postJob.jobLimitMessage}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/pricing")}
              className="w-full py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl transform transition hover:scale-105 active:scale-95"
            >
              🚀 {t.postJob.upgradePlan}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 text-lg font-semibold rounded-2xl border-2 border-white/10 hover:bg-white/[0.04] text-gray-300 transition-colors"
            >
              {t.postJob.goBack}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400">
              {t.postJob.needHelp} <button onClick={() => navigate("/contact-us")} className="text-cyan-400 hover:underline">{t.postJob.contactSupport}</button>
            </p>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-12">
          {/* Job Details Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="glass-card border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-cyan-400" />
              <motion.h3
                className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-inter tracking-tight"
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {t.postJob.jobDetails.split("").map((char, i: number) => (
                  <motion.span key={i} variants={letterVariants} custom={i}>
                    {char}
                  </motion.span>
                ))}
              </motion.h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={inputVariants} className="mb-6" id="field-title">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobTitle}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder={t.postJob.enterJobTitle}
                  required
                  className={`${getFieldClass(darkMode, !!errors.title, touched.title)}`}
                />
                {touched.title && errors.title && (
                  <p className="error-message">{errors.title}</p>
                )}
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobSite}
                </label>
                <select
                  value={jobSite}
                  onChange={(e) => setJobSite(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectJobSite}
                  </option>
                  {jobSites.map((site) => (
                    <option
                      key={site}
                      value={site}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {site}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobType} *
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectJobType}
                  </option>
                  {jobTypes.map((jt) => (
                    <option
                      key={jt}
                      value={jt}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {jt}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobSector}
                </label>
                <select
                  value={jobSector}
                  onChange={(e) => setJobSector(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectJobSector}
                  </option>
                  {jobSectors.map((sector) => (
                    <option
                      key={sector}
                      value={sector}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {sector}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.category} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectCategory}
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.educationalQualification}
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className={getFieldClass(darkMode)}
                >
                  <option value="" className="text-gray-400">
                    {t.postJob.selectEducation}
                  </option>
                  <option value="High School" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.highSchool}</option>
                  <option value="Associate Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.associateDegree}</option>
                  <option value="Bachelor's Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.bachelorsDegree}</option>
                  <option value="Master's Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.mastersDegree}</option>
                  <option value="PhD" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>PhD</option>
                  <option value="Professional Certification" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.professionalCertification}</option>
                  <option value="Other" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>{t.postJob.otherEducation}</option>
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.experienceLevel}
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectExperience}
                  </option>
                  {experienceLevels.map((exp) => (
                    <option
                      key={exp}
                      value={exp}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {exp}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.genderPreferenceLabel}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectGenderPref}
                  </option>
                  {genders.map((g) => (
                    <option
                      key={g}
                      value={g}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {g}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobDeadlineOptional}
                  <span className={`text-xs ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {t.postJob.defaultDays}
                  </span>
                </label>
                <input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  type="date"
                  className={`${getFieldClass(darkMode)} date-picker-input`}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.vacanciesOptional}
                </label>
                <input
                  type="number"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  placeholder={t.postJob.numberOfVacancies}
                  min="1"
                  className={getFieldClass(darkMode)}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.skillsAndExpertise}
                  <span className={`text-xs ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {t.postJob.maxLeft} ({6 - skills.length} {t.postJob.remainingLabel})
                  </span>
                </label>

                {/* Selected skills as tags */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-400 text-black text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Typeahead search input */}
                <div ref={skillDropdownRef} className="relative">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowSkillDropdown(false), 200);
                    }}
                    placeholder={skills.length >= 6 ? t.postJob.maximumSkillsReached : t.postJob.typeToSearchSkills}
                    disabled={skills.length >= 6}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                      skills.length >= 6 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />

                  {/* Dropdown suggestions */}
                  {showSkillDropdown && skills.length < 6 && (
                    <div
                      className={`absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                        darkMode
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {skillsOptions
                        .filter(
                          (skill) =>
                            skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
                            !skills.includes(skill)
                        )
                        .slice(0, 20)
                        .map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleSkill(skill);
                              setSkillSearch("");
                              setShowSkillDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              darkMode
                                ? "text-gray-200 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-cyan-50"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      {skillsOptions.filter(
                        (skill) =>
                          skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
                          !skills.includes(skill)
                      ).length === 0 && (
                        <div className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {skillSearch ? `${t.postJob.noSkillsMatching} "${skillSearch}"` : t.postJob.allSkillsSelected}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2" id="field-description">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                >
                  {t.postJob.tellUsAboutJob}
                </label>
                <label
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t.postJob.jobDescriptionLabel}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= maxDescriptionLength) {
                      setDescription(e.target.value);
                    }
                  }}
                  onBlur={() => handleBlur('description')}
                  placeholder={t.postJob.enterDescription}
                  rows={8}
                  required
                  maxLength={maxDescriptionLength}
                  className={`${getFieldClass(darkMode, !!errors.description, touched.description)} resize-none`}
                />
                {touched.description && errors.description && (
                  <p className="error-message">{errors.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {t.postJob.quickTip}
                  </p>
                  <p className={`text-xs font-medium ${descriptionCharsLeft < 100
                    ? "text-red-500"
                    : descriptionCharsLeft < 500
                      ? "text-yellow-500"
                      : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}>
                    {descriptionCharsLeft} {t.postJob.charsLeft}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Location Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="glass-card border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <motion.h3
                className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-inter tracking-tight"
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {t.postJob.workLocationSection.split("").map((char, i: number) => (
                  <motion.span key={i} variants={letterVariants} custom={i}>
                    {char}
                  </motion.span>
                ))}
              </motion.h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.countryLabel}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectCountry}
                  </option>
                  {countries.map((c) => (
                    <option
                      key={c}
                      value={c}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.cityLabel}
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t.postJob.enterCityPlaceholder}
                  required
                  className={getFieldClass(darkMode)}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                >
                  {t.postJob.workAddressOptional}
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.postJob.enterWorkAddress}
                  className={getFieldClass(darkMode)}
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Additional Information Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="glass-card border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon className="w-6 h-6 text-cyan-400" />
              <motion.h3
                className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-inter tracking-tight"
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {t.postJob.additionalInfo.split("").map((char, i: number) => (
                  <motion.span key={i} variants={letterVariants} custom={i}>
                    {char}
                  </motion.span>
                ))}
              </motion.h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.compensationTypeLabel}
                </label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value)}
                  required
                  className={getFieldClass(darkMode)}
                >
                  <option value="" disabled className="text-gray-400">
                    {t.postJob.selectCompensationType}
                  </option>
                  {compensationTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                        }`}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.compensationAmountLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    placeholder={t.postJob.addSalaryPlaceholder}
                    type="number"
                    className={`flex-1 ${getFieldClass(darkMode)}`}
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-32 ${getFieldClass(darkMode)}`}
                  >
                    {currencies.map((curr) => (
                      <option
                        key={curr}
                        value={curr}
                        className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                          }`}
                      >
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.visibility}
                </label>
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as "public" | "private")
                  }
                  className={getFieldClass(darkMode)}
                >
                  <option
                    value="public"
                    className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                      }`}
                  >
                    {t.postJob.publicLabel}
                  </option>
                  <option
                    value="private"
                    className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                      }`}
                  >
                    {t.postJob.private}
                  </option>
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  {t.postJob.jobLinkOptional}
                </label>
                <input
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  placeholder={t.postJob.enterJobLink}
                  className={getFieldClass(darkMode)}
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              type="button"
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 border ${darkMode
                ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/10"
                : "bg-white/80 hover:bg-white text-gray-700 border-black/10"
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              {t.postJob.goBack}
            </motion.button>


            <motion.button
              type="submit"
              disabled={isSubmitting || (postingStatus && !postingStatus.canPost)}
              whileHover={{
                scale: isSubmitting || (postingStatus && !postingStatus.canPost) ? 1 : 1.05,
                y: isSubmitting || (postingStatus && !postingStatus.canPost) ? 0 : -2,
              }}
              whileTap={{ scale: isSubmitting || (postingStatus && !postingStatus.canPost) ? 1 : 0.95 }}
              className={`px-6 py-3 font-bold rounded-xl shadow-xl transition-all duration-300 font-inter tracking-tight ${isSubmitting || (postingStatus && !postingStatus.canPost)
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 hover:shadow-cyan-400/40"
                }`}
            >
              <Send className="inline w-5 h-5 mr-2" />
              {isSubmitting ? `🔄 ${t.postJob.postingBtn}` : t.postJob.continueBtn}
            </motion.button>
          </motion.div>
        </form>
      )}
      </div>
    </>
  );
};

export default PostJob;
