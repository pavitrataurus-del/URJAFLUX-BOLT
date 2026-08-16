import { buildingElementRegistry } from '../services/spatial/BuildingElementRegistry';
import { executeVastuAnalysisPipeline } from '../services/vastuAnalysisOrchestrator';
import { EnterpriseCognitiveReasoningService } from '../core/knowledge_ingestion/reasoning/EnterpriseCognitiveReasoningService';
import { PropertyRecognitionEngine } from '../recognition/PropertyRecognitionEngine';

// Polyfill minimal browser environment if running in Node
if (typeof global.window === 'undefined') {
  (global as any).window = global;
}
if (typeof global.localStorage === 'undefined') {
  const memoryStore = new Map<string, string>();
  (global as any).localStorage = {
    getItem: (key: string) => memoryStore.get(key) || null,
    setItem: (key: string, val: string) => memoryStore.set(key, val),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear()
  };
}

async function runLiveFounderVerificationReport() {
  console.log("================================================================================");
  console.log("             URJAFLUX AI OS - LIVE FOUNDER VERIFICATION REPORT                 ");
  console.log("================================================================================");

  // 1. Setup spatial entities on CAD Blueprint canvas with real polygon coordinates
  const rawCadEntities = [
    {
      id: "ENT-KITCHEN-01",
      name: "Kitchen",
      type: "kitchen",
      x: 450,
      y: 100,
      width: 120,
      height: 100,
      confidence: 0.96,
      polygon: [{ x: 450, y: 100 }, { x: 570, y: 100 }, { x: 570, y: 200 }, { x: 450, y: 200 }]
    },
    {
      id: "ENT-TOILET-01",
      name: "Main Toilet",
      type: "toilet",
      x: 480,
      y: 80,
      width: 80,
      height: 80,
      confidence: 0.98,
      polygon: [{ x: 480, y: 80 }, { x: 560, y: 80 }, { x: 560, y: 160 }, { x: 480, y: 160 }]
    },
    {
      id: "ENT-BEDROOM-01",
      name: "Master Bedroom",
      type: "bedroom",
      x: 100,
      y: 400,
      width: 150,
      height: 150,
      confidence: 0.94,
      polygon: [{ x: 100, y: 400 }, { x: 250, y: 400 }, { x: 250, y: 550 }, { x: 100, y: 550 }]
    },
    {
      id: "ENT-ENTRANCE-01",
      name: "Main Entrance",
      type: "entrance",
      x: 300,
      y: 50,
      width: 60,
      height: 40,
      confidence: 0.95,
      polygon: [{ x: 300, y: 50 }, { x: 360, y: 50 }, { x: 360, y: 90 }, { x: 300, y: 90 }]
    }
  ];

  buildingElementRegistry.syncCadEntities(rawCadEntities as any);

  // 2. Run Property Recognition Engine (PRE) to get AI Recognition JSON
  const initialRecognition = PropertyRecognitionEngine.recognizeProperty(rawCadEntities as any, 0, true);

  console.log("\n================================================================================");
  console.log("     1. ORIGINAL AI RECOGNITION JSON (BEFORE RULE ENGINE PROCESSING)");
  console.log("================================================================================");
  console.log(JSON.stringify(initialRecognition, null, 2));

  // 3. Execute full orchestration pipeline with Chakra Angle Vector Sync & PDF Knowledge Binding
  const result = await executeVastuAnalysisPipeline(buildingElementRegistry.getCadEntities(), null, 0, 0);

  console.log("\n================================================================================");
  console.log("     2. REASONING PIPELINE AUDIT & KNOWLEDGE BINDING VERIFICATION");
  console.log("================================================================================\n");

  const cadEntities = buildingElementRegistry.getCadEntities();
  const consistencyReportItems: Array<{
    id: number;
    object: string;
    zone: string;
    rule: string;
    chunkId: string;
    book: string;
    quote: string;
    remedy: string;
    status: "PASS" | "FAIL";
    failureReason?: string;
  }> = [];

  result.doshas.forEach((dosha, index) => {
    const matchedEntity = cadEntities.find(e => 
      e.name === dosha.elementName || 
      e.id === dosha.elementName || 
      (dosha.elementName || "").toLowerCase().includes(e.type || "")
    ) || cadEntities[index % cadEntities.length];

    const posX = matchedEntity ? matchedEntity.x : 200;
    const posY = matchedEntity ? matchedEntity.y : 200;
    const w = matchedEntity ? matchedEntity.width || 100 : 100;
    const h = matchedEntity ? matchedEntity.height || 100 : 100;

    const roomCenter = { x: posX + w / 2, y: posY + h / 2 };
    const propertyCenter = { x: 300, y: 300 };
    const vectorSync = EnterpriseCognitiveReasoningService.verifyChakraAngleVectorSync(
      roomCenter,
      propertyCenter,
      0,
      0
    );

    const actualPolygon = (matchedEntity as any)?.polygon || [
      { x: posX, y: posY },
      { x: posX + w, y: posY },
      { x: posX + w, y: posY + h },
      { x: posX, y: posY + h }
    ];
    const polygonStr = JSON.stringify(actualPolygon);
    const centroidStr = `X: ${roomCenter.x}, Y: ${roomCenter.y}`;
    
    const citation = dosha.citationMetadata;
    const isVerifiedChunk = Boolean(citation && citation.isVerifiedPDFChunk && dosha.remedy !== "UNVERIFIED" && !dosha.remedy.includes("KNOWLEDGE BINDING ERROR"));

    // Expected Topic vs Chunk Topic Check
    const objType = ((matchedEntity ? matchedEntity.type : dosha.elementName) || "").toLowerCase();
    const title = (dosha.title || "").toLowerCase();
    const ruleId = (dosha.ruleId || "").toLowerCase();

    let expectedTopic = "";
    if (title.includes("ayadi") || title.includes("yoni") || ruleId.includes("ayadi") || title.includes("inauspicious ayadi")) {
      expectedTopic = "ayadi";
    } else if (title.includes("kitchen") || title.includes("agni") || objType.includes("kitchen")) {
      expectedTopic = "kitchen";
    } else if (title.includes("toilet") || title.includes("drainage") || objType.includes("toilet")) {
      expectedTopic = "toilet";
    } else if (title.includes("bedroom") || title.includes("nairrutya") || objType.includes("bedroom")) {
      expectedTopic = "bedroom";
    }

    const exactKVQuery = `KnowledgeVaultQuery { objectType: "${objType}", zone: "${dosha.zone}", expectedTopic: "${expectedTopic}", ruleId: "${ruleId}" }`;

    // Chain Consistency Verification (5 Items):
    // 1. Detected Object -> 2. Actual Zone -> 3. Matching Rule -> 4. Chunk & Quote -> 5. Remedy
    let isChainConsistent = true;
    let failureReason = "";

    if (!isVerifiedChunk) {
      isChainConsistent = false;
      failureReason = "Chunk unverified or Knowledge Binding Error";
    } else {
      // Check if chunk belongs to another rule topic
      if (expectedTopic === "ayadi" && !citation.chunkId.includes("10005")) {
        isChainConsistent = false;
        failureReason = `Chunk ${citation.chunkId} belongs to another rule, not Ayadi Formulas.`;
      } else if (expectedTopic === "kitchen" && !citation.chunkId.includes("10002")) {
        isChainConsistent = false;
        failureReason = `Chunk ${citation.chunkId} belongs to another rule, not Kitchen Rules.`;
      } else if (expectedTopic === "toilet" && !citation.chunkId.includes("10001")) {
        isChainConsistent = false;
        failureReason = `Chunk ${citation.chunkId} belongs to another rule, not Toilet Rules.`;
      } else if (expectedTopic === "bedroom" && !citation.chunkId.includes("10004")) {
        isChainConsistent = false;
        failureReason = `Chunk ${citation.chunkId} belongs to another rule, not Bedroom Rules.`;
      }
    }

    const finalStatus: "PASS" | "FAIL" = isChainConsistent ? "PASS" : "FAIL";

    console.log(`FINDING #${index + 1}: ${dosha.title}`);
    console.log(`1.  Detected Object:          ${matchedEntity ? matchedEntity.name : dosha.elementName} (${matchedEntity ? matchedEntity.type : 'spatial_element'})`);
    console.log(`2.  Detected Polygon:         ${polygonStr}`);
    console.log(`3.  Centroid:                 ${centroidStr}`);
    console.log(`4.  Calculated Angle:         ${vectorSync.rawBearing}° (Raw Bearing)`);
    console.log(`5.  Calibrated Angle:         ${vectorSync.degreeVector}° (Chakra Overlay Net Vector)`);
    console.log(`6.  Final Vastu Zone:         ${dosha.zone}`);
    console.log(`7.  Rule Applied:             ${dosha.ruleId} - ${dosha.title}`);
    console.log(`8.  Exact KnowledgeVault Query: ${exactKVQuery}`);
    console.log(`9.  Exact PDF Chunk Used:     ${citation ? citation.chunkId : 'CHUNK-N/A'}`);
    console.log(`10. Book Title:               ${!isChainConsistent ? 'UNVERIFIED' : citation.sourceBook}`);
    console.log(`11. Chapter:                  ${!isChainConsistent ? 'UNVERIFIED' : (citation.chapter || 'N/A')}`);
    console.log(`12. Page Number:              ${!isChainConsistent ? 'UNVERIFIED' : citation.pageNumber}`);
    console.log(`13. Quoted Text:              "${!isChainConsistent ? 'No verified PDF text chunk found.' : citation.verifiedTextChunk}"`);
    console.log(`14. Remedy Source:            ${!isChainConsistent ? 'UNVERIFIED' : dosha.remedy}`);
    console.log(`15. Confidence:               ${matchedEntity ? (matchedEntity.confidence * 100).toFixed(1) : '95.0'}%`);
    console.log(`16. Rule Binding Verification: ${finalStatus} ${failureReason ? `(${failureReason})` : ''}`);
    console.log("--------------------------------------------------------------------------------\n");

    consistencyReportItems.push({
      id: index + 1,
      object: matchedEntity ? matchedEntity.name : dosha.elementName,
      zone: dosha.zone,
      rule: `${dosha.ruleId} - ${dosha.title}`,
      chunkId: citation ? citation.chunkId : "N/A",
      book: !isChainConsistent ? "UNVERIFIED" : citation.sourceBook,
      quote: !isChainConsistent ? "UNVERIFIED" : citation.verifiedTextChunk,
      remedy: !isChainConsistent ? "UNVERIFIED" : dosha.remedy,
      status: finalStatus,
      failureReason: failureReason || undefined
    });
  });

  // 4. Generate & Print Final Consistency Report Summary
  console.log("================================================================================");
  console.log("                       3. FINAL CONSISTENCY REPORT                             ");
  console.log("================================================================================");
  console.table(consistencyReportItems.map(item => ({
    "Finding #": item.id,
    "Object": item.object,
    "Zone": item.zone,
    "Rule": item.rule.substring(0, 35),
    "Chunk ID": item.chunkId,
    "Book": item.book,
    "Status": item.status,
    "Failure Reason": item.failureReason || "None (Consistently Bound)"
  })));

  console.log("\n================================================================================");
  console.log("                   FOUNDER VERIFICATION REPORT COMPLETE                        ");
  console.log("================================================================================");
}

runLiveFounderVerificationReport().catch((err) => {
  console.error("Live Verification Failed:", err);
});
