// ============================================================================
// URJAFLUX AI OS - KQE QUERY VALIDATION STEP
// Pipeline Step 1: Validates query parameter integrity
// ============================================================================

import { IKqeStructuredQuery } from "../types/kqe.types";

export class QueryValidationStep {
  public validate(query: IKqeStructuredQuery): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!query) {
      return { isValid: false, errors: ["Query object cannot be null or undefined."] };
    }

    const hasIdentifier = Boolean(query.ruleId || query.knowledgeRecordId || query.citationId);
    const hasDimension = Boolean(
      query.objectType ||
      query.room ||
      query.direction ||
      query.zone ||
      query.element ||
      query.planet ||
      query.chakra ||
      query.activity ||
      query.category ||
      query.domain
    );

    if (!hasIdentifier && !hasDimension) {
      errors.push("Query must specify at least one search dimension (e.g. direction, room, objectType) or identifier (e.g. ruleId, citationId).");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
