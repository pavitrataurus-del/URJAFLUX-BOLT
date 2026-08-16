import {
  IDigitalTwin,
  IPropertySnapshot,
  IChangeEvent,
  IMonitoringAlert,
  IMaintenanceRecord,
  IInspectionSchedule,
  IComplianceRecord,
  ITimelineEvent,
  IPropertyHealthMetrics,
  IDigitalTwinRoomZone
} from './MonitoringTypes';

class DigitalTwinRegistryClass {
  private digitalTwins: Map<string, IDigitalTwin> = new Map();
  private changeEvents: IChangeEvent[] = [];
  private alerts: IMonitoringAlert[] = [];
  private maintenanceRecords: IMaintenanceRecord[] = [];
  private inspectionSchedules: IInspectionSchedule[] = [];
  private complianceRecords: IComplianceRecord[] = [];
  private timelineEvents: ITimelineEvent[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();

    // 1. Seed Initial Digital Twin Room Zones
    const roomZones: IDigitalTwinRoomZone[] = [
      {
        zoneId: 'ZONE-NE-01',
        zoneName: 'Northeast (Ishan Zone - Water/Divine)',
        directionAngleDeg: 45,
        panchaTattvaElement: 'Jala (Water)',
        installedRemedies: [
          {
            remedyId: 'REM-NE-VASTU-01',
            remedyTitle: 'PyraGrid Brass Crystal Energy Harmonic Diffuser',
            installedDate: lastWeek,
            status: 'OPTIMAL'
          }
        ],
        placedObjects: [
          { objectId: 'OBJ-001', objectName: 'Copper Water Urn', category: 'ELEMENTAL_CORRECTION', coordinateX: 2.5, coordinateY: 4.1 },
          { objectId: 'OBJ-002', objectName: 'Marble Puja Altar', category: 'SACRED_FURNISHING', coordinateX: 3.0, coordinateY: 4.5 }
        ],
        sensorReadings: [
          { sensorId: 'SENS-MAG-01', sensorType: 'MAGNETIC_FIELD', value: 48.2, unit: 'µT', timestamp: now },
          { sensorId: 'SENS-LUX-01', sensorType: 'LIGHT_LUX', value: 350, unit: 'Lux', timestamp: now }
        ]
      },
      {
        zoneId: 'ZONE-SE-02',
        zoneName: 'Southeast (Agneya Zone - Fire)',
        directionAngleDeg: 135,
        panchaTattvaElement: 'Agni (Fire)',
        installedRemedies: [
          {
            remedyId: 'REM-SE-VASTU-02',
            remedyTitle: 'Agni Homa Copper Pyramid Neutralizer',
            installedDate: lastWeek,
            status: 'REQUIRES_INSPECTION'
          }
        ],
        placedObjects: [
          { objectId: 'OBJ-003', objectName: 'Induction Electrical Switchboard', category: 'ELECTRICAL', coordinateX: 8.2, coordinateY: 1.5 }
        ],
        sensorReadings: [
          { sensorId: 'SENS-ACO-01', sensorType: 'ACOUSTIC_FREQ', value: 432, unit: 'Hz', timestamp: now }
        ]
      },
      {
        zoneId: 'ZONE-SW-03',
        zoneName: 'Southwest (Nairrutya Zone - Earth/Stability)',
        directionAngleDeg: 225,
        panchaTattvaElement: 'Prithvi (Earth)',
        installedRemedies: [
          {
            remedyId: 'REM-SW-LAL-03',
            remedyTitle: '1952 Gutke Heavy Brass Anchor Weight',
            installedDate: lastWeek,
            status: 'OPTIMAL'
          }
        ],
        placedObjects: [
          { objectId: 'OBJ-004', objectName: 'Master Bedroom Heavy Wardrobe', category: 'FURNITURE', coordinateX: 1.2, coordinateY: 1.2 }
        ],
        sensorReadings: [
          { sensorId: 'SENS-PRAN-01', sensorType: 'PRANIC_VIBRATION', value: 8.8, unit: 'PR', timestamp: now }
        ]
      }
    ];

    // 2. Initial Snapshot v1
    const snapshotV1: IPropertySnapshot = {
      id: 'SNAP-001',
      version: '1.0.0',
      status: 'HISTORICAL',
      owner: 'URJAFLUX System',
      createdBy: 'ENGINE_SEED',
      updatedBy: 'ENGINE_SEED',
      createdAt: lastWeek,
      updatedAt: lastWeek,
      digitalTwinId: 'DT-UF-PRJ-2026-081',
      snapshotNumber: 1,
      snapshotLabel: 'Initial Post-Remedy Baseline',
      floorPlanVersion: 'v1.0-CAD-2026',
      roomZones: roomZones,
      overallHealthScore: 88,
      complianceRating: 92,
      totalRemediesInstalled: 3,
      capturedEvidenceIds: ['EVD-001', 'EVD-002'],
      inspectionRecordIds: ['INSP-001']
    };

    // Snapshot v2 (Recent change)
    const snapshotV2: IPropertySnapshot = {
      id: 'SNAP-002',
      version: '2.0.0',
      status: 'ACTIVE',
      owner: 'URJAFLUX System',
      createdBy: 'FIELD_ENGINEER_ARJUN',
      updatedBy: 'FIELD_ENGINEER_ARJUN',
      createdAt: yesterday,
      updatedAt: now,
      digitalTwinId: 'DT-UF-PRJ-2026-081',
      snapshotNumber: 2,
      snapshotLabel: 'Quarterly Field Verification & Relocation Snapshot',
      floorPlanVersion: 'v1.1-CAD-2026',
      roomZones: roomZones.map((z) => {
        if (z.zoneId === 'ZONE-SE-02') {
          return {
            ...z,
            placedObjects: [
              ...z.placedObjects,
              { objectId: 'OBJ-005', objectName: 'Metallic Water Cooler', category: 'WATER_ELEMENT_CONFLICT', coordinateX: 8.5, coordinateY: 1.8 }
            ]
          };
        }
        return z;
      }),
      overallHealthScore: 84,
      complianceRating: 88,
      totalRemediesInstalled: 3,
      capturedEvidenceIds: ['EVD-001', 'EVD-002', 'EVD-003'],
      inspectionRecordIds: ['INSP-001', 'INSP-002']
    };

    // Master Digital Twin
    const digitalTwin: IDigitalTwin = {
      id: 'DT-UF-PRJ-2026-081',
      version: '2.0.0',
      status: 'ACTIVE_MONITORING',
      owner: 'Vastu Tech Enterprise',
      createdBy: 'PROJECT_MANAGER_SURESH',
      updatedBy: 'FIELD_ENGINEER_ARJUN',
      createdAt: lastWeek,
      updatedAt: now,
      propertyId: 'PROP-DELHI-SOUTH-01',
      propertyCode: 'PROP-2026-DL-81',
      propertyName: 'Apex Tech Park Executive Tower (Suite 402)',
      clientName: 'Apex Vastu Tech India Ltd.',
      siteAddress: 'Plot 42, Sector 18, Okhla Industrial Area, New Delhi - 110020',
      relatedProjectId: 'UF-PRJ-2026-081',
      activeSnapshotId: 'SNAP-002',
      snapshotsHistory: [snapshotV1, snapshotV2],
      primaryDomains: ['Vastu', 'Chakra', 'LalKitab', 'Numerology'],
      overallHealthScore: 84,
      complianceScore: 88,
      maintenancePriority: 'ROUTINE',
      lastInspectedAt: yesterday,
      nextScheduledInspectionAt: nextWeek
    };

    this.digitalTwins.set(digitalTwin.id, digitalTwin);

    // 3. Seed Change Events
    this.changeEvents.push({
      id: 'CHG-001',
      version: '1.0.0',
      status: 'DETECTED',
      owner: 'DigitalTwinEngine',
      createdBy: 'CHANGE_DETECTOR_SERVICE',
      updatedBy: 'CHANGE_DETECTOR_SERVICE',
      createdAt: yesterday,
      updatedAt: yesterday,
      digitalTwinId: 'DT-UF-PRJ-2026-081',
      previousSnapshotId: 'SNAP-001',
      newSnapshotId: 'SNAP-002',
      changeType: 'OBJECT_ADDED',
      zoneId: 'ZONE-SE-02',
      description: 'Added Metallic Water Cooler object in Southeast (Agneya Fire Zone), causing Jala-Agni element friction.',
      detectedAt: yesterday,
      detectedBy: 'DIGITAL_TWIN_AI_DIFF',
      severity: 'MEDIUM',
      isResolved: false
    });

    // 4. Seed Alerts
    this.alerts.push(
      {
        id: 'ALT-001',
        version: '1.0.0',
        status: 'OPEN',
        owner: 'MonitoringEngine',
        createdBy: 'ALERT_ENGINE',
        updatedBy: 'ALERT_ENGINE',
        createdAt: yesterday,
        updatedAt: yesterday,
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        alertCategory: 'DIGITAL_TWIN_MISMATCH',
        severity: 'HIGH',
        title: 'Element Friction Detected in Agneya (SE Zone)',
        message: 'Water dispenser added to Fire zone. Risk of financial turbulence and operational delay.',
        alertStatus: 'ACTIVE'
      },
      {
        id: 'ALT-002',
        version: '1.0.0',
        status: 'OPEN',
        owner: 'MonitoringEngine',
        createdBy: 'ALERT_ENGINE',
        updatedBy: 'ALERT_ENGINE',
        createdAt: now,
        updatedAt: now,
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        alertCategory: 'MAINTENANCE_DUE',
        severity: 'MEDIUM',
        title: 'Agni Homa Copper Pyramid Maintenance Due',
        message: 'Routine cleaning and energy re-calibration required for Southeast remedy REM-SE-VASTU-02.',
        alertStatus: 'ACTIVE'
      }
    );

    // 5. Seed Maintenance Records
    this.maintenanceRecords.push(
      {
        id: 'MAINT-001',
        version: '1.0.0',
        status: 'SCHEDULED',
        owner: 'MaintenanceManager',
        createdBy: 'PROJECT_MANAGER_SURESH',
        updatedBy: 'PROJECT_MANAGER_SURESH',
        createdAt: lastWeek,
        updatedAt: lastWeek,
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        remedyId: 'REM-SE-VASTU-02',
        title: 'Bi-Monthly Copper Pyramid Re-Energization & Polishing',
        maintenanceType: 'PREVENTIVE',
        scheduledDate: nextWeek,
        assignedTo: 'Arjun Field Lead',
        assignedRole: 'FIELD_ENGINEER',
        maintenanceStatus: 'SCHEDULED',
        estimatedCostPlaceholder: 1500,
        notes: 'Wipe with natural lemon salt paste and realign to exact 135-degree true north magnetic orientation.'
      },
      {
        id: 'MAINT-002',
        version: '1.0.0',
        status: 'COMPLETED',
        owner: 'MaintenanceManager',
        createdBy: 'FIELD_ENGINEER_ARJUN',
        updatedBy: 'FIELD_ENGINEER_ARJUN',
        createdAt: lastWeek,
        updatedAt: lastWeek,
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        remedyId: 'REM-NE-VASTU-01',
        title: 'Initial PyraGrid Anchor Verification',
        maintenanceType: 'ROUTINE',
        scheduledDate: lastWeek,
        completedDate: lastWeek,
        assignedTo: 'Arjun Field Lead',
        assignedRole: 'FIELD_ENGINEER',
        maintenanceStatus: 'COMPLETED',
        estimatedCostPlaceholder: 500,
        notes: 'Anchor screws tightened and verified via spirit level meter.'
      }
    );

    // 6. Seed Inspection Schedules
    this.inspectionSchedules.push({
      id: 'INSP-SCHED-001',
      version: '1.0.0',
      status: 'ACTIVE',
      owner: 'InspectionScheduler',
      createdBy: 'PROJECT_MANAGER_SURESH',
      updatedBy: 'PROJECT_MANAGER_SURESH',
      createdAt: lastWeek,
      updatedAt: lastWeek,
      digitalTwinId: 'DT-UF-PRJ-2026-081',
      frequency: 'MONTHLY',
      nextDueDate: nextWeek,
      lastCompletedDate: yesterday,
      assignedInspector: 'Senior Consultant Rajesh',
      isOverdue: false
    });

    // 7. Seed Compliance Record
    this.complianceRecords.push({
      id: 'COMP-001',
      version: '1.0.0',
      status: 'VERIFIED',
      owner: 'ComplianceEngine',
      createdBy: 'COMPLIANCE_SERVICE',
      updatedBy: 'COMPLIANCE_SERVICE',
      createdAt: now,
      updatedAt: now,
      digitalTwinId: 'DT-UF-PRJ-2026-081',
      projectId: 'UF-PRJ-2026-081',
      recommendationCompliancePercentage: 92,
      executionCompliancePercentage: 88,
      inspectionCompliancePercentage: 100,
      documentationCompletenessPercentage: 95,
      evidenceFreshnessPercentage: 90,
      overallComplianceScore: 93,
      evaluationTimestamp: now
    });

    // 8. Seed Timeline Events
    this.timelineEvents.push(
      {
        eventId: 'TL-001',
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        eventType: 'RECOMMENDATION',
        title: 'Approved Vastu & Lal Kitab Remediation Plan',
        description: 'DOMAIN-006 synthesized cross-domain recommendations for Apex Tech Park.',
        timestamp: lastWeek,
        actor: 'Dr. Vastu Shastry',
        actorRole: 'ADMIN'
      },
      {
        eventId: 'TL-002',
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        eventType: 'EXECUTION',
        title: 'Project Execution & Task Conversion',
        description: 'DOMAIN-007 created execution project UF-PRJ-2026-081 with 3 work packages.',
        timestamp: lastWeek,
        actor: 'Suresh Project Manager',
        actorRole: 'PROJECT_MANAGER'
      },
      {
        eventId: 'TL-003',
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        eventType: 'EVIDENCE',
        title: 'Initial Site Baseline Evidence Uploaded',
        description: '2 high-resolution photos and GPS tags submitted into Evidence Vault.',
        timestamp: lastWeek,
        actor: 'Arjun Field Lead',
        actorRole: 'FIELD_ENGINEER'
      },
      {
        eventId: 'TL-004',
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        eventType: 'CHANGE',
        title: 'Digital Twin Snapshot v2 Created & Diff Detected',
        description: 'Water dispenser relocation detected in Southeast Fire Zone.',
        timestamp: yesterday,
        actor: 'DigitalTwinEngine',
        actorRole: 'ADMIN'
      },
      {
        eventId: 'TL-005',
        digitalTwinId: 'DT-UF-PRJ-2026-081',
        projectId: 'UF-PRJ-2026-081',
        eventType: 'ALERT',
        title: 'High Severity Alert Triggered',
        description: 'Element friction alert issued for Southeast zone.',
        timestamp: yesterday,
        actor: 'MonitoringEngine',
        actorRole: 'ADMIN'
      }
    );
  }

  // ----------------------------------------------------
  // PUBLIC GETTERS & MUTATORS
  // ----------------------------------------------------
  public getAllDigitalTwins(): IDigitalTwin[] {
    return Array.from(this.digitalTwins.values());
  }

  public getDigitalTwinById(id: string): IDigitalTwin | undefined {
    return this.digitalTwins.get(id);
  }

  public registerDigitalTwin(digitalTwin: IDigitalTwin): void {
    this.digitalTwins.set(digitalTwin.id, digitalTwin);
  }

  public addSnapshot(digitalTwinId: string, snapshot: IPropertySnapshot): void {
    const twin = this.digitalTwins.get(digitalTwinId);
    if (!twin) return;

    twin.snapshotsHistory.push(snapshot);
    twin.activeSnapshotId = snapshot.id;
    twin.updatedAt = new Date().toISOString();
    this.digitalTwins.set(digitalTwinId, twin);
  }

  public getChangeEvents(digitalTwinId?: string): IChangeEvent[] {
    if (!digitalTwinId) return this.changeEvents;
    return this.changeEvents.filter((c) => c.digitalTwinId === digitalTwinId);
  }

  public addChangeEvent(event: IChangeEvent): void {
    this.changeEvents.unshift(event);
  }

  public getAlerts(digitalTwinId?: string): IMonitoringAlert[] {
    if (!digitalTwinId) return this.alerts;
    return this.alerts.filter((a) => a.digitalTwinId === digitalTwinId);
  }

  public addAlert(alert: IMonitoringAlert): void {
    this.alerts.unshift(alert);
  }

  public updateAlertStatus(alertId: string, status: any, actor: string, notes?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.alertStatus = status;
    alert.updatedAt = new Date().toISOString();
    if (status === 'ACKNOWLEDGED') {
      alert.acknowledgedBy = actor;
      alert.acknowledgedAt = new Date().toISOString();
    } else if (status === 'RESOLVED') {
      alert.resolvedBy = actor;
      alert.resolvedAt = new Date().toISOString();
      if (notes) alert.resolutionNotes = notes;
    }
    return true;
  }

  public getMaintenanceRecords(digitalTwinId?: string): IMaintenanceRecord[] {
    if (!digitalTwinId) return this.maintenanceRecords;
    return this.maintenanceRecords.filter((m) => m.digitalTwinId === digitalTwinId);
  }

  public addMaintenanceRecord(record: IMaintenanceRecord): void {
    this.maintenanceRecords.unshift(record);
  }

  public getInspectionSchedules(digitalTwinId?: string): IInspectionSchedule[] {
    if (!digitalTwinId) return this.inspectionSchedules;
    return this.inspectionSchedules.filter((s) => s.digitalTwinId === digitalTwinId);
  }

  public getComplianceRecords(digitalTwinId?: string): IComplianceRecord[] {
    if (!digitalTwinId) return this.complianceRecords;
    return this.complianceRecords.filter((c) => c.digitalTwinId === digitalTwinId);
  }

  public getTimelineEvents(digitalTwinId?: string): ITimelineEvent[] {
    if (!digitalTwinId) return this.timelineEvents;
    return this.timelineEvents.filter((t) => t.digitalTwinId === digitalTwinId);
  }

  public addTimelineEvent(event: ITimelineEvent): void {
    this.timelineEvents.push(event);
  }
}

export const DigitalTwinRegistry = new DigitalTwinRegistryClass();
