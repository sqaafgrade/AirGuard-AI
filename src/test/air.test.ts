// ============================================================
// src/test/air.test.ts
// Tier 1: Pure Mathematical & Algorithmic Unit Tests
// Tests: AQI equations, EPA breakpoints, CADR formulas, Inhaled Dose
// Target: 100% statement and branch coverage on pure compute functions
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  computeAQICategory,
  computePM25SubIndex,
  calculateInhaledDose,
  calculateCADR,
  calculatePledgeEmissionSavings,
} from '@/lib/airCompute';
import { AQICategory } from '@/types';

describe('computeAQICategory', () => {
  it('returns Good for AQI 0 to 50', () => {
    expect(computeAQICategory(0)).toBe(AQICategory.Good);
    expect(computeAQICategory(25)).toBe(AQICategory.Good);
    expect(computeAQICategory(50)).toBe(AQICategory.Good);
  });

  it('returns Moderate for AQI 51 to 100', () => {
    expect(computeAQICategory(51)).toBe(AQICategory.Moderate);
    expect(computeAQICategory(100)).toBe(AQICategory.Moderate);
  });

  it('returns Poor for AQI 101 to 200', () => {
    expect(computeAQICategory(101)).toBe(AQICategory.Poor);
    expect(computeAQICategory(200)).toBe(AQICategory.Poor);
  });

  it('returns Very Poor for AQI 201 to 300', () => {
    expect(computeAQICategory(201)).toBe(AQICategory.VeryPoor);
    expect(computeAQICategory(300)).toBe(AQICategory.VeryPoor);
  });

  it('returns Severe for AQI above 300', () => {
    expect(computeAQICategory(301)).toBe(AQICategory.Severe);
    expect(computeAQICategory(499)).toBe(AQICategory.Severe);
  });

  it('throws RangeError for negative values', () => {
    expect(() => computeAQICategory(-1)).toThrow(RangeError);
    expect(() => computeAQICategory(-100)).toThrow(RangeError);
  });

  it('throws RangeError for NaN or non-finite inputs', () => {
    expect(() => computeAQICategory(NaN)).toThrow(RangeError);
    expect(() => computeAQICategory(Infinity)).toThrow(RangeError);
  });
});

describe('computePM25SubIndex', () => {
  it('computes exact EPA breakpoint boundary points', () => {
    expect(computePM25SubIndex(0.0)).toBe(0);
    expect(computePM25SubIndex(12.0)).toBe(50);
    expect(computePM25SubIndex(35.4)).toBe(100);
    expect(computePM25SubIndex(55.4)).toBe(150);
    expect(computePM25SubIndex(150.4)).toBe(200);
    expect(computePM25SubIndex(250.4)).toBe(300);
    expect(computePM25SubIndex(350.4)).toBe(400);
    expect(computePM25SubIndex(500.4)).toBe(500);
  });

  it('interpolates intermediate PM2.5 values accurately', () => {
    const mid1 = computePM25SubIndex(6.0);
    expect(mid1).toBeGreaterThan(20);
    expect(mid1).toBeLessThan(30);

    const mid2 = computePM25SubIndex(100.0);
    expect(mid2).toBeGreaterThan(150);
    expect(mid2).toBeLessThan(200);
  });

  it('caps at maximum index 500 when concentration exceeds 500.4 µg/m³', () => {
    expect(computePM25SubIndex(600)).toBe(500);
    expect(computePM25SubIndex(999)).toBe(500);
  });

  it('throws RangeError for negative concentrations', () => {
    expect(() => computePM25SubIndex(-0.1)).toThrow(RangeError);
    expect(() => computePM25SubIndex(-50)).toThrow(RangeError);
  });

  it('throws RangeError for non-finite concentrations', () => {
    expect(() => computePM25SubIndex(NaN)).toThrow(RangeError);
    expect(() => computePM25SubIndex(Infinity)).toThrow(RangeError);
  });
});

describe('calculateInhaledDose', () => {
  it('calculates dose for walking correctly', () => {
    // 100 µg/m³ for 30 mins walking (ventilation 0.022 m³/min, penetration 1.0)
    // 100 * 0.022 * 30 * 1.0 = 66 µg
    const dose = calculateInhaledDose(100, 30, 'walk');
    expect(dose).toBe(66);
  });

  it('calculates shielded dose for metro transit with penetration reduction', () => {
    // 100 µg/m³ for 30 mins metro (ventilation 0.010 m³/min, penetration 0.28)
    // 100 * 0.010 * 30 * 0.28 = 8.4 µg
    const dose = calculateInhaledDose(100, 30, 'metro');
    expect(dose).toBe(8.4);
  });

  it('calculates closed-cabin EV dose', () => {
    // 100 µg/m³ for 30 mins EV (ventilation 0.009 m³/min, penetration 0.20)
    // 100 * 0.009 * 30 * 0.20 = 5.4 µg
    const dose = calculateInhaledDose(100, 30, 'ev');
    expect(dose).toBe(5.4);
  });

  it('confirms cycling dose is highest due to high ventilation rate', () => {
    const cycleDose = calculateInhaledDose(100, 30, 'cycle');
    const walkDose = calculateInhaledDose(100, 30, 'walk');
    expect(cycleDose).toBeGreaterThan(walkDose);
  });

  it('returns 0 dose when time or concentration is zero', () => {
    expect(calculateInhaledDose(0, 30, 'walk')).toBe(0);
    expect(calculateInhaledDose(100, 0, 'walk')).toBe(0);
  });

  it('throws RangeError on negative inputs', () => {
    expect(() => calculateInhaledDose(-10, 30, 'walk')).toThrow(RangeError);
    expect(() => calculateInhaledDose(100, -5, 'walk')).toThrow(RangeError);
  });
});

describe('calculateCADR', () => {
  it('computes volume, required CADR and delivered ACH for standard bedroom', () => {
    // Room: 16x14x9 = 2016 cu ft. Desired ACH: 5. Fan: 1200 CFM. Filter: MERV-13 (0.85 eff)
    // Target CADR = round(2016 * 5 / 60) = 168 CFM
    // Actual CADR = round(1200 * 0.85 * 0.9) = 918 CFM
    // achDelivered = (918 * 60 / 2016) = 27.3 ACH
    const result = calculateCADR(16, 14, 9, 5, 1200, 13);
    expect(result.roomVolumeCuFt).toBe(2016);
    expect(result.targetCADR).toBe(168);
    expect(result.actualCADR).toBe(918);
    expect(result.achDelivered).toBeGreaterThan(6.0);
    expect(result.status).toBe('Hospital-Grade Defense');
    expect(result.cleanAirTurnaroundMinutes).toBeLessThan(15);
  });

  it('handles HEPA filter ratings (MERV >= 17)', () => {
    const result = calculateCADR(20, 20, 10, 4, 1000, 17);
    expect(result.actualCADR).toBeGreaterThan(800);
  });

  it('handles low filter ratings (MERV 8 and MERV 11)', () => {
    const merv8 = calculateCADR(10, 10, 8, 3, 500, 8);
    const merv11 = calculateCADR(10, 10, 8, 3, 500, 11);
    expect(merv11.actualCADR).toBeGreaterThan(merv8.actualCADR);
  });

  it('recommends Corsi-Rosenthal Cube for large volume spaces with CADR > 350', () => {
    // 40 x 30 x 10 = 12,000 cu ft -> Target CADR = 12000 * 5 / 60 = 1000 CFM
    const result = calculateCADR(40, 30, 10, 5, 2000, 13);
    expect(result.targetCADR).toBeGreaterThan(350);
    expect(result.diyBoxFanRecommendation).toContain('Corsi-Rosenthal Cube');
  });

  it('throws RangeError for invalid dimensions or non-positive fan ratings', () => {
    expect(() => calculateCADR(0, 10, 8, 4, 500, 13)).toThrow(RangeError);
    expect(() => calculateCADR(10, -5, 8, 4, 500, 13)).toThrow(RangeError);
    expect(() => calculateCADR(10, 10, 0, 4, 500, 13)).toThrow(RangeError);
    expect(() => calculateCADR(10, 10, 8, 0, 500, 13)).toThrow(RangeError);
    expect(() => calculateCADR(10, 10, 8, 4, -100, 13)).toThrow(RangeError);
  });
});

describe('calculatePledgeEmissionSavings', () => {
  it('calculates emissions savings across all supported categories', () => {
    expect(calculatePledgeEmissionSavings('carpool', 10)).toBe(4.2);
    expect(calculatePledgeEmissionSavings('burn-ban', 5)).toBe(14.0);
    expect(calculatePledgeEmissionSavings('boiler-check', 4)).toBe(4.6);
    expect(calculatePledgeEmissionSavings('green-buffer', 10)).toBe(7.5);
    expect(calculatePledgeEmissionSavings('elderly-check', 20)).toBe(4.0);
  });

  it('returns 0 for 0 participants', () => {
    expect(calculatePledgeEmissionSavings('carpool', 0)).toBe(0);
  });

  it('throws RangeError for negative participant count', () => {
    expect(() => calculatePledgeEmissionSavings('carpool', -2)).toThrow(RangeError);
  });
});
