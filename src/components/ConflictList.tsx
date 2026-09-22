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
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Detected Boundary & Zoning Conflicts
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
          {conflicts.filter(c => c.status !== 'RESOLVED').length} Active
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search survey no, parcel, conflict ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
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
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No active conflicts detected</p>
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
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                    : isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(conflict.severity)}`}>
                      {conflict.severity}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      {conflict.conflictId}
                    </span>
                  </div>

                  {isResolved ? (
                    <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {conflict.conflictAreaSqM} m² impact
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <span>Survey {conflict.primarySurveyNo}</span>
                  {conflict.conflictingSurveyNo && (
                    <>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>Survey {conflict.conflictingSurveyNo}</span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                  {conflict.description}
                </p>

                {/* Layer pills and AI inspect trigger */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {conflict.affectedLayers.map(l => (
                      <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                        {l.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectAI(conflict);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Inspect AI
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
