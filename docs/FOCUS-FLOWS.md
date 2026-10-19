# Focused workout interactions

## Actor journey before implementation

The lifter arrives knowing the intended session, chooses muscles or individual movements, checks the suggested list, then starts. Each movement has a persistent name and one clearly named options button. The review shows its set and rep target; changing a target, swapping equipment or removing the movement opens one contextual sheet, never an accumulating stack of inline controls. Add exercise stays available in the session menu and on the empty plan.

Between sets the lifter sees the current movement, compact target and previous actuals, saved set receipts, weight/reps entry, and one prominent Log action. A receipt opens correction directly. The next unlogged draft survives an edit. Next exercise remains visible. Extra actions live behind the current movement's More options button: swap, edit targets/setup, optional effort, and removal. Closing an options sheet returns focus to its originating control.

If a machine is occupied the lifter opens movement options, chooses Swap, and picks an equivalent target. Existing actuals remain under their original movement. Typed unsaved input requires an explicit choice before a swap. Empty swap results offer Browse all exercises; those additions are clearly additions and never overwrite original actuals.

Editing targets/setup uses local form drafts and explicit Save/Cancel. Cancelling or dismissing does not write a partial setup. Invalid fields remain visible with an actionable error. Saving waits for local storage acknowledgement. If storage fails, recovery stays in the sheet and Retry remains reachable.

Removing a movement identifies the movement, recorded set count and unlogged input before confirmation. Removing the last movement explains that the current session closes. Destructive controls are separated from ordinary actions. Undo keeps the original identity and actuals. Discarding a complete session has its own confirmation and Undo.

The persistent session card exposes elapsed time, a strong Finish control and workout options. Session options contain Add exercise and Discard current workout. The screen never requires finding a bottom-of-page danger control. Finish still verifies unlogged entries and records only explicit actuals.

## Acceptance

- One contextual native dialog is open for each action path; Escape and explicit close restore useful focus.
- Exercise names and action labels wrap fully, with no ellipsis, horizontal overflow or unlabeled icon-only hit targets.
- Active exercise has one options control; Swap/setup/removal do not duplicate inline.
- Saved-set edits remain directly reachable and preserve the next-set draft.
- Setup edits are validated together and Save commits atomically; Cancel leaves stored data unchanged.
- Planning, adding, swapping, empty results, busy save, recovery, confirmation and Undo remain usable at 320px width.
- Existing storage model, revision guards, actual identities and backup compatibility remain unchanged.
- Browser checks are synthetic automation, not a claim of real-person usability research.

## Delivered interaction details

- Native action sheet used for preview and current exercise options, swap, edit settings, optional effort and remove confirmations. Parent More button is retained as the focus return target across child panels.
- Set targets and equipment edits now use `ExerciseSettings`: local draft, combined validation, explicit Save/Cancel and the existing transaction/retry mechanism.
- Session More groups Add and Discard. A quiet Add exercise row remains at the bottom of the session list for direct discovery.
- Finish uses a native modal instead of scrolling to a panel below the exercise list. Escape and Keep logging restore the Finish button. It warns about unlogged values and unsaved set corrections.
- Changing exercise or opening a workout action during a set correction keeps and focuses the editor with a clear Save/Cancel instruction. Next-set draft remains separate.
- History More groups Repeat and Delete; Delete still requires the existing explicit confirmation and supports Undo.

## Verification observed in this change

A fresh isolated Chromium context exercised Biceps planning, opened preview More → Edit, changed target to four sets and saved, started, logged 20 kg × 10, opened optional effort from More, closed it, opened Finish and returned with Keep logging. Stored state showed four planned sets and one actual; Finish regained keyboard focus and no page errors were observed. TypeScript/Vite/PWA production build passed. Detailed regression and viewport coverage belongs to the sprint QA report.

### Final receipt and navigation refinement

The logger now presents the two most recent saved rows in full, followed by Show all N sets when older entries exist. Expanding exposes every original row; Show fewer sets collapses the list again. Expansion is remembered per exercise during the open app session. Hidden rows remain mounted, and collapse is disabled while correcting a set. The record itself is unchanged. This replaces the cropped nested ledger scrollbar.

Changing the active exercise scrolls the outer page to the top after the new card renders. This applies to adding, swapping, selecting and resuming, without scrolling on ordinary field edits or recording another set. Returning focus from a sheet no longer scrolls the active card behind the sticky session controls. Exercise metadata explicitly labels the planned values as Target.

The bounded refinement passed the production build. QA owns the subsequent browser regression verification.
