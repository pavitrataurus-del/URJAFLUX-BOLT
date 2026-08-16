import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Pin, PinOff, Minimize2, Maximize2, X, Move } from 'lucide-react';
import { IDockPanelState, PanelId, DockPosition } from '../../core/docking/DockTypes';
import { DockManager } from '../../core/docking/DockManager';

interface DockPanelProps {
  panel: IDockPanelState;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DockPanel({ panel, onClose, children }: DockPanelProps) {
  const manager = DockManager.getInstance();
  const [isPinned, setIsPinned] = useState(panel.isPinned);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIsPinned(panel.isPinned);
  }, [panel.isPinned]);

  const togglePin = () => {
    const newPin = !isPinned;
    setIsPinned(newPin);
    manager.updatePanel(panel.id, { isPinned: newPin });
  };

  const handleFloatToggle = () => {
    if (panel.position === 'FLOATING') {
      manager.movePanel(panel.id, 'RIGHT');
    } else {
      manager.movePanel(panel.id, 'FLOATING');
      manager.updatePanel(panel.id, {
        floatingX: window.innerWidth / 2 - panel.width / 2,
        floatingY: window.innerHeight / 2 - 150
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panel.position !== 'FLOATING') return;
    setIsDragging(true);
    const startX = e.clientX - (panel.floatingX || 0);
    const startY = e.clientY - (panel.floatingY || 0);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      manager.updatePanel(panel.id, {
        floatingX: moveEvent.clientX - startX,
        floatingY: moveEvent.clientY - startY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const panelStyles: React.CSSProperties = panel.position === 'FLOATING' ? {
    position: 'fixed',
    left: `${panel.floatingX || 100}px`,
    top: `${panel.floatingY || 100}px`,
    width: `${panel.width}px`,
    height: `${panel.height}px`,
    zIndex: 9999,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  } : {};

  return (
    <div
      id={`dock-panel-${panel.id}`}
      style={panelStyles}
      className={`flex flex-col bg-[#070b13] border border-slate-800/80 h-full ${
        panel.position !== 'FLOATING' ? 'w-full' : ''
      }`}
    >
      {/* Panel Header */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-8 border-b border-slate-800/80 bg-[#090e18] flex items-center justify-between px-2.5 shrink-0 select-none ${
          panel.position === 'FLOATING' ? 'cursor-move' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {panel.position === 'FLOATING' && <Move className="w-3 h-3 text-slate-500" />}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            {panel.title}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {panel.position !== 'FLOATING' && (
            <button
              onClick={togglePin}
              className={`p-1 rounded-sm hover:bg-slate-800 transition-colors ${
                isPinned ? 'text-emerald-400' : 'text-slate-500'
              }`}
              title={isPinned ? 'Unpin Panel' : 'Pin Panel'}
            >
              {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={handleFloatToggle}
            className="p-1 rounded-sm hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title={panel.position === 'FLOATING' ? 'Dock Panel' : 'Float Panel'}
          >
            {panel.position === 'FLOATING' ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
            title="Close Panel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Panel Content View */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-[#060911] custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
