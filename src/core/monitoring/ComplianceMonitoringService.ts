import { IComplianceRecord, IPropertyHealthMetrics } from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';

export class ComplianceMonitoringService {
  /**
   * Retrieves latest compliance records.
   */
  public static getComplianceRecord(digitalTwinId: string): IComplianceRecord | undefined {
    const records = DigitalTwinRegistry.getComplianceRecords(digitalTwinId);
    return records.length > 0 ? records[0] : undefined;
  }

  /**
   * Evaluates and updates compliance metrics for a digital twin deterministically.
   */
  public static evaluateCompliance(
    digitalTwinId: string,
    projectId: string,
    remediesCount: number = 3,
    evidenceCount: number = 3,
    inspectionPassed: boolean = true
  ): IComplianceRecord {
    const now = new Date().toISOString();

    const recScore = Math.min(100, Math.round((remediesCount / 3) * 100));
    const execScore = 90;
    const inspScore = inspectionPassed ? 100 : 60;
    const docScore = 95;
    const evScore = Math.min(100, Math.round((evidenceCount / 3) * 100));

    const overall = Math.round((recScore * 0.25) + (execScore * 0.25) + (inspScore * 0.2) + (docScore * 0.15) + (evScore * 0.15));

    const record: IComplianceRecord = {
      id: `COMP-${Math.floor(Math.random() * 9000) + 1000}`,
      version: '1.0.0',
      status: 'VERIFIED',
      owner: 'ComplianceMonitoringService',
      createdBy: 'COMPLIANCE_EVALUATOR',
      updatedBy: 'COMPLIANCE_EVALUATOR',
      createdAt: now,
      updatedAt: now,
      digitalTwinId,
      projectId,
      recommendationCompliancePercentage: recScore,
      executionCompliancePercentage: execScore,
      inspectionCompliancePercentage: inspScore,
      documentationCompletenessPercentage: docScore,
      evidenceFreshnessPercentage: evScore,
      overallComplianceScore: overall,
      evaluationTimestamp: now
    };

    DigitalTwinRegistry.getComplianceRecords().unshift(record);

    return record;
  }

  /**
   * Calculates deterministic health metrics for a property.
   */
  public static calculateHealthMetrics(digitalTwinId: string): IPropertyHealthMetrics {
    const twin = DigitalTwinRegistry.getDigitalTwinById(digitalTwinId);
    const activeAlerts = DigitalTwinRegistry.getAlerts(digitalTwinId).filter((a) => a.alertStatus === 'ACTIVE');
    const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');

    let baseHealth = twin ? twin.overallHealthScore : 85;
    baseHealth -= criticalAlerts.length * 5;
    baseHealth = Math.max(0, Math.min(100, baseHealth));

    const maintenancePriorityScore = activeAlerts.length > 2 ? 85 : 40;
    const inspectionPriorityScore = criticalAlerts.length > 0 ? 90 : 30;

    return {
      digitalTwinId,
      propertyHealthScore: baseHealth,
      maintenancePriorityScore,
      inspectionPriorityScore,
      complianceTrend: baseHealth >= 85 ? 'IMPROVING' : baseHealth >= 70 ? 'STABLE' : 'DEGRADED',
      riskTrend: criticalAlerts.length > 0 ? 'INCREASING' : 'STABLE',
      totalActiveAlerts: activeAlerts.length,
      criticalAlertsCount: criticalAlerts.length
    };
  }
}
