# DOMAIN-005 — Astrology Intelligence Library Data Model Specification

## 1. Data Model Overview
The Astrology Intelligence Library utilizes a strongly typed TypeScript interface schema (`IAstrologyOntologyEntity`) that models astrological entities, source traceability, and verification metrics.

## 2. Core Interface Definitions

### 2.1 `IAstrologyOntologyEntity`
```typescript
export interface IAstrologyOntologyEntity {
  id: string;
  canonicalName: string;
  alternateNames: string[];
  sanskritName?: string;
  hindiName?: string;
  englishName?: string;
  entityType: AstrologyEntityType;
  description: string;
  category: string;
  tags: string[];
  version: string;
  status: KnowledgeStatus;
  
  // Specific Astrological Associations
  associatedRashi?: string;
  associatedBhava?: number;
  associatedNakshatra?: string;
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedMetal?: string;
  associatedGemstone?: string;
  associatedDirection?: string;
  associatedBodyPart?: string;
  
  metadata?: Record<string, any>;
  sourceTraceability: ISourceTraceability;
  truthEngineMetrics: ITruthEngineMetrics;
  
  revisionNotes: string[];
  lastUpdatedBy: string;
  lastUpdatedTimestamp: string;
}
```

### 2.2 `ISourceTraceability`
```typescript
export interface ISourceTraceability {
  sourceBook: string;
  edition: string;
  author: string;
  publicationYear: number;
  publisher: string;
  language: string;
  chapter: string;
  verseOrShloka: string;
  pageNumber: number;
  paragraph?: string;
  ocrConfidence: number;
  importBatch: string;
  importTimestamp: string;
  verificationStatus: string;
}
```

### 2.3 `ITruthEngineMetrics`
```typescript
export interface ITruthEngineMetrics {
  sourceReliability: number;
  evidenceStrength: number;
  knowledgeWeight: number;
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expertConsensusStatus: 'Approved' | 'Pending' | 'Contested';
  hasActiveConflict: boolean;
  isCanonical: boolean;
}
```

### 2.4 End-User Sanitized Interface (`IAstrologyEndUserEntity`)
```typescript
export interface IAstrologyEndUserEntity {
  id: string;
  canonicalName: string;
  sanskritName?: string;
  hindiName?: string;
  englishName?: string;
  entityType: AstrologyEntityType;
  description: string;
  category: string;
  tags: string[];
  associatedRashi?: string;
  associatedBhava?: number;
  associatedNakshatra?: string;
  associatedPlanet?: string;
  associatedElement?: string;
  associatedColor?: string;
  associatedGemstone?: string;
  associatedDirection?: string;
  confidenceScore: number;
  confidenceGrade: string;
  isCanonical: boolean;
}
```

## 3. Truth & Quality Engine Metric Formulas
Overall Quality Score is calculated as:
$$\text{Score} = (\text{OCR} \times 0.20) + (\text{Source Authority} \times 0.25) + (\text{Evidence Strength} \times 0.25) + (\text{SME Consensus} \times 0.15) + (\text{Completeness} \times 0.15)$$

---
*URJAFLUX AI OS Data Architecture Team — Approved Canonical Document*
