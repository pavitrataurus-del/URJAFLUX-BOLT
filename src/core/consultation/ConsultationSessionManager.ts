import {
  IConversationSession,
  IConversationMessage,
  UserRole
} from './ConsultationTypes';
import { ConsultationContextManager } from './ConsultationContextManager';
import { ConsultationResponseOrchestrator } from './ConsultationResponseOrchestrator';
import { ConversationMemoryService } from './ConversationMemoryService';

export class ConsultationSessionManager {
  private static instance: ConsultationSessionManager;
  private sessionsMap: Map<string, IConversationSession> = new Map();
  private sessionMessagesMap: Map<string, IConversationMessage[]> = new Map();
  private activeSessionId: string | null = null;

  private constructor() {
    this.seedDefaultSessions();
  }

  public static getInstance(): ConsultationSessionManager {
    if (!ConsultationSessionManager.instance) {
      ConsultationSessionManager.instance = new ConsultationSessionManager();
    }
    return ConsultationSessionManager.instance;
  }

  private seedDefaultSessions(): void {
    const s1 = this.createNewSession(
      'Brahmasthan Clearance & Acoustic Calibration Consultation',
      'ADMIN',
      'PROP-001',
      'UF-PRJ-2026-081'
    );

    // Initial greeting message
    const welcomeMsg: IConversationMessage = {
      id: `msg-welcome-001`,
      uuid: `uuid-welcome-001`,
      version: 1,
      sessionId: s1.sessionId,
      sender: 'ASSISTANT',
      content: `Welcome to the **URJAFLUX Enterprise AI Consultation & Conversation Engine** (DOMAIN-009). 

This conversational intelligence layer orchestrates verified outputs across all 8 enterprise domains:
- **DOMAIN-001..005**: Vastu, Chakra, Lal Kitab, Numerology & Astrology Knowledge Libraries
- **DOMAIN-002B**: Multi-Source Verification & Truth Engine
- **DOMAIN-006**: Unified Reasoning & Recommendation Engine
- **DOMAIN-007**: Project Execution & Workflow Engine
- **DOMAIN-008**: Property Digital Twin & Telemetry Monitoring

Select a quick-start query or ask any question regarding property health, recommendation evidence, project tasks, or scriptural citations.`,
      timestamp: new Date().toISOString(),
      confidenceLevel: 100,
      confidenceGrade: 'A+',
      sourceDomains: ['Vastu', 'Chakra', 'LalKitab', 'Numerology', 'Astrology'],
      suggestedActions: [
        {
          actionId: 'act-start-1',
          label: 'Why was 528Hz diffuser recommended?',
          actionType: 'VIEW_RECOMMENDATION',
          targetModule: 'Reasoning'
        },
        {
          actionId: 'act-start-2',
          label: 'Check Digital Twin Health Score',
          actionType: 'VIEW_MONITORING_STATUS',
          targetModule: 'Monitoring'
        },
        {
          actionId: 'act-start-3',
          label: 'Show Active Workflow Tasks',
          actionType: 'OPEN_EXECUTION_PROJECT',
          targetModule: 'Execution'
        }
      ]
    };

    this.addMessageToSession(s1.sessionId, welcomeMsg);
    this.activeSessionId = s1.sessionId;
  }

  public createNewSession(
    title: string,
    userRole: UserRole = 'ADMIN',
    propertyId?: string,
    projectId?: string
  ): IConversationSession {
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const contextSnapshot = ConsultationContextManager.getInstance().assembleContext(userRole, propertyId, projectId);

    const session: IConversationSession = {
      sessionId,
      uuid: `uuid-${sessionId}`,
      version: 1,
      conversationTitle: title || 'New AI Consultation Session',
      status: 'ACTIVE',
      activeUserRole: userRole,
      ownerId: userRole === 'ADMIN' ? 'usr-admin-001' : 'usr-client-002',
      createdBy: 'System User',
      updatedBy: 'System User',
      createdAt: now,
      updatedAt: now,
      lastActiveTime: now,
      messageCount: 0,
      primaryDomainContexts: ['Vastu', 'Chakra', 'LalKitab'],
      propertyId,
      projectId,
      contextSnapshot
    };

    this.sessionsMap.set(sessionId, session);
    this.sessionMessagesMap.set(sessionId, []);
    this.activeSessionId = sessionId;

    return session;
  }

  public getActiveSession(): IConversationSession | null {
    if (!this.activeSessionId) return null;
    return this.sessionsMap.get(this.activeSessionId) || null;
  }

  public setActiveSession(sessionId: string): boolean {
    if (this.sessionsMap.has(sessionId)) {
      this.activeSessionId = sessionId;
      const session = this.sessionsMap.get(sessionId)!;
      session.status = 'ACTIVE';
      session.lastActiveTime = new Date().toISOString();
      return true;
    }
    return false;
  }

  public getAllSessions(): IConversationSession[] {
    return Array.from(this.sessionsMap.values()).sort(
      (a, b) => new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime()
    );
  }

  public getSessionById(sessionId: string): IConversationSession | undefined {
    return this.sessionsMap.get(sessionId);
  }

  public getSessionMessages(sessionId: string): IConversationMessage[] {
    return this.sessionMessagesMap.get(sessionId) || [];
  }

  public addMessageToSession(sessionId: string, message: IConversationMessage): void {
    const messages = this.sessionMessagesMap.get(sessionId) || [];
    messages.push(message);
    this.sessionMessagesMap.set(sessionId, messages);

    const session = this.sessionsMap.get(sessionId);
    if (session) {
      session.messageCount = messages.length;
      session.updatedAt = new Date().toISOString();
      session.lastActiveTime = new Date().toISOString();
    }

    ConversationMemoryService.getInstance().addMessageToMemory(sessionId, message);
  }

  public archiveSession(sessionId: string): void {
    const session = this.sessionsMap.get(sessionId);
    if (session) {
      session.status = 'ARCHIVED';
      session.updatedAt = new Date().toISOString();
    }
  }

  public sendUserQuery(
    sessionId: string,
    userQueryText: string,
    userRole: UserRole = 'ADMIN'
  ): {
    userMessage: IConversationMessage;
    assistantMessage: IConversationMessage;
  } {
    const session = this.getSessionById(sessionId) || this.getActiveSession();
    const targetSessionId = session ? session.sessionId : this.createNewSession('Consultation Session', userRole).sessionId;

    const userMessage: IConversationMessage = {
      id: `msg-user-${Date.now()}`,
      uuid: `uuid-user-${Date.now()}`,
      version: 1,
      sessionId: targetSessionId,
      sender: 'USER',
      content: userQueryText,
      timestamp: new Date().toISOString()
    };

    this.addMessageToSession(targetSessionId, userMessage);

    const assistantMessage = ConsultationResponseOrchestrator.getInstance().processUserQuery(
      targetSessionId,
      userQueryText,
      userRole,
      session?.propertyId,
      session?.projectId
    );

    this.addMessageToSession(targetSessionId, assistantMessage);

    return { userMessage, assistantMessage };
  }
}
