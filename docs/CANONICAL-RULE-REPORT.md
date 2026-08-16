# Canonical Rule Promotion Engine Report

## Overview
The **Canonical Rule Builder** converts verified, high-confidence knowledge statements into immutable canonical rules used directly by AI reasoning agents.

## Structure of a Canonical Rule
- `ruleId`: Unique canonical identifier.
- `canonicalVersion`: Semantic versioning string (e.g. `1.0.0`).
- `title` & `statement`: Standardized canonical rule text.
- `domain`: Associated domain (`Vastu`, `Chakra`, `Numerology`, `LalKitab`).
- `supportingEvidence`: Array of verified primary source citations.
- `confidenceScore` & `confidenceGrade`: Numerical score and letter grade (A+, A, B, C).
- `reviewer`: SME or Acharya who authorized canonical promotion.
