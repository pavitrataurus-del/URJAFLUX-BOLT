import { describe, it, expect, vi } from "vitest";
import { EventBus, IEvent } from "../index";

describe("Enterprise Event Bus", () => {
  it("should allow pub/sub of events", async () => {
    const bus = EventBus.getInstance();
    
    const handler = vi.fn();
    const sub = bus.subscribe("TEST_EVENT", handler);
    
    const event: IEvent = {
      id: "ev1",
      type: "TEST_EVENT",
      payload: { data: 123 },
      timestamp: Date.now()
    };
    
    await bus.publish(event);
    
    // Using a tiny timeout to allow async execution
    await new Promise(r => setTimeout(r, 10));
    
    expect(handler).toHaveBeenCalledWith(event);
    
    const history = bus.getHistory();
    expect(history).toContain(event);
    
    sub.unsubscribe();
  });
});
