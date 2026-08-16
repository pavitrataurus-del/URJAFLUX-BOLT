import { BaseEngine } from '../types/BaseEngine';
import { BaseCommand, CommandResult } from '../types/BaseCommand';
import { EventEngine } from '../events/EventEngine';
import { Logger } from '../utils/logger';
import { commandHistoryManager } from './CommandHistoryManager';

export class CommandEngine implements BaseEngine {
  public readonly name = 'CommandEngine';
  private initialized = false;

  constructor(private eventEngine?: EventEngine) {
    if (eventEngine) {
      commandHistoryManager.setEventEngine(eventEngine);
    }
  }

  public setEventEngine(eventEngine: EventEngine) {
    this.eventEngine = eventEngine;
    commandHistoryManager.setEventEngine(eventEngine);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`${this.name} initialized with global CommandHistoryManager.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public async execute<TContext = any, TResult = any>(
    command: BaseCommand<TContext, TResult>,
    context: TContext
  ): Promise<CommandResult<TResult>> {
    if (!this.initialized) {
      return { success: false, error: new Error(`${this.name} is not initialized.`) };
    }
    return commandHistoryManager.execute(command, context);
  }

  public async undo<TContext = any>(context?: TContext): Promise<CommandResult<void>> {
    if (!this.initialized) {
      return { success: false, error: new Error(`${this.name} is not initialized.`) };
    }
    return commandHistoryManager.undo(context);
  }

  public async redo<TContext = any>(context?: TContext): Promise<CommandResult<any>> {
    if (!this.initialized) {
      return { success: false, error: new Error(`${this.name} is not initialized.`) };
    }
    return commandHistoryManager.redo(context);
  }

  public clearHistory(): void {
    commandHistoryManager.clearHistory();
  }
}
