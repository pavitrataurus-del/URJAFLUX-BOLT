import { describe, expect, it } from "vitest";
import { isDocxBuffer, xmlToPlainText } from "../docxTextExtractionService";

describe("docxTextExtractionService", () => {
  it("detects DOCX PK zip signature", () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00]);
    expect(isDocxBuffer(bytes.buffer)).toBe(true);
  });

  it("converts Word XML to plain text", () => {
    const xml =
      '<w:document><w:body><w:p><w:r><w:t>Kitchen should be in South-East.</w:t></w:r></w:p></w:body></w:document>';
    expect(xmlToPlainText(xml)).toContain("Kitchen should be in South-East.");
  });
});
