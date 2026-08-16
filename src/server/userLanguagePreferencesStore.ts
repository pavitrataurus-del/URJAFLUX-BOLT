import {
  DEFAULT_USER_LANGUAGE_PREFERENCES,
  normalizeUserLanguagePreferences,
  type UserLanguagePreferences,
} from "../types/userLanguagePreferences";

/**
 * In-memory user language preferences store (cloud SSOT for dev server).
 * Replace with Firestore/PostgreSQL in production without changing API contracts.
 */
const preferencesByUserId = new Map<string, UserLanguagePreferences>();

export function getUserLanguagePreferences(userId: string): UserLanguagePreferences {
  return preferencesByUserId.get(userId) ?? { ...DEFAULT_USER_LANGUAGE_PREFERENCES };
}

export function saveUserLanguagePreferences(
  userId: string,
  updates: Partial<UserLanguagePreferences>
): UserLanguagePreferences {
  const current = getUserLanguagePreferences(userId);
  const merged = normalizeUserLanguagePreferences({
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  preferencesByUserId.set(userId, merged);
  return merged;
}

export function attachLanguagePreferencesToUser<T extends { id: string }>(
  user: T
): T & { languagePreferences: UserLanguagePreferences } {
  return {
    ...user,
    languagePreferences: getUserLanguagePreferences(user.id),
  };
}
