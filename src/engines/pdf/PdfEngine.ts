import { ProfessionalReport } from "../report/ReportEngine";
import { PdfBuilder } from "./PdfBuilder";
import { PdfExporter } from "./PdfExporter";
import { jsPDF } from "jspdf";

/**
 * Public facade and main entry point for the Commercial PDF Engine.
 * Enables client applications to render, download, or stream compiled Spatial Intelligence PDFs.
 */
export class PdfEngine {
  /**
   * Generates a fully compiled, formatted, and branded jsPDF document.
   */
  public static createDocument(report: ProfessionalReport): jsPDF {
    const builder = new PdfBuilder(report);
    return builder.generate();
  }

  /**
   * Generates and returns the PDF document as a standard binary Blob.
   */
  public static async generatePdf(report: ProfessionalReport): Promise<Blob> {
    const doc = this.createDocument(report);
    return PdfExporter.toBlob(doc);
  }

  /**
   * Triggers an immediate browser-native download of the compiled report.
   */
  public static downloadPdf(report: ProfessionalReport, customFilename?: string): void {
    const doc = this.createDocument(report);
    const filename = customFilename || `URJAFLUX-Spatial-Intelligence-${report.id}`;
    PdfExporter.download(doc, filename);
  }

  /**
   * Generates and returns a Base64-encoded Data URI string of the PDF,
   * which is ideal for displaying within an <iframe src={dataUri} /> preview element.
   */
  public static getPdfDataUri(report: ProfessionalReport): string {
    const doc = this.createDocument(report);
    return PdfExporter.toDataUri(doc);
  }
}
