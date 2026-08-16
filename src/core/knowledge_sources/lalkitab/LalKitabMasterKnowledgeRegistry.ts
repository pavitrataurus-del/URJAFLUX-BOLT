import {
  ILalKitabOntologyEntity,
  ILalKitabRelationship,
  ILalKitabConflict,
  ILalKitabDuplicateMatch,
  ILalKitabEndUserEntity,
  ILalKitabQualityScoreBreakdown,
  LalKitabEntityType,
  KnowledgeStatus
} from './LalKitabKnowledgeTypes';

import {
  INITIAL_LALKITAB_ENTITIES,
  INITIAL_LALKITAB_RELATIONSHIPS
} from './LalKitabOntologyCatalog';

import { LalKitabConflictEngine } from './LalKitabConflictEngine';
import { LalKitabDuplicateEngine } from './LalKitabDuplicateEngine';
import { LalKitabQualityEngine } from './LalKitabQualityEngine';

export class LalKitabMasterKnowledgeRegistry {
  private static instance: LalKitabMasterKnowledgeRegistry;

  private entities: Map<string, ILalKitabOntologyEntity> = new Map();
  private relationships: Map<string, ILalKitabRelationship> = new Map();

  private conflictEngine: LalKitabConflictEngine;
  private duplicateEngine: LalKitabDuplicateEngine;
  private qualityEngine: LalKitabQualityEngine;

  private constructor() {
    INITIAL_LALKITAB_ENTITIES.forEach(e => this.entities.set(e.id, { ...e }));
    INITIAL_LALKITAB_RELATIONSHIPS.forEach(r => this.relationships.set(r.id, { ...r }));

    this.conflictEngine = new LalKitabConflictEngine();
    this.duplicateEngine = new LalKitabDuplicateEngine();
    this.qualityEngine = new LalKitabQualityEngine();
  }

  public static getInstance(): LalKitabMasterKnowledgeRegistry {
    if (!LalKitabMasterKnowledgeRegistry.instance) {
      LalKitabMasterKnowledgeRegistry.instance = new LalKitabMasterKnowledgeRegistry();
    }
    return LalKitabMasterKnowledgeRegistry.instance;
  }

  // ----------------------------------------------------
  // ADMIN ENTITY ACCESS (Full Data Visibility)
  // ----------------------------------------------------
  public getAdminEntities(): ILalKitabOntologyEntity[] {
    return Array.from(this.entities.values());
  }

  public getAdminEntityById(id: string): ILalKitabOntologyEntity | undefined {
    return this.entities.get(id);
  }

  // ----------------------------------------------------
  // END USER ENTITY ACCESS (RBAC Restricted - Canonical Only)
  // ----------------------------------------------------
  public getEndUserEntities(): ILalKitabEndUserEntity[] {
    return Array.from(this.entities.values())
      .filter(e => e.status === 'CANONICAL')
      .map(e => ({
        id: e.id,
        canonicalName: e.canonicalName,
        hindiName: e.hindiName,
        englishName: e.englishName,
        entityType: e.entityType,
        description: e.description,
        category: e.category,
        tags: e.tags,
        planetName: e.planetId ? this.entities.get(e.planetId)?.canonicalName : undefined,
        houseNumber: e.houseNumber,
        remedySummary: e.entityType === 'Remedy' ? e.description : undefined,
        confidenceScore: e.truthEngineMetrics.confidenceScore,
        confidenceGrade: e.truthEngineMetrics.confidenceGrade,
        isCanonical: e.truthEngineMetrics.isCanonical
      }));
  }

  public getEndUserEntityById(id: string): ILalKitabEndUserEntity | undefined {
    const entity = this.entities.get(id);
    if (!entity || entity.status !== 'CANONICAL') return undefined;

    return {
      id: entity.id,
      canonicalName: entity.canonicalName,
      hindiName: entity.hindiName,
      englishName: entity.englishName,
      entityType: entity.entityType,
      description: entity.description,
      category: entity.category,
      tags: entity.tags,
      planetName: entity.planetId ? this.entities.get(entity.planetId)?.canonicalName : undefined,
      houseNumber: entity.houseNumber,
      remedySummary: entity.entityType === 'Remedy' ? entity.description : undefined,
      confidenceScore: entity.truthEngineMetrics.confidenceScore,
      confidenceGrade: entity.truthEngineMetrics.confidenceGrade,
      isCanonical: entity.truthEngineMetrics.isCanonical
    };
  }

  // ----------------------------------------------------
  // ADVANCED ENTERPRISE SEARCH & RETRIEVAL ENGINE
  // ----------------------------------------------------
  public searchEntities(options: {
    query?: string;
    entityType?: LalKitabEntityType | 'All';
    planetId?: string;
    houseNumber?: number;
    bookTitle?: string;
    status?: KnowledgeStatus | 'All';
    minConfidence?: number;
  }): ILalKitabOntologyEntity[] {
    let result = Array.from(this.entities.values());

    if (options.entityType && options.entityType !== 'All') {
      result = result.filter(e => e.entityType === options.entityType);
    }

    if (options.planetId) {
      result = result.filter(e => e.planetId === options.planetId || e.id === options.planetId);
    }

    if (options.houseNumber) {
      result = result.filter(e => e.houseNumber === options.houseNumber);
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
        e.hindiName.toLowerCase().includes(q) ||
        e.englishName.toLowerCase().includes(q) ||
        (e.urduName && e.urduName.toLowerCase().includes(q)) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // ----------------------------------------------------
  // RELATIONSHIPS ENGINE
  // ----------------------------------------------------
  public getAllRelationships(): ILalKitabRelationship[] {
    return Array.from(this.relationships.values());
  }

  public getRelationshipsForEntity(entityId: string): ILalKitabRelationship[] {
    return this.getAllRelationships().filter(
      r => r.sourceEntityId === entityId || r.targetEntityId === entityId
    );
  }

  public addRelationship(rel: ILalKitabRelationship): void {
    this.relationships.set(rel.id, rel);
  }

  // ----------------------------------------------------
  // CONFLICT & DUPLICATE ENGINES
  // ----------------------------------------------------
  public getAllConflicts(): ILalKitabConflict[] {
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

  public getDuplicateMatches(): ILalKitabDuplicateMatch[] {
    return this.duplicateEngine.getAllDuplicates();
  }

  public updateDuplicateStatus(matchId: string, status: 'MERGED' | 'DISMISSED'): boolean {
    return this.duplicateEngine.updateDuplicateStatus(matchId, status);
  }

  // ----------------------------------------------------
  // QUALITY DASHBOARD METRICS
  // ----------------------------------------------------
  public getAdminQualityScore(entityId: string): ILalKitabQualityScoreBreakdown {
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
  public upsertEntity(entity: ILalKitabOntologyEntity): void {
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
