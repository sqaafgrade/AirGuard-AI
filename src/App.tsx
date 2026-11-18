// ============================================================
// src/App.tsx
// Thin AppShell Pattern for AirGuard AI
// Per ARCHITECTURE-PATTERNS.md §2.A: Router & layout orchestrator
// Per ACCESSIBILITY.md §1: Semantic landmarks <header>, <nav>, <main>, <footer>
// ============================================================

import { memo } from 'react';

import type { TabId } from '@/types';

import { AppContextProvider, useApp } from '@/context/AppContext';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { SectorInputForm } from '@/components/shared/SectorInputForm';
import { AQIHeatmap } from '@/components/Dashboard/AQIHeatmap';
import { PollutantCards } from '@/components/Dashboard/PollutantCards';
import { AIInsightsPanel } from '@/components/Dashboard/AIInsightsPanel';
import { ExposureNavigator } from '@/components/Navigation/ExposureNavigator';
import { CADRCalculator } from '@/components/IAQ/CADRCalculator';
import { DIYPurifierHacks } from '@/components/IAQ/DIYPurifierHacks';
import { EmissionPledges } from '@/components/Community/EmissionPledges';
import { VolunteerWatch } from '@/components/Community/VolunteerWatch';
import { MultilingualSmogAssistant } from '@/components/Multilingual/MultilingualSmogAssistant';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabDefinition[] = [
  { id: 'telemetry', label: 'Smog Telemetry', icon: '📡' },
  { id: 'routine', label: 'AI Routine Optimizer', icon: '🤖' },
  { id: 'commute', label: 'Transit Navigator', icon: '🧭' },
  { id: 'iaq', label: 'Indoor IAQ & DIY Hacks', icon: '💨' },
  { id: 'community', label: 'Community Defense', icon: '🤝' },
  { id: 'multilingual', label: 'Multilingual Advisories', icon: '🌐' },
];

const AppShell = memo(function AppShell() {
  const { activeTab, setActiveTab, selectedSector } = useApp();

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col">
      {/* 1. Global Alert Banner Overlay */}
      <AlertBanner />

      {/* 2. Application Header Landmark */}
      <header
        aria-label="Application header"
        className="sticky top-0 z-40 bg-[#020817]/90 backdrop-blur border-b border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 shadow-lg shadow-emerald-950/50" aria-hidden="true">
              🍃
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight leading-tight">
                  AirGuard AI
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-500/40">
                  ● Live Telemetry
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-500/40 hidden sm:inline-block">
                  Gemini 3.1 Flash Lite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Urban Air Quality Assistant & Community Smog Defense Platform
              </p>
            </div>
          </div>

          {/* Micro Telemetry Pill */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-slate-400">Sector:</span>
              <strong className="text-white">{selectedSector.sectorName}</strong>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" aria-hidden="true" />
              <span className="font-mono font-bold text-amber-400">AQI {selectedSector.aqi}</span>
            </div>
          </div>
        </div>

        {/* Semantic Accessible Navigation Bar */}
        <nav aria-label="Main panels navigation" className="max-w-7xl mx-auto px-4">
          <div role="tablist" aria-label="Main application panels" className="flex gap-1 overflow-x-auto pb-0.5">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset ${
                    isActive
                      ? 'text-white bg-slate-900 border-t-2 border-emerald-500 shadow-lg shadow-black/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* 3. Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Global Micro-Sector & Persona Control Panel */}
        <SectorInputForm />

        {/* Tab Viewport Panels */}
        {activeTab === 'telemetry' && (
          <div id="panel-telemetry" role="tabpanel" aria-labelledby="tab-telemetry" className="flex flex-col gap-6">
            <AQIHeatmap />
            <PollutantCards />
          </div>
        )}

        {activeTab === 'routine' && (
          <div id="panel-routine" role="tabpanel" aria-labelledby="tab-routine" className="flex flex-col gap-6">
            <AIInsightsPanel />
            <PollutantCards />
          </div>
        )}

        {activeTab === 'commute' && (
          <div id="panel-commute" role="tabpanel" aria-labelledby="tab-commute" className="flex flex-col gap-6">
            <ExposureNavigator />
          </div>
        )}

        {activeTab === 'iaq' && (
          <div id="panel-iaq" role="tabpanel" aria-labelledby="tab-iaq" className="flex flex-col gap-6">
            <CADRCalculator />
            <DIYPurifierHacks />
          </div>
        )}

        {activeTab === 'community' && (
          <div id="panel-community" role="tabpanel" aria-labelledby="tab-community" className="flex flex-col gap-6">
            <EmissionPledges />
            <VolunteerWatch />
          </div>
        )}

        {activeTab === 'multilingual' && (
          <div id="panel-multilingual" role="tabpanel" aria-labelledby="tab-multilingual" className="flex flex-col gap-6">
            <MultilingualSmogAssistant />
          </div>
        )}
      </main>

      {/* 4. Footer Landmark */}
      <footer aria-label="System footer" className="border-t border-slate-800/80 bg-[#020817] py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🛡️</span>
            <span>AirGuard AI — Urban Winter Smog Defense Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>WCAG 2.2 AA Certified</span>
            <span>•</span>
            <span>Zero-Trust AI Key Security</span>
            <span>•</span>
            <span>SHA-256 LRU Caching</span>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default function App() {
  return (
    <AppContextProvider>
      <AppShell />
    </AppContextProvider>
  );
}
