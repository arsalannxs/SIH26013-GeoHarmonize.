import React from 'react';
import { AuditLogEntry } from '../types';
import { X, History, ShieldCheck, Download, CheckCircle2, FileText } from 'lucide-react';

interface AuditTrailModalProps {
  logs: AuditLogEntry[];
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  logs,
  onClose,
}) => {
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `land_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Mutation Audit Trail</h3>
              <p className="text-xs text-slate-500">Cryptographically sealed log of all boundary reconciliations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Export JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {logs.map((log, idx) => (
            <div
              key={log.logId || idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-purple-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                    {log.action}
                  </span>
                  <span className="text-slate-900 font-semibold">{log.actor}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-700 text-[11px] mb-2 leading-relaxed">{log.details}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-medium">
                <span>Parcel: <span className="font-mono font-semibold text-slate-800">{log.parcelUlpin}</span></span>
                <span className="font-mono truncate max-w-[220px]" title={log.signatureHash}>
                  Hash: {log.signatureHash.slice(0, 18)}...
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 text-right mt-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
