// ============================================================
// src/components/Navigation/ExposureNavigator.tsx
// Lowest-Exposure Commute Navigator & Multi-Modal Dose Comparison
// Uses Dijkstra-based pathfinding in src/lib/airCompute.ts
// Per ACCESSIBILITY.md: fieldset, legend, labels, ARIA landmarks
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState } from 'react';

import { useExposureRouting } from '@/hooks/useExposureRouting';
import { RouteOptionCard } from '@/components/Navigation/RouteOptionCard';

export const ExposureNavigator = memo(function ExposureNavigator() {
  const {
    startNode,
    setStartNode,
    targetNode,
    setTargetNode,
    availableNodes,
    routes,
    recommendedRoute,
    swapNodes,
  } = useExposureRouting();

  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-metro');

  return (
    <section
      aria-label="Lowest-Exposure Transit & Commute Navigator"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">🧭</span> Lowest-Exposure Transit & Commute Navigator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dijkstra-driven pathfinding prioritizing corridors with lowest toxic particulate concentration and filtered transit cabins.
          </p>
        </div>

        {recommendedRoute && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2 text-right">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Top Recommendation</span>
            <span className="text-xs font-black text-white">{recommendedRoute.title}</span>
          </div>
        )}
      </div>

      {/* Origin & Destination Waypoint Form */}
      <form
        aria-label="Commute Origin and Destination Selection"
        className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end bg-slate-950/40 p-4 rounded-xl border border-slate-800"
        onSubmit={e => e.preventDefault()}
      >
        <fieldset className="sm:col-span-2 border border-slate-800 rounded-lg p-2.5 bg-slate-900/70">
          <legend className="text-[11px] font-semibold text-emerald-400 px-1">Starting Waypoint</legend>
          <label htmlFor="origin-waypoint" className="sr-only">Origin Waypoint</label>
          <select
            id="origin-waypoint"
            value={startNode}
            onChange={e => setStartNode(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            {availableNodes.map(node => (
              <option key={`start-${node}`} value={node}>{node}</option>
            ))}
          </select>
        </fieldset>

        <div className="flex justify-center sm:col-span-1 pb-1">
          <button
            type="button"
            onClick={swapNodes}
            aria-label="Swap origin and destination"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-all"
          >
            ⇄ Swap
          </button>
        </div>

        <fieldset className="sm:col-span-2 border border-slate-800 rounded-lg p-2.5 bg-slate-900/70">
          <legend className="text-[11px] font-semibold text-sky-400 px-1">Destination Waypoint</legend>
          <label htmlFor="dest-waypoint" className="sr-only">Destination Waypoint</label>
          <select
            id="dest-waypoint"
            value={targetNode}
            onChange={e => setTargetNode(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            {availableNodes.map(node => (
              <option key={`target-${node}`} value={node}>{node}</option>
            ))}
          </select>
        </fieldset>
      </form>

      {/* Physiological Dose Comparison Matrix */}
      <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
          <span aria-hidden="true">📊</span> Multi-Modal Inhaled PM2.5 Dose Comparison
        </h3>

        <div className="space-y-2">
          {routes.map(r => {
            const isLowest = recommendedRoute?.routeId === r.routeId;
            const dosePercent = Math.min((r.inhaledPM25Micrograms / 40) * 100, 100);

            return (
              <div key={`matrix-${r.routeId}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{r.title}</span>
                  <span className="font-mono text-xs">
                    <strong className={isLowest ? 'text-emerald-400 font-black' : 'text-slate-300'}>
                      {r.inhaledPM25Micrograms} µg
                    </strong>{' '}
                    <span className="text-[11px] text-slate-500">({r.estimatedMinutes}m)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLowest ? 'bg-emerald-500' : dosePercent > 60 ? 'bg-red-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${Math.max(dosePercent, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Turn-by-Turn Route Options ({routes.length})</span>
        </h3>

        {routes.map(route => (
          <RouteOptionCard
            key={route.routeId}
            route={route}
            isSelected={selectedRouteId === route.routeId}
            onSelect={setSelectedRouteId}
          />
        ))}
      </div>
    </section>
  );
});
