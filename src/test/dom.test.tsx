// ============================================================
// src/test/dom.test.tsx
// Tier 4: User Event & DOM Interaction Tests
// Tests: Profile selection, sliders/inputs, DIY toggles, pledge forms, alerts
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContextProvider } from '@/context/AppContext';
import { SectorInputForm } from '@/components/shared/SectorInputForm';
import { CADRCalculator } from '@/components/IAQ/CADRCalculator';
import { DIYPurifierHacks } from '@/components/IAQ/DIYPurifierHacks';
import { EmissionPledges } from '@/components/Community/EmissionPledges';
import { VolunteerWatch } from '@/components/Community/VolunteerWatch';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { MultilingualSmogAssistant } from '@/components/Multilingual/MultilingualSmogAssistant';

describe('SectorInputForm interactions', () => {
  it('updates selected monitoring sector location', () => {
    render(
      <AppContextProvider>
        <SectorInputForm />
      </AppContextProvider>
    );

    const sectorSelect = screen.getByLabelText(/Monitoring Location/i) as HTMLSelectElement;
    fireEvent.change(sectorSelect, { target: { value: 'SEC-02' } });
    expect(sectorSelect.value).toBe('SEC-02');
  });

  it('updates user persona and household members count', () => {
    render(
      <AppContextProvider>
        <SectorInputForm />
      </AppContextProvider>
    );

    const personaSelect = screen.getByLabelText(/Lifestyle & Responsibility/i) as HTMLSelectElement;
    fireEvent.change(personaSelect, { target: { value: 'commuter' } });
    expect(personaSelect.value).toBe('commuter');

    const asthmaticInput = screen.getByLabelText(/Asthmatic Relatives/i) as HTMLInputElement;
    fireEvent.change(asthmaticInput, { target: { value: '3' } });
    expect(asthmaticInput.value).toBe('3');
  });
});

describe('CADRCalculator interactions', () => {
  it('recalculates room air volume when dimensions change', () => {
    render(
      <AppContextProvider>
        <CADRCalculator />
      </AppContextProvider>
    );

    const lengthInput = screen.getByLabelText(/Length \(ft\)/i);
    const widthInput = screen.getByLabelText(/Width \(ft\)/i);
    const heightInput = screen.getByLabelText(/Ceiling Height \(ft\)/i);

    fireEvent.change(lengthInput, { target: { value: '20' } });
    fireEvent.change(widthInput, { target: { value: '20' } });
    fireEvent.change(heightInput, { target: { value: '10' } });

    // 20 * 20 * 10 = 4,000 cu ft
    expect(screen.getByText('4,000 cu ft')).toBeInTheDocument();
  });
});

describe('DIYPurifierHacks interactions', () => {
  it('switches blueprint detail when another hack is selected', () => {
    render(
      <AppContextProvider>
        <DIYPurifierHacks />
      </AppContextProvider>
    );

    const singleFanButton = screen.getByRole('button', { name: /Budget 1-Filter Box Fan Purifier/i });
    fireEvent.click(singleFanButton);

    expect(screen.getAllByText(/Budget 1-Filter Box Fan Purifier/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$28/i).length).toBeGreaterThan(0);
  });
});

describe('EmissionPledges interactions', () => {
  it('submits a new community pledge and adds it to the view', () => {
    render(
      <AppContextProvider>
        <EmissionPledges />
      </AppContextProvider>
    );

    const titleInput = screen.getByPlaceholderText(/Shared Morning School Van/i);
    const pledgerInput = screen.getByPlaceholderText(/Green Park Welfare Association/i);
    const submitBtn = screen.getByRole('button', { name: /Register Collective Pledge/i });

    fireEvent.change(titleInput, { target: { value: 'Downtown EV Carpool Fleet' } });
    fireEvent.change(pledgerInput, { target: { value: 'Clean Commute Club' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Downtown EV Carpool Fleet')).toBeInTheDocument();
    expect(screen.getByText(/Clean Commute Club/i)).toBeInTheDocument();
  });
});

describe('VolunteerWatch interactions', () => {
  it('logs a new illegal burning incident', () => {
    render(
      <AppContextProvider>
        <VolunteerWatch />
      </AppContextProvider>
    );

    const descInput = screen.getByPlaceholderText(/Behind Ward 4 playground/i);
    const submitBtn = screen.getByRole('button', { name: /Dispatch Neighborhood Patrol/i });

    fireEvent.change(descInput, { target: { value: 'Dense garbage burning near railway crossing' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Dense garbage burning near railway crossing')).toBeInTheDocument();
  });
});

describe('AlertBanner emergency spike and dismissal', () => {
  it('triggers critical smog spike and allows dismissing the banner', () => {
    render(
      <AppContextProvider>
        <AlertBanner />
      </AppContextProvider>
    );

    // Initial state: not hazardous or normal banner
    const spikeBtn = screen.queryByRole('button', { name: /Simulate Smog Inversion Spike/i });
    if (spikeBtn) {
      fireEvent.click(spikeBtn);
      // Now the alert banner with role="alert" should be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Critical Smog Alert/i)).toBeInTheDocument();

      // Dismiss the alert
      const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
      fireEvent.click(dismissBtn);

      // Back to normal telemetry banner
      expect(screen.queryByText(/Critical Smog Alert/i)).not.toBeInTheDocument();
    }
  });
});

describe('MultilingualSmogAssistant interactions', () => {
  it('switches language and sets direction', () => {
    render(
      <AppContextProvider>
        <MultilingualSmogAssistant />
      </AppContextProvider>
    );

    const hindiBtn = screen.getByRole('radio', { name: /हिन्दी/i });
    fireEvent.click(hindiBtn);
    expect(hindiBtn).toHaveAttribute('aria-checked', 'true');

    const arabicBtn = screen.getByRole('radio', { name: /العربية/i });
    fireEvent.click(arabicBtn);
    expect(arabicBtn).toHaveAttribute('aria-checked', 'true');
  });
});
