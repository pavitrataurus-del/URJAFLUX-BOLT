import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { CanonicalEntity } from '../canonicalization/CanonicalEntity';

export type DuplicateType =
  | 'DUPLICATE_KNOWLEDGE_OBJECT'
  | 'DUPLICATE_EVIDENCE'
  | 'DUPLICATE_RELATIONSHIP'
  | 'DUPLICATE_CANONICAL_ENTITY';

export interface IDuplicateReport {
  readonly duplicateId: string;
  readonly duplicateType: DuplicateType;
  readonly description: string;
  readonly primaryId: string;
  readonly duplicateIds: readonly string[];
  readonly matchCriteria: string;
  readonly details: Record<string, unknown>;
  readonly detectedAt: number;
}

export class DuplicateValidator {
  public validateDuplicates(
    objects: readonly KnowledgeObject[],
    evidenceList: readonly KnowledgeEvidence[],
    relationships: readonly KnowledgeRelationship[],
    canonicalEntities: readonly CanonicalEntity[]
  ): readonly IDuplicateReport[] {
    const reports: IDuplicateReport[] = [];

    reports.push(...this.detectObjectDuplicates(objects));
    reports.push(...this.detectEvidenceDuplicates(evidenceList));
    reports.push(...this.detectRelationshipDuplicates(relationships));
    reports.push(...this.detectCanonicalEntityDuplicates(canonicalEntities));

    return Object.freeze(reports);
  }

  private detectObjectDuplicates(objects: readonly KnowledgeObject[]): IDuplicateReport[] {
    const reports: IDuplicateReport[] = [];
    const seenMap = new Map<string, KnowledgeObject[]>();

    for (const obj of objects) {
      const signature = `${obj.entity.trim().toLowerCase()}::${obj.attribute.trim().toLowerCase()}::${JSON.stringify(obj.value)}::${obj.sourceNodeId}`;
      if (!seenMap.has(signature)) {
        seenMap.set(signature, []);
      }
      seenMap.get(signature)!.push(obj);
    }

    for (const [sig, items] of seenMap.entries()) {
      if (items.length > 1) {
        const primary = items[0];
        const duplicates = items.slice(1);
        reports.push({
          duplicateId: `DUP_OBJ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          duplicateType: 'DUPLICATE_KNOWLEDGE_OBJECT',
          description: `Detected ${duplicates.length} duplicate KnowledgeObject(s) matching signature '${sig}'`,
          primaryId: primary.knowledgeId,
          duplicateIds: duplicates.map((d) => d.knowledgeId),
          matchCriteria: 'entity+attribute+value+sourceNodeId',
          details: { signature: sig, totalMatches: items.length },
          detectedAt: Date.now()
        });
      }
    }

    return reports;
  }

  private detectEvidenceDuplicates(evidenceList: readonly KnowledgeEvidence[]): IDuplicateReport[] {
    const reports: IDuplicateReport[] = [];
    const seenMap = new Map<string, KnowledgeEvidence[]>();

    for (const ev of evidenceList) {
      const signature = `${ev.documentId}::${ev.nodeId}::${ev.quotedText.trim().toLowerCase()}`;
      if (!seenMap.has(signature)) {
        seenMap.set(signature, []);
      }
      seenMap.get(signature)!.push(ev);
    }

    for (const [sig, items] of seenMap.entries()) {
      if (items.length > 1) {
        const primary = items[0];
        const duplicates = items.slice(1);
        reports.push({
          duplicateId: `DUP_EVI_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          duplicateType: 'DUPLICATE_EVIDENCE',
          description: `Detected ${duplicates.length} duplicate KnowledgeEvidence item(s) matching signature '${sig}'`,
          primaryId: primary.evidenceId,
          duplicateIds: duplicates.map((d) => d.evidenceId),
          matchCriteria: 'documentId+nodeId+quotedText',
          details: { signature: sig, totalMatches: items.length },
          detectedAt: Date.now()
        });
      }
    }

    return reports;
  }

  private detectRelationshipDuplicates(relationships: readonly KnowledgeRelationship[]): IDuplicateReport[] {
    const reports: IDuplicateReport[] = [];
    const seenMap = new Map<string, KnowledgeRelationship[]>();

    for (const rel of relationships) {
      const signature = `${rel.sourceKnowledgeId}::${rel.targetKnowledgeId}::${String(rel.relationshipType).toUpperCase()}`;
      if (!seenMap.has(signature)) {
        seenMap.set(signature, []);
      }
      seenMap.get(signature)!.push(rel);
    }

    for (const [sig, items] of seenMap.entries()) {
      if (items.length > 1) {
        const primary = items[0];
        const duplicates = items.slice(1);
        reports.push({
          duplicateId: `DUP_REL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          duplicateType: 'DUPLICATE_RELATIONSHIP',
          description: `Detected ${duplicates.length} duplicate KnowledgeRelationship item(s) matching signature '${sig}'`,
          primaryId: primary.relationshipId,
          duplicateIds: duplicates.map((d) => d.relationshipId),
          matchCriteria: 'sourceKnowledgeId+targetKnowledgeId+relationshipType',
          details: { signature: sig, totalMatches: items.length },
          detectedAt: Date.now()
        });
      }
    }

    return reports;
  }

  private detectCanonicalEntityDuplicates(canonicalEntities: readonly CanonicalEntity[]): IDuplicateReport[] {
    const reports: IDuplicateReport[] = [];
    const seenMap = new Map<string, CanonicalEntity[]>();

    for (const entity of canonicalEntities) {
      const signature = entity.normalizedKey;
      if (!seenMap.has(signature)) {
        seenMap.set(signature, []);
      }
      seenMap.get(signature)!.push(entity);
    }

    for (const [sig, items] of seenMap.entries()) {
      if (items.length > 1) {
        const primary = items[0];
        const duplicates = items.slice(1);
        reports.push({
          duplicateId: `DUP_CAN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          duplicateType: 'DUPLICATE_CANONICAL_ENTITY',
          description: `Detected ${duplicates.length} duplicate CanonicalEntity items with normalizedKey '${sig}'`,
          primaryId: primary.entityId,
          duplicateIds: duplicates.map((d) => d.entityId),
          matchCriteria: 'normalizedKey',
          details: { normalizedKey: sig, totalMatches: items.length },
          detectedAt: Date.now()
        });
      }
    }

    return reports;
  }
}
