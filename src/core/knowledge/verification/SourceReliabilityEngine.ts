import { SourceReliabilityMetrics } from "./VerificationTypes";

export class SourceReliabilityEngine {
  private static instance: SourceReliabilityEngine;
  private sourcesMap: Map<string, SourceReliabilityMetrics> = new Map();

  public constructor() {}

  public static getInstance(): SourceReliabilityEngine {
    if (!SourceReliabilityEngine.instance) {
      SourceReliabilityEngine.instance = new SourceReliabilityEngine();
    }
    return SourceReliabilityEngine.instance;
  }

  public registerSource(metrics: Omit<SourceReliabilityMetrics, "overallReliability" | "isAutoRejected">): SourceReliabilityMetrics {
    const overall = this.computeOverallReliability(metrics);
    const fullMetrics: SourceReliabilityMetrics = {
      ...metrics,
      overallReliability: overall,
      isAutoRejected: false // Mandatory invariant: sources are NEVER automatically rejected
    };
    this.sourcesMap.set(metrics.sourceId, fullMetrics);
    return fullMetrics;
  }

  public getSourceReliability(sourceId: string): SourceReliabilityMetrics | undefined {
    return this.sourcesMap.get(sourceId);
  }

  public getAllSources(): SourceReliabilityMetrics[] {
    return Array.from(this.sourcesMap.values());
  }

  public computeOverallReliability(m: Omit<SourceReliabilityMetrics, "overallReliability" | "isAutoRejected">): number {
    const weightedSum = 
      m.authorityScore * 0.25 +
      m.authenticityScore * 0.20 +
      m.evidenceScore * 0.20 +
      m.consistencyScore * 0.15 +
      m.reviewScore * 0.10 +
      m.expertRating * 0.10;

    return Math.min(100, Math.max(0, Math.round(weightedSum)));
  }

  public updateExpertRating(sourceId: string, rating: number): SourceReliabilityMetrics | undefined {
    const existing = this.sourcesMap.get(sourceId);
    if (!existing) return undefined;

    existing.expertRating = Math.min(100, Math.max(0, rating));
    existing.overallReliability = this.computeOverallReliability(existing);
    this.sourcesMap.set(sourceId, existing);
    return existing;
  }
}

export const sourceReliabilityEngine = SourceReliabilityEngine.getInstance();
