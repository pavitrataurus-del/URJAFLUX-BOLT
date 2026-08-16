import {
  IMaintenanceRecord,
  IInspectionSchedule,
  MaintenanceType,
  MaintenanceStatus,
  InspectionScheduleFrequency
} from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';
import { ExecutionUserRole } from '../execution/ExecutionTypes';

export class MaintenancePlanningService {
  /**
   * Retrieves maintenance records for a digital twin or all.
   */
  public static getMaintenanceRecords(digitalTwinId?: string): IMaintenanceRecord[] {
    return DigitalTwinRegistry.getMaintenanceRecords(digitalTwinId);
  }

  /**
   * Creates a new scheduled maintenance record.
   */
  public static scheduleMaintenance(
    digitalTwinId: string,
    title: string,
    maintenanceType: MaintenanceType,
    scheduledDate: string,
    assignedTo: string,
    assignedRole: ExecutionUserRole,
    notes: string,
    remedyId?: string,
    estimatedCostPlaceholder?: number
  ): IMaintenanceRecord {
    const now = new Date().toISOString();
    const newRecord: IMaintenanceRecord = {
      id: `MAINT-${Math.floor(Math.random() * 90000) + 10000}`,
      version: '1.0.0',
      status: 'SCHEDULED',
      owner: 'MaintenancePlanningService',
      createdBy: assignedTo,
      updatedBy: assignedTo,
      createdAt: now,
      updatedAt: now,
      digitalTwinId,
      remedyId,
      title,
      maintenanceType,
      scheduledDate,
      assignedTo,
      assignedRole,
      maintenanceStatus: 'SCHEDULED',
      estimatedCostPlaceholder,
      notes
    };

    DigitalTwinRegistry.addMaintenanceRecord(newRecord);

    // Register Timeline Event
    DigitalTwinRegistry.addTimelineEvent({
      eventId: `TL-${Date.now()}`,
      digitalTwinId,
      eventType: 'MAINTENANCE',
      title: `Maintenance Scheduled: ${title}`,
      description: `${maintenanceType} maintenance assigned to ${assignedTo} for ${scheduledDate}.`,
      timestamp: now,
      actor: assignedTo,
      actorRole: assignedRole
    });

    return newRecord;
  }

  /**
   * Updates maintenance completion status.
   */
  public static completeMaintenance(
    maintenanceId: string,
    actorName: string,
    notes?: string
  ): boolean {
    const record = DigitalTwinRegistry.getMaintenanceRecords().find((m) => m.id === maintenanceId);
    if (!record) return false;

    const now = new Date().toISOString();
    record.maintenanceStatus = 'COMPLETED';
    record.completedDate = now;
    record.updatedAt = now;
    if (notes) record.notes = `${record.notes} [Completion note: ${notes}]`;

    DigitalTwinRegistry.addTimelineEvent({
      eventId: `TL-${Date.now()}`,
      digitalTwinId: record.digitalTwinId,
      eventType: 'MAINTENANCE',
      title: `Maintenance Completed: ${record.title}`,
      description: `Task completed by ${actorName}. ${notes || ''}`,
      timestamp: now,
      actor: actorName,
      actorRole: 'FIELD_ENGINEER'
    });

    return true;
  }

  /**
   * Retrieves inspection schedules.
   */
  public static getInspectionSchedules(digitalTwinId?: string): IInspectionSchedule[] {
    return DigitalTwinRegistry.getInspectionSchedules(digitalTwinId);
  }
}
