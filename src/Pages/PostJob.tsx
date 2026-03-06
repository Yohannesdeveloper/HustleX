import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import { useTranslation } from "../hooks/useTranslation";
import { Job as JobTypeFromAPI, User, Application, EmailData } from "../types";
import { HireSEO } from "../components/SEO";

// Then, in your code, replace Job with JobTypeFromAPI where needed:

import {
  Briefcase,
  MapPin,
  UserCheck,
  Link as LinkIcon,
  Send,
  ArrowLeft,
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
const categories = [
  "Software Development",
  "Web Development",
  "Mobile App Development",
  "Game Development",
  "DevOps Engineering",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "Machine Learning & AI",
  "AI Prompt Engineering",
  "Blockchain & Cryptocurrency",
  "E-commerce Development",
  "Business Intelligence",
  "Data Analysis",
  "Database Administration",
  "Quality Assurance & Testing",
  "Embedded Systems",
  "Hardware Engineering",
  "UI/UX Design",
  "Graphic Design",
  "Motion Graphics",
  "3D Animation",
  "Video Editing",
  "Photography & Videography",
  "Music & Audio Production",
  "Architecture & Interior Design",
  "Fashion & Textile Design",
  "Content Writing",
  "Technical Writing",
  "Copywriting",
  "Social Media Marketing",
  "SEO & SEM",
  "Digital Marketing",
  "Email Marketing",
  "Translation & Localization",
  "Virtual Assistant",
  "Data Entry & Admin Support",
  "Customer Service",
  "Technical Support",
  "Sales & Business Development",
  "Customer Success",
  "Project Management",
  "Product Management",
  "Program Management",
  "Agile Coaching",
  "Operations Management",
  "Supply Chain & Logistics",
  "Logistics & Warehouse Management",
  "Human Resources Management",
  "Recruitment & Talent Acquisition",
  "Payroll & Benefits Administration",
  "Financial Analysis",
  "Accounting & Bookkeeping",
  "Tax Consulting",
  "Legal Services",
  "Contract Management",
  "Compliance & Risk Management",
  "Healthcare & Medical Services",
  "Nursing",
  "Pharmacy",
  "Fitness & Personal Training",
  "Nutrition & Dietetics",
  "Social Work & Counseling",
  "Education & Training",
  "Instructional Design",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Environmental Consulting",
  "Automobile Engineering",
  "Farming & Agriculture",
  "Veterinary Services",
  "Event Planning",
  "Public Relations",
  "Market Research",
  "Real Estate Management",
  "Hospitality & Tourism",
  "Security Services",
  "Manufacturing & Production",
  "Printing & Publishing",
  "Other",
];

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

const skillsOptions = [
  // Web/Frontend
  "HTML5",
  "CSS3",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "Redux",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Styled Components",
  "Web3.js",
  "Solid.js",
  // Backend
  "Node.js",
  "Express",
  "NestJS",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby on Rails",
  "PHP",
  "Laravel",
  "Symfony",
  "Go",
  "Java",
  "Spring Boot",
  "C#",
  ".NET Core",
  "C++",
  "C",
  "Rust",
  "Elixir",
  "GraphQL",
  "REST API",

  // Mobile
  "React Native",
  "Flutter",
  "Android (Kotlin)",
  "Android (Java)",
  "iOS (Swift)",
  "iOS (Objective-C)",
  "Ionic",
  "Xamarin",

  // Data/ML/AI
  "SQL",
  "NoSQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Elasticsearch",
  "Data Analysis",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "PyTorch",
  "Keras",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing (NLP)",
  "Computer Vision",
  "Data Engineering",
  "Big Data",
  "Spark",
  "Hadoop",
  "R",
  "Tableau",
  "Power BI",
  "AI Prompt Engineering",

  // DevOps/Cloud
  "Docker",
  "Kubernetes",
  "CI/CD",
  "GitHub Actions",
  "Jenkins",
  "AWS",
  "Azure",
  "GCP",
  "Terraform",
  "Ansible",
  "Linux",
  "Nginx",
  "Serverless",

  // Design/Creative
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "After Effects",
  "Premiere Pro",
  "InDesign",
  "Canva",
  "Graphic Design",
  "Motion Graphics",
  "3D Modeling",
  "Blender",
  "Maya",
  "Cinema 4D",
  "Video Editing",
  "Photography",
  "Videography",

  // Writing/Content
  "Content Writing",
  "Copywriting",
  "Technical Writing",
  "Blog Writing",
  "Creative Writing",
  "Editing & Proofreading",
  "SEO Writing",
  "Ghostwriting",
  "Translation",
  "Transcription",

  // Marketing/Business
  "SEO",
  "SEM",
  "Google Ads",
  "Facebook Ads",
  "Social Media Management",
  "Email Marketing",
  "Marketing Automation",
  "Growth Hacking",
  "Project Management",
  "Agile/Scrum",
  "Product Management",
  "Sales",
  "Lead Generation",
  "Customer Success",
  "CRM",
  "Business Analysis",
  "Financial Modeling",

  // Security
  "Cybersecurity",
  "Ethical Hacking",
  "Penetration Testing",
  "Information Security",
  "Network Security",

  // Other/Specialized
  "QA/Testing",
  "Automated Testing",
  "Game Development",
  "Unity",
  "Unreal Engine",
  "Blockchain",
  "Smart Contracts",
  "Solidity",
  "Solana",
  "Excel/VBA",
  "Virtual Assistant",
  "Data Entry",
  "Customer Support",
  "Other",
];

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

  // Check authentication before allowing access to post job page
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate("/signup?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
  }, [isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-black" : "bg-white"}`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{t.postJob.checkingAuthentication}</p>
        </div>
      </div>
    );
  }

  // Allow all authenticated users to access PostJob page
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
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Set default deadline to 15 days from today
  useEffect(() => {
    if (!deadline) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15);
      const formattedDate = defaultDate.toISOString().split('T')[0];
      setDeadline(formattedDate);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication before submitting
    if (!isAuthenticated || !user) {
      navigate("/login?redirect=" + encodeURIComponent(location.pathname));
      return;
    }

    // Check subscription status before submitting
    if (postingStatus && !postingStatus.canPost) {
      alert(postingStatus.message || "Please upgrade your plan to post jobs.");
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
        postedBy: user._id,
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
        alert("Maximum 6 skills allowed. Please remove a skill first.");
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
          } px-6 py-12 flex flex-col items-center`}
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

          /* Date picker icon styling */
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: ${darkMode ? "invert(1) brightness(1.5)" : "none"};
            cursor: pointer;
          }

          /* Additional fallback for some browsers */
          input[type="date"] {
            color-scheme: ${darkMode ? "dark" : "light"};
            color: ${darkMode ? "white" : "black"};
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mb-12"
      >
        <motion.h2
          className={`text-4xl font-bold bg-gradient-to-r ${darkMode ? "from-blue-300 to-blue-500" : "from-blue-400 to-blue-600"
            } bg-clip-text text-transparent text-center font-inter tracking-tight`}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            textShadow: darkMode
              ? "0 0 8px rgba(255, 255, 255, 0.8)"
              : "0 0 8px rgba(59, 130, 246, 0.8)",
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
          Create an attractive job listing to find the best talent
        </p>
      </motion.div>

      {/* Subscription Status Banner */}
      {
        !loadingStatus && postingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 w-full max-w-5xl ${postingStatus.canPost
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
                    ? `✅ You can post jobs (${postingStatus.planName})`
                    : `❌ Cannot post jobs`}
                </h3>
                <p
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  {postingStatus.canPost ? (
                    <>
                      {postingStatus.limits.type === "lifetime"
                        ? `Lifetime jobs posted: ${postingStatus.limits.current}/${postingStatus.limits.limit} (Free Trial)`
                        : postingStatus.limits.type === "total"
                          ? `Total jobs posted: ${postingStatus.limits.current}/${postingStatus.limits.limit}`
                          : postingStatus.limits.limit === -1
                            ? `Monthly jobs posted: ${postingStatus.stats.monthlyJobs} (Unlimited)`
                            : `Monthly jobs posted: ${postingStatus.limits.current}/${postingStatus.limits.limit} (${postingStatus.limits.remaining} remaining)`}
                      {postingStatus.expiresAt && (
                        <span className="ml-2">
                          • Expires: {new Date(postingStatus.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  ) : (
                    postingStatus.message || "Please upgrade your plan to post jobs."
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
          className={`w-full max-w-2xl p-12 rounded-3xl border-2 text-center shadow-2xl backdrop-blur-md ${darkMode
            ? "bg-black/80 border-cyan-500/30 text-white"
            : "bg-white/90 border-cyan-500/50 text-black"
            }`}
        >
          <div className="mb-8 relative inline-block">
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full animate-pulse">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full text-white shadow-xl">
                <Briefcase size={48} className="animate-bounce" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg">
              <Send size={20} />
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-4 font-inter">
            {postingStatus.limits.type === "lifetime" ? "Free Trial Limit Reached" : "Upgrade Required"}
          </h3>

          <p className={`text-lg mb-8 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {postingStatus.message || "You've reached your job posting limit. Upgrade to a paid plan to continue hiring the best talent on HustleX."}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/pricing")}
              className="w-full py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-xl transform transition hover:scale-105 active:scale-95"
            >
              🚀 {t.postJob.upgradePlan}
            </button>

            <button
              onClick={() => navigate(-1)}
              className={`w-full py-4 text-lg font-semibold rounded-2xl border-2 transition-colors ${darkMode
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
            >
              Go Back
            </button>
          </div>

          <div className={`mt-8 pt-8 border-t ${darkMode ? "border-white/10" : "border-black/10"}`}>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Need help? <button onClick={() => navigate("/contact-us")} className="text-cyan-500 hover:underline">Contact our support team</button>
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
            className={`${darkMode
              ? "bg-black/50 border-white/10"
              : "bg-white/80 border-black/10"
              } border rounded-2xl p-8 shadow-2xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Briefcase
                className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-blue-600"
                  }`}
              />
              <motion.h3
                className={`text-xl font-semibold bg-gradient-to-r ${darkMode
                  ? "from-blue-300 to-blue-500"
                  : "from-blue-400 to-blue-600"
                  } bg-clip-text text-transparent font-inter tracking-tight`}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {"Job Details".split("").map((char, i: number) => (
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
                  Job Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.postJob.enterJobTitle}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  Job Site *
                </label>
                <select
                  value={jobSite}
                  onChange={(e) => setJobSite(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Job Site
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
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Job Type
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
                  Job Sector *
                </label>
                <select
                  value={jobSector}
                  onChange={(e) => setJobSector(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Job Sector
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
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Category
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
                  Educational Qualification (optional)
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" className="text-gray-400">
                    Select Education
                  </option>
                  <option value="High School" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>High School</option>
                  <option value="Associate Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>Associate Degree</option>
                  <option value="Bachelor's Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>Bachelor's Degree</option>
                  <option value="Master's Degree" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>Master's Degree</option>
                  <option value="PhD" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>PhD</option>
                  <option value="Professional Certification" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>Professional Certification</option>
                  <option value="Other" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"}`}>Other</option>
                </select>
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  Experience Level *
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Experience Level
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
                  Gender Preference *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Gender
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
                  Job Deadline (optional)
                  <span className={`text-xs ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Default: 15 days
                  </span>
                </label>
                <input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  type="date"
                  className={`w-full p-4 rounded-xl border date-picker-input ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="mb-6">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  Vacancies (optional)
                </label>
                <input
                  type="number"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  placeholder="Number of Vacancies"
                  min="1"
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                >
                  Skills and Expertise
                  <span className={`text-xs ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Max 6 ({6 - skills.length} left)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsOptions.map((skill) => (
                    <motion.button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      disabled={!skills.includes(skill) && skills.length >= 6}
                      variants={inputVariants}
                      whileHover={{ scale: skills.includes(skill) || skills.length < 6 ? 1.05 : 1 }}
                      whileTap={{ scale: skills.includes(skill) || skills.length < 6 ? 0.95 : 1 }}
                      className={`px-3 py-1 rounded-full border transition-all duration-300 ${skills.includes(skill)
                        ? "bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/25"
                        : darkMode
                          ? skills.length >= 6
                            ? "border-gray-600 text-gray-500 cursor-not-allowed opacity-50"
                            : "border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
                          : skills.length >= 6
                            ? "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                            : "border-gray-300 text-gray-600 hover:border-cyan-400 hover:text-cyan-400"
                        }`}
                    >
                      {skill}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                >
                  Tell us about your job
                </label>
                <label
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  Job Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= maxDescriptionLength) {
                      setDescription(e.target.value);
                    }
                  }}
                  placeholder={t.postJob.enterDescription}
                  rows={8}
                  required
                  maxLength={maxDescriptionLength}
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 resize-none`}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Quick Tip! Create a high quality job post to attract top talents on HustleX!!
                  </p>
                  <p className={`text-xs font-medium ${descriptionCharsLeft < 100
                    ? "text-red-500"
                    : descriptionCharsLeft < 500
                      ? "text-yellow-500"
                      : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}>
                    {descriptionCharsLeft} chars left
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
            className={`${darkMode
              ? "bg-black/50 border-white/10"
              : "bg-white/80 border-black/10"
              } border rounded-2xl p-8 shadow-2xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin
                className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-blue-600"
                  }`}
              />
              <motion.h3
                className={`text-xl font-semibold bg-gradient-to-r ${darkMode
                  ? "from-blue-300 to-blue-500"
                  : "from-blue-400 to-blue-600"
                  } bg-clip-text text-transparent font-inter tracking-tight`}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {"Work Location".split("").map((char, i: number) => (
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
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
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
                  {t.postJob.city} *
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                />
              </motion.div>
              <motion.div variants={inputVariants} className="md:col-span-2">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                >
                  Work Address (optional)
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter work address"
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Additional Information Section */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className={`${darkMode
              ? "bg-black/50 border-white/10"
              : "bg-white/80 border-black/10"
              } border rounded-2xl p-8 shadow-2xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon
                className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-blue-600"
                  }`}
              />
              <motion.h3
                className={`text-xl font-semibold bg-gradient-to-r ${darkMode
                  ? "from-blue-300 to-blue-500"
                  : "from-blue-400 to-blue-600"
                  } bg-clip-text text-transparent font-inter tracking-tight`}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {"Additional Information".split("").map((char, i: number) => (
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
                  Salary/Compensation Type *
                </label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value)}
                  required
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Compensation Type
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
                  Salary/Compensation Amount & Currency (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    placeholder="Please add the salary..."
                    type="number"
                    className={`flex-1 p-4 rounded-xl border ${darkMode
                      ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                      : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-32 p-4 rounded-xl border ${darkMode
                      ? "bg-black/50 border-gray-700/50 text-white"
                      : "bg-white/10 border-gray-300/50 text-black"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
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
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white"
                    : "bg-white/10 border-gray-300/50 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                >
                  <option
                    value="public"
                    className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                      }`}
                  >
                    Public
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
                  Job Link (Optional)
                </label>
                <input
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  placeholder={t.postJob.enterJobLink}
                  className={`w-full p-4 rounded-xl border ${darkMode
                    ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
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
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
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
              {isSubmitting ? `🔄 Posting...` : `Continue`}
            </motion.button>
          </motion.div>
        </form>
      )}
      </div>
    </>
  );
};

export default PostJob;
