import React from 'react';
import { 
  Layers, 
  Database, 
  Sparkles, 
  FileCheck2, 
  UploadCloud, 
  History, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { DatabaseStatus, HarmonizationMetrics } from '../types';

interface HeaderProps {
  dbStatus: DatabaseStatus | null;
  metrics: HarmonizationMetrics | null;
  onOpenAtlasModal: () => void;
  onOpenIngestModal: () => void;
  onOpenAuditModal: () => void;
  onAutoHarmonize: () => void;
  isHarmonizing: boolean;
  activeTab: 'map' | 'analytics' | 'conflicts';
  setActiveTab: (tab: 'map' | 'analytics' | 'conflicts') => void;
}

export const Header: React.FC<HeaderProps> = ({
  dbStatus,
  metrics,
  onOpenAtlasModal,
  onOpenIngestModal,
  onOpenAuditModal,
  onAutoHarmonize,
  isHarmonizing,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and SIH Problem statement identifier */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-inner">
              <Layers className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  SIH26013
                </span>
                <h1 className="text-lg font-bold tracking-tight text-slate-100">
                  GeoHarmonize <span className="text-slate-400 font-normal text-sm hidden sm:inline">| Urban Land Records</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md hidden md:block">
                Automated Integration & Harmonization of Cadastral, UAV Drone & Master Plan Data
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="hidden lg:flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              GIS Harmonization Workbench
            </button>
            <button
              id="nav-tab-conflicts"
              onClick={() => setActiveTab('conflicts')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'conflicts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Boundary Conflicts
              {metrics && metrics.activeConflicts > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {metrics.activeConflicts}
                </span>
              )}
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Harmonization Analytics
            </button>
          </div>

          {/* Action Buttons & Database status */}
          <div className="flex items-center gap-2.5">
            {/* MongoDB Atlas badge */}
            <button
              id="btn-atlas-status"
              onClick={onOpenAtlasModal}
              title="Inspect MongoDB Atlas Connection"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                dbStatus?.mode === 'ATLAS_MONGODB'
                  ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {dbStatus?.mode === 'ATLAS_MONGODB' ? 'Atlas MongoDB' : 'Atlas Ready (Local)'}
              </span>
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Ingest multi-source data button */}
            <button
              id="btn-ingest-data"
              onClick={onOpenIngestModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              Ingest Data
            </button>

            {/* Audit Trail button */}
            <button
              id="btn-audit-logs"
              onClick={onOpenAuditModal}
              title="Immutable Land Mutation Audit Trail"
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Primary Action: Run Auto Harmonize */}
            <button
              id="btn-auto-harmonize"
              onClick={onAutoHarmonize}
              disabled={isHarmonizing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-sm transition-all disabled:opacity-50"
            >
              {isHarmonizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  Harmonizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  Auto Harmonize
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`py-1 px-3 rounded ${activeTab === 'map' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
        >
          GIS Map
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`py-1 px-3 rounded flex items-center gap-1 ${activeTab === 'conflicts' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Conflicts ({metrics?.activeConflicts || 0})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1 px-3 rounded ${activeTab === 'analytics' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
