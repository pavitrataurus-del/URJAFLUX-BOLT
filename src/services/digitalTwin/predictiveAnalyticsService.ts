// Module 13: Predictive Analytics & Anomaly Detection Engine
import { 
  AnomalyAlert, 
  MaintenanceRecommendation 
} from "../../types/digitalTwin";

export class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;

  private constructor() {}

  public static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  public getActiveAnomalyAlerts(): AnomalyAlert[] {
    const now = new Date().toISOString();
    return [
      {
        id: "ALT-01",
        twinId: "TWIN-RM-103",
        twinName: "Vayu Lounge Workstations",
        metricName: "CO2 IAQ Concentration",
        currentValue: 880,
        expectedRange: [400, 800],
        severity: "MEDIUM",
        timestamp: now,
        recommendedAction: "Increase AHU-1 fresh air intake damper by 15% to clear CO2 buildup."
      },
      {
        id: "ALT-02",
        twinId: "TWIN-EQP-AHU1",
        twinName: "Air Handling Unit #01",
        metricName: "Vibration Amplitude (X-Axis)",
        currentValue: 4.8,
        expectedRange: [0.5, 3.2],
        severity: "HIGH",
        timestamp: now,
        recommendedAction: "Schedule bearing lubrication inspection within 48 hours to prevent motor imbalance."
      }
    ];
  }

  public getMaintenanceRecommendations(): MaintenanceRecommendation[] {
    return [
      {
        equipmentTwinId: "TWIN-EQP-AHU1",
        equipmentName: "Air Handling Unit #01",
        healthIndexPercent: 82,
        estimatedRemainingLifeDays: 140,
        recommendedService: "Replace HEPA Air Filter Stage 2 & Check Belt Tension",
        confidenceScore: 0.94
      },
      {
        equipmentTwinId: "TWIN-RM-102",
        equipmentName: "Agni Power Vault Transformer T-1",
        healthIndexPercent: 95,
        estimatedRemainingLifeDays: 820,
        recommendedService: "Routine Oil Dielectric Breakdown Testing",
        confidenceScore: 0.98
      }
    ];
  }
}

export const predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();
