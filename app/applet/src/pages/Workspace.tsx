import React from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Layers, Database, Activity, Eye, Zap, List } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";

export const Workspace = () => {
  const { rightDockOpen, bottomDockOpen } = useAppStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
      {/* Workspace Toolbar */}
      <div className="h-12 border-b border-border bg-surface flex items-center px-4 gap-2 shrink-0">
        <button className="px-3 py-1.5 text-sm rounded-md bg-brand text-white font-medium hover:bg-brand/90 transition-colors">
          Digital Twin
        </button>
        <button className="px-3 py-1.5 text-sm rounded-md text-foreground-secondary hover:bg-elevated hover:text-foreground transition-colors">
          Knowledge Graph
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          {/* Left Dock: Hierarchy & Data */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-surface border-r border-border flex flex-col">
            <div className="h-10 border-b border-border flex items-center px-3 gap-2 text-sm font-medium text-foreground-secondary bg-elevated shrink-0">
              <Layers className="w-4 h-4" />
              Scene Graph
            </div>
            <div className="flex-1 p-4 text-foreground-muted text-sm overflow-y-auto">
              [Tree View Placeholder]
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-brand/50 transition-colors cursor-col-resize" />
          
          {/* Central Area: Canvas + Bottom Dock */}
          <Panel minSize={30} className="flex flex-col">
            <PanelGroup orientation="vertical">
              {/* Central Canvas */}
              <Panel minSize={40} className="bg-background relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-border mx-auto mb-4" />
                  <p className="text-foreground-muted">WebGL Canvas Placeholder</p>
                  <p className="text-xs text-foreground-muted mt-2">(Digital Twin / Knowledge Graph)</p>
                </div>
                
                {/* Floating Contextual Toolbar Placeholder */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface border border-border shadow-md rounded-md p-1 flex gap-1">
                  <button className="p-2 rounded hover:bg-elevated text-foreground-secondary"><Zap className="w-4 h-4"/></button>
                  <button className="p-2 rounded hover:bg-elevated text-foreground-secondary"><Activity className="w-4 h-4"/></button>
                </div>
              </Panel>
              
              {bottomDockOpen && (
                <>
                  <PanelResizeHandle className="h-1 bg-border hover:bg-brand/50 transition-colors cursor-row-resize" />
                  {/* Bottom Dock: Timeline / Logs */}
                  <Panel defaultSize={25} minSize={15} maxSize={50} className="bg-surface border-t border-border flex flex-col">
                    <div className="h-8 border-b border-border flex items-center px-3 gap-2 text-xs font-medium text-foreground-secondary bg-elevated shrink-0">
                      <List className="w-3 h-3" />
                      Execution Timeline / Logs
                    </div>
                    <div className="flex-1 p-3 text-foreground-muted font-mono text-xs overflow-y-auto">
                      [Virtual List Placeholder]
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
          
          {rightDockOpen && (
            <>
              <PanelResizeHandle className="w-1 bg-border hover:bg-brand/50 transition-colors cursor-col-resize" />
              {/* Right Dock: Inspection & Logic */}
              <Panel defaultSize={25} minSize={20} maxSize={40} className="bg-surface border-l border-border flex flex-col">
                <div className="h-10 border-b border-border flex items-center px-3 gap-2 text-sm font-medium text-foreground-secondary bg-elevated shrink-0">
                  <Database className="w-4 h-4" />
                  Property Inspector
                </div>
                <div className="flex-1 p-4 text-foreground-muted text-sm overflow-y-auto">
                  [Properties Placeholder]
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
};
