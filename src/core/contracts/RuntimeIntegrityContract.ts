/**
 * URJAFLUX AI OS - Runtime Integrity Contract
 * Phase 5: Enforces strict data contracts for all customer-facing components.
 * UI components MUST consume ONLY approved runtime objects.
 */

import { CanonicalSpatialContext } from "../spatial/CanonicalSpatialContext";
import { CanonicalFinding } from "../findings/CanonicalFinding";
import { DecisionEngineExecutionResult } from "../../engines/decision/UrjafluxDecisionEngine";
import { PropertyHealthIndex } from "../../engines/decision/types";
import { EvaluationCoverageReport } from "../../engines/validation/EvaluationCoverageEngine";
import { PropertyRecognitionSummary } from "../../recognition/types";

export interface ApprovedRuntimePayload {
  spatialContexts: CanonicalSpatialContext[];
  canonicalFindings: CanonicalFinding[];
  decisionResult: DecisionEngineExecutionResult | null;
  propertyHealth: PropertyHealthIndex | null;
  coverageReport: EvaluationCoverageReport | null;
  recognitionSummary: PropertyRecognitionSummary | null;
  clientName: string | null;
  projectName: string | null;
  executedTimestamp: number | null;
}

export class RuntimeIntegrityContract {
  /**
   * Validates if a runtime payload strictly conforms to the approved runtime schema.
   */
  public static validatePayload(payload: Partial<ApprovedRuntimePayload>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload.executedTimestamp) {
      errors.push("Payload missing live execution timestamp. Analysis has not been run.");
    }

    if (!payload.recognitionSummary && (!payload.spatialContexts || payload.spatialContexts.length === 0)) {
      errors.push("Payload missing recognition summary and spatial contexts.");
    }

    if (!payload.decisionResult) {
      errors.push("Payload missing DecisionEngineExecutionResult object.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
