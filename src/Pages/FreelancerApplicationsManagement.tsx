import React, { useEffect, useState, useMemo, useCallback } from "react";
import apiService from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Calendar,
    Search,
    ChevronDown,
    ChevronUp,
    MapPin,
    Building2,
    ExternalLink,
    Sparkles,
    FileText,
} from "lucide-react";

interface Application {
    _id: string;
    job: string | { _id: string; title: string; category?: string; workLocation?: string; budget?: string; company?: string };
    jobTitle: string;
    company?: string;
    appliedAt: string;
    status: "pending" | "in_review" | "hired" | "rejected";
    notes?: string;
    coverLetter?: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "hired":
            return "bg-green-500/20 text-green-400 border-green-500/30";
        case "rejected":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        case "in_review":
            return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
        default:
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "hired":
            return CheckCircle;
        case "rejected":
            return XCircle;
        case "in_review":
            return Eye;
        default:
            return Clock;
    }
};

const ApplicationCard = ({
    application,
    darkMode,
    isExpanded,
    toggleExpand,
}: {
    application: Application;
    darkMode: boolean;
    isExpanded: boolean;
    toggleExpand: () => void;
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const StatusIcon = getStatusIcon(application.status);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 glass-card transition-all duration-300 relative overflow-hidden group border-l-4 ${
                application.status === 'hired' ? 'border-l-green-500' :
                application.status === 'rejected' ? 'border-l-red-500' :
                application.status === 'in_review' ? 'border-l-cyan-500' :
                'border-l-yellow-500'
            } ${
                darkMode
                    ? "bg-black/50 border-cyan-500/20"
                    : "bg-white/70 border-black/10 shadow-sm shadow-black/5"
            }`}
            whileHover={{
                scale: 1.01,
                boxShadow: darkMode
                    ? "0 25px 50px rgba(6, 242, 242, 0.1)"
                    : "0 25px 50px rgba(6, 242, 242, 0.08)",
            }}
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg sm:text-xl font-bold font-display cyan-gradient-text">
                            {application.jobTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border ${getStatusColor(
                                    application.status
                                )} shadow-lg transition-all duration-300 group-hover:scale-110 uppercase`}
                            >
                                <StatusIcon className="w-3 h-3" />
                                {application.status.replace("_", " ")}
                            </span>
                            {application.status === 'hired' && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-xl"
                                    title="Congratulations!"
                                >
                                    🎉
                                </motion.span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 mb-4">
                        <div className="flex items-center gap-2 text-sm font-body">
                            <Building2 className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Company:</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {application.company || "Direct Client"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-body">
                            <Calendar className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Applied:</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {formatDate(application.appliedAt)}
                            </span>
                        </div>
                        {typeof application.job === 'object' && application.job?.workLocation && (
                            <div className="flex items-center gap-2 text-sm font-body">
                                <MapPin className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Location:</span>
                                <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    {application.job.workLocation}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 mt-2 border-t border-cyan-500/10">
                        <motion.button
                            onClick={toggleExpand}
                            className={`flex items-center gap-2 text-sm font-medium font-body transition-all ${
                                darkMode
                                    ? "text-cyan-300 hover:text-cyan-200"
                                    : "text-cyan-700 hover:text-cyan-600"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileText className="w-4 h-4" />
                            {isExpanded ? "Hide Details" : "View My Application"}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                const jobId = typeof application.job === 'string' ? application.job : (application.job as any)._id;
                                if (jobId) window.open(`/job-details/${jobId}`, '_blank');
                            }}
                            className={`flex items-center gap-1 text-sm font-medium font-body transition-all ${
                                darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View Original Job <ExternalLink className="w-3 h-3" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`mt-6 p-4 rounded-xl glass-card ${
                            darkMode
                                ? "bg-white/[0.02] border-cyan-500/20"
                                : "bg-white/50 border-black/10"
                        } border`}>
                            <div className="space-y-6">
                                {application.coverLetter && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 font-body ${
                                            darkMode ? "text-cyan-400" : "text-cyan-700"
                                        }`}>
                                            Your Cover Letter
                                        </h4>
                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap font-body ${
                                            darkMode ? "text-gray-300" : "text-gray-700"
                                        }`}>
                                            {application.coverLetter}
                                        </p>
                                    </div>
                                )}
                                {application.notes && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 font-body ${
                                            darkMode ? "text-cyan-400" : "text-cyan-700"
                                        }`}>
                                            Feedback / Notes from Recruiter
                                        </h4>
                                        <div className={`p-3 rounded-lg border ${
                                            darkMode
                                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                                                : "bg-cyan-50/80 border-cyan-200/60 text-cyan-700"
                                        } font-body text-sm`}>
                                            {application.notes}
                                        </div>
                                    </div>
                                )}
                                {!application.coverLetter && !application.notes && (
                                    <p className="text-sm text-center py-4 text-gray-500 font-body">No additional details available.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FreelancerApplicationsManagement: React.FC = () => {
    const darkMode = useAppSelector((s) => s.theme.darkMode);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "in_review" | "hired" | "rejected">("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const location = useLocation();

    // Handle redirection state (e.g., from JobDetails)
    useEffect(() => {
        const state = location.state as any;
        if (state?.previewApplicationId) {
            setExpandedId(state.previewApplicationId);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                setLoading(true);
                const apps = await apiService.getMyApplications();
                setApplications(apps);
            } catch (err) {
                console.error("Failed to fetch applications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const filteredApps = useMemo(() => {
        return applications.filter((app) => {
            const matchesSearch = (app.jobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (app.company || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = activeFilter === "all" || app.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [applications, searchTerm, activeFilter]);

    const stats = useMemo(() => {
        return {
            all: applications.length,
            pending: applications.filter(a => a.status === "pending").length,
            in_review: applications.filter(a => a.status === "in_review").length,
            hired: applications.filter(a => a.status === "hired").length,
            rejected: applications.filter(a => a.status === "rejected").length,
        };
    }, [applications]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: darkMode ? "#000" : "#fff" }}>
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className={`w-14 h-14 border-4 ${
                            darkMode
                                ? "border-cyan-400 border-t-transparent"
                                : "border-cyan-600 border-t-transparent"
                        } rounded-full animate-spin mx-auto mb-4`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className={`text-base font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fetching your applications...</p>
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { id: "all", label: "All", icon: Briefcase, count: stats.all },
        { id: "pending", label: "Pending", icon: Clock, count: stats.pending },
        { id: "in_review", label: "In Review", icon: Eye, count: stats.in_review },
        { id: "hired", label: "Successful", icon: CheckCircle, count: stats.hired },
        { id: "rejected", label: "Not Selected", icon: XCircle, count: stats.rejected },
    ];

    return (
        <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
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
                .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
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
                :root:not(.dark) .glass-card { border-color: rgba(0,0,0,0.1); }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Animated Background Blobs */}
            <motion.div
                className="fixed inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
            </motion.div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight mb-2">
                        <span className="cyan-gradient-text animate-shimmer">My Applications</span>
                        <Briefcase className="inline-block w-6 h-6 sm:w-7 sm:h-7 ml-2 md:ml-3 text-cyan-400 animate-float" />
                    </h1>
                    <p className={`text-base sm:text-lg font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Track and manage your sent job applications in one place.
                    </p>
                </motion.div>

                {/* Search & Filter Section */}
                <motion.div
                    className={`rounded-2xl p-4 sm:p-5 mb-6 glass-card ${
                        darkMode
                            ? "bg-black/50 border-cyan-500/20"
                            : "bg-white/70 border-black/10 shadow-sm shadow-black/5"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                        <input
                            type="text"
                            placeholder="Search by job title or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-body backdrop-blur-xl transition-all ${
                                darkMode
                                    ? "bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]"
                                    : "bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white"
                            } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:shadow-[0_0_20px_rgba(6,242,242,0.08)]`}
                            style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                        />
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 mb-6">
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id as any)}
                                    className={`relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-3 sm:py-4 font-medium transition-all duration-300 font-display tracking-wide text-sm sm:text-base whitespace-nowrap rounded-xl ${
                                        activeFilter === tab.id
                                            ? `${darkMode ? "text-cyan-300 bg-white/5 border border-cyan-500/20" : "text-cyan-600 bg-cyan-50 border border-cyan-200"}`
                                            : darkMode
                                                ? "text-gray-400 hover:text-gray-200 border border-transparent"
                                                : "text-gray-500 hover:text-gray-800 border border-transparent"
                                    }`}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    {activeFilter === tab.id && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                        activeFilter === tab.id
                                            ? darkMode ? "text-cyan-400" : "text-cyan-600"
                                            : darkMode ? "text-gray-400" : "text-gray-500"
                                    }`} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold ${
                                        activeFilter === tab.id
                                            ? darkMode ? "bg-cyan-500/30 text-cyan-200" : "bg-cyan-200/80 text-cyan-800"
                                            : darkMode ? "bg-white/10 text-gray-400" : "bg-gray-200 text-gray-600"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-6" />

                {/* Application Cards */}
                <div className="space-y-4">
                    {filteredApps.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredApps.map((app) => (
                                <ApplicationCard
                                    key={app._id}
                                    application={app}
                                    darkMode={darkMode}
                                    isExpanded={expandedId === app._id}
                                    toggleExpand={() => setExpandedId(expandedId === app._id ? null : app._id)}
                                />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-center py-16 rounded-2xl border-2 border-dashed glass-card ${
                                darkMode
                                    ? "bg-black/50 border-cyan-500/20"
                                    : "bg-white/50 border-black/10 shadow-sm shadow-black/5"
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                darkMode ? "bg-white/5" : "bg-gray-100"
                            }`}>
                                <Briefcase className={`w-8 h-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                            </div>
                            <h3 className={`text-lg font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>No applications found</h3>
                            <p className={`text-sm font-body ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1 max-w-xs mx-auto`}>
                                {searchTerm || activeFilter !== "all"
                                    ? "Try adjusting your filters or search terms to find what you're looking for."
                                    : "You haven't applied for any jobs yet. Start browsing jobs to find your next opportunity!"}
                            </p>
                            {!searchTerm && activeFilter === "all" && (
                                <motion.button
                                    onClick={() => window.location.href = "/job-listings"}
                                    className="mt-6 px-6 py-2.5 rounded-xl font-bold font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Browse Jobs
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreelancerApplicationsManagement;
