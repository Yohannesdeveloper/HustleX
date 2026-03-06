import { useTranslation as useI18nextTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setLanguage, Language } from "../store/languageSlice";
import { useEffect } from "react";

/**
 * Custom hook that combines react-i18next with Redux language state
 * This ensures both systems stay in sync
 */
export const useI18n = () => {
  const { i18n, t } = useI18nextTranslation();
  const dispatch = useAppDispatch();
  const reduxLanguage = useAppSelector((state) => state.language.language);

  // Sync i18next with Redux on mount
  useEffect(() => {
    if (i18n.language !== reduxLanguage) {
      i18n.changeLanguage(reduxLanguage);
    }
  }, [reduxLanguage, i18n]);

  // Sync Redux with i18next when language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (lng !== reduxLanguage && ["en", "am", "ti", "om"].includes(lng)) {
        dispatch(setLanguage(lng as Language));
      }
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n, reduxLanguage, dispatch]);

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
    dispatch(setLanguage(lng));
  };

  return {
    t, // Translation function
    i18n, // i18next instance
    currentLanguage: reduxLanguage,
    changeLanguage,
  };
};
