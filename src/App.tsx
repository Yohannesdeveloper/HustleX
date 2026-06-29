import React, { useEffect } from "react";
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
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      HUSTLEX MINI APP LAUNCHED           ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('[App] pathname:', location.pathname, 'search:', location.search);
  console.log('[App] Telegram.WebApp:', !!window.Telegram?.WebApp);

  // Fallback: dismiss Navy screen if the inline script in index.html missed it
  // (e.g., SDK loaded after the inline block ran).
  useEffect(() => {
    try {
      var _tw = window.Telegram && window.Telegram.WebApp;
      if (_tw) {
        if (typeof _tw.ready === 'function') _tw.ready();
        try { if (typeof _tw.expand === 'function') _tw.expand(); } catch(_) {}
      }
    } catch(_) {}
  }, []);

  // Handle start_param from channel Mini App deep link (t.me/{bot}/app?startapp=...)
  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      console.log('[App] Telegram.WebApp available:', !!tg);
      if (tg) console.log('[App] initDataUnsafe:', JSON.stringify(tg.initDataUnsafe));
      const startParam = tg?.initDataUnsafe?.start_param;
      console.log('[App] start_param:', startParam);
      if (startParam && startParam.startsWith('apply_')) {
        const jobId = startParam.replace('apply_', '');
        if (jobId) {
          const existingToken = localStorage.getItem('token');
          if (existingToken && !localStorage.getItem('needsProfileSetup')) {
            console.log('[App] start_param -> token found, go to job-details');
            navigate('/job-details/' + jobId, { replace: true });
          } else if (existingToken) {
            console.log('[App] start_param -> token found but needsProfileSetup, go to profile setup');
            navigate(`/freelancer-profile-setup?redirect=${encodeURIComponent('/job-details/' + jobId)}`, { replace: true });
          } else {
            const url = `/Register?redirect=${encodeURIComponent('/job-details/' + jobId)}`;
            console.log('[App] start_param -> no token, go to Register');
            navigate(url, { replace: true });
          }
        }
      }
    } catch (e) { console.error('[App] start_param error:', e); }
  }, [navigate]);

  useEffect(() => {
    console.log('[App] checkAuth effect - pathname:', location.pathname);
    if (location.pathname.includes('ApplyRedirect')) {
      console.log('[App] SKIP checkAuth — ApplyRedirect');
      return;
    }
    if (location.pathname.startsWith('/job-details/')) {
      console.log('[App] SKIP checkAuth — job-details');
      return;
    }
    console.log('[App] DISPATCH checkAuth');
    dispatch(checkAuth());
  }, [dispatch, location.pathname]);

  // Track page views on every route change
  useEffect(() => {
    const path = location.pathname + location.search;
    ReactGA.send({ hitType: "pageview", page: path });
  }, [location]);

  return (
    <WebSocketProvider>
      <Routes>
        {/* Job details: completely public — outside RoleRouteGuard */}
        <Route path="/job-details/:jobId" element={<PageLayout><JobDetailsMongo /></PageLayout>} />
        <Route path="*" element={
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
        } />
      </Routes>
    </WebSocketProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
