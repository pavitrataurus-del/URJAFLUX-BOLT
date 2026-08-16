import { describe, it, expect, beforeEach } from "vitest";
import { 
  DecisionApi, 
  DecisionRepositoryFactory, 
  IDecisionRepository, 
  IDecisionTrace, 
  DecisionStatus 
} from "../index";

describe("Decision Trace & Explainability Engine", () => {
  class MockDecisionRepository implements IDecisionRepository {
    private decisions = new Map<string, IDecisionTrace>();

    async createDecision(decision: IDecisionTrace) {
      this.decisions.set(decision.id, decision);
      return decision;
    }
    async updateDecision(decision: IDecisionTrace) {
      this.decisions.set(decision.id, decision);
      return decision;
    }
    async getDecision(id: string) {
      return this.decisions.get(id) || null;
    }
    async listDecisionsByTwin(twinId: string) {
      return Array.from(this.decisions.values()).filter(d => d.twinId === twinId);
    }
    async listDecisionsByProject(projectId: string) {
      return Array.from(this.decisions.values()).filter(d => d.projectId === projectId);
    }
  }

  beforeEach(() => {
    DecisionRepositoryFactory.getInstance().clear();
    DecisionRepositoryFactory.getInstance().registerRepository(new MockDecisionRepository());
  });

  const mockDecision: IDecisionTrace = {
    id: "dec_1",
    timestamp: Date.now(),
    projectId: "proj_1",
    twinId: "twin_1",
    namespace: "VASTU",
    expertsInvolved: ["VASTU_EXPERT"],
    inputObjectIds: ["obj_1"],
    evidenceReferences: [
      {
        id: "ev_1",
        knowledgeSource: "Vastu Shastra",
        checksum: "abc1234",
        approvalStatus: "APPROVED"
      }
    ],
    rulesReferenced: ["rule_1"],
    knowledgeSource: "Vastu System",
    confidence: { compositeConfidence: 0.85 },
    status: DecisionStatus.PROPOSED,
    version: "1.0",
    auditTrail: []
  };

  it("should create a decision trace and generate an audit record", async () => {
    const api = DecisionApi.getInstance();
    const created = await api.createDecisionTrace({ ...mockDecision });
    
    expect(created.id).toBe("dec_1");
    expect(created.auditTrail.length).toBe(1);
    expect(created.auditTrail[0].action).toBe("CREATED");
  });

  it("should calculate composite confidence based on weights", () => {
    const api = DecisionApi.getInstance();
    const scores = {
      ocrConfidence: 0.9,
      ontologyConfidence: 0.8,
      expertConfidence: 0.9
    };
    
    // Weights: ocr(0.1), ontology(0.2), expert(0.3). Total weight = 0.6
    // Expected composite = (0.9*0.1 + 0.8*0.2 + 0.9*0.3) / 0.6 = (0.09 + 0.16 + 0.27) / 0.6 = 0.52 / 0.6 = 0.8666
    const calculated = api.calculateConfidence(scores);
    expect(calculated.compositeConfidence).toBeCloseTo(0.866, 2);
  });

  it("should validate a valid decision trace", async () => {
    const api = DecisionApi.getInstance();
    const created = await api.createDecisionTrace({ ...mockDecision });
    const isValid = api.validateDecision(created);
    expect(isValid).toBe(true);
  });

  it("should fail validation if confidence is out of bounds", async () => {
    const api = DecisionApi.getInstance();
    const invalidDecision = {
      ...mockDecision,
      id: "dec_invalid",
      confidence: { compositeConfidence: 1.5 }
    };
    
    await expect(api.createDecisionTrace(invalidDecision)).rejects.toThrow(/out of bounds/);
  });

  it("should generate a structured explanation", async () => {
    const api = DecisionApi.getInstance();
    const created = await api.createDecisionTrace({ ...mockDecision });
    const explanation = api.generateExplanation(created);
    
    expect(explanation.decisionId).toBe("dec_1");
    expect(explanation.summary).toContain("1 pieces of evidence in namespace VASTU");
    expect(explanation.expertsConsulted).toContain("VASTU_EXPERT");
  });
});
