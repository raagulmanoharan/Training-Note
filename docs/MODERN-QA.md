# Modern interface and complete workout state audit

This is an automated browser evaluation with synthetic workout data in new, isolated browser contexts. It is not a physical gym usability study or evidence from real users. The user's saved browser data is never accessed or reset.

## Actor journey and acceptance before implementation

The actor is an intermediate lifter arriving with Back + Biceps in mind. They choose their own exercises, review the session, remove a mistaken item, and start. During training they type a set, leave and return, correct an actual, delete and restore a set, swap when equipment is occupied, and add or remove an exercise as their session changes. They finish deliberately, inspect history, correct a past record, and remove an accidental workout with an opportunity to restore it.

Required behavior:

- No suggested, typed, or repeated values count as actual work until explicitly logged.
- Changing the remaining workout never silently moves logged work to a different exercise.
- Draft weight and reps survive reload; cancelled edits keep saved actuals unchanged.
- Deleting a recorded set and undoing restores the same set identity, original position, and effort.
- Removing an exercise clearly states whether recorded sets are affected; cancelling preserves the exact workout.
- Removing the last exercise leaves a usable continuation or explicit finish/discard path.
- A finished workout can be deleted deliberately and restored without losing any records.
- Confirmation surfaces receive keyboard focus; cancellation returns focus to a meaningful control.
- The home, planning, active workout, edit, swap, removal, history, and finish states fit 320 px and 390 px mobile widths.
- Biceps suggestions exclude triceps; switching exercise selection does not silently claim progress.

## Evidence

Final focused run: **8 passed in 34.9 seconds** against the local app in isolated Chromium contexts.

Command:

```sh
npx playwright test modern-flows.spec.ts --output=/tmp/modern-qa-final --reporter=list
```

Covered journeys:

1. Remove a preview exercise, undo it in the original order, start, type a draft, reload, log, cancel a correction, save a correction, delete the set, and restore the identical set.
2. Add Hammer curl during the session while another exercise has a draft; prevent duplicate exercises; confirm removal of actuals and typed values; cancel, remove, undo, and reload with the original records intact.
3. Remove the last exercise, return to a usable Home, and restore the exact session through Undo.
4. Swap after logging a set while retaining that set under its original exercise; cancel and confirm disposal of a replacement exercise's unlogged draft.
5. Finish deliberately with focus restoration after cancellation, correct a historical set, delete and restore it, cancel deletion of a whole workout, delete it, undo, and reload the exact history record.
6. Simulate IndexedDB write failure during exercise removal. The persisted workout remains untouched, confirmation stays open, destructive retry stays disabled, Retry save commits once, and Undo restores all original exercises.
7. Remove the final preview item, keep Start disabled, recover through Add exercise, handle no search results, clear filters, restore focus after keyboard dismissal, and verify the Biceps filter excludes triceps pushdowns.
8. Discard a complete current session containing one actual and typed next-set values; first cancel with exact preservation, then confirm, undo, and reload the exact original session.

The final run also verifies that starting from the bottom of a preview resets scroll to the top and closes an open preview menu. Editing a current set focuses its weight field; saving and cancelling return focus to the saved row.

All relevant state surfaces above were checked for horizontal overflow at **320 × 844** and **390 × 844**, including native dialogs. Finish and destructive confirmations receive focus; cancellation and picker dismissal restore meaningful focus. A separate accessibility-tree check confirmed the active exercise control exposes its exercise name.

The native Chromium search field consumes the first Escape to clear its query. The keyboard test then moves to the filter control and uses Escape to close the dialog; this is expected browser behavior.

No functional defect remained in this focused run. Initial test corrections aligned with the native searchbox role and a menu which intentionally stays open after cancelling removal. One transient failure occurred during an overlapping Vite hot reload; its unchanged journey passed once the source was stable.

## Scope and remaining validation

The focused checks establish functional state continuity and narrow-width layout; they do not establish physical one-handed comfort, sweaty-finger accuracy, VoiceOver behavior, or iPhone software-keyboard placement. Existing comprehensive persistence, import, revision conflict, effort, and production offline suites remain required release regression coverage. Root agent owns that consolidated run and live Pages verification.

Undo is an explicit in-memory recovery opportunity while the app stays open. This audit does not claim that a deleted item can be restored after closing or reloading without a backup.

## Legacy navigation regression update

The history comparison evidence is now inside the intentional **Lift comparisons** disclosure. Updated the two existing evidence journeys in `effort.spec.ts` and `two-screen.spec.ts` to open it before inspecting the same evidence; no assertions were removed or relaxed. Both files passed together: **8 passed in 19.4 seconds**, using `/tmp/modern-qa-legacy-navigation` for output.

Existing legacy Swap tests act on the active exercise, where Swap remains visible, so they did not require preview-menu changes.

Root consolidated release run: **48 passed, 1 intentional production-only skip** in2.0minutes. It includes the8new journeys, the unchanged persistence/backup/effort regression coverage and a new last-history-set reachability assertion. One earlier rerun was interrupted by a development hot reload; the unchanged scenario passed in the final frozen-source run. Shared visual capture confirms Log and Next stay in view at320×740 after5recordedsets. Final footer layout adjustment gives Add exercise a full-width row; no data behavior changed.

Live release verification passed on the public Training-Note origin: Pages project-path/offline browser test1passed in2.9seconds, plus isolated Add/remove/Undo and logged-set reload walkthrough. Successful deployment run39258128485 published release24b3df2.
