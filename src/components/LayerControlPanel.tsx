import React from 'react';
import { SpatialLayerConfig, LayerType } from '../types';
import { Eye, EyeOff, Sliders, Globe, Layers, CheckCircle2 } from 'lucide-react';

interface LayerControlPanelProps {
  layers: SpatialLayerConfig[];
  onUpdateLayer: (id: LayerType, patch: Partial<SpatialLayerConfig>) => void;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  layers,
  onUpdateLayer,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Source Geospatial Layers
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {layers.filter(l => l.visible).length}/{layers.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {layers.map(layer => {
          return (
            <div
              key={layer.id}
              className={`p-3 rounded-lg border transition-all ${
                layer.visible
                  ? 'bg-slate-850 border-slate-700'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                    className={`p-1 rounded transition-colors ${
                      layer.visible ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: layer.color }}
                      />
                      {layer.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{layer.description}</p>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {layer.sourceCRS}
                </span>
              </div>

              {/* Opacity slider */}
              {layer.visible && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-500" />
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={layer.opacity}
                    onChange={e => onUpdateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-slate-300 w-8 text-right">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
