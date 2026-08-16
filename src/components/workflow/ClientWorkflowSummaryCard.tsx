import React, { useState, useEffect } from "react";
import {
  Compass,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import {
  workflowService,
  appointmentService,
  taskService
} from "../../services/workflowService";
import { WorkflowRepository } from "../../repositories/workflowRepository";
import { ConsultationWorkflow, ConsultationWorkflowStage } from "../../types/workflow";

interface ClientWorkflowSummaryCardProps {
  clientId: string;
}

export default function ClientWorkflowSummaryCard({ clientId }: ClientWorkflowSummaryCardProps) {
  const [workflow, setWorkflow] = useState<ConsultationWorkflow | null>(null);

  useEffect(() => {
    if (!clientId) return;
    const wf = workflowService.getOrCreateWorkflowForIdentity(clientId);
    setWorkflow(wf);
  }, [clientId]);

  if (!workflow) return null;

  const repo = WorkflowRepository.getInstance();
  const appointments = repo.getAppointmentsByIdentity(clientId).filter(a => a.status === "SCHEDULED" || a.status === "RESCHEDULED");
  const pendingTasks = repo.getTasksByIdentity(clientId).filter(t => t.status !== "COMPLETED");
  const consultations = repo.getConsultationsByIdentity(clientId);

  const stageLabels: Record<ConsultationWorkflowStage, string> = {
    VISITOR: "Visitor",
    LEAD_CREATED: "Lead Created",
    IDENTITY_VERIFIED: "Identity Verified",
    FREE_ANALYSIS: "Free Analysis",
    CONSULTATION_REQUESTED: "Requested",
    CONSULTATION_SCHEDULED: "Scheduled",
    CONSULTATION_CONFIRMED: "Confirmed",
    CONSULTATION_IN_PROGRESS: "In Progress",
    ANALYSIS_COMPLETE: "Analysis Complete",
    REPORT_DRAFT: "Drafting Report",
    REPORT_REVIEWED: "Report Reviewed",
    REPORT_DELIVERED: "Report Delivered",
    REMEDY_TRACKING: "Remedy Tracking",
    FOLLOW_UP_SCHEDULED: "Follow-Up Scheduled",
    FOLLOW_UP_COMPLETED: "Follow-Up Completed",
    ANNUAL_REVIEW: "Annual Review",
    REPEAT_CONSULTATION: "Repeat Client"
  };

  const currentStageState = workflow.stagesState[workflow.currentStage];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Header and Tally */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Client Lifecycle Workflow Summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time lifecycle monitoring & checkpoint verification</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Progress</span>
            <span className="text-lg font-extrabold text-emerald-950">{workflow.overallProgress}%</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center font-bold text-xs text-emerald-950">
            {workflow.overallProgress}%
          </div>
        </div>
      </div>

      {/* Stepper Grid showing neighborhood stages */}
      <div className="space-y-3">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Stage Checkpoint</span>
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                {workflow.currentStage}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{stageLabels[workflow.currentStage]}</h4>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400">Tasks verified:</span>
            <span className="font-bold text-slate-800 block">
              {currentStageState?.checklist.filter(c => c.done).length} of {currentStageState?.checklist.length}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist, Appointments, Recommendations columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Prerequisite checklist */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Stage Verification Items
          </span>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {currentStageState?.checklist.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded text-xs">
                <span className={`font-semibold ${c.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {c.item}
                </span>
                {c.done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Slotted Appointments
          </span>
          {appointments.length === 0 ? (
            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-xs text-slate-400 italic">
              No future calls slots scheduled.
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map(a => (
                <div key={a.id} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs">
                  <div className="font-bold text-slate-900">{a.date} at {a.time}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Mode: {a.mode} • Ref: {a.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Recommendation notes */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Core Recommendations
          </span>
          {consultations.length === 0 ? (
            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-center text-xs text-slate-400 italic">
              No recommendations formulated yet.
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/20 border border-emerald-100 rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-900 block truncate">Outcome: {consultations[0].outcome}</span>
              {consultations[0].recommendations.length > 0 && (
                <p className="text-[10px] text-slate-600 font-mono line-clamp-3">
                  👉 {consultations[0].recommendations[0]}
                </p>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
