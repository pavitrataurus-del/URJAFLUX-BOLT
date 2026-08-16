import { BaseCommand, CommandResult } from '../types/BaseCommand';
import { EventEngine } from '../events/EventEngine';
import { Logger } from '../utils/logger';

export interface CommandHistoryEntry {
  id: string;
  name: string;
  timestamp: number;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  name: string;
  startTime: number;
  commands: BaseCommand[];
}

export class BatchCommand implements BaseCommand {
  public readonly id: string;
  public readonly name: string;
  public readonly timestamp: number;

  constructor(
    name: string,
    private commands: BaseCommand[]
  ) {
    this.id = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.name = name;
    this.timestamp = Date.now();
  }

  public async execute(context: any): Promise<any> {
    const results = [];
    for (const cmd of this.commands) {
      results.push(await cmd.execute(context));
    }
    return results;
  }

  public async undo(context: any): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      if (this.commands[i].undo) {
        await this.commands[i].undo!(context);
      }
    }
  }

  public async redo(context: any): Promise<any> {
    return await this.execute(context);
  }
}

export class CommandHistoryManager {
  private static instance: CommandHistoryManager;

  private undoStack: BaseCommand[] = [];
  private redoStack: BaseCommand[] = [];
  private maxHistorySize = 100;

  private activeTransaction: Transaction | null = null;
  private isKeyboardShortcutEnabled = true;
  private listeners: Array<() => void> = [];

  private eventEngine?: EventEngine;

  private constructor() {
    this.initKeyboardShortcuts();
    this.initPersistence();
  }

  public static getInstance(): CommandHistoryManager {
    if (!CommandHistoryManager.instance) {
      CommandHistoryManager.instance = new CommandHistoryManager();
    }
    return CommandHistoryManager.instance;
  }

  public setEventEngine(eventEngine: EventEngine) {
    this.eventEngine = eventEngine;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveToPersistence();
    this.listeners.forEach((l) => l());
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public getRedoCount(): number {
    return this.redoStack.length;
  }

  public getHistoryList(): CommandHistoryEntry[] {
    return this.undoStack.map((cmd) => ({
      id: cmd.id,
      name: cmd.name,
      timestamp: cmd.timestamp,
    }));
  }

  public getRedoList(): CommandHistoryEntry[] {
    return this.redoStack.map((cmd) => ({
      id: cmd.id,
      name: cmd.name,
      timestamp: cmd.timestamp,
    }));
  }

  public isTransactionActive(): boolean {
    return this.activeTransaction !== null;
  }

  public getActiveTransactionName(): string | null {
    return this.activeTransaction?.name || null;
  }

  // ----------------------------------------------------
  // TRANSACTION MANAGEMENT
  // ----------------------------------------------------

  public beginTransaction(name: string) {
    if (this.activeTransaction) {
      Logger.warn(`[CommandHistoryManager] Transaction '${this.activeTransaction.name}' already in progress. Nesting transaction.`);
    }
    this.activeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      startTime: Date.now(),
      commands: [],
    };
    Logger.info(`[CommandHistoryManager] Transaction started: ${name}`);
    this.notify();
  }

  public async commitTransaction(context?: any): Promise<CommandResult<void>> {
    if (!this.activeTransaction) {
      return { success: false, error: new Error('No active transaction to commit') };
    }

    const tx = this.activeTransaction;
    this.activeTransaction = null;

    if (tx.commands.length === 0) {
      Logger.info(`[CommandHistoryManager] Transaction '${tx.name}' committed with 0 operations.`);
      this.notify();
      return { success: true };
    }

    const batchCmd = new BatchCommand(`Transaction: ${tx.name}`, tx.commands);
    this.undoStack.push(batchCmd);
    this.redoStack = [];

    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    Logger.info(`[CommandHistoryManager] Transaction '${tx.name}' committed with ${tx.commands.length} operations.`);
    this.notify();
    return { success: true };
  }

  public async rollbackTransaction(context?: any): Promise<CommandResult<void>> {
    if (!this.activeTransaction) {
      return { success: false, error: new Error('No active transaction to rollback') };
    }

    const tx = this.activeTransaction;
    this.activeTransaction = null;

    Logger.info(`[CommandHistoryManager] Rolling back transaction '${tx.name}' with ${tx.commands.length} operations.`);

    // Undo commands in reverse order
    for (let i = tx.commands.length - 1; i >= 0; i--) {
      if (tx.commands[i].undo) {
        try {
          await tx.commands[i].undo!(context);
        } catch (err) {
          Logger.error(`[CommandHistoryManager] Error rolling back command in transaction '${tx.name}'`, err);
        }
      }
    }

    this.notify();
    return { success: true };
  }

  // ----------------------------------------------------
  // COMMAND EXECUTION, UNDO, REDO
  // ----------------------------------------------------

  public async execute<TContext = any, TResult = any>(
    command: BaseCommand<TContext, TResult>,
    context: TContext
  ): Promise<CommandResult<TResult>> {
    try {
      const result = await command.execute(context);

      if (this.activeTransaction) {
        this.activeTransaction.commands.push(command);
      } else {
        if (command.undo) {
          this.undoStack.push(command);
          this.redoStack = []; // Clear redo on new action
          if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
          }
        }
      }

      this.publishEvent('COMMAND_EXECUTED', { id: command.id, name: command.name });
      this.notify();
      return { success: true, data: result };
    } catch (error: any) {
      Logger.error(`[CommandHistoryManager] Command execution failed: ${command.name}`, error);
      return { success: false, error };
    }
  }

  public async undo<TContext = any>(context?: TContext): Promise<CommandResult<void>> {
    const command = this.undoStack.pop();
    if (!command) {
      return { success: false, error: new Error('Undo stack is empty') };
    }

    if (!command.undo) {
      return { success: false, error: new Error(`Command '${command.name}' does not support undo`) };
    }

    try {
      await command.undo(context);
      this.redoStack.push(command);
      this.publishEvent('COMMAND_UNDONE', { id: command.id, name: command.name });
      this.notify();
      return { success: true };
    } catch (error: any) {
      Logger.error(`[CommandHistoryManager] Failed to undo command: ${command.name}`, error);
      this.undoStack.push(command); // Restore on error
      return { success: false, error };
    }
  }

  public async redo<TContext = any>(context?: TContext): Promise<CommandResult<any>> {
    const command = this.redoStack.pop();
    if (!command) {
      return { success: false, error: new Error('Redo stack is empty') };
    }

    try {
      const result = command.redo ? await command.redo(context) : await command.execute(context);
      this.undoStack.push(command);
      this.publishEvent('COMMAND_REDONE', { id: command.id, name: command.name });
      this.notify();
      return { success: true, data: result };
    } catch (error: any) {
      Logger.error(`[CommandHistoryManager] Failed to redo command: ${command.name}`, error);
      this.redoStack.push(command);
      return { success: false, error };
    }
  }

  /**
   * Selective Undo: Undo a specific command by ID from anywhere in the history stack.
   */
  public async selectiveUndo<TContext = any>(commandId: string, context?: TContext): Promise<CommandResult<void>> {
    const index = this.undoStack.findIndex((cmd) => cmd.id === commandId);
    if (index === -1) {
      return { success: false, error: new Error(`Command ID '${commandId}' not found in undo history.`) };
    }

    const command = this.undoStack[index];
    if (!command.undo) {
      return { success: false, error: new Error(`Command '${command.name}' does not support undo`) };
    }

    try {
      await command.undo(context);
      this.undoStack.splice(index, 1);
      this.redoStack.push(command);
      this.publishEvent('COMMAND_SELECTIVE_UNDONE', { id: command.id, name: command.name });
      this.notify();
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  }

  public clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.activeTransaction = null;
    this.notify();
  }

  // ----------------------------------------------------
  // KEYBOARD SHORTCUTS (Ctrl+Z, Ctrl+Y / Cmd+Shift+Z)
  // ----------------------------------------------------

  private initKeyboardShortcuts() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isKeyboardShortcutEnabled) return;

      // Do not intercept when typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      } else if (
        (modifier && e.key.toLowerCase() === 'y') ||
        (modifier && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        this.redo();
      }
    });
  }

  public setKeyboardShortcutsEnabled(enabled: boolean) {
    this.isKeyboardShortcutEnabled = enabled;
  }

  // ----------------------------------------------------
  // PERSISTENCE (IndexedDB / Session Storage)
  // ----------------------------------------------------

  private initPersistence() {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('urjaflux_command_history_metadata');
      if (stored) {
        const meta = JSON.parse(stored);
        Logger.info(`[CommandHistoryManager] Restored history session containing ${meta.length} entries.`);
      }
    } catch (e) {
      // Ignore fallback
    }
  }

  private saveToPersistence() {
    if (typeof window === 'undefined') return;
    try {
      const metadata = this.getHistoryList();
      sessionStorage.setItem('urjaflux_command_history_metadata', JSON.stringify(metadata));
    } catch (e) {
      // Ignore
    }
  }

  private publishEvent(type: string, payload: any) {
    if (this.eventEngine) {
      this.eventEngine.publish({
        type,
        timestamp: Date.now(),
        payload,
        source: 'CommandHistoryManager',
      });
    }
  }
}

export const commandHistoryManager = CommandHistoryManager.getInstance();
