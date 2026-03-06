import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import HomeFinal from "./Pages/HomeFinal";

import Login from "./components/Login";
import Signup from "./components/Signup";

import PostJob from "./Pages/PostJob";
import PreviewJob from "./Pages/PreviewJob";
import JobListings from "./Pages/Joblistings";
import JobDetailsMongo from "./Pages/JobDetailsMongo";
import Hiringdashboard from "./Pages/Hiringdashboard";
import EditJobMongo from "./Pages/EditJobMongo";

import BlogPost from "./Pages/BlogPost";
import { BlogPostView } from "./Pages/BlogPostView";
import BlogAdmin from "./Pages/BlogAdmin";
import Blog from "./Pages/Blog";
import EditBlog from "./Pages/EditBlog";
import HowItWorks from "./Pages/HowItWorks";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";
import FAQ from "./Pages/FAQ";
import HelpCenter from "./Pages/HelpCenter";
import JobAdmin from "./Pages/JobAdmin";
import JobModeration from "./Pages/JobModeration";

import FreelancerProfileWizard from "./components/FreelancerProfileWizard";
import ClientProfileWizard from "./components/ClientProfileWizard";
import ProfileSetupRouter from "./components/ProfileSetupRouter";
import AccountSettings from "./Pages/AccountSettings";
import CompanyProfile from "./Pages/CompanyProfile";

import RoleSelection from "./Pages/RoleSelection";
import ApplicationsManagementMongo from "./Pages/ApplicationsManagementMongo";
import ForgotPassword from "./components/ForgotPasswordOtp"; // ✅ Correct
import ForgotPasswordOtp from "./components/ForgotPasswordOtp";

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        {/* Page routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordOtp />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<HomeFinal />} />
          <Route path="/" element={<Navigate to="/homefinal" />} />
          <Route path="/homefinal" element={<HomeFinal />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/preview-job" element={<PreviewJob />} />
          <Route path="/dashboard/hiring" element={<Hiringdashboard />} />

          <Route path="/job-listings" element={<JobListings />} />
          <Route path="/job-details/:jobId" element={<JobDetailsMongo />} />

          <Route path="/edit-job/:id" element={<EditJobMongo />} />

          {/** Admin blog shows ID prompt dashboard **/}
          <Route path="/admin/blog" element={<BlogAdmin />} />
          <Route path="/admin/job" element={<JobAdmin />} />
          <Route path="/jobs/moderation" element={<JobModeration />} />
          <Route path="/blog/post" element={<BlogPost />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostView />} />
          <Route path="/blog/edit/:id" element={<EditBlog />} />
          <Route path="/HowItWorks" element={<HowItWorks />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help-center" element={<HelpCenter />} />

          <Route
            path="/freelancer-profile-setup"
            element={<FreelancerProfileWizard />}
          />
          <Route path="/profile-setup" element={<ProfileSetupRouter />} />

          <Route path="/company-profile" element={<CompanyProfile />} />

          <Route path="/role-selection" element={<RoleSelection />} />
          <Route
            path="/applications-management"
            element={<ApplicationsManagementMongo />}
          />
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
