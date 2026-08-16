import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  Layers,
  Table as TableIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { ParsedDocument, NodeType } from '../types/document.types';
import { ParsingMetrics } from '../types/parser.types';
import { DocumentValidationReport } from '../types/validation.types';
import { formatBytes } from '../../knowledge_ingestion/utils/fileUtils';

interface DocumentStructureViewerProps {
  document: ParsedDocument;
  metrics?: ParsingMetrics;
  validationReport?: DocumentValidationReport;
}

export const DocumentStructureViewer: React.FC<DocumentStructureViewerProps> = ({
  document: doc,
  metrics,
  validationReport
}) => {
  const [selectedTab, setSelectedTab] = useState<'structure' | 'metadata' | 'validation' | 'metrics'>('structure');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    doc.structure.chapters.length > 0 ? doc.structure.chapters[0].id : null
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden space-y-0 font-mono text-xs">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{doc.fileName}</h3>
            <p className="text-[11px] text-slate-400">
              Doc ID: {doc.documentId} • Hash: {doc.packageHash}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('structure')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              selectedTab === 'structure' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Structure
          </button>
          <button
            onClick={() => setSelectedTab('metadata')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              selectedTab === 'metadata' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setSelectedTab('validation')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              selectedTab === 'validation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Validation
          </button>
          <button
            onClick={() => setSelectedTab('metrics')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              selectedTab === 'metrics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metrics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {selectedTab === 'structure' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Parsed Hierarchy Tree ({doc.structure.chapters.length} Chapters)
              </span>
              <span className="text-[10px] text-slate-400">
                Words: {doc.statistics.totalWords} • Characters: {doc.statistics.totalCharacters}
              </span>
            </div>

            {doc.structure.chapters.length === 0 && doc.structure.unassignedSections.length === 0 ? (
              <p className="text-slate-400 py-4 italic">No structured chapters or sections detected.</p>
            ) : (
              <div className="space-y-3">
                {/* Chapters */}
                {doc.structure.chapters.map((ch) => {
                  const isExpanded = expandedChapterId === ch.id;
                  return (
                    <div
                      key={ch.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 p-3 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                          <span>Chapter {ch.chapterNumber}: {ch.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {ch.sections.length} Sections
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-white dark:bg-slate-900 space-y-3 border-t border-slate-100 dark:border-slate-800">
                          {ch.sections.map((sec) => (
                            <div key={sec.id} className="pl-4 border-l-2 border-blue-500/30 space-y-1.5">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-blue-500" />
                                {sec.title}
                              </h4>
                              <div className="space-y-1 pl-2">
                                {sec.nodes.map((node) => (
                                  <div
                                    key={node.id}
                                    className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800/60"
                                  >
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
                                      <span className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-bold uppercase">
                                        {node.type}
                                      </span>
                                      <span>Order: {node.orderIndex}</span>
                                      {node.pageNumber && <span>Page {node.pageNumber}</span>}
                                    </div>

                                    {node.type === NodeType.PARAGRAPH || node.type === NodeType.HEADING ? (
                                      <p className="text-slate-800 dark:text-slate-200 line-clamp-2">
                                        {node.text}
                                      </p>
                                    ) : node.type === NodeType.TABLE ? (
                                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                        <TableIcon className="w-3.5 h-3.5" />
                                        <span>
                                          Table ({node.rowCount} rows x {node.colCount} cols)
                                        </span>
                                      </div>
                                    ) : node.type === NodeType.IMAGE_REF ? (
                                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Image Ref: {node.imageId}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Unassigned Sections */}
                {doc.structure.unassignedSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/30 space-y-2"
                  >
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Section: {sec.title}
                    </h4>
                    <div className="space-y-1">
                      {sec.nodes.map((node) => (
                        <div
                          key={node.id}
                          className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800"
                        >
                          {'text' in node && typeof node.text === 'string' ? node.text : `[${node.type}]`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'metadata' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
              Extracted Document Metadata
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Title</span>
                <span className="font-semibold text-slate-900 dark:text-white">{doc.metadata.title}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Author</span>
                <span className="font-semibold text-slate-900 dark:text-white">{doc.metadata.author || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Format / Size</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  .{doc.metadata.extension.toUpperCase()} ({formatBytes(doc.metadata.fileSize)})
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Page Count</span>
                <span className="font-semibold text-slate-900 dark:text-white">{doc.metadata.pageCount ?? 'N/A'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Chapter Count</span>
                <span className="font-semibold text-slate-900 dark:text-white">{doc.metadata.chapterCount ?? 'N/A'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Parsed At</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(doc.parsedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'validation' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
              Document Integrity Validation Report
            </h4>
            {validationReport ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {validationReport.isValid ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> VALIDATED PASSED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> VALIDATION ISSUES DETECTED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  {Object.entries(validationReport.checksPerformed).map(([check, status]) => (
                    <div key={check} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{check.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`font-bold ${status ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {status ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No validation report available.</p>
            )}
          </div>
        )}

        {selectedTab === 'metrics' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
              Parsing Execution Metrics
            </h4>
            {metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {metrics.processingTimeMs} ms
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Pages Parsed</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {metrics.pagesParsed}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Chapters / Sections</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {metrics.chaptersFound} / {metrics.sectionsFound}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Parser Version</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {metrics.parserVersion}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No execution metrics available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
