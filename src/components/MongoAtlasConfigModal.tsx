import React, { useState } from 'react';
import { DatabaseStatus } from '../types';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  Server 
} from 'lucide-react';

interface MongoAtlasConfigModalProps {
  status: DatabaseStatus | null;
  onClose: () => void;
  onConnect: (uri: string) => Promise<any>;
  onResetDb: () => Promise<any>;
}

export const MongoAtlasConfigModal: React.FC<MongoAtlasConfigModalProps> = ({
  status,
  onClose,
  onConnect,
  onResetDb,
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri) return;
    setIsConnecting(true);
    setFeedback(null);
    try {
      const res = await onConnect(mongoUri);
      if (res.success && res.mode === 'ATLAS_MONGODB') {
        setFeedback({ success: true, msg: 'Successfully connected to MongoDB Atlas cluster!' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Connection failed. Switched to resilient local store.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Re-seed all collections (Parcels, Conflicts, Layers, Audit Logs) with initial multi-source urban data?')) return;
    setIsResetting(true);
    try {
      await onResetDb();
      setFeedback({ success: true, msg: 'Database successfully re-seeded with pristine multi-source datasets!' });
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MongoDB Atlas Architecture</h3>
              <p className="text-xs text-slate-400">Geospatial collections, 2dsphere indexing & mutation audit logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-xs text-white">
                {status?.mode === 'ATLAS_MONGODB' ? 'MongoDB Atlas (Connected)' : 'Resilient Local Store (Atlas Compatible)'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              db: {status?.databaseName || 'geoharmonize'}
            </span>
          </div>

          {/* Collection Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">parcels</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{status?.collectionCounts.parcels || 0}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">conflicts</span>
              <span className="text-sm font-mono font-bold text-amber-400">{status?.collectionCounts.conflicts || 0}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">spatial_layers</span>
              <span className="text-sm font-mono font-bold text-sky-400">{status?.collectionCounts.spatial_layers || 0}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">audit_logs</span>
              <span className="text-sm font-mono font-bold text-purple-400">{status?.collectionCounts.audit_logs || 0}</span>
            </div>
          </div>

          {status?.error && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* MongoDB Atlas URI Connect Form */}
        <form onSubmit={handleConnect} className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Connect Custom MongoDB Atlas Cluster URI:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/..."
              value={mongoUri}
              onChange={e => setMongoUri(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isConnecting || !mongoUri}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              Connect
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Supports Standard Connection String URI format with TLS / SSL. Credentials are kept strictly on the Node.js server.
          </p>
        </form>

        {feedback && (
          <div className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${feedback.success ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'}`}>
            {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            Re-seed Initial Data
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
