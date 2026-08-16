import {
  ExecutionTraceEntry,
  RecognitionSessionStatus,
  VisionRecognitionResult
} from "./types";

/**
 * ============================================================================
 * RECOGNITION SESSION
 * ============================================================================
 * Lifecycle controller and execution tracer for a spatial recognition run.
 * Maintains an immutable execution trace history for diagnostics.
 */
export class RecognitionSession {
  public readonly id: string;
  public readonly blueprintId: string;
  public readonly providerId: string;

  private _status: RecognitionSessionStatus = "CREATED";
  private _progressPercent: number = 0;
  private _startTimeISO: string;
  private _endTimeISO?: string;
  private _durationMs?: number;
  private _result: VisionRecognitionResult | null = null;
  private _error: string | null = null;
  private _executionTrace: ExecutionTraceEntry[] = [];

  constructor(blueprintId: string, providerId: string) {
    this.id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.blueprintId = blueprintId;
    this.providerId = providerId;
    this._startTimeISO = new Date().toISOString();

    this.appendTrace("Blueprint Loaded", "Session initialized in CREATED state");
  }

  public get status(): RecognitionSessionStatus {
    return this._status;
  }

  public get progressPercent(): number {
    return this._progressPercent;
  }

  public get startTimeISO(): string {
    return this._startTimeISO;
  }

  public get endTimeISO(): string | undefined {
    return this._endTimeISO;
  }

  public get durationMs(): number | undefined {
    return this._durationMs;
  }

  public get result(): VisionRecognitionResult | null {
    return this._result ? { ...this._result } : null;
  }

  public get error(): string | null {
    return this._error;
  }

  public get executionTrace(): readonly ExecutionTraceEntry[] {
    return Object.freeze([...this._executionTrace]);
  }

  public start(): void {
    if (this._status !== "CREATED") {
      throw new Error(`Cannot start session from state '${this._status}'.`);
    }
    this._status = "RUNNING";
    this.appendTrace("Session Started", `Execution started with provider '${this.providerId}'`);
  }

  public updateProgress(percent: number, message: string): void {
    if (this._status !== "RUNNING") return;
    this._progressPercent = Math.min(100, Math.max(0, percent));
    this.appendTrace("Recognition Executed", `Progress ${this._progressPercent}%: ${message}`);
  }

  public complete(result: VisionRecognitionResult): void {
    if (this._status !== "RUNNING") return;
    this._status = "COMPLETED";
    this._progressPercent = 100;
    this._result = result;
    this._endTimeISO = new Date().toISOString();
    this._durationMs = new Date(this._endTimeISO).getTime() - new Date(this._startTimeISO).getTime();

    this.appendTrace("Result Returned", "Forwarded to Wall Framework");
    this.appendTrace("Session Completed", "Recognition session completed successfully");
  }

  public fail(errorMessage: string): void {
    if (this._status === "COMPLETED" || this._status === "CANCELLED") return;
    this._status = "FAILED";
    this._error = errorMessage;
    this._endTimeISO = new Date().toISOString();
    this._durationMs = new Date(this._endTimeISO).getTime() - new Date(this._startTimeISO).getTime();

    this.appendTrace("Session Failed", `Error: ${errorMessage}`);
  }

  public cancel(): void {
    if (this._status === "COMPLETED" || this._status === "FAILED") return;
    this._status = "CANCELLED";
    this._endTimeISO = new Date().toISOString();
    this._durationMs = new Date(this._endTimeISO).getTime() - new Date(this._startTimeISO).getTime();

    this.appendTrace("Session Cancelled", "Recognition session was cancelled");
  }

  private appendTrace(phase: string, message: string, details?: Record<string, unknown>): void {
    this._executionTrace.push(
      Object.freeze({
        timestampISO: new Date().toISOString(),
        phase,
        message,
        status: this._status,
        details
      })
    );
  }
}
