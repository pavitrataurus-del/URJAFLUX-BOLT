import { describe, it, expect, beforeEach } from "vitest";
import { 
  DigitalTwinApi,
  TwinRepositoryFactory,
  ITwinRepository,
  IDigitalTwin,
  TwinRelationshipType
} from "../index";
import { ISpatialObject } from "../../spatial";

describe("Digital Building Twin Engine (DBTE)", () => {
  class MockTwinRepository implements ITwinRepository {
    private twins: Map<string, IDigitalTwin> = new Map();

    async createTwin(twin: IDigitalTwin) {
      this.twins.set(twin.id, twin);
      return twin;
    }
    async updateTwin(twin: IDigitalTwin) {
      this.twins.set(twin.id, twin);
      return twin;
    }
    async deleteTwin(id: string) {
      this.twins.delete(id);
    }
    async getTwin(id: string) {
      return this.twins.get(id) || null;
    }
    async listTwinsByProject(projectId: string) {
      return Array.from(this.twins.values()).filter(t => t.projectId === projectId);
    }
    async saveTwin(twin: IDigitalTwin) {
      this.twins.set(twin.id, twin);
    }
  }

  const mockRepo = new MockTwinRepository();

  beforeEach(() => {
    TwinRepositoryFactory.getInstance().clear();
    TwinRepositoryFactory.getInstance().registerRepository(mockRepo);
  });

  const mockSpatialObjects: ISpatialObject[] = [
    {
      id: "so_1",
      documentId: "doc_1",
      pageNumber: 1,
      canonicalType: "ROOM",
      ontologyReference: "urn:ontology:VASTU:ROOM",
      geometry: { vertices: [{x:0,y:0}, {x:100,y:0}, {x:100,y:100}, {x:0,y:100}] },
      confidence: { compositeConfidence: 0.9, evidenceChain: [], ocrConfidence: 0.9, ontologyConfidence: 0.9, geometryConfidence: 0.9, relationshipConfidence: 0.9 },
      namespaceId: "VASTU",
      relationships: [
        {
          id: "rel_1",
          sourceObjectId: "so_1",
          targetObjectId: "so_2",
          relationshipType: "CONTAINS" as any,
          confidence: 0.9,
          metadata: {}
        }
      ],
      metadata: {}
    },
    {
      id: "so_2",
      documentId: "doc_1",
      pageNumber: 1,
      canonicalType: "DOOR",
      ontologyReference: "urn:ontology:VASTU:DOOR",
      geometry: { vertices: [{x:0,y:0}, {x:10,y:0}, {x:10,y:10}, {x:0,y:10}] },
      confidence: { compositeConfidence: 0.9, evidenceChain: [], ocrConfidence: 0.9, ontologyConfidence: 0.9, geometryConfidence: 0.9, relationshipConfidence: 0.9 },
      namespaceId: "VASTU",
      relationships: [],
      metadata: {}
    }
  ];

  it("should create twin from spatial objects", async () => {
    const api = DigitalTwinApi.getInstance();
    const twin = await api.createTwinFromSpatialObjects("proj_1", "floor_1", mockSpatialObjects, "system");
    
    expect(twin.projectId).toBe("proj_1");
    expect(twin.objects.length).toBe(2);
    expect(twin.objects[0].relationships.length).toBe(1);
    expect(twin.objects[0].relationships[0].type).toBe(TwinRelationshipType.CONTAINS);
    expect(twin.version.revision).toBe(1);
  });

  it("should update twin and create a new version", async () => {
    const api = DigitalTwinApi.getInstance();
    const twin = await api.createTwinFromSpatialObjects("proj_2", "floor_1", mockSpatialObjects, "system");
    
    const updatedTwin = await api.updateTwin(twin, "user_1", "Added new stuff");
    expect(updatedTwin.version.revision).toBe(2);
    expect(updatedTwin.version.author).toBe("user_1");
  });

  it("should serialize and deserialize a twin deterministically", async () => {
    const api = DigitalTwinApi.getInstance();
    const twin = await api.createTwinFromSpatialObjects("proj_3", "floor_1", mockSpatialObjects, "system");
    
    const serialized = api.serializeTwin(twin);
    expect(typeof serialized).toBe("string");
    
    const deserialized = api.deserializeTwin(serialized);
    expect(deserialized.id).toBe(twin.id);
    expect(deserialized.projectId).toBe(twin.projectId);
  });
  
  it("should clone a twin", async () => {
    const api = DigitalTwinApi.getInstance();
    const twin = await api.createTwinFromSpatialObjects("proj_4", "floor_1", mockSpatialObjects, "system");
    
    const cloned = await api.cloneTwin(twin.id, "proj_5", "user_2");
    expect(cloned.projectId).toBe("proj_5");
    expect(cloned.objects.length).toBe(2);
    expect(cloned.version.revision).toBe(1);
  });

  it("should fail validation for duplicate objects", async () => {
    const api = DigitalTwinApi.getInstance();
    const duplicateSpatialObjects = [...mockSpatialObjects, mockSpatialObjects[0]];
    
    await expect(api.createTwinFromSpatialObjects("proj_6", "floor_1", duplicateSpatialObjects, "system")).rejects.toThrow("Duplicate object detected");
  });
});
