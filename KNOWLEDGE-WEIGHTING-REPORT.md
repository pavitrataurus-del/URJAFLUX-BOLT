# Knowledge Weighting Engine Report

## Calculation Factors
Computes dynamic Final Knowledge Weight ($0.0 - 1.0$) using eight weighted dimensions:
1. **Source Reliability Weight** (25%)
2. **Evidence Count Weight** (20%)
3. **Expert Approval Weight** (15%)
4. **Historical Acceptance Weight** (10%)
5. **Relationship Completeness Weight** (10%)
6. **Ontology Completeness Weight** (10%)
7. **Cross-Domain Support Weight** (10%)
8. **Conflict Severity Penalty** (Deducted up to -15%)

## Output Range
- Range: `0.000` to `1.000`.
- Rules with weight $> 0.80$ and zero active critical conflicts become candidates for Canonical Rule Promotion.
