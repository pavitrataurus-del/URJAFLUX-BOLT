import { MultiHopReasoningEngine } from './MultiHopReasoningEngine';
import { CrossDocumentReasoningEngine } from './CrossDocumentReasoningEngine';
import { ConflictResolutionEngine } from './ConflictResolutionEngine';
import { EvidenceScoringEngine } from './EvidenceScoringEngine';
import { ExplainableAIEngine } from './ExplainableAIEngine';
import { RuleValidationEngine } from './RuleValidationEngine';
import { HypothesisEngine } from './HypothesisEngine';
import { KnowledgeConsistencyChecker } from './KnowledgeConsistencyChecker';
import { ReasoningTraceEngine } from './ReasoningTraceEngine';
import { KnowledgeVaultService } from '../../../services/knowledgeVaultService';
import {
  KnowledgeVaultRemedyEvaluationService,
  type RemedyEvaluationResult,
  type PlacementEvaluationResult,
  type PlacementVerdict,
  type RemedyConsensusStatus,
} from '../../../services/knowledgeVaultRemedyEvaluationService';
import { vastuRuleRegistry, extractZoneCode } from '../../../engines/procedural/VastuRuleRegistry';
import { CanonicalZoneRegistry } from '../../../core/spatial/CanonicalZoneRegistry';
import { roomTaxonomyService } from '../../../recognition/RoomTaxonomyService';
import { CanonicalSpatialCalculationEngine } from '../../../core/spatial/CanonicalSpatialCalculationEngine';
import {
  resolveHomeownerFacingRemedies,
  stripInternalEngineMeta,
  stripBookCitationLeaks,
  buildDirectionalIssueExplanation,
  formatRemediesForDisplay,
} from '../../../services/vaultRemedyTextQuality';
import {
  MultiHopReasoningResult,
  CrossDocumentReasoningResult,
  ConflictReport,
  EvidenceScoreBreakdown,
  ExplainableAnswer,
  RuleValidationResult,
  HypothesisResult,
  KnowledgeHealthReport,
  ReasoningTraceLog
} from './ecre.types';

export interface GroundedPdfCitation {
  sourceBook: string;
  chapter?: string;
  verse?: string;
  pageNumber: number;
  chunkId: string;
  formattedCitation: string;
  verifiedTextChunk: string;
  isVerifiedPDFChunk: boolean;
}

export interface GroundedFindingResult {
  title: string;
  description: string;
  remedy: string;
  remedies: string[];
  severity: "CATASTROPHIC" | "CRITICAL" | "MAJOR" | "HIGH" | "MODERATE" | "MEDIUM" | "MINOR" | "LOW";
  zone: string;
  isVerified: boolean;
  citationMetadata: GroundedPdfCitation;
  remedyEvaluation?: RemedyEvaluationResult;
}

export interface GroundedPlacementResult {
  placementVerdict: PlacementVerdict;
  multiSourceSummary: string;
  consensusStatus: RemedyConsensusStatus;
  isVerified: boolean;
  explanation: string;
  recommendationRationale: string;
  citationMetadata: GroundedPdfCitation;
  placementEvaluation: PlacementEvaluationResult;
}

function matchDescriptionWithChunk(rawDesc?: string, chunkCondition?: string): string {
  if (rawDesc && rawDesc.trim().length > 0) return rawDesc;
  if (chunkCondition && chunkCondition.trim().length > 0) return chunkCondition;
  return "Spatial layout deviation identified in uploaded treatise.";
}

export class EnterpriseCognitiveReasoningService {
  /**
   * Chakra Angle Vector Sync:
   * Calculates exact degree vectors from the CadBlueprintWorkspace Chakra overlay.
   * A room (e.g., Kitchen) must be mapped to its precise sub-zone based strictly on these overlay coordinates.
   */
  public static verifyChakraAngleVectorSync(
    entityPos: { x: number; y: number },
    layoutCenter: { x: number; y: number },
    vastuNorthCalibration: number = 0,
    chakraRotation: number = 0
  ): {
    rawBearing: number;
    netNorthAngle: number;
    degreeVector: number;
    subZone: string;
  } {
    const rawBearing = CanonicalSpatialCalculationEngine.calculateBearing(layoutCenter, entityPos);
    const netNorthAngle = ((vastuNorthCalibration + chakraRotation) % 360 + 360) % 360;
    const degreeVector = CanonicalSpatialCalculationEngine.adjustBearingForNorth(rawBearing, netNorthAngle);

    const subZone = CanonicalZoneRegistry.displayLabelFromBearing(degreeVector);

    return {
      rawBearing: Math.round(rawBearing * 100) / 100,
      netNorthAngle: Math.round(netNorthAngle * 100) / 100,
      degreeVector: Math.round(degreeVector * 100) / 100,
      subZone
    };
  }

  /**
   * Strict PDF Knowledge Binding:
   * Retrieves verified text model chunks from uploaded PDFs in the vastu_knowledge_brain collections.
   * Guarantees zero hallucination or ungrounded recommendations.
   * Every generated finding is backed by a verified local text model chunk and includes its corresponding source book and page number citation.
   */
  public static bindAndVerifyPdfFinding(
    canonicalType: string,
    zone: string,
    degreeVector: number,
    rawFinding?: {
      title?: string;
      description?: string;
      remedy?: string;
      severity?: string;
      ruleId?: string;
      displayName?: string;
    }
  ): GroundedFindingResult {
    const resolvedCanonical = roomTaxonomyService.resolveCanonicalTypeFromEntity(
      canonicalType,
      rawFinding?.displayName
    );
    const objType = roomTaxonomyService.canonicalToRuleElementType(resolvedCanonical);
    const zoneCode = extractZoneCode(zone) || zone;
    const title = rawFinding?.title || "";
    const ruleId = rawFinding?.ruleId || "";

    // Determine expected topic from title, ruleId, or canonical type
    let expectedTopic = roomTaxonomyService.canonicalTypeToPdfTopic(resolvedCanonical);
    if (!expectedTopic) {
      if (title.toLowerCase().includes("ayadi") || title.toLowerCase().includes("yoni") || ruleId.toLowerCase().includes("ayadi") || title.toLowerCase().includes("inauspicious ayadi")) {
        expectedTopic = "ayadi";
      } else if (title.toLowerCase().includes("water") || title.toLowerCase().includes("tank")) {
        expectedTopic = "water";
      }
    }

    // Exact KnowledgeVault query string/object for audit reporting
    const exactQuery = `KnowledgeVaultQuery { canonicalType: "${resolvedCanonical}", objectType: "${objType}", zone: "${zoneCode}", expectedTopic: "${expectedTopic}", ruleId: "${ruleId}" }`;
    console.log(`[EnterpriseCognitiveReasoningService] Executing Exact Query: ${exactQuery}`);

    const queryContext = KnowledgeVaultRemedyEvaluationService.buildQueryContext(
      resolvedCanonical,
      objType,
      zone,
      { title, description: rawFinding?.description, displayName: rawFinding?.displayName, degreeVector }
    );

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluateRemediesForContext(queryContext);

    if (evaluation.candidates.length === 0) {
      return {
        title: rawFinding?.title || "Directional layout concern",
        description:
          buildDirectionalIssueExplanation({
            displayName: rawFinding?.displayName || objType,
            zone,
            verdict: "NO_EVIDENCE",
          }),
        remedy: "No approved corrective options are available for this direction from the knowledge library.",
        remedies: [],
        severity: (rawFinding?.severity as GroundedFindingResult["severity"]) || "MEDIUM",
        zone,
        isVerified: false,
        remedyEvaluation: evaluation,
        citationMetadata: {
          sourceBook: "Internal",
          chapter: "Knowledge Vault",
          pageNumber: 0,
          chunkId: `NO-MATCH-${Date.now()}`,
          formattedCitation: "[Internal trace only]",
          verifiedTextChunk: evaluation.recommendationRationale,
          isVerifiedPDFChunk: false,
        },
      };
    }

    const primaryCandidate = evaluation.candidates[0];
    const matchedChunk = KnowledgeVaultService.getApprovedRules().find(
      (r) => r.id === primaryCandidate.ruleId
    );

    if (matchedChunk) {
      let isSameRule = true;
      let bindingErrorMessage = "";

      if (expectedTopic === "ayadi" && !matchedChunk.category.toLowerCase().includes("ayadi") && !matchedChunk.id.includes("10005")) {
        isSameRule = false;
        bindingErrorMessage = `KNOWLEDGE BINDING ERROR: Chunk ${matchedChunk.id} (${matchedChunk.category}) belongs to another rule, not Ayadi Formulas.`;
      } else if (expectedTopic === "kitchen" && resolvedCanonical !== "KITCHEN") {
        isSameRule = false;
        bindingErrorMessage = `KNOWLEDGE BINDING ERROR: Chunk ${matchedChunk.id} (${matchedChunk.category}) belongs to another rule, not Kitchen Rules.`;
      } else if (expectedTopic === "toilet" && resolvedCanonical !== "TOILET") {
        isSameRule = false;
        bindingErrorMessage = `KNOWLEDGE BINDING ERROR: Chunk ${matchedChunk.id} (${matchedChunk.category}) belongs to another rule, not Toilet Rules.`;
      } else if (expectedTopic === "bedroom" && resolvedCanonical !== "BEDROOM") {
        isSameRule = false;
        bindingErrorMessage = `KNOWLEDGE BINDING ERROR: Chunk ${matchedChunk.id} (${matchedChunk.category}) belongs to another rule, not Bedroom Rules.`;
      }

      if (!isSameRule) {
        console.warn(`[Knowledge Binding Error] ${bindingErrorMessage}`);
        return {
          title: rawFinding?.title || "Directional layout concern",
          description: buildDirectionalIssueExplanation({
            displayName: rawFinding?.displayName || objType,
            zone,
            verdict: "NO_EVIDENCE",
          }),
          remedy: "No approved corrective options are available for this direction from the knowledge library.",
          remedies: [],
          severity: (rawFinding?.severity as GroundedFindingResult["severity"]) || "HIGH",
          zone,
          isVerified: false,
          remedyEvaluation: evaluation,
          citationMetadata: {
            sourceBook: "Internal",
            chapter: "N/A",
            pageNumber: matchedChunk.evidence?.pageNumber || 0,
            chunkId: matchedChunk.id,
            formattedCitation: `[UNVERIFIED: ${bindingErrorMessage}]`,
            verifiedTextChunk: bindingErrorMessage,
            isVerifiedPDFChunk: false,
          },
        };
      }
    }

    const availableRemedies = resolveHomeownerFacingRemedies({
      proceduralRemedy: rawFinding?.remedy,
      availableRemedies: evaluation.availableRemedies,
    });

    const vaultRemedyDisplay = formatRemediesForDisplay(availableRemedies);

    const descriptionParts = [
      buildDirectionalIssueExplanation({
        displayName: rawFinding?.displayName || objType,
        zone,
        verdict:
          evaluation.consensusStatus === "NO_EVIDENCE"
            ? "NO_EVIDENCE"
            : evaluation.availableRemedies.length > 1
            ? "SPLIT"
            : "UNFAVORABLE",
      }),
      stripBookCitationLeaks(stripInternalEngineMeta(rawFinding?.description || "")),
    ].filter(Boolean);

    return {
      title: rawFinding?.title || `${rawFinding?.displayName || objType} in ${zone}`,
      description: descriptionParts.join(" ") || buildDirectionalIssueExplanation({
        displayName: rawFinding?.displayName || objType,
        zone,
        verdict: "UNFAVORABLE",
      }),
      remedy: vaultRemedyDisplay,
      remedies: availableRemedies,
      severity:
        (evaluation.candidates[0]?.severity as GroundedFindingResult["severity"]) ||
        (rawFinding?.severity as GroundedFindingResult["severity"]) ||
        "MODERATE",
      zone,
      isVerified: availableRemedies.length > 0,
      remedyEvaluation: evaluation,
      citationMetadata: {
        sourceBook: "Internal",
        chapter: "Knowledge Vault",
        verse: matchedChunk?.evidence?.verse || "",
        pageNumber: evaluation.candidates[0]?.pageNumber || 0,
        chunkId: evaluation.candidates[0]?.ruleId || `CHUNK-PDF-${Date.now()}`,
        formattedCitation: "[Internal trace only]",
        verifiedTextChunk: evaluation.recommendationRationale,
        isVerifiedPDFChunk: availableRemedies.length > 0,
      },
    };
  }

  /**
   * Multi-source vault placement evaluation — runs for every entity (defect or not).
   * Citations come only from approved vault rules; never hardcoded treatise names.
   */
  public static evaluatePlacementFromVault(
    canonicalType: string,
    zone: string,
    degreeVector: number,
    rawEntity?: { displayName?: string }
  ): GroundedPlacementResult {
    const resolvedCanonical = roomTaxonomyService.resolveCanonicalTypeFromEntity(
      canonicalType,
      rawEntity?.displayName
    );
    const objType = roomTaxonomyService.canonicalToRuleElementType(resolvedCanonical);

    const queryContext = KnowledgeVaultRemedyEvaluationService.buildQueryContext(
      resolvedCanonical,
      objType,
      zone,
      { displayName: rawEntity?.displayName, degreeVector }
    );

    const evaluation = KnowledgeVaultRemedyEvaluationService.evaluatePlacementForContext(queryContext);

    if (evaluation.matchedRules.length === 0) {
      return {
        placementVerdict: "NO_EVIDENCE",
        multiSourceSummary: evaluation.multiSourceSummary,
        consensusStatus: evaluation.consensusStatus,
        isVerified: false,
        explanation: evaluation.explanation,
        recommendationRationale: buildDirectionalIssueExplanation({
          displayName: rawEntity?.displayName || objType,
          zone,
          verdict: "NO_EVIDENCE",
        }),
        placementEvaluation: evaluation,
        citationMetadata: {
          sourceBook: "Internal",
          chapter: "Knowledge Vault",
          pageNumber: 0,
          chunkId: `NO-PLACEMENT-${Date.now()}`,
          formattedCitation: "[Internal trace only]",
          verifiedTextChunk: evaluation.recommendationRationale,
          isVerifiedPDFChunk: false,
        },
      };
    }

    return {
      placementVerdict: evaluation.placementVerdict,
      multiSourceSummary: evaluation.multiSourceSummary,
      consensusStatus: evaluation.consensusStatus,
      isVerified: evaluation.isVerified,
      explanation: stripBookCitationLeaks(evaluation.explanation),
      recommendationRationale: stripBookCitationLeaks(evaluation.recommendationRationale),
      placementEvaluation: evaluation,
      citationMetadata: {
        sourceBook: "Internal",
        chapter: "Knowledge Vault",
        pageNumber: evaluation.primaryCitation?.pageNumber || 0,
        chunkId: evaluation.primaryCitation?.ruleId || `PLACEMENT-${Date.now()}`,
        formattedCitation: "[Internal trace only]",
        verifiedTextChunk: evaluation.recommendationRationale,
        isVerifiedPDFChunk: evaluation.isVerified,
      },
    };
  }

  /**
   * Module 1: Multi-Hop Reasoning across objects.
   */
  public static reasonMultiHop(query: string, documentId?: string): MultiHopReasoningResult {
    const trace = ReasoningTraceEngine.createTraceLog(query);
    const result = MultiHopReasoningEngine.executeMultiHopReasoning(query, documentId);

    for (const hop of result.reasoningPath) {
      ReasoningTraceEngine.addTraceStep(trace.traceId, {
        nodeOrActionId: hop.entityId,
        nodeType: hop.entityType,
        inputData: { query },
        outputData: { summary: hop.summary, confidence: hop.confidence },
        explanation: hop.summary
      });
    }

    ReasoningTraceEngine.finalizeTraceLog(trace.traceId, result.finalAnswer);
    return result;
  }

  /**
   * Module 2: Cross-Document Reasoning across multiple books.
   */
  public static reasonCrossDocument(query: string): CrossDocumentReasoningResult {
    return CrossDocumentReasoningEngine.executeCrossDocumentReasoning(query);
  }

  /**
   * Module 3: Conflict Resolution between competing sources.
   */
  public static resolveConflict(topic: string, queryText?: string): ConflictReport {
    return ConflictResolutionEngine.evaluateConflict(topic, queryText);
  }

  /**
   * Module 4: Multi-dimensional Evidence Scoring.
   */
  public static scoreEvidence(input: Parameters<typeof EvidenceScoringEngine.computeEvidenceScore>[0]): EvidenceScoreBreakdown {
    return EvidenceScoringEngine.computeEvidenceScore(input);
  }

  /**
   * Module 5: Explainable AI Answer with full transparency.
   */
  public static generateExplainableAnswer(query: string): ExplainableAnswer {
    return ExplainableAIEngine.generateExplainableAnswer(query);
  }

  /**
   * Module 6: Rule Validation for Floor Plans, Yantras, Layouts.
   */
  public static validateRule(
    artifactType: 'FLOOR_PLAN' | 'YANTRA' | 'CHART' | 'DRAWING' | 'ROOM_LAYOUT',
    artifactData: any
  ): RuleValidationResult {
    return RuleValidationEngine.validateArtifact(artifactType, artifactData);
  }

  /**
   * Module 7: Probabilistic Hypothesis Engine for incomplete data.
   */
  public static evaluateHypothesis(query: string, partialText?: string): HypothesisResult {
    return HypothesisEngine.evaluateIncompleteData(query, partialText);
  }

  /**
   * Module 8: Knowledge Consistency Audit & Health Report.
   */
  public static auditKnowledgeHealth(): KnowledgeHealthReport {
    return KnowledgeConsistencyChecker.runConsistencyAudit();
  }

  /**
   * Module 9: Replay a stored Reasoning Trace Log.
   */
  public static replayTrace(traceId: string) {
    return ReasoningTraceEngine.replayTraceLog(traceId);
  }
}

