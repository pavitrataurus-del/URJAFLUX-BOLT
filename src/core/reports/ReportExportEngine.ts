import { IReport, ExportFormat, IReportExportJob } from './ReportTypes';
import { ReportLocalizationEngine } from './ReportLocalizationEngine';

export class ReportExportEngine {
  private static instance: ReportExportEngine;
  private exportJobs: Map<string, IReportExportJob> = new Map();

  private constructor() {}

  public static getInstance(): ReportExportEngine {
    if (!ReportExportEngine.instance) {
      ReportExportEngine.instance = new ReportExportEngine();
    }
    return ReportExportEngine.instance;
  }

  /**
   * Executes or queues a document export job in the specified target format.
   */
  public async exportReport(
    report: IReport,
    format: ExportFormat,
    requestedBy: string = 'Enterprise User'
  ): Promise<IReportExportJob> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const job: IReportExportJob = {
      jobId,
      reportId: report.id,
      format,
      status: 'IN_PROGRESS',
      requestedBy,
      createdAt: now
    };

    this.exportJobs.set(jobId, job);

    try {
      let content = '';
      let mimeType = 'text/plain';

      switch (format) {
        case 'MARKDOWN':
          content = this.generateMarkdownExport(report);
          mimeType = 'text/markdown';
          break;
        case 'HTML':
        case 'PDF':
          content = this.generateHtmlPrintExport(report);
          mimeType = 'text/html';
          break;
        case 'JSON':
          content = JSON.stringify(report, null, 2);
          mimeType = 'application/json';
          break;
        case 'DOCX':
          content = this.generateDocxXmlExport(report);
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
      }

      // Convert content string into a Blob URL for seamless browser downloading
      const blob = new Blob([content], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      const fileSizeBytes = blob.size;

      job.status = 'COMPLETED';
      job.generatedFileUrl = fileUrl;
      job.fileSizeBytes = fileSizeBytes;
      job.completedAt = new Date().toISOString();

      return job;
    } catch (err: any) {
      job.status = 'FAILED';
      job.completedAt = new Date().toISOString();
      throw err;
    }
  }

  public getExportJob(jobId: string): IReportExportJob | undefined {
    return this.exportJobs.get(jobId);
  }

  public getAllJobs(): IReportExportJob[] {
    return Array.from(this.exportJobs.values());
  }

  /**
   * Generates a clean Markdown representation of the report.
   */
  public generateMarkdownExport(report: IReport): string {
    const loc = ReportLocalizationEngine.getInstance().getTranslations(report.metadata.language);
    const b = report.branding;

    let md = `# ${report.metadata.title}\n`;
    if (report.metadata.subtitle) {
      md += `*${report.metadata.subtitle}*\n\n`;
    }

    md += `---\n\n`;
    md += `**${b.companyName}** | ${b.headerText}\n\n`;
    md += `- **Report Number:** ${report.reportNumber}\n`;
    md += `- **Status:** ${report.status}\n`;
    md += `- **Property:** ${report.metadata.propertyName || 'N/A'}\n`;
    md += `- **Generated:** ${new Date(report.createdAt).toLocaleString()}\n`;
    md += `- **Author:** ${report.metadata.authorName}\n\n`;

    md += `---\n\n`;
    md += `## ${loc.tableOfContentsTitle}\n`;
    report.sections.forEach((sec, idx) => {
      md += `${idx + 1}. [${sec.title}](#${sec.sectionKey.toLowerCase()})\n`;
    });
    md += `\n---\n\n`;

    report.sections.forEach(sec => {
      md += `## ${sec.title}\n\n`;
      md += `${sec.contentMarkdown}\n\n`;

      if (sec.citations && sec.citations.length > 0) {
        md += `### ${loc.citationsTitle}\n`;
        sec.citations.forEach(c => {
          md += `- **[${c.domain}] ${c.sourceBook}** (${c.chapterVerse || ''}) — *Author: ${c.author || 'Canonical Sage'}* (Truth Score: ${c.reliabilityScore}%)\n`;
          if (c.excerptText) md += `  > "${c.excerptText}"\n`;
        });
        md += `\n`;
      }
    });

    if (report.allCitations && report.allCitations.length > 0) {
      md += `## Master Canonical Citations & Scripture Vault\n`;
      report.allCitations.forEach(c => {
        md += `- **${c.domain}:** ${c.sourceBook} (${c.chapterVerse || ''}) - Truth Score ${c.reliabilityScore}%\n`;
      });
      md += `\n`;
    }

    md += `---\n*${b.footerText}*\n`;
    return md;
  }

  /**
   * Generates a fully printable, styled HTML layout with dynamic CSS header, footer, page breaks, and watermarks.
   */
  public generateHtmlPrintExport(report: IReport): string {
    const loc = ReportLocalizationEngine.getInstance().getTranslations(report.metadata.language);
    const b = report.branding;

    const sectionsHtml = report.sections
      .map(
        (sec, idx) => `
      <section class="report-section" id="${sec.sectionKey}">
        <div class="section-header">
          <span class="section-number">${idx + 1}.0</span>
          <h2>${sec.title}</h2>
        </div>
        <div class="section-body">
          ${sec.contentMarkdown
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/#### (.*)/g, '<h4>$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*)/g, '<li>$1</li>')}
        </div>
        ${
          sec.citations && sec.citations.length > 0
            ? `
          <div class="citations-box">
            <h4>📜 ${loc.citationsTitle}</h4>
            <ul>
              ${sec.citations
                .map(
                  c => `
                <li>
                  <strong>[${c.domain}] ${c.sourceBook}</strong> (${c.chapterVerse || ''})
                  — <em>Confidence: ${c.reliabilityScore}%</em>
                  ${c.excerptText ? `<blockquote class="citation-quote">"${c.excerptText}"</blockquote>` : ''}
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        `
            : ''
        }
      </section>
    `
      )
      .join('<hr class="page-break" />');

    return `<!DOCTYPE html>
<html lang="${report.metadata.language}">
<head>
  <meta charset="UTF-8" />
  <title>${report.metadata.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');

    body {
      font-family: '${b.fontFamily}', sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      line-height: 1.6;
    }
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 40%;
      left: 10%;
      width: 80%;
      text-align: center;
      font-size: 50px;
      font-weight: 800;
      color: rgba(15, 118, 110, 0.04);
      transform: rotate(-35deg);
      pointer-events: none;
      text-transform: uppercase;
      z-index: 0;
    }
    .report-header {
      border-bottom: 3px solid ${b.primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: ${b.primaryColor};
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #64748b;
    }
    .report-meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-size: 13px;
    }
    .toc-container {
      background: #f1f5f9;
      border-left: 4px solid ${b.primaryColor};
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 40px;
    }
    .toc-title {
      font-weight: 700;
      margin-top: 0;
      color: ${b.primaryColor};
    }
    .toc-list {
      margin: 0;
      padding-left: 20px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 2px solid ${b.secondaryColor};
      margin-top: 30px;
      padding-bottom: 6px;
    }
    .section-number {
      background: ${b.primaryColor};
      color: #fff;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .section-header h2 {
      margin: 0;
      color: ${b.secondaryColor};
      font-size: 20px;
    }
    .citations-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 14px;
      margin-top: 20px;
    }
    .citation-quote {
      font-style: italic;
      color: #166534;
      border-left: 3px solid #22c55e;
      margin: 6px 0 0 12px;
      padding-left: 8px;
    }
    .page-break {
      page-break-after: always;
      border: 0;
      border-top: 1px dashed #cbd5e1;
      margin: 40px 0;
    }
    .report-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 40px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="watermark">${b.watermarkText || 'URJAFLUX VERIFIED'}</div>
  <div class="page-container">
    <header class="report-header">
      <div>
        <h1 class="brand-title">${b.companyName}</h1>
        <div class="brand-sub">${b.headerText}</div>
      </div>
      ${b.logoUrl ? `<img src="${b.logoUrl}" alt="Logo" style="height: 48px; border-radius: 6px;" />` : ''}
    </header>

    <div class="report-meta">
      <div><strong>Report Title:</strong> ${report.metadata.title}</div>
      <div><strong>Report ID:</strong> ${report.reportNumber}</div>
      <div><strong>Property:</strong> ${report.metadata.propertyName || 'N/A'}</div>
      <div><strong>Status:</strong> ${report.status}</div>
      <div><strong>Author:</strong> ${report.metadata.authorName} (${report.metadata.authorRole})</div>
      <div><strong>Generated:</strong> ${new Date(report.createdAt).toLocaleDateString()}</div>
    </div>

    <nav class="toc-container">
      <h3 class="toc-title">📋 ${loc.tableOfContentsTitle}</h3>
      <ol class="toc-list">
        ${report.sections.map(s => `<li><a href="#${s.sectionKey}">${s.title}</a></li>`).join('')}
      </ol>
    </nav>

    <main class="report-content">
      ${sectionsHtml}
    </main>

    <footer class="report-footer">
      <p>${b.footerText}</p>
      <p>URJAFLUX AI OS Enterprise Document Intelligence • Page 1 of 1</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Generates a basic Word DOCX XML structure.
   */
  private generateDocxXmlExport(report: IReport): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>${report.metadata.title}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Report Number: ${report.reportNumber}</w:t></w:r>
    </w:p>
    ${report.sections
      .map(
        s => `
      <w:p><w:r><w:t>=== ${s.title} ===</w:t></w:r></w:p>
      <w:p><w:r><w:t>${s.contentMarkdown.replace(/[^\x00-\x7F]/g, '')}</w:t></w:r></w:p>
    `
      )
      .join('')}
  </w:body>
</w:document>`;
  }
}
