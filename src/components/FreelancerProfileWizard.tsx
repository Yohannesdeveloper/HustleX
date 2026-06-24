import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootState } from '../store';
import { User } from '../types';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';
import PhoneInput from './PhoneInput';
import { COUNTRIES } from '../constants/countries';
import { formatLocation, parseLocation } from '../utils/location';

interface FreelancerProfileData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  country: string;
  profilePicture: File | null;
  profilePicturePreview: string | null;

  // Professional Details
  experienceLevel: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  cvFile: File | null;
  existingCvUrl: string;

  // Additional required fields for API
  bio: string;
  education: string;
  workExperience: string;
  skills: string[];
  primarySkill: string;
  yearsOfExperience: string;
  certifications: string[];
  availability: string;
  monthlyRate: string;
  currency: string;
  preferredJobTypes: string[];
  workLocation: string;
  websiteUrl: string;
}

interface StepProps {
  data: FreelancerProfileData;
  updateData: (field: keyof FreelancerProfileData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit?: () => void;
  navigate?: any;
  refreshUser?: () => Promise<any>;
  redirectParam?: string | null;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleBlur?: (field: string) => void;
}

// Telegram WebApp Storage Utilities
const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined;
};

const saveToStorage = async (key: string, value: string, isAuthenticated: boolean): Promise<boolean> => {
  let saved = false;
  try {
    localStorage.setItem(key, value);
    saved = true;
  } catch (e) {}
  
  try {
    sessionStorage.setItem(key, value);
    saved = true;
  } catch (e) {}

  if (isAuthenticated) {
    try {
      // Parse the value back to object to save to DB
      const parsed = JSON.parse(value);
      await apiService.saveFreelancerProfileDraft(parsed);
      saved = true;
    } catch (e) {
      console.warn('Failed to save draft to backend:', e);
    }
  }

  return saved;
};

const loadFromStorage = async (key: string, isAuthenticated: boolean): Promise<string | null> => {
  // Prefer backend if authenticated
  if (isAuthenticated) {
    try {
      const draft = await apiService.getFreelancerProfileDraft();
      if (draft && Object.keys(draft).length > 0) {
        const strVal = JSON.stringify(draft);
        try { localStorage.setItem(key, strVal); } catch (e) {}
        return strVal;
      }
    } catch (e) {
      console.warn('Failed to load draft from backend:', e);
    }
  }

  // Fallback to browser storage
  try {
    const localVal = localStorage.getItem(key);
    if (localVal) return localVal;
  } catch (e) {}

  try {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal) return sessionVal;
  } catch (e) {}

  return null;
};

const removeFromStorage = async (key: string, isAuthenticated: boolean): Promise<void> => {
  try { localStorage.removeItem(key); } catch (e) {}
  try { sessionStorage.removeItem(key); } catch (e) {}
  
  if (isAuthenticated) {
    try {
      await apiService.saveFreelancerProfileDraft({});
    } catch (e) {}
  }
};

const steps = [
  { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Professional Details', description: 'Share your experience and links' },
  { id: 3, title: 'Review & Save', description: 'Review and save your profile' },
];

const getFieldClass = (darkMode: boolean, hasError: boolean) => {
  const theme = darkMode
    ? 'bg-gray-800 text-white placeholder-gray-400'
    : 'bg-white text-gray-900 placeholder-gray-500';
  const border = hasError
    ? 'border-red-500 focus:ring-red-500'
    : darkMode
      ? 'border-gray-600 focus:ring-blue-500'
      : 'border-gray-300 focus:ring-blue-500';
  return `w-full px-4 py-3 rounded-lg border ${theme} ${border} focus:ring-2 focus:border-transparent transition-colors`;
};

const FreelancerProfileWizard: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(true);
  const [profileData, setProfileData] = useState<FreelancerProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    country: '',
    profilePicture: null,
    profilePicturePreview: null,
    experienceLevel: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    cvFile: null,
    existingCvUrl: '',
    // Additional required fields with default values
    bio: '',
    education: '',
    workExperience: '',
    skills: [],
    primarySkill: '',
    yearsOfExperience: '',
    certifications: [],
    availability: 'Available',
    monthlyRate: '',
    currency: 'USD',
    preferredJobTypes: [],
    workLocation: 'Remote',
    websiteUrl: '',
  });

  // Inherit existing profile data when editing (from user.profile - same source as dashboard)
  useEffect(() => {
    if (!user?.profile) return;

    const p = user.profile;
    const avatarUrl = p.avatar ? (p.avatar.startsWith('http') || p.avatar.startsWith('data:') ? p.avatar : apiService.getFileUrl(p.avatar)) : null;
    const cvUrl = p.cvUrl ? (p.cvUrl.startsWith('http') || p.cvUrl.startsWith('data:') ? p.cvUrl : apiService.getFileUrl(p.cvUrl)) : p.cvUrl || '';
    const savedLocation = p.location ?? '';
    const { city, country } = parseLocation(savedLocation);

    setProfileData(prev => ({
      ...prev,
      firstName: p.firstName ?? prev.firstName,
      lastName: p.lastName ?? prev.lastName,
      email: (user as any).email ?? prev.email,
      phone: p.phone ?? prev.phone,
      location: savedLocation || prev.location,
      city: city || prev.city,
      country: country || prev.country,
      profilePicturePreview: avatarUrl ?? prev.profilePicturePreview,
      existingCvUrl: cvUrl || prev.existingCvUrl,
      experienceLevel: p.experienceLevel ?? prev.experienceLevel,
      portfolioUrl: p.portfolioUrl ?? p.portfolio ?? prev.portfolioUrl,
      linkedinUrl: p.linkedinUrl ?? p.linkedin ?? prev.linkedinUrl,
      githubUrl: p.githubUrl ?? p.github ?? prev.githubUrl,
      websiteUrl: p.websiteUrl ?? p.website ?? prev.websiteUrl,
      bio: p.bio ?? prev.bio,
      education: p.education ?? prev.education,
      workExperience: p.experience ?? p.workExperience ?? prev.workExperience,
      skills: Array.isArray(p.skills) ? p.skills : prev.skills,
      primarySkill: p.primarySkill ?? prev.primarySkill,
      yearsOfExperience: p.yearsOfExperience ?? prev.yearsOfExperience,
      certifications: Array.isArray(p.certifications) ? p.certifications : prev.certifications,
      availability: p.availability ?? prev.availability,
      monthlyRate: p.monthlyRate ?? prev.monthlyRate,
      currency: p.currency ?? prev.currency,
      preferredJobTypes: Array.isArray(p.preferredJobTypes) ? p.preferredJobTypes : prev.preferredJobTypes,
      workLocation: p.workLocation ?? prev.workLocation,
    }));
  }, [user?._id, user?.email]); // Run when user loads; avoid re-running on every profile field change

  // Load saved data from Telegram WebApp storage or localStorage on mount
  useEffect(() => {
    const loadSavedData = async () => {
      // Wait a bit to ensure user profile data has loaded first
      await new Promise(resolve => setTimeout(resolve, 100));

      const savedData = await loadFromStorage('freelancerProfileData', isAuthenticated);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);

          // Merge saved data with existing data, but only fill empty fields
          // This prevents overwriting user profile data with old saved data
          setProfileData(prev => {
            const merged = { ...prev };

            // Only merge fields that are empty in the current state
            Object.keys(parsedData).forEach(key => {
              const typedKey = key as keyof FreelancerProfileData;
              const currentValue = merged[typedKey];
              const savedValue = parsedData[typedKey];

              // If current value is empty/falsy, use saved value
              // Skip arrays and objects to avoid complex merging issues
              if (
                (currentValue === '' || currentValue === null || currentValue === undefined) &&
                savedValue !== null &&
                savedValue !== undefined &&
                !Array.isArray(savedValue) &&
                typeof savedValue !== 'object'
              ) {
                merged[typedKey] = savedValue;
              }
            });

            // Preserve file objects that can't be stored
            return {
              ...merged,
              profilePicture: prev.profilePicture,
              cvFile: prev.cvFile,
            };
          });
        } catch (error) {
          // Silently handle parse errors
        }
      }
    };

    loadSavedData();

    // Initialize Telegram WebApp if available
    if (isTelegramWebApp() && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []); // Run only on mount

  // Save profile data to storage whenever it changes (for persistence across sessions)
  useEffect(() => {
    // Show saving indicator
    setIsSavingDraft(true);
    setShowSaveIndicator(true);
    setSaveSuccess(false);

    // Create a copy of profileData without file objects and preview (which is huge base64)
    const dataToSave = {
      ...profileData,
      profilePicturePreview: undefined, // Base64 can exceed CloudStorage limits
      profilePicture: undefined, // Can't store File objects
      cvFile: undefined, // Can't store File objects
    };

    const dataString = JSON.stringify(dataToSave);
    
    // We make this async to handle backend sync
    saveToStorage('freelancerProfileData', dataString, isAuthenticated).then((success) => {
      setSaveSuccess(success);
      
      // Hide saving indicator after a short delay
      setTimeout(() => {
        setIsSavingDraft(false);
        // Keep the "Saved" indicator visible for a bit longer if successful
        if (success) {
          setTimeout(() => {
            setShowSaveIndicator(false);
          }, 2000);
        } else {
          // If save failed, hide indicator quickly
          setTimeout(() => {
            setShowSaveIndicator(false);
          }, 1000);
        }
      }, 500);
    });

  }, [profileData]); // Save whenever profileData changes





  const updateData = (field: keyof FreelancerProfileData, value: any) => {
    // Auto-format URLs to add https:// if missing
    if (['portfolioUrl', 'linkedinUrl', 'githubUrl', 'websiteUrl'].includes(field) && value) {
      const trimmedValue = value.trim();
      if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
        value = 'https://' + trimmedValue;
      }
    }
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): { isValid: boolean; newErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Information validation - ONLY truly required fields
      if (!profileData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (profileData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters";
      }

      if (!profileData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (profileData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters";
      }

      if (!profileData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!profileData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!profileData.country.trim()) {
        newErrors.country = "Country is required";
      }

      // Phone is OPTIONAL - only validate if provided
      if (profileData.phone && profileData.phone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (step === 2) {
      // Professional Details validation - ONLY truly required fields
      // Bio is required but make minimum length reasonable
      if (!profileData.bio.trim()) {
        newErrors.bio = "Professional bio is required";
      } else if (profileData.bio.trim().length < 20) {
        newErrors.bio = "Bio must be at least 20 characters";
      }

      // These fields are required for a complete profile
      if (!profileData.experienceLevel) {
        newErrors.experienceLevel = "Experience level is required";
      }

      if (!profileData.primarySkill) {
        newErrors.primarySkill = "Primary skill is required";
      }

      if (!profileData.yearsOfExperience.trim()) {
        newErrors.yearsOfExperience = "Years of experience is required";
      }

      if (!profileData.availability) {
        newErrors.availability = "Availability status is required";
      }

      if (profileData.skills.length === 0) {
        newErrors.skills = "Please select at least one skill";
      }

      // Optional URL validations - only validate if provided
      if (profileData.portfolioUrl && profileData.portfolioUrl.trim()) {
        const portfolioUrl = profileData.portfolioUrl.trim();
        if (!portfolioUrl.startsWith('http://') && !portfolioUrl.startsWith('https://')) {
          newErrors.portfolioUrl = "URL must start with http:// or https://";
        }
      }

      if (profileData.linkedinUrl && profileData.linkedinUrl.trim()) {
        const linkedinUrl = profileData.linkedinUrl.trim();
        if (!linkedinUrl.includes('linkedin.com')) {
          newErrors.linkedinUrl = "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourname)";
        }
      }

      if (profileData.githubUrl && profileData.githubUrl.trim()) {
        const githubUrl = profileData.githubUrl.trim();
        if (!githubUrl.includes('github.com')) {
          newErrors.githubUrl = "Please enter a valid GitHub URL (e.g., https://github.com/username)";
        }
      }

      if (profileData.websiteUrl && profileData.websiteUrl.trim()) {
        const websiteUrl = profileData.websiteUrl.trim();
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          newErrors.websiteUrl = "URL must start with http:// or https://";
        }
      }

      if (profileData.monthlyRate && (isNaN(Number(profileData.monthlyRate)) || Number(profileData.monthlyRate) < 0)) {
        newErrors.monthlyRate = "Please enter a valid amount";
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors
    };
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const nextStep = () => {
    console.log('Attempting to proceed from step', currentStep);
    const { isValid, newErrors } = validateStep(currentStep);
    if (isValid) {
      console.log('Validation passed, moving to next step');
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Mark all fields in current step as touched
      const stepFields = currentStep === 1 
        ? ['firstName', 'lastName', 'email', 'city', 'country', 'phone']
        : [
            'bio', 
            'experienceLevel', 
            'primarySkill', 
            'yearsOfExperience', 
            'availability', 
            'skills', 
            'cvFile', 
            'portfolioUrl', 
            'linkedinUrl', 
            'githubUrl', 
            'websiteUrl', 
            'monthlyRate'
          ];
      
      const allTouched: Record<string, boolean> = {};
      stepFields.forEach(field => allTouched[field] = true);
      setTouched(prev => ({ ...prev, ...allTouched }));
      
      // Show specific error message
      const errorCount = Object.keys(newErrors).length;
      console.log(`Validation failed with ${errorCount} error(s):`, newErrors);
      
      // Don't show alert - errors will be displayed inline
      // The user can see which fields have errors from the red borders and messages
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: profileData,
      updateData,
      onNext: nextStep,
      onPrev: prevStep,
      isFirst: currentStep === 1,
      isLast: currentStep === steps.length,
      errors,
      touched,
      handleBlur,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <ProfessionalDetailsStep {...stepProps} />;
      case 3:
        const redirectParam = searchParams.get('redirect') || sessionStorage.getItem('pendingJobRedirect');
        return <ReviewStep {...stepProps} onSubmit={() => {}} navigate={navigate} refreshUser={refreshUser} redirectParam={redirectParam} />;
      default:
        return <BasicInfoStep {...stepProps} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} overflow-y-auto`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Important Notice */}
          <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span className={darkMode ? 'text-white' : ''}>Please complete your freelancer profile to access the dashboard</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Picture in Header */}
              {profileData.profilePicturePreview ? (
                <img
                  src={profileData.profilePicturePreview}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Freelancer Profile Setup</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
                {/* Save Indicator */}
                <AnimatePresence>
                  {showSaveIndicator && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-1 text-xs flex items-center gap-1 ${
                        isSavingDraft ? 'text-yellow-500' : saveSuccess ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isSavingDraft ? (
                        <>
                          <span className="animate-pulse">●</span>
                          Saving draft...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <span>✓</span>
                          Draft saved
                        </>
                      ) : (
                        <>
                          <span>✗</span>
                          Save failed - storage not available
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Storage Status (for debugging) */}
                <div className={`mt-2 text-xs flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Storage: {isTelegramWebApp() ? 'Telegram Mini App' : 'Browser'}</span>
                  <button
                    onClick={async () => {
                      const savedData = await loadFromStorage('freelancerProfileData', isAuthenticated);
                      if (savedData) {
                        try {
                          const parsedData = JSON.parse(savedData);
                          setProfileData(prev => ({
                            ...prev,
                            ...parsedData,
                            profilePicture: prev.profilePicture,
                            cvFile: prev.cvFile,
                          }));
                          alert('Draft loaded successfully!');
                        } catch (error) {
                          alert('Failed to load draft');
                        }
                      } else {
                        alert('No saved draft found');
                      }
                    }}
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Load Draft
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${step.id < currentStep
                    ? 'bg-blue-500'
                    : step.id === currentStep
                      ? 'bg-blue-600'
                      : darkMode
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Step Components
const BasicInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, isFirst, isLast, errors = {}, touched = {}, handleBlur }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const inputClass = (field: string) =>
    getFieldClass(darkMode, Boolean(touched[field] && errors[field]));

  const handleCityChange = (city: string) => {
    updateData('city', city);
    updateData('location', formatLocation(city, data.country));
  };

  const handleCountryChange = (country: string) => {
    updateData('country', country);
    updateData('location', formatLocation(data.city, country));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      updateData('profilePicture', file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        updateData('profilePicturePreview', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
          Let's start with your personal details
        </p>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <div className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-4 border-dashed ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            } transition-colors overflow-hidden`}>
            {data.profilePicturePreview ? (
              <img
                src={data.profilePicturePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    👤
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add Photo
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            Click to upload profile picture
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            JPG, PNG up to 5MB
          </p>
          {data.profilePicture && (
            <button
              onClick={() => {
                updateData('profilePicture', null);
                updateData('profilePicturePreview', null);
              }}
              className="mt-2 text-red-500 hover:text-red-600 text-sm"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            First Name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => updateData('firstName', e.target.value)}
            onBlur={() => handleBlur && handleBlur('firstName')}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.firstName && errors.firstName
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:border-transparent transition-colors`}
            placeholder="Enter your first name"
          />
          {touched.firstName && errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Last Name *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => updateData('lastName', e.target.value)}
            onBlur={() => handleBlur && handleBlur('lastName')}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.lastName && errors.lastName
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:border-transparent transition-colors`}
            placeholder="Enter your last name"
          />
          {touched.lastName && errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData('email', e.target.value)}
            onBlur={() => handleBlur && handleBlur('email')}
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.email && errors.email
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:border-transparent transition-colors`}
            placeholder="your.email@example.com"
          />
          {touched.email && errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Phone
          </label>
          <PhoneInput
            value={data.phone}
            onChange={(value) => updateData('phone', value)}
            placeholder="XXX XXX XXX"
            darkMode={darkMode}
          />
          {touched.phone && errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Location *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={data.city}
                onChange={(e) => handleCityChange(e.target.value)}
                onBlur={() => handleBlur && handleBlur('city')}
                className={inputClass('city')}
                placeholder="City"
              />
              {touched.city && errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <select
                value={data.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                onBlur={() => handleBlur && handleBlur('country')}
                className={inputClass('country')}
              >
                <option value="" disabled className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Select country
                </option>
                {COUNTRIES.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                  >
                    {c}
                  </option>
                ))}
              </select>
              {touched.country && errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
              )}
            </div>
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Saved as: {data.location || 'City, Country'}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.firstName || !data.lastName || !data.email || !data.city.trim() || !data.country}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const TagInput: React.FC<{
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  darkMode: boolean;
  hasError?: boolean;
  maxItems?: number;
}> = ({ values, onChange, placeholder, darkMode, hasError, maxItems = 20 }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !values.includes(tag) && values.length < maxItems) {
      onChange([...values, tag]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue('');
    }
  };

  const removeTag = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const borderClass = hasError
    ? 'border-red-500 focus:ring-red-500'
    : darkMode
      ? 'border-gray-600 focus:ring-blue-500'
      : 'border-gray-300 focus:ring-blue-500';

  return (
    <div className={`flex flex-wrap gap-2 p-2 rounded-lg border ${borderClass} ${darkMode ? 'bg-gray-800' : 'bg-white'} focus-within:ring-2 focus-within:border-transparent transition-colors`}>
      {values.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className={`ml-1 hover:text-red-500 transition-colors ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`flex-1 min-w-[120px] px-2 py-1 border-none outline-none ${darkMode ? 'bg-transparent text-white placeholder-gray-400' : 'bg-transparent text-gray-900 placeholder-gray-500'}`}
        placeholder={values.length === 0 ? placeholder : 'Add more...'}
      />
    </div>
  );
};

const ProfessionalDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev, isFirst, isLast, errors, touched, handleBlur }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (2-5 years)',
    'Advanced (5-10 years)',
    'Expert (10+ years)',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData('cvFile', file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Professional Details</h2>
        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
          Share your experience and professional links
        </p>
      </div>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Bio *
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => updateData('bio', e.target.value)}
            onBlur={() => handleBlur && handleBlur('bio')}
            rows={4}
            className={getFieldClass(darkMode, Boolean(touched?.bio && errors?.bio))}
            placeholder="Tell us about yourself, your background, and what makes you unique..."
          />
          {touched?.bio && errors?.bio && (
            <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
          )}
        </div>

        {/* Education */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Education *
          </label>
          <textarea
            value={data.education}
            onChange={(e) => updateData('education', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="List your educational background, degrees, certifications, etc."
          />
        </div>

        {/* Work Experience */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Work Experience *
          </label>
          <textarea
            value={data.workExperience}
            onChange={(e) => updateData('workExperience', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Describe your professional experience, previous roles, achievements, etc."
          />
        </div>

        {/* Skills */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Skills *
          </label>
          <TagInput
            values={data.skills}
            onChange={(skills) => updateData('skills', skills)}
            placeholder="Type a skill and press Enter or comma (e.g., JavaScript, C++, C#)"
            darkMode={darkMode}
            hasError={Boolean(touched?.skills && errors?.skills)}
            maxItems={20}
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Press <kbd className={`px-1 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Enter</kbd> or <kbd className={`px-1 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>,</kbd> to add a skill
          </p>
          {touched?.skills && errors?.skills && (
            <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
          )}
        </div>

        {/* Primary Skill */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Primary Skill *
          </label>
          <input
            type="text"
            value={data.primarySkill}
            onChange={(e) => updateData('primarySkill', e.target.value)}
            onBlur={() => handleBlur && handleBlur('primarySkill')}
            className={getFieldClass(darkMode, Boolean(touched?.primarySkill && errors?.primarySkill))}
            placeholder="e.g., Web Development, Graphic Design, Content Writing"
          />
          {touched?.primarySkill && errors?.primarySkill && (
            <p className="text-red-500 text-xs mt-1">{errors.primarySkill}</p>
          )}
        </div>

        {/* Certifications */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Certifications
          </label>
          <TagInput
            values={data.certifications}
            onChange={(certs) => updateData('certifications', certs)}
            placeholder="Type a certification and press Enter (e.g., AWS Certified, PMP)"
            darkMode={darkMode}
            maxItems={20}
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Press <kbd className={`px-1 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Enter</kbd> or <kbd className={`px-1 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>,</kbd> to add
          </p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Experience Level *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceLevels.map((level) => (
              <button
                key={level}
                onClick={() => {
                  updateData('experienceLevel', level);
                  handleBlur && handleBlur('experienceLevel');
                }}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.experienceLevel === level
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${touched?.experienceLevel && errors?.experienceLevel ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {level}
              </button>
            ))}
          </div>
          {touched?.experienceLevel && errors?.experienceLevel && (
            <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Years of Experience *
          </label>
          <input
            type="text"
            value={data.yearsOfExperience}
            onChange={(e) => updateData('yearsOfExperience', e.target.value)}
            onBlur={() => handleBlur && handleBlur('yearsOfExperience')}
            className={getFieldClass(darkMode, Boolean(touched?.yearsOfExperience && errors?.yearsOfExperience))}
            placeholder="e.g., 3 years"
          />
          {touched?.yearsOfExperience && errors?.yearsOfExperience && (
            <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Availability Status *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Available', 'Busy', 'Part-time', 'Not Available'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  updateData('availability', status);
                  handleBlur && handleBlur('availability');
                }}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.availability === status
                  ? 'bg-green-500 border-green-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${touched?.availability && errors?.availability ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
          {touched?.availability && errors?.availability && (
            <p className="text-red-500 text-xs mt-1">{errors.availability}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Portfolio URL
          </label>
          <input
            type="url"
            value={data.portfolioUrl}
            onChange={(e) => updateData('portfolioUrl', e.target.value)}
            onBlur={() => handleBlur && handleBlur('portfolioUrl')}
            className={getFieldClass(darkMode, Boolean(touched?.portfolioUrl && errors?.portfolioUrl))}
            placeholder="https://yourportfolio.com"
          />
          {touched?.portfolioUrl && errors?.portfolioUrl && (
            <p className="text-red-500 text-xs mt-1">{errors.portfolioUrl}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              LinkedIn URL <span className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(Optional)</span>
            </label>
            <input
              type="url"
              value={data.linkedinUrl}
              onChange={(e) => updateData('linkedinUrl', e.target.value)}
              onBlur={() => handleBlur && handleBlur('linkedinUrl')}
              className={getFieldClass(darkMode, Boolean(touched?.linkedinUrl && errors?.linkedinUrl))}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {touched?.linkedinUrl && errors?.linkedinUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.linkedinUrl}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              GitHub URL <span className={`text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(Optional)</span>
            </label>
            <input
              type="url"
              value={data.githubUrl}
              onChange={(e) => updateData('githubUrl', e.target.value)}
              onBlur={() => handleBlur && handleBlur('githubUrl')}
              className={getFieldClass(darkMode, Boolean(touched?.githubUrl && errors?.githubUrl))}
              placeholder="https://github.com/yourusername"
            />
            {touched?.githubUrl && errors?.githubUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.githubUrl}</p>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            CV/Resume
          </label>

          {/* Show existing CV if available */}
          {data.existingCvUrl && !data.cvFile && (
            <div className={`mb-4 p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                    📄
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      Current CV/Resume
                    </p>
                    <a
                      href={apiService.getFileUrl(data.existingCvUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      View current CV
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => updateData('existingCvUrl', '')}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            touched?.cvFile && errors?.cvFile
              ? 'border-red-500 bg-red-500/5'
              : darkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
            } transition-colors`}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                handleFileChange(e);
                handleBlur && handleBlur('cvFile');
              }}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                📄
              </div>
              <p className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-600'}`}>
                {data.cvFile
                  ? data.cvFile.name
                  : data.existingCvUrl
                    ? 'Click to upload a new CV/Resume'
                    : 'Click to upload your CV/Resume'
                }
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                PDF, DOC, DOCX up to 10MB
              </p>
            </label>
          </div>

          {data.cvFile && (
            <button
              onClick={() => updateData('cvFile', null)}
              className="mt-2 text-red-500 hover:text-red-600 text-sm"
            >
              Remove new file
            </button>
          )}

          {touched?.cvFile && errors?.cvFile && (
            <p className="text-red-500 text-xs mt-2">{errors.cvFile}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${darkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.bio || !data.skills.length || !data.experienceLevel || !data.yearsOfExperience || !data.availability}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>

  );
};



const ReviewStep: React.FC<StepProps> = ({ data, onPrev, onSubmit, isFirst, isLast, navigate, refreshUser, redirectParam }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let cvUrl = "";
      let avatarUrl = "";

      // Upload profile picture first if a new file was selected
      if (data.profilePicture) {
        try {
          const uploadResponse = await apiService.uploadAvatar(data.profilePicture);
          avatarUrl = uploadResponse.fileUrl;
          console.log('Profile picture uploaded successfully:', avatarUrl);
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          alert('Failed to upload profile picture. Please try again.');
          setIsSaving(false);
          return;
        }
      } else if (data.profilePicturePreview && (data.profilePicturePreview.startsWith('http') || data.profilePicturePreview.startsWith('https'))) {
        // Preserve existing avatar URL when editing without re-uploading
        avatarUrl = data.profilePicturePreview;
      }

      // Upload CV file if it exists, otherwise use existing CV URL
      if (data.cvFile) {
        try {
          console.log('Uploading CV file:', data.cvFile.name);
          const uploadResponse = await apiService.uploadCV(data.cvFile);
          cvUrl = uploadResponse.fileUrl;
          console.log('CV uploaded successfully:', cvUrl);
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          alert('Failed to upload CV. Please try again.');
          setIsSaving(false);
          return;
        }
      } else if (data.existingCvUrl) {
        // Use existing CV URL if no new file was uploaded
        cvUrl = data.existingCvUrl;
        console.log('Using existing CV URL:', cvUrl);
      }

      // Log CV URL being saved
      if (cvUrl) {
        console.log('Saving CV URL to profile:', cvUrl);
      }

      // Map wizard data to full profile payload expected by the API
      const payload = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        location: formatLocation(data.city, data.country) || data.location || "",
        bio: data.bio || "",
        education: data.education || "",
        experience: data.workExperience || "",
        workExperience: data.workExperience || "",
        skills: data.skills || [],
        primarySkill: data.primarySkill || "",
        experienceLevel: data.experienceLevel || "",
        yearsOfExperience: data.yearsOfExperience || "",
        portfolioUrl: data.portfolioUrl || "",
        certifications: data.certifications || [],
        availability: data.availability || "Available",
        monthlyRate: data.monthlyRate || "",
        currency: data.currency || "",
        preferredJobTypes: data.preferredJobTypes || [],
        workLocation: data.workLocation || "",
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        websiteUrl: data.websiteUrl || "",
        cvUrl: cvUrl, // Include the uploaded CV URL
        avatar: avatarUrl, // Include the uploaded avatar URL
      };

      await apiService.saveFreelancerProfile(payload);

      // Clear local and remote storage after successful save to avoid conflicts
      removeFromStorage('freelancerProfileData', isAuthenticated);

      // Refresh user data in auth context to get updated profile information
      if (refreshUser) {
        await refreshUser();
      }

      alert('Profile saved successfully! You can continue editing or navigate to other pages.');
      if (onSubmit) {
        onSubmit();
      }

      // Redirect to job details if redirectParam exists
      if (redirectParam) {
        sessionStorage.removeItem('pendingJobRedirect');
        navigate(redirectParam, { replace: true });
      }
    } catch (error: any) {
      console.error('Error saving freelancer profile:', error);

      // Handle error without authentication check
      const errorMessage = error?.response?.data?.message || 'Failed to save profile. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Your Profile</h2>
        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
          Please review your information before saving
        </p>
      </div>

      {/* Profile Header Section */}
      <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Your Profile</h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {data.firstName} {data.lastName}'s Professional Profile
          </p>
        </div>

        {/* Profile Picture and Name Header */}
        <div className="flex flex-col items-center mb-6">
          {data.profilePicturePreview ? (
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <img
                  src={data.profilePicturePreview}
                  alt={`${data.firstName} ${data.lastName}'s Profile`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } border-2 shadow-md`}>
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ) : (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'
              }`}>
              <span className="text-4xl font-bold text-gray-500">
                {data.firstName?.charAt(0)}{data.lastName?.charAt(0)}
              </span>
            </div>
          )}

          <div className="text-center">
            <h4 className={`text-xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.firstName} {data.lastName}</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
              {data.experienceLevel} • {data.location}
            </p>
          </div>
        </div>

        {/* Basic Information Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Email:</span>
            <span className={`text-right ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Phone:</span>
            <span className={`text-right ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.phone || 'Not provided'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Location:</span>
            <span className={`text-right ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.location}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Availability:</span>
            <span className={`text-right px-2 py-1 rounded-full text-xs font-medium ${data.availability === 'Available'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
              {data.availability}
            </span>
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Professional Details</h3>
        <div className="space-y-3">
          {data.bio && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Bio:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-600'} whitespace-pre-wrap`}>{data.bio}</p>
            </div>
          )}
          {data.education && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Education:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-600'} whitespace-pre-wrap`}>{data.education}</p>
            </div>
          )}
          {data.workExperience && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Work Experience:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-600'} whitespace-pre-wrap`}>{data.workExperience}</p>
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Skills:</span>
              <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.skills.join(', ')}</span>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Certifications:</span>
              <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.certifications.join(', ')}</span>
            </div>
          )}
          <div>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Experience Level:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.experienceLevel}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Years of Experience:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.yearsOfExperience || 'Not specified'}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Availability:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{data.availability}</span>
          </div>
          {data.portfolioUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Portfolio:</span>
              <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.portfolioUrl}
              </a>
            </div>
          )}
          {data.linkedinUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>LinkedIn:</span>
              <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.linkedinUrl}
              </a>
            </div>
          )}
          {data.githubUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>GitHub:</span>
              <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.githubUrl}
              </a>
            </div>
          )}
          <div>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>CV/Resume:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
              {data.cvFile
                ? data.cvFile.name
                : data.existingCvUrl
                  ? 'Current CV available'
                  : 'No file uploaded'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${darkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </div>
    </div>
  );
};

export default FreelancerProfileWizard;
