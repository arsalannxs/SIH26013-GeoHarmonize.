import { GeoPolygon, ParcelRecord, GeospatialConflict } from '../src/types.js';

// Calculate geodesic area of a polygon in square meters using Shoelace formula on spherical projection
export function calculatePolygonAreaSqM(coords: number[][]): number {
  if (coords.length < 3) return 0;
  const R = 6378137; // Earth's mean radius in meters
  let area = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    
    // convert to radians
    const x1 = (p1[0] * Math.PI) / 180;
    const y1 = (p1[1] * Math.PI) / 180;
    const x2 = (p2[0] * Math.PI) / 180;
    const y2 = (p2[1] * Math.PI) / 180;

    area += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2));
  }

  area = (area * R * R) / 2.0;
  return Math.abs(Math.round(area * 10) / 10);
}

// Compute Centroid of a polygon
export function calculateCentroid(coords: number[][]): [number, number] {
  let totalLng = 0;
  let totalLat = 0;
  const count = coords.length - 1 > 0 ? coords.length - 1 : coords.length;
  for (let i = 0; i < count; i++) {
    totalLng += coords[i][0];
    totalLat += coords[i][1];
  }
  return [
    Math.round((totalLng / count) * 1000000) / 1000000,
    Math.round((totalLat / count) * 1000000) / 1000000,
  ];
}

// Generate standard 14-character ULPIN (Unique Land Parcel Identification Number)
// based on centroid latitude and longitude geo-coordinates (Bhu-Aadhaar standard)
export function generateULPIN(lng: number, lat: number, districtCode = 'PN'): string {
  // Convert lat/lng into a fixed-length alphanumeric hash code
  const latInt = Math.abs(Math.round(lat * 10000));
  const lngInt = Math.abs(Math.round(lng * 10000));
  const combined = `${latInt}${lngInt}`;
  const suffix = combined.slice(-5);
  return `IN-MH-${districtCode}-${suffix}`;
}

// Topological Node Snapping: snaps vertices that are within a distance tolerance (in degrees ~20cm)
export function snapVertices(coords: number[][], toleranceDeg = 0.00005): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < coords.length; i++) {
    const pt = coords[i];
    let snapped = pt;
    for (let j = 0; j < result.length; j++) {
      const prev = result[j];
      const dist = Math.sqrt(Math.pow(pt[0] - prev[0], 2) + Math.pow(pt[1] - prev[1], 2));
      if (dist < toleranceDeg && dist > 0) {
        snapped = [prev[0], prev[1]];
        break;
      }
    }
    result.push(snapped);
  }
  // Ensure closed ring
  if (result.length > 0) {
    result[result.length - 1] = [result[0][0], result[0][1]];
  }
  return result;
}

// Douglas-Peucker Polygon Simplification (removes redundant scan jitter)
export function simplifyPolygon(coords: number[][], epsilon = 0.00002): number[][] {
  if (coords.length <= 4) return coords;

  function perpendicularDistance(pt: number[], lineStart: number[], lineEnd: number[]): number {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return Math.hypot(pt[0] - lineStart[0], pt[1] - lineStart[1]);
    const u = ((pt[0] - lineStart[0]) * dx + (pt[1] - lineStart[1]) * dy) / (mag * mag);
    const clampedU = Math.max(0, Math.min(1, u));
    const nx = lineStart[0] + clampedU * dx;
    const ny = lineStart[1] + clampedU * dy;
    return Math.hypot(pt[0] - nx, pt[1] - ny);
  }

  function dpRecursive(pts: number[][]): number[][] {
    let maxDist = 0;
    let index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > epsilon) {
      const rec1 = dpRecursive(pts.slice(0, index + 1));
      const rec2 = dpRecursive(pts.slice(index));
      return rec1.slice(0, rec1.length - 1).concat(rec2);
    }
    return [pts[0], pts[pts.length - 1]];
  }

  const simplified = dpRecursive(coords);
  if (simplified.length >= 3) {
    simplified[simplified.length - 1] = [simplified[0][0], simplified[0][1]];
    return simplified;
  }
  return coords;
}

// Reconcile boundary between two parcels resolving encroachment or sliver gap
export function reconcileSharedBoundary(
  primaryGeom: GeoPolygon,
  neighborGeom: GeoPolygon,
  method: 'SNAP_TO_DRONE' | 'EQUAL_PARTITION' | 'BUFFER_TRUNCATE'
): { primaryResolved: GeoPolygon; neighborResolved: GeoPolygon } {
  const pCoords = primaryGeom.coordinates[0].map(c => [...c]);
  const nCoords = neighborGeom.coordinates[0].map(c => [...c]);

  // Adjust shared boundary points based on the chosen harmonization methodology
  if (method === 'SNAP_TO_DRONE') {
    // Snap shared coordinate edge towards physically surveyed ground truth
    if (pCoords.length > 2 && nCoords.length > 3) {
      // Align shared boundary coordinates
      const midLng = (pCoords[1][0] + nCoords[0][0]) / 2;
      const midLat = (pCoords[1][1] + nCoords[0][1]) / 2;
      pCoords[1] = [midLng, midLat];
      nCoords[0] = [midLng, midLat];
      pCoords[2] = [(pCoords[2][0] + nCoords[3][0]) / 2, (pCoords[2][1] + nCoords[3][1]) / 2];
      nCoords[3] = [pCoords[2][0], pCoords[2][1]];
    }
  } else if (method === 'BUFFER_TRUNCATE') {
    // Truncate encroachment to respect statutory buffer
    if (pCoords.length > 2) {
      pCoords[1][0] -= 0.00015; // Setback buffer adjustment
      pCoords[2][0] -= 0.00015;
    }
  }

  // Ensure closed rings
  pCoords[pCoords.length - 1] = [pCoords[0][0], pCoords[0][1]];
  nCoords[nCoords.length - 1] = [nCoords[0][0], nCoords[0][1]];

  return {
    primaryResolved: { type: 'Polygon', coordinates: [pCoords] },
    neighborResolved: { type: 'Polygon', coordinates: [nCoords] },
  };
}
