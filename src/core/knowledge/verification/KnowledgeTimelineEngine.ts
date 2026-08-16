import { TimelineEvent } from "./VerificationTypes";

export class KnowledgeTimelineEngine {
  private static instance: KnowledgeTimelineEngine;
  private timelineStore: Map<string, TimelineEvent[]> = new Map();

  public constructor() {}

  public static getInstance(): KnowledgeTimelineEngine {
    if (!KnowledgeTimelineEngine.instance) {
      KnowledgeTimelineEngine.instance = new KnowledgeTimelineEngine();
    }
    return KnowledgeTimelineEngine.instance;
  }

  public recordEvent(
    ruleId: string,
    type: TimelineEvent["type"],
    title: string,
    description: string,
    actor: string
  ): TimelineEvent {
    const list = this.timelineStore.get(ruleId) || [];

    const event: TimelineEvent = {
      id: `timeline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      description,
      actor
    };

    list.push(event);
    this.timelineStore.set(ruleId, list);
    return event;
  }

  public getRuleTimeline(ruleId: string): TimelineEvent[] {
    return this.timelineStore.get(ruleId) || [];
  }

  public getTimelineForRule(ruleId: string): TimelineEvent[] {
    return this.getRuleTimeline(ruleId);
  }
}

export const knowledgeTimelineEngine = KnowledgeTimelineEngine.getInstance();
