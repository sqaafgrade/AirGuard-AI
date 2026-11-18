// ============================================================
// src/components/Community/EmissionPledges.tsx
// Neighborhood emission pledges & collective smog mitigation tracker
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState, useMemo, useCallback } from 'react';

import type { CommunityPledge } from '@/types';

import { useApp } from '@/context/AppContext';
import { calculatePledgeEmissionSavings } from '@/lib/airCompute';
import { storageService } from '@/services/storageService';

const INITIAL_COMMUNITY_PLEDGES: CommunityPledge[] = [
  {
    id: 'pld-01',
    title: 'North Gate Commuter Carpool Circle',
    category: 'carpool',
    pledgerName: 'Green Belt Residents Association',
    sectorId: 'SEC-02',
    emissionSavedKgPM25: 18.5,
    participantsCount: 44,
    timestamp: Date.now() - 86400000 * 2,
    verified: true,
  },
  {
    id: 'pld-02',
    title: 'Zero Waste & Leaf Burning Ban Enforcement',
    category: 'burn-ban',
    pledgerName: 'Ward 14 Civic Watch',
    sectorId: 'SEC-03',
    emissionSavedKgPM25: 56.0,
    participantsCount: 20,
    timestamp: Date.now() - 86400000 * 4,
    verified: true,
  },
  {
    id: 'pld-03',
    title: 'Apartment Complex Central Boiler Tune-Up',
    category: 'boiler-check',
    pledgerName: 'Riverfront Towers RWA',
    sectorId: 'SEC-05',
    emissionSavedKgPM25: 34.5,
    participantsCount: 30,
    timestamp: Date.now() - 86400000 * 1,
    verified: true,
  },
];

export const EmissionPledges = memo(function EmissionPledges() {
  const { sectors, selectedSectorId } = useApp();
  const [pledges, setPledges] = useState<CommunityPledge[]>(() => {
    const saved = storageService.getPledges();
    return saved.length > 0 ? saved : INITIAL_COMMUNITY_PLEDGES;
  });

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CommunityPledge['category']>('carpool');
  const [participantsCount, setParticipantsCount] = useState<number>(10);
  const [pledgerName, setPledgerName] = useState<string>('');

  const estimatedSavings = useMemo(() => {
    return calculatePledgeEmissionSavings(category, Math.max(participantsCount, 1));
  }, [category, participantsCount]);

  const totalKgPM25Saved = useMemo(() => {
    return Number(pledges.reduce((sum, p) => sum + p.emissionSavedKgPM25, 0).toFixed(1));
  }, [pledges]);

  const totalParticipants = useMemo(() => {
    return pledges.reduce((sum, p) => sum + p.participantsCount, 0);
  }, [pledges]);

  const handleAddPledge = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pledgerName.trim()) return;

    const newPledge: CommunityPledge = {
      id: `pld-${Date.now()}`,
      title: title.trim(),
      category,
      pledgerName: pledgerName.trim(),
      sectorId: selectedSectorId,
      emissionSavedKgPM25: estimatedSavings,
      participantsCount: Math.max(participantsCount, 1),
      timestamp: Date.now(),
      verified: true,
    };

    setPledges(prev => {
      const next = [newPledge, ...prev];
      storageService.savePledges(next);
      return next;
    });

    setTitle('');
    setPledgerName('');
  }, [title, pledgerName, category, selectedSectorId, estimatedSavings, participantsCount]);

  return (
    <section
      aria-label="Community Emission Pledges & Collective Smog Defense"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">🤝</span> Collective Smog Defense & Neighborhood Emission Pledges
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track micro-action pledges preventing toxic particulate release across urban blocks during winter inversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            {totalKgPM25Saved} kg PM2.5 Avoided
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-sky-950 text-sky-400 border border-sky-500/40">
            {totalParticipants} Active Pledgers
          </span>
        </div>
      </div>

      {/* New Pledge Form */}
      <form
        aria-label="Register Neighborhood Smog Reduction Pledge"
        onSubmit={handleAddPledge}
        className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-3"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          + Launch a Neighborhood Smog Defense Pledge
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label htmlFor="pledge-title" className="block text-[11px] text-slate-400 font-medium mb-1">
              Pledge Campaign Name
            </label>
            <input
              id="pledge-title"
              type="text"
              required
              placeholder="e.g., Sector 4 Shared Morning School Van"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label htmlFor="pledger-name" className="block text-[11px] text-slate-400 font-medium mb-1">
              Organizer / RWA Group
            </label>
            <input
              id="pledger-name"
              type="text"
              required
              placeholder="e.g., Green Park Welfare Association"
              value={pledgerName}
              onChange={e => setPledgerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label htmlFor="pledge-category" className="block text-[11px] text-slate-400 font-medium mb-1">
              Mitigation Category
            </label>
            <select
              id="pledge-category"
              value={category}
              onChange={e => setCategory(e.target.value as CommunityPledge['category'])}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="carpool">Carpool Coordination (0.42 kg/commuter)</option>
              <option value="burn-ban">Open-Burn Vigilance Patrol (2.8 kg/block)</option>
              <option value="boiler-check">Boiler & Heating Efficiency Tune (1.15 kg/unit)</option>
              <option value="green-buffer">Community Tree Canopy Buffer (0.75 kg/plot)</option>
              <option value="elderly-check">Vulnerable Neighbor Air Check (0.20 kg)</option>
            </select>
          </div>

          <div>
            <label htmlFor="pledge-count" className="block text-[11px] text-slate-400 font-medium mb-1">
              Participating Neighbors
            </label>
            <input
              id="pledge-count"
              type="number"
              min={1}
              max={500}
              value={participantsCount}
              onChange={e => setParticipantsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-300">
            Projected Impact: <strong className="text-emerald-400">{estimatedSavings} kg PM2.5</strong> prevented from ground-level air.
          </p>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/40"
          >
            Register Collective Pledge
          </button>
        </div>
      </form>

      {/* Pledges Feed */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Active Community Pledges ({pledges.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pledges.map(pledge => {
            const sector = sectors.find(s => s.sectorId === pledge.sectorId);

            return (
              <div
                key={pledge.id}
                role="article"
                aria-label={`${pledge.title} pledge card`}
                className="bg-slate-950/40 rounded-xl border border-slate-800 p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400 capitalize">
                      {pledge.category.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      ✓ Verified RWA
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1">{pledge.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {pledge.pledgerName} • {sector?.sectorName ?? pledge.sectorId}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{pledge.participantsCount} households</span>
                  <span className="font-black text-emerald-400">-{pledge.emissionSavedKgPM25} kg PM2.5</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
