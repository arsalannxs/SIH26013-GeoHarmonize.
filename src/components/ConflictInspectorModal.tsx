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
  Sliders,
  Landmark 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wide">
                {conflict.type.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">ID: {conflict.conflictId}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Intelligent Harmonization & Statutory Reconciliation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Overview Card */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
          <p className="text-slate-700 leading-relaxed font-medium">{conflict.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Conflict Impact Area:</span>
              <span className="text-rose-700 font-bold font-mono text-sm">{conflict.conflictAreaSqM} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block">Affected Layers:</span>
              <span className="text-slate-800 font-semibold">{conflict.affectedLayers.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Coordinates:</span>
              <span className="text-slate-700 font-mono font-medium">
                {conflict.coordinates[1].toFixed(5)}, {conflict.coordinates[0].toFixed(5)}
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-side Parcel Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block mb-1.5">
              Primary Parcel (Survey {conflict.primarySurveyNo})
            </span>
            <div className="space-y-1.5 text-slate-700 text-[11px]">
              <div><span className="text-slate-500">ULPIN:</span> <span className="font-mono font-semibold text-slate-900">{primaryParcel?.ulpin || 'N/A'}</span></div>
              <div><span className="text-slate-500">Owner:</span> <span className="font-medium text-slate-900">{primaryParcel?.ownerName || 'Unknown'}</span></div>
              <div><span className="text-slate-500">Deed Area:</span> <span className="font-mono font-semibold">{primaryParcel?.deedAreaSqM} m²</span></div>
              <div><span className="text-slate-500">Drone Survey:</span> <span className="font-mono text-sky-700 font-semibold">{primaryParcel?.droneAreaSqM} m²</span></div>
              <div><span className="text-slate-500">Zoning:</span> <span className="font-medium">{primaryParcel?.landUse}</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block mb-1.5">
              {conflict.conflictingSurveyNo ? `Adjacent Parcel (Survey ${conflict.conflictingSurveyNo})` : 'Adjacent Right of Way / Buffer'}
            </span>
            <div className="space-y-1.5 text-slate-700 text-[11px]">
              {conflictingParcel ? (
                <>
                  <div><span className="text-slate-500">ULPIN:</span> <span className="font-mono font-semibold text-slate-900">{conflictingParcel.ulpin}</span></div>
                  <div><span className="text-slate-500">Owner:</span> <span className="font-medium text-slate-900">{conflictingParcel.ownerName}</span></div>
                  <div><span className="text-slate-500">Deed Area:</span> <span className="font-mono font-semibold">{conflictingParcel.deedAreaSqM} m²</span></div>
                  <div><span className="text-slate-500">Drone Survey:</span> <span className="font-mono text-sky-700 font-semibold">{conflictingParcel.droneAreaSqM} m²</span></div>
                  <div><span className="text-slate-500">Zoning:</span> <span className="font-medium">{conflictingParcel.landUse}</span></div>
                </>
              ) : (
                <div className="text-slate-500 py-2 leading-relaxed">
                  Statutory Public Land / Master Plan Buffer Reserve (Municipal Corporation).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gemini AI Root Cause & Legal Precedent Section */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Gemini AI Conflict Harmonization Engine
              </h4>
            </div>

            <button
              onClick={() => onTriggerAI(conflict.conflictId)}
              disabled={isAnalyzingAI}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs disabled:opacity-50"
            >
              {isAnalyzingAI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-emerald-600" />}
              Re-analyze AI
            </button>
          </div>

          {ai ? (
            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <span className="text-[11px] font-bold text-slate-900 block">Root Cause Analysis:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{ai.cause}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-900 block">Statutory Legal Precedent & Section:</span>
                <p className="text-emerald-900 font-semibold bg-white/80 p-2 rounded-lg border border-emerald-200/80 mt-0.5">
                  {ai.legalPrecedent} ({ai.statutorySection})
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-900 block">Recommended Regularization Strategy:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{ai.recommendedAction}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60 text-[11px] text-slate-500">
                <span>AI Statutory Confidence: <strong className="text-emerald-800 font-bold">{ai.confidence}%</strong></span>
                <span className="font-mono text-[10px] text-slate-500">Model: Gemini 2.5 Flash / Pro</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500">
              Click &quot;Analyze with Gemini AI&quot; to formulate automatic legal precedent and dispute resolution steps.
            </div>
          )}
        </div>

        {/* Harmonization Action Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-800 block mb-2">
            Select Resolution Algorithm & Action:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div
              onClick={() => setSelectedMethod('SNAP_TO_DRONE')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethod === 'SNAP_TO_DRONE'
                  ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold text-slate-900 block mb-1">Snap to Drone Ortho</span>
              <p className="text-[11px] text-slate-500">Regularize physical compound wall on ground.</p>
            </div>

            <div
              onClick={() => setSelectedMethod('EQUAL_PARTITION')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethod === 'EQUAL_PARTITION'
                  ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold text-slate-900 block mb-1">Midline Partition</span>
              <p className="text-[11px] text-slate-500">Split overlap equally along cadastral centerline.</p>
            </div>

            <div
              onClick={() => setSelectedMethod('BUFFER_TRUNCATE')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethod === 'BUFFER_TRUNCATE'
                  ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-bold text-slate-900 block mb-1">Statutory Truncate</span>
              <p className="text-[11px] text-slate-500">Enforce Master Plan setback and clip parcel.</p>
            </div>
          </div>
        </div>

        {/* Survey Officer Remarks */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Authorized Survey Officer Mutation Remarks:
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isResolving || conflict.status === 'RESOLVED'}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isResolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {conflict.status === 'RESOLVED' ? 'Already Resolved' : 'Apply Statutory Harmonization'}
          </button>
        </div>
      </div>
    </div>
  );
};
