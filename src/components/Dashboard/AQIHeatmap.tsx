// ============================================================
// src/components/Dashboard/AQIHeatmap.tsx
// Native SVG Urban AQI Heatmap & Micro-Sector Telemetry
// Per EFFICIENCY.md §3: Native SVG renderer, zero heavy chart libraries
// Per ACCESSIBILITY.md §1.1: Paired sr-only textual description list
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo } from 'react';

import type { SectorData } from '@/types';

import { useApp } from '@/context/AppContext';

function getCategoryColor(aqi: number): { fill: string; stroke: string; text: string; bg: string } {
  if (aqi <= 50) return { fill: '#10b981', stroke: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/40' };
  if (aqi <= 100) return { fill: '#f59e0b', stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/40' };
  if (aqi <= 200) return { fill: '#f97316', stroke: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-500/40' };
  if (aqi <= 300) return { fill: '#ef4444', stroke: '#f87171', text: 'text-red-400', bg: 'bg-red-950/40 border-red-500/40' };
  return { fill: '#991b1b', stroke: '#dc2626', text: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/60' };
}

// Fixed coordinates on an 800x420 urban canvas grid
const SECTOR_COORDINATES: Record<string, { cx: number; cy: number; r: number; labelDx: number; labelDy: number }> = {
  'SEC-01': { cx: 400, cy: 210, r: 64, labelDx: 0, labelDy: 5 }, // CBD
  'SEC-02': { cx: 190, cy: 120, r: 54, labelDx: 0, labelDy: 5 }, // Green Belt
  'SEC-03': { cx: 640, cy: 130, r: 72, labelDx: 0, labelDy: 5 }, // Industrial North
  'SEC-04': { cx: 210, cy: 310, r: 52, labelDx: 0, labelDy: 5 }, // University
  'SEC-05': { cx: 580, cy: 300, r: 60, labelDx: 0, labelDy: 5 }, // Riverfront Transit
};

export const AQIHeatmap = memo(function AQIHeatmap() {
  const { sectors, selectedSectorId, setSelectedSectorId } = useApp();

  return (
    <div
      role="region"
      aria-label="Urban Air Quality Telemetry Heatmap"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">🗺️</span> Urban Sector AQI Heatmap & Micro-Climates
          </h2>
          <p className="text-xs text-slate-400">
            Interactive sector exposure map. High thermal inversions and industrial plumes intensify toward the northeast corridor.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> Good</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" aria-hidden="true" /> Poor</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true" /> Hazardous</span>
        </div>
      </div>

      {/* WCAG 2.2 AA Twin Representation Rule: Paired sr-only screen reader list */}
      <div className="sr-only" aria-label="Urban sector air quality telemetry description list">
        <dl>
          {sectors.map((s: SectorData) => (
            <div key={`sr-${s.sectorId}`}>
              <dt>{s.sectorName} ({s.sectorId})</dt>
              <dd>
                Air Quality Index: {s.aqi}, Status: {s.category}, Fine Particulate PM2.5: {s.pm25} micrograms per cubic meter,
                Thermal Inversion Risk: {s.inversionRisk}, Optimal Outdoor Window: {s.safeOutdoorWindow}.
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Native SVG Heatmap Visual Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] max-h-[440px] bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 800 420"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="smogGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#020817" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cleanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#020817" stopOpacity="0" />
            </radialGradient>
            <pattern id="urbanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Grid lines */}
          <rect width="800" height="420" fill="url(#urbanGrid)" />

          {/* Connecting Transit Corridors */}
          <line x1="190" y1="120" x2="400" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="400" y1="210" x2="640" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="210" y1="310" x2="400" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="400" y1="210" x2="580" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="190" y1="120" x2="210" y2="310" stroke="#10b981" strokeWidth="2" strokeOpacity="0.5" />

          {/* Render Sector Blobs */}
          {sectors.map((sector: SectorData) => {
            const coords = SECTOR_COORDINATES[sector.sectorId] ?? { cx: 400, cy: 200, r: 50, labelDx: 0, labelDy: 0 };
            const isSelected = sector.sectorId === selectedSectorId;
            const colors = getCategoryColor(sector.aqi);

            return (
              <g
                key={sector.sectorId}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => setSelectedSectorId(sector.sectorId)}
              >
                {/* Dispersion Plume Ring */}
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={coords.r + 20}
                  fill={colors.fill}
                  fillOpacity={isSelected ? 0.28 : 0.12}
                />

                {/* Main Sector Node */}
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={coords.r}
                  fill="#0f172a"
                  stroke={isSelected ? '#38bdf8' : colors.stroke}
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeDasharray={isSelected ? 'none' : 'none'}
                />

                {/* AQI Value Metric */}
                <text
                  x={coords.cx}
                  y={coords.cy - 10}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="20"
                  fontWeight="900"
                >
                  {sector.aqi}
                </text>

                {/* Category Subtext */}
                <text
                  x={coords.cx}
                  y={coords.cy + 10}
                  textAnchor="middle"
                  fill={colors.stroke}
                  fontSize="11"
                  fontWeight="700"
                >
                  {sector.category.split(' ')[0]}
                </text>

                {/* Sector Name */}
                <text
                  x={coords.cx}
                  y={coords.cy + coords.r + 18}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                >
                  {sector.sectorName}
                </text>

                {/* Selection Indicator Ring */}
                {isSelected && (
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={coords.r + 8}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Sector Quick-Select Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {sectors.map((s: SectorData) => {
          const isSelected = s.sectorId === selectedSectorId;
          const colors = getCategoryColor(s.aqi);

          return (
            <button
              key={s.sectorId}
              type="button"
              onClick={() => setSelectedSectorId(s.sectorId)}
              className={`p-2.5 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500
                ${isSelected ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-400 shadow-md shadow-sky-950/50' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 truncate">{s.sectorName}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                  {s.aqi}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">PM2.5: {s.pm25} µg/m³</p>
            </button>
          );
        })}
      </div>
    </div>
  );
});
