// ============================================================
// src/test/rendering.test.tsx
// Tier 3: Component Layout & Accessibility Rendering Tests
// Tests: Component rendering, landmarks, headings, and sr-only twins
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppContextProvider } from '@/context/AppContext';
import { AQIHeatmap } from '@/components/Dashboard/AQIHeatmap';
import { PollutantCards } from '@/components/Dashboard/PollutantCards';
import { AIInsightsPanel } from '@/components/Dashboard/AIInsightsPanel';
import { ExposureNavigator } from '@/components/Navigation/ExposureNavigator';
import { CADRCalculator } from '@/components/IAQ/CADRCalculator';
import { DIYPurifierHacks } from '@/components/IAQ/DIYPurifierHacks';
import { EmissionPledges } from '@/components/Community/EmissionPledges';
import { VolunteerWatch } from '@/components/Community/VolunteerWatch';
import { MultilingualSmogAssistant } from '@/components/Multilingual/MultilingualSmogAssistant';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { SectorInputForm } from '@/components/shared/SectorInputForm';

describe('AQIHeatmap rendering & WCAG AA twins', () => {
  it('renders section title and interactive sector buttons', () => {
    render(
      <AppContextProvider>
        <AQIHeatmap />
      </AppContextProvider>
    );

    expect(screen.getByText(/Urban Sector AQI Heatmap/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Central Business District/i).length).toBeGreaterThan(0);
  });

  it('contains paired sr-only accessibility description list (Twin Representation Rule)', () => {
    render(
      <AppContextProvider>
        <AQIHeatmap />
      </AppContextProvider>
    );

    const srList = screen.getByLabelText(/Urban sector air quality telemetry description list/i);
    expect(srList).toBeInTheDocument();
    expect(srList).toHaveClass('sr-only');
  });
});

describe('PollutantCards rendering', () => {
  it('renders all 5 primary pollutants with values and thresholds', () => {
    render(
      <AppContextProvider>
        <PollutantCards />
      </AppContextProvider>
    );

    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
    expect(screen.getByText('NO2')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
    expect(screen.getByText('O3')).toBeInTheDocument();
    expect(screen.getByText(/Ambient Temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/Inversion Risk/i)).toBeInTheDocument();
  });

  it('renders paired sr-only pollutant trend description list', () => {
    render(
      <AppContextProvider>
        <PollutantCards />
      </AppContextProvider>
    );

    const srList = screen.getByLabelText(/Pollutant 24-hour trend telemetry readings/i);
    expect(srList).toBeInTheDocument();
    expect(srList).toHaveClass('sr-only');
  });
});

describe('AIInsightsPanel rendering', () => {
  it('renders GenAI routine optimizer heading and model badge', () => {
    render(
      <AppContextProvider>
        <AIInsightsPanel />
      </AppContextProvider>
    );

    expect(screen.getByText(/GenAI Daily Routine/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini 3.1 Flash Lite/i)).toBeInTheDocument();
  });
});

describe('ExposureNavigator & Commute routing rendering', () => {
  it('renders waypoint selectors and multi-modal dose matrix', () => {
    render(
      <AppContextProvider>
        <ExposureNavigator />
      </AppContextProvider>
    );

    expect(screen.getByText(/Lowest-Exposure Transit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Origin Waypoint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination Waypoint/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Modal Inhaled PM2.5 Dose Comparison/i)).toBeInTheDocument();
  });
});

describe('CADRCalculator rendering', () => {
  it('renders room dimension inputs and delivered ACH metrics', () => {
    render(
      <AppContextProvider>
        <CADRCalculator />
      </AppContextProvider>
    );

    expect(screen.getByText(/Room-by-Room CADR/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Length \(ft\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Width \(ft\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Required CADR/i)).toBeInTheDocument();
  });
});

describe('DIYPurifierHacks rendering', () => {
  it('renders DIY hacks catalog and Corsi-Rosenthal blueprint', () => {
    render(
      <AppContextProvider>
        <DIYPurifierHacks />
      </AppContextProvider>
    );

    expect(screen.getByText(/Low-Cost IAQ Hacks/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Corsi-Rosenthal Box/i).length).toBeGreaterThan(0);
  });
});

describe('Community & Multilingual components rendering', () => {
  it('renders emission pledges and volunteer desk', () => {
    render(
      <AppContextProvider>
        <EmissionPledges />
        <VolunteerWatch />
      </AppContextProvider>
    );

    expect(screen.getByText(/Collective Smog Defense/i)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer Anti-Burn Patrol/i)).toBeInTheDocument();
  });

  it('renders multilingual smog assistant with language buttons', () => {
    render(
      <AppContextProvider>
        <MultilingualSmogAssistant />
      </AppContextProvider>
    );

    expect(screen.getByText(/Multilingual Smog Emergency Defense/i)).toBeInTheDocument();
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });

  it('renders SectorInputForm and AlertBanner', () => {
    render(
      <AppContextProvider>
        <AlertBanner />
        <SectorInputForm />
      </AppContextProvider>
    );

    expect(screen.getByLabelText(/Monitoring Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lifestyle & Responsibility/i)).toBeInTheDocument();
  });
});
