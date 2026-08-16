// ============================================================================
// URJAFLUX AI OS - RPE BRAND, THEME & HEADER/FOOTER MODULES
// White Labeling, Branding, QR Generation, Theme & Page Layout Controllers
// ============================================================================

import { IWhiteLabelConfig, IReportDocument } from "../types/rpe.types";

export class BrandEngine {
  public static getDefaultWhiteLabelConfig(): IWhiteLabelConfig {
    return {
      companyName: "URJAFLUX AI OS",
      tagline: "Quantum Vastu & Multidimensional Spatial Intelligence",
      logoUrl: "/assets/branding/urjaflux_logo.png",
      letterheadHeaderUrl: "/assets/branding/header_banner.png",
      addressLines: ["Urjaflux Tower, Spatial Tech Zone", "New Delhi, India 110001"],
      phone: "+91 98765 43210",
      email: "consultations@urjaflux.ai",
      website: "https://urjaflux.ai",
      footerText: "Confidential - Prepared for Client Consultation Only",
      disclaimerText: "URJAFLUX AI OS findings and remedies are spiritual and subtle energy alignments. They do not substitute architectural or structural engineering approvals.",
      showQrCode: true,
      qrTargetUrl: "https://urjaflux.ai/verify/",
      digitalSignatureUrl: "/assets/branding/consultant_signature.png",
      watermarkText: "URJAFLUX VERIFIED",
      brandTheme: {
        primaryColorHex: "#0F172A",
        secondaryColorHex: "#0F766E",
        accentColorHex: "#D97706",
        backgroundColorHex: "#F8FAFC",
        fontHeader: "Playfair Display",
        fontBody: "Plus Jakarta Sans"
      },
      typography: {
        baseFontSizePx: 14,
        headingScaleRatio: 1.25
      }
    };
  }

  public static resolveBrandConfig(customConfig?: Partial<IWhiteLabelConfig>): IWhiteLabelConfig {
    const defaultConfig = this.getDefaultWhiteLabelConfig();
    if (!customConfig) return defaultConfig;

    return {
      ...defaultConfig,
      ...customConfig,
      brandTheme: {
        ...defaultConfig.brandTheme,
        ...(customConfig.brandTheme || {})
      },
      typography: {
        ...defaultConfig.typography,
        ...(customConfig.typography || {})
      }
    };
  }
}

export class WhiteLabelEngine {
  public static applyWhiteLabel(
    document: IReportDocument,
    config: IWhiteLabelConfig
  ): IReportDocument {
    // Injects branding headers, footer disclaimers, and watermark metadata
    return {
      ...document,
      title: document.title,
      subtitle: `${document.subtitle} | ${config.companyName}`
    };
  }
}

export class ThemeEngine {
  public static generateCssVariables(config: IWhiteLabelConfig): string {
    const { brandTheme } = config;
    return `
      :root {
        --rpe-primary: ${brandTheme.primaryColorHex};
        --rpe-secondary: ${brandTheme.secondaryColorHex};
        --rpe-accent: ${brandTheme.accentColorHex};
        --rpe-bg: ${brandTheme.backgroundColorHex};
        --rpe-font-header: '${brandTheme.fontHeader}', serif;
        --rpe-font-body: '${brandTheme.fontBody}', sans-serif;
      }
    `.trim();
  }
}

export class HeaderFooterEngine {
  public static renderHeaderHtml(config: IWhiteLabelConfig, reportTitle: string): string {
    return `
      <header class="rpe-header" style="border-bottom: 2px solid ${config.brandTheme.secondaryColorHex}; padding-bottom: 12px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin:0; font-family: ${config.brandTheme.fontHeader}; color: ${config.brandTheme.primaryColorHex};">${config.companyName}</h2>
            <p style="margin:0; font-size: 11px; color: #64748B;">${config.tagline || ''}</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 12px; font-weight: 600; color: ${config.brandTheme.accentColorHex};">${reportTitle}</span>
          </div>
        </div>
      </header>
    `.trim();
  }

  public static renderFooterHtml(config: IWhiteLabelConfig, currentPage: number, totalPages: number): string {
    return `
      <footer class="rpe-footer" style="border-top: 1px solid #E2E8F0; padding-top: 8px; margin-top: 30px; font-size: 10px; color: #64748B; display: flex; justify-content: space-between;">
        <span>${config.footerText || ''}</span>
        <span>Page ${currentPage} of ${totalPages}</span>
      </footer>
    `.trim();
  }
}

export class PageNumberEngine {
  public static calculatePagination(totalSections: number, totalBlocks: number): { estimatedPages: number; tableOfContents: Array<{ title: string; pageNumber: number }> } {
    const estimatedPages = Math.max(1, Math.ceil((totalSections * 1.5) + (totalBlocks * 0.3)));
    const tableOfContents = Array.from({ length: totalSections }).map((_, idx) => ({
      title: `Section ${idx + 1}`,
      pageNumber: Math.min(estimatedPages, idx + 1)
    }));

    return { estimatedPages, tableOfContents };
  }
}

export class QrEngine {
  public static generateQrPayload(packageId: string, config: IWhiteLabelConfig): { qrCodeUrl: string; payload: string } {
    const payload = JSON.stringify({
      packageId,
      company: config.companyName,
      verifyUrl: `${config.qrTargetUrl || 'https://urjaflux.ai/verify/'}${packageId}`,
      timestamp: new Date().toISOString()
    });

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(payload)}`;

    return { qrCodeUrl, payload };
  }
}
