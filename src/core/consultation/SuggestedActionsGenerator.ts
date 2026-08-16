import { ISuggestedAction, IntentCategory } from './ConsultationTypes';

export class SuggestedActionsGenerator {
  public static generateActions(
    intentCategory: IntentCategory,
    propertyId?: string,
    projectId?: string
  ): ISuggestedAction[] {
    const actions: ISuggestedAction[] = [];

    switch (intentCategory) {
      case 'RECOMMENDATION_EXPLANATION':
      case 'KNOWLEDGE_QUERY':
        actions.push(
          {
            actionId: 'act-view-rec',
            label: 'View Full Recommendation Graph',
            actionType: 'VIEW_RECOMMENDATION',
            targetModule: 'Reasoning',
            description: 'Opens DOMAIN-006 Unified Reasoning Engine to inspect node graph and confidence weights.'
          },
          {
            actionId: 'act-review-evid',
            label: 'Review Scriptural Evidence Chain',
            actionType: 'REVIEW_EVIDENCE',
            targetModule: 'Verification',
            description: 'Inspect canonical manuscript citations and consensus metrics in Truth Engine.'
          }
        );
        break;

      case 'MONITORING_STATUS':
      case 'PROPERTY_ANALYSIS':
        actions.push(
          {
            actionId: 'act-view-mon',
            label: 'View Digital Twin Snapshot',
            actionType: 'VIEW_MONITORING_STATUS',
            targetModule: 'Monitoring',
            payload: { propertyId },
            description: 'Opens DOMAIN-008 Digital Twin snapshot and sensor diff workspace.'
          },
          {
            actionId: 'act-sched-insp',
            label: 'Schedule On-Site Frequency Inspection',
            actionType: 'SCHEDULE_INSPECTION',
            targetModule: 'Monitoring',
            description: 'Dispatches field engineer with 528Hz acoustic and microtesla sensors.'
          }
        );
        break;

      case 'PROJECT_STATUS':
      case 'MAINTENANCE_QUERY':
        actions.push(
          {
            actionId: 'act-open-proj',
            label: 'Open Execution Project & Tasks',
            actionType: 'OPEN_EXECUTION_PROJECT',
            targetModule: 'Execution',
            payload: { projectId },
            description: 'Opens DOMAIN-007 Project Execution workflow board and inspector checklists.'
          },
          {
            actionId: 'act-gen-rep',
            label: 'Generate Compliance Audit Certificate',
            actionType: 'GENERATE_REPORT',
            targetModule: 'Execution',
            description: 'Export official enterprise compliance PDF report.'
          }
        );
        break;

      case 'COMPLIANCE_QUERY':
        actions.push(
          {
            actionId: 'act-view-mon-comp',
            label: 'View Compliance Vectors',
            actionType: 'VIEW_MONITORING_STATUS',
            targetModule: 'Monitoring',
            description: 'Examine Pancha Tattva balance scores and geopathic stress vectors.'
          },
          {
            actionId: 'act-gen-rep-comp',
            label: 'Export Official Compliance PDF',
            actionType: 'GENERATE_REPORT',
            targetModule: 'Execution',
            description: 'Generates formal compliance certificate for municipal or client archiving.'
          }
        );
        break;

      default:
        actions.push(
          {
            actionId: 'act-view-rec-gen',
            label: 'Explore Unified Reasoning',
            actionType: 'VIEW_RECOMMENDATION',
            targetModule: 'Reasoning',
            description: 'Navigate to Unified Reasoning Engine.'
          },
          {
            actionId: 'act-view-mon-gen',
            label: 'Check Digital Twin Status',
            actionType: 'VIEW_MONITORING_STATUS',
            targetModule: 'Monitoring',
            description: 'Inspect live property digital twin telemetry.'
          }
        );
        break;
    }

    return actions;
  }
}
