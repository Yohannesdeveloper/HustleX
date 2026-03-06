import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./jobsSlice";
import themeReducer from "./themeSlice";
import authReducer, { AuthState } from "./authSlice";
import languageReducer, { Language, LanguageState } from "./languageSlice";

const PERSIST_KEY = "hustlex_jobs";
const AUTH_PERSIST_KEY = "hustlex_auth";

function loadPreloadedState(): {
  jobs: { jobs: any[] };
  theme: { darkMode: boolean };
  language: LanguageState;
  auth: AuthState;
} {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    const darkRaw = localStorage.getItem("hustlex_theme_dark");
    const languageRaw = localStorage.getItem("hustlex_language");
    const authRaw = localStorage.getItem(AUTH_PERSIST_KEY);

    const jobs = raw ? JSON.parse(raw) : [];
    const darkMode = darkRaw ? JSON.parse(darkRaw) : false;
    const language = ((languageRaw && ["en", "am", "ti", "om"].includes(languageRaw)) ? languageRaw : "en") as Language;

    // Restore auth session — only if a token also exists in localStorage
    const token = localStorage.getItem("token");
    let authState: AuthState = { user: null, isAuthenticated: false, loading: true };
    if (authRaw && token) {
      try {
        const parsed = JSON.parse(authRaw);
        if (parsed && parsed.user) {
          authState = { user: parsed.user, isAuthenticated: true, loading: true };
        }
      } catch {
        // ignore parse errors
      }
    }

    return {
      jobs: { jobs },
      theme: { darkMode },
      language: { language },
      auth: authState,
    };
  } catch {
    return {
      jobs: { jobs: [] },
      theme: { darkMode: false },
      language: { language: "en" as Language },
      auth: { user: null, isAuthenticated: false, loading: true },
    };
  }
}

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    theme: themeReducer,
    auth: authReducer,
    language: languageReducer,
  },
  preloadedState: loadPreloadedState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem(PERSIST_KEY, JSON.stringify(state.jobs.jobs));
    localStorage.setItem(
      "hustlex_theme_dark",
      JSON.stringify(state.theme.darkMode)
    );
    // Persist auth state so the user stays logged in across refreshes
    if (state.auth.isAuthenticated && state.auth.user) {
      localStorage.setItem(
        AUTH_PERSIST_KEY,
        JSON.stringify({ user: state.auth.user })
      );
    } else if (!state.auth.loading) {
      // Only clear persisted auth when fully done loading and not authenticated
      localStorage.removeItem(AUTH_PERSIST_KEY);
    }
  } catch {
    // ignore write errors
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
