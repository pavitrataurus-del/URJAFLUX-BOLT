import { describe, it, expect, beforeEach } from "vitest";
import { KnowledgeSourceManager, IKnowledgeSource, ApprovalStatus, KnowledgeNamespaceEngine, INamespace } from "../index";

describe("Knowledge Source Manager", () => {
  beforeEach(() => {
    KnowledgeSourceManager.getInstance().clear();
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

  const validSource: IKnowledgeSource = {
    id: "book_001",
    title: "Vastu Shastra Comprehensive",
    author: "Unknown",
    edition: "1",
    language: "sa",
    approvalStatus: ApprovalStatus.APPROVED,
    namespaceId: "VASTU",
    version: "1.0",
    metadata: {}
  };

  it("should register a source if namespace exists", () => {
    const nsEngine = KnowledgeNamespaceEngine.getInstance();
    const sourceEngine = KnowledgeSourceManager.getInstance();
    
    nsEngine.registerNamespace(validNamespace);
    sourceEngine.registerSource(validSource);
    
    expect(sourceEngine.getSource(validSource.id)).toBeDefined();
  });

  it("should throw if namespace doesn't exist", () => {
    const sourceEngine = KnowledgeSourceManager.getInstance();
    expect(() => sourceEngine.registerSource(validSource)).toThrow("not found");
  });
});
