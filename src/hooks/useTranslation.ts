import { useAppSelector } from "../store/hooks";
import { getTranslations, Translations } from "../translations";

export const useTranslation = (): Translations => {
  const language = useAppSelector((state) => state.language.language);
  return getTranslations(language);
};
