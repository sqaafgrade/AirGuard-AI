// ============================================================
// src/components/Dashboard/PollutantCards.tsx
// Pollutant breakdown tiles with native SVG sparklines & micro-climate data
// Per EFFICIENCY.md §3: Lightweight inline SVG sparkline, zero chart library
// Per ACCESSIBILITY.md §1.1: Paired sr-only numerical description list
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo } from 'react';

import type { PollutantMeasurement } from '@/types';

import { AQICategory } from '@/types';
import { useAirAnalytics } from '@/hooks/useAirAnalytics';

const Sparkline = memo(function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 160;
  const H = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? W / (values.length - 1) : W;

  const points = values.map((v, i) => ({
    x: i * step,
    y: H - ((v - min) / range) * (H - 6) - 3,
  }));

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="w-full h-9 overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
      ))}
    </svg>
  );
});

function getStatusBadge(status: AQICategory) {
  switch (status) {
    case AQICategory.Good:
      return { text: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/40', stroke: '#10b981' };
    case AQICategory.Moderate:
      return { text: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/40', stroke: '#f59e0b' };
    case AQICategory.Poor:
      return { text: 'text-orange-400', bg: 'bg-orange-950/60 border-orange-500/40', stroke: '#f97316' };
    case AQICategory.VeryPoor:
    case AQICategory.Severe:
      return { text: 'text-red-400', bg: 'bg-red-950/60 border-red-500/40', stroke: '#ef4444' };
  }
}

export const PollutantCards = memo(function PollutantCards() {
  const { selectedSector, pollutants } = useAirAnalytics();

  return (
    <section aria-label="Detailed Pollutant Measurements & Weather Metrics" className="flex flex-col gap-4">
      {/* WCAG 2.2 AA Twin Representation for Sparklines */}
      <div className="sr-only" aria-label="Pollutant 24-hour trend telemetry readings">
        <dl>
          {pollutants.map((p: PollutantMeasurement) => (
            <div key={`sr-pol-${p.type}`}>
              <dt>{p.type} current reading</dt>
              <dd>
                {p.value} {p.unit}, Status: {p.status}, WHO 24-hour safe guideline: {p.threshold} {p.unit},
                Historical trend values: {p.sparkline.join(', ')}.
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Main Grid: 5 Pollutant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {pollutants.map((p: PollutantMeasurement) => {
          const badge = getStatusBadge(p.status);
          const isOverThreshold = p.value > p.threshold;

          return (
            <div
              key={p.type}
              role="article"
              aria-label={`${p.type} pollutant card`}
              className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-4 flex flex-col justify-between gap-3 hover:border-slate-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-extrabold text-white text-sm">{p.type}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{p.value}</span>
                  <span className="text-xs text-slate-400 font-semibold">{p.unit}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  WHO Safe Cap: <span className={isOverThreshold ? 'text-amber-400 font-semibold' : 'text-slate-300'}>{p.threshold} {p.unit}</span>
                </p>
              </div>

              {/* Native SVG Sparkline */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>24h Trend</span>
                  <span>Now</span>
                </div>
                <Sparkline values={p.sparkline} color={badge.stroke} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Micro-Climate & Inversion Diagnostics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🌡️</span>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Ambient Temperature</p>
            <p className="text-base font-black text-white">{selectedSector.temperature}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">💧</span>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Relative Humidity</p>
            <p className="text-base font-black text-white">{selectedSector.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">💨</span>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Surface Wind Speed</p>
            <p className="text-base font-black text-white">{selectedSector.windSpeed} km/h</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🛡️</span>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Inversion Risk</p>
            <span
              className={`inline-block text-xs font-black px-2 py-0.5 rounded ${
                selectedSector.inversionRisk === 'Critical'
                  ? 'bg-red-950 text-red-400 border border-red-500'
                  : selectedSector.inversionRisk === 'High'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500'
              }`}
            >
              {selectedSector.inversionRisk} Inversion
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});
