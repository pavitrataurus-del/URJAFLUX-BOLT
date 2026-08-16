import {
  FileValidationResult,
  QueueValidationResult,
  ValidationRuleResult,
  FileMetadata
} from '../types/ingestion.types';
import {
  KnowledgeIngestionConfig,
  DEFAULT_KNOWLEDGE_INGESTION_CONFIG
} from '../types/config.types';
import { extractExtension, createFileMetadata } from '../utils/fileUtils';
import { logger } from '../utils/logger';

export class FileValidator {
  private readonly config: KnowledgeIngestionConfig;

  constructor(config: Partial<KnowledgeIngestionConfig> = {}) {
    this.config = { ...DEFAULT_KNOWLEDGE_INGESTION_CONFIG, ...config };
  }

  public validateExtension(fileName: string): ValidationRuleResult {
    const ext = extractExtension(fileName);
    if (!ext) {
      return {
        isValid: false,
        errorCode: 'UNSUPPORTED_EXTENSION',
        errorMessage: `Unsupported extension for file "${fileName}". Allowed: ${this.config.allowedExtensions.join(', ')}.`
      };
    }

    if (!this.config.allowedExtensions.includes(ext)) {
      return {
        isValid: false,
        errorCode: 'DISALLOWED_EXTENSION',
        errorMessage: `Extension .${ext} is not allowed. Supported formats: ${this.config.allowedExtensions.join(', ')}.`
      };
    }

    return { isValid: true };
  }

  public validateSize(fileSize: number): ValidationRuleResult {
    if (fileSize <= 0) {
      return {
        isValid: false,
        errorCode: 'EMPTY_FILE',
        errorMessage: 'File is empty (0 bytes).'
      };
    }

    if (fileSize > this.config.maxFileSizeBytes) {
      const maxMb = (this.config.maxFileSizeBytes / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        errorCode: 'FILE_TOO_LARGE',
        errorMessage: `File exceeds maximum size limit of ${maxMb}MB.`
      };
    }

    return { isValid: true };
  }

  public validateDuplicate(
    fileName: string,
    existingFileNames: ReadonlySet<string>
  ): ValidationRuleResult {
    if (!this.config.allowDuplicates && existingFileNames.has(fileName.toLowerCase())) {
      return {
        isValid: false,
        errorCode: 'DUPLICATE_FILE',
        errorMessage: `File "${fileName}" already exists in queue or ingestion history.`
      };
    }

    return { isValid: true };
  }

  public validateSingleFile(
    file: File,
    existingFileNames: ReadonlySet<string> = new Set()
  ): FileValidationResult {
    const errors: ValidationRuleResult[] = [];

    const extResult = this.validateExtension(file.name);
    if (!extResult.isValid) errors.push(extResult);

    const sizeResult = this.validateSize(file.size);
    if (!sizeResult.isValid) errors.push(sizeResult);

    const dupResult = this.validateDuplicate(file.name, existingFileNames);
    if (!dupResult.isValid) errors.push(dupResult);

    const isValid = errors.length === 0;
    let metadata: FileMetadata | undefined = undefined;

    if (isValid) {
      metadata = createFileMetadata(file);
    } else {
      logger.warn('Validation failed for file', {
        fileName: file.name,
        fileSize: file.size,
        errors: errors.map((e) => e.errorMessage)
      });
    }

    return {
      file,
      isValid,
      errors,
      metadata
    };
  }

  public validateBatchQueue(
    files: readonly File[],
    existingQueueNames: ReadonlySet<string> = new Set()
  ): QueueValidationResult {
    const validFiles: FileValidationResult[] = [];
    const invalidFiles: FileValidationResult[] = [];
    const processedNames = new Set<string>(existingQueueNames);
    let duplicatesDetected = 0;

    if (files.length > this.config.maxBatchFileCount) {
      logger.warn('Batch file count exceeded limit', {
        requested: files.length,
        maxAllowed: this.config.maxBatchFileCount
      });
    }

    const maxFilesToProcess = files.slice(0, this.config.maxBatchFileCount);

    for (const file of maxFilesToProcess) {
      const isDuplicate = processedNames.has(file.name.toLowerCase());
      if (isDuplicate) {
        duplicatesDetected++;
      }

      const res = this.validateSingleFile(file, processedNames);
      if (res.isValid) {
        validFiles.push(res);
        processedNames.add(file.name.toLowerCase());
      } else {
        invalidFiles.push(res);
      }
    }

    const isValid = invalidFiles.length === 0 && validFiles.length > 0;

    return {
      isValid,
      totalFiles: maxFilesToProcess.length,
      validFiles,
      invalidFiles,
      duplicatesDetected
    };
  }
}

export const fileValidator = new FileValidator();

