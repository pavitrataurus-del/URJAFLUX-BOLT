import { describe, expect, it } from "vitest";
import type { VaultDocument } from "../knowledgeVaultService";
import {
  alphaRatio,
  extractApprovedRulesFromDocument,
  isMeaningfulPassage,
  isVastuKnowledgePassage,
  parsePageSegments,
} from "../knowledgeVaultRuleExtractionService";

describe("Knowledge Vault rule extraction — page-aware", () => {
  it("parses --- PAGE N OF M --- markers into segments", () => {
    const text = [
      "--- PAGE 1 OF 3 ---",
      "The kitchen should be placed in the south-east direction for fire element balance.",
      "--- PAGE 2 OF 3 ---",
      "Bedroom placement in the south-west supports stability and restful sleep.",
      "--- PAGE 3 OF 3 ---",
      "Avoid toilet in the north-east corner as it disturbs Ishanya zone.",
    ].join("\n");

    const pages = parsePageSegments(text);
    expect(pages).toHaveLength(3);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[1].pageNumber).toBe(2);
    expect(pages[2].text.toLowerCase()).toContain("avoid toilet");
  });

  it("creates auto-approved rules only when an actionable remedy sentence exists", () => {
    const doc = {
      id: "DOC-KNOWLEDGE-TEST",
      title: "Vastu Principles",
      totalPages: 2,
    };

    const text = [
      "--- PAGE 1 OF 2 ---",
      "The north-east direction is governed by water element. Place the prayer room or mandir in the north-east and keep this zone light and open.",
      "--- PAGE 2 OF 2 ---",
      "Main door facing east brings positive solar energy. Install a brass threshold strip at the east-facing entrance.",
    ].join("\n");

    const rules = extractApprovedRulesFromDocument(doc, text, 10);
    expect(rules.length).toBeGreaterThanOrEqual(2);
    expect(rules.every((r) => r.approvalStatus === "APPROVED")).toBe(true);
    expect(rules.every((r) => r.approvedBy === "Auto-Approved on Upload")).toBe(true);
    expect(rules.some((r) => r.evidence.pageNumber === 1)).toBe(true);
    expect(rules.some((r) => r.recommendation.toLowerCase().includes("place"))).toBe(true);
  });

  it("refines narrative vastu pages with spatial signals into actionable remedies", () => {
    const doc = { id: "DOC-NARR", title: "Mayamatam Vastu Shastra", totalPages: 1 };
    const text =
      "--- PAGE 1 OF 1 ---\nThe north-east direction is governed by water element and is ideal for prayer room placement in residential vastu.";
    const rules = extractApprovedRulesFromDocument(doc, text, 5);
    expect(rules.length).toBeGreaterThanOrEqual(1);
    expect(rules[0].evidence.refinedFromShloka).toBe(true);
    expect(rules[0].recommendation.toLowerCase()).toMatch(/place|keep|avoid|install/);
  });

  it("still extracts remedy lines when action words are present", () => {
    const doc = { id: "DOC-REMEDY", title: "Remedy Book", totalPages: 1 };
    const text =
      "--- PAGE 1 OF 1 ---\nIf toilet is in north-east, shift it to south-west and install a brass pyramid at the entrance.";

    const rules = extractApprovedRulesFromDocument(doc, text, 5);
    expect(rules.length).toBe(1);
    expect(rules[0].recommendation.toLowerCase()).toMatch(/shift|install|pyramid/);
    expect(rules[0].confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("skips garbage OCR pages with low alpha ratio", () => {
    expect(isMeaningfulPassage("yC5TTC5 5.37/117 @@@ ###")).toBe(false);
    expect(alphaRatio("yC5TTC5 5.37/117")).toBeLessThan(0.35);

    const doc = { id: "DOC-GARBAGE", title: "Scan", totalPages: 1 };
    const text = "--- PAGE 1 OF 1 ---\nyC5TTC5 5.37/117 @@@ ###";
    const rules = extractApprovedRulesFromDocument(doc, text, 5);
    expect(rules.length).toBe(0);
  });

  it("uses treatise mode for Brhatsamhita-style titles on readable passages", () => {
    const doc = { id: "DOC-BRHAT", title: "Brhatsamhita_compressed2", totalPages: 766 };
    const text = [
      "--- PAGE 12 OF 766 ---",
      "Chapter on residential architecture describes cardinal directions. Avoid heavy storage in the north-east and place the mandir in the north-east corner.",
      "--- PAGE 13 OF 766 ---",
      "The architect must align the plot with magnetic orientation. Keep the brahmasthan center open and avoid blocking it with walls.",
    ].join("\n");

    const rules = extractApprovedRulesFromDocument(doc, text, 10);
    expect(rules.length).toBe(2);
    expect(rules[0].evidence.pageNumber).toBe(12);
  });

  it("uses treatise mode for Viswakarma titles (not only Mayamatam/Brhat)", () => {
    const doc = { id: "DOC-VISW", title: "Viswakarm1", totalPages: 168 };
    const pages = Array.from({ length: 134 }, (_, i) => {
      const n = i + 1;
      return `--- PAGE ${n} OF 168 ---\nResidential vastu on page ${n}. Avoid toilet in north-east; shift wet zones to south-east or west where possible.`;
    }).join("\n");

    const rules = extractApprovedRulesFromDocument(doc, pages);
    expect(rules.length).toBeGreaterThanOrEqual(50);
    expect(rules.length).toBeLessThanOrEqual(134 * 5);
  });

  it("unwraps JSON OCR blobs and extracts Sanskrit treatise pages", async () => {
    const { normalizeVisionOcrText } = await import("../knowledgeVaultOcrTextUtils");
    const doc = { id: "DOC-BRHAT-HI", title: "Brhatsamhita_compressed2", totalPages: 766 };
    const jsonPage =
      '---  --- { "text": "कृ.सं.सी. २२२\\n\\n[Spine]\\nबृहत्संहिता\\nश्रीवराहमिहिराचार्यविरचिता\\n' +
      'सम्पादकोव्याख्याकारश्च डॉ. सुरकान्त झा" }';
    const cleaned = normalizeVisionOcrText(jsonPage);
    expect(cleaned).toContain("बृहत्संहिता");
    expect(cleaned.startsWith("{")).toBe(false);

    const text = `--- PAGE 1 OF 766 ---\n${jsonPage}\n--- PAGE 2 OF 766 ---\nदक्षिण-पूर्व में रसोई रखें और उत्तर-पूर्व को हल्का एवं खुला रखें।`;
    const rules = extractApprovedRulesFromDocument(doc, text, 10);
    expect(rules.length).toBeGreaterThanOrEqual(1);
  });

  it("does not inject hardcoded template rules when PDF text is empty", async () => {
    const { KnowledgeVaultService } = await import("../knowledgeVaultService");

    const sparseDoc: VaultDocument = {
      id: "DOC-NO-TEMPLATE-TEST",
      title: "Empty Scan Book",
      originalName: "empty.pdf",
      fileType: "pdf",
      sizeBytes: 512,
      status: "INGESTED_ACTIVE",
      ocrText: "short",
      ocrConfidence: 0,
      totalPages: 1,
      author: "Test",
      category: "Vastu",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      tags: [],
      extractedRulesCount: 0,
      approvedRulesCount: 0,
      language: "English",
    };

    const parseFn = (KnowledgeVaultService as any).parseRulesFromText?.bind(KnowledgeVaultService);
    if (parseFn) {
      const parsed = parseFn(sparseDoc);
      expect(parsed.length).toBe(0);
    }
  });

  it("detects vastu knowledge patterns broadly", () => {
    expect(isVastuKnowledgePassage("Kitchen fire element belongs in agneya direction.")).toBe(true);
    expect(isVastuKnowledgePassage("Random stock market prices rose today.")).toBe(false);
  });

  it("detects sparse scanned PDFs for Vision OCR even without empty page flags", async () => {
    const { KnowledgeUploadPipelineService } = await import("../knowledgeUploadPipelineService");
    const sparseText = Array.from({ length: 20 }, (_, i) => `--- PAGE ${i + 1} OF 766 ---\nabc`).join("\n");
    const plan = KnowledgeUploadPipelineService.resolveOcrPageTargets([], sparseText, 766);
    expect(plan.needsVisionOcr).toBe(true);
    expect(plan.ocrPageTargets.length).toBe(766);
  });

  it("preserves page inventory when structure pipeline returns template fallback", async () => {
    const { KnowledgeUploadPipelineService } = await import("../knowledgeUploadPipelineService");
    const pageMarked = [
      "--- PAGE 1 OF 766 ---",
      "",
      "--- PAGE 2 OF 766 ---",
      "",
    ].join("\n");

    const merged = KnowledgeUploadPipelineService.buildExtractionTextFromStructure(
      pageMarked,
      {
        ocrText: "Extracted OCR content for Brhatsamhita_compressed2.pdf. Covers classical rules and formulas.",
        cleanText: "Extracted OCR content for Brhatsamhita_compressed2.pdf. Covers classical rules and formulas.",
        chapters: [],
      },
      766
    );

    expect(merged).toContain("--- PAGE 1 OF 766 ---");
    expect(merged).toContain("--- PAGE 2 OF 766 ---");
    expect(merged).not.toContain("Covers classical rules and formulas");
  });
});
