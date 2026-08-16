import React, { useState, useEffect } from 'react';
import { 
  Settings, Lock, Unlock, Eye, EyeOff, Compass, Layers, 
  RotateCcw, Sliders, Shield, CornerUpLeft, CornerUpRight, Move
} from 'lucide-react';
import { engineAdapter } from '../core/adapters/EngineAdapter';
import { UpdateObjectCommand } from '../core/commands/ObjectCommands';
import { USOMObjectType, USOMBaseObject } from '../core/usom/types';

interface MasterChakraInspectorPanelProps {
  selectedObjectId?: string | null;
  onClose?: () => void;
}

const DEFAULT_LAYERS = [
  { key: 'directionChakra', label: '8/16 Direction Compass Ring', category: 'Geometry' },
  { key: 'entrances32', label: '32 Padavinyasa Entrances', category: 'Entrances' },
  { key: 'devta45', label: '45 Devta Mandala Fields', category: 'Deities' },
  { key: 'panchatattva', label: 'Panchatattva 5 Elements', category: 'Elements' },
  { key: 'zones16', label: '16 Vastu Energy Zones', category: 'Zones' },
];

export const MasterChakraInspectorPanel: React.FC<MasterChakraInspectorPanelProps> = ({
  selectedObjectId,
  onClose
}) => {
  // Purely a revision tick for triggering React re-renders when Core Engine publishes events.
  // NO state values like centerX, rotation, etc. are duplicated in React state!
  const [, setRevision] = useState(0);

  useEffect(() => {
    const handleEngineEvent = (event: any) => {
      if (
        event.type === 'OBJECT_UPDATED' ||
        event.type === 'OBJECT_ADDED' ||
        event.type === 'OBJECT_REMOVED' ||
        event.type === 'SELECTION_CHANGED' ||
        event.type === 'COMMAND_EXECUTED' ||
        event.type === 'COMMAND_UNDONE' ||
        event.type === 'COMMAND_REDONE' ||
        event.type === 'DIRECTION_CHANGED'
      ) {
        setRevision(r => r + 1);
      }
    };

    const sub1 = engineAdapter.subscribe('OBJECT_UPDATED', handleEngineEvent);
    const sub2 = engineAdapter.subscribe('SELECTION_CHANGED', handleEngineEvent);
    const sub3 = engineAdapter.subscribe('COMMAND_EXECUTED', handleEngineEvent);
    const sub4 = engineAdapter.subscribe('COMMAND_UNDONE', handleEngineEvent);
    const sub5 = engineAdapter.subscribe('COMMAND_REDONE', handleEngineEvent);
    const sub6 = engineAdapter.subscribe('DIRECTION_CHANGED', handleEngineEvent);

    return () => {
      engineAdapter.unsubscribe(sub1);
      engineAdapter.unsubscribe(sub2);
      engineAdapter.unsubscribe(sub3);
      engineAdapter.unsubscribe(sub4);
      engineAdapter.unsubscribe(sub5);
      engineAdapter.unsubscribe(sub6);
    };
  }, []);

  // 1. Resolve active Master Chakra object directly from Core Engine
  const selection = engineAdapter.getSelection();
  const targetId = selectedObjectId || selection.find(id => {
    const obj = engineAdapter.getObject(id);
    return obj?.type === USOMObjectType.CHAKRA || id === 'master-chakra';
  }) || 'master-chakra';

  let chakraObject: USOMBaseObject | undefined = engineAdapter.getObject(targetId);

  // Fallback check if any CHAKRA object exists in core
  if (!chakraObject) {
    chakraObject = engineAdapter.getAllObjects().find(o => o.type === USOMObjectType.CHAKRA || o.id === 'master-chakra');
  }

  if (!chakraObject) {
    return (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono text-center">
        No Master Chakra selected in Core Engine.
      </div>
    );
  }

  // 2. Read values directly from the Core Engine object (NO duplicated React state)
  const posX = Math.round(chakraObject.transform.position.x);
  const posY = Math.round(chakraObject.transform.position.y);
  
  const baseRadius = chakraObject.metadata?.baseRadius || 420;
  const currentScale = chakraObject.transform.scale.x || 1;
  const radius = Math.round(baseRadius * currentScale);

  const rotation = Math.round((chakraObject.transform.rotation % 360 + 360) % 360);
  const northBearing = Math.round((((chakraObject.metadata?.northBearing ?? rotation) % 360) + 360) % 360);
  
  const isVisible = chakraObject.isVisible ?? true;
  const isLocked = chakraObject.isLocked ?? false;
  const opacity = chakraObject.metadata?.opacity ?? 1.0;

  const layerVisibility = chakraObject.metadata?.layerVisibility || {
    directionChakra: true,
    entrances32: true,
    devta45: true,
    panchatattva: true,
    zones16: true
  };

  // Helper helper to dispatch commands
  const dispatchUpdate = (updates: Partial<USOMBaseObject>) => {
    const command = new UpdateObjectCommand(chakraObject!.id, updates);
    const engine = engineAdapter.getEngine();
    if (engine) {
      engine.commands.execute(command, engine.objects);
    } else {
      engineAdapter.dispatchCommand(command);
    }
  };

  // --- HANDLERS (Command Engine Dispatchers) ---
  const handlePositionXChange = (val: number) => {
    dispatchUpdate({
      transform: {
        ...chakraObject!.transform,
        position: { x: val, y: chakraObject!.transform.position.y }
      }
    });
  };

  const handlePositionYChange = (val: number) => {
    dispatchUpdate({
      transform: {
        ...chakraObject!.transform,
        position: { x: chakraObject!.transform.position.x, y: val }
      }
    });
  };

  const handleRadiusChange = (newRadius: number) => {
    const scaleFactor = Math.max(0.1, newRadius / baseRadius);
    dispatchUpdate({
      transform: {
        ...chakraObject!.transform,
        scale: { x: scaleFactor, y: scaleFactor }
      }
    });
  };

  const handleRotationChange = (newDeg: number) => {
    const normalized = (newDeg % 360 + 360) % 360;
    try {
      const dirEngine = engineAdapter.getDirectionEngine();
      if (dirEngine) {
        dirEngine.setUserNorth(normalized);
      }
    } catch {
      // ignore if engine loading
    }
    dispatchUpdate({
      transform: {
        ...chakraObject!.transform,
        rotation: normalized
      }
    });
  };

  const handleNorthBearingChange = (newBearing: number) => {
    const normalized = (newBearing % 360 + 360) % 360;
    try {
      const dirEngine = engineAdapter.getDirectionEngine();
      if (dirEngine) {
        dirEngine.setTrueNorth(normalized);
      }
    } catch {
      // ignore if engine loading
    }
    dispatchUpdate({
      metadata: {
        ...chakraObject!.metadata,
        northBearing: normalized
      }
    });
  };

  const handleToggleVisibility = () => {
    dispatchUpdate({ isVisible: !isVisible });
  };

  const handleToggleLock = () => {
    dispatchUpdate({ isLocked: !isLocked });
  };

  const handleOpacityChange = (val: number) => {
    dispatchUpdate({
      metadata: {
        ...chakraObject!.metadata,
        opacity: val
      }
    });
  };

  const handleLayerToggle = (layerKey: string) => {
    dispatchUpdate({
      metadata: {
        ...chakraObject!.metadata,
        layerVisibility: {
          ...layerVisibility,
          [layerKey]: !layerVisibility[layerKey]
        }
      }
    });
  };

  const handleUndo = async () => {
    const engine = engineAdapter.getEngine();
    if (engine) {
      await engine.commands.undo(engine.objects);
    }
  };

  const handleRedo = async () => {
    const engine = engineAdapter.getEngine();
    if (engine) {
      await engine.commands.redo(engine.objects);
    }
  };

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl p-4 font-mono text-xs text-slate-200 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 tracking-wide text-xs">Master Chakra Inspector</h3>
            <span className="text-[10px] text-slate-400">USOM Core Engine • Object: {chakraObject.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            title="Undo Command"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            title="Redo Command"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <CornerUpRight className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-slate-100 text-slate-400 transition-all"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Primary Status & Lock / Visibility Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleToggleLock}
          className={`px-3 py-2 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
            isLocked
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
        </button>

        <button
          onClick={handleToggleVisibility}
          className={`px-3 py-2 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
            isVisible
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
          }`}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isVisible ? 'Visible' : 'Hidden'}</span>
        </button>
      </div>

      {/* Center X & Center Y */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
          <Move className="w-3 h-3 text-emerald-400" />
          Center Coordinates (X, Y)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Center X (px)</label>
            <input
              type="number"
              value={posX}
              disabled={isLocked}
              onChange={e => handlePositionXChange(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Center Y (px)</label>
            <input
              type="number"
              value={posY}
              disabled={isLocked}
              onChange={e => handlePositionYChange(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Radius Controls */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Chakra Radius
          </span>
          <span className="text-emerald-400 font-bold">{radius} px</span>
        </div>
        <input
          type="range"
          min="50"
          max="1200"
          step="5"
          value={radius}
          disabled={isLocked}
          onChange={e => handleRadiusChange(parseInt(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
        />
      </div>

      {/* Rotation Controls */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Rotation Angle
          </span>
          <span className="text-emerald-400 font-bold">{rotation}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="359"
          value={rotation}
          disabled={isLocked}
          onChange={e => handleRotationChange(parseInt(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
        />
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleRotationChange(0)}
            disabled={isLocked}
            className="flex-1 py-1 px-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 hover:text-slate-100 uppercase font-bold transition-all disabled:opacity-50"
          >
            Reset (0°)
          </button>
        </div>
      </div>

      {/* North Bearing Controls */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            North Bearing
          </span>
          <span className="text-sky-400 font-bold">{northBearing}° N</span>
        </div>
        <input
          type="range"
          min="0"
          max="359"
          value={northBearing}
          disabled={isLocked}
          onChange={e => handleNorthBearingChange(parseInt(e.target.value))}
          className="w-full accent-sky-500 cursor-pointer disabled:opacity-50"
        />
      </div>

      {/* Opacity Controls */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Master Opacity
          </span>
          <span className="text-slate-200 font-bold">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={e => handleOpacityChange(parseFloat(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
      </div>

      {/* Layer Visibility Section */}
      <div className="space-y-2 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Layer Visibility Controls</span>
        </div>

        <div className="space-y-1.5">
          {DEFAULT_LAYERS.map(layer => {
            const isEnabled = layerVisibility[layer.key] !== false;
            return (
              <label
                key={layer.key}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleLayerToggle(layer.key)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-slate-200 font-semibold">{layer.label}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                  {layer.category}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 text-[9px] text-slate-500 text-center border-t border-slate-900">
        Dispatches CommandEngine updates • Zero duplicated state
      </div>
    </div>
  );
};
