/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT 8
 *         UNIVERSAL WORKFLOW CONTEXT MANAGER
 * ============================================================================
 * 
 * Safe state-mutation wrapper for WorkflowContext. Ensures clean decoupling 
 * of data propagation between downstream, upstream, and sibling analytical engines.
 */

import { WorkflowContext, WorkflowExecutionMetadata } from "./WorkflowTypes";
import { 
  CalculationProject, 
  CalculationProperty, 
  CalculationFloor, 
  CalculationCompass, 
  CalculationSpatialData, 
  KnowledgeReference, 
  TriggeredRule 
} from "../calculation/CalculationTypes";
import { 
  InterpretationFinding, 
  InterpretationRecommendation 
} from "../interpretation/InterpretationTypes";
import { ProfessionalReport } from "../report/ReportEngine";
import { WorkspaceKnowledgeModel } from "../../types/workspaceKnowledgeModel";

export class WorkflowContextManager {
  private context: WorkflowContext;

  constructor(initial: {
    project?: CalculationProject;
    property?: CalculationProperty;
    floor?: CalculationFloor;
    compass?: CalculationCompass;
    spatialData?: CalculationSpatialData;
    workspaceModel?: WorkspaceKnowledgeModel;
    executorEmail?: string;
    environmentUrl?: string;
  }) {
    const timestamp = new Date().toISOString();
    
    const metadata: WorkflowExecutionMetadata = {
      executorEmail: initial.executorEmail || "system-executor@urjaflux.com",
      triggeredAt: timestamp,
      environmentUrl: initial.environmentUrl || "https://ai.studio/build",
      isStagedRun: false
    };

    this.context = {
      project: initial.project || {
        id: "PROJ-DFT",
        name: "Default Architecture Project",
        code: "DAP",
        status: "ACTIVE"
      },
      property: initial.property || {
        id: "PROP-DFT",
        name: "Default Spatial Plot",
        address: "Vedic Corridor Zone 1",
        plotSize: "2400 sq.ft."
      },
      floor: initial.floor,
      compass: initial.compass || {
        northAngle: 0,
        confidence: 1.0
      },
      spatialData: initial.spatialData || {
        rooms: [],
        boundary: []
      },
      workspaceModel: initial.workspaceModel,
      knowledgeReferences: [],
      triggeredRules: [],
      calculationResults: {},
      findings: [],
      recommendations: [],
      pluginContext: {},
      variables: {},
      metadata
    };
  }

  /**
   * Safe read access to the underlying WorkflowContext.
   */
  public getRaw(): WorkflowContext {
    return this.context;
  }

  /**
   * Replaces or merges part of the context fields.
   */
  public update(partial: Partial<WorkflowContext>): void {
    this.context = {
      ...this.context,
      ...partial,
      // Protect nested sub-objects while merging
      pluginContext: {
        ...this.context.pluginContext,
        ...(partial.pluginContext || {})
      },
      variables: {
        ...this.context.variables,
        ...(partial.variables || {})
      },
      calculationResults: {
        ...this.context.calculationResults,
        ...(partial.calculationResults || {})
      }
    };
  }

  /**
   * Appends scriptural references fetched by the Knowledge Engine.
   */
  public addKnowledgeReferences(refs: KnowledgeReference[]): void {
    const existingIds = new Set(this.context.knowledgeReferences.map(r => `${r.bookId}-${r.chapter}-${r.verse}`));
    refs.forEach(ref => {
      const key = `${ref.bookId}-${ref.chapter}-${ref.verse}`;
      if (!existingIds.has(key)) {
        this.context.knowledgeReferences.push(ref);
      }
    });
  }

  /**
   * Appends rules triggered during condition execution.
   */
  public addTriggeredRules(rules: TriggeredRule[]): void {
    const existingIds = new Set(this.context.triggeredRules.map(r => r.ruleId));
    rules.forEach(rule => {
      if (!existingIds.has(rule.ruleId)) {
        this.context.triggeredRules.push(rule);
      }
    });
  }

  /**
   * Records calculated variable results.
   */
  public setCalculationResult(key: string, value: number): void {
    this.context.calculationResults[key] = value;
  }

  /**
   * Appends high-fidelity interpreted findings.
   */
  public addFindings(findings: InterpretationFinding[]): void {
    const existingIds = new Set(this.context.findings.map(f => f.id));
    findings.forEach(finding => {
      if (!existingIds.has(finding.id)) {
        this.context.findings.push(finding);
      }
    });
  }

  /**
   * Appends custom remedial recommendations.
   */
  public addRecommendations(recs: InterpretationRecommendation[]): void {
    const existingIds = new Set(this.context.recommendations.map(r => r.id));
    recs.forEach(rec => {
      if (!existingIds.has(rec.id)) {
        this.context.recommendations.push(rec);
      }
    });
  }

  /**
   * Attaches the final client report output.
   */
  public setFinalReport(report: ProfessionalReport): void {
    this.context.finalReport = report;
  }

  /**
   * Validates the workflow context for pipeline execution correctness.
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.context.project.id) {
      errors.push("Validation Error: Context Project must possess a valid, non-empty ID.");
    }
    if (!this.context.property.id) {
      errors.push("Validation Error: Context Property must possess a valid, non-empty ID.");
    }
    if (this.context.compass.northAngle < 0 || this.context.compass.northAngle >= 360) {
      errors.push("Validation Error: Compass North Angle must be normalized in the range [0, 360) degrees.");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
