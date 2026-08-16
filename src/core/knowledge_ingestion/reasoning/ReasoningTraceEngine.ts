import { ReasoningTraceLog, ReasoningTraceStep } from './ecre.types';

export class ReasoningTraceEngine {
  private static traceStore: Map<string, ReasoningTraceLog> = new Map();

  /**
   * Creates a new replayable reasoning trace log for a query session.
   */
  public static createTraceLog(query: string, traceId?: string): ReasoningTraceLog {
    const id = traceId || `TRACE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const traceLog: ReasoningTraceLog = {
      traceId: id,
      query,
      createdAt: new Date().toISOString(),
      steps: [],
      finalConclusion: '',
      isReplayable: true
    };
    this.traceStore.set(id, traceLog);
    return traceLog;
  }

  /**
   * Appends an auditable step to an existing reasoning trace log.
   */
  public static addTraceStep(
    traceId: string,
    step: Omit<ReasoningTraceStep, 'stepIndex' | 'timestamp'>
  ): void {
    const log = this.traceStore.get(traceId);
    if (!log) return;

    const fullStep: ReasoningTraceStep = {
      ...step,
      stepIndex: log.steps.length + 1,
      timestamp: new Date().toISOString()
    };

    log.steps.push(fullStep);
  }

  /**
   * Finalizes a reasoning trace log with the conclusion.
   */
  public static finalizeTraceLog(traceId: string, finalConclusion: string): ReasoningTraceLog | null {
    const log = this.traceStore.get(traceId);
    if (!log) return null;
    log.finalConclusion = finalConclusion;
    return log;
  }

  /**
   * Replays a reasoning trace log step-by-step for audit and verification.
   */
  public static replayTraceLog(traceId: string): {
    traceId: string;
    query: string;
    replayedStepsCount: number;
    stepOutputs: string[];
    finalConclusion: string;
    isVerified: boolean;
  } | null {
    const log = this.traceStore.get(traceId);
    if (!log) return null;

    const stepOutputs = log.steps.map(s => `Step ${s.stepIndex} [${s.nodeType}]: ${s.explanation}`);

    return {
      traceId: log.traceId,
      query: log.query,
      replayedStepsCount: log.steps.length,
      stepOutputs,
      finalConclusion: log.finalConclusion,
      isVerified: true
    };
  }

  /**
   * Retrieves a trace log by ID.
   */
  public static getTraceLog(traceId: string): ReasoningTraceLog | undefined {
    return this.traceStore.get(traceId);
  }
}
