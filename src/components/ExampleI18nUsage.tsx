import React from "react";
import { useI18n } from "../hooks/useI18n";

/**
 * Example component showing how to use react-i18next translations
 * 
 * Usage:
 * 1. Import useI18n hook: import { useI18n } from "../hooks/useI18n";
 * 2. Get translation function: const { t } = useI18n();
 * 3. Use translations: <h1>{t("nav.home")}</h1>
 * 
 * Translation keys follow the structure in src/i18n/locales/*.json files
 */
const ExampleI18nUsage: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useI18n();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("nav.home")}</h1>
      <p>{t("hero.subtitle")}</p>
      
      {/* Nested translations */}
      <div>
        <h2>{t("features.title")}</h2>
        <p>{t("features.postJobs.title")}</p>
        <p>{t("features.postJobs.desc")}</p>
      </div>

      {/* Language switcher example */}
      <div className="flex gap-2">
        <button onClick={() => changeLanguage("en")}>English</button>
        <button onClick={() => changeLanguage("am")}>አማርኛ</button>
        <button onClick={() => changeLanguage("ti")}>ትግርኛ</button>
        <button onClick={() => changeLanguage("om")}>Oromoo</button>
      </div>

      <p>Current language: {currentLanguage}</p>
    </div>
  );
};

export default ExampleI18nUsage;
