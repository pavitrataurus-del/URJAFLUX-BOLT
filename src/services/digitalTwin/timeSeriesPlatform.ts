// Module 9: Time Series Telemetry Platform (Historical Readings, Playback Timeline & Event Correlation)
import { 
  TelemetryReading, 
  TimeSeriesTrend,
  SensorType 
} from "../../types/digitalTwin";
import { iotIntegrationService } from "./iotIntegrationService";

export class TimeSeriesPlatform {
  private static instance: TimeSeriesPlatform;
  private telemetryStore: TelemetryReading[] = [];

  private constructor() {
    this.seed24HourTelemetryHistory();
  }

  public static getInstance(): TimeSeriesPlatform {
    if (!TimeSeriesPlatform.instance) {
      TimeSeriesPlatform.instance = new TimeSeriesPlatform();
    }
    return TimeSeriesPlatform.instance;
  }

  /**
   * Seed 24-hour hourly telemetry dataset for trend plotting & playback
   */
  private seed24HourTelemetryHistory(): void {
    const now = Date.now();
    const oneHour = 3600 * 1000;

    for (let i = 24; i >= 0; i--) {
      const timeIso = new Date(now - i * oneHour).toISOString();

      // Temperature
      this.telemetryStore.push({
        sensorId: "SNS-TEMP-NE101",
        twinId: "TWIN-RM-101",
        sensorType: "TEMPERATURE",
        value: Math.round((22.4 + Math.sin(i / 3) * 1.8) * 10) / 10,
        unit: "°C",
        quality: "GOOD",
        timestamp: timeIso
      });

      // Humidity
      this.telemetryStore.push({
        sensorId: "SNS-HUM-NE101",
        twinId: "TWIN-RM-101",
        sensorType: "HUMIDITY",
        value: Math.round((48 + Math.cos(i / 4) * 5) * 10) / 10,
        unit: "%RH",
        quality: "GOOD",
        timestamp: timeIso
      });

      // Power KW in SE Room
      this.telemetryStore.push({
        sensorId: "SNS-PWR-SE102",
        twinId: "TWIN-RM-102",
        sensorType: "POWER_METER",
        value: Math.round((38 + (i > 8 && i < 18 ? 12 : 2) + Math.random() * 2) * 10) / 10,
        unit: "kW",
        quality: "GOOD",
        timestamp: timeIso
      });

      // Air Quality CO2
      this.telemetryStore.push({
        sensorId: "SNS-AIR-NW103",
        twinId: "TWIN-RM-103",
        sensorType: "AIR_QUALITY_CO2",
        value: Math.round(520 + (i > 9 && i < 17 ? 320 : 40) + Math.random() * 30),
        unit: "ppm",
        quality: "GOOD",
        timestamp: timeIso
      });

      // Occupancy
      this.telemetryStore.push({
        sensorId: "SNS-PIR-NW103",
        twinId: "TWIN-RM-103",
        sensorType: "OCCUPANCY_COUNT",
        value: i > 8 && i < 18 ? Math.floor(22 + Math.random() * 8) : 2,
        unit: "people",
        quality: "GOOD",
        timestamp: timeIso
      });
    }
  }

  public getTelemetryHistory(sensorId?: string): TelemetryReading[] {
    if (sensorId) {
      return this.telemetryStore.filter(t => t.sensorId === sensorId);
    }
    return this.telemetryStore;
  }

  public getSensorTrends(): TimeSeriesTrend[] {
    const sensors = iotIntegrationService.getSensorAdapters();
    return sensors.map(s => {
      const readings = this.getTelemetryHistory(s.sensorId);
      const vals = readings.map(r => r.value);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const min = vals.length ? Math.min(...vals) : 0;

      const unit = s.type === "TEMPERATURE" ? "°C" : s.type === "HUMIDITY" ? "%RH" : s.type === "POWER_METER" ? "kW" : s.type === "AIR_QUALITY_CO2" ? "ppm" : "occupants";

      return {
        sensorId: s.sensorId,
        sensorType: s.type,
        avg24h: Math.round(avg * 10) / 10,
        max24h: Math.round(max * 10) / 10,
        min24h: Math.round(min * 10) / 10,
        unit,
        trendDirection: max > avg * 1.15 ? "RISING" : "STABLE",
        anomalyDetected: max > s.maxThreshold
      };
    });
  }

  /**
   * Event Correlation: Correlate Occupancy Spikes with CO2 and Power load
   */
  public getEventCorrelations(): { event: string; correlationFactor: number; conclusion: string }[] {
    return [
      {
        event: "Workstation Occupancy Peak (11:00 AM - 03:00 PM) vs. CO2 PPM Rise",
        correlationFactor: 0.94,
        conclusion: "Strong positive correlation (+94%). High occupancy in Vayu Room drives CO2 from 540ppm to 860ppm. Fresh air intake automatically triggered."
      },
      {
        event: "Agni Server Power Demand vs. HVAC Chiller Compressor Load",
        correlationFactor: 0.88,
        conclusion: "Server rack thermal dissipation drives immediate 12kW load spike on AHU-1 compressor."
      }
    ];
  }
}

export const timeSeriesPlatform = TimeSeriesPlatform.getInstance();
