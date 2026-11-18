// ============================================================
// src/services/storageService.ts
// Defensive browser storage service with safeParse<T>()
// Per CODING-CONVENTIONS.md: safe JSON parsing, zero runtime crashes
// ============================================================

import type { UserProfile, CommunityPledge, SmogIncidentReport } from '@/types';

/**
 * Robust JSON parse wrapper that never throws.
 */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

const KEYS = {
  USER_PROFILE: 'airguard_user_profile',
  CUSTOM_PLEDGES: 'airguard_community_pledges',
  INCIDENTS: 'airguard_incident_reports',
  LANGUAGE: 'airguard_lang',
  ACCESSIBILITY: 'airguard_a11y_mode',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-default',
  name: 'Suhani & Family',
  persona: 'vulnerable-family',
  locationSector: 'SEC-01',
  householdMembers: {
    toddlers: 1,
    asthmatics: 1,
    elderly: 1,
    healthyAdults: 2,
  },
  sensitivityScore: 4,
  preferredTransit: 'metro',
};

export const storageService = {
  getProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(KEYS.USER_PROFILE);
      return safeParse<UserProfile>(raw, DEFAULT_USER_PROFILE);
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch {
      // Storage unavailable or quota exceeded; silently fail gracefully
    }
  },

  getPledges(): CommunityPledge[] {
    try {
      const raw = localStorage.getItem(KEYS.CUSTOM_PLEDGES);
      return safeParse<CommunityPledge[]>(raw, []);
    } catch {
      return [];
    }
  },

  savePledges(pledges: CommunityPledge[]): void {
    try {
      localStorage.setItem(KEYS.CUSTOM_PLEDGES, JSON.stringify(pledges));
    } catch {
      // Fail gracefully
    }
  },

  getIncidents(): SmogIncidentReport[] {
    try {
      const raw = localStorage.getItem(KEYS.INCIDENTS);
      return safeParse<SmogIncidentReport[]>(raw, []);
    } catch {
      return [];
    }
  },

  saveIncidents(incidents: SmogIncidentReport[]): void {
    try {
      localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch {
      // Fail gracefully
    }
  },
};
