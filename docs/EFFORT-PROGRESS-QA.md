# Optional effort and muscle-group performance verification

Status: functional verification passed after reading the complete EFFORT-PROGRESS-PM.md handoff before test implementation. Browser checks and synthetic fixture comparisons will establish implementation behavior, not validate real muscle growth, RPE estimation accuracy, real-device comfort or human usability.

## Required checks

- Log actual weight/reps without answering effort; explicitly add, change and remove estimated good-form reps left on the same saved set. Reload must retain committed values and stable identities.
- Editing actual weight/reps, delete/undo, finishing and historical display must preserve optional effort. Backup checksum covers it; old records lacking the field remain valid. Invalid negative, fractional or out-of-range fields reject import atomically.
- Inject a write failure while changing effort. Show Not saved, retain prior committed actual and proposed edit, retry successfully exactly once without duplicate set identity or altered actual values.
- Compare ordered actual sets only for the same exercise, known gym/equipment, units, prescription and complete set count. Clear reps/load increases qualify; mixed changes, assisted loads, mismatches, latest partial results and unknown setup cannot produce green improvement.
- Known harder effort qualifies the headline; unknown effort stays unknown. Group counts describe compared exercises and disclose actual prior/latest records, never estimated muscle growth.
- Effort controls wrap within 320 px with 44 px targets, optional discovery does not interrupt logging, existing 17-check baseline remains intact, and production Pages/offline smoke remains valid.

## Evidence

On 2026-10-17, `COACHLINE_URL=http://127.0.0.1:5180 npx playwright test personal.spec.ts effort.spec.ts pages.spec.ts` passed **22 checks**, with **one intentional skip** (27.7 seconds). The skip is the root-preview-only offline test; the Pages production project-path check independently installed the worker, reloaded offline, recovered actuals and logged another actual without API traffic.

The five new effort checks cover ordered performance and effort qualification, valid backup roundtrip and checksummed malformed-import rejection, optional add/change/remove plus correction/delete/undo persistence, injected quota failure preserving prior committed effort and proposed selection until one retry, and historical effort editing plus traceable muscle-card evidence. The comparison fixture explicitly checks one improved movement plus one lower movement remains **1 of 2** comparisons, known-harder effort does not count as improved, assisted movement is reviewed, and latest partial sessions cannot be skipped to claim an increase. Existing 17 baseline tests remained intact.

The tested combined run used production cache `f1e43bbd290e737e` for the Pages check. After the CSS-only expanded-evidence width adjustment, the final build cache `e322817d4174e506` passed **two targeted checks** (3.3 seconds): historical effort/evidence with refreshed screenshots and production Pages/offline logging. No further functional changes required repeating the full suite.

Captures: `tests/artifacts/effort-picker-320.png`, `muscle-performance-390.png`, `muscle-evidence-390.png`. UX inspected these and confirmed wrapped optional effort controls fit 320 px. The initial expanded evidence column was narrow; UX widened expanded cards while retaining compact collapsed cards. Numeric weight/reps rows remain unchanged.

Limitations: this is Chromium fixture/browser verification and expert visual review. It does not establish RPE accuracy, hypertrophy, real-person comprehension, physical thumb comfort or actual iOS/Android keyboard/home-screen behavior. Independently retained external backups remain necessary for browser-local data.
