import { describe, it, expect, beforeEach } from "vitest";
import { KnowledgeNamespaceEngine, INamespace, ApprovalStatus } from "../index";

describe("Knowledge Namespace Engine", () => {
  beforeEach(() => {
    KnowledgeNamespaceEngine.getInstance().clear();
  });

  const validNamespace: INamespace = {
    id: "VASTU",
    name: "Vastu Shastra",
    version: "1.0",
    isActive: false,
    approvalStatus: ApprovalStatus.APPROVED,
    metadata: {},
    compatibilityRules: {}
  };

  it("should register a namespace", () => {
    const engine = KnowledgeNamespaceEngine.getInstance();
    engine.registerNamespace(validNamespace);
    expect(engine.getNamespace("VASTU")).toBeDefined();
  });

  it("should activate approved namespaces", () => {
    const engine = KnowledgeNamespaceEngine.getInstance();
    engine.registerNamespace(validNamespace);
    engine.activateNamespace("VASTU");
    expect(engine.getNamespace("VASTU")?.isActive).toBe(true);
  });

  it("should not activate unapproved namespaces", () => {
    const engine = KnowledgeNamespaceEngine.getInstance();
    const draftNs: INamespace = { ...validNamespace, id: "DRAFT_NS", approvalStatus: ApprovalStatus.DRAFT };
    engine.registerNamespace(draftNs);
    expect(() => engine.activateNamespace("DRAFT_NS")).toThrow("is not APPROVED");
  });
});
