# Canonical Rule Builder Report

## Overview
Generates immutable Canonical Rules once a knowledge candidate passes evidence count, confidence threshold ($>85\%$), and expert consensus approval.

## Canonical Schema
- **Rule ID**: Unique namespace identifier.
- **Canonical Version**: Semantic version string (e.g. `1.0.0`).
- **Title & Statement**: Verified shastric rule formulation.
- **Domain**: Target domain (e.g. Vastu Shastra, Chakra Intelligence).
- **Supporting Evidence**: Array of linked primary source manuscripts.
- **Confidence**: Score & Grade (`A+`, `A`, `B`).
- **Approval Date & Reviewer**: Sign-off audit trail.
