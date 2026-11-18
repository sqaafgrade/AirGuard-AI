// ============================================================
// src/types/index.ts
// Exhaustive TypeScript types & enums for AirGuard AI
// Per CODE_QUALITY.md: strict zero-any policy & discriminated unions
// ============================================================

export enum AQICategory {
  Good = 'Good',                   // 0 - 50 (Emerald Green)
  Moderate = 'Moderate',           // 51 - 100 (Amber / Gold)
  Poor = 'Poor',                   // 101 - 200 (Orange)
  VeryPoor = 'Very Poor',          // 201 - 300 (Red)
  Severe = 'Severe / Hazardous'    // 301+ (Crimson / Purple)
}

export enum PollutantType {
  PM25 = 'PM2.5',
  PM10 = 'PM10',
  NO2 = 'NO2',
  CO = 'CO',
  O3 = 'O3',
  SO2 = 'SO2'
}

export interface PollutantMeasurement {
  type: PollutantType;
  value: number; // in µg/m³ or ppm (CO in mg/m³)
  unit: string;
  subIndex: number;
  threshold: number; // WHO safe 24-hr guideline
  status: AQICategory;
  sparkline: number[]; // 24-hour historical trend points
}

export interface SectorData {
  sectorId: string;
  sectorName: string;
  zoneType: 'residential' | 'commercial' | 'industrial' | 'green-buffer' | 'transit-corridor';
  aqi: number;
  category: AQICategory;
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2: number;  // µg/m³
  co: number;   // mg/m³
  o3: number;   // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  inversionRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  safeOutdoorWindow: string; // e.g., "11:00 AM - 02:00 PM"
  lastUpdated: number;
}

export type PersonaType = 'vulnerable-family' | 'commuter' | 'community-coordinator';

export interface UserProfile {
  id: string;
  name: string;
  persona: PersonaType;
  locationSector: string;
  householdMembers: {
    toddlers: number;
    asthmatics: number;
    elderly: number;
    healthyAdults: number;
  };
  sensitivityScore: number; // 1 to 5 scale
  preferredTransit: 'metro' | 'bus' | 'cycle' | 'walk' | 'ev';
}

export interface HourlyRoutineSlot {
  hour: string; // "07:00", "08:00", etc.
  activity: string;
  suitability: 'Safe' | 'Caution' | 'Unsafe' | 'Stay Indoors';
  outdoorAQIPrediction: number;
  pm25Expected: number;
  recommendation: string;
  physiologicalImpact: string;
}

export interface RoutineInsightReport {
  timestamp: number;
  persona: PersonaType;
  targetSector: string;
  summary: string;
  thermalInversionWarning: string | null;
  bestOutdoorWindow: string;
  hourlySchedule: HourlyRoutineSlot[];
  overallDoseReductionPercent: number;
  keyActionableAdvice: string[];
}

export type TransitMode = 'metro' | 'bus' | 'cycle' | 'walk' | 'ev';

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
  typicalAQI: number;
  hasAirFiltration: boolean; // true for underground metro, modern EV buses
}

export interface TurnByTurnStep {
  instruction: string;
  distanceKm: number;
  corridorAQI: number;
  segmentDurationMinutes: number;
  segmentDoseMicrograms: number;
}

export interface RouteOption {
  routeId: string;
  title: string;
  mode: TransitMode;
  path: string[];
  totalDistanceKm: number;
  estimatedMinutes: number;
  averageAQI: number;
  inhaledPM25Micrograms: number;
  riskReductionVsWalking: number; // % reduction
  isRecommended: boolean;
  steps: TurnByTurnStep[];
}

export interface RoomCADRConfig {
  roomName: string;
  lengthFeet: number;
  widthFeet: number;
  heightFeet: number;
  desiredACH: number; // Air changes per hour (typically 4-6 for smog defense)
  fanCFM: number;     // Fan rating in CFM
  filterMERV: number; // e.g. MERV-13 (0.85 efficiency) or HEPA (0.9997)
}

export interface CADRCalculationResult {
  roomVolumeCuFt: number;
  targetCADR: number; // required CFM
  actualCADR: number; // delivered CFM
  achDelivered: number;
  status: 'Under-ventilated' | 'Adequate' | 'Hospital-Grade Defense';
  cleanAirTurnaroundMinutes: number;
  diyBoxFanRecommendation: string;
}

export interface DIYHack {
  id: string;
  title: string;
  category: 'purifier' | 'ventilation' | 'humidity' | 'plants' | 'sealing';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  estimatedCostUSD: number;
  commercialAlternativeCostUSD: number;
  pm25ReductionPercent: number;
  materialsNeeded: string[];
  steps: string[];
  scientificMechanism: string;
}

export interface CommunityPledge {
  id: string;
  title: string;
  category: 'carpool' | 'burn-ban' | 'boiler-check' | 'green-buffer' | 'elderly-check';
  pledgerName: string;
  sectorId: string;
  emissionSavedKgPM25: number;
  participantsCount: number;
  timestamp: number;
  verified: boolean;
}

export interface SmogIncidentReport {
  id: string;
  sectorId: string;
  type: 'open-burning' | 'industrial-flaring' | 'heavy-diesel-idling' | 'dust-construction';
  description: string;
  severity: 'Moderate' | 'High' | 'Critical';
  reportedAt: number;
  status: 'Reported' | 'Dispatched' | 'Resolved';
}

export type TabId = 'telemetry' | 'routine' | 'commute' | 'iaq' | 'community' | 'multilingual';

export type LanguageCode = 'en' | 'hi' | 'ar' | 'es' | 'fr' | 'ur';

export interface TranslationAdvisory {
  language: LanguageCode;
  headline: string;
  summary: string;
  emergencyDos: string[];
  emergencyDonts: string[];
  vulnerableCareNotice: string;
}
