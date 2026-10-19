# Workout editing: acceptance and browser evidence

## Actor and real-world journey

The actor is an intermediate lifter using one phone in a busy gym. They have already chosen their session, arrive at unavailable equipment, add or remove a few movements, change the planned number of sets, and rest between actual logged sets. Their immediate need is to keep the session accurate without losing recorded work or navigating repeated add dialogs.

1. Open the exercise chooser from a prepared or running workout. Recognize every existing choice as checked in the same list that contains new choices. Select several movements across search/filter changes. Review the count and save once. Cancel must leave the original session unchanged.
2. Deselect an exercise accidentally or intentionally. Empty planned work can be removed through the staged selection; removing actual sets or typed input must explicitly explain what would be lost and allow the actor to return to the selection. The surviving session retains its order, actual records, draft values, and a valid active exercise.
3. Encounter a busy machine. Open Swap and immediately see searchable replacements, prioritizing the same primary target. Selecting a replacement must swap rather than silently add. Completed sets remain attributed to the exercise actually performed. An unlogged entry requires an explicit decision before discarding it.
4. Change the plan. Adjust set count, rep targets, or rest once for selected exercises. Mixed starting values must not silently overwrite unrelated fields. Actual recorded weight, reps, effort, timestamps, and identity must remain unchanged by a plan adjustment.
5. Correct several recorded sets. Select specific actual sets, apply a weight/reps correction once, and preserve all unselected records and the next unlogged entry. Cancellation or a failed save must not falsely acknowledge the correction.
6. Rest after logging. Start, extend, or end rest without blocking logging. Reloading or leaving the screen must not reset the remaining duration to the full configured rest time. Timer state is independent of the workout elapsed time.
7. Use the chooser at 320 and 390 px widths and with a reduced available height resembling browser chrome/keyboard. Search, title/close, results, and the final action remain reachable; exercise labels wrap, selected/unselected controls align, and there is no horizontal document overflow.

## Acceptance recorded before implementation verification

- Existing and newly selected exercises use the same checked row treatment, with no separate “In workout” action column.
- Search and filters do not erase selected exercises. A single acknowledged save applies additions/removals together. Cancel, Close, and Escape are nonmutating.
- Protected removal names the affected exercise and actual/draft loss; cancellation returns safely. No unintended actual transfer, duplicate catalog entries, or invalid active exercise IDs.
- Swap opens a complete searchable picker directly, offers catalog-canonical same-target alternatives, and supports browsing other eligible movements without becoming Add.
- Bulk planned settings affect exactly the selected exercises and exactly the fields supplied. Bulk actual corrections retain IDs, timestamps, effort, and pending drafts.
- Rest settings and countdown state survive reload safely. Expiry, Skip/End, extension, and ongoing logging are defined.
- Saving uses existing acknowledged IndexedDB transactions and revision checks. Failure preserves recoverable UI and original persisted records; Retry applies the intended update once.
- Every key action is visibly reachable, has an accessible name and at least a 44 px target. Native dialog focus returns to the initiating control when possible.

## Verification status

All ten new browser scenarios passed in the complete regression run. The run finished with **65 passed, 1 expected production-only skip, and 1 stale test expectation** in 3.8 minutes. The stale expectation omitted the new explicit `restSeconds: 0` saved by the single-exercise editor. Updating that exact expectation and rerunning its test passed in 3.1 seconds. **All 66 applicable distinct checks are verified; there are no unresolved test failures.** These are synthetic Chromium interactions and accessibility/layout checks, not sessions with human participants.

### Initial source audit

The prior add picker committed one item immediately and closed. Existing entries used a disabled row with an extra “In workout” label, which created a different layout from new entries. The old swap fallback opened Add, changing the meaning of the action. Same-target filtering used the persisted target string rather than the catalog's current target. There was no persisted rest field or timer model in the current schema. These are implementation observations, not assumptions about user behavior.


## New browser scenarios

| Scenario | Meaningful assertion | Focused result |
| --- | --- | --- |
| Unified exercise collection | Existing and new checked rows share the same class/opacity; filters and search retain choices; Selected view combines all four choices; Cancel writes nothing; Save changes three items in one revision; old actual/draft and active ID remain exact | Passed |
| Protected removal | Deselecting actual work and an unlogged entry names the loss; Back preserves staged selection; confirmed removal selects a valid surviving active exercise; Undo restores exact removed records | Passed |
| Searchable swap | A legacy stored target still prioritizes canonical Cable lateral raise; first replacement retains order/count; recorded-source swap confirms typed-entry discard; failed confirmed swap retains original data and Retry commits once | Passed |
| Bulk targets | Mixed planned counts start blank; fields opt in explicitly; only two selected exercises receive sets/rest changes; rep ranges, actuals, and draft remain exact; Cancel writes nothing | Passed |
| Bulk actuals | Selected sets 1 and 3 change weight only; set 2 stays exact; IDs, timestamps, effort values and pending entry survive; failed write exposes Retry and applies once | Passed |
| Rest | Logging starts configured 90s rest; 30s later reload retains the original deadline; +30 extends it; logging remains available; Skip clears it; expiry performs no timer-tick writes; Done dismisses | Passed |
| Narrow and short picker | 320/390 px widths at 740/420 px heights retain hit-tested header/footer actions and searchable/scrollable rows without sideways document overflow | Passed |
| Selection failure | A failed combined add/remove leaves the persisted session intact, retains checked choices, disables resubmission and commits both changes once on Retry | Passed |
| Historical bulk actuals | Correcting two historical sets changes only their reps and leaves another active workout with its typed draft untouched | Passed |
| Enlarged text | Controlled 200% text at 320/390 px wraps full exercise names and title, keeps check controls and Save/Close reachable, and avoids horizontal document overflow | Passed |

### Scope of the checks

Tests use isolated browser contexts and synthetic IndexedDB records. Storage failures are deliberately injected into read/write transactions. Short viewport checks approximate reduced space from browser chrome and keyboard; they do not emulate the native iOS keyboard, Safari's browser chrome, or real assistive technology. External backup and production service-worker checks remain covered by the existing suite and separate Pages release verification.

The new test file is `tests/e2e/workout-editing.spec.ts`. Existing add/swap selectors in four regression files were migrated to the actual staged picker and direct replacement flow, while preserving their original persistence and workout-completion assertions. Package test commands include the new flow tests and the rest engineer's `rest-logic.spec.ts` checks.

## Live release checks

Release `4f3f809df4ff71cc44f2bfa74bc0ec395cf62307` deployed in successful Pages run 39276564803. The public production-path and offline test passed in 2.6 seconds. An additional isolated public-browser walkthrough verified multiple selection, canonical direct swap, four-exercise bulk targets/rest, two-record actual correction and rest/actual persistence after reload. No page errors occurred. Captures and JSON are in `design/workout-editing/live-*`.


## Executed commands and evidence

- `COACHLINE_URL=http://127.0.0.1:5174 npm test -- --reporter=list --output=/tmp/workout-editing-regression`: 65 passed, 1 expected production-only skip, 1 assertion requiring the new explicit rest-off field, 3.8 minutes.
- `COACHLINE_URL=http://127.0.0.1:5174 npx playwright test focus-ui.spec.ts --grep 'exercise target editor validates' --reporter=list --output=/tmp/workout-editing-target-compat`: corrected assertion passed, 3.1 seconds (4.1-second run).
- Focused new-flow runs and a 200% text pass preceded the complete run; all ten new flows also passed within the full regression. No retries concealed failures.

Selected actual browser captures were visually inspected and retained:

- [Existing and new selections together](design/workout-editing/qa-unified-selection.png)
- [320 × 420 px chooser with reachable controls](design/workout-editing/qa-picker-320-420.png)
- [320 px chooser at doubled text](design/workout-editing/qa-picker-320-text-2.png)
- [Bulk target and rest changes](design/workout-editing/qa-bulk-targets.png)
- [Selective actual-set correction](design/workout-editing/qa-bulk-actuals.png)
- [Configured rest in the active worksheet](design/workout-editing/qa-rest-running.png)
- [Explicit protected-removal review](design/workout-editing/qa-protected-removal.png)

The chooser's normal and enlarged-text views have consistent checkbox columns, wrapping movement names, visible titles/close actions, and a clear Save footer. The selected list shows previous and newly checked exercises together. The narrow short viewport capture includes only the actual viewport; no artificial full-page capture area is mistaken for the mobile screen.
