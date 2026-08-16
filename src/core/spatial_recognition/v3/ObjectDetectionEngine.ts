// ============================================================================
// URJAFLUX AI OS - SRE v3 STEP 5: OBJECT DETECTION ENGINE
// Detects architectural fixtures & furniture. Emits UNKNOWN_OBJECT for unconfident detections.
// ============================================================================

import { SreObjectTypeV3, ISreSpatialObjectV3 } from "../types/sre.v3.types";

export class ObjectDetectionEngine {
  private static instance: ObjectDetectionEngine;

  private constructor() {}

  public static getInstance(): ObjectDetectionEngine {
    if (!ObjectDetectionEngine.instance) {
      ObjectDetectionEngine.instance = new ObjectDetectionEngine();
    }
    return ObjectDetectionEngine.instance;
  }

  public validateAndEnrichObjects(rawObjects: any[]): ISreSpatialObjectV3[] {
    const validObjectTypes: Set<string> = new Set([
      'GAS_STOVE', 'KITCHEN_SINK', 'WC', 'WASH_BASIN', 'SHOWER', 'BED', 
      'SOFA', 'DINING_TABLE', 'TEMPLE', 'LOCKER', 'MIRROR', 'WATER_TANK', 
      'SEPTIC_TANK', 'BOREWELL', 'ELECTRICAL_PANEL', 'TRANSFORMER', 'LIFT', 
      'SOLAR_PANEL', 'HEAVY_STORAGE', 'UNKNOWN_OBJECT'
    ]);

    return rawObjects.map(obj => {
      const typeUpper = (obj.objectType || obj.type || '').toUpperCase();
      let finalType: SreObjectTypeV3 = 'UNKNOWN_OBJECT';

      if (validObjectTypes.has(typeUpper)) {
        finalType = typeUpper as SreObjectTypeV3;
      } else if (typeUpper.includes('STOVE')) {
        finalType = 'GAS_STOVE';
      } else if (typeUpper.includes('SINK')) {
        finalType = 'KITCHEN_SINK';
      } else if (typeUpper.includes('TOILET') || typeUpper.includes('WC')) {
        finalType = 'WC';
      } else if (typeUpper.includes('BASIN')) {
        finalType = 'WASH_BASIN';
      } else if (typeUpper.includes('SHOWER')) {
        finalType = 'SHOWER';
      } else if (typeUpper.includes('BED')) {
        finalType = 'BED';
      } else if (typeUpper.includes('SOFA')) {
        finalType = 'SOFA';
      } else if (typeUpper.includes('TABLE') || typeUpper.includes('DINING')) {
        finalType = 'DINING_TABLE';
      } else if (typeUpper.includes('TEMPLE') || typeUpper.includes('POOJA')) {
        finalType = 'TEMPLE';
      } else if (typeUpper.includes('TANK')) {
        finalType = 'WATER_TANK';
      } else if (typeUpper.includes('STAIR')) {
        finalType = 'HEAVY_STORAGE';
      } else {
        finalType = 'UNKNOWN_OBJECT';
      }

      const bbox = obj.boundingBox || {
        minX: obj.centerPoint.x - 0.5,
        minY: obj.centerPoint.y - 0.5,
        maxX: obj.centerPoint.x + 0.5,
        maxY: obj.centerPoint.y + 0.5
      };

      const polygon = [
        { x: bbox.minX, y: bbox.minY },
        { x: bbox.maxX, y: bbox.minY },
        { x: bbox.maxX, y: bbox.maxY },
        { x: bbox.minX, y: bbox.maxY }
      ];

      return {
        ...obj,
        objectType: finalType,
        polygon,
        boundingBox: bbox,
        confidence: obj.confidence || (finalType === 'UNKNOWN_OBJECT' ? 0.50 : 0.95)
      };
    });
  }
}

export const objectDetectionEngine = ObjectDetectionEngine.getInstance();
