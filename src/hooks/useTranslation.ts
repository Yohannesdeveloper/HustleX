import { useAppSelector } from "../store/hooks";
import { getTranslations, Translations } from "../translations";
import { useMemo } from "react";

export const useTranslation = (): Translations => {
  const language = useAppSelector((state) => state.language.language);
  
  // useMemo ensures we get a new translations object when language changes
  // This triggers re-renders in components using this hook
  return useMemo(() => {
    return getTranslations(language);
  }, [language]);
};
