import en from "./translations/en.json";
import hi from "./translations/hi.json";

export type Language = "en" | "hi";

export const translations: Record<Language, any> = {
  en,
  hi,
};

export class TranslationService {
  private static activeLanguage: Language = "en";

  public static setLanguage(lang: Language): void {
    if (translations[lang]) {
      this.activeLanguage = lang;
    }
  }

  public static getLanguage(): Language {
    return this.activeLanguage;
  }

  /**
   * Retrieves a translation string for a given key, with support for nested keys, interpolation and pluralization.
   */
  public static translate(
    key: string,
    params?: Record<string, string | number>,
    count?: number,
    overrideLang?: Language
  ): string {
    const lang = overrideLang || this.activeLanguage;
    const langDict = translations[lang] || translations["en"];

    // 1. Handle pluralization suffix if count is provided
    let finalKey = key;
    if (count !== undefined) {
      if (count === 0) {
        finalKey = `${key}_zero`;
      } else if (count === 1) {
        finalKey = `${key}_one`;
      } else {
        finalKey = `${key}_other`;
      }
    }

    // 2. Resolve nested key
    let val = this.resolveKey(langDict, finalKey);

    // Fallback if pluralized key is not found
    if (!val && count !== undefined) {
      val = this.resolveKey(langDict, key);
    }

    // Fallback to English dictionary if still not found
    if (!val) {
      const enDict = translations["en"];
      if (count !== undefined) {
        val = this.resolveKey(enDict, `${key}_zero`) || this.resolveKey(enDict, `${key}_one`) || this.resolveKey(enDict, `${key}_other`);
      }
      if (!val) {
        val = this.resolveKey(enDict, key);
      }
    }

    // Ultimate fallback is the key itself
    if (!val) {
      return key;
    }

    if (typeof val !== "string") {
      return key;
    }

    // 3. Interpolation
    let result = val;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue));
      }
    }

    // Fallback for counts in interpolation
    if (count !== undefined && !result.includes("{count}")) {
      result = result.replace(/{count}/g, String(count));
    }

    return result;
  }

  private static resolveKey(dict: any, key: string): any {
    if (!dict) return null;
    const parts = key.split(".");
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }
}
