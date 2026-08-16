import React, { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  Server, 
  Database, 
  FileCode2, 
  Layers, 
  AlertTriangle,
  Code
} from "lucide-react";

export const EnterpriseDocumentationGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ADMIN" | "DEPLOY" | "OPS" | "INCIDENT" | "BACKUP" | "UPGRADE" | "ARCH" | "API">("ADMIN");

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>MODULE 14: ENTERPRISE OPERATIONS & ARCHITECTURE GUIDES</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-slate-100">Official URJAFLUX GA Documentation Suite</h2>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-2xl">
            Administrator setup, Cloud Run deployment topology, operational runbooks, backup/upgrade strategies, and exhaustive API reference index.
          </p>
        </div>
      </div>

      {/* Guide Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: "ADMIN", label: "Administrator Guide" },
          { id: "DEPLOY", label: "Deployment Guide" },
          { id: "OPS", label: "Operations Guide" },
          { id: "INCIDENT", label: "Incident Response" },
          { id: "BACKUP", label: "Backup & DR Guide" },
          { id: "UPGRADE", label: "Upgrade Guide" },
          { id: "ARCH", label: "Architecture Summary" },
          { id: "API", label: "API Reference Index" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === t.id ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl font-sans leading-relaxed text-slate-300 space-y-4">
        {activeTab === "ADMIN" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">1. Administrator Setup & Onboarding Guide</h3>
            <p>
              URJAFLUX AI OS is configured for multi-tenant enterprise isolation. Admins manage RBAC credentials, session timeouts, and MFA parameters via the Security & Compliance Panel.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 space-y-1">
              <div># Step 1: Initialize Enterprise Environment Variables</div>
              <div>export GEMINI_API_KEY="AIzaSy..."</div>
              <div>export PORT=3000</div>
              <div>export NODE_ENV="production"</div>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Configuring Single Sign-On (SSO) and OAuth client IDs for Google Workspace integrations.</li>
              <li>Setting default token limits for Knowledge Base vector indexing and Vastu rule evaluations.</li>
              <li>Setting up automated log sinks to Google Cloud Logging or Datadog.</li>
            </ul>
          </div>
        )}

        {activeTab === "DEPLOY" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">2. Production Deployment Topology Guide</h3>
            <p>
              URJAFLUX deploys natively as a containerized web application on Google Cloud Run with an nginx reverse proxy routing all traffic strictly through port 3000.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 space-y-1">
              <div># Container Build & Cloud Run Deploy</div>
              <div>npm run build</div>
              <div>gcloud run deploy urjaflux-ai-os --image gcr.io/urjaflux/app:v2.5.0-GA --port 3000 --min-instances 1 --max-instances 10</div>
            </div>
            <p>
              Multi-Region Architecture: Primary region deployed in Asia-South1 (Mumbai) with warm standby failover in Asia-Southeast1 (Singapore).
            </p>
          </div>
        )}

        {activeTab === "OPS" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">3. Daily Operations & Health Monitoring Guide</h3>
            <p>
              Operations engineers monitor system health using Module 2 High Availability Probes and Module 8 Observability metrics.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Liveness Probe (/api/health/liveness):</strong> Returns HTTP 200 OK when container process is healthy.</li>
              <li><strong>Readiness Probe (/api/health/readiness):</strong> Checks database connectivity and circuit breaker state.</li>
              <li><strong>SLO Target:</strong> 99.9% uptime with p95 response latency under 200ms.</li>
            </ul>
          </div>
        )}

        {activeTab === "INCIDENT" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">4. Incident Response & Triage Runbook</h3>
            <p>
              When a service circuit breaker trips or an error budget burns rapidly, follow these 4 steps:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Inspect Module 8 Observability JSON Log stream for correlated Trace IDs.</li>
              <li>If a backend service is failing continuously, execute <code>highAvailabilityService.triggerAutoRecovery()</code>.</li>
              <li>If the primary region suffers a network partition, execute multi-region failover.</li>
              <li>Switch to Maintenance Mode if schema or state corruption requires database restoration.</li>
            </ol>
          </div>
        )}

        {activeTab === "BACKUP" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">5. Backup & Disaster Recovery Guide</h3>
            <p>
              Automated database and digital twin snapshots are taken continuously. Restore points are verified using SHA-256 checksum comparison.
            </p>
            <p>
              RTO: 15 Minutes • RPO: 5 Minutes. Cross-region backup objects stored in GCS with Coldline lifecycle transition rules.
            </p>
          </div>
        )}

        {activeTab === "UPGRADE" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">6. Zero-Downtime Upgrade & Rollback Strategy</h3>
            <p>
              Schema migrations are strictly backward-compatible. Feature flags allow blue/green incremental rollouts without restarting server processes.
            </p>
            <p>
              Rollback Procedure: If v2.5.0-GA triggers unhandled exceptions, set Feature Flag <code>FF_AUTO_FAILOVER</code> to false and rollback image tag to previous release tag.
            </p>
          </div>
        )}

        {activeTab === "ARCH" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">7. Platform Architecture Summary</h3>
            <p>
              URJAFLUX AI OS combines 5 unified architectural pillars:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">1. Enterprise CAD Platform (2D/3D Vector Engine)</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">2. Enterprise SaaS Platform (Billing & Multi-Tenant)</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">3. Knowledge Intelligence (Vector Rag & Grounding)</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">4. Spatial Intelligence & Digital Twin Platform</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 col-span-1 md:col-span-2">5. GA Operations & Production Hardening Suite</div>
            </div>
          </div>
        )}

        {activeTab === "API" && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono font-bold text-teal-400">8. Exhaustive Platform API Reference Index</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">GET /api/health</span> - Full platform health probes & circuit breaker matrix.
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">POST /api/cad/export/ifc</span> - Converts spatial blueprints to openBIM IFC step files.
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">POST /api/twin/telemetry</span> - Ingests real-time IoT/MQTT sensor telemetry.
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">POST /api/knowledge/query</span> - Grounded RAG query against local vector indices.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
