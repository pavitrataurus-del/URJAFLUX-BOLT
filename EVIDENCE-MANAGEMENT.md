# Evidence Management Specification — DOMAIN-007

## Overview
Every field action produces verifiable evidence stored in the Digital Evidence Vault.

## Evidence Attributes
- **Types**: `IMAGE`, `VIDEO`, `PDF`, `REPORT`, `DRAWING`, `VOICE_NOTE`, `MEASUREMENT`.
- **Traceability Metadata**:
  - Timestamp & Uploader Role
  - `relatedTaskId`, `relatedRecommendationId`, `relatedProjectId`
  - Cryptographic Hash (`immutableChecksum` SHA256)
  - Geolocation (`gpsCoordinates`: latitude, longitude)
  - Physical Measurement parameters
