import { BusinessRule, RuleCondition, RuleAction, WorkflowEvent } from "./WorkflowTypes";

export class BusinessRulesEngine {
  private static instance: BusinessRulesEngine;
  private rules: BusinessRule[] = [];

  private constructor() {
    this.seedDefaultRules();
  }

  public static getInstance(): BusinessRulesEngine {
    if (!BusinessRulesEngine.instance) {
      BusinessRulesEngine.instance = new BusinessRulesEngine();
    }
    return BusinessRulesEngine.instance;
  }

  public registerRule(rule: BusinessRule): void {
    this.rules.push(rule);
  }

  public getRules(): BusinessRule[] {
    return this.rules;
  }

  public setRules(rules: BusinessRule[]): void {
    this.rules = rules;
  }

  public evaluateEvent(event: WorkflowEvent): RuleAction[] {
    const triggeredActions: RuleAction[] = [];

    // Filter rules by event name
    const activeRules = this.rules.filter(rule => rule.isActive && rule.triggerEvent === event.name);

    for (const rule of activeRules) {
      const match = this.evaluateConditions(rule.conditions, event.payload);
      if (match) {
        triggeredActions.push(...rule.actions);
      }
    }

    return triggeredActions;
  }

  private evaluateConditions(conditions: RuleCondition[], payload: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    // Conjunction: All conditions must match (AND)
    return conditions.every(cond => {
      const value = this.resolvePayloadPath(payload, cond.field);
      if (value === undefined) return false;

      switch (cond.operator) {
        case 'EQUALS':
          return String(value) === String(cond.value);
        case 'NOT_EQUALS':
          return String(value) !== String(cond.value);
        case 'GREATER_THAN':
          return Number(value) > Number(cond.value);
        case 'LESS_THAN':
          return Number(value) < Number(cond.value);
        case 'CONTAINS':
          return String(value).toLowerCase().includes(String(cond.value).toLowerCase());
        default:
          return false;
      }
    });
  }

  private resolvePayloadPath(payload: Record<string, any>, path: string): any {
    const parts = path.split('.');
    let current = payload;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  }

  private seedDefaultRules(): void {
    this.rules = [
      {
        id: 'rule_high_severity_defect',
        name: 'High Severity Defect Auto-Orchestration',
        description: 'Auto-starts a review workflow when a critical/high defect is identified by Vision AI.',
        isActive: true,
        triggerEvent: 'VISION_DEFECT_DETECTED',
        conditions: [
          { field: 'severity', operator: 'EQUALS', value: 'CRITICAL' }
        ],
        actions: [
          {
            type: 'START_WORKFLOW',
            params: {
              definitionId: 'wf_critical_defect_remediation',
              notes: 'Auto-triggered due to CRITICAL defect classification.'
            }
          },
          {
            type: 'SEND_NOTIFICATION',
            params: {
              channel: 'IN_APP',
              recipient: 'PROJECT_MANAGER',
              title: 'Critical Site Defect Detected',
              body: 'Vision AI detected a critical defect. Automatic review workflow initiated.'
            }
          }
        ]
      },
      {
        id: 'rule_sla_breach_warning',
        name: 'SLA Near Breach Warning Route',
        description: 'Fires alerts and escalates tasks when time remaining drops below limits.',
        isActive: true,
        triggerEvent: 'SLA_NEAR_BREACH',
        conditions: [
          { field: 'priority', operator: 'EQUALS', value: 'CRITICAL' }
        ],
        actions: [
          {
            type: 'ASSIGN_TASK',
            params: {
              title: 'URGENT: Escalate Delayed Vastu Remediation',
              priority: 'CRITICAL',
              assignedRole: 'PROJECT_MANAGER'
            }
          }
        ]
      }
    ];
  }
}
