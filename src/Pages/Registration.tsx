import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaGlobe, FaCity, FaVenusMars, FaCheck, FaPhone } from "react-icons/fa";
import { useAppDispatch } from "../store/hooks";
import { register as registerUser, setUser } from "../store/authSlice";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import { isFreelancerProfileComplete } from "../utils/activeRole";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bangladesh", "Belarus", "Belgium", "Brazil",
  "Bulgaria", "Cambodia", "Canada", "Chile", "China", "Colombia", "Croatia",
  "Cuba", "Czech Republic", "Denmark", "Ecuador", "Egypt", "Estonia",
  "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kuwait", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Malaysia", "Mexico", "Morocco", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia",
  "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Tanzania", "Thailand", "Tunisia",
  "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uzbekistan", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const GENDERS = ["Male", "Female", "Prefer not to say"];

// Major cities grouped by country
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Ethiopia: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Adama"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg"],
  India: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf"],
  France: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  Nigeria: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
  Egypt: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"],
  China: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
  Turkey: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
};

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPhonePermission, setShowPhonePermission] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [telegramLoginStatus, setTelegramLoginStatus] = useState<'idle' | 'checking' | 'logging-in' | 'failed' | 'done'>('idle');
  const telegramLoginAttempted = useRef(false);
  const telegramLoginPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableCities = CITIES_BY_COUNTRY[country] || [];

  // Get redirect parameter from URL, fallback to sessionStorage
  const urlRedirect = searchParams.get('redirect');
  const redirectParam = urlRedirect || sessionStorage.getItem('pendingJobRedirect');
  const DEFAULT_REDIRECT = "/freelancer-profile-setup";

  // Reset body background from ApplyRedirect's navy (#17212b) to dark gray
  useEffect(() => {
    document.body.style.backgroundColor = '#111827';
    document.documentElement.style.backgroundColor = '#111827';
  }, []);

  // If already authenticated (e.g. after a page refresh), skip registration.
  // Don't redirect if the user just registered (success=true) so they see the
  // success message and phone permission step.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) return;
    if (success) return;
    if (showPhonePermission) return; // Also don't redirect if showing phone step

    if (redirectParam) {
      if (isFreelancerProfileComplete(user)) {
        sessionStorage.removeItem('pendingJobRedirect');
        navigate(redirectParam, { replace: true });
      } else {
        const url = `/freelancer-profile-setup?redirect=${encodeURIComponent(redirectParam)}`;
        navigate(url, { replace: true });
      }
    } else {
      navigate(isFreelancerProfileComplete(user) ? "/dashboard/freelancer" : DEFAULT_REDIRECT, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, success, redirectParam, navigate, showPhonePermission]);

  // Retry Telegram login when not authenticated but initData is available
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) return;
    if (telegramLoginAttempted.current) return;

    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      setTelegramLoginStatus(tg ? 'failed' : 'idle');
      return;
    }

    setTelegramLoginStatus('logging-in');
    telegramLoginAttempted.current = true;

    apiService.telegramLogin({ initData: tg.initData }).then((result: any) => {
      if (result.token) {
        setTelegramLoginStatus('done');
        if (result.user) dispatch(setUser(result.user as any));
      } else if (result.loginRequestId) {
        setTelegramLoginStatus('checking');
        const pollTimeout = setTimeout(() => {
          if (telegramLoginPollRef.current) clearInterval(telegramLoginPollRef.current);
          setTelegramLoginStatus('failed');
        }, 15000);
        telegramLoginPollRef.current = setInterval(async () => {
          try {
            const poll: any = await apiService.telegramLoginStatus(result.loginRequestId);
            if (poll.status === 'confirmed' && poll.token) {
              if (telegramLoginPollRef.current) clearInterval(telegramLoginPollRef.current);
              clearTimeout(pollTimeout);
              setTelegramLoginStatus('done');
              if (poll.user) dispatch(setUser(poll.user as any));
            } else if (poll.status === 'declined' || poll.status === 'expired') {
              if (telegramLoginPollRef.current) clearInterval(telegramLoginPollRef.current);
              clearTimeout(pollTimeout);
              setTelegramLoginStatus('failed');
            }
          } catch {
            if (telegramLoginPollRef.current) clearInterval(telegramLoginPollRef.current);
            clearTimeout(pollTimeout);
            setTelegramLoginStatus('failed');
          }
        }, 2000);
      } else {
        setTelegramLoginStatus('failed');
      }
    }).catch(() => {
      setTelegramLoginStatus('failed');
    });
  }, [authLoading, isAuthenticated]);

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => {
      if (telegramLoginPollRef.current) clearInterval(telegramLoginPollRef.current);
    };
  }, []);

  // Pre-fill form from Telegram user data (set by ApplyRedirect)
  useEffect(() => {
    const stored = sessionStorage.getItem('telegramUser');
    if (!stored) return;
    try {
      const tgUser = JSON.parse(stored);
      if (tgUser.first_name) setFirstName(tgUser.first_name);
      if (tgUser.last_name) setLastName(tgUser.last_name);
    } catch { /* ignore */ }
  }, []);

  // Auto-advance to phone permission step after registration success
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      setShowPhonePermission(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [success]);

  // ── All hooks are above this line. Early returns below are safe. ──

  // Show loading while checking auth (prevents flash of registration form for returning users)
  if (authLoading && redirectParam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking your account...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) return setError("Email is required.");
    if (!firstName.trim()) return setError("First name is required.");
    if (!lastName.trim()) return setError("Last name is required.");
    if (!dateOfBirth) return setError("Date of birth is required.");
    if (!gender) return setError("Please select a gender.");
    if (!country) return setError("Please select a country.");
    if (!city) return setError("Please select a city.");
    if (!agreedToTerms) return setError("You must agree to the Terms of Service to register.");

    // Age check (must be at least 13)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 13) return setError("You must be at least 13 years old to register.");

    setIsLoading(true);
    // Optimistically set success BEFORE the await so the auth-redirect
    // useEffect sees `success=true` when the Redux store updates
    // isAuthenticated (preventing a premature redirect away from the
    // phone-permission step).
    setSuccess(true);
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const telegram = tgUser?.id ? {
        id: tgUser.id,
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        photoUrl: tgUser.photo_url,
      } : undefined;

      const result = await dispatch(registerUser({
        email,
        role: "freelancer",
        firstName,
        lastName,
        dateOfBirth,
        gender,
        country,
        city,
        telegram,
      })).unwrap();

      console.log("Registration successful:", result);
    } catch (err: any) {
      // err may be a plain string from rejectWithValue, or an Error object
      const msg = typeof err === 'string' ? err : (err?.message || 'Registration failed. Please try again.');
      setSuccess(false);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    if (showPhonePermission) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#111827' }}>
          <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaPhone className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Share Your Phone Number?</h2>
            <p className="text-gray-400 mb-6">
              Allow us to access your phone number for better communication with clients.
            </p>

            {phoneLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching phone number...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setPhoneLoading(true);
                  const normalize = (p: string) => p.replace(/\D/g, '');
                  const tg = window.Telegram?.WebApp;

                  try {
                    let phone = '';

                    // 1) First try initDataUnsafe.user.phone_number (instant, no dialog)
                    if (tg?.initDataUnsafe?.user?.phone_number) {
                      phone = tg.initDataUnsafe.user.phone_number;
                    }

                    // 2) Try Telegram native requestPhoneNumber API with 15s timeout
                    if (!phone && tg?.requestPhoneNumber) {
                      const result = await Promise.race([
                        new Promise<any>((resolve) => {
                          tg!.requestPhoneNumber!(
                            (r) => resolve(r),
                            () => resolve(null)
                          );
                        }),
                        new Promise<any>((resolve) => setTimeout(() => resolve({ status: 'timeout' }), 15000)),
                      ]);
                      if (result?.phone_number) {
                        phone = result.phone_number;
                      }
                    }

                    // 3) If still empty, try parsing the raw initData string
                    if (!phone && tg?.initData) {
                      const params = new URLSearchParams(tg.initData);
                      const userStr = params.get('user');
                      if (userStr) {
                        try {
                          const userData = JSON.parse(decodeURIComponent(userStr));
                          if (userData?.phone_number) phone = userData.phone_number;
                        } catch {}
                      }
                    }

                    // Save phone to backend if we got one
                    phone = normalize(phone);
                    if (phone) {
                      await apiService.savePhone(phone);
                    }
                  } catch (e) {
                    console.error("Phone fetch/save error:", e);
                  } finally {
                    setPhoneLoading(false);
                  }

                  // Always go to profile setup after phone sharing
                  sessionStorage.setItem('pendingJobRedirect', redirectParam || '');
                  // Pass redirect parameter to profile setup page
                  const profileSetupUrl = redirectParam
                    ? `${DEFAULT_REDIRECT}?redirect=${encodeURIComponent(redirectParam)}`
                    : DEFAULT_REDIRECT;
                  navigate(profileSetupUrl, { replace: true });
                }}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
              >
                Share Phone Number
              </button>
              <button
                onClick={() => {
                  // Even if cancel, go to profile setup
                  sessionStorage.setItem('pendingJobRedirect', redirectParam || '');
                  const profileSetupUrl = redirectParam
                    ? `${DEFAULT_REDIRECT}?redirect=${encodeURIComponent(redirectParam)}`
                    : DEFAULT_REDIRECT;
                  navigate(profileSetupUrl, { replace: true });
                }}
                className="w-full py-3 px-6 rounded-xl bg-white/10 text-gray-300 font-semibold hover:bg-white/20 transition-all border border-white/10"
              >
                Skip for Now
              </button>
            </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4 overflow-y-auto" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-400 mb-6">
            Welcome, <span className="text-cyan-400 font-semibold">{firstName}</span>! Your account has been created.
          </p>

          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to phone permission...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-y-auto" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-400 mt-2">Fill in your details to get started</p>
          </div>

          {/* Telegram login status */}
          {telegramLoginStatus === 'logging-in' && (
            <div className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm text-center">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2 align-middle"></span>
              Logging in with Telegram...
            </div>
          )}
          {telegramLoginStatus === 'failed' && (
            <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm text-center">
              Telegram login unavailable — please fill in the form
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date of Birth</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
              <div className="relative">
                <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <option value="" disabled className="bg-gray-900 text-gray-400">
                    Select gender
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g} className="bg-gray-900 text-white">
                      {g}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Country</label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity(""); // reset city when country changes
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
                >
                  <option value="" disabled className="bg-gray-900 text-gray-400">
                    Select country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-gray-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
              <div className="relative">
                <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                {availableCities.length > 0 ? (
                  <>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-gray-900 text-gray-400">
                        Select city
                      </option>
                      {availableCities.map((c) => (
                        <option key={c} value={c} className="bg-gray-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={country ? "Enter your city" : "Select a country first"}
                    disabled={!country}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                )}
              </div>
              {country && availableCities.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No preset cities — type yours manually.</p>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <div className="flex items-start gap-3 mt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreedToTerms}
                onClick={() => setAgreedToTerms((prev) => !prev)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  agreedToTerms
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-500"
                    : "bg-white/5 border-white/30 hover:border-cyan-500/50"
                }`}
              >
                {agreedToTerms && <FaCheck className="text-white text-xs" />}
              </button>
              <span className="text-sm text-gray-400 leading-relaxed">
                I have read and agree to the{" "}
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Clear Auth Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors underline"
            >
              Clear saved data & start fresh
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
