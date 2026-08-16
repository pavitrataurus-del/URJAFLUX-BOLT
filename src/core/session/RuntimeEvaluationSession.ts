/**
 * URJAFLUX AI OS — SPRINT 4A.9
 * Single Execution Session & Runtime State Store
 * 
 * Enforces a single immutable Runtime Evaluation Session generated solely by executeVastuAnalysisPipeline().
 * All UI components (ReportPanel, UKAWorkspace, PDF Export, Decision Timeline, Coverage, Property Health, Consultant Suite)
 * consume ONLY from this session.
 */

import { useState, useEffect } from "react";
import { PropertyRecognitionSummary } from "../../recognition/types";
import { DecisionEngineExecutionResult } from "../../engines/decision/UrjafluxDecisionEngine";
import { PropertyHealthIndex } from "../../engines/decision/types";
import { EvaluationCoverageReport } from "../../engines/validation/EvaluationCoverageEngine";
import { CanonicalFinding } from "../findings/CanonicalFinding";
import { DoshaItem, ObjectReportItem } from "../../services/vastuAnalysisOrchestrator";
import { ClientDiscoveryRecord } from "../../types/clientDiscovery";
import { clientDiscoveryService } from "../../services/clientDiscoveryService";
import { ClientContextProfile } from "../../types/clientContext";
import { clientContextIntelligenceEngine } from "../../services/clientContextIntelligenceEngine";

export interface ConsumerBindingFlags {
  reportBound: boolean;
  ukaBound: boolean;
  pdfBound: boolean;
  coverageBound: boolean;
  consultantBound: boolean;
}

export interface RuntimeEvaluationSession {
  executionId: string;
  timestamp: number;
  formattedTimestamp: string;
  pipelineVersion: string;
  propertyName: string;
  propertyId: string;
  clientName: string;
  northRotation: number;
  recognitionCount: number;
  findingCount: number;
  ruleCount: number;
  overallScore: number | null;
  hasExecuted: boolean;
  status: "NOT_EXECUTED" | "EXECUTING" | "COMPLETED" | "FAILED";

  // Pipeline artifacts
  recognitionSummary: PropertyRecognitionSummary | null;
  decisionResult: DecisionEngineExecutionResult | null;
  doshas: DoshaItem[];
  objectReportItems: ObjectReportItem[];
  canonicalFindings: CanonicalFinding[];
  propertyHealth: PropertyHealthIndex | null;
  coverageReport: EvaluationCoverageReport | null;

  // KIE Sprint-2 Module 1: Client Discovery Integration
  clientDiscovery: ClientDiscoveryRecord | null;
  isDiscoveryCompleted: boolean;

  // KIE Sprint-2 Module 2: Client Context Intelligence Engine (CCIE) Profile
  clientContextProfile: ClientContextProfile | null;

  // Consumer Binding Flags
  consumersBound: ConsumerBindingFlags;
}

export function createEmptyRuntimeSession(): RuntimeEvaluationSession {
  const currentDisc = clientDiscoveryService.getDiscovery();
  const isDiscComplete = clientDiscoveryService.isCompleted();
  const summary = clientDiscoveryService.getDiscoverySummary();

  let contextProfile: ClientContextProfile | null = null;
  if (summary) {
    try {
      contextProfile = clientContextIntelligenceEngine.processFromSummary(summary);
    } catch (e) {
      console.warn("RuntimeEvaluationSession: Could not generate CCIE Profile:", e);
    }
  }

  return {
    executionId: "UNEXECUTED_SESSION",
    timestamp: 0,
    formattedTimestamp: "Not Executed",
    pipelineVersion: "4A.9-PROD",
    propertyName: currentDisc.clientInfo.clientName ? `${currentDisc.propertyCategory} (${currentDisc.propertyOwnership})` : "Unassigned Property",
    propertyId: "UNASSIGNED",
    clientName: currentDisc.clientInfo.clientName || "Unassigned Client",
    northRotation: 0,
    recognitionCount: 0,
    findingCount: 0,
    ruleCount: 0,
    overallScore: null,
    hasExecuted: false,
    status: "NOT_EXECUTED",
    recognitionSummary: null,
    decisionResult: null,
    doshas: [],
    objectReportItems: [],
    canonicalFindings: [],
    propertyHealth: null,
    coverageReport: null,
    clientDiscovery: currentDisc,
    isDiscoveryCompleted: isDiscComplete,
    clientContextProfile: contextProfile,
    consumersBound: {
      reportBound: false,
      ukaBound: false,
      pdfBound: false,
      coverageBound: false,
      consultantBound: false
    }
  };
}

class SessionStore {
  private currentSession: RuntimeEvaluationSession = createEmptyRuntimeSession();
  private listeners: Set<() => void> = new Set();

  constructor() {
    clientDiscoveryService.subscribe(() => {
      const updatedDisc = clientDiscoveryService.getDiscovery();
      const isDiscComplete = clientDiscoveryService.isCompleted();
      const summary = clientDiscoveryService.getDiscoverySummary();

      let contextProfile: ClientContextProfile | null = null;
      if (summary) {
        try {
          contextProfile = clientContextIntelligenceEngine.processFromSummary(summary);
        } catch (e) {
          console.warn("Could not generate CCIE Profile on discovery update:", e);
        }
      }

      this.currentSession = {
        ...this.currentSession,
        clientDiscovery: updatedDisc,
        isDiscoveryCompleted: isDiscComplete,
        clientContextProfile: contextProfile
      };
      this.notify();
    });
  }

  public getSession(): RuntimeEvaluationSession {
    return this.currentSession;
  }

  public setSession(session: RuntimeEvaluationSession): void {
    // Preserve existing bound consumers if execution hash matches
    const existingBound = this.currentSession.executionId === session.executionId 
      ? this.currentSession.consumersBound 
      : {
          reportBound: false,
          ukaBound: false,
          pdfBound: false,
          coverageBound: false,
          consultantBound: false
        };

    this.currentSession = {
      ...session,
      consumersBound: existingBound
    };
    this.notify();
  }

  public clearSession(): void {
    this.currentSession = createEmptyRuntimeSession();
    this.notify();
  }

  public markConsumerBound(consumer: keyof ConsumerBindingFlags): void {
    if (!this.currentSession.consumersBound[consumer]) {
      this.currentSession = {
        ...this.currentSession,
        consumersBound: {
          ...this.currentSession.consumersBound,
          [consumer]: true
        }
      };
      this.notify();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const RuntimeEvaluationSessionStore = new SessionStore();

export function useRuntimeEvaluationSession(): RuntimeEvaluationSession {
  const [session, setSession] = useState<RuntimeEvaluationSession>(() =>
    RuntimeEvaluationSessionStore.getSession()
  );

  useEffect(() => {
    return RuntimeEvaluationSessionStore.subscribe(() => {
      setSession({ ...RuntimeEvaluationSessionStore.getSession() });
    });
  }, []);

  return session;
}

export function generateExecutionId(timestamp: number = Date.now()): string {
  const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EXEC-${timestamp}-${hash}`;
}
