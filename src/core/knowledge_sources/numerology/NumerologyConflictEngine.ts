import { INumerologyConflict } from './NumerologyKnowledgeTypes';
import { INITIAL_NUMEROLOGY_CONFLICTS } from './NumerologyOntologyCatalog';

export class NumerologyConflictEngine {
  private conflicts: Map<string, INumerologyConflict> = new Map();

  constructor() {
    INITIAL_NUMEROLOGY_CONFLICTS.forEach(c => this.conflicts.set(c.conflictId, c));
  }

  public getAllConflicts(): INumerologyConflict[] {
    return Array.from(this.conflicts.values());
  }

  public getConflictsByEntityId(entityId: string): INumerologyConflict[] {
    return this.getAllConflicts().filter(c => c.entityId === entityId);
  }

  public addConflict(conflict: INumerologyConflict): void {
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
