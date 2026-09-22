import React from 'react';
import { ParcelRecord, GeospatialConflict, HarmonizationMetrics } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Map, 
  ShieldCheck, 
  Building2,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';

interface HarmonizationStatsProps {
  metrics: HarmonizationMetrics | null;
  parcels: ParcelRecord[];
  conflicts: GeospatialConflict[];
}

const COLORS = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626'];

export const HarmonizationStats: React.FC<HarmonizationStatsProps> = ({
  metrics,
  parcels,
  conflicts,
}) => {
  // Area Comparison Data
  const areaComparisonData = parcels.slice(0, 6).map(p => ({
    name: `Surv ${p.surveyNumber}`,
    'Deed Area': p.deedAreaSqM,
    'Drone Survey': p.droneAreaSqM,
    'Harmonized': p.harmonizedAreaSqM || p.deedAreaSqM,
  }));

  // Land Use breakdown data
  const landUseCounts: { [key: string]: number } = {};
  parcels.forEach(p => {
    landUseCounts[p.landUse] = (landUseCounts[p.landUse] || 0) + 1;
  });
  const landUseData = Object.entries(landUseCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  // Conflict type breakdown
  const conflictTypeCounts: { [key: string]: number } = {};
  conflicts.forEach(c => {
    conflictTypeCounts[c.type] = (conflictTypeCounts[c.type] || 0) + 1;
  });
  const conflictTypeData = Object.entries(conflictTypeCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* High-level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Harmonization Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {metrics?.harmonizationRate || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({metrics?.harmonizedParcels}/{metrics?.totalParcels} parcels)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics?.harmonizationRate || 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">
              {metrics?.activeConflicts || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({metrics?.resolvedConflicts || 0} resolved)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Encroachments, sliver gaps & master plan zoning
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Managed Land</span>
            <Map className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {metrics?.totalLandAreaSqM.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">m²</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Multi-source reconciled urban footprint
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Avg Pre-Survey Discrepancy</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 font-mono">
              {metrics?.averageDiscrepancy || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">variance</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Reduced to &lt; 0.1% after Bhu-Aadhaar harmonization
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Source Area Reconciliation Bar Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Multi-Source Area Reconciliation Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing Legal Deed (Jamabandi), UAV Drone Orthophoto, and Final Harmonized Area (m²)
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Tolerance: ±0.5%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="Deed Area" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Drone Survey" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Harmonized" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spatial Discrepancy Breakdown Pie Chart (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <PieIcon className="w-4 h-4 text-purple-600" />
            Conflict Type Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Discrepancies identified across survey vectors
          </p>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conflictTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conflictTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
