import {
  IAstrologyOntologyEntity,
  IAstrologyRelationship,
  IAstrologyConflict,
  IAstrologyDuplicateMatch,
  IAstrologyEndUserEntity,
  IAstrologyQualityScoreBreakdown,
  AstrologyEntityType,
  KnowledgeStatus
} from './AstrologyKnowledgeTypes';

import {
  INITIAL_ASTROLOGY_ENTITIES,
  INITIAL_ASTROLOGY_RELATIONSHIPS
} from './AstrologyOntologyCatalog';

import { AstrologyConflictEngine } from './AstrologyConflictEngine';
import { AstrologyDuplicateEngine } from './AstrologyDuplicateEngine';
import { AstrologyQualityEngine } from './AstrologyQualityEngine';

export class AstrologyMasterKnowledgeRegistry {
  private static instance: AstrologyMasterKnowledgeRegistry;

  private entities: Map<string, IAstrologyOntologyEntity> = new Map();
  private relationships: Map<string, IAstrologyRelationship> = new Map();

  private conflictEngine: AstrologyConflictEngine;
  private duplicateEngine: AstrologyDuplicateEngine;
  private qualityEngine: AstrologyQualityEngine;

  private constructor() {
    INITIAL_ASTROLOGY_ENTITIES.forEach(e => this.entities.set(e.id, { ...e }));
    INITIAL_ASTROLOGY_RELATIONSHIPS.forEach(r => this.relationships.set(r.id, { ...r }));

    this.conflictEngine = new AstrologyConflictEngine();
    this.duplicateEngine = new AstrologyDuplicateEngine();
    this.qualityEngine = new AstrologyQualityEngine();
  }

  public static getInstance(): AstrologyMasterKnowledgeRegistry {
    if (!AstrologyMasterKnowledgeRegistry.instance) {
      AstrologyMasterKnowledgeRegistry.instance = new AstrologyMasterKnowledgeRegistry();
    }
    return AstrologyMasterKnowledgeRegistry.instance;
  }

  // ----------------------------------------------------
  // ADMIN ENTITY ACCESS (Full Data Visibility & Traceability)
  // ----------------------------------------------------
  public getAdminEntities(): IAstrologyOntologyEntity[] {
    return Array.from(this.entities.values());
  }

  public getAdminEntityById(id: string): IAstrologyOntologyEntity | undefined {
    return this.entities.get(id);
  }

  // ----------------------------------------------------
  // END USER ENTITY ACCESS (RBAC Restricted - Approved Canonical Only)
  // ----------------------------------------------------
  public getEndUserEntities(): IAstrologyEndUserEntity[] {
    return Array.from(this.entities.values())
      .filter(e => e.status === 'CANONICAL')
      .map(e => ({
        id: e.id,
        canonicalName: e.canonicalName,
        sanskritName: e.sanskritName,
        hindiName: e.hindiName,
        englishName: e.englishName,
        entityType: e.entityType,
        description: e.description,
        category: e.category,
        tags: e.tags,
        associatedRashi: e.associatedRashi,
        associatedBhava: e.associatedBhava,
        associatedNakshatra: e.associatedNakshatra,
        associatedPlanet: e.associatedPlanet,
        associatedElement: e.associatedElement,
        associatedColor: e.associatedColor,
        associatedGemstone: e.associatedGemstone,
        associatedDirection: e.associatedDirection,
        confidenceScore: e.truthEngineMetrics.confidenceScore,
        confidenceGrade: e.truthEngineMetrics.confidenceGrade,
        isCanonical: e.truthEngineMetrics.isCanonical
      }));
  }

  public getEndUserEntityById(id: string): IAstrologyEndUserEntity | undefined {
    const entity = this.entities.get(id);
    if (!entity || entity.status !== 'CANONICAL') return undefined;

    return {
      id: entity.id,
      canonicalName: entity.canonicalName,
      sanskritName: entity.sanskritName,
      hindiName: entity.hindiName,
      englishName: entity.englishName,
      entityType: entity.entityType,
      description: entity.description,
      category: entity.category,
      tags: entity.tags,
      associatedRashi: entity.associatedRashi,
      associatedBhava: entity.associatedBhava,
      associatedNakshatra: entity.associatedNakshatra,
      associatedPlanet: entity.associatedPlanet,
      associatedElement: entity.associatedElement,
      associatedColor: entity.associatedColor,
      associatedGemstone: entity.associatedGemstone,
      associatedDirection: entity.associatedDirection,
      confidenceScore: entity.truthEngineMetrics.confidenceScore,
      confidenceGrade: entity.truthEngineMetrics.confidenceGrade,
      isCanonical: entity.truthEngineMetrics.isCanonical
    };
  }

  // ----------------------------------------------------
  // ENTERPRISE SEARCH & MULTI-FACETED RETRIEVAL ENGINE
  // ----------------------------------------------------
  public searchEntities(options: {
    query?: string;
    entityType?: AstrologyEntityType | 'All';
    planet?: string;
    rashi?: string;
    nakshatra?: string;
    bhava?: number;
    bookTitle?: string;
    status?: KnowledgeStatus | 'All';
    minConfidence?: number;
  }): IAstrologyOntologyEntity[] {
    let result = Array.from(this.entities.values());

    if (options.entityType && options.entityType !== 'All') {
      result = result.filter(e => e.entityType === options.entityType);
    }

    if (options.planet && options.planet !== 'All') {
      result = result.filter(e =>
        e.associatedPlanet?.toLowerCase().includes(options.planet!.toLowerCase()) ||
        e.canonicalName.toLowerCase().includes(options.planet!.toLowerCase())
      );
    }

    if (options.rashi && options.rashi !== 'All') {
      result = result.filter(e =>
        e.associatedRashi?.toLowerCase().includes(options.rashi!.toLowerCase()) ||
        e.canonicalName.toLowerCase().includes(options.rashi!.toLowerCase())
      );
    }

    if (options.nakshatra && options.nakshatra !== 'All') {
      result = result.filter(e =>
        e.associatedNakshatra?.toLowerCase().includes(options.nakshatra!.toLowerCase()) ||
        e.canonicalName.toLowerCase().includes(options.nakshatra!.toLowerCase())
      );
    }

    if (options.bhava !== undefined && options.bhava !== 0) {
      result = result.filter(e => e.associatedBhava === options.bhava);
    }

    if (options.bookTitle) {
      result = result.filter(e => e.sourceTraceability?.sourceBook.toLowerCase().includes(options.bookTitle!.toLowerCase()));
    }

    if (options.status && options.status !== 'All') {
      result = result.filter(e => e.status === options.status);
    }

    if (options.minConfidence !== undefined) {
      result = result.filter(e => e.truthEngineMetrics.confidenceScore >= options.minConfidence!);
    }

    if (options.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase().trim();
      result = result.filter(e =>
        e.canonicalName.toLowerCase().includes(q) ||
        (e.sanskritName && e.sanskritName.toLowerCase().includes(q)) ||
        (e.alternateNames && e.alternateNames.some(a => a.toLowerCase().includes(q))) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // ----------------------------------------------------
  // RELATIONSHIPS ENGINE
  // ----------------------------------------------------
  public getAllRelationships(): IAstrologyRelationship[] {
    return Array.from(this.relationships.values());
  }

  public getRelationshipsForEntity(entityId: string): IAstrologyRelationship[] {
    return this.getAllRelationships().filter(
      r => r.sourceEntityId === entityId || r.targetEntityId === entityId
    );
  }

  public addRelationship(rel: IAstrologyRelationship): void {
    this.relationships.set(rel.id, rel);
  }

  // ----------------------------------------------------
  // CONFLICT & DUPLICATE ENGINES
  // ----------------------------------------------------
  public getAllConflicts(): IAstrologyConflict[] {
    return this.conflictEngine.getAllConflicts();
  }

  public resolveConflict(
    conflictId: string,
    status: 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT',
    resolutionNotes: string,
    resolvedBy: string
  ): boolean {
    return this.conflictEngine.resolveConflict(conflictId, status, resolutionNotes, resolvedBy);
  }

  public getDuplicateMatches(): IAstrologyDuplicateMatch[] {
    return this.duplicateEngine.getAllDuplicates();
  }

  public updateDuplicateStatus(matchId: string, status: 'MERGED' | 'DISMISSED'): boolean {
    return this.duplicateEngine.updateDuplicateStatus(matchId, status);
  }

  // ----------------------------------------------------
  // QUALITY DASHBOARD METRICS
  // ----------------------------------------------------
  public getAdminQualityScore(entityId: string): IAstrologyQualityScoreBreakdown {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        ocrAccuracy: 0,
        sourceAuthority: 0,
        evidenceStrength: 0,
        smeConsensus: 0,
        ontologicalCompleteness: 0,
        overallScore: 0,
        grade: 'F'
      };
    }
    return this.qualityEngine.computeQualityScore(entity);
  }

  // ----------------------------------------------------
  // ENTITY CRUD & STATE MANAGEMENT
  // ----------------------------------------------------
  public upsertEntity(entity: IAstrologyOntologyEntity): void {
    entity.lastUpdatedTimestamp = new Date().toISOString();
    this.entities.set(entity.id, entity);
  }

  public updateStatus(entityId: string, status: KnowledgeStatus, reviewer: string, note: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    entity.status = status;
    entity.truthEngineMetrics.isCanonical = status === 'CANONICAL';
    entity.lastUpdatedBy = reviewer;
    entity.lastUpdatedTimestamp = new Date().toISOString();
    entity.revisionNotes.push(`[${new Date().toISOString()}] Status updated to ${status} by ${reviewer}: ${note}`);
    return true;
  }
}
