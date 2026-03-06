import { createSlice } from "@reduxjs/toolkit";

export type Language = "en" | "am" | "ti" | "om";

export interface LanguageState {
  language: Language;
}

// Always default to "en" at build time
const initialState: LanguageState = {
  language: "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, { payload }: { payload: Language }) {
      state.language = payload;

      // Only access localStorage and i18n in the browser
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("hustlex_language", payload);

          // Sync with i18next if available
          if ((window as any).i18n) {
            (window as any).i18n.changeLanguage(payload);
          }
        } catch {
          // ignore storage errors
        }
      }
    },

    // Optional: load language from localStorage at runtime
    loadLanguageFromStorage(state) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("hustlex_language");
          if (saved && ["en", "am", "ti", "om"].includes(saved)) {
            state.language = saved as Language;
          }
        } catch {
          // ignore errors
        }
      }
    },
  },
});

export const { setLanguage, loadLanguageFromStorage } = languageSlice.actions;
export default languageSlice.reducer;
