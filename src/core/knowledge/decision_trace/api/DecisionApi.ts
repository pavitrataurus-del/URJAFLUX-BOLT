import { 
  IDecisionTrace, 
  IDecisionAuditRecord, 
  IEvidenceReference, 
  IConfidenceScores, 
  IStructuredExplanation 
} from "../models/DecisionModels";
import { DecisionRepositoryFactory } from "../repository/DecisionRepositoryFactory";
import { DecisionValidator } from "../validation/DecisionValidator";
import { EvidenceChainManager } from "../evidence/EvidenceChainManager";
import { DecisionConfidenceEngine } from "../confidence/ConfidenceEngine";
import { ExplainabilityGenerator } from "../explainability/ExplainabilityGenerator";
import { AuditTrailEngine } from "../audit/AuditTrailEngine";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { DecisionEventType, createDecisionEvent } from "../events/DecisionEvents";

export class DecisionApi {
  private static instance: DecisionApi;

  private constructor() {}

  public static getInstance(): DecisionApi {
    if (!DecisionApi.instance) {
      DecisionApi.instance = new DecisionApi();
    }
    return DecisionApi.instance;
  }

  public async createDecisionTrace(decision: IDecisionTrace): Promise<IDecisionTrace> {
    const repo = DecisionRepositoryFactory.getInstance().getRepository();
    
    const auditRecord = AuditTrailEngine.getInstance().createAuditRecord(
      decision.id,
      "CREATED",
      decision.auditTrail?.[0]?.author || "SYSTEM",
      "Initial decision trace creation"
    );

    decision.auditTrail = decision.auditTrail ? [...decision.auditTrail, auditRecord] : [auditRecord];

    DecisionValidator.getInstance().validateDecision(decision);

    const created = await repo.createDecision(decision);
    EventBus.getInstance().publish(createDecisionEvent(DecisionEventType.DECISION_CREATED, { decisionId: created.id }));
    return created;
  }

  public async loadDecisionTrace(decisionId: string): Promise<IDecisionTrace | null> {
    const repo = DecisionRepositoryFactory.getInstance().getRepository();
    return repo.getDecision(decisionId);
  }

  public listEvidence(decision: IDecisionTrace): IEvidenceReference[] {
    return decision.evidenceReferences;
  }

  public getConfidence(decision: IDecisionTrace): IConfidenceScores {
    return decision.confidence;
  }

  public getAuditTrail(decision: IDecisionTrace): IDecisionAuditRecord[] {
    return decision.auditTrail;
  }

  public validateDecision(decision: IDecisionTrace): boolean {
    const isValid = DecisionValidator.getInstance().validateDecision(decision);
    if (isValid) {
      EventBus.getInstance().publish(createDecisionEvent(DecisionEventType.DECISION_VALIDATED, { decisionId: decision.id }));
    }
    return isValid;
  }

  public generateExplanation(decision: IDecisionTrace): IStructuredExplanation {
    return ExplainabilityGenerator.getInstance().generateExplanation(decision);
  }

  public calculateConfidence(scores: Partial<IConfidenceScores>, weights?: Record<string, number>): IConfidenceScores {
    return DecisionConfidenceEngine.getInstance().aggregateConfidence(scores, weights);
  }

  public attachEvidence(decisionId: string, evidence: IEvidenceReference[]): IEvidenceReference[] {
    return EvidenceChainManager.getInstance().attachEvidence(decisionId, evidence);
  }
}
