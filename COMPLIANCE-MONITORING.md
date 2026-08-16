# Compliance Monitoring Specification — DOMAIN-008

## Overview
`ComplianceMonitoringService.ts` evaluates property compliance across 5 quantitative vectors without altering project states:

## Evaluation Vectors
1. **Recommendation Compliance (25%)**: Ratio of installed remedies against DOMAIN-006 recommendations.
2. **Execution Compliance (25%)**: Ratio of completed DOMAIN-007 workflow tasks.
3. **Inspection Audit Compliance (20%)**: Validity and pass rate of field inspector checklists.
4. **Documentation Completeness (15%)**: Integrity of site certificates, room drawings, and metadata.
5. **Evidence Freshness Index (15%)**: Recency and SHA256 checksum validity of uploaded media evidence.

## Deterministic Property Health Formula
`Property Health Score = Base Rating - (Critical Alerts × 5) + Compliance Bonus`
Bounded deterministically between `0` and `100`.
