import { KnowledgeEvidence, SourceRef, ExpertRef, HistoricalRef, EvidenceQuality } from "./VerificationTypes";

export class EvidenceEngine {
  private static instance: EvidenceEngine;
  private evidenceStore: Map<string, KnowledgeEvidence> = new Map();

  private constructor() {}

  public static getInstance(): EvidenceEngine {
    if (!EvidenceEngine.instance) {
      EvidenceEngine.instance = new EvidenceEngine();
    }
    return EvidenceEngine.instance;
  }

  public registerEvidence(evidence: KnowledgeEvidence): void {
    this.evidenceStore.set(evidence.ruleId, evidence);
  }

  public getEvidence(ruleId: string): KnowledgeEvidence | undefined {
    return this.evidenceStore.get(ruleId);
  }

  public calculateEvidenceMetrics(
    primarySources: SourceRef[],
    supportingSources: SourceRef[],
    contradictingSources: SourceRef[],
    researchSources: SourceRef[],
    expertReferences: ExpertRef[],
    historicalReferences: HistoricalRef[]
  ): { evidenceCount: number; evidenceStrength: number; evidenceQuality: EvidenceQuality; evidenceFreshness: number } {
    const totalCount = 
      primarySources.length + 
      supportingSources.length + 
      researchSources.length + 
      expertReferences.length + 
      historicalReferences.length;

    // Weight primary and research sources highest
    const primaryWeight = primarySources.reduce((acc, s) => acc + s.reliabilityScore * 1.2, 0);
    const researchWeight = researchSources.reduce((acc, s) => acc + s.reliabilityScore * 1.1, 0);
    const supportingWeight = supportingSources.reduce((acc, s) => acc + s.reliabilityScore * 0.9, 0);
    const historicalWeight = historicalReferences.length * 75;
    const expertWeight = expertReferences.reduce((acc, e) => acc + e.rating * 1.0, 0);

    const contradictionPenalty = contradictingSources.reduce((acc, s) => acc + (100 - s.reliabilityScore) * 0.8, 0);

    const rawScore = (primaryWeight + researchWeight + supportingWeight + historicalWeight + expertWeight) / Math.max(totalCount, 1);
    const adjustedStrength = Math.min(100, Math.max(0, Math.round(rawScore - (contradictionPenalty / Math.max(totalCount, 1)) * 0.3)));

    let quality: EvidenceQuality = "LOW";
    if (adjustedStrength >= 80 && primarySources.length >= 1) {
      quality = "HIGH";
    } else if (adjustedStrength >= 60 || totalCount >= 3) {
      quality = "MEDIUM";
    }

    // Freshness: blend research and modern translations
    const freshness = Math.min(100, Math.round(65 + (researchSources.length * 10) + (supportingSources.length * 3)));

    return {
      evidenceCount: totalCount,
      evidenceStrength: adjustedStrength,
      evidenceQuality: quality,
      evidenceFreshness: freshness
    };
  }

  public attachPrimarySource(ruleId: string, source: SourceRef): KnowledgeEvidence {
    let evidence = this.getEvidence(ruleId);
    if (!evidence) {
      evidence = this.createEmptyEvidence(ruleId);
    }
    evidence.primarySources.push(source);
    const metrics = this.calculateEvidenceMetrics(
      evidence.primarySources,
      evidence.supportingSources,
      evidence.contradictingSources,
      evidence.researchSources,
      evidence.expertReferences,
      evidence.historicalReferences
    );
    evidence.evidenceCount = metrics.evidenceCount;
    evidence.evidenceStrength = metrics.evidenceStrength;
    evidence.evidenceQuality = metrics.evidenceQuality;
    evidence.evidenceFreshness = metrics.evidenceFreshness;

    this.evidenceStore.set(ruleId, evidence);
    return evidence;
  }

  private createEmptyEvidence(ruleId: string): KnowledgeEvidence {
    return {
      ruleId,
      primarySources: [],
      supportingSources: [],
      contradictingSources: [],
      researchSources: [],
      expertReferences: [],
      historicalReferences: [],
      evidenceCount: 0,
      evidenceStrength: 0,
      evidenceQuality: "LOW",
      evidenceFreshness: 50
    };
  }
}

export const evidenceEngine = EvidenceEngine.getInstance();
