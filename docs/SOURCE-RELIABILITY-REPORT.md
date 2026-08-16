# Source Reliability Engine Report

## Overview
The **Source Reliability Engine** evaluates historical texts, translations, manuscripts, and expert contributors across six weighted dimensions to generate a dynamic reliability score (0-100).

## Reliability Dimensions & Weightings
1. **Authority Score (25%)**: Institutional backing (e.g., IGNCA, Sanskrit Academy, Oriental Institute).
2. **Authenticity Score (20%)**: Manuscript manuscript provenance, recension integrity, and linguistic purity.
3. **Evidence Score (20%)**: Physical or empirical validation across real-world structures.
4. **Consistency Score (15%)**: Cross-text alignment with classical shastric canons.
5. **Review Score (10%)**: Peer-reviewed academic commentary and SME validations.
6. **Expert Rating (10%)**: Subject matter expert feedback loop ratings.

## Invariant Enforcement
- **Non-Rejection Policy**: `isAutoRejected` is strictly pinned to `false`. Low-scoring sources remain in the repository with calculated weights to ensure auditability and complete historical tracing.
