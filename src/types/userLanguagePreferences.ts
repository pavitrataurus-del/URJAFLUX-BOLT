import type { AppLanguageCode, ChatLanguageCode, ReportLanguageCode } from "../localization/supportedLanguages";

/** Cloud SSOT — synced across all devices for a user account. */
export interface UserLanguagePreferences {
  appLanguage: AppLanguageCode;
  chatLanguage: ChatLanguageCode;
  reportLanguage: ReportLanguageCode;
  updatedAt: string;
}

export const DEFAULT_USER_LANGUAGE_PREFERENCES: UserLanguagePreferences = {
  appLanguage: "en",
  chatLanguage: "en",
  reportLanguage: "en",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

export function normalizeUserLanguagePreferences(
  input?: Partial<UserLanguagePreferences> | null
): UserLanguagePreferences {
  const app = input?.appLanguage === "hi" ? "hi" : "en";
  const chat =
    input?.chatLanguage === "hi" || input?.chatLanguage === "hinglish"
      ? input.chatLanguage
      : "en";
  const report = input?.reportLanguage === "hi" ? "hi" : "en";
  return {
    appLanguage: app,
    chatLanguage: chat,
    reportLanguage: report,
    updatedAt: input?.updatedAt || new Date().toISOString(),
  };
}
