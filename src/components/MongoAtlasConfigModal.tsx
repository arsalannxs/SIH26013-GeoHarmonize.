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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">MongoDB Atlas Geospatial Architecture</h3>
              <p className="text-xs text-slate-500">2dsphere spatial index, GeoJSON schemas & mutation audit logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-bold text-xs text-slate-900">
                {status?.mode === 'ATLAS_MONGODB' ? 'MongoDB Atlas (Connected Live)' : 'Atlas Resilient Local Store (Active)'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
              db: {status?.databaseName || 'geoharmonize'}
            </span>
          </div>

          {/* Collection Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">parcels</span>
              <span className="text-sm font-mono font-bold text-emerald-700">{status?.collectionCounts.parcels || 0}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">conflicts</span>
              <span className="text-sm font-mono font-bold text-amber-600">{status?.collectionCounts.conflicts || 0}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">spatial_layers</span>
              <span className="text-sm font-mono font-bold text-sky-700">{status?.collectionCounts.spatial_layers || 0}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">audit_logs</span>
              <span className="text-sm font-mono font-bold text-purple-700">{status?.collectionCounts.audit_logs || 0}</span>
            </div>
          </div>

          {status?.error && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* MongoDB Atlas URI Connect Form */}
        <form onSubmit={handleConnect} className="mb-4">
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Connect Custom MongoDB Atlas Cluster URI:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/..."
              value={mongoUri}
              onChange={e => setMongoUri(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isConnecting || !mongoUri}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              Connect
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Provide standard MongoDB connection string with readWrite permission.
          </p>
        </form>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
              feedback.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Database Seed & Re-initialization */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Sample Multi-Source Dataset</span>
            <span className="text-[11px] text-slate-500">Includes Cadastral deeds, drone surveys & zoning</span>
          </div>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            Re-seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
