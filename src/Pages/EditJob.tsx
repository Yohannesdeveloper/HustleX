// src/pages/EditJob.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";

const categories = [
  "Web & App Development",
  "Design & Graphics",
  "Writing & Translation",
  "Marketing",
  "Sales",
  "Customer Support",
  "Data Science & Analytics",
  "Finance & Accounting",
  "Human Resources",
  "Legal",
  "Project Management",
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

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [visibility, setVisibility] = useState("public");

  // New fields
  const [vacancies, setVacancies] = useState("");
  const [education, setEducation] = useState("");
  const [jobType, setJobType] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      const jobRef = doc(db, "jobs", id);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        alert("Job not found");
        navigate("/job-listings");
        return;
      }

      const jobData = jobSnap.data();

      // Check if current user is owner
      if (jobData.userId !== currentUser?.uid) {
        alert("You don't have permission to edit this job.");
        navigate("/job-listings");
        return;
      }

      // Populate form fields
      setTitle(jobData.title || "");
      setDescription(jobData.description || "");
      setCategory(jobData.category || "");
      setBudget(jobData.budget || "");
      setDeadline(jobData.deadline || "");
      setExperience(jobData.experience || "");
      setDuration(jobData.duration || "");
      setLocation(jobData.location || "");
      setSkills(jobData.skills ? jobData.skills.join(", ") : "");
      setVisibility(jobData.visibility || "public");

      // Populate new fields
      setVacancies(jobData.vacancies || "");
      setEducation(jobData.education || "");
      setJobType(jobData.jobType || "");
      setGender(jobData.gender || "");
      setCity(jobData.city || "");
      setCountry(jobData.country || "");

      setLoading(false);
    };

    fetchJob();
  }, [id, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        title,
        description,
        category,
        budget,
        deadline,
        experience,
        duration,
        location,
        skills: skills.split(",").map((s) => s.trim()),
        visibility,
        vacancies,
        education,
        jobType,
        gender,
        city,
        country,
      });
      alert("Job updated successfully!");
      navigate("/job-listings");
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading job data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4 py-20 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10"
      >
        <style>
          {`
            input[type="date"]::-webkit-calendar-picker-indicator {
              filter: invert(1) brightness(1.5);
              cursor: pointer;
            }
            input[type="date"] {
              color-scheme: dark;
              color: white;
            }
          `}
        </style>
        <h2 className="text-4xl font-extrabold text-accent text-center mb-8 drop-shadow">
          ✏️ Edit Job
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job Title"
            required
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job Description"
            required
            rows={5}
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skills (comma separated)"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={vacancies}
            onChange={(e) => setVacancies(e.target.value)}
            placeholder="Number of Vacancies"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Education Requirement"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            placeholder="Job Type"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Preferred Gender"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-white/10 text-black p-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget (ETB)"
            type="number"
            required
            className="w-full bg-white/10 text-black p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            type="date"
            required
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-white/10 text-black p-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition"
          >
            <option value="" disabled>
              Select Experience Level
            </option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full bg-white/10 text-black p-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition"
          >
            <option value="" disabled>
              Select Duration
            </option>
            <option value="Less than 1 month">Less than 1 month</option>
            <option value="1 month">1 month</option>
            <option value="2 months">2 months</option>
            <option value="3 months">3 months</option>
            <option value="More than 3 months">More than 3 months</option>
          </select>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Remote, Addis Ababa)"
            className="w-full bg-white/10 text-white p-4 rounded-xl border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          <div className="flex items-center space-x-4">
            <label className="text-white/80 font-medium">Visibility:</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-white/10 text-white p-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 px-6 bg-accent text-white font-bold rounded-xl shadow-xl hover:bg-white hover:text-black transition"
          >
            💾 Save Changes
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditJob;
