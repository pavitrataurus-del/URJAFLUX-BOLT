// ============================================================================
// URJAFLUX AI OS - PRODUCT PREPARATION ENGINE (IIE)
// Prepares Structured Product Input Data for Downstream E-Commerce / Marketplace
// ============================================================================

import { 
  IBestRemedyCandidate, 
  IProductPreparationPackage, 
  IProductPreparationItem 
} from "../types/iie.types";

export class ProductPreparationEngine {

  /**
   * Prepares structured product input list for selected best remedies
   */
  public prepareProducts(
    selectedRemedies: IBestRemedyCandidate[]
  ): IProductPreparationPackage {
    const items: IProductPreparationItem[] = [];

    let prodIndex = 1;

    selectedRemedies.forEach(rem => {
      const text = rem.primaryRemedyText.toLowerCase();

      let requiredCategory = "Vastu Remedial Hardware";
      let optionalCategory = "Aesthetic Accents";
      let materials: string[] = [];
      let installationType = "Surface Placement / Adhesive Installation";
      let tags: string[] = [rem.targetDomain.toLowerCase(), rem.targetZoneOrDirection.toLowerCase()];

      if (text.includes("copper")) {
        requiredCategory = "Elemental Metal Strips";
        optionalCategory = "Pure Copper Pyramids";
        materials = ["Pure Copper 99.9%", "Adhesive Compound"];
        installationType = "Floor Seam Sealing / Under-Tile Inlay";
        tags.push("copper", "strip", "vastu_element_fire_air");
      } else if (text.includes("brass")) {
        requiredCategory = "Elemental Metal Strips";
        optionalCategory = "Brass Helix Set";
        materials = ["High-Grade Brass alloy", "Sealing Tape"];
        installationType = "Floor Seam Sealing";
        tags.push("brass", "strip", "vastu_element_earth");
      } else if (text.includes("marble") || text.includes("stone")) {
        requiredCategory = "Natural Stone Slabs";
        optionalCategory = "Carved Marble Plaque";
        materials = ["Natural Green/White Marble"];
        installationType = "Threshold Placement";
        tags.push("marble", "stone", "threshold");
      } else if (text.includes("pyramid") || text.includes("helix")) {
        requiredCategory = "Energy Magnifiers & Pyramids";
        optionalCategory = "Lead/Zinc Pyramid Array";
        materials = ["Cast Metal / Crystal Resin"];
        installationType = "Wall Concealed / Ceiling Mounting";
        tags.push("pyramid", "energy_enhancer");
      } else {
        requiredCategory = "General Remedial Accessories";
        optionalCategory = "Symbolic Yantras";
        materials = ["Mixed Organic / Metallic"];
        installationType = "Surface Placement";
        tags.push("remedial_accent");
      }

      items.push({
        productId: `PROD-PREP-${prodIndex++}`,
        associatedRemedyId: rem.remedyId,
        requiredProductCategory: requiredCategory,
        optionalProductCategory: optionalCategory,
        materialList: materials,
        recommendedQuantity: "1 Unit / Standard Strip Length",
        installationType,
        marketplaceTags: tags,
        affiliateCompatibility: true,
        internalProductCompatibility: true,
        specifications: {
          domain: rem.targetDomain,
          zone: rem.targetZoneOrDirection,
          primaryMaterial: materials[0] || "Standard Material"
        }
      });
    });

    const totalRequiredProducts = items.filter(i => i.requiredProductCategory !== "").length;
    const totalOptionalProducts = items.filter(i => i.optionalProductCategory !== "").length;

    return {
      items,
      totalRequiredProducts,
      totalOptionalProducts
    };
  }
}
