import { describe, expect, it } from "vitest";
import {
  isGibberishRemedyText,
  isPresentableVaultRemedy,
  pickPresentableRemedyText,
  resolveHomeownerFacingRemedy,
} from "../vaultRemedyTextQuality";

describe("vaultRemedyTextQuality", () => {
  it("rejects OCR gibberish latin", () => {
    expect(
      isGibberishRemedyText(
        "ThfafaT: aTsfu GUSEyyfugai HT aTTHAyituiT fufreaTHFmTI TQTtferesta 6HTAS fmis frfraiyr"
      )
    ).toBe(true);
  });

  it("rejects translation meta commentary about kings and architects", () => {
    const text =
      "This translates to 'The king should provide land and villages to the four architects who are skilled in measurement and other works.' This makes grammatical sense.";
    expect(isPresentableVaultRemedy(text)).toBe(false);
  });

  it("rejects Atharvaveda verse prose and LLM formatting leaks", () => {
    expect(
      isPresentableVaultRemedy(
        "O Agni and Vishnu, enjoying your beloved great abode, accepting the hidden offerings of ghee — Atharvaveda Book 7.29.1–2"
      )
    ).toBe(false);
    expect(isPresentableVaultRemedy("Formatting:** - The user requested \"plain text only\".")).toBe(
      false
    );
    expect(
      isPresentableVaultRemedy(
        "In the Atharvaveda, at one place, praying to the two deities residing inside the house—Agni and Vishnu—to fill the dwelling with gems and wealth, it is said:"
      )
    ).toBe(false);
  });

  it("resolveHomeownerFacingRemedy prefers procedural remedy over bad vault text", () => {
    expect(
      resolveHomeownerFacingRemedy({
        proceduralRemedy:
          "Place a natural yellow marble slab beneath the cooktop, install a Vastu Brass Energy Pyramid, and avoid blue/black kitchen accents.",
        vaultRemedy:
          "In the Atharvaveda, at one place, praying to the two deities residing inside the house, it is said:",
      })
    ).toContain("yellow marble");
  });

  it("accepts actionable Vastu remedy language", () => {
    expect(
      isPresentableVaultRemedy(
        "Place a natural yellow marble slab beneath the cooktop and install a Vastu Brass Energy Pyramid."
      )
    ).toBe(true);
  });

  it("accepts Hindi Devanagari remedy with actionable verbs", () => {
    expect(
      isPresentableVaultRemedy(
        "दक्षिण दिशा में हल्के पीले रंग का प्रयोग करें और शयन कक्ष को व्यवस्थित रखें।"
      )
    ).toBe(true);
  });

  it("picks actionable sentence from mixed rule text", () => {
    const remedy = pickPresentableRemedyText({
      condition: "Staircase in North is heavy for Kuber zone.",
      recommendation:
        "Avoid staircase in North; relocate to South-West and install a brass helix if relocation is not possible.",
    });
    expect(remedy).toContain("relocate");
  });
});
