import React, { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Job } from "../types";

const JobModeration: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2000);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPendingJobs();
      setJobs(res.jobs || []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError("Unauthorized. Please log in as an admin user.");
      else if (status === 403) setError("Forbidden. Admin access required to view pending jobs.");
      else setError(e?.response?.data?.message || e?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      await api.approveJob(id);
      // Optimistically remove from list
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setReason((r) => { const { [id]: _, ...rest } = r; return rest; });
      showSuccess("Job approved successfully");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError("Unauthorized. Please log in as an admin user.");
      else if (status === 403) setError("Forbidden. Admin access required.");
      else setError(e?.response?.data?.message || e?.message || "Failed to approve job");
    }
  };

  const decline = async (id: string) => {
    try {
      await api.declineJob(id, reason[id]);
      // Optimistically remove from list
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setReason((r) => { const { [id]: _, ...rest } = r; return rest; });
      showSuccess("Job declined successfully");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError("Unauthorized. Please log in as an admin user.");
      else if (status === 403) setError("Forbidden. Admin access required.");
      else setError(e?.response?.data?.message || e?.message || "Failed to decline job");
    }
  };

  const toggleDetails = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const label = (text?: string) => (
    <span className="inline-block text-xs font-semibold uppercase tracking-wide opacity-70 mr-2">{text}</span>
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} p-6`}>
      <h1 className="text-2xl font-bold mb-4">Job Moderation</h1>

      {success && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${darkMode ? "bg-green-800 text-green-200" : "bg-green-100 text-green-800"}`}>
          {success}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : jobs.length === 0 ? (
        <div>No pending jobs</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <motion.div key={job._id} className={`p-4 rounded-xl border ${darkMode ? "border-white/10" : "border-black/10"}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-lg truncate">{job.title}</h2>
                  <div className="text-sm opacity-80 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span>{job.category}</span>
                    {job.jobType && <span>• {job.jobType}</span>}
                    {job.workLocation && <span>• {job.workLocation}</span>}
                    {job.country && <span>• {job.country}</span>}
                    <span>• Budget: {String(job.budget)}</span>
                  </div>
                  {job.description && (
                    <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? "text-white/70" : "text-black/70"}`}>
                      {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleDetails(job._id)} className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white/10" : "bg-black/10"}`}>{expanded[job._id] ? "Hide details" : "View details"}</button>
                  <button onClick={() => approve(job._id)} className="px-4 py-2 rounded-lg bg-green-600 text-white">Approve</button>
                  <button onClick={() => decline(job._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white">Decline</button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {expanded[job._id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mt-3 rounded-lg ${darkMode ? "bg-white/5" : "bg-black/5"} p-3`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {/* Job Details */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Description")}
                        <p className={darkMode ? "text-white/90" : "text-black/80"}>{job.description || "-"}</p>
                      </div>

                      <div>
                        {label("Company")}
                        <p>{job.company || "-"}</p>
                      </div>

                      <div>
                        {label("Duration")}
                        <p>{job.duration || "-"}</p>
                      </div>

                      <div>
                        {label("Vacancies")}
                        <p>{job.vacancies || "-"}</p>
                      </div>

                      <div>
                        {label("Gender Preference")}
                        <p>{job.gender || "-"}</p>
                      </div>

                      <div>
                        {label("Visibility")}
                        <p>{job.visibility || "-"}</p>
                      </div>

                      <div>
                        {label("Status")}
                        <p>{job.status || "-"}</p>
                      </div>

                      <div>
                        {label("Active")}
                        <p>{job.isActive !== undefined ? (job.isActive ? "Yes" : "No") : "-"}</p>
                      </div>

                      {/* Location */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Location")}
                        <p>{[job.address, job.city, job.country].filter(Boolean).join(", ") || "-"}</p>
                      </div>

                      {/* Experience & Education */}
                      <div>
                        {label("Experience")}
                        <p>{job.experience || "-"}</p>
                      </div>

                      <div>
                        {label("Education")}
                        <p>{job.education || "-"}</p>
                      </div>

                      {/* Contact Information */}
                      <div>
                        {label("Contact Email")}
                        <p>{job.contactEmail || "-"}</p>
                      </div>

                      <div>
                        {label("Contact Phone")}
                        <p>{job.contactPhone || "-"}</p>
                      </div>

                      <div>
                        {label("Company Website")}
                        <p>{job.companyWebsite ? <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{job.companyWebsite}</a> : "-"}</p>
                      </div>

                      {/* Links */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Job Link")}
                        <p>{job.jobLink ? <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{job.jobLink}</a> : "-"}</p>
                      </div>

                      {/* Dates */}
                      <div>
                        {label("Deadline")}
                        <p>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "-"}</p>
                      </div>

                      <div>
                        {label("Posted")}
                        <p>{job.createdAt ? new Date(job.createdAt).toLocaleString() : "-"}</p>
                      </div>

                      <div>
                        {label("Last Updated")}
                        <p>{job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "-"}</p>
                      </div>

                      {/* Posted By */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Posted By")}
                        {typeof job.postedBy === 'object' && job.postedBy ? (
                          <div className="mt-1">
                            <p><strong>Email:</strong> {(job.postedBy as any).email || "-"}</p>
                            <p><strong>Name:</strong> {[(job.postedBy as any).profile?.firstName, (job.postedBy as any).profile?.lastName].filter(Boolean).join(" ") || "-"}</p>
                            <p><strong>Phone:</strong> {(job.postedBy as any).profile?.phone || "-"}</p>
                            <p><strong>Role:</strong> {(job.postedBy as any).currentRole || (job.postedBy as any).roles?.[0] || "-"}</p>
                          </div>
                        ) : (
                          <p>{typeof job.postedBy === 'string' ? job.postedBy : "-"}</p>
                        )}
                      </div>

                      {/* Statistics */}
                      <div>
                        {label("Views")}
                        <p>{job.views || 0}</p>
                      </div>

                      <div>
                        {label("Applicants")}
                        <p>{job.applicants || 0}</p>
                      </div>

                      <div>
                        {label("Application Count")}
                        <p>{job.applicationCount || 0}</p>
                      </div>

                      {/* Skills */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Skills")}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(job.skills) && job.skills.length > 0 ? (
                            job.skills.map((s, i) => (
                              <span key={i} className={`px-2 py-1 rounded-full text-xs ${darkMode ? "bg-white/10" : "bg-black/10"}`}>{s}</span>
                            ))
                          ) : (
                            <span className="opacity-60">-</span>
                          )}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Requirements")}
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                            job.requirements.map((r, i) => (
                              <li key={i} className={darkMode ? "text-white/90" : "text-black/80"}>{r}</li>
                            ))
                          ) : (
                            <li className="opacity-60">-</li>
                          )}
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div className="md:col-span-2 lg:col-span-3">
                        {label("Benefits")}
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          {Array.isArray(job.benefits) && job.benefits.length > 0 ? (
                            job.benefits.map((b, i) => (
                              <li key={i} className={darkMode ? "text-white/90" : "text-black/80"}>{b}</li>
                            ))
                          ) : (
                            <li className="opacity-60">-</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <textarea
                        className={`w-full p-2 rounded-lg border ${darkMode ? "bg-black/50 border-white/10" : "bg-white border-black/10"}`}
                        rows={2}
                        placeholder="Optional reason for decline"
                        value={reason[job._id] || ""}
                        onChange={(e) => setReason((r) => ({ ...r, [job._id]: e.target.value }))}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobModeration;
