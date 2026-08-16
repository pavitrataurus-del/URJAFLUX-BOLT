# Recommendation Model Specification — DOMAIN-006

## Objective
The `IRecommendation` model represents a fully structured, non-ambiguous recommendation object. Freeform text or unverified claims are strictly forbidden.

## Schema Specification
```typescript
export interface IRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  supportingEvidence: IEvidenceBundle;
  supportingDomains: KnowledgeDomain[];
  preconditions: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  confidenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  expectedOutcome: string;
  dependencies: string[];
  conflicts: IReasoningConflict[];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED_BY_ADMIN' | 'OVERRIDDEN';
  version: string;
}
```

## Recommendation Categories
1. **Vastu Spatial Alignment**: Architectural orientations based on Mayamatam & Samarangana Sutradhara.
2. **Astro-Elemental Balance**: Pancha Tattva harmonization.
3. **Karmic Remedial Strategy**: Non-invasive Lal Kitab 1952 house remedies.
4. **Chakra Energetic Harmony**: Pranic vocalization and focus centers.
5. **Numeric Name Vibration**: Chaldean name number calibrations.
6. **Unified Cross-Domain Synergy**: Multi-domain holistic synthesis.
