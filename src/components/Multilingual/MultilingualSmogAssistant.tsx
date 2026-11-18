// ============================================================
// src/components/Multilingual/MultilingualSmogAssistant.tsx
// Built-in Multilingual Smog Defense Advisor with Automatic RTL Switching
// Per ACCESSIBILITY.md §5: Automatic dir="rtl", Noto Sans Arabic font
// Per EFFICIENCY.md §2: React.memo
// ============================================================

import { memo, useState, useEffect, useCallback } from 'react';

import type { LanguageCode, TranslationAdvisory } from '@/types';

import { useApp } from '@/context/AppContext';
import { airApiService } from '@/services/airApiService';

const LANGUAGES: { code: LanguageCode; name: string; nativeName: string; isRtl: boolean }[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRtl: true },
];

export const MultilingualSmogAssistant = memo(function MultilingualSmogAssistant() {
  const { language, setLanguage, selectedSector } = useApp();
  const [advisory, setAdvisory] = useState<TranslationAdvisory | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const isRtl = language === 'ar' || language === 'ur';

  const fetchTranslation = useCallback(
    async (lang: LanguageCode, isMounted?: () => boolean) => {
      setLoading(true);
      try {
        const data = await airApiService.getEmergencyTranslation(lang, selectedSector);
        if (!isMounted || isMounted()) {
          setAdvisory(data);
        }
      } catch (err) {
        if (!isMounted || isMounted()) {
          console.error('Translation retrieval error:', err);
        }
      } finally {
        if (!isMounted || isMounted()) {
          setLoading(false);
        }
      }
    },
    [selectedSector]
  );

  useEffect(() => {
    let mounted = true;
    void fetchTranslation(language, () => mounted);
    return () => {
      mounted = false;
    };
  }, [language, fetchTranslation]);

  return (
    <section
      aria-label="Multilingual Smog Advisory & Emergency Guide"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-5 ${
        isRtl ? 'font-arabic' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">🌐</span> Multilingual Smog Emergency Defense & Advisories
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Life-safety translations ensuring all non-English speaking communities receive accessible, actionable inversion instructions.
          </p>
        </div>

        {/* Language Switcher Buttons */}
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select Advisory Language">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={language === lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === lang.code
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-[10px] text-slate-400 ml-1">({lang.name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ARIA Live Status */}
      <div aria-live="polite" className="sr-only">
        {loading ? `Translating advisory into ${language}...` : `Advisory rendered in ${language}.`}
      </div>

      {advisory && (
        <div className="space-y-4">
          {/* Advisory Header Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">📢</span>
              <h3 className="text-base font-black text-white">{advisory.headline}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{advisory.summary}</p>
          </div>

          {/* Emergency DOs and DONTs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DOs */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                <span aria-hidden="true">✅</span> Emergency Actions To Take (DOs)
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisory.emergencyDos.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONTs */}
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-3">
                <span aria-hidden="true">🛑</span> Critical Actions To Avoid (DON'Ts)
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisory.emergencyDonts.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold" aria-hidden="true">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vulnerable Care Notice */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">👶</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Vulnerable Populations & Asthmatic Protocol
              </h4>
              <p className="text-xs text-slate-200 mt-1">{advisory.vulnerableCareNotice}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
