import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import amTranslations from './locales/am.json';
import tiTranslations from './locales/ti.json';
import omTranslations from './locales/om.json';

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
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys to lookup language from
      lookupLocalStorage: 'hustlex_language',
      // Cache user language
      caches: ['localStorage'],
    },
  });

// Make i18n available globally for Redux sync
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
}

export default i18n;
