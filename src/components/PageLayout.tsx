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

  // Don't show navbar on job-listings, job-details, and preview-job pages
  const showNavbar =
    location.pathname !== "/job-listings" &&
    !location.pathname.startsWith("/job-details") &&
    location.pathname !== "/preview-job" &&
    location.pathname !== "/blog/post";

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
