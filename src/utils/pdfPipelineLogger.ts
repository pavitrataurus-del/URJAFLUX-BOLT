// URJAFLUX AI OS - PDF Ingestion Pipeline Verbose Logger

export class PdfPipelineLogger {
  public static logStageStart(
    stageNumber: number,
    stageName: string,
    filename: string,
    pageNumber?: number
  ): number {
    const startTime = Date.now();
    const pageStr = pageNumber !== undefined ? ` [Page ${pageNumber}]` : "";
    console.log(
      `[PDF PIPELINE LOG] [START] Stage ${stageNumber}/12: ${stageName} | File: ${filename}${pageStr} | Time: ${new Date().toISOString()}`
    );
    return startTime;
  }

  public static logStageSuccess(
    stageNumber: number,
    stageName: string,
    filename: string,
    startTime: number,
    pageNumber?: number,
    extraInfo?: string
  ): void {
    const durationMs = Date.now() - startTime;
    const pageStr = pageNumber !== undefined ? ` [Page ${pageNumber}]` : "";
    const extraStr = extraInfo ? ` | Details: ${extraInfo}` : "";
    console.log(
      `[PDF PIPELINE LOG] [SUCCESS] Stage ${stageNumber}/12: ${stageName} | File: ${filename}${pageStr} | Duration: ${durationMs}ms | Time: ${new Date().toISOString()}${extraStr}`
    );
  }

  public static logStageFailed(
    stageNumber: number,
    stageName: string,
    filename: string,
    startTime: number,
    error: any,
    pageNumber?: number
  ): void {
    const durationMs = Date.now() - startTime;
    const pageStr = pageNumber !== undefined ? `Page ${pageNumber}` : "N/A";
    const errorMessage = error?.message || String(error);
    const stackTrace = error?.stack || "No stack trace available";

    console.error(`\n==========================================================================`);
    console.error(`[PDF PIPELINE LOG] [FAILED] Stage ${stageNumber}/12: ${stageName}`);
    console.error(` - Filename: ${filename}`);
    console.error(` - Page Number: ${pageStr}`);
    console.error(` - Processing Duration: ${durationMs}ms`);
    console.error(` - Timestamp: ${new Date().toISOString()}`);
    console.error(` - Exception Message: ${errorMessage}`);
    console.error(` - Complete Stack Trace:\n${stackTrace}`);
    console.error(`==========================================================================\n`);
  }

  public static async executeStage<T>(
    stageNumber: number,
    stageName: string,
    filename: string,
    fn: () => Promise<T> | T,
    pageNumber?: number,
    extraSuccessInfo?: (result: T) => string
  ): Promise<T> {
    const startTime = this.logStageStart(stageNumber, stageName, filename, pageNumber);
    try {
      const result = await fn();
      const info = extraSuccessInfo ? extraSuccessInfo(result) : undefined;
      this.logStageSuccess(stageNumber, stageName, filename, startTime, pageNumber, info);
      return result;
    } catch (error: any) {
      this.logStageFailed(stageNumber, stageName, filename, startTime, error, pageNumber);
      throw error; // Expose original unsuppressed error
    }
  }
}
