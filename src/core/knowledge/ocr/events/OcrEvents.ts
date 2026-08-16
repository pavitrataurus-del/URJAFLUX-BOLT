import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum OcrEventType {
  OCR_STARTED = "OCR_STARTED",
  OCR_PROGRESS = "OCR_PROGRESS",
  OCR_COMPLETED = "OCR_COMPLETED",
  OCR_FAILED = "OCR_FAILED",
  PAGE_PROCESSED = "PAGE_PROCESSED",
  TEXT_EXTRACTED = "TEXT_EXTRACTED",
  LOW_CONFIDENCE_DETECTED = "LOW_CONFIDENCE_DETECTED",
  VALIDATION_COMPLETED = "VALIDATION_COMPLETED"
}

export const createOcrEvent = <T>(type: OcrEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
