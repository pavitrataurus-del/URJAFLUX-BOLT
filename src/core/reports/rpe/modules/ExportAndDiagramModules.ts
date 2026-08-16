// ============================================================================
// URJAFLUX AI OS - RPE DIAGRAM, ILLUSTRATION & EXPORT MODULES
// Diagram Generators, Image Composer, HTML, PDF, DOCX & Digital Share Engines
// ============================================================================

import { IIntegratedConsultationPackage } from "../../../integrated_intelligence/types/iie.types";
import { IReportDiagram, IReportDocument, IWhiteLabelConfig, ExportFormat } from "../types/rpe.types";

export class DiagramEngine {
  public static generateVastuChakraSvg(consultation: IIntegratedConsultationPackage): string {
    return `
      <svg viewBox="0 0 400 400" width="100%" height="300" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="#F8FAFC" stroke="#0F766E" stroke-width="3"/>
        <circle cx="200" cy="200" r="120" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="4"/>
        <text x="200" y="35" text-anchor="middle" font-size="12" fill="#0F172A" font-weight="bold">NORTH (0°)</text>
        <text x="365" y="205" text-anchor="middle" font-size="12" fill="#0F172A" font-weight="bold">EAST (90°)</text>
        <text x="200" y="380" text-anchor="middle" font-size="12" fill="#0F172A" font-weight="bold">SOUTH (180°)</text>
        <text x="35" y="205" text-anchor="middle" font-size="12" fill="#0F172A" font-weight="bold">WEST (270°)</text>
        <circle cx="200" cy="200" r="30" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
        <text x="200" y="204" text-anchor="middle" font-size="9" fill="#78350F" font-weight="bold">BRAHMASTHAN</text>
      </svg>
    `.trim();
  }

  public static buildDiagrams(consultation: IIntegratedConsultationPackage): IReportDiagram[] {
    return [
      {
        diagramId: 'DIAG_VASTU_01',
        diagramType: 'VASTU_16_ZONE_CHAKRA',
        title: '16-Zone Spatial Vastu Alignment Wheel',
        svgMarkup: this.generateVastuChakraSvg(consultation),
        dataPoints: [
          { label: 'NORTH', value: 92, category: 'WATER' },
          { label: 'EAST', value: 88, category: 'AIR' },
          { label: 'SOUTH', value: 85, category: 'FIRE' },
          { label: 'WEST', value: 90, category: 'SPACE' }
        ]
      },
      {
        diagramId: 'DIAG_ELEMENT_01',
        diagramType: 'ELEMENTAL_BALANCE_CHART',
        title: 'Pancha Tattva Elemental Equilibrium',
        dataPoints: [
          { label: 'Water', value: 22, category: 'WATER' },
          { label: 'Air', value: 20, category: 'AIR' },
          { label: 'Fire', value: 18, category: 'FIRE' },
          { label: 'Earth', value: 20, category: 'EARTH' },
          { label: 'Space', value: 20, category: 'SPACE' }
        ]
      }
    ];
  }
}

export class IllustrationEngine {
  public static getIllustrationSpec(category: string): { width: number; height: number; placeholderUrl: string } {
    return {
      width: 600,
      height: 400,
      placeholderUrl: `/assets/illustrations/${category.toLowerCase()}_diagram.png`
    };
  }
}

export class ImageComposer {
  public static composePropertyOverlayUrl(propertyId: string): string {
    return `/api/reports/images/composer?propertyId=${propertyId}&overlay=vastu_16_zone`;
  }
}

export class HtmlEngine {
  public static generateHtmlReport(document: IReportDocument, config: IWhiteLabelConfig): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${document.title}</title>
        <style>
          body { font-family: '${config.brandTheme.fontBody}', sans-serif; background-color: ${config.brandTheme.backgroundColorHex}; color: ${config.brandTheme.primaryColorHex}; margin: 0; padding: 40px; }
          h1, h2, h3 { font-family: '${config.brandTheme.fontHeader}', serif; color: ${config.brandTheme.primaryColorHex}; }
          .section { margin-bottom: 30px; background: white; padding: 24px; border-radius: 12px; border: 1px solid #E2E8F0; }
          .callout { background: #F1F5F9; border-left: 4px solid ${config.brandTheme.secondaryColorHex}; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { padding: 10px; border: 1px solid #E2E8F0; text-align: left; font-size: 13px; }
          th { background: #F8FAFC; color: ${config.brandTheme.primaryColorHex}; font-weight: 600; }
        </style>
      </head>
      <body>
        <div style="border-bottom: 2px solid ${config.brandTheme.secondaryColorHex}; padding-bottom: 16px; margin-bottom: 24px;">
          <h1>${document.title}</h1>
          <p style="color: ${config.brandTheme.secondaryColorHex}; font-weight: 600;">${document.subtitle}</p>
        </div>
        ${document.sections.map(s => `
          <div class="section">
            <h2>${s.title}</h2>
            ${s.blocks.map(b => `
              <div class="callout">
                ${b.title ? `<strong>${b.title}</strong><br/>` : ''}
                <span>${b.content}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `.trim();
  }
}

export class PrintEngine {
  public static generatePrintStylesheet(): string {
    return `
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: white !important; color: black !important; }
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
      }
    `.trim();
  }
}

export class PdfEngine {
  public static getPdfRenderOptions(): { format: string; printBackground: boolean; margin: Record<string, string> } {
    return {
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    };
  }
}

export class DocxEngine {
  public static getDocxSpecification(document: IReportDocument): Record<string, any> {
    return {
      title: document.title,
      creator: 'URJAFLUX RPE',
      sectionsCount: document.sections.length
    };
  }
}

export class DigitalShareEngine {
  public static generateShareToken(packageId: string): string {
    return `URJA-SHARE-${packageId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }
}
