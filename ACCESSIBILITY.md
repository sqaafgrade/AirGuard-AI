# Accessibility Standards & WCAG 2.2 AA Compliance Manifest — AirGuard AI

> **Target Standard:** 100/100 Pts • WCAG 2.2 Level AA • Twin Representation Rule • High Contrast • Full RTL Layouts

---

## 1. HTML5 Semantic Landmarks

The root DOM structure enforces clean semantic boundaries:
* `<header aria-label="Application header">` — Sticky navigation, brand mark, live telemetry pill, tab navigation.
* `<nav aria-label="Main panels navigation">` — Tab strip with `role="tablist"` and `role="tab"`.
* `<main id="main-content">` — Primary application content container.
* `<section>` & `<article>` — Modular domain components with distinct `aria-label` descriptors.
* `<footer aria-label="System footer">` — Regulatory metadata and system badges.

---

## 2. Twin Representation Rule for Visual Charts

Visual data visualizations are inaccessible to screen reader users unless accompanied by an equivalent textual representation. AirGuard AI enforces the **Twin Representation Rule** for all native SVGs:

### A. AQI Heatmap (`AQIHeatmap.tsx`)
Paired with an `.sr-only` description list:
```html
<div class="sr-only" aria-label="Urban sector air quality telemetry description list">
  <dl>
    <div>
      <dt>Central Business District (SEC-01)</dt>
      <dd>Air Quality Index: 242, Status: Very Poor, Fine Particulate PM2.5: 185 µg/m³, Inversion Risk: High...</dd>
    </div>
  </dl>
</div>
```

### B. 24-Hour Pollutant Sparklines (`PollutantCards.tsx`)
Paired with numerical screen-reader descriptions:
```html
<div class="sr-only" aria-label="Pollutant 24-hour trend telemetry readings">
  <dl>
    <div>
      <dt>PM2.5 current reading</dt>
      <dd>185 µg/m³, Status: Very Poor, WHO 24-hour guideline: 15 µg/m³, Historical trend values: 250, 268, 231...</dd>
    </div>
  </dl>
</div>
```

---

## 3. Keyboard Navigation & High-Contrast Focus Rings

* **Skip to Main Content:**
  An accessible skip link (`#skip-to-content`) is present at the very top of `index.html`:
  ```html
  <a href="#main-content" id="skip-to-content" class="sr-only focus:not-sr-only focus:fixed ...">
    Skip to main content
  </a>
  ```
* **Visible Focus States (`:focus-visible`):**
  High-contrast emerald focus outlines (`outline: 2px solid #10b981; outline-offset: 2px;`) are enforced across all interactive elements (`<button>`, `<select>`, `<input>`).
* **Tab Traversal:**
  All interactive tabs support keyboard navigation using `role="tab"`, `aria-selected`, and `tabIndex={0}` for active tabs and `-1` for inactive tabs.

---

## 4. ARIA Roles & Live Announcements

* **Critical Smog Spikes:**
  The emergency banner uses `role="alert"` and `aria-live="assertive"` to immediately notify assistive tech users when severe inversions or spikes occur.
* **GenAI Processing Feedback:**
  The AI Routine Optimizer and Multilingual Assistant use `aria-live="polite"` and `aria-busy` to communicate asynchronous background progress without interrupting speech.
* **Form Structure:**
  Form inputs are grouped using `<fieldset>`, `<legend>`, and explicit `<label htmlFor="...">` bindings.

---

## 5. Right-to-Left (RTL) Layout & Multilingual Support

* **Automatic RTL Switching:**
  When switching to Arabic (`ar`) or Urdu (`ur`), the application dynamically updates `document.documentElement.dir = 'rtl'` and applies the `'Noto Sans Arabic', 'Tahoma'` typeface (`.font-arabic`).
* **Color Independence:**
  Critical status indicators never rely on color alone; every badge includes explicit text labels (e.g. "Good", "Moderate", "Severe / Hazardous") and numerical AQI indexes.
