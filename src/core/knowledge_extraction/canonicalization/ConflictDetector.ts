import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { CanonicalEntity } from './CanonicalEntity';
import { AliasDictionary } from './AliasDictionary';

export type KnowledgeConflictType =
  | 'VALUE_CONFLICT'
  | 'ATTRIBUTE_CONFLICT'
  | 'CANONICAL_MAPPING_CONFLICT'
  | 'LOW_CONFIDENCE_CONFLICT'
  | 'RELATIONSHIP_CONFLICT'
  | 'DUPLICATE_ENTITY_CONFLICT';

export interface IKnowledgeConflict {
  readonly conflictId: string;
  readonly conflictType: KnowledgeConflictType;
  readonly description: string;
  readonly targetIds: readonly string[];
  readonly details: Record<string, unknown>;
  readonly detectedAt: number;
}

export class ConflictDetector {
  private readonly aliasDictionary: AliasDictionary;

  constructor(aliasDictionary: AliasDictionary = new AliasDictionary()) {
    this.aliasDictionary = aliasDictionary;
  }

  public detectConflicts(
    objects: readonly KnowledgeObject[],
    relationships: readonly KnowledgeRelationship[],
    canonicalEntities: readonly CanonicalEntity[]
  ): readonly IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];

    // 1. Conflicting values & attributes
    conflicts.push(...this.detectObjectConflicts(objects));

    // 2. Conflicting canonical mappings
    conflicts.push(...this.detectCanonicalMappingConflicts(objects, canonicalEntities));

    // 3. Low confidence conflicts
    conflicts.push(...this.detectLowConfidenceConflicts(objects));

    // 4. Relationship conflicts
    conflicts.push(...this.detectRelationshipConflicts(relationships));

    // 5. Duplicate entity conflicts
    conflicts.push(...this.detectDuplicateEntityConflicts(canonicalEntities));

    return Object.freeze(conflicts);
  }

  private detectObjectConflicts(objects: readonly KnowledgeObject[]): IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];
    // Group by canonical entity + attribute
    const grouped = new Map<string, KnowledgeObject[]>();

    for (const obj of objects) {
      const canonicalEntity = this.aliasDictionary.getCanonicalName(obj.entity);
      const normEntity = CanonicalEntity.normalizeKey(canonicalEntity);
      const normAttr = obj.attribute ? obj.attribute.trim().toLowerCase() : '';
      const key = `${normEntity}::${normAttr}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(obj);
    }

    for (const [key, items] of grouped.entries()) {
      if (items.length < 2) continue;

      // Check for value conflicts
      const distinctValues = new Set<string>();
      const valueTypes = new Set<string>();

      items.forEach((item) => {
        distinctValues.add(JSON.stringify(item.value));
        valueTypes.add(typeof item.value);
      });

      if (distinctValues.size > 1) {
        conflicts.push({
          conflictId: `CONF_VAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          conflictType: 'VALUE_CONFLICT',
          description: `Conflicting values detected for key '${key}' across ${items.length} knowledge objects`,
          targetIds: items.map((i) => i.knowledgeId),
          details: {
            groupKey: key,
            distinctValues: Array.from(distinctValues),
            itemCount: items.length
          },
          detectedAt: Date.now()
        });
      }

      if (valueTypes.size > 1) {
        conflicts.push({
          conflictId: `CONF_ATTR_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          conflictType: 'ATTRIBUTE_CONFLICT',
          description: `Conflicting attribute data types detected for key '${key}': ${Array.from(valueTypes).join(', ')}`,
          targetIds: items.map((i) => i.knowledgeId),
          details: {
            groupKey: key,
            valueTypes: Array.from(valueTypes)
          },
          detectedAt: Date.now()
        });
      }
    }

    return conflicts;
  }

  private detectCanonicalMappingConflicts(
    objects: readonly KnowledgeObject[],
    canonicalEntities: readonly CanonicalEntity[]
  ): IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];
    const entityToCanonicalMap = new Map<string, Set<string>>();

    for (const obj of objects) {
      const rawEntity = obj.entity;
      const canonical = this.aliasDictionary.getCanonicalName(rawEntity);
      if (!entityToCanonicalMap.has(rawEntity)) {
        entityToCanonicalMap.set(rawEntity, new Set());
      }
      entityToCanonicalMap.get(rawEntity)!.add(canonical);
    }

    for (const [rawEntity, mappedSet] of entityToCanonicalMap.entries()) {
      if (mappedSet.size > 1) {
        conflicts.push({
          conflictId: `CONF_CANON_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          conflictType: 'CANONICAL_MAPPING_CONFLICT',
          description: `Raw entity '${rawEntity}' maps to multiple canonical targets: ${Array.from(mappedSet).join(', ')}`,
          targetIds: [],
          details: {
            rawEntity,
            canonicalTargets: Array.from(mappedSet)
          },
          detectedAt: Date.now()
        });
      }
    }

    return conflicts;
  }

  private detectLowConfidenceConflicts(objects: readonly KnowledgeObject[]): IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];
    const lowConfidenceThreshold = 0.5;

    const lowConfidenceObjs = objects.filter((o) => o.confidence < lowConfidenceThreshold);
    if (lowConfidenceObjs.length >= 2) {
      conflicts.push({
        conflictId: `CONF_LOW_CONF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conflictType: 'LOW_CONFIDENCE_CONFLICT',
        description: `Multiple objects (${lowConfidenceObjs.length}) fall below confidence threshold ${lowConfidenceThreshold}`,
        targetIds: lowConfidenceObjs.map((o) => o.knowledgeId),
        details: {
          count: lowConfidenceObjs.length,
          objects: lowConfidenceObjs.map((o) => ({ knowledgeId: o.knowledgeId, confidence: o.confidence }))
        },
        detectedAt: Date.now()
      });
    }

    return conflicts;
  }

  private detectRelationshipConflicts(relationships: readonly KnowledgeRelationship[]): IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];
    const relGroup = new Map<string, KnowledgeRelationship[]>();

    for (const rel of relationships) {
      const pairKey = `${rel.sourceKnowledgeId}::${rel.targetKnowledgeId}`;
      if (!relGroup.has(pairKey)) {
        relGroup.set(pairKey, []);
      }
      relGroup.get(pairKey)!.push(rel);
    }

    for (const [pairKey, rels] of relGroup.entries()) {
      if (rels.length < 2) continue;
      const types = new Set(rels.map((r) => String(r.relationshipType)));
      if (types.size > 1) {
        conflicts.push({
          conflictId: `CONF_REL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          conflictType: 'RELATIONSHIP_CONFLICT',
          description: `Multiple contradictory relationship types between ${pairKey}: ${Array.from(types).join(', ')}`,
          targetIds: rels.map((r) => r.relationshipId),
          details: {
            pairKey,
            relationshipTypes: Array.from(types)
          },
          detectedAt: Date.now()
        });
      }
    }

    return conflicts;
  }

  private detectDuplicateEntityConflicts(canonicalEntities: readonly CanonicalEntity[]): IKnowledgeConflict[] {
    const conflicts: IKnowledgeConflict[] = [];
    const normKeyMap = new Map<string, CanonicalEntity[]>();

    for (const entity of canonicalEntities) {
      const norm = entity.normalizedKey;
      if (!normKeyMap.has(norm)) {
        normKeyMap.set(norm, []);
      }
      normKeyMap.get(norm)!.push(entity);
    }

    for (const [norm, entities] of normKeyMap.entries()) {
      if (entities.length > 1) {
        conflicts.push({
          conflictId: `CONF_DUP_ENT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          conflictType: 'DUPLICATE_ENTITY_CONFLICT',
          description: `Multiple canonical entities share the same normalizedKey '${norm}'`,
          targetIds: entities.map((e) => e.entityId),
          details: {
            normalizedKey: norm,
            entityIds: entities.map((e) => e.entityId),
            canonicalNames: entities.map((e) => e.canonicalName)
          },
          detectedAt: Date.now()
        });
      }
    }

    return conflicts;
  }
}
