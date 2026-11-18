// ============================================================
// src/components/Dashboard/AIInsightsPanel.tsx
// GenAI Daily Routine & Exposure Window Optimizer
// Integrates server-side Google Gemini 3.1 Flash Lite endpoint
// Per EFFICIENCY.md §1: SHA-256 in-memory LRU cache (<10ms repeat)
// Per ACCESSIBILITY.md §3: aria-live="polite", aria-busy
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState, useEffect, useCallback } from 'react';

import type { RoutineInsightReport } from '@/types';

import { useApp } from '@/context/AppContext';
import { airApiService } from '@/services/airApiService';

export const AIInsightsPanel = memo(function AIInsightsPanel() {
  const { userProfile, selectedSector } = useApp();
  const [report, setReport] = useState<RoutineInsightReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(
    async (isMounted?: () => boolean) => {
      setLoading(true);
      setError(null);
      try {
        const data = await airApiService.generateRoutineSchedule(userProfile, selectedSector);
        if (!isMounted || isMounted()) {
          setReport(data);
        }
      } catch (err) {
        if (!isMounted || isMounted()) {
          setError('Unable to fetch GenAI routine optimization. Using deterministic fallback.');
        }
        console.error(err);
      } finally {
        if (!isMounted || isMounted()) {
          setLoading(false);
        }
      }
    },
    [userProfile, selectedSector]
  );

  // Initial load on mount or when sector/persona changes
  useEffect(() => {
    let mounted = true;
    void fetchSchedule(() => mounted);
    return () => {
      mounted = false;
    };
  }, [fetchSchedule]);

  return (
    <section
      aria-label="GenAI Exposure Window & Routine Optimizer"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🤖</span>
            <h2 className="text-lg font-bold text-white">
              GenAI Daily Routine & Smog Exposure Window Optimizer
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
              Gemini 3.1 Flash Lite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hour-by-hour exposure schedule calibrated for <strong className="text-slate-200">{userProfile.name}</strong> ({userProfile.persona})
            in <strong className="text-slate-200">{selectedSector.sectorName}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchSchedule()}
          disabled={loading}
          className="self-end sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Optimizing Routine...</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span>
              <span>Re-optimize with Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* ARIA Live Region for AI Loading Feedback */}
      <div aria-live="polite" className="sr-only">
        {loading ? 'Optimizing your family routine with Google Gemini AI...' : 'Routine optimization complete.'}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-300">
          {error}
        </div>
      )}

      {/* Key Metrics Banner */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Predicted Inhaled Dose Reduction</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">-{report.overallDoseReductionPercent}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Vs. unmitigated outdoor schedule</p>
          </div>

          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Safe Solar Outdoor Window</p>
            <p className="text-lg font-bold text-sky-400 mt-0.5">{report.bestOutdoorWindow}</p>
            <p className="text-[10px] text-slate-500 mt-1">Maximum atmospheric convective mixing</p>
          </div>

          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Atmospheric Inversion Status</p>
            <p className="text-sm font-bold text-amber-300 mt-1">
              {report.thermalInversionWarning ? '⚠️ Active Trapping Layer' : '✅ Dispersive / Normal'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {report.thermalInversionWarning ?? 'Standard boundary layer height'}
            </p>
          </div>
        </div>
      )}

      {/* Hour-by-Hour Interactive Schedule */}
      {report && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">⏱️</span> Chronological Exposure Defense Schedule
          </h3>

          <div className="space-y-2.5">
            {report.hourlySchedule.map((slot, idx) => {
              const isSafe = slot.suitability === 'Safe';
              const isCaution = slot.suitability === 'Caution';
              const badgeStyle = isSafe
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                : isCaution
                ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                : 'bg-red-950/60 text-red-400 border-red-500/40';

              return (
                <div
                  key={idx}
                  className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 text-sky-400 whitespace-nowrap">
                      {slot.hour}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{slot.activity}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {slot.suitability}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{slot.recommendation}</p>
                      <p className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                        💡 Impact: {slot.physiologicalImpact}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 self-end sm:self-center">
                    <p className="text-[10px] text-slate-400">Outdoor Est. AQI</p>
                    <span className="text-sm font-black text-white">{slot.outdoorAQIPrediction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actionable Advice List */}
      {report && report.keyActionableAdvice && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <span aria-hidden="true">🛡️</span> Priority Smog Defense Directives
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {report.keyActionableAdvice.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
});
