export type DockPosition = 'LEFT' | 'RIGHT' | 'BOTTOM' | 'FLOATING' | 'HIDDEN';

export type PanelId =
  | 'layers'
  | 'inspector'
  | 'properties'
  | 'selection'
  | 'analysis'
  | 'object-details'
  | 'knowledge'
  | 'reports'
  | 'timeline'
  | 'console'
  | 'logs'
  | 'output'
  | 'terminal';

export type WorkspaceMode =
  | 'DRAWING'
  | 'ANALYSIS'
  | 'KNOWLEDGE'
  | 'REPORT_WRITING'
  | 'PRESENTATION';

export interface IDockPanelState {
  id: PanelId;
  title: string;
  position: DockPosition;
  width: number; // in pixels
  height: number; // in pixels
  isPinned: boolean;
  floatingX?: number;
  floatingY?: number;
  lastOpenSize?: number; // stores last open width or height
}

export interface IDockLayout {
  id: string;
  name: string;
  panels: IDockPanelState[];
  selectedMode: WorkspaceMode;
  isSystemPreset: boolean;
}

export interface IDockState {
  layouts: IDockLayout[];
  activeLayoutId: string;
  isFullscreenCanvas: boolean;
  isDebugMode: boolean;
}
