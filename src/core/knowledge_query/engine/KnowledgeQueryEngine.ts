// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE QUERY ENGINE (KQE)
// Multi-Domain Enterprise Knowledge Retrieval & Assembly Engine
// ============================================================================

import { 
  IKqeStructuredQuery, 
  IKqeQueryResultPackage, 
  KnowledgeDomain 
} from "../types/kqe.types";
import { QueryValidationStep } from "../pipeline/QueryValidationStep";
import { QueryNormalizationStep } from "../pipeline/QueryNormalizationStep";
import { RegistryLookupStep } from "../pipeline/RegistryLookupStep";
import { KnowledgeRecordRetrievalStep } from "../pipeline/KnowledgeRecordRetrievalStep";
import { RelationshipExpansionStep } from "../pipeline/RelationshipExpansionStep";
import { DuplicateEliminationStep } from "../pipeline/DuplicateEliminationStep";
import { ResultPackagingStep } from "../pipeline/ResultPackagingStep";

export class KnowledgeQueryEngine {
  private static instance: KnowledgeQueryEngine;

  private validator = new QueryValidationStep();
  private normalizer = new QueryNormalizationStep();
  private registryLookup = new RegistryLookupStep();
  private recordRetrieval = new KnowledgeRecordRetrievalStep();
  private relationshipExpansion = new RelationshipExpansionStep();
  private duplicateElimination = new DuplicateEliminationStep();
  private resultPackaging = new ResultPackagingStep();

  private constructor() {}

  public static getInstance(): KnowledgeQueryEngine {
    if (!KnowledgeQueryEngine.instance) {
      KnowledgeQueryEngine.instance = new KnowledgeQueryEngine();
    }
    return KnowledgeQueryEngine.instance;
  }

  /**
   * Executes full 7-step Knowledge Query Pipeline given a structured query
   */
  public executeQuery(query: IKqeStructuredQuery): IKqeQueryResultPackage {
    const startTimeMs = Date.now();

    // 1. Query Validation
    const validationResult = this.validator.validate(query);
    if (!validationResult.isValid) {
      throw new Error(`[KQE Validation Failure] ${validationResult.errors.join("; ")}`);
    }

    // 2. Query Normalization
    const normalizedQuery = this.normalizer.normalize(query);

    // 3. Registry Lookup
    const registryRecords = this.registryLookup.lookup(normalizedQuery);

    // 4. Knowledge Record Retrieval
    const baseVaultRecords = this.recordRetrieval.retrieve(normalizedQuery, registryRecords);

    // 5. Relationship Expansion
    const expansionResult = this.relationshipExpansion.expand(
      baseVaultRecords, 
      normalizedQuery.expandRelationships
    );

    // 6. Duplicate Elimination
    const dedupedData = this.duplicateElimination.eliminateDuplicates(
      expansionResult.expandedRecords
    );

    // 7. Result Packaging
    const queryPackage = this.resultPackaging.packageResult(
      query,
      normalizedQuery,
      dedupedData,
      expansionResult.expandedRecords,
      startTimeMs,
      expansionResult.relationshipExpandedCount
    );

    return queryPackage;
  }

  /**
   * Direction Query Shortcut
   */
  public queryByDirection(direction: string, domain: KnowledgeDomain = "Vastu"): IKqeQueryResultPackage {
    return this.executeQuery({
      domain,
      direction,
      queryType: 'DIRECTION'
    });
  }

  /**
   * Room Query Shortcut
   */
  public queryByRoom(room: string, domain: KnowledgeDomain = "Vastu"): IKqeQueryResultPackage {
    return this.executeQuery({
      domain,
      room,
      queryType: 'ROOM'
    });
  }

  /**
   * Object Query Shortcut
   */
  public queryByObject(objectType: string, domain: KnowledgeDomain = "Vastu"): IKqeQueryResultPackage {
    return this.executeQuery({
      domain,
      objectType,
      queryType: 'OBJECT'
    });
  }

  /**
   * Zone Query Shortcut
   */
  public queryByZone(zone: string, domain: KnowledgeDomain = "Vastu"): IKqeQueryResultPackage {
    return this.executeQuery({
      domain,
      zone,
      queryType: 'ZONE'
    });
  }

  /**
   * Rule ID Query Shortcut
   */
  public queryByRuleId(ruleId: string): IKqeQueryResultPackage {
    return this.executeQuery({
      ruleId,
      queryType: 'RULE'
    });
  }

  /**
   * Knowledge Record ID Query Shortcut
   */
  public queryByRecordId(recordId: string): IKqeQueryResultPackage {
    return this.executeQuery({
      knowledgeRecordId: recordId,
      queryType: 'KNOWLEDGE_RECORD'
    });
  }

  /**
   * Citation Query Shortcut
   */
  public queryByCitation(citationId: string): IKqeQueryResultPackage {
    return this.executeQuery({
      citationId,
      queryType: 'CITATION'
    });
  }

  /**
   * Compound Multi-Field Query Shortcut (e.g. Kitchen + South-East + Fire Element)
   */
  public executeCompoundQuery(
    params: Partial<IKqeStructuredQuery>
  ): IKqeQueryResultPackage {
    return this.executeQuery({
      ...params,
      queryType: 'COMPOUND_MULTI_FIELD'
    });
  }
}

export const knowledgeQueryEngine = KnowledgeQueryEngine.getInstance();
