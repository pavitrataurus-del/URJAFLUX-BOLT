import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  Layers,
  Settings,
  FileCode
} from 'lucide-react';
import { parserRegistry } from '../services/ParserRegistry';
import { documentParserService } from '../services/DocumentParserService';
import { useDocumentParser } from '../hooks/useDocumentParser';
import { DocumentStructureViewer } from './DocumentStructureViewer';

export const ParsingEngineDashboard: React.FC = () => {
  const allParsers = parserRegistry.getAllParsers();
  const config = documentParserService.getConfig();
  const { parsedDocuments, lastResult } = useDocumentParser();

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    parsedDocuments.length > 0 ? parsedDocuments[0].documentId : null
  );

  const activeDoc = parsedDocuments.find((d) => d.documentId === selectedDocId);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                DOCUMENT PARSING ENGINE
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategy-Based Universal Document Parser Layer • BUILD-017B.1 Production Readiness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {allParsers.length} Strategy Parsers Active
            </span>
          </div>
        </div>
      </div>

      {/* Registered Strategy Parsers & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parsers List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Registered Document Parsers Strategy Registry ({allParsers.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {allParsers.map((parser) => (
              <div
                key={parser.parserId}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {parser.parserId}
                  </span>
                  <span className="text-[10px] text-slate-400">v{parser.parserVersion}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {parser.capabilities.supportedExtensions.map((ext) => (
                    <span
                      key={ext}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase"
                    >
                      .{ext}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-1 pt-1">
                  <span>Metadata: {parser.capabilities.hasMetadataExtraction ? '✓' : '✗'}</span>
                  <span>Text: {parser.capabilities.hasTextExtraction ? '✓' : '✗'}</span>
                  <span>Tables: {parser.capabilities.hasTableExtraction ? '✓' : '✗'}</span>
                  <span>Images: {parser.capabilities.hasImageExtraction ? '✓' : '✗'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            Parser Configuration
          </h3>

          <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Max Pages:</span>
              <span className="font-bold">{config.maxPages}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Max Memory:</span>
              <span className="font-bold">{config.maxMemoryMB} MB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Max Timeout:</span>
              <span className="font-bold">{config.maxParsingTimeMs / 1000}s</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Table Extraction:</span>
              <span className="font-bold text-emerald-600">{config.extractTables ? 'ENABLED' : 'DISABLED'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Image Extraction:</span>
              <span className="font-bold text-emerald-600">{config.extractImages ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parsed Documents Inspection Area */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Parsed Document Inspector ({parsedDocuments.length})
        </h3>

        {parsedDocuments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
            No parsed documents in cache. Select or parse a document from the Ingestion Workspace.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Document Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {parsedDocuments.map((d) => (
                <button
                  key={d.documentId}
                  onClick={() => setSelectedDocId(d.documentId)}
                  className={`px-3 py-1.5 rounded-lg border font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    selectedDocId === d.documentId
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {d.fileName}
                </button>
              ))}
            </div>

            {/* Active Document Viewer */}
            {activeDoc && (
              <DocumentStructureViewer
                document={activeDoc}
                metrics={lastResult?.metrics}
                validationReport={lastResult?.validationReport}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
