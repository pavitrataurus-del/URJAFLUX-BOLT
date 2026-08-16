import { beforeEach, describe, expect, it, vi } from "vitest";
import { languagePreferencesService } from "../languagePreferencesService";
import { normalizeUserLanguagePreferences } from "../../types/userLanguagePreferences";

const STORAGE: Record<string, string> = {};

beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => STORAGE[key] ?? null,
    setItem: (key: string, value: string) => {
      STORAGE[key] = value;
    },
    removeItem: (key: string) => {
      delete STORAGE[key];
    },
  });
  Object.keys(STORAGE).forEach((k) => delete STORAGE[k]);
});

describe("normalizeUserLanguagePreferences", () => {
  it("normalizes partial payloads", () => {
    const prefs = normalizeUserLanguagePreferences({
      appLanguage: "hi",
      chatLanguage: "hinglish",
      reportLanguage: "hi",
    });
    expect(prefs.appLanguage).toBe("hi");
    expect(prefs.chatLanguage).toBe("hinglish");
    expect(prefs.reportLanguage).toBe("hi");
    expect(prefs.updatedAt).toBeTruthy();
  });
});

describe("languagePreferencesService", () => {
  it("writes cache snapshot on updateLocal", () => {
    languagePreferencesService.updateLocal({ appLanguage: "hi" });
    expect(STORAGE.urjaflux_app_language).toBe("hi");
    expect(JSON.parse(STORAGE.urjaflux_language_prefs_snapshot).appLanguage).toBe("hi");
  });

  it("prefers cloud profile when user changes", () => {
    STORAGE.urjaflux_language_prefs_user_id = "user-a";
    STORAGE.urjaflux_language_prefs_snapshot = JSON.stringify({
      appLanguage: "en",
      chatLanguage: "en",
      reportLanguage: "en",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const applied = languagePreferencesService.hydrateFromAuthUser({
      id: "user-b",
      languagePreferences: {
        appLanguage: "hi",
        chatLanguage: "hi",
        reportLanguage: "hi",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
    });

    expect(applied.appLanguage).toBe("hi");
    expect(STORAGE.urjaflux_language_prefs_user_id).toBe("user-b");
  });
});
