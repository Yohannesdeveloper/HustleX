/**
 * React Native HomeFinal Screen
 * Landing page with hero section, stats, features, and CTA
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch, useAuth } from '../store/hooks';
import { toggleTheme } from '../store/themeSlice';
import HomeNavbar from '../components/HomeNavbar.rn';
import BottomNav from '../components/BottomNav.rn';
import { useTranslation } from '../hooks/useTranslation';
import { RootStackParamList } from '../types';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect as SvgRect } from 'react-native-svg';

const howItWorksVideo = require('../Pages/videos/HowItWorks.mp4');
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const width = Math.max(screenWidth || 375, 375); // Ensure minimum width
const height = Math.max(screenHeight || 667, 667); // Ensure minimum height

const HomeFinal: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user, isAuthenticated } = useAuth();
  const t = useTranslation();
  const video = useRef(null);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      const targetScreen = user?.currentRole === 'client' ? 'HiringDashboard' : 'FreelancingDashboard';
      navigation.navigate(targetScreen as never);
    } else {
      navigation.navigate('Signup' as never);
    }
  };

  // Blob Animations
  const blob1X = useSharedValue(0);
  const blob1Y = useSharedValue(0);
  const blob1Scale = useSharedValue(1);

  const blob2X = useSharedValue(0);
  const blob2Y = useSharedValue(0);
  const blob2Scale = useSharedValue(1);

  const blob3X = useSharedValue(0);
  const blob3Y = useSharedValue(0);
  const blob3Scale = useSharedValue(1);

  useEffect(() => {
    blob1X.value = withRepeat(withSequence(withTiming(100, { duration: 20000 }), withTiming(-50, { duration: 20000 }), withTiming(0, { duration: 20000 })), -1, true);
    blob1Y.value = withRepeat(withSequence(withTiming(-80, { duration: 20000 }), withTiming(60, { duration: 20000 }), withTiming(0, { duration: 20000 })), -1, true);
    blob1Scale.value = withRepeat(withSequence(withTiming(1.2, { duration: 20000 }), withTiming(0.8, { duration: 20000 }), withTiming(1, { duration: 20000 })), -1, true);

    blob2X.value = withRepeat(withSequence(withTiming(-120, { duration: 25000 }), withTiming(80, { duration: 25000 }), withTiming(0, { duration: 25000 })), -1, true);
    blob2Y.value = withRepeat(withSequence(withTiming(100, { duration: 25000 }), withTiming(-40, { duration: 25000 }), withTiming(0, { duration: 25000 })), -1, true);
    blob2Scale.value = withRepeat(withSequence(withTiming(0.9, { duration: 25000 }), withTiming(1.3, { duration: 25000 }), withTiming(1, { duration: 25000 })), -1, true);

    blob3X.value = withRepeat(withSequence(withTiming(60, { duration: 18000 }), withTiming(-80, { duration: 18000 }), withTiming(0, { duration: 18000 })), -1, true);
    blob3Y.value = withRepeat(withSequence(withTiming(-60, { duration: 18000 }), withTiming(80, { duration: 18000 }), withTiming(0, { duration: 18000 })), -1, true);
    blob3Scale.value = withRepeat(withSequence(withTiming(1.4, { duration: 18000 }), withTiming(0.7, { duration: 18000 }), withTiming(1, { duration: 18000 })), -1, true);
  }, []);

  const blob1Style = useAnimatedStyle(() => ({ transform: [{ translateX: blob1X.value }, { translateY: blob1Y.value }, { scale: blob1Scale.value }] }));
  const blob2Style = useAnimatedStyle(() => ({ transform: [{ translateX: blob2X.value }, { translateY: blob2Y.value }, { scale: blob2Scale.value }] }));
  const blob3Style = useAnimatedStyle(() => ({ transform: [{ translateX: blob3X.value }, { translateY: blob3Y.value }, { scale: blob3Scale.value }] }));


  // Company logos from assets/logos folder - using require() for bundled assets
  const companyLogos = [
    { name: 'AAU', source: require('../assets/logos/AAU.png') },
    { name: 'Airlines', source: require('../assets/logos/Airlines.png') },
    { name: 'Company1', source: require('../assets/logos/company1.png') },
    { name: 'ETC', source: require('../assets/logos/etc.png') },
    { name: 'Gift', source: require('../assets/logos/gift.png') },
    { name: 'Logo', source: require('../assets/logos/Logo.png') },
  ];

  // Marquee animation for logos
  const marqueeTranslateX = useSharedValue(0);

  useEffect(() => {
    // Duplicate logos for seamless loop
    // Logo container width (100) + gap (64) = 164px per logo
    const logoWidth = 164; // Width per logo including gap
    const singleSetWidth = companyLogos.length * logoWidth;

    // Initialize to 0
    marqueeTranslateX.value = 0;

    // Continuous infinite scroll from right to left
    // Animation moves one full set width, then resets to 0 seamlessly
    // The duplicate sets ensure continuity when reset happens
    marqueeTranslateX.value = withRepeat(
      withTiming(-singleSetWidth, {
        duration: 20000,
        easing: Easing.linear
      }),
      -1,
      false // false = reset to start (no reverse), creating seamless infinite loop
    );
  }, [companyLogos.length]);

  const marqueeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: marqueeTranslateX.value }],
    };
  });

  const stats = [
    { number: '10K+', label: t.categories.eliteFreelancers, icon: 'people' },
    { number: '5K+', label: t.stats.happyClients, icon: 'heart' },
    { number: '20M+', label: t.stats.successProjects, icon: 'rocket' },
    { number: '98%', label: t.stats.successRate, icon: 'star' },
  ];

  const categories = [
    { title: t.categories.development, icon: 'code', count: '1,200+', color: '#3b82f6' },
    { title: t.categories.design, icon: 'brush', count: '800+', color: '#a855f7' },
    { title: t.categories.marketing, icon: 'megaphone', count: '650+', color: '#ef4444' },
    { title: t.categories.mobile, icon: 'phone-portrait', count: '450+', color: '#10b981' },
    { title: t.categories.writing, icon: 'mail', count: '1,000+', color: '#f59e0b' },
    { title: t.categories.translation, icon: 'chatbubbles', count: '300+', color: '#06b6d4' },
    { title: t.categories.business, icon: 'briefcase', count: '900+', color: '#6b7280' },
    { title: t.categories.consulting, icon: 'person', count: '700+', color: '#6366f1' },
  ];

  const featuredFreelancers = [
    {
      ...t.featuredFreelancers.yohannes,
      skills: ['React', 'Node.js', 'TypeScript'],
      image: require('../Images/Freelancers/Yohannes.png'),
    },
    {
      ...t.featuredFreelancers.samuel,
      skills: ['React', 'Node.js', 'Tailwind CSS'],
      image: require('../Images/Freelancers/Samuel.png'),
    },
    {
      ...t.featuredFreelancers.messi,
      skills: ['Flutter', 'React Native', 'iOS'],
      image: require('../Images/Freelancers/messie.png'),
    },
    {
      ...t.featuredFreelancers.lily,
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      image: null,
    },
  ];

  const testimonials = t.testimonials.list.map((item, index) => ({
    ...item,
    image: index === 0 ? require('../Images/Freelancers/Yohannes.png') : null, // Reusing Yohannes image for Abebe for demo if needed, but null is safer
  }));

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView
        style={[styles.scrollView, darkMode && styles.scrollViewDark]}
        contentContainerStyle={[styles.contentContainer, darkMode && styles.contentContainerDark]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, darkMode && styles.heroSectionDark, { paddingTop: 100 }]}>
          <Animated.View
            entering={FadeInDown.duration(800).delay(300)}
            style={styles.heroContent}
          >
            <View style={styles.heroTextContainer}>
              <View style={styles.heroTitleWrapper}>
                <Text
                  style={[styles.heroTitle, darkMode && styles.heroTitleDark]}
                  numberOfLines={0}
                  allowFontScaling={true}
                >
                  {t.hero.title}
                </Text>
                <Text
                  style={[styles.heroTitle, styles.heroTitleAccent]}
                  numberOfLines={0}
                  allowFontScaling={true}
                >
                  {t.hero.titleHighlight}
                </Text>
              </View>
              <Text style={[styles.heroSubtitle, darkMode && styles.heroSubtitleDark]}>
                {t.hero.subtitle}{'\n'}
                <Text style={[styles.heroSubtitleBold, darkMode && styles.heroSubtitleBoldDark]}>{t.hero.subtitleHighlight}</Text>
              </Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleGetStarted}
                >
                  <Ionicons name="rocket" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>{t.hero.getStarted}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Hero Image */}
            <Animated.View
              entering={FadeIn.duration(1000).delay(500)}
              style={styles.heroImageContainer}
            >
              <Image
                source={require('../Images/Herobg.jpg')}
                style={styles.heroImage as any}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Company Logos Section - Marquee */}
        <View style={[styles.logosSection, darkMode && styles.logosSectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            {t.companies.trustedBy} {t.companies.companies}
          </Text>
          <View style={styles.marqueeContainer}>
            <Animated.View style={[styles.marqueeContent, marqueeAnimatedStyle]}>
              {/* Render multiple sets of logos for seamless infinite scroll */}
              {/* We need at least 2 sets for seamless looping, using 4 sets for smooth continuous scroll */}
              {companyLogos.map((logo, logoIndex) => (
                <View key={`logo-1-${logoIndex}`} style={styles.logoContainer}>
                  <Image
                    source={logo.source}
                    style={styles.logoImage as any}
                    resizeMode="contain"
                  />
                </View>
              ))}
              {companyLogos.map((logo, logoIndex) => (
                <View key={`logo-2-${logoIndex}`} style={styles.logoContainer}>
                  <Image
                    source={logo.source}
                    style={styles.logoImage as any}
                    resizeMode="contain"
                  />
                </View>
              ))}
              {companyLogos.map((logo, logoIndex) => (
                <View key={`logo-3-${logoIndex}`} style={styles.logoContainer}>
                  <Image
                    source={logo.source}
                    style={styles.logoImage as any}
                    resizeMode="contain"
                  />
                </View>
              ))}
              {companyLogos.map((logo, logoIndex) => (
                <View key={`logo-4-${logoIndex}`} style={styles.logoContainer}>
                  <Image
                    source={logo.source}
                    style={styles.logoImage as any}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
        </View>

        {/* How It Works Video Section */}
        <View style={[styles.videoSection, darkMode && styles.videoSectionDark]}>
          {/* Animated Background Elements - Using Svg Radial Gradient for soft blobs */}
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[{ position: 'absolute', top: '10%', left: '10%', width: 600, height: 600 }, blob1Style]}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="cyanBlob" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity={darkMode ? "0.1" : "0.05"} />
                    <Stop offset="1" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <SvgRect x="0" y="0" width="100%" height="100%" fill="url(#cyanBlob)" />
              </Svg>
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400 }, blob2Style]}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="purpleBlob" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={darkMode ? "#a855f7" : "#a855f7"} stopOpacity={darkMode ? "0.1" : "0.05"} />
                    <Stop offset="1" stopColor={darkMode ? "#a855f7" : "#a855f7"} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <SvgRect x="0" y="0" width="100%" height="100%" fill="url(#purpleBlob)" />
              </Svg>
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, marginLeft: -150, marginTop: -150 }, blob3Style]}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="blueBlob" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={darkMode ? "#3b82f6" : "#3b82f6"} stopOpacity={darkMode ? "0.15" : "0.08"} />
                    <Stop offset="1" stopColor={darkMode ? "#3b82f6" : "#3b82f6"} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <SvgRect x="0" y="0" width="100%" height="100%" fill="url(#blueBlob)" />
              </Svg>
            </Animated.View>
          </View>

          <View style={styles.sectionContent}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <Text style={[styles.howItWorksTitle, darkMode && styles.howItWorksTitleDark]}>
                {t.howItWorks.title}
              </Text>
              <Text style={[styles.howItWorksSubtitle, darkMode && styles.howItWorksSubtitleDark]}>
                {t.howItWorks.subtitle.split(t.howItWorks.videoSubtitle)[0]}
                <Text style={styles.highlightText}>{t.howItWorks.videoSubtitle}</Text>
                {t.howItWorks.subtitle.split(t.howItWorks.videoSubtitle)[1]}
              </Text>
            </Animated.View>

            {/* Video Container */}
            <Animated.View entering={FadeIn.duration(1000).delay(200)} style={styles.videoContainer}>
              <LinearGradient
                colors={['#22d3ee', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.videoBorderGradient}
              >
                <View style={styles.videoWrapper}>
                  <Video
                    ref={video}
                    style={styles.video}
                    source={howItWorksVideo}
                    useNativeControls={false}
                    resizeMode={ResizeMode.STRETCH}
                    isLooping
                    isMuted={true}
                    shouldPlay={true}
                  />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Steps */}
            <View style={styles.stepsGrid}>
              {[
                { step: "01", title: t.howItWorks.steps.signUp.title, desc: t.howItWorks.steps.signUp.desc, icon: "search", color1: "#3b82f6", color2: "#06b6d4", delay: 100 },
                { step: "02", title: t.howItWorks.steps.browse.title, desc: t.howItWorks.steps.browse.desc, icon: "document-text", color1: "#a855f7", color2: "#ec4899", delay: 200 },
                { step: "03", title: t.howItWorks.steps.connect.title, desc: t.howItWorks.steps.connect.desc, icon: "chatbubbles", color1: "#22c55e", color2: "#14b8a6", delay: 300 },
                { step: "04", title: t.howItWorks.steps.succeed.title, desc: t.howItWorks.steps.succeed.desc, icon: "cash", color1: "#f97316", color2: "#ef4444", delay: 400 }
              ].map((item, idx) => (
                <Animated.View
                  key={idx}
                  entering={FadeInUp.duration(600).delay(item.delay)}
                  style={[styles.stepCard, darkMode && styles.stepCardDark]}
                >
                  <LinearGradient
                    colors={[item.color1, item.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.stepNumberContainer}
                  >
                    <Text style={styles.stepNumber}>{item.step}</Text>
                  </LinearGradient>
                  <Ionicons name={item.icon as any} size={40} color="#06b6d4" style={styles.stepIcon} />
                  <Text style={[styles.stepTitle, darkMode && styles.stepTitleDark]}>{item.title}</Text>
                  <Text style={[styles.stepDesc, darkMode && styles.stepDescDark]}>{item.desc}</Text>
                </Animated.View>
              ))}
            </View>

            {/* Call to Action Button */}
            <Animated.View entering={FadeInUp.duration(800).delay(600)} style={styles.howItWorksCta}>
              <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
                <LinearGradient
                  colors={['#06b6d4', '#3b82f6', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.gradientButtonText}>{t.hero.getStarted} →</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.testimonialsSubtitle, darkMode && styles.testimonialsSubtitleDark]}>
                {t.testimonials.subtitle}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* New Stats Section */}
        <View style={[styles.newStatsSection, darkMode && styles.newStatsSectionDark]}>
          {/* Background Blobs for Stats */}
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[{ position: 'absolute', top: '25%', left: '10%', width: 450, height: 450 }, blob1Style]}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="cyanStatBlob" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity={darkMode ? "0.06" : "0.03"} />
                    <Stop offset="1" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <SvgRect x="0" y="0" width="100%" height="100%" fill="url(#cyanStatBlob)" />
              </Svg>
            </Animated.View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { number: "10K+", label: t.categories.eliteFreelancers, color: ["#06b6d4", "#3b82f6"] as [string, string], icon: "people" },
              { number: "5K+", label: t.stats.happyClients, color: ["#f43f5e", "#e11d48"] as [string, string], icon: "heart" },
              { number: "20M+", label: t.stats.successProjects, color: ["#8b5cf6", "#7c3aed"] as [string, string], icon: "briefcase" },
              { number: "98%", label: t.stats.successRate, color: ["#f59e0b", "#d97706"] as [string, string], icon: "medal" }
            ].map((stat, i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.duration(600).delay(i * 100)}
                style={[styles.newStatCard, darkMode && styles.newStatCardDark]}
              >
                <LinearGradient
                  colors={stat.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newStatIconContainer}
                >
                  <Ionicons name={stat.icon as any} size={24} color="#fff" />
                </LinearGradient>

                <Text style={[styles.newStatNumber, darkMode ? { color: '#fff' } : { color: '#111' }]}>{stat.number}</Text>
                <Text style={[styles.newStatLabel, darkMode && styles.newStatLabelDark]}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* New Categories Section */}
        <View style={[styles.newCategoriesSection, darkMode && styles.newCategoriesSectionDark]}>
          {/* Background Blobs for Categories */}
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[{ position: 'absolute', top: '15%', left: '8%', width: 480, height: 480 }, blob1Style]}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="catBlob1" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity={darkMode ? "0.05" : "0.02"} />
                    <Stop offset="1" stopColor={darkMode ? "#06b6d4" : "#06b6d4"} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <SvgRect x="0" y="0" width="100%" height="100%" fill="url(#catBlob1)" />
              </Svg>
            </Animated.View>
          </View>

          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            {t.categories.popularCategories}
          </Text>

          <View style={styles.categoriesGrid}>
            {[
              { title: t.categories.development, icon: 'code', count: '1,200+', color: '#3b82f6' },
              { title: t.categories.design, icon: 'brush', count: '800+', color: '#a855f7' },
              { title: t.categories.marketing, icon: 'megaphone', count: '650+', color: '#ef4444' },
              { title: t.categories.mobile, icon: 'phone-portrait', count: '450+', color: '#10b981' },
              { title: t.categories.writing, icon: 'mail', count: '1,000+', color: '#f59e0b' },
              { title: t.categories.translation, icon: 'chatbubbles', count: '300+', color: '#06b6d4' },
              { title: t.categories.business, icon: 'briefcase', count: '900+', color: '#6b7280' },
              { title: t.categories.consulting, icon: 'person', count: '700+', color: '#6366f1' },
            ].map((category, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(600).delay(index * 50)}
                style={[styles.categoryCard, darkMode && styles.categoryCardDark]}
              >
                <Ionicons name={category.icon as any} size={28} color={category.color} />
                <Text style={[styles.categoryTitle, darkMode && styles.categoryTitleDark]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryCount, { color: category.color }]}>
                  {category.count} {t.categories.freelancers}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Featured Freelancers Section */}
        <View style={[styles.freelancersSection, darkMode && styles.freelancersSectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            {t.categories.eliteFreelancers}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.freelancersContainer}
          >
            {featuredFreelancers.map((freelancer, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(600).delay(index * 100)}
                style={[styles.freelancerCard, darkMode && styles.freelancerCardDark]}
              >
                <View style={[styles.freelancerAvatar, darkMode && styles.freelancerAvatarDark]}>
                  {freelancer.image ? (
                    <Image
                      source={freelancer.image}
                      style={styles.freelancerAvatarImage as any}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="#06b6d4" />
                  )}
                  <View style={styles.freelancerBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                  </View>
                </View>
                <Text style={[styles.freelancerName, darkMode && styles.freelancerNameDark]}>
                  {freelancer.name}
                </Text>
                <Text style={styles.freelancerTitle}>{freelancer.title}</Text>
                <View style={styles.freelancerSkills}>
                  {freelancer.skills.map((skill, i) => (
                    <View
                      key={i}
                      style={[
                        styles.skillTag,
                        darkMode && styles.skillTagDark,
                      ]}
                    >
                      <Text
                        style={[
                          styles.skillTagText,
                          darkMode && styles.skillTagTextDark,
                        ]}
                      >
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>

              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Testimonials Section */}
        <View style={[styles.testimonialsSection, darkMode && styles.testimonialsSectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            {t.testimonials.title}
          </Text>
          <View style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(600).delay(index * 150)}
                style={[styles.testimonialCard, darkMode && styles.testimonialCardDark]}
              >
                <View style={styles.testimonialIcon}>
                  <Text style={styles.testimonialQuoteMark}>"</Text>
                </View>
                <Text style={[styles.testimonialText, darkMode && styles.testimonialTextDark]}>
                  {testimonial.quote}
                </Text>
                <View style={styles.testimonialAuthor}>

                  <View>
                    <Text style={[styles.testimonialName, darkMode && styles.testimonialNameDark]}>
                      {testimonial.name}
                    </Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, darkMode && styles.ctaSectionDark]}>
          <Text style={styles.ctaTitle}>{t.cta.title}</Text>
          <Text style={styles.ctaSubtitle}>
            {t.cta.subtitle}{'\n'}
            <Text style={styles.ctaSubtitleBold}>{t.cta.subtitleHighlight}</Text>
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('JobListings' as never)}
          >
            <Ionicons name="search" size={20} color="#06b6d4" />
            <Text style={styles.ctaButtonText}>{t.cta.findDreamWork}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={[styles.footer, darkMode && styles.footerDark]}>
          <View style={styles.footerContent}>
            {/* Footer Columns */}
            <View style={styles.footerGrid}>
              {/* For Clients */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                  {t.footer.forClients}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.howToHire}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.talentMarketplace}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Pricing' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.nav.pricing}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* For Freelancers */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                  {t.footer.forFreelancers}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.howToFindWork}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.freelanceJobs}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.resources}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Company */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                  {t.footer.company}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUs' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.aboutUs}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.careers}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ContactUs' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.contactUs}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Resources */}
              <View style={styles.footerColumn}>
                <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
                  {t.footer.resources}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.helpCenter}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Blog' as never)}>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.blog}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                    {t.footer.community}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Bottom */}
            <View style={styles.footerBottom}>
              <View style={styles.footerBottomLeft}>
                <Text style={[styles.footerCopyright, darkMode && styles.footerCopyrightDark]}>
                  © 2025 HustleX. {t.footer.allRightsReserved}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={[styles.footerMadeWith, darkMode && styles.footerMadeWithDark]}>
                    {t.footer.madeWith}
                  </Text>
                  <Ionicons name="heart" size={12} color="#ef4444" style={{ marginHorizontal: 4 }} />
                  <Text style={[styles.footerMadeWith, darkMode && styles.footerMadeWithDark]}>
                    {t.footer.inEthiopia}
                  </Text>
                </View>
              </View>
              <View style={styles.footerSocial}>
                <Text style={[styles.footerFollowUs, darkMode && styles.footerFollowUsDark]}>
                  {t.footer.followUs}:
                </Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="logo-facebook" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="logo-twitter" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="logo-linkedin" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="logo-instagram" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="logo-youtube" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Bar (Absolute Overlay) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <HomeNavbar hideLinks={true} transparent={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 140,
  },
  heroSection: {
    minHeight: height * 0.8,
    justifyContent: 'center',
    paddingHorizontal: width > 600 ? 40 : 20,
    paddingVertical: width > 600 ? 80 : 40,
    backgroundColor: '#f8f9fa',
  },
  heroSectionDark: {
    backgroundColor: '#111',
  },
  heroContent: {
    flexDirection: width > 600 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: width > 600 ? 48 : 40,
  },
  heroTextContainer: {
    flex: width > 600 ? 0.48 : 1,
    width: width > 600 ? '48%' : '100%',
    justifyContent: 'center',
    paddingRight: width > 600 ? 20 : 0,
    flexShrink: 1,
    ...Platform.select({
      web: {
        minWidth: 0,
        maxWidth: '100%',
      },
    }),
  },
  heroImageContainer: {
    flex: width > 600 ? 0.52 : 1,
    width: width > 600 ? '52%' : '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: width > 600 ? 600 : Math.max(width * 0.9, 200), // Ensure minimum height
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heroTitleWrapper: {
    marginBottom: 20,
    flexDirection: 'column',
  },
  heroTitle: {
    fontSize: Platform.OS === 'android' ? (width > 600 ? 52 : 40) : Math.max(width > 600 ? 52 : 40, 14), // Android: use direct values, others: ensure minimum
    fontWeight: '800',
    color: '#000',
    lineHeight: Platform.OS === 'android' ? (width > 600 ? 62 : 48) : Math.max(width > 600 ? 62 : 48, 20), // Android: use direct values
    ...(Platform.OS === 'android' && { letterSpacing: 0 }), // Explicitly set letterSpacing to 0 on Android
    ...Platform.select({
      web: {
        wordBreak: 'normal',
        overflowWrap: 'normal',
        whiteSpace: 'normal',
        wordSpacing: 'normal',
        hyphens: 'none',
        maxWidth: '100%',
      },
      default: {
        textBreakStrategy: 'highQuality',
      },
    }) as any,
  },
  heroTitleDark: {
    color: '#fff',
  },
  heroTitleAccent: {
    color: '#06b6d4',
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'android' ? (width > 600 ? 20 : 18) : Math.max(width > 600 ? 20 : 18, 14), // Android: use direct values
    ...(Platform.OS === 'android' && { letterSpacing: 0 }), // Explicitly set letterSpacing to 0 on Android
    color: '#666',
    marginBottom: 36,
    lineHeight: width > 600 ? 30 : 26,
  },
  heroSubtitleDark: {
    color: '#ccc',
  },
  heroSubtitleBold: {
    fontWeight: '700',
    color: '#000',
  },
  heroSubtitleBoldDark: {
    color: '#fff',
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  secondaryButtonDark: {
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtonTextDark: {
    color: '#fff',
  },
  logosSection: {
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
  },
  logosSectionDark: {
    backgroundColor: '#111',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  logosContainer: {
    paddingHorizontal: 20,
    gap: 32,
    alignItems: 'center',
  },
  marqueeContainer: {
    overflow: 'hidden',
    height: 100,
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 64,
    flexShrink: 0,
    ...Platform.select({
      web: {
        width: '100%',
      },
      default: {
        width: 'auto',
      },
    }) as any,
  },
  logoContainer: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
    flexShrink: 0,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  statsSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  statsSectionDark: {
    backgroundColor: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: width / 2 - 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#06b6d4',
    marginTop: 8,
    marginBottom: 4,
  },
  statNumberDark: {
    color: '#06b6d4',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  statLabelDark: {
    color: '#999',
  },
  categoriesSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  categoriesSectionDark: {
    backgroundColor: '#000',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: width / 2 - 22,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    color: '#000',
  },
  categoryTitleDark: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  freelancersSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  freelancersSectionDark: {
    backgroundColor: '#000',
  },
  freelancersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  freelancerCard: {
    width: width * 0.75,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  freelancerCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  freelancerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  freelancerAvatarDark: {
    backgroundColor: '#333',
  },
  freelancerAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  freelancerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  freelancerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000',
  },
  freelancerNameDark: {
    color: '#fff',
  },
  freelancerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 12,
  },
  freelancerSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillTagDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  skillTagTextDark: {
    color: '#fff',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialsSection: {
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  testimonialsSectionDark: {
    backgroundColor: '#000',
  },
  testimonialsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testimonialCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  testimonialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialQuoteMark: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialTextDark: {
    color: '#ccc',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  testimonialNameDark: {
    color: '#fff',
  },
  testimonialRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  ctaSectionDark: {
    backgroundColor: '#0a0a0a',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaSubtitleBold: {
    fontWeight: '700',
    color: '#fff',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#06b6d4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    color: '#06b6d4',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1f2937',
  },
  footerDark: {
    backgroundColor: '#111827',
  },
  footerContent: {
    maxWidth: width,
    alignSelf: 'center',
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 24,
  },
  footerColumn: {
    flex: 1,
    minWidth: width / 2 - 30,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  footerColumnTitleDark: {
    color: '#f3f4f6',
  },
  footerLink: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  footerLinkDark: {
    color: '#6b7280',
  },
  footerBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerBottomLeft: {
    flex: 1,
    minWidth: width / 2 - 30,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerCopyrightDark: {
    color: '#6b7280',
  },
  footerMadeWith: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerMadeWithDark: {
    color: '#4b5563',
  },
  footerSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerFollowUs: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  footerFollowUsDark: {
    color: '#6b7280',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    padding: 4,
  },

  videoSection: {
    paddingVertical: 80,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  videoSectionDark: {
    backgroundColor: '#000',
  },
  videoContainer: {
    marginVertical: 40,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  videoBorderGradient: {
    padding: 4,
    borderRadius: 24,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 1200,
    aspectRatio: 16 / 9,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  sectionContent: {
    maxWidth: 1280,
    alignSelf: 'center',
    paddingHorizontal: 16,
    width: '100%',
    zIndex: 10,
  },
  scrollViewDark: {
    backgroundColor: '#000',
  },
  contentContainerDark: {
    backgroundColor: '#000',
  },
  howItWorksTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  howItWorksTitleDark: {
    color: '#fff',
  },
  howItWorksSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  howItWorksSubtitleDark: {
    color: '#ccc',
  },
  highlightText: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    marginTop: 20,
  },
  stepCard: {
    width: width > 768 ? '23%' : (width > 600 ? '45%' : '100%'),
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  stepCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  stepNumberContainer: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stepIcon: {
    marginBottom: 16,
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  stepTitleDark: {
    color: '#fff',
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepDescDark: {
    color: '#ccc',
  },
  howItWorksCta: {
    alignItems: 'center',
    marginTop: 60,
  },
  gradientButton: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#22d3ee",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  testimonialsSubtitle: {
    marginTop: 20,
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  testimonialsSubtitleDark: {
    color: '#ccc',
  },
  newStatsSection: {
    paddingVertical: 80,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  newStatsSectionDark: {
    backgroundColor: '#000',
  },
  newStatCard: {
    flex: 1,
    minWidth: 150,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  newStatCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  newStatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newStatNumber: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  newStatLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  newStatLabelDark: {
    color: '#9ca3af',
  },
  newCategoriesSection: {
    paddingVertical: 80,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  newCategoriesSectionDark: {
    backgroundColor: '#000',
  },
});

export default HomeFinal;
