// ============================================================================
// URJAFLUX AI OS - RULE REGISTRY ENGINE (RRE)
// Single Source of Truth Knowledge Organizer & Multi-Dimensional Rule Registry
// ============================================================================

import { 
  IRuleRegistryRecord, 
  IRegistryIndexQuery, 
  IRegistryIndexStats 
} from "../types/ruleRegistry.types";
import { RegistryIndexManager } from "../indexing/RegistryIndexManager";
import { KnowledgeVaultStore } from "../../knowledge_vault/store/KnowledgeVaultStore";
import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";

export class RuleRegistryEngine {
  private static instance: RuleRegistryEngine;
  private indexManager = RegistryIndexManager.getInstance();
  private vaultStore = KnowledgeVaultStore.getInstance();

  private constructor() {}

  public static getInstance(): RuleRegistryEngine {
    if (!RuleRegistryEngine.instance) {
      RuleRegistryEngine.instance = new RuleRegistryEngine();
    }
    return RuleRegistryEngine.instance;
  }

  /**
   * Transforms a Vault Knowledge Record into a structural Rule Registry Record and indexes it
   */
  public registerVaultRecord(vaultRecord: IVaultKnowledgeRecord): IRuleRegistryRecord {
    const ruleId = `REG-${vaultRecord.recordId}`;
    const timestamp = new Date().toISOString();
    const p = vaultRecord.knowledgePayload;

    const conditionIds: string[] = [];
    const exceptionIds: string[] = [];
    const causeIds: string[] = [];
    const effectIds: string[] = [];
    const positiveFindingIds: string[] = [];
    const doshaIds: string[] = [];
    const remedyIds: string[] = [];
    const alternativeRemedyIds: string[] = [];
    const contraindicationIds: string[] = [];
    const relatedRuleIds: string[] = [];

    // Classify linked structural relationships
    vaultRecord.relationships.forEach(rel => {
      if (rel.relationshipType === 'RULE_TO_EXCEPTION') {
        exceptionIds.push(rel.targetRecordId);
      } else if (rel.relationshipType === 'RULE_TO_REMEDY') {
        remedyIds.push(rel.targetRecordId);
      } else if (rel.relationshipType === 'RULE_TO_POSITIVE_FINDING') {
        positiveFindingIds.push(rel.targetRecordId);
      } else if (rel.relationshipType === 'RULE_TO_RELATED_RULE') {
        relatedRuleIds.push(rel.targetRecordId);
      }
    });

    if (vaultRecord.category === 'DOSHA') doshaIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'REMEDY') remedyIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'ALTERNATIVE_REMEDY') alternativeRemedyIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'CONTRAINDICATION') contraindicationIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'CONDITION') conditionIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'EXCEPTION') exceptionIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'CAUSE') causeIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'EFFECT') effectIds.push(vaultRecord.recordId);
    if (vaultRecord.category === 'POSITIVE_FINDING') positiveFindingIds.push(vaultRecord.recordId);

    const registryRecord: IRuleRegistryRecord = {
      ruleId,
      knowledgeRecordIds: [vaultRecord.recordId],
      domain: vaultRecord.sourceMetadata.domain,
      ruleCategory: vaultRecord.category,
      
      objectTypes: p.targetZones.filter(z => z.toLowerCase().includes("item") || z.toLowerCase().includes("mirror")),
      rooms: p.targetZones.filter(z => z.toLowerCase().includes("room") || z.toLowerCase().includes("kitchen")),
      directions: p.targetZones.filter(z => ["NORTH", "SOUTH", "EAST", "WEST", "NORTHEAST", "NORTHWEST", "SOUTHEAST", "SOUTHWEST", "ISHAN", "AGNEY", "NAIRUTYA", "VAYAVYA"].includes(z.toUpperCase())),
      zones: p.targetZones,
      elements: p.targetElements,
      planets: p.targetPlanets,
      chakras: p.targetChakras,
      activities: [],

      conditionIds,
      exceptionIds,
      causeIds,
      effectIds,
      positiveFindingIds,
      doshaIds,
      remedyIds,
      alternativeRemedyIds,
      contraindicationIds,
      relatedRuleIds,
      relatedDomainIds: vaultRecord.relatedDomains || [vaultRecord.sourceMetadata.domain],
      citationIds: [vaultRecord.citation.citationId],
      evidenceIds: [vaultRecord.immutableHash],

      version: vaultRecord.versionInfo.version,
      registeredAt: timestamp,
      updatedAt: timestamp
    };

    this.indexManager.indexRecord(registryRecord);
    return registryRecord;
  }

  /**
   * Synchronizes all records currently stored in Knowledge Vault Store
   */
  public syncFromKnowledgeVault(): number {
    const vaultRecords = this.vaultStore.getAllRecords();
    let count = 0;
    vaultRecords.forEach(rec => {
      this.registerVaultRecord(rec);
      count++;
    });
    return count;
  }

  /**
   * Looks up a single Rule Registry Record by ID
   */
  public getRegistryRecord(ruleId: string): IRuleRegistryRecord | undefined {
    return this.indexManager.getRecordById(ruleId);
  }

  /**
   * Discovers every rule, condition, exception, and remedy matching structural dimensions
   */
  public discoverRules(query: IRegistryIndexQuery): IRuleRegistryRecord[] {
    const matchedIds = this.indexManager.queryRegistryIds(query);
    return this.indexManager.getRecordsByIds(matchedIds);
  }

  /**
   * Returns complete multi-dimensional Registry statistics
   */
  public getRegistryStats(): IRegistryIndexStats {
    return this.indexManager.getStats();
  }
}

export const ruleRegistryEngine = RuleRegistryEngine.getInstance();
