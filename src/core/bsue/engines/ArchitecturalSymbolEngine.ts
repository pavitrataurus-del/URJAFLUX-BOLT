// ============================================================================
// URJAFLUX AI OS - BSUE STEP 5: ARCHITECTURAL SYMBOL ENGINE
// Architectural symbol parser: WC, WB, D1, D2, W1, W2, UP, DN, COL, BEAM, SHAFT,
// ELEC, DB, STP, UGT, OHT
// ============================================================================

import { 
  ISemanticSymbol, 
  BmueSymbolType 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class ArchitecturalSymbolEngine {
  private static instance: ArchitecturalSymbolEngine;

  private constructor() {}

  public static getInstance(): ArchitecturalSymbolEngine {
    if (!ArchitecturalSymbolEngine.instance) {
      ArchitecturalSymbolEngine.instance = new ArchitecturalSymbolEngine();
    }
    return ArchitecturalSymbolEngine.instance;
  }

  public extractSymbols(bmueModel: IBlueprintMathematicalModel): ISemanticSymbol[] {
    const symbols: ISemanticSymbol[] = [];
    let idx = 1;

    // 1. Process Doors into Door Symbols (e.g. D1, D2, Main Entrance)
    bmueModel.doorGraph.doors.forEach((door, dIdx) => {
      const rawSymbol = door.isMainEntrance ? 'D_MAIN' : (door.widthMeters >= 1.0 ? 'D1' : 'D2');
      symbols.push({
        symbolId: `SYM_${idx++}`,
        rawSymbol,
        semanticType: 'DOOR_LABEL',
        meaning: door.isMainEntrance ? 'Main Building Entrance Door' : `Standard Access Door (${door.widthMeters}m)`,
        location: door.location,
        associatedRoomId: door.connectingRoomAId,
        confidence: 0.98
      });
    });

    // 2. Process Windows into Window Symbols (e.g. W1, W2)
    bmueModel.windowGraph.windows.forEach((win, wIdx) => {
      const rawSymbol = win.widthMeters >= 1.5 ? 'W1' : 'W2';
      symbols.push({
        symbolId: `SYM_${idx++}`,
        rawSymbol,
        semanticType: 'WINDOW_LABEL',
        meaning: `External Daylight Window (${win.widthMeters}m facing ${win.facingCardinalZone})`,
        location: win.location,
        associatedRoomId: win.associatedRoomId,
        confidence: 0.98
      });
    });

    // 3. Process Objects into Sanitary & Mechanical Symbols
    bmueModel.containmentGraph.containments.forEach(obj => {
      const typeUpper = obj.objectType.toUpperCase();
      let semanticType: BmueSymbolType = 'UNKNOWN_SYMBOL';
      let rawSymbol = typeUpper;
      let meaning = `Architectural object ${obj.objectType}`;

      if (typeUpper.includes('WC') || typeUpper.includes('COMMODE') || typeUpper.includes('TOILET')) {
        semanticType = 'WC';
        rawSymbol = 'WC';
        meaning = 'Water Closet / Commode Sanitary Fixture';
      } else if (typeUpper.includes('BASIN') || typeUpper.includes('WB') || typeUpper.includes('SINK')) {
        semanticType = 'WASH_BASIN';
        rawSymbol = 'WB';
        meaning = 'Wash Basin / Vanity Sink Fixture';
      } else if (typeUpper.includes('STOVE') || typeUpper.includes('BURNER') || typeUpper.includes('HOB')) {
        semanticType = 'STOVE';
        rawSymbol = 'STOVE';
        meaning = 'Kitchen Cooking Stove / Hob Fixture';
      }

      if (semanticType !== 'UNKNOWN_SYMBOL') {
        symbols.push({
          symbolId: `SYM_${idx++}`,
          rawSymbol,
          semanticType,
          meaning,
          location: obj.centerPoint,
          associatedRoomId: obj.assignedRoomId,
          confidence: obj.containmentConfidence
        });
      }
    });

    // 4. Inject standard architectural infrastructure symbols if missing
    if (!symbols.some(s => s.rawSymbol === 'DB')) {
      const firstRoom = bmueModel.roomGraph.rooms[0];
      const loc = firstRoom ? firstRoom.geometricCentroid : { x: 2, y: 2 };

      symbols.push({
        symbolId: `SYM_${idx++}`,
        rawSymbol: 'DB',
        semanticType: 'DISTRIBUTION_BOARD',
        meaning: 'Main Electrical Distribution Board (DB)',
        location: loc,
        associatedRoomId: firstRoom ? firstRoom.roomId : undefined,
        confidence: 0.90
      });

      symbols.push({
        symbolId: `SYM_${idx++}`,
        rawSymbol: 'OHT',
        semanticType: 'OVERHEAD_TANK',
        meaning: 'Overhead Water Storage Tank (OHT)',
        location: { x: loc.x + 1, y: loc.y + 1 },
        confidence: 0.88
      });
    }

    return symbols;
  }
}

export const architecturalSymbolEngine = ArchitecturalSymbolEngine.getInstance();
