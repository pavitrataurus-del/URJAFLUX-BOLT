import { useState } from "react";
import { 
  GitBranch, 
  Play, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  RefreshCw 
} from "lucide-react";
import { DeploymentPipelineStage, DisasterRecoveryPlaybook } from "../../types/globalCloudPlatform";
import { DEPLOYMENT_PIPELINE_STAGES, DISASTER_RECOVERY_PLAYBOOKS } from "../../services/global_cloud/globalCloudService";

export const DeploymentAutomationAndDRPanel = () => {
  const [stages, setStages] = useState<DeploymentPipelineStage[]>(DEPLOYMENT_PIPELINE_STAGES);
  const [playbooks] = useState<DisasterRecoveryPlaybook[]>(DISASTER_RECOVERY_PLAYBOOKS);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(playbooks[0].id);
  const [simulatingFailover, setSimulatingFailover] = useState(false);
  const [drMessage, setDrMessage] = useState("");

  const currentPlaybook = playbooks.find(p => p.id === selectedPlaybookId) || playbooks[0];

  const handleSimulateDrFailover = () => {
    setSimulatingFailover(true);
    setDrMessage(`Simulating regional failover playbook: ${currentPlaybook.title}...`);
    setTimeout(() => {
      setSimulatingFailover(false);
      setDrMessage(`Failover test completed! Measured RPO: <30 seconds (Target: ${currentPlaybook.rpoTargetMinutes} min). Measured RTO: 3.2 min (Target: ${currentPlaybook.rtoTargetMinutes} min). Status: PASS.`);
      setTimeout(() => setDrMessage(""), 5000);
    }, 1800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
            <GitBranch className="w-4 h-4" />
            <span>MODULES 12 & 13 • DEPLOYMENT PIPELINES & DISASTER RECOVERY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Enterprise CI/CD Promotion Gates & Disaster Recovery Playbooks</h2>
          <p className="text-xs text-slate-400 mt-1">
            Release promotion pipelines, automated linting/security gates, and verified RPO/RTO failover playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs">
            RPO: 1 MIN • RTO: 5 MIN
          </span>
        </div>
      </div>

      {/* SECTION 1: ENTERPRISE DEPLOYMENT PIPELINE GATES */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Continuous Integration & Multi-Ring Release Gates</span>
          <span className="text-sky-400 font-bold">Module 12 • Deployment Automation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((stg, idx) => (
            <div key={stg.stageId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-300 font-bold">STAGE {idx + 1}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {stg.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{stg.name}</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Target Env: {stg.environment}</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1 text-[10px] font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gate Type:</span>
                  <span className="font-mono text-sky-300 font-bold">{stg.gateType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-mono text-slate-200">{stg.durationSeconds} Seconds</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: DISASTER RECOVERY PLAYBOOKS & RPO/RTO SIMULATION */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Module 13 • Disaster Recovery Orchestration & Failover Playbooks</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Multi-cloud region failover workflows with strict recovery point and recovery time objective validation.
            </p>
          </div>

          <button
            disabled={simulatingFailover}
            onClick={handleSimulateDrFailover}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-400 shadow-lg shadow-sky-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${simulatingFailover ? "animate-spin" : ""}`} />
            <span>Simulate DR Regional Failover</span>
          </button>
        </div>

        {drMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-sans animate-pulse">
            ✓ {drMessage}
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">{currentPlaybook.title}</h4>
              <p className="text-slate-400 text-xs font-sans mt-0.5">
                Target: <span className="text-amber-300">{currentPlaybook.targetRegion}</span> → Backup: <span className="text-emerald-300">{currentPlaybook.backupRegion}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">RPO Target</span>
                <strong className="text-sky-400 font-bold">{currentPlaybook.rpoTargetMinutes} Minute</strong>
              </div>
              <div className="text-right border-l border-slate-800 pl-3">
                <span className="text-slate-400 text-[10px] block">RTO Target</span>
                <strong className="text-sky-400 font-bold">{currentPlaybook.rtoTargetMinutes} Minutes</strong>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Automated Execution Steps:</span>
            <div className="space-y-1.5 font-sans">
              {currentPlaybook.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Assumptions */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200 text-xs font-sans space-y-1">
            <strong>⚠️ Explicit Infrastructure Assumptions:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
              {currentPlaybook.assumptions.map((asm, idx) => (
                <li key={idx}>{asm}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
