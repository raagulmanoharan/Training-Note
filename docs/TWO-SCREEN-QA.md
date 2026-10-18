# Two-screen redesign verification

Date: 18 October 2026. This is browser regression evidence, not human usability research. All fixture records and screenshots are synthetic.

## Coverage

- Existing storage, conflict protection, checksummed backup/import, quota failure/retry, delayed-write receipts, exact set identities, correction/undo, effort, replacement preservation, and offline assertions retained.
- Entry selectors now enter the planner from Home. Settings/backup and history/evidence open native modal dialogs rather than primary navigation destinations.
- New two-screen tests count distinct local recorded visit days within the 28-day window; duplicate same-day workouts count once; empty finished sessions and older records are excluded.
- Repeating a previous session creates new workout/exercise IDs, preserves prior actuals only as historical context, starts with no actual sets or pending values, and leaves history unchanged.
- Returning Home and resuming, plus reload, preserves pending weight/reps; finishing returns Home.
- 320px and 390px Home and Workout page overflow checks; actual rendered synthetic captures.
- Harder-effort performance changes must show a mixed-results qualifier rather than silently claiming steady performance or muscle growth.
- Workbench verifies twelve real-world phases, two destinations in the information architecture, ten retained implementation flows, and no IndexedDB calls.

## Findings addressed

Home initially labelled all comparable non-improvements as “Holding steady.” That included known harder effort and mixed/lower results. Root corrected the label to distinguish mixed results from unchanged recorded weights/reps, with visible effort qualification. QA added a regression case.

The existing backup invalid-file check now scopes its alert to the native dialog because the parent page retains the same recovery notice behind the modal. Actual corrupt-file rejection and existing-draft preservation assertions remain.

Writing captures directly into imported `docs/images` while Vite is serving triggers asset reload and can discard an unsaved preview. Capture tests now write into ignored `tests/artifacts`; deliverable copies happen only after browser work ends. This is test harness interference, not a production persistence failure. An earlier overlapping Playwright invocation also collided over shared trace files; subsequent runs are sequential.

## Evidence and limits

Results are recorded below after the final relevant runs. These checks establish browser behavior and persistence boundaries. They do not establish physical one-handed comfort, gym-environment legibility, training outcomes, or user satisfaction. No participant interviews or measured usability sessions were conducted.

## Final executed results

- Main development regression invocation: 29 passed, one intentionally skipped (production-only offline test), two then-stale cases subsequently resolved and verified below. All substantive pre-existing storage/backup/effort/actual-identity checks passed.
- Final targeted invocation: `COACHLINE_URL=http://127.0.0.1:5180 npx playwright test two-screen.spec.ts design-system.spec.ts --grep 'two screens|journeys, architecture' --reporter=line` — **4 passed in 6.7s**. Includes the updated workbench case, repeat/resume flow, narrow capture case, and harder-effort honesty. It also verifies “Use last time” fills persisted draft values while creating zero actual sets; explicit Log remains necessary. A single-exercise session has no redundant Next exercise control.
- Combined distinct development coverage: **32 unique tests passed**, plus the intentional production-only development skip. This total combines the main run with targeted reruns; it is not a claim of one uninterrupted green full-suite invocation.
- Final production project-path invocation: `npx playwright test pages.spec.ts --reporter=line` — **1 passed in 2.0s**, against `http://127.0.0.1:5178/gym-notebook/`, build cache `gym-notebook-1e0d2d1b881172a5`. Manifest/icons/scope, saved actual reload, offline reload and additional logging passed with zero API calls.
- Actual Home/Workout screenshots: `docs/images/two-screen-home.png`, `docs/images/two-screen-workout.png`. Root and QA visually inspected the 390px synthetic-fixture captures; overflow checks also ran at 320px. Screenshots are full-page browser captures, not concept renders or participant records.

Earlier intermediate failures included obsolete selectors and development asset-reload interference described above. After the final passing targeted run, screenshots were copied into deliverable paths with browser task flows stopped. Rebuilding their workbench image bundle does not alter the tested application source.

## Root final artifact verification

After narrowing workbench image imports to only the two current screens and correcting singular exercise copy, the final build passed with cache `gym-notebook-1691f45f934ff61c` (11 cached files). The production Pages-path offline check passed again in 1.9 seconds. The standalone HTML was rendered through browser setContent: 12 real-world phases, two loaded screen images, zero page errors and zero external requests. Direct file-URL navigation is blocked by this managed browser policy, so direct file opening on the user’s device was not verified. No public hosted URL has been established.
