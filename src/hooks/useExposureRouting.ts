// ============================================================
// src/hooks/useExposureRouting.ts
// Custom hook for Dijkstra-based lowest-exposure commute navigation
// Per ARCHITECTURE-PATTERNS.md: Unidirectional data flow, pure compute delegation
// ============================================================

import { useState, useMemo, useCallback } from 'react';

import type { TransitMode, RouteOption, TurnByTurnStep } from '@/types';

import {
  CITY_TRANSIT_GRAPH,
  dijkstraLowestExposure,
  calculateInhaledDose,
  TRANSIT_EXPOSURE_FACTORS,
} from '@/lib/airCompute';

export interface UseExposureRoutingReturn {
  startNode: string;
  setStartNode: (node: string) => void;
  targetNode: string;
  setTargetNode: (node: string) => void;
  selectedMode: TransitMode;
  setSelectedMode: (mode: TransitMode) => void;
  availableNodes: string[];
  routes: RouteOption[];
  recommendedRoute: RouteOption | null;
  swapNodes: () => void;
}

export function useExposureRouting(): UseExposureRoutingReturn {
  const [startNode, setStartNodeState] = useState<string>('North Gate');
  const [targetNode, setTargetNodeState] = useState<string>('South Medical Zone');
  const [selectedMode, setSelectedModeState] = useState<TransitMode>('metro');

  const availableNodes = useMemo(() => Object.keys(CITY_TRANSIT_GRAPH), []);

  const swapNodes = useCallback(() => {
    setStartNodeState(prev => {
      const currentStart = prev;
      setTargetNodeState(currentStart);
      return targetNode;
    });
  }, [targetNode]);

  const setStartNode = useCallback((node: string) => {
    setStartNodeState(node);
  }, []);

  const setTargetNode = useCallback((node: string) => {
    setTargetNodeState(node);
  }, []);

  const setSelectedMode = useCallback((mode: TransitMode) => {
    setSelectedModeState(mode);
  }, []);

  const routes = useMemo<RouteOption[]>(() => {
    const modes: TransitMode[] = ['metro', 'ev', 'bus', 'cycle', 'walk'];

    // Baseline walking calculation for relative risk reduction comparison
    const walkDijkstra = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, startNode, targetNode, 'walk');
    const walkDistance = walkDijkstra ? walkDijkstra.totalDistanceKm : 6.0;
    const walkMinutes = Math.round((walkDistance / TRANSIT_EXPOSURE_FACTORS.walk.averageSpeedKmh) * 60);
    const walkAQI = walkDijkstra ? walkDijkstra.averageAQI : 220;
    const baselineWalkDose = calculateInhaledDose(walkAQI * 0.75, walkMinutes, 'walk');

    return modes.map((mode, index) => {
      const result = dijkstraLowestExposure(CITY_TRANSIT_GRAPH, startNode, targetNode, mode);
      const factor = TRANSIT_EXPOSURE_FACTORS[mode];
      const distance = result ? result.totalDistanceKm : 5.0;
      const minutes = Math.max(Math.round((distance / factor.averageSpeedKmh) * 60), 4);
      const avgAqi = result ? result.averageAQI : 150;

      // Approximate PM2.5 from corridor AQI
      const corridorPM25 = Math.max(Math.round(avgAqi * 0.75), 25);
      const inhaledDose = calculateInhaledDose(corridorPM25, minutes, mode);

      const riskReduction =
        baselineWalkDose > 0
          ? Math.max(Math.round(((baselineWalkDose - inhaledDose) / baselineWalkDose) * 100), 0)
          : 0;

      const path = result ? result.path : [startNode, targetNode];

      // Generate turn-by-turn steps
      const steps: TurnByTurnStep[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edges = CITY_TRANSIT_GRAPH[from] ?? [];
        const edge = edges.find(e => e.to === to);
        const segmentDist = edge ? edge.distanceKm : 1.5;
        const segmentAQI = edge ? edge.typicalAQI : avgAqi;
        const segMinutes = Math.max(Math.round((segmentDist / factor.averageSpeedKmh) * 60), 2);
        const segDose = calculateInhaledDose(Math.round(segmentAQI * 0.75), segMinutes, mode);

        steps.push({
          instruction:
            mode === 'metro'
              ? `Take Underground Metro Line from ${from} to ${to} (Sealed Cabin, High-Efficiency MERV Filtration)`
              : mode === 'ev'
              ? `Drive EV along low-emission connector from ${from} to ${to} (Cabin Air Recirculation Active)`
              : `Traverse corridor from ${from} to ${to} avoiding industrial intersections`,
          distanceKm: segmentDist,
          corridorAQI: segmentAQI,
          segmentDurationMinutes: segMinutes,
          segmentDoseMicrograms: segDose,
        });
      }

      const titles: Record<TransitMode, string> = {
        metro: 'Shielded Underground Transit (Lowest Dose)',
        ev: 'Clean Air EV Corridor (Filtered Cabin)',
        bus: 'City Public Bus Route (Partial Shielding)',
        cycle: 'Protected Green Corridor Cycling',
        walk: 'Arterial Pedestrian Walkway (Direct Exposure)',
      };

      return {
        routeId: `route-${mode}`,
        title: titles[mode] ?? `${mode.toUpperCase()} Commute`,
        mode,
        path,
        totalDistanceKm: distance,
        estimatedMinutes: minutes,
        averageAQI: avgAqi,
        inhaledPM25Micrograms: inhaledDose,
        riskReductionVsWalking: riskReduction,
        isRecommended: index === 0, // Metro / EV lowest dose
        steps,
      };
    });
  }, [startNode, targetNode]);

  const recommendedRoute = useMemo(() => {
    return routes.reduce((best, r) => (r.inhaledPM25Micrograms < best.inhaledPM25Micrograms ? r : best), routes[0]);
  }, [routes]);

  return {
    startNode,
    setStartNode,
    targetNode,
    setTargetNode,
    selectedMode,
    setSelectedMode,
    availableNodes,
    routes,
    recommendedRoute,
    swapNodes,
  };
}
