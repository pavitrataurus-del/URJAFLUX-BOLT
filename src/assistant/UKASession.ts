/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 1 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Foundation & Architecture
 * 
 * UKASession.ts: Session Lifecycle & State Management Engine (Non-LLM Architecture Layer).
 */

import {
  UKASessionModel,
  UKAUserRole,
  UKAConsultationMode,
  UKAPropertyContext,
  UKAConversationContext,
  UKAMessage
} from "./UKATypes";
import { UKAPermissions } from "./UKAPermissions";
import { UKAContextManager } from "./UKAContext";

export class UKASessionManager {
  private session: UKASessionModel;
  private conversation: UKAConversationContext;

  constructor(userId: string = "USER-GUEST", role: UKAUserRole = "VISITOR", initialMode?: UKAConsultationMode) {
    const defaultMode: UKAConsultationMode = initialMode || "PROPERTY_CONSULTATION";
    const allowedMode = UKAPermissions.isModeAllowed(role, defaultMode)
      ? defaultMode
      : "PROPERTY_CONSULTATION";

    const timestamp = new Date().toISOString();
    const sessionId = `UKA-SES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    this.session = {
      sessionId,
      userId,
      userRole: role,
      activeMode: allowedMode,
      createdAt: timestamp,
      updatedAt: timestamp,
      context: UKAContextManager.createInitialContext(),
      permissions: UKAPermissions.getPermissionsForRole(role),
      metadata: {}
    };

    this.conversation = {
      sessionId,
      activeMode: allowedMode,
      messages: [],
      lastInteractionAt: timestamp
    };
  }

  /**
   * Get active session model snapshot
   */
  public getSession(): UKASessionModel {
    return { ...this.session };
  }

  /**
   * Get active session ID
   */
  public getSessionId(): string {
    return this.session.sessionId;
  }

  /**
   * Get current user role
   */
  public getUserRole(): UKAUserRole {
    return this.session.userRole;
  }

  /**
   * Update active user role (e.g., when user logs in or upgrades tier)
   */
  public setUserRole(newRole: UKAUserRole): boolean {
    this.session.userRole = newRole;
    this.session.permissions = UKAPermissions.getPermissionsForRole(newRole);
    this.session.updatedAt = new Date().toISOString();

    // Re-verify current consultation mode
    if (!UKAPermissions.isModeAllowed(newRole, this.session.activeMode)) {
      this.session.activeMode = "PROPERTY_CONSULTATION";
      this.conversation.activeMode = "PROPERTY_CONSULTATION";
    }

    return true;
  }

  /**
   * Get active consultation mode
   */
  public getActiveMode(): UKAConsultationMode {
    return this.session.activeMode;
  }

  /**
   * Switch active consultation mode with RBAC validation
   */
  public setConsultationMode(mode: UKAConsultationMode): { success: boolean; reason?: string } {
    if (!UKAPermissions.isModeAllowed(this.session.userRole, mode)) {
      return {
        success: false,
        reason: `Role '${this.session.userRole}' does not have permission to access '${mode}' consultation mode.`
      };
    }

    this.session.activeMode = mode;
    this.conversation.activeMode = mode;
    this.session.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Get property context
   */
  public getContext(): UKAPropertyContext {
    return { ...this.session.context };
  }

  /**
   * Update property context
   */
  public updateContext(updates: Partial<UKAPropertyContext>): UKAPropertyContext {
    this.session.context = UKAContextManager.updateContext(this.session.context, updates);
    this.session.updatedAt = new Date().toISOString();
    return { ...this.session.context };
  }

  /**
   * Get conversation context metadata
   */
  public getConversationContext(): UKAConversationContext {
    return { ...this.conversation };
  }

  /**
   * Append message to conversation context (data model only, no LLM call)
   */
  public appendMessage(message: Omit<UKAMessage, "id" | "timestamp" | "consultationMode">): UKAMessage {
    const newMsg: UKAMessage = {
      ...message,
      id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      consultationMode: this.session.activeMode
    };

    this.conversation.messages.push(newMsg);
    this.conversation.lastInteractionAt = newMsg.timestamp;
    this.session.updatedAt = newMsg.timestamp;
    return newMsg;
  }

  /**
   * Export session state snapshot
   */
  public exportSnapshot(): { session: UKASessionModel; conversation: UKAConversationContext } {
    return {
      session: JSON.parse(JSON.stringify(this.session)),
      conversation: JSON.parse(JSON.stringify(this.conversation))
    };
  }
}
