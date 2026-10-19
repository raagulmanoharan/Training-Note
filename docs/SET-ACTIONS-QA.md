# Saved-set actions acceptance and evidence

## Actor journey recorded before implementation

This is a synthetic browser review, not human usability research. The actor logs actual sets between rests, checks the recorded values, corrects an earlier mistake, and removes a duplicate without losing the next set they have already typed.

The journey is: deliberately log four sets; keep a fifth-set draft; expand the earlier records; open the first set's ellipsis; cancel without a write; reopen and correct that set; cancel and save separate correction attempts; remove the selected set through its options; undo the removal; inject a write failure on a later removal; retry; reload and compare persisted identities and the untouched next draft.

Acceptance:

- The saved receipt has aligned set number, recorded tick, weight, reps and a discrete ellipsis action. The ellipsis provides **Edit set N** and **Delete set N** with the selected record identified.
- At 320 and 390 CSS px the ellipsis and its options are reachable, at least 44 px square where applicable, and do not overflow or cover recorded values. Keyboard Escape and cancellation restore useful focus.
- Opening/cancelling options does not mutate storage. Correction cancellation preserves the original set; saving changes only the entered values and retains its ID, timestamp and effort.
- Deletion removes only the selected ID. Undo restores it in its original position with the original values. Failed deletion has no saved acknowledgement or premature removal and remains recoverable by retry.
- The next set's draft survives editing, deletion, undo and reload. Older receipts remain reachable through Show all sets.
- Existing workout, persistence, effort, history, design-system and production-path assertions follow the new action route without losing their existing data assertions.

## Execution evidence

The focused scenario in `tests/e2e/focus-ui.spec.ts` passed against the local Vite server at `http://127.0.0.1:5174` with Chromium `/usr/bin/chromium` on October 19, 2026. Its first isolated run took 9.4 seconds. This is automated execution time, not human task time.

It deliberately logged four distinct actual sets and entered a fifth draft of 30 kg × 6. The oldest set was reached through Show all 4 sets. At 320 and 390 CSS px, the test verified recorded values, a single ellipsis control per receipt, a recorded-tick accessible label, and set-number/tick/actuals/ellipsis center alignment within 1 px. The ellipsis and both menu actions passed minimum 44 px size and center-point hit-testing checks. The options also passed no-horizontal-overflow and reachable-action checks with controlled 200% text enlargement.

Escape and Close dialog returned focus to the selected receipt's ellipsis and left the entire stored workout unchanged. Cancelling a correction also preserved storage and restored focus. Saving changed only the first set's weight from 20 to 21 kg while retaining all other workout data. Direct menu deletion removed only that selected set; Undo restored the exact original set position, ID and values. An injected IndexedDB write failure then left the selected receipt and stored workout intact, displayed Not saved, disabled the pending Delete action, and kept Retry save reachable inside the menu. Restoring IndexedDB writes and retrying committed the one intended removal. Reload retained the exact resulting workout and the untouched 30 kg × 6 draft.

## Visual review

Actual screenshots were inspected for both narrow widths, the enlarged options sheet, and the failed-delete state. Saved rows show a small tick beside their set number, aligned weight and reps columns, and an ellipsis at the row edge. Options identify the selected exercise and recorded values above separate Edit set and Delete set actions. Enlarged text wraps the sheet title and values; vertical scrolling remains available.

Repository evidence copied from the browser run:

- [320 px saved receipts](design/set-actions/receipts-320.png), [390 px saved receipts](design/set-actions/receipts-390.png)
- [320 px options](design/set-actions/options-320.png), [390 px options](design/set-actions/options-390.png)
- [320 px options with doubled text](design/set-actions/options-320-text-2.png), [390 px options with doubled text](design/set-actions/options-390-text-2.png)
- [Failed deletion with retry](design/set-actions/delete-failed.png)

The test writes its source captures to `artifacts/set-actions/`; the review copies above are under `docs/design/set-actions/` so they are included in the repository.

Full-page dialog captures include page content outside the viewport; reachability assertions use the actual viewport and hit testing. The text-enlargement method snapshots computed font sizes and line heights before doubling them, avoiding compounded inheritance. It is a controlled stress check, not proof of OS text scaling or physical-phone keyboard behavior.

## Regression evidence and limits

The saved-row and history correction routes were migrated in the existing workout, effort, persistence, design-system and Pages specs. Their existing data equality, stable identity, cancellation, undo, retry, import and revision assertions were retained.

After the implementation freeze, `COACHLINE_URL=http://127.0.0.1:5174 npm test -- --reporter=list` completed with **53 passed and 1 skipped in 2.6 minutes**, with no failures or retries. All five focused scenarios passed in that same run; the new saved-set scenario took 8.7 seconds. Current-workout correction/deletion/undo, historical correction/direct deletion/undo, effort retention, complete workout/return journeys, storage failures, backup validation and revision protection all passed. The one skipped local-development test requires the production service worker; public Pages/offline verification is a separate release check.

No human or physical-device study was performed. Actual one-hand speed, touch comfort, mobile-keyboard occlusion and browser storage eviction remain unmeasured.

## Published verification

Release `2523586a3892263f81236063b11bdf8cdd18cdee` deployed successfully in Pages run 39271580133. The public project-path/offline test passed in 3.1 seconds. A separate isolated browser verified the exact set context, Edit, Delete, Undo and persisted edited values after reload with no page errors. Live screenshots and JSON are in `design/set-actions/live-*`; no user database was accessed.
