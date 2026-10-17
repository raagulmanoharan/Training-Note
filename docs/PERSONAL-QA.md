# Personal notebook QA

## Scope and pickup

QA accepted PERS01–05 from PERSONAL-STORIES.md before implementation acceptance. The personal pivot replaces trainer-account acceptance; historical coaching tests remain historical evidence. Every test uses an isolated synthetic browser profile. No personal records were used.

## Executed evidence — 17 October 2026

Six storage/logic checks ran in Chromium against Vite localhost:5175 so the browser imports the actual TypeScript modules:

1. Actual IndexedDB state survives closing the page and reopening another tab in the same profile.
2. A stale revision cannot overwrite a newer tab's saved settings.
3. Tampering with a backup's logged load fails checksum verification; existing actual remains unchanged.
4. Chest/Back generation has distinct primary targets; three shoulder targets are distinct; impossible counts are rejected. Same-target substitutes remain separate catalog movements. Three sets at 40 kg × 12 qualify for a 42.5 kg consideration; 12/12/10 holds; incomplete count requests review; different equipment/units suppress comparison.
5. A complete verified export restores finished history, an unfinished draft with typed inputs, lb settings and gym/progression preferences after deletion of the **synthetic test database**.
6. Assisted pull-up loads never get a misleading increase hint; changed rep ranges require review; malformed falsy/current-array schema data is rejected.

Six browser UI journeys ran against the final production build (plus the offline journey below):

1. Chest/Back plan → start → explicit weight/reps Log set → exact Repeat → edit → delete/Undo → unavailable-machine swap after actuals → separately attributed replacement sets → Finish → Progress → reload. Original and substitute histories remain separate. Replacement has no borrowed previous values and receives only the remaining planned set count. Correcting a finished history set retains workout, exercise and set IDs.
2. At 320 px, typed weight/reps survive reload; finishing warns about unlogged input, Keep logging preserves it, and document width has no horizontal overflow.
3. Injected IndexedDB readwrite quota failure withholds the new receipt and shows Not saved. Retrying after removing the fault saves exactly one receipt.
4. A backup downloaded using the UI can be selected using the native file input and produces a validated summary. Malformed version is rejected without losing the existing draft's logged set.

5. Delaying an earlier typing transaction acknowledgement by 400 ms and failing the next set transaction does not reveal the uncommitted set. Retry yields exactly one receipt.
6. UI-created history of 40 kg × 10/10/8 followed by 10/10/10 shows “+2 reps at the same loads”; it never creates a fourth set or auto-fills a heavier load.

One additional browser journey ran against the **production build** at localhost:5176 with `PERSONAL_OFFLINE=1`: after service-worker control, offline reload restores a saved receipt and pending input; an additional set logs while offline. No `/api/` requests occur. The production manifest declares standalone display and both listed PNG icons returned successful responses. This does not depend on the development server's module cache.

Commands:

```sh
COACHLINE_URL=http://localhost:5175 npx playwright test personal.spec.ts
PERSONAL_OFFLINE=1 COACHLINE_URL=http://localhost:5176 npx playwright test personal.spec.ts --grep 'personal UI'
```

The first command intentionally skips the production-only offline check. Module checks require Vite and are not applicable to bundled production assets. Production UI checks use the second command. Final evidence: **13 distinct checks passed: six browser-executed storage/logic checks, six production UI checks and one production offline/manifest check.** The production six-test UI run passed in 8.1 seconds, then the additional all-set comparison journey passed in 2.7 seconds. The six module checks passed in 5.1 seconds. Two early UI assertions were corrected because dismiss controls and collapsed history introduced extra text matches; those were test-selector errors, not data failures. Root build evidence is recorded in the sprint/standup.

The 390 px first-record screen asserts the bottom of Log set is above 650 px. Screenshots: `tests/artifacts/personal-first-set-390.png`, `tests/artifacts/personal-notebook-390.png` and `tests/artifacts/personal-notebook-320.png` are synthetic mobile logger captures.

## Limits and remaining human checks

Synthetic acceptance cannot demonstrate months of browser retention, real iOS/Android installation/keyboard behavior, recovery after intentional site-data clearing without a separately retained backup, or device loss. IndexedDB and persistence requests reduce avoidable loss but do not replace external backups. Installed-app origins/profiles must be tested on the user's actual phone. Clarity, one-hand comfort, and exercise-selection usefulness remain hypotheses until observed with the user; no invented usability sessions or task timings are claimed.
