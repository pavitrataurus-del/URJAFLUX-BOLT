// ============================================================================
// URJAFLUX AI OS - BSUE v1.5 ENGINE 6: BLUEPRINT QUALITY ADVISOR
// Evaluates upload technical quality, geometry integrity, and OCR coverage
// Checks: North Missing, Scale Missing, OCR Weak, Low Resolution, Broken Walls,
// Open Polygons, Missing Labels, Unknown Objects
// ============================================================================

import { 
  IBlueprintQualityReport, 
  IQualityIssue 
} from "../types/bsue_v1_5.types";

import { ISemanticRoom } from "../types/bsue.types";
import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class BlueprintQualityAdvisor {
  private static instance: BlueprintQualityAdvisor;

  private constructor() {}

  public static getInstance(): BlueprintQualityAdvisor {
    if (!BlueprintQualityAdvisor.instance) {
      BlueprintQualityAdvisor.instance = new BlueprintQualityAdvisor();
    }
    return BlueprintQualityAdvisor.instance;
  }

  public evaluateBlueprintQuality(
    bmueModel: IBlueprintMathematicalModel,
    semanticRooms: ISemanticRoom[]
  ): IBlueprintQualityReport {
    const blockingIssues: IQualityIssue[] = [];
    const warnings: IQualityIssue[] = [];
    const recommendations: string[] = [];
    const uploadSuggestions: string[] = [];

    // Compute total footprint SqM
    const outerPoly = bmueModel.polygonGraph?.outerBoundaryPolygonId
      ? bmueModel.polygonGraph.polygons.find(p => p.polygonId === bmueModel.polygonGraph.outerBoundaryPolygonId)
      : undefined;
    const footprintSqM = outerPoly?.areaSqMeters || 
      bmueModel.roomGraph.rooms.reduce((sum, r) => sum + (r.polygonAreaSqMeters || 0), 0) || 150;

    let score = 100;

    // Check 1: North Direction Missing
    const northMissing = !bmueModel.windowGraph.windows.some(w => w.facingCardinalZone && w.facingCardinalZone !== 'UNKNOWN');
    if (northMissing) {
      score -= 10;
      warnings.push({
        code: 'QUAL_NORTH_MISSING',
        message: 'North compass symbol or window cardinal facing orientation vector was not detected in blueprint drawing.',
        severity: 'WARNING'
      });
      recommendations.push('Upload a blueprint with an explicit North compass rose for precise Vastu & solar gain analysis.');
    }

    // Check 2: Scale Key Missing
    const scaleMissing = bmueModel.blueprintHealth.geometryScore < 50;
    if (scaleMissing) {
      score -= 20;
      blockingIssues.push({
        code: 'QUAL_SCALE_MISSING',
        message: 'Scale key dimension or pixel-to-meter ratio is missing or uncalibrated.',
        severity: 'BLOCKING'
      });
      uploadSuggestions.push('Ensure blueprint includes a dimension scale bar (e.g. 1:100 or metric scale line).');
    }

    // Check 3: OCR Coverage Weak
    const unlabelledCount = semanticRooms.filter(r => !r.semanticLabel || r.semanticLabel.includes('UNCLASSIFIED') || r.semanticLabel.includes('UNKNOWN')).length;
    const ocrWeak = semanticRooms.length > 0 && (unlabelledCount / semanticRooms.length) > 0.40;
    if (ocrWeak) {
      score -= 15;
      warnings.push({
        code: 'QUAL_OCR_WEAK',
        message: `High proportion (${Math.round((unlabelledCount / semanticRooms.length) * 100)}%) of unlabelled room spaces detected.`,
        severity: 'WARNING'
      });
      recommendations.push('Ensure room text annotations (e.g., KITCHEN, BEDROOM) are clearly printed and legible.');
    }

    // Check 4: Low Resolution / Low Vertex Density
    const lowResolution = bmueModel.wallGraph.walls.length < 4 || footprintSqM <= 0;
    if (lowResolution) {
      score -= 25;
      blockingIssues.push({
        code: 'QUAL_LOW_RESOLUTION',
        message: 'Blueprint image resolution or vector density is too low for accurate structural extraction.',
        severity: 'BLOCKING'
      });
      uploadSuggestions.push('Re-upload high-resolution vector PDF or CAD DWG / high-DPI image (> 300 DPI).');
    }

    // Check 5: Broken Walls
    const openVertices = bmueModel.wallGraph.walls.filter(w => w.connectedVertexIds.length < 2);
    const brokenWalls = openVertices.length > 2;
    if (brokenWalls) {
      score -= 15;
      warnings.push({
        code: 'QUAL_BROKEN_WALLS',
        message: `Detected ${openVertices.length} unclosed wall vector segment(s) causing potential perimeter gaps.`,
        severity: 'WARNING'
      });
    }

    // Check 6: Open Polygons
    const openPolygons = semanticRooms.some(r => r.areaSqMeters <= 0.5);
    if (openPolygons) {
      score -= 10;
      warnings.push({
        code: 'QUAL_OPEN_POLYGONS',
        message: 'Degenerate or unclosed room polygons detected in mathematical model.',
        severity: 'WARNING'
      });
    }

    // Check 7: Missing Labels
    const missingLabels = semanticRooms.some(r => !r.semanticLabel);
    if (missingLabels) {
      score -= 5;
      warnings.push({
        code: 'QUAL_MISSING_LABELS',
        message: 'One or more room polygons lack OCR text annotations.',
        severity: 'WARNING'
      });
    }

    // Check 8: Unknown Objects
    const unknownObjs = bmueModel.containmentGraph.containments.filter(c => c.containmentConfidence < 0.50);
    const unknownObjects = unknownObjs.length > 0;
    if (unknownObjects) {
      score -= 5;
      warnings.push({
        code: 'QUAL_UNKNOWN_OBJECTS',
        message: `${unknownObjs.length} object(s) detected with low confidence or unclassified symbols.`,
        severity: 'WARNING'
      });
    }

    // Clamp score to 0 - 100 range
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    if (finalScore >= 80) {
      recommendations.push('Blueprint quality is excellent for high-precision Enterprise spatial cognition pipeline.');
    }

    return {
      qualityScore: finalScore,
      checksPerformed: {
        northMissing,
        scaleMissing,
        ocrWeak,
        lowResolution,
        brokenWalls,
        openPolygons,
        missingLabels,
        unknownObjects
      },
      blockingIssues,
      warnings,
      recommendations,
      uploadSuggestions
    };
  }
}

export const blueprintQualityAdvisor = BlueprintQualityAdvisor.getInstance();
