import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { JobType, ApplicationResponse } from "../types";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

// Categories aligned with PostJob.tsx
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
  "Business Intelligence",
  "Data Analysis",
  "Database Administration",
  "UI/UX Design",
  "Graphic Design",
  "Motion Graphics",
  "3D Animation",
  "Video Editing",
  "Content Writing",
  "Technical Writing",
  "Copywriting",
  "Translation & Localization",
  "Digital Marketing",
  "SEO & SEM",
  "Social Media Marketing",
  "Email Marketing",
  "Sales & Business Development",
  "Customer Success",
  "Technical Support",
  "Customer Service",
  "Human Resources Management",
  "Recruitment & Talent Acquisition",
  "Payroll & Benefits Administration",
  "Financial Analysis",
  "Accounting & Bookkeeping",
  "Tax Consulting",
  "Legal Services",
  "Contract Management",
  "Compliance & Risk Management",
  "Project Management",
  "Program Management",
  "Agile Coaching",
  "Product Management",
  "Operations Management",
  "Supply Chain & Logistics",
  "Healthcare & Medical Services",
  "Nursing",
  "Pharmacy",
  "Education & Training",
  "Instructional Design",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Environmental Consulting",
  "Event Planning",
  "Public Relations",
  "Market Research",
  "Real Estate Management",
  "Hospitality & Tourism",
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
];
const jobSites = ["Remote", "On-site", "Hybrid"];
const experienceLevels = [
  "Entry Level",
  "Junior",
  "Mid-level",
  "Senior",
  "Lead",
  "Executive",
];
const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Certification",
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

  const [searchTitle, setSearchTitle] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>(
    []
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedJobSites, setSelectedJobSites] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    string[]
  >([]);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<
    string[]
  >([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
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
  const loaderRef = useRef<HTMLDivElement>(null);

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

  // Parallax effect for orbs
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const orbY2 = useTransform(scrollY, [0, 1000], [0, 150]);
  const orbY3 = useTransform(scrollY, [0, 1000], [0, -100]);

  // Fetch jobs and application status
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getJobs({ page: 1, limit: 50 });
        const jobList: JobType[] = response.jobs.map((job: any) => ({
          id: job._id,
          jobId: job._id,
          title: job.title,
          description: job.description,
          company: job.company,
          budget: Number(job.budget || job.salary || 0),
          duration: job.duration || "Less than 1 month",
          category: job.category,
          jobType: job.jobType || "Full-time",
          workLocation: job.workLocation || job.city || "Remote",
          experience: job.experience,
          education: job.education,
          gender: job.gender,
          vacancies: job.vacancies,
          skills: job.skills,
          createdAt: job.createdAt,
          userId: job.postedBy?._id || job.postedBy,
          jobLink: job.jobLink || null,
        }));

        setJobs(jobList);
        setFilteredJobs(jobList.slice(0, 10));
        setHasMore(jobList.length > 10);

        // Check application status for each job if authenticated
        // Check application status for each job if authenticated
        if (apiService.isAuthenticated()) {
          const appliedSet = new Set<string>();

          await Promise.all(
            jobList.map(async (job) => {
              const jobId = job.id || job.jobId; // line ~247

              try {
                const appResponse: ApplicationResponse =
                  await apiService.checkApplication(jobId);
                if (appResponse.hasApplied) {
                  appliedSet.add(jobId);
                }
              } catch (err) {
                console.error(
                  `Error checking application for job ${jobId}:`,
                  err
                );
              }
            })
          );

          setAppliedJobs(appliedSet);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
          setFilteredJobs((prev) => {
            const newItems = jobs.slice(prev.length, prev.length + 10);
            const newFilteredJobs = [...prev, ...newItems];

            // Check if we should set hasMore to false
            if (newFilteredJobs.length >= jobs.length) {
              setHasMore(false);
            }

            return newFilteredJobs;
          });
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
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
        const budgetNum = Number(job.budget);
        return selectedBudgetRanges.some((rangeLabel) => {
          const range = budgetRanges.find((r) => r.label === rangeLabel);
          return range && budgetNum >= range.min && budgetNum < range.max;
        });
      });
    }
    if (selectedDurations.length) {
      filtered = filtered.filter(
        (job) =>
          job.duration !== undefined && selectedDurations.includes(job.duration)
      );
    }

    if (selectedJobTypes.length) {
      filtered = filtered.filter(
        (job) =>
          job.jobType !== undefined && selectedJobTypes.includes(job.jobType)
      );
    }

    if (selectedJobSites.length) {
      filtered = filtered.filter(
        (job) =>
          job.workLocation !== undefined &&
          selectedJobSites.includes(job.workLocation)
      );
    }

    if (selectedExperienceLevels.length) {
      filtered = filtered.filter((job) =>
        selectedExperienceLevels.includes(job.experience || "")
      );
    }

    if (selectedEducationLevels.length) {
      filtered = filtered.filter((job) =>
        selectedEducationLevels.includes(job.education || "")
      );
    }

    if (selectedGenders.length) {
      filtered = filtered.filter(
        (job) =>
          selectedGenders.includes(job.gender || "") ||
          selectedGenders.includes("Any") ||
          (!job.gender && selectedGenders.includes("Any"))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest")
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sortBy === "oldest")
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      if (sortBy === "budgetLow") return Number(a.budget) - Number(b.budget);
      if (sortBy === "budgetHigh") return Number(b.budget) - Number(a.budget);
      return 0;
    });

    // Reset pagination when filters change
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
    selectedEducationLevels,
    selectedGenders,
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
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const handleEdit = (jobId: string) => navigate(`/edit-job/${jobId}`);

  const handleShare = async (job: JobType, method: string) => {
    const jobUrl =
      job.jobLink || `${window.location.origin}/job-details/${job.id}`;
    const shareText = `Check out this job opportunity: ${job.title} - ${job.budget} ETB`;

    switch (method) {
      case "copy":
        try {
          await navigator.clipboard.writeText(jobUrl);
          alert("Job link copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy: ", err);
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
      navigate("/login?redirect=" + encodeURIComponent(location.pathname));
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

  const FilterSection = ({ title, options, selected, setSelected }: any) => (
    <div className="mb-6">
      <h3
        className={`text-lg sm:text-xl font-semibold mb-3 font-inter ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h3>
      <div className="flex flex-col">
        {options.map((option: string) => (
          <label
            key={option}
            className={`flex items-center space-x-3 mb-2 cursor-pointer select-none p-2 rounded-lg transition-all ${
              darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleSelection(option, selected, setSelected)}
              className="w-5 h-5 accent-cyan-400 rounded transition"
            />
            <span
              className={`text-sm sm:text-base font-inter ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

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
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-black" : "bg-white"
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

      <div className="relative z-10 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`fixed inset-y-0 left-0 z-50 w-11/12 sm:w-80 lg:w-96 rounded-r-3xl p-4 sm:p-6 space-y-6 shadow-2xl lg:sticky lg:top-6 max-h-screen overflow-hidden transition-colors duration-300 ${
            darkMode
              ? "bg-black border border-white/10"
              : "bg-white border border-black/10"
          } ${isSidebarOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-2 transition-colors font-inter ${
                darkMode
                  ? "text-white hover:text-white/70"
                  : "text-black hover:text-black/70"
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2 font-inter">
              🎯 Smart Filters
            </h2>
            <p
              className={`text-sm font-inter ${
                darkMode ? "text-white/80" : "text-black/70"
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
              className={`w-full p-3 sm:p-4 rounded-2xl transition-all shadow-lg focus:outline-none focus:ring-2 font-inter ${
                darkMode
                  ? "bg-black/60 text-white border border-white/10 placeholder:text-white/40 focus:ring-white/30"
                  : "bg-white text-black border border-black/10 placeholder:text-black/40 focus:ring-black/20"
              }`}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {searchTitle && (
              <button
                onClick={() => setSearchTitle("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  darkMode
                    ? "text-white/70 hover:text-white"
                    : "text-black/70 hover:text-black"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {showSuggestions && (
              <ul
                className={`absolute z-10 w-full backdrop-blur-sm rounded-xl max-h-48 overflow-y-auto shadow-2xl mt-2 border scrollbar-thin scrollbar-thumb-cyan-400 font-inter ${
                  darkMode
                    ? "bg-black/95 text-white border-white/20 scrollbar-track-black/50"
                    : "bg-white/95 text-black border-black/20 scrollbar-track-white/50"
                }`}
              >
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-2 sm:py-3 cursor-pointer transition-colors text-sm sm:text-base font-inter ${
                      darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
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
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 sm:py-3 px-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg font-semibold text-sm sm:text-base font-inter"
          >
            Clear All Filters
          </button>

          {/* Filters - Single Scrollable Container */}
          <div
            className={`space-y-6 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-350px)] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400 pr-2 ${
              darkMode ? "scrollbar-track-black/50" : "scrollbar-track-white/50"
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
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 text-sm sm:text-base transition-all font-inter ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Open Filters
            </button>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4 font-inter">
              🚀 Premium Job Listings
            </h1>
            <p
              className={`text-sm sm:text-lg font-inter ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Discover{" "}
              {userRole === "freelancer"
                ? "opportunities tailored for you"
                : "top talent for your projects"}
            </p>
            <div
              className={`mt-4 rounded-2xl p-3 sm:p-4 inline-block transition-colors ${
                darkMode ? "bg-black/60" : "bg-black/5"
              }`}
            >
              <span
                className={`text-xl sm:text-2xl font-bold font-inter ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                {filteredJobs.length}
              </span>
              <span
                className={`ml-2 text-sm sm:text-base font-inter ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                Jobs Found
              </span>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {[
              { label: "Total Jobs", value: jobs.length },
              { label: "Active Freelancers", value: 5000 },
              { label: "Projects Completed", value: 1200 },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className={`p-3 sm:p-4 rounded-2xl text-center transition-colors font-inter ${
                  darkMode
                    ? "bg-black border border-white/10"
                    : "bg-white border border-black/10"
                }`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
              >
                <p
                  className={`text-xl sm:text-2xl font-bold font-inter ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm sm:text-base font-inter ${
                    darkMode ? "text-white/80" : "text-black/70"
                  }`}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Job Listings */}
          <div className="space-y-4 sm:space-y-6">
            {loading ? (
              <motion.div
                className="text-center py-12 sm:py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`w-10 sm:w-12 h-10 sm:h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                />
                <p
                  className={`text-xl font-semibold font-inter ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  Loading jobs...
                </p>
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
                  className={`text-xl sm:text-2xl font-bold font-inter mb-2 ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  No jobs found
                </h3>
                <p
                  className={`text-sm sm:text-lg font-inter ${
                    darkMode ? "text-white/80" : "text-black/70"
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
                  className={`rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transition-all duration-300 relative group border ${
                    darkMode
                      ? "bg-black border-white/10 hover:bg-white/5"
                      : "bg-white border-black/10 hover:bg-black/5"
                  }`}
                >
                  {/* Applied Badge */}
                  {appliedJobs.has(job.id) && (
                    <div
                      className={`absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 px-3 py-1 rounded-full font-inter ${
                        darkMode
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-green-500/10 text-green-600 border border-green-500/20"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Applied</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookmark(job.id)}
                      className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                        savedJobs.includes(job.id)
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : darkMode
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                          : "bg-black/10 text-black border border-black/20 hover:bg-black/20"
                      }`}
                    >
                      <Bookmark
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          savedJobs.includes(job.id) ? "fill-current" : ""
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleShareMenu(job.id)}
                      className={`bg-gradient-to-r from-cyan-500 to-blue-500 p-2 sm:p-3 rounded-full shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-all ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    {shareMenuOpen === job.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute top-12 sm:top-14 right-0 backdrop-blur-sm rounded-2xl shadow-2xl border p-3 sm:p-4 z-10 min-w-[180px] sm:min-w-[200px] ${
                          darkMode
                            ? "bg-black/95 border-white/20"
                            : "bg-white/95 border-black/20"
                        }`}
                      >
                        <div className="space-y-2">
                          <button
                            onClick={() => handleShare(job, "copy")}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base font-inter ${
                              darkMode
                                ? "text-white hover:bg-white/10"
                                : "text-black hover:bg-black/5"
                            }`}
                          >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "facebook")}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base font-inter ${
                              darkMode
                                ? "text-white hover:bg-white/10"
                                : "text-black hover:bg-black/5"
                            }`}
                          >
                            <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "twitter")}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base font-inter ${
                              darkMode
                                ? "text-white hover:bg-white/10"
                                : "text-black hover:bg-black/5"
                            }`}
                          >
                            <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare(job, "linkedin")}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base font-inter ${
                              darkMode
                                ? "text-white hover:bg-white/10"
                                : "text-black hover:bg-black/5"
                            }`}
                          >
                            <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>LinkedIn</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewJob(job)}
                      className={`p-2 sm:p-3 rounded-full border transition-all font-inter ${
                        darkMode
                          ? "bg-white/10 text-white border-white/20 hover:bg-cyan-500/10 hover:text-cyan-400"
                          : "bg-black/10 text-black border-black/20 hover:bg-cyan-500/10 hover:text-cyan-600"
                      }`}
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>

                  {/* Job Header */}
                  <div className="mb-4 sm:mb-6 pr-16 sm:pr-20">
                    <h3
                      className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 font-inter ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {job.title}
                    </h3>
                    {job.company && (
                      <p
                        className={`text-base sm:text-lg md:text-xl font-medium mb-2 font-inter ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        {job.company}
                      </p>
                    )}
                    <p
                      className={`flex items-center gap-2 text-sm sm:text-base font-inter ${
                        darkMode ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      <Calendar
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      />
                      Posted{" "}
                      {job.createdAt
                        ? new Date(
                            job.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>

                  {/* Job Description */}
                  <div className="mb-4 sm:mb-6">
                    <p
                      className={`leading-relaxed text-sm sm:text-lg font-inter ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {expandedJobs.includes(job.id)
                        ? job.description
                        : `${job.description?.slice(0, 200)}...`}
                    </p>
                    {job.description?.length > 200 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => toggleExpand(job.id)}
                        className={`mt-2 sm:mt-3 underline font-medium transition-colors text-sm sm:text-base font-inter ${
                          darkMode
                            ? "text-white hover:text-white/80"
                            : "text-black hover:text-black/80"
                        }`}
                      >
                        {expandedJobs.includes(job.id)
                          ? "Read Less"
                          : "Read More"}
                      </motion.button>
                    )}
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors font-inter ${
                        darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white/50 border-black/10"
                      }`}
                    >
                      <DollarSign
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-inter ${
                            darkMode ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          Budget
                        </p>
                        <p
                          className={`font-semibold text-sm sm:text-base font-inter ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {job.budget} ETB
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors font-inter ${
                        darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white/50 border-black/10"
                      }`}
                    >
                      <Clock
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-inter ${
                            darkMode ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          Duration
                        </p>
                        <p
                          className={`font-semibold text-sm sm:text-base font-inter ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {job.duration}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors font-inter ${
                        darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white/50 border-black/10"
                      }`}
                    >
                      <Briefcase
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-inter ${
                            darkMode ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          Job Type
                        </p>
                        <p
                          className={`font-semibold text-sm sm:text-base font-inter ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {job.jobType}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors font-inter ${
                        darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white/50 border-black/10"
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-inter ${
                            darkMode ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          Location
                        </p>
                        <p
                          className={`font-semibold text-sm sm:text-base font-inter ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {job.workLocation}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors font-inter ${
                        darkMode
                          ? "bg-black/50 border-white/10"
                          : "bg-white/50 border-black/10"
                      }`}
                    >
                      <User
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          darkMode ? "text-white" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-inter ${
                            darkMode ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          Experience
                        </p>
                        <p
                          className={`font-semibold text-sm sm:text-base font-inter ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {job.experience || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold font-inter">
                      {job.category}
                    </span>
                    {job.gender && (
                      <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold font-inter">
                        Gender: {job.gender}
                      </span>
                    )}
                    {job.vacancies && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold font-inter">
                        {job.vacancies} Positions
                      </span>
                    )}
                    {Array.isArray(job.skills) &&
                      job.skills
                        .slice(0, 3)
                        .map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-inter"
                          >
                            {skill}
                          </span>
                        ))}
                    {Array.isArray(job.skills) && job.skills.length > 3 && (
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-inter ${
                          darkMode
                            ? "bg-white/20 text-white"
                            : "bg-black/20 text-black"
                        }`}
                      >
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/job-details/${job.id}`)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 text-sm sm:text-base font-inter ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      View Details
                    </motion.button>
                    {job.jobLink && (
                      <motion.a
                        href={job.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 text-sm sm:text-base font-inter flex items-center gap-2 ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                        Go to Site
                      </motion.a>
                    )}
                    {user && job.userId === user._id ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(job.id)}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-sm sm:text-base font-inter"
                        >
                          ✏️ Edit Job
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(job.id)}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg text-sm sm:text-base font-inter"
                        >
                          🗑️ Delete Job
                        </motion.button>
                      </>
                    ) : user && userRole === "freelancer" ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/job-details/${job.id}`)}
                        className={`px-6 sm:px-8 py-2 sm:py-3 font-bold rounded-xl transition-all shadow-lg text-sm sm:text-base font-inter ${
                          appliedJobs.has(job.id)
                            ? darkMode
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                        }`}
                        disabled={appliedJobs.has(job.id)}
                      >
                        {appliedJobs.has(job.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
                            Applied
                          </>
                        ) : (
                          "🚀 Apply Now"
                        )}
                      </motion.button>
                    ) : null}
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
                className={`backdrop-blur-xl border rounded-3xl w-full max-w-[95%] sm:max-w-2xl shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin scrollbar-thumb-cyan-400 transition-colors font-inter ${
                  darkMode
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
                    {previewJob.title}
                  </h2>
                  <button
                    onClick={() => setPreviewJob(null)}
                    className={`p-2 rounded-xl transition-all font-inter ${
                      darkMode
                        ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                        : "bg-black/10 text-black hover:bg-red-500/20 hover:text-red-600"
                    }`}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <p
                  className={`mb-4 sm:mb-6 text-sm sm:text-base font-inter ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {previewJob.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        darkMode ? "text-white" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {previewJob.budget} ETB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        darkMode ? "text-white" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {previewJob.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        darkMode ? "text-white" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {previewJob.jobType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        darkMode ? "text-white" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm sm:text-base font-inter ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {previewJob.workLocation}
                    </span>
                  </div>
                </div>
                {previewJob.jobLink && (
                  <motion.a
                    href={previewJob.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-2 sm:py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg text-sm sm:text-base font-inter flex items-center justify-center gap-2 mb-4 ${
                      darkMode ? "text-white" : "text-black"
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
                  className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold py-2 sm:py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg text-sm sm:text-base font-inter ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  View Full Details
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default JobListings;
