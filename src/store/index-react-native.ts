import { configureStore } from "@reduxjs/toolkit";
import { Platform } from 'react-native';
import jobsReducer from "./jobsSlice";
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import languageReducer from "./languageSlice";
import blogReducer from "./blogSlice";
import { setJobs } from "./jobsSlice";
import { setDarkMode } from "./themeSlice";
import { setLanguage } from "./languageSlice";

const PERSIST_KEY = "hustlex_jobs";

// Platform-aware storage helper
// @ts-ignore - Dynamic require for platform-specific module
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    // @ts-ignore
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    // AsyncStorage not available
    AsyncStorage = null;
  }
}

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } else {
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      return null;
    }
  } catch {
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } else {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
    }
  } catch {
    // ignore errors
  }
};

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    theme: themeReducer,
    auth: authReducer,
    language: languageReducer,
    blog: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (rejected actions may contain error objects before serialization)
        ignoredActions: [
          'auth/register/rejected',
          'auth/login/rejected',
          'auth/checkAuth/rejected',
          'auth/switchRole/rejected',
          'auth/addRole/rejected',
          'auth/refreshUser/rejected',
        ],
        // Ignore meta.arg which may contain non-serializable values
        ignoredActionPaths: ['meta.arg'],
      },
    }),
});

// Function to load persisted state - call this from App.tsx
export const loadPersistedState = async () => {
  try {
    const raw = await getStorageItem(PERSIST_KEY);
    const darkRaw = await getStorageItem("hustlex_theme_dark");
    const languageRaw = await getStorageItem("hustlex_language");

    if (raw) {
      const jobs = JSON.parse(raw);
      store.dispatch(setJobs(jobs));
    }

    if (darkRaw) {
      const darkMode = JSON.parse(darkRaw);
      store.dispatch(setDarkMode(darkMode));
    }

    if (languageRaw && ["en", "am", "ti", "om"].includes(languageRaw)) {
      store.dispatch(setLanguage(languageRaw as "en" | "am" | "ti" | "om"));
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
  }
};

store.subscribe(async () => {
  try {
    const state = store.getState();
    await setStorageItem(PERSIST_KEY, JSON.stringify(state.jobs.jobs));
    await setStorageItem(
      "hustlex_theme_dark",
      JSON.stringify(state.theme.darkMode)
    );
    // Save language to storage
    await setStorageItem("hustlex_language", state.language.language);
  } catch {
    // ignore write errors
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
