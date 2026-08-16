import { describe, it, expect, vi } from "vitest";
import { PipelineManager, IPipelineDefinition, IPipelineContext } from "../index";

describe("Processing Pipeline Framework", () => {
  it("should execute stages sequentially", async () => {
    const manager = PipelineManager.getInstance();
    
    const context: IPipelineContext = { id: "test-pipeline-1", metadata: {}, state: {} };
    
    const stage1 = {
      id: "s1", name: "Stage 1",
      execute: vi.fn().mockResolvedValue("output1")
    };
    
    const stage2 = {
      id: "s2", name: "Stage 2",
      execute: vi.fn().mockResolvedValue("output2")
    };
    
    const definition: IPipelineDefinition = {
      id: "def1", name: "Test Definition",
      stages: [stage1, stage2]
    };
    
    const pipeline = manager.createPipeline(definition, context);
    
    const result = await pipeline.execute("input0");
    
    expect(result.output).toBe("output2");
    expect(stage1.execute).toHaveBeenCalledWith("input0", context);
    expect(stage2.execute).toHaveBeenCalledWith("output1", context);
  });
});
