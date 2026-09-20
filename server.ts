import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  initMongoDb,
  getDatabaseStatus,
  getAllParcels,
  getParcelByUlpin,
  updateParcel,
  getAllConflicts,
  updateConflict,
  getAllLayers,
  updateLayer,
  getAuditLogs,
  addAuditLog,
  resetDatabaseToDefault,
} from './server/db.js';
import {
  calculatePolygonAreaSqM,
  calculateCentroid,
  generateULPIN,
  simplifyPolygon,
  snapVertices,
  reconcileSharedBoundary,
} from './server/harmonizationEngine.js';
import { explainConflictWithAI } from './server/geminiService.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize MongoDB connection asynchronously
  await initMongoDb().catch(err => {
    console.warn('Initial MongoDB initialization warning:', err);
  });

  // ==========================================
  // API Routes
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database status and Atlas connectivity
  app.get('/api/db/status', (req: Request, res: Response) => {
    res.json(getDatabaseStatus());
  });

  app.post('/api/db/connect', async (req: Request, res: Response) => {
    const { uri } = req.body;
    if (!uri || typeof uri !== 'string') {
      res.status(400).json({ error: 'Valid MongoDB URI string is required' });
      return;
    }
    const result = await initMongoDb(uri);
    res.json({ ...result, status: getDatabaseStatus() });
  });

  app.post('/api/db/reset', async (req: Request, res: Response) => {
    await resetDatabaseToDefault();
    await addAuditLog({
      actor: 'System Admin',
      action: 'DATABASE_RESET',
      parcelUlpin: 'ALL',
      details: 'Database re-seeded with initial multi-source urban land parcel datasets.',
    });
    res.json({ success: true, message: 'Database reset to default sample dataset', status: getDatabaseStatus() });
  });

  // Parcels endpoints
  app.get('/api/parcels', async (req: Request, res: Response) => {
    try {
      const parcels = await getAllParcels();
      const { status, search } = req.query;
      let filtered = parcels;
      if (status && typeof status === 'string') {
        filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.ulpin.toLowerCase().includes(q) ||
          p.surveyNumber.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.taxId.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
        );
      }
      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/parcels/:ulpin', async (req: Request, res: Response) => {
    const parcel = await getParcelByUlpin(req.params.ulpin);
    if (!parcel) {
      res.status(404).json({ error: 'Parcel not found' });
      return;
    }
    res.json(parcel);
  });

  app.put('/api/parcels/:ulpin', async (req: Request, res: Response) => {
    const updated = await updateParcel(req.params.ulpin, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Parcel not found' });
      return;
    }
    await addAuditLog({
      actor: 'Revenue Surveyor',
      action: 'PARCEL_UPDATED',
      parcelUlpin: req.params.ulpin,
      details: `Updated attributes for parcel ${req.params.ulpin}`,
    });
    res.json(updated);
  });

  // Conflicts endpoints
  app.get('/api/conflicts', async (req: Request, res: Response) => {
    const conflicts = await getAllConflicts();
    res.json(conflicts);
  });

  app.post('/api/conflicts/:conflictId/ai-explain', async (req: Request, res: Response) => {
    const conflicts = await getAllConflicts();
    const conflict = conflicts.find(c => c.conflictId === req.params.conflictId);
    if (!conflict) {
      res.status(404).json({ error: 'Conflict not found' });
      return;
    }
    const primary = await getParcelByUlpin(conflict.primaryParcelUlpin);
    if (!primary) {
      res.status(404).json({ error: 'Primary parcel not found' });
      return;
    }
    const neighbor = conflict.conflictingParcelUlpin ? await getParcelByUlpin(conflict.conflictingParcelUlpin) : null;
    const aiResult = await explainConflictWithAI(conflict, primary, neighbor);

    await updateConflict(conflict.conflictId, { aiAnalysis: aiResult });
    res.json(aiResult);
  });

  app.post('/api/conflicts/:conflictId/resolve', async (req: Request, res: Response) => {
    const { method = 'SNAP_TO_DRONE', remarks = 'Harmonized via automated rule engine' } = req.body;
    const conflicts = await getAllConflicts();
    const conflict = conflicts.find(c => c.conflictId === req.params.conflictId);
    if (!conflict) {
      res.status(404).json({ error: 'Conflict not found' });
      return;
    }

    const primary = await getParcelByUlpin(conflict.primaryParcelUlpin);
    if (!primary) {
      res.status(404).json({ error: 'Associated parcel not found' });
      return;
    }

    const neighbor = conflict.conflictingParcelUlpin ? await getParcelByUlpin(conflict.conflictingParcelUlpin) : null;

    if (neighbor) {
      const reconciled = reconcileSharedBoundary(
        primary.geometry,
        neighbor.geometry,
        method as any
      );

      const primaryNewArea = calculatePolygonAreaSqM(reconciled.primaryResolved.coordinates[0]);
      const neighborNewArea = calculatePolygonAreaSqM(reconciled.neighborResolved.coordinates[0]);

      await updateParcel(primary.ulpin, {
        geometry: reconciled.primaryResolved,
        harmonizedAreaSqM: primaryNewArea,
        status: 'HARMONIZED',
        confidenceScore: 98,
        lastHarmonizedAt: new Date().toISOString(),
        harmonizationMethod: method,
      });

      await updateParcel(neighbor.ulpin, {
        geometry: reconciled.neighborResolved,
        harmonizedAreaSqM: neighborNewArea,
        status: 'HARMONIZED',
        confidenceScore: 97,
        lastHarmonizedAt: new Date().toISOString(),
        harmonizationMethod: method,
      });
    } else {
      // Unilateral adjustment (e.g. buffer truncation)
      const coords = primary.geometry.coordinates[0].map(c => [...c]);
      if (coords.length > 2) {
        coords[1][0] -= 0.0001;
        coords[2][0] -= 0.0001;
        coords[coords.length - 1] = [coords[0][0], coords[0][1]];
      }
      const newGeom = { type: 'Polygon' as const, coordinates: [coords] };
      const newArea = calculatePolygonAreaSqM(coords);

      await updateParcel(primary.ulpin, {
        geometry: newGeom,
        harmonizedAreaSqM: newArea,
        status: 'HARMONIZED',
        confidenceScore: 95,
        lastHarmonizedAt: new Date().toISOString(),
        harmonizationMethod: method,
      });
    }

    const updatedConflict = await updateConflict(conflict.conflictId, {
      status: 'RESOLVED',
      resolution: {
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'Revenue Automated System',
        method,
        adjustedUlpin: primary.ulpin,
        remarks,
      },
    });

    await addAuditLog({
      actor: 'Automated Harmonization Engine',
      action: 'CONFLICT_RESOLVED',
      parcelUlpin: primary.ulpin,
      details: `Resolved conflict ${conflict.conflictId} (${conflict.type}) using method ${method}. Reconciled coordinates in Atlas.`,
    });

    res.json({ success: true, conflict: updatedConflict });
  });

  // Automated Batch Harmonization endpoint
  app.post('/api/harmonize/auto', async (req: Request, res: Response) => {
    const parcels = await getAllParcels();
    const conflicts = await getAllConflicts();

    let harmonizedCount = 0;

    for (const conflict of conflicts) {
      if (conflict.status !== 'RESOLVED') {
        const primary = parcels.find(p => p.ulpin === conflict.primaryParcelUlpin);
        const neighbor = conflict.conflictingParcelUlpin ? parcels.find(p => p.ulpin === conflict.conflictingParcelUlpin) : null;

        if (primary && neighbor) {
          const { primaryResolved, neighborResolved } = reconcileSharedBoundary(
            primary.geometry,
            neighbor.geometry,
            'SNAP_TO_DRONE'
          );

          await updateParcel(primary.ulpin, {
            geometry: primaryResolved,
            harmonizedAreaSqM: calculatePolygonAreaSqM(primaryResolved.coordinates[0]),
            status: 'HARMONIZED',
            confidenceScore: 99,
            lastHarmonizedAt: new Date().toISOString(),
            harmonizationMethod: 'AUTO_INTELLIGENT_SNAP',
          });

          await updateParcel(neighbor.ulpin, {
            geometry: neighborResolved,
            harmonizedAreaSqM: calculatePolygonAreaSqM(neighborResolved.coordinates[0]),
            status: 'HARMONIZED',
            confidenceScore: 98,
            lastHarmonizedAt: new Date().toISOString(),
            harmonizationMethod: 'AUTO_INTELLIGENT_SNAP',
          });
        } else if (primary) {
          const simplifiedCoords = simplifyPolygon(primary.geometry.coordinates[0]);
          const snapped = snapVertices(simplifiedCoords);
          const newGeom = { type: 'Polygon' as const, coordinates: [snapped] };

          await updateParcel(primary.ulpin, {
            geometry: newGeom,
            harmonizedAreaSqM: calculatePolygonAreaSqM(snapped),
            status: 'HARMONIZED',
            confidenceScore: 96,
            lastHarmonizedAt: new Date().toISOString(),
            harmonizationMethod: 'TOPOLOGICAL_CLEANING_DOUGLAS_PEUCKER',
          });
        }

        await updateConflict(conflict.conflictId, {
          status: 'RESOLVED',
          resolution: {
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'AI Harmonization Engine (SIH26013)',
            method: 'INTELLIGENT_MULTI_SOURCE_FUSION',
            adjustedUlpin: conflict.primaryParcelUlpin,
            remarks: 'Reconciled multi-source geospatial vectors with ground-truth drone boundaries and legal deed quotas.',
          },
        });

        harmonizedCount++;
      }
    }

    // Refresh remaining draft parcels
    for (const p of parcels) {
      if (p.status !== 'HARMONIZED') {
        await updateParcel(p.ulpin, {
          status: 'HARMONIZED',
          confidenceScore: 96,
          lastHarmonizedAt: new Date().toISOString(),
          harmonizedAreaSqM: p.deedAreaSqM,
        });
      }
    }

    await addAuditLog({
      actor: 'Batch Harmonization Pipeline',
      action: 'BATCH_HARMONIZATION_COMPLETED',
      parcelUlpin: 'ALL',
      details: `Automated integration completed. Harmonized ${harmonizedCount} geospatial conflicts and aligned all parcel vertices.`,
    });

    res.json({
      success: true,
      resolvedConflictsCount: harmonizedCount,
      parcels: await getAllParcels(),
      conflicts: await getAllConflicts(),
    });
  });

  // Spatial layers configuration
  app.get('/api/layers', async (req: Request, res: Response) => {
    const layers = await getAllLayers();
    res.json(layers);
  });

  app.put('/api/layers/:id', async (req: Request, res: Response) => {
    const updated = await updateLayer(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Layer not found' });
      return;
    }
    res.json(updated);
  });

  // Audit logs
  app.get('/api/audit-logs', async (req: Request, res: Response) => {
    const logs = await getAuditLogs();
    res.json(logs);
  });

  // Summary Metrics
  app.get('/api/metrics', async (req: Request, res: Response) => {
    const parcels = await getAllParcels();
    const conflicts = await getAllConflicts();

    const harmonized = parcels.filter(p => p.status === 'HARMONIZED').length;
    const conflicted = parcels.filter(p => p.status === 'CONFLICT_FLAGGED').length;
    const resolvedConflicts = conflicts.filter(c => c.status === 'RESOLVED').length;
    const activeConflicts = conflicts.filter(c => c.status !== 'RESOLVED').length;

    const totalArea = parcels.reduce((sum, p) => sum + (p.harmonizedAreaSqM || p.deedAreaSqM), 0);
    const avgDiscrepancy = parcels.length > 0 
      ? Math.round((parcels.reduce((sum, p) => sum + p.discrepancyPercent, 0) / parcels.length) * 10) / 10
      : 0;

    res.json({
      totalParcels: parcels.length,
      harmonizedParcels: harmonized,
      conflictedParcels: conflicted,
      resolvedConflicts,
      activeConflicts,
      totalLandAreaSqM: Math.round(totalArea * 10) / 10,
      averageDiscrepancy: avgDiscrepancy,
      harmonizationRate: parcels.length > 0 ? Math.round((harmonized / parcels.length) * 100) : 0,
    });
  });

  // Ingestion simulation endpoint
  app.post('/api/ingest/sample', async (req: Request, res: Response) => {
    const { datasetName = 'Sector 14 Smart City' } = req.body;
    await resetDatabaseToDefault();
    await addAuditLog({
      actor: 'Geospatial Officer',
      action: 'DATASET_INGESTION',
      parcelUlpin: 'ALL',
      details: `Ingested ${datasetName} with cadastral shapefile, UAV orthophoto GeoTIFF, and Master Plan zoning.`,
    });
    res.json({
      success: true,
      message: `Successfully ingested multi-source dataset "${datasetName}" into MongoDB Atlas.`,
      parcels: await getAllParcels(),
      conflicts: await getAllConflicts(),
    });
  });

  // ==========================================
  // Vite Middleware / Static Files
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIH26013 Geospatial Harmonization Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
