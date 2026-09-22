export type LayerType = 'cadastral' | 'drone_ortho' | 'master_plan' | 'harmonized';

export type ConflictType = 
  | 'ENCROACHMENT' 
  | 'OVERLAP' 
  | 'SLIVER_GAP' 
  | 'AREA_DISCORDANCE' 
  | 'ZONING_VIOLATION' 
  | 'CRS_SKEW';

export type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ConflictStatus = 'DETECTED' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
}

export interface ParcelRecord {
  _id?: string;
  ulpin: string; // 14-character Unique Land Parcel Identification Number
  surveyNumber: string;
  subDivision?: string;
  village: string;
  wardNo: string;
  district: string;
  ownerName: string;
  taxId: string;
  landUse: 'RESIDENTIAL' | 'COMMERCIAL' | 'AGRICULTURAL' | 'INDUSTRIAL' | 'PUBLIC_UTILITY' | 'GREEN_BELT';
  deedAreaSqM: number; // Jamabandi/Deed registered area
  surveyedAreaSqM: number; // Traditional cadastral map computed area
  droneAreaSqM: number; // Extracted from drone orthophoto
  harmonizedAreaSqM?: number; // Final legally reconciled area
  discrepancyPercent: number;
  status: 'DRAFT' | 'CONFLICT_FLAGGED' | 'HARMONIZED' | 'UNDER_MUTATION';
  confidenceScore: number; // 0 to 100%
  geometry: GeoPolygon;
  cadastralBoundary?: GeoPolygon;
  droneBoundary?: GeoPolygon;
  centroid?: [number, number];
  sourceLayers: string[];
  conflictIds?: string[];
  lastHarmonizedAt?: string;
  harmonizationMethod?: string;
  crs: string; // e.g. "EPSG:4326"
}

export interface GeospatialConflict {
  _id?: string;
  conflictId: string;
  type: ConflictType;
  severity: ConflictSeverity;
  status: ConflictStatus;
  primaryParcelUlpin: string;
  primarySurveyNo: string;
  conflictingParcelUlpin?: string;
  conflictingSurveyNo?: string;
  conflictAreaSqM: number;
  description: string;
  affectedLayers: LayerType[];
  coordinates: [number, number]; // [lng, lat] conflict centroid
  boundaryConflictGeo?: GeoPolygon;
  aiAnalysis?: {
    cause: string;
    legalPrecedent: string;
    recommendedAction: string;
    confidence: number;
    statutorySection: string;
  };
  resolution?: {
    resolvedAt: string;
    resolvedBy: string;
    method: string;
    adjustedUlpin: string;
    remarks: string;
  };
  detectedAt: string;
}

export interface SpatialLayerConfig {
  id: LayerType;
  name: string;
  description: string;
  sourceCRS: string;
  visible: boolean;
  opacity: number;
  color: string;
  dashArray?: string;
  featureCount: number;
  lastUpdated: string;
}

export interface AuditLogEntry {
  _id?: string;
  logId: string;
  timestamp: string;
  actor: string;
  action: string;
  parcelUlpin: string;
  details: string;
  signatureHash: string;
}

export interface HarmonizationMetrics {
  totalParcels: number;
  harmonizedParcels: number;
  conflictedParcels: number;
  resolvedConflicts: number;
  activeConflicts: number;
  totalLandAreaSqM: number;
  averageDiscrepancy: number;
  harmonizationRate: number;
}

export interface DatabaseStatus {
  connected: boolean;
  mode: 'ATLAS_MONGODB' | 'IN_MEMORY_PERSISTENT';
  clusterName?: string;
  databaseName: string;
  latencyMs?: number;
  collectionCounts: {
    parcels: number;
    conflicts: number;
    audit_logs: number;
    spatial_layers: number;
  };
  error?: string;
}
