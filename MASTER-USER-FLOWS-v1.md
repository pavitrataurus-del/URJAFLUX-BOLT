# MASTER-USER-FLOWS-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### Flow 1: Project Initialization & Knowledge Hydration
1. **Trigger:** User clicks "New Project".
2. **Action:** Fills out Project Details and configures team permissions.
3. **Action:** Enters "Ingestion Center" (unified upload/monitor view).
4. **Action:** Drags & drops 5 PDF floor plans.
5. **System:** Upload processes in the background. User is NOT blocked.
6. **Action:** User navigates to Project Dashboard. Global Job Queue icon spins.
7. **System:** Toast notification: "Knowledge Hydration Complete".
8. **Edge Case (Partial Failure):** If one page fails OCR, it is flagged in the Ingestion Center for manual triage, allowing the rest of the pipeline to complete.

### Flow 2: Spatial Review & Auto-Recalculation
1. **Trigger:** User opens the Unified Workspace.
2. **System:** Loads 2D Digital Twin canvas.
3. **Action:** User visually verifies auto-generated zones.
4. **Action:** User manually adjusts a misaligned wall using the contextual floating toolbar.
5. **System:** Instantly recalculates Vastu zones locally (Optimistic UI) and syncs to backend.
6. **Action:** Human change prompts an optional "Commit Message" logged to the Audit Trail.

### Flow 3: AI Reasoning & In-Context Review
1. **Trigger:** Spatial layout changes trigger background AI Experts.
2. **System:** AI Reasoning Console (Right Dock) streams live logs. "Semantic Summary" mode shows "Vastu Expert found 2 issues."
3. **Action:** User clicks an issue in the console.
4. **System:** Central Canvas camera automatically pans/zooms to the affected zone, highlighting the defect.
5. **Action:** User reviews the Decision Trace in the Inspector.
6. **Action:** User clicks "Approve with Modification" directly in the Workspace context.

### Flow 4: Bulk Triage & Report Generation
1. **Trigger:** Consultant needs to finalize a massive project with 100+ recommendations.
2. **Action:** Navigates to "Review & Reports" -> "Bulk Triage".
3. **System:** Displays a highly dense Data Grid of all AI recommendations.
4. **Action:** User batch-approves items.
5. **Action:** User navigates to "Report Builder" (Drafts section).
6. **System:** Asynchronously compiles data into the WYSIWYG editor.
7. **Action:** User exports PDF. Download begins via background job.

### Flow 5: Rollback & Audit
1. **Trigger:** Client disputes a change.
2. **Action:** Admin navigates to the "Audit Trail" or Timeline Dock.
3. **System:** Shows immutable history of AI and Human actions.
4. **Action:** Admin finds the specific spatial edit and clicks "Revert".
5. **System:** Restores previous Twin state and invalidates downstream AI recommendations.
