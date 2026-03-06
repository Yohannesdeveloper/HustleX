import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomeFinal from "./Pages/HomeFinal";

import Login from "./components/Login";
import Signup from "./components/Signup";

import PostJob from "./Pages/PostJob";
import JobListings from "./Pages/Joblistings";
import JobDetailsMongo from "./Pages/JobDetailsMongo";
import Hiringdashboard from "./Pages/Hiringdashboard";
import EditJob from "./Pages/EditJob";

import AdminAccess from "./Pages/AdminAccess";
import BlogAdmin from "./Pages/BlogAdmin";
import BlogPage from "./Pages/BlogPage";
import HowItWorks from "./Pages/HowItWorks";
import Profile from "./Pages/Profile";
import ForgotPassword from "./components/ForgotPasswordOtp"; // ✅ Correct
import ForgotPasswordOtp from "./components/ForgotPasswordOtp";

function App() {
  return (
    <AuthProvider>
      {/* Page routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordOtp />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<HomeFinal />} />
        <Route path="/" element={<Navigate to="/homefinal" />} />
        <Route path="/homefinal" element={<HomeFinal />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/dashboard/hiring" element={<Hiringdashboard />} />
        <Route path="/job-listings" element={<JobListings />} />
        <Route path="/job-details/:jobId" element={<JobDetailsMongo />} />
        <Route path="admin/blog" element={<BlogAdmin />} />

        <Route path="/edit-job/:id" element={<EditJob />} />

        <Route path="/admin/access" element={<AdminAccess />} />
        <Route path="/admin/blog" element={<BlogAdmin />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/HowItWorks" element={<HowItWorks />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
