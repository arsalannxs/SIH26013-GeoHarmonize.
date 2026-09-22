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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Official Harmonized Land Record Certificate (Bhu-Aadhaar)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Layout - Official White Parchment */}
        <div className="p-8 bg-white rounded-xl border-2 border-emerald-700 relative text-slate-900 shadow-sm">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Landmark className="w-80 h-80 text-emerald-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b-2 border-emerald-700/80 pb-5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Landmark className="w-6 h-6 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Department of Land Resources (DoLR) • Ministry of Rural Development
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-950 tracking-wide">
              BHU-AADHAAR / ULPIN HARMONIZATION CERTIFICATE
            </h2>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">
              National Aerial & Cadastral Geospatial Integration Standard • SIH 26013
            </p>
          </div>

          {/* ULPIN Highlight Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-6">
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                Unique Land Parcel Identification Number (ULPIN)
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-950 tracking-wider">
                {parcel.ulpin}
              </span>
            </div>
            <div className="w-12 h-12 bg-white p-1 rounded-lg border border-emerald-200 flex items-center justify-center text-slate-900 shadow-xs">
              <QrCode className="w-10 h-10" />
            </div>
          </div>

          {/* Land Attributes Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs mb-6 border-b border-slate-200 pb-6">
            <div>
              <span className="text-slate-500 block text-[11px]">Revenue Survey Number:</span>
              <span className="font-bold text-slate-950 text-sm">{parcel.surveyNumber} {parcel.subDivision ? `(Sub-div: ${parcel.subDivision})` : ''}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Registered Legal Owner:</span>
              <span className="font-bold text-slate-950 text-sm">{parcel.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Revenue Village & Ward:</span>
              <span className="text-slate-800 font-semibold">{parcel.village}, {parcel.wardNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ULB Municipal Tax ID:</span>
              <span className="font-mono text-slate-800 font-medium">{parcel.taxId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Statutory Land Use Category:</span>
              <span className="text-slate-800 font-bold">{parcel.landUse}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Coordinate System:</span>
              <span className="font-mono text-slate-800 font-medium">{parcel.crs} (Unified National Grid)</span>
            </div>
          </div>

          {/* Multi-source Area Audit Trail */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
              Multi-Source Reconciliation Audit Trail
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-amber-800 block font-bold">Deed/Jamabandi Area</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{parcel.deedAreaSqM} m²</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-sky-800 block font-bold">UAV Drone Ortho Area</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{parcel.droneAreaSqM} m²</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300">
                <span className="text-[10px] text-emerald-800 block font-bold">Harmonized Legal Area</span>
                <span className="font-mono font-extrabold text-emerald-950 text-sm">
                  {parcel.harmonizedAreaSqM || parcel.deedAreaSqM} m²
                </span>
              </div>
            </div>
          </div>

          {/* Verification Seal & Digital Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-200 text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Geospatial Topological Validity Confirmed</span>
              </div>
              <p className="text-slate-500 font-mono text-[10px]">
                SHA-256: d8f49b1a03e29f8c12a7e9304b12c589
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">
                Harmonized At: {parcel.lastHarmonizedAt ? new Date(parcel.lastHarmonizedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="w-32 h-10 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
                <span className="font-serif italic text-emerald-800 text-sm font-bold">SO-Pune-412</span>
              </div>
              <span className="text-[10px] text-slate-800 font-bold block">Authorized Settlement Officer</span>
              <span className="text-[9px] text-slate-500">Revenue & Land Administration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
