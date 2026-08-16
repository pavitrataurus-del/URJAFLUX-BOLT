import type { UKALanguage } from "../assistant/UKATypes";
import type { LanguageCode } from "../core/reports/ReportTypes";
import type { ChatLanguageCode, ReportLanguageCode, AppLanguageCode } from "./supportedLanguages";
import type { Language } from "./TranslationService";

/** Map platform UI language → UKA chat engine code */
export function mapAppLanguageToUKA(lang: Language | AppLanguageCode): UKALanguage {
  if (lang === "hi") return "HI";
  return "EN";
}

/** Map UKA chat code → platform chat language storage */
export function mapUKAToChatLanguage(lang: UKALanguage): ChatLanguageCode {
  if (lang === "HI") return "hi";
  if (lang === "HINGLISH") return "hinglish";
  return "en";
}

export function mapChatLanguageToUKA(lang: ChatLanguageCode): UKALanguage {
  if (lang === "hi") return "HI";
  if (lang === "hinglish") return "HINGLISH";
  return "EN";
}

/** Legacy alias */
export function mapAppLanguageToChat(lang: Language): ChatLanguageCode {
  return lang as ChatLanguageCode;
}

export function mapChatToAppLanguage(lang: ChatLanguageCode): Language {
  if (lang === "hinglish") return "en";
  return lang as Language;
}

export function mapToReportLanguageCode(lang: ReportLanguageCode | Language | string | undefined): LanguageCode {
  if (!lang) return "en";
  const normalized = String(lang).toLowerCase();
  if (normalized === "hi" || normalized === "hindi" || normalized === "हिन्दी") return "hi";
  if (normalized === "hinglish") return "en";
  return "en";
}

export function mapClientReportLanguage(clientLang: string | undefined, fallback: ReportLanguageCode = "en"): LanguageCode {
  if (!clientLang) return fallback;
  return mapToReportLanguageCode(clientLang);
}

export function resolveReportLanguage(options: {
  explicit?: LanguageCode | string;
  clientReportLanguage?: string;
  userDefault?: ReportLanguageCode;
}): LanguageCode {
  if (options.explicit) return mapToReportLanguageCode(options.explicit);
  if (options.clientReportLanguage) return mapClientReportLanguage(options.clientReportLanguage);
  return mapToReportLanguageCode(options.userDefault ?? "en");
}

export function mapReportCodeToClientLabel(code: LanguageCode): "English" | "Hindi" {
  return code === "hi" ? "Hindi" : "English";
}
