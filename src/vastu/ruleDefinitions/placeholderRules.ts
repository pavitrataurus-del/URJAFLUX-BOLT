import { VastuRule } from "../types/vastuTypes";

export const placeholderRules: VastuRule[] = [
  {
    id: "rule_placeholder_placement_01",
    name: "Structural Boundary Placement Placeholder Rule",
    category: "placement",
    description: "Determines structural clearance patterns using a placeholder evaluation check.",
    requiredSpatialRelationships: ["adjacent_to"],
    severity: "neutral",
    enabled: true
  },
  {
    id: "rule_placeholder_orientation_01",
    name: "Geometric Orientation Alignment Placeholder Rule",
    category: "orientation",
    description: "Evaluates standard compass alignments without applying hardcoded traditional rules.",
    requiredSpatialRelationships: ["north_of", "south_of"],
    severity: "neutral",
    enabled: true
  },
  {
    id: "rule_placeholder_connectivity_01",
    name: "Topological Room Connectivity Placeholder Rule",
    category: "connectivity",
    description: "Checks threshold of entrance connectivity for engineering analysis.",
    requiredSpatialRelationships: ["connected_to", "door_connects"],
    severity: "neutral",
    enabled: true
  }
];
