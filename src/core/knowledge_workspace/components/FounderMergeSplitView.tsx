// ============================================================================
// URJAFLUX AI OS - Founder Knowledge Console (FKC)
// Module: FounderMergeSplitView (Knowledge Merge & Knowledge Split Studio)
// ============================================================================

import React, { useState } from 'react';
import {
  IIngestionPipelinePackage,
} from '../../knowledge_ingestion/types/universalIngestion.types';
import { universalIngestionEngine } from '../../knowledge_ingestion/services/UniversalIngestionEngine';
import {
  GitMerge,
  Split,
  Layers,
  CheckCircle2,
  ArrowRight,
  History,
  FileText,
} from 'lucide-react';

interface FounderMergeSplitViewProps {
  initialPackageId?: string;
  userRole?: 'ADMIN' | 'END_USER';
}

export const FounderMergeSplitView: React.FC<FounderMergeSplitViewProps> = ({
  initialPackageId,
  userRole = 'ADMIN',
}) => {
  const [packages, setPackages] = useState<IIngestionPipelinePackage[]>(() =>
    universalIngestionEngine.getAllPackages(userRole)
  );

  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackageId || packages[0]?.id || ''
  );

  const [studioMode, setStudioMode] = useState<'merge' | 'split'>('merge');

  // --- MERGE STATE ---
  const [primaryEntityId, setPrimaryEntityId] = useState<string>('');
  const [selectedSecondaryIds, setSelectedSecondaryIds] = useState<string[]>([]);
  const [mergedNameOverride, setMergedNameOverride] = useState<string>('');

  // --- SPLIT STATE ---
  const [splitSourceEntityId, setSplitSourceEntityId] = useState<string>('');
  const [newSplitEntityName, setNewSplitEntityName] = useState<string>('');
  const [moveAttributeKeys, setMoveAttributeKeys] = useState<string[]>([]);
  const [moveRelationshipIds, setMoveRelationshipIds] = useState<string[]>([]);

  // Status notification
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentPkg = packages.find((p) => p.id === selectedPkgId);

  const refreshData = () => {
    const updated = universalIngestionEngine.getAllPackages(userRole);
    setPackages(updated);
  };

  // Execute Merge
  const handleExecuteMerge = () => {
    if (!selectedPkgId || !primaryEntityId || selectedSecondaryIds.length === 0) {
      setStatusMessage('Please select a primary entity and at least one secondary entity to merge.');
      return;
    }

    const success = universalIngestionEngine.mergeEntities(
      selectedPkgId,
      primaryEntityId,
      selectedSecondaryIds,
      'Founder Admin',
      mergedNameOverride.trim() || undefined
    );

    if (success) {
      setStatusMessage(`Successfully merged ${selectedSecondaryIds.length} entities into primary entity.`);
      setSelectedSecondaryIds([]);
      setMergedNameOverride('');
      refreshData();
    } else {
      setStatusMessage('Failed to execute entity merge. Please check your selections.');
    }
  };

  // Execute Split
  const handleExecuteSplit = () => {
    if (!selectedPkgId || !splitSourceEntityId || !newSplitEntityName.trim()) {
      setStatusMessage('Please select a source entity and enter a name for the new split entity.');
      return;
    }

    const sourceEntity = currentPkg?.entities.find((e) => e.id === splitSourceEntityId);
    if (!sourceEntity) return;

    const moveAttrsMap: Record<string, string> = {};
    moveAttributeKeys.forEach((key) => {
      if (sourceEntity.attributes[key]) {
        moveAttrsMap[key] = sourceEntity.attributes[key];
      }
    });

    const newEntity = universalIngestionEngine.splitEntity(
      selectedPkgId,
      splitSourceEntityId,
      newSplitEntityName.trim(),
      moveAttrsMap,
      moveRelationshipIds,
      'Founder Admin'
    );

    if (newEntity) {
      setStatusMessage(`Successfully created split entity '${newEntity.name}' (${newEntity.id}).`);
      setNewSplitEntityName('');
      setMoveAttributeKeys([]);
      setMoveRelationshipIds([]);
      refreshData();
    } else {
      setStatusMessage('Failed to execute entity split.');
    }
  };

  const selectedSplitEntity = currentPkg?.entities.find((e) => e.id === splitSourceEntityId);
  const selectedSplitRels = currentPkg?.relationships.filter(
    (r) => r.sourceEntityId === splitSourceEntityId || r.targetEntityId === splitSourceEntityId
  ) || [];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitMerge className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100">Knowledge Merge & Split Studio</span>
              <select
                value={selectedPkgId}
                onChange={(e) => {
                  setSelectedPkgId(e.target.value);
                  setPrimaryEntityId('');
                  setSelectedSecondaryIds([]);
                  setSplitSourceEntityId('');
                }}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    [{pkg.metadata.domain}] {pkg.metadata.title || pkg.fileName}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Refine extracted ontology graph by merging duplicates or splitting composite entities with full audit preservation.
            </p>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setStudioMode('merge')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-bold ${
              studioMode === 'merge'
                ? 'bg-cyan-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" /> Merge Knowledge
          </button>
          <button
            onClick={() => setStudioMode('split')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-bold ${
              studioMode === 'split'
                ? 'bg-cyan-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" /> Split Knowledge
          </button>
        </div>
      </div>

      {/* NOTIFICATION MESSAGE */}
      {statusMessage && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between shrink-0">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-300 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* STUDIO CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        {!currentPkg ? (
          <div className="text-center py-12 text-slate-500 text-sm">No package available.</div>
        ) : studioMode === 'merge' ? (
          /* ==================== MERGE STUDIO ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* PRIMARY ENTITY SELECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. Primary Entity (Target)
              </h3>
              <p className="text-xs text-slate-400">
                Select the main entity that will absorb attributes & re-routed relationships.
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {currentPkg.entities.map((ent) => (
                  <label
                    key={ent.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      primaryEntityId === ent.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-slate-100'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="primaryEntity"
                        checked={primaryEntityId === ent.id}
                        onChange={() => {
                          setPrimaryEntityId(ent.id);
                          setSelectedSecondaryIds((prev) => prev.filter((id) => id !== ent.id));
                        }}
                        className="text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold">{ent.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ent.entityType} • {ent.canonicalName}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* SECONDARY ENTITIES SELECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-cyan-400" /> 2. Secondary Entities (To Merge)
              </h3>
              <p className="text-xs text-slate-400">
                Select duplicate entities to merge into the primary entity.
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {currentPkg.entities
                  .filter((e) => e.id !== primaryEntityId)
                  .map((ent) => {
                    const isChecked = selectedSecondaryIds.includes(ent.id);
                    return (
                      <label
                        key={ent.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-cyan-950/60 border-cyan-500 text-slate-100'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSecondaryIds([...selectedSecondaryIds, ent.id]);
                              } else {
                                setSelectedSecondaryIds(selectedSecondaryIds.filter((id) => id !== ent.id));
                              }
                            }}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <div>
                            <div className="font-bold">{ent.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{ent.entityType} • {ent.canonicalName}</div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* MERGE PREVIEW & EXECUTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <GitMerge className="w-4 h-4 text-emerald-400" /> 3. Preview & Execute Merge
              </h3>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Optional Merged Name Override</label>
                <input
                  type="text"
                  placeholder="Leave blank to keep primary name"
                  value={mergedNameOverride}
                  onChange={(e) => setMergedNameOverride(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Merge Summary
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Secondaries ({selectedSecondaryIds.length}):</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">
                    {primaryEntityId
                      ? currentPkg.entities.find((e) => e.id === primaryEntityId)?.name
                      : 'None Selected'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleExecuteMerge}
                disabled={!primaryEntityId || selectedSecondaryIds.length === 0}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <GitMerge className="w-4 h-4" /> Execute Entity Merge
              </button>
            </div>
          </div>
        ) : (
          /* ==================== SPLIT STUDIO ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* SOURCE ENTITY SELECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Split className="w-4 h-4 text-cyan-400" /> 1. Select Composite Entity
              </h3>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {currentPkg.entities.map((ent) => (
                  <label
                    key={ent.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      splitSourceEntityId === ent.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-slate-100'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="splitEntity"
                        checked={splitSourceEntityId === ent.id}
                        onChange={() => {
                          setSplitSourceEntityId(ent.id);
                          setMoveAttributeKeys([]);
                          setMoveRelationshipIds([]);
                        }}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold">{ent.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {ent.entityType} • {Object.keys(ent.attributes || {}).length} Attributes
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* SPLIT CONFIGURATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-emerald-400" /> 2. Split Configuration
              </h3>

              <div>
                <label className="text-[11px] font-mono text-slate-400">New Split Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sub-Component B"
                  value={newSplitEntityName}
                  onChange={(e) => setNewSplitEntityName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {selectedSplitEntity && (
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400">Attributes to Move to New Entity</label>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5 max-h-44 overflow-y-auto">
                    {Object.entries(selectedSplitEntity.attributes || {}).map(([key, val]) => {
                      const isChecked = moveAttributeKeys.includes(key);
                      return (
                        <label key={key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setMoveAttributeKeys([...moveAttributeKeys, key]);
                              else setMoveAttributeKeys(moveAttributeKeys.filter((k) => k !== key));
                            }}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <span className="font-mono text-emerald-400 font-bold">{key}:</span> {val}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SPLIT RELATIONSHIPS & EXECUTE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Split className="w-4 h-4 text-cyan-400" /> 3. Migrate Relationships & Execute
              </h3>

              {selectedSplitRels.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400">Relationships to Migrate</label>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5 max-h-44 overflow-y-auto">
                    {selectedSplitRels.map((rel) => {
                      const isChecked = moveRelationshipIds.includes(rel.id);
                      return (
                        <label key={rel.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setMoveRelationshipIds([...moveRelationshipIds, rel.id]);
                              else setMoveRelationshipIds(moveRelationshipIds.filter((id) => id !== rel.id));
                            }}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                          <span className="font-mono text-cyan-400">{rel.relationshipType}</span> → {rel.targetEntityName}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleExecuteSplit}
                disabled={!splitSourceEntityId || !newSplitEntityName.trim()}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Split className="w-4 h-4" /> Execute Entity Split
              </button>
            </div>
          </div>
        )}

        {/* AUDIT LOG TRAIL */}
        {currentPkg?.auditLogs && currentPkg.auditLogs.length > 0 && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Preserved Audit Log Trail
            </h4>
            <div className="space-y-1 text-xs font-mono">
              {currentPkg.auditLogs.map((log) => (
                <div key={log.id} className="p-2 bg-slate-950 border border-slate-850 rounded flex justify-between items-center">
                  <div>
                    <span className="text-emerald-400 font-bold">[{log.actionType}]</span> {log.details}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {log.importer} • {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
