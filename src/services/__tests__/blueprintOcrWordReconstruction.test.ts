import { describe, expect, it } from "vitest";
import {
  isCardinalDirectionMarker,
  isOcrFragmentGarbage,
} from "../../recognition/ocrLabelPolicy";
import {
  mergeHorizontalWords,
  filterBlueprintOcrLines,
  dedupeReconstructedLines,
} from "../blueprintOcrWordReconstruction";

describe("ocrLabelPolicy orientation markers", () => {
  it("filters cardinal directions — not room entities", () => {
    expect(isCardinalDirectionMarker("NORTH")).toBe(true);
    expect(isCardinalDirectionMarker("South")).toBe(true);
    expect(isCardinalDirectionMarker("KITCHEN")).toBe(false);
  });

  it("rejects OCR fragmentation garbage", () => {
    expect(isOcrFragmentGarbage("7S")).toBe(true);
    expect(isOcrFragmentGarbage("m]")).toBe(true);
    expect(isOcrFragmentGarbage("loo|")).toBe(true);
    expect(isOcrFragmentGarbage("MASTER BEDROOM")).toBe(false);
    expect(isOcrFragmentGarbage("WC")).toBe(false);
  });
});

describe("blueprintOcrWordReconstruction", () => {
  it("merges horizontally adjacent words into room labels", () => {
    const merged = mergeHorizontalWords([
      {
        text: "MASTER",
        confidence: 90,
        bbox: { x0: 10, y0: 20, x1: 60, y1: 40 },
      },
      {
        text: "BEDROOM",
        confidence: 88,
        bbox: { x0: 65, y0: 20, x1: 140, y1: 40 },
      },
    ]);
    expect(merged.some((l) => l.text === "MASTER BEDROOM")).toBe(true);
  });

  it("allows duplicate room names at different positions", () => {
    const deduped = dedupeReconstructedLines([
      {
        text: "BEDROOM",
        confidence: 90,
        bbox: { x0: 10, y0: 10, x1: 80, y1: 30 },
      },
      {
        text: "BEDROOM",
        confidence: 88,
        bbox: { x0: 200, y0: 300, x1: 270, y1: 320 },
      },
    ]);
    expect(deduped.length).toBe(2);
  });

  it("filters orientation markers and fragments from line list", () => {
    const filtered = filterBlueprintOcrLines([
      { text: "NORTH", confidence: 90, bbox: { x0: 0, y0: 0, x1: 40, y1: 20 } },
      { text: "KITCHEN", confidence: 90, bbox: { x0: 50, y0: 50, x1: 120, y1: 70 } },
      { text: "7S", confidence: 40, bbox: { x0: 10, y0: 10, x1: 20, y1: 20 } },
    ]);
    expect(filtered.map((l) => l.text)).toEqual(["KITCHEN"]);
  });
});
