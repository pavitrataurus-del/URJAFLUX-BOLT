import { IExecutionTask, TaskPriority, ExecutionUserRole, IExecutionProject } from './ExecutionTypes';
import { ProjectExecutionRegistry } from './ProjectExecutionRegistry';

export class TaskManagementService {
  private registry: ProjectExecutionRegistry;

  constructor() {
    this.registry = ProjectExecutionRegistry.getInstance();
  }

  public assignTask(
    projectId: string,
    taskId: string,
    assignedTo: string,
    assignedRole: ExecutionUserRole,
    updatedBy: string,
    role: ExecutionUserRole
  ): { success: boolean; message: string; project?: IExecutionProject } {
    const project = this.registry.getProjectById(projectId);
    if (!project) return { success: false, message: 'Project not found.' };

    for (const phase of project.phases) {
      for (const task of phase.tasks) {
        if (task.id === taskId) {
          task.assignedTo = assignedTo;
          task.assignedRole = assignedRole;
          if (task.status === 'PLANNED') {
            task.status = 'ASSIGNED';
          }
          task.updatedBy = updatedBy;
          task.updatedAt = new Date().toISOString();

          this.registry.saveProject(project, updatedBy, role);
          return { success: true, message: `Task assigned to ${assignedTo}.`, project };
        }
      }
    }

    return { success: false, message: 'Task not found.' };
  }

  public updateTaskProgress(
    projectId: string,
    taskId: string,
    percentage: number,
    actualHours: number,
    updatedBy: string,
    role: ExecutionUserRole
  ): { success: boolean; message: string; project?: IExecutionProject } {
    const project = this.registry.getProjectById(projectId);
    if (!project) return { success: false, message: 'Project not found.' };

    for (const phase of project.phases) {
      for (const task of phase.tasks) {
        if (task.id === taskId) {
          task.completionPercentage = Math.min(100, Math.max(0, percentage));
          task.actualDurationHours = actualHours;
          if (percentage === 100) {
            task.status = 'INSPECTION_PENDING';
          } else if (percentage > 0 && task.status === 'ASSIGNED') {
            task.status = 'IN_PROGRESS';
          }
          task.updatedBy = updatedBy;
          task.updatedAt = new Date().toISOString();

          this.registry.saveProject(project, updatedBy, role);
          return { success: true, message: `Task progress updated to ${percentage}%.`, project };
        }
      }
    }

    return { success: false, message: 'Task not found.' };
  }
}
