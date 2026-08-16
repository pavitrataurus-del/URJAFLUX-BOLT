// Module 9: Background Job Queue & Worker Pool Monitor UI
import React, { useState } from "react";
import {
  Server,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  Play,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { BackgroundJob, WorkerPoolNode } from "../../types/integrationPlatform";
import { BackgroundJobSystem } from "../../core/integration/BackgroundJobSystem";

export const BackgroundJobQueueMonitor: React.FC = () => {
  const [jobs, setJobs] = useState<BackgroundJob[]>(() => BackgroundJobSystem.getJobs());
  const [workers, setWorkers] = useState<WorkerPoolNode[]>(() => BackgroundJobSystem.getWorkerPool());
  const [jobType, setJobType] = useState<string>("GEO_SPATIAL_MAGNETIC_COMPUTE");

  const refreshAll = () => {
    setJobs(BackgroundJobSystem.getJobs());
    setWorkers(BackgroundJobSystem.getWorkerPool());
  };

  const handleEnqueueJob = (e: React.FormEvent) => {
    e.preventDefault();
    BackgroundJobSystem.enqueueJob("tenant_org_01", jobType, { projectId: "PRJ-CAD-8801" }, "HIGH");
    refreshAll();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Module 9
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Worker Pool Cluster
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Background Job Queue & Distributed Worker Nodes
          </h2>
          <p className="text-xs text-slate-300">
            Priority job dispatch, cron schedules, worker node allocation, and processing latency telemetry.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Enqueue Form */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" /> Dispatch Background Compute Job
        </h3>

        <form onSubmit={handleEnqueueJob} className="flex gap-3">
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="GEO_SPATIAL_MAGNETIC_COMPUTE">GEO_SPATIAL_MAGNETIC_COMPUTE</option>
            <option value="BULK_KNOWLEDGE_DENSE_EMBEDDING">BULK_KNOWLEDGE_DENSE_EMBEDDING</option>
            <option value="PDF_REPORT_RASTERIZE">PDF_REPORT_RASTERIZE</option>
            <option value="NIGHTLY_CAD_SYNCHRONIZATION">NIGHTLY_CAD_SYNCHRONIZATION</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Enqueue Job
          </button>
        </form>
      </div>

      {/* Worker Pool Nodes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" /> Distributed Worker Node Cluster ({workers.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((w) => (
            <div key={w.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 truncate">{w.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  w.status === "BUSY" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {w.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Current Job: {w.currentJobId || "None (Idle)"}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Completed: {w.jobsCompleted}</span>
                <span>Uptime: {Math.floor(w.uptimeSeconds / 86400)} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Queue Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Job Queue & Schedules</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Job ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Cron Schedule</th>
                <th className="p-3">Worker Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{j.id}</td>
                  <td className="p-3 font-sans text-indigo-700 font-semibold">{j.jobType}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                      j.priority === "CRITICAL" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {j.priority}
                    </span>
                  </td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      j.status === "RUNNING" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{j.cronExpression || "Immediate"}</td>
                  <td className="p-3 text-slate-600 font-sans">{j.workerId || "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
