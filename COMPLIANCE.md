# Compliance & Audit Governance Specification (COMPLIANCE.md)

## 1. Compliance Matrix
DOMAIN-017 maps operational event trails to international security standards:
- **ISO 27001:** Mapped to Access Control (`A.9`) and Cryptographic Policies (`A.10`).
- **SOC 2 CC6:** Verifies that logical access controls are active across all domain services.
- **GDPR Article 7 & 16:** Implements client consent records and user data rectification controls.
- **HIPAA Audit Control:** Implements immutable logging of protected data retrievals.

## 2. Dynamic Evidence Signer
Administrative users can upload, compile, and anchor compliance evidence logs in the active workspace. The engine signs evidence artifacts with SHA-256 digests to guarantee immutable proof suitable for external certification audits.
