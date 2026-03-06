import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../store/hooks';
import FreelancerProfileWizard from './FreelancerProfileWizard';
import ClientProfileWizard from './ClientProfileWizard';

const ProfileSetupRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);

  const signupRole = searchParams.get('role') || (location.state as any)?.signupRole;

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/signup', { replace: true });
      return;
    }

    // If user already has a completed profile for their role, redirect to dashboard
    if (user) {
      const hasFreelancerRole = user.roles?.includes('freelancer');
      const hasClientRole = user.roles?.includes('client');

      // Check if user has completed freelancer profile (check multiple fields)
      const hasFreelancerProfile = user.profile?.freelancerProfileCompleted ||
        user.profile?.isProfileComplete ||
        (user.profile?.skills && user.profile?.skills.length > 0);
      const hasClientProfile = user.hasCompanyProfile;

      // If user has both roles and both profiles are complete, go to the active role's dashboard
      if (hasFreelancerRole && hasClientRole && hasFreelancerProfile && hasClientProfile) {
        if (user.currentRole === 'client') {
          navigate('/dashboard/hiring', { replace: true });
        } else {
          navigate('/dashboard/freelancer', { replace: true });
        }
        return;
      }

      // If user only has freelancer role and profile is complete, go to freelancer dashboard
      if (hasFreelancerRole && !hasClientRole && hasFreelancerProfile) {
        navigate('/dashboard/freelancer', { replace: true });
        return;
      }

      // If user only has client role and profile is complete, go to client dashboard
      if (!hasFreelancerRole && hasClientRole && hasClientProfile) {
        navigate('/dashboard/hiring', { replace: true });
        return;
      }

      // If both roles but only one profile complete, respect the current role if its profile is missing
      if (hasFreelancerRole && hasClientRole) {
        if (user.currentRole === 'client' && !hasClientProfile) {
          // Stay here to show client wizard
          setIsLoading(false);
          return;
        }
        if (user.currentRole === 'freelancer' && !hasFreelancerProfile) {
          // Stay here to show freelancer wizard
          setIsLoading(false);
          return;
        }

        // If active profile is complete, go to its dashboard
        if (user.currentRole === 'client' && hasClientProfile) {
          navigate('/dashboard/hiring', { replace: true });
          return;
        }
        if (user.currentRole === 'freelancer' && hasFreelancerProfile) {
          navigate('/dashboard/freelancer', { replace: true });
          return;
        }
      }

      // All users without profiles must complete them (no distinction between new/existing)
      // If user has client role but no profile, they must complete it
      if (hasClientRole && !hasClientProfile) {
        setIsLoading(false);
        return; // Will show client wizard below
      }

      // If user has freelancer role but no profile, they must complete it
      if (hasFreelancerRole && !hasFreelancerProfile) {
        setIsLoading(false);
        return; // Will show freelancer wizard below
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, user, navigate, signupRole]);

  // Show loading while checking user status
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-black" : "bg-white"}`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Determine which wizard to show based on role and profile completion
  const hasFreelancerProfile = user?.profile?.freelancerProfileCompleted ||
    user?.profile?.isProfileComplete ||
    (user?.profile?.skills && user?.profile?.skills.length > 0);
  const hasClientProfile = user?.hasCompanyProfile;

  const hasFreelancerRole = user?.roles?.includes('freelancer');
  const hasClientRole = user?.roles?.includes('client');

  // Determine which wizard to show based on role parameter and incomplete profiles
  const shouldShowFreelancerWizard = hasFreelancerRole && !hasFreelancerProfile;
  const shouldShowClientWizard = hasClientRole && !hasClientProfile;

  // Priority 1: If role is specified in URL, show that wizard (if applicable)
  if (signupRole === 'client' && shouldShowClientWizard) {
    return <ClientProfileWizard />;
  }

  if (signupRole === 'freelancer' && shouldShowFreelancerWizard) {
    return <FreelancerProfileWizard />;
  }

  // Priority 2: Respect currentRole if it needs a profile
  if (user?.currentRole === 'client' && shouldShowClientWizard) {
    return <ClientProfileWizard />;
  }
  if (user?.currentRole === 'freelancer' && shouldShowFreelancerWizard) {
    return <FreelancerProfileWizard />;
  }

  // Priority 3: Fallback based on roles
  if (shouldShowClientWizard) {
    return <ClientProfileWizard />;
  }

  if (shouldShowFreelancerWizard) {
    return <FreelancerProfileWizard />;
  }

  // Fallback - redirect based on user's current role
  if (user?.currentRole === 'client') {
    navigate('/dashboard/hiring', { replace: true });
  } else if (user?.currentRole === 'freelancer') {
    navigate('/dashboard/freelancer', { replace: true });
  } else {
    // Last resort fallbacks based on available roles
    if (hasClientRole) {
      navigate('/dashboard/hiring', { replace: true });
    } else if (hasFreelancerRole) {
      navigate('/dashboard/freelancer', { replace: true });
    } else {
      navigate('/signup', { replace: true });
    }
  }
  return null;
};

export default ProfileSetupRouter;
