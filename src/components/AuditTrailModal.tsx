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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Immutable Mutation Audit Trail</h3>
              <p className="text-xs text-slate-400">Cryptographically sealed log of all boundary reconciliations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {logs.map((log, idx) => (
            <div
              key={log.logId || idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 font-semibold">
                    {log.action}
                  </span>
                  <span className="text-slate-200 font-medium">{log.actor}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-300 text-[11px] mb-2">{log.details}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                <span>Parcel: <span className="font-mono text-slate-300">{log.parcelUlpin}</span></span>
                <span className="font-mono truncate max-w-[200px]" title={log.signatureHash}>
                  Hash: {log.signatureHash.slice(0, 18)}...
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 text-right mt-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
