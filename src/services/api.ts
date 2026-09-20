import {
  ParcelRecord,
  GeospatialConflict,
  SpatialLayerConfig,
  AuditLogEntry,
  HarmonizationMetrics,
  DatabaseStatus,
} from '../types';

export const api = {
  async getDbStatus(): Promise<DatabaseStatus> {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  async connectDb(uri: string): Promise<{ success: boolean; mode: string; status: DatabaseStatus; error?: string }> {
    const res = await fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  async resetDb(): Promise<{ success: boolean; message: string; status: DatabaseStatus }> {
    const res = await fetch('/api/db/reset', { method: 'POST' });
    return res.json();
  },

  async getParcels(search?: string, status?: string): Promise<ParcelRecord[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/parcels?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch parcels');
    return res.json();
  },

  async getParcel(ulpin: string): Promise<ParcelRecord> {
    const res = await fetch(`/api/parcels/${ulpin}`);
    if (!res.ok) throw new Error('Failed to fetch parcel');
    return res.json();
  },

  async updateParcel(ulpin: string, patch: Partial<ParcelRecord>): Promise<ParcelRecord> {
    const res = await fetch(`/api/parcels/${ulpin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update parcel');
    return res.json();
  },

  async getConflicts(): Promise<GeospatialConflict[]> {
    const res = await fetch('/api/conflicts');
    if (!res.ok) throw new Error('Failed to fetch conflicts');
    return res.json();
  },

  async explainConflictAI(conflictId: string): Promise<any> {
    const res = await fetch(`/api/conflicts/${conflictId}/ai-explain`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to analyze conflict with AI');
    return res.json();
  },

  async resolveConflict(conflictId: string, method: string, remarks?: string): Promise<any> {
    const res = await fetch(`/api/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, remarks }),
    });
    if (!res.ok) throw new Error('Failed to resolve conflict');
    return res.json();
  },

  async triggerAutoHarmonize(): Promise<{ success: boolean; resolvedConflictsCount: number; parcels: ParcelRecord[]; conflicts: GeospatialConflict[] }> {
    const res = await fetch('/api/harmonize/auto', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run automated harmonization');
    return res.json();
  },

  async getLayers(): Promise<SpatialLayerConfig[]> {
    const res = await fetch('/api/layers');
    if (!res.ok) throw new Error('Failed to fetch layers');
    return res.json();
  },

  async updateLayer(id: string, patch: Partial<SpatialLayerConfig>): Promise<SpatialLayerConfig> {
    const res = await fetch(`/api/layers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update layer');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getMetrics(): Promise<HarmonizationMetrics> {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async ingestSample(datasetName: string): Promise<any> {
    const res = await fetch('/api/ingest/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetName }),
    });
    return res.json();
  },
};
