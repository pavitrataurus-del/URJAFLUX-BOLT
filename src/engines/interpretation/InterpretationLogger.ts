import { InterpretationLog } from "./InterpretationTypes";

/**
 * Enterprise recorder for tracking execution events, latency performance, and outputs
 * of the Interpretation Engine.
 */
export class InterpretationLogger {
  private logs: InterpretationLog[] = [];

  /**
   * Constructs and stores a structured execution trace log.
   */
  public log(
    startTimeMs: number,
    projectId: string,
    propertyId: string,
    findingsCount: number,
    recommendationsCount: number,
    warnings: string[],
    errors: string[],
    trace: string[]
  ): InterpretationLog {
    const durationMs = performance.now() - startTimeMs;
    const newLog: InterpretationLog = {
      id: `INTERP-LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      durationMs,
      projectId,
      propertyId,
      findingsCount,
      recommendationsCount,
      warnings,
      errors,
      trace
    };

    this.logs.push(newLog);

    // Human-scannable console feedback
    console.log(
      `[URJAFLUX AI OS InterpretationLogger] Compiled ${findingsCount} findings and ${recommendationsCount} recommendations for Project "${projectId}" in ${durationMs.toFixed(2)}ms.`
    );

    if (errors.length > 0) {
      console.warn(`[URJAFLUX AI OS InterpretationLogger] Pipeline completed with ${errors.length} errors:`, errors);
    }

    return newLog;
  }

  /**
   * Retrieves all historical logs.
   */
  public getLogs(): InterpretationLog[] {
    return [...this.logs];
  }

  /**
   * Clears all session logs.
   */
  public clear(): void {
    this.logs = [];
  }
}
