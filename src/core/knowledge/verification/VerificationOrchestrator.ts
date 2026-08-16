import { knowledgeVerificationService } from "./KnowledgeVerificationService";
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

export class VerificationOrchestrator {
  private static instance: VerificationOrchestrator;

  public truthEngine = truthEngine;
  public evidenceEngine = evidenceEngine;
  public sourceReliabilityEngine = sourceReliabilityEngine;
  public weightingEngine = knowledgeWeightingEngine;
  public consensusEngine = expertConsensusEngine;
  public contradictionEngine = contradictionResolutionEngine;
  public canonicalBuilder = canonicalRuleBuilder;
  public confidenceEngine = knowledgeConfidenceEngine;
  public dependencyEngine = knowledgeDependencyEngine;
  public crossDomainEngine = crossDomainVerificationEngine;
  public versionEngine = sourceVersionEngine;
  public evolutionEngine = ruleEvolutionEngine;
  public timelineEngine = knowledgeTimelineEngine;
  public truthGraphEngine = truthGraphEngine;
  public explainabilityEngine = aiExplainabilityEngine;

  public static getInstance(): VerificationOrchestrator {
    if (!VerificationOrchestrator.instance) {
      VerificationOrchestrator.instance = new VerificationOrchestrator();
    }
    return VerificationOrchestrator.instance;
  }

  public getRuleTruthSummary(ruleId: string, role: "ADMIN" | "END_USER" = "ADMIN") {
    return knowledgeVerificationService.getRecordById(ruleId, role);
  }
}

export const verificationOrchestrator = VerificationOrchestrator.getInstance();
