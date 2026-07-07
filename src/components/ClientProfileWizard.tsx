import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';
import PhoneInput from './PhoneInput';
import CountrySelect from './CountrySelect';
import CitySelect from './CitySelect';
import { formatLocation, parseLocation } from '../utils/location';
import {
  mapCompanySizeToApi,
  mapCompanySizeToDisplay,
  normalizeWebsiteUrl,
} from '../utils/companyProfile';

interface ClientProfileData {
  companyName: string;
  companyDescription: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  city: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  foundedYear: string;
  mission: string;
  services: string[];
  logo: File | null;
  logoPreview: string | null;
  businessLicense: File | null;
  taxId: string;
  businessRegistrationNo: string;
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

const getFieldClass = (darkMode: boolean, hasError: boolean) => {
  const theme = darkMode
    ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
    : 'bg-white/80 border-cyan-200/60 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-white';
  const error = 'border-red-500';
  return `w-full px-4 py-3 rounded-xl border backdrop-blur-xl font-body transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${hasError ? error : theme}`;
};

const styleId = 'client-profile-wizard-styles';
const styleContent = `
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .glass-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border, rgba(6,242,242,0.15)); }
  :root:not(.dark) .glass-card { border: 1px solid rgba(0,0,0,0.1) !important; }
  .cyan-gradient-text { background: linear-gradient(135deg, #06f2f2 0%, #3b82f6 50%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  .animate-shimmer { background-size: 200% auto; animation: shimmer 3s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
  @keyframes float-delayed { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(15px) scale(0.95); } }
  @keyframes glow-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
`;

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
    city: '',
    country: '',
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
    businessRegistrationNo: '',
  });

  useEffect(() => {
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = styleContent;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const companyProfile = await apiService.getCompanyProfile();
        const companyLogoUrl = companyProfile.logo
          ? (companyProfile.logo.startsWith('http') || companyProfile.logo.startsWith('data:')
            ? companyProfile.logo
            : apiService.getFileUrl(companyProfile.logo))
          : null;
        const userProfilePic = user?.profile?.avatar
          ? (user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:')
            ? user.profile.avatar
            : apiService.getFileUrl(user.profile.avatar))
          : null;
        const logoUrl = companyLogoUrl || userProfilePic;
        const savedLocation = companyProfile.location ?? companyProfile.address ?? '';
        const { city, country } = parseLocation(savedLocation);

        setProfileData(prev => ({
          ...prev,
          companyName: companyProfile.companyName ?? prev.companyName,
          companyDescription: companyProfile.description ?? companyProfile.companyDescription ?? prev.companyDescription,
          industry: companyProfile.industry ?? prev.industry,
          companySize: mapCompanySizeToDisplay(companyProfile.companySize) || prev.companySize,
          website: companyProfile.website ?? prev.website,
          location: savedLocation || prev.location,
          city: city || prev.city,
          country: country || prev.country,
          contactPerson: companyProfile.contactPerson ?? companyProfile.representative ?? prev.contactPerson,
          contactEmail: companyProfile.contactEmail ?? prev.contactEmail,
          contactPhone: companyProfile.contactPhone ?? prev.contactPhone,
          foundedYear: companyProfile.foundedYear?.toString() ?? prev.foundedYear,
          mission: companyProfile.mission ?? prev.mission,
          services: Array.isArray(companyProfile.services) ? companyProfile.services : prev.services,
          logoPreview: logoUrl ?? prev.logoPreview,
          taxId: companyProfile.taxId ?? prev.taxId,
          businessRegistrationNo: companyProfile.businessRegistrationNo ?? prev.businessRegistrationNo,
        }));
      } catch {
        const userProfilePic = user?.profile?.avatar
          ? (user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:')
            ? user.profile.avatar
            : apiService.getFileUrl(user.profile.avatar))
          : null;
        if (userProfilePic) {
          setProfileData(prev => ({ ...prev, logoPreview: userProfilePic }));
        }
      } finally {
        setLoading(false);
      }
    };
    if (loading) loadExistingProfile();
  }, [loading, user]);

  const updateData = (field: keyof ClientProfileData, value: any) => {
    if (field === 'website' && typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        value = `https://${trimmed}`;
      }
    }
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => { if (currentStep < steps.length) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const renderStep = () => {
    const stepProps = { data: profileData, updateData, onNext: nextStep, onPrev: prevStep, isFirst: currentStep === 1, isLast: currentStep === steps.length };
    switch (currentStep) {
      case 1: return <CompanyInfoStep {...stepProps} />;
      case 2: return <ContactDetailsStep {...stepProps} />;
      case 3: return <ReviewStep {...stepProps} onSubmit={() => navigate('/dashboard/hiring')} refreshUser={refreshUser} />;
      default: return <CompanyInfoStep {...stepProps} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
          <p className="font-body">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} overflow-y-auto font-body relative`}>
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-float ${darkMode ? 'bg-cyan-500' : 'bg-cyan-300'}`} style={{ filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite' }} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-float-delayed ${darkMode ? 'bg-blue-500' : 'bg-blue-300'}`} style={{ filter: 'blur(80px)', animation: 'float-delayed 10s ease-in-out infinite' }} />
        <div className={`absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 ${darkMode ? 'bg-purple-500' : 'bg-purple-300'}`} style={{ filter: 'blur(100px)', animation: 'glow-pulse 6s ease-in-out infinite' }} />
      </div>

      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${darkMode ? 'bg-black/60 border-cyan-500/10' : 'bg-white/70 border-black/10 shadow-sm shadow-black/5'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className={`mb-4 p-3 rounded-xl glass-card ${darkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50/80 border-black/10'}`}>
            <p className="text-sm font-medium font-body flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span>Please complete your company profile to access the client dashboard</span>
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display">
                <span className="cyan-gradient-text animate-shimmer">Client Profile Setup</span>
              </h1>
              <p className={`text-sm font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${step.id < currentStep
                    ? 'bg-cyan-500'
                    : step.id === currentStep
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,242,242,0.5)]'
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
      <div className={`h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 relative z-[1]">
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

const CompanyInfoStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const handleCityChange = (city: string) => {
    updateData('city', city);
    updateData('location', formatLocation(city, data.country));
  };

  const handleCountryChange = (country: string) => {
    updateData('city', '');
    updateData('country', country);
    updateData('location', formatLocation('', country));
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Marketing', 'Consulting', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB.'); return; }
    updateData('logo', file);
    const reader = new FileReader();
    reader.onload = (e) => updateData('logoPreview', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-display cyan-gradient-text mb-2">Company Information</h2>
        <p className={`font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Tell us about your company to attract the best freelancers
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <div className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-4 border-dashed ${
            darkMode
              ? 'border-cyan-500/30 hover:border-cyan-500/50'
              : 'border-cyan-400/30 hover:border-cyan-400/50'
          } transition-colors overflow-hidden`}>
            {data.logoPreview ? (
              <img src={data.logoPreview} alt="Company Logo Preview" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>🏢</div>
                  <p className={`text-xs font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add Logo</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <p className={`text-sm font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click to upload company logo</p>
          <p className={`text-xs mt-1 font-body ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>JPG, PNG up to 5MB</p>
          {data.logo && (
            <button onClick={() => { updateData('logo', null); updateData('logoPreview', null); }}
              className="mt-2 text-red-500 hover:text-red-600 text-sm font-body">Remove logo</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Company Name *</label>
          <input type="text" value={data.companyName}
            onChange={(e) => updateData('companyName', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="Enter your company name" />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Industry *</label>
          <select value={data.industry}
            onChange={(e) => updateData('industry', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border backdrop-blur-xl font-body transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
              darkMode
                ? 'bg-white/[0.04] border-cyan-500/30 text-white focus:bg-white/[0.08]'
                : 'bg-white/80 border-cyan-200/60 text-gray-900 focus:bg-white'
            }`}>
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry} className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>{industry}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Company Size *</label>
          <select value={data.companySize}
            onChange={(e) => updateData('companySize', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border backdrop-blur-xl font-body transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
              darkMode
                ? 'bg-white/[0.04] border-cyan-500/30 text-white focus:bg-white/[0.08]'
                : 'bg-white/80 border-cyan-200/60 text-gray-900 focus:bg-white'
            }`}>
            <option value="">Select company size</option>
            {companySizes.map((size) => (
              <option key={size} value={size} className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>{size}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Website</label>
          <input type="url" value={data.website}
            onChange={(e) => updateData('website', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="https://yourcompany.com" />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Location *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CitySelect selectedCountry={data.country} value={data.city} onChange={handleCityChange} darkMode={darkMode} placeholder="City" />
            <CountrySelect value={data.country} onChange={(val) => handleCountryChange(val)} darkMode={darkMode} />
          </div>
          <p className={`text-xs mt-2 font-body ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Saved as: {data.location || 'City, Country'}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Company Description *</label>
          <textarea value={data.companyDescription}
            onChange={(e) => updateData('companyDescription', e.target.value)}
            rows={4}
            className={getFieldClass(darkMode, false)}
            placeholder="Describe your company, what you do, and what you're looking for in freelancers..." />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!data.companyName || !data.industry || !data.companySize || !data.city.trim() || !data.country || !data.companyDescription}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/25 font-body">
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const ContactDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateData('businessLicense', file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-display cyan-gradient-text mb-2">Contact Details</h2>
        <p className={`font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How can freelancers get in touch with you?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Contact Person *</label>
          <input type="text" value={data.contactPerson}
            onChange={(e) => updateData('contactPerson', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="Full name of the contact person" />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Contact Email *</label>
          <input type="email" value={data.contactEmail}
            onChange={(e) => updateData('contactEmail', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="contact@yourcompany.com" />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Contact Phone *</label>
          <PhoneInput value={data.contactPhone} onChange={(value) => updateData('contactPhone', value)}
            placeholder="XXX XXX XXX" required darkMode={darkMode} />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Founded Year</label>
          <input type="number" value={data.foundedYear}
            onChange={(e) => updateData('foundedYear', e.target.value)}
            min="1800" max={new Date().getFullYear()}
            className={getFieldClass(darkMode, false)}
            placeholder="2020" />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tax ID</label>
          <input type="text" value={data.taxId}
            onChange={(e) => updateData('taxId', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="Tax identification number" />
        </div>
        <div>
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Business Registration No</label>
          <input type="text" value={data.businessRegistrationNo}
            onChange={(e) => updateData('businessRegistrationNo', e.target.value)}
            className={getFieldClass(darkMode, false)}
            placeholder="Business registration number" />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Company Mission</label>
          <textarea value={data.mission}
            onChange={(e) => updateData('mission', e.target.value)}
            rows={3}
            className={getFieldClass(darkMode, false)}
            placeholder="What is your company's mission or vision?" />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium font-body mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Business License</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center backdrop-blur-xl transition-all ${
            darkMode
              ? 'bg-white/[0.02] border-cyan-500/20 hover:border-cyan-500/40'
              : 'bg-white/50 border-black/10 hover:border-cyan-400/40'
          }`}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="license-upload" />
            <label htmlFor="license-upload" className="cursor-pointer">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>📄</div>
              <p className={`text-sm mb-2 font-body ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {data.businessLicense ? data.businessLicense.name : 'Click to upload business license'}
              </p>
              <p className={`text-xs font-body ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                PDF, JPG, PNG up to 10MB
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onPrev}
          className={`px-8 py-3 rounded-xl font-semibold font-body transition-all duration-200 ${
            darkMode
              ? 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] border border-cyan-500/30'
              : 'bg-white/80 text-gray-700 hover:bg-white border border-cyan-200/60'
          }`}>
          Previous
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext}
          disabled={!data.contactPerson || !data.contactEmail || !data.contactPhone}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/25 font-body">
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<StepProps> = ({ data, onPrev, onSubmit, refreshUser }) => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let logoUrl = '';
      let tradeLicenseUrl = '';
      if (data.logo) {
        try {
          const logoResponse = await apiService.uploadLogo(data.logo);
          logoUrl = logoResponse.fileUrl;
        } catch (e) { console.error('Logo upload failed:', e); }
      } else if (data.logoPreview && (data.logoPreview.startsWith('http') || data.logoPreview.startsWith('https'))) {
        logoUrl = data.logoPreview;
      }
      if (data.businessLicense) {
        try {
          const licenseResponse = await apiService.uploadTradeLicense(data.businessLicense);
          tradeLicenseUrl = licenseResponse.fileUrl;
        } catch (e) { console.error('Business license upload failed:', e); }
      }
      const validLogo = logoUrl && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) ? logoUrl : undefined;
      const validTradeLicense = tradeLicenseUrl && (tradeLicenseUrl.startsWith('http://') || tradeLicenseUrl.startsWith('https://')) ? tradeLicenseUrl : undefined;
      const profileData: Record<string, unknown> = {
        companyName: data.companyName.trim(),
        description: data.companyDescription,
        industry: data.industry,
        companySize: mapCompanySizeToApi(data.companySize),
        location: formatLocation(data.city, data.country) || data.location,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      };
      const website = normalizeWebsiteUrl(data.website);
      if (website) profileData.website = website;
      if (data.foundedYear) { const year = parseInt(data.foundedYear, 10); if (!Number.isNaN(year)) profileData.foundedYear = year; }
      if (validLogo) profileData.logo = validLogo;
      if (validTradeLicense) profileData.tradeLicense = validTradeLicense;
      if (data.taxId?.trim()) profileData.taxId = data.taxId.trim();
      if (data.businessRegistrationNo?.trim()) profileData.businessRegistrationNo = data.businessRegistrationNo.trim();
      await apiService.updateCompanyProfile(profileData);
      if (refreshUser) await refreshUser();
      alert('Profile setup completed successfully!');
      if (window.Telegram?.WebApp) { try { window.Telegram.WebApp.close(); } catch (e) {} return; }
      navigate('/dashboard/hiring');
      if (onSubmit) onSubmit();
    } catch (error: any) {
      console.error('Error saving company profile:', error);
      const details = error?.response?.data?.errors;
      const errMsg =
        (Array.isArray(details) && details.map((e: { msg?: string }) => e.msg).filter(Boolean).join('\n')) ||
        error?.response?.data?.message || error?.message || 'Please try again.';
      alert(`Failed to save company profile: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-display cyan-gradient-text mb-2">Review Your Company Profile</h2>
        <p className={`font-body ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Please review your company information before submitting
        </p>
      </div>

      <div className={`rounded-2xl p-6 glass-card ${darkMode ? '' : 'bg-white/70 border-black/10 shadow-sm shadow-black/5'}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold font-display mb-1">{data.companyName}</h3>
          <p className={`font-body ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
            {data.industry} • {data.companySize}
          </p>
        </div>

        {data.logoPreview && (
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
              <img src={data.logoPreview} alt={`${data.companyName} Logo`} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className={`text-lg font-semibold font-display mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>About {data.companyName}</h4>
          <p className={`font-body ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.companyDescription}</p>
          {data.mission && (
            <div className="mt-4">
              <h5 className={`text-md font-medium font-display mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mission</h5>
              <p className={`font-body ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.mission}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
          {[
            { label: 'Contact Person', value: data.contactPerson },
            { label: 'Email', value: data.contactEmail },
            { label: 'Phone', value: data.contactPhone },
            { label: 'Location', value: data.location },
            ...(data.website ? [{ label: 'Website', value: data.website, isLink: true }] : []),
            ...(data.foundedYear ? [{ label: 'Founded', value: data.foundedYear }] : []),
          ].map(({ label, value, isLink }) => (
            <div key={label} className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-cyan-500/10' : 'border-black/10'}`}>
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}:</span>
              {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-600 text-right">{value}</a>
              ) : (
                <span className={`text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-cyan-500/10 dark:border-cyan-500/10">
          <h4 className={`text-md font-medium font-display mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Documents</h4>
          <div className="space-y-2 text-sm font-body">
            {data.businessLicense && (
              <div className="flex items-center gap-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Business License:</span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{data.businessLicense.name}</span>
              </div>
            )}
            {data.logo && (
              <div className="flex items-center gap-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Company Logo:</span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{data.logo.name}</span>
              </div>
            )}
            {data.businessRegistrationNo && (
              <div className="flex items-center gap-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Business Registration No:</span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{data.businessRegistrationNo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onPrev}
          className={`px-8 py-3 rounded-xl font-semibold font-body transition-all duration-200 ${
            darkMode
              ? 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] border border-cyan-500/30'
              : 'bg-white/80 text-gray-700 hover:bg-white border border-cyan-200/60'
          }`}>
          Previous
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/25 font-body">
          {isSubmitting ? 'Submitting...' : 'Submit Company Profile'}
        </motion.button>
      </div>
    </div>
  );
};

export default ClientProfileWizard;
