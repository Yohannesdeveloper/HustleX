import { createSlice } from "@reduxjs/toolkit";
import { Platform } from "react-native";

export type Language = "en" | "am" | "ti" | "om";

export interface LanguageState {
  language: Language;
}

// Platform-aware storage helper
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    AsyncStorage = null;
  }
}

const getInitialLanguage = (): Language => {
  // For React Native, we'll initialize with 'en' and load from AsyncStorage asynchronously
  // The actual language will be loaded in App.tsx or index-react-native.ts
  return "en"; // Default to English
};

const initialState: LanguageState = {
  language: getInitialLanguage(),
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, { payload }: { payload: Language }) {
      state.language = payload;
      
      // Save to storage (async, but don't block)
      const saveLanguage = async () => {
        try {
          if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem("hustlex_language", payload);
            }
          } else {
            if (AsyncStorage) {
              await AsyncStorage.setItem("hustlex_language", payload);
            }
          }
        } catch (error) {
          console.error('Error saving language:', error);
        }
      };
      saveLanguage();
      
      // Sync with i18next if available (for both web and React Native)
      const syncI18next = async () => {
        try {
          if (Platform.OS === 'web' && typeof window !== "undefined" && (window as any).i18n) {
            (window as any).i18n.changeLanguage(payload);
          } else {
            // For React Native, try to import and update i18next
            try {
              const i18nModule = await import('../i18n/config');
              if (i18nModule.default) {
                i18nModule.default.changeLanguage(payload);
              }
            } catch (importError) {
              // i18next might not be available, that's okay
              console.warn('i18next not available for sync:', importError);
            }
          }
        } catch (error) {
          console.warn('Error syncing i18next:', error);
        }
      };
      syncI18next();
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
