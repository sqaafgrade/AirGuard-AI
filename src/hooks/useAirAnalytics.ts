// ============================================================
// src/hooks/useAirAnalytics.ts
// Custom hook for AQI telemetry, pollutant trends, and sector stats
// Per EFFICIENCY.md: Memoized calculations, zero setState inside useMemo
// ============================================================

import { useMemo } from 'react';

import type { PollutantMeasurement, SectorData } from '@/types';

import { PollutantType } from '@/types';
import { useApp } from '@/context/AppContext';
import { computeAQICategory, computePM25SubIndex } from '@/lib/airCompute';

export interface AirAnalyticsSummary {
  selectedSector: SectorData;
  cityAverageAQI: number;
  highestExposureSector: SectorData;
  cleanestSector: SectorData;
  isCityInversionCritical: boolean;
  pollutants: PollutantMeasurement[];
}

export function useAirAnalytics(): AirAnalyticsSummary {
  const { sectors, selectedSector } = useApp();

  const cityAverageAQI = useMemo(() => {
    if (!sectors.length) return 0;
    const sum = sectors.reduce((acc, s) => acc + s.aqi, 0);
    return Math.round(sum / sectors.length);
  }, [sectors]);

  const highestExposureSector = useMemo(() => {
    return sectors.reduce((max, s) => (s.aqi > max.aqi ? s : max), sectors[0]);
  }, [sectors]);

  const cleanestSector = useMemo(() => {
    return sectors.reduce((min, s) => (s.aqi < min.aqi ? s : min), sectors[0]);
  }, [sectors]);

  const isCityInversionCritical = useMemo(() => {
    return sectors.some(s => s.inversionRisk === 'Critical' || s.aqi > 300);
  }, [sectors]);

  const pollutants = useMemo<PollutantMeasurement[]>(() => {
    const s = selectedSector;
    const pm25Sub = computePM25SubIndex(s.pm25);

    // Deterministic 8-point 24h sparklines derived from current readings
    const generateSparkline = (current: number) => {
      const multipliers = [1.35, 1.45, 1.25, 0.9, 0.7, 0.75, 0.95, 1.0];
      return multipliers.map(m => Math.max(Math.round(current * m), 1));
    };

    return [
      {
        type: PollutantType.PM25,
        value: s.pm25,
        unit: 'µg/m³',
        subIndex: pm25Sub,
        threshold: 15, // WHO 24h Guideline
        status: computeAQICategory(pm25Sub),
        sparkline: generateSparkline(s.pm25),
      },
      {
        type: PollutantType.PM10,
        value: s.pm10,
        unit: 'µg/m³',
        subIndex: Math.round(s.pm10 * 0.7),
        threshold: 45, // WHO 24h Guideline
        status: computeAQICategory(Math.min(Math.round(s.pm10 * 0.7), 400)),
        sparkline: generateSparkline(s.pm10),
      },
      {
        type: PollutantType.NO2,
        value: s.no2,
        unit: 'µg/m³',
        subIndex: Math.round(s.no2 * 1.1),
        threshold: 25, // WHO 24h Guideline
        status: computeAQICategory(Math.min(Math.round(s.no2 * 1.1), 300)),
        sparkline: generateSparkline(s.no2),
      },
      {
        type: PollutantType.CO,
        value: s.co,
        unit: 'mg/m³',
        subIndex: Math.round(s.co * 35),
        threshold: 4.0, // WHO 24h Guideline
        status: computeAQICategory(Math.min(Math.round(s.co * 35), 300)),
        sparkline: generateSparkline(s.co),
      },
      {
        type: PollutantType.O3,
        value: s.o3,
        unit: 'µg/m³',
        subIndex: Math.round(s.o3 * 0.8),
        threshold: 100, // WHO 8h Guideline
        status: computeAQICategory(Math.min(Math.round(s.o3 * 0.8), 250)),
        sparkline: generateSparkline(s.o3),
      },
    ];
  }, [selectedSector]);

  return {
    selectedSector,
    cityAverageAQI,
    highestExposureSector,
    cleanestSector,
    isCityInversionCritical,
    pollutants,
  };
}
