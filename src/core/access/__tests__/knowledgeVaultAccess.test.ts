import { describe, expect, it } from "vitest";
import {
  canAccessAppView,
  canAccessKnowledgeHub,
  canAccessKnowledgeVault,
  filterClientsForRole,
  resolvePlatformLoginRole,
} from "../knowledgeVaultAccess";

describe("knowledgeVaultAccess", () => {
  it("allows vault and libraries only for FOUNDER role", () => {
    expect(canAccessKnowledgeVault("FOUNDER")).toBe(true);
    expect(canAccessKnowledgeHub("FOUNDER")).toBe(true);
    expect(canAccessKnowledgeVault("SUPER_ADMIN")).toBe(false);
    expect(canAccessKnowledgeHub("CONSULTANT")).toBe(false);
  });

  it("restricts subscribers to report workflow views only", () => {
    expect(canAccessAppView("CONSULTANT", "clients")).toBe(true);
    expect(canAccessAppView("CONSULTANT", "reports")).toBe(true);
    expect(canAccessAppView("CONSULTANT", "workspace")).toBe(true);
    expect(canAccessAppView("CONSULTANT", "knowledge")).toBe(false);
    expect(canAccessAppView("CONSULTANT", "dashboard")).toBe(false);
  });

  it("allows founder full workflow plus knowledge vault", () => {
    expect(canAccessAppView("FOUNDER", "workspace")).toBe(true);
    expect(canAccessAppView("FOUNDER", "reports")).toBe(true);
    expect(canAccessAppView("FOUNDER", "brand_profile")).toBe(true);
    expect(canAccessAppView("FOUNDER", "knowledge_vault")).toBe(true);
  });

  it("isolates client records per paid subscriber", () => {
    const clients = [
      { id: "1", ownerUserId: "usr_a", organizationId: "usr_a", name: "A", email: "", phone: "", company: "", status: "Active" as const, joinedDate: "2026-01-01" },
      { id: "2", ownerUserId: "usr_b", organizationId: "usr_b", name: "B", email: "", phone: "", company: "", status: "Active" as const, joinedDate: "2026-01-02" },
    ];
    const scoped = filterClientsForRole(clients, "CONSULTANT", { userId: "usr_a", organizationId: "usr_a" });
    expect(scoped).toHaveLength(1);
    expect(scoped[0].id).toBe("1");
  });

  it("resolves founder from email or explicit role", () => {
    expect(resolvePlatformLoginRole("founder@urjaflux.ai")).toBe("FOUNDER");
    expect(resolvePlatformLoginRole("admin@urjaflux.ai", "FOUNDER")).toBe("FOUNDER");
    expect(resolvePlatformLoginRole("admin@urjaflux.ai")).toBe("SUPER_ADMIN");
    expect(resolvePlatformLoginRole("consultant@urjaflux.ai")).toBe("CONSULTANT");
  });
});
