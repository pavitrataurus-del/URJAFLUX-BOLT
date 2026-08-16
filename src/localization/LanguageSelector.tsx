import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Settings2 } from "lucide-react";
import { useTranslation } from "./hooks/useTranslation";
import { LanguagePreferenceFields } from "./LanguagePreferenceFields";
import { getLanguageLabel } from "./supportedLanguages";

interface LanguageSelectorProps {
  compact?: boolean;
  onOpenSettings?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  onOpenSettings,
}) => {
  const { t, language, aiLanguage, reportLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const summary = compact
    ? getLanguageLabel(language)
    : `${getLanguageLabel(language)} · ${getLanguageLabel(aiLanguage)} · ${getLanguageLabel(reportLanguage)}`;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 transition-colors"
        title={t("header.languageSelector")}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="max-w-[140px] truncate">{summary}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(92vw,420px)] z-[100] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t("settings.languagePanelTitle")}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t("settings.languagePanelSubtitle")}</p>
            </div>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-500 font-semibold"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {t("settings.moreSettings")}
              </button>
            )}
          </div>

          <LanguagePreferenceFields layout="stack" showDescriptions showComingSoon />

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {t("settings.languageSavedLocally")}
          </p>
        </div>
      )}
    </div>
  );
};
export default LanguageSelector;
