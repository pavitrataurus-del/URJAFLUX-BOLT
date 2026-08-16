// ============================================================================
// URJAFLUX AI OS - KQE KNOWLEDGE RECORD RETRIEVAL STEP
// Pipeline Step 4: Fetches canonical Knowledge Vault records from Vault Store
// ============================================================================

import { IKqeNormalizedQuery } from "../types/kqe.types";
import { IRuleRegistryRecord } from "../../rule_registry/types/ruleRegistry.types";
import { KnowledgeVaultStore } from "../../knowledge_vault/store/KnowledgeVaultStore";
import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";

export class KnowledgeRecordRetrievalStep {
  private vaultStore = KnowledgeVaultStore.getInstance();

  public retrieve(
    normalizedQuery: IKqeNormalizedQuery,
    registryRecords: IRuleRegistryRecord[]
  ): IVaultKnowledgeRecord[] {
    const recordsMap = new Map<string, IVaultKnowledgeRecord>();

    // 1. Direct Knowledge Record ID query
    if (normalizedQuery.knowledgeRecordId) {
      const directRec = this.vaultStore.getRecordById(normalizedQuery.knowledgeRecordId);
      if (directRec) {
        recordsMap.set(directRec.recordId, directRec);
      }
    }

    // 2. Direct Citation ID query
    if (normalizedQuery.citationId) {
      const allVaultRecords = this.vaultStore.getAllRecords();
      allVaultRecords.forEach(r => {
        if (r.citation.citationId === normalizedQuery.citationId) {
          recordsMap.set(r.recordId, r);
        }
      });
    }

    // 3. Vault retrieval via Registry Records
    registryRecords.forEach(regRec => {
      regRec.knowledgeRecordIds.forEach(vaultId => {
        const vaultRec = this.vaultStore.getRecordById(vaultId);
        if (vaultRec) {
          recordsMap.set(vaultRec.recordId, vaultRec);
        }
      });
    });

    // 4. Fallback Vault query if registry yielded empty set for dimensional search
    if (recordsMap.size === 0 && !normalizedQuery.ruleId && !normalizedQuery.knowledgeRecordId && !normalizedQuery.citationId) {
      const fallbackVaultRecords = this.vaultStore.queryVault({
        domain: normalizedQuery.domain,
        category: normalizedQuery.category || undefined,
        zone: normalizedQuery.direction || normalizedQuery.zone || undefined,
        planet: normalizedQuery.planet || undefined
      });

      fallbackVaultRecords.forEach(r => {
        recordsMap.set(r.recordId, r);
      });
    }

    return Array.from(recordsMap.values());
  }
}
