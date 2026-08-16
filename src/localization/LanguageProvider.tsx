import React, { useState, useEffect, ReactNode } from "react";
import { Language, TranslationService } from "./TranslationService";
import { LanguageContext } from "./LanguageContext";
import type { ChatLanguageCode, ReportLanguageCode } from "./supportedLanguages";
import { languagePreferencesService } from "./languagePreferencesService";
import { authService } from "../services/authService";

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const cached = languagePreferencesService.getCachedPreferences();
  const [language, setLanguageState] = useState<Language>(cached.appLanguage);
  const [aiLanguage, setAiLanguageState] = useState<ChatLanguageCode>(cached.chatLanguage);
  const [reportLanguage, setReportLanguageState] = useState<ReportLanguageCode>(cached.reportLanguage);
  const [preferencesSource, setPreferencesSource] = useState<"cache" | "cloud">("cache");

  useEffect(() => {
    const unsubPrefs = languagePreferencesService.subscribe((prefs, source) => {
      setLanguageState(prefs.appLanguage);
      setAiLanguageState(prefs.chatLanguage);
      setReportLanguageState(prefs.reportLanguage);
      setPreferencesSource(source);
    });

    const unsubAuth = authService.subscribe((session) => {
      if (session?.user) {
        void languagePreferencesService.hydrateAfterLogin();
      } else {
        languagePreferencesService.clearCacheForLogout();
      }
    });

    if (authService.isAuthenticated()) {
      void languagePreferencesService.hydrateAfterLogin();
    }

    return () => {
      unsubPrefs();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    TranslationService.setLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    languagePreferencesService.updateLocal({ appLanguage: lang });
  };

  const setAiLanguage = (lang: ChatLanguageCode) => {
    languagePreferencesService.updateLocal({ chatLanguage: lang });
  };

  const setReportLanguage = (lang: ReportLanguageCode) => {
    languagePreferencesService.updateLocal({ reportLanguage: lang });
  };

  const t = (key: string, params?: Record<string, string | number>, count?: number) => {
    return TranslationService.translate(key, params, count, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        aiLanguage,
        setAiLanguage,
        reportLanguage,
        setReportLanguage,
        preferencesSource,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
export default LanguageProvider;
