import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { safeAddDoc } from "../../utils/firestoreSanitizer";
import { ExecutionLog } from "../../types/ruleEngine";

/**
 * Universal logger for tracking and auditing rule engine execution results
 */
export class ExecutionLogger {
  private localLogs: ExecutionLog[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Logs a rule execution to the localized store and tries to sync with Firestore
   */
  public async log(logEntry: Omit<ExecutionLog, "id">): Promise<ExecutionLog> {
    const logId = `LOG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const completeLog: ExecutionLog = {
      id: logId,
      ...logEntry
    };

    // Store in local cache
    this.localLogs.push(completeLog);
    this.saveToLocalStorage();

    // Persist to Cloud Firestore if initialized and online
    if (db) {
      try {
        await safeAddDoc(collection(db, "rule_execution_logs"), completeLog);
      } catch {
        // Ignored. Quietly fail if offline or database rules block execution
      }
    }

    return completeLog;
  }

  /**
   * Retrieves all logged executions cached locally
   */
  public getLocalLogs(): ExecutionLog[] {
    return this.localLogs;
  }

  /**
   * Clears the local log cache
   */
  public clearLocalLogs(): void {
    this.localLogs = [];
    try {
      localStorage.removeItem("urjaflux_rule_execution_logs");
    } catch {
      // Ignored
    }
  }

  private saveToLocalStorage(): void {
    try {
      // Limit local cache to most recent 500 entries to prevent local storage quota issues
      const sliceOfLogs = this.localLogs.slice(-500);
      localStorage.setItem("urjaflux_rule_execution_logs", JSON.stringify(sliceOfLogs));
    } catch {
      // Ignored
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem("urjaflux_rule_execution_logs");
      if (stored) {
        this.localLogs = JSON.parse(stored);
      }
    } catch {
      this.localLogs = [];
    }
  }
}
