import React, { useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Target, Navigation, BoxSelect, Maximize } from "lucide-react";
import { IKnowledgeGraph, IGraphNode, IGraphEdge } from "../models/GraphModels";

export default function GraphViewer({ graph, selectedNodeId, onSelectNode, selectedEdgeId, onSelectEdge, viewState, setViewState }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        renderCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute a simple force-directed or circle layout if nodes don't have positions
  // For the sake of the viewer, we mock positions based on ID hash if properties.x is missing
  const getNodePosition = (node: IGraphNode, canvasWidth: number, canvasHeight: number) => {
    if (node.properties?.x !== undefined && node.properties?.y !== undefined) {
      return { x: node.properties.x, y: node.properties.y };
    }
    const hash = node.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
    const angle = (hash % 360) * (Math.PI / 180);
    return {
      x: canvasWidth / 2 + Math.cos(angle) * radius,
      y: canvasHeight / 2 + Math.sin(angle) * radius
    };
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background Grid
    ctx.strokeStyle = "#0f172a"; // slate-900
    ctx.lineWidth = 1;
    const gridSize = 100 * (viewState.zoom / 100);
    for (let x = viewState.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = viewState.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    if (!graph) return;

    const scale = viewState.zoom / 100;

    // Render Edges
    graph.edges.forEach((edge: IGraphEdge) => {
      const source = graph.nodes.find((n: IGraphNode) => n.id === edge.sourceId);
      const target = graph.nodes.find((n: IGraphNode) => n.id === edge.targetId);
      if (!source || !target) return;

      const p1 = getNodePosition(source, canvas.width, canvas.height);
      const p2 = getNodePosition(target, canvas.width, canvas.height);

      const x1 = viewState.x + p1.x * scale;
      const y1 = viewState.y + p1.y * scale;
      const x2 = viewState.x + p2.x * scale;
      const y2 = viewState.y + p2.y * scale;

      const isSelected = edge.id === selectedEdgeId;
      ctx.strokeStyle = isSelected ? "#818cf8" : "#334155";
      ctx.lineWidth = isSelected ? 3 : 1.5;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw label roughly in middle
      if (isSelected) {
        ctx.fillStyle = "#818cf8";
        ctx.font = "10px monospace";
        ctx.fillText(edge.type, (x1 + x2) / 2, (y1 + y2) / 2 - 5);
      }
    });

    // Render Nodes
    graph.nodes.forEach((node: IGraphNode) => {
      const pos = getNodePosition(node, canvas.width, canvas.height);
      const x = viewState.x + pos.x * scale;
      const y = viewState.y + pos.y * scale;
      const isSelected = node.id === selectedNodeId;
      const radius = 24 * scale;

      // Draw shadow/glow if selected
      if (isSelected) {
        ctx.shadowColor = "#818cf8";
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isSelected ? "rgba(99, 102, 241, 0.2)" : "#1e293b";
      ctx.strokeStyle = isSelected ? "#818cf8" : "#64748b";
      ctx.lineWidth = isSelected ? 2 : 1;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Label
      ctx.fillStyle = isSelected ? "#ffffff" : "#cbd5e1";
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayLabel = node.label.length > 12 ? node.label.substring(0, 10) + ".." : node.label;
      ctx.fillText(displayLabel, x, y);
    });
  };

  useEffect(() => {
    renderCanvas();
  }, [graph, selectedNodeId, selectedEdgeId, viewState]);

  const handleZoom = (delta: number) => {
    setViewState((prev: any) => ({ ...prev, zoom: Math.max(20, Math.min(prev.zoom + delta, 300)) }));
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 cursor-crosshair"
      />
      
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a101d] border border-slate-700 shadow-xl rounded-lg p-1.5 flex gap-1 z-10">
        <button className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Pan"><Navigation className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Select"><BoxSelect className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-700 my-auto mx-1" />
        <button onClick={() => handleZoom(20)} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => handleZoom(-20)} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={() => setViewState({zoom: 100, x: 0, y: 0})} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Fit to Screen"><Maximize className="w-4 h-4" /></button>
      </div>

      {/* Mini Map Placeholder */}
      <div className="absolute bottom-4 right-4 w-32 h-24 bg-[#0a101d]/80 backdrop-blur border border-slate-700 rounded-lg p-1 z-10 hidden sm:block">
        <div className="w-full h-full border border-slate-800 rounded bg-[#05080f] relative overflow-hidden">
          <div className="absolute inset-0 m-auto w-10 h-8 border border-indigo-500/50 bg-indigo-500/10" />
        </div>
      </div>
    </div>
  );
}
