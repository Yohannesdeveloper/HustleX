import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { JobType } from "../types";
import apiService from "../services/api";
import { useAuth } from "../store/hooks";
import Footer from "../components/Footer";
import { JobListingsSEO } from "../components/SEO";
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  User,
  Bookmark,
  Eye,
  X,
  ExternalLink,
  CheckCircle,
  Trash2,
  Filter,
  ChevronDown,
  Users,
  Target,
  GraduationCap,
  Layers,
  Zap,
  Globe,
} from "lucide-react";

// Mock data as a fallback
const mockJobs: JobType[] = [
  {
    id: "mock-1",
    jobId: "mock-1",
    title: "Sample Web Developer Job",
    description: "A sample job for a web developer.",
    company: "Sample Corp",
    budget: 15000,
    duration: "3 months",
    category: "Web Development",
    jobType: "Full-time",
    workLocation: "Remote",
    experience: "Mid-level",
    education: "Bachelor's Degree",
    gender: "Any",
    vacancies: 2,
    skills: ["JavaScript", "React", "Node.js"],
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 },
    userId: "mock-user",
    jobLink: null,
  },
  {
    id: "mock-2",
    jobId: "mock-2",
    title: "Sample Data Analyst Job",
    description: "A sample job for a data analyst.",
    company: "Data Inc",
    budget: 20000,
    duration: "2 months",
    category: "Data Analysis",
    jobType: "Contract",
    workLocation: "Hybrid",
    experience: "Junior",
    education: "Master's Degree",
    gender: "Any",
    vacancies: 1,
    skills: ["Python", "SQL", "Excel"],
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800 },
    userId: "mock-user",
    jobLink: null,
  },
];

// Categories and other constants (unchanged)
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

const budgetRanges = [
  { label: "Under 5,000 ETB", min: 0, max: 5000 },
  { label: "5,000 - 10,000 ETB", min: 5000, max: 10000 },
  { label: "10,000 - 20,000 ETB", min: 10000, max: 20000 },
  { label: "Above 20,000 ETB", min: 20000, max: Infinity },
];

const durations = [
  "Less than 1 month",
  "1 month",
  "2 months",
  "3 months",
  "More than 3 months",
];

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Temporary",
  "Internship",
  "Remote",
  "On-site",
  "Hybrid",
];
const jobSectors = [
  "Technology & IT",
  "Healthcare & Medical",
  "Education & Training",
  "Finance & Accounting",
  "Marketing & Advertising",
  "Manufacturing & Industrial",
  "Construction & Real Estate",
  "Retail & E-commerce",
  "Hospitality & Tourism",
  "Legal & Professional Services",
  "Agriculture & Forestry",
  "Energy & Mining",
  "Government & Public Sector",
  "Non-Profit & NGO",
  "Media & Entertainment",
  "Transportation & Logistics",
  "Telecommunications",
  "Aerospace & Defense",
  "Arts & Culture",
  "Other"
];
const jobSites = ["Remote", "On-site", "Hybrid"];
const experienceLevels = [
  "Internship",
  "Entry Level",
  "Junior",
  "Mid-level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "Executive",
  "Expert",
];
const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
  "Vocational Training",
  "No Formal Education Required",
];
const genderOptions = ["Any", "Male", "Female", "Non-binary"];

const filterPresets = [
  {
    label: "High Budget",
    filters: { selectedBudgetRanges: ["Above 20,000 ETB"] },
  },
  { label: "Remote Only", filters: { selectedJobSites: ["Remote"] } },
  {
    label: "Entry Level",
    filters: { selectedExperienceLevels: ["Entry Level", "Junior"] },
  },
];

const JobListings: React.FC = () => {
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const navigate = useNavigate();
  const redirectFromLogin = new URLSearchParams(location.search).get(
    "redirect"
  );
  const viewOnly =
    new URLSearchParams(location.search).get("viewOnly") === "true";
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || "";
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>(
    []
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedJobSites, setSelectedJobSites] = useState<string[]>([]);
  const [selectedJobSectors, setSelectedJobSectors] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    string[]
  >([]);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<
    string[]
  >([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "budgetLow" | "budgetHigh"
  >("newest");
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [previewJob, setPreviewJob] = useState<JobType | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>("");
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [expandedFilters, setExpandedFilters] = useState<{ [key: string]: boolean }>({
    categories: false,
    jobTypes: false,
    workLocation: false,
    experienceLevel: false,
    educationLevel: false,
    genderPreference: false,
    budgetRange: false,
    duration: false,
    visibility: false,
    jobSector: false,
  });

  // Font Import
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Poppins:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Parallax effect for orbs
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const orbY2 = useTransform(scrollY, [0, 1000], [0, 150]);
  const orbY3 = useTransform(scrollY, [0, 1000], [0, -100]);

  // Fetch jobs with retry and fallback
  const fetchJobs = async () => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt <= retryCount && attempt < maxRetries) {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching jobs (attempt ${attempt + 1}/${maxRetries})`);

        // Jobs are public, no authentication required
        const response = await apiService.getJobs({ page: 1, limit: 50 });
        console.log("API response:", response);

        const jobList: JobType[] = response.jobs.map((job: any) => ({
          id: job._id || `temp-id-${Math.random()}`,
          jobId: job._id || `temp-id-${Math.random()}`,
          title: job.title || "Untitled Job",
          description: job.description || "No description provided",
          company: job.company || undefined,
          budget: Number(job.budget || job.salary || job.compensationAmount || 0),
          duration: job.duration || "Less than 1 month",
          category: job.category || "Other",
          jobType: job.jobType || "Full-time",
          workLocation: job.workLocation || job.city || "Remote",
          experience: job.experience || undefined,
          education: job.education || undefined,
          gender: job.gender || undefined,
          vacancies: job.vacancies || undefined,
          skills: Array.isArray(job.skills) ? job.skills : [],
          createdAt: job.createdAt
            ? typeof job.createdAt === "string"
              ? {
                seconds: Math.floor(new Date(job.createdAt).getTime() / 1000),
              }
              : job.createdAt
            : { seconds: Math.floor(Date.now() / 1000) },
          userId: job.postedBy?._id || job.postedBy || "",
          jobLink: job.jobLink || null,
          visibility: job.visibility || "Public",
          compensationAmount: job.compensationAmount,
          currency: job.currency,
          jobSite: job.jobSite,
          jobSector: job.jobSector,
          compensationType: job.compensationType,
        }));

        console.log("Mapped jobs:", jobList);
        setJobs(jobList);
        setFilteredJobs(jobList.slice(0, 10));
        setHasMore(jobList.length > 10);
        setRetryCount(0); // Reset retry count on success
        return; // Exit on success
      } catch (error: any) {
        console.error(`Error fetching jobs (attempt ${attempt + 1}):`, error);
        attempt++;
        if (attempt >= maxRetries) {
          console.warn("Max retries reached, using mock data as fallback");
          setJobs(mockJobs);
          setFilteredJobs(mockJobs.slice(0, 10));
          setHasMore(mockJobs.length > 10);
          setError("Unable to connect to server. Showing sample jobs.");
        } else {
          setRetryCount(attempt);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("IntersectionObserver triggered:", entries[0]);
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
          setFilteredJobs((prev) => {
            const newItems = jobs.slice(prev.length, prev.length + 10);
            const newFilteredJobs = [...prev, ...newItems];
            if (newFilteredJobs.length >= jobs.length) {
              setHasMore(false);
            }
            return newFilteredJobs;
          });
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) {
      console.log("Observing loaderRef:", loaderRef.current);
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [jobs, hasMore, loading]);

  // Search suggestions with categories
  useEffect(() => {
    if (!searchTitle.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const matchedJobs = jobs
      .filter((job) =>
        job.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
      .map((job) => job.title);
    const matchedCategories = categories.filter((cat) =>
      cat.toLowerCase().includes(searchTitle.toLowerCase())
    );
    setSuggestions([...new Set([...matchedJobs, ...matchedCategories])]);
    setShowSuggestions(true);
  }, [searchTitle, jobs]);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    if (searchTitle.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
          job.category.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (selectedCategories.length) {
      filtered = filtered.filter((job) =>
        selectedCategories.includes(job.category)
      );
    }

    if (selectedBudgetRanges.length) {
      filtered = filtered.filter((job) => {
        const budgetNum = Number(job.budget) || 0;
        return selectedBudgetRanges.some((rangeLabel) => {
          const range = budgetRanges.find((r) => r.label === rangeLabel);
          return range && budgetNum >= range.min && budgetNum < range.max;
        });
      });
    }

    if (selectedDurations.length) {
      filtered = filtered.filter(
        (job) => job.duration && selectedDurations.includes(job.duration)
      );
    }

    if (selectedJobTypes.length) {
      filtered = filtered.filter(
        (job) => job.jobType && selectedJobTypes.includes(job.jobType)
      );
    }

    if (selectedJobSites.length) {
      filtered = filtered.filter(
        (job) => job.workLocation && selectedJobSites.includes(job.workLocation)
      );
    }

    if (selectedJobSectors.length) {
      filtered = filtered.filter(
        (job) => job.jobSector && selectedJobSectors.includes(job.jobSector)
      );
    }

    if (selectedExperienceLevels.length) {
      filtered = filtered.filter(
        (job) =>
          job.experience && selectedExperienceLevels.includes(job.experience)
      );
    }

    if (selectedEducationLevels.length) {
      filtered = filtered.filter(
        (job) =>
          job.education && selectedEducationLevels.includes(job.education)
      );
    }

    if (selectedGenders.length) {
      filtered = filtered.filter(
        (job) =>
          job.gender &&
          (selectedGenders.includes(job.gender) ||
            selectedGenders.includes("Any"))
      );
    }

    if (selectedVisibility.length) {
      filtered = filtered.filter(
        (job) =>
          job.visibility &&
          selectedVisibility.includes(job.visibility)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      }
      if (sortBy === "oldest") {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      }
      if (sortBy === "budgetLow")
        return Number(a.budget || 0) - Number(b.budget || 0);
      if (sortBy === "budgetHigh")
        return Number(b.budget || 0) - Number(a.budget || 0);
      return 0;
    });

    console.log("Filtered jobs:", filtered);
    setPage(1);
    setFilteredJobs(filtered.slice(0, 10));
    setHasMore(filtered.length > 10);
  }, [
    jobs,
    searchTitle,
    selectedCategories,
    selectedBudgetRanges,
    selectedDurations,
    selectedJobTypes,
    selectedJobSites,
    selectedExperienceLevels,
    selectedJobSectors,
    selectedEducationLevels,
    selectedGenders,
    selectedVisibility,
    sortBy,
  ]);

  // Handle job expansion toggle
  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Handle share menu toggle
  const toggleShareMenu = (jobId: string) => {
    setShareMenuOpen(shareMenuOpen === jobId ? null : jobId);
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await apiService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setFilteredJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
      setError("Failed to delete job. Please try again.");
    }
  };

  const handleEdit = (jobId: string) => navigate(`/edit-job/${jobId}`);

  const handleShare = async (job: JobType, method: string) => {
    const jobUrl =
      job.jobLink || `${window.location.origin}/job-details/${job.id}`;
    const salaryText = job.compensationAmount && job.currency
      ? `${job.compensationAmount} ${job.currency}`
      : job.budget && job.budget > 0
        ? `${job.budget} ETB`
        : "Negotiable";
    const shareText = `Check out this job opportunity: ${job.title} - ${salaryText}`;

    switch (method) {
      case "copy":
        try {
          await navigator.clipboard.writeText(jobUrl);
          alert("Job link copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy: ", err);
          setError("Failed to copy link. Please try again.");
        }
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            jobUrl
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(jobUrl)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            jobUrl
          )}`,
          "_blank"
        );
        break;
    }
    setShareMenuOpen(null);
  };

  // Handle job bookmarking
  const handleBookmark = async (jobId: string) => {
    if (!user) {
      navigate("/signup?redirect=" + encodeURIComponent(location.pathname));
      return;
    }
    try {
      if (savedJobs.includes(jobId)) {
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Failed to save job:", err);
      setError("Failed to save job. Please try again.");
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBudgetRanges([]);
    setSelectedDurations([]);
    setSelectedJobTypes([]);
    setSelectedJobSites([]);
    setSelectedExperienceLevels([]);
    setSelectedEducationLevels([]);
    setSelectedGenders([]);
    setSelectedVisibility([]);
    setSelectedJobSectors([]);
    setSearchTitle("");
  };

  const applyPreset = (preset: (typeof filterPresets)[0]) => {
    clearAllFilters();
    Object.entries(preset.filters).forEach(([key, value]) => {
      switch (key) {
        case "selectedBudgetRanges":
          setSelectedBudgetRanges(value as string[]);
          break;
        case "selectedJobSites":
          setSelectedJobSites(value as string[]);
          break;
        case "selectedExperienceLevels":
          setSelectedExperienceLevels(value as string[]);
          break;
      }
    });
  };

  const FilterSection = ({ title, options, selected, setSelected, filterKey }: any) => {
    const isExpanded = expandedFilters[filterKey] || false;

    return (
      <div className="mb-2">
        <button
          onClick={() => setExpandedFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }))}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all font-inter ${darkMode
            ? "bg-black/40 hover:bg-black/60 text-white"
            : "bg-white/60 hover:bg-white/80 text-black"
            }`}
        >
          <h3 className={`text-sm sm:text-base font-semibold font-inter ${darkMode ? "text-white" : "text-black"
            }`}>
            {title}
            {selected.length > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                }`}>
                {selected.length}
              </span>
            )}
          </h3>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""
              }`}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 flex flex-col max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400 pr-1"
            >
              {options.map((option: string) => (
                <label
                  key={option}
                  className={`flex items-center space-x-2 mb-1 cursor-pointer select-none p-1.5 rounded-lg transition-all ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleSelection(option, selected, setSelected)}
                    className="w-4 h-4 accent-cyan-400 rounded transition"
                  />
                  <span
                    className={`text-xs sm:text-sm font-inter ${darkMode ? "text-white" : "text-black"
                      }`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const toggleSelection = (
    value: string,
    selectedArray: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(
      selectedArray.includes(value)
        ? selectedArray.filter((item) => item !== value)
        : [...selectedArray, value]
    );
  };

  return (
    <>
      <JobListingsSEO />
      <div
        className={`relative min-h-screen transition-colors duration-300 ${darkMode ? "bg-black" : "bg-white"
          }`}
      >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full top-0 left-0"
          style={{ y: orbY1 }}
        />
        <motion.div
          className="absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-10 blur-3xl rounded-full bottom-0 right-0"
          style={{ y: orbY2 }}
        />
        <motion.div
          className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 opacity-15 blur-3xl rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ y: orbY3 }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row p-1 sm:p-2 lg:p-4 gap-1 sm:gap-2 max-w-7xl mx-auto">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`fixed inset-y-0 left-0 z-50 w-11/12 sm:w-64 lg:w-72 rounded-r-2xl p-2 sm:p-3 space-y-3 shadow-2xl lg:sticky lg:top-6 max-h-screen overflow-hidden transition-colors duration-300 ${darkMode
            ? "bg-black border border-white/10"
            : "bg-white border border-black/10"
            } ${isSidebarOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1.5 transition-colors font-inter ${darkMode
                ? "text-white hover:text-white/70"
                : "text-black hover:text-black/70"
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mb-3">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-1 font-inter">
              Smart Filters
            </h2>
            <p
              className={`text-xs font-inter ${darkMode ? "text-white/80" : "text-black/70"
                }`}
            >
              Find your perfect job match
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs or categories..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className={`w-full p-2 sm:p-2.5 rounded-xl transition-all shadow-lg focus:outline-none focus:ring-2 font-inter text-sm ${darkMode
                ? "bg-black/60 text-white border border-white/10 placeholder:text-white/40 focus:ring-white/30"
                : "bg-white text-black border border-black/10 placeholder:text-black/40 focus:ring-black/20"
                }`}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {searchTitle && (
              <button
                onClick={() => setSearchTitle("")}
                className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${darkMode
                  ? "text-white/70 hover:text-white"
                  : "text-black/70 hover:text-black"
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {showSuggestions && (
              <ul
                className={`absolute z-10 w-full backdrop-blur-sm rounded-lg max-h-40 overflow-y-auto shadow-2xl mt-1.5 border scrollbar-thin scrollbar-thumb-cyan-400 font-inter ${darkMode
                  ? "bg-black/95 text-white border-white/20 scrollbar-track-black/50"
                  : "bg-white/95 text-black border-black/20 scrollbar-track-white/50"
                  }`}
              >
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className={`px-2.5 py-1.5 cursor-pointer transition-colors text-xs sm:text-sm font-inter ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                      }`}
                    onMouseDown={() => {
                      setSearchTitle(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearAllFilters}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1.5 sm:py-2 px-3 rounded-lg transition-all transform hover:scale-105 shadow-lg font-semibold text-xs sm:text-sm font-inter"
          >
            Clear All Filters
          </button>

          {/* Filters - Single Scrollable Container */}
          <div
            className={`space-y-3 max-h-[calc(100vh-250px)] sm:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400 pr-1 ${darkMode ? "scrollbar-track-black/50" : "scrollbar-track-white/50"
              }`}
          >
            <FilterSection
              title="Categories"
              options={categories}
              selected={selectedCategories}
              setSelected={setSelectedCategories}
            />
            <FilterSection
              title="Job Types"
              options={jobTypes}
              selected={selectedJobTypes}
              setSelected={setSelectedJobTypes}
            />
            <FilterSection
              title="Work Location"
              options={jobSites}
              selected={selectedJobSites}
              setSelected={setSelectedJobSites}
            />
            <FilterSection
              title="Experience Level"
              options={experienceLevels}
              selected={selectedExperienceLevels}
              setSelected={setSelectedExperienceLevels}
            />
            <FilterSection
              title="Education Level"
              options={educationLevels}
              selected={selectedEducationLevels}
              setSelected={setSelectedEducationLevels}
            />
            <FilterSection
              title="Gender Preference"
              options={genderOptions}
              selected={selectedGenders}
              setSelected={setSelectedGenders}
            />
            <FilterSection
              title="Budget Range"
              options={budgetRanges.map((r) => r.label)}
              selected={selectedBudgetRanges}
              setSelected={setSelectedBudgetRanges}
            />
            <FilterSection
              title="Duration"
              options={durations}
              selected={selectedDurations}
              setSelected={setSelectedDurations}
            />
            <FilterSection
              title="Visibility"
              options={["Public", "Private"]}
              selected={selectedVisibility}
              setSelected={setSelectedVisibility}
            />
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          className="flex-1 w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 text-sm sm:text-base transition-all font-inter ${darkMode ? "text-white" : "text-black"
                }`}
            >
              Open Filters
            </button>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4 font-inter">
              Premium Job Listings
            </h1>
            <p
              className={`text-sm sm:text-lg font-inter ${darkMode ? "text-white" : "text-black"
                }`}
            >
              Discover{" "}
              {userRole === "freelancer"
                ? "opportunities tailored for you"
                : "top talent for your projects"}
            </p>
            <div
              className={`mt-4 rounded-2xl p-3 sm:p-4 inline-block transition-colors ${darkMode ? "bg-black/60" : "bg-black/5"
                }`}
            >
              <span
                className={`text-xl sm:text-2xl font-bold font-inter ${darkMode ? "text-white" : "text-black"
                  }`}
              >
                {filteredJobs.length}
              </span>
              <span
                className={`ml-2 text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-black"
                  }`}
              >
                Jobs Found
              </span>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="mb-6 relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all shadow-lg font-inter ${darkMode
                ? "bg-black/60 text-white border border-white/10 hover:bg-black/80"
                : "bg-white text-black border border-black/10 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <span className="font-semibold">
                  {selectedFilterType || "Filter by"}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showFilterDropdown ? "rotate-180" : ""
                  }`}
              />
            </button>

            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full left-0 right-0 sm:right-auto sm:w-80 mt-2 rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto ${darkMode
                  ? "bg-black/95 border-white/20"
                  : "bg-white border-black/20"
                  }`}
              >
                <div className="p-4 space-y-2">
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === ""
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">All Jobs</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === "category"
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("category");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">By Category</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === "jobType"
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("jobType");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">By Job Type</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === "location"
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("location");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">By Location</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === "budget"
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("budget");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">By Budget</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFilterType === "experience"
                      ? darkMode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-cyan-100 text-cyan-600"
                      : darkMode
                        ? "hover:bg-white/10 text-white"
                        : "hover:bg-gray-100 text-black"
                      }`}
                    onClick={() => {
                      setSelectedFilterType("experience");
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span className="font-medium">By Experience</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Job Listings */}
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              <motion.div
                className="text-center py-12 sm:py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`w-10 sm:w-12 h-10 sm:h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${darkMode ? "text-white" : "text-black"
                    }`}
                />
                <p
                  className={`text-xl font-semibold font-inter ${darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                >
                  Loading jobs...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                className="text-center py-12 sm:py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl sm:text-8xl mb-4">⚠️</div>
                <h3
                  className={`text-xl sm:text-2xl font-bold font-inter mb-2 ${darkMode ? "text-white" : "text-black"
                    }`}
                >
                  {error}
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      fetchJobs();
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 text-sm sm:text-base transition-all font-inter text-white"
                  >
                    Retry
                  </button>
                  {jobs.length > 0 && (
                    <button
                      onClick={() => {
                        setError(null);
                        setFilteredJobs(jobs.slice(0, 10));
                        setHasMore(jobs.length > 10);
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 font-bold rounded-xl hover:from-green-600 hover:to-green-700 text-sm sm:text-base transition-all font-inter text-white"
                    >
                      View Available Jobs
                    </button>
                  )}
                </div>
              </motion.div>
            ) : filteredJobs.length === 0 ? (
              <motion.div
                className="text-center py-12 sm:py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl sm:text-8xl mb-4">🔍</div>
                <h3
                  className={`text-xl sm:text-2xl font-bold font-inter mb-2 ${darkMode ? "text-white" : "text-black"
                    }`}
                >
                  No jobs found
                </h3>
                <p
                  className={`text-sm sm:text-lg font-inter ${darkMode ? "text-white/80" : "text-black/70"
                    }`}
                >
                  Try adjusting your filters or search terms
                </p>
              </motion.div>
            ) : (
              filteredJobs.map((job: JobType, index: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-xl p-2 sm:p-3 md:p-4 shadow-lg transition-all duration-300 relative group border ${darkMode
                    ? "bg-black border-white/10 hover:bg-white/5"
                    : "bg-white border-black/10 hover:bg-black/5"
                    }`}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookmark(job.id)}
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${savedJobs.includes(job.id)
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : darkMode
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                          : "bg-black/10 text-black border border-black/20 hover:bg-black/20"
                        }`}
                    >
                      <Bookmark
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${savedJobs.includes(job.id) ? "fill-current" : ""
                          }`}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleShareMenu(job.id)}
                      className={`bg-gradient-to-r from-cyan-500 to-blue-500 p-1.5 sm:p-2 rounded-full shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-all ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                    {shareMenuOpen === job.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute top-10 sm:top-11 right-0 backdrop-blur-sm rounded-xl shadow-2xl border p-2 sm:p-2.5 z-10 min-w-[150px] sm:min-w-[160px] ${darkMode
                          ? "bg-black/95 border-white/20"
                          : "bg-white/95 border-black/20"
                          }`}
                      >
                        <div className="space-y-1">
                          <button
                            onClick={() => handleShare(job, "copy")}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-inter ${darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                              }`}
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "facebook")}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-inter ${darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                              }`}
                          >
                            <Facebook className="w-3 h-3" />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "twitter")}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-inter ${darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                              }`}
                          >
                            <Twitter className="w-3 h-3" />
                            <span>Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "linkedin")}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-inter ${darkMode
                              ? "text-white hover:bg-white/10"
                              : "text-black hover:bg-black/5"
                              }`}
                          >
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewJob(job)}
                      className={`p-1.5 sm:p-2 rounded-full border transition-all font-inter ${darkMode
                        ? "bg-white/10 text-white border-white/20 hover:bg-cyan-500/10 hover:text-cyan-400"
                        : "bg-black/10 text-black border-black/20 hover:bg-cyan-500/10 hover:text-cyan-600"
                        }`}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>

                  {/* Job Header Section */}
                  <div className="mb-1.5 sm:mb-2 pr-12 sm:pr-16">
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <h3
                        className={`text-base sm:text-lg md:text-xl font-bold font-inter leading-tight ${darkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {job.title || "Untitled Job"}
                      </h3>
                      {job.company && (
                        <p
                          className={`text-sm sm:text-base md:text-lg font-medium font-inter ${darkMode ? "text-white/90" : "text-black/90"
                            }`}
                        >
                          {job.company}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          />
                          <p
                            className={`text-xs font-inter ${darkMode ? "text-white/70" : "text-gray-600"
                              }`}
                          >
                            Posted{" "}
                            {job.createdAt?.seconds
                              ? new Date(
                                job.createdAt.seconds * 1000
                              ).toLocaleDateString()
                              : "Unknown"}
                          </p>
                        </div>
                        {job.createdAt?.seconds && (Date.now() / 1000 - job.createdAt.seconds < 172800) && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visual Separator */}
                  <div
                    className={`h-px w-full mb-6 sm:mb-8 ${darkMode ? "bg-white/10" : "bg-black/10"
                      }`}
                  />

                  {/* Job Description Section */}
                  <div className="mb-1.5 sm:mb-2">
                    <h4
                      className={`text-sm sm:text-base font-semibold mb-1.5 font-inter ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      Job Description
                    </h4>
                    <div
                      className={`prose prose-lg max-w-none font-inter ${darkMode ? "prose-invert" : ""
                        }`}
                    >
                      <div
                        className={`leading-relaxed text-xs ${darkMode ? "text-white/90" : "text-black/90"
                          }`}
                        style={{
                          lineHeight: "1.2",
                          wordSpacing: "0.01em",
                          letterSpacing: "0.001em",
                        }}
                      >
                        {expandedJobs.includes(job.id) ? (
                          <div className="space-y-0">
                            {(job.description || "No description provided")
                              .split("\n")
                              .map((paragraph, idx) => (
                                <div key={idx} className="mb-0">
                                  {paragraph.startsWith("**") &&
                                    paragraph.endsWith("**") ? (
                                    <div className="mb-0">
                                      <h5
                                        className={`text-xl sm:text-2xl font-bold mb-0 pb-2 border-b-2 ${darkMode
                                          ? "text-cyan-400 border-cyan-400/30"
                                          : "text-cyan-600 border-cyan-600/30"
                                          }`}
                                      >
                                        {paragraph.replace(/\*\*/g, "")}
                                      </h5>
                                    </div>
                                  ) : paragraph.startsWith("* ") ? (
                                    <div className="flex items-start gap-4 mb-0 pl-4">
                                      <span
                                        className={`text-cyan-500 mt-1 text-xl font-bold ${darkMode
                                          ? "text-cyan-400"
                                          : "text-cyan-600"
                                          }`}
                                      >
                                        •
                                      </span>
                                      <span className="flex-1 leading-relaxed">
                                        {paragraph.substring(2)}
                                      </span>
                                    </div>
                                  ) : paragraph.startsWith("- ") ? (
                                    <div className="flex items-start gap-4 mb-0 pl-4">
                                      <span
                                        className={`text-green-500 mt-1 text-xl font-bold ${darkMode
                                          ? "text-green-400"
                                          : "text-green-600"
                                          }`}
                                      >
                                        -
                                      </span>
                                      <span className="flex-1 leading-relaxed">
                                        {paragraph.substring(2)}
                                      </span>
                                    </div>
                                  ) : paragraph.trim() ? (
                                    <div className="mb-0 p-3 rounded-lg bg-gradient-to-r from-transparent to-transparent hover:from-opacity-5 hover:to-opacity-5 transition-all duration-300">
                                      <p className="leading-relaxed text-justify">
                                        {paragraph}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="space-y-0">
                            {(job.description || "No description provided")
                              .slice(0, 300)
                              .split("\n")
                              .map((paragraph, idx) => (
                                <div key={idx} className="mb-0">
                                  {paragraph.startsWith("**") &&
                                    paragraph.endsWith("**") ? (
                                    <div className="mb-0">
                                      <h5
                                        className={`text-xl sm:text-2xl font-bold mb-0 pb-2 border-b-2 ${darkMode
                                          ? "text-cyan-400 border-cyan-400/30"
                                          : "text-cyan-600 border-cyan-600/30"
                                          }`}
                                      >
                                        {paragraph.replace(/\*\*/g, "")}
                                      </h5>
                                    </div>
                                  ) : paragraph.startsWith("* ") ? (
                                    <div className="flex items-start gap-4 mb-0 pl-4">
                                      <span
                                        className={`text-cyan-500 mt-1 text-xl font-bold ${darkMode
                                          ? "text-cyan-400"
                                          : "text-cyan-600"
                                          }`}
                                      >
                                        •
                                      </span>
                                      <span className="flex-1 leading-relaxed">
                                        {paragraph.substring(2)}
                                      </span>
                                    </div>
                                  ) : paragraph.startsWith("- ") ? (
                                    <div className="flex items-start gap-4 mb-0 pl-4">
                                      <span
                                        className={`text-green-500 mt-1 text-xl font-bold ${darkMode
                                          ? "text-green-400"
                                          : "text-green-600"
                                          }`}
                                      >
                                        -
                                      </span>
                                      <span className="flex-1 leading-relaxed">
                                        {paragraph.substring(2)}
                                      </span>
                                    </div>
                                  ) : paragraph.trim() ? (
                                    <div className="mb-0 p-3 rounded-lg bg-gradient-to-r from-transparent to-transparent hover:from-opacity-5 hover:to-opacity-5 transition-all duration-300">
                                      <p className="leading-relaxed text-justify">
                                        {paragraph}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            {(job.description || "").length > 300 && (
                              <div className="mt-2">
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${darkMode
                                    ? "text-white/60 bg-white/10"
                                    : "text-gray-500 bg-gray-100"
                                    }`}
                                >
                                  ...
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {(job.description || "").length > 300 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => toggleExpand(job.id)}
                        className={`mt-3 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg text-xs sm:text-sm font-inter`}
                      >
                        {expandedJobs.includes(job.id)
                          ? "Read Less"
                          : "Read More"}
                      </motion.button>
                    )}
                  </div>

                  {/* Visual Separator */}
                  <div
                    className={`h-px w-full mb-3 sm:mb-4 ${darkMode ? "bg-white/10" : "bg-black/10"
                      }`}
                  />

                  {/* Job Details Grid */}
                  <div className="mb-1">
                    <h4
                      className={`text-xs sm:text-sm font-semibold mb-1 font-inter ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      Job Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-cyan-500/20" : "bg-cyan-500/10"
                            }`}
                        >
                          <DollarSign
                            className={`w-3 h-3 text-cyan-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Budget
                          </p>
                          <p
                            className={`font-bold text-xs sm:text-sm font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.compensationAmount && job.currency
                              ? `${job.compensationAmount} ${job.currency}`
                              : job.budget && job.budget > 0
                                ? `${job.budget} ETB`
                                : "Negotiable"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-blue-500/20" : "bg-blue-500/10"
                            }`}
                        >
                          <Clock
                            className={`w-3 h-3 text-blue-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Duration
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.duration || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-purple-500/20" : "bg-purple-500/10"
                            }`}
                        >
                          <Briefcase
                            className={`w-3 h-3 text-purple-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Job Type
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.jobType || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-green-500/20" : "bg-green-500/10"
                            }`}
                        >
                          <MapPin
                            className={`w-3 h-3 text-green-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Location
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.workLocation || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-orange-500/20" : "bg-orange-500/10"
                            }`}
                        >
                          <User
                            className={`w-3 h-3 text-orange-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Experience
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.experience || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-amber-500/20" : "bg-amber-500/10"
                            }`}
                        >
                          <Users
                            className={`w-3 h-3 text-amber-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Vacancies
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.vacancies || 1}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:shadow-lg font-inter ${darkMode
                          ? "bg-black/50 border-white/10 hover:bg-black/70"
                          : "bg-white/50 border-black/10 hover:bg-white/70"
                          }`}
                      >
                        <div
                          className={`p-0.5 rounded-md ${darkMode ? "bg-rose-500/20" : "bg-rose-500/10"
                            }`}
                        >
                          <Target
                            className={`w-3 h-3 text-rose-500`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium font-inter mb-0.5 ${darkMode ? "text-white/70" : "text-gray-500"
                              }`}
                          >
                            Gender
                          </p>
                          <p
                            className={`font-bold text-xs font-inter ${darkMode ? "text-white" : "text-gray-800"
                              }`}
                          >
                            {job.gender || "Any"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium font-inter border ${darkMode
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : "bg-cyan-50 text-cyan-600 border-cyan-100"
                              }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visual Separator */}
                  <div
                    className={`h-px w-full mb-3 sm:mb-4 ${darkMode ? "bg-white/10" : "bg-black/10"
                      }`}
                  />

                  {/* Action Buttons Section */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* View Details button - for all users */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/job-details/${job.id}`)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 text-xs sm:text-sm font-inter ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      View Details
                    </motion.button>

                    {/* Go to Site button - only show if job has external link */}
                    {job.jobLink && (
                      <motion.a
                        href={job.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-400/40 text-xs sm:text-sm font-inter flex items-center justify-center gap-1.5 text-white`}
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        Go to Site
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {hasMore && !loading && (
              <div ref={loaderRef} className="text-center py-6 sm:py-8">
                <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>

          {/* Job Preview Modal */}
          {previewJob && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`backdrop-blur-xl border rounded-3xl w-full max-w-[95%] sm:max-w-2xl shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin scrollbar-thumb-cyan-400 transition-colors font-inter ${darkMode
                  ? "bg-black/90 border-white/20 text-white scrollbar-track-black/50"
                  : "bg-white/90 border-black/20 text-black scrollbar-track-white/50"
                  }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 font-inter">
                    {previewJob.title || "Untitled Job"}
                  </h2>
                  <button
                    onClick={() => setPreviewJob(null)}
                    className={`p-2 rounded-xl transition-all font-inter ${darkMode
                      ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                      : "bg-black/10 text-black hover:bg-red-500/20 hover:text-red-600"
                      }`}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div
                  className={`mb-4 sm:mb-6 prose prose-lg max-w-none font-inter ${darkMode ? "prose-invert" : ""
                    }`}
                >
                  <div
                    className={`leading-relaxed text-xs sm:text-sm ${darkMode ? "text-white/90" : "text-black/90"
                      }`}
                    style={{
                      lineHeight: "1.4",
                      wordSpacing: "0.02em",
                      letterSpacing: "0.002em",
                    }}
                  >
                    {(previewJob.description || "No description provided")
                      .split("\n")
                      .map((paragraph, idx) => (
                        <div key={idx} className="mb-0">
                          {paragraph.startsWith("**") &&
                            paragraph.endsWith("**") ? (
                            <div className="mb-0">
                              <h5
                                className={`text-lg sm:text-xl font-bold mb-0 pb-2 border-b-2 ${darkMode
                                  ? "text-cyan-400 border-cyan-400/30"
                                  : "text-cyan-600 border-cyan-600/30"
                                  }`}
                              >
                                {paragraph.replace(/\*\*/g, "")}
                              </h5>
                            </div>
                          ) : paragraph.startsWith("* ") ? (
                            <div className="flex items-start gap-4 mb-0 pl-4">
                              <span
                                className={`text-cyan-500 mt-1 text-lg font-bold ${darkMode ? "text-cyan-400" : "text-cyan-600"
                                  }`}
                              >
                                •
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {paragraph.substring(2)}
                              </span>
                            </div>
                          ) : paragraph.startsWith("- ") ? (
                            <div className="flex items-start gap-4 mb-0 pl-4">
                              <span
                                className={`text-green-500 mt-1 text-lg font-bold ${darkMode ? "text-green-400" : "text-green-600"
                                  }`}
                              >
                                -
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {paragraph.substring(2)}
                              </span>
                            </div>
                          ) : paragraph.trim() ? (
                            <div className="mb-0 p-2 rounded-lg bg-gradient-to-r from-transparent to-transparent hover:from-opacity-5 hover:to-opacity-5 transition-all duration-300">
                              <p className="leading-relaxed text-justify">
                                {paragraph}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.compensationAmount && previewJob.currency
                        ? `${previewJob.compensationAmount} ${previewJob.currency}`
                        : previewJob.budget && previewJob.budget > 0
                          ? `${previewJob.budget} ETB`
                          : "Negotiable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.duration || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.jobType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.workLocation || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.experience || "Experience not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.vacancies || 1} Positions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.gender || "Any Gender"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.education || "Education not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                        }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {previewJob.category}
                    </span>
                  </div>
                  {previewJob.jobSector && (
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                          }`}
                      />
                      <span
                        className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {previewJob.jobSector}
                      </span>
                    </div>
                  )}
                  {previewJob.jobSite && (
                    <div className="flex items-center gap-2">
                      <Globe
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                          }`}
                      />
                      <span
                        className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {previewJob.jobSite}
                      </span>
                    </div>
                  )}
                  {previewJob.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-white" : "text-gray-600"
                          }`}
                      />
                      <span
                        className={`text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-gray-800"
                          }`}
                      >
                        Exp: {new Date(previewJob.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Show buttons only for freelancers */}
                {user && isAuthenticated && userRole === "freelancer" && (
                  <>
                    {previewJob.jobLink && (
                      <motion.a
                        href={previewJob.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-2 sm:py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg text-sm sm:text-base font-inter flex items-center justify-center gap-2 mb-4 ${darkMode ? "text-white" : "text-black"
                          }`}
                      >
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                        Go to Site
                      </motion.a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/job-details/${previewJob.id}`)}
                      className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-2 sm:py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg text-sm sm:text-base font-inter ${darkMode ? "text-white" : "text-black"
                        }`}
                    >
                      View Full Details
                    </motion.button>
                  </>
                )}
                {/* Show sign in button for non-authenticated users */}
                {!user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      navigate(
                        `/login?redirect=${encodeURIComponent(
                          location.pathname
                        )}`
                      )
                    }
                    className={`w-full bg-gradient-to-r from-green-500 to-green-600 font-bold py-2 sm:py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg text-sm sm:text-base font-inter text-white`}
                  >
                    Sign in to View Details
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.main>
      </div>
      <Footer />
      </div>
    </>
  );
};

export default JobListings;
