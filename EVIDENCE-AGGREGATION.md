# Evidence Aggregation Specification — DOMAIN-006

## Overview
Every recommendation produced by the Unified Reasoning Engine MUST be backed by a verifiable `IEvidenceBundle`.

## Evidence Bundle Structure
- **Supporting Domains**: Array of domains contributing verified claims (`['Vastu', 'LalKitab', 'Astrology']`).
- **Supporting Entities**: Canonical references to entity records in master libraries.
- **Supporting Rules**: Exact rule statements applied during synthesis.
- **Source Citations**:
  - `book`: Title of classical or modern approved text (e.g., *Mayamatam*, *Brihat Parashara Hora Shastra*, *Sat Chakra Nirupana*, *Lal Kitab 1952*).
  - `author`: Sage or authoritative translator.
  - `chapter`: Specific chapter or section.
  - `verseOrShloka`: Sanskrit shloka citation or verse reference.
  - `sourceReliability`: Score (0–100) derived from Truth Engine.
- **Verification Status**: `CANONICAL` | `VERIFIED` | `REVIEWED`.
