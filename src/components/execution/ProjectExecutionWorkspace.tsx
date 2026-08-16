import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  Layers,
  ListTodo,
  Camera,
  MapPin,
  Ruler,
  UserCheck,
  Building2,
  PlusCircle,
  ChevronRight,
  Filter,
  Search,
  UploadCloud,
  FileText,
  Lock,
  ArrowUpRight,
  Activity,
  Award,
  Sparkles,
  Zap,
  HelpCircle,
  FileSpreadsheet,
  FileCode,
  ShieldAlert,
  Sliders,
  Calendar,
  Key,
} from 'lucide-react';

import {
  IExecutionProject,
  IExecutionTask,
  IExecutionEvidence,
  ISiteInspection,
  IApprovalRecord,
  ExecutionUserRole,
  WorkflowStatus,
  InspectionComplianceStatus,
  ApprovalTier,
  IExecutionProgressMetrics,
} from '../../core/execution/ExecutionTypes';
import { ProjectExecutionRegistry } from '../../core/execution/ProjectExecutionRegistry';
import { RecommendationExecutionEngine } from '../../core/execution/RecommendationExecutionEngine';
import { WorkflowEngineService } from '../../core/execution/WorkflowEngineService';
import { SiteVerificationService } from '../../core/execution/SiteVerificationService';
import { TaskManagementService } from '../../core/execution/TaskManagementService';
import { IRecommendation } from '../../core/reasoning/ReasoningTypes';

export const ProjectExecutionWorkspace: React.FC = () => {
  // Services & Registry
  const registry = ProjectExecutionRegistry.getInstance();
  const execEngine = new RecommendationExecutionEngine();
  const workflowService = new WorkflowEngineService();
  const siteVerificationService = new SiteVerificationService();
  const taskService = new TaskManagementService();

  // State
  const [userRole, setUserRole] = useState<ExecutionUserRole>('PROJECT_MANAGER');
  const [userName, setUserName] = useState<string>('Dr. Meera Iyer');
  const [projects, setProjects] = useState<IExecutionProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'TASKS'
    | 'CONVERTER'
    | 'CHECKLISTS_INSPECTIONS'
    | 'EVIDENCE'
    | 'APPROVALS'
    | 'ISSUES_RISKS'
    | 'AUDIT'
  >('OVERVIEW');

  // Filters & Dialogs
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showConverterModal, setShowConverterModal] = useState<boolean>(false);
  const [showEvidenceUploadModal, setShowEvidenceUploadModal] = useState<boolean>(false);
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);

  // Selected Target for Modals
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<IExecutionTask | null>(null);

  // Converter Form State
  const [newProjTitle, setNewProjTitle] = useState<string>('');
  const [newProjClient, setNewProjClient] = useState<string>('');
  const [newProjAddress, setNewProjAddress] = useState<string>('');

  // Evidence Upload Form State
  const [evTitle, setEvTitle] = useState<string>('');
  const [evType, setEvType] = useState<string>('IMAGE');
  const [evUrl, setEvUrl] = useState<string>('');
  const [evParam, setEvParam] = useState<string>('');
  const [evValue, setEvValue] = useState<string>('');

  // Inspection Form State
  const [inspObs, setInspObs] = useState<string>('');
  const [inspStatus, setInspStatus] = useState<InspectionComplianceStatus>('FULLY_COMPLIANT');
  const [inspParam, setInspParam] = useState<string>('Pancha Tattva Resonance');
  const [inspVal, setInspVal] = useState<string>('Balanced (100% compliant)');

  // Approval Form State
  const [apprTier, setApprTier] = useState<ApprovalTier>('PROJECT_MANAGER');
  const [apprDecision, setApprDecision] = useState<'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES'>('APPROVED');
  const [apprComments, setApprComments] = useState<string>('');

  // Refresh Projects
  const reloadData = () => {
    const list = registry.getAllProjects();
    setProjects(list);
    if (list.length > 0 && !selectedProjectId) {
      setSelectedProjectId(list[0].id);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentMetrics: IExecutionProgressMetrics | null = currentProject
    ? registry.computeProjectMetrics(currentProject.id)
    : null;

  // Handles Status Change with Workflow Engine
  const handleTaskStatusChange = (taskId: string, targetStatus: WorkflowStatus) => {
    if (!currentProject) return;
    const res = workflowService.updateTaskStatus(currentProject.id, taskId, targetStatus, userName, userRole);
    if (!res.success) {
      alert(`Workflow Restriction: ${res.message}`);
    } else {
      reloadData();
    }
  };

  // Convert Sample Recommendations into Project
  const handleCreateProjectFromRecommendations = () => {
    if (!newProjTitle || !newProjClient) {
      alert('Please fill in Project Title and Client Name.');
      return;
    }

    const sampleRecs: IRecommendation[] = [
      {
        id: `rec-gen-${Date.now()}-1`,
        category: 'Vastu Spatial Alignment',
        title: 'Brahmasthan Energetic Clearance & Center Point Balancing',
        description: 'Remove heavy physical fixtures from exact Brahmasthan central grid coordinates.',
        supportingEvidence: {
          evidenceId: 'evid-vastu-001',
          supportingDomains: ['Vastu'],
          supportingEntities: [
            {
              domain: 'Vastu',
              entityId: 'ent-vastu-001',
              name: 'Brahmasthan Central Grid',
              sourceBook: 'Mayamatam',
              confidence: 98
            }
          ],
          supportingRules: ['rule-001'],
          sourceCitations: [
            {
              book: 'Mayamatam',
              author: 'Sage Maya',
              chapter: 'Chapter 7',
              verseOrShloka: 'Verses 12-16',
              sourceReliability: 98
            },
          ],
          overallConfidence: 98,
          verificationStatus: 'CANONICAL',
        },
        supportingDomains: ['Vastu'],
        preconditions: ['Zero point central grid measurement confirmed'],
        priority: 'CRITICAL',
        confidenceScore: 96,
        confidenceGrade: 'A+',
        expectedOutcome: 'Restores unhindered cosmic pranic flow across all 32 perimeter zones.',
        dependencies: [],
        conflicts: [],
        status: 'APPROVED',
        version: '1.0.0',
      },
      {
        id: `rec-gen-${Date.now()}-2`,
        category: 'Chakra Energetic Harmony',
        title: 'Anahata & Vishuddha Sound Resonance & Frequency Calibration',
        description: 'Deploy 528Hz acoustic harmonic diffuser in North-East Ishan chamber.',
        supportingEvidence: {
          evidenceId: 'evid-chakra-002',
          supportingDomains: ['Chakra'],
          supportingEntities: [
            {
              domain: 'Chakra',
              entityId: 'ent-chakra-004',
              name: 'Anahata Throat Resonance',
              sourceBook: 'Sat Chakra Nirupana',
              confidence: 95
            }
          ],
          supportingRules: ['rule-chakra-002'],
          sourceCitations: [
            {
              book: 'Sat Chakra Nirupana',
              author: 'Swami Purnananda',
              chapter: 'Verse 31',
              sourceReliability: 95
            },
          ],
          overallConfidence: 95,
          verificationStatus: 'CANONICAL',
        },
        supportingDomains: ['Chakra'],
        preconditions: ['Acoustic baseline sound pressure reading recorded'],
        priority: 'HIGH',
        confidenceScore: 92,
        confidenceGrade: 'A',
        expectedOutcome: 'Subdues subtle energetic turbulence and fosters mental serenity.',
        dependencies: [],
        conflicts: [],
        status: 'APPROVED',
        version: '1.0.0',
      },
    ];

    const proj = execEngine.createProjectFromRecommendations({
      title: newProjTitle,
      clientName: newProjClient,
      siteAddress: newProjAddress || 'Main Site Address',
      recommendations: sampleRecs,
      creatorUser: userName,
      creatorRole: userRole,
    });

    setSelectedProjectId(proj.id);
    setShowConverterModal(false);
    setNewProjTitle('');
    setNewProjClient('');
    setNewProjAddress('');
    reloadData();
  };

  // Upload Evidence Handler
  const handleEvidenceUploadSubmit = () => {
    if (!selectedTaskForModal || !currentProject || !evTitle) return;
    siteVerificationService.uploadEvidence({
      title: evTitle,
      description: 'Site evidence collected during field execution.',
      evidenceType: evType as any,
      fileUrl: evUrl || 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60',
      uploaderName: userName,
      uploaderRole: userRole,
      relatedTaskId: selectedTaskForModal.id,
      relatedRecommendationId: selectedTaskForModal.originatingRecommendationId,
      relatedProjectId: currentProject.id,
      latitude: 28.4595,
      longitude: 77.0266,
      measurementVal: evParam ? { numericalValue: parseFloat(evValue) || 1.0, unit: 'units', parameterName: evParam } : undefined,
    });

    setShowEvidenceUploadModal(false);
    setEvTitle('');
    setEvUrl('');
    reloadData();
  };

  // Submit Inspection Handler
  const handleInspectionSubmit = () => {
    if (!selectedTaskForModal || !currentProject) return;
    siteVerificationService.recordInspection({
      projectId: currentProject.id,
      taskId: selectedTaskForModal.id,
      inspectorName: userName,
      inspectorRole: userRole,
      locationDetails: 'Site Primary Execution Zone',
      observations: inspObs || 'Field compliance checked against shastric standard.',
      complianceStatus: inspStatus,
      measurementsTaken: [
        {
          parameter: inspParam,
          expectedRange: '100% Compliant',
          actualValue: inspVal,
          isPass: inspStatus === 'FULLY_COMPLIANT',
        },
      ],
      evidenceIds: selectedTaskForModal.evidenceIds,
    });

    setShowInspectionModal(false);
    setInspObs('');
    reloadData();
  };

  // Submit Approval Decision
  const handleApprovalSubmit = () => {
    if (!selectedTaskForModal || !currentProject) return;
    siteVerificationService.submitApprovalDecision({
      projectId: currentProject.id,
      taskId: selectedTaskForModal.id,
      approvalTier: apprTier,
      approverName: userName,
      approverRole: userRole,
      decision: apprDecision,
      comments: apprComments || 'Approved based on submitted evidence and inspection pass.',
    });

    setShowApprovalModal(false);
    setApprComments('');
    reloadData();
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen font-sans border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* TOP BAR & ROLE SWITCHER */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <FolderGit2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">DOMAIN-007 — Enterprise Project Execution</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Workflow Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Converts approved DOMAIN-006 recommendations into tracked, auditable site execution workflows.
            </p>
          </div>
        </div>

        {/* ROLE SELECTOR & ACTIVE USER */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 border-r border-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Role:</span>
          </div>

          {(['ADMIN', 'PROJECT_MANAGER', 'FIELD_ENGINEER', 'END_USER'] as ExecutionUserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setUserRole(r);
                if (r === 'ADMIN') setUserName('Admin Knowledge Architect');
                else if (r === 'PROJECT_MANAGER') setUserName('Dr. Meera Iyer');
                else if (r === 'FIELD_ENGINEER') setUserName('Aman Verma');
                else setUserName('End User Client');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                userRole === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* END_USER RBAC WARNING NOTICE */}
      {userRole === 'END_USER' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              <strong>END_USER Mode:</strong> You have read-only visibility into approved deliverables and completion status. Workflow overrides, evidence creation, and audit tampering are strictly prohibited.
            </span>
          </div>
        </div>
      )}

      {/* PROJECT SELECTOR & TABS */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 text-slate-200 text-sm font-medium border border-slate-700/80 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full md:w-72"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode} — {p.title}
              </option>
            ))}
          </select>

          {userRole !== 'END_USER' && (
            <button
              onClick={() => setShowConverterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Convert Recs to Project
            </button>
          )}
        </div>

        {/* WORKSPACE SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'OVERVIEW', label: 'Overview & KPIs', icon: Activity },
            { id: 'TASKS', label: 'Task Execution Board', icon: ListTodo },
            { id: 'CHECKLISTS_INSPECTIONS', label: 'Checklists & Site Audits', icon: FileCheck },
            { id: 'EVIDENCE', label: 'Evidence Vault', icon: Camera },
            { id: 'APPROVALS', label: 'Approval Center', icon: ShieldCheck },
            { id: 'ISSUES_RISKS', label: 'Issues & Risks', icon: AlertTriangle },
            { id: 'AUDIT', label: 'Audit Trail', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600/90 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE BODY */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'OVERVIEW' && currentProject && currentMetrics && (
          <div className="space-y-6">
            {/* PROJECT HEADER CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentProject.projectCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Status: {currentProject.status}
                    </span>
                    <span className="text-xs text-slate-400">| Client: {currentProject.clientName}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{currentProject.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{currentProject.siteAddress}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Start: {new Date(currentProject.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* PROGRESS RING / BAR */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 min-w-[240px] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Overall Completion</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {currentMetrics.overallProgressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${currentMetrics.overallProgressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{currentMetrics.completedTasks} / {currentMetrics.totalTasks} Tasks Done</span>
                    <span>{currentMetrics.completedPhases} / {currentMetrics.totalPhases} Phases</span>
                  </div>
                </div>
              </div>
            </div>

            {/* METRIC KPI GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Total Tasks</span>
                  <ListTodo className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">{currentMetrics.totalTasks}</div>
                <p className="text-[11px] text-emerald-400">{currentMetrics.completedTasks} completed</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">In Progress</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{currentMetrics.inProgressTasks}</div>
                <p className="text-[11px] text-slate-400">{currentMetrics.pendingInspectionTasks} awaiting audit</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Evidence Coverage</span>
                  <Camera className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{currentMetrics.evidenceCoveragePercentage}%</div>
                <p className="text-[11px] text-purple-300">{currentProject.evidenceCount} uploaded files</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Audit Compliance</span>
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{currentMetrics.inspectionComplianceRate}%</div>
                <p className="text-[11px] text-emerald-400">{currentProject.inspectionCount} inspections passed</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Approvals Signed</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">{currentProject.approvalCount}</div>
                <p className="text-[11px] text-cyan-300">Multi-tier signoffs</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Open Issues</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-rose-400">{currentMetrics.openIssuesCount}</div>
                <p className="text-[11px] text-slate-400">{currentMetrics.criticalRisksCount} critical risks</p>
              </div>
            </div>

            {/* PHASES ROADMAP */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Project Execution Phases & Shastric Work Breakdown
              </h3>

              <div className="space-y-4">
                {currentProject.phases.map((phase) => (
                  <div key={phase.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {phase.phaseNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {phase.status}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-400 font-semibold">
                        {phase.phaseCompletionPercentage}% Completed
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{phase.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {phase.tasks.map((task) => (
                        <div key={task.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200">{task.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Assigned: {task.assignedTo}</span>
                            <span>Rec ID: {task.originatingRecommendationId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASK EXECUTION BOARD */}
        {activeTab === 'TASKS' && currentProject && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Task Execution & Shastric Work Items</h3>
                <p className="text-xs text-slate-400">Manage task state, assignees, checklists, and workflow transitions.</p>
              </div>

              {/* FILTER BAR */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLANNED">PLANNED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="INSPECTION_PENDING">INSPECTION_PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>
            </div>

            {/* TASKS LIST */}
            <div className="space-y-4">
              {currentProject.phases.flatMap((ph) => ph.tasks)
                .filter((t) => taskStatusFilter === 'ALL' || t.status === taskStatusFilter)
                .map((task) => (
                  <div key={task.id} className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            Priority: {task.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {task.category}
                          </span>
                          <span className="text-xs text-slate-400">Task ID: {task.id}</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{task.title}</h4>
                      </div>

                      {/* STATUS TRANSITION CONTROLS */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Current:</span>
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {task.status}
                        </span>

                        {userRole !== 'END_USER' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-semibold rounded transition-all"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'INSPECTION_PENDING')}
                              className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-semibold rounded transition-all"
                            >
                              Inspection
                            </button>
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-all"
                            >
                              Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      {task.description}
                    </p>

                    {/* METADATA & ACTIONS ROW */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-400">
                        <span>Assignee: <strong className="text-slate-200">{task.assignedTo}</strong></span>
                        <span>Due: <strong className="text-purple-300">{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                        <span>Evidence Items: <strong className="text-indigo-300">{task.evidenceIds.length}</strong></span>
                        <span>Inspections: <strong className="text-emerald-300">{task.inspectionIds.length}</strong></span>
                      </div>

                      {userRole !== 'END_USER' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTaskForModal(task);
                              setShowEvidenceUploadModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-all"
                          >
                            <Camera className="w-3.5 h-3.5 text-indigo-400" />
                            Upload Evidence
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskForModal(task);
                              setShowInspectionModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-all"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Record Audit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskForModal(task);
                              setShowApprovalModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            Sign Off
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: CHECKLISTS & SITE AUDITS */}
        {activeTab === 'CHECKLISTS_INSPECTIONS' && currentProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Site Verification Audits & Checklists</h3>
                <p className="text-xs text-slate-400">Review task checklists, physical measurements, and inspection reports.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CHECKLISTS COL */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-indigo-400" />
                  Task Execution Checklists
                </h4>

                {currentProject.phases.flatMap((ph) => ph.tasks).map((t) => (
                  <div key={t.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t.title}</span>
                      <span className="text-[10px] text-slate-400">Task ID: {t.id}</span>
                    </div>

                    <div className="space-y-2">
                      {t.checklists.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 text-xs bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            disabled={userRole === 'END_USER'}
                            onChange={() => {
                              item.isCompleted = !item.isCompleted;
                              item.completedBy = userName;
                              item.completedAt = new Date().toISOString();
                              reloadData();
                            }}
                            className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                          />
                          <div className="space-y-1">
                            <span className={item.isCompleted ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}>
                              {item.label}
                            </span>
                            <p className="text-[11px] text-slate-400">{item.description}</p>
                            {item.measurementResult && (
                              <span className="text-[10px] text-emerald-400 block font-semibold">
                                Measurement: {item.measurementResult}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SITE INSPECTIONS RECORD COL */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Recorded Site Inspections
                </h4>

                <div className="space-y-3">
                  {registry.getAllInspections().filter((i) => i.projectId === currentProject.id).map((insp) => (
                    <div key={insp.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{insp.inspectorName} ({insp.inspectorRole})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {insp.complianceStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{insp.observations}</p>

                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Date: {new Date(insp.inspectionDate).toLocaleString()}</span>
                        <span>Task ID: {insp.taskId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE VAULT */}
        {activeTab === 'EVIDENCE' && currentProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Immutable Digital Evidence Vault</h3>
                <p className="text-xs text-slate-400">
                  Field photos, sensor logs, GPS coordinates, and cryptographic SHA256 evidence records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registry.getAllEvidence().filter((ev) => ev.relatedProjectId === currentProject.id).map((ev) => (
                <div key={ev.id} className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden space-y-3 p-4">
                  {ev.evidenceType === 'IMAGE' && (
                    <img src={ev.fileUrl} alt={ev.title} className="w-full h-40 object-cover rounded-lg border border-slate-800" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        {ev.evidenceType}
                      </span>
                      <span className="text-[10px] text-slate-400">{ev.id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                    <p className="text-[11px] text-slate-400">{ev.description}</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <div>Uploader: <strong className="text-slate-200">{ev.uploaderName}</strong> ({ev.uploaderRole})</div>
                    <div>Checksum: <code className="text-purple-300 text-[10px]">{ev.immutableChecksum}</code></div>
                    {ev.gpsCoordinates && (
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px]">
                        <MapPin className="w-3 h-3" />
                        <span>GPS: {ev.gpsCoordinates.latitude}, {ev.gpsCoordinates.longitude}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: APPROVAL CENTER */}
        {activeTab === 'APPROVALS' && currentProject && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Multi-Tier Approval & Sign-Off Center</h3>
              <p className="text-xs text-slate-400">Field Engineer → Senior Consultant → Project Manager → Administrator digital approvals.</p>
            </div>

            <div className="space-y-3">
              {registry.getAllApprovals().filter((appr) => appr.projectId === currentProject.id).map((appr) => (
                <div key={appr.id} className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {appr.approvalTier}
                      </span>
                      <span className="text-xs font-bold text-white">{appr.approverName} ({appr.approverRole})</span>
                    </div>
                    <p className="text-xs text-slate-300">{appr.comments}</p>
                    <div className="text-[10px] text-slate-400">
                      Digital Hash: <code className="text-cyan-400">{appr.digitalSignatureHash}</code>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {appr.decision}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Signed: {new Date(appr.decisionTimestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ISSUES & RISKS */}
        {activeTab === 'ISSUES_RISKS' && currentProject && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Site Issues & Risk Mitigation Register</h3>
              <p className="text-xs text-slate-400">Track field anomalies, magnetic deflections, schedule risks, and escalations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ISSUES */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Active Site Issues ({currentProject.issues.length})
                </h4>

                <div className="space-y-3">
                  {currentProject.issues.map((iss) => (
                    <div key={iss.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{iss.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          {iss.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{iss.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Risk Mitigation Matrix ({currentProject.risks.length})
                </h4>

                <div className="space-y-3">
                  {currentProject.risks.map((risk) => (
                    <div key={risk.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{risk.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Impact: {risk.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{risk.description}</p>
                      <div className="text-[11px] text-emerald-400 pt-1">
                        Mitigation: {risk.mitigationStrategy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT HISTORY LOG */}
        {activeTab === 'AUDIT' && currentProject && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Execution Activity & Audit Log</h3>
              <p className="text-xs text-slate-400">Timestamped chronological record of all project state changes, evidence uploads, and sign-offs.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
              {registry.getActivityLogs(currentProject.id).map((log) => (
                <div key={log.logId} className="p-2 bg-slate-900/60 rounded border border-slate-800/80 flex items-start gap-3">
                  <span className="text-slate-500 text-[11px] whitespace-nowrap">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold">{log.action}</span>
                      <span className="text-slate-400 text-[10px]">
                        by {log.performedBy} ({log.performedByRole})
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONVERTER MODAL */}
      <AnimatePresence>
        {showConverterModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Convert Approved Recommendations to Project
              </h3>
              <p className="text-xs text-slate-400">
                Instantiate executable phases, tasks, and site verification checklists directly from DOMAIN-006 approved recommendations.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Resi-Vastu Villa Harmonization Plan"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita & Ramesh Mehta"
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Site Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 104 Sector 45, Gurgaon"
                    value={newProjAddress}
                    onChange={(e) => setNewProjAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowConverterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProjectFromRecommendations}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Instantiate Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVIDENCE UPLOAD MODAL */}
      <AnimatePresence>
        {showEvidenceUploadModal && selectedTaskForModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                Upload Field Evidence for Task
              </h3>
              <p className="text-xs text-slate-400">Target Task: {selectedTaskForModal.title}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Northeast Corner Helix Photo"
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={evType}
                    onChange={(e) => setEvType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="IMAGE">Photo / Image</option>
                    <option value="VIDEO">Video Recording</option>
                    <option value="REPORT">Field Sensor Log</option>
                    <option value="MEASUREMENT">Physical Measurement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Image / File URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={evUrl}
                    onChange={(e) => setEvUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowEvidenceUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEvidenceUploadSubmit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Submit Evidence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECTION MODAL */}
      <AnimatePresence>
        {showInspectionModal && selectedTaskForModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Record Site Inspection Audit
              </h3>
              <p className="text-xs text-slate-400">Target Task: {selectedTaskForModal.title}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Compliance Status</label>
                  <select
                    value={inspStatus}
                    onChange={(e) => setInspStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="FULLY_COMPLIANT">FULLY_COMPLIANT</option>
                    <option value="PARTIALLY_COMPLIANT">PARTIALLY_COMPLIANT</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inspector Observations</label>
                  <textarea
                    rows={3}
                    placeholder="Enter observations..."
                    value={inspObs}
                    onChange={(e) => setInspObs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInspectionSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/30"
                >
                  Save Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPROVAL MODAL */}
      <AnimatePresence>
        {showApprovalModal && selectedTaskForModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Multi-Tier Digital Sign-Off
              </h3>
              <p className="text-xs text-slate-400">Target Task: {selectedTaskForModal.title}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Approval Tier</label>
                  <select
                    value={apprTier}
                    onChange={(e) => setApprTier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="FIELD_ENGINEER">FIELD_ENGINEER</option>
                    <option value="SENIOR_CONSULTANT">SENIOR_CONSULTANT</option>
                    <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                    <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Decision</label>
                  <select
                    value={apprDecision}
                    onChange={(e) => setApprDecision(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="REQUESTED_CHANGES">REQUESTED_CHANGES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sign-Off Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Comments..."
                    value={apprComments}
                    onChange={(e) => setApprComments(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalSubmit}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-600/30"
                >
                  Record Sign-Off
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
