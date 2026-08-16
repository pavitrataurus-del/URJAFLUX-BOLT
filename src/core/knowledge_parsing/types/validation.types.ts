export interface DocumentValidationError {
  readonly code: string;
  readonly message: string;
  readonly targetNodeId?: string;
  readonly isFatal?: boolean;
}

export interface DocumentValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly targetNodeId?: string;
}

export interface DocumentValidationReport {
  readonly isValid: boolean;
  readonly documentId: string;
  readonly errors: readonly DocumentValidationError[];
  readonly warnings: readonly DocumentValidationWarning[];
  readonly recoverableErrors: readonly DocumentValidationError[];
  readonly fatalErrors: readonly DocumentValidationError[];
  readonly unsupportedFeatures: readonly string[];
  readonly skippedSections: readonly string[];
  readonly skippedPages: readonly number[];
  readonly metadataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCOMPLETE';
  readonly structureQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'EMPTY';
  readonly checksPerformed: {
    readonly documentIntegrity: boolean;
    readonly pageOrder: boolean;
    readonly missingSections: boolean;
    readonly brokenReferences: boolean;
    readonly invalidMetadata: boolean;
    readonly duplicatePages: boolean;
  };
  readonly validatedAt: number;
}
