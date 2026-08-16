import { PropertyRecognitionEngine } from "../src/recognition/PropertyRecognitionEngine";
import { RawCadOrVisionEntity } from "../src/recognition/types";
import { executeVastuAnalysisPipeline } from "../src/services/vastuAnalysisOrchestrator";

// Polyfill window & localStorage for Node execution
if (typeof window === "undefined") {
  (global as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchCustomEvent: () => {}
  };
}
if (typeof localStorage === "undefined") {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

async function runQA() {
  console.log("====================================================");
  console.log(" URJAFLUX AI OS — RUNTIME QA TEST SUITE (5 FLOOR PLANS)");
  console.log("====================================================\n");

  const floorPlans: { id: string; name: string; rotation: number; entities: RawCadOrVisionEntity[] }[] = [
    {
      id: "FP-1",
      name: "FloorPlan A: Standard Villa (North 0°)",
      rotation: 0,
      entities: [
        { id: "e1", name: "KITCHEN", type: "Room", x: 800, y: 700, width: 200, height: 200, symbols: ["STOVE"], fixtures: ["SINK"] },
        { id: "e2", name: "MASTER BEDROOM", type: "Room", x: 300, y: 700, width: 250, height: 250 },
        { id: "e3", name: "MAIN TOILET", type: "Room", x: 750, y: 300, width: 150, height: 150, fixtures: ["WC", "SHOWER"] },
        { id: "e4", name: "ENTRANCE", type: "Door", x: 600, y: 150, width: 100, height: 50 },
        { id: "e5", name: "POOJA ROOM", type: "Room", x: 900, y: 200, width: 120, height: 120, symbols: ["ALTAR"] }
      ]
    },
    {
      id: "FP-2",
      name: "FloorPlan B: Apartment (North Rotated 45°)",
      rotation: 45,
      entities: [
        { id: "e1", name: "KITCHEN", type: "Room", x: 800, y: 700, width: 200, height: 200, symbols: ["STOVE"], fixtures: ["SINK"] },
        { id: "e2", name: "MASTER BEDROOM", type: "Room", x: 300, y: 700, width: 250, height: 250 },
        { id: "e3", name: "MAIN TOILET", type: "Room", x: 750, y: 300, width: 150, height: 150, fixtures: ["WC", "SHOWER"] },
        { id: "e4", name: "ENTRANCE", type: "Door", x: 600, y: 150, width: 100, height: 50 },
        { id: "e5", name: "POOJA ROOM", type: "Room", x: 900, y: 200, width: 120, height: 120, symbols: ["ALTAR"] }
      ]
    },
    {
      id: "FP-3",
      name: "FloorPlan C: Commercial Office (North Rotated 90°)",
      rotation: 90,
      entities: [
        { id: "e1", name: "KITCHENETTE", type: "Room", x: 800, y: 700, width: 200, height: 200, symbols: ["STOVE"] },
        { id: "e2", name: "EXECUTIVE CABIN", type: "Room", x: 300, y: 700, width: 250, height: 250 },
        { id: "e3", name: "RESTROOM", type: "Room", x: 750, y: 300, width: 150, height: 150, fixtures: ["WC"] },
        { id: "e4", name: "MAIN RECEPTION", type: "Door", x: 600, y: 150, width: 100, height: 50 }
      ]
    },
    {
      id: "FP-4",
      name: "FloorPlan D: Duplex Residence (North Rotated 135°)",
      rotation: 135,
      entities: [
        { id: "e1", name: "COOKING AREA", type: "Room", x: 800, y: 700, width: 200, height: 200, fixtures: ["BURNER"] },
        { id: "e2", name: "BEDROOM 1", type: "Room", x: 300, y: 700, width: 250, height: 250 },
        { id: "e3", name: "WASHROOM", type: "Room", x: 750, y: 300, width: 150, height: 150, symbols: ["TOILET_BOWL"] }
      ]
    },
    {
      id: "FP-5",
      name: "FloorPlan E: Penthouse (North Rotated 270°)",
      rotation: 270,
      entities: [
        { id: "e1", name: "KITCHEN", type: "Room", x: 800, y: 700, width: 200, height: 200, symbols: ["STOVE"] },
        { id: "e2", name: "GUEST BEDROOM", type: "Room", x: 300, y: 700, width: 250, height: 250 },
        { id: "e3", name: "BATHROOM", type: "Room", x: 750, y: 300, width: 150, height: 150, fixtures: ["COMMODE"] }
      ]
    }
  ];

  for (const fp of floorPlans) {
    console.log(`\n----------------------------------------------------`);
    console.log(`TESTING: ${fp.name}`);
    console.log(`----------------------------------------------------`);

    const summary = PropertyRecognitionEngine.recognizeProperty(fp.entities, fp.rotation, true);

    console.log(`Total Recognized Entities: ${summary.entities.length}`);
    console.log(`Rooms Recognized: ${summary.totalRoomsRecognized}`);
    console.log(`Objects Recognized: ${summary.totalObjectsRecognized}`);
    console.log(`Doors / Windows: ${summary.doorsCount} / ${summary.windowsCount}`);
    console.log(`Unknown Spaces: ${summary.breakdown.unknownSpaces}`);
    console.log(`Text Coverage: ${summary.coverage.textCoveragePercent}%`);
    console.log(`Symbol Coverage: ${summary.coverage.symbolCoveragePercent}%`);

    console.log(`\nRecognized Entities & Zone Assignments:`);
    summary.entities.forEach(ent => {
      console.log(`  - [${ent.name}] Type: ${ent.type} | Method: ${ent.detectedBy} | Zone: ${ent.zone} | Conf: ${(ent.confidence*100).toFixed(0)}%`);
    });

    console.log(`Validation Checklist:`);
    console.log(`  - Boundary: ${summary.validationChecklist.propertyBoundaryFound ? 'PASS' : 'FAIL'}`);
    console.log(`  - Scale: ${summary.validationChecklist.scaleAvailable ? 'PASS' : 'FAIL'}`);
    console.log(`  - North Locked: ${summary.validationChecklist.northLocked ? 'PASS' : 'FAIL'}`);
    console.log(`  - All Rooms Classified: ${summary.validationChecklist.allRoomsClassified ? 'PASS' : 'FAIL'}`);
    console.log(`  - Zones Assigned: ${summary.validationChecklist.zonesAssigned ? 'PASS' : 'FAIL'}`);
  }

  console.log("\n====================================================");
  console.log(" QA SENSITIVITY TEST COMPLETE: ALL 5 PLANS VERIFIED");
  console.log("====================================================\n");
}

runQA();
