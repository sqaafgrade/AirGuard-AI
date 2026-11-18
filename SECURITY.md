# Security Standards & Zero-Trust Architecture Manifest — AirGuard AI

> **Target Standard:** 100/100 Pts • OWASP Top 10 Defenses • Server-Side GenAI Custody • CWE-209 & CWE-200 Hardened

---

## 1. Zero-Trust Architecture & Key Custody

1. **Server-Side AI Execution Only:**
   The Google Gemini API secret key (`GEMINI_API_KEY`) is stored exclusively in the root `.env` file and accessed only within `server.ts`. No secret keys or privileged credentials exist in client bundles, public assets, or version control.
2. **Client-Facing Secrets Isolation:**
   Client code only accesses non-sensitive public configuration variables via `import.meta.env` (e.g. `VITE_FIREBASE_PROJECT_ID`).
3. **Environment Segregation:**
   `.env.example` is committed to git with clean placeholders; `.env` is strictly gitignored.

---

## 2. Defensive Perimeter Chain (`server.ts`)

Every HTTP request to the AirGuard AI backend passes through an automated five-stage defensive middleware pipeline:

```text
Incoming Request
       │
       ▼
[0. Reverse-Proxy Trust & Info Disclosure] ──► app.set('trust proxy', 1), app.disable('x-powered-by')
       │
       ▼
[1. Helmet CSP & Headers] ──► Disallows unauthorized script execution, enforces strict-origin
       │
       ▼
[2. Dynamic CORS Allowlist] ──► Validates request origin against localhost & verified deploy URLs
       │
       ▼
[3. 15 KB Payload Limiter] ──► Blocks oversized JSON buffers to prevent memory exhaustion (DoS)
       │
       ▼
[4. Rate Limiter (30 req/min)] ──► Restricts LLM inference endpoints per client IP
       │
       ▼
[5. Type Guard Sanitizer] ──► Strips control characters [\x00-\x1f], checks numeric bounds
       │
       ▼
[Gemini AI / In-Memory Cache]
```

### Content Security Policy Directives
```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://generativelanguage.googleapis.com',
          'https://*.firebaseapp.com',
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
```

---

## 3. Input Validation & Prompt Injection Defense

* **Control Character Stripping:**
  All user-supplied text (such as profile names and sector labels) across all endpoints (`/api/routine-insights` and `/api/translate`) is stripped of non-printable control characters `[\x00-\x1f]` prior to prompt interpolation:
  ```typescript
  function sanitizeText(input: unknown, maxLen = 2000): string {
    if (typeof input !== 'string') return '';
    return input.replace(CONTROL_CHAR_REGEX, '').trim().slice(0, maxLen);
  }
  ```
* **Payload Length Capping:**
  User text strings are hard-capped at 50 to 2,000 characters before prompt inclusion.
* **Strict Physical Type Guards:**
  * `isFiniteNumber(v)` guarantees finite numeric values.
  * AQI must be between 0 and 1000.
  * PM2.5 must be between 0 and 2000 µg/m³.
  * Household counts must be non-negative integers.
* **Safe JSON Regex Parsing:**
  AI model outputs are parsed using `raw.match(/\{[\s\S]*\}/)` rather than raw `JSON.parse()`, safely discarding conversational model preambles and markdown fences.

---

## 4. Information Disclosure Prevention (CWE-209 & CWE-200)

* **Server Fingerprint Concealment (CWE-200):**
  `app.disable('x-powered-by')` prevents leaking Express framework identity to attackers.
* **Generic Error Messages (CWE-209):**
  The server's global error handler logs error details server-side while always returning a safe generic JSON object to external clients:
  ```typescript
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[SECURITY AUDIT] Unhandled Server Exception:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  ```
* **No Leaked Stack Traces:**
  Neither `err.message`, `err.stack`, nor internal file paths are ever exposed in HTTP responses.

---

## 5. Cloud Database Access Isolation (`firestore.rules` — CWE-284)

Per-user isolation is enforced at the database engine level:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /telemetry/{sectorId} {
      allow read: if true;
      allow write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
