// ============================================================
// src/components/shared/SectorInputForm.tsx
// Accessible sector selection & household profile configuration
// Per ACCESSIBILITY.md §2: fieldset, legend, label htmlFor, explicit ids
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo } from 'react';

import type { PersonaType } from '@/types';

import { useApp } from '@/context/AppContext';

export const SectorInputForm = memo(function SectorInputForm() {
  const { sectors, selectedSectorId, setSelectedSectorId, userProfile, updateUserProfile } = useApp();

  return (
    <form
      aria-label="Urban Sector & Household Profile Filter"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-4 sm:p-5 flex flex-col gap-4"
      onSubmit={e => e.preventDefault()}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">📍</span> Hyperlocal Sector & Household Profile
          </h2>
          <p className="text-xs text-slate-400">
            Tailors exposure forecasts and mitigation advice to your exact micro-location and family vulnerability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sector Selector */}
        <fieldset className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
          <legend className="text-xs font-semibold text-emerald-400 px-1">Urban Sector</legend>
          <label htmlFor="sector-select" className="block text-xs text-slate-400 mb-1.5 font-medium">
            Monitoring Location
          </label>
          <select
            id="sector-select"
            value={selectedSectorId}
            onChange={e => setSelectedSectorId(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {sectors.map(sector => (
              <option key={sector.sectorId} value={sector.sectorId}>
                {sector.sectorName} (AQI: {sector.aqi} - {sector.category})
              </option>
            ))}
          </select>
        </fieldset>

        {/* Persona Selector */}
        <fieldset className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
          <legend className="text-xs font-semibold text-sky-400 px-1">User Persona</legend>
          <label htmlFor="persona-select" className="block text-xs text-slate-400 mb-1.5 font-medium">
            Lifestyle & Responsibility
          </label>
          <select
            id="persona-select"
            value={userProfile.persona}
            onChange={e => updateUserProfile({ persona: e.target.value as PersonaType })}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="vulnerable-family">Vulnerable Family (Toddlers / Asthmatics / Elderly)</option>
            <option value="commuter">Urban Daily Commuter (Transit / Exposure Route)</option>
            <option value="community-coordinator">Community Coordinator / RWA Lead</option>
          </select>
        </fieldset>

        {/* Household Members */}
        <fieldset className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
          <legend className="text-xs font-semibold text-amber-400 px-1">Vulnerable Members</legend>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="asthmatics-input" className="block text-[11px] text-slate-400 mb-1 font-medium truncate">
                Asthmatic Relatives
              </label>
              <input
                id="asthmatics-input"
                type="number"
                min={0}
                max={10}
                value={userProfile.householdMembers.asthmatics}
                onChange={e =>
                  updateUserProfile({
                    householdMembers: {
                      ...userProfile.householdMembers,
                      asthmatics: Math.max(0, parseInt(e.target.value, 10) || 0),
                    },
                  })
                }
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="toddlers-input" className="block text-[11px] text-slate-400 mb-1 font-medium truncate">
                Toddlers / Infants
              </label>
              <input
                id="toddlers-input"
                type="number"
                min={0}
                max={10}
                value={userProfile.householdMembers.toddlers}
                onChange={e =>
                  updateUserProfile({
                    householdMembers: {
                      ...userProfile.householdMembers,
                      toddlers: Math.max(0, parseInt(e.target.value, 10) || 0),
                    },
                  })
                }
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="elderly-input" className="block text-[11px] text-slate-400 mb-1 font-medium truncate">
                Elderly Relatives
              </label>
              <input
                id="elderly-input"
                type="number"
                min={0}
                max={10}
                value={userProfile.householdMembers.elderly}
                onChange={e =>
                  updateUserProfile({
                    householdMembers: {
                      ...userProfile.householdMembers,
                      elderly: Math.max(0, parseInt(e.target.value, 10) || 0),
                    },
                  })
                }
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </fieldset>
      </div>
    </form>
  );
});
