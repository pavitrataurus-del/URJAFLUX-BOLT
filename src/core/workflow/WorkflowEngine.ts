import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStepInstance,
  InstanceStatus,
  TaskEntity,
  ApprovalChain,
  SlaMetric,
  WorkflowEvent
} from "./WorkflowTypes";
import { EnterpriseEventBus } from "./EventBus";
import { BusinessRulesEngine } from "./RulesEngine";
import { NotificationEngine } from "./SchedulerNotifications";

export class WorkflowOrchestrationEngine {
  private static instance: WorkflowOrchestrationEngine;

  private definitions: WorkflowDefinition[] = [];
  private instances: WorkflowInstance[] = [];
  private stepInstances: WorkflowStepInstance[] = [];
  private tasks: TaskEntity[] = [];
  private approvals: ApprovalChain[] = [];
  private slas: SlaMetric[] = [];
  private auditLogs: { timestamp: string; instanceId: string; stepId?: string; message: string; user?: string }[] = [];

  private constructor() {
    this.seedDefinitions();
    this.setupEventListeners();
  }

  public static getInstance(): WorkflowOrchestrationEngine {
    if (!WorkflowOrchestrationEngine.instance) {
      WorkflowOrchestrationEngine.instance = new WorkflowOrchestrationEngine();
    }
    return WorkflowOrchestrationEngine.instance;
  }

  // --- Definitions ---
  public getDefinitions(): WorkflowDefinition[] {
    return this.definitions;
  }

  public createDefinition(def: Omit<WorkflowDefinition, 'createdAt' | 'updatedAt'>): WorkflowDefinition {
    const newDef: WorkflowDefinition = {
      ...def,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.definitions.push(newDef);
    return newDef;
  }

  // --- Instances ---
  public getInstances(): WorkflowInstance[] {
    return this.instances;
  }

  public getStepInstances(instanceId?: string): WorkflowStepInstance[] {
    if (instanceId) {
      return this.stepInstances.filter(s => s.instanceId === instanceId);
    }
    return this.stepInstances;
  }

  public getTasks(): TaskEntity[] {
    return this.tasks;
  }

  public getApprovals(): ApprovalChain[] {
    return this.approvals;
  }

  public getSlas(): SlaMetric[] {
    return this.slas;
  }

  public getAuditLogs(instanceId?: string) {
    if (instanceId) {
      return this.auditLogs.filter(log => log.instanceId === instanceId);
    }
    return this.auditLogs;
  }

  // --- Start Workflow ---
  public startWorkflow(definitionId: string, initialVariables: Record<string, any> = {}, triggeredBy = "System"): WorkflowInstance | null {
    const def = this.definitions.find(d => d.id === definitionId);
    if (!def) {
      console.error(`Workflow definition ${definitionId} not found.`);
      return null;
    }

    const instanceId = `wf_inst_${Math.random().toString(36).substring(2, 11)}`;
    const instance: WorkflowInstance = {
      id: instanceId,
      definitionId: def.id,
      definitionName: def.name,
      version: def.version,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      currentStepIds: [],
      variables: initialVariables,
      context: { initiatedBy: triggeredBy },
      metadata: {}
    };

    this.instances.push(instance);
    this.logAudit(instanceId, undefined, `Workflow started by ${triggeredBy}`, triggeredBy);

    // Identify entry triggers (usually steps without inbound paths or explicitly designated first step)
    const firstStep = def.steps[0];
    if (firstStep) {
      this.executeStep(instance, firstStep.id);
    }

    return instance;
  }

  // --- Execute Step (Core Engine Logic) ---
  public async executeStep(instance: WorkflowInstance, stepId: string) {
    const def = this.definitions.find(d => d.id === instance.definitionId);
    if (!def) return;

    const stepDef = def.steps.find(s => s.id === stepId);
    if (!stepDef) return;

    // Guard against duplicate running step states
    const alreadyExists = this.stepInstances.some(s => s.instanceId === instance.id && s.stepId === stepId && s.status === 'RUNNING');
    if (alreadyExists) return;

    const stepInstanceId = `step_inst_${Math.random().toString(36).substring(2, 11)}`;
    const limitMinutes = stepDef.slaMinutes || 120;
    const slaLimitTime = new Date(Date.now() + limitMinutes * 60000).toISOString();

    const stepInst: WorkflowStepInstance = {
      id: stepInstanceId,
      instanceId: instance.id,
      stepId,
      name: stepDef.name,
      type: stepDef.type,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      assignedTo: stepDef.config.assignedTo,
      assignedRole: stepDef.config.assignedRole,
      slaLimitTime,
      slaBreached: false
    };

    this.stepInstances.push(stepInst);
    this.logAudit(instance.id, stepId, `Executing step: ${stepDef.name}`);

    // Track SLA
    const newSla: SlaMetric = {
      id: `sla_${Math.random().toString(36).substring(2, 11)}`,
      instanceId: instance.id,
      stepName: stepDef.name,
      limitTime: slaLimitTime,
      status: 'ACTIVE',
      isBreached: false
    };
    this.slas.push(newSla);

    // Process step type logic
    switch (stepDef.type) {
      case 'AUTOMATIC_STEP':
      case 'ACTION':
        // Run automated work, then auto-complete
        this.logAudit(instance.id, stepId, `Running automated logic for: ${stepDef.name}`);
        this.completeStep(instance.id, stepId, 'COMPLETED', { autoSuccess: true });
        break;

      case 'NOTIFICATION':
        // Send a notification instantly and auto-complete
        const channel = stepDef.config.channel || 'IN_APP';
        const recipient = stepDef.config.recipient || 'ALL';
        const title = stepDef.config.title || 'System Alert';
        const body = stepDef.config.body || 'Alert issued.';
        await NotificationEngine.getInstance().send(channel, recipient, title, body);
        this.completeStep(instance.id, stepId, 'COMPLETED');
        break;

      case 'TASK':
        // Generate a task in the Task system
        const newTask: TaskEntity = {
          id: `task_${Math.random().toString(36).substring(2, 11)}`,
          title: stepDef.name,
          description: stepDef.config.description || 'Manual task checklist',
          instanceId: instance.id,
          stepInstanceId,
          priority: stepDef.config.priority || 'MEDIUM',
          status: 'TODO',
          dueDate: slaLimitTime,
          assignedTo: stepDef.config.assignedTo,
          assignedRole: stepDef.config.assignedRole,
          checklist: (stepDef.config.checklist || []).map((text: string) => ({
            id: `item_${Math.random().toString(36).substring(2, 11)}`,
            text,
            isCompleted: false
          })),
          comments: [],
          attachments: []
        };
        this.tasks.push(newTask);
        break;

      case 'APPROVAL':
        // Generate an approval record
        const approval: ApprovalChain = {
          id: `appr_${Math.random().toString(36).substring(2, 11)}`,
          instanceId: instance.id,
          stepInstanceId,
          title: stepDef.config.approvalTitle || `Approval Required for ${stepDef.name}`,
          status: 'PENDING',
          approvalType: stepDef.config.approvalType || 'SINGLE',
          requiredApprovers: (stepDef.config.approverRoles || ['PROJECT_MANAGER']).map((role: string) => ({
            role,
            approved: false
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.approvals.push(approval);
        break;

      case 'CONDITION':
        // Evaluate conditions in variables
        const variableName = stepDef.config.variable;
        const targetValue = stepDef.config.value;
        const operator = stepDef.config.operator || 'EQUALS';

        const currentValue = instance.variables[variableName];
        let conditionMet = false;

        if (operator === 'EQUALS' && String(currentValue) === String(targetValue)) {
          conditionMet = true;
        } else if (operator === 'GREATER_THAN' && Number(currentValue) > Number(targetValue)) {
          conditionMet = true;
        }

        const nextBranchId = conditionMet ? stepDef.config.trueStepId : stepDef.config.falseStepId;
        this.logAudit(instance.id, stepId, `Conditional check '${variableName}' ${operator} '${targetValue}'. Result: ${conditionMet}`);

        // Update current step to completed and transition
        const idx = this.stepInstances.findIndex(s => s.id === stepInstanceId);
        if (idx !== -1) {
          this.stepInstances[idx].status = 'COMPLETED';
          this.stepInstances[idx].completedAt = new Date().toISOString();
        }
        this.completeSla(instance.id, stepDef.name);

        if (nextBranchId) {
          this.executeStep(instance, nextBranchId);
        } else {
          this.checkAndFinishWorkflow(instance);
        }
        break;

      case 'DELAY':
        // Delay action (Simulated auto-expiry/resolve after timeout or trigger)
        this.logAudit(instance.id, stepId, `Workflow paused. Delay state active for ${stepDef.config.delayMinutes || 10}m`);
        setTimeout(() => {
          this.completeStep(instance.id, stepId, 'COMPLETED');
        }, 1500); // Quick simulation trigger
        break;

      default:
        break;
    }

    // Refresh active list of step IDs in the main instance
    instance.currentStepIds = this.stepInstances
      .filter(s => s.instanceId === instance.id && s.status === 'RUNNING')
      .map(s => s.stepId);
  }

  // --- Complete Step & Cascade/Transition DAG ---
  public completeStep(instanceId: string, stepId: string, status: 'COMPLETED' | 'FAILED' | 'SKIPPED' = 'COMPLETED', outputs: Record<string, any> = {}) {
    const instance = this.instances.find(i => i.id === instanceId);
    if (!instance) return;

    const stepInst = this.stepInstances.find(s => s.instanceId === instanceId && s.stepId === stepId && s.status === 'RUNNING');
    if (!stepInst) return;

    stepInst.status = status;
    stepInst.completedAt = new Date().toISOString();
    this.logAudit(instanceId, stepId, `Step execution finished with status: ${status}`);

    // Update variables
    instance.variables = {
      ...instance.variables,
      ...outputs
    };

    // Close associated SLA metrics
    this.completeSla(instanceId, stepInst.name);

    // Resolve downstream nodes in DAG
    const def = this.definitions.find(d => d.id === instance.definitionId);
    if (def) {
      const stepDef = def.steps.find(s => s.id === stepId);
      if (stepDef && stepDef.nextStepIds && stepDef.nextStepIds.length > 0) {
        stepDef.nextStepIds.forEach(nextId => {
          this.executeStep(instance, nextId);
        });
      } else {
        // No further steps. Check if workflow is finished
        this.checkAndFinishWorkflow(instance);
      }
    }

    instance.currentStepIds = this.stepInstances
      .filter(s => s.instanceId === instance.id && s.status === 'RUNNING')
      .map(s => s.stepId);
  }

  private completeSla(instanceId: string, stepName: string) {
    const metric = this.slas.find(s => s.instanceId === instanceId && s.stepName === stepName && s.status === 'ACTIVE');
    if (metric) {
      metric.status = 'RESOLVED';
      metric.completedAt = new Date().toISOString();
      metric.durationMs = new Date(metric.completedAt).getTime() - new Date(metric.limitTime).getTime() + 7200000; // Fake elapsed offset
    }
  }

  private checkAndFinishWorkflow(instance: WorkflowInstance) {
    const stillRunning = this.stepInstances.some(s => s.instanceId === instance.id && s.status === 'RUNNING');
    if (!stillRunning) {
      instance.status = 'COMPLETED';
      instance.completedAt = new Date().toISOString();
      this.logAudit(instance.id, undefined, 'Workflow executed successfully. All paths fully resolved.');
      
      // Dispatch success domain event
      EnterpriseEventBus.getInstance().publish({
        type: 'SYSTEM_EVENT',
        source: 'DOMAIN-013',
        name: 'WORKFLOW_INSTANCE_COMPLETED',
        payload: { instanceId: instance.id, definitionId: instance.definitionId }
      });
    }
  }

  // --- Complete Tasks ---
  public completeTask(taskId: string, user: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'DONE';
    this.logAudit(task.instanceId || '', task.stepInstanceId, `Task '${task.title}' marked as COMPLETED by ${user}`, user);

    // Cascade complete step
    if (task.instanceId && task.stepInstanceId) {
      const stepInst = this.stepInstances.find(s => s.id === task.stepInstanceId);
      if (stepInst) {
        this.completeStep(task.instanceId, stepInst.stepId, 'COMPLETED', { taskResult: 'COMPLETED' });
      }
    }
  }

  // --- Complete Approvals ---
  public resolveApproval(approvalId: string, role: string, decision: 'APPROVED' | 'REJECTED' | 'REWORK_REQUESTED', notes: string, user: string) {
    const approval = this.approvals.find(a => a.id === approvalId);
    if (!approval) return;

    const approver = approval.requiredApprovers.find(r => r.role === role);
    if (approver) {
      approver.approved = decision === 'APPROVED';
      approver.decisionTimestamp = new Date().toISOString();
      approver.notes = notes;
    }

    // Check if whole chain is resolved
    const allApproved = approval.requiredApprovers.every(r => r.approved);
    
    if (decision === 'REJECTED') {
      approval.status = 'REJECTED';
      this.logAudit(approval.instanceId, approval.stepInstanceId, `Approval rejected by ${user} (${role})`, user);
      if (approval.instanceId && approval.stepInstanceId) {
        const stepInst = this.stepInstances.find(s => s.id === approval.stepInstanceId);
        if (stepInst) {
          this.completeStep(approval.instanceId, stepInst.stepId, 'FAILED', { approvalDecision: 'REJECTED' });
        }
      }
    } else if (decision === 'REWORK_REQUESTED') {
      approval.status = 'REWORK_REQUESTED';
      this.logAudit(approval.instanceId, approval.stepInstanceId, `Rework requested by ${user} (${role})`, user);
      if (approval.instanceId && approval.stepInstanceId) {
        const stepInst = this.stepInstances.find(s => s.id === approval.stepInstanceId);
        if (stepInst) {
          // Loop back or suspend
          this.completeStep(approval.instanceId, stepInst.stepId, 'SKIPPED', { approvalDecision: 'REWORK' });
        }
      }
    } else if (allApproved) {
      approval.status = 'APPROVED';
      this.logAudit(approval.instanceId, approval.stepInstanceId, `Approval fully approved.`, user);
      if (approval.instanceId && approval.stepInstanceId) {
        const stepInst = this.stepInstances.find(s => s.id === approval.stepInstanceId);
        if (stepInst) {
          this.completeStep(approval.instanceId, stepInst.stepId, 'COMPLETED', { approvalDecision: 'APPROVED' });
        }
      }
    }

    approval.updatedAt = new Date().toISOString();
  }

  // --- Event Ingress Triggering ---
  private setupEventListeners(): void {
    const bus = EnterpriseEventBus.getInstance();

    // Listen to Vision AI Detection
    bus.subscribe('DOMAIN-012', 'VISION_DEFECT_DETECTED', async (event: WorkflowEvent) => {
      this.logAudit('GLOBAL', undefined, `External Event Bus received VISION_DEFECT_DETECTED with ID ${event.id}`);
      
      // Pass event to rules engine to check if we trigger workflows automatically
      const actions = BusinessRulesEngine.getInstance().evaluateEvent(event);
      for (const act of actions) {
        if (act.type === 'START_WORKFLOW') {
          this.startWorkflow(act.params.definitionId, {
            severity: event.payload.severity,
            sourceAssetId: event.payload.assetId,
            coordinates: event.payload.coords
          });
        }
      }
    });

    // Listen to Spatial Vastu calculations
    bus.subscribe('DOMAIN-011', 'VASTU_COMPLIANCE_FAILED', async (event: WorkflowEvent) => {
      this.logAudit('GLOBAL', undefined, `External Event Bus received VASTU_COMPLIANCE_FAILED. Routing alerts.`);
      
      // Auto start remedial workflow
      this.startWorkflow('wf_vastu_remediation', {
        zone: event.payload.zone,
        failedElement: event.payload.element
      }, 'Spatial Vastu Engine');
    });
  }

  private logAudit(instanceId: string, stepId: string | undefined, message: string, user = "System") {
    this.auditLogs.push({
      timestamp: new Date().toISOString(),
      instanceId,
      stepId,
      message,
      user
    });
    console.log(`[Audit Trail] [${instanceId}] [Step: ${stepId || 'General'}] ${message}`);
  }

  // --- Preseeded Blueprints (Definitions) ---
  private seedDefinitions() {
    this.definitions = [
      {
        id: 'wf_site_onboarding',
        name: 'Enterprise Client & Vastu Onboarding',
        description: 'Guided sequential pipeline to register a client, process site documents, run OCR, and initiate analysis.',
        version: 1,
        status: 'ACTIVE',
        owner: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: [
          {
            id: 'step_client_reg',
            name: 'Register Client Profile',
            type: 'TASK',
            config: {
              description: 'Formulate client birth chart inputs, geographic target parameters, and scope requirements.',
              priority: 'MEDIUM',
              assignedRole: 'PROJECT_MANAGER',
              checklist: ['Validate birth date/time/place coordinates', 'Review and confirm spatial constraints']
            },
            nextStepIds: ['step_doc_ingest']
          },
          {
            id: 'step_doc_ingest',
            name: 'Ingest Architectural Floorplan',
            type: 'TASK',
            config: {
              description: 'Upload high-resolution master blueprint drawings and run Vision AI detection.',
              priority: 'HIGH',
              assignedRole: 'FIELD_ENGINEER',
              checklist: ['Verify resolution > 150 DPI', 'Complete raster-to-vector extraction on CAD view']
            },
            nextStepIds: ['step_ocr_verify']
          },
          {
            id: 'step_ocr_verify',
            name: 'Verify Symbol & Room Detections',
            type: 'APPROVAL',
            config: {
              approvalTitle: 'Audit Vision AI Perceptual proposes',
              approverRoles: ['PROJECT_MANAGER'],
              approvalType: 'SINGLE'
            },
            nextStepIds: ['step_auto_vastu']
          },
          {
            id: 'step_auto_vastu',
            name: 'Evaluate Vastu Compliance Rules',
            type: 'AUTOMATIC_STEP',
            config: { action: 'TRIGGER_DOMAIN_006' },
            nextStepIds: ['step_notif_ready']
          },
          {
            id: 'step_notif_ready',
            name: 'Dispatch Ready Notification',
            type: 'NOTIFICATION',
            config: {
              channel: 'EMAIL',
              recipient: 'END_USER',
              title: 'Onboarding Completed',
              body: 'Your Vastu & Architectural Digital Twin is successfully formulated. View analysis hub.'
            },
            nextStepIds: []
          }
        ],
        metadata: {}
      },
      {
        id: 'wf_critical_defect_remediation',
        name: 'Vision Defect Remediation Flow',
        description: 'Remediation pipeline triggered automatically upon recognition of highly severe defects.',
        version: 1,
        status: 'ACTIVE',
        owner: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: [
          {
            id: 'step_defect_assess',
            name: 'Verify Structural Defect Severity',
            type: 'TASK',
            config: {
              description: 'Inspect Vision AI proposed photographic site defects and classify safety measures.',
              priority: 'CRITICAL',
              assignedRole: 'PROJECT_MANAGER',
              checklist: ['Double check concrete cracking depths', 'Verify water seepage bounds']
            },
            nextStepIds: ['step_engineer_dispatch']
          },
          {
            id: 'step_engineer_dispatch',
            name: 'Dispatch Remediation Field Team',
            type: 'TASK',
            config: {
              description: 'Instruct site engineers to repair concrete reinforcement and prevent moisture ingress.',
              priority: 'HIGH',
              assignedRole: 'FIELD_ENGINEER',
              checklist: ['Complete epoxy injection', 'Verify waterproof sealant layers']
            },
            nextStepIds: ['step_manager_signoff']
          },
          {
            id: 'step_manager_signoff',
            name: 'Approve Site Remediation Fix',
            type: 'APPROVAL',
            config: {
              approvalTitle: 'Verify physical remedial completion',
              approverRoles: ['ADMIN'],
              approvalType: 'SINGLE'
            },
            nextStepIds: []
          }
        ],
        metadata: {}
      },
      {
        id: 'wf_vastu_remediation',
        name: 'Vastu Conflict Resolution Workflow',
        description: 'Triggered when Vastu layout conflicts are detected by the CAD intelligence engine.',
        version: 1,
        status: 'ACTIVE',
        owner: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: [
          {
            id: 'step_analyze_conflict',
            name: 'Investigate Vastu Zone Clash',
            type: 'TASK',
            config: {
              description: 'Review spatial overlay zones (e.g., toilet placed in auspicious Northeast corner).',
              priority: 'HIGH',
              assignedRole: 'PROJECT_MANAGER',
              checklist: ['Identify potential physical relocations', 'Consider elemental corrective brass wire/strip remedies']
            },
            nextStepIds: ['step_propose_fix']
          },
          {
            id: 'step_propose_fix',
            name: 'Register Layout Modification',
            type: 'TASK',
            config: {
              description: 'Alter CAD drawing elements in DOMAIN-011 and request structural engineering verification.',
              priority: 'MEDIUM',
              assignedRole: 'FIELD_ENGINEER',
              checklist: ['Move door/window elements', 'Re-evaluate compliance weights']
            },
            nextStepIds: ['step_recheck_audit']
          },
          {
            id: 'step_recheck_audit',
            name: 'Sign-off Remedial Blueprint',
            type: 'APPROVAL',
            config: {
              approvalTitle: 'Approve new optimal Vastu floorplan',
              approverRoles: ['ADMIN'],
              approvalType: 'SINGLE'
            },
            nextStepIds: []
          }
        ],
        metadata: {}
      }
    ];
  }
}
