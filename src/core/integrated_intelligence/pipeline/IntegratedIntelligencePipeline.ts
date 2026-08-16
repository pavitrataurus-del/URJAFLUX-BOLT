// ============================================================================
// URJAFLUX AI OS - INTEGRATED INTELLIGENCE PIPELINE (IIE)
// Master Pipeline Synthesizing KIE, KCE, CRE, CCIE & SRE into ONE Consultation
// ============================================================================

import { 
  IIntegratedConsultationPackage, 
  IIntegratedFinding, 
  IConsultantDecisionLayer 
} from "../types/iie.types";
import { BestRemedySelector } from "../selectors/BestRemedySelector";
import { CompatibilityAnalyzer } from "../analyzers/CompatibilityAnalyzer";
import { ExecutionRoadmapPlanner } from "../planners/ExecutionRoadmapPlanner";
import { ProductPreparationEngine } from "../preparers/ProductPreparationEngine";

import { IApplicableKnowledgePackage } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage } from "../../knowledge_confidence/types/kce.types";
import { IConflictResolutionPackage } from "../../conflict_resolution/types/cre.types";
import { IClientContextProfile, ISpatialContextData } from "../../knowledge_intelligence/types/kie.types";

export class IntegratedIntelligencePipeline {
  private remedySelector: BestRemedySelector;
  private compatibilityAnalyzer: CompatibilityAnalyzer;
  private roadmapPlanner: ExecutionRoadmapPlanner;
  private productPreparer: ProductPreparationEngine;

  private static IIE_VERSION = "1.0.0-CANONICAL";

  constructor() {
    this.remedySelector = new BestRemedySelector();
    this.compatibilityAnalyzer = new CompatibilityAnalyzer();
    this.roadmapPlanner = new ExecutionRoadmapPlanner();
    this.productPreparer = new ProductPreparationEngine();
  }

  /**
   * Executes master integration pipeline to produce an Integrated Consultation Package
   */
  public executeIntegrationPipeline(
    kiePackage: IApplicableKnowledgePackage,
    kcePackage: IConfidenceEvaluationPackage,
    crePackage: IConflictResolutionPackage,
    clientContext?: IClientContextProfile,
    spatialOutput?: ISpatialContextData
  ): IIntegratedConsultationPackage {
    const startTimeMs = Date.now();
    const timestamp = new Date().toISOString();
    const packageId = `IIE-PKG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 1. Synthesize Integrated Findings
    const integratedFindings: IIntegratedFinding[] = kiePackage.applicableRules.map((rule, idx) => {
      const conf = kcePackage.evaluatedRuleConfidences.find(rc => rc.ruleId === rule.ruleId);

      let severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR' = 'MODERATE';
      if (rule.category === 'DOSHA' || rule.category === 'CAUSE' || rule.category === 'EFFECT') severity = 'CRITICAL';

      return {
        findingId: `IIE-FINDING-${idx + 1}`,
        title: `Observed ${rule.domain} Pattern in Zone ${rule.matchedDimensions.matchedDirections.join(', ')}`,
        domain: rule.domain,
        spatialZone: rule.matchedDimensions.matchedDirections[0] || 'GENERAL',
        description: `Rule Match ID ${rule.ruleId}: ${rule.category} observation in ${rule.matchedDimensions.matchedObjects.join(', ')}`,
        doshaOrEffect: rule.category,
        severity,
        associatedRuleIds: [rule.ruleId],
        associatedRecordIds: [rule.knowledgeRecordId],
        confidenceScore: conf?.overallConfidenceScore || 0.80
      };
    });

    // 2. Select Best Remedy Candidates & Alternatives
    const { bestRemedies, alternativeRemedies } = this.remedySelector.selectBestRemedies(
      kiePackage,
      kcePackage,
      crePackage,
      clientContext,
      spatialOutput
    );

    // 3. Analyze Remedy Compatibility & Synergies
    const compatibilityMatrix = this.compatibilityAnalyzer.analyzeCompatibility(bestRemedies);

    // 4. Generate Phased Implementation Roadmap
    const executionRoadmap = this.roadmapPlanner.planRoadmap(bestRemedies, compatibilityMatrix);

    // 5. Prepare Structured Product Input Data
    const productPreparationPackage = this.productPreparer.prepareProducts(bestRemedies);

    // 6. Construct Consultant Decision Layer
    const consultantDecisionLayer: IConsultantDecisionLayer = {
      evaluationTimestamp: timestamp,
      decisions: bestRemedies.map(rem => ({
        remedyId: rem.remedyId,
        consultantStatus: 'ACCEPTED',
        consultantNotes: 'System recommended primary non-destructive remedy'
      })),
      isLockedForClient: false
    };

    // 7. Extract Cross Domain and Conflict Summaries
    const domainsSet = new Set<string>();
    kiePackage.applicableRules.forEach(r => domainsSet.add(r.domain));

    const crossDomainSummary = {
      involvedDomains: Array.from(domainsSet) as any[],
      crossDomainSynergiesCount: compatibilityMatrix.compatibilityLinks.filter(l => l.relationshipType === 'CROSS_DOMAIN_ENHANCEMENT').length,
      crossDomainConflictsCount: crePackage.summaryStats.crossDomainVariancesCount
    };

    const conflictSummary = {
      totalConflicts: crePackage.summaryStats.totalConflictsDetected,
      directContradictions: crePackage.summaryStats.directContradictionsCount,
      alternativePathsCount: crePackage.alternativeKnowledgePaths.length,
      alternativePaths: crePackage.alternativeKnowledgePaths
    };

    const pipelineDurationMs = Math.max(0, Date.now() - startTimeMs);

    return {
      packageId,
      kiePackageId: kiePackage.packageId,
      kcePackageId: kcePackage.packageId,
      crePackageId: crePackage.packageId,
      timestamp,
      integratedFindings,
      bestRemedyCandidates: bestRemedies,
      alternativeRemedyCandidates: alternativeRemedies,
      executionRoadmap,
      compatibilityMatrix,
      productPreparationPackage,
      consultantDecisionLayer,
      crossDomainSummary,
      conflictSummary,
      evidencePackage: kiePackage.applicableEvidence,
      citationPackage: kiePackage.applicableCitations,
      executionMetadata: {
        engineVersion: IntegratedIntelligencePipeline.IIE_VERSION,
        pipelineDurationMs,
        totalRulesProcessed: kiePackage.applicableRules.length,
        totalRemediesEvaluated: kiePackage.remedyCandidateCollections.length,
        selectedBestRemediesCount: bestRemedies.length
      }
    };
  }
}
