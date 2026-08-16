// Module 1 & 10: Knowledge Library & Tenant Isolation Service
import {
  KnowledgeDocument,
  KnowledgeDocumentMetadata,
  DocumentVersion,
  DocumentStatus
} from "../../types/knowledgeIntelligence";

class KnowledgeLibraryServiceStore {
  private documents: Map<string, KnowledgeDocument> = new Map();

  constructor() {
    this.loadFromStorage();
    if (this.documents.size === 0) {
      this.seedInitialLibrary();
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("urjaflux_ki_documents", JSON.stringify(Array.from(this.documents.values())));
    } catch (e) {
      console.warn("[KnowledgeLibraryService] LocalStorage write error", e);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem("urjaflux_ki_documents");
      if (data) {
        const parsed: KnowledgeDocument[] = JSON.parse(data);
        parsed.forEach(doc => this.documents.set(doc.id, doc));
      }
    } catch (e) {
      console.error("[KnowledgeLibraryService] Failed to parse stored documents", e);
    }
  }

  private seedInitialLibrary(): void {
    const seedDocs: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      author: string;
      tenantId: string;
      isGlobalCanon?: boolean;
    }[] = [];

    seedDocs.forEach((seed, idx) => {
      const docId = `KDOC-${1001 + idx}`;
      const now = new Date().toISOString();
      const meta: KnowledgeDocumentMetadata = {
        author: seed.author,
        publisher: "Classical & Enterprise Knowledge Repository",
        edition: "Standard Enterprise Edition",
        language: "English & Sanskrit",
        category: seed.category,
        subCategory: "Core Guidelines",
        tags: seed.tags,
        accessLevel: seed.isGlobalCanon ? "PUBLIC" : "CONFIDENTIAL",
        tenantId: seed.tenantId,
        isGlobalCanon: seed.isGlobalCanon
      };

      const initialVer: DocumentVersion = {
        id: `VER-1.0.0-${docId}`,
        documentId: docId,
        versionNumber: "1.0.0",
        changeSummary: "Initial ingestion into Knowledge Repository",
        author: seed.author,
        timestamp: now,
        snapshotContent: seed.content,
        snapshotMetadata: meta
      };

      const kDoc: KnowledgeDocument = {
        id: docId,
        tenantId: seed.tenantId,
        title: seed.title,
        summary: seed.content.substring(0, 150) + "...",
        content: seed.content,
        metadata: meta,
        status: "PUBLISHED",
        currentVersion: "1.0.0",
        chunksCount: 0,
        versions: [initialVer],
        createdAt: now,
        updatedAt: now
      };

      this.documents.set(docId, kDoc);
    });

    this.saveToStorage();
  }

  public getDocuments(tenantId: string, category?: string): KnowledgeDocument[] {
    return Array.from(this.documents.values()).filter(doc => {
      // Tenant Isolation Policy: allow matching tenant OR global shared canon
      const tenantMatch = doc.tenantId === tenantId || doc.metadata.isGlobalCanon || doc.tenantId === "global_tenant";
      if (!tenantMatch) return false;
      if (category && doc.metadata.category !== category) return false;
      return true;
    });
  }

  public getDocumentById(id: string, tenantId: string): KnowledgeDocument | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    const tenantMatch = doc.tenantId === tenantId || doc.metadata.isGlobalCanon || doc.tenantId === "global_tenant";
    return tenantMatch ? doc : undefined;
  }

  public createDocument(
    title: string,
    content: string,
    metadata: Omit<KnowledgeDocumentMetadata, "tenantId">,
    tenantId: string,
    creatorName: string = "System Ingestion"
  ): KnowledgeDocument {
    const docId = `KDOC-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const fullMeta: KnowledgeDocumentMetadata = {
      ...metadata,
      tenantId
    };

    const versionOne: DocumentVersion = {
      id: `VER-1.0.0-${docId}`,
      documentId: docId,
      versionNumber: "1.0.0",
      changeSummary: "Document created",
      author: creatorName,
      timestamp: now,
      snapshotContent: content,
      snapshotMetadata: fullMeta
    };

    const newDoc: KnowledgeDocument = {
      id: docId,
      tenantId,
      title,
      summary: content.substring(0, 180) + "...",
      content,
      metadata: fullMeta,
      status: "PUBLISHED",
      currentVersion: "1.0.0",
      chunksCount: 0,
      versions: [versionOne],
      createdAt: now,
      updatedAt: now
    };

    this.documents.set(docId, newDoc);
    this.saveToStorage();
    return newDoc;
  }

  public updateDocument(
    id: string,
    tenantId: string,
    updates: {
      title?: string;
      content?: string;
      status?: DocumentStatus;
      category?: string;
      tags?: string[];
      changeSummary?: string;
      editorName?: string;
    }
  ): KnowledgeDocument | undefined {
    const doc = this.getDocumentById(id, tenantId);
    if (!doc) return undefined;

    const now = new Date().toISOString();
    const verParts = doc.currentVersion.split(".");
    const newPatch = parseInt(verParts[2] || "0", 10) + 1;
    const nextVerStr = `${verParts[0]}.${verParts[1]}.${newPatch}`;

    const newContent = updates.content !== undefined ? updates.content : doc.content;
    const newTitle = updates.title || doc.title;

    const updatedMeta: KnowledgeDocumentMetadata = {
      ...doc.metadata,
      category: updates.category || doc.metadata.category,
      tags: updates.tags || doc.metadata.tags
    };

    const newVersion: DocumentVersion = {
      id: `VER-${nextVerStr}-${doc.id}-${Date.now().toString(36)}`,
      documentId: doc.id,
      versionNumber: nextVerStr,
      changeSummary: updates.changeSummary || "Updated document content or properties",
      author: updates.editorName || "System Editor",
      timestamp: now,
      snapshotContent: newContent,
      snapshotMetadata: updatedMeta
    };

    doc.title = newTitle;
    doc.content = newContent;
    doc.summary = newContent.substring(0, 180) + "...";
    doc.status = updates.status || doc.status;
    doc.metadata = updatedMeta;
    doc.currentVersion = nextVerStr;
    doc.versions.unshift(newVersion);
    doc.updatedAt = now;

    this.documents.set(doc.id, doc);
    this.saveToStorage();
    return doc;
  }

  public rollbackVersion(
    docId: string,
    tenantId: string,
    versionId: string,
    rollbackAuthor: string = "Admin Agent"
  ): KnowledgeDocument | undefined {
    const doc = this.getDocumentById(docId, tenantId);
    if (!doc) return undefined;

    const targetVersion = doc.versions.find(v => v.id === versionId);
    if (!targetVersion) return undefined;

    return this.updateDocument(docId, tenantId, {
      title: doc.title,
      content: targetVersion.snapshotContent,
      category: targetVersion.snapshotMetadata.category,
      tags: targetVersion.snapshotMetadata.tags,
      changeSummary: `Rollback to version ${targetVersion.versionNumber}`,
      editorName: rollbackAuthor
    });
  }

  public deleteDocument(id: string, tenantId: string): boolean {
    const doc = this.getDocumentById(id, tenantId);
    if (!doc) return false;
    this.documents.delete(id);
    this.saveToStorage();
    return true;
  }
}

export const KnowledgeLibraryService = new KnowledgeLibraryServiceStore();
