import { WorkflowStatus, ExecutionUserRole, IExecutionProject, IExecutionTask } from './ExecutionTypes';
import { ProjectExecutionRegistry } from './ProjectExecutionRegistry';

export interface IWorkflowTransitionRule {
  fromStatus: WorkflowStatus;
  allowedToStatuses: WorkflowStatus[];
  requiredRole: ExecutionUserRole[];
}

export class WorkflowEngineService {
  private registry: ProjectExecutionRegistry;

  private static transitionRules: IWorkflowTransitionRule[] = [
    {
      fromStatus: 'DRAFT',
      allowedToStatuses: ['PLANNED', 'APPROVED', 'REJECTED', 'ARCHIVED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      fromStatus: 'PLANNED',
      allowedToStatuses: ['APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      fromStatus: 'APPROVED',
      allowedToStatuses: ['ASSIGNED', 'IN_PROGRESS', 'ARCHIVED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER'],
    },
    {
      fromStatus: 'ASSIGNED',
      allowedToStatuses: ['IN_PROGRESS', 'WAITING', 'BLOCKED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER'],
    },
    {
      fromStatus: 'IN_PROGRESS',
      allowedToStatuses: ['WAITING', 'BLOCKED', 'INSPECTION_PENDING', 'VERIFICATION_PENDING', 'COMPLETED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER'],
    },
    {
      fromStatus: 'WAITING',
      allowedToStatuses: ['IN_PROGRESS', 'BLOCKED', 'ARCHIVED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER'],
    },
    {
      fromStatus: 'BLOCKED',
      allowedToStatuses: ['IN_PROGRESS', 'ASSIGNED', 'REJECTED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      fromStatus: 'INSPECTION_PENDING',
      allowedToStatuses: ['VERIFICATION_PENDING', 'COMPLETED', 'BLOCKED', 'REJECTED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER'],
    },
    {
      fromStatus: 'VERIFICATION_PENDING',
      allowedToStatuses: ['COMPLETED', 'BLOCKED', 'REJECTED'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      fromStatus: 'COMPLETED',
      allowedToStatuses: ['ARCHIVED', 'INSPECTION_PENDING'],
      requiredRole: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      fromStatus: 'REJECTED',
      allowedToStatuses: ['DRAFT', 'PLANNED', 'ARCHIVED'],
      requiredRole: ['ADMIN'],
    },
    {
      fromStatus: 'ARCHIVED',
      allowedToStatuses: ['DRAFT'],
      requiredRole: ['ADMIN'],
    },
  ];

  constructor() {
    this.registry = ProjectExecutionRegistry.getInstance();
  }

  /**
   * Verifies whether a status transition is permitted given the target status and user role.
   */
  public canTransition(
    currentStatus: WorkflowStatus,
    targetStatus: WorkflowStatus,
    userRole: ExecutionUserRole
  ): { allowed: boolean; reason?: string } {
    if (userRole === 'END_USER') {
      return { allowed: false, reason: 'END_USER role cannot modify workflow state.' };
    }

    if (currentStatus === targetStatus) return { allowed: true };

    const rule = WorkflowEngineService.transitionRules.find((r) => r.fromStatus === currentStatus);
    if (!rule) {
      return { allowed: false, reason: `No transition rules defined for current status ${currentStatus}.` };
    }

    if (!rule.allowedToStatuses.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Transition from ${currentStatus} to ${targetStatus} is invalid. Allowed: ${rule.allowedToStatuses.join(', ')}`,
      };
    }

    if (!rule.requiredRole.includes(userRole)) {
      return {
        allowed: false,
        reason: `Role ${userRole} lacks permission for this transition. Required: ${rule.requiredRole.join(', ')}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Transitions a project task status safely.
   */
  public updateTaskStatus(
    projectId: string,
    taskId: string,
    newStatus: WorkflowStatus,
    updatedBy: string,
    role: ExecutionUserRole,
    notes?: string
  ): { success: boolean; message: string; project?: IExecutionProject } {
    const project = this.registry.getProjectById(projectId);
    if (!project) {
      return { success: false, message: `Project ${projectId} not found.` };
    }

    let targetTask: IExecutionTask | undefined;
    for (const phase of project.phases) {
      for (const t of phase.tasks) {
        if (t.id === taskId) {
          targetTask = t;
          break;
        }
      }
    }

    if (!targetTask) {
      return { success: false, message: `Task ${taskId} not found in project.` };
    }

    const check = this.canTransition(targetTask.status, newStatus, role);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Transition prohibited.' };
    }

    const previousStatus = targetTask.status;
    targetTask.status = newStatus;
    targetTask.updatedBy = updatedBy;
    targetTask.updatedAt = new Date().toISOString();

    if (newStatus === 'COMPLETED') {
      targetTask.completionPercentage = 100;
    }

    // Re-calculate overall progress
    const metrics = this.registry.computeProjectMetrics(projectId);
    if (metrics) {
      project.overallProgressPercentage = metrics.overallProgressPercentage;
    }

    this.registry.saveProject(project, updatedBy, role);

    this.registry.logActivity({
      logId: `log-wf-${Date.now()}`,
      projectId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'TASK_STATUS_CHANGED',
      performedBy: updatedBy,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      details: `Changed task status from ${previousStatus} to ${newStatus}.${notes ? ` Notes: ${notes}` : ''}`,
      previousState: previousStatus,
      newState: newStatus,
    });

    return { success: true, message: `Task status updated to ${newStatus}.`, project };
  }
}
