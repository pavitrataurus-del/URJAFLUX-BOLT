import { IRecommendation, IConflictRecord, RecommendationStatus } from "../models/ReasoningModels";
import { RecommendationRepositoryFactory } from "../repository/RecommendationRepositoryFactory";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { ReasoningEventType, createReasoningEvent } from "../events/ReasoningEvents";

export class ConflictResolutionEngine {
  private static instance: ConflictResolutionEngine;
  private conflicts = new Map<string, IConflictRecord>();

  private constructor() {}

  public static getInstance(): ConflictResolutionEngine {
    if (!ConflictResolutionEngine.instance) {
      ConflictResolutionEngine.instance = new ConflictResolutionEngine();
    }
    return ConflictResolutionEngine.instance;
  }

  public detectConflicts(recommendations: IRecommendation[]): IConflictRecord[] {
    const detected: IConflictRecord[] = [];
    // Basic mock logic: if two recommendations affect the same object
    const affectedMap = new Map<string, IRecommendation[]>();
    
    for (const rec of recommendations) {
      for (const obj of rec.affectedObjects) {
        if (!affectedMap.has(obj)) {
          affectedMap.set(obj, []);
        }
        affectedMap.get(obj)!.push(rec);
      }
    }

    affectedMap.forEach((recs, objId) => {
      if (recs.length > 1) {
        const conflict: IConflictRecord = {
          id: `conflict_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
          recommendationIds: recs.map(r => r.id),
          description: `Conflict detected on object ${objId}`,
          resolved: false,
          timestamp: Date.now()
        };
        detected.push(conflict);
        this.conflicts.set(conflict.id, conflict);
        EventBus.getInstance().publish(createReasoningEvent(ReasoningEventType.CONFLICT_DETECTED, { conflictId: conflict.id }));
      }
    });

    return detected;
  }

  public async resolveConflict(conflictId: string, resolutionStrategy: string, winningRecId?: string): Promise<IConflictRecord | null> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return null;

    conflict.resolved = true;
    conflict.resolutionStrategy = resolutionStrategy;
    conflict.resolutionNotes = winningRecId ? `Resolved in favor of ${winningRecId}` : "Resolved by merging";

    const repo = RecommendationRepositoryFactory.getInstance().getRepository();
    
    if (winningRecId) {
      for (const id of conflict.recommendationIds) {
        if (id !== winningRecId) {
          const rec = await repo.getRecommendation(id);
          if (rec) {
            rec.status = RecommendationStatus.REJECTED;
            await repo.updateRecommendation(rec);
          }
        }
      }
    }

    return conflict;
  }
}
