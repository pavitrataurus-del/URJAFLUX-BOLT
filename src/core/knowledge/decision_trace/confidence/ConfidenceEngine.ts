import { IConfidenceScores } from "../models/DecisionModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { DecisionEventType, createDecisionEvent } from "../events/DecisionEvents";

export class DecisionConfidenceEngine {
  private static instance: DecisionConfidenceEngine;

  private constructor() {}

  public static getInstance(): DecisionConfidenceEngine {
    if (!DecisionConfidenceEngine.instance) {
      DecisionConfidenceEngine.instance = new DecisionConfidenceEngine();
    }
    return DecisionConfidenceEngine.instance;
  }

  public aggregateConfidence(scores: Partial<IConfidenceScores>, weights?: Record<string, number>): IConfidenceScores {
    const defaultWeights = {
      ocrConfidence: 0.1,
      ontologyConfidence: 0.2,
      geometryConfidence: 0.2,
      graphConfidence: 0.2,
      expertConfidence: 0.3
    };

    const appliedWeights = weights || defaultWeights;
    let composite = 0;
    let totalWeight = 0;

    const addScore = (score: number | undefined, weight: number) => {
      if (score !== undefined) {
        composite += score * weight;
        totalWeight += weight;
      }
    };

    addScore(scores.ocrConfidence, appliedWeights.ocrConfidence);
    addScore(scores.ontologyConfidence, appliedWeights.ontologyConfidence);
    addScore(scores.geometryConfidence, appliedWeights.geometryConfidence);
    addScore(scores.graphConfidence, appliedWeights.graphConfidence);
    addScore(scores.expertConfidence, appliedWeights.expertConfidence);

    const compositeConfidence = totalWeight > 0 ? composite / totalWeight : 0;

    const result: IConfidenceScores = {
      ocrConfidence: scores.ocrConfidence,
      ontologyConfidence: scores.ontologyConfidence,
      geometryConfidence: scores.geometryConfidence,
      graphConfidence: scores.graphConfidence,
      expertConfidence: scores.expertConfidence,
      compositeConfidence
    };

    EventBus.getInstance().publish(createDecisionEvent(DecisionEventType.CONFIDENCE_CALCULATED, { compositeConfidence }));

    return result;
  }
}
