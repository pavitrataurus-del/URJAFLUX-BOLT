// ============================================================================
// KNOWLEDGE CONSENSUS & CONFLICT ENGINE (PHASE 2C — LOCK 33)
// Fuses evidence across multiple books, computes consensus scores, and logs conflicts
// ============================================================================

import { 
  DynamicLearnedConcept, 
  KnowledgeConsensus, 
  KnowledgeConflict, 
  SourceDocumentReference 
} from "../../../types/semanticKnowledge";

export class KnowledgeConsensusEngine {
  /**
   * Computes knowledge consensus and detects conflicts across all learned concepts.
   */
  public static evaluateConsensus(
    learnedConcepts: DynamicLearnedConcept[]
  ): {
    evaluatedConcepts: DynamicLearnedConcept[];
    conflicts: KnowledgeConflict[];
  } {
    const conflicts: KnowledgeConflict[] = [];

    for (const concept of learnedConcepts) {
      const consensus = concept.consensus;
      const totalDocs = consensus.supportingDocuments.length + consensus.contradictingDocuments.length;

      // Detect direct contradictions or directional mismatches in definitions/statements
      this.detectConflictsInConcept(concept, conflicts);

      if (totalDocs > 0) {
        consensus.evidenceCount = totalDocs;
        const supportCount = consensus.supportingDocuments.length;
        const contradictCount = consensus.contradictingDocuments.length;

        consensus.agreementScore = Math.round((supportCount / totalDocs) * 100);
        consensus.confidence = Math.min(100, Math.round(70 + (supportCount * 10) - (contradictCount * 15)));
        consensus.isConflicted = contradictCount > 0 || consensus.agreementScore < 80;
      }
    }

    return {
      evaluatedConcepts: learnedConcepts,
      conflicts
    };
  }

  private static detectConflictsInConcept(
    concept: DynamicLearnedConcept,
    conflicts: KnowledgeConflict[]
  ): void {
    const docs = concept.consensus.supportingDocuments;
    if (docs.length < 2) return;

    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const docA = docs[i];
        const docB = docs[j];

        const stmtA = (docA.statement || "").toLowerCase();
        const stmtB = (docB.statement || "").toLowerCase();

        // Contradiction Check: Prohibited / Inauspicious vs Allowed / Auspicious
        const isAProhibited = stmtA.includes("prohibited") || stmtA.includes("inauspicious") || stmtA.includes("forbidden") || stmtA.includes("avoid");
        const isBAllowed = stmtB.includes("auspicious") || stmtB.includes("allowed") || stmtB.includes("permitted") || stmtB.includes("recommended");

        const isBProhibited = stmtB.includes("prohibited") || stmtB.includes("inauspicious") || stmtB.includes("forbidden") || stmtB.includes("avoid");
        const isAAllowed = stmtA.includes("auspicious") || stmtA.includes("allowed") || stmtA.includes("permitted") || stmtA.includes("recommended");

        if ((isAProhibited && isBAllowed) || (isBProhibited && isAAllowed)) {
          const conflictId = `CFL-${concept.canonicalName}-${docA.documentId.slice(0, 6)}-${docB.documentId.slice(0, 6)}`;

          // Mark as contradicting document in consensus without deleting from supporting
          if (!concept.consensus.contradictingDocuments.some(d => d.documentId === docB.documentId)) {
            concept.consensus.contradictingDocuments.push(docB);
          }

          conflicts.push({
            conflictId,
            topicOrConcept: concept.canonicalName,
            sourceA: docA,
            sourceB: docB,
            conflictType: "DIRECT_CONTRADICTION",
            recordedAt: new Date().toISOString(),
            status: "AWAITING_FUTURE_REASONING"
          });
        }
      }
    }
  }
}
