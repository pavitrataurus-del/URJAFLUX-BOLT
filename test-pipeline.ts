import { KnowledgeUploadPipelineService } from "./src/services/knowledgeUploadPipelineService";

async function run() {
  const file = {
    name: "scanned-test.pdf",
    size: 50000,
    type: "application/pdf",
    dataUrlOrText: "data:application/pdf;base64,JVBERi..."
  };
  
  await KnowledgeUploadPipelineService.runPipeline(file, (state) => {
    console.log(`[Progress] ${state.stageName || state.currentStep}: ${state.statusMessage}`);
  });
}

run();
