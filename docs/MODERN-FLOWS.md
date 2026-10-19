# Modern interaction pass — journeys and acceptance

This is an extension of the two-screen personal notebook, not a new navigation model. Planning, workout logging, corrections and history remain reachable from Home and Workout. Dialogs are temporary tasks with an explicit Cancel or Close action. All actuals remain local and mutations reuse the existing revision-checked IndexedDB write queue. This document records intended acceptance; browser evidence is recorded after execution.

## Adjust the plan before starting

The user reviews an exercise list and recognizes an unwanted movement. Each preview row offers Customize, Swap and Remove. Remove immediately takes an unstarted exercise out of the preview and provides Undo; no persisted workout is affected. Removing the final preview exercise shows an empty state and Add exercise, with Start disabled. Add exercise opens a searchable catalog with named muscle filters, so the user can deliberately add a variation even when a primary target is already represented. Closing the picker does not change the plan. An added movement uses editable planning defaults and contains no logged sets.

Acceptance: remove first/middle/final preview movement, restore its original identity and position with Undo, add a selected catalog movement without losing other customizations, reject an empty Start, and start a valid plan with the displayed order.

## Adapt during a real session

The user reaches a busy machine or remembers another exercise. Swap remains adjacent to the current exercise title and preserves the existing same-target behavior. Add exercise is a distinct action in the workout list; its catalog supports all muscle groups and text search. A selection is added only after an explicit tap, its transaction must complete before the picker reports success, and the new exercise becomes active. Other exercises' typed weight/reps and logged sets stay with their original identities. Existing movements are marked In workout and cannot be accidentally duplicated.

An exercise's contextual actions expose Remove exercise. A confirmation names the exercise, the count of recorded sets and any unlogged input, making the effect explicit. Cancel preserves everything. Confirm removes that occurrence and its actuals from this session; Undo restores the full occurrence, original position, set IDs, effort estimates and typed draft. If it was the last occurrence, confirmation also explains that the now-empty session closes. Undo restores that session unless another session has since started; in that case the user gets a clear conflict message rather than a replacement.

Acceptance: add while another exercise has typed input, reload and verify both; remove an unlogged movement; remove a logged movement only through confirmation; Undo after intervening logging preserves both the restored occurrence and later actuals; remove/restore the final exercise safely; no claim of save before IndexedDB transaction completion; failed mutation remains recoverable through Retry save.

The user may also abandon an accidental session without saving it to history. Workout options contains Discard current workout. Its confirmation counts the actual sets, exercises and typed entries that will be removed. Keep workout cancels without any change. Discard commits the removal, returns Home and offers Undo to restore that exact session. The Finish confirmation's empty-draft discard follows the same durable, reversible path. Starting another session creates an explicit undo conflict instead of overwriting the new work.

## Correct and remove saved history

The user opens Training history from Home, recognizes an accidentally saved session and chooses its dated Delete workout control. A confirmation shows the date and recorded set count and explains that the session will no longer contribute to progress. Cancel keeps it. Confirm removes exactly that ID after the transaction commits, and a visible Undo restores its original records without changing current workout data. Undo remains available while the session stays open rather than disappearing after a few seconds. A history set can also be deleted from its correction controls and restored with the same stable identity.

Acceptance: cancel and confirm history removal; verify progress responds to the saved history; Undo returns the identical workout; deleting one history set preserves sibling sets; Undo restores it in order; a failure shows error and Retry rather than success; Escape/Close returns focus to the initiating control where it still exists.

## Interaction states

- Picker: initial suggestions, muscle filter, query, no matches, already present, adding, save failure, success and explicit close.
- Exercise removal: preview immediate removal, active confirmation, recorded-data warning, typed-input warning, last-exercise warning, pending commit, failure and Undo.
- History deletion: confirmation, cancel, pending commit, failure, removed/Undo, restored and undo conflict.
- Shared: keyboard focus is contained by native modal dialogs, controls have accessible names, mutation controls disable during pending work, and failures retain the previous visible records until their transaction is acknowledged.

## Delivery notes

The implemented handlers reuse the existing transaction queue and revision guard. Add, swap, remove, discard, start, correction and finish completion callbacks run only after acknowledged save; Retry save runs the pending completion exactly once. Retry also locks mutation controls while the pending save is in flight. Source typechecking passes. Browser acceptance is maintained in `MODERN-QA.md` and `tests/e2e/modern-flows.spec.ts`; this handoff does not claim real gym usability observation.
