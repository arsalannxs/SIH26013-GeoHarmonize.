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
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Eye, 
  EyeOff, 
  Split, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
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
  const [activeBaseMap, setActiveBaseMap] = useState<'carto' | 'osm' | 'satellite'>('carto');
  const [splitMode, setSplitMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered around Pune Urban Sector (18.5075, 73.8170)
    const map = L.map(mapContainerRef.current, {
      center: [18.5078, 73.8170],
      zoom: 17,
      zoomControl: false,
    });

    // Basemaps
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

    const layerLookup = new Map(layers.map(l => [l.id, l]));

    // Render Parcels
    parcels.forEach(parcel => {
      const coords = parcel.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
      const isSelected = selectedParcel?.ulpin === parcel.ulpin;

      // 1. Cadastral Layer (Amber dashed boundary)
      const cadastralConfig = layerLookup.get('cadastral');
      if (cadastralConfig && cadastralConfig.visible) {
        const poly = L.polygon(coords, {
          color: '#d97706',
          weight: isSelected ? 3 : 2,
          dashArray: '5, 5',
          fillColor: '#f59e0b',
          fillOpacity: cadastralConfig.opacity * 0.15,
        });

        poly.bindTooltip(`<b>Survey No: ${parcel.surveyNumber}</b><br>Deed Area: ${parcel.deedAreaSqM} m²`, {
          sticky: true,
          className: 'gis-tooltip text-xs font-sans',
        });

        poly.on('click', () => onSelectParcel(parcel));
        cadastral.addLayer(poly);
      }

      // 2. Drone Ortho / Physical Ground Footprint (Cyan boundary with slight physical offset simulation if conflicted)
      const droneConfig = layerLookup.get('drone_ortho');
      if (droneConfig && droneConfig.visible) {
        // Physical footprint offset simulation for visualization
        const droneCoords = parcel.status === 'CONFLICT_FLAGGED' 
          ? coords.map(([lat, lng], idx) => idx === 1 || idx === 2 ? [lat + 0.00008, lng + 0.0001] as [number, number] : [lat, lng] as [number, number])
          : coords;

        const dronePoly = L.polygon(droneCoords, {
          color: '#0284c7',
          weight: 2,
          fillColor: '#38bdf8',
          fillOpacity: droneConfig.opacity * 0.25,
        });

        dronePoly.bindTooltip(`<b>UAV Built Footprint</b><br>Surveyed: ${parcel.droneAreaSqM} m²`, {
          sticky: true,
          className: 'gis-tooltip text-xs font-sans',
        });

        dronePoly.on('click', () => onSelectParcel(parcel));
        drone_ortho.addLayer(dronePoly);
      }

      // 3. Master Plan Zoning Layer (Violet setback buffer lines)
      const masterConfig = layerLookup.get('master_plan');
      if (masterConfig && masterConfig.visible && (parcel.landUse === 'PUBLIC_UTILITY' || parcel.landUse === 'GREEN_BELT')) {
        const masterPoly = L.polygon(coords, {
          color: '#8b5cf6',
          weight: 2,
          dashArray: '2, 4',
          fillColor: '#a855f7',
          fillOpacity: masterConfig.opacity * 0.3,
        });
        masterPoly.bindTooltip(`<b>Master Plan Zone: ${parcel.landUse}</b>`, { sticky: true });
        master_plan.addLayer(masterPoly);
      }

      // 4. Harmonized Golden Layer (Emerald solid with verified ULPIN)
      const harmonizedConfig = layerLookup.get('harmonized');
      if (harmonizedConfig && harmonizedConfig.visible && parcel.status === 'HARMONIZED') {
        const harmPoly = L.polygon(coords, {
          color: '#059669',
          weight: isSelected ? 4 : 2.5,
          fillColor: '#10b981',
          fillOpacity: harmonizedConfig.opacity * 0.35,
        });

        harmPoly.bindTooltip(
          `<b>ULPIN: ${parcel.ulpin}</b><br><span style="color:#059669; font-weight:600;">✓ Harmonized (${parcel.harmonizedAreaSqM || parcel.deedAreaSqM} m²)</span>`,
          { sticky: true, className: 'gis-tooltip-emerald' }
        );

        harmPoly.on('click', () => onSelectParcel(parcel));
        harmonized.addLayer(harmPoly);
      }
    });

    // Render Conflict Markers & Overlap Zones
    conflicts.forEach(conflict => {
      if (conflict.status === 'RESOLVED') return;

      const [lng, lat] = conflict.coordinates;
      const isSelected = selectedConflict?.conflictId === conflict.conflictId;

      // Pulse circle marker at conflict centroid
      const pulseMarker = L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 8,
        color: conflict.severity === 'CRITICAL' ? '#dc2626' : '#ea580c',
        fillColor: conflict.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
        fillOpacity: 0.85,
        weight: 2,
      });

      pulseMarker.bindTooltip(
        `<b>${conflict.type} (${conflict.severity})</b><br>${conflict.description.slice(0, 75)}...<br><span style="color:#ef4444; font-weight:600;">Click to Resolve with AI</span>`,
        { sticky: true }
      );

      pulseMarker.on('click', () => onSelectConflict(conflict));
      conflictsLayer.addLayer(pulseMarker);

      // If conflict has boundary polygon, draw highlighted red zone
      if (conflict.boundaryConflictGeo) {
        const polyCoords = conflict.boundaryConflictGeo.coordinates[0].map(([cLng, cLat]) => [cLat, cLng] as [number, number]);
        const conflictZone = L.polygon(polyCoords, {
          color: '#ef4444',
          weight: 2,
          dashArray: '3, 3',
          fillColor: '#f87171',
          fillOpacity: 0.5,
        });
        conflictZone.on('click', () => onSelectConflict(conflict));
        conflictsLayer.addLayer(conflictZone);
      }
    });
  }, [parcels, conflicts, layers, selectedParcel, selectedConflict]);

  // Center map on selected parcel or conflict
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedConflict) {
      const [lng, lat] = selectedConflict.coordinates;
      map.flyTo([lat, lng], 18, { duration: 1.2 });
    } else if (selectedParcel) {
      const coords = selectedParcel.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }, [selectedParcel, selectedConflict]);

  const handleResetView = () => {
    mapRef.current?.flyTo([18.5078, 73.8170], 17, { duration: 1 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Map Control Floating Toolbar */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-lg text-xs">
        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          title="Reset to Sector Overview"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Overview</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700" />

        <button
          onClick={() => setSplitMode(!splitMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
            splitMode ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Compare Multi-Source Overlap vs Harmonized Land Record"
        >
          <Split className="w-3.5 h-3.5 text-teal-300" />
          <span>{splitMode ? 'Exit Split View' : 'Compare View'}</span>
        </button>
      </div>

      {/* Layer legend pill in bottom-left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-800 shadow-xl text-xs flex flex-col gap-2 max-w-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Multi-Source Spatial Layers
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500" />
            <span className="text-slate-300 text-[11px]">Cadastral (Deed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm bg-sky-500/50 border border-sky-400" />
            <span className="text-slate-300 text-[11px]">UAV Drone Ortho</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm bg-purple-500/40 border border-purple-400" />
            <span className="text-slate-300 text-[11px]">Master Plan 2035</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm bg-emerald-500/60 border border-emerald-400" />
            <span className="text-slate-300 text-[11px] font-medium text-emerald-300">Harmonized ULPIN</span>
          </div>
        </div>
      </div>

      {/* Selected Parcel Quick Info Card */}
      {selectedParcel && (
        <div className="absolute top-4 right-14 z-[400] bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl max-w-sm w-80 text-xs text-slate-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
            <div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">
                {selectedParcel.ulpin}
              </span>
              <h4 className="font-bold text-sm text-white">Survey No. {selectedParcel.surveyNumber}</h4>
              <p className="text-[11px] text-slate-400">{selectedParcel.village}, {selectedParcel.wardNo}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedParcel.status === 'HARMONIZED' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {selectedParcel.status}
            </span>
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-slate-400">
              <span>Owner:</span>
              <span className="text-slate-200 font-medium">{selectedParcel.ownerName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Deed Area:</span>
              <span className="text-slate-200 font-mono">{selectedParcel.deedAreaSqM} m²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Drone Extracted:</span>
              <span className="text-slate-200 font-mono">{selectedParcel.droneAreaSqM} m²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Harmonized Final:</span>
              <span className="text-emerald-400 font-mono font-bold">{selectedParcel.harmonizedAreaSqM || selectedParcel.deedAreaSqM} m²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Discrepancy:</span>
              <span className={`font-medium ${selectedParcel.discrepancyPercent > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedParcel.discrepancyPercent}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenCertificate(selectedParcel)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg transition-colors"
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
