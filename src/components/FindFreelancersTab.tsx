import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, MapPin, Briefcase, Clock, MessageCircle, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import apiService from "../services/api";
import { FreelancerWithStatus } from "../types";
import StatusIndicator from "./StatusIndicator";
import FreelancerProfileModal from "./FreelancerProfileModal";

const CACHE_KEY = "freelancers_cache";
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface FindFreelancersTabProps {
  sharedFreelancers?: FreelancerWithStatus[];
  setSharedFreelancers?: (freelancers: FreelancerWithStatus[]) => void;
}

const FindFreelancersTab: React.FC<FindFreelancersTabProps> = ({
  sharedFreelancers,
  setSharedFreelancers
}) => {
  const resetFindFreelancers = false;
  const shouldClearCacheOnMount = true;
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Use shared state if provided, otherwise use local state
  const [localFreelancers, setLocalFreelancers] = useState<FreelancerWithStatus[]>([]);
  const freelancers = sharedFreelancers || localFreelancers;

  const setFreelancers = (newFreelancers: FreelancerWithStatus[]) => {
    if (setSharedFreelancers) {
      setSharedFreelancers(newFreelancers);
    } else {
      setLocalFreelancers(newFreelancers);
    }
  };
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerWithStatus | null>(null);
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: "",
    status: "" as "" | "online" | "offline" | "available" | "busy",
    experienceLevel: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const hasFetchedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from cache on mount
  useEffect(() => {
    if (shouldClearCacheOnMount) {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (error) {
        console.error("Failed to clear freelancers cache:", error);
      }
    }
    const loadCachedFreelancers = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          // Use cache if less than timeout old
          if (age < CACHE_TIMEOUT && Array.isArray(data) && data.length > 0) {
            console.log("Loading freelancers from cache");
            setFreelancers(data);
            setLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.error("Failed to load cached freelancers:", error);
      }
      return false;
    };

    // Try to load from cache first
    const cacheLoaded = loadCachedFreelancers();

    // Always fetch fresh data, but cache provides instant display
    if (!hasFetchedRef.current) {
      fetchFreelancers();
      hasFetchedRef.current = true;
    }
  }, []);

  // Save to cache when freelancers change
  useEffect(() => {
    if (freelancers.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: freelancers,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error("Failed to cache freelancers:", error);
      }
    }
  }, [freelancers]);

  const fetchFreelancers = async (retries = 3) => {
    try {
      setLoading(true);
      const data = await apiService.getFreelancersWithStatus();
      console.log("Fetched freelancers data:", data);
      console.log("Number of freelancers:", Array.isArray(data) ? data.length : 0);
      // Only update if we got valid data
      if (Array.isArray(data)) {
        const activeFreelancers = data.filter((freelancer) => freelancer.isActive !== false);
        console.log("Setting freelancers:", data.length);
        setFreelancers(activeFreelancers);
        // Clear any retry timeout on success
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } else {
        console.warn("Invalid freelancers data received:", data);
        // Keep existing freelancers if API returns invalid data
      }
    } catch (error: any) {
      console.error("Error fetching freelancers:", error);

      // Check if it's a network error (backend not running)
      const isNetworkError = error?.code === 'ERR_NETWORK' ||
        error?.code === 'ECONNREFUSED' ||
        error?.message?.includes('Network Error') ||
        error?.message?.includes('CONNECTION_REFUSED');

      if (isNetworkError) {
        console.warn("Backend server appears to be offline. Please ensure the backend server is running on port 5000.");

        // Retry logic for network errors
        if (retries > 0) {
          console.log(`Retrying in 2 seconds... (${retries} attempts remaining)`);
          retryTimeoutRef.current = setTimeout(() => {
            fetchFreelancers(retries - 1);
          }, 2000);
        } else {
          // Final failure - keep existing freelancers if we have any
          if (freelancers.length === 0) {
            // Try to load from cache as last resort
            try {
              const cached = localStorage.getItem(CACHE_KEY);
              if (cached) {
                const { data } = JSON.parse(cached);
                if (Array.isArray(data) && data.length > 0) {
                  setFreelancers(data);
                }
              }
            } catch (e) {
              console.error("Failed to load from cache:", e);
            }
          }
        }
      } else {
        // For other errors, only clear if we have no freelancers yet
        if (freelancers.length === 0) {
          setFreelancers([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Get unique skills and locations from freelancers
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    freelancers.forEach((f) => {
      f.profile?.skills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [freelancers]);

  const allLocations = useMemo(() => {
    const locationsSet = new Set<string>();
    freelancers.forEach((f) => {
      if (f.profile?.location) {
        locationsSet.add(f.profile.location);
      }
    });
    return Array.from(locationsSet).sort();
  }, [freelancers]);

  // Filter freelancers based on search and filters
  const filteredFreelancers = useMemo(() => {
    console.log("Filtering freelancers. Total:", freelancers.length);
    const filtered = freelancers.filter((freelancer) => {
      // Filter out the current user to prevent self-messaging
      // Commented out to allow freelancers to see their own profile in list
      // if (user?._id && freelancer._id === user._id) {
      //   return false;
      // }

      const profile = freelancer.profile || {};
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim().toLowerCase();
      const email = freelancer.email.toLowerCase();
      const skills = profile.skills || [];
      const location = profile.location || "";

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !fullName.includes(searchLower) &&
          !email.includes(searchLower) &&
          !skills.some((s) => s.toLowerCase().includes(searchLower)) &&
          !profile.primarySkill?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills.length > 0) {
        if (!filters.skills.some((skill) => skills.includes(skill))) {
          return false;
        }
      }

      // Location filter
      if (filters.location && location !== filters.location) {
        return false;
      }

      // Status filter
      if (filters.status && freelancer.status !== filters.status) {
        return false;
      }

      // Experience level filter
      if (
        filters.experienceLevel &&
        profile.experienceLevel !== filters.experienceLevel
      ) {
        return false;
      }

      return true;
    });
    console.log("Filtered freelancers count:", filtered.length);
    return filtered;
  }, [freelancers, searchTerm, filters, user?._id]);

  const toggleSkillFilter = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      location: "",
      status: "",
      experienceLevel: "",
    });
    setSearchTerm("");
  };

  const handleViewProfile = (freelancer: FreelancerWithStatus) => {
    setSelectedFreelancer(freelancer);
  };

  const handleMessage = (freelancer: FreelancerWithStatus) => {
    // Navigate to chat interface with freelancer ID
    navigate("/chat", {
      state: {
        freelancerId: freelancer._id,
        freelancer: freelancer,
      },
    });
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute inset-0 ${darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900"
          : "bg-gradient-to-br from-cyan-50 via-white to-blue-50"
          }`} />
        <motion.div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-cyan-500" : "bg-cyan-400"
            }`}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-blue-500" : "bg-blue-400"
            }`}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-6 backdrop-blur-xl ${darkMode
          ? "bg-black/40 border-b border-white/10"
          : "bg-white/60 border-b border-gray-200/50"
          }`}
      >
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 rounded-2xl ${darkMode
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                }`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className={`w-6 h-6 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                }`} />
            </motion.div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"
                }`}>
                Find Elite Freelancers
              </h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                Discover top talent ready to work
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
            />
            <input
              type="text"
              placeholder="Search by name, skill, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all backdrop-blur-xl ${darkMode
                ? "bg-white/5 border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-500 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                : "bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-500 focus:bg-white focus:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Freelancers Grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className={`w-16 h-16 border-4 rounded-full mx-auto mb-6 ${darkMode
                  ? "border-cyan-500/30 border-t-cyan-500"
                  : "border-cyan-200 border-t-cyan-500"
                  }`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className={`text-lg font-semibold ${darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Discovering Elite Talent...
              </motion.p>
            </motion.div>
          </div>
        ) : filteredFreelancers.length === 0 && !loading ? (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <motion.div
                className={`w-24 h-24 rounded-full mx-auto mb-6 ${darkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/30"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-cyan-200"
                  } flex items-center justify-center`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className={`w-12 h-12 ${darkMode ? "text-gray-600" : "text-gray-400"
                  }`} />
              </motion.div>
              <p className={`text-xl font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                No freelancers found
              </p>
              <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"
                }`}>
                {searchTerm || filters.skills.length > 0 || filters.location || filters.status || filters.experienceLevel
                  ? "Try adjusting your search or filters"
                  : "No freelancers available at the moment"}
              </p>
            </div>
          </motion.div>
        ) : filteredFreelancers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredFreelancers.map((freelancer, index) => {
              const profile = freelancer.profile || {};
              const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email;
              const primarySkill = profile.primarySkill || profile.skills?.[0] || "Freelancer";
              const location = profile.location || "Not specified";

              return (
                <motion.div
                  key={freelancer._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 120,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.005,
                    x: 4,
                    transition: { duration: 0.2 }
                  }}
                  className={`group relative rounded-xl border p-3 md:p-4 cursor-pointer transition-all backdrop-blur-xl overflow-hidden ${darkMode
                    ? "bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    : "bg-white border-gray-100 hover:border-cyan-400/50 hover:shadow-lg"
                    }`}
                  onClick={() => handleViewProfile(freelancer)}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Compact Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${darkMode
                          ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                          : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                          } flex items-center justify-center text-lg md:text-xl font-bold shadow-sm`}
                      >
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      {freelancer.status && (
                        <div className="absolute -bottom-0.5 -right-0.5 scale-75">
                          <StatusIndicator status={freelancer.status} size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Compact Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-sm md:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {fullName}
                        </h3>
                        {index < 3 && !searchTerm && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
                            Top
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5">
                        <p className={`text-xs font-semibold truncate ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                          {primarySkill}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <MapPin className={`w-3 h-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                          <span className={`text-[10px] md:text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Action Section */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleMessage(freelancer);
                        }}
                        className={`p-2 rounded-lg transition-all ${darkMode
                          ? "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                          : "bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-100"
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Send Message"
                      >
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                      </motion.button>
                      <motion.button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleViewProfile(freelancer);
                        }}
                        className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${darkMode
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/10"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Profile
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Profile Modal */}
      {selectedFreelancer && (
        <FreelancerProfileModal
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onMessage={() => {
            if (selectedFreelancer) {
              const freelancerToMessage = selectedFreelancer;
              setSelectedFreelancer(null);
              handleMessage(freelancerToMessage);
            }
          }}
        />
      )}
    </div>
  );
};

export default FindFreelancersTab;
