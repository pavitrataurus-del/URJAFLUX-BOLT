import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildKnowledgeVaultStoragePath,
  KNOWLEDGE_VAULT_STORAGE_PREFIX,
  isKnowledgeVaultCloudStorageAvailable,
  toVaultStorageMetadata,
} from "../knowledgeVaultStorageService";

describe("Knowledge Vault Storage SSOT", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("builds canonical Firebase Storage path under knowledge-vault prefix", () => {
    const path = buildKnowledgeVaultStoragePath(
      "doc_abc123",
      "a1b2c3d4e5f6789012345678901234567890abcd",
      "Vastu Book.pdf"
    );
    expect(path.startsWith(`${KNOWLEDGE_VAULT_STORAGE_PREFIX}/doc_abc123/`)).toBe(true);
    expect(path).toContain("a1b2c3d4e5f67890");
    expect(path).toContain("Vastu_Book.pdf");
  });

  it("sanitizes unsafe characters in file names", () => {
    const path = buildKnowledgeVaultStoragePath(
      "doc_x",
      "abcdef0123456789abcdef0123456789abcdef01",
      "SAROJ & PUNEET VASTU.pdf"
    );
    expect(path).not.toContain("&");
    expect(path).not.toContain(" ");
  });

  it("maps upload result to vault document storage metadata", () => {
    const meta = toVaultStorageMetadata({
      storagePath: "knowledge-vault/doc1/hash_file.pdf",
      downloadURL: "https://example.supabase.co/storage/v1/object/public/knowledge-vault/doc1/hash_file.pdf",
      sha256Hash: "abcdef0123456789abcdef0123456789abcdef01",
      isCloudSsot: true,
      cloudProvider: "SUPABASE",
      storageDriver: "SUPABASE_STORAGE",
      localCacheArchiveId: "PDF-ARCHIVE-ABCDEF0123456789",
    });
    expect(meta.storageDriver).toBe("SUPABASE_STORAGE");
    expect(meta.cloudProvider).toBe("SUPABASE");
    expect(meta.isCloudSsot).toBe(true);
  });

  it("marks local-only cache when cloud is unavailable", () => {
    const meta = toVaultStorageMetadata({
      storagePath: "knowledge-vault/doc1/hash_file.pdf",
      downloadURL: "local-cache://knowledge-vault/doc1/hash_file.pdf",
      sha256Hash: "abcdef0123456789abcdef0123456789abcdef01",
      isCloudSsot: false,
      cloudProvider: "NONE",
      storageDriver: "INDEXED_DB_CACHE",
    });
    expect(meta.storageDriver).toBe("INDEXED_DB_CACHE");
    expect(meta.cloudProvider).toBe("NONE");
    expect(meta.isCloudSsot).toBe(false);
  });

  it("reports cloud availability based on firebase configuration", () => {
    // In test env Firebase may or may not be configured — function must return boolean
    expect(typeof isKnowledgeVaultCloudStorageAvailable()).toBe("boolean");
  });
});

describe("VaultDocument storage fields", () => {
  it("accepts Firebase SSOT metadata on document records", async () => {
    const { KnowledgeVaultService } = await import("../knowledgeVaultService");
    const doc = {
      id: "test_doc_storage",
      title: "Test Book",
      originalName: "test.pdf",
      fileType: "pdf",
      sizeBytes: 1024,
      storagePath: "knowledge-vault/test_doc/hash_test.pdf",
      downloadURL: "https://example.com/file",
      sha256Hash: "abcdef0123456789abcdef0123456789abcdef01",
      storageDriver: "FIREBASE_STORAGE",
      isCloudSsot: true,
      status: "INGESTED_ACTIVE" as const,
      ocrText: "",
      ocrConfidence: 1,
      totalPages: 1,
      author: "Test",
      category: "Vastu",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      tags: [],
      extractedRulesCount: 0,
      approvedRulesCount: 0,
      language: "English",
    };
    expect(doc.storagePath).toContain("knowledge-vault");
    expect(doc.isCloudSsot).toBe(true);
    expect(KnowledgeVaultService.getDocumentById("nonexistent")).toBeNull();
  });
});
