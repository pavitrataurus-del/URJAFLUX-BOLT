import { truthEngine } from "./TruthEngine";
import { evidenceEngine } from "./EvidenceEngine";
import { sourceReliabilityEngine } from "./SourceReliabilityEngine";
import { knowledgeWeightingEngine } from "./KnowledgeWeightingEngine";
import { expertConsensusEngine } from "./ExpertConsensusEngine";
import { contradictionResolutionEngine } from "./ContradictionResolutionEngine";
import { canonicalRuleBuilder } from "./CanonicalRuleBuilder";
import { knowledgeConfidenceEngine } from "./KnowledgeConfidenceEngine";
import { knowledgeDependencyEngine } from "./KnowledgeDependencyEngine";
import { crossDomainVerificationEngine } from "./CrossDomainVerificationEngine";
import { sourceVersionEngine } from "./SourceVersionEngine";
import { ruleEvolutionEngine } from "./RuleEvolutionEngine";
import { knowledgeTimelineEngine } from "./KnowledgeTimelineEngine";
import { truthGraphEngine } from "./TruthGraphEngine";
import { aiExplainabilityEngine } from "./AIExplainabilityEngine";

import {
  KnowledgeStatus,
  CanonicalRule,
  KnowledgeEvidence,
  SourceReliabilityMetrics,
  KnowledgeWeightMetrics,
  ExpertConsensusRecord,
  ContradictionRecord,
  KnowledgeConfidence,
  DependencyGraph,
  CrossDomainVerificationResult,
  SourceVersionRecord,
  RuleEvolutionSnapshot,
  TimelineEvent,
  TruthGraphData,
  AIExplainabilityOutput
} from "./VerificationTypes";

export interface IFullVerificationRecord {
  ruleId: string;
  title: string;
  statement: string;
  domain: string;
  status: KnowledgeStatus;
  canonicalRule?: CanonicalRule;
  evidence?: KnowledgeEvidence;
  sources: SourceReliabilityMetrics[];
  weights?: KnowledgeWeightMetrics;
  consensusRecords: ExpertConsensusRecord[];
  contradictions: ContradictionRecord[];
  confidence?: KnowledgeConfidence;
  crossDomain?: CrossDomainVerificationResult;
  dependencyGraph?: DependencyGraph;
  truthGraph?: TruthGraphData;
  explainability?: AIExplainabilityOutput;
}

export class KnowledgeVerificationService {
  private static instance: KnowledgeVerificationService;
  private records: Map<string, IFullVerificationRecord> = new Map();

  private constructor() {
    this.seedInitialKnowledge();
  }

  public static getInstance(): KnowledgeVerificationService {
    if (!KnowledgeVerificationService.instance) {
      KnowledgeVerificationService.instance = new KnowledgeVerificationService();
    }
    return KnowledgeVerificationService.instance;
  }

  private seedInitialKnowledge(): void {
    // 1. Kitchen Placement Rule
    const rule1Id = "rule-vastu-001";
    truthEngine.registerKnowledgeState(rule1Id, "CANONICAL");

    const source1 = sourceReliabilityEngine.registerSource({
      sourceId: "src-001",
      sourceName: "Mayamatam Critical Translation (IGNCA Edition)",
      authorityScore: 98,
      authenticityScore: 96,
      evidenceScore: 95,
      consistencyScore: 94,
      reviewScore: 92,
      usageFrequency: 1420,
      expertRating: 98
    });

    const source2 = sourceReliabilityEngine.registerSource({
      sourceId: "src-002",
      sourceName: "Manasara Vastu Shastra Classical Corpus",
      authorityScore: 95,
      authenticityScore: 94,
      evidenceScore: 92,
      consistencyScore: 90,
      reviewScore: 88,
      usageFrequency: 980,
      expertRating: 94
    });

    const ev1 = evidenceEngine.attachPrimarySource(rule1Id, {
      id: source1.sourceId,
      title: source1.sourceName,
      author: "Acharya Mayamuni",
      edition: "IGNCA Volume I",
      publicationYear: 1995,
      type: "PRIMARY",
      reliabilityScore: source1.overallReliability
    });

    const weight1 = knowledgeWeightingEngine.calculateWeight(
      rule1Id,
      ev1,
      [source1, source2],
      4, // 4 expert approvals
      0, // 0 conflict severity
      4  // 4 supporting domains
    );

    expertConsensusEngine.recordAction(rule1Id, "APPROVE", "exp-01", "Acharya V. N. Shastri", "Verified via Sanskrit verse 18.4.", 1);
    expertConsensusEngine.recordAction(rule1Id, "APPROVE", "exp-02", "Dr. S. K. Ramachandra Rao", "Fully aligned with Agni Tattva energetics.", 1);
    expertConsensusEngine.recordAction(rule1Id, "CREATE_CONSENSUS", "exp-00", "URJAFLUX SME Panel", "Canonical status approved.", 1);

    const conf1 = knowledgeConfidenceEngine.computeConfidence(rule1Id, ev1, weight1, ["Vastu", "Chakra", "Astrology", "Research"]);
    const canonical1 = canonicalRuleBuilder.buildCanonicalRule(
      rule1Id,
      "Kitchen Placement in South-East (Agneya) Quadrant",
      "The kitchen must be established in the South-East (Agneya) direction governed by Lord Agni Dev to maintain balanced digestive fire, somatic vitality, and family prosperity.",
      "Vastu Shastra",
      ev1,
      conf1,
      "Acharya SME Panel"
    );

    const cross1 = crossDomainVerificationEngine.verifyCrossDomain(rule1Id, "Vastu", ["Vastu", "Chakra", "Astrology", "Research"]);
    const dep1 = knowledgeDependencyEngine.generateDependencyGraph("Kitchen");
    const truthGraph1 = truthGraphEngine.generateTruthGraph(rule1Id);
    const explain1 = aiExplainabilityEngine.generateExplainability(canonical1, conf1);

    ruleEvolutionEngine.recordEvolution(
      rule1Id,
      canonical1.statement,
      "1.0.0",
      ["Mayamatam Chapter 18 Verse 4", "IGNCA Translation"],
      [],
      ["Approved by Acharya Shastri"],
      "Acharya Review Panel",
      "Initial Canonical Rule Registration"
    );

    knowledgeTimelineEngine.recordEvent(
      rule1Id,
      "CANONICAL_APPROVAL",
      "Canonical Rule Approved",
      "Kitchen placement in SE zone confirmed as canonical knowledge.",
      "Acharya Review Panel"
    );

    this.records.set(rule1Id, {
      ruleId: rule1Id,
      title: canonical1.title,
      statement: canonical1.statement,
      domain: canonical1.domain,
      status: "CANONICAL",
      canonicalRule: canonical1,
      evidence: ev1,
      sources: [source1, source2],
      weights: weight1,
      consensusRecords: expertConsensusEngine.getConsensusRecords(rule1Id),
      contradictions: [],
      confidence: conf1,
      crossDomain: cross1,
      dependencyGraph: dep1,
      truthGraph: truthGraph1,
      explainability: explain1
    });

    // 2. Disputed Water Reservoir Placement Rule
    const rule2Id = "rule-vastu-002";
    truthEngine.registerKnowledgeState(rule2Id, "DISPUTED");

    const source3 = sourceReliabilityEngine.registerSource({
      sourceId: "src-003",
      sourceName: "Lal Kitab Astro-Vastu Diagnostic Manual",
      authorityScore: 82,
      authenticityScore: 80,
      evidenceScore: 78,
      consistencyScore: 72,
      reviewScore: 75,
      usageFrequency: 650,
      expertRating: 80
    });

    const ev2 = evidenceEngine.attachPrimarySource(rule2Id, {
      id: source3.sourceId,
      title: source3.sourceName,
      author: "Pandit Roop Chand Joshi",
      publicationYear: 1952,
      type: "PRIMARY",
      reliabilityScore: source3.overallReliability
    });

    const cnf1 = contradictionResolutionEngine.logContradiction(
      rule2Id,
      "BOOK_VS_BOOK",
      "Mayamatam mandates Subterranean Water Reservoir strictly in North-East (NE) Ishan Zone.",
      "Lal Kitab suggests Subterranean Water in North-West (NW) Vayu Zone under specific Moon-Saturn planetary positions.",
      "src-001",
      "src-003",
      "HIGH"
    );

    expertConsensusEngine.recordAction(rule2Id, "FLAG", "exp-03", "Acharya Sharma", "Requires contextual horoscope verification before canonical approval.", 0);

    const weight2 = knowledgeWeightingEngine.calculateWeight(rule2Id, ev2, [source3], 1, 65, 2);
    const conf2 = knowledgeConfidenceEngine.computeConfidence(rule2Id, ev2, weight2, ["Vastu", "LalKitab"]);

    this.records.set(rule2Id, {
      ruleId: rule2Id,
      title: "Subterranean Water Reservoir Zone Selection",
      statement: "Subterranean water storage placement variance between North-East (NE) Ishan Zone and North-West (NW) Vayu Zone based on planetary kundli alignment.",
      domain: "Vastu & Lal Kitab",
      status: "DISPUTED",
      evidence: ev2,
      sources: [source3],
      weights: weight2,
      consensusRecords: expertConsensusEngine.getConsensusRecords(rule2Id),
      contradictions: [cnf1],
      confidence: conf2,
      crossDomain: crossDomainVerificationEngine.verifyCrossDomain(rule2Id, "Vastu", ["Vastu", "LalKitab"]),
      dependencyGraph: knowledgeDependencyEngine.generateDependencyGraph("Water Reservoir"),
      truthGraph: truthGraphEngine.generateTruthGraph(rule2Id),
      explainability: aiExplainabilityEngine.generateExplainability(undefined, conf2)
    });
  }

  public getAllRecords(role: "ADMIN" | "END_USER" = "ADMIN"): IFullVerificationRecord[] {
    const all = Array.from(this.records.values());
    if (role === "END_USER") {
      // RBAC Filter: End Users see ONLY CANONICAL approved rules, with internal consensus, votes, and raw calculations redacted
      return all
        .filter(r => r.status === "CANONICAL")
        .map(r => ({
          ruleId: r.ruleId,
          title: r.title,
          statement: r.statement,
          domain: r.domain,
          status: "CANONICAL",
          canonicalRule: r.canonicalRule,
          confidence: r.confidence ? {
            ...r.confidence,
            confidenceExplanation: "Verified Canonical Knowledge backed by primary scriptural evidence." // Sanitized
          } : undefined,
          sources: [], // Redacted internal scores
          consensusRecords: [], // Redacted internal votes
          contradictions: [], // Redacted internal conflicts
          dependencyGraph: r.dependencyGraph,
          explainability: r.explainability
        }));
    }
    return all;
  }

  public getRecordById(ruleId: string, role: "ADMIN" | "END_USER" = "ADMIN"): IFullVerificationRecord | undefined {
    const records = this.getAllRecords(role);
    return records.find(r => r.ruleId === ruleId);
  }

  public promoteRuleToCanonical(ruleId: string, reviewer: string, comment: string): IFullVerificationRecord | undefined {
    const record = this.records.get(ruleId);
    if (!record) return undefined;

    truthEngine.promoteToCanonical(ruleId, reviewer);
    record.status = "CANONICAL";

    const consensus = expertConsensusEngine.recordAction(ruleId, "APPROVE", "exp-admin", reviewer, comment, 1);
    record.consensusRecords.push(consensus);

    const canonical = canonicalRuleBuilder.buildCanonicalRule(
      ruleId,
      record.title,
      record.statement,
      record.domain,
      record.evidence,
      record.confidence,
      reviewer
    );
    record.canonicalRule = canonical;

    if (record.confidence) {
      record.confidence.confidenceScore = 95;
      record.confidence.confidenceGrade = "A+";
      record.confidence.confidenceExplanation = `Promoted to Canonical Knowledge after SME review by ${reviewer}.`;
    }

    knowledgeTimelineEngine.recordEvent(
      ruleId,
      "CANONICAL_APPROVAL",
      "Rule Promoted to Canonical",
      `Promoted by ${reviewer}: ${comment}`,
      reviewer
    );

    this.records.set(ruleId, record);
    return record;
  }

  public resolveContradiction(
    ruleId: string,
    contradictionId: string,
    state: "CONSENSUS_REACHED" | "CONTEXT_DEPENDENT" | "SUPERSEDED",
    reviewer: string,
    notes: string
  ): void {
    const record = this.records.get(ruleId);
    if (!record) return;

    contradictionResolutionEngine.resolveContradiction(contradictionId, state, reviewer, notes);
    knowledgeTimelineEngine.recordEvent(
      ruleId,
      "EXPERT_REVIEW",
      "Contradiction Resolved",
      `Resolved contradiction (${state}): ${notes}`,
      reviewer
    );
  }
}

export const knowledgeVerificationService = KnowledgeVerificationService.getInstance();
