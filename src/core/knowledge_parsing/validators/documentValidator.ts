import { ParsedDocument } from '../types/document.types';
import {
  DocumentValidationReport,
  DocumentValidationError,
  DocumentValidationWarning
} from '../types/validation.types';

export class DocumentValidator {
  public validate(doc: ParsedDocument): DocumentValidationReport {
    const errors: DocumentValidationError[] = [];
    const warnings: DocumentValidationWarning[] = [];
    const recoverableErrors: DocumentValidationError[] = [];
    const fatalErrors: DocumentValidationError[] = [];
    const unsupportedFeatures: string[] = [];
    const skippedSections: string[] = [];
    const skippedPages: number[] = [];

    // 1. Invalid Metadata check
    if (!doc.metadata.title || doc.metadata.title.trim() === '') {
      const err: DocumentValidationError = {
        code: 'INVALID_METADATA_TITLE',
        message: 'Document metadata is missing a valid title.',
        isFatal: true
      };
      errors.push(err);
      fatalErrors.push(err);
    }

    if (doc.metadata.fileSize <= 0) {
      const err: DocumentValidationError = {
        code: 'INVALID_METADATA_SIZE',
        message: 'Document metadata specifies non-positive file size.',
        isFatal: false
      };
      errors.push(err);
      recoverableErrors.push(err);
    }

    // Check pageCount presence
    if (doc.metadata.pageCount === undefined) {
      warnings.push({
        code: 'PAGE_COUNT_UNDETERMINED',
        message: 'Page count could not be strictly determined from document header/metadata.'
      });
    }

    // 2. Page Order & Duplicate Pages check
    const pageNumbersSeen = new Set<number>();
    let lastPageNum = 0;
    let pageOrderValid = true;

    doc.structure.pages.forEach((pageNode) => {
      if (pageNumbersSeen.has(pageNode.pageNumber)) {
        const err: DocumentValidationError = {
          code: 'DUPLICATE_PAGE',
          message: `Duplicate page number ${pageNode.pageNumber} detected in structure.`,
          targetNodeId: pageNode.id,
          isFatal: false
        };
        errors.push(err);
        recoverableErrors.push(err);
      } else {
        pageNumbersSeen.add(pageNode.pageNumber);
      }

      if (pageNode.pageNumber <= lastPageNum) {
        pageOrderValid = false;
      }
      lastPageNum = pageNode.pageNumber;
    });

    if (!pageOrderValid && doc.structure.pages.length > 0) {
      warnings.push({
        code: 'NON_SEQUENTIAL_PAGE_ORDER',
        message: 'Pages in document structure are not strictly ordered sequentially.'
      });
    }

    // 3. Document Integrity & Missing Sections
    let totalSections = 0;
    let totalNodes = 0;
    const sectionIdsSeen = new Set<string>();

    doc.structure.chapters.forEach((chapter) => {
      chapter.sections.forEach((sec) => {
        totalSections++;
        sectionIdsSeen.add(sec.id);
        totalNodes += sec.nodes.length;
        if (sec.nodes.length === 0) {
          skippedSections.push(sec.id);
          warnings.push({
            code: 'EMPTY_SECTION',
            message: `Section "${sec.title}" contains no content nodes.`,
            targetNodeId: sec.id
          });
        }
      });
    });

    doc.structure.unassignedSections.forEach((sec) => {
      totalSections++;
      sectionIdsSeen.add(sec.id);
      totalNodes += sec.nodes.length;
      if (sec.nodes.length === 0) {
        skippedSections.push(sec.id);
      }
    });

    if (doc.structure.chapters.length === 0 && doc.structure.unassignedSections.length === 0) {
      warnings.push({
        code: 'MISSING_SECTIONS',
        message: 'Document structure contains zero chapters or sections.'
      });
    }

    // 4. Broken References Check
    const checkNodesForRefs = (nodes: readonly unknown[]) => {
      nodes.forEach((node) => {
        if (
          typeof node === 'object' &&
          node !== null &&
          'type' in node &&
          (node as { type: string }).type === 'CROSS_REF'
        ) {
          const ref = node as unknown as { targetId: string; id: string };
          if (!sectionIdsSeen.has(ref.targetId)) {
            warnings.push({
              code: 'BROKEN_CROSS_REFERENCE',
              message: `Cross reference targets non-existent node ID "${ref.targetId}".`,
              targetNodeId: ref.id
            });
          }
        }
      });
    };

    doc.structure.chapters.forEach((ch) => {
      ch.sections.forEach((sec) => checkNodesForRefs(sec.nodes));
    });
    doc.structure.unassignedSections.forEach((sec) => checkNodesForRefs(sec.nodes));

    // Quality assessment
    let metadataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCOMPLETE' = 'HIGH';
    if (!doc.metadata.title) {
      metadataQuality = 'INCOMPLETE';
    } else if (!doc.metadata.author || doc.metadata.pageCount === undefined) {
      metadataQuality = 'MEDIUM';
    }

    let structureQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'EMPTY' = 'HIGH';
    if (totalNodes === 0) {
      structureQuality = 'EMPTY';
    } else if (skippedSections.length > 0 || warnings.length > 3) {
      structureQuality = 'LOW';
    } else if (doc.structure.unassignedSections.length > 0 && doc.structure.chapters.length === 0) {
      structureQuality = 'MEDIUM';
    }

    const isValid = fatalErrors.length === 0;

    return {
      isValid,
      documentId: doc.documentId,
      errors,
      warnings,
      recoverableErrors,
      fatalErrors,
      unsupportedFeatures,
      skippedSections,
      skippedPages,
      metadataQuality,
      structureQuality,
      checksPerformed: {
        documentIntegrity: fatalErrors.length === 0,
        pageOrder: pageOrderValid,
        missingSections: totalSections > 0,
        brokenReferences: true,
        invalidMetadata: doc.metadata.title !== '',
        duplicatePages: pageNumbersSeen.size === doc.structure.pages.length
      },
      validatedAt: Date.now()
    };
  }
}

export const documentValidator = new DocumentValidator();
