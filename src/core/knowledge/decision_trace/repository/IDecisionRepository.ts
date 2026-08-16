import { IDecisionTrace } from "../models/DecisionModels";

export interface IDecisionRepository {
  createDecision(decision: IDecisionTrace): Promise<IDecisionTrace>;
  updateDecision(decision: IDecisionTrace): Promise<IDecisionTrace>;
  getDecision(decisionId: string): Promise<IDecisionTrace | null>;
  listDecisionsByTwin(twinId: string): Promise<IDecisionTrace[]>;
  listDecisionsByProject(projectId: string): Promise<IDecisionTrace[]>;
}
