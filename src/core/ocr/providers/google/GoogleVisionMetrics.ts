export interface IGoogleVisionMetricsData {
  readonly totalExecutionTimeMs: number;
  readonly pagesProcessed: number;
  readonly averageConfidence: number;
  readonly charactersRecognized: number;
  readonly wordsRecognized: number;
  readonly apiCallsCount: number;
  readonly failuresCount: number;
  readonly retriesCount: number;
  readonly lastExecutionTimestamp: number;
}

export class GoogleVisionMetrics implements IGoogleVisionMetricsData {
  public readonly totalExecutionTimeMs: number;
  public readonly pagesProcessed: number;
  public readonly averageConfidence: number;
  public readonly charactersRecognized: number;
  public readonly wordsRecognized: number;
  public readonly apiCallsCount: number;
  public readonly failuresCount: number;
  public readonly retriesCount: number;
  public readonly lastExecutionTimestamp: number;

  constructor(data?: Partial<IGoogleVisionMetricsData>) {
    this.totalExecutionTimeMs = data?.totalExecutionTimeMs ?? 0;
    this.pagesProcessed = data?.pagesProcessed ?? 0;
    this.averageConfidence = data?.averageConfidence ?? 0.0;
    this.charactersRecognized = data?.charactersRecognized ?? 0;
    this.wordsRecognized = data?.wordsRecognized ?? 0;
    this.apiCallsCount = data?.apiCallsCount ?? 0;
    this.failuresCount = data?.failuresCount ?? 0;
    this.retriesCount = data?.retriesCount ?? 0;
    this.lastExecutionTimestamp = data?.lastExecutionTimestamp ?? Date.now();

    Object.freeze(this);
  }

  public static empty(): GoogleVisionMetrics {
    return new GoogleVisionMetrics();
  }

  public recordExecution(
    executionTimeMs: number,
    pages: number,
    confidence: number,
    characters: number,
    words: number
  ): GoogleVisionMetrics {
    const totalPages = this.pagesProcessed + pages;
    const newAverageConf = totalPages > 0
      ? ((this.averageConfidence * this.pagesProcessed) + (confidence * pages)) / totalPages
      : confidence;

    return new GoogleVisionMetrics({
      totalExecutionTimeMs: this.totalExecutionTimeMs + executionTimeMs,
      pagesProcessed: totalPages,
      averageConfidence: Number(newAverageConf.toFixed(4)),
      charactersRecognized: this.charactersRecognized + characters,
      wordsRecognized: this.wordsRecognized + words,
      apiCallsCount: this.apiCallsCount + 1,
      failuresCount: this.failuresCount,
      retriesCount: this.retriesCount,
      lastExecutionTimestamp: Date.now()
    });
  }

  public recordFailure(): GoogleVisionMetrics {
    return new GoogleVisionMetrics({
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      pagesProcessed: this.pagesProcessed,
      averageConfidence: this.averageConfidence,
      charactersRecognized: this.charactersRecognized,
      wordsRecognized: this.wordsRecognized,
      apiCallsCount: this.apiCallsCount + 1,
      failuresCount: this.failuresCount + 1,
      retriesCount: this.retriesCount,
      lastExecutionTimestamp: Date.now()
    });
  }

  public recordRetry(): GoogleVisionMetrics {
    return new GoogleVisionMetrics({
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      pagesProcessed: this.pagesProcessed,
      averageConfidence: this.averageConfidence,
      charactersRecognized: this.charactersRecognized,
      wordsRecognized: this.wordsRecognized,
      apiCallsCount: this.apiCallsCount,
      failuresCount: this.failuresCount,
      retriesCount: this.retriesCount + 1,
      lastExecutionTimestamp: Date.now()
    });
  }

  public toJSON(): IGoogleVisionMetricsData {
    return {
      totalExecutionTimeMs: this.totalExecutionTimeMs,
      pagesProcessed: this.pagesProcessed,
      averageConfidence: this.averageConfidence,
      charactersRecognized: this.charactersRecognized,
      wordsRecognized: this.wordsRecognized,
      apiCallsCount: this.apiCallsCount,
      failuresCount: this.failuresCount,
      retriesCount: this.retriesCount,
      lastExecutionTimestamp: this.lastExecutionTimestamp
    };
  }
}
