/**
 * URJAFLUX AI OS — SPRINT 3A
 * Consultant Intelligence & Anonymous Learning Analytics Service
 * Enables consultants to override recognitions, accept/reject remedies,
 * compare property layout versions, and log anonymous improvement metrics.
 */

import { AnonymousLearningEntry, ConsultantOverride, PropertyComparisonResult, RecommendationStatus } from "./types";

export class ConsultantIntelligenceService {
  private static overridesKey = "urjaflux_consultant_overrides";
  private static remedyStatusKey = "urjaflux_remedy_statuses";
  private static analyticsKey = "urjaflux_anonymous_analytics";

  private static memoryStorage: Record<string, string> = {};

  private static getItem(key: string): string | null {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryStorage[key] || null;
      }
    }
    return this.memoryStorage[key] || null;
  }

  private static setItem(key: string, value: string): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // fallback
      }
    }
    this.memoryStorage[key] = value;
  }

  /**
   * Saves a consultant override for a recognized entity.
   */
  public static saveOverride(
    entityId: string,
    originalName: string,
    originalType: string,
    overriddenType: string,
    overriddenName: string,
    consultantNotes: string
  ): ConsultantOverride {
    const override: ConsultantOverride = {
      id: `OVR-${Date.now()}`,
      entityId,
      originalName,
      originalType,
      overriddenType,
      overriddenName,
      consultantNotes,
      timestamp: new Date().toISOString()
    };

    const existing = this.getOverrides();
    existing.push(override);
    this.setItem(this.overridesKey, JSON.stringify(existing));

    // Track anonymous learning entry for platform improvement
    this.trackAnonymousLearning({
      timestamp: override.timestamp,
      entityType: originalType,
      wasOverridden: true,
      originalType,
      newType: overriddenType,
      zoneAssigned: "UNKNOWN",
      appliedRuleId: "OVERRIDE",
      remedyAccepted: false
    });

    return override;
  }

  public static getOverrides(): ConsultantOverride[] {
    try {
      const raw = this.getItem(this.overridesKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Updates recommendation acceptance status.
   */
  public static setRemedyStatus(remedyId: string, status: "ACCEPTED" | "REJECTED" | "MODIFIED", comment?: string): void {
    const statuses = this.getRemedyStatuses();
    statuses[remedyId] = { remedyId, status, consultantComment: comment };
    this.setItem(this.remedyStatusKey, JSON.stringify(statuses));

    this.trackAnonymousLearning({
      timestamp: new Date().toISOString(),
      entityType: "REMEDY",
      wasOverridden: false,
      zoneAssigned: "N/A",
      appliedRuleId: remedyId,
      remedyAccepted: status === "ACCEPTED"
    });
  }

  public static getRemedyStatuses(): Record<string, RecommendationStatus> {
    try {
      const raw = this.getItem(this.remedyStatusKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Compares two property analysis snapshots (e.g. Version A Pre-Remedy vs Version B Post-Remedy)
   */
  public static comparePropertyVersions(
    versionAScore: number,
    versionADoshas: { id: string; title: string }[],
    versionBScore: number,
    versionBDoshas: { id: string; title: string }[],
    labelA: string = "Pre-Remedy Layout (Version A)",
    labelB: string = "Post-Remedy Corrected Layout (Version B)"
  ): PropertyComparisonResult {
    const setA = new Set(versionADoshas.map(d => d.id));
    const setB = new Set(versionBDoshas.map(d => d.id));

    const resolvedDefects = versionADoshas.filter(d => !setB.has(d.id)).map(d => d.title);
    const newDefects = versionBDoshas.filter(d => !setA.has(d.id)).map(d => d.title);
    const remainingDefects = versionBDoshas.filter(d => setA.has(d.id)).map(d => d.title);

    const scoreDelta = versionBScore - versionAScore;

    return {
      versionA: {
        label: labelA,
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        overallScore: versionAScore,
        defectCount: versionADoshas.length
      },
      versionB: {
        label: labelB,
        timestamp: new Date().toLocaleString(),
        overallScore: versionBScore,
        defectCount: versionBDoshas.length
      },
      scoreDelta,
      resolvedDefects,
      newDefects,
      remainingDefects,
      improvementSummary: scoreDelta >= 0
        ? `Remedies improved spatial compliance score by +${scoreDelta}%. Resolved ${resolvedDefects.length} energy defects.`
        : `Score decreased by ${scoreDelta}%. Review new spatial conflicts.`
    };
  }

  /**
   * Anonymous learning analytics tracking.
   */
  public static trackAnonymousLearning(entry: AnonymousLearningEntry): void {
    try {
      const existing = this.getAnonymousAnalytics();
      existing.push(entry);
      // Keep max 500 entries locally
      if (existing.length > 500) existing.shift();
      this.setItem(this.analyticsKey, JSON.stringify(existing));
    } catch (e) {
      console.warn("Failed to log anonymous analytics", e);
    }
  }

  public static getAnonymousAnalytics(): AnonymousLearningEntry[] {
    try {
      const raw = this.getItem(this.analyticsKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
