import { ISpatialConfidence } from "../models/SpatialModels";

export class ConfidenceEngine {
  private static instance: ConfidenceEngine;

  private constructor() {}

  public static getInstance(): ConfidenceEngine {
    if (!ConfidenceEngine.instance) {
      ConfidenceEngine.instance = new ConfidenceEngine();
    }
    return ConfidenceEngine.instance;
  }

  public calculateConfidence(
    ocrConfidence: number,
    ontologyConfidence: number,
    geometryConfidence: number,
    relationshipConfidence: number
  ): ISpatialConfidence {
    
    // Naive composite: weighted average
    // In a real scenario, this would be much more sophisticated
    const weights = { ocr: 0.3, ontology: 0.4, geometry: 0.2, relationship: 0.1 };
    
    const compositeConfidence = 
      (ocrConfidence * weights.ocr) + 
      (ontologyConfidence * weights.ontology) + 
      (geometryConfidence * weights.geometry) + 
      (relationshipConfidence * weights.relationship);
      
    const evidenceChain = [
      `OCR: ${ocrConfidence}`,
      `Ontology: ${ontologyConfidence}`,
      `Geometry: ${geometryConfidence}`,
      `Relationship: ${relationshipConfidence}`,
      `Composite: ${compositeConfidence}`
    ];

    return {
      ocrConfidence,
      ontologyConfidence,
      geometryConfidence,
      relationshipConfidence,
      compositeConfidence,
      evidenceChain
    };
  }
}
