import { describe, expect, it } from "vitest";
import {
  classifyArchitecturalEntity,
  normalizeOcrEntity,
  preprocessOcrForMatch,
  buildOcrMatchVariants,
  isSpecificityUpgrade,
} from "../ocrEntityNormalizer";

describe("preprocessOcrForMatch", () => {
  it("strips punctuation and fixes digit confusion", () => {
    expect(preprocessOcrForMatch("INTRAN(")).toBe("intran");
    expect(preprocessOcrForMatch("WASHR00M")).toBe("washroom");
  });
});

describe("buildOcrMatchVariants", () => {
  it("generates character-confusion variants", () => {
    const variants = buildOcrMatchVariants("wind0w");
    expect(variants.some((v) => v.includes("window"))).toBe(true);
  });
});

describe("classifyArchitecturalEntity", () => {
  it("corrects common blueprint OCR mistakes with standardized types", () => {
    const cases: Array<{
      raw: string;
      expectedLabel: string;
      expectedCanonical: string;
      structural?: boolean;
    }> = [
      { raw: "UFF KITCHEN", expectedLabel: "KITCHEN", expectedCanonical: "KITCHEN" },
      { raw: "STI", expectedLabel: "STAIRS", expectedCanonical: "STAIRCASE", structural: true },
      { raw: "WINOOW", expectedLabel: "WINDOW", expectedCanonical: "WINDOW", structural: true },
      { raw: "INTRAN(", expectedLabel: "ENTRANCE", expectedCanonical: "MAIN_ENTRANCE", structural: true },
      { raw: "BEDROM", expectedLabel: "BEDROOM", expectedCanonical: "BEDROOM" },
      { raw: "WASHR00M", expectedLabel: "WASHROOM", expectedCanonical: "TOILET" },
      { raw: "MASTER BEDROM", expectedLabel: "MASTER BEDROOM", expectedCanonical: "BEDROOM" },
      { raw: "TEMPLE", expectedLabel: "TEMPLE", expectedCanonical: "POOJA" },
      { raw: "GARAGC", expectedLabel: "GARAGE", expectedCanonical: "STORE" },
    ];

    for (const { raw, expectedLabel, expectedCanonical, structural } of cases) {
      const result = classifyArchitecturalEntity(raw, 0.9);
      expect(result.isUnknown, `expected known label for ${raw}`).toBe(false);
      expect(result.normalizedLabel, `label mismatch for ${raw}`).toBe(expectedLabel);
      expect(result.canonicalType, `canonical mismatch for ${raw}`).toBe(expectedCanonical);
      expect(result.normalizationConfidence).toBeGreaterThanOrEqual(0.75);
      expect(result.rawOcrText).toBe(raw);
      if (structural) {
        expect(result.isStructural).toBe(true);
        expect(result.entityCategory).toBe("STRUCTURE");
      }
    }
  });

  it("preserves OCR confidence for validation", () => {
    const result = classifyArchitecturalEntity("BEDROM", 0.72);
    expect(result.ocrConfidence).toBe(0.72);
    expect(result.normalizedLabel).toBe("BEDROOM");
  });

  it("marks truly unrecognizable text as UNKNOWN ROOM", () => {
    const result = classifyArchitecturalEntity("XYZQ", 0.4);
    expect(result.isUnknown).toBe(true);
    expect(result.normalizedLabel).toBe("UNKNOWN ROOM");
    expect(result.canonicalType).toBe("UNKNOWN_ROOM");
  });

  it("accepts exact canonical labels without correction", () => {
    const result = classifyArchitecturalEntity("LIVING ROOM", 0.95);
    expect(result.isUnknown).toBe(false);
    expect(result.normalizedLabel).toBe("LIVING ROOM");
    expect(result.canonicalType).toBe("LIVING_ROOM");
    expect(result.normalizationConfidence).toBe(1);
  });

  it("normalizeOcrEntity remains compatible", () => {
    const result = normalizeOcrEntity("KITCHEN", 0.9);
    expect(result.canonicalType).toBe("KITCHEN");
    expect(result.ruleElementType).toBe("kitchen");
  });

  it("never upgrades KITCHEN to OPEN KITCHEN", () => {
    const result = classifyArchitecturalEntity("KITCHEN", 0.9);
    expect(result.normalizedLabel).toBe("KITCHEN");
    expect(result.normalizedLabel).not.toBe("OPEN KITCHEN");
  });

  it("blocks fuzzy upgrade to POWDER ROOM when OCR says CHANGING ROOM", () => {
    const result = classifyArchitecturalEntity("CHANGING ROOM", 0.9);
    expect(result.normalizedLabel).not.toBe("POWDER ROOM");
    expect(result.normalizedLabel).toBe("CHANGING ROOM");
  });

  it("normalizes compact OCR misreads for changing room and wash room", () => {
    expect(classifyArchitecturalEntity("CHANGINROOM", 0.75).normalizedLabel).toBe("CHANGING ROOM");
    expect(classifyArchitecturalEntity("WASH ROOM", 0.75).normalizedLabel).toBe("WASHROOM");
  });

  it("rejects low-confidence fuzzy normalization upgrades", () => {
    const result = classifyArchitecturalEntity("BEDROO", 0.5);
    expect(result.isUnknown).toBe(true);
  });

  it("isSpecificityUpgrade detects added label words", () => {
    expect(isSpecificityUpgrade("KITCHEN", "OPEN KITCHEN")).toBe(true);
    expect(isSpecificityUpgrade("WASHROOM", "POWDER ROOM")).toBe(true);
    expect(isSpecificityUpgrade("MASTER BEDROM", "MASTER BEDROOM")).toBe(false);
  });
});
