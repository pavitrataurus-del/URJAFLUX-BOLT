import { Detection, ImageAsset, SymbolType, ValidationStatus } from './VisionTypes';

export class SymbolRecognitionEngine {
  private static instance: SymbolRecognitionEngine;

  private constructor() {}

  public static getInstance(): SymbolRecognitionEngine {
    if (!SymbolRecognitionEngine.instance) {
      SymbolRecognitionEngine.instance = new SymbolRecognitionEngine();
    }
    return SymbolRecognitionEngine.instance;
  }

  /**
   * Detect architectural symbols and spatial features from image asset
   */
  public async detectSymbols(asset: ImageAsset): Promise<Detection[]> {
    const timestamp = new Date().toISOString();

    const mockDetections: Detection[] = [
      {
        id: 'DET-SYM-001',
        version: 1,
        assetId: asset.id,
        symbolType: 'DOOR',
        label: 'Main Entry Swing Door (1.2m)',
        boundingBox: { x: 0.46, y: 0.88, width: 0.08, height: 0.06 },
        polygonMask: {
          points: [
            { x: 0.46, y: 0.88 },
            { x: 0.54, y: 0.88 },
            { x: 0.54, y: 0.94 },
            { x: 0.46, y: 0.94 }
          ],
          isClosed: true
        },
        confidence: {
          overallPercent: 95.8,
          classConfidence: 97.2,
          boxConfidence: 94.4,
          isHighConfidence: true
        },
        modelName: 'UrjaVision-ArchSym-v3.2',
        detectedAt: timestamp,
        validationStatus: 'PENDING_REVIEW',
        manualOverride: false,
        associatedOcrTextIds: ['OCR-005'],
        metadata: { swingAngle: 90, frameMaterial: 'TEAK' },
        audit: {
          createdBy: 'UrjaVision-AI-Engine',
          updatedBy: 'UrjaVision-AI-Engine',
          changeLog: [`[${timestamp}] Symbol detected with 95.8% confidence`]
        }
      },
      {
        id: 'DET-SYM-002',
        version: 1,
        assetId: asset.id,
        symbolType: 'NORTH_ARROW',
        label: 'True North Compass Direction Pointer',
        boundingBox: { x: 0.88, y: 0.05, width: 0.08, height: 0.12 },
        polygonMask: {
          points: [
            { x: 0.92, y: 0.05 },
            { x: 0.96, y: 0.17 },
            { x: 0.88, y: 0.17 }
          ],
          isClosed: true
        },
        confidence: {
          overallPercent: 99.1,
          classConfidence: 99.5,
          boxConfidence: 98.7,
          isHighConfidence: true
        },
        modelName: 'UrjaVision-ArchSym-v3.2',
        detectedAt: timestamp,
        validationStatus: 'APPROVED',
        manualOverride: false,
        associatedOcrTextIds: [],
        metadata: { orientationDeg: 0, cardinalDir: 'N' },
        audit: {
          createdBy: 'UrjaVision-AI-Engine',
          updatedBy: 'Lead Inspector',
          changeLog: [`[${timestamp}] Symbol detected`, `[${timestamp}] Approved by Lead Inspector`]
        }
      },
      {
        id: 'DET-SYM-003',
        version: 1,
        assetId: asset.id,
        symbolType: 'WINDOW',
        label: 'East Bay Window (2.0m)',
        boundingBox: { x: 0.92, y: 0.25, width: 0.04, height: 0.15 },
        confidence: {
          overallPercent: 91.4,
          classConfidence: 92.0,
          boxConfidence: 90.8,
          isHighConfidence: true
        },
        modelName: 'UrjaVision-ArchSym-v3.2',
        detectedAt: timestamp,
        validationStatus: 'PENDING_REVIEW',
        manualOverride: false,
        associatedOcrTextIds: ['OCR-006'],
        metadata: { glassPanes: 3, doubleGlazed: true },
        audit: {
          createdBy: 'UrjaVision-AI-Engine',
          updatedBy: 'UrjaVision-AI-Engine',
          changeLog: [`[${timestamp}] Symbol detected with 91.4% confidence`]
        }
      },
      {
        id: 'DET-SYM-004',
        version: 1,
        assetId: asset.id,
        symbolType: 'WALL_SEGMENT',
        label: 'Outer Perimeter Masonry Wall Network',
        boundingBox: { x: 0.05, y: 0.05, width: 0.90, height: 0.85 },
        polygonMask: {
          points: [
            { x: 0.05, y: 0.05 },
            { x: 0.95, y: 0.05 },
            { x: 0.95, y: 0.90 },
            { x: 0.05, y: 0.90 }
          ],
          isClosed: true
        },
        confidence: {
          overallPercent: 88.5,
          classConfidence: 89.0,
          boxConfidence: 88.0,
          isHighConfidence: true
        },
        modelName: 'UrjaVision-SegNet-v2',
        detectedAt: timestamp,
        validationStatus: 'PENDING_REVIEW',
        manualOverride: false,
        associatedOcrTextIds: ['OCR-010'],
        metadata: { thicknessMm: 300, isLoadBearing: true },
        audit: {
          createdBy: 'UrjaVision-AI-Engine',
          updatedBy: 'UrjaVision-AI-Engine',
          changeLog: [`[${timestamp}] Wall network segment extracted`]
        }
      },
      {
        id: 'DET-SYM-005',
        version: 1,
        assetId: asset.id,
        symbolType: 'COLUMN',
        label: 'Reinforced Concrete Pillar C1',
        boundingBox: { x: 0.05, y: 0.05, width: 0.04, height: 0.04 },
        confidence: {
          overallPercent: 74.2, // LOW CONFIDENCE EXAMPLE FOR REVIEW TESTING
          classConfidence: 75.0,
          boxConfidence: 73.4,
          isHighConfidence: false
        },
        modelName: 'UrjaVision-ArchSym-v3.2',
        detectedAt: timestamp,
        validationStatus: 'PENDING_REVIEW',
        manualOverride: false,
        associatedOcrTextIds: ['OCR-009'],
        metadata: { columnSection: '400x400mm' },
        audit: {
          createdBy: 'UrjaVision-AI-Engine',
          updatedBy: 'UrjaVision-AI-Engine',
          changeLog: [`[${timestamp}] Low confidence symbol flagged for human review`]
        }
      }
    ];

    return mockDetections;
  }
}
