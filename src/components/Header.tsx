import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  Sparkles, 
  FileCheck2, 
  UploadCloud, 
  History, 
  ShieldCheck, 
  RefreshCw,
  Info,
  Landmark,
  FileText
} from 'lucide-react';
import { DatabaseStatus, HarmonizationMetrics } from '../types';

interface HeaderProps {
  dbStatus: DatabaseStatus | null;
  metrics: HarmonizationMetrics | null;
  onOpenAtlasModal: () => void;
  onOpenIngestModal: () => void;
  onOpenAuditModal: () => void;
  onOpenProblemModal: () => void;
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
  onOpenProblemModal,
  onAutoHarmonize,
  isHarmonizing,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Ministry & Programme Notice Bar */}
      <div className="bg-gradient-to-r from-slate-100 via-emerald-50/50 to-slate-100 border-b border-slate-200/80 px-4 py-1 text-[11px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Landmark className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="font-semibold text-slate-800">Ministry of Rural Development</span>
          <span className="text-slate-300">|</span>
          <span>Department of Land Resources (DoLR)</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-800 font-semibold">NAKSHA Programme (Smart Automation)</span>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenProblemModal}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
            >
              <Info className="w-3 h-3" />
              SIH Problem Statement 26013 Details
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and SIH Problem statement identifier */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-sm text-white">
              <Layers className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-orange-800 uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  SIH 26013
                </span>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  GeoHarmonize <span className="text-slate-500 font-normal text-sm hidden md:inline">| Urban Land Governance</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md hidden md:block">
                Automated Multi-Source Cadastral, UAV Drone & Master Plan Harmonization
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              GIS Harmonization Workbench
            </button>
            <button
              id="nav-tab-conflicts"
              onClick={() => setActiveTab('conflicts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'conflicts'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Boundary & Zoning Conflicts
              {metrics && metrics.activeConflicts > 0 && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {metrics.activeConflicts}
                </span>
              )}
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Harmonization Analytics
            </button>
          </div>

          {/* Action Buttons & Database status */}
          <div className="flex items-center gap-2">
            {/* SIH Info Button */}
            <button
              onClick={onOpenProblemModal}
              title="View SIH 26013 Requirements"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>SIH 26013</span>
            </button>

            {/* MongoDB Atlas badge */}
            <button
              id="btn-atlas-status"
              onClick={onOpenAtlasModal}
              title="Inspect MongoDB Atlas Connection"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                dbStatus?.mode === 'ATLAS_MONGODB'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">
                {dbStatus?.mode === 'ATLAS_MONGODB' ? 'MongoDB Atlas' : 'Atlas Ready (Local)'}
              </span>
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400'}`} />
            </button>

            {/* Ingest multi-source data button */}
            <button
              id="btn-ingest-data"
              onClick={onOpenIngestModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
              Ingest Data
            </button>

            {/* Audit Trail button */}
            <button
              id="btn-audit-logs"
              onClick={onOpenAuditModal}
              title="Immutable Land Mutation Audit Trail"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <History className="w-4 h-4 text-purple-600" />
            </button>

            {/* Primary Action: Run Auto Harmonize */}
            <button
              id="btn-auto-harmonize"
              onClick={onAutoHarmonize}
              disabled={isHarmonizing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              {isHarmonizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Harmonizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto Harmonize
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`py-1 px-3 rounded-md font-semibold ${activeTab === 'map' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-600'}`}
        >
          GIS Map
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`py-1 px-3 rounded-md font-semibold flex items-center gap-1 ${activeTab === 'conflicts' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-600'}`}
        >
          Conflicts ({metrics?.activeConflicts || 0})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1 px-3 rounded-md font-semibold ${activeTab === 'analytics' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-600'}`}
        >
          Analytics
        </button>
        <button
          onClick={onOpenProblemModal}
          className="py-1 px-2.5 rounded-md font-semibold text-orange-800 bg-orange-50 border border-orange-200"
        >
          SIH 26013
        </button>
      </div>
    </header>
  );
};
