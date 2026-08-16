# Dynamic Knowledge Weighting Engine Report

## Overview
The **Knowledge Weighting Engine** computes normalized decision weights (0.0 to 1.0) for every knowledge rule, serving as input for AI reasoning models.

## Multi-Factor Weight Formula
```
FinalWeight = (
  SourceReliabilityWeight (0.25) +
  EvidenceCountWeight (0.20) +
  ExpertApprovalWeight (0.15) +
  HistoricalAcceptanceWeight (0.10) +
  RelationshipCompletenessWeight (0.10) +
  OntologyCompletenessWeight (0.10) +
  CrossDomainSupportWeight (0.10)
) - ConflictSeverityPenalty (up to 0.15)
```

## Penalties and Adjustments
- Unresolved high-severity contradictions reduce the total weight.
- Cross-domain alignment (e.g., Vastu + Chakra + Ayadi) increases confidence and weight stability.
