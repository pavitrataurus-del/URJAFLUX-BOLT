// ============================================================================
// URJAFLUX AI OS - ENTERPRISE VALIDATION DASHBOARD v2.1 (EVD v2.1)
// Enterprise Operations UI & Real-Time Hardening - Data Contracts & Types
// ============================================================================

import { IEnterpriseValidationDashboard } from './evd.types';

// ----------------------------------------------------------------------------
// 1. Dashboard Renderer Types
// ----------------------------------------------------------------------------
export type RenderComponentType =
  | 'CARD'
  | 'TABLE'
  | 'LINE_CHART'
  | 'BAR_CHART'
  | 'PIE_CHART'
  | 'HEATMAP'
  | 'TIMELINE'
  | 'TREE'
  | 'GRAPH'
  | 'PIPELINE'
  | 'STATUS_INDICATOR'
  | 'PROGRESS_BAR'
  | 'METRIC_TILE'
  | 'KPI_WIDGET';

export type DeviceLayoutProfile = 'DESKTOP' | 'TABLET' | 'MOBILE';

export interface IRenderableElement {
  elementId: string;
  type: RenderComponentType;
  title: string;
  data: Record<string, any>;
  responsiveConfig: {
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
  };
  renderStatus: 'READY' | 'RENDERED' | 'ERROR';
}

export interface IDashboardRendererReport {
  engineName: 'DashboardRenderer';
  activeProfile: DeviceLayoutProfile;
  totalRenderableElements: number;
  supportedComponentTypes: RenderComponentType[];
  elements: IRenderableElement[];
}

// ----------------------------------------------------------------------------
// 2. Enterprise Widget Engine Types
// ----------------------------------------------------------------------------
export type WidgetType =
  | 'ENGINE_HEALTH'
  | 'PIPELINE'
  | 'COVERAGE'
  | 'PERFORMANCE'
  | 'REGRESSION'
  | 'FAILURE'
  | 'DATASET'
  | 'AUDIT'
  | 'FOUNDER'
  | 'RELEASE'
  | 'QUALITY';

export type WidgetState = 'IDLE' | 'REFRESHING' | 'PINNED' | 'HIDDEN' | 'COLLAPSED' | 'EXPANDED';

export interface IWidgetMetadata {
  widgetId: string;
  widgetType: WidgetType;
  title: string;
  description: string;
  isDraggable: boolean;
  isDroppable: boolean;
  isPinnable: boolean;
  isCollapsible: boolean;
  isResizable: boolean;
  refreshIntervalMs: number;
}

export interface IWidgetConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  isPinned: boolean;
  isHidden: boolean;
  isCollapsed: boolean;
  customSettings: Record<string, any>;
}

export interface IEnterpriseWidget {
  metadata: IWidgetMetadata;
  config: IWidgetConfig;
  state: WidgetState;
  lastRefreshedAt: string;
}

export interface IWidgetRegistryReport {
  engineName: 'WidgetRegistry';
  totalRegisteredWidgets: number;
  widgetTypesSupported: WidgetType[];
  widgets: IEnterpriseWidget[];
}

// ----------------------------------------------------------------------------
// 3. Live Event Bus Types
// ----------------------------------------------------------------------------
export type LiveEventType =
  | 'VALIDATION_STARTED'
  | 'VALIDATION_FINISHED'
  | 'BLUEPRINT_UPLOADED'
  | 'PIPELINE_STARTED'
  | 'PIPELINE_COMPLETED'
  | 'PIPELINE_FAILED'
  | 'COVERAGE_UPDATED'
  | 'REGRESSION_DETECTED'
  | 'DATASET_CHANGED'
  | 'KNOWLEDGE_UPDATED'
  | 'RELEASE_GENERATED'
  | 'FOUNDER_VIOLATION'
  | 'ARCHITECTURE_DRIFT';

export interface ILiveEvent {
  eventId: string;
  type: LiveEventType;
  timestamp: string;
  sourceEngine: string;
  payload: Record<string, any>;
  autoUpdatedDashboard: boolean;
}

export interface ILiveEventsReport {
  engineName: 'LiveEventsBus';
  isAutoRefreshActive: boolean;
  totalEventsProcessed: number;
  recentEvents: ILiveEvent[];
}

// ----------------------------------------------------------------------------
// 4. Drill Down Explorer Types
// ----------------------------------------------------------------------------
export interface IDrillDownNode {
  nodeId: string;
  nodeType: 'METRIC' | 'LIST' | 'DETAILS' | 'ENGINE' | 'MODULE' | 'FUNCTION' | 'BLUEPRINT' | 'EVIDENCE' | 'LOGS' | 'STACK_TRACE';
  label: string;
  value: any;
  childNodes?: IDrillDownNode[];
}

export interface IDrillDownPath {
  pathId: string;
  metricKey: string;
  depth: number;
  breadcrumbs: string[];
  currentNode: IDrillDownNode;
}

export interface IDrillDownExplorerReport {
  engineName: 'DrillDownExplorer';
  supportedMetricPathsCount: number;
  availableExplorerPaths: IDrillDownPath[];
}

// ----------------------------------------------------------------------------
// 5. Personal Workspace Engine Types
// ----------------------------------------------------------------------------
export type UserRole =
  | 'FOUNDER'
  | 'ADMINISTRATOR'
  | 'DEVELOPER'
  | 'QA_ENGINEER'
  | 'KNOWLEDGE_CURATOR'
  | 'CONSULTANT'
  | 'SALES'
  | 'SUPPORT'
  | 'VIEWER'
  | 'VISITOR';

export interface IRoleDashboardProfile {
  role: UserRole;
  displayName: string;
  defaultWidgets: WidgetType[];
  savedLayoutId: string;
  appliedFilters: Record<string, any>;
  savedViews: string[];
  favorites: string[];
  dashboardSettings: {
    theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    refreshRateSec: number;
    compactView: boolean;
  };
}

export interface IRoleDashboardsReport {
  engineName: 'RoleDashboards';
  availableRolesCount: number;
  roleProfiles: Record<UserRole, IRoleDashboardProfile>;
}

// ----------------------------------------------------------------------------
// 6. Layout Manager Types
// ----------------------------------------------------------------------------
export interface ISavedLayout {
  layoutId: string;
  layoutName: string;
  createdByRole: UserRole;
  widgetConfigs: Array<{ widgetId: string; config: IWidgetConfig }>;
  isTemplate: boolean;
  createdAt: string;
}

export interface IWidgetLayoutsReport {
  engineName: 'WidgetLayoutsManager';
  activeLayoutId: string;
  totalSavedLayouts: number;
  layouts: ISavedLayout[];
}

// ----------------------------------------------------------------------------
// 7. Notification Center Types
// ----------------------------------------------------------------------------
export type NotificationCategory =
  | 'ALERTS'
  | 'WARNINGS'
  | 'ERRORS'
  | 'SUCCESS'
  | 'RELEASE_READY'
  | 'ARCHITECTURE_DRIFT'
  | 'SECURITY'
  | 'REGRESSION'
  | 'KNOWLEDGE'
  | 'BLUEPRINT';

export interface IDashboardNotification {
  notificationId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface INotificationsReport {
  engineName: 'NotificationCenter';
  unreadCount: number;
  totalNotificationsCount: number;
  notifications: IDashboardNotification[];
}

// ----------------------------------------------------------------------------
// 8. Global Filter Engine Types
// ----------------------------------------------------------------------------
export interface IGlobalFilterState {
  dateRange?: { start: string; end: string };
  project?: string;
  blueprintId?: string;
  engineId?: string;
  knowledgeDomain?: string;
  consultantId?: string;
  clientId?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  executionId?: string;
}

export interface IGlobalFiltersReport {
  engineName: 'GlobalFilterEngine';
  activeFilters: IGlobalFilterState;
  isFiltered: boolean;
}

// ----------------------------------------------------------------------------
// 9. Dashboard Search Engine Types
// ----------------------------------------------------------------------------
export interface ISearchItemResult {
  itemId: string;
  category: 'BLUEPRINT' | 'KNOWLEDGE' | 'REPORT' | 'FAILURE' | 'VALIDATION_RUN' | 'DATASET' | 'PROJECT' | 'AUDIT_LOG';
  title: string;
  snippet: string;
  relevanceScore: number;
}

export interface IDashboardSearchReport {
  engineName: 'DashboardSearchEngine';
  query: string;
  totalResultsCount: number;
  results: ISearchItemResult[];
}

// ----------------------------------------------------------------------------
// 10. Dashboard Snapshot Engine Types
// ----------------------------------------------------------------------------
export interface IDashboardSnapshot {
  snapshotId: string;
  capturedAt: string;
  buildId: string;
  qualityScore: number;
  coveragePercentage: number;
  releaseState: string;
  dataDigestHash: string;
}

export interface IDashboardSnapshotsReport {
  engineName: 'DashboardSnapshotEngine';
  totalSnapshotsCount: number;
  latestSnapshot: IDashboardSnapshot;
  comparisonResult?: {
    baselineSnapshotId: string;
    comparedSnapshotId: string;
    qualityDelta: number;
    coverageDelta: number;
    isIdentical: boolean;
  };
  snapshots: IDashboardSnapshot[];
}

// ----------------------------------------------------------------------------
// OUTPUT CONTRACT: IEnterpriseValidationDashboardV21
// ----------------------------------------------------------------------------
export interface IEnterpriseValidationDashboardV21 {
  version: '2.1.0-EVD-ENTERPRISE-OPERATIONS-UI';
  timestamp: string;
  v20Dashboard: IEnterpriseValidationDashboard;
  DashboardRenderer: IDashboardRendererReport;
  WidgetRegistry: IWidgetRegistryReport;
  WidgetLayouts: IWidgetLayoutsReport;
  LiveEvents: ILiveEventsReport;
  DrillDownExplorer: IDrillDownExplorerReport;
  RoleDashboards: IRoleDashboardsReport;
  Notifications: INotificationsReport;
  GlobalFilters: IGlobalFiltersReport;
  DashboardSearch: IDashboardSearchReport;
  DashboardSnapshots: IDashboardSnapshotsReport;
}
