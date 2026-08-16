import { describe, expect, it } from "vitest";
import { extractTesseractLines } from "../tesseractLineExtractor";

describe("extractTesseractLines", () => {
  it("extracts lines from Tesseract v7 blocks tree", () => {
    const lines = extractTesseractLines({
      blocks: [
        {
          paragraphs: [
            {
              lines: [
                { text: "KITCHEN", confidence: 92, bbox: { x0: 10, y0: 20, x1: 80, y1: 40 } },
                { text: "BEDROOM", confidence: 88, bbox: { x0: 100, y0: 20, x1: 180, y1: 40 } },
              ],
            },
          ],
        },
      ],
    });

    expect(lines.length).toBe(2);
    expect(lines[0].text).toBe("KITCHEN");
    expect(lines[1].text).toBe("BEDROOM");
  });

  it("falls back to plain text when blocks are empty", () => {
    const lines = extractTesseractLines({
      text: "LIVING ROOM\nWASHROOM",
    });

    expect(lines.length).toBe(2);
    expect(lines.map((l) => l.text)).toEqual(["LIVING ROOM", "WASHROOM"]);
  });
});
