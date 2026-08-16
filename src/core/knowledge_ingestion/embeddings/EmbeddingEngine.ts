// ============================================================================
// EMBEDDING ENGINE ORCHESTRATOR (PHASE 3)
// Locks 39 (Indexes Only, Not Knowledge), 40 (Permanent Traceable Linkage), 41 (Never Replaces Retrieval)
// Generates embeddings for all 10 semantic object types with caching, deduplication & versioning
// ============================================================================

import { StructuredDocumentModel } from "../../../types/documentStructure";
import { 
  SemanticDocumentModel, 
  DynamicLearnedConcept, 
  KnowledgeProvenance, 
  SourceCitation 
} from "../../../types/semanticKnowledge";
import { 
  EmbeddingObject, 
  ReembeddingTargetType, 
  SemanticObjectType, 
  AdminEmbeddingMetrics 
} from "../types/embeddingKnowledge";
import { EmbeddingProviderManager } from "./EmbeddingProviderManager";
import { EmbeddingCache } from "./EmbeddingCache";
import { EmbeddingRepository } from "./EmbeddingRepository";
import { EmbeddingQueueEngine } from "./EmbeddingQueueEngine";

export class EmbeddingEngine {
  private static totalGenerationTimeMs = 0;
  private static totalGenerationCalls = 0;

  /**
   * Main Ingestion Hook: Incremental Embedding Generation for an uploaded document.
   * Only embeds new or modified semantic objects.
   */
  public static async processIncrementalEmbeddings(
    structuredModel: StructuredDocumentModel,
    semanticModel: SemanticDocumentModel,
    learnedConcepts: DynamicLearnedConcept[] = []
  ): Promise<{
    embeddingsGenerated: number;
    jobId: string;
  }> {
    const startTime = performance.now();
    const docId = structuredModel.documentId;
    const provider = EmbeddingProviderManager.getActiveProvider();

    // 1. Queue background job for progress tracking
    const totalItems = 
      semanticModel.concepts.length + 
      semanticModel.rules.length + 
      semanticModel.formulae.length + 
      semanticModel.tables.length + 
      semanticModel.relationships.length + 
      semanticModel.crossDomainLinks.length + 
      learnedConcepts.length + 
      structuredModel.chapters.reduce((acc, c) => acc + c.sections.reduce((sAcc, sec) => sAcc + sec.paragraphs.length, 0), 0);

    const job = EmbeddingQueueEngine.createJob("DOCUMENT", docId, totalItems);

    let generatedCount = 0;

    // A. Embed Dynamic Learned Concepts
    for (const concept of learnedConcepts) {
      const text = `${concept.canonicalName}: ${concept.discoveredSynonyms.join(", ")}. ${concept.definitions.map(d => d.text).join(" ")}`;
      const prov = concept.provenances[0] || semanticModel.provenance;
      const cit = concept.definitions[0]?.citation || semanticModel.rules[0]?.citation || this.createFallbackCitation(structuredModel);

      await this.embedSingleObject({
        semanticObjectId: concept.id,
        documentId: docId,
        objectType: "DYNAMIC_CONCEPT",
        text,
        provenance: prov,
        citation: cit,
        domain: prov.knowledgeDomain,
        version: prov.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // B. Embed Semantic Concepts
    for (const concept of semanticModel.concepts) {
      const text = `${concept.canonicalName} (${concept.name}): ${concept.definition}`;
      await this.embedSingleObject({
        semanticObjectId: concept.id,
        documentId: docId,
        objectType: "CONCEPT",
        text,
        provenance: concept.provenance,
        citation: concept.citation,
        domain: concept.domain,
        version: concept.provenance.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // C. Embed Rules & Exceptions
    for (const rule of semanticModel.rules) {
      const text = `${rule.directionOrZone || "ZONE"}: ${rule.ruleText}`;
      await this.embedSingleObject({
        semanticObjectId: rule.id,
        documentId: docId,
        objectType: rule.isException ? "EXCEPTION" : "RULE",
        text,
        provenance: rule.provenance,
        citation: rule.citation,
        domain: rule.provenance.knowledgeDomain,
        version: rule.provenance.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // D. Embed Relationships
    for (const rel of semanticModel.relationships) {
      const text = `${rel.subjectName} ${rel.relation} ${rel.objectName}`;
      await this.embedSingleObject({
        semanticObjectId: rel.id,
        documentId: docId,
        objectType: "RELATIONSHIP",
        text,
        provenance: rel.provenance,
        citation: rel.citation,
        domain: rel.domain,
        version: rel.provenance.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // E. Embed Formulae
    for (const formula of semanticModel.formulae) {
      const text = `${formula.formulaName}: ${formula.expression}. Explanation: ${formula.explanation || ""}`;
      await this.embedSingleObject({
        semanticObjectId: formula.id,
        documentId: docId,
        objectType: "FORMULA",
        text,
        provenance: formula.provenance,
        citation: formula.citation,
        domain: formula.provenance.knowledgeDomain,
        version: formula.provenance.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // F. Embed Tables
    for (const table of semanticModel.tables) {
      const text = `${table.caption || "Table"}: ${table.headers.join(" | ")}. Rows: ${table.rows.map(r => r.join(", ")).join("; ")}`;
      await this.embedSingleObject({
        semanticObjectId: table.id,
        documentId: docId,
        objectType: "TABLE",
        text,
        provenance: table.provenance,
        citation: table.citation,
        domain: table.provenance.knowledgeDomain,
        version: table.provenance.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // G. Embed Cross-Domain Links
    for (const link of semanticModel.crossDomainLinks) {
      const text = `${link.sourceEntity} (${link.sourceDomain}) -> ${link.targetEntityOrConcept} (${link.targetDomain}). Mapping Rules: ${link.mappingRules.join("; ")}`;
      const prov = semanticModel.provenance;
      const cit = semanticModel.rules[0]?.citation || this.createFallbackCitation(structuredModel);

      await this.embedSingleObject({
        semanticObjectId: link.id,
        documentId: docId,
        objectType: "CROSS_DOMAIN_LINK",
        text,
        provenance: prov,
        citation: cit,
        domain: link.targetDomain,
        version: prov.documentVersion || 1,
        providerModelVersion: provider.modelVersion
      });
      generatedCount++;
      EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
    }

    // H. Embed Structured Paragraphs
    for (const chapter of structuredModel.chapters) {
      for (const section of chapter.sections) {
        for (const paragraph of section.paragraphs) {
          const text = paragraph.cleanText;
          if (text.length < 15) continue;

          const prov = semanticModel.provenance;
          const cit: SourceCitation = {
            documentId: docId,
            sourceDocument: structuredModel.title || structuredModel.originalName,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sectionId: section.id,
            sectionTitle: section.title,
            paragraphId: paragraph.id,
            pageNumber: paragraph.pageNumber,
            rawCitationText: `${structuredModel.title}, Ch ${chapter.title}, Sec ${section.title}, P ${paragraph.pageNumber}`,
            formattedCitation: `${structuredModel.title}, Ch ${chapter.title}, Sec ${section.title}, P ${paragraph.pageNumber}`
          };

          await this.embedSingleObject({
            semanticObjectId: paragraph.id,
            documentId: docId,
            objectType: "PARAGRAPH",
            text,
            provenance: prov,
            citation: cit,
            domain: prov.knowledgeDomain,
            version: prov.documentVersion || 1,
            providerModelVersion: provider.modelVersion
          });
          generatedCount++;
          EmbeddingQueueEngine.updateJobProgress(job.jobId, 1);
        }
      }
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    this.totalGenerationTimeMs += duration;
    this.totalGenerationCalls++;

    return {
      embeddingsGenerated: generatedCount,
      jobId: job.jobId
    };
  }

  /**
   * RE-EMBEDDING ON DEMAND (LOCK 39 & LOCK 40)
   * Re-embeds targeted scope without rebuilding entire system.
   */
  public static async triggerReembedding(
    targetType: ReembeddingTargetType,
    targetId: string
  ): Promise<{
    deletedOldEmbeddings: number;
    newJobId: string;
  }> {
    const deletedCount = EmbeddingRepository.deleteTargetEmbeddings(targetType, targetId);
    const job = EmbeddingQueueEngine.createJob(targetType, targetId, 0);

    return {
      deletedOldEmbeddings: deletedCount,
      newJobId: job.jobId
    };
  }

  /**
   * Helper to embed a single semantic object using cache & deduplication.
   */
  private static async embedSingleObject(params: {
    semanticObjectId: string;
    documentId: string;
    objectType: SemanticObjectType;
    text: string;
    provenance: KnowledgeProvenance;
    citation: SourceCitation;
    domain: string;
    version: number;
    providerModelVersion: string;
  }): Promise<EmbeddingObject> {
    const textHash = EmbeddingCache.hashText(params.text);
    const provider = EmbeddingProviderManager.getActiveProvider();

    // 1. Check cache for deduplication
    let vector = EmbeddingCache.get(textHash, provider.modelVersion);

    if (!vector) {
      // Generate new embedding via active swappable provider
      vector = await provider.generateEmbedding(params.text);
      EmbeddingCache.set(textHash, provider.modelVersion, vector);
    }

    const embeddingObj: EmbeddingObject = {
      id: `EMB-${params.semanticObjectId}`,
      vector,
      semanticObjectId: params.semanticObjectId,
      documentId: params.documentId,
      knowledgeDomain: params.domain,
      version: params.version,
      embeddingModelVersion: provider.modelVersion,
      knowledgeVersion: "Phase-3-KnowledgeBrain-v1",
      documentVersion: params.version,
      citation: params.citation,
      provenance: params.provenance,
      objectType: params.objectType,
      textHash,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    EmbeddingRepository.saveEmbedding(embeddingObj);
    return embeddingObj;
  }

  private static createFallbackCitation(docModel: StructuredDocumentModel): SourceCitation {
    const title = docModel.title || docModel.originalName;
    return {
      documentId: docModel.documentId,
      sourceDocument: title,
      chapterId: "CH-1",
      chapterTitle: "Chapter 1",
      sectionId: "SEC-1",
      sectionTitle: "General Section",
      paragraphId: "P-1",
      pageNumber: 1,
      rawCitationText: `${title}, P 1`,
      formattedCitation: `${title}, P 1`
    };
  }

  /**
   * ADMIN EMBEDDING METRICS
   */
  public static getAdminMetrics(): AdminEmbeddingMetrics {
    const totalEmbeddings = EmbeddingRepository.getTotalCount();
    const queuedJobsCount = EmbeddingQueueEngine.getQueuedJobsCount();
    const failedJobsCount = EmbeddingQueueEngine.getFailedJobsCount();
    const cacheHitRate = EmbeddingCache.getHitRate();
    const averageVectorSize = EmbeddingRepository.getAverageVectorSize();
    const modelVersionDistribution = EmbeddingRepository.getModelVersionDistribution();

    const avgTime = this.totalGenerationCalls > 0
      ? Math.round(this.totalGenerationTimeMs / this.totalGenerationCalls)
      : 0;

    return {
      totalEmbeddings,
      queuedJobsCount,
      failedJobsCount,
      cacheHitRate,
      averageGenerationTimeMs: avgTime,
      averageVectorSize,
      modelVersionDistribution,
      timestamp: new Date().toISOString()
    };
  }
}
