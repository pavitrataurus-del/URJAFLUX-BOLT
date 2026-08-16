import { OCRProvider } from './OCRProvider';
import { OCRCapabilities } from './OCRCapabilities';
import { OCRResult } from '../models/OCRResult';
import { OCRPage } from '../models/OCRPage';

export interface IOCREngine {
  readonly provider: OCRProvider;
  readonly capabilities: OCRCapabilities;

  processDocument(
    input: Uint8Array | string,
    options?: Record<string, unknown>
  ): Promise<OCRResult>;

  processPage(
    pageBuffer: Uint8Array | string,
    pageNumber: number,
    options?: Record<string, unknown>
  ): Promise<OCRPage>;
}
