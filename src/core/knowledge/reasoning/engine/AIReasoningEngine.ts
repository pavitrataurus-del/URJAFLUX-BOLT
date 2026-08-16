import { IReasoningContext, IExpertExecutionResult } from "../models/ReasoningModels";
import { ExpertExecutionEngine } from "../expert/ExpertExecutionEngine";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { ReasoningEventType, createReasoningEvent } from "../events/ReasoningEvents";

export class AIReasoningEngine {
  private static instance: AIReasoningEngine;

  private constructor() {}

  public static getInstance(): AIReasoningEngine {
    if (!AIReasoningEngine.instance) {
      AIReasoningEngine.instance = new AIReasoningEngine();
    }
    return AIReasoningEngine.instance;
  }

  public async runAnalysis(context: IReasoningContext): Promise<IExpertExecutionResult[]> {
    EventBus.getInstance().publish(createReasoningEvent(ReasoningEventType.REASONING_STARTED, { twinId: context.twinId, namespace: context.namespace }));
    
    // The engine coordinates reasoning by executing experts
    const results = await ExpertExecutionEngine.getInstance().executeExperts(context);
    
    return results;
  }
}
