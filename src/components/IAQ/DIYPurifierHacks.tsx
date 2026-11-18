// ============================================================
// src/components/IAQ/DIYPurifierHacks.tsx
// Low-Cost DIY Purifiers, Box Fan Blueprints & Indoor Hacks
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState } from 'react';

import type { DIYHack } from '@/types';

export const DIY_HACKS_DATA: DIYHack[] = [
  {
    id: 'hack-cr-cube',
    title: 'Corsi-Rosenthal Box (4-Filter Cube)',
    category: 'purifier',
    difficulty: 'Moderate',
    estimatedCostUSD: 65,
    commercialAlternativeCostUSD: 380,
    pm25ReductionPercent: 88,
    materialsNeeded: [
      '1x 20-inch standard box fan (3-speed)',
      '4x 20x20x2 inch MERV-13 furnace filters',
      '1x roll of standard duct tape / packing tape',
      'Cardboard bottom shroud (cut from fan box)',
    ],
    steps: [
      'Tape 4 MERV-13 filters into a square cube with airflow arrows pointing inward.',
      'Cut a square cardboard base to seal the bottom of the cube airtight.',
      'Place 20" box fan on top blowing UPWARD, out of the cube.',
      'Cut a circular 15" diameter cardboard shroud and tape to the fan face to eliminate corner backpressure.',
      'Seal all seams with duct tape. Run on Medium speed in central room.',
    ],
    scientificMechanism:
      'Spreading airflow across 4 filters decreases face velocity to ~50 ft/min, dramatically lowering static backpressure and delivering over 450 CFM CADR equivalent to hospital-grade HEPA.',
  },
  {
    id: 'hack-single-fan',
    title: 'Budget 1-Filter Box Fan Purifier',
    category: 'purifier',
    difficulty: 'Easy',
    estimatedCostUSD: 28,
    commercialAlternativeCostUSD: 160,
    pm25ReductionPercent: 72,
    materialsNeeded: [
      '1x 20-inch box fan ($20)',
      '1x 20x20x1 or 20x20x2 MERV-13 filter ($8)',
      'Bungee cord or painter’s tape',
    ],
    steps: [
      'Identify back (intake) side of the box fan.',
      'Place MERV-13 filter flush against back grill, arrow pointing into fan.',
      'Fasten securely with bungee cord or tape along four perimeter edges.',
      'Place against bedroom wall facing room center.',
    ],
    scientificMechanism:
      'Captures fine particulate matter (PM2.5) on first pass through electrostatic and mechanical fiber interception. Ideal for bedrooms up to 250 sq ft.',
  },
  {
    id: 'hack-ventilation-timing',
    title: 'Positive-Pressure Solar Window Flushing',
    category: 'ventilation',
    difficulty: 'Easy',
    estimatedCostUSD: 0,
    commercialAlternativeCostUSD: 500,
    pm25ReductionPercent: 55,
    materialsNeeded: [
      'Existing operable windows',
      'AirGuard solar window schedule (12:00 PM - 2:30 PM)',
    ],
    steps: [
      'Never open windows during morning dawn or evening dusk inversions.',
      'Open windows for strictly 15 minutes during solar peak (12:30 PM - 1:00 PM) when ground heating disperses smog.',
      'Run box fan blowing inward through MERV filter to create positive pressure.',
      'Seal windows tightly as sun descends below 20 degrees elevation.',
    ],
    scientificMechanism:
      'Solar thermal convection raises the urban atmospheric boundary layer from 100m to 1000m, reducing ambient particulate density by 50-70% compared to morning smog.',
  },
  {
    id: 'hack-humidity-mucus',
    title: '45% Relative Humidity Mucociliary Barrier',
    category: 'humidity',
    difficulty: 'Easy',
    estimatedCostUSD: 15,
    commercialAlternativeCostUSD: 120,
    pm25ReductionPercent: 40,
    materialsNeeded: [
      'Shallow ceramic water bowls near radiators or evaporative humidifier',
      'Simple hygrometer ($5)',
    ],
    steps: [
      'Monitor indoor humidity; winter heating often drops it below 25%.',
      'Keep indoor RH strictly between 40% and 50%.',
      'Place water basins near heat registers or run cool-mist humidifier with distilled water.',
    ],
    scientificMechanism:
      'Dry airway epithelium (<30% RH) paralyzes respiratory cilia. 40-50% RH maintains the mucus barrier, causing inhaled particles to be trapped and cleared before reaching deep bronchioles.',
  },
  {
    id: 'hack-botanical-scrubbers',
    title: 'Botanical Night-Time VOC & CO2 Bio-Filter',
    category: 'plants',
    difficulty: 'Easy',
    estimatedCostUSD: 12,
    commercialAlternativeCostUSD: 90,
    pm25ReductionPercent: 25,
    materialsNeeded: [
      'Sansevieria trifasciata (Snake Plant / Mother-in-Law’s Tongue)',
      'Spathiphyllum (Peace Lily)',
    ],
    steps: [
      'Place 2-3 mature snake plants per bedroom.',
      'Wipe plant leaf surfaces once a week with a damp cloth to remove settled soot and maintain stomata conductance.',
    ],
    scientificMechanism:
      'Employs Crassulacean Acid Metabolism (CAM) to absorb carbon dioxide and release oxygen at night, mitigating nighttime carbon dioxide buildup in tightly sealed winter rooms.',
  },
];

export const DIYPurifierHacks = memo(function DIYPurifierHacks() {
  const [selectedHackId, setSelectedHackId] = useState<string>('hack-cr-cube');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredHacks = activeCategory === 'all'
    ? DIY_HACKS_DATA
    : DIY_HACKS_DATA.filter(h => h.category === activeCategory);

  const selectedHack = DIY_HACKS_DATA.find(h => h.id === selectedHackId) ?? DIY_HACKS_DATA[0];

  return (
    <section
      aria-label="Indoor Air Quality & Low-Cost DIY Smog Hacks"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">🛠️</span> Low-Cost IAQ Hacks & DIY Purifier Blueprints
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Affordable, peer-reviewed engineering hacks to achieve commercial-grade clean air at 10-20% of retail price.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['all', 'purifier', 'ventilation', 'humidity', 'plants'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hack List Column */}
        <div className="space-y-3">
          {filteredHacks.map(hack => {
            const isSelected = hack.id === selectedHackId;
            const savings = hack.commercialAlternativeCostUSD - hack.estimatedCostUSD;

            return (
              <button
                key={hack.id}
                type="button"
                onClick={() => setSelectedHackId(hack.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-xs truncate">{hack.title}</h3>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    -{hack.pm25ReductionPercent}% PM2.5
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Build Cost: <strong className="text-white">${hack.estimatedCostUSD}</strong></span>
                  <span className="text-emerald-400 font-semibold">Save ${savings}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Blueprint Detail Column */}
        <div className="lg:col-span-2 bg-slate-950/60 rounded-xl border border-slate-800 p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Category: {selectedHack.category.toUpperCase()} • Difficulty: {selectedHack.difficulty}
              </span>
              <h3 className="text-base font-black text-white mt-0.5">{selectedHack.title}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Total DIY Investment</span>
              <p className="text-xl font-black text-emerald-400">${selectedHack.estimatedCostUSD}</p>
            </div>
          </div>

          {/* Materials List */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span aria-hidden="true">📦</span> Required Materials & Hardware
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedHack.materialsNeeded.map((mat, i) => (
                <li key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>{mat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span aria-hidden="true">📋</span> Step-by-Step Assembly Instructions
            </h4>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
              {selectedHack.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  <span className="text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Scientific Mechanism Callout */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <span aria-hidden="true">🔬</span> Atmospheric & Aerodynamic Mechanism
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedHack.scientificMechanism}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
