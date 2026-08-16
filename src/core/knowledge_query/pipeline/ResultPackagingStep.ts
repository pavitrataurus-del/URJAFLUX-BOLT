// ============================================================================
// URJAFLUX AI OS - KQE RESULT PACKAGING STEP
// Pipeline Step 7: Assembles structured Knowledge Query Result Package
// ============================================================================

import { 
  IKqeStructuredQuery, 
  IKqeNormalizedQuery, 
  IKqeQueryResultPackage 
} from "../types/kqe.types";
import { IDeduplicatedResultSet } from "./DuplicateEliminationStep";
import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";

export class ResultPackagingStep {
  private static KQE_VERSION = "2.0.0-CANONICAL";

  public packageResult(
    originalQuery: IKqeStructuredQuery,
    normalizedQuery: IKqeNormalizedQuery,
    dedupedData: IDeduplicatedResultSet,
    records: IVaultKnowledgeRecord[],
    startTimeMs: number,
    relationshipExpandedCount: number
  ): IKqeQueryResultPackage {
    const endTimeMs = Date.now();
    const durationMs = Math.max(0, endTimeMs - startTimeMs);

    const matchingRuleIds = records.map(r => `REG-${r.recordId}`);

    const versionInformation = records.map(r => ({
      recordId: r.recordId,
      version: r.versionInfo.version,
      isDeprecated: r.versionInfo.isDeprecated
    }));

    return {
      queryId: normalizedQuery.queryId,
      queryTimestamp: new Date().toISOString(),
      originalQuery,
      normalizedQuery,
      
      matchingRuleIds,
      matchingKnowledgeRecordIds: dedupedData.recordIds,
      matchingCategories: dedupedData.categories,
      
      conditions: dedupedData.conditions,
      exceptions: dedupedData.exceptions,
      positiveFindings: dedupedData.positiveFindings,
      doshas: dedupedData.doshas,
      remedies: dedupedData.remedies,
      alternativeRemedies: dedupedData.alternativeRemedies,
      contraindications: dedupedData.contraindications,
      
      citations: dedupedData.citations,
      evidence: dedupedData.evidence,
      evidenceHashes: dedupedData.evidenceHashes,
      
      crossReferences: dedupedData.crossReferences,
      relatedDomains: dedupedData.relatedDomains,
      
      versionInformation,

      executionMetadata: {
        totalRecordsEvaluated: records.length,
        matchingCount: dedupedData.recordIds.length,
        pipelineDurationMs: durationMs,
        relationshipExpandedCount,
        engineVersion: ResultPackagingStep.KQE_VERSION
      }
    };
  }
}
