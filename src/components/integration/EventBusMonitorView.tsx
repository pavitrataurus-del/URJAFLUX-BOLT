// Module 3: Event Bus & Dead Letter Queue Monitor UI
import React, { useState } from "react";
import {
  Zap,
  Activity,
  AlertOctagon,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";
import { BusEvent, DeadLetterQueueItem } from "../../types/integrationPlatform";
import { EnterpriseEventBus } from "../../core/integration/EnterpriseEventBus";

export const EventBusMonitorView: React.FC = () => {
  const [events, setEvents] = useState<BusEvent[]>(() => EnterpriseEventBus.getEventHistory());
  const [dlq, setDlq] = useState<DeadLetterQueueItem[]>(() => EnterpriseEventBus.getDeadLetterQueue());
  const [metrics, setMetrics] = useState(() => EnterpriseEventBus.getQueueMetrics());
  const [publishTopic, setPublishTopic] = useState<string>("project.imported");
  const [publishPayload, setPublishPayload] = useState<string>('{"projectId": "PRJ-9901", "file": "Floorplan.dxf"}');

  const refreshAll = () => {
    setEvents(EnterpriseEventBus.getEventHistory());
    setDlq(EnterpriseEventBus.getDeadLetterQueue());
    setMetrics(EnterpriseEventBus.getQueueMetrics());
  };

  const handleReplayDlq = (dlqId: string) => {
    EnterpriseEventBus.replayDeadLetterItem(dlqId);
    refreshAll();
  };

  const handlePublishEvent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(publishPayload);
      EnterpriseEventBus.publish(publishTopic, "MANUAL_UI_TESTER", parsed, "tenant_org_01", "HIGH");
      refreshAll();
    } catch (err) {
      alert("Invalid JSON payload.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              Module 3
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Priority Pub/Sub Queue
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise Event Bus & Dead Letter Queue (DLQ)
          </h2>
          <p className="text-xs text-slate-300">
            Real-time event topic routing, correlation tracking, priority queues, and dead-letter replay controls.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Total Events Processed</span>
          <span className="text-2xl font-extrabold text-slate-900 block">{metrics.totalProcessed}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">High Priority Queue</span>
          <span className="text-2xl font-extrabold text-amber-600 block">{metrics.high}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Normal/Low Queue</span>
          <span className="text-2xl font-extrabold text-indigo-600 block">{metrics.normal + metrics.low}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Dead Letter Queue (DLQ)</span>
          <span className="text-2xl font-extrabold text-rose-600 block">{metrics.dlqDepth}</span>
        </div>
      </div>

      {/* Publish Event Form */}
      <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" /> Dispatch Test Event
        </h3>

        <form onSubmit={handlePublishEvent} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Topic Name</label>
            <input
              type="text"
              value={publishTopic}
              onChange={(e) => setPublishTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Payload (JSON)</label>
            <input
              type="text"
              value={publishPayload}
              onChange={(e) => setPublishPayload(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Publish to Event Bus
            </button>
          </div>
        </form>
      </div>

      {/* Dead Letter Queue Inspector */}
      {dlq.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" /> Dead Letter Queue (DLQ Items Needing Attention)
          </h3>

          <div className="space-y-2">
            {dlq.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-950">{item.event.topic}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px]">{item.id}</span>
                  </div>
                  <p className="text-rose-800 text-xs mt-1">Reason: {item.failureReason}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === "REPLAYED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-200 text-rose-900"
                  }`}>
                    {item.status}
                  </span>

                  {item.status !== "REPLAYED" && (
                    <button
                      onClick={() => handleReplayDlq(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Replay Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Stream History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> Live Event Stream History
        </h3>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Event ID</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Publisher</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Correlation ID</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{evt.id}</td>
                  <td className="p-3 text-indigo-700 font-sans font-semibold">{evt.topic}</td>
                  <td className="p-3 text-slate-600 font-sans">{evt.publisher}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                      evt.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {evt.priority}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{evt.correlationId}</td>
                  <td className="p-3 text-slate-400 text-[11px] font-sans">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
