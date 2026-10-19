# Focused workout UI acceptance and evidence

## Actor journey recorded before implementation

This is an independent synthetic usability review, not human usability research. The assumed actor is an intermediate lifter with one hand free in the gym. They know six Back + Biceps exercises, need to enter actual work between sets, sometimes mistype a load, encounter occupied equipment, and leave before completing every target. They return the following week and need their own ordered records rather than auto-filled actuals.

The journey is: open Home; choose Back and Biceps; pick Barbell deadlift, Lat pulldown, Seated cable row, Dumbbell curl, Preacher curl and Hammer curl in order; review and adjust a target; start; type and correct a load; deliberately log and repeat; open exercise options to replace occupied equipment; add and remove an exercise with cancellation and undo; finish a partial workout; return and repeat the plan with blank actuals and trustworthy prior sets.

Acceptance:

- Home has one clear start/resume action. Planning and review have reachable primary actions and readable exercise/equipment labels.
- Active logging keeps the exercise title, target context, weight, reps and Log set legible and distinct. Supporting actions have explicit, discoverable overflow triggers and descriptive options.
- Exercise edit, swap, remove, effort, session add/discard, clock visibility, and historical correction remain reachable through their intended routes. Escape/cancel returns useful focus.
- Editing targets is explicit: cancel preserves data; save persists one change; invalid fields and failed writes keep entered values and offer recovery.
- Actual logging never creates prescribed sets. Correction retains a set ID; swap preserves original actual attribution; removal/finish preserve confirmed data; undo restores identities.
- At 320 and 390 CSS px, long exercise/setup text wraps without clipping, horizontal scrolling, or covered controls. Enlarged text remains operable through vertical scrolling. Numeric entry declares appropriate input modes; desktop Chromium cannot prove a real mobile keyboard's behavior.
- Every evidence claim names the executed check. Synthetic browser inspection does not establish delight, actual one-hand speed, real-device keyboard behavior, browser eviction resistance or universal accessibility.

## Baseline browser observations

Local Vite app, Chromium `/usr/bin/chromium`, October 19, 2026, fresh isolated Playwright context at 390 × 844 and 320 × 640. Screenshots are in `artifacts/focus-qa/baseline-{home,planner,review,active,active-320}.png`.

- Picker labels visually join name and equipment: “Assisted pull-upMachine” and “Seated cable rowCable”. The inner scroll area makes catalog depth less obvious.
- Active exercise puts a standalone Swap button, setup disclosure, per-row ellipses, bottom Add exercise, and bottom Workout options in the same page. Six exercises produce a 1220 px page at 390 × 844.
- The initial Log set button is reachable at roughly y=381–437 in that viewport. Baseline entry itself is legible; the issue is supporting-control hierarchy.
- Manual Build my workout sits near y=776 at the bottom of the viewport. The selected count sits above it and can leave view while choosing catalog rows.
- Empty Home is clear but visually sparse. This is a design assessment rather than a measured user preference.

## Revised implementation evidence

The revised app was exercised in fresh Chromium contexts against the local Vite server. Four focused scenarios pass, with the receipt scenario rerun after adding the required explicit **Add set** step to its test. The first three final scenarios took 13.6 s, 9.3 s, and 3.1 s; the receipt/correction scenario passed in 6.3 s. These are automated execution durations, not human task times.

### What was verified

1. The six-exercise Back + Biceps journey: selection order; preview edit cancellation and save; no actuals on start; decimal/numeric input modes; a 600 → 60 kg typo correction retaining the set ID; one Lat pulldown set retained under its original identity when Assisted pull-up is added with two remaining targets; session-menu Add; remove cancellation/confirmation/undo; reload equality; partial finish with exactly two actuals; next-week repetition with empty actual fields and the original prior record.
2. Long imported exercise/setup names at 320 and 390 CSS px, both normal and 200% text. Text enlargement snapshots computed font sizes and line heights before doubling them, so inheritance does not compound. Checks cover title wrapping, no document/dialog horizontal overflow, ≥44 px action targets, actual center-point hit testing, full numeric-value fit, menu access, and Escape focus restoration. Vertical scrolling is expected for enlarged content.
3. Target editing with invalid working-set count, cancellation, explicit save, an injected IndexedDB write failure, retained editor input, retry, and exact persisted actual-set identity after reload.
4. Four deliberately recorded sets: completing the three-set target requires explicitly tapping Add set for the fourth; the latest two receipts display as complete rows; Show all 4 sets exposes the older rows; Show fewer sets collapses them. Correcting the oldest receipt preserves its ID. Attempts to switch exercises or open workout options while a correction is typed retain and focus the correction with an explanation. Cancel preserves storage; Save changes persists exactly that correction; reload retains all four records.

### Defects found by this review and corrected

- After adding an exercise through Workout options, its title and overflow button remained behind the sticky session card. A DOM visibility check passed; actual center-point hit testing caught the covered control. The new active exercise now returns to a safe scroll position, and the complete journey passes.
- At 320 px and doubled text, 22.5 kg was clipped inside a two-column numeric input. Fields now wrap using a text-relative minimum width and grow vertically; measurement verifies the full value fits.
- Manual-picker names and equipment ran together. Equipment now occupies its own line with spacing; the selected six-exercise screenshot was visually rechecked.
- The previous nested receipt scroller could show a partial row. The revised latest-two / Show all sets control was verified through the actual older-set correction route.

### Visual inspection and artifacts

Reviewed actual screenshots for empty Home, planning with six selections, review, active logging, exercise options, edit, swap, add, remove, failed save, partial finish, populated Home, next-week return, and long-name / doubled-text states. The revised interface has a clear visual hierarchy: dark background, bright primary action, readable active title, explicit Target metadata, subdued supporting actions, and descriptive overflow sheets. This is an independent design assessment, not evidence that real users find it delightful.

Representative files under `artifacts/focus-qa/`:

- `revised-home.png`, `revised-planner-six-selected.png`, `revised-review.png`, `revised-active.png`
- `revised-exercise-options.png`, `revised-edit-exercise.png`, `revised-swap.png`, `revised-add-exercise.png`, `revised-remove-exercise.png`
- `revised-edit-save-failed.png`, `revised-partial-finish.png`, `revised-populated-home.png`, `revised-return-next-week.png`
- `revised-long-active-320-text-2.png`, `revised-long-options-320-text-2.png` (and equivalent 390 px / normal-text images)
- `revised-recent-receipts-320.png`, `revised-all-receipts-320.png`, `revised-correction-navigation-guard.png`

Full-page screenshots can place sticky UI at the scroll position where capture occurred; assertions use the actual viewport and hit testing. The 200% text method is a controlled stress test, not proof of browser zoom or OS text-size behavior on every phone.

### Regression scope and remaining limits

Existing behavioral tests were migrated to the intended exercise/history/workout overflow dialogs. Their data equality, stable identity, cancellation, undo, failed-write retry, backup/import rejection, and revision-protection assertions were retained. The final existing regression run produced 46 passes, one offline-only skip, and two outdated test expectations; both expectations were corrected and their targeted rechecks passed. Aggregate existing coverage is therefore 48 passed and one skipped. Combined with the four focused scenarios, 52 executable scenarios passed across these runs, with one production-only offline scenario skipped. This is an aggregate across the final run and focused rechecks, not a claim of a single uninterrupted 52-test run. The default local-development suite skips its production-service-worker-only offline case; that requires the Pages/production run.

No real human study or physical phone was used. Actual one-hand comfort, mobile virtual-keyboard occlusion, platform installation, browser eviction, and real-device storage reliability remain unmeasured. Zero friction on every device is not claimed.

The final bounded Home polish (heading wording, notice wrapping and attendance spacing) is owned by the coordinator, who is also updating the two Home-title expectations and running the full-workout spec again. These copy/layout refinements do not change the tested persistence or workout action routes.

### Final integration recheck

Root applied the last visual-only fixes: notice titles use their own line, visit counts have space before their label, first-use Home says “Your next workout.”, and the installed-app status-bar configuration follows the dark theme. Then `full-workout.spec.ts` and all four `focus-ui.spec.ts` scenarios passed together: **7 passed in35.7s**. The final production build passed. The layout capture script passed again: at320×740, sixth-set Log occupies y596–652 and Next y673–721; at390×844, Log occupies y600–656 and Next y672–720. Local fonts loaded; no external requests or JavaScript errors; all five recorded sets survived reload. Final screenshots were visually inspected, including complete recent receipts, notice layout and stacked enlarged-text numeric fields.

A final notice-only adjustment gives dismiss buttons a dedicated44px target at the upper right instead of placing × inline in the text. The six-exercise through finish/return scenario passed again in11.8s; the production build passed. No application behavior changed after this recheck.

### Published release verification

Release85443bb deployed successfully in Pages run39261992402. The live offline/assets/actuals test passed in2.5s. A second public-browser walkthrough verified the exact six-exercise Back+Biceps order, the new exercise menu, an explicit target edit and a recorded60kg×8 set after reload. Both used isolated synthetic contexts. Evidence and final screenshot are linked in DEPLOYMENT.md.
