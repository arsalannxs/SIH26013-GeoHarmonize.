import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ParcelRecord, 
  GeospatialConflict, 
  SpatialLayerConfig, 
  HarmonizationMetrics, 
  DatabaseStatus, 
  AuditLogEntry, 
  LayerType 
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { MapViewer } from './components/MapViewer';
import { LayerControlPanel } from './components/LayerControlPanel';
import { ConflictList } from './components/ConflictList';
import { ConflictInspectorModal } from './components/ConflictInspectorModal';
import { HarmonizationStats } from './components/HarmonizationStats';
import { MongoAtlasConfigModal } from './components/MongoAtlasConfigModal';
import { DataIngestModal } from './components/DataIngestModal';
import { CertificateModal } from './components/CertificateModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Search, 
  ShieldCheck, 
  Database 
} from 'lucide-react';

export default function App() {
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [conflicts, setConflicts] = useState<GeospatialConflict[]>([]);
  const [layers, setLayers] = useState<SpatialLayerConfig[]>([]);
  const [metrics, setMetrics] = useState<HarmonizationMetrics | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [selectedParcel, setSelectedParcel] = useState<ParcelRecord | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<GeospatialConflict | null>(null);
  const [certificateParcel, setCertificateParcel] = useState<ParcelRecord | null>(null);

  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'conflicts'>('map');
  const [isHarmonizing, setIsHarmonizing] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Modals state
  const [showAtlasModal, setShowAtlasModal] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial Load
  const loadData = async () => {
    try {
      const [p, c, l, m, s, a] = await Promise.all([
        api.getParcels(),
        api.getConflicts(),
        api.getLayers(),
        api.getMetrics(),
        api.getDbStatus(),
        api.getAuditLogs(),
      ]);
      setParcels(p);
      setConflicts(c);
      setLayers(l);
      setMetrics(m);
      setDbStatus(s);
      setAuditLogs(a);
      if (p.length > 0 && !selectedParcel) {
        setSelectedParcel(p[0]);
      }
    } catch (e: any) {
      console.error('Failed to load initial data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler: Update Layer Visibility or Opacity
  const handleUpdateLayer = async (id: LayerType, patch: Partial<SpatialLayerConfig>) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
    try {
      await api.updateLayer(id, patch);
    } catch (e) {
      console.error('Failed to persist layer changes:', e);
    }
  };

  // Handler: Auto Harmonize All Multi-Source Parcels
  const handleAutoHarmonize = async () => {
    setIsHarmonizing(true);
    try {
      const res = await api.triggerAutoHarmonize();
      setParcels(res.parcels);
      setConflicts(res.conflicts);
      const [m, a, s] = await Promise.all([
        api.getMetrics(),
        api.getAuditLogs(),
        api.getDbStatus(),
      ]);
      setMetrics(m);
      setAuditLogs(a);
      setDbStatus(s);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6'],
      });

      showToast(`Harmonized ${res.resolvedConflictsCount} geospatial conflicts and reconciled all cadastral boundaries!`);
    } catch (e: any) {
      showToast(e.message || 'Harmonization failed', 'error');
    } finally {
      setIsHarmonizing(false);
    }
  };

  // Handler: Inspect Conflict with Gemini AI
  const handleInspectAI = async (conflict: GeospatialConflict) => {
    setSelectedConflict(conflict);
    setShowConflictModal(true);

    if (!conflict.aiAnalysis) {
      setIsAnalyzingAI(true);
      try {
        const aiResult = await api.explainConflictAI(conflict.conflictId);
        setConflicts(prev => prev.map(c => c.conflictId === conflict.conflictId ? { ...c, aiAnalysis: aiResult } : c));
        setSelectedConflict(prev => prev ? { ...prev, aiAnalysis: aiResult } : null);
      } catch (e) {
        console.error('AI analysis error:', e);
      } finally {
        setIsAnalyzingAI(false);
      }
    }
  };

  // Handler: Resolve single conflict
  const handleResolveConflict = async (conflictId: string, method: string, remarks: string) => {
    try {
      await api.resolveConflict(conflictId, method, remarks);
      const [p, c, m, a, s] = await Promise.all([
        api.getParcels(),
        api.getConflicts(),
        api.getMetrics(),
        api.getAuditLogs(),
        api.getDbStatus(),
      ]);
      setParcels(p);
      setConflicts(c);
      setMetrics(m);
      setAuditLogs(a);
      setDbStatus(s);
      showToast(`Conflict ${conflictId} successfully resolved and saved to Atlas MongoDB!`);
    } catch (e: any) {
      showToast(e.message || 'Failed to resolve conflict', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Header
        dbStatus={dbStatus}
        metrics={metrics}
        onOpenAtlasModal={() => setShowAtlasModal(true)}
        onOpenIngestModal={() => setShowIngestModal(true)}
        onOpenAuditModal={() => setShowAuditModal(true)}
        onAutoHarmonize={handleAutoHarmonize}
        isHarmonizing={isHarmonizing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Dynamic View Tab Rendering */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Left Spatial Control & Conflict Sidebar (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <LayerControlPanel
                layers={layers}
                onUpdateLayer={handleUpdateLayer}
              />

              <ConflictList
                conflicts={conflicts}
                selectedConflict={selectedConflict}
                onSelectConflict={conflict => {
                  setSelectedConflict(conflict);
                  const p = parcels.find(item => item.ulpin === conflict.primaryParcelUlpin);
                  if (p) setSelectedParcel(p);
                }}
                onInspectAI={handleInspectAI}
              />
            </div>

            {/* Right Interactive GIS Map (8 Cols) */}
            <div className="lg:col-span-8 h-[680px] sticky top-24">
              <MapViewer
                parcels={parcels}
                conflicts={conflicts}
                layers={layers}
                selectedParcel={selectedParcel}
                selectedConflict={selectedConflict}
                onSelectParcel={parcel => {
                  setSelectedParcel(parcel);
                  setSelectedConflict(null);
                }}
                onSelectConflict={conflict => {
                  setSelectedConflict(conflict);
                  const p = parcels.find(item => item.ulpin === conflict.primaryParcelUlpin);
                  if (p) setSelectedParcel(p);
                }}
                onOpenCertificate={parcel => setCertificateParcel(parcel)}
                onUpdateLayer={handleUpdateLayer}
              />
            </div>
          </div>
        )}

        {activeTab === 'conflicts' && (
          <div className="max-w-4xl mx-auto w-full">
            <ConflictList
              conflicts={conflicts}
              selectedConflict={selectedConflict}
              onSelectConflict={conflict => {
                setSelectedConflict(conflict);
                handleInspectAI(conflict);
              }}
              onInspectAI={handleInspectAI}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <HarmonizationStats
            metrics={metrics}
            parcels={parcels}
            conflicts={conflicts}
          />
        )}
      </main>

      {/* Modals */}
      {showAtlasModal && (
        <MongoAtlasConfigModal
          status={dbStatus}
          onClose={() => setShowAtlasModal(false)}
          onConnect={async uri => {
            const res = await api.connectDb(uri);
            setDbStatus(res.status);
            return res;
          }}
          onResetDb={async () => {
            const res = await api.resetDb();
            await loadData();
            return res;
          }}
        />
      )}

      {showIngestModal && (
        <DataIngestModal
          onClose={() => setShowIngestModal(false)}
          onIngest={async name => {
            const res = await api.ingestSample(name);
            await loadData();
            return res;
          }}
        />
      )}

      {showAuditModal && (
        <AuditTrailModal
          logs={auditLogs}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {showConflictModal && selectedConflict && (
        <ConflictInspectorModal
          conflict={selectedConflict}
          primaryParcel={parcels.find(p => p.ulpin === selectedConflict.primaryParcelUlpin) || null}
          conflictingParcel={selectedConflict.conflictingParcelUlpin ? parcels.find(p => p.ulpin === selectedConflict.conflictingParcelUlpin) || null : null}
          onClose={() => {
            setShowConflictModal(false);
            setSelectedConflict(null);
          }}
          onResolve={handleResolveConflict}
          onTriggerAI={async conflictId => {
            setIsAnalyzingAI(true);
            try {
              const aiResult = await api.explainConflictAI(conflictId);
              setConflicts(prev => prev.map(c => c.conflictId === conflictId ? { ...c, aiAnalysis: aiResult } : c));
              setSelectedConflict(prev => prev ? { ...prev, aiAnalysis: aiResult } : null);
            } finally {
              setIsAnalyzingAI(false);
            }
          }}
          isAnalyzingAI={isAnalyzingAI}
        />
      )}

      {certificateParcel && (
        <CertificateModal
          parcel={certificateParcel}
          onClose={() => setCertificateParcel(null)}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/80 text-emerald-300 shadow-2xl text-xs font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
