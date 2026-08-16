import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Calendar,
  Layers,
  History,
  CheckCircle,
  Eye,
  RefreshCw,
  Plus,
  Clock,
  UserCheck,
  Compass,
  FileText,
  Building,
  Zap,
  ArrowRight,
  Sparkles,
  Sliders,
  Filter,
  CheckSquare
} from 'lucide-react';
import {
  IDigitalTwin,
  IPropertySnapshot,
  IChangeEvent,
  IMonitoringAlert,
  IMaintenanceRecord,
  IComplianceRecord,
  ITimelineEvent,
  AlertStatus,
  AlertSeverity,
  MaintenanceType
} from '../../core/monitoring/MonitoringTypes';
import { DigitalTwinEngine } from '../../core/monitoring/DigitalTwinEngine';
import { ChangeDetectionEngine } from '../../core/monitoring/ChangeDetectionEngine';
import { AlertEngineService } from '../../core/monitoring/AlertEngineService';
import { ComplianceMonitoringService } from '../../core/monitoring/ComplianceMonitoringService';
import { MaintenancePlanningService } from '../../core/monitoring/MaintenancePlanningService';
import { TimelineEngineService } from '../../core/monitoring/TimelineEngineService';
import { ExecutionUserRole } from '../../core/execution/ExecutionTypes';

export function MonitoringWorkspace() {
  // 1. RBAC User Role State
  const [userRole, setUserRole] = useState<ExecutionUserRole>('ADMIN');

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<
    'TWIN' | 'CHANGES' | 'ALERTS' | 'COMPLIANCE' | 'MAINTENANCE' | 'TIMELINE'
  >('TWIN');

  // 3. Loaded Data State
  const [twins, setTwins] = useState<IDigitalTwin[]>([]);
  const [selectedTwin, setSelectedTwin] = useState<IDigitalTwin | null>(null);
  const [changeEvents, setChangeEvents] = useState<IChangeEvent[]>([]);
  const [alerts, setAlerts] = useState<IMonitoringAlert[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<IMaintenanceRecord[]>([]);
  const [complianceRecord, setComplianceRecord] = useState<IComplianceRecord | undefined>(undefined);
  const [timelineEvents, setTimelineEvents] = useState<ITimelineEvent[]>([]);

  // Modal / Form States
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintTitle, setMaintTitle] = useState('');
  const [maintType, setMaintType] = useState<MaintenanceType>('PREVENTIVE');
  const [maintDate, setMaintDate] = useState('');
  const [maintAssignee, setMaintAssignee] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const allTwins = DigitalTwinEngine.getAllTwins();
    setTwins(allTwins);
    if (allTwins.length > 0) {
      const active = allTwins[0];
      setSelectedTwin(active);
      setChangeEvents(ChangeDetectionEngine.compareSnapshots ? ChangeDetectionEngine.compareSnapshots(active.snapshotsHistory[0], active.snapshotsHistory[1]) : []);
      setAlerts(AlertEngineService.getAlerts(active.id));
      setMaintenanceRecords(MaintenancePlanningService.getMaintenanceRecords(active.id));
      setComplianceRecord(ComplianceMonitoringService.getComplianceRecord(active.id));
      setTimelineEvents(TimelineEngineService.getTimeline(active.id));
    }
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // RBAC Permission Checks
  const canModifyMonitoring = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';
  const canSubmitFieldRecords = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER' || userRole === 'FIELD_ENGINEER';

  // Handle Snapshot Creation (Change Detection)
  const handleCreateSnapshot = () => {
    if (!selectedTwin || !newSnapshotLabel) return;
    const activeSnap = selectedTwin.snapshotsHistory[selectedTwin.snapshotsHistory.length - 1];

    // Create a new room zone set with a simulated object relocation/addition
    const modifiedZones = activeSnap.roomZones.map((zone) => {
      if (zone.zoneId === 'ZONE-NE-01') {
        return {
          ...zone,
          placedObjects: [
            ...zone.placedObjects,
            {
              objectId: `OBJ-${Math.floor(Math.random() * 900) + 100}`,
              objectName: 'Brass Crystal Vastu Pyramid',
              category: 'POSITIVE_AMPLIFIER',
              coordinateX: 2.8,
              coordinateY: 4.3
            }
          ]
        };
      }
      return zone;
    });

    const newSnap = DigitalTwinEngine.createSnapshot(
      selectedTwin.id,
      newSnapshotLabel,
      modifiedZones,
      'v1.2-CAD-2026',
      userRole === 'ADMIN' ? 'Admin Officer' : 'Field Engineer Arjun'
    );

    if (newSnap && activeSnap) {
      ChangeDetectionEngine.compareSnapshots(activeSnap, newSnap, 'DigitalTwinDiffEngine');
    }

    setShowSnapshotModal(false);
    setNewSnapshotLabel('');
    handleRefresh();
  };

  // Handle Alert Status Transition
  const handleAlertAction = (alertId: string, status: AlertStatus) => {
    AlertEngineService.transitionAlert(alertId, status, userRole, 'Resolved via Monitoring Dashboard');
    handleRefresh();
  };

  // Handle Scheduling Maintenance
  const handleScheduleMaintenance = () => {
    if (!selectedTwin || !maintTitle || !maintDate) return;
    MaintenancePlanningService.scheduleMaintenance(
      selectedTwin.id,
      maintTitle,
      maintType,
      maintDate,
      maintAssignee || 'Field Lead Arjun',
      'FIELD_ENGINEER',
      maintNotes || 'Scheduled from Monitoring Workspace',
      undefined,
      1200
    );
    setShowMaintModal(false);
    setMaintTitle('');
    setMaintNotes('');
    handleRefresh();
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 font-sans">
      {/* 1. TOP HEADER & RBAC CONTROLLER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                  DOMAIN-008
                </span>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Monitoring & Digital Twin Intelligence Engine
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                URJAFLUX AI OS • Continuous Property State, Change Detection & Health Orchestrator
              </p>
            </div>
          </div>
        </div>

        {/* RBAC ROLE SELECTOR & ACTION BAR */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-400">Active Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as ExecutionUserRole)}
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ADMIN">ADMIN (Full Governance)</option>
              <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
              <option value="FIELD_ENGINEER">FIELD ENGINEER</option>
              <option value="END_USER">END USER (Read-Only)</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </button>
        </div>
      </div>

      {/* 2. KEY METRICS & HEALTH KPI BANNER */}
      {selectedTwin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Property Health Score</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">{selectedTwin.overallHealthScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${selectedTwin.overallHealthScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Compliance Rating</span>
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400">{selectedTwin.complianceScore}%</span>
            </div>
            <span className="text-[11px] text-slate-400">Verified Shastric Alignment</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">{alerts.filter((a) => a.alertStatus === 'ACTIVE').length}</span>
              <span className="text-xs text-slate-400">Active</span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-medium">Requires Inspection</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Maintenance Status</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-base font-bold text-purple-300 capitalize">{selectedTwin.maintenancePriority}</div>
            <span className="text-[11px] text-slate-400">Next: {new Date(selectedTwin.nextScheduledInspectionAt).toLocaleDateString()}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Snapshot</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-blue-300">v{selectedTwin.version}</div>
            <span className="text-[11px] text-slate-400">{selectedTwin.snapshotsHistory.length} Snapshots Logged</span>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'TWIN', label: 'Digital Twin & Layout', icon: Layers },
          { id: 'CHANGES', label: 'Change Detection', icon: Compass },
          { id: 'ALERTS', label: 'Alert Center', icon: AlertTriangle, badge: alerts.filter((a) => a.alertStatus === 'ACTIVE').length },
          { id: 'COMPLIANCE', label: 'Compliance Metrics', icon: Shield },
          { id: 'MAINTENANCE', label: 'Maintenance Calendar', icon: Calendar },
          { id: 'TIMELINE', label: 'Timeline Replay Engine', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="mt-6">
        {/* =========================================
            TAB 1: DIGITAL TWIN & LAYOUT EXPLORER
           ========================================= */}
        {activeTab === 'TWIN' && selectedTwin && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedTwin.propertyName}</h3>
                <p className="text-xs text-slate-400">{selectedTwin.siteAddress} • Code: {selectedTwin.propertyCode}</p>
              </div>

              {canModifyMonitoring && (
                <button
                  onClick={() => setShowSnapshotModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Capture New Property Snapshot
                </button>
              )}
            </div>

            {/* SNAPSHOT ROOM ZONES LIST */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedTwin.snapshotsHistory[selectedTwin.snapshotsHistory.length - 1].roomZones.map((zone) => (
                <div key={zone.zoneId} className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{zone.zoneId}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">
                        {zone.panchaTattvaElement}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 mt-2">{zone.zoneName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Compass Angle: {zone.directionAngleDeg}°</p>

                    {/* Installed Remedies */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Installed Remedies ({zone.installedRemedies.length})
                      </span>
                      {zone.installedRemedies.map((rem) => (
                        <div key={rem.remedyId} className="text-xs p-2 bg-slate-950/80 rounded border border-slate-800/80 mb-1 flex items-center justify-between">
                          <span className="font-medium text-slate-300">{rem.remedyTitle}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rem.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                            {rem.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Objects Placed */}
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Tracked Objects ({zone.placedObjects.length})
                      </span>
                      {zone.placedObjects.map((obj) => (
                        <div key={obj.objectId} className="text-xs p-2 bg-slate-950/40 rounded border border-slate-800/50 mb-1 flex items-center justify-between text-slate-400">
                          <span>{obj.objectName}</span>
                          <span className="font-mono text-[10px]">({obj.coordinateX}, {obj.coordinateY})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sensor Readings */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Live Telemetry Sensors
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {zone.sensorReadings.map((sens) => (
                        <div key={sens.sensorId} className="bg-slate-950 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">{sens.sensorType}</div>
                          <div className="text-xs font-bold text-cyan-300 mt-0.5">
                            {sens.value} {sens.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: CHANGE DETECTION VIEWER
           ========================================= */}
        {activeTab === 'CHANGES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Property Digital Twin Differential Analyzer</h3>
                <p className="text-xs text-slate-400">Detects spatial, elemental, measurement, or layout deviations across consecutive property snapshots.</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                {changeEvents.length} Differences Detected
              </span>
            </div>

            <div className="space-y-3">
              {changeEvents.map((evt) => (
                <div key={evt.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 mt-0.5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 font-mono">{evt.changeType}</span>
                        <span className="text-xs text-slate-500">• Zone: {evt.zoneId}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${evt.severity === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                        {evt.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">{evt.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Detected: {new Date(evt.detectedAt).toLocaleString()}</span>
                      <span>By: {evt.detectedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: ALERT CENTER
           ========================================= */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Active Monitoring Alerts</h3>
                <p className="text-xs text-slate-400">Automated triggers for overdue inspections, evidence gaps, or threshold breaches.</p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border mt-0.5 ${alt.severity === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{alt.alertCategory}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${alt.alertStatus === 'ACTIVE' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                          {alt.alertStatus}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">{alt.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{alt.message}</p>
                    </div>
                  </div>

                  {canModifyMonitoring && alt.alertStatus === 'ACTIVE' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAlertAction(alt.id, 'ACKNOWLEDGED')}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleAlertAction(alt.id, 'RESOLVED')}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded transition"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: COMPLIANCE METRICS
           ========================================= */}
        {activeTab === 'COMPLIANCE' && complianceRecord && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Compliance & Documentation Completeness Matrix</h3>
              <p className="text-xs text-slate-400">Evaluates recommendation alignment, inspection validity, and evidence coverage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Recommendation Compliance', value: complianceRecord.recommendationCompliancePercentage, color: 'bg-emerald-500' },
                { label: 'Execution Compliance', value: complianceRecord.executionCompliancePercentage, color: 'bg-cyan-500' },
                { label: 'Inspection Audit Compliance', value: complianceRecord.inspectionCompliancePercentage, color: 'bg-blue-500' },
                { label: 'Documentation Completeness', value: complianceRecord.documentationCompletenessPercentage, color: 'bg-purple-500' },
                { label: 'Evidence Freshness Index', value: complianceRecord.evidenceFreshnessPercentage, color: 'bg-amber-500' }
              ].map((metric, idx) => (
                <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                    <span>{metric.label}</span>
                    <span className="font-bold text-slate-100">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${metric.color} h-full rounded-full`} style={{ width: `${metric.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 5: MAINTENANCE CALENDAR
           ========================================= */}
        {activeTab === 'MAINTENANCE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Maintenance & Calibration Schedule</h3>
                <p className="text-xs text-slate-400">Manage preventive, corrective, and routine maintenance tasks for installed remedies.</p>
              </div>

              {canSubmitFieldRecords && (
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Maintenance
                </button>
              )}
            </div>

            <div className="space-y-3">
              {maintenanceRecords.map((m) => (
                <div key={m.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-400 font-mono">{m.maintenanceType}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.maintenanceStatus === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-purple-950 text-purple-300'}`}>
                        {m.maintenanceStatus}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{m.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{m.notes}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Scheduled: {m.scheduledDate}</span>
                      <span>Assigned: {m.assignedTo} ({m.assignedRole})</span>
                    </div>
                  </div>

                  {canSubmitFieldRecords && m.maintenanceStatus !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        MaintenancePlanningService.completeMaintenance(m.id, userRole, 'Completed on site');
                        handleRefresh();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 6: TIMELINE REPLAY ENGINE
           ========================================= */}
        {activeTab === 'TIMELINE' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Historical Chronological Replay Engine</h3>
              <p className="text-xs text-slate-400">Complete immutable audit trail across Reasoning → Execution → Monitoring events.</p>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
              {timelineEvents.map((evt) => (
                <div key={evt.eventId} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-950"></div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{evt.eventType}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{evt.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{evt.description}</p>
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">
                      Actor: {evt.actor} ({evt.actorRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CAPTURE SNAPSHOT */}
      {showSnapshotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100">Capture New Property Snapshot</h3>
            <p className="text-xs text-slate-400">Takes a new versioned digital twin snapshot and runs difference detection.</p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Snapshot Label / Reason</label>
              <input
                type="text"
                value={newSnapshotLabel}
                onChange={(e) => setNewSnapshotLabel(e.target.value)}
                placeholder="e.g. Q3 Post-Remedy Re-Inspection Snapshot"
                className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSnapshotModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnapshot}
                className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
              >
                Capture & Analyze Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE MAINTENANCE */}
      {showMaintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100">Schedule Remedy Maintenance</h3>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                value={maintTitle}
                onChange={(e) => setMaintTitle(e.target.value)}
                placeholder="e.g. Copper Pyramid Re-Alignment"
                className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                >
                  <option value="PREVENTIVE">PREVENTIVE</option>
                  <option value="CORRECTIVE">CORRECTIVE</option>
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notes & Instructions</label>
              <textarea
                value={maintNotes}
                onChange={(e) => setMaintNotes(e.target.value)}
                placeholder="Specific alignment parameters or cleaning instructions..."
                className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMaintModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMaintenance}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
              >
                Schedule Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
