import { describe, expect, it } from "vitest";
import {
  mapChatLanguageToUKA,
  mapToReportLanguageCode,
  mapUKAToChatLanguage,
  resolveReportLanguage,
} from "../languageBridge";

describe("languageBridge", () => {
  it("maps chat language to UKA codes", () => {
    expect(mapChatLanguageToUKA("en")).toBe("EN");
    expect(mapChatLanguageToUKA("hi")).toBe("HI");
    expect(mapChatLanguageToUKA("hinglish")).toBe("HINGLISH");
  });

  it("maps UKA codes back to chat storage", () => {
    expect(mapUKAToChatLanguage("EN")).toBe("en");
    expect(mapUKAToChatLanguage("HI")).toBe("hi");
    expect(mapUKAToChatLanguage("HINGLISH")).toBe("hinglish");
  });

  it("normalizes report language inputs", () => {
    expect(mapToReportLanguageCode("Hindi")).toBe("hi");
    expect(mapToReportLanguageCode("English")).toBe("en");
    expect(mapToReportLanguageCode("hi")).toBe("hi");
  });

  it("resolves report language priority", () => {
    expect(
      resolveReportLanguage({
        explicit: "hi",
        clientReportLanguage: "English",
        userDefault: "en",
      })
    ).toBe("hi");

    expect(
      resolveReportLanguage({
        clientReportLanguage: "Hindi",
        userDefault: "en",
      })
    ).toBe("hi");

    expect(resolveReportLanguage({ userDefault: "hi" })).toBe("hi");
  });
});
