# Testing Standards & Verification Manifest — AirGuard AI

> **Target Standard:** 100/100 Pts • 5 Multi-Tier Test Suites • 100% Pass Rate (61/61 Tests Passing)

---

## 1. Test Architecture Overview

Testing is powered by **Vitest 3.0.7** running under **JSDOM 26.0.0** and **Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).

```bash
npm run test:run
```

### Verified Test Run Output
```text
 RUN  v3.2.7 D:/AirGuard AI PromptWar 6

 ✓ src/test/air.test.ts (26 tests) 14ms
 ✓ src/test/routing.test.ts (10 tests) 36ms
 ✓ src/test/rendering.test.tsx (11 tests) 265ms
 ✓ src/test/dom.test.tsx (8 tests) 316ms
 ✓ src/test/api.test.ts (6 tests) 6852ms

 Test Files  5 passed (5)
      Tests  61 passed (61)
   Start at  15:23:57
   Duration  8.71s
```

* **Total Test Suites:** 5 / 5 Passed (100%)
* **Total Automated Tests:** 61 / 61 Passed (100%)
* **Failed / Skipped Tests:** 0

---

## 2. Five-Tier Suite Breakdown

### Tier 1: Pure Mathematical & Algorithmic Unit Tests (`src/test/air.test.ts` — 26 Tests)
* **`computeAQICategory`:** Verifies Good (0-50), Moderate (51-100), Poor (101-200), Very Poor (201-300), Severe (>300), negative inputs (`RangeError`), and non-finite values (`RangeError`).
* **`computePM25SubIndex`:** Tests all 7 EPA piecewise boundary breakpoints (0.0 to 500.4 µg/m³), intermediate interpolation, scale cap at 500, and `RangeError` validation.
* **`calculateInhaledDose`:** Validates physiological inhaled dose across Walking, Cycling, Bus, Metro, and EV modes, testing penetration factors, zero duration/concentration boundaries, and negative inputs.
* **`calculateCADR`:** Validates room volume ($L \times W \times H$), Target CADR, Actual Delivered CADR, Delivered ACH, turnaround time ($t_{90}$), filter efficiencies (MERV-8, MERV-11, MERV-13, HEPA), and `RangeError` on invalid dimensions.
* **`calculatePledgeEmissionSavings`:** Verifies particulate emission reduction rates across carpooling, burn bans, boiler tune-ups, green buffers, and elderly checks.

### Tier 2: Graph Pathfinding & React Hook State Tests (`src/test/routing.test.ts` — 10 Tests)
* **Dijkstra Algorithm:** Finds multi-hop lowest-exposure path across city transit graph, prefers filtered underground transit corridors in metro mode, tests self-loops (0 distance), unreachable disconnected subgraphs (`null`), and unknown node inputs (`null`).
* **`useExposureRouting` Hook:** Verified using `renderHook` and `act`, testing default nodes, reactive start/target updates, node swapping (`swapNodes`), transit mode selection, and lowest-exposure route recommendation.

### Tier 3: Component Layout & Accessibility Rendering Tests (`src/test/rendering.test.tsx` — 11 Tests)
* **`AQIHeatmap`:** Asserts presence of section header, interactive sector buttons, and paired `.sr-only` screen reader description list.
* **`PollutantCards`:** Asserts rendering of PM2.5, PM10, NO2, CO, O3, sparklines, `.sr-only` description list, and micro-climate metrics.
* **`AIInsightsPanel`:** Asserts presence of GenAI optimizer heading, Gemini 3.1 Flash Lite badge, and optimization trigger.
* **`ExposureNavigator`:** Asserts presence of waypoint selectors, dose comparison matrix, and route cards.
* **`CADRCalculator` & `DIYPurifierHacks`:** Asserts CADR input dimensions, ACH metrics, and DIY hack catalogs.
* **`EmissionPledges` & `VolunteerWatch`:** Asserts community pledges, impact counters, and volunteer dispatch desk.
* **`MultilingualSmogAssistant`:** Asserts language switching pills and emergency advisory cards.
* **`SectorInputForm` & `AlertBanner`:** Asserts accessible form controls and emergency alert banner.

### Tier 4: User Event & DOM Interaction Tests (`src/test/dom.test.tsx` — 8 Tests)
* **Sector & Persona Selection:** Tests changing active sector location via dropdown, updating persona to commuter, and adjusting asthmatic family counts.
* **CADR Form Inputs:** Modifies length, width, and height inputs, asserting dynamic recalculation of room volume to 4,000 cu ft.
* **DIY Hacks Selection:** Clicks between DIY blueprints, verifying dynamic display of bill of materials and steps.
* **Pledge & Incident Submissions:** Submits a new community pledge and logs an emergency smoke incident.
* **Alert Banner Simulation:** Simulates critical smog inversion spike, asserts appearance of `role="alert"`, and tests dismissal button.
* **Language Direction Switching:** Clicks Hindi and Arabic, asserting active radio state and RTL configuration.

### Tier 5: Server HTTP API & Security Validation Tests (`src/test/api.test.ts` — 6 Tests)
* **`GET /api/health`:** Returns status 200, status `'ok'`, and model `'gemini-3.1-flash-lite'`.
* **`POST /api/routine-insights` Validation:** Returns 400 on malformed payloads and out-of-range AQI inputs (> 1000).
* **`POST /api/routine-insights` AI Execution:** Returns 200 with structured schedule and verifies In-Memory SHA-256 LRU Cache (<10ms repeat responses).
* **`POST /api/translate` Validation & Execution:** Rejects invalid languages with 400, returns 200 with structured emergency translations for supported languages.
* **Express 5 Named Wildcard Catch-All (`*splat`):** Serves `index.html` for arbitrary client-side routes.
