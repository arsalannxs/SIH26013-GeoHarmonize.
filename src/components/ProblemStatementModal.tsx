import React from 'react';
import { 
  X, 
  Award, 
  Building, 
  Landmark, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';

interface ProblemStatementModalProps {
  onClose: () => void;
}

export const ProblemStatementModal: React.FC<ProblemStatementModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Header with SIH 2026 branding */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 flex items-center justify-center shadow-md p-1 shrink-0">
              <Award className="w-6 h-6 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wide">
                  Smart India Hackathon 2026
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ID: 26013
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Problem Statement Details & Implementation Blueprint
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official SIH Table Specifications as seen in the official portal */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs shadow-sm">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-700" />
            Official Government Record & Metadata (sih.gov.in)
          </div>
          <div className="divide-y divide-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Problem Statement ID</span>
              <span className="sm:col-span-2 font-mono font-bold text-slate-900">26013</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Problem Statement Title</span>
              <span className="sm:col-span-2 font-semibold text-slate-900 leading-relaxed">
                Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for urban Land Record Management.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Organization</span>
              <span className="sm:col-span-2 font-medium text-slate-800">Ministry of Rural Development</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Department</span>
              <span className="sm:col-span-2 font-medium text-emerald-800 font-semibold">
                Dept of land resources (DoLR)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Category & Theme</span>
              <span className="sm:col-span-2 text-slate-800">
                <span className="inline-block bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-medium mr-2">
                  Software
                </span>
                <span className="inline-block bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded font-medium">
                  Smart Automation
                </span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
              <span className="font-semibold text-slate-600">Primary Programme</span>
              <span className="sm:col-span-2 font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  NAKSHA Programme
                </span>
                <span className="text-slate-500 font-normal">
                  (National Aerial & Urban Land Records Survey Programme)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Official Background Description */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Background & Problem Statement Description
          </h4>
          <p className="text-slate-600 mb-3">
            Urban land administration and cadastral management involve integration of multiple spatial and non-spatial datasets generated from various departments, agencies, and survey mechanisms. Under modern land governance programmes such as the <strong>NAKSHA Programme</strong>, large-scale geospatial surveying is actively underway utilizing drone surveys, high-resolution satellite imagery, cadastral paper map digitizations, town planning master plans, and municipal survey registers.
          </p>
          <p className="text-slate-600 mb-3">
            However, acute challenges arise from disparate Coordinate Reference Systems (CRS), scale mismatches, legacy paper record digitizing errors, sliver polygons, and ground-level physical encroachments. Without an automated, intelligent harmonization platform, reconciling deed boundaries against real-world drone imagery requires months of manual litigious field verifications.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900 font-medium">
            <strong>Target Objective:</strong> Build an automated intelligent harmonization pipeline that unifies multi-department spatial layers, detects boundary and zoning violations, programmatically harmonizes polygons using topological rules, queries MongoDB Atlas with 2dsphere indexing, and outputs official Bhu-Aadhaar (ULPIN) certificates.
          </div>
        </div>

        {/* Architectural Solution Pillars */}
        <div className="mb-6">
          <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            Implemented Smart Automation Pipeline
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>1. Multi-Agency Data Ingestion</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Ingests Cadastral Khasra maps (DoLR Revenue), UAV Drone Orthomosaics (Survey of India / NAKSHA), Master Plan 2035 zoning (ULB Town Planning), and Jamabandi Deeds with automatic CRS transformation to WGS84.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>2. Automated Conflict Detection</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Mathematical scans for Encroachment (compound walls across deed lines), Sliver Gaps (digitization rounding), Cadastral Overlaps, and Statutory Zoning Infringements (Green Belt/Right-of-Way violations).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>3. Topological Harmonization</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Executes Douglas-Peucker simplification, distance-tolerance vertex snapping, and midline boundary partition to produce clean topological boundaries without area leakage.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>4. Bhu-Aadhaar ULPIN & Audit Trail</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Assigns standard 14-character geocoded ULPIN identifiers, logs cryptographic SHA-256 mutation records in MongoDB Atlas, and generates statutory Land Harmonization Certificates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Ministry of Rural Development • Department of Land Resources (DoLR)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            Acknowledge & Launch Workbench
          </button>
        </div>
      </div>
    </div>
  );
};
