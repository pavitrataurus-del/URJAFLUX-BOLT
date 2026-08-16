// ============================================================================
// URJAFLUX AI OS - CONFLICT RESOLUTION PIPELINE (CRE)
// End-to-End Execution Pipeline for Conflict Detection & Multi-School Classification
// ============================================================================

import { 
  IConflictResolutionPackage, 
  IConflictRecord, 
  IConflictGroup, 
  IConflictMatrixCell, 
  IAlternativeKnowledgePath 
} from "../types/cre.types";
import { ConflictDetector } from "../detectors/ConflictDetector";
import { ConflictClassifier } from "../classifiers/ConflictClassifier";
import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage } from "../../knowledge_confidence/types/kce.types";

export class ConflictResolutionPipeline {
  private detector: ConflictDetector;
  private classifier: ConflictClassifier;

  private static CRE_VERSION = "1.0.0-CANONICAL";

  constructor() {
    this.detector = new ConflictDetector();
    this.classifier = new ConflictClassifier();
  }

  /**
   * Executes conflict resolution pipeline over Knowledge Intelligence Package & Confidence Package
   */
  public executeConflictPipeline(
    kiePackage: IApplicableKnowledgePackage,
    kcePackage: IConfidenceEvaluationPackage
  ): IConflictResolutionPackage {
    const startTimeMs = Date.now();
    const timestamp = new Date().toISOString();
    const packageId = `CRE-PKG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 1. Detect Conflicts
    const detectedConflicts = this.detector.detectConflicts(kiePackage, kcePackage);

    // 2. Classify into Groups, Matrix, and Alternative Knowledge Paths
    const conflictGroups = this.classifier.buildConflictGroups(detectedConflicts);
    const conflictMatrix = this.classifier.buildConflictMatrix(detectedConflicts);
    const alternativeKnowledgePaths = this.classifier.buildAlternativeKnowledgePaths(kiePackage, kcePackage, detectedConflicts);

    // 3. Gather Auditable Evidence & Citation Sets
    const evidenceSets = kiePackage.applicableEvidence;
    const citationSets = kiePackage.applicableCitations;

    // 4. Calculate Summary Statistics
    let directContradictionsCount = 0;
    let partialDivergencesCount = 0;
    let schoolDifferencesCount = 0;
    let crossDomainVariancesCount = 0;

    const affectedRulesSet = new Set<string>();
    const affectedRemediesSet = new Set<string>();

    detectedConflicts.forEach(c => {
      if (c.severity === 'DIRECT_CONTRADICTION') directContradictionsCount++;
      else if (c.severity === 'PARTIAL_DIVERGENCE') partialDivergencesCount++;
      else if (c.severity === 'SCHOOL_DIFFERENCE') schoolDifferencesCount++;
      else if (c.severity === 'CROSS_DOMAIN_VARIANCE') crossDomainVariancesCount++;

      c.affectedRuleIds.forEach(id => affectedRulesSet.add(id));
      c.affectedRemedyCandidateIds.forEach(id => affectedRemedyCandidateIdsSetAdd(affectedRemediesSet, id));
    });

    function affectedRemedyCandidateIdsSetAdd(set: Set<string>, id: string) {
      set.add(id);
    }

    const pipelineDurationMs = Math.max(0, Date.now() - startTimeMs);

    return {
      packageId,
      kiePackageId: kiePackage.packageId,
      kcePackageId: kcePackage.packageId,
      timestamp,
      detectedConflicts,
      conflictGroups,
      conflictMatrix,
      alternativeKnowledgePaths,
      evidenceSets,
      citationSets,
      summaryStats: {
        totalConflictsDetected: detectedConflicts.length,
        directContradictionsCount,
        partialDivergencesCount,
        schoolDifferencesCount,
        crossDomainVariancesCount,
        affectedRulesCount: affectedRulesSet.size,
        affectedRemediesCount: affectedRemediesSet.size
      },
      executionMetadata: {
        engineVersion: ConflictResolutionPipeline.CRE_VERSION,
        pipelineDurationMs,
        rulesEvaluatedCount: kiePackage.applicableRules.length,
        remediesEvaluatedCount: kiePackage.remedyCandidateCollections.length
      }
    };
  }
}
