import { structuredLogger } from '../telemetry/StructuredLogger';

export interface QueuedOfflineAction {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
  retryCount: number;
}

export class OfflineRecoveryService {
  private static instance: OfflineRecoveryService;
  private isOnlineState: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private queuedActions: QueuedOfflineAction[] = [];
  private subscribers: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.initEventListeners();
  }

  public static getInstance(): OfflineRecoveryService {
    if (!OfflineRecoveryService.instance) {
      OfflineRecoveryService.instance = new OfflineRecoveryService();
    }
    return OfflineRecoveryService.instance;
  }

  public isOnline(): boolean {
    return this.isOnlineState;
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  public queueAction(type: string, payload: any) {
    const action: QueuedOfflineAction = {
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.queuedActions.push(action);
    structuredLogger.warn('OfflineRecoveryService', `Network offline. Queued action '${type}' for sync upon reconnection.`, { queueLength: this.queuedActions.length });
  }

  public getQueuedActionsCount(): number {
    return this.queuedActions.length;
  }

  private initEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnlineState = true;
      structuredLogger.info('OfflineRecoveryService', 'Network connection restored. Processing queued offline actions...');
      this.notifySubscribers();
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnlineState = false;
      structuredLogger.warn('OfflineRecoveryService', 'Network connection lost. Switched to offline recovery mode.');
      this.notifySubscribers();
    });
  }

  private async flushQueue() {
    if (this.queuedActions.length === 0) return;

    const actionsToSync = [...this.queuedActions];
    this.queuedActions = [];

    for (const action of actionsToSync) {
      try {
        structuredLogger.info('OfflineRecoveryService', `Syncing offline action: ${action.type}`, { actionId: action.id });
        // Simulating sync processing logic
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err: any) {
        structuredLogger.error('OfflineRecoveryService', `Failed to sync action ${action.type}. Re-queueing.`, { error: err.message });
        action.retryCount++;
        if (action.retryCount < 5) {
          this.queuedActions.push(action);
        }
      }
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((sub) => sub(this.isOnlineState));
  }
}

export const offlineRecoveryService = OfflineRecoveryService.getInstance();
