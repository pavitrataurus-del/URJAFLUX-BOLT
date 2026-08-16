import { IDecisionTrace, IStructuredExplanation } from "../models/DecisionModels";

export class ExplainabilityGenerator {
  private static instance: ExplainabilityGenerator;

  private constructor() {}

  public static getInstance(): ExplainabilityGenerator {
    if (!ExplainabilityGenerator.instance) {
      ExplainabilityGenerator.instance = new ExplainabilityGenerator();
    }
    return ExplainabilityGenerator.instance;
  }

  public generateExplanation(decision: IDecisionTrace): IStructuredExplanation {
    const evidenceSummary = decision.evidenceReferences.map(ev => 
      `Sourced from ${ev.knowledgeSource}${ev.documentId ? ` (Doc: ${ev.documentId})` : ''}`
    );

    return {
      decisionId: decision.id,
      summary: `Decision based on ${decision.evidenceReferences.length} pieces of evidence in namespace ${decision.namespace}.`,
      evidenceSummary,
      rulesConsulted: [...decision.rulesReferenced],
      expertsConsulted: [...decision.expertsInvolved],
      confidenceBreakdown: { ...decision.confidence },
      alternativePathsConsidered: [],
      validationStatus: "VALID"
    };
  }
}
