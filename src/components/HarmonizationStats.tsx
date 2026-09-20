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
  Building2 
} from 'lucide-react';

interface HarmonizationStatsProps {
  metrics: HarmonizationMetrics | null;
  parcels: ParcelRecord[];
  conflicts: GeospatialConflict[];
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

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
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Harmonization Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {metrics?.harmonizationRate || 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({metrics?.harmonizedParcels}/{metrics?.totalParcels} parcels)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics?.harmonizationRate || 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {metrics?.activeConflicts || 0}
            </span>
            <span className="text-xs text-slate-400">
              ({metrics?.resolvedConflicts || 0} resolved)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Encroachments, sliver gaps & master plan zoning
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Managed Land</span>
            <Map className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {metrics?.totalLandAreaSqM.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-400">m²</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Multi-source reconciled urban footprint
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Pre-Survey Discrepancy</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400 font-mono">
              {metrics?.averageDiscrepancy || 0}%
            </span>
            <span className="text-xs text-slate-400">variance</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Reduced to &lt; 0.1% after Bhu-Aadhaar harmonization
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-source Area Reconciled Chart */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
            Multi-Source Area Comparison (Deed vs Drone vs Harmonized)
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Visualizing square meter discrepancies between legal deed, UAV drone orthophoto, and final reconciled ULPIN boundary
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Deed Area" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Drone Survey" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Harmonized" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conflict & Land Use Distribution */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
              Urban Land Use & Conflict Categorization
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Zoning allocation and multi-source spatial collision distribution
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-60">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-1">Zoning Allocations</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={landUseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={30}
                    >
                      {landUseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-1">Conflict Classes</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conflictTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={30}
                    >
                      {conflictTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
