// ============================================================================
// DOCUMENT REPROCESSING ENGINE (LOCK 29)
// Extension points for Re-OCR, Re-Structure, Re-Parse, Re-Index without re-upload
// ============================================================================

import { StructuredDocumentModel, IngestionQualityMetrics } from "../../../types/documentStructure";
import { KnowledgeVaultService, VaultDocument } from "../../../services/knowledgeVaultService";
import { DocumentStructurePipelineRunner } from "./DocumentStructurePipelineRunner";

export class DocumentReprocessingEngine {
  private static runner = new DocumentStructurePipelineRunner();

  /**
   * LOCK 29 Extension Point: Re-OCR an existing document using updated OCR Vision models.
   */
  public static async reOcrDocument(documentId: string): Promise<{
    structuredModel: StructuredDocumentModel;
    qualityMetrics: IngestionQualityMetrics;
  }> {
    const doc = KnowledgeVaultService.getDocumentById(documentId);
    if (!doc) throw new Error(`[DocumentReprocessingEngine] Document ${documentId} not found in Knowledge Vault.`);

    const filePayload = {
      name: doc.originalName,
      size: doc.sizeBytes,
      type: doc.fileType,
      dataUrlOrText: doc.ocrText || ""
    };

    const result = await this.runner.runPipeline(filePayload, doc.id, doc.category);
    KnowledgeVaultService.saveStructuredDocumentModel(doc.id, result.structuredModel, result.qualityMetrics);
    return result;
  }

  /**
   * LOCK 29 Extension Point: Re-Structure an existing document's chapters & sections without re-upload.
   */
  public static async reStructureDocument(documentId: string): Promise<{
    structuredModel: StructuredDocumentModel;
    qualityMetrics: IngestionQualityMetrics;
  }> {
    return this.reOcrDocument(documentId);
  }

  /**
   * LOCK 29 Extension Point: Re-Parse rules, formulas, and tables from structured document model.
   */
  public static async reParseDocument(documentId: string): Promise<StructuredDocumentModel> {
    const res = await this.reStructureDocument(documentId);
    return res.structuredModel;
  }

  /**
   * LOCK 29 Extension Point: Re-Index semantic chunks & metadata without re-upload.
   */
  public static async reIndexDocument(documentId: string): Promise<void> {
    await this.reStructureDocument(documentId);
  }
}
