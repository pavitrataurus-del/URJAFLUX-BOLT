import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceEngine } from '../WorkspaceEngine';
import { EventEngine } from '../../events/EventEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';

describe('WorkspaceEngine', () => {
  let events: EventEngine;
  let objects: ObjectEngine;
  let workspace: WorkspaceEngine;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    
    objects = new ObjectEngine(events);
    await objects.initialize();
    
    workspace = new WorkspaceEngine(events, objects);
    await workspace.initialize();
  });

  it('initializes sub-components', () => {
    expect(workspace.camera).toBeDefined();
    expect(workspace.canvas).toBeDefined();
    expect(workspace.grid).toBeDefined();
    expect(workspace.coords).toBeDefined();
    expect(workspace.navigation).toBeDefined();
  });
});
