// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE EXTRACTION ENGINE (KEE) FACADE
// Core KEE Engine converts Founder-approved sources into Knowledge Vault Records
// ============================================================================

import { 
  IKeeInputContent, 
  IKeeExtractionResult, 
  IKeeExtractedItem 
} from "../types/kee.types";
import { MultiCategoryExtractor } from "../pipeline/MultiCategoryExtractor";
import { RelationshipPreservationEngine } from "../pipeline/RelationshipPreservationEngine";
import { KnowledgeVaultStore } from "../../../knowledge_vault/store/KnowledgeVaultStore";
import { IStructuredKnowledgeItem } from "../../../knowledge_ingestion/types/knowledgePipeline.types";

export class KnowledgeExtractionEngine {
  private static instance: KnowledgeExtractionEngine;

  private extractor = new MultiCategoryExtractor();
  private relationshipEngine = new RelationshipPreservationEngine();
  private vaultStore = KnowledgeVaultStore.getInstance();

  private constructor() {}

  public static getInstance(): KnowledgeExtractionEngine {
    if (!KnowledgeExtractionEngine.instance) {
      KnowledgeExtractionEngine.instance = new KnowledgeExtractionEngine();
    }
    return KnowledgeExtractionEngine.instance;
  }

  /**
   * Processes Founder-approved content package and extracts structured items into Knowledge Vault
   */
  public extractAndStore(input: IKeeInputContent): IKeeExtractionResult {
    if (input.founderApprovalStatus !== 'APPROVED') {
      throw new Error(`[KEE Error] Content ${input.contentId} must be Founder-Approved before extraction.`);
    }

    // 1. Multi-Category Extraction (Literal Unmodified)
    const items = this.extractor.extractFromContent(input);

    // 2. Relationship Preservation
    const relationships = this.relationshipEngine.preserveRelationships(items);

    // 3. Convert & Store into Single Source of Truth Knowledge Vault Records
    items.forEach(item => {
      this.syncItemToVault(item, input);
    });

    const result: IKeeExtractionResult = {
      contentId: input.contentId,
      sourceId: input.sourceReference.sourceId,
      domain: input.sourceReference.domain,
      extractedItemsCount: items.length,
      extractedItems: items,
      relationships,
      extractionTimestamp: new Date().toISOString(),
      keeEngineVersion: "2.0.0-CANONICAL",
      traceabilityHash: input.sourceReference.traceabilityHash
    };

    return result;
  }

  /**
   * Transforms extracted item to IStructuredKnowledgeItem and persists to Vault Store
   */
  private syncItemToVault(item: IKeeExtractedItem, input: IKeeInputContent): void {
    const structuredItem: IStructuredKnowledgeItem = {
      id: item.itemId,
      sourceId: input.sourceReference.sourceId,
      domain: input.sourceReference.domain,
      itemType: item.category as any,
      title: `${input.sourceReference.domain} ${item.category}: ${item.verbatimSnippet.slice(0, 50)}...`,
      content: item.verbatimSnippet,
      targetZones: item.domainAttributes.directions || [],
      targetPlanets: item.domainAttributes.planets || [],
      targetChakras: item.domainAttributes.chakras || [],
      conditions: item.category === 'CONDITION' ? [item.verbatimSnippet] : [],
      exceptions: item.category === 'EXCEPTION' ? [item.verbatimSnippet] : [],
      remedies: item.category === 'REMEDY' || item.category === 'ALTERNATIVE_REMEDY' ? [item.verbatimSnippet] : [],
      pageNumber: input.sourceReference.pageNumber,
      lineStart: input.sourceReference.lineStart,
      lineEnd: input.sourceReference.lineEnd,
      chapterSection: input.sourceReference.chapterSection,
      rawQuote: item.verbatimSnippet,
      confidenceScore: 1.0, // Literal verbatim extraction has absolute fidelity
      evidencePriority: 'CRITICAL',
      citation: {
        citationId: `CIT-${item.itemId}`,
        sourceId: input.sourceReference.sourceId,
        sourceTitle: input.sourceReference.bookTitle,
        author: input.sourceReference.authorName,
        edition: input.sourceReference.edition,
        pageNumber: input.sourceReference.pageNumber,
        lineStart: input.sourceReference.lineStart,
        lineEnd: input.sourceReference.lineEnd,
        paragraphRef: input.sourceReference.paragraphRef,
        chapterSection: input.sourceReference.chapterSection,
        exactEvidenceQuote: item.verbatimSnippet,
        traceabilityHash: input.sourceReference.traceabilityHash
      }
    };

    this.vaultStore.storeApprovedItem(
      structuredItem, 
      input.approvedBy, 
      `Extracted via KEE Engine v2.0.0. Category: ${item.category}`
    );
  }
}

export const knowledgeExtractionEngine = KnowledgeExtractionEngine.getInstance();
