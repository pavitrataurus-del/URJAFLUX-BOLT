import {
  IReasoningSession,
  IReasoningInput,
  IRecommendation,
  IReasoningConflict,
  KnowledgeDomain
} from './ReasoningTypes';

import { CrossDomainReasoningEngine } from './CrossDomainReasoningEngine';
import { ConflictResolver } from './ConflictResolver';

export class UnifiedReasoningRegistry {
  private static instance: UnifiedReasoningRegistry;
  private sessions: Map<string, IReasoningSession> = new Map();
  private engine: CrossDomainReasoningEngine;
  private conflictResolver: ConflictResolver;

  private constructor() {
    this.engine = CrossDomainReasoningEngine.getInstance();
    this.conflictResolver = ConflictResolver.getInstance();
    this.seedSampleSession();
  }

  public static getInstance(): UnifiedReasoningRegistry {
    if (!UnifiedReasoningRegistry.instance) {
      UnifiedReasoningRegistry.instance = new UnifiedReasoningRegistry();
    }
    return UnifiedReasoningRegistry.instance;
  }

  private seedSampleSession(): void {
    const defaultInput: IReasoningInput = {
      propertyType: 'Residential',
      roomOrZone: 'Northeast (Eeshan)',
      cardinalDirection: 'Northeast',
      primaryElement: 'Jala (Water)',
      associatedPlanet: 'Guru (Jupiter)',
      chakraZone: 'Ajna',
      numerologyPathNumber: 3,
      numerologyNameNumber: 3,
      lalKitabHousePlacement: 1,
      astrologyRashiSign: 'Meena (Pisces)',
      problemStatement: 'Spatial alignment and elemental balance for executive master study and puja area.'
    };

    const session = this.engine.executeReasoning(
      defaultInput,
      'Executive Villa: Northeast Water/Jupiter Alignment'
    );
    this.sessions.set(session.sessionId, session);
  }

  public createSession(input: IReasoningInput, title?: string): IReasoningSession {
    const session = this.engine.executeReasoning(input, title);
    this.sessions.set(session.sessionId, session);
    return session;
  }

  public getSession(sessionId: string): IReasoningSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(): IReasoningSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public overrideRecommendationStatus(
    sessionId: string,
    recommendationId: string,
    newStatus: 'APPROVED' | 'DRAFT' | 'REJECTED_BY_ADMIN' | 'OVERRIDDEN'
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const rec = session.recommendations.find(r => r.id === recommendationId);
    if (rec) {
      rec.status = newStatus;
      session.auditLog.push(
        `[${new Date().toISOString()}] Admin updated recommendation status for "${rec.title}" to ${newStatus}.`
      );
      return true;
    }
    return false;
  }

  public overrideConflictResolution(
    conflictId: string,
    winningDomain: KnowledgeDomain,
    resolutionStrategy: string,
    notes: string,
    adminUser: string
  ): IReasoningConflict {
    return this.conflictResolver.overrideConflict(
      conflictId,
      winningDomain,
      resolutionStrategy,
      notes,
      adminUser
    );
  }
}
