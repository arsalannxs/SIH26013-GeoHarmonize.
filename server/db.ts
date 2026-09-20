import { MongoClient, Db } from 'mongodb';
import { ParcelRecord, GeospatialConflict, AuditLogEntry, SpatialLayerConfig, DatabaseStatus } from '../src/types.js';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionMode: 'ATLAS_MONGODB' | 'IN_MEMORY_PERSISTENT' = 'IN_MEMORY_PERSISTENT';
let connectionError: string | null = null;
let activeUri: string | null = process.env.MONGODB_URI || null;

// Realistic seed data for urban land record integration (Sector 14 Smart City Urban Land Zone)
const INITIAL_PARCELS: ParcelRecord[] = [
  {
    ulpin: 'IN-MH-PN-78401',
    surveyNumber: '142/1',
    subDivision: 'A',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'Venkatesh R. Deshmukh',
    taxId: 'ULB-PN-2024-8841',
    landUse: 'RESIDENTIAL',
    deedAreaSqM: 1250.0,
    surveyedAreaSqM: 1225.4,
    droneAreaSqM: 1285.2,
    harmonizedAreaSqM: 1250.0,
    discrepancyPercent: 4.8,
    status: 'CONFLICT_FLAGGED',
    confidenceScore: 78,
    crs: 'EPSG:4326',
    sourceLayers: ['cadastral', 'drone_ortho', 'master_plan'],
    conflictIds: ['CONF-2026-001'],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8152, 18.5085],
        [73.8164, 18.5088],
        [73.8162, 18.5074],
        [73.8150, 18.5071],
        [73.8152, 18.5085]
      ]]
    }
  },
  {
    ulpin: 'IN-MH-PN-78402',
    surveyNumber: '142/2',
    subDivision: 'B',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'Ananya S. Kulkarni',
    taxId: 'ULB-PN-2024-8842',
    landUse: 'RESIDENTIAL',
    deedAreaSqM: 980.0,
    surveyedAreaSqM: 982.1,
    droneAreaSqM: 955.0,
    harmonizedAreaSqM: 980.0,
    discrepancyPercent: 2.7,
    status: 'CONFLICT_FLAGGED',
    confidenceScore: 82,
    crs: 'EPSG:4326',
    sourceLayers: ['cadastral', 'drone_ortho'],
    conflictIds: ['CONF-2026-001', 'CONF-2026-002'],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8164, 18.5088],
        [73.8175, 18.5091],
        [73.8173, 18.5077],
        [73.8162, 18.5074],
        [73.8164, 18.5088]
      ]]
    }
  },
  {
    ulpin: 'IN-MH-PN-78403',
    surveyNumber: '143',
    subDivision: 'Main',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'MahaMetro Infrastructure Corp',
    taxId: 'ULB-PN-2024-PUB01',
    landUse: 'PUBLIC_UTILITY',
    deedAreaSqM: 2400.0,
    surveyedAreaSqM: 2395.0,
    droneAreaSqM: 2410.0,
    harmonizedAreaSqM: 2400.0,
    discrepancyPercent: 0.6,
    status: 'HARMONIZED',
    confidenceScore: 98,
    crs: 'EPSG:4326',
    sourceLayers: ['cadastral', 'drone_ortho', 'master_plan'],
    lastHarmonizedAt: '2026-09-18T10:30:00Z',
    harmonizationMethod: 'AFFINE_TRANSFORMATION_GCP',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8150, 18.5071],
        [73.8173, 18.5077],
        [73.8171, 18.5063],
        [73.8148, 18.5057],
        [73.8150, 18.5071]
      ]]
    }
  },
  {
    ulpin: 'IN-MH-PN-78404',
    surveyNumber: '144/A',
    subDivision: '1',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'Shri Balaji Developers LLP',
    taxId: 'ULB-PN-2024-COMM44',
    landUse: 'COMMERCIAL',
    deedAreaSqM: 3100.0,
    surveyedAreaSqM: 3050.0,
    droneAreaSqM: 3220.0,
    harmonizedAreaSqM: 3100.0,
    discrepancyPercent: 5.5,
    status: 'CONFLICT_FLAGGED',
    confidenceScore: 71,
    crs: 'EPSG:4326',
    sourceLayers: ['cadastral', 'drone_ortho', 'master_plan'],
    conflictIds: ['CONF-2026-003'],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8175, 18.5091],
        [73.8190, 18.5095],
        [73.8187, 18.5080],
        [73.8173, 18.5077],
        [73.8175, 18.5091]
      ]]
    }
  },
  {
    ulpin: 'IN-MH-PN-78405',
    surveyNumber: '144/B',
    subDivision: '2',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'Pune Municipal Corp (Green Reserve)',
    taxId: 'ULB-PN-2024-ENV99',
    landUse: 'GREEN_BELT',
    deedAreaSqM: 1800.0,
    surveyedAreaSqM: 1800.0,
    droneAreaSqM: 1720.0,
    harmonizedAreaSqM: 1800.0,
    discrepancyPercent: 4.4,
    status: 'CONFLICT_FLAGGED',
    confidenceScore: 68,
    crs: 'EPSG:4326',
    sourceLayers: ['master_plan', 'drone_ortho'],
    conflictIds: ['CONF-2026-003'],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8187, 18.5080],
        [73.8198, 18.5083],
        [73.8195, 18.5068],
        [73.8184, 18.5065],
        [73.8187, 18.5080]
      ]]
    }
  },
  {
    ulpin: 'IN-MH-PN-78406',
    surveyNumber: '145/1',
    subDivision: 'A',
    village: 'Kothrud Urban',
    wardNo: 'Ward 24',
    district: 'Pune',
    ownerName: 'Sunita Mehra & Rajesh Mehra',
    taxId: 'ULB-PN-2024-9122',
    landUse: 'RESIDENTIAL',
    deedAreaSqM: 850.0,
    surveyedAreaSqM: 852.0,
    droneAreaSqM: 848.0,
    harmonizedAreaSqM: 850.0,
    discrepancyPercent: 0.5,
    status: 'HARMONIZED',
    confidenceScore: 97,
    crs: 'EPSG:4326',
    sourceLayers: ['cadastral', 'drone_ortho'],
    lastHarmonizedAt: '2026-09-17T14:15:00Z',
    harmonizationMethod: 'TOPOLOGICAL_SNAPPING_DOUGLAS_PEUCKER',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [73.8173, 18.5077],
        [73.8187, 18.5080],
        [73.8184, 18.5065],
        [73.8171, 18.5063],
        [73.8173, 18.5077]
      ]]
    }
  }
];

const INITIAL_CONFLICTS: GeospatialConflict[] = [
  {
    conflictId: 'CONF-2026-001',
    type: 'ENCROACHMENT',
    severity: 'HIGH',
    status: 'DETECTED',
    primaryParcelUlpin: 'IN-MH-PN-78401',
    primarySurveyNo: '142/1',
    conflictingParcelUlpin: 'IN-MH-PN-78402',
    conflictingSurveyNo: '142/2',
    conflictAreaSqM: 35.2,
    description: 'High-resolution drone orthophoto reveals compound wall and garage construction extending 1.8m across the cadastral boundary of Parcel 142/2.',
    affectedLayers: ['cadastral', 'drone_ortho'],
    coordinates: [73.8163, 18.5081],
    boundaryConflictGeo: {
      type: 'Polygon',
      coordinates: [[
        [73.8162, 18.5083],
        [73.8166, 18.5084],
        [73.8165, 18.5079],
        [73.8161, 18.5078],
        [73.8162, 18.5083]
      ]]
    },
    aiAnalysis: {
      cause: 'Physical boundary shift: Construction built according to local site pegging without DGPS verification against the state cadastral vector map.',
      legalPrecedent: 'Maharashtra Land Revenue Code Sec. 138 (Boundary dispute settlement by Tahsildar / Joint Sub-division Survey).',
      recommendedAction: 'Propose automated mid-line reconciliation or notice for mutual deed rectification with compounding fee.',
      confidence: 94,
      statutorySection: 'MLRC Sec. 138 / ULPIN Guideline Part IV'
    },
    detectedAt: '2026-09-19T08:20:00Z'
  },
  {
    conflictId: 'CONF-2026-002',
    type: 'SLIVER_GAP',
    severity: 'MEDIUM',
    status: 'DETECTED',
    primaryParcelUlpin: 'IN-MH-PN-78402',
    primarySurveyNo: '142/2',
    conflictingParcelUlpin: 'IN-MH-PN-78403',
    conflictingSurveyNo: '143',
    conflictAreaSqM: 14.8,
    description: 'Topological sliver gap detected between cadastral boundary and public utility right-of-way due to legacy chain-survey rounding discrepancy.',
    affectedLayers: ['cadastral', 'master_plan'],
    coordinates: [73.8168, 18.5073],
    boundaryConflictGeo: {
      type: 'Polygon',
      coordinates: [[
        [73.8167, 18.5075],
        [73.8171, 18.5076],
        [73.8170, 18.5072],
        [73.8166, 18.5071],
        [73.8167, 18.5075]
      ]]
    },
    aiAnalysis: {
      cause: 'Topological vertex misalignment caused by digitization of 1:1000 scale paper revenue sheets without snapping constraints.',
      legalPrecedent: 'Digital India Land Records Modernization Programme (DILRMP) Snapping Standard 2024.',
      recommendedAction: 'Apply automated topological node snapping to master utility alignment with zero revenue leakage.',
      confidence: 98,
      statutorySection: 'DILRMP Rule 14-B'
    },
    detectedAt: '2026-09-19T08:25:00Z'
  },
  {
    conflictId: 'CONF-2026-003',
    type: 'ZONING_VIOLATION',
    severity: 'CRITICAL',
    status: 'DETECTED',
    primaryParcelUlpin: 'IN-MH-PN-78404',
    primarySurveyNo: '144/A',
    conflictingParcelUlpin: 'IN-MH-PN-78405',
    conflictingSurveyNo: '144/B',
    conflictAreaSqM: 82.5,
    description: 'Commercial construction footprint penetrates into designated municipal Green Belt buffer reservation (Master Plan 2035).',
    affectedLayers: ['drone_ortho', 'master_plan'],
    coordinates: [73.8188, 18.5079],
    boundaryConflictGeo: {
      type: 'Polygon',
      coordinates: [[
        [73.8186, 18.5082],
        [73.8191, 18.5084],
        [73.8190, 18.5076],
        [73.8185, 18.5074],
        [73.8186, 18.5082]
      ]]
    },
    aiAnalysis: {
      cause: 'Unauthorized expansion beyond sanctioned layout plan encroaching on municipal environmental protection buffer.',
      legalPrecedent: 'Urban Development & Town Planning Act Sec. 52 (Unauthorized Development in Reserved Zones).',
      recommendedAction: 'Issue automated stop-work notice and truncate parcel polygon to legal setback buffer.',
      confidence: 96,
      statutorySection: 'MRTP Act 1966 Sec. 52'
    },
    detectedAt: '2026-09-19T09:10:00Z'
  }
];

const INITIAL_LAYERS: SpatialLayerConfig[] = [
  {
    id: 'cadastral',
    name: 'Cadastral Land Records (Revenue Map)',
    description: 'Digitized village revenue map boundaries, Khasra numbers, and sub-divisions',
    sourceCRS: 'EPSG:4326',
    visible: true,
    opacity: 0.85,
    color: '#f59e0b', // amber
    dashArray: '4, 4',
    featureCount: 6,
    lastUpdated: '2026-09-15'
  },
  {
    id: 'drone_ortho',
    name: 'UAV / Drone Orthomosaic Survey',
    description: 'Centimeter-accuracy physical ground survey, compound walls, and building footprints',
    sourceCRS: 'EPSG:32643',
    visible: true,
    opacity: 0.75,
    color: '#06b6d4', // cyan
    featureCount: 8,
    lastUpdated: '2026-09-18'
  },
  {
    id: 'master_plan',
    name: 'Master Plan 2035 (Zoning & Utilities)',
    description: 'Statutory urban zoning, road widening corridors, and green reserve buffers',
    sourceCRS: 'EPSG:3857',
    visible: true,
    opacity: 0.60,
    color: '#a855f7', // purple
    featureCount: 4,
    lastUpdated: '2026-09-01'
  },
  {
    id: 'harmonized',
    name: 'Intelligently Harmonized Bhu-Aadhaar Layer',
    description: 'Unified topologically cleaned boundaries with generated 14-digit ULPIN identifiers',
    sourceCRS: 'EPSG:4326',
    visible: true,
    opacity: 0.95,
    color: '#10b981', // emerald
    featureCount: 6,
    lastUpdated: '2026-09-20'
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    logId: 'AUD-001',
    timestamp: '2026-09-18T10:30:00Z',
    actor: 'Automated Harmonization Engine',
    action: 'AFFINE_CRS_ALIGNMENT',
    parcelUlpin: 'IN-MH-PN-78403',
    details: 'Converted source coordinates from UTM 43N to WGS84 and snapped to ground truth GCPs.',
    signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    logId: 'AUD-002',
    timestamp: '2026-09-19T08:20:12Z',
    actor: 'Topological Conflict Scanner',
    action: 'CONFLICT_DETECTED',
    parcelUlpin: 'IN-MH-PN-78401',
    details: 'Detected 35.2 sq.m encroachment on parcel 142/2 with Drone Orthophoto layer.',
    signatureHash: 'c4ca4238a0b923820dcc509a6f75849b2830f0f3531b7852b855e3b0c44298fc'
  },
  {
    logId: 'AUD-003',
    timestamp: '2026-09-20T11:00:00Z',
    actor: 'Survey Officer (ID: SO-412)',
    action: 'DATASET_INGESTION',
    parcelUlpin: 'ALL',
    details: 'Multi-source ingestion completed: Cadastral GeoJSON, Drone Orthomosaic, and Master Plan 2035.',
    signatureHash: 'a8f5f167f44f4964e6c998dee827110c8841a0298a44b934ca495991b7852b85'
  }
];

// In-memory collections state (always available fallback and for zero-config preview)
let memParcels: ParcelRecord[] = JSON.parse(JSON.stringify(INITIAL_PARCELS));
let memConflicts: GeospatialConflict[] = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
let memLayers: SpatialLayerConfig[] = JSON.parse(JSON.stringify(INITIAL_LAYERS));
let memAuditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

export async function initMongoDb(uriOverride?: string): Promise<{ success: boolean; mode: string; error?: string }> {
  const uriToUse = uriOverride || activeUri;
  activeUri = uriToUse;

  if (!uriToUse || uriToUse.includes('<username>') || uriToUse.includes('<password>')) {
    connectionMode = 'IN_MEMORY_PERSISTENT';
    isConnected = true;
    connectionError = 'MongoDB Atlas URI not configured or contains placeholder credentials. Running on high-performance local persistent store.';
    return { success: true, mode: connectionMode, error: connectionError };
  }

  try {
    if (client) {
      await client.close().catch(() => {});
    }
    client = new MongoClient(uriToUse, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db('geoharmonize');
    isConnected = true;
    connectionMode = 'ATLAS_MONGODB';
    connectionError = null;

    // Ensure collections and indexes exist
    const parcelsCol = db.collection('parcels');
    const conflictsCol = db.collection('conflicts');
    const layersCol = db.collection('spatial_layers');
    const logsCol = db.collection('audit_logs');

    await parcelsCol.createIndex({ ulpin: 1 }, { unique: true }).catch(() => {});
    await parcelsCol.createIndex({ geometry: '2dsphere' }).catch(() => {});
    await conflictsCol.createIndex({ conflictId: 1 }, { unique: true }).catch(() => {});

    // Seed if empty
    const count = await parcelsCol.countDocuments();
    if (count === 0) {
      await parcelsCol.insertMany(memParcels as any);
      await conflictsCol.insertMany(memConflicts as any);
      await layersCol.insertMany(memLayers as any);
      await logsCol.insertMany(memAuditLogs as any);
    }

    return { success: true, mode: connectionMode };
  } catch (err: any) {
    connectionMode = 'IN_MEMORY_PERSISTENT';
    isConnected = true;
    connectionError = `Could not connect to MongoDB Atlas: ${err?.message || err}. Falling back to resilient local store.`;
    return { success: false, mode: connectionMode, error: connectionError };
  }
}

export function getDatabaseStatus(): DatabaseStatus {
  return {
    connected: isConnected,
    mode: connectionMode,
    clusterName: connectionMode === 'ATLAS_MONGODB' ? 'MongoDB Atlas Cluster (Live)' : 'In-Memory Resilient Engine',
    databaseName: 'geoharmonize',
    collectionCounts: {
      parcels: memParcels.length,
      conflicts: memConflicts.length,
      audit_logs: memAuditLogs.length,
      spatial_layers: memLayers.length,
    },
    error: connectionError || undefined,
  };
}

// Data access abstractions that query Atlas if connected, or fallback to in-memory
export async function getAllParcels(): Promise<ParcelRecord[]> {
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      const items = await db.collection<ParcelRecord>('parcels').find({}).toArray();
      if (items.length > 0) return items;
    } catch (e) {
      console.error('Atlas read error, fallback to memory:', e);
    }
  }
  return memParcels;
}

export async function getParcelByUlpin(ulpin: string): Promise<ParcelRecord | null> {
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      const item = await db.collection<ParcelRecord>('parcels').findOne({ ulpin });
      if (item) return item;
    } catch (e) {}
  }
  return memParcels.find(p => p.ulpin === ulpin) || null;
}

export async function updateParcel(ulpin: string, patch: Partial<ParcelRecord>): Promise<ParcelRecord | null> {
  const index = memParcels.findIndex(p => p.ulpin === ulpin);
  if (index !== -1) {
    memParcels[index] = { ...memParcels[index], ...patch };
  }

  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('parcels').updateOne({ ulpin }, { $set: patch });
    } catch (e) {
      console.error('Atlas update error:', e);
    }
  }
  return memParcels[index] || null;
}

export async function createParcel(parcel: ParcelRecord): Promise<ParcelRecord> {
  memParcels.push(parcel);
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('parcels').insertOne(parcel as any);
    } catch (e) {
      console.error('Atlas insert error:', e);
    }
  }
  return parcel;
}

export async function getAllConflicts(): Promise<GeospatialConflict[]> {
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      const items = await db.collection<GeospatialConflict>('conflicts').find({}).toArray();
      if (items.length > 0) return items;
    } catch (e) {}
  }
  return memConflicts;
}

export async function updateConflict(conflictId: string, patch: Partial<GeospatialConflict>): Promise<GeospatialConflict | null> {
  const index = memConflicts.findIndex(c => c.conflictId === conflictId);
  if (index !== -1) {
    memConflicts[index] = { ...memConflicts[index], ...patch };
  }

  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('conflicts').updateOne({ conflictId }, { $set: patch });
    } catch (e) {}
  }
  return memConflicts[index] || null;
}

export async function getAllLayers(): Promise<SpatialLayerConfig[]> {
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      const items = await db.collection<SpatialLayerConfig>('spatial_layers').find({}).toArray();
      if (items.length > 0) return items;
    } catch (e) {}
  }
  return memLayers;
}

export async function updateLayer(id: string, patch: Partial<SpatialLayerConfig>): Promise<SpatialLayerConfig | null> {
  const index = memLayers.findIndex(l => l.id === id);
  if (index !== -1) {
    memLayers[index] = { ...memLayers[index], ...patch };
  }
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('spatial_layers').updateOne({ id }, { $set: patch });
    } catch (e) {}
  }
  return memLayers[index] || null;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      const items = await db.collection<AuditLogEntry>('audit_logs').find({}).sort({ timestamp: -1 }).toArray();
      if (items.length > 0) return items;
    } catch (e) {}
  }
  return [...memAuditLogs].reverse();
}

export async function addAuditLog(entry: Omit<AuditLogEntry, 'logId' | 'timestamp' | 'signatureHash'>): Promise<AuditLogEntry> {
  const newLog: AuditLogEntry = {
    ...entry,
    logId: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    signatureHash: 'sha256-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  };
  memAuditLogs.push(newLog);

  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('audit_logs').insertOne(newLog as any);
    } catch (e) {}
  }
  return newLog;
}

export async function resetDatabaseToDefault() {
  memParcels = JSON.parse(JSON.stringify(INITIAL_PARCELS));
  memConflicts = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
  memLayers = JSON.parse(JSON.stringify(INITIAL_LAYERS));
  memAuditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

  if (db && connectionMode === 'ATLAS_MONGODB') {
    try {
      await db.collection('parcels').deleteMany({});
      await db.collection('parcels').insertMany(memParcels as any);
      await db.collection('conflicts').deleteMany({});
      await db.collection('conflicts').insertMany(memConflicts as any);
      await db.collection('spatial_layers').deleteMany({});
      await db.collection('spatial_layers').insertMany(memLayers as any);
      await db.collection('audit_logs').deleteMany({});
      await db.collection('audit_logs').insertMany(memAuditLogs as any);
    } catch (e) {}
  }
}
