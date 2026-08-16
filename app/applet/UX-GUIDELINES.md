# UX-GUIDELINES
## URJAFLUX AI OS

### 1. Professional Tool Mindset
- **No Fluff:** Avoid marketing language, oversized hero banners, or excessive whitespace. Users are here to work, not be sold to.
- **Information Density:** Respect the user's screen real estate. Use compact table rows and small legible typography for data.
- **Keyboard First:** Power users will use keyboards. Ensure all major actions have shortcuts and the Command Palette (Cmd+K) is comprehensive.

### 2. Managing AI Uncertainty
- **Confidence Scores:** Always display AI confidence levels (e.g., `98%`) next to extracted data or recommendations.
- **Traceability:** Never present an AI decision as a "black box". Always provide a link to the "Decision Trace" or "Evidence" that explains *why* the AI made that recommendation.
- **Human Override:** Make it effortless for a human reviewer to correct the AI. "Approve", "Reject", and "Edit" should be primary actions on any AI-generated insight.

### 3. Asynchronous Operations
- **Don't Block:** Uploading a 500-page PDF or running a complex Knowledge Graph hydration takes time. Use background job queues.
- **Clear Status:** The bottom status bar or a dedicated global "Jobs" popover must always show background activity.
- **Notify on Completion:** Use toast notifications when a long-running background task finishes.

### 4. Terminology
- Use precise, domain-specific language.
- "Digital Twin", "Knowledge Graph", "Spatial Intelligence", "Ontology", "Expert Engine".
- Do not dumb down the language; the target audience consists of engineers and consultants.

### 5. Error Handling
- **Actionable Errors:** Never just say "Error". Say "Failed to extract text from page 4. The PDF may be corrupted or encrypted. [Retry Page] [View Logs]".
- **Graceful Degradation:** If the 3D viewer fails, fallback to the 2D viewer. If an AI Expert crashes, let the others continue and flag the crashed expert in the Reasoning Console.
