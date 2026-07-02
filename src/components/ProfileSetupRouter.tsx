import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../store/hooks';
import FreelancerProfileWizard from './FreelancerProfileWizard';
import ClientProfileWizard from './ClientProfileWizard';
import { isFreelancerProfileComplete } from '../utils/activeRole';

const ProfileSetupRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { isAuthenticated, user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const isEditMode = searchParams.get('edit') === 'true';

  const signupRole = searchParams.get('role') || (location.state as any)?.signupRole;

  useEffect(() => {
    // If in edit mode, skip redirect — allow user to re-edit their profile
    if (isEditMode) {
      return;
    }

    // If user already has a completed profile for their role, redirect to dashboard
    if (user) {
      const hasFreelancerRole = user.roles?.includes('freelancer');
      const hasClientRole = user.roles?.includes('client');

      // Check if user has completed freelancer profile (check multiple fields)
      const hasFreelancerProfile = isFreelancerProfileComplete(user);
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
          return;
        }
        if (user.currentRole === 'freelancer' && !hasFreelancerProfile) {
          // Stay here to show freelancer wizard
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
        return; // Will show client wizard below
      }

      // If user has freelancer role but no profile, they must complete it
      if (hasFreelancerRole && !hasFreelancerProfile) {
        return; // Will show freelancer wizard below
      }
    }
  }, [isAuthenticated, user, navigate, signupRole]);



  // Determine which wizard to show based on role and profile completion
  const hasFreelancerProfile = isFreelancerProfileComplete(user);
  const hasClientProfile = user?.hasCompanyProfile;

  const hasFreelancerRole = user?.roles?.includes('freelancer');
  const hasClientRole = user?.roles?.includes('client');

  // In edit mode, show the wizard for the user's current role regardless of completion status
  if (isEditMode) {
    if (user?.currentRole === 'client' && hasClientRole) {
      return <ClientProfileWizard />;
    }
    if (hasFreelancerRole) {
      return <FreelancerProfileWizard />;
    }
  }

  // If not authenticated, show wizard based on URL parameter or default to freelancer
  if (!isAuthenticated || !user) {
    if (signupRole === 'client') {
      return <ClientProfileWizard />;
    }
    return <FreelancerProfileWizard />;
  }

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
      return <FreelancerProfileWizard />;
    }
  }
  return null;
};

export default ProfileSetupRouter;
