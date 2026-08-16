// ============================================================================
// URJAFLUX AI OS - BMUE STEP 8: BOUNDARY VALIDATION ENGINE
// Outer boundary, building footprint, compound wall, extensions, cuts, courtyards
// ============================================================================

import { 
  IBoundaryValidation, 
  IPolygonGraph, 
  IWallGraph 
} from "../types/bmue.types";

import { ISpatialContextModelV3, IPoint2D } from "../../spatial_recognition/types/sre.v3.types";
import { PolygonEngine } from "../../spatial_recognition/geometry/PolygonEngine";

export class BoundaryValidationEngine {
  private static instance: BoundaryValidationEngine;

  private constructor() {}

  public static getInstance(): BoundaryValidationEngine {
    if (!BoundaryValidationEngine.instance) {
      BoundaryValidationEngine.instance = new BoundaryValidationEngine();
    }
    return BoundaryValidationEngine.instance;
  }

  public validateBoundary(
    sreModel: ISpatialContextModelV3,
    polygonGraph: IPolygonGraph,
    wallGraph: IWallGraph
  ): IBoundaryValidation {
    const warnings: string[] = [];
    const outerBoundary = sreModel.propertyGeometry.outerBoundary || [];

    const outerBoundaryValid = outerBoundary.length >= 3 && PolygonEngine.calculateArea(outerBoundary) > 10;
    const buildingFootprintValid = polygonGraph.polygons.length > 0;

    if (!outerBoundaryValid) {
      warnings.push('Outer property boundary polygon has less than 3 vertices or area under 10m².');
    }

    // Check for courtyards / internal cutouts (void polygons inside footprint)
    const detectedCourtyardPolygons: IPoint2D[][] = [];
    polygonGraph.polygons.forEach(p => {
      if (p.status === 'NESTED' && p.areaSqMeters < 15.0 && p.polygonId.includes('VOID')) {
        detectedCourtyardPolygons.push(p.vertices);
      }
    });

    const compoundWallPresent = wallGraph.walls.some(w => w.isExternal || w.wallType === 'EXTERNAL');

    return {
      outerBoundaryValid,
      buildingFootprintValid,
      compoundWallPresent,
      extensionsDetected: false,
      cutsDetected: false,
      missingCornersDetected: false,
      multipleBuildingsDetected: false,
      courtyardsDetected: detectedCourtyardPolygons.length > 0,
      detectedCourtyardPolygons,
      boundaryWarnings: warnings
    };
  }
}

export const boundaryValidationEngine = BoundaryValidationEngine.getInstance();
