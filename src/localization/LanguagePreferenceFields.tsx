import React from "react";
import { useTranslation } from "./hooks/useTranslation";
import type { Language } from "./TranslationService";
import type { ChatLanguageCode, ReportLanguageCode } from "./supportedLanguages";
import { getChatLanguages, getReportLanguages, getUiLanguages, getComingSoonLanguages } from "./supportedLanguages";

interface LanguagePreferenceFieldsProps {
  layout?: "grid" | "stack";
  showDescriptions?: boolean;
  showComingSoon?: boolean;
}

export const LanguagePreferenceFields: React.FC<LanguagePreferenceFieldsProps> = ({
  layout = "grid",
  showDescriptions = true,
  showComingSoon = true,
}) => {
  const { t, language, setLanguage, aiLanguage, setAiLanguage, reportLanguage, setReportLanguage } =
    useTranslation();

  const uiLangs = getUiLanguages();
  const chatLangs = getChatLanguages();
  const reportLangs = getReportLanguages();
  const comingSoon = getComingSoonLanguages();

  const wrapClass =
    layout === "grid" ? "grid grid-cols-1 sm:grid-cols-3 gap-4" : "flex flex-col gap-4";

  const selectClass =
    "w-full bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500";

  const labelClass =
    "text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-1";

  const descClass = "text-[10px] text-slate-500 mt-1 leading-snug";

  return (
    <div className="space-y-4">
      <div className={wrapClass}>
        <div>
          <label className={labelClass}>{t("settings.appLanguage")}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={selectClass}
          >
            {uiLangs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.englishName})
              </option>
            ))}
          </select>
          {showDescriptions && (
            <p className={descClass}>{t("settings.appLanguageDesc")}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>{t("settings.aiLanguage")}</label>
          <select
            value={aiLanguage}
            onChange={(e) => setAiLanguage(e.target.value as ChatLanguageCode)}
            className={selectClass}
          >
            {chatLangs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.englishName})
              </option>
            ))}
          </select>
          {showDescriptions && (
            <p className={descClass}>{t("settings.aiLanguageDesc")}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>{t("settings.reportLanguage")}</label>
          <select
            value={reportLanguage}
            onChange={(e) => setReportLanguage(e.target.value as ReportLanguageCode)}
            className={selectClass}
          >
            {reportLangs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.englishName})
              </option>
            ))}
          </select>
          {showDescriptions && (
            <p className={descClass}>{t("settings.reportLanguageDesc")}</p>
          )}
        </div>
      </div>

      {showComingSoon && comingSoon.length > 0 && (
        <p className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
          {t("settings.languagesComingSoon")}:{" "}
          {comingSoon.map((l) => l.nativeName).join(" · ")}
        </p>
      )}
    </div>
  );
};

export default LanguagePreferenceFields;
