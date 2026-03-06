import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBuilding, FaFileAlt, FaCamera, FaCheckCircle, FaUpload } from 'react-icons/fa';
import { RootState } from '../store';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';

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
    registrationNumber: '',
    taxId: '',
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tradeLicense, setTradeLicense] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

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
          registrationNumber: '',
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
      // Check if this is a private client (no company name) or company client
      const isPrivateClient = !companyData.companyName.trim();

      // Validation for required fields (everything except website, legal documents, and founded year)
      const requiredFields = [
        { field: 'industry', value: companyData.industry, label: 'Industry' },
        { field: 'companySize', value: companyData.companySize, label: 'Company Size' },
        { field: 'phone', value: companyData.phone, label: 'Phone' },
        { field: 'email', value: companyData.email, label: 'Email' },
        { field: 'description', value: companyData.description, label: 'Company Description' },
        { field: 'address', value: companyData.address, label: 'Address' },
      ];

      // For company clients, company name is required, but legal documents are optional
      // (they can provide either business registration number OR tax ID to be considered valid)
      if (!isPrivateClient) {
        requiredFields.unshift({ field: 'companyName', value: companyData.companyName, label: 'Company Name' });

        // Legal documents are optional for companies - they can provide either registration number or tax ID
        const hasBusinessRegistration = companyData.registrationNumber.trim();
        const hasTaxId = companyData.taxId.trim();

        // If neither is provided, add a note but don't make them required
        if (!hasBusinessRegistration && !hasTaxId) {
          // Legal documents are optional - companies can proceed without them
          console.log('Company profile will be valid but not verified without legal documents');
        }
      }

      // Check for missing required fields
      const missingFields = requiredFields.filter(field => !field.value.trim());

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => field.label).join(', ');
        alert(`Please fill in all required fields: ${fieldNames}`);
        return;
      }

      // Additional validation for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Additional validation for phone number (basic check)
      if (companyData.phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
      }

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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold">Company Profile</h1>
            {isVerified && (
              <div className="flex items-center space-x-2 text-green-600">
                <FaCheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Verified Company</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Company Logo */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaCamera className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h2 className="text-xl font-semibold">Company Logo</h2>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-lg border-4 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                    darkMode
                      ? 'border-gray-600 hover:border-purple-500 bg-gray-700'
                      : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                  }`}
                  onClick={handleLogoClick}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt="Company Logo"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <FaBuilding className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <motion.button
                  className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white shadow-lg`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogoClick}
                >
                  <FaCamera className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="flex-1">
                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Company Logo
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Logo
                </motion.button>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaBuilding className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-semibold">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Name {!companyData.companyName.trim() ? '(optional for private clients)' : '(required for companies)'}
                  {!companyData.companyName.trim() && <span className="text-gray-400 text-xs ml-2">Private Client</span>}
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder={companyData.companyName.trim() ? "Enter your company name" : "Leave blank for private clients"}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Industry
                </label>
                <select
                  value={companyData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Size
                </label>
                <select
                  value={companyData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                >
                  <option value="">Select Company Size</option>
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
                  value={companyData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="+251 XXX XXX XXX"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="contact@yourcompany.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Founded Year
                </label>
                <input
                  type="number"
                  value={companyData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company Description
                </label>
                <textarea
                  value={companyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                  placeholder="Describe your company, mission, and what you do..."
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address
                </label>
                <textarea
                  value={companyData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                  placeholder="Company address"
                />
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaFileAlt className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className="text-xl font-semibold">Legal Documents</h2>
              <span className={`text-xs px-2 py-1 rounded ${
                isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {isVerified ? 'Verified Documents' : 'Required for Verification'}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Business Registration Number {!companyData.companyName.trim() ? '(optional)' : '(optional - provides validity)'}
                </label>
                <input
                  type="text"
                  value={companyData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your business registration number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tax ID {!companyData.companyName.trim() ? '(optional)' : '(optional - provides validity)'}
                </label>
                <input
                  type="text"
                  value={companyData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your tax identification number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trade License (optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      tradeLicense
                        ? 'border-green-500 bg-green-50'
                        : darkMode
                        ? 'border-gray-600 hover:border-green-500 bg-gray-700'
                        : 'border-gray-300 hover:border-green-500 bg-gray-50'
                    }`}
                    onClick={handleTradeLicenseClick}>
                      {tradeLicense ? (
                        <div className="text-center">
                          <FaCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-green-600 font-medium">Trade License Uploaded</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FaUpload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Upload a clear image or PDF of your business trade license. Optional for basic validity, required for full verification.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {isVerified && (
            <div className={`rounded-lg border p-6 ${darkMode ? 'bg-green-800 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                    Company Verified
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
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
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
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
