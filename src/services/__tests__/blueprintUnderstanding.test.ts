import { describe, expect, it } from "vitest";
import { detectOrientationMarkers } from "../blueprintOrientationDetector";
import { isCardinalDirectionMarker, isOcrFragmentGarbage, isValidBlueprintEntityLabel } from "../../recognition/ocrLabelPolicy";

describe("blueprintOrientationDetector", () => {
  it("detects NORTH on margin as orientation marker, not entity", () => {
    const result = detectOrientationMarkers(
      [
        {
          text: "NORTH",
          confidence: 92,
          bbox: { x0: 5, y0: 180, x1: 55, y1: 210 },
        },
        {
          text: "KITCHEN",
          confidence: 90,
          bbox: { x0: 200, y0: 200, x1: 280, y1: 220 },
        },
      ],
      1000,
      800
    );
    expect(result.markers.length).toBe(1);
    expect(result.markers[0].label).toBe("NORTH");
    expect(result.suggestedBlueprintRotationOffsetDeg).toBeDefined();
  });
});

describe("ocr fragment policy", () => {
  it("rejects segmentation fragments and report garbage labels", () => {
    expect(isOcrFragmentGarbage("7S")).toBe(true);
    expect(isOcrFragmentGarbage("m]")).toBe(true);
    expect(isOcrFragmentGarbage("H z 8 H")).toBe(true);
    expect(isValidBlueprintEntityLabel("H z 8 H")).toBe(false);
    expect(isValidBlueprintEntityLabel("L WOOUNIONVHD")).toBe(false);
    expect(isValidBlueprintEntityLabel("KITCHEN")).toBe(true);
    expect(isValidBlueprintEntityLabel("MASTER BEDROOM")).toBe(true);
    expect(isCardinalDirectionMarker("NORTH")).toBe(true);
    expect(isCardinalDirectionMarker("KITCHEN")).toBe(false);
  });
});
