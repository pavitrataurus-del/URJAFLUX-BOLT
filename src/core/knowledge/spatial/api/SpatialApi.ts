import { SpatialPipeline, ISpatialJob } from "../pipeline/SpatialPipeline";
import { OntologyResolver, IOntologyMapping, IOntologyResolutionResult } from "../ontology/OntologyResolver";
import { ISpatialObject } from "../models/SpatialModels";
import { IOcrResult } from "../../ocr";

export class SpatialApi {
  private static instance: SpatialApi;

  private constructor() {}

  public static getInstance(): SpatialApi {
    if (!SpatialApi.instance) {
      SpatialApi.instance = new SpatialApi();
    }
    return SpatialApi.instance;
  }

  // Configuration
  public registerOntologyMapping(mapping: IOntologyMapping): void {
    OntologyResolver.getInstance().registerMapping(mapping);
  }

  // Pipeline
  public async runSpatialPipeline(ocrResult: IOcrResult, namespaceId: string): Promise<string> {
    return SpatialPipeline.getInstance().startPipeline(ocrResult, namespaceId);
  }

  public getPipelineStatus(jobId: string): string | undefined {
    return SpatialPipeline.getInstance().getJob(jobId)?.status;
  }

  public getSpatialObjects(jobId: string): ISpatialObject[] | undefined {
    return SpatialPipeline.getInstance().getJob(jobId)?.result;
  }
  
  public resolveObject(text: string, namespaceId: string): IOntologyResolutionResult {
     return OntologyResolver.getInstance().resolve(text, namespaceId);
  }
  
  public cancelPipeline(jobId: string): void {
    SpatialPipeline.getInstance().cancelJob(jobId);
  }
}
