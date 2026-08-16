import type { Client, ProjectReport, Property } from "../../types/app";

/** Platform roles that may appear in session / localStorage. */
export type AppPlatformRole =
  | "FOUNDER"
  | "SUPER_ADMIN"
  | "CONSULTANT"
  | "CLIENT"
  | "ADMIN"
  | "END_USER";

/** Paid subscriber (consultant) — own clients & reports only. */
export type PaidSubscriberRole = "CONSULTANT";

export interface SubscriberScope {
  userId: string;
  organizationId?: string;
  email?: string;
}

/** Knowledge Vault + all shastra libraries — founder-only. */
export function canAccessKnowledgeVault(role?: string | null): boolean {
  return role === "FOUNDER";
}

export function canAccessKnowledgeHub(role?: string | null): boolean {
  return role === "FOUNDER";
}

export function isFounderRole(role?: string | null): boolean {
  return role === "FOUNDER";
}

export function isPaidSubscriber(role?: string | null): boolean {
  return role === "CONSULTANT";
}

/** Views a paid subscriber may use (report workflow only — no founder supervision tools). */
export const SUBSCRIBER_ALLOWED_VIEWS = [
  "clients",
  "reports",
  "workspace",
  "brand_profile",
  "settings",
] as const;

export type SubscriberAllowedView = (typeof SUBSCRIBER_ALLOWED_VIEWS)[number];

export function getDefaultViewForRole(role?: string | null): string {
  if (role === "FOUNDER") return "knowledge_vault";
  if (role === "CONSULTANT") return "clients";
  if (role === "SUPER_ADMIN") return "dashboard";
  return "clients";
}

export function canAccessAppView(role?: string | null, viewId?: string): boolean {
  if (!viewId) return false;
  if (isFounderRole(role)) return true;
  if (isPaidSubscriber(role)) {
    return SUBSCRIBER_ALLOWED_VIEWS.includes(viewId as SubscriberAllowedView);
  }
  if (role === "SUPER_ADMIN") {
    const blocked = ["knowledge", "knowledge_vault", "clients", "reports", "brand_profile"];
    return !blocked.includes(viewId);
  }
  return false;
}

export function deriveUserIdFromEmail(email: string): string {
  const normalized = (email || "").toLowerCase().trim();
  const hash = normalized.replace(/[^a-z0-9@._-]/g, "");
  return `usr_${hash.replace(/[@.]/g, "_")}`;
}

export function buildSubscriberScope(
  userId: string,
  organizationId?: string,
  email?: string
): SubscriberScope {
  return {
    userId,
    organizationId: organizationId || userId,
    email,
  };
}

export function filterClientsForRole(
  clients: Client[],
  role: string | null | undefined,
  scope: SubscriberScope
): Client[] {
  if (isFounderRole(role)) return clients;
  if (isPaidSubscriber(role)) {
    return clients.filter(
      (c) => c.ownerUserId === scope.userId || c.organizationId === scope.organizationId
    );
  }
  return [];
}

export function filterPropertiesForRole(
  properties: Property[],
  role: string | null | undefined,
  scope: SubscriberScope,
  ownedClientIds: Set<string>
): Property[] {
  if (isFounderRole(role)) return properties;
  if (isPaidSubscriber(role)) {
    return properties.filter(
      (p) =>
        p.ownerUserId === scope.userId ||
        p.organizationId === scope.organizationId ||
        ownedClientIds.has(p.clientId)
    );
  }
  return [];
}

export function filterReportsForRole(
  reports: ProjectReport[],
  role: string | null | undefined,
  scope: SubscriberScope,
  ownedClientIds: Set<string>
): ProjectReport[] {
  if (isFounderRole(role)) return reports;
  if (isPaidSubscriber(role)) {
    return reports.filter(
      (r) =>
        r.ownerUserId === scope.userId ||
        r.organizationId === scope.organizationId ||
        ownedClientIds.has(r.clientId)
    );
  }
  return [];
}

/** Resolve session role from login email + optional requested role. */
export function resolvePlatformLoginRole(
  email: string,
  requestedRole?: string
): "FOUNDER" | "SUPER_ADMIN" | "CONSULTANT" | "CLIENT" {
  const emailLower = (email || "").toLowerCase().trim();

  if (requestedRole === "FOUNDER" || emailLower.includes("founder")) {
    return "FOUNDER";
  }
  if (requestedRole === "SUPER_ADMIN" || emailLower.includes("admin")) {
    return "SUPER_ADMIN";
  }
  if (requestedRole === "CLIENT" || emailLower.includes("client")) {
    return "CLIENT";
  }
  return "CONSULTANT";
}

export function normalizeStoredPlatformRole(saved: string | null): AppPlatformRole | null {
  if (!saved) return null;
  if (saved === "FOUNDER") return "FOUNDER";
  if (saved === "SUPER_ADMIN" || saved === "ADMIN") return "SUPER_ADMIN";
  if (saved === "CONSULTANT" || saved === "END_USER") return "CONSULTANT";
  if (saved === "CLIENT") return "CLIENT";
  return null;
}
