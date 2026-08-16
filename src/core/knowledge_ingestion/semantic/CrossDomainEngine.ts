// ============================================================================
// CROSS DOMAIN ENGINE (PHASE 2B - LOCK 32)
// Cross-domain relationship mappings between Vastu, Lal Kitab, Numerology, Astrology, Building Codes
// ============================================================================

import { CrossDomainLink, TargetKnowledgeDomain } from "../../../types/semanticKnowledge";

export class CrossDomainEngine {
  /**
   * Generates cross-domain relationship links for directional zones and elements.
   */
  public static generateCrossDomainLinks(
    zoneOrElement: string,
    canonicalName: string
  ): CrossDomainLink[] {
    const links: CrossDomainLink[] = [];
    const norm = zoneOrElement.toUpperCase();

    // 1. South-East / Agneya / Fire Zone Links
    if (norm.includes("AGNEYA") || norm.includes("SOUTH_EAST") || norm.includes("FIRE")) {
      links.push({
        id: `LINK-X-${Date.now()}-1`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "LAL_KITAB",
        relationshipType: "PLANETARY_GOVERNANCE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "Venus (Shukra) & Mars (Mangal)",
        mappingRules: [
          "South-East zone governs kitchen hearth and martial/relationship energy in Lal Kitab.",
          "Disturbances in SE impair Shukra (Venus) leading to financial disputes or health issues."
        ]
      });

      links.push({
        id: `LINK-X-${Date.now()}-2`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "NUMEROLOGY",
        relationshipType: "NUMBER_VIBRATION",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "Number 9 (Mars) & Number 6 (Venus)",
        mappingRules: [
          "South-East resonates with Number 9 (Fire/Action) and Number 6 (Comfort/Luxury).",
          "Grid placement must harmonize active kitchen thermal output with Number 9 frequencies."
        ]
      });

      links.push({
        id: `LINK-X-${Date.now()}-3`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "BUILDING_STANDARDS",
        relationshipType: "ARCHITECTURAL_SAFETY_CODE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "NBC Part 4: Fire Safety & Electrical Service Layout",
        mappingRules: [
          "Kitchens placed in South-East must comply with National Building Code fire separation walls.",
          "Electrical heavy appliances require dedicated earthing and direct exhaust ducting."
        ]
      });
    }

    // 2. North-East / Ishanya / Water Zone Links
    if (norm.includes("ISHANYA") || norm.includes("NORTH_EAST") || norm.includes("WATER")) {
      links.push({
        id: `LINK-X-${Date.now()}-4`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "LAL_KITAB",
        relationshipType: "PLANETARY_GOVERNANCE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "Jupiter (Guru) & Ketu",
        mappingRules: [
          "North-East represents wisdom and higher consciousness governed by Jupiter in Lal Kitab.",
          "Toilets or heavy loads in NE obstruct Jupiter's grace, bringing spiritual or educational hurdles."
        ]
      });

      links.push({
        id: `LINK-X-${Date.now()}-5`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "NUMEROLOGY",
        relationshipType: "NUMBER_VIBRATION",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "Number 3 (Jupiter / Growth)",
        mappingRules: [
          "North-East energy grid vibrates with Number 3 (Expansion, Meditation, Higher Learning)."
        ]
      });

      links.push({
        id: `LINK-X-${Date.now()}-6`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "BUILDING_STANDARDS",
        relationshipType: "LIGHT_AND_VENTILATION_CODE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "NBC Part 8: Natural Lighting & Solar Orientation",
        mappingRules: [
          "North-East openings maximize beneficial morning ultraviolet solar radiation (Eishan solar arc)."
        ]
      });
    }

    // 3. Brahmasthan / Center Links
    if (norm.includes("BRAHMASTHAN") || norm.includes("CENTER")) {
      links.push({
        id: `LINK-X-${Date.now()}-7`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "LAL_KITAB",
        relationshipType: "PLANETARY_GOVERNANCE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "Sun (Surya) & Cosmic Core",
        mappingRules: [
          "Central void governs overall prana distribution across all planetary houses in Lal Kitab."
        ]
      });

      links.push({
        id: `LINK-X-${Date.now()}-8`,
        sourceDomain: "VASTU_SHASTRA",
        targetDomain: "BUILDING_STANDARDS",
        relationshipType: "STRUCTURAL_COURTYARD_CODE",
        sourceEntity: canonicalName,
        targetEntityOrConcept: "NBC Architectural Courtyard & Light Well Regulations",
        mappingRules: [
          "Central courtyard must remain unencumbered by structural columns to maintain natural ventilation chimneys."
        ]
      });
    }

    return links;
  }
}
