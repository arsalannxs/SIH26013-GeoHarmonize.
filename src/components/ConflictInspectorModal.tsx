import React, { useState } from 'react';
import { GeospatialConflict, ParcelRecord } from '../types';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  RefreshCw, 
  Sliders 
} from 'lucide-react';

interface ConflictInspectorModalProps {
  conflict: GeospatialConflict;
  primaryParcel: ParcelRecord | null;
  conflictingParcel: ParcelRecord | null;
  onClose: () => void;
  onResolve: (conflictId: string, method: string, remarks: string) => Promise<void>;
  onTriggerAI: (conflictId: string) => Promise<void>;
  isAnalyzingAI: boolean;
}

export const ConflictInspectorModal: React.FC<ConflictInspectorModalProps> = ({
  conflict,
  primaryParcel,
  conflictingParcel,
  onClose,
  onResolve,
  onTriggerAI,
  isAnalyzingAI,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'SNAP_TO_DRONE' | 'EQUAL_PARTITION' | 'BUFFER_TRUNCATE'>('SNAP_TO_DRONE');
  const [remarks, setRemarks] = useState('Harmonized via automated geospatial multi-source reconciliation');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(conflict.conflictId, selectedMethod, remarks);
      onClose();
    } finally {
      setIsResolving(false);
    }
  };

  const ai = conflict.aiAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-wide">
                {conflict.type.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {conflict.conflictId}</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Intelligent Harmonization & Statutory Reconciliation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Overview Card */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-850 border border-slate-750 text-xs">
          <p className="text-slate-300 leading-relaxed">{conflict.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block">Conflict Area:</span>
              <span className="text-rose-400 font-bold font-mono text-sm">{conflict.conflictAreaSqM} m²</span>
            </div>
            <div>
              <span className="text-slate-400 block">Affected Layers:</span>
              <span className="text-slate-200 font-medium">{conflict.affectedLayers.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Coordinates:</span>
              <span className="text-slate-200 font-mono">
                {conflict.coordinates[1].toFixed(5)}, {conflict.coordinates[0].toFixed(5)}
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-side Parcel Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mb-1">
              Primary Parcel (Survey {conflict.primarySurveyNo})
            </span>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><span className="text-slate-500">ULPIN:</span> <span className="font-mono text-slate-200">{primaryParcel?.ulpin || 'N/A'}</span></div>
              <div><span className="text-slate-500">Owner:</span> {primaryParcel?.ownerName || 'Unknown'}</div>
              <div><span className="text-slate-500">Deed Area:</span> <span className="font-mono">{primaryParcel?.deedAreaSqM} m²</span></div>
              <div><span className="text-slate-500">Drone Survey:</span> <span className="font-mono text-cyan-400">{primaryParcel?.droneAreaSqM} m²</span></div>
              <div><span className="text-slate-500">Zoning:</span> {primaryParcel?.landUse}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block mb-1">
              {conflict.conflictingSurveyNo ? `Adjacent Parcel (Survey ${conflict.conflictingSurveyNo})` : 'Adjacent Right of Way / Buffer'}
            </span>
            <div className="space-y-1 text-slate-300 text-[11px]">
              {conflictingParcel ? (
                <>
                  <div><span className="text-slate-500">ULPIN:</span> <span className="font-mono text-slate-200">{conflictingParcel.ulpin}</span></div>
                  <div><span className="text-slate-500">Owner:</span> {conflictingParcel.ownerName}</div>
                  <div><span className="text-slate-500">Deed Area:</span> <span className="font-mono">{conflictingParcel.deedAreaSqM} m²</span></div>
                  <div><span className="text-slate-500">Drone Survey:</span> <span className="font-mono text-cyan-400">{conflictingParcel.droneAreaSqM} m²</span></div>
                  <div><span className="text-slate-500">Zoning:</span> {conflictingParcel.landUse}</div>
                </>
              ) : (
                <div className="text-slate-400 py-2">
                  Statutory Public Land / Master Plan Buffer Reserve (Pune Municipal Corporation).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gemini AI Root Cause & Legal Precedent Section */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-800/40 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Gemini AI Conflict Harmonization Engine
              </h4>
            </div>
            <button
              onClick={() => onTriggerAI(conflict.conflictId)}
              disabled={isAnalyzingAI}
              className="text-[11px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              {isAnalyzingAI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Re-Analyze
            </button>
          </div>

          {ai ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Root Cause:</span>
                <p className="text-slate-200 mt-0.5">{ai.cause}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium">Statutory Section:</span>
                  <p className="text-emerald-400 font-semibold font-mono">{ai.statutorySection}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Legal Precedent:</span>
                  <p className="text-slate-300">{ai.legalPrecedent}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-900/40">
                <span className="text-slate-400 font-medium">Recommended Statutory Action:</span>
                <p className="text-emerald-300 font-medium mt-0.5">{ai.recommendedAction}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={() => onTriggerAI(conflict.conflictId)}
                disabled={isAnalyzingAI}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzingAI ? 'Analyzing with Gemini API...' : 'Generate AI Legal & Survey Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Harmonization Resolution Method Selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select Statutory Harmonization Strategy:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setSelectedMethod('SNAP_TO_DRONE')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'SNAP_TO_DRONE'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-white mb-0.5">Snap to Drone Truth</div>
              <p className="text-[10px] text-slate-400">Reconcile cadastral boundary to physical UAV compound footprint.</p>
            </button>

            <button
              onClick={() => setSelectedMethod('EQUAL_PARTITION')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'EQUAL_PARTITION'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-white mb-0.5">Mid-line Split</div>
              <p className="text-[10px] text-slate-400">Divide overlapping dispute zone equally between both parcels.</p>
            </button>

            <button
              onClick={() => setSelectedMethod('BUFFER_TRUNCATE')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'BUFFER_TRUNCATE'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-white mb-0.5">Buffer Truncation</div>
              <p className="text-[10px] text-slate-400">Excise encroachment to enforce statutory master plan setback.</p>
            </button>
          </div>
        </div>

        {/* Surveyor Mutation Remarks */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Surveyor Mutation Notes (Recorded in MongoDB Atlas Audit Trail):
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {isResolving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating Atlas & Reconciling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Apply Harmonization & Resolve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
