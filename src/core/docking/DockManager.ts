import { IDockLayout, IDockPanelState, PanelId, DockPosition, WorkspaceMode } from './DockTypes';

const STORAGE_KEY = 'urjaflux_dock_layout_v2';

export class DockManager {
  private static instance: DockManager;
  private currentLayout: IDockLayout;
  private customLayouts: IDockLayout[] = [];
  private listeners: (() => void)[] = [];
  private isFullscreenCanvas: boolean = false;
  private isDebugMode: boolean = false;

  private constructor() {
    this.currentLayout = this.getDefaultPreset('DRAWING');
    this.loadState();
  }

  public static getInstance(): DockManager {
    if (!DockManager.instance) {
      DockManager.instance = new DockManager();
    }
    return DockManager.instance;
  }

  /**
   * Subscribes a listener to layout/state modifications.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  /**
   * Retrieves the current layout active state.
   */
  public getCurrentLayout(): IDockLayout {
    return this.currentLayout;
  }

  /**
   * Retrieves all user and system layout presets.
   */
  public getLayouts(): IDockLayout[] {
    const systemPresets = [
      this.getDefaultPreset('DRAWING'),
      this.getDefaultPreset('ANALYSIS'),
      this.getDefaultPreset('KNOWLEDGE'),
      this.getDefaultPreset('REPORT_WRITING'),
      this.getDefaultPreset('PRESENTATION')
    ];
    return [...systemPresets, ...this.customLayouts];
  }

  /**
   * Returns a clean, highly customized system preset according to the selected mode (Part 10 & 17).
   */
  public getDefaultPreset(mode: WorkspaceMode): IDockLayout {
    const panels: IDockPanelState[] = [
      { id: 'layers', title: 'Layers & Geometry', position: 'LEFT', width: 320, height: 200, isPinned: true, lastOpenSize: 320 },
      { id: 'inspector', title: 'Inspector Panel', position: 'RIGHT', width: 380, height: 200, isPinned: true, lastOpenSize: 380 },
      { id: 'properties', title: 'Property Settings', position: 'RIGHT', width: 380, height: 200, isPinned: true, lastOpenSize: 380 },
      { id: 'selection', title: 'Selection Grid', position: 'HIDDEN', width: 350, height: 200, isPinned: false, lastOpenSize: 350 },
      { id: 'analysis', title: 'Energy Diagnostics', position: 'HIDDEN', width: 400, height: 200, isPinned: true, lastOpenSize: 400 },
      { id: 'object-details', title: 'Object Details', position: 'HIDDEN', width: 380, height: 200, isPinned: true, lastOpenSize: 380 },
      { id: 'knowledge', title: 'Knowledge Vault', position: 'HIDDEN', width: 420, height: 200, isPinned: true, lastOpenSize: 420 },
      { id: 'reports', title: 'Report Studio Data', position: 'HIDDEN', width: 450, height: 200, isPinned: true, lastOpenSize: 450 },
      { id: 'timeline', title: 'Simulation Timeline', position: 'BOTTOM', width: 300, height: 220, isPinned: true, lastOpenSize: 220 },
      { id: 'console', title: 'System Console', position: 'HIDDEN', width: 300, height: 200, isPinned: true, lastOpenSize: 200 },
      { id: 'logs', title: 'Diagnostics Logs', position: 'HIDDEN', width: 300, height: 200, isPinned: true, lastOpenSize: 200 },
      { id: 'output', title: 'Output Console', position: 'HIDDEN', width: 300, height: 200, isPinned: true, lastOpenSize: 200 },
      { id: 'terminal', title: 'Micro-Terminal', position: 'HIDDEN', width: 300, height: 200, isPinned: true, lastOpenSize: 200 }
    ];

    switch (mode) {
      case 'DRAWING':
        // Primary drafting layout
        this.setPanelPos(panels, 'layers', 'LEFT');
        this.setPanelPos(panels, 'inspector', 'RIGHT');
        this.setPanelPos(panels, 'properties', 'RIGHT');
        break;
      case 'ANALYSIS':
        // Diagnostics intensive
        this.setPanelPos(panels, 'analysis', 'RIGHT');
        this.setPanelPos(panels, 'layers', 'LEFT');
        this.setPanelPos(panels, 'timeline', 'BOTTOM');
        break;
      case 'KNOWLEDGE':
        // Research intensive
        this.setPanelPos(panels, 'knowledge', 'LEFT');
        this.setPanelPos(panels, 'properties', 'RIGHT');
        break;
      case 'REPORT_WRITING':
        // Report building layout
        this.setPanelPos(panels, 'reports', 'LEFT');
        this.setPanelPos(panels, 'inspector', 'RIGHT');
        break;
      case 'PRESENTATION':
        // Clean layout
        panels.forEach(p => { p.position = 'HIDDEN'; });
        break;
    }

    return {
      id: `sys-preset-${mode.toLowerCase()}`,
      name: `${mode.replace('_', ' ')} MODE`,
      panels,
      selectedMode: mode,
      isSystemPreset: true
    };
  }

  private setPanelPos(panels: IDockPanelState[], id: PanelId, position: DockPosition) {
    const p = panels.find(item => item.id === id);
    if (p) p.position = position;
  }

  /**
   * Switches the workspace mode and automatically reorganizes docks (Part 17).
   */
  public switchMode(mode: WorkspaceMode) {
    this.currentLayout = this.getDefaultPreset(mode);
    this.isFullscreenCanvas = false;
    this.saveState();
    this.notify();
  }

  /**
   * Applies an entire layout preset or user layout.
   */
  public applyLayout(layout: IDockLayout) {
    this.currentLayout = JSON.parse(JSON.stringify(layout));
    this.isFullscreenCanvas = false;
    this.saveState();
    this.notify();
  }

  /**
   * Creates/Saves a custom layout layout preset (Part 11).
   */
  public saveCustomLayout(name: string) {
    const newLayout: IDockLayout = {
      id: `custom-layout-${Date.now()}`,
      name,
      panels: JSON.parse(JSON.stringify(this.currentLayout.panels)),
      selectedMode: this.currentLayout.selectedMode,
      isSystemPreset: false
    };
    this.customLayouts.push(newLayout);
    this.currentLayout = JSON.parse(JSON.stringify(newLayout));
    this.saveState();
    this.notify();
  }

  /**
   * Toggles debug mode (Part 21).
   */
  public toggleDebugMode() {
    this.isDebugMode = !this.isDebugMode;
    this.notify();
  }

  public getDebugMode(): boolean {
    return this.isDebugMode;
  }

  /**
   * Toggles the canvas fullscreen state (Part 19).
   */
  public toggleFullscreenCanvas() {
    this.isFullscreenCanvas = !this.isFullscreenCanvas;
    this.notify();
  }

  public getFullscreenCanvas(): boolean {
    return this.isFullscreenCanvas;
  }

  /**
   * Updates a single panel state.
   */
  public updatePanel(panelId: PanelId, updates: Partial<IDockPanelState>) {
    const p = this.currentLayout.panels.find(item => item.id === panelId);
    if (p) {
      Object.assign(p, updates);
      if (updates.width && updates.width > 30) {
        p.lastOpenSize = updates.width;
      }
      if (updates.height && updates.height > 30) {
        p.lastOpenSize = updates.height;
      }
      this.saveState();
      this.notify();
    }
  }

  /**
   * Shifts a panel to a new dock zone position (Part 9).
   */
  public movePanel(panelId: PanelId, position: DockPosition) {
    this.updatePanel(panelId, { position });
  }

  /**
   * Reset Dock Engine state completely (Part 12).
   */
  public resetLayout() {
    localStorage.removeItem(STORAGE_KEY);
    this.customLayouts = [];
    this.isFullscreenCanvas = false;
    this.currentLayout = this.getDefaultPreset('DRAWING');
    this.saveState();
    this.notify();
  }

  /**
   * Standard state persistence (Part 13).
   */
  private saveState() {
    try {
      const data = {
        currentLayout: this.currentLayout,
        customLayouts: this.customLayouts,
        isDebugMode: this.isDebugMode
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('DockManager failed to persist layout:', err);
    }
  }

  /**
   * Safe state loading with structural correction (Part 13).
   */
  private loadState() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (!val) return;

      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object') {
        if (parsed.customLayouts && Array.isArray(parsed.customLayouts)) {
          this.customLayouts = parsed.customLayouts;
        }
        if (parsed.isDebugMode !== undefined) {
          this.isDebugMode = parsed.isDebugMode;
        }

        // Validate current layout panels to avoid corruption
        if (parsed.currentLayout && Array.isArray(parsed.currentLayout.panels)) {
          const isValid = parsed.currentLayout.panels.every((p: any) => {
            return p.id && p.title && typeof p.width === 'number' && typeof p.height === 'number';
          });
          if (isValid) {
            this.currentLayout = parsed.currentLayout;
          } else {
            console.warn('Corrupted layout detected in storage. Automatically healing and recovering default drawing preset.');
          }
        }
      }
    } catch {
      console.warn('DockManager layout parse error. Recovering defaults.');
    }
  }
}
