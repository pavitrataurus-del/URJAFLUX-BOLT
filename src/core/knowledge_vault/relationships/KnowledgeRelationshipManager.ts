// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE RELATIONSHIP MANAGER (PHASE 2)
// Cross-Record Linking Engine for Structural Knowledge Graphs
// ============================================================================

import { 
  IKnowledgeRelationship, 
  RelationshipType, 
  IVaultKnowledgeRecord 
} from "../types/vaultRecord.types";

export class KnowledgeRelationshipManager {
  private static instance: KnowledgeRelationshipManager;
  private relationships: Map<string, IKnowledgeRelationship> = new Map();
  private sourceIndex: Map<string, Set<string>> = new Map();
  private targetIndex: Map<string, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeRelationshipManager {
    if (!KnowledgeRelationshipManager.instance) {
      KnowledgeRelationshipManager.instance = new KnowledgeRelationshipManager();
    }
    return KnowledgeRelationshipManager.instance;
  }

  /**
   * Links two Knowledge Records structurally without performing reasoning
   */
  public linkRecords(
    sourceRecordId: string,
    targetRecordId: string,
    relationshipType: RelationshipType,
    weight: number = 1.0,
    notes?: string
  ): IKnowledgeRelationship {
    const relationshipId = `REL-${sourceRecordId}-${relationshipType}-${targetRecordId}`;
    
    const relationship: IKnowledgeRelationship = {
      relationshipId,
      sourceRecordId,
      targetRecordId,
      relationshipType,
      weight: Math.max(0, Math.min(1.0, weight)),
      notes,
      createdAt: new Date().toISOString()
    };

    this.relationships.set(relationshipId, relationship);

    // Index Source
    if (!this.sourceIndex.has(sourceRecordId)) {
      this.sourceIndex.set(sourceRecordId, new Set());
    }
    this.sourceIndex.get(sourceRecordId)!.add(relationshipId);

    // Index Target
    if (!this.targetIndex.has(targetRecordId)) {
      this.targetIndex.set(targetRecordId, new Set());
    }
    this.targetIndex.get(targetRecordId)!.add(relationshipId);

    return relationship;
  }

  /**
   * Auto-discovers and builds initial relationships for a freshly stored record
   */
  public autoRegisterRecordRelationships(record: IVaultKnowledgeRecord, allRecords: IVaultKnowledgeRecord[]): void {
    const p = record.knowledgePayload;

    // Link exceptions to parent rule records if present in payload
    if (p.exceptions.length > 0 && record.category === 'RULE') {
      allRecords.forEach(target => {
        if (target.recordId !== record.recordId && target.category === 'EXCEPTION') {
          if (target.hierarchyLocation.chapter === record.hierarchyLocation.chapter) {
            this.linkRecords(
              record.recordId, 
              target.recordId, 
              'RULE_TO_EXCEPTION', 
              0.95, 
              `Linked exception in chapter: ${record.hierarchyLocation.chapter}`
            );
          }
        }
      });
    }

    // Link remedies to rules
    if (p.remedies.length > 0 && record.category === 'DOSHA') {
      allRecords.forEach(target => {
        if (target.recordId !== record.recordId && target.category === 'REMEDY') {
          if (target.knowledgePayload.targetZones.some(z => p.targetZones.includes(z))) {
            this.linkRecords(
              record.recordId, 
              target.recordId, 
              'RULE_TO_REMEDY', 
              0.90, 
              `Matched remedy zone: ${p.targetZones.join(', ')}`
            );
          }
        }
      });
    }

    // Register existing relationship array inside record
    if (record.relationships && record.relationships.length > 0) {
      record.relationships.forEach(rel => {
        this.linkRecords(rel.sourceRecordId, rel.targetRecordId, rel.relationshipType, rel.weight, rel.notes);
      });
    }
  }

  /**
   * Queries outgoing or incoming relationships for a record
   */
  public getRelationshipsForRecord(
    recordId: string, 
    direction: 'OUTGOING' | 'INCOMING' | 'BOTH' = 'BOTH'
  ): IKnowledgeRelationship[] {
    const result: IKnowledgeRelationship[] = [];

    if (direction === 'OUTGOING' || direction === 'BOTH') {
      const outgoingIds = this.sourceIndex.get(recordId);
      if (outgoingIds) {
        outgoingIds.forEach(relId => {
          const rel = this.relationships.get(relId);
          if (rel) result.push(rel);
        });
      }
    }

    if (direction === 'INCOMING' || direction === 'BOTH') {
      const incomingIds = this.targetIndex.get(recordId);
      if (incomingIds) {
        incomingIds.forEach(relId => {
          const rel = this.relationships.get(relId);
          if (rel && !result.some(r => r.relationshipId === rel.relationshipId)) {
            result.push(rel);
          }
        });
      }
    }

    return result;
  }

  /**
   * Filter relationships by specific type
   */
  public getRelationshipsByType(
    recordId: string, 
    relationshipType: RelationshipType
  ): IKnowledgeRelationship[] {
    return this.getRelationshipsForRecord(recordId, 'BOTH').filter(
      r => r.relationshipType === relationshipType
    );
  }

  /**
   * Returns all relationships stored in the graph
   */
  public getAllRelationships(): IKnowledgeRelationship[] {
    return Array.from(this.relationships.values());
  }

  public clear(): void {
    this.relationships.clear();
    this.sourceIndex.clear();
    this.targetIndex.clear();
  }
}

export const knowledgeRelationshipManager = KnowledgeRelationshipManager.getInstance();
