/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 5 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Conversation State Manager
 * 
 * ConversationStateManager.ts: Active Conversation State Machine Engine.
 * Manages consultation state flow and transitions across the consultation lifecycle.
 */

import { UKAConsultationState } from "./UKATypes";
import { ConsultationMemoryEngine } from "./ConsultationMemoryEngine";

export type StateChangeListener = (
  previousState: UKAConsultationState,
  newState: UKAConsultationState,
  sessionId: string
) => void;

export class ConversationStateManager {
  private static listeners: Set<StateChangeListener> = new Set();

  /**
   * Allowed State Transitions Matrix
   */
  private static readonly TRANSITION_RULES: Record<UKAConsultationState, UKAConsultationState[]> = {
    INITIAL: ["PROPERTY_SELECTED", "CONSULTATION_ACTIVE"],
    PROPERTY_SELECTED: ["ENTITY_SELECTED", "CONSULTATION_ACTIVE", "REPORT_DISCUSSION"],
    ENTITY_SELECTED: ["CONSULTATION_ACTIVE", "FOLLOW_UP", "COMPARISON"],
    CONSULTATION_ACTIVE: ["FOLLOW_UP", "COMPARISON", "REPORT_DISCUSSION", "ENTITY_SELECTED", "COMPLETED"],
    FOLLOW_UP: ["CONSULTATION_ACTIVE", "COMPARISON", "REPORT_DISCUSSION", "ENTITY_SELECTED"],
    COMPARISON: ["CONSULTATION_ACTIVE", "FOLLOW_UP", "REPORT_DISCUSSION"],
    REPORT_DISCUSSION: ["CONSULTATION_ACTIVE", "PROPERTY_SELECTED", "COMPLETED"],
    COMPLETED: ["INITIAL", "PROPERTY_SELECTED"]
  };

  /**
   * Get active conversation state for a session
   */
  public static getState(sessionId: string): UKAConsultationState {
    const memory = ConsultationMemoryEngine.getOrCreateMemory(sessionId);
    return memory.activeState || "INITIAL";
  }

  /**
   * Transition conversation state for a session
   */
  public static transitionTo(
    sessionId: string,
    targetState: UKAConsultationState
  ): { success: boolean; currentState: UKAConsultationState; reason?: string } {
    const memory = ConsultationMemoryEngine.getOrCreateMemory(sessionId);
    const currentState = memory.activeState || "INITIAL";

    if (currentState === targetState) {
      return { success: true, currentState };
    }

    const allowedNext = this.TRANSITION_RULES[currentState];
    if (!allowedNext.includes(targetState)) {
      return {
        success: false,
        currentState,
        reason: `Invalid transition from state '${currentState}' to '${targetState}'.`
      };
    }

    memory.activeState = targetState;
    memory.lastUpdatedTimestamp = new Date().toISOString();

    // Notify listeners
    this.notifyListeners(currentState, targetState, sessionId);

    return { success: true, currentState: targetState };
  }

  /**
   * Derive target state automatically from user intent and target type
   */
  public static deriveStateFromIntent(intent: string, targetType: string): UKAConsultationState {
    switch (intent) {
      case "PROPERTY_QUERY":
        return "PROPERTY_SELECTED";
      case "DECISION_QUERY":
      case "CONSULTANT_QUERY":
        return targetType === "ENTITY" || targetType === "FINDING" ? "ENTITY_SELECTED" : "CONSULTATION_ACTIVE";
      case "REPORT_QUERY":
        return "REPORT_DISCUSSION";
      case "DIAGNOSTIC_QUERY":
        return "CONSULTATION_ACTIVE";
      case "KNOWLEDGE_QUERY":
      case "GENERAL_QUERY":
      default:
        return "FOLLOW_UP";
    }
  }

  /**
   * Register state change listener
   */
  public static subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners(prev: UKAConsultationState, next: UKAConsultationState, sessionId: string): void {
    for (const listener of this.listeners) {
      try {
        listener(prev, next, sessionId);
      } catch (err) {
        console.error("Error in ConversationStateManager listener:", err);
      }
    }
  }
}
