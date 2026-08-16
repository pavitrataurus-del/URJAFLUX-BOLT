import { CalculationLog } from "./CalculationTypes";

/**
 * Enterprise recorder for tracking execution events, latency performance, and input/output states
 * of the Calculation Engine.
 */
export class CalculationLogger {
  private logs: CalculationLog[] = [];

  /**
   * Constructs and stores a structured execution trace log.
   */
  public log(
    startTimeMs: number,
    inputs: { projectId: string; propertyId: string; moduleIds: string[] },
    outputs: { variables: Record<string, number>; success: boolean },
    errors: string[],
    trace: string[]
  ): CalculationLog {
    const durationMs = performance.now() - startTimeMs;
    const newLog: CalculationLog = {
      id: `CALC-LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      durationMs,
      inputs,
      outputs,
      errors,
      trace
    };

    this.logs.push(newLog);

    // Formatted debug output
    const statusTag = outputs.success ? "SUCCESS" : "FAILED";
    console.log(
      `[URJAFLUX AI OS CalculationLogger] [${statusTag}] Executed ${inputs.moduleIds.length} modules on Project "${inputs.projectId}" in ${durationMs.toFixed(2)}ms.`
    );

    if (errors.length > 0) {
      console.warn(`[URJAFLUX AI OS CalculationLogger] Execution reported ${errors.length} errors:`, errors);
    }

    return newLog;
  }

  /**
   * Retrieves all historical execution logs recorded in this session.
   */
  public getLogs(): CalculationLog[] {
    return [...this.logs];
  }

  /**
   * Clears all session logs.
   */
  public clear(): void {
    this.logs = [];
  }
}
