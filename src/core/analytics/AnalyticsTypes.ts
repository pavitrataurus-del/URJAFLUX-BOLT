export interface BaseAnalyticsEntity {
  id: string; // UUID
  version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'ARCHIVED' | 'TRIGGERED' | 'RESOLVED';
  owner: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  tags: string[];
}

export interface Dimension {
  name: string;
  value: string;
}

export interface Measure {
  name: string;
  value: number;
  unit?: string;
}

export interface AnalyticsDataset extends BaseAnalyticsEntity {
  name: string;
  description: string;
  sourceDomain: string; // e.g., "DOMAIN-011", "DOMAIN-012"
  dimensions: string[]; // list of dimension names
  measures: string[];   // list of measure names
  recordsCount: number;
  lastIngestedAt: string;
}

export interface AnalyticsSnapshot extends BaseAnalyticsEntity {
  datasetId: string;
  timestamp: string; // Time Series index
  dimensions: Dimension[];
  measures: Measure[];
}

export interface KPI extends BaseAnalyticsEntity {
  name: string;
  description: string;
  groupId: string;
  formulaCode: string; // formula representation e.g. "SUCCESS_RUNS / TOTAL_RUNS"
  currentValue: number;
  targetValue: number;
  unit: string;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  statusSeverity: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  dimensionFilters: Dimension[];
}

export interface KPIGroup extends BaseAnalyticsEntity {
  name: string;
  description: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'LINE' | 'BAR' | 'PIE' | 'RADAR' | 'GAUGE' | 'HEATMAP' | 'TIMELINE' | 'CARD' | 'TABLE';
  kpiId?: string;
  metricName?: string;
  chartSettings: Record<string, any>;
  gridSettings: {
    w: number; // width in grid columns
    h: number; // height in grid units
    x: number;
    y: number;
  };
}

export interface Dashboard extends BaseAnalyticsEntity {
  name: string;
  description: string;
  category: 'EXECUTIVE' | 'PROJECT' | 'OPERATIONS' | 'AI' | 'VISION' | 'WORKFLOW' | 'SPATIAL' | 'INTEGRATION' | 'COLLABORATION';
  widgets: DashboardWidget[];
  isLocked: boolean;
}

export interface Metric extends BaseAnalyticsEntity {
  name: string;
  category: string; // e.g. "SLA_COMPLIANCE", "ACCURACY"
  value: number;
  timestamp: string;
}

export interface Trend extends BaseAnalyticsEntity {
  metricName: string;
  historicalPoints: { timestamp: string; value: number }[];
  growthPercentage: number;
  seasonalityDetected: boolean;
  patterns: string[]; // e.g. ["Weekly spike on Mondays"]
  anomalyIndices: number[]; // indices of points that are anomalies
}

export interface Forecast extends BaseAnalyticsEntity {
  metricName: string;
  forecastPoints: { timestamp: string; value: number; confidenceMin: number; confidenceMax: number }[];
  modelType: 'ARIMA' | 'EXPONENTIAL_SMOOTHING' | 'LINEAR_REGRESSION' | 'PROPHET';
  horizonDays: number;
  accuracyConfidenceScore: number; // e.g. 0.92
}

export interface AlertMetric extends BaseAnalyticsEntity {
  metricName: string;
  conditionType: 'THRESHOLD_GREATER' | 'THRESHOLD_LESS' | 'TREND_DEVIATION' | 'FORECAST_BREACH' | 'ANOMALY_DETECTED';
  thresholdValue: number;
  currentValue: number;
  message: string;
  workflowTriggered: boolean;
}

export interface Insight extends BaseAnalyticsEntity {
  title: string;
  description: string;
  type: 'OPPORTUNITY' | 'RISK' | 'OPERATIONAL' | 'PERFORMANCE' | 'CAPACITY' | 'COST';
  confidenceScore: number; // 0.0 to 1.0
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedKpiIds: string[];
  evidenceMetrics: { name: string; value: number; timestamp: string }[];
}
