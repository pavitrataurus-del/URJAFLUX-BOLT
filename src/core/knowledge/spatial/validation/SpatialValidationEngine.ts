import { ISpatialObject } from "../models/SpatialModels";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class SpatialValidationEngine {
  private static instance: SpatialValidationEngine;

  private constructor() {}

  public static getInstance(): SpatialValidationEngine {
    if (!SpatialValidationEngine.instance) {
      SpatialValidationEngine.instance = new SpatialValidationEngine();
    }
    return SpatialValidationEngine.instance;
  }

  public validateObject(obj: ISpatialObject): boolean {
    if (!obj.id || !obj.documentId || !obj.namespaceId) {
      throw new EnterpriseError("Missing required spatial object identifiers", { category: ErrorCategory.VALIDATION });
    }

    if (!obj.ontologyReference) {
      throw new EnterpriseError("Missing ontology reference", { category: ErrorCategory.VALIDATION });
    }

    if (!obj.geometry || !obj.geometry.vertices) {
      throw new EnterpriseError("Invalid geometry", { category: ErrorCategory.VALIDATION });
    }
    
    if (obj.confidence.compositeConfidence < 0.2) {
       throw new EnterpriseError("Confidence below minimum threshold", { category: ErrorCategory.VALIDATION });
    }

    return true;
  }

  public validateCollection(objects: ISpatialObject[]): boolean {
    const ids = new Set<string>();
    
    for (const obj of objects) {
      if (ids.has(obj.id)) {
        throw new EnterpriseError(`Duplicate object detected: ${obj.id}`, { category: ErrorCategory.VALIDATION });
      }
      ids.add(obj.id);
      
      this.validateObject(obj);
    }
    
    return true;
  }
}
