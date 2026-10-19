# Saved-set actions

The lifter has just recorded a set. They scan aligned set number, weight and reps, then continue logging. The saved check is a quiet inline status, never stacked above the set number. A single44px ellipsis at the end of each recorded row opens that exact set's actions; the rest of the row is a receipt rather than an invisible edit target.

The menu identifies the exercise, set number and actual load/reps. Edit opens the existing correction state with Save/Cancel; the next-set draft remains unchanged. Delete removes only that selected set after the storage transaction succeeds and offers the existing Undo. A separate confirmation is unnecessary for this explicitly selected, reversible single-set action. Closing/Escape makes no changes and returns focus to the originating ellipsis. Failed deletion leaves the menu and row recoverable with Retry; no success is shown before acknowledgement.

The same saved-row molecule and action menu are used for current and historical sets. Historical corrections retain the workout/set identities and do not change a current workout. Expanded older receipts remain operable. Optional effort stays available through its existing flow. The component gallery demonstrates the actual Edit/Delete menu too.

Acceptance: columns stay aligned at320/390px and with large text; no tick/number stacking, Edit link or row-wide edit button; full numeric values; ellipsis and menu targets at least44px; correct row context; cancellation/focus; correction and deletion preserve unrelated data and draft; Undo restores exact ID/order; retry commits once; reload and offline behavior retained.

## Delivered and verified locally

The shared saved row now places a small tick beside the set number and a 44 px options button after aligned weight/reps columns. Current and historical rows open the same contextual Edit/Delete sheet. The component gallery also demonstrates the interaction. The data schema and storage engine are unchanged.

The final local browser suite passed 53 scenarios with one expected production-only skip. Focused coverage includes 320/390 px layouts, doubled text, older receipts, cancellation and focus, exact-set editing/deletion, Undo, failed-write Retry, reload, and preservation of the next-set draft. Production build and diff checks passed. See SET-ACTIONS-QA.md for executed evidence; these are automated synthetic checks, not human usability research.
