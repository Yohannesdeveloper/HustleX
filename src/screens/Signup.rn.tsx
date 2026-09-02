import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useAppSelector } from "../store/hooks";
import apiService from "../services/api-react-native";

const Signup: React.FC = () => {
  const navigation = useNavigation();
  const { register, login, addRole, switchRole, isAuthenticated, user } = useAuth();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client" | "admin">("freelancer");
  const [step, setStep] = useState<"auth" | "role">("auth");
  const [authUserData, setAuthUserData] = useState<any>(null);
  const pendingRoleSelection = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !pendingRoleSelection.current) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainSwipeableTabs" as never }],
      });
    }
  }, [isAuthenticated, navigation]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const emailCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailInputRef = useRef<TextInput>(null);

  const checkExistingUser = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setExistingUser(null);
      return;
    }
    setCheckingUser(true);
    setError(null);
    try {
      const result = await apiService.checkUser(emailToCheck);
      if (result && result.user) {
        setExistingUser(result.user);
        setIsLogin(true);
      } else {
        setExistingUser(null);
      }
    } catch (err: any) {
      setExistingUser(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setExistingUser(null);
    setShowLoginForm(false);
    setSelectedRoleForLogin(null);
    setPassword("");
    setError(null);
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    emailCheckTimeoutRef.current = setTimeout(() => {
      const normalizedEmail = text.toLowerCase().replace(/\s/g, "");
      if (normalizedEmail === "hustlexet@gmail.com") {
        setRole("admin");
      } else if (role === "admin") {
        setRole("freelancer");
      }
      if (text.includes("@") && text.length > 5) {
        checkExistingUser(text);
      }
    }, 1000);
  };

  const handleAccountSelection = async (selectedRole: string) => {
    setSelectedRoleForLogin(selectedRole);
    setShowLoginForm(true);
    setError(null);
  };

  const handleAddRole = async (newRole: 'freelancer' | 'client') => {
    setSelectedRoleForLogin(newRole);
    setRole(newRole);
    setShowLoginForm(false);
    setError(null);
  };

  const navigateAfterAuth = (userRole: string, fromUser?: any) => {
    const authUser = fromUser || user;
    const hasFreelancerProfile = authUser?.profile?.firstName && authUser?.profile?.bio;
    const hasCompanyProfile = authUser?.hasCompanyProfile;

    if (userRole === "freelancer") {
      if (hasFreelancerProfile) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainSwipeableTabs" as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "FreelancerProfileSetup" as never }],
        });
      }
    } else if (userRole === "client") {
      if (hasCompanyProfile) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainSwipeableTabs" as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "CompanyProfile" as never }],
        });
      }
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainSwipeableTabs" as never }],
      });
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    pendingRoleSelection.current = true;
    try {
      const loggedInUser = await login(email, password);
      setAuthUserData(loggedInUser);
      setStep("role");
    } catch (err: any) {
      pendingRoleSelection.current = false;
      let errorMessage = "Invalid email or password. Please try again.";
      if (err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('Network Error') ||
        err?.code === 'ERR_NETWORK' ||
        err?.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 5000.";
      } else if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one letter and one number");
      return;
    }
    if (!firstName || !lastName) {
      setError("Please enter your name.");
      return;
    }
    setIsLoading(true);
    pendingRoleSelection.current = true;
    try {
      const userData = await register({
        email,
        password,
        role,
        firstName,
        lastName,
      });
      setAuthUserData(userData);
      setStep("role");
    } catch (err: any) {
      pendingRoleSelection.current = false;
      let errorMessage = "Failed to create account. Please try again.";
      if (err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('Network Error') ||
        err?.code === 'ERR_NETWORK' ||
        err?.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 5000.";
      } else if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.response?.status === 429) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (err?.errorData?.errors && Array.isArray(err.errorData.errors)) {
          errorMessage = err.errorData.errors.map((e: any) => e.msg).join('; ');
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.errorData?.message) {
          errorMessage = err.errorData.message;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.error?.message) {
          errorMessage = err.error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole: "freelancer" | "client") => {
    setRole(selectedRole);
    pendingRoleSelection.current = false;
    const currentUser = authUserData || user;
    const hasRole = currentUser?.roles?.includes(selectedRole);
    try {
      let finalUser = currentUser;
      if (!hasRole) {
        finalUser = await addRole(selectedRole);
      } else if (currentUser?.currentRole !== selectedRole) {
        finalUser = await switchRole(selectedRole);
      }
      navigateAfterAuth(selectedRole, finalUser);
    } catch {
      navigateAfterAuth(selectedRole, currentUser);
    }
  };

  const s = makeStyles(darkMode);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={[s.gradientHeader, { backgroundColor: '#0f172a' }]}>
          <View style={s.headerContent}>
            <View style={s.logoContainer}>
              <Text style={s.logoText}>H</Text>
            </View>
            <Text style={s.appName}>HustleX</Text>
            <Text style={s.tagline}>
              Premium Freelance Marketplace
            </Text>
          </View>
        </View>

        {step === "auth" ? renderForm() : renderRoleSelection()}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  function renderRoleSelection() {
    return (
      <View style={s.card}>
        <Text style={s.roleSelectionTitle}>Choose Your Role</Text>
        <Text style={s.roleSelectionSubtitle}>
          How do you want to use HustleX?
        </Text>

        <View style={s.roleCards}>
          <TouchableOpacity
            style={[s.roleCard, s.roleCardActive]}
            onPress={() => handleRoleSelect("freelancer")}
            activeOpacity={0.7}
          >
            <View style={[s.roleIconContainer, s.roleIconFreelancer]}>
              <Ionicons name="briefcase" size={26} color="#06b6d4" />
            </View>
            <View style={s.roleInfo}>
              <Text style={s.roleName}>Find Work</Text>
              <Text style={s.roleDescription}>
                Showcase your skills and get hired by top clients
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#06b6d4" style={s.roleArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.roleCard, s.roleCardActive]}
            onPress={() => handleRoleSelect("client")}
            activeOpacity={0.7}
          >
            <View style={[s.roleIconContainer, s.roleIconClient]}>
              <Ionicons name="business" size={26} color="#a855f7" />
            </View>
            <View style={s.roleInfo}>
              <Text style={s.roleName}>Hire Freelancers</Text>
              <Text style={s.roleDescription}>
                Find and hire top talent for your projects
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a855f7" style={s.roleArrow} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderForm() {
    return (
      <View style={s.card}>
          <Text style={s.formTitle}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={s.formSubtitle}>
            {isLogin ? "Sign in to continue to your account" : "Fill in your details to get started"}
          </Text>

          {existingUser && !showLoginForm && (
            <View style={s.existingAccountInfo}>
              <Text style={s.existingAccountText}>
                An account with this email already exists. Please sign in.
              </Text>
            </View>
          )}

          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Email Address</Text>
            <View style={[s.inputWrapper]}>
              <Ionicons name="mail-outline" size={18} color={darkMode ? '#64748b' : '#94a3b8'} style={s.inputIcon} />
              <TextInput
                ref={emailInputRef}
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={true}
              />
              {checkingUser && (
                <ActivityIndicator size="small" color="#06b6d4" style={{ paddingRight: 14 }} />
              )}
            </View>
          </View>

          {!isLogin && (
            <View style={s.inputRow}>
              <View style={[s.inputHalf, s.inputContainer]}>
                <Text style={s.inputLabel}>First Name</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={darkMode ? '#64748b' : '#94a3b8'} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="John"
                    placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <View style={[s.inputHalf, s.inputContainer]}>
                <Text style={s.inputLabel}>Last Name</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={darkMode ? '#64748b' : '#94a3b8'} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="Doe"
                    placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>
          )}

          <View style={s.inputContainer}>
            <Text style={s.inputLabel}>Password</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={darkMode ? '#64748b' : '#94a3b8'} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={s.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={darkMode ? '#64748b' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && !selectedRoleForLogin && (
            <View style={s.inputContainer}>
              <Text style={s.inputLabel}>Confirm Password</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={darkMode ? '#64748b' : '#94a3b8'} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Repeat your password"
                  placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={s.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={darkMode ? '#64748b' : '#94a3b8'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isLogin && (
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
              <Text style={s.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {error && (
            <View style={s.errorContainer}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.submitButton, isLoading && s.submitButtonDisabled]}
            onPress={isLogin ? handleLogin : handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={s.submitButtonText}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={s.footerText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(null); setPassword(""); setConfirmPassword(""); }}>
              <Text style={s.footerLink}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }
};

const makeStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#0a0a0f' : '#f8fafc',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: darkMode ? 'rgba(30, 30, 50, 0.8)' : '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  roleSelectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: darkMode ? '#ffffff' : '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleSelectionSubtitle: {
    fontSize: 14,
    color: darkMode ? '#94a3b8' : '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  roleCards: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
  },
  roleCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: darkMode ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.05)',
  },
  roleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleIconFreelancer: {
    backgroundColor: 'rgba(6,182,212,0.15)',
  },
  roleIconClient: {
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    color: darkMode ? '#ffffff' : '#0f172a',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 13,
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  roleArrow: {
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 15,
    color: '#06b6d4',
    fontWeight: '600',
    marginLeft: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: darkMode ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: darkMode ? '#94a3b8' : '#64748b',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: darkMode ? '#cbd5e1' : '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 15,
    color: darkMode ? '#ffffff' : '#0f172a',
  },
  passwordToggle: {
    paddingRight: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#06b6d4',
  },
  checkboxLabel: {
    fontSize: 13,
    color: darkMode ? '#94a3b8' : '#64748b',
    flex: 1,
  },
  termsLink: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: darkMode ? '#64748b' : '#94a3b8',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: darkMode ? '#ffffff' : '#0f172a',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: darkMode ? '#94a3b8' : '#64748b',
  },
  footerLink: {
    fontSize: 14,
    color: '#06b6d4',
    fontWeight: '600',
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: darkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
  forgotPasswordLink: {
    textAlign: 'right',
    fontSize: 13,
    color: '#06b6d4',
    fontWeight: '600',
    marginBottom: 16,
    marginTop: -8,
  },
  existingAccountInfo: {
    backgroundColor: darkMode ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkMode ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.1)',
  },
  existingAccountText: {
    fontSize: 13,
    color: '#06b6d4',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Signup;
