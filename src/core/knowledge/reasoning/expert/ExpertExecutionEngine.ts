import { IReasoningContext, IExpertExecutionResult } from "../models/ReasoningModels";
import { GraphApi, IExpertModule } from "../../graph";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { ReasoningEventType, createReasoningEvent } from "../events/ReasoningEvents";

export class ExpertExecutionEngine {
  private static instance: ExpertExecutionEngine;

  private constructor() {}

  public static getInstance(): ExpertExecutionEngine {
    if (!ExpertExecutionEngine.instance) {
      ExpertExecutionEngine.instance = new ExpertExecutionEngine();
    }
    return ExpertExecutionEngine.instance;
  }

  public async executeExperts(context: IReasoningContext): Promise<IExpertExecutionResult[]> {
    const api = GraphApi.getInstance();
    const route = api.prepareExpertRouting(context.namespace);
    
    // Filter by context if specified
    const toExecute = route.filter(e => 
      context.expertsToExecute.length === 0 || context.expertsToExecute.includes(e.identifier)
    );

    const results: IExpertExecutionResult[] = [];

    // Execute sequentially based on dependency topological sort returned by routing
    for (const expert of toExecute) {
      const startTime = Date.now();
      try {
        // Mock expert execution - in reality this would call the registered expert's evaluate method
        // But for our architecture, we orchestrate it here. Since experts aren't fully implemented
        // as executable functions in this mock, we just return empty success.
        
        const result: IExpertExecutionResult = {
          expertId: expert.identifier,
          status: "SUCCESS",
          recommendations: [],
          executionTimeMs: Date.now() - startTime
        };
        results.push(result);
        
        EventBus.getInstance().publish(createReasoningEvent(ReasoningEventType.EXPERT_EXECUTED, { expertId: expert.identifier, status: "SUCCESS" }));
      } catch (err: any) {
        results.push({
          expertId: expert.identifier,
          status: "FAILED",
          recommendations: [],
          executionTimeMs: Date.now() - startTime,
          error: err.message
        });
        EventBus.getInstance().publish(createReasoningEvent(ReasoningEventType.EXPERT_EXECUTED, { expertId: expert.identifier, status: "FAILED" }));
      }
    }

    return results;
  }
}
