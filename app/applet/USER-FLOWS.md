# USER-FLOWS
## URJAFLUX AI OS

### Flow 1: Project Initialization & Knowledge Ingestion
1. **Trigger:** User clicks "New Project".
2. **Action:** Fills out Project Details wizard.
3. **Action:** Enters "Upload Center".
4. **Action:** Drags & drops 5 PDF floor plans and 10 client requirement docs.
5. **System:** Shows streaming progress in Processing Monitor (OCR -> Embedding -> Spatial).
6. **Result:** User lands on Project Dashboard showing "Knowledge Hydration Complete".

### Flow 2: Spatial Intelligence Review
1. **Trigger:** User opens a processed floor plan.
2. **Action:** Clicks "Spatial Intelligence Viewer".
3. **System:** Loads 2D canvas with auto-detected walls, rooms, and entrances.
4. **Action:** User verifies auto-generated zones.
5. **Action:** User manually adjusts a misaligned entrance using snap-to-grid tools.
6. **System:** Automatically recalculates Vastu zones and updates Digital Twin.

### Flow 3: AI Reasoning & Recommendations
1. **Trigger:** System detects a new spatial layout.
2. **System:** Orchestrates Multi-Expert Reasoning (Vastu, Architecture, Safety).
3. **Action:** User navigates to "Recommendation Center".
4. **System:** Displays prioritized list of architectural defects and remedies.
5. **Action:** User clicks a recommendation.
6. **System:** Opens "Decision Trace Explorer" showing exactly which Expert rules triggered the recommendation.

### Flow 4: Human-in-the-Loop Review
1. **Trigger:** AI flags a high-priority structural change.
2. **Action:** Consultant opens "Human Review Center".
3. **System:** Shows the specific recommendation, the spatial context (mini-map), and extracted text evidence.
4. **Action:** Consultant clicks "Approve with Modification", adds a note.
5. **System:** Updates the Knowledge Graph and logs the human override.

### Flow 5: Report Generation
1. **Trigger:** Consultant finalizes reviews.
2. **Action:** Navigates to "Report Center", selects "Comprehensive Vastu Audit".
3. **System:** Compiles data from Digital Twin, Recommendations, and Human Reviews.
4. **System:** Shows a WYSIWYG preview of the PDF.
5. **Action:** User clicks "Export PDF".
6. **Result:** Download begins, copy saved to Project Documents.
