import { describe, it, expect, beforeEach } from "vitest";
import { ImportPipeline } from "../ImportPipeline";
import { DocumentRegistrationEngine } from "../DocumentRegistrationEngine";
import { ValidationEngine } from "../ValidationEngine";
import { DocumentFormat, ImportStatus, IRegisteredDocument } from "../IngestionTypes";
import { ApprovalStatus, INamespace } from "../../namespace/NamespaceTypes";
import { KnowledgeNamespaceEngine } from "../../namespace/KnowledgeNamespaceEngine";

describe("Import Pipeline", () => {
  beforeEach(() => {
    DocumentRegistrationEngine.getInstance().clear();
    KnowledgeNamespaceEngine.getInstance().clear();
  });

  const validNamespace: INamespace = {
    id: "VASTU",
    name: "Vastu Shastra",
    version: "1.0",
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    metadata: {},
    compatibilityRules: {}
  };

  const getValidDoc = (): IRegisteredDocument => ({
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
  });

  it("should process document successfully", async () => {
    const nsEngine = KnowledgeNamespaceEngine.getInstance();
    nsEngine.registerNamespace(validNamespace);

    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = getValidDoc();
    docEngine.registerDocument(doc);

    const pipeline = ImportPipeline.getInstance();
    await pipeline.startImport(doc.id);

    const updatedDoc = docEngine.getDocument(doc.id);
    expect(updatedDoc?.importStatus).toBe(ImportStatus.COMPLETED);
    expect(updatedDoc?.processingProgress).toBe(100);
  });

  it("should fail validation if namespace does not exist", async () => {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = getValidDoc();
    docEngine.registerDocument(doc);

    const pipeline = ImportPipeline.getInstance();
    await pipeline.startImport(doc.id);

    const updatedDoc = docEngine.getDocument(doc.id);
    expect(updatedDoc?.importStatus).toBe(ImportStatus.FAILED);
    expect(updatedDoc?.errorMessage).toContain("Invalid namespace");
  });

  it("should allow pausing and resuming processing", () => {
    const docEngine = DocumentRegistrationEngine.getInstance();
    const doc = getValidDoc();
    docEngine.registerDocument(doc);
    docEngine.updateDocument(doc.id, { importStatus: ImportStatus.PROCESSING });

    const pipeline = ImportPipeline.getInstance();
    pipeline.pauseImport(doc.id);

    let updatedDoc = docEngine.getDocument(doc.id);
    expect(updatedDoc?.importStatus).toBe(ImportStatus.PAUSED);

    pipeline.resumeImport(doc.id);
    updatedDoc = docEngine.getDocument(doc.id);
    expect(updatedDoc?.importStatus).toBe(ImportStatus.PROCESSING);
  });
});
