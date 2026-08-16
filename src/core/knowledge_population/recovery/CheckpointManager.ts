import { ImportCheckpoint } from './ImportCheckpoint';
import { ImportStage } from '../orchestrator/ImportPipeline';
import { eventLogger } from '../monitoring/ImportEventLogger';

export class CheckpointManager {
  private static instance: CheckpointManager | null = null;
  private readonly storage = new Map<string, ImportCheckpoint[]>();

  private constructor() {}

  public static getInstance(): CheckpointManager {
    if (!CheckpointManager.instance) {
      CheckpointManager.instance = new CheckpointManager();
    }
    return CheckpointManager.instance;
  }

  public saveCheckpoint(checkpoint: ImportCheckpoint): void {
    const existing = this.storage.get(checkpoint.importId) || [];
    const updated = [...existing, checkpoint];
    this.storage.set(checkpoint.importId, updated);

    eventLogger.logEvent(
      'CHECKPOINT_CREATED',
      checkpoint.importId,
      checkpoint.bookId,
      `Checkpoint saved at stage ${checkpoint.currentStage} (Page ${checkpoint.currentPage})`,
      checkpoint.currentStage,
      { checkpointId: checkpoint.checkpointId }
    );
  }

  public getLatestCheckpoint(importId: string): ImportCheckpoint | null {
    const list = this.storage.get(importId);
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  }

  public getCheckpointByStage(
    importId: string,
    stage: ImportStage
  ): ImportCheckpoint | null {
    const list = this.storage.get(importId);
    if (!list) return null;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].currentStage === stage) {
        return list[i];
      }
    }
    return null;
  }

  public getAllCheckpoints(importId: string): readonly ImportCheckpoint[] {
    const list = this.storage.get(importId) || [];
    return Object.freeze([...list]);
  }

  public clearCheckpoints(importId: string): void {
    this.storage.delete(importId);
  }

  public clearAll(): void {
    this.storage.clear();
  }
}

export const checkpointManager = CheckpointManager.getInstance();
