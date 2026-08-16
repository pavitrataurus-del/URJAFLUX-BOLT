import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Palette } from 'lucide-react';
import { Layer } from '../../core/spatial/SpatialTypes';

interface LayerManagerPanelProps {
  layers: Layer[];
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
}

export const LayerManagerPanel: React.FC<LayerManagerPanelProps> = ({
  layers,
  onToggleVisibility,
  onToggleLock
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Layer Manager ({layers.length})
        </h3>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
              layer.isVisible
                ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: layer.colorHex }}
              />
              <span className="font-semibold truncate">{layer.name}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onToggleLock(layer.id)}
                className={`p-1 rounded transition ${layer.isLocked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={layer.isLocked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => onToggleVisibility(layer.id)}
                className={`p-1 rounded transition ${layer.isVisible ? 'text-emerald-400' : 'text-slate-600'}`}
                title={layer.isVisible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
