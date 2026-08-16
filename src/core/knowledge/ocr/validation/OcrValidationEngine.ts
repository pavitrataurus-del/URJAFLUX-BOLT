import { IOcrResult, IOcrPage } from "../models/OcrModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { OcrEventType, createOcrEvent } from "../events/OcrEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export interface IValidationOptions {
  minConfidence?: number;
  rejectEmptyPages?: boolean;
}

export class OcrValidationEngine {
  private static instance: OcrValidationEngine;

  private constructor() {}

  public static getInstance(): OcrValidationEngine {
    if (!OcrValidationEngine.instance) {
      OcrValidationEngine.instance = new OcrValidationEngine();
    }
    return OcrValidationEngine.instance;
  }

  public validate(result: IOcrResult, options: IValidationOptions = {}): boolean {
    const minConfidence = options.minConfidence || 0.5;

    if (!result.documentId || !result.pages) {
      throw new EnterpriseError("Invalid OCR result format", { category: ErrorCategory.VALIDATION });
    }

    if (result.overallConfidence < minConfidence) {
      EventBus.getInstance().publish(createOcrEvent(OcrEventType.LOW_CONFIDENCE_DETECTED, { 
        documentId: result.documentId, 
        confidence: result.overallConfidence 
      }));
    }

    for (const page of result.pages) {
      this.validatePage(page, result.documentId, options);
    }

    // Check for duplicate OCR results (simplified check based on ID)
    if (result.id && result.id === "DUPLICATE") {
        throw new EnterpriseError("Duplicate OCR result detected", { category: ErrorCategory.CONFLICT });
    }

    EventBus.getInstance().publish(createOcrEvent(OcrEventType.VALIDATION_COMPLETED, { documentId: result.documentId, valid: true }));
    return true;
  }

  private validatePage(page: IOcrPage, documentId: string, options: IValidationOptions): void {
    if (options.rejectEmptyPages && (!page.blocks || page.blocks.length === 0)) {
      throw new EnterpriseError(`Empty page detected on page ${page.pageNumber}`, { category: ErrorCategory.VALIDATION });
    }

    if (page.width <= 0 || page.height <= 0) {
      throw new EnterpriseError(`Invalid coordinates for page ${page.pageNumber}`, { category: ErrorCategory.VALIDATION });
    }
    
    // Check confidence at page level
    if (page.confidence < (options.minConfidence || 0.5)) {
      EventBus.getInstance().publish(createOcrEvent(OcrEventType.LOW_CONFIDENCE_DETECTED, { 
        documentId, 
        pageNumber: page.pageNumber,
        confidence: page.confidence 
      }));
    }
  }
}
