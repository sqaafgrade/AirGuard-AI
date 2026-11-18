// ============================================================
// src/context/AppContext.tsx
// Cross-cutting global state for AirGuard AI
// Per ARCHITECTURE-PATTERNS.md: Thin context, typed dispatchers
// ============================================================

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';

import type { SectorData, UserProfile, TabId, LanguageCode } from '@/types';

import { AQICategory } from '@/types';
import { DEFAULT_SECTORS } from '@/lib/airCompute';
import { storageService, DEFAULT_USER_PROFILE } from '@/services/storageService';

export interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  selectedSectorId: string;
  setSelectedSectorId: (id: string) => void;
  selectedSector: SectorData;
  sectors: SectorData[];
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  accessibilityMode: 'standard' | 'high-contrast' | 'screen-reader-optimized';
  setAccessibilityMode: (mode: 'standard' | 'high-contrast' | 'screen-reader-optimized') => void;
  alertDismissed: boolean;
  dismissAlert: () => void;
  triggerSmogSpike: () => void;
  resetTelemetry: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabId>('telemetry');
  const [sectors, setSectors] = useState<SectorData[]>(DEFAULT_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('SEC-01');
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => storageService.getProfile() || DEFAULT_USER_PROFILE);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [accessibilityMode, setAccessibilityModeState] = useState<'standard' | 'high-contrast' | 'screen-reader-optimized'>('standard');
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  // Sync RTL and lang attribute with selected language
  useEffect(() => {
    const isRtl = language === 'ar' || language === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfileState(prev => {
      const next = { ...prev, ...updates };
      storageService.saveProfile(next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const setAccessibilityMode = useCallback((mode: 'standard' | 'high-contrast' | 'screen-reader-optimized') => {
    setAccessibilityModeState(mode);
  }, []);

  const dismissAlert = useCallback(() => {
    setAlertDismissed(true);
  }, []);

  const triggerSmogSpike = useCallback(() => {
    setSectors(prev =>
      prev.map(s => {
        if (s.sectorId === 'SEC-01') {
          return {
            ...s,
            aqi: 418,
            category: AQICategory.Severe,
            pm25: 395,
            pm10: 512,
            inversionRisk: 'Critical',
            lastUpdated: Date.now(),
          };
        }
        return s;
      })
    );
    setAlertDismissed(false);
  }, []);

  const resetTelemetry = useCallback(() => {
    setSectors(DEFAULT_SECTORS);
    setAlertDismissed(false);
  }, []);

  const selectedSector = useMemo(() => {
    return sectors.find(s => s.sectorId === selectedSectorId) ?? sectors[0];
  }, [sectors, selectedSectorId]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      selectedSectorId,
      setSelectedSectorId,
      selectedSector,
      sectors,
      userProfile,
      updateUserProfile,
      language,
      setLanguage,
      accessibilityMode,
      setAccessibilityMode,
      alertDismissed,
      dismissAlert,
      triggerSmogSpike,
      resetTelemetry,
    }),
    [
      activeTab,
      setActiveTab,
      selectedSectorId,
      selectedSector,
      sectors,
      userProfile,
      updateUserProfile,
      language,
      setLanguage,
      accessibilityMode,
      setAccessibilityMode,
      alertDismissed,
      dismissAlert,
      triggerSmogSpike,
      resetTelemetry,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}
