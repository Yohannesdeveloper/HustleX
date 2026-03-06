import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { User } from '../types';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';

interface FreelancerProfileData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
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
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Professional Details', description: 'Share your experience and links' },
  { id: 3, title: 'Review & Submit', description: 'Review your profile' },
];

const FreelancerProfileWizard: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<FreelancerProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
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

    setProfileData(prev => ({
      ...prev,
      firstName: p.firstName ?? prev.firstName,
      lastName: p.lastName ?? prev.lastName,
      email: (user as any).email ?? prev.email,
      phone: p.phone ?? prev.phone,
      location: p.location ?? prev.location,
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

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const updateData = (field: keyof FreelancerProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
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
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <ProfessionalDetailsStep {...stepProps} />;
      case 3:
        return <ReviewStep {...stepProps} onSubmit={() => navigate('/dashboard/freelancer')} navigate={navigate} refreshUser={refreshUser} />;
      default:
        return <BasicInfoStep {...stepProps} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Important Notice */}
          <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span>Please complete your freelancer profile to access the dashboard</span>
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
                <h1 className="text-2xl font-bold">Freelancer Profile Setup</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
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
const BasicInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, isFirst, isLast }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

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
        <h2 className="text-3xl font-bold mb-2">Basic Information</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            First Name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => updateData('firstName', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Last Name *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => updateData('lastName', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData('email', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData('phone', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="+251 XXX XXX XXX"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Location *
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => updateData('location', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="City, Country"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.firstName || !data.lastName || !data.email || !data.location}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const ProfessionalDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev, isFirst, isLast }) => {
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
        <h2 className="text-3xl font-bold mb-2">Professional Details</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Share your experience and professional links
        </p>
      </div>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Bio *
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => updateData('bio', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Tell us about yourself, your background, and what makes you unique..."
          />
        </div>

        {/* Education */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Skills *
          </label>
          <input
            type="text"
            value={data.skills.join(', ')}
            onChange={(e) => updateData('skills', e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill))}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="e.g., JavaScript, React, Node.js, Python (separate with commas)"
          />
        </div>

        {/* Certifications */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Certifications
          </label>
          <input
            type="text"
            value={data.certifications.join(', ')}
            onChange={(e) => updateData('certifications', e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert))}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="e.g., AWS Certified, PMP, Google Analytics (separate with commas)"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Experience Level *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceLevels.map((level) => (
              <button
                key={level}
                onClick={() => updateData('experienceLevel', level)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.experienceLevel === level
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Years of Experience *
          </label>
          <input
            type="text"
            value={data.yearsOfExperience}
            onChange={(e) => updateData('yearsOfExperience', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="e.g., 3 years"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Availability Status *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Available', 'Busy', 'Part-time', 'Not Available'].map((status) => (
              <button
                key={status}
                onClick={() => updateData('availability', status)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.availability === status
                  ? 'bg-green-500 border-green-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Portfolio URL
          </label>
          <input
            type="url"
            value={data.portfolioUrl}
            onChange={(e) => updateData('portfolioUrl', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="https://yourportfolio.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              LinkedIn URL
            </label>
            <input
              type="url"
              value={data.linkedinUrl}
              onChange={(e) => updateData('linkedinUrl', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              GitHub URL
            </label>
            <input
              type="url"
              value={data.githubUrl}
              onChange={(e) => updateData('githubUrl', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            CV/Resume *
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
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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

          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            } transition-colors`}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                📄
              </div>
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.bio || !data.education || !data.workExperience || !data.skills.length || !data.experienceLevel || !data.yearsOfExperience || !data.availability || (!data.cvFile && !data.existingCvUrl)}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>

  );
};



const ReviewStep: React.FC<StepProps> = ({ data, onPrev, onSubmit, isFirst, isLast, navigate, refreshUser }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
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
          setIsSubmitting(false);
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
          setIsSubmitting(false);
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
        location: data.location || "",
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

      // Refresh user data in auth context to get updated profile information
      if (refreshUser) {
        await refreshUser();
      }

      alert('Profile submitted successfully! Redirecting to freelancer dashboard...');
      if (onSubmit) {
        onSubmit();
      }
    } catch (error: any) {
      console.error('Error saving freelancer profile:', error);

      // Check if it's an authentication error
      if (error?.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/signup');
        return;
      }

      // Handle other types of errors
      const errorMessage = error?.response?.data?.message || 'Failed to save profile. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Review Your Profile</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please review your information before submitting
        </p>
      </div>

      {/* Profile Header Section */}
      <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Review Your Profile</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <h4 className="text-xl font-semibold mb-1">{data.firstName} {data.lastName}</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {data.experienceLevel} • {data.location}
            </p>
          </div>
        </div>

        {/* Basic Information Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.phone || 'Not provided'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.location}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Availability:</span>
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
        <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
        <div className="space-y-3">
          {data.bio && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>{data.bio}</p>
            </div>
          )}
          {data.education && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Education:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>{data.education}</p>
            </div>
          )}
          {data.workExperience && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Work Experience:</span>
              <p className={`ml-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>{data.workExperience}</p>
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills:</span>
              <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.skills.join(', ')}</span>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Certifications:</span>
              <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.certifications.join(', ')}</span>
            </div>
          )}
          <div>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Experience Level:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.experienceLevel}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Years of Experience:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.yearsOfExperience || 'Not specified'}</span>
          </div>
          <div>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Availability:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.availability}</span>
          </div>
          {data.portfolioUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Portfolio:</span>
              <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.portfolioUrl}
              </a>
            </div>
          )}
          {data.linkedinUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>LinkedIn:</span>
              <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.linkedinUrl}
              </a>
            </div>
          )}
          {data.githubUrl && (
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>GitHub:</span>
              <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600">
                {data.githubUrl}
              </a>
            </div>
          )}
          <div>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CV/Resume:</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Profile'}
        </motion.button>
      </div>
    </div>
  );
};

export default FreelancerProfileWizard;
