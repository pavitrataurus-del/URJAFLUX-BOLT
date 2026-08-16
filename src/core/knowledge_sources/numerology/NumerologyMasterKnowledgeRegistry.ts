import {
  INumerologyOntologyEntity,
  INumerologyRelationship,
  INumerologyConflict,
  INumerologyDuplicateMatch,
  INumerologyEndUserEntity,
  INumerologyQualityScoreBreakdown,
  NumerologyEntityType,
  KnowledgeStatus
} from './NumerologyKnowledgeTypes';

import {
  INITIAL_NUMEROLOGY_ENTITIES,
  INITIAL_NUMEROLOGY_RELATIONSHIPS
} from './NumerologyOntologyCatalog';

import { NumerologyConflictEngine } from './NumerologyConflictEngine';
import { NumerologyDuplicateEngine } from './NumerologyDuplicateEngine';
import { NumerologyQualityEngine } from './NumerologyQualityEngine';

export class NumerologyMasterKnowledgeRegistry {
  private static instance: NumerologyMasterKnowledgeRegistry;

  private entities: Map<string, INumerologyOntologyEntity> = new Map();
  private relationships: Map<string, INumerologyRelationship> = new Map();

  private conflictEngine: NumerologyConflictEngine;
  private duplicateEngine: NumerologyDuplicateEngine;
  private qualityEngine: NumerologyQualityEngine;

  private constructor() {
    INITIAL_NUMEROLOGY_ENTITIES.forEach(e => this.entities.set(e.id, { ...e }));
    INITIAL_NUMEROLOGY_RELATIONSHIPS.forEach(r => this.relationships.set(r.id, { ...r }));

    this.conflictEngine = new NumerologyConflictEngine();
    this.duplicateEngine = new NumerologyDuplicateEngine();
    this.qualityEngine = new NumerologyQualityEngine();
  }

  public static getInstance(): NumerologyMasterKnowledgeRegistry {
    if (!NumerologyMasterKnowledgeRegistry.instance) {
      NumerologyMasterKnowledgeRegistry.instance = new NumerologyMasterKnowledgeRegistry();
    }
    return NumerologyMasterKnowledgeRegistry.instance;
  }

  // ----------------------------------------------------
  // ADMIN ENTITY ACCESS (Full Data Visibility)
  // ----------------------------------------------------
  public getAdminEntities(): INumerologyOntologyEntity[] {
    return Array.from(this.entities.values());
  }

  public getAdminEntityById(id: string): INumerologyOntologyEntity | undefined {
    return this.entities.get(id);
  }

  // ----------------------------------------------------
  // END USER ENTITY ACCESS (RBAC Restricted - Canonical Only)
  // ----------------------------------------------------
  public getEndUserEntities(): INumerologyEndUserEntity[] {
    return Array.from(this.entities.values())
      .filter(e => e.status === 'CANONICAL')
      .map(e => ({
        id: e.id,
        canonicalName: e.canonicalName,
        numberValue: e.numberValue,
        system: e.system,
        entityType: e.entityType,
        description: e.description,
        category: e.category,
        tags: e.tags,
        associatedPlanet: e.associatedPlanet,
        associatedElement: e.associatedElement,
        associatedColor: e.associatedColor,
        associatedDirection: e.associatedDirection,
        associatedDay: e.associatedDay,
        confidenceScore: e.truthEngineMetrics.confidenceScore,
        confidenceGrade: e.truthEngineMetrics.confidenceGrade,
        isCanonical: e.truthEngineMetrics.isCanonical
      }));
  }

  public getEndUserEntityById(id: string): INumerologyEndUserEntity | undefined {
    const entity = this.entities.get(id);
    if (!entity || entity.status !== 'CANONICAL') return undefined;

    return {
      id: entity.id,
      canonicalName: entity.canonicalName,
      numberValue: entity.numberValue,
      system: entity.system,
      entityType: entity.entityType,
      description: entity.description,
      category: entity.category,
      tags: entity.tags,
      associatedPlanet: entity.associatedPlanet,
      associatedElement: entity.associatedElement,
      associatedColor: entity.associatedColor,
      associatedDirection: entity.associatedDirection,
      associatedDay: entity.associatedDay,
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
    entityType?: NumerologyEntityType | 'All';
    system?: 'Pythagorean' | 'Chaldean' | 'Vedic' | 'Kabbalah' | 'All';
    numberValue?: number;
    bookTitle?: string;
    status?: KnowledgeStatus | 'All';
    minConfidence?: number;
  }): INumerologyOntologyEntity[] {
    let result = Array.from(this.entities.values());

    if (options.entityType && options.entityType !== 'All') {
      result = result.filter(e => e.entityType === options.entityType);
    }

    if (options.system && options.system !== 'All') {
      result = result.filter(e => e.system === options.system);
    }

    if (options.numberValue !== undefined && options.numberValue !== 0) {
      result = result.filter(e => e.numberValue === options.numberValue);
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
  public getAllRelationships(): INumerologyRelationship[] {
    return Array.from(this.relationships.values());
  }

  public getRelationshipsForEntity(entityId: string): INumerologyRelationship[] {
    return this.getAllRelationships().filter(
      r => r.sourceEntityId === entityId || r.targetEntityId === entityId
    );
  }

  public addRelationship(rel: INumerologyRelationship): void {
    this.relationships.set(rel.id, rel);
  }

  // ----------------------------------------------------
  // CONFLICT & DUPLICATE ENGINES
  // ----------------------------------------------------
  public getAllConflicts(): INumerologyConflict[] {
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

  public getDuplicateMatches(): INumerologyDuplicateMatch[] {
    return this.duplicateEngine.getAllDuplicates();
  }

  public updateDuplicateStatus(matchId: string, status: 'MERGED' | 'DISMISSED'): boolean {
    return this.duplicateEngine.updateDuplicateStatus(matchId, status);
  }

  // ----------------------------------------------------
  // QUALITY DASHBOARD METRICS
  // ----------------------------------------------------
  public getAdminQualityScore(entityId: string): INumerologyQualityScoreBreakdown {
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
  public upsertEntity(entity: INumerologyOntologyEntity): void {
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
