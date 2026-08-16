import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Globe,
  QrCode,
  Layers,
  Calendar,
  User,
  ExternalLink,
  Award,
  ChevronRight
} from 'lucide-react';
import { IReport, ExportFormat } from '../../core/reports/ReportTypes';
import { ReportExportEngine } from '../../core/reports/ReportExportEngine';
import { ReportLocalizationEngine } from '../../core/reports/ReportLocalizationEngine';
import { ReportVariableResolver } from '../../core/reports/ReportVariableResolver';

interface ReportPreviewModalProps {
  report: IReport | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  isOpen,
  onClose,
  onExport
}) => {
  if (!isOpen || !report) return null;

  const loc = ReportLocalizationEngine.getInstance().getTranslations(report.metadata.language);
  const b = report.branding;
  const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'CITATIONS' | 'ATTACHMENTS' | 'METADATA'>('DOCUMENT');

  const handlePrint = () => {
    const htmlContent = ReportExportEngine.getInstance().generateHtmlPrintExport(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {report.reportNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  v{report.version}.0
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  report.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {report.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 line-clamp-1">
                {report.metadata.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition"
              title="Print Document Layout"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print / PDF</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['PDF', 'MARKDOWN', 'JSON', 'HTML'] as ExportFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => onExport(fmt)}
                  className="px-2.5 py-1 text-xs font-semibold rounded hover:bg-emerald-600 hover:text-white text-slate-300 transition"
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-Bar */}
        <div className="px-6 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('DOCUMENT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'DOCUMENT'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document View</span>
            </button>
            <button
              onClick={() => setActiveTab('CITATIONS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'CITATIONS'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Citations Vault ({report.allCitations?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('ATTACHMENTS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'ATTACHMENTS'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Media Attachments ({report.attachments?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('METADATA')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'METADATA'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Metadata & Traceability</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Language: <span className="uppercase text-slate-200">{report.metadata.language}</span></span>
          </div>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
          {activeTab === 'DOCUMENT' && (
            <div className="bg-white text-slate-900 rounded-xl p-8 shadow-xl max-w-4xl mx-auto border border-slate-200 relative">
              {/* Report Header Branding */}
              <div
                className="pb-6 mb-6 border-b-2 flex justify-between items-start"
                style={{ borderColor: b.primaryColor }}
              >
                <div>
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: b.primaryColor, fontFamily: b.fontFamily }}
                  >
                    {b.companyName}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{b.headerText}</p>
                </div>
                {b.logoUrl && (
                  <img
                    src={b.logoUrl}
                    alt="Company Logo"
                    className="h-12 w-auto object-contain rounded-md"
                  />
                )}
              </div>

              {/* Title & Metadata Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {report.metadata.reportType.replace(/_/g, ' ')}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-2">
                      {report.metadata.title}
                    </h2>
                    {report.metadata.subtitle && (
                      <p className="text-xs text-slate-600 mt-1">{report.metadata.subtitle}</p>
                    )}
                  </div>
                  {b.showQrCode && (
                    <div className="text-center bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
                      <QrCode className="w-12 h-12 text-slate-700 mx-auto" />
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">Scan to Verify</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Property</span>
                    <span className="font-semibold text-slate-800">{report.metadata.propertyName || 'Tech Park HQ'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Author</span>
                    <span className="font-semibold text-slate-800">{report.metadata.authorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Generated Date</span>
                    <span className="font-semibold text-slate-800">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Approval Status</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="bg-emerald-50/60 border-l-4 border-emerald-600 p-4 rounded-r-lg mb-8 text-xs">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  {loc.tableOfContentsTitle}
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                  {report.sections.map(sec => (
                    <li key={sec.sectionId}>
                      <a href={`#sec-${sec.sectionKey}`} className="hover:underline hover:text-emerald-800">
                        {sec.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Render Sections */}
              <div className="space-y-8 relative">
                {b.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.03]">
                    <span className="text-6xl font-black tracking-widest rotate-45 uppercase text-slate-900 select-none">
                      {b.watermarkText}
                    </span>
                  </div>
                )}

                {report.sections.filter(s => s.isVisible).map((sec, idx) => (
                  <div key={sec.sectionId} id={`sec-${sec.sectionKey}`} className="scroll-mt-6 border-b border-slate-100 pb-6 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-slate-800 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                        {idx + 1}.0
                      </span>
                      <h3 className="text-lg font-bold text-slate-800">{ReportVariableResolver.resolve(sec.title, report)}</h3>
                    </div>

                    {sec.blocks && sec.blocks.length > 0 ? (
                      <div className="space-y-4">
                        {sec.blocks.filter(b => b.isVisible).map((block) => {
                          const resolvedContent = typeof block.content === 'string'
                            ? ReportVariableResolver.resolve(block.content, report)
                            : block.content;

                          return (
                            <div key={block.blockId} className="text-slate-800">
                              {block.type === 'HEADING' && (
                                <h4 className="text-sm font-bold text-slate-900 mt-4 mb-1 pb-1 border-b border-slate-100" style={{ color: b.primaryColor, fontFamily: b.fontFamily }}>
                                  {resolvedContent}
                                </h4>
                              )}

                              {block.type === 'PARAGRAPH' && (
                                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{resolvedContent}</p>
                              )}

                              {block.type === 'CHECKLIST' && Array.isArray(resolvedContent) && (
                                <ul className="space-y-1.5 my-2 pl-1">
                                  {resolvedContent.map((item: any, iIdx: number) => (
                                    <li key={iIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 font-bold ${item.completed ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'border-slate-300 bg-white'}`}>
                                        {item.completed ? '✓' : ''}
                                      </span>
                                      <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                                        {item.label}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {block.type === 'TABLE' && resolvedContent && (
                                <div className="overflow-x-auto my-3 border border-slate-200 rounded-lg">
                                  <table className="w-full text-left text-xs text-slate-700">
                                    <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold">
                                      <tr>
                                        {resolvedContent.headers?.map((h: string, hIdx: number) => (
                                          <th key={hIdx} className="p-2 border-b border-slate-200">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {resolvedContent.rows?.map((row: string[], rIdx: number) => (
                                        <tr key={rIdx} className="hover:bg-slate-50 border-b border-slate-100">
                                          {row.map((cell: string, cIdx: number) => (
                                            <td key={cIdx} className="p-2 text-slate-600">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {block.type === 'REMEDY' && (
                                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3.5 my-3 text-xs space-y-2">
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-mono">
                                    Quantum Remedial Alignment
                                  </span>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <span className="text-slate-400 font-medium block">Zone Location</span>
                                      <span className="font-bold text-slate-800">{resolvedContent.zone}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-medium block">Shastric Citation</span>
                                      <span className="font-semibold text-indigo-800 italic">{resolvedContent.citation}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-slate-400 font-medium block">Detected Spatial Defect</span>
                                      <span className="font-medium text-slate-700">{resolvedContent.defect}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-slate-400 font-medium block">Bio-Harmonic Remedy Plan</span>
                                      <span className="font-semibold text-emerald-700">{resolvedContent.remedy}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {block.type === 'CHAKRA' && (
                                <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5 my-3 text-xs flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: resolvedContent.color || '#f43f5e' }}>
                                    ♥
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-slate-800 text-xs">{resolvedContent.name}</span>
                                      <span className="font-mono text-slate-500 text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                        {resolvedContent.frequency}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-semibold text-rose-700">Status: {resolvedContent.status}</div>
                                    <p className="text-slate-600 leading-normal">{resolvedContent.description}</p>
                                  </div>
                                </div>
                              )}

                              {block.type === 'COMPASS' && (
                                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 my-3 text-xs flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center font-mono font-bold text-amber-700 bg-white">
                                    N
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between font-bold text-slate-800">
                                      <span>Facing: {resolvedContent.facingDirection}</span>
                                      <span className="text-amber-700">{resolvedContent.offsetDegrees}° Deviation</span>
                                    </div>
                                    <p className="text-slate-600 mt-0.5">Calibration: {resolvedContent.status}</p>
                                  </div>
                                </div>
                              )}

                              {block.type === 'QUOTE' && (
                                <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/30 px-3 py-2 rounded-r-xl italic my-3 text-xs text-slate-600">
                                  <p>"{resolvedContent.text}"</p>
                                  <cite className="block text-[9px] font-bold text-emerald-600 mt-1 not-italic">— {resolvedContent.source}</cite>
                                </blockquote>
                              )}

                              {block.type === 'ALERT' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-2 text-xs flex gap-2 text-amber-800">
                                  <span>⚠</span>
                                  <p className="font-semibold">{resolvedContent.message}</p>
                                </div>
                              )}

                              {block.type === 'IMAGE' && (
                                <div className="my-3 text-center">
                                  <img src={resolvedContent.url} alt="preview" className="max-h-52 object-cover rounded-xl mx-auto border border-slate-200 shadow-sm" referrerPolicy="no-referrer" />
                                  {resolvedContent.caption && <span className="text-[10px] text-slate-400 italic block mt-1">{resolvedContent.caption}</span>}
                                </div>
                              )}

                              {block.type === 'PAGE_BREAK' && (
                                <div className="h-px bg-slate-200 border-dashed border-t my-6"></div>
                              )}

                              {block.type === 'SIGNATURE' && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 max-w-xs ml-auto">
                                  <div className="font-mono text-slate-800 text-xs italic tracking-wider font-bold border-b border-slate-200 pb-1 flex items-center justify-between">
                                    <span>{resolvedContent.name}</span>
                                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{resolvedContent.role}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700 space-y-3">
                        {ReportVariableResolver.resolve(sec.contentMarkdown, report).split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.startsWith('### ')) {
                            return <h4 key={pIdx} className="text-sm font-bold text-slate-900 mt-4 mb-1">{paragraph.replace('### ', '')}</h4>;
                          }
                          if (paragraph.startsWith('#### ')) {
                            return <h5 key={pIdx} className="text-xs font-bold text-emerald-800 mt-3 mb-1">{paragraph.replace('#### ', '')}</h5>;
                          }
                          if (paragraph.startsWith('- ')) {
                            return (
                              <ul key={pIdx} className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                                {paragraph.split('\n').map((item, iIdx) => (
                                  <li key={iIdx}>{item.replace('- ', '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={pIdx}>{paragraph}</p>;
                        })}
                      </div>
                    )}

                    {/* Section Embedded Citations */}
                    {sec.citations && sec.citations.length > 0 && (
                      <div className="mt-4 bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs">
                        <span className="font-bold text-amber-900 block mb-1">
                          📜 {loc.citationsTitle}
                        </span>
                        <ul className="space-y-2">
                          {sec.citations.map((c, cIdx) => (
                            <li key={cIdx} className="text-slate-700">
                              <span className="font-semibold text-amber-800">[{c.domain}] {c.sourceBook}</span>{' '}
                              <span className="text-slate-500">({c.chapterVerse || ''})</span> — Truth Score: <span className="font-mono text-emerald-700 font-bold">{c.reliabilityScore}%</span>
                              {c.excerptText && (
                                <p className="italic text-amber-900 border-l-2 border-amber-400 pl-2 mt-1 bg-white/60 p-1.5 rounded">
                                  "{c.excerptText}"
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* White Label Stamp Overlay & Digital Verification signatures (Part 6) */}
              {(b.stampUrl || b.digitalSignatureUrl) && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end text-xs">
                  {b.digitalSignatureUrl && (
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Digital Integrity Hash</span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 block w-max">
                        {b.digitalSignatureUrl}
                      </span>
                    </div>
                  )}

                  {b.stampUrl && (
                    <div className="text-center">
                      <img
                        src={b.stampUrl}
                        alt="Verification Stamp"
                        className="h-16 w-auto object-contain mx-auto mix-blend-multiply opacity-90"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-slate-500 font-mono font-bold block mt-1">URJAFLUX CERTIFIED STAMP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Report Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                <p>{b.footerText}</p>
                <p className="mt-0.5">Verified Sthapatya Veda & Bio-Energy Report • URJAFLUX AI OS Enterprise</p>
              </div>
            </div>
          )}

          {activeTab === 'CITATIONS' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Canonical Manuscript & Scripture References Vault
                </h3>
                <p className="text-xs text-slate-400">
                  Every recommendation and analysis in this document is cross-validated against canonical scriptures and verified by the Truth Engine.
                </p>
              </div>

              <div className="grid gap-3">
                {report.allCitations?.map((c, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {c.domain}
                        </span>
                        <span className="text-sm font-semibold text-white">{c.sourceBook}</span>
                        {c.chapterVerse && <span className="text-xs text-slate-400">({c.chapterVerse})</span>}
                      </div>
                      {c.author && <p className="text-xs text-slate-400">Author / Sage: <span className="text-slate-200">{c.author}</span></p>}
                      {c.excerptText && (
                        <p className="text-xs italic text-amber-200/90 bg-amber-500/10 border-l-2 border-amber-400 px-3 py-1.5 rounded mt-2">
                          "{c.excerptText}"
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Truth Engine Score</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">{c.reliabilityScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ATTACHMENTS' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Linked Media & Site Verification Attachments
                </h3>
                <p className="text-xs text-slate-400">
                  High-resolution photographic evidence, 3D spatial grid views, and IoT sensor telemetry charts linked directly to source domains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.attachments?.map((att, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="relative h-48 bg-slate-950 overflow-hidden">
                      <img
                        src={att.assetUrl}
                        alt={att.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                        {att.sourceDomain}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{att.title}</h4>
                        {att.description && <p className="text-xs text-slate-400 mt-1">{att.description}</p>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800 flex justify-between">
                        <span>{att.caption || `Figure ${idx + 1}`}</span>
                        <span>{new Date(att.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'METADATA' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Enterprise Traceability & Immutable Audit Metadata
                </h3>
                <p className="text-xs text-slate-400">
                  All report properties are cryptographically versioned and tracked under URJAFLUX AI OS governance policies.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">UUID</span>
                    <span className="font-mono text-slate-200 text-[11px]">{report.uuid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Report Number</span>
                    <span className="font-mono text-emerald-400 font-semibold">{report.reportNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Version Number</span>
                    <span className="font-mono text-slate-200">v{report.version}.0</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Created By</span>
                    <span className="text-slate-200">{report.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Approved By</span>
                    <span className="text-emerald-400 font-medium">{report.approvedBy || 'Pending Approval'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Export Jobs Count</span>
                    <span className="font-mono text-slate-200">{report.exportJobsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Verified Document Engine Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Close Preview
            </button>
            <button
              onClick={() => onExport('PDF')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
