/**
 * URJAFLUX AI OS — SPRINT 4A (Prompt 5 of 8)
 * URJAFLUX Knowledge Assistant (UKA) — Consultation History Engine
 * 
 * ConsultationHistory.ts: Structured Consultation Timeline Repository.
 * Stores structured consultation history records (Not raw chat text).
 */

import { UKAConsultationRecord } from "./UKATypes";
import { ConsultationMemoryEngine } from "./ConsultationMemoryEngine";

export class ConsultationHistory {
  private static historyStore: Map<string, UKAConsultationRecord[]> = new Map();

  /**
   * Append a structured consultation record to session history
   */
  public static appendRecord(
    sessionId: string,
    record: Omit<UKAConsultationRecord, "recordId" | "timestamp">
  ): UKAConsultationRecord {
    const fullRecord: UKAConsultationRecord = {
      ...record,
      recordId: `HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    const records = this.historyStore.get(sessionId) || [];
    records.push(fullRecord);
    this.historyStore.set(sessionId, records);

    return fullRecord;
  }

  /**
   * Retrieve full consultation timeline for a session
   */
  public static getHistory(sessionId: string): UKAConsultationRecord[] {
    return this.historyStore.get(sessionId) || [];
  }

  /**
   * Search history by intent or targeted entity name
   */
  public static searchHistory(
    sessionId: string,
    filter: { intent?: string; targetType?: string; targetId?: string }
  ): UKAConsultationRecord[] {
    const records = this.getHistory(sessionId);
    return records.filter((r) => {
      if (filter.intent && r.intent !== filter.intent) return false;
      if (filter.targetType && r.targetType !== filter.targetType) return false;
      if (filter.targetId && r.targetId !== filter.targetId) return false;
      return true;
    });
  }

  /**
   * Clear session history
   */
  public static clearHistory(sessionId: string): void {
    this.historyStore.delete(sessionId);
  }
}
