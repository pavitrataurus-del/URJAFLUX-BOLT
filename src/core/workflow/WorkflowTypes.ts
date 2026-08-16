export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type InstanceStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SUSPENDED';
export type StepType = 'TRIGGER' | 'TASK' | 'APPROVAL' | 'CONDITION' | 'NOTIFICATION' | 'DELAY' | 'SUBSCRIBE' | 'ACTION' | 'AUTOMATIC_STEP';
export type EventType = 'DOMAIN_EVENT' | 'USER_EVENT' | 'SYSTEM_EVENT' | 'INTEGRATION_EVENT';
export type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  status: WorkflowStatus;
  owner: string;
  steps: WorkflowStepDefinition[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  type: StepType;
  config: Record<string, any>;
  nextStepIds: string[]; // DAG structure, multiple for parallel/branching
  slaMinutes?: number;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  version: number;
  status: InstanceStatus;
  startedAt: string;
  completedAt?: string;
  currentStepIds: string[];
  variables: Record<string, any>;
  context: Record<string, any>;
  metadata: Record<string, any>;
}

export interface WorkflowStepInstance {
  id: string;
  instanceId: string;
  stepId: string;
  name: string;
  type: StepType;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
  assignedRole?: string;
  slaLimitTime?: string;
  slaBreached: boolean;
  notes?: string;
}

export interface WorkflowEvent {
  id: string;
  type: EventType;
  source: string; // e.g., 'DOMAIN-011', 'DOMAIN-012', 'SYSTEM'
  name: string; // e.g., 'CAD_IMPORT_COMPLETED', 'DEFECT_DETECTED'
  payload: Record<string, any>;
  timestamp: string;
  receivedAt: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerEvent: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: any;
}

export interface RuleAction {
  type: 'START_WORKFLOW' | 'ROUTE_EVENT' | 'SEND_NOTIFICATION' | 'ASSIGN_TASK';
  params: Record<string, any>;
}

export interface TaskEntity {
  id: string;
  title: string;
  description: string;
  instanceId?: string;
  stepInstanceId?: string;
  assignedTo?: string;
  assignedRole?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate?: string;
  checklist: ChecklistItem[];
  comments: CommentItem[];
  attachments: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ApprovalChain {
  id: string;
  instanceId: string;
  stepInstanceId: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REWORK_REQUESTED';
  requiredApprovers: {
    role: string;
    userId?: string;
    approved: boolean;
    decisionTimestamp?: string;
    notes?: string;
  }[];
  approvalType: 'SINGLE' | 'PARALLEL' | 'MAJORITY';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  id: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';
  recipient: string;
  title: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  retries: number;
}

export interface SlaMetric {
  id: string;
  instanceId: string;
  stepName: string;
  limitTime: string;
  completedAt?: string;
  durationMs?: number;
  isBreached: boolean;
  status: 'ACTIVE' | 'RESOLVED' | 'BREACHED';
}
