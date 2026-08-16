export enum MetricType {
  COUNTER = "COUNTER",
  GAUGE = "GAUGE",
  HISTOGRAM = "HISTOGRAM",
}

export interface TelemetryMetric {
  name: string;
  type: MetricType;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

export interface ITelemetryProvider {
  record(metric: TelemetryMetric): void;
}
