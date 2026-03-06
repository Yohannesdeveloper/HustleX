import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';

interface ClientProfileData {
  // Company Information
  companyName: string;
  companyDescription: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;

  // Contact Information
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;

  // Additional Information
  foundedYear: string;
  mission: string;
  services: string[];
  logo: File | null;
  logoPreview: string | null;

  // Legal Information
  businessLicense: File | null;
  taxId: string;
}

interface StepProps {
  data: ClientProfileData;
  updateData: (field: keyof ClientProfileData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit?: () => void;
  refreshUser?: () => Promise<any>;
}

const steps = [
  { id: 1, title: 'Company Info', description: 'Tell us about your company' },
  { id: 2, title: 'Contact Details', description: 'How can freelancers reach you' },
  { id: 3, title: 'Review & Submit', description: 'Review your company profile' },
];

const ClientProfileWizard: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ClientProfileData>({
    companyName: '',
    companyDescription: '',
    industry: '',
    companySize: '',
    website: '',
    location: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    foundedYear: '',
    mission: '',
    services: [],
    logo: null,
    logoPreview: null,
    businessLicense: null,
    taxId: '',
  });

  // Inherit existing company profile when editing (same source as client dashboard)
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const companyProfile = await apiService.getCompanyProfile();

        const mapCompanySizeToDisplay = (size: string) => {
          const sizeMap: { [key: string]: string } = {
            '1-10': '1-10 employees',
            '11-50': '11-50 employees',
            '51-200': '51-200 employees',
            '201-500': '201-500 employees',
            '500+': '1000+ employees',
          };
          return sizeMap[size] || size;
        };

        const companyLogoUrl = companyProfile.logo
          ? (companyProfile.logo.startsWith('http') || companyProfile.logo.startsWith('data:')
            ? companyProfile.logo
            : apiService.getFileUrl(companyProfile.logo))
          : null;

        // Fallback to user profile picture if company logo is missing
        const userProfilePic = user?.profile?.avatar
          ? (user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:')
            ? user.profile.avatar
            : apiService.getFileUrl(user.profile.avatar))
          : null;

        const logoUrl = companyLogoUrl || userProfilePic;

        setProfileData(prev => ({
          ...prev,
          companyName: companyProfile.companyName ?? prev.companyName,
          companyDescription: companyProfile.description ?? companyProfile.companyDescription ?? prev.companyDescription,
          industry: companyProfile.industry ?? prev.industry,
          companySize: mapCompanySizeToDisplay(companyProfile.companySize) || prev.companySize,
          website: companyProfile.website ?? prev.website,
          location: companyProfile.location ?? companyProfile.address ?? prev.location,
          contactPerson: companyProfile.contactPerson ?? companyProfile.representative ?? prev.contactPerson,
          contactEmail: companyProfile.contactEmail ?? prev.contactEmail,
          contactPhone: companyProfile.contactPhone ?? prev.contactPhone,
          foundedYear: companyProfile.foundedYear?.toString() ?? prev.foundedYear,
          mission: companyProfile.mission ?? prev.mission,
          services: Array.isArray(companyProfile.services) ? companyProfile.services : prev.services,
          logoPreview: logoUrl ?? prev.logoPreview,
          taxId: companyProfile.taxId ?? prev.taxId,
        }));
      } catch {
        // No existing profile - check for user profile picture for new profile
        const userProfilePic = user?.profile?.avatar
          ? (user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:')
            ? user.profile.avatar
            : apiService.getFileUrl(user.profile.avatar))
          : null;

        if (userProfilePic) {
          setProfileData(prev => ({
            ...prev,
            logoPreview: userProfilePic
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      loadExistingProfile();
    }
  }, [loading, user]);

  const updateData = (field: keyof ClientProfileData, value: any) => {
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
        return <CompanyInfoStep {...stepProps} />;
      case 2:
        return <ContactDetailsStep {...stepProps} />;
      case 3:
        return <ReviewStep {...stepProps} onSubmit={() => navigate('/dashboard/hiring')} refreshUser={refreshUser} />;
      default:
        return <CompanyInfoStep {...stepProps} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Important Notice */}
          <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span>Please complete your company profile to access the client dashboard</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Client Profile Setup</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${step.id < currentStep
                    ? 'bg-green-500'
                    : step.id === currentStep
                      ? 'bg-green-600'
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
          className="h-full bg-gradient-to-r from-green-500 to-blue-600"
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
const CompanyInfoStep: React.FC<StepProps> = ({ data, updateData, onNext, isFirst, isLast }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Marketing',
    'Consulting',
    'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      updateData('logo', file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        updateData('logoPreview', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Company Information</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Tell us about your company to attract the best freelancers
        </p>
      </div>

      {/* Company Logo Upload */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <div className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-4 border-dashed ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} transition-colors overflow-hidden`}>
            {data.logoPreview ? (
              <img
                src={data.logoPreview}
                alt="Company Logo Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    🏢
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add Logo
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click to upload company logo
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            JPG, PNG up to 5MB
          </p>
          {data.logo && (
            <button
              onClick={() => {
                updateData('logo', null);
                updateData('logoPreview', null);
              }}
              className="mt-2 text-red-500 hover:text-red-600 text-sm"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => updateData('companyName', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => updateData('industry', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company Size *
          </label>
          <select
            value={data.companySize}
            onChange={(e) => updateData('companySize', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
          >
            <option value="">Select company size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Website
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => updateData('website', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="https://yourcompany.com"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Location *
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => updateData('location', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="City, Country"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company Description *
          </label>
          <textarea
            value={data.companyDescription}
            onChange={(e) => updateData('companyDescription', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="Describe your company, what you do, and what you're looking for in freelancers..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.companyName || !data.industry || !data.companySize || !data.location || !data.companyDescription}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const ContactDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev, isFirst, isLast }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData('businessLicense', file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Contact Details</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          How can freelancers get in touch with you?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Person *
          </label>
          <input
            type="text"
            value={data.contactPerson}
            onChange={(e) => updateData('contactPerson', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="Full name of the contact person"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Email *
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => updateData('contactEmail', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="contact@yourcompany.com"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Phone *
          </label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => updateData('contactPhone', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="+251 XXX XXX XXX"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Founded Year
          </label>
          <input
            type="number"
            value={data.foundedYear}
            onChange={(e) => updateData('foundedYear', e.target.value)}
            min="1800"
            max={new Date().getFullYear()}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="2020"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tax ID
          </label>
          <input
            type="text"
            value={data.taxId}
            onChange={(e) => updateData('taxId', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="Tax identification number"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Company Mission
          </label>
          <textarea
            value={data.mission}
            onChange={(e) => updateData('mission', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
            placeholder="What is your company's mission or vision?"
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Business License
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} transition-colors`}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id="license-upload"
            />
            <label htmlFor="license-upload" className="cursor-pointer">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                📄
              </div>
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {data.businessLicense ? data.businessLicense.name : 'Click to upload business license'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                PDF, JPG, PNG up to 10MB
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.contactPerson || !data.contactEmail || !data.contactPhone}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<StepProps> = ({ data, onPrev, onSubmit, isFirst, isLast, refreshUser }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let logoUrl = '';
      let tradeLicenseUrl = '';

      // Upload logo if a new file was selected
      if (data.logo) {
        try {
          const logoResponse = await apiService.uploadLogo(data.logo);
          logoUrl = logoResponse.fileUrl;
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          // Continue without logo, don't fail the entire submission
        }
      } else if (data.logoPreview && (data.logoPreview.startsWith('http') || data.logoPreview.startsWith('https'))) {
        // Preserve existing logo URL when editing without re-uploading
        logoUrl = data.logoPreview;
      }

      // Upload business license if exists
      if (data.businessLicense) {
        try {
          const licenseResponse = await apiService.uploadTradeLicense(data.businessLicense);
          tradeLicenseUrl = licenseResponse.fileUrl;
        } catch (uploadError) {
          console.error('Business license upload failed:', uploadError);
          // Continue without license, don't fail the entire submission
        }
      }

      // Prepare profile data with uploaded file URLs
      const profileData = {
        companyName: data.companyName,
        description: data.companyDescription,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        location: data.location,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : undefined,
        logo: logoUrl,
        tradeLicense: tradeLicenseUrl,
      };

      // Save company profile (stored in same backend as client dashboard)
      await apiService.updateCompanyProfile(profileData);

      // Refresh user so dashboard reflects updated hasCompanyProfile
      if (refreshUser) {
        await refreshUser();
      }

      alert('Company profile submitted successfully! Redirecting to client dashboard...');
      if (onSubmit) {
        onSubmit();
      }
    } catch (error: any) {
      console.error('Error saving company profile:', error);
      alert('Failed to save company profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Review Your Company Profile</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please review your company information before submitting
        </p>
      </div>

      {/* Company Header Section */}
      <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">{data.companyName}</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {data.industry} • {data.companySize}
          </p>
        </div>

        {/* Company Logo */}
        {data.logoPreview && (
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300">
              <img
                src={data.logoPreview}
                alt={`${data.companyName} Logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Company Description */}
        <div className="mb-6">
          <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            About {data.companyName}
          </h4>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {data.companyDescription}
          </p>
          {data.mission && (
            <div className="mt-4">
              <h5 className={`text-md font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mission
              </h5>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.mission}
              </p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Person:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.contactPerson}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.contactEmail}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.contactPhone}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location:</span>
            <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.location}</span>
          </div>
          {data.website && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website:</span>
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                {data.website}
              </a>
            </div>
          )}
          {data.foundedYear && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Founded:</span>
              <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.foundedYear}</span>
            </div>
          )}
        </div>

        {/* Files */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Documents
          </h4>
          <div className="space-y-2 text-sm">
            {data.businessLicense && (
              <div className="flex items-center gap-2">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Business License:</span>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.businessLicense.name}</span>
              </div>
            )}
            {data.logo && (
              <div className="flex items-center gap-2">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company Logo:</span>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.logo.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
          {isSubmitting ? 'Submitting...' : 'Submit Company Profile'}
        </motion.button>
      </div>
    </div>
  );
};

export default ClientProfileWizard;
