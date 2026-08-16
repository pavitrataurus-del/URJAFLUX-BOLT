import { Detection, ValidationStatus, AuditTrail, SymbolType, OCRText } from './VisionTypes';
import { SpatialObjectRegistry } from '../spatial/SpatialObjectRegistry';
import { SpatialObject, Direction8Zone } from '../spatial/SpatialTypes';

export class HumanReviewWorkflow {
  private static instance: HumanReviewWorkflow;

  private constructor() {}

  public static getInstance(): HumanReviewWorkflow {
    if (!HumanReviewWorkflow.instance) {
      HumanReviewWorkflow.instance = new HumanReviewWorkflow();
    }
    return HumanReviewWorkflow.instance;
  }

  /**
   * Action: Accept Detection (Phase 8)
   */
  public acceptDetection(detection: Detection, reviewerId: string, notes?: string): Detection {
    const timestamp = new Date().toISOString();
    const updatedAudit: AuditTrail = {
      createdBy: detection.audit.createdBy,
      updatedBy: reviewerId,
      changeLog: [
        ...detection.audit.changeLog,
        `[${timestamp}] Human approved by ${reviewerId}.${notes ? ' Notes: ' + notes : ''}`
      ]
    };

    return {
      ...detection,
      validationStatus: 'APPROVED',
      reviewerId,
      reviewerNotes: notes || detection.reviewerNotes,
      version: detection.version + 1,
      audit: updatedAudit
    };
  }

  /**
   * Action: Reject Detection (Phase 8)
   */
  public rejectDetection(detection: Detection, reviewerId: string, notes?: string): Detection {
    const timestamp = new Date().toISOString();
    const updatedAudit: AuditTrail = {
      createdBy: detection.audit.createdBy,
      updatedBy: reviewerId,
      changeLog: [
        ...detection.audit.changeLog,
        `[${timestamp}] Human rejected by ${reviewerId}.${notes ? ' Notes: ' + notes : ''}`
      ]
    };

    return {
      ...detection,
      validationStatus: 'REJECTED',
      reviewerId,
      reviewerNotes: notes || detection.reviewerNotes,
      version: detection.version + 1,
      audit: updatedAudit
    };
  }

  /**
   * Action: Edit Detection (Phase 8)
   */
  public editDetection(
    detection: Detection,
    updates: Partial<Pick<Detection, 'label' | 'boundingBox' | 'symbolType'>>,
    reviewerId: string
  ): Detection {
    const timestamp = new Date().toISOString();
    const changeDesc: string[] = [];
    if (updates.symbolType) changeDesc.push(`type to ${updates.symbolType}`);
    if (updates.label) changeDesc.push(`label to "${updates.label}"`);
    if (updates.boundingBox) changeDesc.push(`bounding box geometry`);

    const updatedAudit: AuditTrail = {
      createdBy: detection.audit.createdBy,
      updatedBy: reviewerId,
      changeLog: [
        ...detection.audit.changeLog,
        `[${timestamp}] Manually edited ${changeDesc.join(', ')} by ${reviewerId}.`
      ]
    };

    return {
      ...detection,
      ...updates,
      validationStatus: 'MANUALLY_EDITED',
      reviewerId,
      manualOverride: true,
      version: detection.version + 1,
      audit: updatedAudit
    };
  }

  /**
   * Action: Merge two detections (Phase 8)
   */
  public mergeDetections(
    detA: Detection,
    detB: Detection,
    newLabel: string,
    newSymbolType: SymbolType,
    reviewerId: string
  ): Detection {
    const timestamp = new Date().toISOString();

    // Union bounding box
    const minX = Math.min(detA.boundingBox.x, detB.boundingBox.x);
    const minY = Math.min(detA.boundingBox.y, detB.boundingBox.y);
    const maxX = Math.max(detA.boundingBox.x + detA.boundingBox.width, detB.boundingBox.x + detB.boundingBox.width);
    const maxY = Math.max(detA.boundingBox.y + detA.boundingBox.height, detB.boundingBox.y + detB.boundingBox.height);

    const mergedBoundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    return {
      id: `DET-MERGED-${Date.now()}`,
      version: 1,
      assetId: detA.assetId,
      symbolType: newSymbolType,
      label: newLabel,
      boundingBox: mergedBoundingBox,
      confidence: {
        overallPercent: Math.max(detA.confidence.overallPercent, detB.confidence.overallPercent),
        classConfidence: Math.max(detA.confidence.classConfidence, detB.confidence.classConfidence),
        boxConfidence: Math.max(detA.confidence.boxConfidence, detB.confidence.boxConfidence),
        isHighConfidence: true
      },
      modelName: `${detA.modelName} + ${detB.modelName} (Merged)`,
      detectedAt: timestamp,
      validationStatus: 'APPROVED',
      reviewerId,
      reviewerNotes: `Merged detection of ${detA.id} (${detA.symbolType}) and ${detB.id} (${detB.symbolType})`,
      manualOverride: true,
      associatedOcrTextIds: [...detA.associatedOcrTextIds, ...detB.associatedOcrTextIds],
      metadata: { ...detA.metadata, ...detB.metadata, mergedFrom: [detA.id, detB.id] },
      audit: {
        createdBy: reviewerId,
        updatedBy: reviewerId,
        changeLog: [`[${timestamp}] Generated via human-initiated merge of ${detA.id} & ${detB.id}`]
      }
    };
  }

  /**
   * Transfer Approved Detections to DOMAIN-011 Spatial Geometry Engine (Phase 11)
   * This is a critical architectural requirement. Only APPROVED or MANUALLY_EDITED
   * detections get transferred, and they retain full links for auditability/traceability.
   */
  public transferApprovedToDomain11(
    detections: Detection[],
    ocrTexts: OCRText[],
    reviewerId: string
  ): { registeredObjects: SpatialObject[]; auditLog: string[] } {
    const timestamp = new Date().toISOString();
    const registeredObjects: SpatialObject[] = [];
    const auditLog: string[] = [];

    const registry = SpatialObjectRegistry.getInstance();

    detections.forEach((det) => {
      if (det.validationStatus !== 'APPROVED' && det.validationStatus !== 'MANUALLY_EDITED') {
        auditLog.push(`[${timestamp}] Skipped transfer for detection ${det.id}: status is ${det.validationStatus}`);
        return;
      }

      // Map SymbolType to DOMAIN-011 LayerType / SpatialObject Type
      let spatialType: 'ROOM' | 'WALL' | 'DOOR' | 'WINDOW' | 'COLUMN' | 'BEAM' | 'FURNITURE' | 'ANNOTATION' = 'ANNOTATION';
      let layerType: 'WALLS' | 'ROOMS' | 'DOORS' | 'WINDOWS' | 'STRUCTURAL' | 'FURNITURE' | 'ANNOTATIONS' = 'ANNOTATIONS';

      switch (det.symbolType) {
        case 'DOOR':
          spatialType = 'DOOR';
          layerType = 'DOORS';
          break;
        case 'WINDOW':
          spatialType = 'WINDOW';
          layerType = 'WINDOWS';
          break;
        case 'WALL_SEGMENT':
          spatialType = 'WALL';
          layerType = 'WALLS';
          break;
        case 'ROOM_LABEL':
          spatialType = 'ROOM';
          layerType = 'ROOMS';
          break;
        case 'COLUMN':
        case 'BEAM':
          spatialType = 'COLUMN';
          layerType = 'STRUCTURAL';
          break;
        case 'FURNITURE':
          spatialType = 'FURNITURE';
          layerType = 'FURNITURE';
          break;
        default:
          spatialType = 'ANNOTATION';
          layerType = 'ANNOTATIONS';
      }

      // Centroid coordinate from Bounding Box (assuming normalized 0..1 dimensions maps onto 100m grid)
      const centroidX = Math.round((det.boundingBox.x + det.boundingBox.width / 2) * 100 * 100) / 100;
      const centroidY = Math.round((det.boundingBox.y + det.boundingBox.height / 2) * 100 * 100) / 100;

      // Pull associated OCR texts
      const linkedOcrText = ocrTexts
        .filter((ocr) => det.associatedOcrTextIds.includes(ocr.id))
        .map((ocr) => ocr.text)
        .join(' / ');

      // Traceability constraints: Store link to originating image asset, detection ID, validation history
      const spatialObject: SpatialObject = {
        id: `SPATIAL-DET-${det.id}`,
        type: spatialType as any,
        entityId: det.id,
        name: det.label,
        layerType: layerType as any,
        coordinate: { x: centroidX, y: centroidY },
        cardinalDirection: 'BRAHMASTHAN', // default
        metadata: {
          originatingAssetId: det.assetId,
          sourceDetectionId: det.id,
          confidencePercent: det.confidence.overallPercent,
          ocrAssistedLabel: linkedOcrText || undefined,
          humanReviewer: reviewerId,
          transferredAt: timestamp,
          originalModel: det.modelName,
          manualOverrideApplied: det.manualOverride
        }
      };

      registeredObjects.push(spatialObject);
      auditLog.push(`[${timestamp}] Transferred approved detection ${det.id} as Spatial object ${spatialObject.id} into DOMAIN-011 Spatial Engine`);
    });

    return {
      registeredObjects,
      auditLog
    };
  }
}
