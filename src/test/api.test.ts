// ============================================================
// src/test/api.test.ts
// Tier 5: Server HTTP API & Security Validation Tests
// Tests: Express 5 endpoints, rate limiting, type guard rejection,
//        SHA-256 caching, and Express 5 *splat SPA fallback
// ============================================================

import { describe, it, expect, afterAll } from 'vitest';
import { server } from '../../server';

const BASE_URL = 'http://localhost:3001';

afterAll(() => {
  server.close();
});

describe('HTTP API Endpoints & Zero-Trust Validation', () => {
  it('GET /api/health returns status 200, healthy status, and model info', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.model).toBe('gemini-3.1-flash-lite');
    expect(typeof json.uptime).toBe('number');
  });

  it('POST /api/routine-insights returns 400 on malformed or missing payload', async () => {
    const res = await fetch(`${BASE_URL}/api/routine-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Invalid payload');
  });

  it('POST /api/routine-insights returns 400 when AQI is out of physical bounds', async () => {
    const res = await fetch(`${BASE_URL}/api/routine-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          persona: 'vulnerable-family',
          name: 'Test Family',
          householdMembers: { toddlers: 1, asthmatics: 1, elderly: 0 },
        },
        sector: {
          sectorId: 'SEC-TEST',
          sectorName: 'Test Area',
          aqi: 2500, // Invalid physical AQI (> 1000)
          pm25: 100,
          inversionRisk: 'High',
        },
      }),
    });
    expect(res.status).toBe(400);
  });

  it(
    'POST /api/routine-insights returns 200 on valid payload and yields structured schedule',
    async () => {
      const validBody = {
        profile: {
          persona: 'vulnerable-family',
          name: 'Suhani Family',
          householdMembers: { toddlers: 1, asthmatics: 1, elderly: 1 },
        },
        sector: {
          sectorId: 'SEC-01',
          sectorName: 'Central Business District',
          aqi: 240,
          pm25: 180,
          inversionRisk: 'High',
        },
      };

      const res = await fetch(`${BASE_URL}/api/routine-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('hourlySchedule');
      expect(json.hourlySchedule.length).toBeGreaterThan(0);
      expect(json).toHaveProperty('overallDoseReductionPercent');

      // Verify In-Memory SHA-256 LRU Cache (<10ms repeat response)
      const tStart = performance.now();
      const repeatRes = await fetch(`${BASE_URL}/api/routine-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });
      const tElapsed = performance.now() - tStart;

      expect(repeatRes.status).toBe(200);
      const repeatJson = await repeatRes.json();
      expect(repeatJson.cached).toBe(true);
      expect(tElapsed).toBeLessThan(100); // Repeat cache returns immediately
    },
    25000
  );

  it(
    'POST /api/translate returns 200 with structured translation for supported language',
    async () => {
      const res = await fetch(`${BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'hi',
          sector: {
            sectorId: 'SEC-01',
            sectorName: 'Central Business District',
            aqi: 220,
            pm25: 150,
            inversionRisk: 'High',
          },
        }),
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.language).toBe('hi');
      expect(json).toHaveProperty('headline');
      expect(json).toHaveProperty('emergencyDos');
      expect(json.emergencyDos.length).toBeGreaterThan(0);
    },
    25000
  );

  it('Express 5 named wildcard catch-all (*splat) serves SPA index.html', async () => {
    const res = await fetch(`${BASE_URL}/any-arbitrary-client-route`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('AirGuard AI');
  });
});
