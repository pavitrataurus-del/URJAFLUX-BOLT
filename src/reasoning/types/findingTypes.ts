export enum FindingSeverity {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR",
  NEUTRAL = "NEUTRAL"
}

export enum FindingStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
  OVERRIDDEN = "OVERRIDDEN"
}

export enum FindingSource {
  RULE_ENGINE = "RULE_ENGINE",
  SPATIAL_ANALYSIS = "SPATIAL_ANALYSIS",
  KNOWLEDGE_BASE = "KNOWLEDGE_BASE",
  AI = "AI",
  MANUAL = "MANUAL"
}

export type FindingConfidence = number; // Numeric value representing certainty (0.0 to 1.0)

export interface FindingEvidence {
  readonly id: string;
  readonly type: "spatial_relationship" | "rule_result" | "knowledge_item" | "external";
  readonly description: string;
  readonly metadata?: Record<string, unknown>;
}

export interface FindingReference {
  readonly sourceId: string;
  readonly section?: string;
  readonly citationText?: string;
  readonly externalUrl?: string;
}

export interface Finding {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: FindingSeverity;
  readonly confidence: FindingConfidence;
  readonly status: FindingStatus;
  readonly source: FindingSource;
  readonly evidence: readonly FindingEvidence[];
  readonly references: readonly FindingReference[];
  readonly affectedElements: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Record<string, unknown>;
}
