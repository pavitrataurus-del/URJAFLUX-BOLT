import { jsPDF } from "jspdf";
import { ProfessionalReport, ReportSection } from "../report/ReportEngine";
import { SectorAnalysis } from "../report/ReportScoring";
import { VastuRemedy } from "../../types/app";
import { 
  PALETTE, 
  GEOMETRY, 
  drawCoverPage, 
  drawRunningHeader, 
  drawRunningFooter, 
  drawSectionHeader, 
  drawWrappedText, 
  drawScoreGauge 
} from "./PdfTemplate";

/**
 * PDF Builder for constructing professional, multi-page URJAFLUX Commercial Reports.
 */
export class PdfBuilder {
  private report: ProfessionalReport;
  private doc: jsPDF;
  private yCursor: number = GEOMETRY.marginTop;
  private totalPages: number = 1;

  constructor(report: ProfessionalReport) {
    this.report = report;
    // Instantiate jsPDF with standard A4 settings
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
  }

  /**
   * Safe space manager. Pushes yCursor to next page if space is insufficient.
   */
  private ensureSpace(heightNeeded: number) {
    const bottomLimit = GEOMETRY.pageHeight - GEOMETRY.marginBottom;
    if (this.yCursor + heightNeeded > bottomLimit) {
      this.doc.addPage();
      this.totalPages += 1;
      this.yCursor = GEOMETRY.marginTop + 10; // offset from running header
    }
  }

  /**
   * Main orchestrator to construct the entire PDF document.
   */
  public generate(): jsPDF {
    // 1. Page 1: Cover Page
    drawCoverPage(
      this.doc,
      this.report.title,
      this.report.clientName,
      this.report.propertyName,
      this.report.generatedAt,
      this.report.id
    );

    // 2. Add Page 2 for Executive Summary & Scores
    this.doc.addPage();
    this.totalPages += 1;
    this.yCursor = GEOMETRY.marginTop + 8;

    // --- SECTION 1: EXECUTIVE SUMMARY & SCORE DIAGNOSTICS ---
    this.yCursor = drawSectionHeader(
      this.doc,
      "1. EXECUTIVE SUMMARY & CORE COMPLIANCE",
      "Spatial Vibe & Elemental Analysis",
      this.yCursor
    );

    // Draw main gauge widget
    this.yCursor = drawScoreGauge(this.doc, this.report.scores.overallScore, this.yCursor);

    // Score breakdowns progress bars
    this.ensureSpace(38);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
    this.doc.text("CORE SPATIAL METRICS:", GEOMETRY.marginLeft, this.yCursor);
    this.yCursor += 5;

    const metrics = [
      { label: "Directional Quadrant Balance", value: this.report.scores.directionalBalanceScore },
      { label: "Elemental Zone Alignment", value: this.report.scores.elementBalanceScore },
      { label: "Structural & Outline Integrity", value: this.report.scores.structuralSafetyScore },
      { label: "Remedial Correction Factor", value: this.report.scores.remedyMitigationFactor }
    ];

    metrics.forEach(m => {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(PALETTE.textDark[0], PALETTE.textDark[1], PALETTE.textDark[2]);
      this.doc.text(`${m.label}:`, GEOMETRY.marginLeft, this.yCursor);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${m.value}/100`, GEOMETRY.marginLeft + 60, this.yCursor);

      // Draw progress bar
      const barWidth = 80;
      const barX = GEOMETRY.marginLeft + 80;
      this.doc.setFillColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
      this.doc.roundedRect(barX, this.yCursor - 2.5, barWidth, 3, 1, 1, "F");

      const filledWidth = (m.value / 100) * barWidth;
      let barColor = PALETTE.success;
      if (m.value < 50) barColor = PALETTE.danger;
      else if (m.value < 80) barColor = PALETTE.warning;

      this.doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      this.doc.roundedRect(barX, this.yCursor - 2.5, filledWidth, 3, 1, 1, "F");

      this.yCursor += 6.5;
    });

    this.yCursor += 3;

    // Executive text paragraphs
    const execSection = this.report.sections.find(s => s.id === "sec_exec_summary");
    if (execSection) {
      // Filter out notes heading so we format cleanly
      const mainContent = execSection.content.split("### Consultant Practitioner")[0].trim();
      this.ensureSpace(25);
      this.yCursor = drawWrappedText(this.doc, mainContent, this.yCursor, 9.5);
    }

    // --- SECTION 2: TOPOLOGICAL SECTOR COMPLIANCE ---
    this.ensureSpace(40);
    this.yCursor += 6;
    this.yCursor = drawSectionHeader(
      this.doc,
      "2. COMPASS SECTOR ANALYSIS",
      "9-Quadrant Space-Element Matrix",
      this.yCursor
    );

    this.yCursor = drawWrappedText(
      this.doc,
      "The floor-plan coordinate system has been analyzed relative to compass geometry. Each cardinal sector maps to an elemental core and its spatial compliance level is cataloged below:",
      this.yCursor,
      9
    );
    this.yCursor += 4;

    // Draw Sector Analysis Table
    this.yCursor = this.drawSectorTable(this.report.sectorAnalyses);

    // --- SECTION 3: MITIGATION PROTOCOLS / REMEDIES ---
    this.ensureSpace(45);
    this.yCursor += 6;
    this.yCursor = drawSectionHeader(
      this.doc,
      "3. PRESCRIBED REMEDIAL PROTOCOLS",
      "Vibrational & Architectural Corrections",
      this.yCursor
    );

    this.yCursor = drawWrappedText(
      this.doc,
      "For identified spatial and elemental conflicts, the following corrective measures have been generated. Implementation of these adjustments offsets energetic defects without requiring physical demolition:",
      this.yCursor,
      9
    );
    this.yCursor += 4;

    // Draw Remedies Table
    this.yCursor = this.drawRemediesTable(this.report.remedies);

    // --- SECTION 4: INTELLECTUAL AUTHORITIES & CITATIONS ---
    this.ensureSpace(35);
    this.yCursor += 6;
    this.yCursor = drawSectionHeader(
      this.doc,
      "4. SCRIPTURAL AUTHORITIES & TRADITIONS",
      "Traditional Literatures & Municipal References",
      this.yCursor
    );

    this.yCursor = drawWrappedText(
      this.doc,
      "The formulas, quadrant scores, and energetic alignments deployed in this audit are compiled from authoritative architectural and environment scriptures:",
      this.yCursor,
      9
    );
    this.yCursor += 4;

    this.report.citations.forEach((cit, idx) => {
      this.ensureSpace(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
      this.doc.text(`[0${idx + 1}]`, GEOMETRY.marginLeft, this.yCursor);

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
      this.doc.text(cit, GEOMETRY.marginLeft + 10, this.yCursor);

      this.yCursor = drawWrappedText(
        this.doc,
        "Establishes precise dimensions, placements of functional rooms, and micro-vibrational balancing through metallic energy boundaries.",
        this.yCursor + 4,
        8,
        false,
        PALETTE.textMuted
      );
      this.yCursor += 2;
    });

    // --- SECTION 5: FIELD NOTES & TECHNICAL DRAWINGS ---
    this.ensureSpace(45);
    this.yCursor += 6;
    this.yCursor = drawSectionHeader(
      this.doc,
      "5. FIELD DIAGNOSTICS & BLUEPRINTS",
      "Consultant Notes & Layout Schematics",
      this.yCursor
    );

    // Technical diagram outline decoration
    this.ensureSpace(50);
    const diagWidth = 70;
    const diagHeight = 40;
    const diagX = GEOMETRY.marginLeft;
    const diagY = this.yCursor;

    // Draw layout schematic box
    this.doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
    this.doc.roundedRect(diagX, diagY, diagWidth, diagHeight, 1.5, 1.5, "F");
    this.doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
    this.doc.roundedRect(diagX, diagY, diagWidth, diagHeight, 1.5, 1.5, "S");

    // Inside decorative cad lines
    this.doc.setDrawColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
    this.doc.setLineWidth(0.15);
    this.doc.line(diagX + 5, diagY + 5, diagX + diagWidth - 5, diagY + 5);
    this.doc.line(diagX + 5, diagY + 5, diagX + 5, diagY + diagHeight - 5);
    this.doc.line(diagX + 25, diagY + 5, diagX + 25, diagY + diagHeight - 5);
    this.doc.line(diagX + 5, diagY + 20, diagX + diagWidth - 5, diagY + 20);

    // Grid nodes
    this.doc.setFillColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
    this.doc.circle(diagX + 5, diagY + 5, 0.8, "F");
    this.doc.circle(diagX + 25, diagY + 5, 0.8, "F");
    this.doc.circle(diagX + 25, diagY + 20, 0.8, "F");
    this.doc.circle(diagX + 5, diagY + 20, 0.8, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
    this.doc.text("GEOMETRY PLOT (URJA)", diagX + 7, diagY + 10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
    this.doc.text("COORDS CALIBRATED", diagX + 7, diagY + 14);

    // Text diagnostics on right of schematic
    const techX = diagX + diagWidth + 10;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
    this.doc.text("GEOMETER TOPOLOGY:", techX, diagY + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(PALETTE.textDark[0], PALETTE.textDark[1], PALETTE.textDark[2]);
    this.doc.text(`* Sector Layout Mode: 9-Grid Matrix`, techX, diagY + 11);
    this.doc.text(`* Total Logged Elements: ${this.report.sectorAnalyses.filter(s => s.findings.length > 0).length} active quadrants`, techX, diagY + 17);
    this.doc.text(`* Corrective Interventions: ${this.report.remedies.length} entries`, techX, diagY + 23);
    this.doc.text(`* Scaled Calibration: ${this.report.scores.remedyMitigationFactor > 0 ? "Calibrated (Active)" : "Manual Preset Mode"}`, techX, diagY + 29);

    this.yCursor = diagY + diagHeight + 8;

    // Field notes text box
    if (this.report.notes && this.report.notes.trim()) {
      this.ensureSpace(32);
      this.doc.setFillColor(254, 243, 199); // Warm amber background for field notes
      this.doc.roundedRect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 22, 1, 1, "F");
      this.doc.setDrawColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
      this.doc.roundedRect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 22, 1, 1, "S");

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
      this.doc.text("PRACTITIONER FIELD NOTES / COMPASS OVERRIDES:", GEOMETRY.marginLeft + 4, this.yCursor + 5);

      this.yCursor = drawWrappedText(
        this.doc,
        this.report.notes.trim(),
        this.yCursor + 10,
        8,
        true,
        PALETTE.secondary
      );
      this.yCursor += 4;
    }

    // --- SECTION 6: SIGNATURES & OFFICIAL APPROVALS ---
    this.ensureSpace(40);
    this.yCursor += 4;

    this.doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
    this.doc.roundedRect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 30, 2, 2, "F");
    this.doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
    this.doc.roundedRect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 30, 2, 2, "S");

    // Signature lines
    const sigWidth = 45;
    const sig1X = GEOMETRY.marginLeft + 15;
    const sig2X = GEOMETRY.marginLeft + GEOMETRY.contentWidth - 15 - sigWidth;
    const sigY = this.yCursor + 18;

    this.doc.setDrawColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
    this.doc.setLineWidth(0.4);
    this.doc.line(sig1X, sigY, sig1X + sigWidth, sigY);
    this.doc.line(sig2X, sigY, sig2X + sigWidth, sigY);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
    this.doc.text("COMPASS GEOMETER PRACTITIONER", sig1X + 2, sigY + 4);
    this.doc.text("URJAFLUX EXECUTIVE SYSTEM", sig2X + 4, sigY + 4);

    this.doc.setFont("helvetica", "italic");
    this.doc.setFontSize(10);
    this.doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
    this.doc.text("Vastu Shastri", sig1X + 12, sigY - 2);
    this.doc.text("SYSTEM APPROVED", sig2X + 6, sigY - 2);

    // 3. Post-Process header & footer stamping across pages 2 to Last
    for (let p = 2; p <= this.totalPages; p++) {
      this.doc.setPage(p);
      drawRunningHeader(this.doc, this.report.title);
      drawRunningFooter(this.doc, p, this.totalPages);
    }

    return this.doc;
  }

  /**
   * Helper to draw sector analysis in a neat tabular grid
   */
  private drawSectorTable(sectorAnalyses: SectorAnalysis[]): number {
    const colWidths = [45, 25, 25, 20, 65]; // sums to 180 (contentWidth)
    const colX = [
      GEOMETRY.marginLeft,
      GEOMETRY.marginLeft + colWidths[0],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
    ];

    // Header row
    this.doc.setFillColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
    this.doc.rect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 7, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(PALETTE.white[0], PALETTE.white[1], PALETTE.white[2]);
    
    const headers = ["SPATIAL SECTOR", "ELEMENT", "STATUS", "SCORE", "DIAGNOSTIC FINDINGS"];
    headers.forEach((h, i) => {
      this.doc.text(h, colX[i] + 2, this.yCursor + 5);
    });

    this.yCursor += 7;

    // Body rows
    sectorAnalyses.forEach((sec, idx) => {
      // Determine height needed for findings text
      const findingsText = sec.findings.length > 0 ? sec.findings.join("; ") : "Optimal orientation with zero physical defects registered.";
      const wrappedFindings = this.doc.splitTextToSize(findingsText, colWidths[4] - 4);
      const rowHeight = Math.max(8, wrappedFindings.length * 4 + 3);

      this.ensureSpace(rowHeight);

      // Re-evaluate coordinates after a potential page break
      const currentX = [
        GEOMETRY.marginLeft,
        GEOMETRY.marginLeft + colWidths[0],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      ];

      // Alternating row background colors
      if (idx % 2 === 1) {
        this.doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
        this.doc.rect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, rowHeight, "F");
      }

      // Border line bottom
      this.doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
      this.doc.setLineWidth(0.15);
      this.doc.line(GEOMETRY.marginLeft, this.yCursor + rowHeight, GEOMETRY.marginLeft + GEOMETRY.contentWidth, this.yCursor + rowHeight);

      // Render cell text
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8);
      this.doc.setTextColor(PALETTE.secondary[0], PALETTE.secondary[1], PALETTE.secondary[2]);
      this.doc.text(sec.sector, currentX[0] + 2, this.yCursor + 5);

      this.doc.setFont("helvetica", "normal");
      this.doc.text(sec.element, currentX[1] + 2, this.yCursor + 5);

      // Colored status label
      let statusColor = PALETTE.success;
      if (sec.status === "Critical") statusColor = PALETTE.danger;
      else if (sec.status === "Imbalanced") statusColor = PALETTE.warning;

      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      this.doc.text(sec.status.toUpperCase(), currentX[2] + 2, this.yCursor + 5);

      this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
      this.doc.text(`${sec.score}/100`, currentX[3] + 2, this.yCursor + 5);

      // Findings wrap block
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(PALETTE.textDark[0], PALETTE.textDark[1], PALETTE.textDark[2]);
      wrappedFindings.forEach((line: string, lineIdx: number) => {
        this.doc.text(line, currentX[4] + 2, this.yCursor + 4.5 + lineIdx * 3.8);
      });

      this.yCursor += rowHeight;
    });

    return this.yCursor + 5;
  }

  /**
   * Helper to draw remedies list in a clean table grid
   */
  private drawRemediesTable(remedies: VastuRemedy[]): number {
    if (remedies.length === 0) {
      return drawWrappedText(
        this.doc,
        "No remedial adjustments needed. The current layout meets optimal alignment criteria.",
        this.yCursor,
        9,
        true,
        PALETTE.success
      );
    }

    const colWidths = [20, 25, 60, 50, 25]; // sums to 180
    const colX = [
      GEOMETRY.marginLeft,
      GEOMETRY.marginLeft + colWidths[0],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2],
      GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
    ];

    // Header row
    this.doc.setFillColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
    this.doc.rect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, 7, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(PALETTE.white[0], PALETTE.white[1], PALETTE.white[2]);
    
    const headers = ["SEVERITY", "ZONE", "IDENTIFIED DEFECT", "PRESCRIBED REMEDY", "SCRIPTURE CITATION"];
    headers.forEach((h, i) => {
      this.doc.text(h, colX[i] + 2, this.yCursor + 5);
    });

    this.yCursor += 7;

    // Body rows
    remedies.forEach((rem, idx) => {
      // Split text columns to size
      const wrappedDefect = this.doc.splitTextToSize(rem.defect, colWidths[2] - 4);
      const wrappedRemedy = this.doc.splitTextToSize(rem.remedy, colWidths[3] - 4);
      const wrappedCitation = this.doc.splitTextToSize(rem.scriptureCitation, colWidths[4] - 4);

      const maxTextLines = Math.max(wrappedDefect.length, wrappedRemedy.length, wrappedCitation.length);
      const rowHeight = Math.max(8, maxTextLines * 3.8 + 3);

      this.ensureSpace(rowHeight);

      // Re-evaluate coordinates after potential page break
      const currentX = [
        GEOMETRY.marginLeft,
        GEOMETRY.marginLeft + colWidths[0],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2],
        GEOMETRY.marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      ];

      // Alternating rows
      if (idx % 2 === 1) {
        this.doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
        this.doc.rect(GEOMETRY.marginLeft, this.yCursor, GEOMETRY.contentWidth, rowHeight, "F");
      }

      this.doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
      this.doc.setLineWidth(0.15);
      this.doc.line(GEOMETRY.marginLeft, this.yCursor + rowHeight, GEOMETRY.marginLeft + GEOMETRY.contentWidth, this.yCursor + rowHeight);

      // Cell formatting
      let sevColor = PALETTE.success;
      if (rem.severity === "High") sevColor = PALETTE.danger;
      else if (rem.severity === "Medium") sevColor = PALETTE.warning;

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      this.doc.text(rem.severity.toUpperCase(), currentX[0] + 2, this.yCursor + 4.5);

      this.doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
      this.doc.text(rem.zone, currentX[1] + 2, this.yCursor + 4.5);

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(PALETTE.textDark[0], PALETTE.textDark[1], PALETTE.textDark[2]);

      wrappedDefect.forEach((line: string, lineIdx: number) => {
        this.doc.text(line, currentX[2] + 2, this.yCursor + 4.5 + lineIdx * 3.5);
      });

      wrappedRemedy.forEach((line: string, lineIdx: number) => {
        this.doc.text(line, currentX[3] + 2, this.yCursor + 4.5 + lineIdx * 3.5);
      });

      this.doc.setFont("helvetica", "italic");
      this.doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
      wrappedCitation.forEach((line: string, lineIdx: number) => {
        this.doc.text(line, currentX[4] + 2, this.yCursor + 4.5 + lineIdx * 3.5);
      });

      this.yCursor += rowHeight;
    });

    return this.yCursor + 5;
  }
}
