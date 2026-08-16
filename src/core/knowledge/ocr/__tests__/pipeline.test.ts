import { describe, it, expect, beforeEach } from "vitest";
import { OcrPipeline, OcrProviderFactory, IOcrProvider, IOcrResult, OcrBuilder, OcrJobStatus, OcrEventType } from "../index";
import { EventBus } from "../../../../infrastructure/events/EventBus";

describe("OCR Processing Pipeline", () => {
  beforeEach(() => {
    OcrPipeline.getInstance().clear();
    OcrProviderFactory.getInstance().clear();
  });

  const mockResult: IOcrResult = {
    id: "test",
    documentId: "doc_1",
    overallConfidence: 0.9,
    fullText: "Hello World",
    providerMetadata: {},
    pages: [{
      id: "page_1",
      pageNumber: 1,
      width: 800,
      height: 600,
      confidence: 0.9,
      blocks: [{
        id: "block_1",
        confidence: 0.9,
        blockType: "TEXT",
        boundingBox: OcrBuilder.createBoundingBox(0, 0, 100, 100),
        paragraphs: []
      }]
    }]
  };

  const mockProvider: IOcrProvider = {
    getProviderId: () => "mock",
    isAvailable: async () => true,
    processImage: async (buf, config) => {
      // Simulate Multilingual hooks via config
      const langs = config?.options?.languages;
      return {
        ...mockResult,
        languageDetected: langs ? langs[0] : "en"
      };
    }
  };

  it("should process images and return structured output with layout preservation", async () => {
    OcrProviderFactory.getInstance().registerProvider(mockProvider, true);
    
    let eventFired = false;
    EventBus.getInstance().subscribe(OcrEventType.OCR_COMPLETED, (event) => {
      eventFired = true;
    });

    const pipeline = OcrPipeline.getInstance();
    const jobId = await pipeline.startOcr("doc_1", [Buffer.from("dummy")]);
    
    // Allow async process to run
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const job = pipeline.getJob(jobId);
    expect(job?.status).toBe(OcrJobStatus.COMPLETED);
    expect(job?.result?.pages[0].blocks[0].boundingBox.vertices.length).toBe(4);
    expect(eventFired).toBe(true);
  });

  it("should support multilingual hooks", async () => {
    OcrProviderFactory.getInstance().registerProvider(mockProvider, true);
    const pipeline = OcrPipeline.getInstance();
    const jobId = await pipeline.startOcr("doc_2", [Buffer.from("dummy")], { languages: ["hi", "sa"] });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    const job = pipeline.getJob(jobId);
    expect(job?.result?.languageDetected).toBe("hi");
  });

  it("should handle pause and resume", async () => {
    OcrProviderFactory.getInstance().registerProvider(mockProvider, true);
    const pipeline = OcrPipeline.getInstance();
    
    const jobId = await pipeline.startOcr("doc_3", [Buffer.from("dummy")]);
    pipeline.pauseJob(jobId);
    
    expect(pipeline.getJob(jobId)?.status).toBe(OcrJobStatus.PAUSED);
    
    pipeline.resumeJob(jobId);
    expect(pipeline.getJob(jobId)?.status).toBe(OcrJobStatus.PROCESSING);
  });
});
