import { useState, useEffect } from 'react';

interface ProfileData {
  firstName: string;
  lastName: string;
  status: string;
  profilePicture: string | null;
}

const useProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    status: 'freelancer',
    profilePicture: null,
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
  }, []);

  // Save profile data to localStorage whenever it changes
  const updateProfile = (newData: Partial<ProfileData>) => {
    const updatedProfile = { ...profileData, ...newData };
    setProfileData(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const getFullName = () => {
    return profileData.firstName && profileData.lastName
      ? `${profileData.firstName} ${profileData.lastName}`
      : 'John Doe';
  };

  const getStatus = () => {
    return profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1);
  };

  return {
    profileData,
    updateProfile,
    getFullName,
    getStatus,
  };
};

export default useProfile;
