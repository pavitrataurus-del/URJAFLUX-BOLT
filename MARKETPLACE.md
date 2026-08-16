# DOMAIN-019: Extension Marketplace

The URJAFLUX Extension Marketplace provides a secure, curated registry where administrators can search and safely install extensions.

## 1. Metadata Schema
Each listing contains:
- **Identifier**: Matchable plugin ID.
- **Category**: Classification (e.g., Vision Intelligence, Spatial Intelligence).
- **Ratings & Reviews**: Written comments and numeric scores left by verified users.
- **Publisher Profile**: Detailed profile verifying the original development studio.
- **License Metadata**: Clear legal bindings (e.g. MIT Open Source vs. Enterprise Commercial).

## 2. Installation Pipeline
1. Administrator clicks "Install in Sandbox" in the Marketplace UI.
2. The platform downloads the manifest and validates the package signature.
3. The Dependency Manager validates that the package is compatible with the current core version.
4. The plugin is added to the secure local registry in `ACTIVE` status.
5. All associated extension hooks are mounted in the appropriate domains.
