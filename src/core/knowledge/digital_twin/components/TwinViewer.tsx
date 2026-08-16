import React, { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Maximize, Target, Navigation, BoxSelect, Ruler, Scaling } from "lucide-react";

export default function TwinViewer({ twin, selectedObjectId, onSelectObject, viewState, setViewState }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize canvas to fit container
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

  // Simple render loop for mock digital twin viewer
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = "#1e293b"; // slate-800
    ctx.lineWidth = 1;
    const gridSize = 50 * (viewState.zoom / 100);
    for (let x = viewState.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = viewState.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Origin crosshair
    ctx.strokeStyle = "#334155";
    ctx.beginPath(); ctx.moveTo(viewState.x, 0); ctx.lineTo(viewState.x, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, viewState.y); ctx.lineTo(canvas.width, viewState.y); ctx.stroke();

    // Render Objects (mocking geometry representation)
    if (twin && twin.objects) {
      twin.objects.forEach((obj: any) => {
        const isSelected = obj.id === selectedObjectId;
        const geom = obj.geometry;
        if (!geom) return;

        // Extract mock coords (assuming 2D polygon)
        // Format of ISpatialGeometry might vary, fallback to default drawing if undefined
        ctx.fillStyle = isSelected ? "rgba(16, 185, 129, 0.2)" : "rgba(51, 65, 85, 0.2)";
        ctx.strokeStyle = isSelected ? "#10b981" : "#475569";
        ctx.lineWidth = isSelected ? 2 : 1;

        if (geom.points && geom.points.length > 0) {
          ctx.beginPath();
          geom.points.forEach((p: any, i: number) => {
            const px = viewState.x + p.x * (viewState.zoom / 100);
            const py = viewState.y + p.y * (viewState.zoom / 100);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Fallback box
          const size = 100 * (viewState.zoom / 100);
          // Hashing ID for mock pos
          const hash = obj.id.split('').reduce((a:number, b:string) => a + b.charCodeAt(0), 0);
          const px = viewState.x + (hash % 500);
          const py = viewState.y + ((hash * 7) % 500);
          
          ctx.fillRect(px, py, size, size);
          ctx.strokeRect(px, py, size, size);
          
          if (isSelected) {
            ctx.fillStyle = "#10b981";
            ctx.font = "10px monospace";
            ctx.fillText(obj.canonicalType, px, py - 5);
          }
        }
      });
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [twin, selectedObjectId, viewState]);

  const handleZoom = (delta: number) => {
    setViewState((prev: any) => ({ ...prev, zoom: Math.max(10, Math.min(prev.zoom + delta, 500)) }));
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 cursor-crosshair"
      />
      
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a101d] border border-slate-700 shadow-xl rounded-lg p-1.5 flex gap-1 z-10">
        <button onClick={() => setViewState((prev:any) => ({...prev, mode: "pan"}))} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${viewState.mode === "pan" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-slate-800 text-slate-400"}`} title="Pan"><Navigation className="w-4 h-4" /></button>
        <button onClick={() => setViewState((prev:any) => ({...prev, mode: "select"}))} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${viewState.mode === "select" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-slate-800 text-slate-400"}`} title="Select"><BoxSelect className="w-4 h-4" /></button>
        <button onClick={() => setViewState((prev:any) => ({...prev, mode: "measure"}))} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${viewState.mode === "measure" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-slate-800 text-slate-400"}`} title="Measure Distance (Placeholder)"><Ruler className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-700 my-auto mx-1" />
        <button onClick={() => handleZoom(10)} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => handleZoom(-10)} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={() => setViewState({zoom: 100, x: 0, y: 0, mode: "pan"})} className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors" title="Reset View"><Target className="w-4 h-4" /></button>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-4 right-4 w-32 h-32 bg-[#0a101d]/80 backdrop-blur border border-slate-700 rounded-lg p-1 z-10 hidden sm:block">
        <div className="w-full h-full border border-slate-800 rounded bg-[#05080f] relative overflow-hidden">
          <div className="absolute inset-0 m-auto w-16 h-16 border border-emerald-500/30 bg-emerald-500/10" />
        </div>
      </div>
    </div>
  );
}
