import { IDecisionTrace } from "../models/DecisionModels";
import { EvidenceChainManager } from "../evidence/EvidenceChainManager";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class DecisionValidator {
  private static instance: DecisionValidator;

  private constructor() {}

  public static getInstance(): DecisionValidator {
    if (!DecisionValidator.instance) {
      DecisionValidator.instance = new DecisionValidator();
    }
    return DecisionValidator.instance;
  }

  public validateDecision(decision: IDecisionTrace): boolean {
    if (!decision.id) {
      throw new EnterpriseError("Decision ID is missing", { category: ErrorCategory.VALIDATION });
    }

    if (!decision.evidenceReferences || decision.evidenceReferences.length === 0) {
      // Must have some evidence
      // Wait, is it strictly required? The sprint says: missing provenance validation.
      // Assuming a decision must have provenance.
    }

    const isValidEvidence = EvidenceChainManager.getInstance().validateEvidenceChain(decision.evidenceReferences);
    if (!isValidEvidence) {
      throw new EnterpriseError(`Decision ${decision.id} contains invalid or missing provenance`, { category: ErrorCategory.VALIDATION });
    }

    if (!decision.confidence || decision.confidence.compositeConfidence === undefined) {
      throw new EnterpriseError(`Decision ${decision.id} is missing confidence scores`, { category: ErrorCategory.VALIDATION });
    }
    
    if (decision.confidence.compositeConfidence < 0 || decision.confidence.compositeConfidence > 1) {
       throw new EnterpriseError(`Decision ${decision.id} has out of bounds composite confidence`, { category: ErrorCategory.VALIDATION });
    }

    if (!decision.auditTrail || decision.auditTrail.length === 0) {
      throw new EnterpriseError(`Decision ${decision.id} is missing audit records`, { category: ErrorCategory.VALIDATION });
    }

    return true;
  }
}
