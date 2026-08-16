/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 2 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Conversation Intelligence & Intent Resolution
 * 
 * ConversationRouter.ts: Central Routing Orchestrator.
 * Connects Intent Classification, Access Control Guard, and Context Resolution to output a Routing Decision.
 */

import {
  UKASessionModel,
  UKARouteDestination,
  UKARoutingResult,
  UKAUserIntent
} from "./UKATypes";
import { ConversationIntentEngine } from "./ConversationIntentEngine";
import { ConversationGuard } from "./ConversationGuard";
import { PropertyContextResolver } from "./PropertyContextResolver";
import { UKASessionManager } from "./UKASession";

export class ConversationRouter {
  /**
   * Main Pipeline Entry Point
   * Receives user text input and session model (or SessionManager instance), runs 4-step pipeline, and returns Routing Decision.
   */
  public static routeMessage(
    userMessage: string,
    sessionOrManager: UKASessionModel | UKASessionManager
  ): UKARoutingResult {
    const startTime = performance.now();
    const routingTrace: string[] = [];

    // 1. Extract Session Model & Context
    const session: UKASessionModel =
      sessionOrManager instanceof UKASessionManager
        ? sessionOrManager.getSession()
        : sessionOrManager;

    routingTrace.push(`Step 1: Session Loaded [Id: ${session.sessionId}, Role: ${session.userRole}, Mode: ${session.activeMode}]`);

    // 2. Step 2: Intent Classification
    const intentResult = ConversationIntentEngine.classifyIntent(userMessage);
    routingTrace.push(
      `Step 2: Intent Classified -> '${intentResult.intent}' (Confidence: ${Math.round(intentResult.confidence * 100)}%, Lang: ${intentResult.languageDetected}, TargetHint: ${intentResult.targetEntityHint || 'None'})`
    );

    // 3. Step 3: Access Control & Guard Evaluation
    const guardResult = ConversationGuard.evaluateAccess(
      session.userRole,
      intentResult.intent,
      session.activeMode
    );
    routingTrace.push(
      `Step 3: Guard Access Evaluated -> Allowed: ${guardResult.allowed} (${guardResult.reason})`
    );

    // 4. Step 4: Property Context Resolution
    const resolvedTarget = PropertyContextResolver.resolveContext(
      intentResult,
      session.context
    );
    routingTrace.push(
      `Step 4: Target Context Resolved -> Status: ${resolvedTarget.status}, TargetType: ${resolvedTarget.targetType} (${resolvedTarget.explanation})`
    );

    // 5. Step 5: Destination Module Determination
    const destination = this.determineDestination(intentResult.intent, resolvedTarget.targetType);
    routingTrace.push(`Step 5: Final Route Destination Assigned -> '${destination}'`);

    const endTime = performance.now();
    const processingTimeMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      destination,
      intent: intentResult.intent,
      guardResult,
      resolvedTarget,
      sessionId: session.sessionId,
      userRole: session.userRole,
      executionMetadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs,
        routingTrace
      }
    };
  }

  /**
   * Deterministic Mapping from Intent & Target Type to Destination Engine/Module
   */
  private static determineDestination(
    intent: UKAUserIntent,
    targetType: string
  ): UKARouteDestination {
    switch (intent) {
      case "DIAGNOSTIC_QUERY":
        return "DIAGNOSTIC_MODULE";

      case "DECISION_QUERY":
        return "DECISION_ENGINE";

      case "KNOWLEDGE_QUERY":
        return "KNOWLEDGE_FRAMEWORK";

      case "REPORT_QUERY":
        return "PROPERTY_HEALTH_ENGINE";

      case "CONSULTANT_QUERY":
        return "CONSULTANT_SUITE";

      case "MEMBERSHIP_QUERY":
        return "MEMBERSHIP_MODULE";

      case "PROPERTY_QUERY":
        if (targetType === "FINDING") return "DECISION_ENGINE";
        if (targetType === "FLOOR") return "WORKSPACE";
        return "PROPERTY_HEALTH_ENGINE";

      case "GENERAL_QUERY":
        return "KNOWLEDGE_FRAMEWORK";

      default:
        return "KNOWLEDGE_FRAMEWORK";
    }
  }
}
