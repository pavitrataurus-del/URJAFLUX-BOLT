import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { USOMId } from '../usom/types';
import { EventEngine } from '../events/EventEngine';
import { ObjectEngine } from './ObjectEngine';

export class SelectionEngine implements BaseEngine {
  public readonly name = 'SelectionEngine';
  private initialized = false;
  private selectedIds: Set<USOMId> = new Set();

  constructor(
    private eventEngine: EventEngine,
    private objectEngine: ObjectEngine
  ) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.selectedIds.clear();
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.selectedIds.clear();
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public select(id: USOMId, multi: boolean = false): void {
    if (!this.initialized) return;
    
    if (!multi) {
      this.clear();
    }
    
    this.selectedIds.add(id);
    const obj = this.objectEngine.getObject(id);
    if (obj) {
      obj.isSelected = true;
    }
    
    this.publishChange();
  }

  public deselect(id: USOMId): void {
    if (!this.initialized) return;
    this.selectedIds.delete(id);
    
    const obj = this.objectEngine.getObject(id);
    if (obj) {
      obj.isSelected = false;
    }
    
    this.publishChange();
  }
  
  public setSelection(ids: USOMId[]): void {
    if (!this.initialized) return;
    this.clear();
    ids.forEach(id => {
      this.selectedIds.add(id);
      const obj = this.objectEngine.getObject(id);
      if (obj) {
        obj.isSelected = true;
      }
    });
    this.publishChange();
  }

  public clear(): void {
    if (!this.initialized) return;
    if (this.selectedIds.size > 0) {
      this.selectedIds.forEach(id => {
        const obj = this.objectEngine.getObject(id);
        if (obj) {
          obj.isSelected = false;
        }
      });
      this.selectedIds.clear();
      this.publishChange();
    }
  }

  public getSelection(): USOMId[] {
    return Array.from(this.selectedIds);
  }

  public isSelected(id: USOMId): boolean {
    return this.selectedIds.has(id);
  }

  private publishChange(): void {
    this.eventEngine.publish({
      type: 'SELECTION_CHANGED',
      timestamp: Date.now(),
      payload: { selectedIds: this.getSelection() },
      source: this.name
    });
  }
}
