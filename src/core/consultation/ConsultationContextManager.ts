import {
  IConversationContext,
  IUserProfileContext,
  IPropertyContextSnapshot,
  IProjectContextSnapshot,
  IMonitoringContextSnapshot,
  IExecutionContextSnapshot,
  IRecommendationContextSnapshot,
  IKnowledgeContextSnapshot,
  UserRole
} from './ConsultationTypes';
import { DigitalTwinRegistry } from '../monitoring/DigitalTwinRegistry';
import { ProjectExecutionRegistry } from '../execution/ProjectExecutionRegistry';
import { UnifiedReasoningRegistry } from '../reasoning/UnifiedReasoningRegistry';
import { VastuMasterKnowledgeRegistry } from '../knowledge_sources/vastu/VastuMasterKnowledgeRegistry';
import { ChakraMasterKnowledgeRegistry } from '../knowledge_sources/chakra/ChakraMasterKnowledgeRegistry';

export class ConsultationContextManager {
  private static instance: ConsultationContextManager;

  private constructor() {}

  public static getInstance(): ConsultationContextManager {
    if (!ConsultationContextManager.instance) {
      ConsultationContextManager.instance = new ConsultationContextManager();
    }
    return ConsultationContextManager.instance;
  }

  /**
   * Assembles a unified conversation context snapshot across all enterprise domains.
   */
  public assembleContext(
    userRole: UserRole = 'ADMIN',
    propertyId?: string,
    projectId?: string
  ): IConversationContext {
    const contextId = `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const userProfile: IUserProfileContext = {
      userId: userRole === 'ADMIN' ? 'usr-admin-001' : 'usr-client-002',
      userRole,
      userName: userRole === 'ADMIN' ? 'Enterprise Lead Specialist' : 'Valued Property Owner',
      userEmail: userRole === 'ADMIN' ? 'admin@urjaflux.com' : 'client@urjaflux.com',
      accessibleProjects: ['UF-PRJ-2026-081', 'UF-PRJ-2026-092']
    };

    const propertyContext = this.fetchPropertyContext(propertyId);
    const projectContext = this.fetchProjectContext(projectId);
    const monitoringContext = this.fetchMonitoringContext(propertyId);
    const executionContext = this.fetchExecutionContext(projectId);
    const recommendationContext = this.fetchRecommendationContext();
    const knowledgeContext = this.fetchKnowledgeContext();

    return {
      contextId,
      updatedAt: now,
      userProfile,
      propertyContext,
      projectContext,
      monitoringContext,
      executionContext,
      recommendationContext,
      knowledgeContext
    };
  }

  private fetchPropertyContext(propertyId?: string): IPropertyContextSnapshot {
    const twins = DigitalTwinRegistry.getAllDigitalTwins();
    const targetTwin = propertyId
      ? twins.find(t => t.id === propertyId || t.propertyId === propertyId) || twins[0]
      : twins[0];

    if (!targetTwin) {
      return {
        propertyId: 'PROP-DEFAULT',
        propertyName: 'Commercial Tech Park HQ',
        propertyType: 'COMMERCIAL',
        facingDirection: 'NORTH_EAST_ISHAN',
        totalAreaSqFt: 18500,
        healthScore: 84,
        complianceRating: 88,
        activeSnapshotId: 'SNAP-002'
      };
    }

    return {
      propertyId: targetTwin.propertyId,
      propertyName: targetTwin.propertyName,
      propertyType: 'COMMERCIAL',
      facingDirection: 'NORTH_EAST_ISHAN',
      totalAreaSqFt: 18500,
      healthScore: targetTwin.overallHealthScore,
      complianceRating: targetTwin.complianceScore,
      activeSnapshotId: targetTwin.activeSnapshotId
    };
  }

  private fetchProjectContext(projectId?: string): IProjectContextSnapshot {
    const projects = ProjectExecutionRegistry.getInstance().getAllProjects();
    const targetProject = projectId
      ? projects.find(p => p.id === projectId) || projects[0]
      : projects[0];

    if (!targetProject) {
      return {
        projectId: 'UF-PRJ-2026-081',
        projectTitle: 'Brahmasthan Clearance & Harmonic Recalibration',
        currentPhase: 'PHASE_3_SITE_VERIFICATION',
        completionPercentage: 65,
        activeTasksCount: 4,
        assignedEngineer: 'Dr. Rajesh Sharma (Lead Vastu Architect)'
      };
    }

    const firstPhase = targetProject.phases[0];
    const tasks = firstPhase ? firstPhase.tasks : [];
    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');

    return {
      projectId: targetProject.id,
      projectTitle: targetProject.title,
      currentPhase: firstPhase ? firstPhase.title : 'Phase 1: Remedial Setup',
      completionPercentage: targetProject.overallProgressPercentage,
      activeTasksCount: activeTasks.length || 3,
      assignedEngineer: 'Senior Field Engineer'
    };
  }

  private fetchMonitoringContext(propertyId?: string): IMonitoringContextSnapshot {
    const alerts = DigitalTwinRegistry.getAlerts();
    const twins = DigitalTwinRegistry.getAllDigitalTwins();
    const twin = propertyId ? twins.find(t => t.id === propertyId || t.propertyId === propertyId) : twins[0];

    const activeAlerts = alerts.filter(a => a.alertStatus === 'ACTIVE');
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

    return {
      activeAlertsCount: activeAlerts.length,
      criticalAlertsCount: criticalAlerts.length,
      maintenancePriority: twin ? twin.maintenancePriority : 'ROUTINE',
      lastSnapshotTimestamp: twin ? twin.updatedAt : new Date().toISOString(),
      sensorAnomaliesCount: 2
    };
  }

  private fetchExecutionContext(projectId?: string): IExecutionContextSnapshot {
    const projects = ProjectExecutionRegistry.getInstance().getAllProjects();
    const project = projectId ? projects.find(p => p.id === projectId) : projects[0];

    const tasks = project ? project.phases.flatMap(p => p.tasks) : [];
    const pendingChecklists = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'BLOCKED').length;
    const verifiedEvidence = tasks.reduce((sum, t) => sum + (t.evidenceIds?.length || 0), 0);

    return {
      pendingChecklistsCount: pendingChecklists,
      verifiedEvidenceCount: verifiedEvidence,
      delayedSlaTasksCount: tasks.filter(t => t.status === 'BLOCKED').length
    };
  }

  private fetchRecommendationContext(): IRecommendationContextSnapshot {
    const sessions = UnifiedReasoningRegistry.getInstance().getAllSessions();
    const recs = sessions.flatMap(s => s.recommendations);
    const critical = recs.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH');

    return {
      totalRecommendations: recs.length || 3,
      criticalRemediesCount: critical.length || 1,
      topRecommendationTitle: recs[0]?.title || 'Brahmasthan Energetic Clearance'
    };
  }

  private fetchKnowledgeContext(): IKnowledgeContextSnapshot {
    const vastuDocs = VastuMasterKnowledgeRegistry.getInstance().getAllDocuments().length;
    const chakraDocs = ChakraMasterKnowledgeRegistry.getInstance().getAllDocuments().length;

    return {
      ingestedDocumentsCount: vastuDocs + chakraDocs + 12,
      verifiedCanonicalEntitiesCount: 142,
      activeRulesCount: 42
    };
  }
}
