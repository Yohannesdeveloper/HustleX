import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/hooks';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireRole?: 'freelancer' | 'client';
    requireProfileComplete?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireRole,
    requireProfileComplete = false
}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const darkMode = useAppSelector((s) => s.theme.darkMode);
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            setIsChecking(false);
        }
    }, [loading]);

    // Show loading while checking authentication
    if (loading || isChecking) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to signup if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/signup" state={{ from: location }} replace />;
    }

    // Check if user has the required role
    if (requireRole && !user.roles?.includes(requireRole)) {
        // User doesn't have required role, redirect to appropriate page
        if (user.roles?.includes('freelancer')) {
            return <Navigate to="/dashboard/freelancer" replace />;
        } else if (user.roles?.includes('client')) {
            return <Navigate to="/dashboard/hiring" replace />;
        } else {
            return <Navigate to="/signup" replace />;
        }
    }

    // Check if profile completion is required
    if (requireProfileComplete && requireRole) {
        const hasFreelancerProfile = user.profile?.freelancerProfileCompleted ||
            user.profile?.isProfileComplete ||
            (user.profile?.skills && user.profile?.skills.length > 0);

        const hasClientProfile = user.hasCompanyProfile;

        if (requireRole === 'freelancer' && !hasFreelancerProfile) {
            // Redirect to freelancer profile setup
            return <Navigate to="/profile-setup?role=freelancer" replace />;
        }

        if (requireRole === 'client' && !hasClientProfile) {
            // Redirect to client profile setup
            return <Navigate to="/profile-setup?role=client" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
