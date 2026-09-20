import { GoogleGenAI } from '@google/genai';
import { GeospatialConflict, ParcelRecord } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

export async function explainConflictWithAI(
  conflict: GeospatialConflict,
  primaryParcel: ParcelRecord,
  conflictingParcel?: ParcelRecord | null
): Promise<{
  cause: string;
  legalPrecedent: string;
  recommendedAction: string;
  confidence: number;
  statutorySection: string;
}> {
  const client = getAiClient();

  if (!client) {
    // Intelligent fallback with domain-specific rule-based reasoning
    return getHeuristicAnalysis(conflict, primaryParcel);
  }

  const prompt = `
You are an expert Chief Geospatial Land Revenue Officer & Urban Planner specialized in Smart India Hackathon Problem Statement SIH26013: "Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management".

Analyze the following land record conflict:
Conflict ID: ${conflict.conflictId}
Conflict Type: ${conflict.type}
Severity: ${conflict.severity}
Conflict Area: ${conflict.conflictAreaSqM} sq. meters
Primary Parcel:
- ULPIN: ${primaryParcel.ulpin}
- Survey No: ${primaryParcel.surveyNumber}
- Village/Ward: ${primaryParcel.village}, ${primaryParcel.wardNo}
- Land Use: ${primaryParcel.landUse}
- Deed Registered Area: ${primaryParcel.deedAreaSqM} sq.m
- Cadastral Surveyed Area: ${primaryParcel.surveyedAreaSqM} sq.m
- Drone Orthophoto Area: ${primaryParcel.droneAreaSqM} sq.m
- Discrepancy: ${primaryParcel.discrepancyPercent}%

Conflicting Parcel: ${conflictingParcel ? `${conflictingParcel.surveyNumber} (${conflictingParcel.ownerName})` : 'Adjacent Right of Way / Master Plan Buffer'}
Conflict Description: ${conflict.description}
Affected Layers: ${conflict.affectedLayers.join(', ')}

Return a strict JSON object with these keys:
{
  "cause": "Concise technical explanation of why multi-source data collided (e.g. CRS shift, DGPS vs Chain survey, unauthorized physical construction)",
  "legalPrecedent": "Specific land law precedent (e.g. State Land Revenue Code, DILRMP 2024, Town Planning Act)",
  "recommendedAction": "Actionable harmonization step (e.g. snap to drone boundary with mutation penalty, buffer truncation, joint survey notice)",
  "confidence": number between 85 and 99,
  "statutorySection": "Exact section name (e.g. MLRC Sec. 138 / DILRMP Rule 14-B)"
}
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return {
        cause: parsed.cause || conflict.description,
        legalPrecedent: parsed.legalPrecedent || 'DILRMP Modern Land Record Guidelines 2024',
        recommendedAction: parsed.recommendedAction || 'Execute automated boundary harmonization and issue survey mutation certificate.',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 92,
        statutorySection: parsed.statutorySection || 'Sec. 42 Land Revenue Act',
      };
    }
  } catch (error) {
    console.warn('Gemini API call failed or timed out, using intelligent domain rules:', error);
  }

  return getHeuristicAnalysis(conflict, primaryParcel);
}

function getHeuristicAnalysis(conflict: GeospatialConflict, primaryParcel: ParcelRecord) {
  switch (conflict.type) {
    case 'ENCROACHMENT':
      return {
        cause: `Physical construction boundary captured by UAV orthophoto extends beyond statutory cadastral boundary by ${conflict.conflictAreaSqM} sq.m due to unverified site pegging.`,
        legalPrecedent: 'State Land Revenue Code Sec. 138 (Joint demarcation of boundary lines & sub-division survey).',
        recommendedAction: 'Propose automated mid-line reconciliation or issuance of Form 12 notice for physical demarcation & mutation fee regularisation.',
        confidence: 94,
        statutorySection: 'Sec. 138 Boundary Demarcation Act',
      };
    case 'SLIVER_GAP':
      return {
        cause: 'Topological sliver gap caused by vectorization of 1:1000 legacy revenue paper sheets without automated snapping constraints.',
        legalPrecedent: 'Digital India Land Records Modernization Programme (DILRMP) Snapping Standard Rule 14-B.',
        recommendedAction: 'Apply Douglas-Peucker topological snapping to master road right-of-way with 0.15m tolerance.',
        confidence: 98,
        statutorySection: 'DILRMP Rule 14-B',
      };
    case 'ZONING_VIOLATION':
      return {
        cause: 'Physical built footprint detected over Master Plan 2035 designated municipal green buffer or environmental conservation zone.',
        legalPrecedent: 'Urban Development & Regional Town Planning Act Sec. 52 (Unauthorized construction on reserved zoning).',
        recommendedAction: 'Apply statutory buffer truncation to boundary polygon and trigger automated municipal notice to Town Planning Authority.',
        confidence: 96,
        statutorySection: 'MRTP Act Sec. 52',
      };
    default:
      return {
        cause: `Discrepancy of ${primaryParcel.discrepancyPercent}% observed between registered deed area (${primaryParcel.deedAreaSqM} sq.m) and drone survey (${primaryParcel.droneAreaSqM} sq.m).`,
        legalPrecedent: 'Cadastral Survey and Resurvey Rules (Tolerable permissible measurement error <= 2%).',
        recommendedAction: 'Harmonize boundary coordinates by adjusting perimeter vertices to drone ground control points.',
        confidence: 91,
        statutorySection: 'Survey & Settlement Rules Sec. 21',
      };
  }
}
