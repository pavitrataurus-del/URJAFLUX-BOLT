// ============================================================================
// URJAFLUX AI OS - CONSULTANT EDITING LAYER
// Correction 5: Non-destructive Consultant Operations on Report Object Model
// Show/Hide, Reorder, Rename, Merge, Split, Insert Notes, Lock
// ============================================================================

import { IReportObjectModel, IConsultantEditInstruction, IRomSection } from "../types/rpe.types";

export class ConsultantEditingLayer {
  /**
   * Applies a series of non-destructive edit instructions to a Report Object Model
   */
  public static applyEditInstructions(
    rom: IReportObjectModel,
    instructions: IConsultantEditInstruction[]
  ): IReportObjectModel {
    // Clone ROM sections array to preserve immutability of previous revision
    let updatedSections = [...rom.sections];

    for (const inst of instructions) {
      switch (inst.operation) {
        case 'SHOW_SECTION': {
          updatedSections = updatedSections.map(s => 
            s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
              ? { ...s, isVisible: true }
              : s
          );
          break;
        }

        case 'HIDE_SECTION': {
          updatedSections = updatedSections.map(s => 
            s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
              ? { ...s, isVisible: false }
              : s
          );
          break;
        }

        case 'REORDER_SECTIONS': {
          if (inst.payload?.newOrder !== undefined) {
            updatedSections = updatedSections.map(s => 
              s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
                ? { ...s, order: inst.payload!.newOrder! }
                : s
            ).sort((a, b) => a.order - b.order);
          }
          break;
        }

        case 'RENAME_SECTION': {
          if (inst.payload?.newTitle) {
            updatedSections = updatedSections.map(s => 
              s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
                ? { ...s, title: inst.payload!.newTitle! }
                : s
            );
          }
          break;
        }

        case 'INSERT_NOTE': {
          if (inst.payload?.noteText) {
            updatedSections = updatedSections.map(s => 
              s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
                ? { ...s, customConsultantNotes: inst.payload!.noteText! }
                : s
            );
          }
          break;
        }

        case 'LOCK_SECTION': {
          updatedSections = updatedSections.map(s => 
            s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId
              ? { ...s, isLocked: inst.payload?.isLocked ?? true }
              : s
          );
          break;
        }

        case 'MERGE_SECTIONS': {
          if (inst.secondarySectionId) {
            const targetIndex = updatedSections.findIndex(s => s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId);
            const secondaryIndex = updatedSections.findIndex(s => s.sectionId === inst.secondarySectionId || s.sectionCode === inst.secondarySectionId);

            if (targetIndex !== -1 && secondaryIndex !== -1) {
              const targetSec = updatedSections[targetIndex];
              const secSec = updatedSections[secondaryIndex];

              const mergedComponents = [...targetSec.components, ...secSec.components];
              updatedSections[targetIndex] = {
                ...targetSec,
                components: mergedComponents,
                title: inst.payload?.newTitle || `${targetSec.title} & ${secSec.title}`
              };
              // Hide or remove secondary section
              updatedSections.splice(secondaryIndex, 1);
            }
          }
          break;
        }

        case 'SPLIT_SECTION': {
          const targetIndex = updatedSections.findIndex(s => s.sectionId === inst.targetSectionId || s.sectionCode === inst.targetSectionId);
          if (targetIndex !== -1) {
            const targetSec = updatedSections[targetIndex];
            const splitPoint = inst.payload?.splitPointIndex || Math.floor(targetSec.components.length / 2);

            if (splitPoint > 0 && splitPoint < targetSec.components.length) {
              const compGroup1 = targetSec.components.slice(0, splitPoint);
              const compGroup2 = targetSec.components.slice(splitPoint);

              updatedSections[targetIndex] = {
                ...targetSec,
                components: compGroup1
              };

              const newSec: IRomSection = {
                ...targetSec,
                sectionId: `${targetSec.sectionId}_SPLIT`,
                title: inst.payload?.newTitle || `${targetSec.title} (Part 2)`,
                order: targetSec.order + 0.5,
                components: compGroup2
              };

              updatedSections.splice(targetIndex + 1, 0, newSec);
            }
          }
          break;
        }
      }
    }

    // Re-index order
    const finalSections = updatedSections.map((s, idx) => ({ ...s, order: idx + 1 }));

    return {
      ...rom,
      sections: finalSections,
      versionMetadata: {
        ...rom.versionMetadata,
        versionNumber: parseFloat((rom.versionMetadata.versionNumber + 0.1).toFixed(1)),
        state: 'REVISION',
        changeLogNote: `Applied ${instructions.length} consultant edit operations.`
      }
    };
  }
}
