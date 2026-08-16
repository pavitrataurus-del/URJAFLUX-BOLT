# DOMAIN-006 — Enterprise Unified Reasoning Architecture Specification

## Executive Summary
DOMAIN-006 serves as the canonical orchestration layer for URJAFLUX AI OS. It unifies verified knowledge across five foundational libraries:
1. **DOMAIN-001 — Enterprise Vastu Knowledge Library**
2. **DOMAIN-002 — Enterprise Chakra Intelligence Library**
3. **DOMAIN-003 — Enterprise Lal Kitab Intelligence Library**
4. **DOMAIN-004 — Enterprise Numerology Intelligence Library**
5. **DOMAIN-005 — Enterprise Astrology Intelligence Library**

## Key System Principles
- **No Direct Prediction or Horoscope Generation**: The Reasoning Engine does not generate birth charts or make predictive horoscopes. It orchestrates verified textual shastra rules.
- **Strict Evidence Traceability**: No recommendation can exist without dual-shloka or primary source book citation from the underlying registries.
- **Truth Engine Arbitration**: Cross-domain evidence is weighted, scored, and arbitrated using DOMAIN-002B Truth Engine metrics (`ITruthEngineMetrics`).

## Architecture Services Map
```
[User Input Context]
        │
        ▼
┌─────────────────────────┐
│     ContextBuilder      │ ──► Normalizes parameters into Unified Reasoning Graph
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ KnowledgeRetrievalEngine│ ──► Queries Vastu, Chakra, LalKitab, Numerology, Astrology
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│    EvidenceAggregator   │ ──► Bundles supporting entities, shlokas & source books
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│     ConflictResolver    │ ──► Detects cross-domain friction & applies priority rules
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│   ConfidenceCalculator  │ ──► Computes multi-factor score (Grade A+, A, B, C, F)
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│   ExplanationGenerator  │ ──► Builds step-by-step audit chains & rule hierarchy
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  RecommendationBuilder  │ ──► Formats strictly typed IRecommendation objects
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ RecommendationRanking   │ ──► Deduplicates & ranks by composite score
└─────────────────────────┘
```

## System Interfaces
All types are strictly defined in `/src/core/reasoning/ReasoningTypes.ts`.
