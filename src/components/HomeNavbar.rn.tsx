/**
 * React Native Version of HomeNavbar
 * This is a complete conversion example showing the pattern
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  Pressable
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { store } from "../store/index-react-native";
import { toggleTheme } from "../store/themeSlice";
import { setLanguage, type Language } from "../store/languageSlice";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface HomeNavbarProps {
  hideLinks?: boolean;
  transparent?: boolean;
}

const HomeNavbar: React.FC<HomeNavbarProps> = ({ hideLinks = false, transparent = false }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const language = useAppSelector((s) => s.language.language);
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [dotsMenuOpen, setDotsMenuOpen] = useState(false);
  const languageMenuRef = useRef<View>(null);
  const dotsMenuRef = useRef<View>(null);
  const { logout, switchRole } = useAuth();

  const userRole = user?.role || "guest";

  // Close language menu when clicking outside (for web)
  useEffect(() => {
    if (!languageMenuOpen || Platform.OS !== 'web') return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const isLanguageButton = target.closest('[data-language-button]');
      const isLanguageMenu = target.closest('[data-language-menu]');

      const languageContainer = languageMenuRef.current;
      if (languageContainer && Platform.OS === 'web') {
        const containerElement = (languageContainer as any)._nativeNode || languageContainer;
        if (containerElement && containerElement.contains && containerElement.contains(target)) {
          return;
        }
      }

      if (!isLanguageButton && !isLanguageMenu) {
        setLanguageMenuOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageMenuOpen]);

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "am", name: "አማርኛ", nativeName: "አማርኛ" },
    { code: "ti", name: "ትግርኛ", nativeName: "ትግርኛ" },
    { code: "om", name: "Afaan Oromoo", nativeName: "Afaan Oromoo" },
  ];

  const currentLanguage = React.useMemo(() => {
    const found = languages.find((lang) => lang.code === language);
    return found || languages[0];
  }, [language]);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (lang: Language) => {
    if (lang === language) {
      setLanguageMenuOpen(false);
      return;
    }

    try {
      dispatch(setLanguage(lang));
      setTimeout(() => {
        setLanguageMenuOpen(false);
      }, 150);
    } catch (error) {
      console.error('Error in handleLanguageChange:', error);
    }
  };

  const navigate = (route: string) => {
    if (route === "HomeFinal") {
      // Reset to main tab navigator
      navigation.reset({
        index: 0,
        routes: [{ name: "MainSwipeableTabs" as never }],
      });
    } else {
      navigation.navigate(route as never);
    }
    setMenuOpen(false);
    setDotsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDotsMenuOpen(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "MainSwipeableTabs" as never }],
    });
  };

  const handleSwitchRoleAction = async (newRole: "freelancer" | "client") => {
    try {
      await switchRole(newRole);
      setDotsMenuOpen(false);
      const targetDashboard = newRole === "client" ? "HiringDashboard" : "FreelancingDashboard";
      navigation.navigate(targetDashboard as never);
    } catch (error) {
      console.error("Error switching role:", error);
    }
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: transparent ? 'transparent' : (darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
      borderBottomWidth: transparent ? 0 : 1,
      borderBottomColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      ...Platform.select({
        web: {
          zIndex: 100,
          overflow: 'visible',
        },
      }),
    },
    content: {
      maxWidth: 1280,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'center',
      ...Platform.select({
        web: {
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          flexWrap: 'nowrap',
        },
      }),
    },
    logo: {
      fontSize: Math.max(Platform.OS === 'web' ? 24 : 20, 14),
      fontWeight: '800',
      letterSpacing: Platform.OS === 'android' ? 0 : -0.5,
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
    },
    logoText: {
      color: darkMode ? '#ffffff' : '#000000',
    },
    logoX: {
      color: '#06b6d4',
    },
    navLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      justifyContent: 'center',
      flexShrink: 1,
      ...Platform.select({
        web: {
          overflow: 'visible',
          display: 'flex',
          visibility: 'visible',
          opacity: 1,
          minWidth: 400,
        },
      }),
    },
    navLink: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    },
    navLinkText: {
      fontSize: 12,
      color: darkMode ? '#ffffff' : '#000000',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
    },
    menuButton: {
      padding: 8,
    },
    mobileMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: darkMode ? '#000000' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
      padding: 16,
      zIndex: 1000,
    },
    menuItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    menuItemText: {
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#000000',
    },
    languageContainer: {
      position: 'relative',
      zIndex: 1000,
    },
    languageMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 8,
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: 8,
      padding: 8,
      minWidth: 150,
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      ...Platform.select({
        web: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10001,
        },
        default: {
          elevation: 10,
        },
      }),
    },
    languageOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    languageOptionText: {
      fontSize: 14,
      color: darkMode ? '#ffffff' : '#000000',
    },
    activeLanguage: {
      backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
    },
    dotsMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 8,
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 8,
      minWidth: 180,
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zIndex: 10002,
      ...Platform.select({
        web: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        default: {
          elevation: 10,
        },
      }),
    },
    dotsMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 12,
    },
    dotsMenuItemText: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#1f2937',
    },
    logoutItem: {
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      paddingTop: 12,
    },
    logoutText: {
      color: '#ef4444',
    },
    authButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginLeft: 8,
    },
    loginButton: {
      backgroundColor: '#06b6d4',
    },
    signupButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#06b6d4',
    },
    authButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    signupButtonText: {
      color: '#06b6d4',
    },
  });

  const navLinks = React.useMemo(() => [
    { to: "HomeFinal", label: t.nav.home },
    { to: "AboutUs", label: t.nav.aboutUs },
    { to: "HowItWorks", label: t.nav.howItWorks },
    { to: "JobListings", label: t.nav.exploreJobs },
    { to: "Pricing", label: t.nav.pricing },
    { to: "Blog", label: t.nav.blog },
    { to: "FAQ", label: t.nav.faq },
    { to: "ContactUs", label: t.nav.contact },
  ], [t, language]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.content}>
        <AnimatedTouchable
          style={[styles.logo, animatedStyle]}
          onPress={() => navigate("HomeFinal")}
        >
          <Text style={styles.logoText}>Hustle</Text>
          <Text style={styles.logoX}>X</Text>
        </AnimatedTouchable>

        {Platform.OS === 'web' && !hideLinks && (
          <View style={styles.navLinks}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.to}
                style={styles.navLink}
                onPress={() => navigate(link.to)}
              >
                <Text style={styles.navLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.rightSection}>
          <View style={styles.languageContainer} ref={languageMenuRef}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setLanguageMenuOpen(!languageMenuOpen)}
            >
              <Ionicons
                name="language"
                size={20}
                color={darkMode ? '#ffffff' : '#000000'}
              />
            </TouchableOpacity>
            {languageMenuOpen && (
              <View style={styles.languageMenu}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.languageOption, currentLanguage.code === lang.code && styles.activeLanguage]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={styles.languageOptionText}>
                      {lang.nativeName}
                      {currentLanguage.code === lang.code && ' ✓'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.languageContainer} ref={dotsMenuRef}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setDotsMenuOpen(!dotsMenuOpen)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={darkMode ? '#ffffff' : '#000000'}
              />
            </TouchableOpacity>

            {dotsMenuOpen && (
              <View style={styles.dotsMenu}>
                <TouchableOpacity style={styles.dotsMenuItem} onPress={toggleDarkMode}>
                  <Ionicons name={darkMode ? "sunny" : "moon"} size={20} color={darkMode ? "#fbbf24" : "#4b5563"} />
                  <Text style={styles.dotsMenuItemText}>{darkMode ? "Light Mode" : "Dark Mode"}</Text>
                </TouchableOpacity>

                {isAuthenticated && (
                  <>
                    <TouchableOpacity style={styles.dotsMenuItem} onPress={() => navigate(user?.currentRole === "client" ? "HiringDashboard" : "FreelancingDashboard")}>
                      <Ionicons name="grid" size={20} color="#06b6d4" />
                      <Text style={styles.dotsMenuItemText}>Dashboard</Text>
                    </TouchableOpacity>
                    {user?.roles && user.roles.length > 1 && (
                      <TouchableOpacity
                        style={styles.dotsMenuItem}
                        onPress={() => handleSwitchRoleAction(user.currentRole === "client" ? "freelancer" : "client")}
                      >
                        <Ionicons name="swap-horizontal" size={20} color="#f59e0b" />
                        <Text style={styles.dotsMenuItemText}>
                          Switch to {user.currentRole === "client" ? "Freelancer" : "Client"}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {(user?.roles?.includes('admin') || user?.email?.toLowerCase() === 'hustlexet@gmail.com') && (
                      <>
                        <TouchableOpacity style={styles.dotsMenuItem} onPress={() => navigate("SubscriptionAdmin")}>
                          <Ionicons name="card" size={20} color="#a855f7" />
                          <Text style={styles.dotsMenuItemText}>Subscriptions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dotsMenuItem} onPress={() => navigate("JobAdmin")}>
                          <Ionicons name="briefcase" size={20} color="#06b6d4" />
                          <Text style={styles.dotsMenuItemText}>Job Admin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dotsMenuItem} onPress={() => navigate("BlogAdmin")}>
                          <Ionicons name="reader" size={20} color="#f59e0b" />
                          <Text style={styles.dotsMenuItemText}>Blog Admin</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity style={[styles.dotsMenuItem, styles.logoutItem]} onPress={handleLogout}>
                      <Ionicons name="log-out" size={20} color="#ef4444" />
                      <Text style={[styles.dotsMenuItemText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <TouchableOpacity style={styles.dotsMenuItem} onPress={() => navigate("Signup")}>
                      <Ionicons name="person-add" size={20} color="#06b6d4" />
                      <Text style={styles.dotsMenuItemText}>{t.nav.signUp}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {Platform.OS === 'web' && !isAuthenticated && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.authButton, styles.loginButton]} onPress={() => navigate("Signup")}>
                <Text style={styles.authButtonText}>{t.nav.logIn}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.authButton, styles.signupButton]} onPress={() => navigate("Signup")}>
                <Text style={[styles.authButtonText, styles.signupButtonText]}>{t.nav.signUp}</Text>
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS !== 'web' && !hideLinks && (
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
              <Ionicons name={menuOpen ? "close" : "menu"} size={24} color={darkMode ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {menuOpen && Platform.OS !== 'web' && !hideLinks && (
        <ScrollView style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <TouchableOpacity key={link.to} style={styles.menuItem} onPress={() => navigate(link.to)}>
              <Text style={styles.menuItemText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
          {isAuthenticated ? (
            <TouchableOpacity style={styles.menuItem} onPress={() => navigate(userRole === "client" ? "HiringDashboard" : "FreelancingDashboard")}>
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Signup")}>
                <Text style={styles.menuItemText}>{t.nav.signUp} / {t.nav.logIn}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default HomeNavbar;
