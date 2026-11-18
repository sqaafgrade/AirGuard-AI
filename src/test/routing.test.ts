// ============================================================
// src/test/routing.test.ts
// Tier 2: Graph Pathfinding & React Hook State Tests
// Tests: Dijkstra lowest-exposure pathfinder & useExposureRouting hook
// ============================================================

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  dijkstraLowestExposure,
  CITY_TRANSIT_GRAPH,
} from '@/lib/airCompute';
import { useExposureRouting } from '@/hooks/useExposureRouting';
import type { GraphEdge } from '@/types';

describe('dijkstraLowestExposure algorithm', () => {
  it('finds lowest-exposure path across city transit graph', () => {
    const result = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, 'North Gate', 'South Medical Zone', 'metro');
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.path[0]).toBe('North Gate');
    expect(result.path[result.path.length - 1]).toBe('South Medical Zone');
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.totalExposureScore).toBeGreaterThan(0);
  });

  it('favors filtered underground metro edges when in metro mode', () => {
    const metroResult = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, 'North Gate', 'City Center Hub', 'metro');
    expect(metroResult).not.toBeNull();
    // In metro mode, the path should leverage 'Metro Station N1' rather than dirty arterial roads
    expect(metroResult?.path).toContain('Metro Station N1');
  });

  it('returns single node path with 0 distance when start equals target', () => {
    const result = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, 'North Gate', 'North Gate', 'walk');
    expect(result).not.toBeNull();
    expect(result?.path).toEqual(['North Gate']);
    expect(result?.totalDistanceKm).toBe(0);
    expect(result?.totalExposureScore).toBe(0);
  });

  it('returns null when start node does not exist in graph', () => {
    const result = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, 'NonExistentHub', 'South Medical Zone');
    expect(result).toBeNull();
  });

  it('returns null when target node is unreachable', () => {
    const disconnectedGraph: Record<string, GraphEdge[]> = {
      NodeA: [{ from: 'NodeA', to: 'NodeB', distanceKm: 2, typicalAQI: 100, hasAirFiltration: false }],
      NodeB: [{ from: 'NodeB', to: 'NodeA', distanceKm: 2, typicalAQI: 100, hasAirFiltration: false }],
      NodeIsolated: [],
    };
    const result = dijkstraLowestExposure(disconnectedGraph, 'NodeA', 'NodeIsolated');
    expect(result).toBeNull();
  });
});

describe('useExposureRouting hook', () => {
  it('initializes with default nodes and computes 5 transit routes', () => {
    const { result } = renderHook(() => useExposureRouting());

    expect(result.current.startNode).toBe('North Gate');
    expect(result.current.targetNode).toBe('South Medical Zone');
    expect(result.current.routes).toHaveLength(5);
    expect(result.current.availableNodes.length).toBeGreaterThan(3);
  });

  it('identifies lowest particulate dose route as recommended', () => {
    const { result } = renderHook(() => useExposureRouting());

    expect(result.current.recommendedRoute).not.toBeNull();
    const recommended = result.current.recommendedRoute;
    for (const r of result.current.routes) {
      expect(recommended!.inhaledPM25Micrograms).toBeLessThanOrEqual(r.inhaledPM25Micrograms);
    }
  });

  it('updates start and target nodes reactively', () => {
    const { result } = renderHook(() => useExposureRouting());

    act(() => {
      result.current.setStartNode('Parkside Avenue');
      result.current.setTargetNode('City Center Hub');
    });

    expect(result.current.startNode).toBe('Parkside Avenue');
    expect(result.current.targetNode).toBe('City Center Hub');
    expect(result.current.routes[0].path[0]).toBe('Parkside Avenue');
  });

  it('swaps origin and destination correctly', () => {
    const { result } = renderHook(() => useExposureRouting());

    const initialStart = result.current.startNode;
    const initialTarget = result.current.targetNode;

    act(() => {
      result.current.swapNodes();
    });

    expect(result.current.startNode).toBe(initialTarget);
    expect(result.current.targetNode).toBe(initialStart);
  });

  it('changes selected mode', () => {
    const { result } = renderHook(() => useExposureRouting());

    act(() => {
      result.current.setSelectedMode('cycle');
    });

    expect(result.current.selectedMode).toBe('cycle');
  });
});
