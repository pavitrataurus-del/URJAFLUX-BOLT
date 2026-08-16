# DOMAIN-004 — Enterprise Numerology Data Model Specification

## Architectural Overview
This specification details the TypeScript interfaces, type definitions, truth engine metrics, and database representation for DOMAIN-004 in URJAFLUX AI OS.

---

## 1. Core Interfaces

### Entity Interface (`INumerologyOntologyEntity`)
```typescript
export interface INumerologyOntologyEntity {
  id: string;
  canonicalName: string;
  alternateNames: string[];
  numberValue?: number;
  system?: 'Pythagorean' | 'Chaldean' | 'Vedic' | 'Kabbalah';
  entityType: NumerologyEntityType;
  description: string;
  category: string;
  tags: string[];
  version: string;
  status: KnowledgeStatus;
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedDirection?: string;
  associatedDay?: string;
  associatedGemstone?: string;
  metadata: Record<string, any>;
  sourceTraceability: ISourceTraceability;
  truthEngineMetrics: ITruthEngineMetrics;
  revisionNotes: string[];
  lastUpdatedBy: string;
  lastUpdatedTimestamp: string;
}
```

### Truth Engine Metrics (`ITruthEngineMetrics`)
```typescript
export interface ITruthEngineMetrics {
  sourceReliability: number; // 0-100
  evidenceStrength: number;  // 0-100
  knowledgeWeight: number;   // 0.0-1.0
  confidenceScore: number;   // 0-100
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expertConsensusStatus: ExpertReviewStatus;
  hasActiveConflict: boolean;
  isCanonical: boolean;
}
```

---

## 2. End-User RBAC View Interface (`INumerologyEndUserEntity`)
```typescript
export interface INumerologyEndUserEntity {
  id: string;
  canonicalName: string;
  numberValue?: number;
  system?: string;
  entityType: NumerologyEntityType;
  description: string;
  category: string;
  tags: string[];
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  isCanonical: boolean;
}
```

---

## 3. Quality Metrics Computation
Overall Quality Score formula:
`QualityScore = (OCR_Accuracy * 0.20) + (Source_Authority * 0.25) + (Evidence_Strength * 0.25) + (SME_Consensus * 0.15) + (Completeness * 0.15)`
