// ============================================================================
// URJAFLUX AI OS - KQE RELATIONSHIP EXPANSION STEP
// Pipeline Step 5: Traverses structural graph links to gather related knowledge assets
// ============================================================================

import { IVaultKnowledgeRecord } from "../../knowledge_vault/types/vaultRecord.types";
import { KnowledgeRelationshipManager } from "../../knowledge_vault/relationships/KnowledgeRelationshipManager";
import { KnowledgeVaultStore } from "../../knowledge_vault/store/KnowledgeVaultStore";

export class RelationshipExpansionStep {
  private relationshipManager = KnowledgeRelationshipManager.getInstance();
  private vaultStore = KnowledgeVaultStore.getInstance();

  public expand(
    baseRecords: IVaultKnowledgeRecord[],
    shouldExpand: boolean = true
  ): {
    expandedRecords: IVaultKnowledgeRecord[];
    relationshipExpandedCount: number;
  } {
    if (!shouldExpand) {
      return {
        expandedRecords: baseRecords,
        relationshipExpandedCount: 0
      };
    }

    const recordsMap = new Map<string, IVaultKnowledgeRecord>();
    baseRecords.forEach(r => recordsMap.set(r.recordId, r));

    let expandedCount = 0;

    baseRecords.forEach(baseRec => {
      const relationships = this.relationshipManager.getRelationshipsForRecord(baseRec.recordId, 'BOTH');
      
      relationships.forEach(rel => {
        const targetId = rel.sourceRecordId === baseRec.recordId ? rel.targetRecordId : rel.sourceRecordId;
        if (!recordsMap.has(targetId)) {
          const linkedRec = this.vaultStore.getRecordById(targetId);
          if (linkedRec) {
            recordsMap.set(linkedRec.recordId, linkedRec);
            expandedCount++;
          }
        }
      });
    });

    return {
      expandedRecords: Array.from(recordsMap.values()),
      relationshipExpandedCount: expandedCount
    };
  }
}
