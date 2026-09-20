import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  FileCode, 
  Layers, 
  RefreshCw, 
  MapPin, 
  Globe 
} from 'lucide-react';

interface DataIngestModalProps {
  onClose: () => void;
  onIngest: (datasetName: string) => Promise<any>;
}

export const DataIngestModal: React.FC<DataIngestModalProps> = ({
  onClose,
  onIngest,
}) => {
  const [selectedPreset, setSelectedPreset] = useState('Sector 14 Smart City (Pune)');
  const [selectedCRS, setSelectedCRS] = useState('EPSG:4326');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presets = [
    {
      name: 'Sector 14 Smart City (Pune)',
      desc: '6 Revenue Parcels with Cadastral Khasra maps, UAV drone compound walls, and Master Plan 2035 green reserve buffers.',
      layers: ['Cadastral (Shapefile)', 'Drone Ortho (GeoTIFF)', 'Master Plan (DXF)'],
      crs: 'EPSG:4326 & UTM 43N',
    },
    {
      name: 'Bengaluru Outer Ring Road Ward 174',
      desc: 'High-density tech corridor with right-of-way road widening overlaps and commercial built-up discrepancies.',
      layers: ['Revenue Vector', 'Drone Footprint', 'BMRDA Zoning'],
      crs: 'EPSG:32643',
    },
    {
      name: 'Indore Smart City Redevelopment Zone',
      desc: 'Dense historic core with narrow sliver gaps between legacy settlements and modern road alignments.',
      layers: ['Cadastral Sheets', 'DGPS Survey', 'ULB Tax Registry'],
      crs: 'EPSG:3857',
    },
  ];

  const handleIngest = async () => {
    setIsLoading(true);
    setSuccessMsg(null);
    try {
      const res = await onIngest(selectedPreset);
      setSuccessMsg(res.message || 'Dataset successfully ingested and indexed into MongoDB Atlas!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Source Geospatial Ingestion</h3>
              <p className="text-xs text-slate-400">Integrate Cadastral, UAV Drone, and Master Plan data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-3 mb-4">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Urban Real-World Survey Dataset:
          </label>
          {presets.map(p => (
            <div
              key={p.name}
              onClick={() => setSelectedPreset(p.name)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedPreset === p.name
                  ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {p.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{p.crs}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.layers.map(l => (
                  <span key={l} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CRS Coordinate Reference Transformation */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Target Harmonized Coordinate System:
            </span>
            <select
              value={selectedCRS}
              onChange={e => setSelectedCRS(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
            >
              <option value="EPSG:4326">WGS 84 (EPSG:4326) - National Standard</option>
              <option value="EPSG:32643">WGS 84 / UTM Zone 43N (EPSG:32643)</option>
              <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
            </select>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Harmonization engine automatically applies Helmert 7-parameter affine transformation to eliminate projection skew.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleIngest}
            disabled={isLoading}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            Ingest & Run Pre-Processing
          </button>
        </div>
      </div>
    </div>
  );
};
