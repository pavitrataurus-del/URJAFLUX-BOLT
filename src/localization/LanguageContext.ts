import { createContext } from "react";
import { Language } from "./TranslationService";
import type { ChatLanguageCode, ReportLanguageCode } from "./supportedLanguages";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  aiLanguage: ChatLanguageCode;
  setAiLanguage: (lang: ChatLanguageCode) => void;
  reportLanguage: ReportLanguageCode;
  setReportLanguage: (lang: ReportLanguageCode) => void;
  /** Whether active preferences came from local cache or cloud profile. */
  preferencesSource?: "cache" | "cloud";
  t: (key: string, params?: Record<string, string | number>, count?: number) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
