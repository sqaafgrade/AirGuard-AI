// ============================================================
// src/components/Navigation/RouteOptionCard.tsx
// Route comparison card displaying inhaled particulate dose & turn-by-turn
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState } from 'react';

import type { RouteOption, TransitMode } from '@/types';

interface RouteOptionCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: (routeId: string) => void;
}

function getModeIcon(mode: TransitMode): string {
  switch (mode) {
    case 'metro': return '🚇';
    case 'ev': return '⚡';
    case 'bus': return '🚌';
    case 'cycle': return '🚲';
    case 'walk': return '🚶';
  }
}

export const RouteOptionCard = memo(function RouteOptionCard({
  route,
  isSelected,
  onSelect,
}: RouteOptionCardProps) {
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const icon = getModeIcon(route.mode);

  return (
    <div
      role="article"
      aria-label={`${route.title} transit card`}
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-all ${
        isSelected
          ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/40'
          : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-xl bg-slate-800" aria-hidden="true">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">{route.title}</h3>
              {route.isRecommended && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  ★ Lowest Toxic Inhalation
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Path: {route.path.join(' ➔ ')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(route.routeId)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isSelected
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isSelected ? 'Active Route' : 'Select'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
        <div className="bg-slate-950/50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400">Estimated Duration</p>
          <p className="text-sm font-black text-white">{route.estimatedMinutes} mins</p>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400">Travel Distance</p>
          <p className="text-sm font-black text-white">{route.totalDistanceKm} km</p>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400">Inhaled PM2.5 Dose</p>
          <p className="text-sm font-black text-emerald-400">{route.inhaledPM25Micrograms} µg</p>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-2.5">
          <p className="text-[10px] text-slate-400">Dose Reduction</p>
          <p className="text-sm font-black text-sky-400">
            {route.riskReductionVsWalking > 0 ? `-${route.riskReductionVsWalking}%` : 'Baseline'}
          </p>
        </div>
      </div>

      {/* Turn-by-Turn Collapsible Details */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowSteps(prev => !prev)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 focus:outline-none"
        >
          <span>{showSteps ? '▲ Hide turn-by-turn corridor breakdown' : '▼ View turn-by-turn corridor breakdown'}</span>
          <span className="text-[11px] text-slate-500">({route.steps.length} segments)</span>
        </button>

        {showSteps && (
          <ol className="mt-3 space-y-2 border-l-2 border-slate-700 ml-2 pl-3">
            {route.steps.map((step, idx) => (
              <li key={idx} className="text-xs text-slate-300 relative">
                <span className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-sky-400" aria-hidden="true" />
                <p className="font-medium text-white">{step.instruction}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                  <span>{step.distanceKm} km ({step.segmentDurationMinutes} mins)</span>
                  <span>•</span>
                  <span>Corridor AQI: <strong className="text-amber-400">{step.corridorAQI}</strong></span>
                  <span>•</span>
                  <span>Dose: {step.segmentDoseMicrograms} µg</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
});
