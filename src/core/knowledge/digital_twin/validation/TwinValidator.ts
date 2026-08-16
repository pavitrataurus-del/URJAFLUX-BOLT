import { IDigitalTwin, ITwinObject } from "../models/TwinModels";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class TwinValidator {
  private static instance: TwinValidator;

  private constructor() {}

  public static getInstance(): TwinValidator {
    if (!TwinValidator.instance) {
      TwinValidator.instance = new TwinValidator();
    }
    return TwinValidator.instance;
  }

  public validateTwin(twin: IDigitalTwin): boolean {
    const objectIds = new Set<string>();
    
    if (!twin.id || !twin.projectId || !twin.floorId) {
      throw new EnterpriseError("Missing core twin identifiers", { category: ErrorCategory.VALIDATION });
    }

    // 1. Duplicate objects
    for (const obj of twin.objects) {
      if (objectIds.has(obj.id)) {
        throw new EnterpriseError(`Duplicate object detected: ${obj.id}`, { category: ErrorCategory.VALIDATION });
      }
      objectIds.add(obj.id);
      
      this.validateObject(obj);
    }

    // 2. Broken relationships
    for (const obj of twin.objects) {
      for (const rel of obj.relationships) {
        if (!objectIds.has(rel.targetId) && rel.targetId !== obj.id) { 
           // Target might be outside in a broader model, but for strict validation we assume self-contained
           // Let's just log or ignore if we want to allow cross-floor links, but the sprint says "validate broken relationships"
           // So let's throw. Wait, tests might have external targets? In my mock test, target is "so_2" which is in the twin.
           throw new EnterpriseError(`Broken relationship: Target ${rel.targetId} not found`, { category: ErrorCategory.VALIDATION });
        }
      }
    }
    
    return true;
  }
  
  private validateObject(obj: ITwinObject): boolean {
    if (!obj.id || !obj.canonicalType || !obj.ontologyReference) {
      throw new EnterpriseError(`Object ${obj.id || 'unknown'} missing required fields`, { category: ErrorCategory.VALIDATION });
    }
    
    if (!obj.geometry) {
      throw new EnterpriseError(`Object ${obj.id} has invalid geometry`, { category: ErrorCategory.VALIDATION });
    }
    
    return true;
  }
}
