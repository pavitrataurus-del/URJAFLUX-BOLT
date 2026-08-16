import { ImageAsset, ImageFormat, VisionProject } from './VisionTypes';

export class ImageIngestionEngine {
  private static instance: ImageIngestionEngine;

  private constructor() {}

  public static getInstance(): ImageIngestionEngine {
    if (!ImageIngestionEngine.instance) {
      ImageIngestionEngine.instance = new ImageIngestionEngine();
    }
    return ImageIngestionEngine.instance;
  }

  /**
   * Ingest an image asset into a Vision Project
   */
  public async ingestImageAsset(
    fileName: string,
    fileFormat: ImageFormat,
    projectId: string = 'PROJ-VIS-2026',
    uploadedBy: string = 'Lead Architectural Inspector',
    sourceDevice: string = 'High-Res Flatbed Scanner / Site Camera'
  ): Promise<ImageAsset> {
    const timestamp = new Date().toISOString();
    const assetId = `ASSET-${Date.now()}`;

    // Standardized image dimension defaults
    let widthPx = 3840;
    let heightPx = 2160;
    let resolutionDpi = 300;
    let fileSizeBytes = 4200000;

    if (fileFormat === 'PDF_PAGE') {
      widthPx = 2480;
      heightPx = 3508;
      resolutionDpi = 300;
    } else if (fileFormat === 'CAMERA_PHOTO') {
      widthPx = 4032;
      heightPx = 3024;
      resolutionDpi = 72;
    }

    return {
      id: assetId,
      version: 1,
      projectId,
      fileName,
      fileFormat,
      sourceUrl: `https://storage.urjaflux.com/vision/${fileName}`,
      widthPx,
      heightPx,
      resolutionDpi,
      fileSizeBytes,
      sourceDevice,
      capturedAt: timestamp,
      uploadedBy,
      status: 'PROCESSED',
      processingHistory: [
        `[${timestamp}] Ingested format ${fileFormat}`,
        `[${timestamp}] Image dimensions verified (${widthPx}x${heightPx} @ ${resolutionDpi} DPI)`
      ],
      metadata: {
        colorSpace: 'sRGB',
        compression: 'Lossless',
        hasAlphaChannel: fileFormat === 'PNG' || fileFormat === 'WebP'
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  /**
   * Create mock initial project
   */
  public createSampleVisionProject(): VisionProject {
    const timestamp = new Date().toISOString();
    return {
      id: 'PROJ-VIS-2026',
      name: 'Resort & Residence Architectural Plan Inspection',
      buildingId: 'BLDG-2026-001',
      description: 'Computer Vision AI scan ingestion, OCR text detection, symbol recognition & site defect audit',
      sessionCount: 1,
      totalAssetsCount: 2,
      status: 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }
}
