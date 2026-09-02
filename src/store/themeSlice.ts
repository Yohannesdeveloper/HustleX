import { createSlice } from "@reduxjs/toolkit";

export interface ThemeState {
  darkMode: boolean;
}

const initialState: ThemeState = {
  darkMode: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, { payload }: { payload: boolean }) {
      state.darkMode = payload;
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;









