import { describe, it, expect, beforeEach } from "vitest";
import { 
  OntologyResolver, 
  GeometryEngine, 
  RelationshipEngine, 
  ConfidenceEngine, 
  SpatialPipeline, 
  SpatialJobStatus,
  SpatialValidationEngine
} from "../index";
import { IOcrResult, OcrBuilder } from "../../ocr";

describe("Spatial Intelligence Pipeline Engine (SIPE)", () => {
  beforeEach(() => {
    OntologyResolver.getInstance().clear();
    SpatialPipeline.getInstance().clear();
  });

  it("should resolve ontology with aliases", () => {
    const resolver = OntologyResolver.getInstance();
    resolver.registerMapping({
      canonicalType: "BEDROOM",
      aliases: ["Bed Room", "BR", "Master Bedroom"],
      namespaceId: "VASTU"
    });

    const res1 = resolver.resolve("Bedroom", "VASTU");
    expect(res1.canonicalType).toBe("BEDROOM");
    expect(res1.confidence).toBe(1.0);

    const res2 = resolver.resolve("Master Bedroom", "VASTU");
    expect(res2.canonicalType).toBe("BEDROOM");
    expect(res2.confidence).toBe(0.9);

    const res3 = resolver.resolve("Kitchen", "VASTU");
    expect(res3.canonicalType).toBe("KITCHEN");
    expect(res3.confidence).toBe(0.5);
  });

  it("should associate geometry correctly", () => {
    const engine = GeometryEngine.getInstance();
    const ocrBox = OcrBuilder.createBoundingBox(0, 0, 100, 50);
    
    const geom = engine.associateGeometry(ocrBox);
    expect(geom.dimensions?.width).toBe(100);
    expect(geom.dimensions?.height).toBe(50);
    expect(geom.area).toBe(5000);
    expect(geom.centroid?.x).toBe(50);
    expect(geom.centroid?.y).toBe(25);
  });

  it("should calculate confidence", () => {
    const engine = ConfidenceEngine.getInstance();
    const conf = engine.calculateConfidence(0.9, 0.8, 0.7, 0.6);
    expect(conf.compositeConfidence).toBeCloseTo((0.9*0.3) + (0.8*0.4) + (0.7*0.2) + (0.6*0.1));
    expect(conf.evidenceChain.length).toBeGreaterThan(0);
  });

  it("should run the spatial pipeline", async () => {
    OntologyResolver.getInstance().registerMapping({
      canonicalType: "LIVING_ROOM",
      aliases: ["Living"],
      namespaceId: "VASTU"
    });

    const mockOcrResult: IOcrResult = {
      id: "ocr_1",
      documentId: "doc_1",
      overallConfidence: 0.9,
      fullText: "Living",
      providerMetadata: {},
      pages: [{
        id: "page_1",
        pageNumber: 1,
        width: 1000,
        height: 1000,
        confidence: 0.9,
        blocks: [{
          id: "block_1",
          blockType: "TEXT",
          confidence: 0.9,
          boundingBox: OcrBuilder.createBoundingBox(100, 100, 200, 200),
          paragraphs: [{
            id: "p1",
            confidence: 0.9,
            boundingBox: OcrBuilder.createBoundingBox(100, 100, 200, 200),
            lines: [{
              id: "l1",
              text: "Living",
              confidence: 0.9,
              words: [],
              boundingBox: OcrBuilder.createBoundingBox(100, 100, 200, 200)
            }]
          }]
        },
        {
          id: "block_2",
          blockType: "TEXT",
          confidence: 0.8,
          // Move this so it doesn't intersect. 100+200=300 max X for block 1.
          boundingBox: OcrBuilder.createBoundingBox(350, 100, 200, 200),
          paragraphs: [{
            id: "p2",
            confidence: 0.8,
            boundingBox: OcrBuilder.createBoundingBox(350, 100, 200, 200),
            lines: [{
              id: "l2",
              text: "Kitchen",
              confidence: 0.8,
              words: [],
              boundingBox: OcrBuilder.createBoundingBox(350, 100, 200, 200)
            }]
          }]
        }]
      }]
    };

    const pipeline = SpatialPipeline.getInstance();
    const jobId = await pipeline.startPipeline(mockOcrResult, "VASTU");
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const job = pipeline.getJob(jobId);
    expect(job?.status).toBe(SpatialJobStatus.COMPLETED);
    
    const objects = job?.result;
    expect(objects).toBeDefined();
    expect(objects?.length).toBe(2);
    
    // Check ontology resolution
    expect(objects![0].canonicalType).toBe("LIVING_ROOM");
    expect(objects![1].canonicalType).toBe("KITCHEN"); // Fallback
    
    // Check relationships (They are "near" each other)
    // block 1 centroid: 200, 200. block 2 centroid: 450, 200. Dist = 250. Threshold = 200*2 = 400.
    expect(objects![0].relationships.length).toBeGreaterThan(0);
    expect(objects![0].relationships[0].relationshipType).toBe("NEAR");
  });
  
  it("should fail validation on duplicate ids", () => {
     const validator = SpatialValidationEngine.getInstance();
     const obj1 = {
        id: "so_1", documentId: "doc1", namespaceId: "VASTU", pageNumber: 1, canonicalType: "A", ontologyReference: "urn", geometry: { vertices: [{x:0,y:0}] }, confidence: { compositeConfidence: 0.9 } as any, relationships: [], metadata: {}
     };
     
     expect(() => validator.validateCollection([obj1, obj1])).toThrow("Duplicate object detected");
  });
});
