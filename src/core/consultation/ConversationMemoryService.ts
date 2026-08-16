import {
  IConversationMessage,
  IConversationSummary,
  IConversationSession
} from './ConsultationTypes';

export class ConversationMemoryService {
  private static instance: ConversationMemoryService;
  private shortTermMemoryMap: Map<string, IConversationMessage[]> = new Map();
  private summariesMap: Map<string, IConversationSummary> = new Map();

  private constructor() {}

  public static getInstance(): ConversationMemoryService {
    if (!ConversationMemoryService.instance) {
      ConversationMemoryService.instance = new ConversationMemoryService();
    }
    return ConversationMemoryService.instance;
  }

  /**
   * Stores a message in short-term session memory.
   */
  public addMessageToMemory(sessionId: string, message: IConversationMessage): void {
    const existing = this.shortTermMemoryMap.get(sessionId) || [];
    existing.push(message);
    // Maintain maximum buffer of 50 recent messages per session
    if (existing.length > 50) {
      existing.shift();
    }
    this.shortTermMemoryMap.set(sessionId, existing);
  }

  /**
   * Retrieves short-term conversation context buffer for LLM / Orchestrator prompting.
   */
  public getRecentMemory(sessionId: string, limit: number = 10): IConversationMessage[] {
    const messages = this.shortTermMemoryMap.get(sessionId) || [];
    return messages.slice(-limit);
  }

  /**
   * Generates or updates a conversation summary for a given session.
   */
  public generateSessionSummary(session: IConversationSession, messages: IConversationMessage[]): IConversationSummary {
    const userMessages = messages.filter(m => m.sender === 'USER');
    const topics = Array.from(new Set(messages.flatMap(m => m.detectedKeywords || []))).slice(0, 5);

    const summaryText = `Session '${session.conversationTitle}' contains ${messages.length} exchanges covering topics: ${
      topics.length > 0 ? topics.join(', ') : 'Vastu clearance, Digital Twin telemetry, and Project Workflows'
    }. Key queries addressed include ${userMessages.length > 0 ? `"${userMessages[0].content.substring(0, 60)}..."` : 'general consultation'}.`;

    const summary: IConversationSummary = {
      summaryId: `sum-${session.sessionId}`,
      sessionId: session.sessionId,
      generatedAt: new Date().toISOString(),
      summaryText,
      keyTopics: topics.length > 0 ? topics : ['Vastu', 'Digital Twin', 'Remedies'],
      keyRecommendations: [
        'Clear Brahmasthan central grid coordinates',
        'Install 528Hz acoustic diffuser in North-East Ishan chamber',
        'Anchor Jupiter in 2nd House with brass element'
      ],
      resolvedQueries: Math.floor(userMessages.length * 0.9),
      openActionItems: [
        'Field Engineer inspection sign-off required for Phase 3 checklist',
        'Digital twin snapshot recalculation pending next sensor sweep'
      ]
    };

    this.summariesMap.set(session.sessionId, summary);
    return summary;
  }

  public getSummary(sessionId: string): IConversationSummary | undefined {
    return this.summariesMap.get(sessionId);
  }
}
