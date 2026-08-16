import { describe, expect, it } from "vitest";
import {
  buildObjectMatchTerms,
  buildZoneMatchTerms,
  collectMultilingualTerms,
} from "../../core/knowledge_ingestion/semantic/MultilingualVastuTermResolver";

describe("MultilingualVastuTermResolver", () => {
  it("expands bedroom entity through SynonymEngine including Devanagari", () => {
    const terms = buildObjectMatchTerms({
      objectType: "bedroom",
      canonicalType: "BEDROOM",
      entityDisplayName: "Master Bedroom",
      pdfTopic: "bedroom",
    });

    expect(terms.some((t) => /bedroom|शयन|sayana|master/i.test(t))).toBe(true);
  });

  it("expands south zone through multilingual seeds", () => {
    const terms = buildZoneMatchTerms("S", "South (S)");

    expect(terms.some((t) => /south|dakshin|दक्षिण|yama/i.test(t))).toBe(true);
  });

  it("preserves Devanagari tokens from raw OCR labels", () => {
    const terms = collectMultilingualTerms("दक्षिण दिशा शयन");
    expect(terms).toContain("दक्षिण");
    expect(terms).toContain("दिशा");
    expect(terms).toContain("शयन");
  });
});
