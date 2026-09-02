import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enTranslations from './locales/en.json';
import amTranslations from './locales/am.json';
import tiTranslations from './locales/ti.json';
import omTranslations from './locales/om.json';

const LANGUAGE_KEY = 'hustlex_language';

// Custom language detector for React Native
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && ['en', 'am', 'ti', 'om'].includes(savedLanguage)) {
        callback(savedLanguage);
        return;
      }

      // Get device locale
      const deviceLocale = Localization.locale || 'en';
      const deviceLanguage = deviceLocale.split('-')[0] || 'en';
      
      // Map to supported languages
      const supportedLanguages = ['en', 'am', 'ti', 'om'];
      const language = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
      
      callback(language);
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  },
};

const resources = {
  en: {
    translation: enTranslations,
  },
  am: {
    translation: amTranslations,
  },
  ti: {
    translation: tiTranslations,
  },
  om: {
    translation: omTranslations,
  },
};

i18n
  .use(languageDetector) // Custom React Native language detector
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Make i18n available globally for Redux sync
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
}

export default i18n;
