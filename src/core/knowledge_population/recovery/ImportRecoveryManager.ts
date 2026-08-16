import { checkpointManager, CheckpointManager } from './CheckpointManager';
import { retryManager, RetryManager } from './RetryManager';
import { ImportCheckpoint } from './ImportCheckpoint';
import { eventLogger } from '../monitoring/ImportEventLogger';

export interface IRecoveryResultData {
  readonly importId: string;
  readonly bookId: string;
  readonly recoveredFromCheckpoint: boolean;
  readonly checkpoint?: ImportCheckpoint;
  readonly recoveredStage?: string;
  readonly message: string;
  readonly timestamp: number;
}

export class ImportRecoveryManager {
  private static instance: ImportRecoveryManager | null = null;
  private readonly checkpointMgr: CheckpointManager;
  private readonly retryMgr: RetryManager;

  private constructor() {
    this.checkpointMgr = checkpointManager;
    this.retryMgr = retryManager;
  }

  public static getInstance(): ImportRecoveryManager {
    if (!ImportRecoveryManager.instance) {
      ImportRecoveryManager.instance = new ImportRecoveryManager();
    }
    return ImportRecoveryManager.instance;
  }

  public hasRecoverableCheckpoint(importId: string): boolean {
    const latest = this.checkpointMgr.getLatestCheckpoint(importId);
    return latest !== null && latest.currentStage !== 'COMPLETED' && latest.currentStage !== 'FAILED';
  }

  public async recoverImport(importId: string): Promise<IRecoveryResultData> {
    const checkpoint = this.checkpointMgr.getLatestCheckpoint(importId);

    if (!checkpoint) {
      return Object.freeze({
        importId,
        bookId: 'UNKNOWN',
        recoveredFromCheckpoint: false,
        message: `No checkpoint found for import ${importId}. Direct restart required.`,
        timestamp: Date.now()
      });
    }

    eventLogger.logEvent(
      'RECOVERY_STARTED',
      importId,
      checkpoint.bookId,
      `Attempting automatic recovery from stage ${checkpoint.currentStage} (Checkpoint ID: ${checkpoint.checkpointId})`,
      checkpoint.currentStage,
      { checkpointId: checkpoint.checkpointId }
    );

    // Verify recovery viability
    const canRetry = this.retryMgr.shouldRetry(importId);

    if (!canRetry) {
      const failMsg = `Automatic recovery max retry attempts exhausted for import ${importId}.`;
      eventLogger.logEvent(
        'RECOVERY_COMPLETED',
        importId,
        checkpoint.bookId,
        failMsg,
        checkpoint.currentStage,
        { success: false }
      );

      return Object.freeze({
        importId,
        bookId: checkpoint.bookId,
        recoveredFromCheckpoint: false,
        checkpoint,
        recoveredStage: checkpoint.currentStage,
        message: failMsg,
        timestamp: Date.now()
      });
    }

    // Perform recovery state snapshot
    eventLogger.logEvent(
      'RECOVERY_COMPLETED',
      importId,
      checkpoint.bookId,
      `Successfully recovered state at stage ${checkpoint.currentStage} (Page ${checkpoint.currentPage})`,
      checkpoint.currentStage,
      { success: true }
    );

    return Object.freeze({
      importId,
      bookId: checkpoint.bookId,
      recoveredFromCheckpoint: true,
      checkpoint,
      recoveredStage: checkpoint.currentStage,
      message: `Successfully recovered import state at stage ${checkpoint.currentStage}`,
      timestamp: Date.now()
    });
  }
}

export const recoveryManager = ImportRecoveryManager.getInstance();
