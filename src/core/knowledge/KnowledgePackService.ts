// Module 9: Custom Knowledge Pack Importer / Exporter
import {
  KnowledgePackExport,
  KnowledgePackManifest,
  KnowledgeDocument
} from "../../types/knowledgeIntelligence";
import { KnowledgeLibraryService } from "./KnowledgeLibraryService";
import { KnowledgeGraphEngine } from "./KnowledgeGraphEngine";
import { VectorEmbeddingEngine } from "./VectorEmbeddingEngine";

class KnowledgePackServiceStore {
  public exportKnowledgePack(
    packName: string,
    description: string,
    tenantId: string,
    category?: string
  ): KnowledgePackExport {
    const documents = KnowledgeLibraryService.getDocuments(tenantId, category);
    const chunks = VectorEmbeddingEngine.getAllIndexedChunks(tenantId);
    const graphNodes = KnowledgeGraphEngine.getNodes(tenantId);
    const graphEdges = KnowledgeGraphEngine.getEdges(tenantId);

    const manifest: KnowledgePackManifest = {
      packId: `PACK-${Date.now().toString(36).toUpperCase()}`,
      name: packName,
      description,
      version: "1.0.0",
      author: "URJAFLUX Knowledge Engineer",
      category: category || "General Knowledge",
      createdDate: new Date().toISOString(),
      documentsCount: documents.length,
      rulesCount: chunks.length,
      formulasCount: chunks.filter(c => c.type === "FORMULA").length,
      graphTripletsCount: graphEdges.length
    };

    return {
      manifest,
      documents,
      chunks,
      graphNodes,
      graphEdges
    };
  }

  public validatePackSchema(packData: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!packData || typeof packData !== "object") {
      return { valid: false, errors: ["Invalid JSON format or null object"] };
    }

    const pack = packData as Partial<KnowledgePackExport>;
    if (!pack.manifest || !pack.manifest.packId || !pack.manifest.name) {
      errors.push("Missing required manifest header (packId, name)");
    }
    if (!Array.isArray(pack.documents)) {
      errors.push("Documents array missing or invalid");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public importKnowledgePack(
    packData: KnowledgePackExport,
    tenantId: string,
    mergeStrategy: "OVERWRITE" | "SKIP_EXISTING" | "CREATE_NEW_VERSION" = "CREATE_NEW_VERSION"
  ): { importedDocsCount: number; importedNodesCount: number } {
    let importedDocsCount = 0;
    let importedNodesCount = 0;

    packData.documents.forEach((doc: KnowledgeDocument) => {
      const existing = KnowledgeLibraryService.getDocumentById(doc.id, tenantId);

      if (existing) {
        if (mergeStrategy === "SKIP_EXISTING") return;
        if (mergeStrategy === "OVERWRITE" || mergeStrategy === "CREATE_NEW_VERSION") {
          KnowledgeLibraryService.updateDocument(doc.id, tenantId, {
            title: doc.title,
            content: doc.content,
            category: doc.metadata.category,
            tags: doc.metadata.tags,
            changeSummary: `Imported from Knowledge Pack ${packData.manifest.name}`,
            editorName: "Knowledge Pack Importer"
          });
          importedDocsCount++;
        }
      } else {
        KnowledgeLibraryService.createDocument(
          doc.title,
          doc.content,
          doc.metadata,
          tenantId,
          "Knowledge Pack Importer"
        );
        importedDocsCount++;
      }
    });

    if (Array.isArray(packData.graphNodes)) {
      packData.graphNodes.forEach(node => {
        KnowledgeGraphEngine.addNode({ ...node, tenantId });
        importedNodesCount++;
      });
    }

    if (Array.isArray(packData.graphEdges)) {
      packData.graphEdges.forEach(edge => {
        KnowledgeGraphEngine.addEdge({ ...edge, tenantId });
      });
    }

    return { importedDocsCount, importedNodesCount };
  }
}

export const KnowledgePackService = new KnowledgePackServiceStore();
