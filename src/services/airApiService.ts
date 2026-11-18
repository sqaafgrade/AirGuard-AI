// ============================================================
// src/services/airApiService.ts
// Client-side API wrapper communicating with server.ts
// Per SECURITY.md: zero API keys on client; structured error recovery
// ============================================================

import type { UserProfile, SectorData, RoutineInsightReport, LanguageCode, TranslationAdvisory } from '@/types';

const getApiBase = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    if (window.location.port === '5173' || window.location.port === '3001' || !window.location.port) {
      return '';
    }
  }
  return 'http://localhost:3001';
};

export const airApiService = {
  async getHealth(): Promise<{ status: string; uptime: number }> {
    const base = getApiBase();
    const res = await fetch(`${base}/api/health`);
    if (!res.ok) throw new Error(`Health check failed with status: ${res.status}`);
    return res.json();
  },

  async generateRoutineSchedule(profile: UserProfile, sector: SectorData): Promise<RoutineInsightReport> {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/routine-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, sector }),
      });

      if (!res.ok) {
        throw new Error(`Routine optimizer returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend routine optimizer unavailable; using deterministic baseline fallback', err);
      return generateFallbackRoutine(profile, sector);
    }
  },

  async getEmergencyTranslation(language: LanguageCode, sector: SectorData): Promise<TranslationAdvisory> {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, sector }),
      });

      if (!res.ok) {
        throw new Error(`Translation API returned HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn('Backend translation unavailable; using multilingual fallback', err);
      return generateFallbackTranslation(language, sector);
    }
  },
};

/**
 * Deterministic fallback generator for when offline or during network dropouts
 */
function generateFallbackRoutine(profile: UserProfile, sector: SectorData): RoutineInsightReport {
  const isVulnerable = profile.householdMembers.asthmatics > 0 || profile.householdMembers.toddlers > 0 || profile.householdMembers.elderly > 0;
  const isHighAQI = sector.aqi > 200;

  return {
    timestamp: Date.now(),
    persona: profile.persona,
    targetSector: sector.sectorName,
    summary: `AirGuard Winter Defense Routine formulated for ${profile.name} in ${sector.sectorName}. Current AQI is ${sector.aqi} (${sector.category}).`,
    thermalInversionWarning: isHighAQI
      ? 'Thermal inversion layer active until 10:30 AM. Particulates trapped below 150m boundary. Keep windows tightly sealed.'
      : null,
    bestOutdoorWindow: isHighAQI ? '12:00 PM - 03:00 PM' : '10:00 AM - 04:30 PM',
    overallDoseReductionPercent: isVulnerable ? 68 : 52,
    hourlySchedule: [
      {
        hour: '07:00 - 08:00',
        activity: 'Morning routine & wake up',
        suitability: 'Stay Indoors',
        outdoorAQIPrediction: sector.aqi + 35,
        pm25Expected: sector.pm25 * 1.2,
        recommendation: 'Run indoor DIY HEPA box fan filter. Do not open windows or exercise outdoors.',
        physiologicalImpact: 'Avoids deep alveolar deposition of ultra-fine particulate matter during night-time stagnation.',
      },
      {
        hour: '08:30 - 09:30',
        activity: 'School run & Office transit',
        suitability: isHighAQI ? 'Caution' : 'Safe',
        outdoorAQIPrediction: sector.aqi + 15,
        pm25Expected: sector.pm25 * 1.1,
        recommendation: 'Use underground Metro or sealed EV bus with recirculating air. Fit N95 mask snug on bridge of nose.',
        physiologicalImpact: 'Reduces inhaled PM2.5 dose by up to 64% compared to walking or open two-wheelers.',
      },
      {
        hour: '11:00 - 13:30',
        activity: 'Safe outdoor window / Errands',
        suitability: 'Safe',
        outdoorAQIPrediction: Math.max(sector.aqi - 60, 45),
        pm25Expected: Math.max(sector.pm25 * 0.6, 20),
        recommendation: 'Best solar dispersion window. Safe for gentle park stroll or short school playtime.',
        physiologicalImpact: 'Solar boundary layer rises, dispersing ground-level particulate mass by over 40%.',
      },
      {
        hour: '17:00 - 19:30',
        activity: 'Evening commute & Dinner',
        suitability: 'Caution',
        outdoorAQIPrediction: sector.aqi + 20,
        pm25Expected: sector.pm25 * 1.15,
        recommendation: 'Arrive before 6 PM thermal descent. Keep kitchen exhaust running during cooking.',
        physiologicalImpact: 'Prevents co-exposure to outdoor winter smoke and indoor cooking VOCs.',
      },
    ],
    keyActionableAdvice: [
      'Shift physical cardiovascular exercise indoors when ambient PM2.5 exceeds 60 µg/m³.',
      'Operate DIY box fan purifier on medium speed across sleeping quarters.',
      'Keep indoor relative humidity between 40% and 50% to maintain natural respiratory mucus defense.',
    ],
  };
}

function generateFallbackTranslation(language: LanguageCode, sector: SectorData): TranslationAdvisory {
  const translations: Record<LanguageCode, TranslationAdvisory> = {
    en: {
      language: 'en',
      headline: `Severe Winter Smog Advisory for ${sector.sectorName}`,
      summary: `Current AQI is ${sector.aqi} (${sector.category}). Fine particulate matter (PM2.5) levels pose acute respiratory risk.`,
      emergencyDos: [
        'Run DIY HEPA / MERV-13 air purifiers continuously in closed bedrooms.',
        'Wear a certified, well-sealed N95 or FFP2 respirator outdoors.',
        'Schedule essential outdoor activities strictly between 12:00 PM and 3:00 PM.',
      ],
      emergencyDonts: [
        'Do NOT burn biomass, dried leaves, or garbage in neighborhood bins.',
        'Do NOT jog or do heavy physical exertion outdoors in early morning inversions.',
        'Do NOT ventilate windows during dawn or dusk smog spikes.',
      ],
      vulnerableCareNotice: 'Keep asthmatic inhalers accessible. Check on elderly relatives and infants at least twice daily.',
    },
    hi: {
      language: 'hi',
      headline: `${sector.sectorName} के लिए गंभीर वायु प्रदूषण चेतावनी`,
      summary: `वर्तमान वायु गुणवत्ता सूचकांक (AQI) ${sector.aqi} (${sector.category}) है। पीएम 2.5 का स्तर श्वसन तंत्र के लिए अत्यंत हानिकारक है।`,
      emergencyDos: [
        'कमरों में DIY HEPA या MERV-13 एयर प्यूरीफायर चालू रखें।',
        'बाहर निकलते समय N95 मास्क को नाक और मुंह पर कसकर पहनें।',
        'ज़रूरी काम दोपहर 12:00 से 3:00 बजे के बीच ही करें जब धूप से प्रदूषण कम होता है।',
      ],
      emergencyDonts: [
        'कचरा, सूखी पत्तियां या बायोमास बिल्कुल न जलाएं।',
        'सुबह के समय जब स्मॉग ज़मीन पर जमा हो तब जॉगिंग या व्यायाम न करें।',
        'सुबह या शाम के समय खिड़कियां न खोलें।',
      ],
      vulnerableCareNotice: 'अस्थमा के मरीज इनहेलर पास रखें। बुज़ुर्गों और बच्चों के स्वास्थ्य पर विशेष नज़र रखें।',
    },
    ar: {
      language: 'ar',
      headline: `تحذير طوارئ من الضباب الدخاني الحاد في ${sector.sectorName}`,
      summary: `مؤشر جودة الهواء الحالي هو ${sector.aqi} (${sector.category}). مستويات الجسيمات الدقيقة PM2.5 تشكل خطراً تنفسياً كبيراً.`,
      emergencyDos: [
        'تشغيل أجهزة تنقية الهواء المنزلية HEPA باستمرار في غرف النوم المغلقة.',
        'ارتداء كمامة N95 محكمة الإغلاق عند الخروج الاضطراري.',
        'قصر الأنشطة الخارجية بين الساعة 12:00 ظهراً و 3:00 عصراً فقط.',
      ],
      emergencyDonts: [
        'عدم حرق النفايات أو الأخشاب أو مخلفات الحدائق في الأحياء.',
        'تجنب ممارسة الرياضة الصباحية في الهواء الطلق أثناء الانقلاب الحراري.',
        'عدم فتح النوافذ خلال فترات الفجر والمساء عند ذروة التلوث.',
      ],
      vulnerableCareNotice: 'احتفظ بأجهزة استنشاق الربو في متناول اليد، وتفقد كبار السن والأطفال بانتظام.',
    },
    es: {
      language: 'es',
      headline: `Alerta de Esmog Invernal Severo en ${sector.sectorName}`,
      summary: `El índice AQI actual es ${sector.aqi} (${sector.category}). Los niveles de PM2.5 representan un riesgo respiratorio crítico.`,
      emergencyDos: [
        'Haga funcionar purificadores HEPA caseros de forma continua en dormitorios.',
        'Use una mascarilla N95 ajustada si necesita salir al exterior.',
        'Programe actividades al aire libre exclusivamente entre las 12:00 y las 15:00 horas.',
      ],
      emergencyDonts: [
        'NO queme biomasa, hojas secas o basura en áreas comunitarias.',
        'NO realice ejercicio cardiovascular vigoroso al aire libre por la mañana.',
        'NO abra ventanas durante picos de inversión térmica matutina.',
      ],
      vulnerableCareNotice: 'Mantenga inhaladores cerca. Revise a niños pequeños y ancianos con frecuencia.',
    },
    fr: {
      language: 'fr',
      headline: `Avis de smog hivernal sévère pour ${sector.sectorName}`,
      summary: `L'indice AQI actuel est de ${sector.aqi} (${sector.category}). Les particules PM2.5 présentent un risque respiratoire élevé.`,
      emergencyDos: [
        'Faites fonctionner des purificateurs HEPA dans les chambres fermées.',
        'Portez un masque N95 ou FFP2 bien ajusté à l extérieur.',
        'Privilégiez les sorties entre 12h00 et 15h00 lors de la dispersion thermique.',
      ],
      emergencyDonts: [
        'Ne brûlez pas de feuilles ou de déchets dans le quartier.',
        'Évitez le jogging matinal pendant l inversion de température.',
        'N ouvrez pas les fenêtres à l aube ou au crépuscule.',
      ],
      vulnerableCareNotice: 'Gardez les inhalateurs pour l asthme à portée de main et surveillez les personnes âgées.',
    },
    ur: {
      language: 'ur',
      headline: `${sector.sectorName} کے لیے شدید اسموگ ایڈوائزری`,
      summary: `موجودہ ایئر کوالٹی انڈیکس ${sector.aqi} (${sector.category}) ہے۔ PM2.5 ذرات سانس کی صحت کے لیے شدید خطرہ ہیں۔`,
      emergencyDos: [
        'کمروں میں HEPA فلٹر والے گھریلو پیوریفائر مسلسل چلائیں۔',
        'باہر نکلتے وقت N95 ماسک مضبوطی سے پہنیں۔',
        'ضروری کام دوپہر 12 سے 3 بجے کے درمیان انجام دیں۔',
      ],
      emergencyDonts: [
        'کچرا یا خشک پتے ہرگز نہ جلائیں۔',
        'صبح کے وقت کھلی ہوا میں ورزش سے پرہیز کریں۔',
        'صبح اور شام کے وقت کھڑکیاں نہ کھولیں۔',
      ],
      vulnerableCareNotice: 'دمہ کے مریض انہیلر پاس رکھیں اور بزرگوں کی خیروعافیت کا خاص خیال رکھیں۔',
    },
  };

  return translations[language] ?? translations.en;
}
