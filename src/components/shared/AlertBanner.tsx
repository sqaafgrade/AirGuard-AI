// ============================================================
// src/components/shared/AlertBanner.tsx
// High-severity smog alert banner with ARIA live assertive support
// Per ACCESSIBILITY.md §3: role="alert", aria-live="assertive"
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo } from 'react';

import { useApp } from '@/context/AppContext';

export const AlertBanner = memo(function AlertBanner() {
  const { selectedSector, alertDismissed, dismissAlert, triggerSmogSpike, resetTelemetry } = useApp();

  const isHazardous = selectedSector.aqi > 200 || selectedSector.inversionRisk === 'Critical';

  if (!isHazardous || alertDismissed) {
    return (
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Real-time urban air quality telemetry active. Sector: <strong className="text-white">{selectedSector.sectorName}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerSmogSpike}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors focus:ring-1 focus:ring-emerald-500"
          >
            Simulate Smog Inversion Spike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-gradient-to-r from-red-950/90 via-red-900/90 to-rose-950/90 border-b-2 border-red-500 text-white px-4 py-3 shadow-lg transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <h2 className="text-sm font-black tracking-wide uppercase text-red-200 flex items-center gap-2">
              Critical Smog Alert — Severe Winter Inversion Active
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/80 text-white border border-red-400">
                AQI {selectedSector.aqi}
              </span>
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              Sector: <strong>{selectedSector.sectorName}</strong>. Atmospheric inversion trapping PM2.5 at breathing level ({selectedSector.pm25} µg/m³).
              Vulnerable individuals should avoid outdoor exposure. Run indoor HEPA scrubbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={resetTelemetry}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-800/80 hover:bg-red-700 text-red-100 border border-red-600/50 transition-colors"
          >
            Reset Telemetry
          </button>
          <button
            type="button"
            onClick={dismissAlert}
            aria-label="Dismiss critical smog alert"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
});
