import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  ParcelRecord, 
  GeospatialConflict, 
  SpatialLayerConfig, 
  LayerType 
} from '../types';
import { 
  Maximize2, 
  Layers, 
  Eye, 
  EyeOff, 
  Split, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Compass,
  MapPin
} from 'lucide-react';

interface MapViewerProps {
  parcels: ParcelRecord[];
  conflicts: GeospatialConflict[];
  layers: SpatialLayerConfig[];
  selectedParcel: ParcelRecord | null;
  selectedConflict: GeospatialConflict | null;
  onSelectParcel: (parcel: ParcelRecord) => void;
  onSelectConflict: (conflict: GeospatialConflict) => void;
  onOpenCertificate: (parcel: ParcelRecord) => void;
  onUpdateLayer: (id: LayerType, patch: Partial<SpatialLayerConfig>) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  parcels,
  conflicts,
  layers,
  selectedParcel,
  selectedConflict,
  onSelectParcel,
  onSelectConflict,
  onOpenCertificate,
  onUpdateLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const [splitMode, setSplitMode] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered around Pune Urban Sector (18.5078, 73.8170)
    const map = L.map(mapContainerRef.current, {
      center: [18.5078, 73.8170],
      zoom: 17,
      zoomControl: false,
    });

    // Basemaps: CARTO Positron (High-contrast clean white cartography)
    const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 20,
    });

    cartoPositron.addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer groups for our multi-source geospatial data
    layerGroupsRef.current = {
      cadastral: L.layerGroup().addTo(map),
      drone_ortho: L.layerGroup().addTo(map),
      master_plan: L.layerGroup().addTo(map),
      harmonized: L.layerGroup().addTo(map),
      conflicts: L.layerGroup().addTo(map),
    };

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update polygons and layers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const { cadastral, drone_ortho, master_plan, harmonized, conflicts: conflictsLayer } = layerGroupsRef.current;
    if (!cadastral || !drone_ortho || !master_plan || !harmonized || !conflictsLayer) return;

    // Clear previous vector features
    cadastral.clearLayers();
    drone_ortho.clearLayers();
    master_plan.clearLayers();
    harmonized.clearLayers();
    conflictsLayer.clearLayers();

    const layerMap: { [key: string]: SpatialLayerConfig } = {};
    layers.forEach(l => {
      layerMap[l.id] = l;
    });

    parcels.forEach(parcel => {
      const isSelected = selectedParcel?.ulpin === parcel.ulpin;

      // 1. Cadastral Layer (Revenue Deed Vector)
      if (layerMap.cadastral?.visible && parcel.geometry?.coordinates?.[0]) {
        const basePts = parcel.cadastralBoundary?.coordinates?.[0] || parcel.geometry.coordinates[0];
        const coords = basePts.map((pt: number[]) => {
          // If using base geometry, add slight deed representation offset
          const lat = parcel.cadastralBoundary ? pt[1] : pt[1] + 0.00006;
          const lng = parcel.cadastralBoundary ? pt[0] : pt[0] - 0.00006;
          return [lat, lng] as [number, number];
        });
        const poly = L.polygon(coords, {
          color: '#d97706', // amber-600
          weight: isSelected ? 3 : 2,
          dashArray: '5, 5',
          fillColor: '#f59e0b',
          fillOpacity: (layerMap.cadastral.opacity || 0.5) * 0.25,
        });

        poly.bindTooltip(`Cadastral Deed: Surv ${parcel.surveyNumber} (${parcel.deedAreaSqM} m²)`, {
          className: 'gis-tooltip',
          sticky: true,
        });
        poly.on('click', () => onSelectParcel(parcel));
        cadastral.addLayer(poly);
      }

      // 2. Drone Orthophoto Extracted Footprint (Physical Compound Wall / Roof)
      if (layerMap.drone_ortho?.visible && parcel.geometry?.coordinates?.[0]) {
        const basePts = parcel.droneBoundary?.coordinates?.[0] || parcel.geometry.coordinates[0];
        const coords = basePts.map((pt: number[]) => {
          // If using base geometry, add slight physical survey variation
          const lat = parcel.droneBoundary ? pt[1] : pt[1] - 0.00004;
          const lng = parcel.droneBoundary ? pt[0] : pt[0] + 0.00005;
          return [lat, lng] as [number, number];
        });
        const poly = L.polygon(coords, {
          color: '#0284c7', // sky-600
          weight: 2,
          fillColor: '#38bdf8',
          fillOpacity: (layerMap.drone_ortho.opacity || 0.7) * 0.3,
        });

        poly.bindTooltip(`UAV Drone Footprint: ${parcel.droneAreaSqM} m²`, {
          className: 'gis-tooltip',
          sticky: true,
        });
        poly.on('click', () => onSelectParcel(parcel));
        drone_ortho.addLayer(poly);
      }

      // 3. Harmonized Statutory Parcel (Clean Reconciled Polygon)
      if (layerMap.harmonized?.visible && parcel.geometry?.coordinates?.[0]) {
        const coords = parcel.geometry.coordinates[0].map(
          (pt: number[]) => [pt[1], pt[0]] as [number, number]
        );
        const poly = L.polygon(coords, {
          color: isSelected ? '#047857' : '#059669', // emerald-700
          weight: isSelected ? 3.5 : 2.5,
          fillColor: '#10b981',
          fillOpacity: (layerMap.harmonized.opacity || 0.8) * 0.35,
        });

        poly.bindTooltip(`Bhu-Aadhaar: ${parcel.ulpin} (Survey ${parcel.surveyNumber})`, {
          className: 'gis-tooltip-emerald',
          sticky: true,
        });
        poly.on('click', () => onSelectParcel(parcel));
        harmonized.addLayer(poly);
      }
    });

    // 4. Master Plan 2035 Statutory Buffers & Road Alignments
    if (layerMap.master_plan?.visible) {
      // Green Belt Environmental Buffer
      const greenBeltCoords: [number, number][] = [
        [18.5085, 73.8184],
        [18.5086, 73.8193],
        [18.5074, 73.8191],
        [18.5073, 73.8182],
      ];
      const greenBeltPoly = L.polygon(greenBeltCoords, {
        color: '#7c3aed', // violet-600
        weight: 2,
        dashArray: '4, 4',
        fillColor: '#8b5cf6',
        fillOpacity: (layerMap.master_plan.opacity || 0.6) * 0.25,
      });
      greenBeltPoly.bindTooltip('Master Plan 2035: Green Belt Environmental Buffer', {
        className: 'gis-tooltip',
      });
      master_plan.addLayer(greenBeltPoly);

      // Utility Right-of-Way Road Corridor
      const roadCoords: [number, number][] = [
        [18.5070, 73.8158],
        [18.5072, 73.8185],
        [18.5068, 73.8185],
        [18.5066, 73.8158],
      ];
      const roadPoly = L.polygon(roadCoords, {
        color: '#6366f1', // indigo-500
        weight: 1.5,
        fillColor: '#818cf8',
        fillOpacity: (layerMap.master_plan.opacity || 0.6) * 0.2,
      });
      roadPoly.bindTooltip('Statutory 24m Right-of-Way Road Widening Reserve', {
        className: 'gis-tooltip',
      });
      master_plan.addLayer(roadPoly);
    }

    // 5. Detected Conflicts Overlays (Red highlighting)
    conflicts.forEach(c => {
      if (c.status === 'RESOLVED') return;

      const isConflictSelected = selectedConflict?.conflictId === c.conflictId;

      if (c.boundaryConflictGeo?.coordinates) {
        const coords = c.boundaryConflictGeo.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );
        const conflictPoly = L.polygon(coords, {
          color: '#dc2626', // red-600
          weight: isConflictSelected ? 3 : 2,
          fillColor: '#ef4444',
          fillOpacity: 0.6,
          className: 'animate-pulse',
        });

        conflictPoly.bindTooltip(`[${c.type}] Conflict ${c.conflictId}: ${c.conflictAreaSqM} m²`, {
          className: 'gis-tooltip',
          sticky: true,
        });

        conflictPoly.on('click', () => onSelectConflict(c));
        conflictsLayer.addLayer(conflictPoly);
      }

      // Marker Icon for Conflict
      const marker = L.circleMarker([c.coordinates[1], c.coordinates[0]], {
        radius: isConflictSelected ? 9 : 7,
        fillColor: c.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      });

      marker.bindTooltip(`Conflict: ${c.type} (${c.primarySurveyNo})`, {
        className: 'gis-tooltip',
      });
      marker.on('click', () => onSelectConflict(c));
      conflictsLayer.addLayer(marker);
    });
  }, [parcels, conflicts, layers, selectedParcel, selectedConflict]);

  // Center on selected parcel
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedParcel) return;

    if (selectedParcel.centroid && selectedParcel.centroid.length === 2) {
      map.setView([selectedParcel.centroid[1], selectedParcel.centroid[0]], 18, { animate: true });
    } else if (selectedParcel.geometry?.coordinates?.[0]?.length) {
      const pts = selectedParcel.geometry.coordinates[0];
      let sumLng = 0;
      let sumLat = 0;
      pts.forEach((pt: number[]) => {
        sumLng += pt[0];
        sumLat += pt[1];
      });
      const centerLng = sumLng / pts.length;
      const centerLat = sumLat / pts.length;
      map.setView([centerLat, centerLng], 18, { animate: true });
    }
  }, [selectedParcel]);

  // Center on selected conflict
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedConflict) return;

    const coords = selectedConflict.coordinates;
    if (coords && coords.length === 2) {
      map.setView([coords[1], coords[0]], 19, { animate: true });
    }
  }, [selectedConflict]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([18.5078, 73.8170], 17, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map Control Floating Toolbar */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset to Sector Overview"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sector Overview</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-200" />

        <button
          onClick={() => {
            const nextMode = !splitMode;
            setSplitMode(nextMode);
            if (nextMode) {
              // Hide raw drone and master plan to show clean harmonized result
              onUpdateLayer('drone_ortho', { visible: false });
              onUpdateLayer('harmonized', { visible: true });
            } else {
              onUpdateLayer('drone_ortho', { visible: true });
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
            splitMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Compare Raw Overlaps vs Harmonized Land Records"
        >
          <Split className="w-3.5 h-3.5" />
          <span>{splitMode ? 'Exit Comparison' : 'Compare View'}</span>
        </button>
      </div>

      {/* Layer legend in bottom-left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs flex flex-col gap-2 max-w-xs">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          Multi-Source Vector Layers
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 border-b-2 border-dashed border-amber-600" />
            <span className="text-slate-700 text-[11px] font-medium">Cadastral Deed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2 rounded-xs bg-sky-200 border border-sky-500" />
            <span className="text-slate-700 text-[11px] font-medium">UAV Drone Ortho</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2 rounded-xs bg-purple-200 border border-purple-500" />
            <span className="text-slate-700 text-[11px] font-medium">Master Plan 2035</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2 rounded-xs bg-emerald-200 border border-emerald-600" />
            <span className="text-emerald-800 text-[11px] font-bold">Harmonized ULPIN</span>
          </div>
        </div>
      </div>

      {/* Selected Parcel Quick Info Card */}
      {selectedParcel && (
        <div className="absolute top-4 right-14 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl max-w-sm w-80 text-xs text-slate-800">
          <div className="flex items-start justify-between border-b border-slate-200 pb-2 mb-2">
            <div>
              <span className="text-[10px] text-emerald-700 font-mono font-bold uppercase tracking-wider block">
                {selectedParcel.ulpin}
              </span>
              <h4 className="font-bold text-sm text-slate-900">Survey No. {selectedParcel.surveyNumber}</h4>
              <p className="text-[11px] text-slate-500">{selectedParcel.village}, {selectedParcel.wardNo}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedParcel.status === 'HARMONIZED' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {selectedParcel.status}
            </span>
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-slate-600">
              <span>Owner:</span>
              <span className="text-slate-900 font-semibold">{selectedParcel.ownerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Deed Area:</span>
              <span className="text-slate-900 font-mono">{selectedParcel.deedAreaSqM} m²</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Drone Survey:</span>
              <span className="text-sky-700 font-mono font-medium">{selectedParcel.droneAreaSqM} m²</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Harmonized Final:</span>
              <span className="text-emerald-700 font-mono font-bold">
                {selectedParcel.harmonizedAreaSqM || selectedParcel.deedAreaSqM} m²
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discrepancy:</span>
              <span className={`font-bold ${selectedParcel.discrepancyPercent > 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {selectedParcel.discrepancyPercent}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenCertificate(selectedParcel)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Bhu-Aadhaar Certificate
          </button>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
