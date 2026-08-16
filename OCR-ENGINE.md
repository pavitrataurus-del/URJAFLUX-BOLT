# URJAFLUX AI OS — DOMAIN-012 OCR Engine
## Text Extraction & Semantic Association

### 1. Architectural Mandate
* **No Spatial Clashes:** Text strings extracted via OCR are stored independently from geometry.
* **Separation of Concerns:** OCR handles reading; DOMAIN-011 handles placing and measuring.

---

### 2. Extracted Categories
The OCR Engine extracts text in 8 distinct categories, mapping them with bounding box coordinate zones:

1. **ROOM_NAME:** "NORTHWEST GUEST BEDROOM", "SOUTHEAST CULINARY KITCHEN". Assists in semantic zoning.
2. **DIMENSION:** "16.00 m", "300MM". Parses numeric values and units (`m`, `mm`, `cm`, `ft`, `in`) to aid spatial calibration.
3. **NOTE:** Broad notes and legal disclaimers.
4. **GRID_ID:** Column intersections ("A-1", "B-2").
5. **SCALE_INFO:** "SCALE 1:100".
6. **TITLE_BLOCK / REVISION_NO:** Document tracking.

---

### 3. Data Structure
```typescript
export interface OCRText {
  id: string;
  text: string;
  confidencePercent: number;
  category: 'ROOM_NAME' | 'DIMENSION' | 'NOTE' | 'GRID_ID' | 'SCALE_INFO' | 'REVISION_NO' | 'TITLE_BLOCK' | 'UNCLASSIFIED';
  boundingBox: BoundingBox;
  parsedNumericValue?: number;
  parsedUnit?: 'm' | 'mm' | 'cm' | 'ft' | 'in';
}
```
During review, OCR strings are bound to recognized symbols (e.g. associating the string `"16.00 m"` with a detected wall or `"NORTHWEST GUEST BEDROOM"` with a detected room bounding box) to enrich the final transferred spatial entity.
