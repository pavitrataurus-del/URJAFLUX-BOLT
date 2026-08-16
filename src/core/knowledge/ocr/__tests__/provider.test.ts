import { describe, it, expect, beforeEach } from "vitest";
import { OcrProviderFactory, IOcrProvider, IOcrResult } from "../index";

describe("OCR Provider Abstraction", () => {
  beforeEach(() => {
    OcrProviderFactory.getInstance().clear();
  });

  it("should register and retrieve a provider", () => {
    const mockProvider: IOcrProvider = {
      getProviderId: () => "mock",
      isAvailable: async () => true,
      processImage: async () => ({} as IOcrResult)
    };

    OcrProviderFactory.getInstance().registerProvider(mockProvider, true);
    const provider = OcrProviderFactory.getInstance().getProvider();
    
    expect(provider).toBeDefined();
    expect(provider.getProviderId()).toBe("mock");
  });

  it("should throw error if provider not found", () => {
    expect(() => OcrProviderFactory.getInstance().getProvider("nonexistent")).toThrow("not found");
  });
});
