/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 5 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Consultation Memory Engine
 * 
 * ConsultationMemoryEngine.ts: Central Consultation Memory & Context Resolution Architecture.
 * Remembers the property consultation (property, floor, entity, finding, recommendation, style, language).
 * Includes memory hierarchy, expiration policies, and persistence readiness.
 */

import {
  UKAConsultationContextMemory,
  UKAUserRole,
  UKALanguage,
  UKAConsultationStyle,
  UKAConsultationState,
  UKAMemoryScope,
  UKAMemoryPersistenceAdapter,
  UKAFounderAuditPackage
} from "./UKATypes";

export interface UKAContextResolutionResult {
  resolved: boolean;
  entityName?: string;
  findingId?: string;
  finding?: any;
  recommendation?: any;
  reason?: "SUCCESS" | "CONTEXT_REQUIRED" | "AMBIGUOUS";
}

/**
 * InMemory Persistence Adapter (Default Implementation)
 * Future database integration (Firestore/CloudSQL) connects via UKAMemoryPersistenceAdapter
 */
export class InMemoryMemoryPersistenceAdapter implements UKAMemoryPersistenceAdapter {
  private memoryStore: Map<string, UKAConsultationContextMemory> = new Map();
  private historyStore: Map<string, any[]> = new Map();

  public async saveSessionMemory(memory: UKAConsultationContextMemory): Promise<void> {
    this.memoryStore.set(memory.sessionId, JSON.parse(JSON.stringify(memory)));
  }

  public async loadSessionMemory(sessionId: string): Promise<UKAConsultationContextMemory | null> {
    const mem = this.memoryStore.get(sessionId);
    return mem ? JSON.parse(JSON.stringify(mem)) : null;
  }

  public async appendHistoryRecord(sessionId: string, record: any): Promise<void> {
    const list = this.historyStore.get(sessionId) || [];
    list.push(record);
    this.historyStore.set(sessionId, list);
  }

  public async loadHistory(sessionId: string): Promise<any[]> {
    return this.historyStore.get(sessionId) || [];
  }
}

export class ConsultationMemoryEngine {
  private static persistenceAdapter: UKAMemoryPersistenceAdapter = new InMemoryMemoryPersistenceAdapter();
  private static memoryCache: Map<string, UKAConsultationContextMemory> = new Map();

  /**
   * Set custom persistence adapter (e.g. for Firestore or CloudSQL in production)
   */
  public static setPersistenceAdapter(adapter: UKAMemoryPersistenceAdapter): void {
    this.persistenceAdapter = adapter;
  }

  /**
   * Get or initialize session memory context
   */
  public static getOrCreateMemory(sessionId: string, role: UKAUserRole = "VISITOR"): UKAConsultationContextMemory {
    let memory = this.memoryCache.get(sessionId);

    if (!memory) {
      memory = {
        sessionId,
        userRole: role,
        selectedLanguage: "EN",
        consultationStyle: this.getDefaultStyleForRole(role),
        activeState: "INITIAL",
        visitorUsage: {
          questionsUsed: 0,
          maxFreeQuestions: 2,
          gatingPromptDisplayed: false
        },
        lastUpdatedTimestamp: new Date().toISOString()
      };
      this.memoryCache.set(sessionId, memory);
      this.persistenceAdapter.saveSessionMemory(memory);
    }

    return memory;
  }

  /**
   * Update active property context (Session-Long Scope)
   */
  public static updatePropertyContext(
    sessionId: string,
    propertyId: string,
    propertyName: string,
    floorId?: string,
    floorName?: string
  ): UKAConsultationContextMemory {
    const memory = this.getOrCreateMemory(sessionId);
    memory.currentPropertyId = propertyId;
    memory.currentPropertyName = propertyName;
    if (floorId) memory.currentFloorId = floorId;
    if (floorName) memory.currentFloorName = floorName;
    memory.lastUpdatedTimestamp = new Date().toISOString();

    this.saveMemory(memory);
    return memory;
  }

  /**
   * Update active entity & finding context (Short-Lived Scope)
   */
  public static updateEntityContext(
    sessionId: string,
    entityId: string,
    entityName: string,
    findingId?: string,
    finding?: any,
    recommendation?: any
  ): UKAConsultationContextMemory {
    const memory = this.getOrCreateMemory(sessionId);
    memory.currentEntityId = entityId;
    memory.currentEntityName = entityName;
    if (findingId) memory.currentFindingId = findingId;
    if (finding) memory.currentFinding = finding;
    if (recommendation) memory.currentRecommendation = recommendation;
    memory.lastUpdatedTimestamp = new Date().toISOString();

    this.saveMemory(memory);
    return memory;
  }

  /**
   * Update User Language Preference (Long-Lived Scope)
   */
  public static updateLanguagePreference(sessionId: string, lang: UKALanguage): UKAConsultationContextMemory {
    const memory = this.getOrCreateMemory(sessionId);
    memory.selectedLanguage = lang;
    memory.lastUpdatedTimestamp = new Date().toISOString();
    this.saveMemory(memory);
    return memory;
  }

  /**
   * Update Consultation Style Preference (Long-Lived Scope)
   */
  public static updateConsultationStyle(sessionId: string, style: UKAConsultationStyle): UKAConsultationContextMemory {
    const memory = this.getOrCreateMemory(sessionId);
    memory.consultationStyle = style;
    memory.lastUpdatedTimestamp = new Date().toISOString();
    this.saveMemory(memory);
    return memory;
  }

  /**
   * Track visitor question usage (Membership Memory)
   */
  public static incrementVisitorUsage(sessionId: string): { questionsUsed: number; isGated: boolean } {
    const memory = this.getOrCreateMemory(sessionId);
    memory.visitorUsage.questionsUsed += 1;

    const isGated = memory.userRole === "VISITOR" && memory.visitorUsage.questionsUsed > memory.visitorUsage.maxFreeQuestions;
    if (isGated) {
      memory.visitorUsage.gatingPromptDisplayed = true;
    }

    this.saveMemory(memory);
    return {
      questionsUsed: memory.visitorUsage.questionsUsed,
      isGated
    };
  }

  /**
   * Store Founder Diagnostics Package (Temporary Scope)
   */
  public static storeFounderDiagnostics(sessionId: string, diagnostics: UKAFounderAuditPackage): void {
    const memory = this.getOrCreateMemory(sessionId);
    if (memory.userRole === "FOUNDER") {
      memory.founderDiagnostics = diagnostics;
      this.saveMemory(memory);
    }
  }

  /**
   * Resolves implicit context for ambiguous user questions (e.g., "Alternative?", "Why?", "Show remedies")
   */
  public static resolveImplicitContext(sessionId: string, intent: string): UKAContextResolutionResult {
    const memory = this.getOrCreateMemory(sessionId);

    // If query requires an active entity/finding, check if memory holds one
    if (intent === "DECISION_QUERY" || intent === "CONSULTANT_QUERY" || intent === "DIAGNOSTIC_QUERY") {
      if (!memory.currentEntityId && !memory.currentFindingId) {
        return {
          resolved: false,
          reason: "CONTEXT_REQUIRED"
        };
      }

      return {
        resolved: true,
        entityName: memory.currentEntityName,
        findingId: memory.currentFindingId,
        finding: memory.currentFinding,
        recommendation: memory.currentRecommendation,
        reason: "SUCCESS"
      };
    }

    return { resolved: true, reason: "SUCCESS" };
  }

  /**
   * Enforce Memory Expiration Policies (Purge short-lived/temporary memory objects)
   */
  public static purgeExpiredMemory(sessionId: string, scope: UKAMemoryScope): void {
    const memory = this.getOrCreateMemory(sessionId);

    if (scope === "SHORT_LIVED") {
      delete memory.currentEntityId;
      delete memory.currentEntityName;
      delete memory.currentFindingId;
      delete memory.currentFinding;
      delete memory.currentRecommendation;
    } else if (scope === "TEMPORARY") {
      delete memory.founderDiagnostics;
    }

    this.saveMemory(memory);
  }

  private static getDefaultStyleForRole(role: UKAUserRole): UKAConsultationStyle {
    switch (role) {
      case "FOUNDER":
        return "FOUNDER";
      case "CONSULTANT":
        return "PROFESSIONAL_CONSULTANT";
      case "PAID_CUSTOMER":
        return "SIMPLE_HOMEOWNER";
      case "VISITOR":
      default:
        return "SIMPLE_HOMEOWNER";
    }
  }

  private static saveMemory(memory: UKAConsultationContextMemory): void {
    this.memoryCache.set(memory.sessionId, memory);
    this.persistenceAdapter.saveSessionMemory(memory);
  }
}
