// ============================================================================
// URJAFLUX AI OS - Founder Knowledge Console (FKC)
// Module: FounderReviewEditorView (Granular Review & Interactive Knowledge Editor)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  IIngestionPipelinePackage,
  IExtractedEntity,
  IExtractedRelationship,
  EntityType,
  IngestionRelationshipType,
} from '../../knowledge_ingestion/types/universalIngestion.types';
import { universalIngestionEngine } from '../../knowledge_ingestion/services/UniversalIngestionEngine';
import { universalDomainIntelligenceFramework } from '../../udif/UniversalDomainIntelligenceFramework';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  Edit3,
  Plus,
  Trash2,
  Save,
  Link,
  Tag,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';

interface FounderReviewEditorViewProps {
  initialPackageId?: string;
  userRole?: 'ADMIN' | 'END_USER';
  onBackToInbox?: () => void;
}

export const FounderReviewEditorView: React.FC<FounderReviewEditorViewProps> = ({
  initialPackageId,
  userRole = 'ADMIN',
  onBackToInbox,
}) => {
  const [packages, setPackages] = useState<IIngestionPipelinePackage[]>(() =>
    universalIngestionEngine.getAllPackages(userRole)
  );
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackageId || packages[0]?.id || ''
  );

  const [activeTab, setActiveTab] = useState<'entities' | 'relationships' | 'normalizations'>('entities');

  // Currently editing entity
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [entityEditForm, setEntityEditForm] = useState<{
    name: string;
    canonicalName: string;
    entityType: EntityType;
    canonicalId: string;
    attributes: Array<{ key: string; value: string }>;
  }>({ name: '', canonicalName: '', entityType: 'ZONE', canonicalId: '', attributes: [] });

  // Currently editing relationship
  const [editingRelId, setEditingRelId] = useState<string | null>(null);
  const [relEditForm, setRelEditForm] = useState<{
    relationshipType: IngestionRelationshipType;
    weight: number;
    evidenceText: string;
  }>({ relationshipType: 'SUPPORTS', weight: 0.9, evidenceText: '' });

  const currentPkg = packages.find((p) => p.id === selectedPkgId);

  const canonicalEntitiesList = universalDomainIntelligenceFramework.listCanonicalEntities();

  useEffect(() => {
    if (initialPackageId) {
      setSelectedPkgId(initialPackageId);
    }
  }, [initialPackageId]);

  const refreshData = () => {
    const updated = universalIngestionEngine.getAllPackages(userRole);
    setPackages(updated);
  };

  // Start editing entity
  const startEditEntity = (entity: IExtractedEntity) => {
    setEditingEntityId(entity.id);
    const attrs = Object.entries(entity.attributes || {}).map(([key, value]) => ({ key, value }));
    setEntityEditForm({
      name: entity.name,
      canonicalName: entity.canonicalName,
      entityType: entity.entityType,
      canonicalId: (entity as any).canonicalId || '',
      attributes: attrs,
    });
  };

  // Save entity changes
  const saveEntityEdit = (entityId: string) => {
    if (!selectedPkgId) return;
    const newAttrsObj: Record<string, string> = {};
    entityEditForm.attributes.forEach((item) => {
      if (item.key.trim()) {
        newAttrsObj[item.key.trim()] = item.value;
      }
    });

    universalIngestionEngine.updateEntity(
      selectedPkgId,
      entityId,
      {
        name: entityEditForm.name,
        canonicalName: entityEditForm.canonicalName,
        entityType: entityEditForm.entityType,
        attributes: newAttrsObj,
      },
      'Founder Editor'
    );

    setEditingEntityId(null);
    refreshData();
  };

  // Add attribute field in edit form
  const addAttributeField = () => {
    setEntityEditForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  };

  // Remove attribute field in edit form
  const removeAttributeField = (index: number) => {
    setEntityEditForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, idx) => idx !== index),
    }));
  };

  // Start editing relationship
  const startEditRelationship = (rel: IExtractedRelationship) => {
    setEditingRelId(rel.id);
    setRelEditForm({
      relationshipType: rel.relationshipType,
      weight: rel.weight,
      evidenceText: rel.evidenceText,
    });
  };

  // Save relationship changes
  const saveRelationshipEdit = (relId: string) => {
    if (!selectedPkgId) return;
    universalIngestionEngine.updateRelationship(
      selectedPkgId,
      relId,
      {
        relationshipType: relEditForm.relationshipType,
        weight: relEditForm.weight,
        evidenceText: relEditForm.evidenceText,
      },
      'Founder Editor'
    );
    setEditingRelId(null);
    refreshData();
  };

  // Approval actions
  const handleApprovePackage = () => {
    if (!selectedPkgId) return;
    universalIngestionEngine.approvePackage(selectedPkgId, 'Founder Admin', 'Approved via Granular Editor');
    refreshData();
  };

  const handleRejectPackage = () => {
    if (!selectedPkgId) return;
    universalIngestionEngine.rejectPackage(selectedPkgId, 'Founder Admin', 'Rejected via Granular Editor');
    refreshData();
  };

  const handleSyncToGraph = () => {
    if (!selectedPkgId) return;
    universalIngestionEngine.syncPackageToKnowledgeGraph(selectedPkgId);
    refreshData();
  };

  if (!currentPkg) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-400 p-6">
        <FileSearch className="w-12 h-12 text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-200">No knowledge package selected for review.</p>
        <p className="text-xs text-slate-500 mt-1">Select a document from the Founder Inbox to start granular review.</p>
        {onBackToInbox && (
          <button
            onClick={onBackToInbox}
            className="mt-4 px-4 py-2 bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Back to Founder Inbox
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HEADER / SELECTOR BAR */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToInbox && (
            <button
              onClick={onBackToInbox}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded transition-colors flex items-center gap-1"
            >
              ← Inbox
            </button>
          )}

          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileSearch className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-md truncate"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    [{pkg.metadata.domain}] Package #{pkg.id.slice(0, 8)} ({pkg.metadata.approvalStatus})
                  </option>
                ))}
              </select>

              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400 font-bold">
                Quality {currentPkg.quality.overallQualityScore}% ({currentPkg.quality.qualityGrade})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular entity, relationship, and attribute editor without altering raw extraction source.
            </p>
          </div>
        </div>

        {/* WORKFLOW APPROVAL ACTIONS */}
        <div className="flex items-center gap-2">
          {currentPkg.metadata.approvalStatus !== 'APPROVED' && (
            <button
              onClick={handleApprovePackage}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Package
            </button>
          )}

          {currentPkg.metadata.approvalStatus !== 'REJECTED' && (
            <button
              onClick={handleRejectPackage}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-slate-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject Package
            </button>
          )}

          <button
            onClick={handleSyncToGraph}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-4 h-4" /> Sync to Knowledge Graph
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="px-6 bg-slate-900/60 border-b border-slate-800 flex items-center gap-4 text-xs font-mono shrink-0">
        <button
          onClick={() => setActiveTab('entities')}
          className={`py-2.5 border-b-2 font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'entities'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" /> Extracted Entities ({currentPkg.entities.length})
        </button>

        <button
          onClick={() => setActiveTab('relationships')}
          className={`py-2.5 border-b-2 font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'relationships'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link className="w-3.5 h-3.5" /> Relationships ({currentPkg.relationships.length})
        </button>

        <button
          onClick={() => setActiveTab('normalizations')}
          className={`py-2.5 border-b-2 font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'normalizations'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Normalizations ({currentPkg.normalizations.length})
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ENTITIES TAB */}
        {activeTab === 'entities' && (
          <div className="space-y-3">
            {currentPkg.entities.map((ent) => {
              const isEditing = editingEntityId === ent.id;

              return (
                <div
                  key={ent.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700"
                >
                  {isEditing ? (
                    /* EDITING FORM */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-mono text-slate-400">Entity Name</label>
                          <input
                            type="text"
                            value={entityEditForm.name}
                            onChange={(e) => setEntityEditForm({ ...entityEditForm, name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400">Canonical Name</label>
                          <input
                            type="text"
                            value={entityEditForm.canonicalName}
                            onChange={(e) => setEntityEditForm({ ...entityEditForm, canonicalName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400">Entity Type</label>
                          <select
                            value={entityEditForm.entityType}
                            onChange={(e) => setEntityEditForm({ ...entityEditForm, entityType: e.target.value as EntityType })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="ZONE">ZONE</option>
                            <option value="ROOM">ROOM</option>
                            <option value="DIRECTION">DIRECTION</option>
                            <option value="ELEMENT">ELEMENT</option>
                            <option value="REMEDY">REMEDY</option>
                            <option value="PLANET">PLANET</option>
                            <option value="NUMBER">NUMBER</option>
                            <option value="OBJECT">OBJECT</option>
                            <option value="CHAKRA">CHAKRA</option>
                            <option value="MANTRA">MANTRA</option>
                          </select>
                        </div>
                      </div>

                      {/* CANONICAL MAPPING SELECTOR */}
                      <div>
                        <label className="text-[11px] font-mono text-slate-400">
                          UDIF Canonical Concept Link (Canonical ID)
                        </label>
                        <select
                          value={entityEditForm.canonicalId}
                          onChange={(e) => setEntityEditForm({ ...entityEditForm, canonicalId: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">-- No Canonical Mapping --</option>
                          {canonicalEntitiesList.map((c) => (
                            <option key={c.canonicalId} value={c.canonicalId}>
                              [{c.canonicalType}] {c.canonicalId} — {c.canonicalName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ATTRIBUTES EDITOR */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-mono text-slate-400">Attributes (Key-Value)</label>
                          <button
                            type="button"
                            onClick={addAttributeField}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] rounded flex items-center gap-1 font-bold"
                          >
                            <Plus className="w-3 h-3" /> Add Attribute
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {entityEditForm.attributes.map((attr, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Key (e.g. Element)"
                                value={attr.key}
                                onChange={(e) => {
                                  const updated = [...entityEditForm.attributes];
                                  updated[idx].key = e.target.value;
                                  setEntityEditForm({ ...entityEditForm, attributes: updated });
                                }}
                                className="w-1/3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g. Water)"
                                value={attr.value}
                                onChange={(e) => {
                                  const updated = [...entityEditForm.attributes];
                                  updated[idx].value = e.target.value;
                                  setEntityEditForm({ ...entityEditForm, attributes: updated });
                                }}
                                className="w-2/3 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttributeField(idx)}
                                className="p-1 text-rose-400 hover:bg-rose-950 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setEditingEntityId(null)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEntityEdit(ent.id)}
                          className="px-3 py-1 bg-emerald-600 text-slate-950 text-xs rounded font-bold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW DISPLAY */
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-[10px] font-bold">
                            {ent.entityType}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100">{ent.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">
                            ({ent.canonicalName})
                          </span>
                        </div>

                        {/* Attribute Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {Object.entries(ent.attributes || {}).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                            >
                              <strong className="text-emerald-400">{k}:</strong> {v}
                            </span>
                          ))}
                        </div>

                        {/* Raw Extraction Source Text */}
                        <p className="text-xs text-slate-400 italic pt-1 border-l-2 border-slate-700 pl-2">
                          "{ent.rawText}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-emerald-400">
                          Confidence: {Math.round(ent.confidence * 100)}%
                        </span>
                        <button
                          onClick={() => startEditEntity(ent)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RELATIONSHIPS TAB */}
        {activeTab === 'relationships' && (
          <div className="space-y-3">
            {currentPkg.relationships.map((rel) => {
              const isEditing = editingRelId === rel.id;

              return (
                <div key={rel.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono text-slate-400">Relationship Type</label>
                          <select
                            value={relEditForm.relationshipType}
                            onChange={(e) =>
                              setRelEditForm({
                                ...relEditForm,
                                relationshipType: e.target.value as IngestionRelationshipType,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="SUPPORTS">SUPPORTS</option>
                            <option value="BALANCES">BALANCES</option>
                            <option value="BLOCKS">BLOCKS</option>
                            <option value="AFFECTS">AFFECTS</option>
                            <option value="LOCATED_IN">LOCATED_IN</option>
                            <option value="ASSOCIATED_WITH">ASSOCIATED_WITH</option>
                            <option value="CONFLICTS_WITH">CONFLICTS_WITH</option>
                            <option value="REMEDIED_BY">REMEDIED_BY</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400">Relationship Weight (0 - 1.0)</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            value={relEditForm.weight}
                            onChange={(e) =>
                              setRelEditForm({ ...relEditForm, weight: parseFloat(e.target.value) || 0.5 })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400">Evidence Text</label>
                        <textarea
                          rows={2}
                          value={relEditForm.evidenceText}
                          onChange={(e) => setRelEditForm({ ...relEditForm, evidenceText: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setEditingRelId(null)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveRelationshipEdit(rel.id)}
                          className="px-3 py-1 bg-emerald-600 text-slate-950 text-xs rounded font-bold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Relationship
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{rel.sourceEntityName}</span>
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px] font-bold">
                            {rel.relationshipType} ({rel.weight})
                          </span>
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-slate-100">{rel.targetEntityName}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic font-mono pl-2 border-l-2 border-slate-700">
                          "{rel.evidenceText}"
                        </p>
                      </div>

                      <button
                        onClick={() => startEditRelationship(rel)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-1 transition-colors self-start md:self-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NORMALIZATIONS TAB */}
        {activeTab === 'normalizations' && (
          <div className="space-y-3">
            {currentPkg.normalizations.map((norm) => (
              <div
                key={norm.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Raw Term:</span>
                    <span className="font-bold text-amber-300">{norm.rawTerm}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-400 font-mono">Canonical Term:</span>
                    <span className="font-bold text-emerald-400">{norm.suggestedCanonicalTerm}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    Synonyms: {norm.synonyms.join(', ')} • Score: {Math.round(norm.similarityScore * 100)}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      norm.status === 'Approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {norm.status}
                  </span>

                  {norm.status !== 'Approved' && (
                    <button
                      onClick={() => {
                        universalIngestionEngine.approveNormalization(
                          currentPkg.id,
                          norm.id,
                          'Founder Admin'
                        );
                        refreshData();
                      }}
                      className="px-2.5 py-1 bg-emerald-600 text-slate-950 text-xs font-bold rounded hover:bg-emerald-500"
                    >
                      Approve Term
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
