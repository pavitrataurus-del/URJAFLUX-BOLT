import { IAstrologyConflict } from './AstrologyKnowledgeTypes';
import { INITIAL_ASTROLOGY_CONFLICTS } from './AstrologyOntologyCatalog';

export class AstrologyConflictEngine {
  private conflicts: Map<string, IAstrologyConflict> = new Map();

  constructor() {
    INITIAL_ASTROLOGY_CONFLICTS.forEach(c => this.conflicts.set(c.conflictId, c));
  }

  public getAllConflicts(): IAstrologyConflict[] {
    return Array.from(this.conflicts.values());
  }

  public getConflictsByEntityId(entityId: string): IAstrologyConflict[] {
    return this.getAllConflicts().filter(c => c.entityId === entityId);
  }

  public addConflict(conflict: IAstrologyConflict): void {
    this.conflicts.set(conflict.conflictId, conflict);
  }

  public resolveConflict(
    conflictId: string,
    status: 'RESOLVED_CANONICAL' | 'CONTEXTUAL_SPLIT',
    resolutionNotes: string,
    resolvedBy: string
  ): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;

    conflict.status = status;
    conflict.resolutionNotes = resolutionNotes;
    conflict.resolvedBy = resolvedBy;
    conflict.resolvedTimestamp = new Date().toISOString();
    return true;
  }
}
