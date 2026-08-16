// ============================================================================
// URJAFLUX AI OS - KQE REGISTRY LOOKUP STEP
// Pipeline Step 3: Discovers matching rule IDs using Rule Registry indexes
// ============================================================================

import { IKqeNormalizedQuery } from "../types/kqe.types";
import { RuleRegistryEngine } from "../../rule_registry/engine/RuleRegistryEngine";
import { IRuleRegistryRecord } from "../../rule_registry/types/ruleRegistry.types";

export class RegistryLookupStep {
  private registryEngine = RuleRegistryEngine.getInstance();

  public lookup(normalizedQuery: IKqeNormalizedQuery): IRuleRegistryRecord[] {
    // Direct Rule Lookup
    if (normalizedQuery.ruleId) {
      const rec = this.registryEngine.getRegistryRecord(normalizedQuery.ruleId);
      return rec ? [rec] : [];
    }

    // Index Discovery Lookup
    const matchedRecords = this.registryEngine.discoverRules({
      domain: normalizedQuery.domain,
      category: normalizedQuery.category || undefined,
      direction: normalizedQuery.direction || undefined,
      zone: normalizedQuery.zone || undefined,
      room: normalizedQuery.room || undefined,
      objectType: normalizedQuery.objectType || undefined,
      element: normalizedQuery.element || undefined,
      planet: normalizedQuery.planet || undefined,
      chakra: normalizedQuery.chakra || undefined,
      activity: normalizedQuery.activity || undefined
    });

    return matchedRecords;
  }
}
