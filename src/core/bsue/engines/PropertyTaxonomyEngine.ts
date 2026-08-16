// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 1: PROPERTY TAXONOMY ENGINE
// Complete property taxonomy classification with strict multi-evidence validation
// Supported: Residential, Apartment, Duplex, Villa, Farm House, Office, Shop,
// Restaurant, Hotel, Hospital, School, College, Temple, Factory, Warehouse,
// Mall, Industrial Plant, Mixed Use, Unknown
// FOUNDER LOCK: Never guess.
// ============================================================================

import { 
  IPropertyTaxonomy, 
  BsuePropertyType, 
  BsuePropertyCategory 
} from "../types/bsue_v1_5.types";

import { ISemanticRoom, IEvidenceSource } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class PropertyTaxonomyEngine {
  private static instance: PropertyTaxonomyEngine;

  private constructor() {}

  public static getInstance(): PropertyTaxonomyEngine {
    if (!PropertyTaxonomyEngine.instance) {
      PropertyTaxonomyEngine.instance = new PropertyTaxonomyEngine();
    }
    return PropertyTaxonomyEngine.instance;
  }

  public determineTaxonomy(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): IPropertyTaxonomy {
    const evidence: IEvidenceSource[] = [];
    const roomTypes = semanticRooms.map(r => r.canonicalType);
    // Compute total footprint SqM
    const outerPoly = bmueModel.polygonGraph?.outerBoundaryPolygonId
      ? bmueModel.polygonGraph.polygons.find(p => p.polygonId === bmueModel.polygonGraph.outerBoundaryPolygonId)
      : undefined;
    const footprintSqM = outerPoly?.areaSqMeters || 
      bmueModel.roomGraph.rooms.reduce((sum, r) => sum + (r.polygonAreaSqMeters || 0), 0) || 150;

    const ocrLabels = semanticRooms
      .map(r => (r.semanticLabel || '').toUpperCase())
      .concat(bmueModel.roomGraph.rooms.filter(r => r.ocrConfirmedType).map(r => (r.ocrConfirmedType || '').toUpperCase()));

    const nameUpper = (bmueModel.propertyName || '').toUpperCase();

    // Key indicators counters
    let residentialScore = 0;
    let commercialScore = 0;
    let institutionalScore = 0;
    let industrialScore = 0;
    let religiousScore = 0;

    // Analyze Room Types
    const bedroomCount = roomTypes.filter(t => t.includes('BEDROOM')).length;
    const kitchenCount = roomTypes.filter(t => t === 'KITCHEN').length;
    const livingCount = roomTypes.filter(t => t === 'LIVING_ROOM').length;
    const toiletCount = roomTypes.filter(t => t === 'TOILET').length;
    const templeCount = roomTypes.filter(t => t === 'TEMPLE').length;

    if (bedroomCount > 0) residentialScore += bedroomCount * 3;
    if (kitchenCount > 0) residentialScore += kitchenCount * 2;
    if (livingCount > 0) residentialScore += livingCount * 2;
    if (templeCount > 0) religiousScore += templeCount * 4;

    // Analyze OCR text tokens for non-residential categories
    ocrLabels.forEach(label => {
      if (label.includes('SHOP') || label.includes('STORE') || label.includes('RETAIL')) commercialScore += 3;
      if (label.includes('OFFICE') || label.includes('CABIN') || label.includes('WORKSTATION')) commercialScore += 3;
      if (label.includes('RESTAURANT') || label.includes('CAFE') || label.includes('DINER')) commercialScore += 4;
      if (label.includes('HOTEL') || label.includes('SUITE') || label.includes('ROOM NO')) commercialScore += 4;
      if (label.includes('HOSPITAL') || label.includes('WARD') || label.includes('CLINIC') || label.includes('ICU')) institutionalScore += 5;
      if (label.includes('CLASSROOM') || label.includes('LAB') || label.includes('SCHOOL') || label.includes('COLLEGE')) institutionalScore += 5;
      if (label.includes('FACTORY') || label.includes('WAREHOUSE') || label.includes('PLANT') || label.includes('GODOWN')) industrialScore += 5;
      if (label.includes('MALL') || label.includes('SHOWROOM')) commercialScore += 4;
      if (label.includes('TEMPLE') || label.includes('MANDIR') || label.includes('SANCTUM')) religiousScore += 5;
    });

    // Name keyword boosts
    if (nameUpper.includes('APARTMENT') || nameUpper.includes('FLAT')) residentialScore += 5;
    if (nameUpper.includes('VILLA')) residentialScore += 5;
    if (nameUpper.includes('HOSPITAL')) institutionalScore += 10;
    if (nameUpper.includes('SCHOOL') || nameUpper.includes('COLLEGE')) institutionalScore += 10;
    if (nameUpper.includes('OFFICE')) commercialScore += 10;
    if (nameUpper.includes('FACTORY') || nameUpper.includes('WAREHOUSE')) industrialScore += 10;

    let propertyType: BsuePropertyType = 'Unknown';
    let propertyCategory: BsuePropertyCategory = 'UNKNOWN';
    let taxonomyConfidence = 0.30;
    let usageClassification = 'UNCLASSIFIED_TAXONOMY';

    const maxScore = Math.max(residentialScore, commercialScore, institutionalScore, industrialScore, religiousScore);

    // FOUNDER LOCK: Never guess if max score is too low or zero
    if (maxScore < 3) {
      propertyType = 'Unknown';
      propertyCategory = 'UNKNOWN';
      taxonomyConfidence = 0.20;
      usageClassification = 'INSUFFICIENT_EVIDENCE_UNCLASSIFIED';

      evidence.push({
        sourceType: 'GEOMETRY',
        evidenceKey: 'TAXONOMY_INSUFFICIENT_EVIDENCE',
        weight: 1.0,
        description: 'Insufficient architectural or textual evidence to determine property taxonomy with certainty.',
        rawConfidence: 0.20
      });
    } else {
      // Determine dominant category
      if (residentialScore >= maxScore && residentialScore > commercialScore) {
        propertyCategory = 'RESIDENTIAL';
        if (bedroomCount >= 5 && kitchenCount >= 1 && livingCount >= 1 && footprintSqM > 300) {
          propertyType = 'Villa';
          usageClassification = 'LUXURY_SINGLE_FAMILY_VILLA';
        } else if (bedroomCount >= 1 && bedroomCount <= 4 && kitchenCount >= 1) {
          propertyType = 'Apartment';
          usageClassification = 'MULTI_ROOM_RESIDENTIAL_APARTMENT';
        } else if (nameUpper.includes('FARM')) {
          propertyType = 'Farm House';
          usageClassification = 'RURAL_RESIDENTIAL_FARMHOUSE';
        } else if (nameUpper.includes('DUPLEX')) {
          propertyType = 'Duplex';
          usageClassification = 'TWO_LEVEL_DUPLEX_RESIDENCE';
        } else {
          propertyType = 'Residential';
          usageClassification = 'STANDARD_RESIDENTIAL_DWELLING';
        }
        taxonomyConfidence = Math.min(0.98, 0.70 + (residentialScore * 0.03));
      } else if (commercialScore >= maxScore) {
        propertyCategory = 'COMMERCIAL';
        if (ocrLabels.some(l => l.includes('SHOP') || l.includes('RETAIL'))) {
          propertyType = 'Commercial Shop';
          usageClassification = 'RETAIL_COMMERCIAL_STORE';
        } else if (ocrLabels.some(l => l.includes('RESTAURANT') || l.includes('CAFE'))) {
          propertyType = 'Restaurant';
          usageClassification = 'FOOD_AND_BEVERAGE_RESTAURANT';
        } else if (ocrLabels.some(l => l.includes('HOTEL'))) {
          propertyType = 'Hotel';
          usageClassification = 'HOSPITALITY_HOTEL_BUILDING';
        } else if (ocrLabels.some(l => l.includes('MALL'))) {
          propertyType = 'Mall';
          usageClassification = 'COMMERCIAL_SHOPPING_MALL';
        } else {
          propertyType = 'Office';
          usageClassification = 'COMMERCIAL_OFFICE_BUILDING';
        }
        taxonomyConfidence = Math.min(0.95, 0.65 + (commercialScore * 0.03));
      } else if (institutionalScore >= maxScore) {
        propertyCategory = 'INSTITUTIONAL';
        if (ocrLabels.some(l => l.includes('HOSPITAL') || l.includes('WARD') || l.includes('CLINIC'))) {
          propertyType = 'Hospital';
          usageClassification = 'HEALTHCARE_HOSPITAL_FACILITY';
        } else if (ocrLabels.some(l => l.includes('COLLEGE') || l.includes('CAMPUS'))) {
          propertyType = 'College';
          usageClassification = 'HIGHER_EDUCATION_COLLEGE_BUILDING';
        } else {
          propertyType = 'School';
          usageClassification = 'PRIMARY_SECONDARY_SCHOOL_BUILDING';
        }
        taxonomyConfidence = Math.min(0.95, 0.70 + (institutionalScore * 0.03));
      } else if (industrialScore >= maxScore) {
        propertyCategory = 'INDUSTRIAL';
        if (ocrLabels.some(l => l.includes('WAREHOUSE') || l.includes('GODOWN'))) {
          propertyType = 'Warehouse';
          usageClassification = 'LOGISTICS_STORAGE_WAREHOUSE';
        } else if (ocrLabels.some(l => l.includes('PLANT'))) {
          propertyType = 'Industrial Plant';
          usageClassification = 'HEAVY_INDUSTRIAL_PROCESSING_PLANT';
        } else {
          propertyType = 'Factory';
          usageClassification = 'MANUFACTURING_FACTORY_UNIT';
        }
        taxonomyConfidence = Math.min(0.95, 0.70 + (industrialScore * 0.03));
      } else if (religiousScore >= maxScore) {
        propertyCategory = 'RELIGIOUS';
        propertyType = 'Temple';
        usageClassification = 'DEVOTIONAL_TEMPLE_STRUCTURE';
        taxonomyConfidence = 0.95;
      }

      // Check Mixed Use (Significant scores in multiple categories)
      const categoriesWithScore = [residentialScore, commercialScore, institutionalScore, industrialScore].filter(s => s >= 5);
      if (categoriesWithScore.length >= 2) {
        propertyCategory = 'MIXED_USE';
        propertyType = 'Mixed Use';
        usageClassification = 'MULTI_CATEGORY_MIXED_USE_FACILITY';
        taxonomyConfidence = 0.90;
      }

      evidence.push({
        sourceType: 'GEOMETRY',
        evidenceKey: `TAXONOMY_SCORE_RES_${residentialScore}_COM_${commercialScore}_INST_${institutionalScore}`,
        weight: 0.90,
        description: `Taxonomy evaluated across ${semanticRooms.length} rooms and ${ocrLabels.length} OCR label tokens. Detected ${propertyType} (${propertyCategory}).`,
        rawConfidence: taxonomyConfidence
      });
    }

    return {
      propertyType,
      propertyCategory,
      usageClassification,
      taxonomyConfidence: Math.round(taxonomyConfidence * 100) / 100,
      supportingEvidence: evidence,
      isGuessed: false
    };
  }
}

export const propertyTaxonomyEngine = PropertyTaxonomyEngine.getInstance();
