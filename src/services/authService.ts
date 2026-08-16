import { UserRole } from "../core/security/SecurityTypes";
import type { UserLanguagePreferences } from "../types/userLanguagePreferences";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
  tenantId?: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  permissions: string[];
  /** Cloud SSOT — synced across devices after login. */
  languagePreferences?: UserLanguagePreferences;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  csrfToken: string;
  expiresAt: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE";
  details?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentSession: AuthSession | null = null;
  private refreshTimer: any = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  private constructor() {
    // Attempt session restoration on boot
    this.restoreSessionSilently();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.push(listener);
    // Emit current state immediately
    listener(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentSession));
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public getUser(): AuthUser | null {
    return this.currentSession?.user || null;
  }

  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    return Date.now() < this.currentSession.expiresAt;
  }

  public getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.currentSession?.accessToken || null;
  }

  public getCsrfToken(): string | null {
    return this.currentSession?.csrfToken || null;
  }

  /**
   * Login with email and password via secure backend endpoint.
   * Stores Refresh Token in HttpOnly Cookie and Access Token in memory.
   */
  public async login(email: string, password?: string, role: UserRole = "CONSULTANT"): Promise<AuthUser> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive HttpOnly cookies
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      this.currentSession = {
        user: data.user,
        accessToken: data.accessToken,
        csrfToken: data.csrfToken,
        expiresAt: Date.now() + (data.expiresInSeconds || 900) * 1000,
      };

      this.scheduleTokenRefresh();
      this.notify();

      return data.user;
    } catch (error: any) {
      console.error("[AuthService] Login failed:", error.message);
      throw error;
    }
  }

  /**
   * Silently refresh access token using HttpOnly refresh cookie.
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.currentSession?.csrfToken || "",
        },
        credentials: "include",
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = await response.json();
      this.currentSession = {
        user: data.user,
        accessToken: data.accessToken,
        csrfToken: data.csrfToken,
        expiresAt: Date.now() + (data.expiresInSeconds || 900) * 1000,
      };

      this.scheduleTokenRefresh();
      this.notify();
      return true;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  /**
   * Attempt silent restoration on startup using refresh cookie.
   */
  public async restoreSessionSilently(): Promise<boolean> {
    return await this.refreshToken();
  }

  /**
   * Schedule refresh 1 minute before expiration.
   */
  private scheduleTokenRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    if (!this.currentSession) return;

    const refreshMs = Math.max(10000, this.currentSession.expiresAt - Date.now() - 60000);
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshMs);
  }

  /**
   * Logout user and clear session/cookies.
   */
  public async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.currentSession.accessToken}`,
            "X-CSRF-Token": this.currentSession.csrfToken,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.warn("[AuthService] Logout endpoint call failed:", error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Logout from all devices.
   */
  public async logoutFromAllDevices(): Promise<void> {
    try {
      if (this.currentSession) {
        await fetch("/api/auth/logout-all", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.currentSession.accessToken}`,
            "X-CSRF-Token": this.currentSession.csrfToken,
          },
          credentials: "include",
        });
      }
    } finally {
      this.clearSession();
    }
  }

  /**
   * Request password reset link/token.
   */
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch("/api/auth/reset-password-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  }

  /**
   * Complete password reset with token.
   */
  public async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    return await res.json();
  }

  /**
   * Verify email address with verification token.
   */
  public async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  }

  /**
   * Fetch current user profile.
   */
  public async fetchProfile(): Promise<AuthUser> {
    if (!this.currentSession) throw new Error("Not authenticated");
    const res = await fetch("/api/user/profile", {
      headers: {
        "Authorization": `Bearer ${this.currentSession.accessToken}`,
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    return data.user;
  }

  /**
   * Update profile details.
   */
  public async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentSession) throw new Error("Not authenticated");
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.currentSession.accessToken}`,
        "X-CSRF-Token": this.currentSession.csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    const data = await res.json();
    this.currentSession.user = data.user;
    this.notify();
    return data.user;
  }

  /**
   * Fetch security audit logs for current user.
   */
  public async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    if (!this.currentSession) return [];
    const res = await fetch("/api/auth/audit-logs", {
      headers: {
        "Authorization": `Bearer ${this.currentSession.accessToken}`,
      },
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  }

  private clearSession() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    this.currentSession = null;
    this.notify();
  }
}

export const authService = AuthService.getInstance();
