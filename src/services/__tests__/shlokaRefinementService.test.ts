import { describe, expect, it } from "vitest";
import {
  inferBookTradition,
  isRefinableShlokaPassage,
  refinePassageToActionableRemedy,
} from "../shlokaRefinementService";

describe("Shloka refinement service", () => {
  it("infers VEDIC tradition from treatise titles", () => {
    expect(inferBookTradition({ title: "Mayamatam Vastu Shastra" })).toBe("VEDIC");
    expect(inferBookTradition({ title: "Modern Apartment Vastu Guide" })).toBe("MODERN");
  });

  it("refines kitchen + north-east shloka passage into actionable remedy", () => {
    const passage =
      "Atharvaveda 12.3 — kitchen in north-east is inauspicious; fire should not disturb Ishanya.";
    const pageText = "Chapter on agni placement and directional defects in residential houses.";

    expect(isRefinableShlokaPassage(passage, pageText)).toBe(true);

    const refined = refinePassageToActionableRemedy(passage, pageText, "VEDIC");
    expect(refined).not.toBeNull();
    expect(refined!.refinedFromShloka).toBe(true);
    expect(refined!.remedyEnglish.toLowerCase()).toContain("avoid kitchen");
    expect(refined!.remedyEnglish.toLowerCase()).toContain("south-east");
    expect(refined!.remedyHindi).toMatch(/[\u0900-\u097F]/);
  });

  it("refines staircase in north passage", () => {
    const passage = "Staircase in north direction is not recommended for residential vastu.";
    const refined = refinePassageToActionableRemedy(passage, passage, "VEDIC");
    expect(refined?.remedyEnglish.toLowerCase()).toMatch(/stair|north/);
  });

  it("skips pure worship prose without spatial vastu signals", () => {
    const passage =
      "It is said: Atharvaveda — the king should enjoy his beloved while praying to the two deities with hidden offerings of ghee.";
    expect(isRefinableShlokaPassage(passage, passage)).toBe(false);
    expect(refinePassageToActionableRemedy(passage, passage)).toBeNull();
  });

  it("skips LLM meta leak passages", () => {
    const passage = 'Formatting:** - The user requested "plain text only"';
    expect(refinePassageToActionableRemedy(passage, passage)).toBeNull();
  });
});
