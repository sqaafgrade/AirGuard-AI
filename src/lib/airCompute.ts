// ============================================================
// src/lib/airCompute.ts
// Pure Algorithmic Compute Engine for AirGuard AI
// Per CODE_QUALITY.md: Zero side-effects, zero DOM, 100% testable
// Implements: AQI equations, EPA breakpoints, Inhaled Dose,
//             CADR equations, and Dijkstra Lowest-Exposure Pathfinding
// ============================================================

import type {
  TransitMode,
  GraphEdge,
  CADRCalculationResult,
  SectorData,
} from '@/types';

import { AQICategory } from '@/types';

/**
 * Maps numerical AQI index to EPA/WHO health category.
 * Throws RangeError if aqi is negative or not finite.
 */
export function computeAQICategory(aqi: number): AQICategory {
  if (typeof aqi !== 'number' || !Number.isFinite(aqi) || aqi < 0) {
    throw new RangeError(`Invalid AQI value: ${aqi}. Must be a finite non-negative number.`);
  }

  if (aqi <= 50) return AQICategory.Good;
  if (aqi <= 100) return AQICategory.Moderate;
  if (aqi <= 200) return AQICategory.Poor;
  if (aqi <= 300) return AQICategory.VeryPoor;
  return AQICategory.Severe;
}

/**
 * Standard EPA Breakpoint Table for PM2.5 (µg/m³ 24-hr average).
 */
interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

/**
 * Calculates PM2.5 AQI Sub-index using piecewise linear interpolation.
 * Equation: I = [ (I_hi - I_lo) / (BP_hi - BP_lo) ] * (C - BP_lo) + I_lo
 * Throws RangeError if concentration is negative or invalid.
 */
export function computePM25SubIndex(pm25: number): number {
  if (typeof pm25 !== 'number' || !Number.isFinite(pm25) || pm25 < 0) {
    throw new RangeError(`Invalid PM2.5 concentration: ${pm25}. Must be non-negative.`);
  }

  // Cap at max standard scale (500)
  if (pm25 > 500.4) {
    return 500;
  }

  for (const bp of PM25_BREAKPOINTS) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const index = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return Math.round(index);
    }
  }

  // Boundary interpolation edge (e.g. between 12.0 and 12.1)
  const lastBp = PM25_BREAKPOINTS[PM25_BREAKPOINTS.length - 1];
  return Math.round(lastBp.iHigh);
}

/**
 * Ventilation rates (m³/minute) and in-cabin penetration factors by transit mode.
 */
export const TRANSIT_EXPOSURE_FACTORS: Record<
  TransitMode,
  { ventilationRateM3Min: number; cabinPenetrationFactor: number; averageSpeedKmh: number }
> = {
  walk: { ventilationRateM3Min: 0.022, cabinPenetrationFactor: 1.0, averageSpeedKmh: 4.8 },
  cycle: { ventilationRateM3Min: 0.035, cabinPenetrationFactor: 1.0, averageSpeedKmh: 16.0 },
  bus: { ventilationRateM3Min: 0.012, cabinPenetrationFactor: 0.65, averageSpeedKmh: 20.0 },
  metro: { ventilationRateM3Min: 0.010, cabinPenetrationFactor: 0.28, averageSpeedKmh: 38.0 },
  ev: { ventilationRateM3Min: 0.009, cabinPenetrationFactor: 0.20, averageSpeedKmh: 28.0 },
};

/**
 * Computes estimated cumulative inhaled PM2.5 dose (µg).
 * Equation: Dose = Concentration (µg/m³) * Ventilation Rate (m³/min) * Time (min) * PenetrationFactor
 */
export function calculateInhaledDose(pm25Conc: number, minutes: number, mode: TransitMode): number {
  if (pm25Conc < 0 || minutes < 0) {
    throw new RangeError('Concentration and minutes must be non-negative numbers.');
  }
  const factor = TRANSIT_EXPOSURE_FACTORS[mode] ?? TRANSIT_EXPOSURE_FACTORS.walk;
  const dose = pm25Conc * factor.ventilationRateM3Min * minutes * factor.cabinPenetrationFactor;
  return Number(dose.toFixed(2));
}

/**
 * Computes Clean Air Delivery Rate (CADR) requirements and room air turnaround time.
 * Volume V = L * W * H (cubic feet)
 * Target CADR (CFM) = (V * desiredACH) / 60
 * Filter efficiency:
 *   MERV 8  = 0.35
 *   MERV 11 = 0.65
 *   MERV 13 = 0.85
 *   HEPA    = 0.9997
 */
export function calculateCADR(
  lengthFt: number,
  widthFt: number,
  heightFt: number,
  desiredACH: number,
  fanCFM: number,
  filterMERV: number
): CADRCalculationResult {
  if (lengthFt <= 0 || widthFt <= 0 || heightFt <= 0) {
    throw new RangeError('Room dimensions must be strictly positive numbers.');
  }
  if (desiredACH <= 0 || fanCFM <= 0) {
    throw new RangeError('Desired ACH and Fan CFM must be strictly positive.');
  }

  const roomVolumeCuFt = lengthFt * widthFt * heightFt;
  const targetCADR = Math.round((roomVolumeCuFt * desiredACH) / 60);

  // Efficiency estimate based on filter MERV rating
  let efficiency = 0.5;
  if (filterMERV >= 17) efficiency = 0.9997; // HEPA
  else if (filterMERV >= 13) efficiency = 0.85; // MERV-13 box fan standard
  else if (filterMERV >= 11) efficiency = 0.65;
  else if (filterMERV >= 8) efficiency = 0.35;

  // Box fans experience slight static backpressure (~10% airflow reduction)
  const actualCADR = Math.round(fanCFM * efficiency * 0.9);
  const achDelivered = Number(((actualCADR * 60) / roomVolumeCuFt).toFixed(1));

  let status: CADRCalculationResult['status'] = 'Under-ventilated';
  if (achDelivered >= 6.0) {
    status = 'Hospital-Grade Defense';
  } else if (achDelivered >= desiredACH) {
    status = 'Adequate';
  }

  // Turnaround time for 90% particle removal: t90 = (ln(10) / ach) * 60 minutes
  const cleanAirTurnaroundMinutes = Number(((Math.LN10 / Math.max(achDelivered, 0.1)) * 60).toFixed(1));

  let diyBoxFanRecommendation = '1x 20-inch Box Fan + 1x MERV-13 (20x20x1) filter will adequately scrub this space.';
  if (targetCADR > 350) {
    diyBoxFanRecommendation = 'Corsi-Rosenthal Cube (4x MERV-13 filters + 1x box fan) recommended for heavy room volume.';
  } else if (targetCADR > 200) {
    diyBoxFanRecommendation = 'Single 20-inch box fan with high-airflow 2-inch MERV-13 filter recommended.';
  }

  return {
    roomVolumeCuFt,
    targetCADR,
    actualCADR,
    achDelivered,
    status,
    cleanAirTurnaroundMinutes,
    diyBoxFanRecommendation,
  };
}

/**
 * Dijkstra Lowest-Exposure Pathfinding
 * Computes the optimal route minimizing cumulative particulate exposure.
 * Edge weight = distanceKm * (typicalAQI * exposureFactor)
 */
export interface DijkstraExposureResult {
  path: string[];
  totalDistanceKm: number;
  averageAQI: number;
  totalExposureScore: number;
}

export function dijkstraLowestExposure(
  graph: Record<string, GraphEdge[]>,
  startNode: string,
  targetNode: string,
  mode: TransitMode = 'walk'
): DijkstraExposureResult | null {
  if (!graph[startNode] || !graph[targetNode]) {
    return null;
  }
  if (startNode === targetNode) {
    return { path: [startNode], totalDistanceKm: 0, averageAQI: 0, totalExposureScore: 0 };
  }

  const factor = TRANSIT_EXPOSURE_FACTORS[mode] ?? TRANSIT_EXPOSURE_FACTORS.walk;
  const penetration = factor.cabinPenetrationFactor;

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const distanceKmMap: Record<string, number> = {};
  const unvisited = new Set<string>();

  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
    distanceKmMap[node] = 0;
    unvisited.add(node);
  }
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (!current || minDistance === Infinity) {
      break;
    }

    if (current === targetNode) {
      break;
    }

    unvisited.delete(current);

    const edges = graph[current] ?? [];
    for (const edge of edges) {
      if (!unvisited.has(edge.to)) continue;

      // Filtered transit edges (e.g., underground metro) receive further exposure discounts
      const edgePenetration = edge.hasAirFiltration ? penetration * 0.7 : penetration;
      const weight = edge.distanceKm * (edge.typicalAQI * edgePenetration);
      const candidateDist = distances[current] + weight;

      if (candidateDist < distances[edge.to]) {
        distances[edge.to] = candidateDist;
        previous[edge.to] = current;
        distanceKmMap[edge.to] = distanceKmMap[current] + edge.distanceKm;
      }
    }
  }

  if (distances[targetNode] === Infinity) {
    return null; // No path
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = targetNode;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const totalDistanceKm = Number(distanceKmMap[targetNode].toFixed(2));
  const totalExposureScore = Number(distances[targetNode].toFixed(1));
  const averageAQI = totalDistanceKm > 0 ? Math.round(totalExposureScore / (totalDistanceKm * penetration)) : 0;

  return {
    path,
    totalDistanceKm,
    averageAQI,
    totalExposureScore,
  };
}

/**
 * Computes particulate emission savings for community pledges.
 */
export function calculatePledgeEmissionSavings(
  category: 'carpool' | 'burn-ban' | 'boiler-check' | 'green-buffer' | 'elderly-check',
  participants: number
): number {
  if (participants < 0) throw new RangeError('Participants count must be non-negative.');
  const RATES: Record<string, number> = {
    carpool: 0.42,      // kg PM2.5 saved per commuter/month
    'burn-ban': 2.80,    // kg PM2.5 prevented per active neighborhood block
    'boiler-check': 1.15, // kg PM2.5 avoided per tuned boiler
    'green-buffer': 0.75, // kg PM2.5 filtered per hectare/plot
    'elderly-check': 0.20 // indirect health safeguard unit
  };
  const rate = RATES[category] ?? 0.3;
  return Number((participants * rate).toFixed(2));
}

/**
 * Default Urban Sectors Telemetry Dataset
 */
export const DEFAULT_SECTORS: SectorData[] = [
  {
    sectorId: 'SEC-01',
    sectorName: 'Central Business District',
    zoneType: 'commercial',
    aqi: 242,
    category: AQICategory.VeryPoor,
    pm25: 185,
    pm10: 290,
    no2: 88,
    co: 2.8,
    o3: 42,
    temperature: 14,
    humidity: 78,
    windSpeed: 4.2,
    inversionRisk: 'High',
    safeOutdoorWindow: '12:30 PM - 03:00 PM',
    lastUpdated: Date.now(),
  },
  {
    sectorId: 'SEC-02',
    sectorName: 'Green Belt Residential Park',
    zoneType: 'residential',
    aqi: 78,
    category: AQICategory.Moderate,
    pm25: 25,
    pm10: 52,
    no2: 24,
    co: 0.8,
    o3: 31,
    temperature: 15,
    humidity: 65,
    windSpeed: 7.5,
    inversionRisk: 'Low',
    safeOutdoorWindow: '10:00 AM - 04:30 PM',
    lastUpdated: Date.now(),
  },
  {
    sectorId: 'SEC-03',
    sectorName: 'Industrial Corridor North',
    zoneType: 'industrial',
    aqi: 385,
    category: AQICategory.Severe,
    pm25: 320,
    pm10: 440,
    no2: 125,
    co: 4.5,
    o3: 18,
    temperature: 13,
    humidity: 82,
    windSpeed: 2.1,
    inversionRisk: 'Critical',
    safeOutdoorWindow: 'Stay Indoors — Thermal Inversion Active',
    lastUpdated: Date.now(),
  },
  {
    sectorId: 'SEC-04',
    sectorName: 'University & Knowledge Hub',
    zoneType: 'green-buffer',
    aqi: 112,
    category: AQICategory.Poor,
    pm25: 41,
    pm10: 89,
    no2: 36,
    co: 1.1,
    o3: 50,
    temperature: 16,
    humidity: 62,
    windSpeed: 8.0,
    inversionRisk: 'Moderate',
    safeOutdoorWindow: '11:00 AM - 03:30 PM',
    lastUpdated: Date.now(),
  },
  {
    sectorId: 'SEC-05',
    sectorName: 'Riverfront Boulevard & Transit',
    zoneType: 'transit-corridor',
    aqi: 168,
    category: AQICategory.Poor,
    pm25: 86,
    pm10: 172,
    no2: 64,
    co: 2.1,
    o3: 45,
    temperature: 15,
    humidity: 74,
    windSpeed: 6.0,
    inversionRisk: 'Moderate',
    safeOutdoorWindow: '01:00 PM - 04:00 PM',
    lastUpdated: Date.now(),
  },
];

/**
 * City Navigational Graph Representation with Corridor AQI and Filtration Attributes
 */
export const CITY_TRANSIT_GRAPH: Record<string, GraphEdge[]> = {
  'North Gate': [
    { from: 'North Gate', to: 'Industrial Bypass', distanceKm: 4.2, typicalAQI: 360, hasAirFiltration: false },
    { from: 'North Gate', to: 'Metro Station N1', distanceKm: 1.1, typicalAQI: 120, hasAirFiltration: true },
    { from: 'North Gate', to: 'Parkside Avenue', distanceKm: 2.5, typicalAQI: 85, hasAirFiltration: false },
  ],
  'Industrial Bypass': [
    { from: 'Industrial Bypass', to: 'North Gate', distanceKm: 4.2, typicalAQI: 360, hasAirFiltration: false },
    { from: 'Industrial Bypass', to: 'Central Arterial Highway', distanceKm: 5.0, typicalAQI: 280, hasAirFiltration: false },
  ],
  'Metro Station N1': [
    { from: 'Metro Station N1', to: 'North Gate', distanceKm: 1.1, typicalAQI: 120, hasAirFiltration: true },
    { from: 'Metro Station N1', to: 'City Center Hub', distanceKm: 4.8, typicalAQI: 45, hasAirFiltration: true },
  ],
  'Parkside Avenue': [
    { from: 'Parkside Avenue', to: 'North Gate', distanceKm: 2.5, typicalAQI: 85, hasAirFiltration: false },
    { from: 'Parkside Avenue', to: 'University Gate', distanceKm: 2.1, typicalAQI: 75, hasAirFiltration: false },
    { from: 'Parkside Avenue', to: 'City Center Hub', distanceKm: 3.8, typicalAQI: 110, hasAirFiltration: false },
  ],
  'University Gate': [
    { from: 'University Gate', to: 'Parkside Avenue', distanceKm: 2.1, typicalAQI: 75, hasAirFiltration: false },
    { from: 'University Gate', to: 'City Center Hub', distanceKm: 2.6, typicalAQI: 105, hasAirFiltration: false },
    { from: 'University Gate', to: 'South Medical Zone', distanceKm: 4.0, typicalAQI: 95, hasAirFiltration: false },
  ],
  'Central Arterial Highway': [
    { from: 'Central Arterial Highway', to: 'Industrial Bypass', distanceKm: 5.0, typicalAQI: 280, hasAirFiltration: false },
    { from: 'Central Arterial Highway', to: 'City Center Hub', distanceKm: 3.2, typicalAQI: 260, hasAirFiltration: false },
    { from: 'Central Arterial Highway', to: 'South Medical Zone', distanceKm: 6.5, typicalAQI: 230, hasAirFiltration: false },
  ],
  'City Center Hub': [
    { from: 'City Center Hub', to: 'Metro Station N1', distanceKm: 4.8, typicalAQI: 45, hasAirFiltration: true },
    { from: 'City Center Hub', to: 'Parkside Avenue', distanceKm: 3.8, typicalAQI: 110, hasAirFiltration: false },
    { from: 'City Center Hub', to: 'University Gate', distanceKm: 2.6, typicalAQI: 105, hasAirFiltration: false },
    { from: 'City Center Hub', to: 'Central Arterial Highway', distanceKm: 3.2, typicalAQI: 260, hasAirFiltration: false },
    { from: 'City Center Hub', to: 'South Medical Zone', distanceKm: 3.5, typicalAQI: 115, hasAirFiltration: true },
  ],
  'South Medical Zone': [
    { from: 'South Medical Zone', to: 'City Center Hub', distanceKm: 3.5, typicalAQI: 115, hasAirFiltration: true },
    { from: 'South Medical Zone', to: 'University Gate', distanceKm: 4.0, typicalAQI: 95, hasAirFiltration: false },
    { from: 'South Medical Zone', to: 'Central Arterial Highway', distanceKm: 6.5, typicalAQI: 230, hasAirFiltration: false },
  ],
};
