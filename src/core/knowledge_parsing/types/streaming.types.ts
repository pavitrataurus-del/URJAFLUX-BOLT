export interface ICancellationToken {
  readonly isCancelled: boolean;
  onCancelled(callback: () => void): void;
}

export interface IProgressCallback {
  (progress: {
    readonly percentage: number;
    readonly currentStage: string;
    readonly bytesRead: number;
    readonly memoryEstimateMB: number;
  }): void;
}

export interface IChunkReader {
  readonly totalSize: number;
  readChunk(offset: number, length: number): Promise<Uint8Array>;
  close(): Promise<void>;
}

export interface StreamingParserOptions {
  readonly chunkSizeBytes: number;
  readonly maxMemoryThresholdBytes: number;
  readonly cancellationToken?: ICancellationToken;
  readonly onProgress?: IProgressCallback;
}
