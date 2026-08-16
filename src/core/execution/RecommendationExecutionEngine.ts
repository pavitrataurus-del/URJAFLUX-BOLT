import { IRecommendation, KnowledgeDomain } from '../reasoning/ReasoningTypes';
import {
  IExecutionProject,
  IExecutionPhase,
  IExecutionTask,
  IExecutionMilestone,
  IChecklistItem,
  ExecutionUserRole,
} from './ExecutionTypes';
import { ProjectExecutionRegistry } from './ProjectExecutionRegistry';

export class RecommendationExecutionEngine {
  private registry: ProjectExecutionRegistry;

  constructor() {
    this.registry = ProjectExecutionRegistry.getInstance();
  }

  /**
   * Instantiates an executable project from one or multiple approved DOMAIN-006 recommendations.
   */
  public createProjectFromRecommendations(params: {
    title: string;
    clientName: string;
    siteAddress: string;
    recommendations: IRecommendation[];
    sessionId?: string;
    creatorUser?: string;
    creatorRole?: ExecutionUserRole;
  }): IExecutionProject {
    const {
      title,
      clientName,
      siteAddress,
      recommendations,
      sessionId,
      creatorUser = 'Consultant Architect',
      creatorRole = 'PROJECT_MANAGER',
    } = params;

    const projectId = `proj-exec-${Date.now()}`;
    const projectCode = `UF-PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    // Deduplicate primary domains across all consumed recommendations
    const domainsSet = new Set<KnowledgeDomain>();
    recommendations.forEach((rec) => {
      rec.supportingDomains.forEach((d) => domainsSet.add(d));
    });

    // Group recommendations by domain into Phases
    const domainGroupMap = new Map<KnowledgeDomain, IRecommendation[]>();
    recommendations.forEach((rec) => {
      const primaryDomain = rec.supportingDomains[0] || 'Vastu';
      if (!domainGroupMap.has(primaryDomain)) {
        domainGroupMap.set(primaryDomain, []);
      }
      domainGroupMap.get(primaryDomain)!.push(rec);
    });

    const phases: IExecutionPhase[] = [];
    let phaseNumber = 1;

    domainGroupMap.forEach((recs, domain) => {
      const phaseId = `phase-${projectId}-${phaseNumber}`;
      const phaseTitle = `Phase ${phaseNumber}: ${domain} Remedial Implementation`;
      const phaseDesc = `Execution of ${recs.length} approved ${domain} shastric recommendations.`;

      const tasks: IExecutionTask[] = [];
      const milestones: IExecutionMilestone[] = [];

      recs.forEach((rec, idx) => {
        const taskId = `task-${projectId}-${phaseNumber}-${idx + 1}`;
        
        // Auto-generate checklists from preconditions & supporting evidence
        const checklists: IChecklistItem[] = [
          {
            id: `chk-${taskId}-1`,
            label: `Verify Shastric Preconditions: ${rec.preconditions[0] || 'Site orientation & zero-point baseline'}`,
            description: `Check condition prior to executing ${rec.title}.`,
            isCompleted: false,
            requirements: {
              requirePhoto: true,
              requireVideo: false,
              requireDocument: false,
              requireSignature: true,
              requireGPS: true,
              requireMeasurement: true,
              requireNotes: true,
            },
            capturedEvidenceIds: [],
          },
          {
            id: `chk-${taskId}-2`,
            label: `Implement Non-Invasive Remedy: ${rec.title}`,
            description: rec.description,
            isCompleted: false,
            requirements: {
              requirePhoto: true,
              requireVideo: true,
              requireDocument: false,
              requireSignature: false,
              requireGPS: true,
              requireMeasurement: false,
              requireNotes: true,
            },
            capturedEvidenceIds: [],
          },
          {
            id: `chk-${taskId}-3`,
            label: `Final Site Verification & Shastric Compliance Sign-off`,
            description: `Expected Outcome: ${rec.expectedOutcome}`,
            isCompleted: false,
            requirements: {
              requirePhoto: false,
              requireVideo: false,
              requireDocument: true,
              requireSignature: true,
              requireGPS: false,
              requireMeasurement: false,
              requireNotes: true,
            },
            capturedEvidenceIds: [],
          },
        ];

        const task: IExecutionTask = {
          id: taskId,
          version: '1.0.0',
          status: 'PLANNED',
          owner: creatorUser,
          createdBy: 'RecommendationExecutionEngine',
          updatedBy: creatorUser,
          createdAt: now,
          updatedAt: now,
          projectId,
          phaseId,
          originatingRecommendationId: rec.id,
          title: rec.title,
          description: `${rec.description}\n\nExpected Outcome: ${rec.expectedOutcome}`,
          category: rec.category,
          priority: rec.priority === 'CRITICAL' ? 'CRITICAL' : rec.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          assignedTo: 'Field Engineer Pending',
          assignedRole: 'FIELD_ENGINEER',
          dueDate: new Date(Date.now() + (idx + 1) * 7 * 86400000).toISOString(),
          estimatedDurationHours: rec.priority === 'CRITICAL' ? 8 : 4,
          actualDurationHours: 0,
          dependencies: idx > 0 ? [`task-${projectId}-${phaseNumber}-${idx}`] : [],
          checklists,
          evidenceIds: [],
          inspectionIds: [],
          approvalIds: [],
          labels: [domain, rec.category, `Conf:${rec.confidenceGrade}`],
          completionPercentage: 0,
        };

        tasks.push(task);
      });

      const milestone: IExecutionMilestone = {
        id: `ms-${projectId}-${phaseNumber}`,
        version: '1.0.0',
        status: 'PLANNED',
        owner: creatorUser,
        createdBy: 'RecommendationExecutionEngine',
        updatedBy: creatorUser,
        createdAt: now,
        updatedAt: now,
        projectId,
        phaseId,
        title: `M${phaseNumber}: ${domain} Phase Verification Sign-off`,
        description: `Complete site inspection and evidence collection for ${domain} remedies.`,
        targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        requiredApprovalTiers: ['FIELD_ENGINEER', 'SENIOR_CONSULTANT', 'PROJECT_MANAGER'],
        isMilestoneApproved: false,
        tasksCount: tasks.length,
        tasksCompletedCount: 0,
      };
      milestones.push(milestone);

      const phase: IExecutionPhase = {
        id: phaseId,
        version: '1.0.0',
        status: 'PLANNED',
        owner: creatorUser,
        createdBy: 'RecommendationExecutionEngine',
        updatedBy: creatorUser,
        createdAt: now,
        updatedAt: now,
        projectId,
        phaseNumber,
        title: phaseTitle,
        description: phaseDesc,
        startDate: now,
        targetEndDate: new Date(Date.now() + 21 * 86400000).toISOString(),
        tasks,
        milestones,
        phaseCompletionPercentage: 0,
      };

      phases.push(phase);
      phaseNumber++;
    });

    const project: IExecutionProject = {
      id: projectId,
      version: '1.0.0',
      status: 'PLANNED',
      owner: creatorUser,
      createdBy: creatorUser,
      updatedBy: creatorUser,
      createdAt: now,
      updatedAt: now,
      projectCode,
      title,
      clientName,
      siteAddress,
      originatingSessionId: sessionId,
      originatingRecommendationIds: recommendations.map((r) => r.id),
      primaryDomains: Array.from(domainsSet),
      startDate: now,
      targetCompletionDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      phases,
      issues: [],
      risks: [],
      overallProgressPercentage: 0,
      evidenceCount: 0,
      inspectionCount: 0,
      approvalCount: 0,
      budgetEstimated: recommendations.length * 25000,
    };

    this.registry.saveProject(project, creatorUser, creatorRole);

    this.registry.logActivity({
      logId: `log-exec-engine-${Date.now()}`,
      projectId,
      entityType: 'PROJECT',
      entityId: projectId,
      action: 'CONVERTED_FROM_RECOMMENDATIONS',
      performedBy: creatorUser,
      performedByRole: creatorRole,
      timestamp: now,
      details: `Generated Project ${projectCode} with ${phases.length} phases and ${recommendations.length} executable task items from DOMAIN-006 approved recommendations.`,
    });

    return project;
  }
}
