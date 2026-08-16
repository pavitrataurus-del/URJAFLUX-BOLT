// ============================================================================
// KNOWLEDGE INTELLIGENCE SERVICE (PHASE 2C — LOCK 33 MAIN ORCHESTRATION)
// Prioritizes Knowledge Brain dynamic learning with fallback to bootstrap dictionaries
// ============================================================================

import { doc, setDoc, getDoc } from "firebase/firestore";
import { safeSetDoc } from "../../../utils/firestoreSanitizer";
import { db } from "../../../firebase";
import { StructuredDocumentModel } from "../../../types/documentStructure";
import { 
  SemanticDocumentModel, 
  DynamicLearnedConcept, 
  KnowledgeConflict, 
  AdminKnowledgeAnalytics,
  KnowledgeProvenance,
  SourceCitation
} from "../../../types/semanticKnowledge";
import { DynamicConceptDiscoveryEngine } from "./DynamicConceptDiscoveryEngine";
import { KnowledgeConsensusEngine } from "./KnowledgeConsensusEngine";
import { SynonymEngine } from "../semantic/SynonymEngine";
import { RelationshipEngine } from "../semantic/RelationshipEngine";
import { CrossDomainEngine } from "../semantic/CrossDomainEngine";

export class KnowledgeIntelligenceService {
  private static globalConceptsMap: Map<string, DynamicLearnedConcept> = new Map();
  private static globalConflictsList: KnowledgeConflict[] = [];
  private static processedDocumentIds: Set<string> = new Set();

  /**
   * LOCK 33 Execution: Processes a new document, extracts dynamic concepts, evaluates consensus & conflicts.
   */
  public static async processDocumentKnowledge(
    structuredModel: StructuredDocumentModel,
    semanticModel: SemanticDocumentModel
  ): Promise<{
    discoveredConcepts: DynamicLearnedConcept[];
    conflicts: KnowledgeConflict[];
    analytics: AdminKnowledgeAnalytics;
  }> {
    this.processedDocumentIds.add(structuredModel.documentId);

    // 1. Dynamic Concept Discovery from uploaded book
    const newConcepts = DynamicConceptDiscoveryEngine.discoverConceptsFromDocument(structuredModel, semanticModel);

    // 2. Merge into Global Knowledge Brain
    for (const concept of newConcepts) {
      const existing = this.globalConceptsMap.get(concept.canonicalName);
      if (!existing) {
        this.globalConceptsMap.set(concept.canonicalName, concept);
      } else {
        existing.consensus.frequency += concept.consensus.frequency;
        existing.consensus.evidenceCount += concept.consensus.evidenceCount;

        // Deduplicate definitions & provenances
        for (const def of concept.definitions) {
          if (!existing.definitions.some(d => d.provenance.documentId === def.provenance.documentId && d.text === def.text)) {
            existing.definitions.push(def);
          }
        }
        for (const prov of concept.provenances) {
          if (!existing.provenances.some(p => p.documentId === prov.documentId && p.paragraphId === prov.paragraphId)) {
            existing.provenances.push(prov);
          }
        }
        for (const suppDoc of concept.consensus.supportingDocuments) {
          if (!existing.consensus.supportingDocuments.some(s => s.documentId === suppDoc.documentId && s.citation.paragraphId === suppDoc.citation.paragraphId)) {
            existing.consensus.supportingDocuments.push(suppDoc);
          }
        }
      }
    }

    // 3. Knowledge Consensus & Conflict Evaluation
    const allConceptsList = Array.from(this.globalConceptsMap.values());
    const consensusResult = KnowledgeConsensusEngine.evaluateConsensus(allConceptsList);

    this.globalConflictsList = consensusResult.conflicts;

    // 4. Compute Admin Analytics
    const analytics = this.getAdminAnalytics();

    // 5. Persist into Firestore & local storage
    this.persistKnowledgeBrainState();

    return {
      discoveredConcepts: newConcepts,
      conflicts: consensusResult.conflicts,
      analytics
    };
  }

  /**
   * LOCK 33 FALLBACK POLICY:
   * Query Knowledge Brain dynamic concepts first.
   * If insufficient evidence, fallback to bootstrap engines.
   */
  public static resolveConceptWithFallback(term: string): {
    canonicalName: string;
    synonyms: string[];
    sourceUsed: "DYNAMIC_KNOWLEDGE_BRAIN" | "FALLBACK_BOOTSTRAP";
    evidenceCount: number;
    definitions: string[];
  } {
    const canonical = SynonymEngine.resolveCanonicalName(term);
    const dynamicConcept = this.globalConceptsMap.get(canonical);

    if (dynamicConcept && dynamicConcept.consensus.evidenceCount > 0) {
      return {
        canonicalName: dynamicConcept.canonicalName,
        synonyms: dynamicConcept.discoveredSynonyms,
        sourceUsed: "DYNAMIC_KNOWLEDGE_BRAIN",
        evidenceCount: dynamicConcept.consensus.evidenceCount,
        definitions: dynamicConcept.definitions.map(d => d.text)
      };
    }

    // Fallback to Bootstrap Synonym Engine
    return {
      canonicalName: canonical,
      synonyms: SynonymEngine.getSynonyms(term),
      sourceUsed: "FALLBACK_BOOTSTRAP",
      evidenceCount: 0,
      definitions: ["Resolved via Bootstrap Terminology Dictionary."]
    };
  }

  /**
   * ADMIN ANALYTICS
   */
  public static getAdminAnalytics(): AdminKnowledgeAnalytics {
    const concepts = Array.from(this.globalConceptsMap.values());
    const totalConcepts = concepts.length;
    const conflictingConcepts = concepts.filter(c => c.consensus.isConflicted).length;
    const mergedConcepts = concepts.filter(c => c.consensus.evidenceCount > 1).length;
    const newConceptsDiscovered = concepts.filter(c => c.sourcePriority === "DYNAMIC_KNOWLEDGE_BRAIN").length;

    const totalAgreement = concepts.reduce((sum, c) => sum + c.consensus.agreementScore, 0);
    const averageConsensusScore = totalConcepts > 0 ? Math.round(totalAgreement / totalConcepts) : 100;

    const sortedByRefs = [...concepts].sort((a, b) => b.consensus.evidenceCount - a.consensus.evidenceCount);
    const mostReferencedConcepts = sortedByRefs.slice(0, 10).map(c => ({
      conceptName: c.canonicalName,
      count: c.consensus.evidenceCount
    }));

    const totalBooksProcessed = this.processedDocumentIds.size;
    const knowledgeGrowthRate = totalBooksProcessed > 0 ? Math.round((totalConcepts / totalBooksProcessed) * 10) : 0;

    return {
      totalConcepts,
      newConceptsDiscovered,
      mergedConcepts,
      conflictingConcepts,
      averageConsensusScore,
      mostReferencedConcepts,
      totalBooksProcessed,
      knowledgeGrowthRate,
      timestamp: new Date().toISOString()
    };
  }

  public static getGlobalConflicts(): KnowledgeConflict[] {
    return [...this.globalConflictsList];
  }

  public static getGlobalLearnedConcepts(): DynamicLearnedConcept[] {
    return Array.from(this.globalConceptsMap.values());
  }

  private static persistKnowledgeBrainState(): void {
    if (db) {
      const analytics = this.getAdminAnalytics();
      safeSetDoc(doc(db, "knowledge_brain_analytics", "latest"), analytics).catch(() => {});
    }
  }
}
