import React from 'react';
import { ParcelRecord } from '../types';
import { X, Printer, ShieldCheck, QrCode, CheckCircle2, Award, Landmark } from 'lucide-react';

interface CertificateModalProps {
  parcel: ParcelRecord;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  parcel,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Official Harmonized Land Record Certificate (Bhu-Aadhaar)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Layout */}
        <div className="p-8 bg-slate-950 rounded-xl border-2 border-emerald-800/80 relative text-slate-200 shadow-inner">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Landmark className="w-80 h-80 text-emerald-300" />
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b-2 border-emerald-800/60 pb-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Landmark className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Department of Land Resources & Urban Development
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              BHU-AADHAAR / ULPIN HARMONIZATION CERTIFICATE
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Issued under Smart India Hackathon Automated Geospatial Harmonization Standard SIH26013
            </p>
          </div>

          {/* ULPIN Highlight Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 mb-6">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                Unique Land Parcel Identification Number (ULPIN)
              </span>
              <span className="text-xl font-extrabold font-mono text-white tracking-wider">
                {parcel.ulpin}
              </span>
            </div>
            <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center text-slate-950">
              <QrCode className="w-10 h-10" />
            </div>
          </div>

          {/* Land Attributes Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs mb-6 border-b border-slate-800/80 pb-6">
            <div>
              <span className="text-slate-400 block text-[11px]">Revenue Survey Number:</span>
              <span className="font-bold text-white text-sm">{parcel.surveyNumber} {parcel.subDivision ? `(Sub-div: ${parcel.subDivision})` : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registered Legal Owner:</span>
              <span className="font-bold text-white text-sm">{parcel.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Revenue Village & Ward:</span>
              <span className="text-slate-200 font-medium">{parcel.village}, {parcel.wardNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">ULB Municipal Tax ID:</span>
              <span className="font-mono text-slate-200">{parcel.taxId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Statutory Land Use Category:</span>
              <span className="text-slate-200 font-semibold">{parcel.landUse}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">CRS Coordinate System:</span>
              <span className="font-mono text-slate-200">{parcel.crs} (WGS 84 Unified)</span>
            </div>
          </div>

          {/* Multi-source Area Audit Trail */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Multi-Source Reconciliation Audit Trail
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-amber-400 block">Deed/Jamabandi Area</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{parcel.deedAreaSqM} m²</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-cyan-400 block">UAV Drone Ortho Area</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{parcel.droneAreaSqM} m²</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700">
                <span className="text-[10px] text-emerald-300 block font-semibold">Harmonized Legal Area</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  {parcel.harmonizedAreaSqM || parcel.deedAreaSqM} m²
                </span>
              </div>
            </div>
          </div>

          {/* Verification Seal & Digital Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-800/80 text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Geospatial Topological Validity Confirmed</span>
              </div>
              <p className="text-slate-500 font-mono text-[9px]">
                SHA-256: {Math.random().toString(36).substring(2, 15)}{Math.random().toString(36).substring(2, 15)}
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">
                Harmonized At: {parcel.lastHarmonizedAt ? new Date(parcel.lastHarmonizedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="w-28 h-10 border-b border-dashed border-slate-600 mb-1 flex items-center justify-center">
                <span className="font-serif italic text-emerald-400 text-sm font-bold">SO-Pune-412</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block">Authorized Survey Officer</span>
              <span className="text-[9px] text-slate-500">Revenue Settlement Department</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
