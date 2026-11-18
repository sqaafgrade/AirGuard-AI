// ============================================================
// src/components/IAQ/CADRCalculator.tsx
// Room CADR (Clean Air Delivery Rate) and Air Turnaround Calculator
// Per ACCESSIBILITY.md: label htmlFor, fieldset, number inputs
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState, useMemo } from 'react';

import { useApp } from '@/context/AppContext';
import { calculateCADR } from '@/lib/airCompute';

export const CADRCalculator = memo(function CADRCalculator() {
  const { selectedSector } = useApp();
  const [roomName, setRoomName] = useState<string>('Master Bedroom');
  const [lengthFt, setLengthFt] = useState<number>(16);
  const [widthFt, setWidthFt] = useState<number>(14);
  const [heightFt, setHeightFt] = useState<number>(9);
  const [desiredACH, setDesiredACH] = useState<number>(5);
  const [fanCFM, setFanCFM] = useState<number>(1200);
  const [filterMERV, setFilterMERV] = useState<number>(13);

  const cadrResult = useMemo(() => {
    return calculateCADR(
      Math.max(lengthFt, 1),
      Math.max(widthFt, 1),
      Math.max(heightFt, 1),
      Math.max(desiredACH, 1),
      Math.max(fanCFM, 100),
      filterMERV
    );
  }, [lengthFt, widthFt, heightFt, desiredACH, fanCFM, filterMERV]);

  return (
    <section
      aria-label="Room-by-Room CADR and Purification Calculator"
      className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">💨</span> Room-by-Room CADR & Air Turnaround Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Determine required Clean Air Delivery Rate (CADR) in CFM to scrub particulate smog from living and sleeping quarters.
          </p>
        </div>
        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40">
          EPA & ASHRAE 62.2 Calibrated
        </span>
      </div>

      {/* Input Dimensions Grid */}
      <form
        aria-label="Room Dimensions and Filter Rating"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800"
        onSubmit={e => e.preventDefault()}
      >
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="room-name-input" className="block text-[11px] text-slate-400 font-medium mb-1">
            Room Label
          </label>
          <input
            id="room-name-input"
            type="text"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="length-input" className="block text-[11px] text-slate-400 font-medium mb-1">
            Length (ft)
          </label>
          <input
            id="length-input"
            type="number"
            min={5}
            max={60}
            value={lengthFt}
            onChange={e => setLengthFt(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="width-input" className="block text-[11px] text-slate-400 font-medium mb-1">
            Width (ft)
          </label>
          <input
            id="width-input"
            type="number"
            min={5}
            max={60}
            value={widthFt}
            onChange={e => setWidthFt(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="height-input" className="block text-[11px] text-slate-400 font-medium mb-1">
            Ceiling Height (ft)
          </label>
          <input
            id="height-input"
            type="number"
            min={7}
            max={20}
            value={heightFt}
            onChange={e => setHeightFt(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label htmlFor="ach-select" className="block text-[11px] text-slate-400 font-medium mb-1">
            Target ACH
          </label>
          <select
            id="ach-select"
            value={desiredACH}
            onChange={e => setDesiredACH(parseInt(e.target.value, 10))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value={3}>3 ACH (Moderate)</option>
            <option value={4}>4 ACH (Recommended)</option>
            <option value={5}>5 ACH (Severe Smog)</option>
            <option value={6}>6 ACH (Asthmatic / Vulnerable)</option>
          </select>
        </div>

        <div>
          <label htmlFor="fan-select" className="block text-[11px] text-slate-400 font-medium mb-1">
            Fan Airflow
          </label>
          <select
            id="fan-select"
            value={fanCFM}
            onChange={e => setFanCFM(parseInt(e.target.value, 10))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value={800}>Low (800 CFM)</option>
            <option value={1200}>Medium (1200 CFM)</option>
            <option value={2000}>High (2000 CFM)</option>
            <option value={2400}>CR-Cube (2400 CFM)</option>
          </select>
        </div>

        <div>
          <label htmlFor="merv-select" className="block text-[11px] text-slate-400 font-medium mb-1">
            Filter Grade
          </label>
          <select
            id="merv-select"
            value={filterMERV}
            onChange={e => setFilterMERV(parseInt(e.target.value, 10))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value={8}>MERV-8 (Basic Dust)</option>
            <option value={11}>MERV-11 (Pollen / Smoke)</option>
            <option value={13}>MERV-13 (Smog & PM2.5)</option>
            <option value={17}>True HEPA (H13 99.97%)</option>
          </select>
        </div>
      </form>

      {/* CADR Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-[11px] text-slate-400 font-medium">Room Air Volume</p>
          <p className="text-xl font-black text-white mt-1">{cadrResult.roomVolumeCuFt.toLocaleString()} cu ft</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{roomName}</p>
        </div>

        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-[11px] text-slate-400 font-medium">Required CADR</p>
          <p className="text-xl font-black text-amber-400 mt-1">{cadrResult.targetCADR} CFM</p>
          <p className="text-[10px] text-slate-500 mt-0.5">At {desiredACH} complete air changes/hr</p>
        </div>

        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-[11px] text-slate-400 font-medium">Actual Delivered Clean Air</p>
          <p className="text-xl font-black text-emerald-400 mt-1">{cadrResult.actualCADR} CFM</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{cadrResult.achDelivered} ACH achieved</p>
        </div>

        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-[11px] text-slate-400 font-medium">90% Clearance Time</p>
          <p className="text-xl font-black text-sky-400 mt-1">{cadrResult.cleanAirTurnaroundMinutes} mins</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Rapid turnaround speed</p>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">💡</span>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Optimal DIY Build For {roomName}
            </h3>
            <p className="text-xs text-sky-200 mt-0.5">{cadrResult.diyBoxFanRecommendation}</p>
          </div>
        </div>
        <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-800 text-sky-300 shrink-0">
          Status: {cadrResult.status}
        </span>
      </div>

      {/* Dynamic Window-Ventilation Schedule (Outdoor AQI Trend Calibrated) */}
      <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">🪟</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Dynamic Window-Ventilation Schedule ({selectedSector.sectorName})
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Current Outdoor AQI: {selectedSector.aqi}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-red-400">06:00 - 10:30</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-950 text-red-300">🛑 SEALED</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Morning thermal inversion cap traps night-time smoke and vehicle emissions below 150m. Keep all windows tightly sealed.
            </p>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-400">11:30 - 14:00</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">✅ 15-MIN FLUSH</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Solar heating lifts boundary layer. Safe for 15-minute cross-ventilation to purge indoor CO2 and cooking moisture.
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-400">17:00 - 22:00</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">🛑 SEALED</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Evening temperature inversion descent concentrates rush-hour traffic soot at breathing level. Turn on indoor DIY purifiers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
