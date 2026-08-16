import { ILalKitabConflict } from './LalKitabKnowledgeTypes';
import { INITIAL_LALKITAB_CONFLICTS } from './LalKitabOntologyCatalog';

export class LalKitabConflictEngine {
  private conflicts: Map<string, ILalKitabConflict> = new Map();

  constructor() {
    INITIAL_LALKITAB_CONFLICTS.forEach(c => this.conflicts.set(c.conflictId, c));
  }

  public getAllConflicts(): ILalKitabConflict[] {
    return Array.from(this.conflicts.values());
  }

  public getConflictsByEntityId(entityId: string): ILalKitabConflict[] {
    return this.getAllConflicts().filter(c => c.entityId === entityId);
  }

  public addConflict(conflict: ILalKitabConflict): void {
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
