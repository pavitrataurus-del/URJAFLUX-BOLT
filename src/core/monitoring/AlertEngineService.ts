import { IMonitoringAlert, AlertCategory, AlertSeverity, AlertStatus } from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';

export class AlertEngineService {
  /**
   * Retrieves alerts for a given digital twin or all twins.
   */
  public static getAlerts(digitalTwinId?: string): IMonitoringAlert[] {
    return DigitalTwinRegistry.getAlerts(digitalTwinId);
  }

  /**
   * Generates a new alert deterministically.
   */
  public static createAlert(
    digitalTwinId: string,
    alertCategory: AlertCategory,
    severity: AlertSeverity,
    title: string,
    message: string,
    projectId?: string
  ): IMonitoringAlert {
    const now = new Date().toISOString();
    const newAlert: IMonitoringAlert = {
      id: `ALT-${Math.floor(Math.random() * 90000) + 10000}`,
      version: '1.0.0',
      status: 'OPEN',
      owner: 'AlertEngine',
      createdBy: 'ALERT_ENGINE_SERVICE',
      updatedBy: 'ALERT_ENGINE_SERVICE',
      createdAt: now,
      updatedAt: now,
      digitalTwinId,
      projectId,
      alertCategory,
      severity,
      title,
      message,
      alertStatus: 'ACTIVE'
    };

    DigitalTwinRegistry.addAlert(newAlert);

    // Timeline event
    DigitalTwinRegistry.addTimelineEvent({
      eventId: `TL-${Date.now()}`,
      digitalTwinId,
      projectId,
      eventType: 'ALERT',
      title: `Alert Triggered: ${title}`,
      description: message,
      timestamp: now,
      actor: 'AlertEngine',
      actorRole: 'ADMIN'
    });

    return newAlert;
  }

  /**
   * Updates an alert status (Acknowledge / Resolve / Dismiss).
   */
  public static transitionAlert(
    alertId: string,
    targetStatus: AlertStatus,
    actorName: string,
    resolutionNotes?: string
  ): boolean {
    const success = DigitalTwinRegistry.updateAlertStatus(alertId, targetStatus, actorName, resolutionNotes);
    if (success) {
      const alert = DigitalTwinRegistry.getAlerts().find((a) => a.id === alertId);
      if (alert) {
        DigitalTwinRegistry.addTimelineEvent({
          eventId: `TL-${Date.now()}`,
          digitalTwinId: alert.digitalTwinId,
          projectId: alert.projectId,
          eventType: 'ALERT',
          title: `Alert ${targetStatus}: ${alert.title}`,
          description: resolutionNotes || `Alert marked as ${targetStatus} by ${actorName}.`,
          timestamp: new Date().toISOString(),
          actor: actorName,
          actorRole: 'PROJECT_MANAGER'
        });
      }
    }
    return success;
  }
}
