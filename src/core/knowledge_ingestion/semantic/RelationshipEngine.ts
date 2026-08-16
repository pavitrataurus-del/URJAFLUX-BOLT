// ============================================================================
// RELATIONSHIP ENGINE (PHASE 2B)
// Identifies & preserves relationships between rooms, zones, elements, planets, numbers, remedies
// ============================================================================

import { SemanticRelationship, KnowledgeProvenance, SourceCitation } from "../../../types/semanticKnowledge";
import { SynonymEngine } from "./SynonymEngine";

export class RelationshipEngine {
  /**
   * Generates semantic relationships from extracted concepts and rule text.
   */
  public static extractRelationshipsFromText(
    text: string,
    provenance: KnowledgeProvenance,
    citation: SourceCitation
  ): SemanticRelationship[] {
    const relationships: SemanticRelationship[] = [];
    const lower = text.toLowerCase();

    // 1. Kitchen <-> Fire Element <-> SE Zone <-> Cooking
    if (lower.includes("kitchen") || lower.includes("pakashala") || lower.includes("cooking")) {
      const canonicalRoom = SynonymEngine.resolveCanonicalName("Kitchen");
      const canonicalSE = SynonymEngine.resolveCanonicalName("South-East");

      relationships.push({
        id: `REL-${Date.now()}-1`,
        subjectId: canonicalRoom,
        subjectName: "Kitchen",
        relation: "associated_with",
        objectId: "ELEMENT_FIRE",
        objectName: "Fire Element (Agni Tattva)",
        domain: "VASTU_SHASTRA",
        provenance,
        citation
      });

      relationships.push({
        id: `REL-${Date.now()}-2`,
        subjectId: canonicalRoom,
        subjectName: "Kitchen",
        relation: "supports",
        objectId: canonicalSE,
        objectName: "South-East Zone (Agneya)",
        domain: "VASTU_SHASTRA",
        provenance,
        citation
      });

      if (lower.includes("north-east") || lower.includes("ishan")) {
        relationships.push({
          id: `REL-${Date.now()}-3`,
          subjectId: canonicalRoom,
          subjectName: "Kitchen",
          relation: "conflicts_with",
          objectId: "ISHANYA_NORTH_EAST",
          objectName: "North-East Zone (Ishanya)",
          domain: "VASTU_SHASTRA",
          provenance,
          citation
        });
      }
    }

    // 2. Toilet <-> Sanitation <-> NE Conflict
    if (lower.includes("toilet") || lower.includes("washroom") || lower.includes("sanitation")) {
      const canonicalToilet = SynonymEngine.resolveCanonicalName("Toilet");

      if (lower.includes("north-east") || lower.includes("ishanya")) {
        relationships.push({
          id: `REL-${Date.now()}-4`,
          subjectId: canonicalToilet,
          subjectName: "Toilet",
          relation: "conflicts_with",
          objectId: "ISHANYA_NORTH_EAST",
          objectName: "North-East Water Zone",
          domain: "VASTU_SHASTRA",
          provenance,
          citation
        });

        if (lower.includes("pyramid") || lower.includes("copper") || lower.includes("remedy")) {
          relationships.push({
            id: `REL-${Date.now()}-5`,
            subjectId: "TOILET_NE_DEFECT",
            subjectName: "Toilet in North-East Defect",
            relation: "remedied_by",
            objectId: "REMEDY_COPPER_PYRAMID",
            objectName: "Copper Helix & Elemental Pyramid Neutralizer",
            domain: "VASTU_SHASTRA",
            provenance,
            citation
          });
        }
      }
    }

    // 3. Main Entrance <-> Directional Gates
    if (lower.includes("entrance") || lower.includes("simhadwara") || lower.includes("main door")) {
      const canonicalEntry = SynonymEngine.resolveCanonicalName("Entrance");

      relationships.push({
        id: `REL-${Date.now()}-6`,
        subjectId: canonicalEntry,
        subjectName: "Main Entrance",
        relation: "governed_by",
        objectId: "ENERGY_GRID_PADA",
        objectName: "Auspicious Gate Pada Coordinates",
        domain: "VASTU_SHASTRA",
        provenance,
        citation
      });
    }

    return relationships;
  }
}
