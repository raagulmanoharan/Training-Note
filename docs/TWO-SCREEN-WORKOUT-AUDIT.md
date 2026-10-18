# Complete workout audit and typography cleanup

18 October 2026. This is an executable browser walkthrough with synthetic records, not a physical gym session or participant study.

## Journey and acceptance before editing

The lifter arrives knowing chest/back, reviews a two-movement plan, records actual sets, corrects a typo, encounters occupied equipment, swaps while keeping original performed work, completes remaining sets, locks/reopens the browser, finishes, reviews saved history and returns to repeat the session. Core actions must remain within Home and Workout. No automatic actuals, silent discarded drafts, or database reset is acceptable.

| Moment | Surface / required state | Acceptance |
|---|---|---|
| Arrive / choose training | Home → Workout planning | Cancel/back remains possible; preview is not a performed session |
| Start | Workout with empty actuals | Explicit Start persists draft |
| Record and rest | Workout draft → saving → recorded | Weight/reps and explicit Log; durable receipt |
| Correct | Inline editor | Save, cancel, delete and Undo preserve identity |
| Equipment occupied | Inline swap | Original actuals remain; remaining target work transfers, not weight history |
| Change order / leave a movement | Exercise outline / Next | Can log another movement without completing all prescribed sets |
| Lock / navigate away | Saved session and pending draft | Reload resumes the same actuals and pending input |
| Finish normally | Finish confirmation | All logged work enters history exactly once; returns Home |
| Leave early | Finish with partial/unlogged state | Warn before dropping typed input; retain performed work |
| No work performed | Empty-session discard | Explicit discard, no visit fabricated |
| Return next week | Home repeat → Workout | Fresh IDs, no copied actuals; matching previous records available |
| Review / backup / save failure | Context panel / inline recovery | Close/Escape back; retry errors without extra primary destinations |

Two primary screens suffice. They do not eliminate interactions: planning, swap, corrections, optional effort, finish confirmation, history and settings are necessary subordinate states. The app has no arbitrary custom-exercise builder or standalone rest timer; neither is necessary to run the current curated-plan workout. Physical one-handed ease remains unvalidated.

## Typography contract

Three text roles: heading 28/34, subheading 18/24, reading/action 14/20. Accent means weight/color or tabular numerals, not another size. A 16px editable-input minimum is a functional mobile exception to avoid iOS focus zoom. Charts use shape/spacing, not tiny captions. No uppercase tracking, decorative monospaced metadata or marketing eyebrow. Body and supporting text share a size; emphasis uses weight and contrast.

Remove the motivational hero and introductory eyebrow, replace next-workout banner with a plain contextual label only where needed, use direct section names, and preserve meaningful state/data-safety explanations. Actual set counts and last-session context remain.

## Executed evidence

The full main invocation (`COACHLINE_URL=http://127.0.0.1:5181 npm test -- --reporter=line`) passed 34 tests in 47.4 seconds with one intentional development-only production-offline skip. It includes the multi-exercise complete-workout and three-role typography cases. A subsequent targeted finish-state case passed in 2.6 seconds, covering empty-session cancel/discard and explicit partial completion. Thus 35 distinct development checks passed across those runs. The production offline check is recorded below after execution.

The initial finish-state test reused a muscle selection and incorrectly toggled it off when beginning a second workout. The test helper now respects the existing selection; no product change was needed. An intermediate audit assertion about a swapped original block is described below. These are not participant studies.

Final captures are `docs/images/two-screen-home.png` and `docs/images/two-screen-workout.png`, using synthetic records. Both 320px and 390px layouts passed page-overflow checks. Home visible-text computed sizes were exactly 14, 18 and 28 px. Editable numeric controls were at least 16px.

## Finding: repeat after a split exercise

An exercise swapped after one of three sets remains in history alongside its two-set replacement. Previously repeating both original prescriptions could plan three plus two sets next time. Repeat now copies the performed blocks with their actual set counts, omits wholly unperformed blocks when any work was performed, and shows the editable preview. A partly completed session therefore repeats the performed workload rather than silently adding abandoned planned sets. Original history, IDs and prescription remain unchanged. This is a deliberate repeat meaning, not an inferred merged exercise or an assertion that machines are comparable.

The first audit assertion incorrectly expected the retained original block to be fully completed. That block intentionally remains partial; the correct session check is the six actual sets across original, replacement and second movement. The regression now also asserts the repeat schedules six, not eight.

## Finding: finishing must reveal its confirmation

The inline confirmation was rendered after the full exercise list. A top Finish action could therefore change state below the viewport; browser automation clicking Save could hide that ergonomic problem by scrolling automatically. Finish now explicitly scrolls and focuses its confirmation, and Keep logging restores focus to the Finish trigger. The full-workout test asserts visible/focused confirmation and the cancel return before saving. No new primary screen is required.

## Final production and artifact results

The final build passed with cache `gym-notebook-65f0b417c65dff57`. The production Pages-path offline test passed in 1.8 seconds: manifest/scope, reload of committed actuals, offline reload and additional logging, with zero API calls. The final narrow typography/screenshot rerun passed both cases in 2.7 seconds, including a visible settings icon. The main run plus the added finish-state test cover 35 distinct passing development checks; one intentionally skipped development-only offline case is covered by the production test. This is combined-run evidence, not a claim of one final uninterrupted 36-test run.

Updated Home and Workout captures are actual browser renders with synthetic data. The source database/schema and historical records were not migrated or reset. Physical gym use, one-handed comfort under fatigue and training outcomes remain unobserved.
