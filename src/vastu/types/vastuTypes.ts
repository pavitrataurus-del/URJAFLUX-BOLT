import { SpatialRelationshipModel } from "../../spatial/relationships/relationshipTypes";

export type RuleCategory = "placement" | "orientation" | "connectivity" | "zoning" | "flow";
export type RuleSeverity = "critical" | "major" | "minor" | "neutral";

export interface VastuRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  requiredSpatialRelationships: readonly string[];
  severity: RuleSeverity;
  enabled?: boolean;
}

export interface RuleResult {
  ruleId: string;
  passed: boolean;
  score: number; // Placeholder/structural score only, no actual score calculation logic
  message: string;
  affectedElements: string[];
}

export interface RuleContext {
  spatialRelationships: SpatialRelationshipModel;
}
