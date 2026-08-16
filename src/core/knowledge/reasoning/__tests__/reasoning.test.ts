import { describe, it, expect, beforeEach } from "vitest";
import {
  ReasoningApi,
  RecommendationRepositoryFactory,
  IRecommendationRepository,
  IRecommendation,
  RecommendationStatus,
  RecommendationPriority,
  RecommendationEngine
} from "../index";

describe("Enterprise AI Reasoning & Human Review Engine", () => {
  class MockRecommendationRepository implements IRecommendationRepository {
    private recommendations = new Map<string, IRecommendation>();

    async createRecommendation(rec: IRecommendation) {
      this.recommendations.set(rec.id, rec);
      return rec;
    }
    async updateRecommendation(rec: IRecommendation) {
      this.recommendations.set(rec.id, rec);
      return rec;
    }
    async deleteRecommendation(id: string) {
      this.recommendations.delete(id);
    }
    async getRecommendation(id: string) {
      return this.recommendations.get(id) || null;
    }
    async listRecommendations(twinId: string) {
      return Array.from(this.recommendations.values());
    }
  }

  beforeEach(() => {
    RecommendationRepositoryFactory.getInstance().clear();
    RecommendationRepositoryFactory.getInstance().registerRepository(new MockRecommendationRepository());
  });

  const mockRecData: Omit<IRecommendation, "id" | "status" | "version"> = {
    priority: RecommendationPriority.HIGH,
    category: "STRUCTURAL",
    description: "Move wall due to clash",
    affectedObjects: ["wall_1"],
    evidenceReferences: [
      { id: "ev_1", knowledgeSource: "Vastu", checksum: "abc", approvalStatus: "APPROVED" }
    ],
    knowledgeSources: ["Vastu"],
    confidence: { compositeConfidence: 0.9 },
    expertsResponsible: ["VASTU_EXPERT"],
    decisionTraceId: "dt_1",
    metadata: { twinId: "twin_1" }
  };

  it("should generate a recommendation and start as DRAFT", async () => {
    const engine = RecommendationEngine.getInstance();
    const created = await engine.generateRecommendation(mockRecData);
    
    expect(created.id).toBeDefined();
    expect(created.status).toBe(RecommendationStatus.DRAFT);
  });

  it("should detect conflicts when recommendations affect same objects", async () => {
    const api = ReasoningApi.getInstance();
    const engine = RecommendationEngine.getInstance();
    
    const rec1 = await engine.generateRecommendation(mockRecData);
    const rec2 = await engine.generateRecommendation({ ...mockRecData, description: "Different suggestion" });

    const conflicts = api.detectConflicts([rec1, rec2]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].recommendationIds).toContain(rec1.id);
    expect(conflicts[0].recommendationIds).toContain(rec2.id);
  });

  it("should process human review workflow", async () => {
    const api = ReasoningApi.getInstance();
    const engine = RecommendationEngine.getInstance();
    
    const rec = await engine.generateRecommendation(mockRecData);
    
    await api.submitForReview(rec.id);
    const updated = await RecommendationRepositoryFactory.getInstance().getRepository().getRecommendation(rec.id);
    expect(updated?.status).toBe(RecommendationStatus.PENDING_REVIEW);

    const review = await api.processReview(rec.id, "Admin", true, "Looks good");
    expect(review.status).toBe(RecommendationStatus.APPROVED);
    
    const finalRec = await RecommendationRepositoryFactory.getInstance().getRepository().getRecommendation(rec.id);
    expect(finalRec?.status).toBe(RecommendationStatus.APPROVED);
  });

  it("should fail validation for recommendation without evidence", async () => {
    const api = ReasoningApi.getInstance();
    const engine = RecommendationEngine.getInstance();
    
    const rec = await engine.generateRecommendation({ ...mockRecData, evidenceReferences: [] });
    
    expect(() => api.validateRecommendation(rec)).toThrow(/missing evidence/);
  });
});
