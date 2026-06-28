import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";
import { WebSocketProvider } from "./context/WebSocketContext";
import { useAppDispatch } from "./store/hooks";
import { checkAuth } from "./store/authSlice";
import HomeFinal from "./Pages/HomeFinal";
import PageLayout from "./components/PageLayout";

import Signup from "./components/Signup";
import RegistrationPage from "./Pages/Registration";
import ApplyRedirect from "./Pages/ApplyRedirect";

import PostJob from "./Pages/PostJob";
import PreviewJob from "./Pages/PreviewJob";
import JobListings from "./Pages/Joblistings";
import JobDetailsMongo from "./Pages/JobDetailsMongo";
import Hiringdashboard from "./Pages/Hiringdashboard";
import FreelancingDashboard from "./Pages/FreelancingDashboard";
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
import Pricing from "./Pages/Pricing";

import PaymentWizard from "./Pages/PaymentWizard";
import API from "./Pages/API";
import JobAdmin from "./Pages/JobAdmin";
import SubscriptionAdmin from "./Pages/SubscriptionAdmin";
import JobModeration from "./Pages/JobModeration";
import AdminDashboard from "./Pages/AdminDashboard";

import FreelancerProfileWizard from "./components/FreelancerProfileWizard";
import ClientProfileWizard from "./components/ClientProfileWizard";
import ProfileSetupRouter from "./components/ProfileSetupRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRouteGuard from "./components/RoleRouteGuard";
import RoleSelection from "./Pages/RoleSelection";
import AccountSettings from "./Pages/AccountSettings";
import CompanyProfile from "./Pages/CompanyProfile";
import FreelancerProfilePage from "./Pages/FreelancerProfilePage";
import ClientProfilePage from "./Pages/ClientProfilePage";
import ProgrammaticSEOPage from "./Pages/ProgrammaticSEOPage";
import FreelancerApplicationsManagement from "./Pages/FreelancerApplicationsManagement";


import ApplicationsManagementMongo from "./Pages/ApplicationsManagementMongo";
import ForgotPasswordOtp from "./components/ForgotPasswordOtp";
import ChatInterface from "./components/ChatInterface";
import FloatingChatBot from "./components/FloatingChatBot";

function AppContent() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const skipAuthCheck = useRef(false);

  // When opened as a Telegram Mini App via start_param (e.g. clicking
  // "Apply for this job" sends https://t.me/<bot>?startapp=job_<jobId>),
  // route to ApplyRedirect so the Telegram auth flow runs before the job page.
  // Skip checkAuth here — ApplyRedirect handles auth itself.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    try { tg.ready(); } catch(e) {}
    try { if (typeof tg.expand === 'function') tg.expand(); } catch(e) {}

    const startParam = tg.initDataUnsafe?.start_param;
    if (!startParam) return;

    const match = /^job_([A-Za-z0-9-]+)$/.exec(startParam);
    if (!match) return;

    const jobId = match[1];
    skipAuthCheck.current = true;
    console.log("[App] Routing to job from Telegram start_param:", jobId);
    const redirectPath = `/job-details/${jobId}`;
    navigate(`/ApplyRedirect?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
  }, [navigate]);

  // Only run checkAuth when not navigating via start_param
  useEffect(() => {
    if (skipAuthCheck.current) return;
    dispatch(checkAuth());
  }, [dispatch]);

  // Track page views on every route change
  useEffect(() => {
    const path = location.pathname + location.search;
    ReactGA.send({ hitType: "pageview", page: path });
  }, [location]);

  return (
    <WebSocketProvider>
      <RoleRouteGuard>
        <Routes>
          <Route path="/forgot-password" element={<PageLayout><ForgotPasswordOtp /></PageLayout>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Signup />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/Register" element={<RegistrationPage />} />
          <Route path="/ApplyRedirect" element={<ApplyRedirect />} />
          <Route path="/" element={<HomeFinal />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/homefinal" element={<Navigate to="/" replace />} />
          <Route path="/post-job" element={<PageLayout><PostJob /></PageLayout>} />
          <Route path="/preview-job" element={<PageLayout><PreviewJob /></PageLayout>} />
          <Route
            path="/dashboard/hiring"
            element={
              <ProtectedRoute requireRole="client" requireProfileComplete={true}>
                <Hiringdashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/freelancer"
            element={
              <ProtectedRoute requireRole="freelancer" requireProfileComplete={true}>
                <FreelancingDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={null} />
            <Route path="browse-jobs" element={null} />
            <Route path="my-applications" element={null} />
            <Route path="messages" element={null} />
          </Route>
          <Route path="/job-listings" element={<JobListings />} />
          <Route path="/job-details/:jobId" element={<PageLayout><JobDetailsMongo /></PageLayout>} />
          <Route path="/edit-job/:id" element={<PageLayout><EditJobMongo /></PageLayout>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/blog" element={<PageLayout><BlogAdmin /></PageLayout>} />
          <Route path="/admin/job" element={<PageLayout><JobAdmin /></PageLayout>} />
          <Route path="/admin/subscriptions" element={<PageLayout><SubscriptionAdmin /></PageLayout>} />
          <Route path="/jobs/moderation" element={<PageLayout><JobModeration /></PageLayout>} />
          <Route path="/blog/post" element={
            <ProtectedRoute requireRole="admin">
              <PageLayout><BlogPost /></PageLayout>
            </ProtectedRoute>
          } />
          <Route path="/blog" element={<PageLayout><Blog /></PageLayout>} />
          <Route path="/blog/:id" element={<PageLayout><BlogPostView /></PageLayout>} />
          <Route path="/blog/edit/:id" element={<PageLayout><EditBlog /></PageLayout>} />
          <Route path="/HowItWorks" element={<PageLayout><HowItWorks /></PageLayout>} />
          <Route path="/about-us" element={<PageLayout><AboutUs /></PageLayout>} />
          <Route path="/contact-us" element={<PageLayout><ContactUs /></PageLayout>} />
          <Route path="/faq" element={<PageLayout><FAQ /></PageLayout>} />
          <Route path="/help-center" element={<PageLayout><HelpCenter /></PageLayout>} />
          <Route path="/pricing" element={<PageLayout><Pricing /></PageLayout>} />

          <Route path="/payment-wizard" element={<PaymentWizard />} />
          <Route path="/api" element={<PageLayout><API /></PageLayout>} />
          <Route path="/freelancer-profile-setup" element={<FreelancerProfileWizard />} />
          <Route path="/profile-setup" element={<ProfileSetupRouter />} />
          <Route path="/company-profile" element={<PageLayout><CompanyProfile /></PageLayout>} />

          {/* Public SEO Profile & Landing Page Routes */}
          <Route path="/freelancers/:slug" element={<PageLayout><FreelancerProfilePage /></PageLayout>} />
          <Route path="/clients/:slug" element={<PageLayout><ClientProfilePage /></PageLayout>} />
          <Route path="/hire-:skill-developers" element={<PageLayout><ProgrammaticSEOPage /></PageLayout>} />
          <Route path="/freelancers/:locationOrSkill" element={<PageLayout><ProgrammaticSEOPage /></PageLayout>} />
          <Route path="/jobs/:jobTitle" element={<PageLayout><ProgrammaticSEOPage /></PageLayout>} />
          <Route path="/skills/:skill" element={<PageLayout><ProgrammaticSEOPage /></PageLayout>} />

          <Route path="/applications-management" element={<PageLayout><ApplicationsManagementMongo /></PageLayout>} />
          <Route path="/my-applications" element={<FreelancerApplicationsManagement />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </RoleRouteGuard>

      {/* Global Floating Components */}
      {/* Floating components moved into their relevant parents (e.g. Navbar) */}
    </WebSocketProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
