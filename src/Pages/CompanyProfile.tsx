import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBuilding, FaFileAlt, FaCamera, FaCheckCircle, FaUpload } from 'react-icons/fa';
import { RootState } from '../store';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';
import PhoneInput from '../components/PhoneInput';

const CompanyProfile: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tradeLicenseRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    foundedYear: '',
    businessRegistrationNo: '',
    taxId: '',
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tradeLicense, setTradeLicense] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch existing company profile data on component mount
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const companyProfile = await apiService.getCompanyProfile();

        // Map the company size back to the display format
        const mapCompanySizeBack = (size: string) => {
          const sizeMap: { [key: string]: string } = {
            '1-10': '1-10 employees',
            '11-50': '11-50 employees',
            '51-200': '51-200 employees',
            '201-500': '201-500 employees',
            '500+': '1000+ employees'
          };
          return sizeMap[size] || size;
        };

        setCompanyData({
          companyName: companyProfile.companyName || '',
          industry: companyProfile.industry || '',
          companySize: mapCompanySizeBack(companyProfile.companySize) || '',
          website: companyProfile.website || '',
          description: companyProfile.description || '',
          address: companyProfile.location || '', // Map location back to address
          phone: companyProfile.contactPhone || '',
          email: companyProfile.contactEmail || '',
          foundedYear: companyProfile.foundedYear?.toString() || '',
          businessRegistrationNo: companyProfile.businessRegistrationNo || '',
          taxId: companyProfile.taxId || '',
        });

        // Handle logo URL - ensure it's a full URL if it's a relative path
        if (companyProfile.logo) {
          if (companyProfile.logo.startsWith('http') || companyProfile.logo.startsWith('data:')) {
            setLogo(companyProfile.logo);
          } else {
            setLogo(apiService.getFileUrl(companyProfile.logo));
          }
        } else {
          setLogo(null);
        }

        // Handle trade license URL
        if (companyProfile.tradeLicense) {
          if (companyProfile.tradeLicense.startsWith('http') || companyProfile.tradeLicense.startsWith('data:')) {
            setTradeLicense(companyProfile.tradeLicense);
          } else {
            setTradeLicense(apiService.getFileUrl(companyProfile.tradeLicense));
          }
        } else {
          setTradeLicense(null);
        }
        setIsVerified(companyProfile.verificationStatus === 'verified');

        // Navigate to hiring dashboard if already verified
        if (companyProfile.verificationStatus === 'verified') {
          navigate('/dashboard/hiring');
        }
      } catch (error) {
        // If no company profile exists, inherit from user profile
        console.log('No existing company profile found, inheriting from user profile');

        if (user?.profile) {
          // Generate company name from user's name if available
          const companyNameFromUser = user.profile.firstName && user.profile.lastName
            ? `${user.profile.firstName} ${user.profile.lastName} Company`
            : user.profile.firstName
            ? `${user.profile.firstName} Company`
            : '';

          setCompanyData(prev => ({
            ...prev,
            companyName: companyNameFromUser,
            phone: user.profile.phone || '',
            email: user.email || '',
            address: user.profile.location || '',
            description: user.profile.bio || '',
            website: user.profile.websiteUrl || user.profile.website || '',
            industry: prev.industry || '',
            companySize: prev.companySize || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [navigate]);

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Consulting',
    'Media & Entertainment',
    'Transportation',
    'Agriculture',
    'Construction',
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

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string): boolean => {
    const newErrors = { ...errors };

    switch (field) {
      case 'companyName':
        if (!companyData.companyName.trim()) {
          // Company name is optional for private clients
          delete newErrors.companyName;
        } else if (companyData.companyName.trim().length < 2) {
          newErrors.companyName = 'Company name must be at least 2 characters';
        } else {
          delete newErrors.companyName;
        }
        break;

      case 'industry':
        if (!companyData.industry) {
          newErrors.industry = 'Industry is required';
        } else {
          delete newErrors.industry;
        }
        break;

      case 'companySize':
        if (!companyData.companySize) {
          newErrors.companySize = 'Company size is required';
        } else {
          delete newErrors.companySize;
        }
        break;

      case 'phone':
        if (!companyData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (companyData.phone.length < 10) {
          newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!companyData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(companyData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'description':
        if (!companyData.description.trim()) {
          newErrors.description = 'Company description is required';
        } else if (companyData.description.trim().length < 50) {
          newErrors.description = 'Description must be at least 50 characters';
        } else {
          delete newErrors.description;
        }
        break;

      case 'address':
        if (!companyData.address.trim()) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;

      case 'website':
        if (companyData.website && !companyData.website.startsWith('http')) {
          newErrors.website = 'Please enter a valid URL starting with http:// or https://';
        } else {
          delete newErrors.website;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => touched[key] || newErrors[key]).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const isPrivateClient = !companyData.companyName.trim();

    // Required fields validation
    if (!isPrivateClient && !companyData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for company accounts';
    } else if (!isPrivateClient && companyData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    if (!companyData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!companyData.companySize) {
      newErrors.companySize = 'Company size is required';
    }

    if (!companyData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (companyData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!companyData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(companyData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!companyData.description.trim()) {
      newErrors.description = 'Company description is required';
    } else if (companyData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!companyData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (companyData.website && !companyData.website.startsWith('http')) {
      newErrors.website = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTradeLicenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTradeLicenseFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTradeLicense(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleTradeLicenseClick = () => {
    tradeLicenseRef.current?.click();
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!validateForm()) {
        // Mark all fields as touched to show errors
        const allTouched: Record<string, boolean> = {};
        ['companyName', 'industry', 'companySize', 'phone', 'email', 'description', 'address', 'website'].forEach(field => {
          allTouched[field] = true;
        });
        setTouched(allTouched);
        
        // Scroll to first error
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.getElementById(`field-${firstErrorField}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
        
        alert('Please fix the errors in the form before submitting.');
        return;
      }

      // Check if this is a private client (no company name) or company client
      const isPrivateClient = !companyData.companyName.trim();

      let logoUrl = '';
      let tradeLicenseUrl = '';

      // Upload logo if selected
      if (logoFile) {
        try {
          const uploadResult = await apiService.uploadLogo(logoFile);
          logoUrl = uploadResult.fileUrl;
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          alert('Failed to upload logo. Please try again.');
          // Continue without logo
        }
      }

      // Upload trade license if selected
      if (tradeLicenseFile) {
        try {
          const uploadResult = await apiService.uploadTradeLicense(tradeLicenseFile);
          tradeLicenseUrl = uploadResult.fileUrl;
        } catch (uploadError) {
          console.error('Trade license upload failed:', uploadError);
          // Continue without trade license
        }
      }

      // Map company size to the expected enum values
      const mapCompanySize = (size: string) => {
        const sizeMap: { [key: string]: string } = {
          '1-10 employees': '1-10',
          '11-50 employees': '11-50',
          '51-200 employees': '51-200',
          '201-500 employees': '201-500',
          '501-1000 employees': '201-500', // Map to closest
          '1000+ employees': '500+'
        };
        return sizeMap[size] || size;
      };

      // Only send http/https URLs - never base64 data URLs (they can break the request)
      const validLogo = logoUrl || (logo && (logo.startsWith('http://') || logo.startsWith('https://')) ? logo : undefined);
      const validTradeLicense = tradeLicenseUrl || (tradeLicense && (tradeLicense.startsWith('http://') || tradeLicense.startsWith('https://')) ? tradeLicense : undefined);

      // Save the company profile to the backend
      const companyProfileData = {
        companyName: companyData.companyName,
        industry: companyData.industry,
        companySize: mapCompanySize(companyData.companySize),
        website: companyData.website,
        location: companyData.address, // Map address to location
        description: companyData.description,
        contactEmail: companyData.email,
        contactPhone: companyData.phone,
        foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
        logo: validLogo,
        tradeLicense: validTradeLicense,
        taxId: companyData.taxId?.trim() || undefined,
        businessRegistrationNo: companyData.businessRegistrationNo?.trim() || undefined,
      };

      await apiService.updateCompanyProfile(companyProfileData);

      // Simulate verification process for private clients
      setIsVerified(true);

      // Navigate to hiring dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard/hiring');
      }, 2000);

      alert('Company profile saved successfully! You are now registered as a client and can access the hiring dashboard.');
    } catch (error: any) {
      console.error('Error saving company profile:', error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Please try again.';
      alert(`Failed to save company profile: ${errMsg}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-cyan-400' : 'border-cyan-600'} mx-auto mb-4`}></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-body ${darkMode ? 'bg-black text-white' : 'bg-slate-50 text-gray-900'}`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --cyan: #06f2f2;
          --cyan-dark: #05b8b8;
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(6, 242, 242, 0.15);
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
        }
        .dark .glass-card { background: rgba(0, 0, 0, 0.4); }
        .cyan-gradient-text {
          background: linear-gradient(135deg, #06f2f2 0%, #0af 50%, #06f2f2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Ambient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-black/80 backdrop-blur-xl border-cyan-500/20' : 'bg-white/80 backdrop-blur-xl border-slate-200/60'} border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-white/5 text-cyan-400' : 'hover:bg-slate-100 text-cyan-600'} transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold font-display cyan-gradient-text">Company Profile</h1>
            {isVerified && (
              <div className="flex items-center gap-2 text-emerald-600 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <FaCheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Company Logo */}
          <div className={`rounded-2xl p-6 glass-card ${darkMode ? 'bg-black/50 border-cyan-500/20' : 'bg-white/70 border-cyan-400/20 shadow-sm shadow-cyan-400/5'}`}>
            <div className="flex items-center gap-3 mb-6">
              <FaCamera className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display cyan-gradient-text">Company Logo</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all glass-card ${
                    darkMode
                      ? 'border-cyan-500/30 hover:border-cyan-400 bg-white/[0.03]'
                      : 'border-cyan-400/30 hover:border-cyan-400 bg-white/80'
                  }`}
                  onClick={handleLogoClick}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt="Company Logo"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <FaBuilding className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  )}
                </div>
                <motion.button
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogoClick}
                >
                  <FaCamera className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="flex-1">
                <h3 className={`font-medium mb-2 font-body ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Company Logo
                </h3>
                <p className={`text-sm mb-4 font-body ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose a professional logo for your company. Recommended size: 400x400px
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <motion.button
                  onClick={handleLogoClick}
                  className="px-4 py-2 rounded-xl font-medium font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Logo
                </motion.button>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className={`rounded-2xl p-6 glass-card ${darkMode ? 'bg-black/50 border-cyan-500/20' : 'bg-white/70 border-cyan-400/20 shadow-sm shadow-cyan-400/5'}`}>
            <div className="flex items-center gap-3 mb-6">
              <FaBuilding className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display cyan-gradient-text">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2" id="field-companyName">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Company Name {!companyData.companyName.trim() ? '(optional for private clients)' : '(required for companies)'}
                  {!companyData.companyName.trim() && <span className="text-gray-400 text-xs ml-2">Private Client</span>}
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  onBlur={() => handleBlur('companyName')}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    touched.companyName && errors.companyName
                      ? 'border-red-500 focus:ring-red-500'
                      : darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder={companyData.companyName.trim() ? "Enter your company name" : "Leave blank for private clients"}
                />
                {touched.companyName && errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>

              <div id="field-industry">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Industry *
                </label>
                <select
                  value={companyData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  onBlur={() => handleBlur('industry')}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    touched.industry && errors.industry
                      ? 'border-red-500 focus:ring-red-500'
                      : darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {touched.industry && errors.industry && (
                  <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Company Size
                </label>
                <select
                  value={companyData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <option value="">Select Company Size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Website
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div id="field-phone">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Phone *
                </label>
                <PhoneInput
                  value={companyData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="XXX XXX XXX"
                  darkMode={darkMode}
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div id="field-email">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    touched.email && errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="contact@yourcompany.com"
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Founded Year
                </label>
                <input
                  type="number"
                  value={companyData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Company Description
                </label>
                <textarea
                  value={companyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all resize-none ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="Describe your company, mission, and what you do..."
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Address
                </label>
                <textarea
                  value={companyData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all resize-none ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="Company address"
                />
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className={`rounded-2xl p-6 glass-card ${darkMode ? 'bg-black/50 border-cyan-500/20' : 'bg-white/70 border-cyan-400/20 shadow-sm shadow-cyan-400/5'}`}>
            <div className="flex items-center gap-3 mb-6">
              <FaFileAlt className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold font-display cyan-gradient-text">Legal Documents</h2>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                isVerified
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {isVerified ? 'Verified' : 'Required'}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Business Registration Number {!companyData.companyName.trim() ? '(optional)' : '(optional - provides validity)'}
                </label>
                <input
                  type="text"
                  value={companyData.businessRegistrationNo}
                  onChange={(e) => handleInputChange('businessRegistrationNo', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="Enter your business registration number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Tax ID {!companyData.companyName.trim() ? '(optional)' : '(optional - provides validity)'}
                </label>
                <input
                  type="text"
                  value={companyData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.04] border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-400 focus:bg-white/[0.08]'
                      : 'bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  style={{ boxShadow: darkMode ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                  placeholder="Enter your tax identification number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 font-body ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Trade License (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all glass-card ${
                      tradeLicense
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : darkMode
                        ? 'border-cyan-500/20 hover:border-emerald-500/40 bg-white/[0.02]'
                        : 'border-cyan-400/20 hover:border-emerald-500/40 bg-white/60'
                    }`}
                    onClick={handleTradeLicenseClick}>
                      {tradeLicense ? (
                        <div className="text-center">
                          <FaCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-medium font-body text-emerald-500">Trade License Uploaded</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FaUpload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                          <p className={`text-sm font-body ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click to upload trade license
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={tradeLicenseRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleTradeLicenseChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className={`text-xs mt-2 font-body ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Upload a clear image or PDF of your business trade license. Optional for basic validity, required for full verification.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {isVerified && (
            <div className={`rounded-2xl p-6 glass-card ${darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-400/30 shadow-sm shadow-emerald-400/5'}`}>
              <div className="flex items-center gap-3">
                <FaCheckCircle className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="font-bold font-display text-emerald-500">Company Verified</h3>
                  <p className="text-sm font-body text-emerald-500/80">
                    Your company has been successfully verified. You can now post jobs and hire freelancers on the platform.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <motion.button
              onClick={handleSave}
              className="px-8 py-3 rounded-xl font-bold font-body bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSave className="w-4 h-4" />
              <span>Save Company Profile</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
