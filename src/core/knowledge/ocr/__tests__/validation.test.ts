import { describe, it, expect } from "vitest";
import { OcrValidationEngine, IOcrResult } from "../index";

describe("OCR Validation Engine", () => {
  it("should validate successfully with valid data", () => {
    const validator = OcrValidationEngine.getInstance();
    const result: IOcrResult = {
      id: "res_1",
      documentId: "doc_1",
      overallConfidence: 0.9,
      fullText: "text",
      providerMetadata: {},
      pages: [{
        id: "p1",
        pageNumber: 1,
        width: 100,
        height: 100,
        confidence: 0.9,
        blocks: [{
          id: "b1",
          blockType: "TEXT",
          confidence: 0.9,
          boundingBox: { vertices: [] },
          paragraphs: []
        }]
      }]
    };

    expect(validator.validate(result)).toBe(true);
  });

  it("should fail if page is empty and rejectEmptyPages is true", () => {
    const validator = OcrValidationEngine.getInstance();
    const result: IOcrResult = {
      id: "res_2",
      documentId: "doc_2",
      overallConfidence: 0.9,
      fullText: "",
      providerMetadata: {},
      pages: [{
        id: "p1",
        pageNumber: 1,
        width: 100,
        height: 100,
        confidence: 0.9,
        blocks: []
      }]
    };

    expect(() => validator.validate(result, { rejectEmptyPages: true })).toThrow("Empty page detected");
  });

  it("should fail if duplicate id", () => {
    const validator = OcrValidationEngine.getInstance();
    const result: IOcrResult = {
      id: "DUPLICATE",
      documentId: "doc_2",
      overallConfidence: 0.9,
      fullText: "",
      providerMetadata: {},
      pages: [{
        id: "p1",
        pageNumber: 1,
        width: 100,
        height: 100,
        confidence: 0.9,
        blocks: []
      }]
    };

    expect(() => validator.validate(result)).toThrow("Duplicate OCR result detected");
  });
});
