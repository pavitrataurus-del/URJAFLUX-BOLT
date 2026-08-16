# MISSING-VASTU-API-REPORT

## 1. Vastu Zones API
- **Missing Service:** VastuZoneEngine
- **Expected Endpoint:** `GET /api/vastu/zones?twinId={id}` or `VastuApi.getInstance().getZones(twinId)`
- **Request Schema:** `{ twinId: string }`
- **Response Schema:** `{ zones: Array<{ id: string, name: string, direction: string, compliance: number, confidence: number, objects: string[], issues: string[] }> }`
- **Business Purpose:** Populates the Vastu Zone Explorer, providing spatial bounds and analytical status per directional zone (e.g. North, North-East).

## 2. Panch Tatva Engine API
- **Missing Service:** PanchTatvaEngine
- **Expected Endpoint:** `GET /api/vastu/tatvas?twinId={id}` or `VastuApi.getInstance().getPanchTatvaDistribution(twinId)`
- **Request Schema:** `{ twinId: string }`
- **Response Schema:** `{ tatvas: Array<{ name: string, percentage: number, balanceStatus: string, associatedRooms: string[] }> }`
- **Business Purpose:** Visualizes the five elements (Earth, Water, Fire, Air, Space) distribution and compliance across the property.

## 3. Compliance Scorecard API
- **Missing Service:** VastuComplianceEngine
- **Expected Endpoint:** `GET /api/vastu/scorecard?twinId={id}` or `VastuApi.getInstance().getScorecard(twinId)`
- **Request Schema:** `{ twinId: string }`
- **Response Schema:** `{ overallScore: number, directionalScore: number, roomScore: number, zoneScore: number, tatvaScore: number, trend: string }`
- **Business Purpose:** Serves the high-level Compliance Scorecard, displaying aggregated compliance metrics across various Vastu dimensions.

## 4. Room Vastu Analysis API
- **Missing Service:** RoomVastuEngine
- **Expected Endpoint:** `GET /api/vastu/rooms?twinId={id}` or `VastuApi.getInstance().getRoomAnalysis(twinId)`
- **Request Schema:** `{ twinId: string }`
- **Response Schema:** `{ rooms: Array<{ id: string, name: string, type: string, area: number, orientation: string, zoneId: string, compliance: number, issues: string[], recommendations: string[] }> }`
- **Business Purpose:** Populates the Room Analysis Panel with specific Vastu constraints and compliance states per architectural room.
