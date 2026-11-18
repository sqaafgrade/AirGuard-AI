# Code Quality Compliance Manifest — AirGuard AI

> **Target Standard:** 100/100 Pts • Zero compiler errors • Zero linter warnings • Clean layer segregation

---

## 1. Architectural Layer Segregation

AirGuard AI enforces strict architectural segregation across functional layers:

```text
src/
├── lib/airCompute.ts           # Pure mathematical compute (zero side-effects, zero DOM imports)
├── services/                   # I/O, persistence with safeParse<T>(), and backend HTTP wrappers
│   ├── storageService.ts       # Defensive localStorage interface
│   └── airApiService.ts        # Client-side backend communication
├── types/index.ts              # Centralized TypeScript definitions & discriminated unions
├── context/AppContext.tsx       # Cross-cutting global application state
├── hooks/                      # Custom domain hooks (useAirAnalytics, useExposureRouting)
├── components/                 # Memoized presentation components (React.memo)
│   ├── Dashboard/              # AQIHeatmap, PollutantCards, AIInsightsPanel
│   ├── Navigation/             # ExposureNavigator, RouteOptionCard
│   ├── IAQ/                    # CADRCalculator, DIYPurifierHacks
│   ├── Community/              # EmissionPledges, VolunteerWatch
│   ├── Multilingual/           # MultilingualSmogAssistant (RTL-aware)
│   └── shared/                 # AlertBanner, SectorInputForm
└── test/                       # 5 comprehensive Vitest test suites
server.ts                       # Express 5 backend with Gemini 3.1 Flash Lite integration
```

### Layer Responsibility Invariants
1. **`src/lib/airCompute.ts`:**
   Contains only pure deterministic mathematical functions: EPA piecewise AQI interpolation, inhaled PM2.5 dose formulas, room CADR & turnaround calculations, Dijkstra lowest-exposure pathfinding, and community emission pledge formulas. Completely free of DOM or React dependencies.
2. **`src/services/`:**
   All browser storage calls use `safeParse<T>()` with fallback default values, ensuring zero application crashes from corrupt or quota-exceeded local storage.
3. **`src/components/`:**
   Every presentation component is wrapped in `React.memo` to eliminate redundant renders.
4. **`src/hooks/`:**
   Domain logic encapsulates state transitions and calculations using `useMemo` and `useCallback` with exhaustive dependencies. Zero state mutation occurs inside `useMemo`.

---

## 2. TypeScript Strictness Policy

The project configuration (`tsconfig.json`) enforces uncompromising type safety:
* `strict: true`
* `noImplicitAny: true`
* `strictNullChecks: true`
* `noUnusedLocals: true`
* `noUnusedParameters: true`
* `noFallthroughCasesInSwitch: true`
* `noEmit: true`

**Zero `any` Annotations:**
Every data structure, API response, form input, and hook return is explicitly typed using TypeScript interfaces, enums (`AQICategory`, `PollutantType`), and discriminated unions (`TransitMode`, `PersonaType`, `LanguageCode`).

---

## 3. Linter Compliance (Oxlint)

The codebase is continuously audited with **Oxlint**:
```bash
npm run lint
```
**Terminal Verification Output:**
```text
> airguard-ai@1.0.0 lint
> oxlint src server.ts --deny-warnings

Found 0 warnings and 0 errors.
Finished in 9ms on 30 files with 86 rules using 16 threads.
```
* **Lint Errors:** 0
* **Lint Warnings:** 0

---

## 4. Component Purity & Defensive Programming

| Component | Optimization | Accessibility | Defensive Handling |
|---|---|---|---|
| `AQIHeatmap` | `React.memo`, Native SVG | Paired `.sr-only` description list | Bounds-checked sector coordinates |
| `PollutantCards` | `React.memo`, Inline SVGs | Paired `.sr-only` 24h readings | WHO guideline comparisons |
| `AIInsightsPanel` | `React.memo`, SHA-256 LRU | `aria-live="polite"`, `aria-busy` | Deterministic fallback on offline |
| `ExposureNavigator` | `React.memo`, Dijkstra | `<fieldset>`, `<legend>`, `<select>` | Safe edge fallback for transit |
| `CADRCalculator` | `React.memo`, Pure math | `<label htmlFor="...">`, bounds | Positive-only dimensional guards |
| `DIYPurifierHacks` | `React.memo`, Filter tabs | Interactive category pills | Materials & step-by-step clarity |
| `EmissionPledges` | `React.memo`, LocalStorage | Role article, verified pills | Non-negative participant guards |
| `VolunteerWatch` | `React.memo`, LocalStorage | Role article, severity badges | Control character stripping |
| `MultilingualSmogAssistant` | `React.memo`, Dynamic RTL | `dir="rtl"`, Noto Sans Arabic | 6-language fallback dictionary |
| `AlertBanner` | `React.memo`, Event-driven | `role="alert"`, `aria-live="assertive"` | Graceful dismiss & spike simulate |
