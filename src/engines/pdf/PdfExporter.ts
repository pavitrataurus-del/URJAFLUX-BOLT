import { jsPDF } from "jspdf";

/**
 * Exporter class to handle outputting, downloading, and streaming jsPDF documents.
 */
export class PdfExporter {
  /**
   * Triggers a browser native file download of the generated PDF document.
   */
  public static download(doc: jsPDF, filename: string): void {
    const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    doc.save(cleanFilename);
  }

  /**
   * Exports the PDF document as a standard Blob object.
   * Useful for uploading files, sending to email APIs, or client-side storage.
   */
  public static toBlob(doc: jsPDF): Blob {
    return doc.output("blob");
  }

  /**
   * Exports the PDF document as a Base64 encoded Data URI string.
   * Highly useful for embedding in iframe tags, object preview elements, or tabs.
   */
  public static toDataUri(doc: jsPDF): string {
    return doc.output("datauristring");
  }

  /**
   * Exports the PDF document as an ArrayBuffer.
   */
  public static toArrayBuffer(doc: jsPDF): ArrayBuffer {
    return doc.output("arraybuffer");
  }
}
