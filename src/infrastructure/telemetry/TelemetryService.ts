import { MetricType, TelemetryMetric, ITelemetryProvider } from "./TelemetryTypes";

export class TelemetryService {
  private static instance: TelemetryService;
  private providers: ITelemetryProvider[] = [];

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public addProvider(provider: ITelemetryProvider): void {
    this.providers.push(provider);
  }

  public record(name: string, value: number, type: MetricType, tags?: Record<string, string>): void {
    const metric: TelemetryMetric = {
      name,
      type,
      value,
      tags,
      timestamp: Date.now(),
    };
    
    this.providers.forEach(p => p.record(metric));
  }

  public increment(name: string, value = 1, tags?: Record<string, string>): void {
    this.record(name, value, MetricType.COUNTER, tags);
  }

  public gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, MetricType.GAUGE, tags);
  }

  public timing(name: string, valueMs: number, tags?: Record<string, string>): void {
    this.record(name, valueMs, MetricType.HISTOGRAM, tags);
  }

  public trackExecutionTime<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = Date.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return (result as any).then((res: any) => {
          this.timing(name, Date.now() - start, tags);
          return res;
        }).catch((err: any) => {
          this.timing(name, Date.now() - start, { ...tags, error: "true" });
          throw err;
        }) as unknown as T;
      } else {
        this.timing(name, Date.now() - start, tags);
        return result;
      }
    } catch (e) {
      this.timing(name, Date.now() - start, { ...tags, error: "true" });
      throw e;
    }
  }
}
