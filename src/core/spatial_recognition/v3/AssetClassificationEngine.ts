// ============================================================================
// URJAFLUX AI OS - SRE v3 STEP 1: ASSET CLASSIFICATION ENGINE
// Classifies blueprint input type & selects optimum processing strategy
// ============================================================================

import { 
  SreAssetType, 
  SreProcessingStrategy, 
  IAssetClassificationResult 
} from "../types/sre.v3.types";

export class AssetClassificationEngine {
  private static instance: AssetClassificationEngine;

  private constructor() {}

  public static getInstance(): AssetClassificationEngine {
    if (!AssetClassificationEngine.instance) {
      AssetClassificationEngine.instance = new AssetClassificationEngine();
    }
    return AssetClassificationEngine.instance;
  }

  public classifyAsset(
    assetId: string,
    fileFormat: string = "PNG",
    inputMeta?: {
      isCadVector?: boolean;
      isScanned?: boolean;
      isHandDrawn?: boolean;
      hasOverlayChakra?: boolean;
      isSatellite?: boolean;
    }
  ): IAssetClassificationResult {
    let assetType: SreAssetType = 'ARCHITECTURAL_BLUEPRINT';
    let confidence = 0.95;
    let strategy: SreProcessingStrategy = 'HIGH_RES_RASTER_VISION_PIPELINE';
    const detectedLayers: string[] = ['BLUEPRINT_LAYER'];

    const formatUpper = fileFormat.toUpperCase();

    if (inputMeta?.isCadVector || formatUpper === 'DWG' || formatUpper === 'DXF') {
      assetType = 'CAD_EXPORT';
      confidence = 0.99;
      strategy = 'CAD_VECTOR_PIPELINE';
      detectedLayers.push('VECTOR_GEOMETRY_LAYER', 'CAD_TEXT_LAYER');
    } else if (inputMeta?.isSatellite) {
      assetType = 'GOOGLE_EARTH';
      confidence = 0.92;
      strategy = 'SATELLITE_GEOSPATIAL_PIPELINE';
      detectedLayers.push('SATELLITE_RASTER_LAYER');
    } else if (inputMeta?.hasOverlayChakra) {
      assetType = 'BLUEPRINT_WITH_OVERLAY';
      confidence = 0.96;
      strategy = 'HIGH_RES_RASTER_VISION_PIPELINE';
      detectedLayers.push('OVERLAY_CHAKRA_LAYER');
    } else if (inputMeta?.isHandDrawn) {
      assetType = 'HAND_DRAWN_PLAN';
      confidence = 0.88;
      strategy = 'HAND_DRAWN_SKETCH_CONSTRAINED_PIPELINE';
    } else if (inputMeta?.isScanned) {
      assetType = 'SCANNED_BLUEPRINT';
      confidence = 0.91;
      strategy = 'HIGH_RES_RASTER_VISION_PIPELINE';
      detectedLayers.push('RASTER_DESKEW_LAYER');
    }

    return {
      assetType,
      confidence,
      processingStrategy: strategy,
      detectedLayers,
      fileFormat: formatUpper,
      hasOverlayChakra: Boolean(inputMeta?.hasOverlayChakra || assetType === 'BLUEPRINT_WITH_OVERLAY'),
      hasOcrText: true,
      hasScaleLegend: true
    };
  }
}

export const assetClassificationEngine = AssetClassificationEngine.getInstance();
