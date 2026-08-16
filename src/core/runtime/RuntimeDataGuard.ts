/**
 * URJAFLUX AI OS - UI Runtime Guard
 * Phase 6: Validates every value before rendering.
 * Prevents UI components from rendering synthetic, fabricated, or default demo data.
 */

export interface GuardResult<T> {
  isLive: boolean;
  value: T | null;
  statusMessage: string;
}

export class RuntimeDataGuard {
  /**
   * Guards a numerical compliance score.
   * Rejects undefined, null, or unexecuted zero-scores.
   */
  public static guardScore(score: number | null | undefined, hasExecuted: boolean): GuardResult<number> {
    if (!hasExecuted || score === null || score === undefined) {
      return {
        isLive: false,
        value: null,
        statusMessage: "Analysis Not Completed"
      };
    }
    return {
      isLive: true,
      value: score,
      statusMessage: "LIVE"
    };
  }

  /**
   * Guards array datasets (Entities, Findings, Recommendations).
   * Rejects nulls or synthetic default fallbacks.
   */
  public static guardArray<T>(
    items: T[] | null | undefined,
    hasExecuted: boolean,
    entityName: string = "Data"
  ): GuardResult<T[]> {
    if (!hasExecuted || !items || items.length === 0) {
      return {
        isLive: false,
        value: null,
        statusMessage: `${entityName} Not Available`
      };
    }
    return {
      isLive: true,
      value: items,
      statusMessage: "LIVE"
    };
  }

  /**
   * Guards text fields such as client or project names.
   * Returns empty state placeholder if unassigned rather than fabricating demo names.
   */
  public static guardString(value: string | null | undefined, fallbackLabel: string = "Unspecified"): string {
    if (!value || value.trim() === "" || value === "Lead Client" || value === "Vastu Analysis Project") {
      return fallbackLabel;
    }
    return value;
  }
}
