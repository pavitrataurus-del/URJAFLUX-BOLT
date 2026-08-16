# DOMAIN-002A: OCR Engine Architectural Report

## Multi-Lingual OCR & Script Recognition

The **Universal OCR Engine** in DOMAIN-002A processes classical Devanagari manuscripts, Sanskrit shastras, Hindi texts, and English translations using server-side Gemini-2.5-Pro vision capabilities.

---

## Supported Scripts & Languages

| Language | Script | Special Attributes | Extraction Mode |
|---|---|---|---|
| **Sanskrit** | Devanagari | Verse meter preservation, Vedic accent marks | Gemini-2.5-Pro Vision |
| **Hindi** | Devanagari | Modern dialect support & commentary | Gemini-2.5-Pro Vision |
| **English** | Latin | Critical apparatus, footnotes, diagrams | Server OCR & Native Parser |
| **Mixed** | Hybrid | Multi-column bilingual translations | Layout-aware Chunk Parsing |

---

## Captured Metadata Structures

1. **Page Mappings**: Bounding page numbers, line counts, paragraph counts, and page-level confidence scores.
2. **Paragraph Coordinates**: Spatial index and bounding paragraph lines for exact text provenance.
3. **Line Mappings**: Line-by-line sequence tracking.
4. **Image & Diagram Extraction**: Identifies Yantra geometries, Vastu Purusha grids, and floorplan diagrams.
5. **Table Structure Extraction**: Converts tabular element matrices into structured JSON arrays.

---

## RBAC Security & Privacy Policy

* **Admin Role**: Full access to OCR confidence metrics (0.00–1.00), raw extracted unparsed text, line mappings, and image bounding coordinates.
* **End User Role**: OCR confidence metrics are strictly suppressed/redacted. End Users interact exclusively with sanitized, verified text.
