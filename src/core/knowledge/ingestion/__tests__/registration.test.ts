import { describe, it, expect, beforeEach } from "vitest";
import { DocumentRegistrationEngine } from "../DocumentRegistrationEngine";
import { DocumentFormat, ImportStatus, IRegisteredDocument } from "../IngestionTypes";
import { ApprovalStatus } from "../../namespace/NamespaceTypes";

describe("Document Registration Engine", () => {
  beforeEach(() => {
    DocumentRegistrationEngine.getInstance().clear();
  });

  const validDoc: IRegisteredDocument = {
    id: "doc_001",
    fileId: "file_123",
    version: "1.0",
    format: DocumentFormat.PDF,
    approvalStatus: ApprovalStatus.APPROVED,
    importStatus: ImportStatus.PENDING,
    processingProgress: 0,
    metadata: {
      namespaceId: "VASTU",
      sourceType: "BOOK",
      checksum: "chk_abc",
      documentSize: 1024
    }
  };

  it("should register a valid document", () => {
    const engine = DocumentRegistrationEngine.getInstance();
    engine.registerDocument(validDoc);
    expect(engine.getDocument(validDoc.id)).toBeDefined();
  });

  it("should prevent duplicate document registration", () => {
    const engine = DocumentRegistrationEngine.getInstance();
    engine.registerDocument(validDoc);
    expect(() => engine.registerDocument(validDoc)).toThrow("already registered");
  });

  it("should throw error if namespace ID is missing", () => {
    const engine = DocumentRegistrationEngine.getInstance();
    const invalidDoc: any = { ...validDoc, metadata: { ...validDoc.metadata, namespaceId: undefined } };
    expect(() => engine.registerDocument(invalidDoc)).toThrow("Namespace ID is required in metadata");
  });
});
