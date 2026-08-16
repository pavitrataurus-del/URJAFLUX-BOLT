// ============================================================================
// KNOWLEDGE RETRIEVAL ENGINE (PHASE 2D)
// 7-Stage Search & Ranking Engine conforming strictly to Locks 34, 35, and 36
// ============================================================================

import { 
  RetrievalQueryOptions, 
  RetrievalQueryResponse, 
  RetrievalResultItem,
  IKeywordSearchProvider,
  ISemanticSearchProvider,
  IVectorSearchProvider,
  IGraphSearchProvider
} from "../../../types/knowledgeRetrieval";
import { KnowledgeIndexManager } from "./KnowledgeIndexManager";
import { SynonymEngine } from "../semantic/SynonymEngine";
import { KnowledgeIntelligenceService } from "../intelligence/KnowledgeIntelligenceService";
import { RetrievalAnalyticsService } from "./RetrievalAnalyticsService";

export class KnowledgeRetrievalEngine implements IKeywordSearchProvider, ISemanticSearchProvider, IVectorSearchProvider, IGraphSearchProvider {

  /**
   * Main Search Entrypoint: Executes 7-Stage Multi-Stage Search
   */
  public async search(options: RetrievalQueryOptions): Promise<RetrievalQueryResponse> {
    const startTime = performance.now();
    const query = options.query.trim();
    const limit = options.limit || 20;
    const minConfidence = options.minConfidence || 0;
    const stagesExecuted: string[] = [];

    const rawCandidatesMap = new Map<string, RetrievalResultItem>();

    // ------------------------------------------------------------------------
    // STAGE 1: EXACT MATCH
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 1: Exact Match");
    this.executeStage1ExactMatch(query, rawCandidatesMap);

    // ------------------------------------------------------------------------
    // STAGE 2: SYNONYM MATCH
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 2: Synonym Match");
    const canonicalTerm = SynonymEngine.resolveCanonicalName(query);
    const synonyms = SynonymEngine.getSynonyms(query);
    this.executeStage2SynonymMatch(synonyms, rawCandidatesMap);

    // ------------------------------------------------------------------------
    // STAGE 3: SEMANTIC CONCEPT MATCH
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 3: Semantic Concept Match");
    this.executeStage3SemanticConceptMatch(canonicalTerm, query, rawCandidatesMap);

    // ------------------------------------------------------------------------
    // STAGE 4: RELATIONSHIP MATCH
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 4: Relationship Match");
    this.executeStage4RelationshipMatch(canonicalTerm, query, rawCandidatesMap);

    // ------------------------------------------------------------------------
    // STAGE 5: CROSS-DOMAIN MATCH
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 5: Cross-Domain Match");
    this.executeStage5CrossDomainMatch(canonicalTerm, query, rawCandidatesMap);

    let candidateList = Array.from(rawCandidatesMap.values());

    // ------------------------------------------------------------------------
    // STAGE 6: CONSENSUS RANKING (LOCK 36)
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 6: Consensus Ranking");
    candidateList = this.executeStage6ConsensusRanking(candidateList);

    // ------------------------------------------------------------------------
    // STAGE 7: CITATION & CONFIDENCE RANKING
    // ------------------------------------------------------------------------
    stagesExecuted.push("Stage 7: Citation Ranking");
    candidateList = this.executeStage7CitationRanking(candidateList);

    // Filter by min confidence
    let filteredResults = candidateList.filter(item => item.confidenceScore >= minConfidence);

    // Filter conflicts if requested
    if (options.includeConflicts === false) {
      filteredResults = filteredResults.filter(item => !item.isConflicted);
    }

    const finalResults = filteredResults.slice(0, limit);
    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    let dynamicBrainMatches = 0;
    let fallbackMatches = 0;
    let conflictedItemsCount = 0;

    for (const item of finalResults) {
      if (item.sourceType === "DYNAMIC_KNOWLEDGE_BRAIN") dynamicBrainMatches++;
      else fallbackMatches++;
      if (item.isConflicted) conflictedItemsCount++;
    }

    // Log query metrics for Administrator analytics
    RetrievalAnalyticsService.recordSearch({
      query,
      resultsCount: finalResults.length,
      executionTimeMs,
      retrievedConcepts: finalResults.map(r => r.concept || r.matchedCategory),
      retrievedDocuments: finalResults.map(r => r.documentTitle)
    });

    return {
      query,
      results: finalResults,
      totalMatches: filteredResults.length,
      executionTimeMs,
      stagesExecuted,
      analyticsSnapshot: {
        dynamicBrainMatches,
        fallbackMatches,
        conflictedItemsCount
      }
    };
  }

  // ==========================================================================
  // STAGE IMPLEMENTATIONS
  // ==========================================================================

  private executeStage1ExactMatch(query: string, candidates: Map<string, RetrievalResultItem>): void {
    const qLower = query.toLowerCase();
    const allModels = KnowledgeIndexManager.getAllSemanticModels();

    for (const semModel of allModels) {
      for (const rule of semModel.rules) {
        if (rule.ruleText.toLowerCase().includes(qLower)) {
          const item: RetrievalResultItem = {
            id: `RES-S1-${rule.id}`,
            documentId: rule.provenance.documentId,
            documentTitle: rule.citation.sourceDocument,
            concept: rule.directionOrZone || "General Rule",
            chapterId: rule.provenance.chapterId,
            chapterTitle: rule.provenance.chapterTitle,
            sectionId: rule.provenance.sectionId,
            sectionTitle: rule.provenance.sectionTitle,
            paragraphId: rule.provenance.paragraphId,
            pageNumber: rule.provenance.pageNumber,
            citation: rule.citation,
            provenance: rule.provenance,
            rawText: rule.ruleText,
            confidenceScore: 95.0,
            consensusScore: 90.0,
            sourceType: "DYNAMIC_KNOWLEDGE_BRAIN",
            knowledgeDomain: rule.provenance.knowledgeDomain,
            matchStage: "Stage 1: Exact Match",
            matchedCategory: rule.isException ? "EXCEPTION" : "RULE",
            isConflicted: false,
            retrievedAt: new Date().toISOString()
          };
          candidates.set(item.id, item);
        }
      }
    }
  }

  private executeStage2SynonymMatch(synonyms: string[], candidates: Map<string, RetrievalResultItem>): void {
    const allModels = KnowledgeIndexManager.getAllSemanticModels();

    for (const syn of synonyms) {
      const synLower = syn.toLowerCase();
      for (const semModel of allModels) {
        for (const concept of semModel.concepts) {
          if (concept.name.toLowerCase() === synLower || concept.canonicalName.toLowerCase().includes(synLower)) {
            const item: RetrievalResultItem = {
              id: `RES-S2-${concept.id}`,
              documentId: concept.provenance.documentId,
              documentTitle: concept.citation.sourceDocument,
              concept: concept.canonicalName,
              chapterId: concept.provenance.chapterId,
              chapterTitle: concept.provenance.chapterTitle,
              sectionId: concept.provenance.sectionId,
              sectionTitle: concept.provenance.sectionTitle,
              paragraphId: concept.provenance.paragraphId,
              pageNumber: concept.provenance.pageNumber,
              citation: concept.citation,
              provenance: concept.provenance,
              rawText: concept.definition,
              confidenceScore: 88.0,
              consensusScore: 85.0,
              sourceType: "DYNAMIC_KNOWLEDGE_BRAIN",
              knowledgeDomain: concept.domain,
              matchStage: "Stage 2: Synonym Match",
              matchedCategory: "CONCEPT",
              isConflicted: false,
              retrievedAt: new Date().toISOString()
            };
            candidates.set(item.id, item);
          }
        }
      }
    }
  }

  private executeStage3SemanticConceptMatch(canonicalTerm: string, rawQuery: string, candidates: Map<string, RetrievalResultItem>): void {
    const resolved = KnowledgeIntelligenceService.resolveConceptWithFallback(rawQuery);
    const learnedConcepts = KnowledgeIntelligenceService.getGlobalLearnedConcepts();

    for (const learned of learnedConcepts) {
      if (learned.canonicalName === canonicalTerm || learned.discoveredSynonyms.some(s => s.toLowerCase() === rawQuery.toLowerCase())) {
        for (const def of learned.definitions) {
          const item: RetrievalResultItem = {
            id: `RES-S3-${learned.id}-${def.provenance.paragraphId}`,
            documentId: def.provenance.documentId,
            documentTitle: def.citation.sourceDocument,
            concept: learned.canonicalName,
            chapterId: def.provenance.chapterId,
            chapterTitle: def.provenance.chapterTitle,
            sectionId: def.provenance.sectionId,
            sectionTitle: def.provenance.sectionTitle,
            paragraphId: def.provenance.paragraphId,
            pageNumber: def.provenance.pageNumber,
            citation: def.citation,
            provenance: def.provenance,
            rawText: def.text,
            confidenceScore: learned.consensus.confidence,
            consensusScore: learned.consensus.agreementScore,
            sourceType: learned.sourcePriority,
            knowledgeDomain: def.provenance.knowledgeDomain,
            matchStage: "Stage 3: Semantic Concept Match",
            matchedCategory: "CONCEPT",
            isConflicted: learned.consensus.isConflicted,
            retrievedAt: new Date().toISOString()
          };
          candidates.set(item.id, item);
        }
      }
    }
  }

  private executeStage4RelationshipMatch(canonicalTerm: string, query: string, candidates: Map<string, RetrievalResultItem>): void {
    const allModels = KnowledgeIndexManager.getAllSemanticModels();

    for (const semModel of allModels) {
      for (const rel of semModel.relationships) {
        if (rel.subjectId === canonicalTerm || rel.objectId === canonicalTerm || rel.subjectName.toLowerCase().includes(query.toLowerCase())) {
          const item: RetrievalResultItem = {
            id: `RES-S4-${rel.id}`,
            documentId: rel.provenance.documentId,
            documentTitle: rel.citation.sourceDocument,
            concept: `${rel.subjectName} -> ${rel.relation} -> ${rel.objectName}`,
            relationship: rel.relation,
            chapterId: rel.provenance.chapterId,
            chapterTitle: rel.provenance.chapterTitle,
            sectionId: rel.provenance.sectionId,
            sectionTitle: rel.provenance.sectionTitle,
            paragraphId: rel.provenance.paragraphId,
            pageNumber: rel.provenance.pageNumber,
            citation: rel.citation,
            provenance: rel.provenance,
            rawText: `[Relationship Node] ${rel.subjectName} ${rel.relation} ${rel.objectName}`,
            confidenceScore: 82.0,
            consensusScore: 80.0,
            sourceType: "DYNAMIC_KNOWLEDGE_BRAIN",
            knowledgeDomain: rel.domain,
            matchStage: "Stage 4: Relationship Match",
            matchedCategory: "RELATIONSHIP",
            isConflicted: false,
            retrievedAt: new Date().toISOString()
          };
          candidates.set(item.id, item);
        }
      }
    }
  }

  private executeStage5CrossDomainMatch(canonicalTerm: string, query: string, candidates: Map<string, RetrievalResultItem>): void {
    const allModels = KnowledgeIndexManager.getAllSemanticModels();

    for (const semModel of allModels) {
      for (const link of semModel.crossDomainLinks) {
        if (link.sourceEntity === canonicalTerm || link.targetEntityOrConcept.toLowerCase().includes(query.toLowerCase())) {
          const item: RetrievalResultItem = {
            id: `RES-S5-${link.id}`,
            documentId: semModel.documentId,
            documentTitle: semModel.provenance.citation,
            concept: `Cross-Domain: ${link.sourceDomain} -> ${link.targetDomain}`,
            relationship: link.relationshipType,
            chapterId: semModel.provenance.chapterId,
            chapterTitle: semModel.provenance.chapterTitle,
            sectionId: semModel.provenance.sectionId,
            sectionTitle: semModel.provenance.sectionTitle,
            paragraphId: semModel.provenance.paragraphId,
            pageNumber: semModel.provenance.pageNumber,
            citation: semModel.provenance.citation ? {
              documentId: semModel.documentId,
              sourceDocument: semModel.provenance.chapterTitle,
              chapterId: semModel.provenance.chapterId,
              chapterTitle: semModel.provenance.chapterTitle,
              sectionId: semModel.provenance.sectionId,
              sectionTitle: semModel.provenance.sectionTitle,
              paragraphId: semModel.provenance.paragraphId,
              pageNumber: semModel.provenance.pageNumber,
              rawCitationText: semModel.provenance.citation,
              formattedCitation: semModel.provenance.citation
            } : semModel.rules[0]?.citation || semModel.concepts[0]?.citation,
            provenance: semModel.provenance,
            rawText: `[Cross-Domain Mapping] ${link.sourceEntity} (${link.sourceDomain}) maps to ${link.targetEntityOrConcept} (${link.targetDomain}). Rules: ${link.mappingRules.join("; ")}`,
            confidenceScore: 80.0,
            consensusScore: 85.0,
            sourceType: "DYNAMIC_KNOWLEDGE_BRAIN",
            knowledgeDomain: link.targetDomain,
            matchStage: "Stage 5: Cross-Domain Match",
            matchedCategory: "CONCEPT",
            isConflicted: false,
            retrievedAt: new Date().toISOString()
          };
          candidates.set(item.id, item);
        }
      }
    }
  }

  private executeStage6ConsensusRanking(items: RetrievalResultItem[]): RetrievalResultItem[] {
    // LOCK 36 Priority ranking:
    // 1. Dynamic Knowledge Brain over Bootstrap
    // 2. High Consensus Score
    // 3. Penalty for conflict
    return items.map(item => {
      let score = item.confidenceScore;
      if (item.sourceType === "DYNAMIC_KNOWLEDGE_BRAIN") {
        score += 10.0;
      }
      score += (item.consensusScore / 100) * 10.0;
      if (item.isConflicted) {
        score -= 15.0; // Conflict penalty
      }
      return {
        ...item,
        confidenceScore: Math.min(100, Math.max(0, Math.round(score * 10) / 10))
      };
    });
  }

  private executeStage7CitationRanking(items: RetrievalResultItem[]): RetrievalResultItem[] {
    // Sort descending by final confidence score, then by OCR confidence
    return items.sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }
      return b.provenance.ocrConfidence - a.provenance.ocrConfidence;
    });
  }

  // ==========================================================================
  // HYBRID SEARCH CONTRACT IMPLEMENTATIONS
  // ==========================================================================

  public async searchKeywords(query: string, limit?: number): Promise<RetrievalResultItem[]> {
    const res = await this.search({ query, limit });
    return res.results;
  }

  public async searchSemanticConcepts(query: string, limit?: number): Promise<RetrievalResultItem[]> {
    const res = await this.search({ query, limit });
    return res.results;
  }

  public async searchVectorEmbeddings?(queryEmbedding: number[], limit?: number): Promise<RetrievalResultItem[]> {
    // Future Phase 3+ Extension Point
    return [];
  }

  public async traverseKnowledgeGraph?(startNodeId: string, depth?: number): Promise<RetrievalResultItem[]> {
    // Future Phase 3+ Extension Point
    return [];
  }
}
