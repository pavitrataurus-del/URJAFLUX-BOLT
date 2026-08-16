/**
 * ============================================================================
 *               URJAFLUX AI OS — FOUNDATION LAYER 02
 *                     RULE PACK ECOSYSTEM (RPE)
 * ============================================================================
 * 
 * This file specifies the architecture of the URJAFLUX Rule Pack Ecosystem (RPE).
 * RPE governs how collections of rules (Rule Packs) are bundled, versioned,
 * cryptographically signed, monetized, customized, and distributed to enterprise
 * environments.
 * 
 * DESIGN CRITERIA:
 * 1. MODULAR & PACKAGED: Every domain (e.g., "Vastu Standard Edition", "Feng Shui Residential",
 *    "Germany Municipal Code Section 4") is shipped as a self-contained, version-controlled Rule Pack.
 * 2. CRYPTOGRAPHIC INTEGRITY: Commercially sensitive rule sets are encrypted and signed
 *    using standard enterprise asymmetric key signatures (RSA/ECDSA) to prevent tampered or cracked packs.
 * 3. INHERITANCE & POLYMORPHISM: Allows local municipalities or enterprises to inherit
 *    a base pack and override parameters (e.g., setback distance, local daylight hours) without rewriting rules.
 * 4. MULTI-TENANT LICENSING: Provides native structures for Pay-Per-Query, Seats, or Flat subscriptions.
 * 5. LANGUAGE & LOCALIZATION: Translates rule observations and scriptures into multi-lingual glossaries.
 * 
 * @scale Designed to scale to thousands of distinct Rule Packs representing millions of spatial queries.
 * @compatibility Integrates directly with Enterprise Rule Engine Framework (EREF) defined in rules.ts.
 */

import { 
  RuleID, 
  RuleVersionString, 
  KnowledgeSystemType, 
  EnterpriseRule, 
  RuleScope,
  AuthorID
} from "./rules";

export type RulePackID = string;
export type LicenseID = string;
export type TenantID = string;

// ============================================================================
// 1. RULE PACK MANIFEST
// ============================================================================

/**
 * The core metadata manifest of a Rule Pack. Identical to package managers like
 * npm or NuGet, but specialized for spatial and energetic reasoning domains.
 */
export interface RulePackManifest {
  id: RulePackID;
  name: string;
  description: string;
  version: RuleVersionString; // e.g., "1.4.0" (strictly SemVer)
  system: KnowledgeSystemType;
  
  // Publisher Information
  publisher: {
    id: string;
    name: string;
    email: string;
    url?: string;
    isVerified: boolean; // Verified URJAFLUX Partners or official standards bodies
  };

  // Compatibility & Core Dependencies
  compatibility: {
    erefVersionRange: string; // e.g., "^2.0.0" (minimum EREF engine version)
    requiresPacks?: Array<{
      packId: RulePackID;
      versionRange: string;
    }>;
  };

  // Licensing & Monetization models
  licensing: {
    type: "OPEN_SOURCE" | "FREE_PROPRIETARY" | "COMMERCIAL_SUBSCRIPTION" | "COMMERCIAL_PAY_PER_EXECUTION" | "ENTERPRISE_CUSTOM";
    priceUSD?: number;
    currency?: string;
    allowedTenants?: TenantID[]; // For private enterprise custom-crafted rule packs
  };

  // Localization settings
  locales: string[]; // e.g. ["en-US", "hi-IN", "zh-CN", "sa-IN"]

  // Security and Encryption status
  security: {
    isEncrypted: boolean;             // True if the logical AST is compiled to bytecode/encrypted blob
    encryptionAlgorithm?: "AES-GCM-256" | "CHACHA20-POLY1305";
    signatureKeyId: string;           // Key ID used to verify publisher integrity
    checksum: string;                 // SHA-256 hash of the rule pack contents
  };

  tags: string[];
  createdDate: string; // ISO 8601
  modifiedDate: string; // ISO 8601
}

// ============================================================================
// 2. CRYPTOGRAPHIC SIGNATURE & VERIFICATION
// ============================================================================

/**
 * Secures commercial intellectual property (Level 3/4/5 Moats).
 * Guarantees that rules have not been altered or reverse-engineered.
 */
export interface RulePackSignature {
  packId: RulePackID;
  version: RuleVersionString;
  signerPublicKey: string; // PEM formatted public key
  signatureValue: string;  // Base64 encoded signature over the pack checksum
  timestamp: string;
  authorityIssuer: "URJAFLUX_ROOT_CA" | "PARTNER_CA" | "COMMUNITY_SELF_SIGNED";
}

// ============================================================================
// 3. PARAMETERIZATION & CUSTOMIZATION (VARIABLE INHERITANCE)
// ============================================================================

/**
 * Enterprise systems require customization. For instance, a rule assessing
 * building slope might have a different threshold in mountainous Switzerland
 * compared to flat Netherlands, while utilizing the identical rule math.
 */
export interface RulePackVariableSchema {
  key: string;               // e.g. "min_setback_meters" or "optimum_slope_angle"
  type: "number" | "string" | "boolean" | "array" | "coordinate_bounds";
  defaultValue: any;
  description: string;
  validationRegex?: string;  // For string parameters
  rangeMin?: number;         // For numeric parameters
  rangeMax?: number;         // For numeric parameters
}

/**
 * Holds custom values assigned to a Rule Pack by an enterprise tenant or consultant.
 */
export interface RulePackOverrideConfiguration {
  packId: RulePackID;
  tenantId: TenantID;
  projectId?: string; // Optional: can override configurations per specific project site
  variables: Record<string, any>; // Key-Value mapping matching the VariableSchema keys
  disabledRuleIds?: RuleID[];     // Allows the enterprise to disable specific rules in a pack
}

// ============================================================================
// 4. MULTI-LINGUAL GLOSSARY & TRANSLATION SYSTEM
// ============================================================================

/**
 * Localization dictionary supporting ancient languages (Sanskrit scripture verses)
 * and contemporary localized technical terminology.
 */
export interface RulePackTranslation {
  locale: string; // e.g. "hi-IN"
  translations: Record<string, string>; // Mapping of TranslationKey -> Localized String
  
  // Custom glossary mapping for esoteric domain vocabulary
  glossary?: Array<{
    term: string;          // e.g. "Ishanya" or "Qian"
    equivalentEnglish: string; // e.g. "North-East" or "Heaven"
    definition: string;
  }>;
}

// ============================================================================
// 5. PACK BUNDLE ARCHITECTURE
// ============================================================================

/**
 * The physical or network payload representing a shipped Rule Pack.
 */
export interface RulePackBundle {
  manifest: RulePackManifest;
  signature: RulePackSignature;
  
  // The payload contains either full plaintext definitions or encrypted logical structures
  rules: EnterpriseRule[] | string; // Plaintext array of rules OR base64 encrypted payload
  
  // Custom execution scripts/compiled WebAssembly files associated with specialized rules
  compiledExecutables?: Record<string, string>; // e.g., "custom_math.wasm": "base64..."
  
  variableSchemas: RulePackVariableSchema[];
  translations: RulePackTranslation[];
}

// ============================================================================
// 6. LICENSING & ENTITLEMENTS (COMMERCIAL INTEGRITY)
// ============================================================================

/**
 * Standard spatial platform licensing ticket ensuring monetized asset protection.
 */
export interface RulePackEntitlement {
  licenseId: LicenseID;
  packId: RulePackID;
  tenantId: TenantID;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt?: string; // ISO 8601
  seatsPurchased?: number;
  totalExecutionsAllowed?: number;
  totalExecutionsConsumed: number;
  cryptographicToken: string; // Verification token signed by URJAFLUX Licensing Authority
}

// ============================================================================
// 7. REGISTRY & MANAGEMENT INTERFACES (API STRATEGY)
// ============================================================================

/**
 * Manages publishing, inventory, and distribution of rulesets globally.
 */
export interface IRulePackRegistry {
  /**
   * Publishes a new Rule Pack to the global or local private registry.
   */
  publishPack(bundle: RulePackBundle, developerToken: string): Promise<{ success: boolean; manifest: RulePackManifest }>;

  /**
   * Deprecates an old version of a rule pack, preventing new activations while honoring existing contracts.
   */
  deprecatePackVersion(packId: RulePackID, version: RuleVersionString, reason: string): Promise<boolean>;

  /**
   * Retrieves rule packs compatible with specific project characteristics.
   */
  queryAvailablePacks(scope: RuleScope, system?: KnowledgeSystemType): Promise<RulePackManifest[]>;
}

/**
 * Resolves local execution environments, downloading dependencies,
 * decrypting payload binaries, and verifying digital signatures before loading into memory.
 */
export interface IRulePackLoader {
  /**
   * Downloads, validates, decrypts, and initializes rules inside EREF.
   */
  resolveAndLoadBundle(
    packId: RulePackID, 
    version: RuleVersionString, 
    entitlement: RulePackEntitlement,
    overrides?: RulePackOverrideConfiguration
  ): Promise<{ rules: EnterpriseRule[]; variableBindings: Record<string, any> }>;
}

/**
 * Decrypts encrypted rule bundles using local tenant keys in an isolated sandbox.
 */
export interface IDecryptionSandbox {
  decryptRules(encryptedData: string, keyId: string, signature: RulePackSignature): Promise<EnterpriseRule[]>;
}

/**
 * Handles billing calculations, tracking spatial evaluations to enforce seat/query caps.
 */
export interface ILicensingVerifier {
  verifyAccess(tenantId: TenantID, packId: RulePackID): Promise<RulePackEntitlement>;
  incrementExecutionMetric(licenseId: LicenseID, amount: number): Promise<boolean>;
}

// ============================================================================
// 8. ENTERPRISE PACK ECOSYSTEM COORDINATOR (REFERENCE IMPLEMENTATION)
// ============================================================================

/**
 * Demonstrates the production pipeline:
 * Verify License -> Verify Signature -> Resolve Dependencies -> Bind Override Variables -> Load into Active Memory.
 */
export class RulePackEcosystemCoordinator {
  private registry: IRulePackRegistry;
  private packLoader: IRulePackLoader;
  private licenseVerifier: ILicensingVerifier;

  constructor(
    registry: IRulePackRegistry,
    packLoader: IRulePackLoader,
    licenseVerifier: ILicensingVerifier
  ) {
    this.registry = registry;
    this.packLoader = packLoader;
    this.licenseVerifier = licenseVerifier;
  }

  /**
   * Prepares and loads complete system rulesets from multiple rule packs
   * ensuring full licensing and variable injection compliance.
   */
  public async compileRulesetForExecution(
    tenantId: TenantID,
    requestedPacks: Array<{ id: RulePackID; version: RuleVersionString }>,
    overrides?: RulePackOverrideConfiguration[]
  ): Promise<EnterpriseRule[]> {
    const finalCompiledRules: EnterpriseRule[] = [];

    for (const packRef of requestedPacks) {
      try {
        // 1. License Check (Level 4/5 Business Protection)
        const entitlement = await this.licenseVerifier.verifyAccess(tenantId, packRef.id);
        if (entitlement.status !== "ACTIVE") {
          throw new Error(`Licensing verification failed for Rule Pack ${packRef.id}. Status is ${entitlement.status}`);
        }

        // 2. Handle configuration overrides for the tenant
        const activeOverride = overrides?.find(o => o.packId === packRef.id);

        // 3. Load Bundle through Sandbox Loader (Handles Cryptography & AST Binding)
        const loaded = await this.packLoader.resolveAndLoadBundle(
          packRef.id,
          packRef.version,
          entitlement,
          activeOverride
        );

        // 4. Accumulate rules for execution pipeline
        finalCompiledRules.push(...loaded.rules);

        // Log successful mount of proprietary assets
        console.info(`[RPE Engine] Successfully mounted Rule Pack: ${packRef.id} (v${packRef.version}) for Tenant: ${tenantId}`);
      } catch (err: any) {
        console.error(`[RPE Engine] Critical failure mounting rule pack ${packRef.id}:`, err);
        throw new Error(`RPE_MOUNT_FAILED: ${err.message || err}`);
      }
    }

    return finalCompiledRules;
  }
}
