import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import { Job } from "../types";
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
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other",
];

// Expanded, specific job categories
const categories = [
  "Software Development", "Web Development", "Mobile App Development", "Game Development",
  "DevOps Engineering", "Cloud Computing", "Cybersecurity", "Data Science",
  "Machine Learning & AI", "Business Intelligence", "Data Analysis", "Database Administration",
  "UI/UX Design", "Graphic Design", "Motion Graphics", "3D Animation",
  "Video Editing", "Content Writing", "Technical Writing", "Copywriting",
  "Translation & Localization", "Digital Marketing", "SEO & SEM", "Social Media Marketing",
  "Email Marketing", "Sales & Business Development", "Customer Success", "Technical Support",
  "Customer Service", "Human Resources Management", "Recruitment & Talent Acquisition",
  "Payroll & Benefits Administration", "Financial Analysis", "Accounting & Bookkeeping",
  "Tax Consulting", "Legal Services", "Contract Management", "Compliance & Risk Management",
  "Project Management", "Program Management", "Agile Coaching", "Product Management",
  "Operations Management", "Supply Chain & Logistics", "Healthcare & Medical Services",
  "Nursing", "Pharmacy", "Education & Training", "Instructional Design",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Environmental Consulting",
  "Event Planning", "Public Relations", "Market Research", "Real Estate Management",
  "Hospitality & Tourism", "Other",
];

const experienceLevels = [
  "Internship", "Entry Level", "Junior", "Mid Level", "Senior",
  "Lead", "Manager", "Director", "Executive", "Expert",
];

const jobTypes = ["Remote", "Freelance", "Part-time", "Full-time", "Contract"];

const skillsOptions = [
  "JavaScript", "React", "Node.js", "Python", "Django", "UI/UX", "Graphic Design",
  "SEO", "Content Writing", "Project Management", "Marketing", "Sales", "Other",
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

const EditJobMongo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [workLocation, setWorkLocation] = useState<string>("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobLink, setJobLink] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [vacancies, setVacancies] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup?redirect=" + encodeURIComponent(location.pathname));
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const jobData = await apiService.getJob(id);

        // Check if current user is the job owner
        const jobOwnerId = typeof jobData.postedBy === 'string'
          ? jobData.postedBy
          : jobData.postedBy?._id;

        if (jobOwnerId !== user?._id) {
          alert("You don't have permission to edit this job.");
          navigate("/job-listings");
          return;
        }

        // Populate form fields
        setTitle(jobData.title || "");
        setDescription(jobData.description || "");
        setCompany(jobData.company || "");
        setCategory(jobData.category || "");
        setSalary(String(jobData.budget || ""));
        setDeadline(jobData.deadline || "");
        setExperience(jobData.experience || "");
        setJobType(jobData.jobType || "");
        setWorkLocation(jobData.workLocation || "Remote");
        setSkills(jobData.skills || []);
        setJobLink(jobData.jobLink || "");
        setGender(jobData.gender || "");
        setVacancies(jobData.vacancies?.toString() || "");
        setAddress(jobData.address || "");
        setCountry(jobData.country || "");
        setCity(jobData.city || "");
        setEducation(jobData.education || "");
      } catch (error) {
        console.error("Error fetching job:", error);
        alert("Failed to load job data.");
        navigate("/job-listings");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchJob();
    }
  }, [id, isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);

    try {
      const jobData = {
        title,
        description,
        company,
        category,
        budget: salary,
        deadline,
        experience,
        jobType,
        workLocation,
        skills,
        jobLink: jobLink.trim() || null,
        gender,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        address: address.trim() || null,
        country,
        city: city.trim() || null,
        education: education.trim() || null,
      };

      // Update job using API
      await apiService.updateJob(id, jobData);

      alert("🎉 Job updated successfully!");
      navigate("/job-listings");
    } catch (error: unknown) {
      console.error("Error updating job:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      alert(`❌ Error updating job. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-black" : "bg-white"} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`text-xl font-semibold ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
            Loading job data...
          </p>
        </div>
      </div>
    );
  }

  return (
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

      {/* Header */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/job-listings")}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl font-inter transition-all duration-300 border shadow-[0_4px_6px_rgba(0,0,0,0.3)] ${darkMode
              ? "bg-black/40 text-cyan-400 border-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40"
              : "bg-white/40 text-cyan-600 border-cyan-500/10 hover:text-cyan-500 hover:border-cyan-400/20"
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
        </div>
      </div>

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
          {"Edit Job".split("").map((char, i: number) => (
            <motion.span key={i} variants={letterVariants} custom={i}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
        <p
          className={`text-center text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
            } mt-4`}
        >
          Update your job listing details
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Job Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter job title"
                required
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Company *
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
                required
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Job Type *
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
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Work Location *
              </label>
              <select
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                required
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white"
                  : "bg-white/10 border-gray-300/50 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              >
                <option value="" disabled className="text-gray-400">
                  Select Work Location
                </option>
                {workLocations.map((wl) => (
                  <option
                    key={wl}
                    value={wl}
                    className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "black"
                      }`}
                  >
                    {wl}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Category *
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
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Salary *
              </label>
              <input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Enter salary range (e.g., 50,000-70,000 ETB)"
                type="text"
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
                Job Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job"
                rows={5}
                required
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 resize-none`}
              />
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
              {"Location".split("").map((char, i: number) => (
                <motion.span key={i} variants={letterVariants} custom={i}>
                  {char}
                </motion.span>
              ))}
            </motion.h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white"
                  : "bg-white/10 border-gray-300/50 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              >
                <option value="" disabled className="text-gray-400">
                  Select Country
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
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
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
                Address (Optional)
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Requirements Section */}
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
            <UserCheck
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
              {"Requirements".split("").map((char, i: number) => (
                <motion.span key={i} variants={letterVariants} custom={i}>
                  {char}
                </motion.span>
              ))}
            </motion.h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
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
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
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
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Number of Vacancies (Optional)
              </label>
              <input
                type="number"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                placeholder="Enter number of vacancies"
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Educational Qualification
              </label>
              <input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Enter required education"
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
                Skills & Expertise (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {skillsOptions.map((skill) => (
                  <motion.button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    variants={inputVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1 rounded-full border transition-all duration-300 ${skills.includes(skill)
                      ? "bg-cyan-400 text-black border-cyan-400 shadow-lg shadow-cyan-400/25"
                      : darkMode
                        ? "border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
                        : "border-gray-300 text-gray-600 hover:border-cyan-400 hover:text-cyan-400"
                      }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Additional Info Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Deadline *
              </label>
              <input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                type="date"
                required
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white"
                  : "bg-white/10 border-gray-300/50 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
              >
                Job Link (Optional)
              </label>
              <input
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="Enter job application link"
                className={`w-full p-4 rounded-xl border ${darkMode
                  ? "bg-black/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  : "bg-white/10 border-gray-300/50 text-black placeholder:text-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Submit Button */}
        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          <motion.button
            whileHover={{
              scale: isSubmitting ? 1 : 1.05,
              y: isSubmitting ? 0 : -2,
            }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full max-w-md py-3 px-6 font-bold rounded-xl shadow-xl transition-all duration-300 font-inter tracking-tight ${isSubmitting
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 hover:shadow-cyan-400/40"
              }`}
          >
            <Send className="inline w-5 h-5 mr-2" />
            {isSubmitting ? "🔄 Updating Job..." : "✅ Update Job"}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default EditJobMongo;
