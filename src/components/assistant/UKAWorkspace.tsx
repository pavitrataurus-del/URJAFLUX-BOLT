/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 6 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Interactive Consultation Workspace
 * 
 * UKAWorkspace.tsx: Main Consultation Workspace Container.
 * Integrates UKAConversationPanel, ConsultationContextPanel, SmartActionPanel, and ConsultationTimelinePanel.
 * Connects all Sprint 4A engines (Intelligence, Memory, State Manager, History, Suggestions, Professional Response).
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  UserCheck
} from "lucide-react";

import {
  UKAUserRole,
  UKALanguage,
  UKAConsultationStyle,
  UKAPropertyContext,
  UKAConsultationRecord,
  UKAFollowUpAction,
  UKAPropertyModel,
  UKAFloorModel
} from "../../assistant/UKATypes";

import { PropertyHealthIndex } from "../../engines/decision/types";

import { UKASessionManager } from "../../assistant/UKASession";
import { ConsultationMemoryEngine } from "../../assistant/ConsultationMemoryEngine";
import { ConversationStateManager } from "../../assistant/ConversationStateManager";
import { ConversationRouter } from "../../assistant/ConversationRouter";
import { KnowledgePlanner } from "../../assistant/KnowledgePlanner";
import { KnowledgeRetrievalCoordinator } from "../../assistant/KnowledgeRetrievalCoordinator";
import { EvidenceAggregator } from "../../assistant/EvidenceAggregator";
import { ProfessionalResponseEngine } from "../../assistant/ProfessionalResponseEngine";
import { ConsultationHistory } from "../../assistant/ConsultationHistory";
import { FollowUpSuggestionEngine } from "../../assistant/FollowUpSuggestionEngine";
import { UKAContextManager } from "../../assistant/UKAContext";
import { getActiveTransportMode } from "../../spatial/VisionRuntime";

import { UKAConversationPanel, ConsultationTurn } from "./UKAConversationPanel";
import { ConsultationContextPanel } from "./ConsultationContextPanel";
import { SmartActionPanel } from "./SmartActionPanel";
import { ConsultationTimelinePanel } from "./ConsultationTimelinePanel";
import { useTranslation } from "../../localization/hooks/useTranslation";
import { mapChatLanguageToUKA, mapUKAToChatLanguage } from "../../localization/languageBridge";
import { 
  useRuntimeEvaluationSession, 
  RuntimeEvaluationSessionStore 
} from "../../core/session/RuntimeEvaluationSession";

interface UKAWorkspaceProps {
  initialProperty?: UKAPropertyModel | null;
  initialRole?: UKAUserRole;
  onNavigate?: (view: string) => void;
}

export const UKAWorkspace: React.FC<UKAWorkspaceProps> = ({
  initialProperty,
  initialRole = "PAID_CUSTOMER",
  onNavigate
}) => {
  const session = useRuntimeEvaluationSession();
  const { aiLanguage, setAiLanguage } = useTranslation();

  // Session & Role State
  const [userRole, setUserRole] = useState<UKAUserRole>(initialRole);
  const [selectedLanguage, setSelectedLanguage] = useState<UKALanguage>(() =>
    mapChatLanguageToUKA(aiLanguage)
  );
  const [consultationStyle, setConsultationStyle] = useState<UKAConsultationStyle>("PROFESSIONAL_CONSULTANT");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"CONVERSATION" | "TIMELINE">("CONVERSATION");

  // Initialize UKASessionManager
  const sessionManager = useMemo(() => {
    return new UKASessionManager("USER-PROD-01", userRole, "PROPERTY_CONSULTATION");
  }, [userRole]);

  const sessionId = sessionManager.getSessionId();

  // Synchronize UKAPropertyContext directly from Runtime Evaluation Session (Single SSOT)
  const [propertyContext, setPropertyContext] = useState<UKAPropertyContext>(() => {
    return UKAContextManager.createInitialContext();
  });

  useEffect(() => {
    setSelectedLanguage(mapChatLanguageToUKA(aiLanguage));
  }, [aiLanguage]);

  const handleUKALanguageChange = (lang: UKALanguage) => {
    setSelectedLanguage(lang);
    setAiLanguage(mapUKAToChatLanguage(lang));
  };

  useEffect(() => {
    if (session.hasExecuted) {
      RuntimeEvaluationSessionStore.markConsumerBound("ukaBound");

      const propModel: UKAPropertyModel = {
        id: session.propertyId,
        name: session.propertyName,
        propertyType: "RESIDENTIAL",
        address: "Site Alignment Assessment",
        totalAreaSqFt: 2500,
        totalFloors: 1,
        facingDirection: "NORTH",
        netNorthAngleDeg: session.northRotation
      };

      const floorModel: UKAFloorModel = {
        id: "FLR-01",
        floorNumber: 0,
        levelName: "Ground Floor",
        entitiesCount: session.recognitionCount
      };

      const healthIndex: PropertyHealthIndex = session.propertyHealth || {
        overallScore: session.overallScore || 0,
        ratingTier: (session.overallScore || 0) >= 80 ? "BALANCED" : "MODERATE_REMEDY_REQ",
        subIndices: [],
        elementHealthScores: []
      };

      const ukaFindings = session.doshas.map(d => ({
        findingId: d.id,
        elementId: `EL-${d.zone}`,
        elementName: d.elementName || d.zone,
        elementType: "ROOM",
        zone: d.zone,
        severityCalculation: { scoreDeduction: 10, severity: d.severity === "CRITICAL" ? "CRITICAL" : "HIGH" },
        appliedRule: { title: d.title, description: d.description },
        recommendation: { remedyId: `REM-${d.id}`, remedyAction: d.remedy, priority: "HIGH", expectedImpact: "+5% Score", implementationEase: "MODERATE" }
      }));

      const syncedContext = UKAContextManager.setEvaluationResults(
        UKAContextManager.setFloor(UKAContextManager.setProperty(UKAContextManager.createInitialContext(), propModel), floorModel),
        healthIndex,
        ukaFindings as any
      );

      setPropertyContext(syncedContext);
    } else {
      setPropertyContext(UKAContextManager.createInitialContext());
    }
  }, [session.hasExecuted, session.executionId, session.overallScore]);

  // State & Memory Snapshots
  const [memoryContext, setMemoryContext] = useState(() => {
    return ConsultationMemoryEngine.getOrCreateMemory(sessionId, userRole);
  });

  const [turns, setTurns] = useState<ConsultationTurn[]>([]);
  const [timelineRecords, setTimelineRecords] = useState<UKAConsultationRecord[]>([]);
  const [suggestions, setSuggestions] = useState<UKAFollowUpAction[]>([]);

  // Sync memory context and suggestions
  useEffect(() => {
    ConsultationMemoryEngine.updatePropertyContext(
      sessionId,
      propertyContext.currentProperty?.id || "PROP-01",
      propertyContext.currentProperty?.name || "Greenfields Villa",
      propertyContext.currentFloor?.id,
      propertyContext.currentFloor?.levelName
    );

    if (propertyContext.currentFindings.length > 0) {
      const f = propertyContext.currentFindings[0];
      ConsultationMemoryEngine.updateEntityContext(
        sessionId,
        f.elementId,
        f.elementName,
        f.findingId,
        f,
        f.recommendation
      );
    }

    refreshWorkspaceState();
  }, [sessionId, propertyContext]);

  const refreshWorkspaceState = () => {
    const updatedMem = ConsultationMemoryEngine.getOrCreateMemory(sessionId, userRole);
    setMemoryContext({ ...updatedMem });
    setTimelineRecords([...ConsultationHistory.getHistory(sessionId)]);
    setSuggestions([...FollowUpSuggestionEngine.generateSuggestions(sessionId)]);
  };

  // Handle Role Change
  const handleRoleChange = (newRole: UKAUserRole) => {
    setUserRole(newRole);
    sessionManager.setUserRole(newRole);
    ConsultationMemoryEngine.getOrCreateMemory(sessionId, newRole).userRole = newRole;
    refreshWorkspaceState();
  };

  // Handle Entity Selection
  const handleSelectEntity = (entityId: string, entityName: string) => {
    const matchingFinding = propertyContext.currentFindings.find(
      (f) => f.elementId === entityId || f.elementName === entityName
    );

    if (matchingFinding) {
      ConsultationMemoryEngine.updateEntityContext(
        sessionId,
        matchingFinding.elementId,
        matchingFinding.elementName,
        matchingFinding.findingId,
        matchingFinding,
        matchingFinding.recommendation
      );
      refreshWorkspaceState();
    }
  };

  // Main Question Submission Handler
  const handleQuestionSubmit = async (question: string) => {
    setIsLoading(true);

    try {
      // 1. Route Message through ConversationRouter Pipeline
      const routingResult = ConversationRouter.routeMessage(question, sessionManager);

      // 2. Create Knowledge Plan
      const knowledgePlan = KnowledgePlanner.createPlan(routingResult);

      // 3. Retrieve Data Payload
      const retrievedPayload = KnowledgeRetrievalCoordinator.executeRetrieval(knowledgePlan, propertyContext);

      // 4. Aggregate Evidence
      const evidencePackage = EvidenceAggregator.aggregateEvidence(retrievedPayload);

      // 5. Generate Professional Consultation Response
      const consultationResult = ProfessionalResponseEngine.processAndGenerate(
        routingResult,
        evidencePackage,
        selectedLanguage,
        memoryContext.visitorUsage.questionsUsed + 1,
        false
      );

      // 6. Update Session State & Memory
      const derivedState = ConversationStateManager.deriveStateFromIntent(
        routingResult.intent,
        routingResult.resolvedTarget?.targetType || "NONE"
      );
      ConversationStateManager.transitionTo(sessionId, derivedState);

      // Update Memory Context
      if (routingResult.resolvedTarget?.entityName) {
        ConsultationMemoryEngine.updateEntityContext(
          sessionId,
          routingResult.resolvedTarget.entityId || "ENT-01",
          routingResult.resolvedTarget.entityName
        );
      }

      // Track Visitor Usage
      ConsultationMemoryEngine.incrementVisitorUsage(sessionId);

      // 7. Log Structured History Record
      ConsultationHistory.appendRecord(sessionId, {
        userQuestion: question,
        intent: routingResult.intent,
        targetType: routingResult.resolvedTarget?.targetType || "PROPERTY",
        targetId: routingResult.resolvedTarget?.entityId,
        evidenceUsed: evidencePackage ? evidencePackage.sourceAttributions.map((s) => s.sourceName) : [],
        recommendationGiven: consultationResult.structuredSections?.professionalRecommendation || "Consultation provided.",
        outcomeStatus: consultationResult.isMembershipGated ? "GATED_LIMITED" : "PEER_APPROVED",
        responseId: consultationResult.responseId
      });

      // 8. Store New Turn
      const newTurn: ConsultationTurn = {
        turnId: `TURN-${Date.now()}`,
        userQuestion: question,
        result: consultationResult,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setTurns((prev) => [...prev, newTurn]);
      refreshWorkspaceState();
    } catch (err) {
      console.error("Error processing UKA consultation query:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Workspace Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl text-white shadow-lg shadow-emerald-950/50">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              URJAFLUX Knowledge Assistant (UKA)
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md">
                SPRINT 4A OS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded-md font-bold">
                ACTIVE TRANSPORT = {getActiveTransportMode()}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Spatial Evaluation & Canonical Vastu Decision Engine
            </p>
          </div>
        </div>

        {/* Global Controls: Role, Language, View Tabs */}
        <div className="flex items-center gap-3">
          {/* User Role Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-1" />
            <select
              value={userRole}
              onChange={(e) => handleRoleChange(e.target.value as UKAUserRole)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="VISITOR" className="bg-slate-900">Visitor Tier</option>
              <option value="PAID_CUSTOMER" className="bg-slate-900">Paid Member</option>
              <option value="CONSULTANT" className="bg-slate-900">Consultant</option>
              <option value="FOUNDER" className="bg-slate-900">Founder Mode</option>
            </select>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveTab("CONVERSATION")}
              className={`px-3 py-1 rounded font-medium transition-all ${
                activeTab === "CONVERSATION"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Consultation
            </button>
            <button
              onClick={() => setActiveTab("TIMELINE")}
              className={`px-3 py-1 rounded font-medium transition-all ${
                activeTab === "TIMELINE"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Decision Timeline ({timelineRecords.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Context & Smart Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Consultation Context Panel */}
          <ConsultationContextPanel
            propertyContext={propertyContext}
            memoryContext={memoryContext}
            onSelectEntity={handleSelectEntity}
          />

          {/* Smart Action Panel */}
          <SmartActionPanel
            suggestions={suggestions}
            onSelectAction={handleQuestionSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Right Main Consultation Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeTab === "CONVERSATION" ? (
            <UKAConversationPanel
              turns={turns}
              userRole={userRole}
              selectedLanguage={selectedLanguage}
              consultationStyle={consultationStyle}
              visitorUsage={memoryContext.visitorUsage}
              isLoading={isLoading}
              onSubmitQuestion={handleQuestionSubmit}
              onLanguageChange={handleUKALanguageChange}
              onStyleChange={setConsultationStyle}
              onUpgradeRequest={() => handleRoleChange("PAID_CUSTOMER")}
            />
          ) : (
            <ConsultationTimelinePanel
              records={timelineRecords}
            />
          )}
        </div>
      </main>
    </div>
  );
};
