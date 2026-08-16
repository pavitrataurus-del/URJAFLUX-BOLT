import { TwinRepositoryFactory } from "./digital_twin/repository/TwinRepositoryFactory";
import { GraphRepositoryFactory } from "./graph/repository/GraphRepositoryFactory";
import { RecommendationRepositoryFactory } from "./reasoning/repository/RecommendationRepositoryFactory";
import { DecisionRepositoryFactory } from "./decision_trace/repository/DecisionRepositoryFactory";

import { ITwinRepository } from "./digital_twin/repository/ITwinRepository";
import { IGraphRepository } from "./graph/repository/IGraphRepository";
import { IRecommendationRepository } from "./reasoning/repository/IRecommendationRepository";
import { IDecisionRepository } from "./decision_trace/repository/IDecisionRepository";

import { IDigitalTwin } from "./digital_twin/models/TwinModels";
import { IKnowledgeGraph } from "./graph/models/GraphModels";
import { IRecommendation } from "./reasoning/models/ReasoningModels";
import { IDecisionTrace } from "./decision_trace/models/DecisionModels";

class LocalTwinRepository implements ITwinRepository {
  private twins = new Map<string, IDigitalTwin>();

  constructor() {
    // Attempt to load from localStorage to provide premium persistent experience
    try {
      const stored = localStorage.getItem("urjaflux_digital_twins");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.twins.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted for twins:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, IDigitalTwin> = {};
      this.twins.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_digital_twins", JSON.stringify(obj));
    } catch (e) {
      console.warn("Failed to persist twins to localStorage:", e);
    }
  }

  async createTwin(twin: IDigitalTwin): Promise<IDigitalTwin> {
    this.twins.set(twin.id, twin);
    this.persist();
    return twin;
  }

  async updateTwin(twin: IDigitalTwin): Promise<IDigitalTwin> {
    this.twins.set(twin.id, twin);
    this.persist();
    return twin;
  }

  async deleteTwin(twinId: string): Promise<void> {
    this.twins.delete(twinId);
    this.persist();
  }

  async getTwin(twinId: string): Promise<IDigitalTwin | null> {
    return this.twins.get(twinId) || null;
  }

  async listTwinsByProject(projectId: string): Promise<IDigitalTwin[]> {
    return Array.from(this.twins.values()).filter(t => t.projectId === projectId);
  }

  async saveTwin(twin: IDigitalTwin): Promise<void> {
    this.twins.set(twin.id, twin);
    this.persist();
  }
}

class LocalGraphRepository implements IGraphRepository {
  private graphs = new Map<string, IKnowledgeGraph>();

  constructor() {
    try {
      const stored = localStorage.getItem("urjaflux_knowledge_graphs");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.graphs.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted for graphs:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, IKnowledgeGraph> = {};
      this.graphs.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_knowledge_graphs", JSON.stringify(obj));
    } catch (e) {
      console.warn("Failed to persist graphs to localStorage:", e);
    }
  }

  async createGraph(graph: IKnowledgeGraph): Promise<IKnowledgeGraph> {
    this.graphs.set(graph.id, graph);
    this.persist();
    return graph;
  }

  async updateGraph(graph: IKnowledgeGraph): Promise<IKnowledgeGraph> {
    this.graphs.set(graph.id, graph);
    this.persist();
    return graph;
  }

  async deleteGraph(graphId: string): Promise<void> {
    this.graphs.delete(graphId);
    this.persist();
  }

  async getGraph(graphId: string): Promise<IKnowledgeGraph | null> {
    return this.graphs.get(graphId) || null;
  }

  async listGraphs(): Promise<IKnowledgeGraph[]> {
    return Array.from(this.graphs.values());
  }
}

class LocalRecommendationRepository implements IRecommendationRepository {
  private recommendations = new Map<string, IRecommendation>();

  constructor() {
    try {
      const stored = localStorage.getItem("urjaflux_recommendations");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.recommendations.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted for recommendations:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, IRecommendation> = {};
      this.recommendations.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_recommendations", JSON.stringify(obj));
    } catch (e) {
      console.warn("Failed to persist recommendations to localStorage:", e);
    }
  }

  async createRecommendation(recommendation: IRecommendation): Promise<IRecommendation> {
    this.recommendations.set(recommendation.id, recommendation);
    this.persist();
    return recommendation;
  }

  async updateRecommendation(recommendation: IRecommendation): Promise<IRecommendation> {
    this.recommendations.set(recommendation.id, recommendation);
    this.persist();
    return recommendation;
  }

  async deleteRecommendation(id: string): Promise<void> {
    this.recommendations.delete(id);
    this.persist();
  }

  async getRecommendation(id: string): Promise<IRecommendation | null> {
    return this.recommendations.get(id) || null;
  }

  async listRecommendations(twinId: string): Promise<IRecommendation[]> {
    return Array.from(this.recommendations.values()).filter(r => r.metadata?.twinId === twinId);
  }
}

class LocalDecisionRepository implements IDecisionRepository {
  private decisions = new Map<string, IDecisionTrace>();

  constructor() {
    try {
      const stored = localStorage.getItem("urjaflux_decisions");
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(key => {
          this.decisions.set(key, parsed[key]);
        });
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted for decisions:", e);
    }
  }

  private persist() {
    try {
      const obj: Record<string, IDecisionTrace> = {};
      this.decisions.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem("urjaflux_decisions", JSON.stringify(obj));
    } catch (e) {
      console.warn("Failed to persist decisions to localStorage:", e);
    }
  }

  async createDecision(decision: IDecisionTrace): Promise<IDecisionTrace> {
    this.decisions.set(decision.id, decision);
    this.persist();
    return decision;
  }

  async updateDecision(decision: IDecisionTrace): Promise<IDecisionTrace> {
    this.decisions.set(decision.id, decision);
    this.persist();
    return decision;
  }

  async getDecision(decisionId: string): Promise<IDecisionTrace | null> {
    return this.decisions.get(decisionId) || null;
  }

  async listDecisionsByTwin(twinId: string): Promise<IDecisionTrace[]> {
    return Array.from(this.decisions.values()).filter(d => d.twinId === twinId);
  }

  async listDecisionsByProject(projectId: string): Promise<IDecisionTrace[]> {
    return Array.from(this.decisions.values()).filter(d => d.projectId === projectId);
  }
}

export function initializeRepositories() {
  console.log("Initializing Urjaflux Enterprise Repositories...");
  
  const twinRepo = new LocalTwinRepository();
  TwinRepositoryFactory.getInstance().registerRepository(twinRepo);
  
  const graphRepo = new LocalGraphRepository();
  GraphRepositoryFactory.getInstance().registerRepository(graphRepo);
  
  const recRepo = new LocalRecommendationRepository();
  RecommendationRepositoryFactory.getInstance().registerRepository(recRepo);
  
  const decRepo = new LocalDecisionRepository();
  DecisionRepositoryFactory.getInstance().registerRepository(decRepo);
  
  console.log("All Urjaflux Enterprise Repositories successfully configured!");
}
