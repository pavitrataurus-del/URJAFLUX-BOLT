# Secrets & Cryptographic Management (SECRETS-MANAGEMENT.md)

## 1. Secrets Vault Isolation
Urjaflux AI OS stores infrastructure configurations and third-party keys (e.g. `GEMINI_API_KEY`, `DATABASE_URL`) inside an encrypted Secrets Vault.
- **Access Logging:** Any decryption or fetch request requires an explicit user purpose justification log. Attempting to view a secret without entering a justification is blocked.
- **Encryption:** Secrets are encrypted in-transit and at-rest using pseudo AES-256-GCM symmetric master keys managed by key managers.

## 2. Key Rotation Policies
Master keys and vault secrets support customizable rotation intervals (90 to 180 days). Setting or rotating a secret triggers high-severity events logged to the security audit trails ledger.
