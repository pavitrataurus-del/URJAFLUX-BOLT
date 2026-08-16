import { jsPDF } from "jspdf";

// URJAFLUX Corporate & Elemental Color Palette (Aesthetic design pairings)
export const PALETTE = {
  primary: [15, 23, 42],      // Slate-900 (Deep Space & Grounding)
  secondary: [30, 41, 59],    // Slate-800 (Structure)
  accent: [180, 83, 9],       // Amber-700 (Solar Fire / Gold)
  accentLight: [251, 191, 36], // Amber-400 (Vibrational warmth)
  textDark: [51, 65, 85],     // Slate-600 (High contrast text)
  textMuted: [100, 116, 139],  // Slate-500 (Subtle descriptive text)
  bgLight: [248, 250, 252],   // Slate-50 (Clean professional card backdrops)
  border: [226, 232, 240],    // Slate-200 (Clean hairline dividers)
  white: [255, 255, 255],
  success: [13, 148, 136],    // Teal-600 (Water / Life element)
  warning: [217, 119, 6],     // Amber-600 (Fire/Balance warning)
  danger: [220, 38, 38]       // Red-600 (Critical Earth/Imbalance)
};

// Layout Geometry Constants (A4 Paper dimensions in mm)
export const GEOMETRY = {
  pageWidth: 210,
  pageHeight: 297,
  marginLeft: 15,
  marginRight: 15,
  marginTop: 20,
  marginBottom: 20,
  contentWidth: 180, // 210 - 2*15
  contentHeight: 257 // 297 - 2*20
};

/**
 * Cover Page Renderer
 */
export function drawCoverPage(doc: jsPDF, reportTitle: string, clientName: string, propertyName: string, dateStr: string, reportId: string) {
  // 1. Draw elegant dark-slate side bar/strip
  doc.setFillColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.rect(0, 0, 15, GEOMETRY.pageHeight, "F");

  // 2. Draw gold accent accent line
  doc.setFillColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.rect(15, 0, 2, GEOMETRY.pageHeight, "F");

  // 3. Main white canvas with subtle geometric header lines
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(0.3);
  doc.line(30, 40, GEOMETRY.pageWidth - 20, 40);

  // 4. Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.text("URJAFLUX", 30, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.text("SPATIAL INTELLIGENCE OS", 30, 71);

  // 5. Title of the report
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(PALETTE.secondary[0], PALETTE.secondary[1], PALETTE.secondary[2]);
  
  const splitTitle = doc.splitTextToSize(reportTitle.toUpperCase(), GEOMETRY.pageWidth - 60);
  doc.text(splitTitle, 30, 105);

  // 6. Subtitle or description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
  doc.text("COMMERCIAL GEOMETRIC & CARDINAL COMPLIANCE AUDIT", 30, 125);

  // 7. Middle decorative architectural-like drawing placeholder/graphic (pure vector paths, no images)
  const cy = 170;
  const cx = 110;
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(0.2);
  doc.circle(cx, cy, 35, "S");
  doc.circle(cx, cy, 25, "S");
  doc.circle(cx, cy, 5, "S");
  doc.line(cx - 45, cy, cx + 45, cy);
  doc.line(cx, cy - 45, cx, cy + 45);

  // Cardinal labels in compass decoration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.text("N", cx - 1, cy - 38);
  doc.text("S", cx - 1, cy + 41);
  doc.text("E", cx + 38, cy + 2.5);
  doc.text("W", cx - 42, cy + 2.5);

  // Intercardinal angles
  doc.setFontSize(6);
  doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
  doc.text("NE (Water)", cx + 24, cy - 24);
  doc.text("SE (Fire)", cx + 24, cy + 26);
  doc.text("SW (Earth)", cx - 34, cy + 26);
  doc.text("NW (Air)", cx - 32, cy - 24);

  // 8. Meta card (Client Profile & Project identifiers)
  const cardY = 220;
  doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
  doc.roundedRect(30, cardY, GEOMETRY.pageWidth - 55, 50, 2, 2, "F");
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.roundedRect(30, cardY, GEOMETRY.pageWidth - 55, 50, 2, 2, "S");

  // Divider inside metadata box
  doc.line(30 + (GEOMETRY.pageWidth - 55) / 2, cardY + 5, 30 + (GEOMETRY.pageWidth - 55) / 2, cardY + 45);

  // Left column: Client details
  let textY = cardY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.text("CLIENT & PROPERTY PROFILE", 36, textY);
  
  textY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.text(`Client Name:`, 36, textY);
  doc.setFont("helvetica", "bold");
  doc.text(clientName, 62, textY);

  textY += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Property:`, 36, textY);
  doc.setFont("helvetica", "bold");
  doc.text(propertyName, 62, textY);

  // Right column: Project & date
  textY = cardY + 12;
  const rightColX = 35 + (GEOMETRY.pageWidth - 55) / 2 + 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.text("DOCUMENT CONTROLS", rightColX, textY);

  textY += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.text(`Report Ref:`, rightColX, textY);
  doc.setFont("helvetica", "bold");
  doc.text(reportId, rightColX + 26, textY);

  textY += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Issued Date:`, rightColX, textY);
  doc.setFont("helvetica", "bold");
  const formattedDate = new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(formattedDate, rightColX + 26, textY);

  textY += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Classification:`, rightColX, textY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.text("CONFIDENTIAL - COMMERCIAL", rightColX + 26, textY);
}

/**
 * Running Header drawing helper
 */
export function drawRunningHeader(doc: jsPDF, title: string) {
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(0.2);
  doc.line(GEOMETRY.marginLeft, 15, GEOMETRY.pageWidth - GEOMETRY.marginRight, 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.secondary[0], PALETTE.secondary[1], PALETTE.secondary[2]);
  doc.text("URJAFLUX SPATIAL INTELLIGENCE REPORT", GEOMETRY.marginLeft, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
  const maxTitleLen = 60;
  const displayTitle = title.length > maxTitleLen ? title.substring(0, maxTitleLen) + "..." : title;
  doc.text(displayTitle, GEOMETRY.pageWidth - GEOMETRY.marginRight - doc.getTextWidth(displayTitle), 11);
}

/**
 * Running Footer drawing helper
 */
export function drawRunningFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(0.2);
  doc.line(GEOMETRY.marginLeft, GEOMETRY.pageHeight - 15, GEOMETRY.pageWidth - GEOMETRY.marginRight, GEOMETRY.pageHeight - 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
  doc.text("Classification: COMMERCIAL CONFIDENTIAL", GEOMETRY.marginLeft, GEOMETRY.pageHeight - 10);

  const pageStr = `Page ${pageNum} of ${totalPages}`;
  doc.text(pageStr, GEOMETRY.pageWidth - GEOMETRY.marginRight - doc.getTextWidth(pageStr), GEOMETRY.pageHeight - 10);
}

/**
 * Helper to draw a beautifully formatted block section with dynamic size
 */
export function drawSectionHeader(doc: jsPDF, title: string, subtitle: string | undefined, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.text(title, GEOMETRY.marginLeft, y);

  let curY = y + 2;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
    doc.text(subtitle.toUpperCase(), GEOMETRY.marginLeft, curY + 3);
    curY += 5;
  }

  // Underline
  doc.setDrawColor(PALETTE.accent[0], PALETTE.accent[1], PALETTE.accent[2]);
  doc.setLineWidth(0.8);
  doc.line(GEOMETRY.marginLeft, curY, GEOMETRY.marginLeft + 35, curY);

  // Light boundary
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(0.2);
  doc.line(GEOMETRY.marginLeft + 35, curY, GEOMETRY.pageWidth - GEOMETRY.marginRight, curY);

  return curY + 8;
}

/**
 * Helper to wrap and draw multi-line paragraphs cleanly
 */
export function drawWrappedText(doc: jsPDF, text: string, y: number, fontSize = 9.5, isBold = false, color = PALETTE.textDark): number {
  doc.setFont("helvetica", isBold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);

  const splitLines = doc.splitTextToSize(text, GEOMETRY.contentWidth);
  const lineSpacing = fontSize * 0.45; // custom spacing proportional to font size in mm

  splitLines.forEach((line: string) => {
    doc.text(line, GEOMETRY.marginLeft, y);
    y += lineSpacing;
  });

  return y;
}

/**
 * Draws a neat compliance score circle graphic with surrounding text descriptors
 */
export function drawScoreGauge(doc: jsPDF, score: number, y: number): number {
  const gWidth = GEOMETRY.contentWidth;
  const gHeight = 35;

  // Background box
  doc.setFillColor(PALETTE.bgLight[0], PALETTE.bgLight[1], PALETTE.bgLight[2]);
  doc.roundedRect(GEOMETRY.marginLeft, y, gWidth, gHeight, 2, 2, "F");
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.roundedRect(GEOMETRY.marginLeft, y, gWidth, gHeight, 2, 2, "S");

  // Left Circle gauge coordinates
  const gx = GEOMETRY.marginLeft + 25;
  const gy = y + gHeight / 2;
  const gr = 12;

  // Outer circle
  doc.setDrawColor(PALETTE.border[0], PALETTE.border[1], PALETTE.border[2]);
  doc.setLineWidth(1.5);
  doc.circle(gx, gy, gr, "S");

  // Dynamic arc coloring based on score
  let arcColor = PALETTE.success;
  let scoreClass = "OPTIMAL COMPLIANCE";
  if (score < 50) {
    arcColor = PALETTE.danger;
    scoreClass = "CRITICAL ACTION REQUIRED";
  } else if (score < 80) {
    arcColor = PALETTE.warning;
    scoreClass = "MODERATE ALIGNMENT";
  }

  // Draw colorful inner circle accent
  doc.setDrawColor(arcColor[0], arcColor[1], arcColor[2]);
  doc.setLineWidth(2.5);
  doc.circle(gx, gy, gr - 0.5, "S");

  // Center Score Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(PALETTE.primary[0], PALETTE.primary[1], PALETTE.primary[2]);
  doc.text(score.toString(), gx - (score >= 100 ? 5 : score >= 10 ? 3.5 : 2), gy + 2);
  
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.textMuted[0], PALETTE.textMuted[1], PALETTE.textMuted[2]);
  doc.text("URJA", gx - 3.5, gy - 3.5);

  // Right-side score breakdowns
  const detailsX = gx + 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(arcColor[0], arcColor[1], arcColor[2]);
  doc.text(`OVERALL SPATIAL COMPLIANCE: ${score}%`, detailsX, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.textDark[0], PALETTE.textDark[1], PALETTE.textDark[2]);
  
  let desc = "The geometric elements represent a solid environmental base, yielding healthy micro-vibrations.";
  if (score < 50) {
    desc = "Significant energetic and structural misalignments are detected. Mitigation protocols must be deployed.";
  } else if (score < 80) {
    desc = "Slight physical or elemental friction found. Implementation of targeted remedies will restore balance.";
  }
  doc.text(desc, detailsX, y + 16);

  // Draw subscores status tag
  doc.setFillColor(arcColor[0], arcColor[1], arcColor[2]);
  doc.roundedRect(detailsX, y + 22, 45, 5, 1, 1, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.white[0], PALETTE.white[1], PALETTE.white[2]);
  doc.text(scoreClass, detailsX + 3.5, y + 25.5);

  return y + gHeight + 6;
}
