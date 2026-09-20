import React, { useState } from 'react';
import { GeospatialConflict, ConflictSeverity, ConflictType } from '../types';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, Search, ArrowRight, Zap } from 'lucide-react';

interface ConflictListProps {
  conflicts: GeospatialConflict[];
  selectedConflict: GeospatialConflict | null;
  onSelectConflict: (conflict: GeospatialConflict) => void;
  onInspectAI: (conflict: GeospatialConflict) => void;
}

export const ConflictList: React.FC<ConflictListProps> = ({
  conflicts,
  selectedConflict,
  onSelectConflict,
  onInspectAI,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conflicts.filter(c => {
    if (filterSeverity !== 'ALL' && c.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.conflictId.toLowerCase().includes(q) ||
        c.primarySurveyNo.toLowerCase().includes(q) ||
        (c.conflictingSurveyNo && c.conflictingSurveyNo.toLowerCase().includes(q)) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Detected Boundary & Zoning Conflicts
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {conflicts.filter(c => c.status !== 'RESOLVED').length} Active
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search survey no, parcel, conflict ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
        </select>
      </div>

      {/* List of conflicts */}
      <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">No active conflicts detected</p>
            <p className="text-[11px] text-slate-500 mt-0.5">All multi-source geospatial vectors are topologically aligned</p>
          </div>
        ) : (
          filtered.map(conflict => {
            const isSelected = selectedConflict?.conflictId === conflict.conflictId;
            const isResolved = conflict.status === 'RESOLVED';

            return (
              <div
                key={conflict.conflictId}
                onClick={() => onSelectConflict(conflict)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : isResolved
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(conflict.severity)}`}>
                      {conflict.severity}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {conflict.conflictId}
                    </span>
                  </div>

                  {isResolved ? (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">
                      {conflict.conflictAreaSqM} m² impact
                    </span>
                  )}
                </div>

                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
                  <span>Survey {conflict.primarySurveyNo}</span>
                  {conflict.conflictingSurveyNo && (
                    <>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>Survey {conflict.conflictingSurveyNo}</span>
                    </>
                  )}
                  <span className="text-slate-400 font-normal text-[11px] ml-auto">
                    [{conflict.type.replace('_', ' ')}]
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                  {conflict.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>Layers:</span>
                    {conflict.affectedLayers.map(layer => (
                      <span key={layer} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {layer}
                      </span>
                    ))}
                  </div>

                  {!isResolved && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onInspectAI(conflict);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold shadow-sm transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Harmonize
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
