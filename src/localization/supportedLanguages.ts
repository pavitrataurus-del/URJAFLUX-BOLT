/**
 * Central language registry — add new locales here as translations ship.
 * Flags control which pickers show each language as selectable.
 */

export type AppLanguageCode = "en" | "hi";
export type ChatLanguageCode = "en" | "hi" | "hinglish";
export type ReportLanguageCode = "en" | "hi";

export interface LanguageDefinition {
  code: string;
  englishName: string;
  nativeName: string;
  rtl?: boolean;
  uiReady: boolean;
  chatReady: boolean;
  reportReady: boolean;
}

export const LANGUAGE_REGISTRY: LanguageDefinition[] = [
  { code: "en", englishName: "English", nativeName: "English", uiReady: true, chatReady: true, reportReady: true },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", uiReady: true, chatReady: true, reportReady: true },
  { code: "hinglish", englishName: "Hinglish", nativeName: "Hinglish", uiReady: false, chatReady: true, reportReady: false },
  { code: "sa", englishName: "Sanskrit", nativeName: "संस्कृत", uiReady: false, chatReady: false, reportReady: false },
  { code: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી", uiReady: false, chatReady: false, reportReady: false },
  { code: "mr", englishName: "Marathi", nativeName: "मराठी", uiReady: false, chatReady: false, reportReady: false },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்", uiReady: false, chatReady: false, reportReady: false },
  { code: "te", englishName: "Telugu", nativeName: "తెలుగు", uiReady: false, chatReady: false, reportReady: false },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা", uiReady: false, chatReady: false, reportReady: false },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", uiReady: false, chatReady: false, reportReady: false },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", rtl: true, uiReady: false, chatReady: false, reportReady: false },
  { code: "zh", englishName: "Chinese", nativeName: "中文", uiReady: false, chatReady: false, reportReady: false },
  { code: "es", englishName: "Spanish", nativeName: "Español", uiReady: false, chatReady: false, reportReady: false },
  { code: "fr", englishName: "French", nativeName: "Français", uiReady: false, chatReady: false, reportReady: false },
  { code: "de", englishName: "German", nativeName: "Deutsch", uiReady: false, chatReady: false, reportReady: false },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", uiReady: false, chatReady: false, reportReady: false },
];

export function getUiLanguages(): LanguageDefinition[] {
  return LANGUAGE_REGISTRY.filter((l) => l.uiReady);
}

export function getChatLanguages(): LanguageDefinition[] {
  return LANGUAGE_REGISTRY.filter((l) => l.chatReady);
}

export function getReportLanguages(): LanguageDefinition[] {
  return LANGUAGE_REGISTRY.filter((l) => l.reportReady);
}

export function getLanguageLabel(code: string): string {
  const def = LANGUAGE_REGISTRY.find((l) => l.code === code);
  return def ? `${def.nativeName}` : code;
}

export function getComingSoonLanguages(): LanguageDefinition[] {
  return LANGUAGE_REGISTRY.filter((l) => !l.uiReady && !l.chatReady && !l.reportReady);
}
