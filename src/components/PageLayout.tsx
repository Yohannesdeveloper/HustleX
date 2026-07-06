import React from "react";
import { useLocation } from "react-router-dom";
import HomeNavbar from "./HomeNavbar";
import { useAppSelector } from "../store/hooks";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  // Don't show navbar on job-details, preview-job, blog/post, company-profile, post-job, and applications-management pages
  const showNavbar =
    !location.pathname.startsWith("/job-details") &&
    !location.pathname.startsWith("/applications-management") &&
    location.pathname !== "/preview-job" &&
    location.pathname !== "/blog/post" &&
    location.pathname !== "/company-profile" &&
    location.pathname !== "/post-job";

  return (
    <div
      className={`relative min-h-screen ${darkMode ? "bg-black" : "bg-white"
        }`}
    >
      {/* Background */}
      {darkMode ? (
        <div className="fixed inset-0 z-0 bg-black" />
      ) : (
        <div className="fixed inset-0 z-0 bg-white" />
      )}

      {/* Navbar */}
      {showNavbar && <HomeNavbar />}

      {/* Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PageLayout;
