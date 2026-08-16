import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Layers,
  Palette,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Shield,
  Send,
  AlertCircle,
  Lock,
  Unlock,
  Copy,
  FolderOpen,
  MessageSquare,
  History,
  Image as ImageIcon,
  Compass as CompassIcon,
  CheckSquare,
  HelpCircle,
  Grid,
  Heart,
  User,
  Workflow,
  Heading as HeadingIcon,
  Quote,
  SeparatorHorizontal,
  ChevronDown,
  ChevronRight,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import {
  IReport,
  IReportSectionData,
  IReportBlock,
  BlockType,
  ReportStatus,
  LanguageCode,
  UserRole,
  IReportVersion,
  IReportComment,
  IReportAttachment
} from '../../core/reports/ReportTypes';
import { ReportRegistry } from '../../core/reports/ReportRegistry';
import { ReportBrandingEngine } from '../../core/reports/ReportBrandingEngine';
import { ReportLocalizationEngine } from '../../core/reports/ReportLocalizationEngine';
import { ReportVariableResolver } from '../../core/reports/ReportVariableResolver';
import { useTranslation } from '../../localization/hooks/useTranslation';
import { mapToReportLanguageCode } from '../../localization/languageBridge';

interface ReportBuilderWorkspaceProps {
  report: IReport;
  userRole: UserRole;
  onReportUpdated: (updatedReport: IReport) => void;
  onOpenPreview: () => void;
}

export const ReportBuilderWorkspace: React.FC<ReportBuilderWorkspaceProps> = ({
  report,
  userRole: initialUserRole,
  onReportUpdated,
  onOpenPreview
}) => {
  // Support dynamic local testing of roles/permissions (Part 12)
  const [activeRole, setActiveRole] = useState<UserRole>(initialUserRole);
  const { reportLanguage: userReportLanguage } = useTranslation();

  const [sections, setSections] = useState<IReportSectionData[]>(report.sections || []);
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.sectionId || '');
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'BRANDING' | 'LOCALIZATION' | 'VERSIONS' | 'COMMENTS' | 'MEDIA'>('SECTIONS');
  const [branding, setBranding] = useState(report.branding);
  const [language, setLanguage] = useState<LanguageCode>(
    report.metadata.language || mapToReportLanguageCode(userReportLanguage)
  );
  
  // Pipeline history timeline (Part 2)
  const [pipelineEvents, setPipelineEvents] = useState<any[]>([]);

  // Version Control (Part 9)
  const [versions, setVersions] = useState<IReportVersion[]>(report.versions || []);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [comparedVersionId, setComparedVersionId] = useState<string | null>(null);

  // Review Comments (Part 10)
  const [comments, setComments] = useState<IReportComment[]>(report.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSectionFilter, setCommentSectionFilter] = useState<string>('ALL');
  const [commentHighlightText, setCommentHighlightText] = useState('');

  // Media Manager (Part 8)
  const [attachments, setAttachments] = useState<IReportAttachment[]>(report.attachments || []);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'FLOOR_PLAN' | 'PROPERTY_PHOTO' | 'CAD_SCREENSHOT' | 'PDF_ATTACHMENT'>('PROPERTY_PHOTO');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active section helper
  const activeSection = sections.find(s => s.sectionId === activeSectionId) || sections[0];

  // RBAC permissions helper
  const hasEditPermission = activeRole !== 'VIEWER' && activeRole !== 'REVIEWER' && report.status !== 'ARCHIVED';
  const hasApprovePermission = activeRole === 'ADMIN' || activeRole === 'APPROVER' || activeRole === 'PROJECT_MANAGER';

  useEffect(() => {
    // Generate initial timeline based on report status
    const initialEvents = [
      { id: 'ev-1', stage: 'DRAFT', date: report.createdAt, desc: 'Report initialized as DRAFT.' }
    ];
    if (report.status !== 'DRAFT') {
      initialEvents.push({ id: 'ev-2', stage: 'REVIEW', date: report.updatedAt, desc: 'Submitted for internal review.' });
    }
    if (report.status === 'APPROVED' || report.status === 'DELIVERED') {
      initialEvents.push({ id: 'ev-3', stage: 'APPROVED', date: report.updatedAt, desc: 'Enterprise report approved.' });
    }
    setPipelineEvents(initialEvents);
  }, [report.createdAt, report.updatedAt, report.status]);

  // Update layout changes on save
  const handleSaveWorkspace = (customNotes?: string) => {
    if (!hasEditPermission) {
      setErrorMsg('Error: Your current role does not have permission to modify this report.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    try {
      const registry = ReportRegistry.getInstance();
      
      // Update local storage / registry state
      const updatedReport = {
        ...report,
        sections,
        branding,
        attachments,
        versions,
        comments,
        updatedAt: new Date().toISOString()
      };

      // Push a new version snapshot to version history (Part 9)
      const newVersionNum = (versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) : 1) + 1;
      const newSnapshot: IReportVersion = {
        versionId: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        versionNumber: newVersionNum,
        timestamp: new Date().toISOString(),
        author: report.metadata.authorName,
        revisionNotes: customNotes || revisionNotes || `Auto-saved updates to section order and content.`,
        sectionsSnapshot: JSON.parse(JSON.stringify(sections)),
        brandingSnapshot: { ...branding }
      };

      const updatedVersions = [newSnapshot, ...versions];
      setVersions(updatedVersions);
      updatedReport.versions = updatedVersions;

      // Persist status audits
      registry.updateReportSections(report.id, sections, report.metadata.authorName, activeRole);
      registry.updateReportBranding(report.id, branding, report.metadata.authorName, activeRole);

      onReportUpdated(updatedReport);
      setSaveSuccessMsg(`Saved Successfully! Created Version v${newVersionNum}.0`);
      setRevisionNotes('');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  // Status stage progression (Part 2)
  const handlePipelineStatusChange = (newStatus: ReportStatus) => {
    if (newStatus === 'APPROVED' && !hasApprovePermission) {
      setErrorMsg('Error: Your current role does not have permission to approve reports.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    const registry = ReportRegistry.getInstance();
    const updated = registry.updateReportStatus(report.id, newStatus, report.metadata.authorName, activeRole);
    
    // Add to timeline
    const newEv = {
      id: `ev-${Date.now()}`,
      stage: newStatus,
      date: new Date().toISOString(),
      desc: `Status updated to ${newStatus} by ${report.metadata.authorName} (${activeRole}).`
    };
    setPipelineEvents([newEv, ...pipelineEvents]);

    onReportUpdated({
      ...report,
      status: newStatus,
      reportStatus: newStatus,
      updatedAt: new Date().toISOString()
    });

    setSaveSuccessMsg(`Workflow stage updated to ${newStatus}.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Section manipulation (Part 3)
  const handleAddSection = () => {
    const sectionId = `sec-custom-${Date.now()}`;
    const newSec: IReportSectionData = {
      sectionId,
      sectionKey: 'CUSTOM_SECTION',
      title: 'New Custom Report Section',
      orderIndex: sections.length + 1,
      isVisible: true,
      isLocked: false,
      isCollapsed: false,
      contentMarkdown: '### Enter custom layout content or drag blocks here...',
      blocks: [
        {
          blockId: `blk-${Date.now()}-1`,
          type: 'HEADING',
          content: 'New Section Header',
          isVisible: true,
          isLocked: false,
          orderIndex: 1
        },
        {
          blockId: `blk-${Date.now()}-2`,
          type: 'PARAGRAPH',
          content: 'This section contains default workspace documentation. Add more blocks to enrich.',
          isVisible: true,
          isLocked: false,
          orderIndex: 2
        }
      ]
    };

    const updated = [...sections, newSec];
    setSections(updated);
    setActiveSectionId(sectionId);
  };

  const handleDuplicateSection = (sec: IReportSectionData) => {
    const sectionId = `sec-dup-${Date.now()}`;
    const duplicated: IReportSectionData = {
      ...JSON.parse(JSON.stringify(sec)),
      sectionId,
      title: `${sec.title} (Copy)`,
      orderIndex: sections.length + 1
    };
    setSections([...sections, duplicated]);
    setActiveSectionId(sectionId);
  };

  const handleRemoveSection = (secId: string) => {
    const filtered = sections.filter(s => s.sectionId !== secId);
    // Reindex
    filtered.forEach((s, idx) => s.orderIndex = idx + 1);
    setSections(filtered);
    if (activeSectionId === secId && filtered.length > 0) {
      setActiveSectionId(filtered[0].sectionId);
    }
  };

  const toggleSectionLock = (secId: string) => {
    setSections(sections.map(s => s.sectionId === secId ? { ...s, isLocked: !s.isLocked } : s));
  };

  const toggleSectionCollapse = (secId: string) => {
    setSections(sections.map(s => s.sectionId === secId ? { ...s, isCollapsed: !s.isCollapsed } : s));
  };

  const toggleSectionVisibility = (secId: string) => {
    setSections(sections.map(s => s.sectionId === secId ? { ...s, isVisible: !s.isVisible } : s));
  };

  const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === sections.length - 1)) {
      return;
    }
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((s, idx) => (s.orderIndex = idx + 1));
    setSections(newSections);
  };

  const handleSectionTitleChange = (newTitle: string) => {
    setSections(sections.map(s => s.sectionId === activeSectionId ? { ...s, title: newTitle } : s));
  };

  // Block level controls (Part 4 & Part 5)
  const handleAddBlock = (type: BlockType) => {
    if (!activeSection) return;
    if (activeSection.isLocked) {
      setErrorMsg('This section is locked and cannot be edited.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    let content: any = 'Default Block Text';
    if (type === 'CHECKLIST') {
      content = [
        { label: 'Brahmasthan cleared from heavy steel structures', completed: true },
        { label: 'Installed copper remedies in South-East zone', completed: false },
        { label: 'Placed green indoor plants in East balcony', completed: true }
      ];
    } else if (type === 'TABLE') {
      content = {
        headers: ['Zone', 'Compass Direction', 'Element', 'Status'],
        rows: [
          ['Ishan', 'North-East', 'Water', 'Optimized'],
          ['Agneya', 'South-East', 'Fire', 'Remedy Placed'],
          ['Nairutya', 'South-West', 'Earth', 'Heavy/Defect']
        ]
      };
    } else if (type === 'REMEDY') {
      content = {
        zone: 'North-East (NE)',
        defect: 'Toilet or Kitchen blockage in cosmic grid corner',
        remedy: 'Install Zinc Pyramid plate and place aromatic sea salts',
        citation: 'Mayamatam Vastu Shastra Chapter 12'
      };
    } else if (type === 'CHAKRA') {
      content = {
        name: 'Anahata (Heart Chakra)',
        frequency: '528 Hz',
        status: 'Blocked/Diminished',
        color: '#10b981',
        description: 'Bio-field requires green emerald prisms and soft string acoustics to clear geo-pathic stress.'
      };
    } else if (type === 'COMPASS') {
      content = {
        offsetDegrees: 12,
        facingDirection: 'North-North-East',
        status: 'Magnetic Deviation detected',
        calibrationScore: 92
      };
    } else if (type === 'CHART') {
      content = {
        title: 'Geopathic Biofield Resonance',
        labels: ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'],
        values: [88, 92, 74, 68, 62, 79, 81, 95]
      };
    } else if (type === 'IMAGE' || type === 'FLOOR_PLAN') {
      content = {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        caption: 'Figure: 2D Spatial Layout & Grid Calibration'
      };
    } else if (type === 'GALLERY') {
      content = [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&auto=format&fit=crop&q=80'
      ];
    } else if (type === 'QUOTE') {
      content = {
        text: 'Where spatial alignments perfectly harmonize with cosmic electromagnetic currents, health, peace, and abundance reside.',
        source: 'Samarangana Sutradhara Verse 4.12'
      };
    } else if (type === 'ALERT') {
      content = {
        type: 'WARNING',
        message: 'Severe magnetic distortion found in South-West zone. Metal storage racks must be relocated.'
      };
    } else if (type === 'SIGNATURE') {
      content = {
        name: branding.consultantName || 'Dr. Rajesh Sharma',
        role: branding.consultantRole || 'Lead Space Alchemist',
        verified: true
      };
    }

    const newBlock: IReportBlock = {
      blockId: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      content,
      isVisible: true,
      isLocked: false,
      orderIndex: (activeSection.blocks?.length || 0) + 1
    };

    const updatedBlocks = [...(activeSection.blocks || []), newBlock];
    setSections(sections.map(s => s.sectionId === activeSectionId ? { ...s, blocks: updatedBlocks } : s));
  };

  const handleUpdateBlockContent = (blockId: string, updatedContent: any) => {
    if (!activeSection) return;
    const updatedBlocks = (activeSection.blocks || []).map(b => 
      b.blockId === blockId ? { ...b, content: updatedContent } : b
    );
    setSections(sections.map(s => s.sectionId === activeSectionId ? { ...s, blocks: updatedBlocks } : s));
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!activeSection) return;
    const filtered = (activeSection.blocks || []).filter(b => b.blockId !== blockId);
    filtered.forEach((b, idx) => b.orderIndex = idx + 1);
    setSections(sections.map(s => s.sectionId === activeSectionId ? { ...s, blocks: filtered } : s));
  };

  const moveBlock = (index: number, direction: 'UP' | 'DOWN') => {
    if (!activeSection || !activeSection.blocks) return;
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === activeSection.blocks.length - 1)) {
      return;
    }
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const newBlocks = [...activeSection.blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    newBlocks.forEach((b, idx) => b.orderIndex = idx + 1);
    setSections(sections.map(s => s.sectionId === activeSectionId ? { ...s, blocks: newBlocks } : s));
  };

  // Version control restore (Part 9)
  const handleRestoreVersion = (version: IReportVersion) => {
    setSections(version.sectionsSnapshot);
    if (version.brandingSnapshot) {
      setBranding(version.brandingSnapshot);
    }
    setSaveSuccessMsg(`Restored Report to Version v${version.versionNumber}.0!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Comments (Part 10)
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const newComment: IReportComment = {
      commentId: `com-${Date.now()}`,
      sectionId: commentSectionFilter === 'ALL' ? undefined : commentSectionFilter,
      author: report.metadata.authorName,
      authorRole: activeRole,
      text: newCommentText,
      timestamp: new Date().toISOString(),
      isResolved: false,
      highlightedText: commentHighlightText || undefined
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setCommentHighlightText('');
  };

  const toggleCommentResolve = (comId: string) => {
    setComments(comments.map(c => c.commentId === comId ? { ...c, isResolved: !c.isResolved } : c));
  };

  // Media Manager (Part 8)
  const handleAddMedia = () => {
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) return;

    const newMedia: IReportAttachment = {
      attachmentId: `att-${Date.now()}`,
      attachmentType: newMediaType === 'FLOOR_PLAN' ? 'FLOOR_PLAN' : 
                      newMediaType === 'CAD_SCREENSHOT' ? 'CAD_SCREENSHOT' : 
                      newMediaType === 'PDF_ATTACHMENT' ? 'PDF_ATTACHMENT' : 'PROPERTY_PHOTO',
      title: newMediaTitle,
      description: `Uploaded media supporting spatial audit report analysis.`,
      assetUrl: newMediaUrl,
      sourceDomain: 'Enterprise Report Media Store',
      timestamp: new Date().toISOString()
    };

    setAttachments([newMedia, ...attachments]);
    setNewMediaTitle('');
    setNewMediaUrl('');
  };

  // Preset theme customizer (Part 6)
  const applyPresetTheme = (themeBranding: Partial<typeof branding>) => {
    const updatedBranding = { ...branding, ...themeBranding };
    setBranding(updatedBranding);
  };

  const presetThemes = ReportBrandingEngine.getInstance().getPresetThemes();

  // Calculate Insights metrics (Part 15)
  const calculateInsights = () => {
    const totalWords = sections.reduce((sum, s) => sum + (s.contentMarkdown?.length || 0), 0);
    const estPages = Math.max(1, Math.ceil(totalWords / 450) + (activeSection?.blocks?.filter(b => b.type === 'PAGE_BREAK').length || 0));
    
    const imageBlocks = sections.reduce((sum, s) => sum + (s.blocks?.filter(b => b.type === 'IMAGE' || b.type === 'GALLERY' || b.type === 'FLOOR_PLAN').length || 0), 0);
    const totalImages = imageBlocks + attachments.length;

    const unresolvedComments = comments.filter(c => !c.isResolved).length;

    // Check critical sections
    const hasCover = sections.some(s => s.sectionKey === 'COVER_PAGE');
    const hasTOC = sections.some(s => s.sectionKey === 'TABLE_OF_CONTENTS');
    const hasSig = sections.some(s => s.sectionKey === 'SIGNATURE');

    let completeness = 0;
    let missingDataList: string[] = [];
    if (!hasCover) missingDataList.push('Cover Page missing');
    if (!hasTOC) missingDataList.push('Table of Contents missing');
    if (!hasSig) missingDataList.push('Approver Signature block missing');
    
    const visibleSections = sections.filter(s => s.isVisible).length;
    completeness = Math.round((visibleSections / Math.max(1, sections.length)) * 100);

    let readiness = 100;
    if (unresolvedComments > 0) readiness -= unresolvedComments * 5;
    if (!hasCover) readiness -= 15;
    if (!hasSig) readiness -= 15;
    readiness = Math.max(15, readiness);

    return {
      pages: estPages,
      sectionsCount: sections.length,
      imagesCount: totalImages,
      pendingComments: unresolvedComments,
      missingData: missingDataList,
      readinessScore: readiness,
      completenessPercent: completeness
    };
  };

  const insights = calculateInsights();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Header & Role Sandbox Control (Part 12 Role-Based) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {report.reportNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              v{versions.length > 0 ? versions[0].versionNumber : 1}.0
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {report.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">{report.metadata.title}</h2>
          <p className="text-xs text-slate-400">
            Property ID: <span className="text-slate-200 font-medium">{report.propertyId}</span> • Last Updated: {new Date(report.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Permission Sandbox Toggle (Part 12 Demonstration) */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mr-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-2">Role Sandbox:</span>
            {(['OWNER', 'EDITOR', 'REVIEWER', 'VIEWER'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                  activeRole === role ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenPreview}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Studio Preview</span>
          </button>

          <button
            onClick={() => handleSaveWorkspace()}
            disabled={!hasEditPermission}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              hasEditPermission 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Notifications bar */}
      {(saveSuccessMsg || errorMsg) && (
        <div className="flex flex-col gap-2">
          {saveSuccessMsg && (
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Part 15: Real-time Studio Insights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Pages</span>
          <span className="text-lg font-extrabold text-slate-200">{insights.pages}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Sections</span>
          <span className="text-lg font-extrabold text-slate-200">{insights.sectionsCount}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Media Assets</span>
          <span className="text-lg font-extrabold text-slate-200">{insights.imagesCount}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pending Comments</span>
          <span className={`text-lg font-extrabold ${insights.pendingComments > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {insights.pendingComments}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Completeness</span>
          <span className="text-lg font-extrabold text-emerald-400">{insights.completenessPercent}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Readiness Score</span>
          <span className="text-lg font-extrabold text-teal-400">{insights.readinessScore}/100</span>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'SECTIONS' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Report Outline & Canvas</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'BRANDING' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>White-Label & Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('MEDIA')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'MEDIA' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Media & Attachments ({attachments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VERSIONS')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'VERSIONS' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Versions History ({versions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMMENTS')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'COMMENTS' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Review Comments ({comments.filter(c => !c.isResolved).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOCALIZATION')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
            activeTab === 'LOCALIZATION' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Localization (EN / HI)</span>
        </button>
      </div>

      {/* Main Studio Views */}
      {activeTab === 'SECTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Multilevel Drag/Reorder Section Outliner (Part 3) */}
          <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-emerald-400" />
                <span>Document Sections</span>
              </h3>
              <button
                onClick={handleAddSection}
                disabled={!hasEditPermission}
                className="p-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                title="Add Section block"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isSelected = sec.sectionId === activeSectionId;
                return (
                  <div key={sec.sectionId} className="space-y-1">
                    <div
                      onClick={() => setActiveSectionId(sec.sectionId)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-slate-500">{idx + 1}</span>
                        {sec.isLocked ? (
                          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                        )}
                        <span className="font-medium truncate">{sec.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, 'UP'); }}
                          disabled={idx === 0 || !hasEditPermission}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, 'DOWN'); }}
                          disabled={idx === sections.length - 1 || !hasEditPermission}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.sectionId); }}
                          className={`p-1 rounded hover:bg-slate-800 ${sec.isVisible ? 'text-emerald-400' : 'text-slate-600'}`}
                          title={sec.isVisible ? 'Hide section' : 'Show section'}
                        >
                          {sec.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSectionLock(sec.sectionId); }}
                          className={`p-1 rounded hover:bg-slate-800 ${sec.isLocked ? 'text-amber-500' : 'text-slate-600'}`}
                        >
                          {sec.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateSection(sec); }}
                          disabled={!hasEditPermission}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSection(sec.sectionId); }}
                          disabled={!hasEditPermission || sec.isLocked}
                          className="p-1 rounded hover:bg-slate-800 text-rose-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline Stage Controller (Part 2) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3 mt-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-4.5 h-4.5 text-indigo-400" />
                <span>Workflow Pipeline</span>
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'DELIVERED', 'REVISED', 'ARCHIVED'] as ReportStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handlePipelineStatusChange(status)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                      report.status === status 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Dynamic Timeline Stream */}
              <div className="border-t border-slate-800/60 pt-3 mt-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Audit Timeline Events</span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {pipelineEvents.map(ev => (
                    <div key={ev.id} className="text-[10px] border-l-2 border-emerald-500 pl-2 py-0.5">
                      <span className="text-slate-400 font-bold font-mono">[{ev.stage}]</span>{' '}
                      <span className="text-slate-500">{new Date(ev.date).toLocaleDateString()}</span>
                      <p className="text-slate-300 font-medium leading-tight">{ev.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Layout Canvas with Block Library (Part 5) */}
          <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-5">
            {activeSection ? (
              <div className="space-y-6">
                
                {/* Section header info */}
                <div className="flex flex-col gap-2 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Canvas Section</span>
                    {activeSection.isLocked && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">LOCKED</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={activeSection.title}
                    disabled={activeSection.isLocked || !hasEditPermission}
                    onChange={(e) => handleSectionTitleChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Part 5 Block Library toolbox */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Click to Inject Blocks from Library</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { type: 'HEADING', label: 'Heading', icon: <HeadingIcon className="w-3 h-3 text-emerald-400" /> },
                      { type: 'PARAGRAPH', label: 'Paragraph', icon: <FileText className="w-3 h-3 text-emerald-400" /> },
                      { type: 'CHECKLIST', label: 'Checklist', icon: <CheckSquare className="w-3 h-3 text-emerald-400" /> },
                      { type: 'TABLE', label: 'Table', icon: <FileSpreadsheet className="w-3 h-3 text-emerald-400" /> },
                      { type: 'REMEDY', label: 'Remedy Grid', icon: <Sparkles className="w-3 h-3 text-indigo-400" /> },
                      { type: 'CHAKRA', label: 'Chakra Aura', icon: <Heart className="w-3 h-3 text-rose-400" /> },
                      { type: 'COMPASS', label: 'Compass Calibration', icon: <CompassIcon className="w-3 h-3 text-amber-400" /> },
                      { type: 'CHART', label: 'Chart Vector', icon: <ArrowUp className="w-3 h-3 text-cyan-400" /> },
                      { type: 'IMAGE', label: 'Photo Display', icon: <ImageIcon className="w-3 h-3 text-emerald-400" /> },
                      { type: 'QUOTE', label: 'Quote', icon: <Quote className="w-3 h-3 text-teal-400" /> },
                      { type: 'ALERT', label: 'Notice Alert', icon: <AlertCircle className="w-3 h-3 text-yellow-500" /> },
                      { type: 'PAGE_BREAK', label: 'Page Break', icon: <SeparatorHorizontal className="w-3 h-3 text-slate-500" /> },
                      { type: 'SIGNATURE', label: 'Digital Sign', icon: <User className="w-3 h-3 text-indigo-400" /> }
                    ] as { type: BlockType; label: string; icon: any }[]).map(blk => (
                      <button
                        key={blk.type}
                        onClick={() => handleAddBlock(blk.type)}
                        disabled={activeSection.isLocked || !hasEditPermission}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-emerald-600 hover:text-white border border-slate-800 text-[10px] font-bold text-slate-300 transition flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {blk.icon}
                        <span>{blk.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Blocks Canvas Renderer */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {(!activeSection.blocks || activeSection.blocks.length === 0) ? (
                    <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center text-xs text-slate-500">
                      This section currently has no layout blocks. Click any element from the library above to build.
                    </div>
                  ) : (
                    activeSection.blocks.map((block, bIdx) => {
                      return (
                        <div key={block.blockId} className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3 relative group">
                          {/* Block Actions Toolbar */}
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                              #{bIdx + 1} • {block.type} BLOCK
                            </span>
                            
                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveBlock(bIdx, 'UP')}
                                disabled={bIdx === 0 || activeSection.isLocked || !hasEditPermission}
                                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-20"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveBlock(bIdx, 'DOWN')}
                                disabled={bIdx === (activeSection.blocks || []).length - 1 || activeSection.isLocked || !hasEditPermission}
                                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-20"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveBlock(block.blockId)}
                                disabled={activeSection.isLocked || !hasEditPermission}
                                className="p-1 rounded hover:bg-slate-800 text-rose-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Block Interactive Input Content (Part 5 Blocks) */}
                          <div className="text-xs">
                            {block.type === 'HEADING' && (
                              <input
                                type="text"
                                value={block.content}
                                disabled={activeSection.isLocked || !hasEditPermission}
                                onChange={(e) => handleUpdateBlockContent(block.blockId, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm text-white font-bold"
                              />
                            )}

                            {block.type === 'PARAGRAPH' && (
                              <textarea
                                value={block.content}
                                rows={3}
                                disabled={activeSection.isLocked || !hasEditPermission}
                                onChange={(e) => handleUpdateBlockContent(block.blockId, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-medium leading-relaxed font-sans"
                              />
                            )}

                            {block.type === 'CHECKLIST' && Array.isArray(block.content) && (
                              <div className="space-y-1.5">
                                {block.content.map((item: any, iIdx: number) => (
                                  <div key={iIdx} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => {
                                        const copy = [...block.content];
                                        copy[iIdx].completed = e.target.checked;
                                        handleUpdateBlockContent(block.blockId, copy);
                                      }}
                                      className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                                    />
                                    <input
                                      type="text"
                                      value={item.label}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => {
                                        const copy = [...block.content];
                                        copy[iIdx].label = e.target.value;
                                        handleUpdateBlockContent(block.blockId, copy);
                                      }}
                                      className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 p-0"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {block.type === 'TABLE' && block.content && (
                              <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                                <table className="w-full text-left text-[11px] text-slate-400">
                                  <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold">
                                    <tr>
                                      {block.content.headers.map((h: string, hIdx: number) => (
                                        <th key={hIdx} className="p-2 border-b border-slate-800">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {block.content.rows.map((row: string[], rIdx: number) => (
                                      <tr key={rIdx} className="hover:bg-slate-900/40 border-b border-slate-900/60">
                                        {row.map((cell: string, cIdx: number) => (
                                          <td key={cIdx} className="p-2">
                                            <input
                                              type="text"
                                              value={cell}
                                              disabled={activeSection.isLocked || !hasEditPermission}
                                              onChange={(e) => {
                                                const copy = { ...block.content };
                                                copy.rows[rIdx][cIdx] = e.target.value;
                                                handleUpdateBlockContent(block.blockId, copy);
                                              }}
                                              className="bg-transparent border-none focus:ring-0 p-0 text-[11px] text-slate-300"
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {block.type === 'REMEDY' && (
                              <div className="bg-slate-950 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Remedy Calibration Block</span>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div>
                                    <span className="text-slate-500 block">Target Zone</span>
                                    <input
                                      type="text"
                                      value={block.content.zone}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, zone: e.target.value })}
                                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">Sanskrit Scripture Citation</span>
                                    <input
                                      type="text"
                                      value={block.content.citation}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, citation: e.target.value })}
                                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-slate-500 block">Spatial Defect</span>
                                    <input
                                      type="text"
                                      value={block.content.defect}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, defect: e.target.value })}
                                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-slate-500 block">Quantum Remedial Plan</span>
                                    <input
                                      type="text"
                                      value={block.content.remedy}
                                      disabled={activeSection.isLocked || !hasEditPermission}
                                      onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, remedy: e.target.value })}
                                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'CHAKRA' && (
                              <div className="bg-slate-950 border border-rose-500/20 rounded-xl p-3 space-y-2 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: block.content.color }}>
                                  <Heart className="w-4 h-4" />
                                </div>
                                <div className="flex-1 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-slate-200">{block.content.name}</span>
                                    <span className="font-mono text-slate-400">{block.content.frequency}</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={block.content.status}
                                    disabled={activeSection.isLocked || !hasEditPermission}
                                    onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, status: e.target.value })}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full font-bold"
                                  />
                                  <textarea
                                    value={block.content.description}
                                    disabled={activeSection.isLocked || !hasEditPermission}
                                    rows={2}
                                    onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, description: e.target.value })}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 w-full leading-normal"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'COMPASS' && (
                              <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-3 text-[11px] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center font-mono text-[10px] text-amber-400 animate-spin" style={{ animationDuration: '30s' }}>
                                  N
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-slate-200">{block.content.facingDirection}</span>
                                    <span className="font-mono text-amber-400">{block.content.offsetDegrees}° Deviation</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={block.content.status}
                                    disabled={activeSection.isLocked || !hasEditPermission}
                                    onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, status: e.target.value })}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 w-full"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'QUOTE' && (
                              <div className="border-l-4 border-teal-500 bg-slate-900/60 p-3 rounded-r-xl italic space-y-1.5">
                                <textarea
                                  value={block.content.text}
                                  disabled={activeSection.isLocked || !hasEditPermission}
                                  rows={2}
                                  onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, text: e.target.value })}
                                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-200 italic leading-normal"
                                />
                                <input
                                  type="text"
                                  value={block.content.source}
                                  disabled={activeSection.isLocked || !hasEditPermission}
                                  onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, source: e.target.value })}
                                  className="bg-transparent border-none focus:ring-0 p-0 text-[10px] text-teal-400 font-bold block"
                                />
                              </div>
                            )}

                            {block.type === 'ALERT' && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] flex gap-2">
                                <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                                <input
                                  type="text"
                                  value={block.content.message}
                                  disabled={activeSection.isLocked || !hasEditPermission}
                                  onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, message: e.target.value })}
                                  className="bg-transparent border-none focus:ring-0 p-0 text-amber-300 w-full font-semibold"
                                />
                              </div>
                            )}

                            {block.type === 'IMAGE' && (
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                                <img src={block.content.url} alt="block view" className="max-h-48 w-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                                <input
                                  type="text"
                                  value={block.content.caption}
                                  disabled={activeSection.isLocked || !hasEditPermission}
                                  onChange={(e) => handleUpdateBlockContent(block.blockId, { ...block.content, caption: e.target.value })}
                                  className="bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400 p-1 w-full text-center"
                                />
                              </div>
                            )}

                            {block.type === 'PAGE_BREAK' && (
                              <div className="flex items-center justify-between gap-2 py-1 text-slate-500">
                                <div className="h-px bg-slate-800 flex-1 border-dashed border-t"></div>
                                <span className="font-mono text-[9px] font-bold tracking-widest uppercase">Page Break Indicator</span>
                                <div className="h-px bg-slate-800 flex-1 border-dashed border-t"></div>
                              </div>
                            )}

                            {block.type === 'SIGNATURE' && (
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 max-w-sm ml-auto">
                                <div className="font-mono text-emerald-400 text-xs italic tracking-wide font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
                                  <span>{block.content.name}</span>
                                  {block.content.verified && <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">VERIFIED</span>}
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{block.content.role}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select a section from the outline to start formatting your report canvas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part 6: White label colors and customization */}
      {activeTab === 'BRANDING' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              White-Label Themes & Architectural Palettes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {presetThemes.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => applyPresetTheme(theme.branding)}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.branding.primaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.branding.accentColor }}
                    />
                    <h4 className="text-xs font-bold text-white truncate">{theme.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Font: {theme.branding.fontFamily}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              White-Label Customization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Consultant Name</label>
                <input
                  type="text"
                  value={branding.consultantName || 'Dr. Rajesh Sharma'}
                  onChange={(e) => setBranding({ ...branding, consultantName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Consultant Role</label>
                <input
                  type="text"
                  value={branding.consultantRole || 'Senior Space Alchemist'}
                  onChange={(e) => setBranding({ ...branding, consultantRole: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Watermark Overlay Text</label>
                <input
                  type="text"
                  value={branding.watermarkText || ''}
                  onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stamp Url</label>
                <input
                  type="text"
                  value={branding.stampUrl || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=100&auto=format&fit=crop&q=80'}
                  onChange={(e) => setBranding({ ...branding, stampUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Digital Signature</label>
                <input
                  type="text"
                  value={branding.digitalSignatureUrl || 'SIGNED: DR. RAJESH SHARMA'}
                  onChange={(e) => setBranding({ ...branding, digitalSignatureUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="text-slate-400 block mb-1">Footer Disclaimer</label>
                <input
                  type="text"
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part 8: Media Manager Panel */}
      {activeTab === 'MEDIA' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Media Asset
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Asset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor CAD Layout"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Source URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Asset Type</label>
                <select
                  value={newMediaType}
                  onChange={(e: any) => setNewMediaType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="PROPERTY_PHOTO">Property Photo</option>
                  <option value="FLOOR_PLAN">Floor Plan</option>
                  <option value="CAD_SCREENSHOT">CAD Screenshot</option>
                  <option value="PDF_ATTACHMENT">PDF Attachment</option>
                </select>
              </div>

              <button
                onClick={handleAddMedia}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload to Media Repository</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              Uploaded Asset Library
            </h3>

            {attachments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No custom media assets uploaded to the active workspace registry.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((att, index) => (
                  <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 flex gap-3 items-start">
                    <img src={att.assetUrl} alt="uploaded asset" className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0 text-xs space-y-1">
                      <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400 font-bold tracking-wider block uppercase w-max">
                        {att.attachmentType}
                      </span>
                      <h4 className="font-bold text-white truncate">{att.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{new Date(att.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part 9: Version history control */}
      {activeTab === 'VERSIONS' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              Save Layout Snapshot
            </h3>
            
            <div className="flex gap-3 text-xs">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter revision note (e.g. Finalized North-East zone alignment comments)"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <button
                onClick={() => handleSaveWorkspace(revisionNotes)}
                disabled={!hasEditPermission}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 rounded-lg transition"
              >
                Create Snapshot
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Version Audit History</h3>

            {versions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No versions recorded yet. Save changes to begin tracking revisions.
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((ver, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Version v{ver.versionNumber}.0</span>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(ver.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">By: {ver.author}</span>
                      </div>
                      <p className="text-slate-300 font-medium">{ver.revisionNotes}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        disabled={!hasEditPermission}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition"
                      >
                        Restore Snapshot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part 10: Comments review system */}
      {activeTab === 'COMMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Add Review Comment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Attach to Section</label>
                <select
                  value={commentSectionFilter}
                  onChange={(e) => setCommentSectionFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="ALL">General / Global Comment</option>
                  {sections.map(s => (
                    <option key={s.sectionId} value={s.sectionId}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Highlight Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Anahata grid frequencies"
                  value={commentHighlightText}
                  onChange={(e) => setCommentHighlightText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Comment</label>
                <textarea
                  placeholder="Write your review or mention a colleague using @specialist..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white leading-normal"
                />
              </div>

              <button
                onClick={handleAddComment}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2 rounded transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Review Comment</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Review Threads</h3>

            {comments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No active reviews or comments. Submit a comment on the left panel.
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c, index) => (
                  <div key={index} className={`bg-slate-900 border p-4 rounded-xl space-y-2 ${c.isResolved ? 'border-slate-800 opacity-60' : 'border-indigo-500/20'}`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.author}</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider">{c.authorRole}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => toggleCommentResolve(c.commentId)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                          c.isResolved 
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600'
                        }`}
                      >
                        {c.isResolved ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>

                    {c.highlightedText && (
                      <div className="bg-slate-950/80 px-2 py-1 rounded border-l-2 border-indigo-500 text-[11px] text-indigo-300 italic">
                        Highlight: "{c.highlightedText}"
                      </div>
                    )}

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part 7: Localization Languages */}
      {activeTab === 'LOCALIZATION' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Dynamic Enterprise Multilingual Support
          </h3>
          <p className="text-xs text-slate-400">
            URJAFLUX AI OS dynamically translates canonical titles and metadata templates on translation requests. Select the target output script:
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-left transition ${
                language === 'en' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-bold block">English (EN)</span>
              <span className="text-xs text-slate-400">Standard Enterprise Legal & Technical English</span>
            </button>

            <button
              onClick={() => setLanguage('hi')}
              className={`p-4 rounded-xl border text-left transition ${
                language === 'hi' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-bold block">हिन्दी (HI)</span>
              <span className="text-xs text-slate-400">प्रामाणिक वैदिक एवं प्राविधिक हिन्दी भाषा</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
