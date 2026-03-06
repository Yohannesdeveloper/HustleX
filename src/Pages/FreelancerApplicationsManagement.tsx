import React, { useEffect, useState, useMemo, useCallback } from "react";
import apiService from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Calendar,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    MapPin,
    Building2,
    ExternalLink,
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
            return "bg-green-500/20 text-green-500 border-green-500/20";
        case "rejected":
            return "bg-red-500/20 text-red-500 border-red-500/20";
        case "in_review":
            return "bg-blue-500/20 text-blue-500 border-blue-500/20";
        default:
            return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
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
            className={`${darkMode ? "bg-black/50 border-white/10" : "bg-white border-black/10"
                } border-l-4 ${application.status === 'hired' ? 'border-l-green-500' :
                    application.status === 'rejected' ? 'border-l-red-500' :
                        application.status === 'in_review' ? 'border-l-blue-500' :
                            'border-l-yellow-500'} rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3
                            className={`text-xl font-bold bg-gradient-to-r ${darkMode ? "from-blue-300 to-blue-500" : "from-blue-500 to-blue-700"
                                } bg-clip-text text-transparent font-inter`}
                        >
                            {application.jobTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider border ${getStatusColor(
                                    application.status
                                )} shadow-lg transition-all duration-300 group-hover:scale-110 uppercase`}
                            >
                                <StatusIcon className="w-3.5 h-3.5" />
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
                        <div className="flex items-center gap-2 text-sm">
                            <Building2 className={`w-4 h-4 ${darkMode ? "text-blue-400/70" : "text-blue-600/70"}`} />
                            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Company:</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {application.company || "Direct Client"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className={`w-4 h-4 ${darkMode ? "text-purple-400/70" : "text-purple-600/70"}`} />
                            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Applied:</span>
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {formatDate(application.appliedAt)}
                            </span>
                        </div>
                        {typeof application.job === 'object' && application.job?.workLocation && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className={`w-4 h-4 ${darkMode ? "text-green-400/70" : "text-green-600/70"}`} />
                                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Location:</span>
                                <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    {application.job.workLocation}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 border-t border-gray-100/10 pt-4 mt-2">
                        <button
                            onClick={toggleExpand}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                }`}
                        >
                            {isExpanded ? "Hide Details" : "View My Application"}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => {
                                const jobId = typeof application.job === 'string' ? application.job : (application.job as any)._id;
                                if (jobId) window.open(`/job-details/${jobId}`, '_blank');
                            }}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            View Original Job <ExternalLink className="w-3 h-3" />
                        </button>
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
                        <div className={`mt-6 p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-gray-50"} border ${darkMode ? "border-white/5" : "border-gray-100"}`}>
                            <div className="space-y-6">
                                {application.coverLetter && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            Your Cover Letter
                                        </h4>
                                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                            {application.coverLetter}
                                        </p>
                                    </div>
                                )}
                                {application.notes && (
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            Feedback / Notes from Recruiter
                                        </h4>
                                        <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"} border`}>
                                            <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                                                {application.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!application.coverLetter && !application.notes && (
                                    <p className="text-sm text-center py-4 text-gray-500">No additional details available.</p>
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
            // Optionally clear the state so it doesn't re-expand on refresh
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
            const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <div className="flex flex-col items-center justify-center py-20">
                <div className={`w-12 h-12 border-4 ${darkMode ? "border-blue-500 border-t-transparent" : "border-blue-600 border-t-transparent"} rounded-full animate-spin mb-4`} />
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Fetching your applications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"} font-inter`}>
                        My Applications
                    </h2>
                    <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                        Track and manage your sent job applications in one place.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                            } focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: "all", label: "All", icon: Briefcase, count: stats.all },
                    { id: "pending", label: "Pending", icon: Clock, count: stats.pending },
                    { id: "in_review", label: "In Review", icon: Eye, count: stats.in_review },
                    { id: "hired", label: "Successful", icon: CheckCircle, count: stats.hired },
                    { id: "rejected", label: "Not Selected", icon: XCircle, count: stats.rejected },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${activeFilter === tab.id
                            ? darkMode
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-700/20"
                            : darkMode
                                ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === tab.id ? "bg-white/20 text-white" : darkMode ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-400"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

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
                        className={`text-center py-20 rounded-3xl border-2 border-dashed ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-white shadow-sm"}`}>
                            <Briefcase className={`w-8 h-8 ${darkMode ? "text-gray-500" : "text-gray-300"}`} />
                        </div>
                        <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>No applications found</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1 max-w-xs mx-auto`}>
                            {searchTerm || activeFilter !== "all"
                                ? "Try adjusting your filters or search terms to find what you're looking for."
                                : "You haven't applied for any jobs yet. Start browsing jobs to find your next opportunity!"}
                        </p>
                        {!searchTerm && activeFilter === "all" && (
                            <button
                                onClick={() => window.location.href = "/job-listings"}
                                className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                Browse Jobs
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default FreelancerApplicationsManagement;
