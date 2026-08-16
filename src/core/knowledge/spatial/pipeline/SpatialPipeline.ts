import { IOcrResult, IOcrBlock, IOcrPage } from "../../ocr";
import { ISpatialObject } from "../models/SpatialModels";
import { OntologyResolver } from "../ontology/OntologyResolver";
import { GeometryEngine } from "../geometry/GeometryEngine";
import { RelationshipEngine } from "../relationships/RelationshipEngine";
import { ConfidenceEngine } from "../confidence/ConfidenceEngine";
import { SpatialValidationEngine } from "../validation/SpatialValidationEngine";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { SpatialEventType, createSpatialEvent } from "../events/SpatialEvents";

export enum SpatialJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface ISpatialJob {
  id: string;
  documentId: string;
  status: SpatialJobStatus;
  progress: number;
  result?: ISpatialObject[];
  error?: string;
  namespaceId: string;
}

export class SpatialPipeline {
  private static instance: SpatialPipeline;
  private jobs: Map<string, ISpatialJob> = new Map();

  private constructor() {}

  public static getInstance(): SpatialPipeline {
    if (!SpatialPipeline.instance) {
      SpatialPipeline.instance = new SpatialPipeline();
    }
    return SpatialPipeline.instance;
  }

  public async startPipeline(ocrResult: IOcrResult, namespaceId: string): Promise<string> {
    const jobId = `spatial_${ocrResult.documentId}_${Date.now()}`;
    const job: ISpatialJob = {
      id: jobId,
      documentId: ocrResult.documentId,
      status: SpatialJobStatus.PENDING,
      progress: 0,
      namespaceId
    };
    
    this.jobs.set(jobId, job);
    EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.SPATIAL_PIPELINE_STARTED, { jobId, documentId: ocrResult.documentId }));

    this.processJob(job, ocrResult).catch(e => {
      console.error(`Spatial Job ${jobId} failed:`, e);
    });

    return jobId;
  }

  private async processJob(job: ISpatialJob, ocrResult: IOcrResult): Promise<void> {
    job.status = SpatialJobStatus.PROCESSING;
    
    try {
      const ontologyResolver = OntologyResolver.getInstance();
      const geometryEngine = GeometryEngine.getInstance();
      const confidenceEngine = ConfidenceEngine.getInstance();
      const relationshipEngine = RelationshipEngine.getInstance();
      const validator = SpatialValidationEngine.getInstance();

      const spatialObjects: ISpatialObject[] = [];
      let totalBlocks = 0;
      let processedBlocks = 0;
      
      ocrResult.pages.forEach(p => totalBlocks += (p.blocks ? p.blocks.length : 0));

      for (const page of ocrResult.pages) {
        if (!page.blocks) continue;

        for (const block of page.blocks) {
          // @ts-ignore
          if (job.status === SpatialJobStatus.CANCELLED) return;
          // @ts-ignore
          while (job.status === SpatialJobStatus.PAUSED) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // @ts-ignore
          if (job.status === SpatialJobStatus.CANCELLED) return;
          }

          // We extract text from block to pass to ontology resolver
          // For simplicity, we just join paragraph texts.
          const blockText = block.paragraphs.map(p => p.lines.map(l => l.text).join(" ")).join(" ");
          
          if (!blockText) continue;

          // 1. Resolve Ontology
          const resolution = ontologyResolver.resolve(blockText, job.namespaceId);
          EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.ONTOLOGY_RESOLVED, { blockId: block.id, resolution }));

          // 2. Associate Geometry
          const geometry = geometryEngine.associateGeometry(block.boundingBox);
          EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.GEOMETRY_ASSOCIATED, { blockId: block.id, geometry }));

          // 3. Confidence Calculation
          // Initially, relationship confidence is 1.0 (will be refined later)
          const confidence = confidenceEngine.calculateConfidence(
             block.confidence, 
             resolution.confidence, 
             0.9, // naive geometry confidence
             1.0
          );
          EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.CONFIDENCE_CALCULATED, { blockId: block.id, confidence }));

          // 4. Create Spatial Object
          const obj: ISpatialObject = {
            id: `so_${block.id}`,
            documentId: job.documentId,
            pageNumber: page.pageNumber,
            canonicalType: resolution.canonicalType,
            ontologyReference: resolution.ontologyReference,
            geometry,
            confidence,
            namespaceId: job.namespaceId,
            relationships: [],
            metadata: { sourceBlockId: block.id }
          };

          spatialObjects.push(obj);
          EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.SPATIAL_OBJECT_CREATED, { objectId: obj.id }));

          processedBlocks++;
          job.progress = Math.floor((processedBlocks / totalBlocks) * 100);
        }
      }

      // 5. Build Relationships
      relationshipEngine.buildRelationships(spatialObjects);
      EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.RELATIONSHIP_CREATED, { documentId: job.documentId, count: spatialObjects.reduce((acc, obj) => acc + obj.relationships.length, 0) }));

      // 6. Validation
      validator.validateCollection(spatialObjects);

      job.result = spatialObjects;
      job.status = SpatialJobStatus.COMPLETED;
      job.progress = 100;
      
      EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.SPATIAL_PIPELINE_COMPLETED, { jobId: job.id, documentId: job.documentId }));

    } catch (error: any) {
      job.status = SpatialJobStatus.FAILED;
      job.error = error.message;
      EventBus.getInstance().publish(createSpatialEvent(SpatialEventType.SPATIAL_PIPELINE_FAILED, { jobId: job.id, documentId: job.documentId, error: error.message }));
    }
  }

  public getJob(jobId: string): ISpatialJob | undefined {
    return this.jobs.get(jobId);
  }
  
  public cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && (job.status === SpatialJobStatus.PENDING || job.status === SpatialJobStatus.PROCESSING || job.status === SpatialJobStatus.PAUSED)) {
      job.status = SpatialJobStatus.CANCELLED;
    }
  }

  public pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === SpatialJobStatus.PROCESSING) {
      job.status = SpatialJobStatus.PAUSED;
    }
  }

  public resumeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === SpatialJobStatus.PAUSED) {
      job.status = SpatialJobStatus.PROCESSING;
    }
  }

  public clear(): void {
    this.jobs.clear();
  }
}
