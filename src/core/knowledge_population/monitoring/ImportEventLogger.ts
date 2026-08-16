import { ImportStage } from '../orchestrator/ImportPipeline';

export type ImportEventType =
  | 'IMPORT_STARTED'
  | 'STAGE_CHANGED'
  | 'CHECKPOINT_CREATED'
  | 'RETRY_STARTED'
  | 'RETRY_COMPLETED'
  | 'RECOVERY_STARTED'
  | 'RECOVERY_COMPLETED'
  | 'IMPORT_COMPLETED'
  | 'IMPORT_FAILED';

export interface IImportEventData {
  readonly eventId: string;
  readonly eventType: ImportEventType;
  readonly importId: string;
  readonly bookId: string;
  readonly stage?: ImportStage;
  readonly timestamp: number;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}

export type ImportEventListener = (event: IImportEventData) => void;

export class ImportEventLogger {
  private static instance: ImportEventLogger | null = null;
  private readonly events: IImportEventData[] = [];
  private readonly listeners: ImportEventListener[] = [];
  private readonly maxEventHistory = 1000;

  private constructor() {}

  public static getInstance(): ImportEventLogger {
    if (!ImportEventLogger.instance) {
      ImportEventLogger.instance = new ImportEventLogger();
    }
    return ImportEventLogger.instance;
  }

  public subscribe(listener: ImportEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  public logEvent(
    eventType: ImportEventType,
    importId: string,
    bookId: string,
    message: string,
    stage?: ImportStage,
    metadata?: Record<string, unknown>
  ): IImportEventData {
    const event: IImportEventData = Object.freeze({
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      importId,
      bookId,
      stage,
      timestamp: Date.now(),
      message,
      metadata: metadata ? Object.freeze({ ...metadata }) : undefined
    });

    this.events.push(event);
    if (this.events.length > this.maxEventHistory) {
      this.events.shift();
    }

    this.notifyListeners(event);
    return event;
  }

  private notifyListeners(event: IImportEventData): void {
    for (const fn of this.listeners) {
      try {
        fn(event);
      } catch {
        // Safe dispatch guard
      }
    }
  }

  public getEventsForImport(importId: string): readonly IImportEventData[] {
    return Object.freeze(this.events.filter((e) => e.importId === importId));
  }

  public getRecentEvents(limit = 100): readonly IImportEventData[] {
    return Object.freeze(this.events.slice(-limit));
  }

  public getEventsByType(type: ImportEventType): readonly IImportEventData[] {
    return Object.freeze(this.events.filter((e) => e.eventType === type));
  }

  public clear(): void {
    this.events.length = 0;
  }
}

export const eventLogger = ImportEventLogger.getInstance();
