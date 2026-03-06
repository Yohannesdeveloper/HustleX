import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUser, FaCamera, FaCrown, FaBriefcase, FaUserTie } from 'react-icons/fa';
import { RootState } from '../store';
import apiService from '../services/api';
import { useAuth } from '../store/hooks';

const AccountSettings: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'freelancer',
    location: '',
    linkedin: '',
    github: '',
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFile(file);
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortfolioUrl(e.target.value);
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location'];
    for (const field of requiredFields) {
      if (!settings[field as keyof typeof settings]?.trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    if (!profilePictureFile) {
      setError('Profile picture is required');
      return false;
    }
    if (!cvFile) {
      setError('CV is required');
      return false;
    }
    if (!portfolioUrl.trim()) {
      setError('Portfolio URL is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Ensure role
      const desiredRole = settings.status === 'freelancer' ? 'freelancer' : settings.status === 'client' ? 'client' : null;
      if (desiredRole && user && !user.roles.includes(desiredRole as any)) {
        await apiService.addRole(desiredRole as 'freelancer' | 'client');
      }

      // Upload files
      let avatarUrl: string | undefined = undefined;
      let cvUrl: string | undefined = undefined;
      let portfolioUrl: string | undefined = undefined;

      if (profilePictureFile) {
        const up = await apiService.uploadAvatar(profilePictureFile);
        avatarUrl = up.fileUrl;
      }
      if (cvFile) {
        const up = await apiService.uploadCV(cvFile);
        cvUrl = up.fileUrl;
      }
      // Portfolio is now a URL, no file upload needed

      // Save profile
      await apiService.updateMyProfile({
        firstName: settings.firstName,
        lastName: settings.lastName,
        phone: settings.phone,
        location: settings.location,
        linkedin: settings.linkedin || undefined,
        github: settings.github || undefined,
        portfolio: portfolioUrl,
        avatar: avatarUrl,
      });

      setSuccess('Settings saved successfully! You are now registered as a freelancer.');
      // Navigate to job listings after successful registration
      setTimeout(() => {
        navigate('/job-listings');
      }, 2000);
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'freelancer', label: 'Freelancer', icon: <FaBriefcase className="w-4 h-4" />, description: 'Offer your skills and services' },
    { value: 'client', label: 'Client', icon: <FaUserTie className="w-4 h-4" />, description: 'Hire talented freelancers' },
  ];

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
            <h1 className="text-2xl font-bold">Account Settings</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Picture */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaCamera className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h2 className="text-xl font-semibold">Profile Picture *</h2>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                    darkMode
                      ? 'border-gray-600 hover:border-purple-500 bg-gray-700'
                      : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                  }`}
                  onClick={handleProfilePictureClick}
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <motion.button
                  className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white shadow-lg`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleProfilePictureClick}
                >
                  <FaCamera className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="flex-1">
                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Profile Picture
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose a photo that represents you. Recommended size: 400x400px
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  required
                />
                <motion.button
                  onClick={handleProfilePictureClick}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Image
                </motion.button>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Upload CV (PDF/DOC) *
                    </label>
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Portfolio URL *
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={handlePortfolioChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="https://yourportfolio.com or https://behance.net/yourprofile"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaUser className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={settings.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={settings.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location *
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="City, Country"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={settings.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  GitHub
                </label>
                <input
                  type="url"
                  value={settings.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className={`rounded-lg border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-6">
              <FaCrown className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h2 className="text-xl font-semibold">Account Status</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Your Status *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statusOptions.map((status) => (
                    <motion.div
                      key={status.value}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.status === status.value
                          ? darkMode
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-blue-500 bg-blue-50'
                          : darkMode
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                      onClick={() => handleInputChange('status', status.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {settings.status === status.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}

                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          settings.status === status.value
                            ? 'bg-blue-500 text-white'
                            : darkMode
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {status.icon}
                        </div>
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {status.label}
                        </h3>
                      </div>

                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {status.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <motion.button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
            >
              <FaSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Complete Registration'}</span>
            </motion.button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
