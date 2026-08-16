import {
  IExecutionProject,
  IExecutionPhase,
  IExecutionTask,
  IExecutionEvidence,
  ISiteInspection,
  IApprovalRecord,
  IExecutionIssue,
  IExecutionRisk,
  IExecutionActivityLog,
  IExecutionProgressMetrics,
  ExecutionUserRole,
  IChecklistTemplate,
  WorkflowStatus,
} from './ExecutionTypes';

export class ProjectExecutionRegistry {
  private static instance: ProjectExecutionRegistry;

  private projects: Map<string, IExecutionProject> = new Map();
  private evidenceVault: Map<string, IExecutionEvidence> = new Map();
  private inspectionVault: Map<string, ISiteInspection> = new Map();
  private approvalVault: Map<string, IApprovalRecord> = new Map();
  private checklistTemplates: Map<string, IChecklistTemplate> = new Map();
  private activityLogs: IExecutionActivityLog[] = [];

  private constructor() {
    this.seedDefaultChecklistTemplates();
    this.seedInitialProject();
  }

  public static getInstance(): ProjectExecutionRegistry {
    if (!ProjectExecutionRegistry.instance) {
      ProjectExecutionRegistry.instance = new ProjectExecutionRegistry();
    }
    return ProjectExecutionRegistry.instance;
  }

  // ----------------------------------------------------
  // SEED TEMPLATES & SAMPLE PROJECT
  // ----------------------------------------------------
  private seedDefaultChecklistTemplates(): void {
    const defaultTemplate: IChecklistTemplate = {
      id: 'tpl-vastu-remedy-001',
      version: '1.0.0',
      status: 'APPROVED',
      owner: 'System Architect',
      createdBy: 'System',
      updatedBy: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Standard Vastu & Energy Harmonization Site Verification',
      category: 'Vastu & Energetics',
      items: [
        {
          id: 'item-01',
          label: 'Pre-remedy compass & energy baseline measurement',
          description: 'Take 32-zone directional compass angle reading and register orientation.',
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
          id: 'item-02',
          label: 'Pancha Tattva Element Harmonization Placement',
          description: 'Verify precise placement of elemental remedy in designated zone without structural demolition.',
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
          id: 'item-03',
          label: 'Post-Execution Client Sign-off & Inspection',
          description: 'Inspect compliance with Mayamatam shastric standards and collect client signature.',
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
      ],
    };
    this.checklistTemplates.set(defaultTemplate.id, defaultTemplate);
  }

  private seedInitialProject(): void {
    const sampleProjId = 'proj-execution-001';
    const now = new Date().toISOString();

    const sampleProject: IExecutionProject = {
      id: sampleProjId,
      version: '1.0.0',
      status: 'IN_PROGRESS',
      owner: 'Lead Field Consultant',
      createdBy: 'DOMAIN-006 Recommendation Converter',
      updatedBy: 'Lead Field Consultant',
      createdAt: now,
      updatedAt: now,
      projectCode: 'UF-PRJ-2026-081',
      title: 'Villa Urja - North-East Elemental & Chakra Remediation Plan',
      clientName: 'Rajesh & Sunita Sharma',
      siteAddress: 'Plot 42, Sector 15, Cyber Enclave, Gurugram',
      originatingSessionId: 'sess-vastu-001',
      originatingRecommendationIds: ['rec-001', 'rec-002', 'rec-003'],
      primaryDomains: ['Vastu', 'Chakra', 'LalKitab'],
      startDate: '2026-07-20T09:00:00Z',
      targetCompletionDate: '2026-08-15T18:00:00Z',
      overallProgressPercentage: 45,
      evidenceCount: 4,
      inspectionCount: 2,
      approvalCount: 3,
      budgetEstimated: 125000,
      phases: [
        {
          id: 'phase-01',
          version: '1.0.0',
          status: 'COMPLETED',
          owner: 'Lead Field Consultant',
          createdBy: 'System',
          updatedBy: 'System',
          createdAt: now,
          updatedAt: now,
          projectId: sampleProjId,
          phaseNumber: 1,
          title: 'Phase 1: Site Alignment & Diagnostic Baseline',
          description: 'Laser orientation measurements, 32-zone mapping, and pre-remedy energy audit.',
          startDate: '2026-07-20T09:00:00Z',
          targetEndDate: '2026-07-25T18:00:00Z',
          actualEndDate: '2026-07-24T17:30:00Z',
          phaseCompletionPercentage: 100,
          milestones: [
            {
              id: 'ms-01',
              version: '1.0.0',
              status: 'COMPLETED',
              owner: 'Lead Field Consultant',
              createdBy: 'System',
              updatedBy: 'System',
              createdAt: now,
              updatedAt: now,
              projectId: sampleProjId,
              phaseId: 'phase-01',
              title: 'M1: Baseline Compass Audit Sign-Off',
              description: 'Verification of precise North angle offset and entrance zone alignment.',
              targetCompletionDate: '2026-07-23T18:00:00Z',
              actualCompletionDate: '2026-07-23T16:00:00Z',
              requiredApprovalTiers: ['FIELD_ENGINEER', 'SENIOR_CONSULTANT'],
              isMilestoneApproved: true,
              tasksCount: 2,
              tasksCompletedCount: 2,
            },
          ],
          tasks: [
            {
              id: 'task-01',
              version: '1.0.0',
              status: 'COMPLETED',
              owner: 'Field Engineer Aman',
              createdBy: 'System',
              updatedBy: 'Field Engineer Aman',
              createdAt: now,
              updatedAt: now,
              projectId: sampleProjId,
              phaseId: 'phase-01',
              milestoneId: 'ms-01',
              originatingRecommendationId: 'rec-001',
              title: '32-Zone Precise Orientation Calibration',
              description: 'Deploy true-north digital compass to verify NE (Ishan) zone boundaries.',
              category: 'Site Diagnostic',
              priority: 'HIGH',
              assignedTo: 'Aman Verma',
              assignedRole: 'FIELD_ENGINEER',
              dueDate: '2026-07-22T17:00:00Z',
              estimatedDurationHours: 4,
              actualDurationHours: 3.5,
              dependencies: [],
              checklists: [
                {
                  id: 'chk-01-a',
                  label: 'Calibrate compass at center (Brahmasthan)',
                  isCompleted: true,
                  completedBy: 'Aman Verma',
                  completedAt: '2026-07-22T11:00:00Z',
                  requirements: {
                    requirePhoto: true,
                    requireVideo: false,
                    requireDocument: false,
                    requireSignature: false,
                    requireGPS: true,
                    requireMeasurement: true,
                    requireNotes: true,
                  },
                  capturedEvidenceIds: ['ev-001'],
                  measurementResult: '0.45 deg East inclination',
                },
              ],
              evidenceIds: ['ev-001'],
              inspectionIds: ['insp-001'],
              approvalIds: ['appr-001'],
              labels: ['Vastu', 'Diagnostic'],
              completionPercentage: 100,
            },
          ],
        },
        {
          id: 'phase-02',
          version: '1.0.0',
          status: 'IN_PROGRESS',
          owner: 'Senior Consultant Vikram',
          createdBy: 'System',
          updatedBy: 'Senior Consultant Vikram',
          createdAt: now,
          updatedAt: now,
          projectId: sampleProjId,
          phaseNumber: 2,
          title: 'Phase 2: Remedial Execution & Pranic Resonance Placement',
          description: 'Implementation of non-demolition elemental remedies and Vishuddha chakra vocalization guide.',
          startDate: '2026-07-26T09:00:00Z',
          targetEndDate: '2026-08-08T18:00:00Z',
          phaseCompletionPercentage: 35,
          milestones: [
            {
              id: 'ms-02',
              version: '1.0.0',
              status: 'IN_PROGRESS',
              owner: 'Senior Consultant Vikram',
              createdBy: 'System',
              updatedBy: 'Senior Consultant Vikram',
              createdAt: now,
              updatedAt: now,
              projectId: sampleProjId,
              phaseId: 'phase-02',
              title: 'M2: Northeast Water Element Remediation Completion',
              description: 'Non-invasive copper helix and water element balancing in NE zone.',
              targetCompletionDate: '2026-08-02T18:00:00Z',
              requiredApprovalTiers: ['SENIOR_CONSULTANT', 'PROJECT_MANAGER'],
              isMilestoneApproved: false,
              tasksCount: 2,
              tasksCompletedCount: 0,
            },
          ],
          tasks: [
            {
              id: 'task-02',
              version: '1.0.0',
              status: 'IN_PROGRESS',
              owner: 'Aman Verma',
              createdBy: 'System',
              updatedBy: 'Aman Verma',
              createdAt: now,
              updatedAt: now,
              projectId: sampleProjId,
              phaseId: 'phase-02',
              milestoneId: 'ms-02',
              originatingRecommendationId: 'rec-002',
              title: 'Northeast Water Harmonization Helix Installation',
              description: 'Place Mayamatam-compliant elemental water pyramid in NE corner.',
              category: 'Vastu Physical Remedy',
              priority: 'CRITICAL',
              assignedTo: 'Aman Verma',
              assignedRole: 'FIELD_ENGINEER',
              dueDate: '2026-07-30T17:00:00Z',
              estimatedDurationHours: 6,
              actualDurationHours: 2.5,
              dependencies: ['task-01'],
              checklists: [
                {
                  id: 'chk-02-a',
                  label: 'Clean and purify NE corner floor area',
                  isCompleted: true,
                  completedBy: 'Aman Verma',
                  completedAt: '2026-07-26T10:30:00Z',
                  requirements: {
                    requirePhoto: true,
                    requireVideo: false,
                    requireDocument: false,
                    requireSignature: false,
                    requireGPS: true,
                    requireMeasurement: false,
                    requireNotes: true,
                  },
                  capturedEvidenceIds: ['ev-002'],
                  notes: 'Area cleared of metallic scrap.',
                },
                {
                  id: 'chk-02-b',
                  label: 'Embed pure copper helix with water element crystal',
                  isCompleted: false,
                  requirements: {
                    requirePhoto: true,
                    requireVideo: true,
                    requireDocument: false,
                    requireSignature: true,
                    requireGPS: true,
                    requireMeasurement: true,
                    requireNotes: true,
                  },
                  capturedEvidenceIds: [],
                },
              ],
              evidenceIds: ['ev-002'],
              inspectionIds: ['insp-002'],
              approvalIds: ['appr-002'],
              labels: ['Remedy', 'WaterElement'],
              completionPercentage: 50,
            },
            {
              id: 'task-03',
              version: '1.0.0',
              status: 'ASSIGNED',
              owner: 'Dr. Meera Iyer',
              createdBy: 'System',
              updatedBy: 'Dr. Meera Iyer',
              createdAt: now,
              updatedAt: now,
              projectId: sampleProjId,
              phaseId: 'phase-02',
              milestoneId: 'ms-02',
              originatingRecommendationId: 'rec-003',
              title: 'Lal Kitab Jupiter-Moon Remedial Alignment Protocol',
              description: 'Guidance on non-invasive 1952 Gutke house remedy (brass container with clean water).',
              category: 'Astro Remedial Strategy',
              priority: 'MEDIUM',
              assignedTo: 'Dr. Meera Iyer',
              assignedRole: 'PROJECT_MANAGER',
              dueDate: '2026-08-05T17:00:00Z',
              estimatedDurationHours: 3,
              actualDurationHours: 0,
              dependencies: ['task-02'],
              checklists: [],
              evidenceIds: [],
              inspectionIds: [],
              approvalIds: [],
              labels: ['LalKitab', 'NonInvasive'],
              completionPercentage: 0,
            },
          ],
        },
      ],
      issues: [
        {
          id: 'iss-01',
          version: '1.0.0',
          status: 'IN_PROGRESS',
          owner: 'Aman Verma',
          createdBy: 'Aman Verma',
          updatedBy: 'Aman Verma',
          createdAt: '2026-07-21T14:00:00Z',
          updatedAt: now,
          projectId: sampleProjId,
          taskId: 'task-01',
          title: 'Minor magnetic deflection near electric main board',
          description: 'Electric junction box causing 1.2 degree needle drift on analog compass; switched to digital gyro-compass.',
          severity: 'MINOR',
          assignedTo: 'Aman Verma',
          resolutionHistory: [
            {
              timestamp: '2026-07-21T14:30:00Z',
              actionBy: 'Aman Verma',
              notes: 'Switched to military-grade digital gyro-compass. Drift resolved.',
              resultingStatus: 'RESOLVED_LOCAL',
            },
          ],
        },
      ],
      risks: [
        {
          id: 'risk-01',
          version: '1.0.0',
          status: 'PLANNED',
          owner: 'Dr. Meera Iyer',
          createdBy: 'Dr. Meera Iyer',
          updatedBy: 'Dr. Meera Iyer',
          createdAt: '2026-07-20T10:00:00Z',
          updatedAt: now,
          projectId: sampleProjId,
          title: 'Delayed client sign-off due to out-of-town travel',
          description: 'Client scheduled for travel between Aug 1 - Aug 5. Digital signature link prepared.',
          probability: 'MEDIUM',
          impact: 'MEDIUM',
          mitigationStrategy: 'Send secure digital signature request link to mobile app in advance.',
          escalationPerson: 'Dr. Meera Iyer',
          isTriggered: false,
        },
      ],
    };

    this.projects.set(sampleProject.id, sampleProject);

    // Seed Evidence
    const sampleEv1: IExecutionEvidence = {
      id: 'ev-001',
      version: '1.0.0',
      status: 'APPROVED',
      owner: 'Aman Verma',
      createdBy: 'Aman Verma',
      updatedBy: 'Aman Verma',
      createdAt: now,
      updatedAt: now,
      title: 'Digital Compass Calibration Photo - NE Zone',
      description: 'Zero degree north calibration reading at Brahmasthan center point.',
      evidenceType: 'IMAGE',
      fileUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60',
      uploaderName: 'Aman Verma',
      uploaderRole: 'FIELD_ENGINEER',
      relatedTaskId: 'task-01',
      relatedRecommendationId: 'rec-001',
      relatedProjectId: sampleProjId,
      gpsCoordinates: { latitude: 28.4595, longitude: 77.0266 },
      measurementValue: { numericalValue: 0.45, unit: 'degrees', parameterName: 'East Offset' },
      immutableChecksum: 'SHA256:8f431a980c611efbc101c790181',
      timestamp: '2026-07-22T11:05:00Z',
    };

    const sampleEv2: IExecutionEvidence = {
      id: 'ev-002',
      version: '1.0.0',
      status: 'APPROVED',
      owner: 'Aman Verma',
      createdBy: 'Aman Verma',
      updatedBy: 'Aman Verma',
      createdAt: now,
      updatedAt: now,
      title: 'NE Corner Floor Clearance Evidence Photo',
      description: 'Pre-remedy floor clearing photo confirming no metallic clutter.',
      evidenceType: 'IMAGE',
      fileUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=60',
      uploaderName: 'Aman Verma',
      uploaderRole: 'FIELD_ENGINEER',
      relatedTaskId: 'task-02',
      relatedRecommendationId: 'rec-002',
      relatedProjectId: sampleProjId,
      gpsCoordinates: { latitude: 28.4595, longitude: 77.0266 },
      immutableChecksum: 'SHA256:77a11029cbaef9012389a0129',
      timestamp: '2026-07-26T10:35:00Z',
    };

    this.evidenceVault.set(sampleEv1.id, sampleEv1);
    this.evidenceVault.set(sampleEv2.id, sampleEv2);

    // Seed Inspection
    const sampleInsp1: ISiteInspection = {
      id: 'insp-001',
      version: '1.0.0',
      status: 'APPROVED',
      owner: 'Vikram Singh',
      createdBy: 'Vikram Singh',
      updatedBy: 'Vikram Singh',
      createdAt: now,
      updatedAt: now,
      projectId: sampleProjId,
      taskId: 'task-01',
      inspectorName: 'Vikram Singh',
      inspectorRole: 'PROJECT_MANAGER',
      inspectionDate: '2026-07-23T14:00:00Z',
      locationDetails: 'Brahmasthan & NE Ishan Zone',
      observations: 'Compass calibration verified accurate within 0.5 degrees. Site condition prime.',
      complianceStatus: 'FULLY_COMPLIANT',
      measurementsTaken: [
        { parameter: 'North Axis Deviation', expectedRange: '0.0 - 1.0 deg', actualValue: '0.45 deg', isPass: true },
      ],
      evidenceIds: ['ev-001'],
    };
    this.inspectionVault.set(sampleInsp1.id, sampleInsp1);

    // Seed Approval
    const sampleAppr1: IApprovalRecord = {
      id: 'appr-001',
      version: '1.0.0',
      status: 'APPROVED',
      owner: 'Dr. Meera Iyer',
      createdBy: 'Dr. Meera Iyer',
      updatedBy: 'Dr. Meera Iyer',
      createdAt: now,
      updatedAt: now,
      projectId: sampleProjId,
      taskId: 'task-01',
      approvalTier: 'SENIOR_CONSULTANT',
      approverName: 'Dr. Meera Iyer',
      approverRole: 'ADMIN',
      decision: 'APPROVED',
      comments: 'Phase 1 diagnostic baseline verified against Mayamatam shastric criteria.',
      digitalSignatureHash: 'SIG-RSA2048:e901a8829c7d210a',
      decisionTimestamp: '2026-07-23T16:00:00Z',
    };
    this.approvalVault.set(sampleAppr1.id, sampleAppr1);

    this.logActivity({
      logId: 'log-001',
      projectId: sampleProjId,
      entityType: 'PROJECT',
      entityId: sampleProjId,
      action: 'PROJECT_INITIALIZED',
      performedBy: 'DOMAIN-006 Recommendation Engine',
      performedByRole: 'ADMIN',
      timestamp: now,
      details: 'Created Project UF-PRJ-2026-081 from Approved Recommendations rec-001, rec-002, rec-003.',
    });
  }

  // ----------------------------------------------------
  // PUBLIC CRUD & SERVICES
  // ----------------------------------------------------
  public getAllProjects(): IExecutionProject[] {
    return Array.from(this.projects.values());
  }

  public getProjectById(id: string): IExecutionProject | undefined {
    return this.projects.get(id);
  }

  public saveProject(project: IExecutionProject, user: string = 'System', role: ExecutionUserRole = 'ADMIN'): void {
    const isNew = !this.projects.has(project.id);
    project.updatedAt = new Date().toISOString();
    project.updatedBy = user;
    this.projects.set(project.id, project);

    this.logActivity({
      logId: `log-${Date.now()}`,
      projectId: project.id,
      entityType: 'PROJECT',
      entityId: project.id,
      action: isNew ? 'PROJECT_CREATED' : 'PROJECT_UPDATED',
      performedBy: user,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      details: `Project ${project.projectCode} (${project.title}) saved with status ${project.status}.`,
    });
  }

  public getAllEvidence(): IExecutionEvidence[] {
    return Array.from(this.evidenceVault.values());
  }

  public addEvidence(evidence: IExecutionEvidence): void {
    this.evidenceVault.set(evidence.id, evidence);

    // Link to task if present
    const project = this.projects.get(evidence.relatedProjectId);
    if (project) {
      project.evidenceCount = (project.evidenceCount || 0) + 1;
      for (const phase of project.phases) {
        for (const task of phase.tasks) {
          if (task.id === evidence.relatedTaskId && !task.evidenceIds.includes(evidence.id)) {
            task.evidenceIds.push(evidence.id);
          }
        }
      }
    }

    this.logActivity({
      logId: `log-ev-${Date.now()}`,
      projectId: evidence.relatedProjectId,
      entityType: 'EVIDENCE',
      entityId: evidence.id,
      action: 'EVIDENCE_UPLOADED',
      performedBy: evidence.uploaderName,
      performedByRole: evidence.uploaderRole,
      timestamp: evidence.timestamp,
      details: `Uploaded ${evidence.evidenceType} evidence (${evidence.title}) linked to task ${evidence.relatedTaskId}.`,
    });
  }

  public getAllInspections(): ISiteInspection[] {
    return Array.from(this.inspectionVault.values());
  }

  public addInspection(inspection: ISiteInspection): void {
    this.inspectionVault.set(inspection.id, inspection);

    const project = this.projects.get(inspection.projectId);
    if (project) {
      project.inspectionCount = (project.inspectionCount || 0) + 1;
      for (const phase of project.phases) {
        for (const task of phase.tasks) {
          if (task.id === inspection.taskId && !task.inspectionIds.includes(inspection.id)) {
            task.inspectionIds.push(inspection.id);
          }
        }
      }
    }

    this.logActivity({
      logId: `log-insp-${Date.now()}`,
      projectId: inspection.projectId,
      entityType: 'INSPECTION',
      entityId: inspection.id,
      action: 'INSPECTION_RECORDED',
      performedBy: inspection.inspectorName,
      performedByRole: inspection.inspectorRole,
      timestamp: inspection.inspectionDate,
      details: `Recorded site inspection with compliance result ${inspection.complianceStatus}.`,
    });
  }

  public getAllApprovals(): IApprovalRecord[] {
    return Array.from(this.approvalVault.values());
  }

  public addApproval(approval: IApprovalRecord): void {
    this.approvalVault.set(approval.id, approval);

    const project = this.projects.get(approval.projectId);
    if (project) {
      project.approvalCount = (project.approvalCount || 0) + 1;
      if (approval.taskId) {
        for (const phase of project.phases) {
          for (const task of phase.tasks) {
            if (task.id === approval.taskId && !task.approvalIds.includes(approval.id)) {
              task.approvalIds.push(approval.id);
              if (approval.decision === 'APPROVED') {
                task.status = 'COMPLETED';
                task.completionPercentage = 100;
              } else if (approval.decision === 'REJECTED') {
                task.status = 'BLOCKED';
              }
            }
          }
        }
      }
    }

    this.logActivity({
      logId: `log-appr-${Date.now()}`,
      projectId: approval.projectId,
      entityType: 'APPROVAL',
      entityId: approval.id,
      action: 'APPROVAL_RECORDED',
      performedBy: approval.approverName,
      performedByRole: approval.approverRole,
      timestamp: approval.decisionTimestamp,
      details: `Recorded ${approval.approvalTier} approval decision: ${approval.decision}.`,
    });
  }

  public getChecklistTemplates(): IChecklistTemplate[] {
    return Array.from(this.checklistTemplates.values());
  }

  public getActivityLogs(projectId?: string): IExecutionActivityLog[] {
    if (!projectId) return this.activityLogs;
    return this.activityLogs.filter((log) => log.projectId === projectId);
  }

  public logActivity(log: IExecutionActivityLog): void {
    this.activityLogs.unshift(log); // newest first
  }

  // ----------------------------------------------------
  // PROGRESS METRICS CALCULATOR
  // ----------------------------------------------------
  public computeProjectMetrics(projectId: string): IExecutionProgressMetrics | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let blockedTasks = 0;
    let pendingInspectionTasks = 0;
    let tasksWithEvidence = 0;

    let totalPhases = project.phases.length;
    let completedPhases = 0;

    let totalMilestones = 0;
    let achievedMilestones = 0;

    for (const phase of project.phases) {
      if (phase.status === 'COMPLETED' || phase.phaseCompletionPercentage === 100) {
        completedPhases++;
      }

      for (const ms of phase.milestones) {
        totalMilestones++;
        if (ms.isMilestoneApproved || ms.status === 'COMPLETED') {
          achievedMilestones++;
        }
      }

      for (const task of phase.tasks) {
        totalTasks++;
        if (task.status === 'COMPLETED') completedTasks++;
        else if (task.status === 'IN_PROGRESS') inProgressTasks++;
        else if (task.status === 'BLOCKED') blockedTasks++;
        else if (task.status === 'INSPECTION_PENDING' || task.status === 'VERIFICATION_PENDING') {
          pendingInspectionTasks++;
        }

        if (task.evidenceIds.length > 0) {
          tasksWithEvidence++;
        }
      }
    }

    const overallProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const evidenceCoveragePercentage = totalTasks > 0 ? Math.round((tasksWithEvidence / totalTasks) * 100) : 0;

    // Inspection compliance
    const projectInspections = Array.from(this.inspectionVault.values()).filter(
      (i) => i.projectId === projectId
    );
    const fullyCompliantInspections = projectInspections.filter(
      (i) => i.complianceStatus === 'FULLY_COMPLIANT'
    ).length;
    const inspectionComplianceRate =
      projectInspections.length > 0
        ? Math.round((fullyCompliantInspections / projectInspections.length) * 100)
        : 100;

    const openIssuesCount = (project.issues || []).filter((i) => i.status !== 'COMPLETED' && i.status !== 'ARCHIVED').length;
    const criticalRisksCount = (project.risks || []).filter((r) => r.impact === 'HIGH').length;

    return {
      projectId,
      overallProgressPercentage,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      pendingInspectionTasks,
      totalPhases,
      completedPhases,
      totalMilestones,
      achievedMilestones,
      evidenceCoveragePercentage,
      inspectionComplianceRate,
      openIssuesCount,
      criticalRisksCount,
      scheduleDelayDays: 0,
    };
  }
}
