import { authService } from "../services/authService";
import {
  DEFAULT_USER_LANGUAGE_PREFERENCES,
  normalizeUserLanguagePreferences,
  type UserLanguagePreferences,
} from "../types/userLanguagePreferences";
import type { Language } from "./TranslationService";
import type { ChatLanguageCode, ReportLanguageCode } from "./supportedLanguages";

const CACHE_KEYS = {
  app: "urjaflux_app_language",
  chat: "urjaflux_ai_language",
  report: "urjaflux_report_language",
  snapshot: "urjaflux_language_prefs_snapshot",
  userId: "urjaflux_language_prefs_user_id",
} as const;

type PreferenceListener = (prefs: UserLanguagePreferences, source: "cache" | "cloud") => void;

function readCacheSnapshot(): UserLanguagePreferences {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.snapshot);
    if (raw) {
      return normalizeUserLanguagePreferences(JSON.parse(raw));
    }
  } catch {
    /* ignore corrupt cache */
  }

  return normalizeUserLanguagePreferences({
    appLanguage: (localStorage.getItem(CACHE_KEYS.app) as Language) || "en",
    chatLanguage: (localStorage.getItem(CACHE_KEYS.chat) as ChatLanguageCode) || "en",
    reportLanguage: (localStorage.getItem(CACHE_KEYS.report) as ReportLanguageCode) || "en",
  });
}

function writeCacheSnapshot(prefs: UserLanguagePreferences, userId?: string | null): void {
  const normalized = normalizeUserLanguagePreferences(prefs);
  localStorage.setItem(CACHE_KEYS.snapshot, JSON.stringify(normalized));
  localStorage.setItem(CACHE_KEYS.app, normalized.appLanguage);
  localStorage.setItem(CACHE_KEYS.chat, normalized.chatLanguage);
  localStorage.setItem(CACHE_KEYS.report, normalized.reportLanguage);
  if (userId) {
    localStorage.setItem(CACHE_KEYS.userId, userId);
  }
}

function isCloudNewer(cloud: UserLanguagePreferences, cache: UserLanguagePreferences): boolean {
  return new Date(cloud.updatedAt).getTime() >= new Date(cache.updatedAt).getTime();
}

class LanguagePreferencesService {
  private listeners = new Set<PreferenceListener>();
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingCloudSave: UserLanguagePreferences | null = null;

  subscribe(listener: PreferenceListener): () => void {
    this.listeners.add(listener);
    listener(readCacheSnapshot(), "cache");
    return () => this.listeners.delete(listener);
  }

  private notify(prefs: UserLanguagePreferences, source: "cache" | "cloud") {
    const normalized = normalizeUserLanguagePreferences(prefs);
    this.listeners.forEach((l) => l(normalized, source));
  }

  getCachedPreferences(): UserLanguagePreferences {
    return readCacheSnapshot();
  }

  applyPreferences(prefs: UserLanguagePreferences, source: "cache" | "cloud", userId?: string) {
    const normalized = normalizeUserLanguagePreferences(prefs);
    writeCacheSnapshot(normalized, userId ?? authService.getUser()?.id ?? null);
    this.notify(normalized, source);
    return normalized;
  }

  /** Prefer cloud payload from login/refresh when present. */
  hydrateFromAuthUser(user: { id: string; languagePreferences?: UserLanguagePreferences }): UserLanguagePreferences {
    const cache = readCacheSnapshot();
    const cacheUserId = localStorage.getItem(CACHE_KEYS.userId);
    const sameUser = cacheUserId === user.id;

    if (user.languagePreferences) {
      const cloud = normalizeUserLanguagePreferences(user.languagePreferences);
      if (!sameUser || isCloudNewer(cloud, cache)) {
        return this.applyPreferences(cloud, "cloud", user.id);
      }
    }

    if (sameUser) {
      return this.applyPreferences(cache, "cache", user.id);
    }

    return this.applyPreferences(DEFAULT_USER_LANGUAGE_PREFERENCES, "cloud", user.id);
  }

  async fetchFromCloud(): Promise<UserLanguagePreferences | null> {
    if (!authService.isAuthenticated()) return null;
    try {
      const res = await fetch("/api/user/preferences/language", {
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      const prefs = normalizeUserLanguagePreferences(data.preferences);
      const userId = authService.getUser()?.id;
      return this.applyPreferences(prefs, "cloud", userId);
    } catch {
      return null;
    }
  }

  async hydrateAfterLogin(): Promise<UserLanguagePreferences> {
    const user = authService.getUser();
    if (!user) {
      return this.getCachedPreferences();
    }

    if (user.languagePreferences) {
      return this.hydrateFromAuthUser(user);
    }

    const fetched = await this.fetchFromCloud();
    return fetched ?? this.hydrateFromAuthUser(user);
  }

  scheduleCloudSave(prefs: UserLanguagePreferences): void {
    this.pendingCloudSave = normalizeUserLanguagePreferences({
      ...prefs,
      updatedAt: new Date().toISOString(),
    });

    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      void this.flushCloudSave();
    }, 400);
  }

  async flushCloudSave(): Promise<void> {
    if (!this.pendingCloudSave || !authService.isAuthenticated()) return;
    const payload = this.pendingCloudSave;
    this.pendingCloudSave = null;

    try {
      const res = await fetch("/api/user/preferences/language", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getAccessToken()}`,
          "X-CSRF-Token": authService.getCsrfToken() || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const data = await res.json();
      const saved = normalizeUserLanguagePreferences(data.preferences);
      this.applyPreferences(saved, "cloud", authService.getUser()?.id);
    } catch {
      /* keep local cache; will retry on next change */
    }
  }

  updateLocal(partial: Partial<UserLanguagePreferences>): UserLanguagePreferences {
    const merged = normalizeUserLanguagePreferences({
      ...readCacheSnapshot(),
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    writeCacheSnapshot(merged, authService.getUser()?.id ?? localStorage.getItem(CACHE_KEYS.userId));
    this.notify(merged, "cache");
    this.scheduleCloudSave(merged);
    return merged;
  }

  clearCacheForLogout(): void {
    localStorage.removeItem(CACHE_KEYS.snapshot);
    localStorage.removeItem(CACHE_KEYS.userId);
  }
}

export const languagePreferencesService = new LanguagePreferencesService();
