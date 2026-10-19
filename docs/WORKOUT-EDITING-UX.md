# Editing a workout while training

This journey and interaction specification was recorded before implementation of the exercise-picker, swap, rest and bulk-edit changes. It is based on the user's three screenshots and inspection of the running app's source. It is a designer's heuristic review, not evidence of observed human usability.

## The person and situation

The lifter has already decided to train shoulders, or back and biceps. They have a limited amount of time, may be holding the phone in one hand, and are often standing beside occupied equipment. They know exercise names and want to record what happened. They do not want to reconstruct a plan every time they change a machine, reopen a picker six times to choose six movements, or understand an application's distinction between an exercise chosen earlier and one selected a moment ago.

Their immediate questions are concrete: What am I doing? How many sets? What did I lift last time? Have I saved this set? Can I substitute this machine? What have I selected? They need reliable answers while tired and interrupted. Progress and stored workout identity remain valuable after today's session and after an app update.

## Observed problems

- The current Add exercise sheet immediately writes one addition and closes. Choosing several exercises requires repeated navigation.
- Previously added exercises are disabled and use an `In workout` badge. The badge consumes the text column while unselected exercises use a small plus. The columns consequently shift between otherwise equivalent rows.
- The entire sheet scrolls, including its heading and close button. Automatic search focus opens the keyboard before the user has chosen to search. The submitted screenshot shows the search region clipped and no persistent orientation or completion action.
- The current swap fallback opens Add exercise. It loses the replacement intent and can leave both movements in the workout unintentionally.
- Swap suggestion matching compares the stored target string against catalog targets. Older stored wording can fail even when the current catalog includes a suitable alternative. Lateral raise and Cable lateral raise both belong to the current catalog's side-delts target.
- Sets and rep targets share a long form with gym, equipment and weight-increment setup. The frequent adjustment is visually buried among less frequent settings.
- There is no rest-duration or rest-timer feature in the inspected implementation.
- Updating six exercises currently requires entering six individual settings forms. Correcting several actual sets also requires repeated individual corrections.

## Information and interaction structure

The app keeps its two main screens: progress/home and the workout. These changes use temporary sheets and inline controls, not additional destinations.

| Surface | Purpose | Primary action | Secondary actions |
| --- | --- | --- | --- |
| Workout exercise list | Understand the complete planned and performed session | Open an exercise | One workout overflow; one exercise overflow |
| Exercises sheet | Choose several exercises and review one combined selection | Apply selection | Search, filter, selected-only view, cancel |
| Swap sheet | Replace one movement while preserving recorded history | Tap the replacement | Search/filter alternatives; cancel |
| Exercise settings | Adjust this movement's targets | Save changes | Cancel; equipment/setup disclosure |
| Workout targets sheet | Apply intentional target changes to selected movements | Save changes to N exercises | Select/all/none; opt into fields; cancel |
| Recorded-set corrections | Fix several actual entries for one exercise | Correct N recorded sets | Select receipts; opt into weight/reps; cancel |
| Rest control | Know when the next set is due | Start or display countdown | Add 30 seconds; stop; configure duration |

Persistent logging controls remain weight, reps and Log set. New management controls should not fill that area with multiple labels. Exercise-level actions stay in the existing ellipsis. The workout overflow offers workout-wide editing. Rest gets a compact visible control because it is used between sets.

## Journey 1: choose several exercises

1. The lifter opens the exercise picker from the reviewed plan or active workout. They expect their current choices to be present.
2. The sheet opens with an accessible heading and close control visible. Focus goes to the heading, without opening the keyboard. Search is available immediately when wanted.
3. The picker initializes a staged selection from the current workout. Every selected item has the same checked appearance, regardless of when it was chosen. No `already added`, `in workout`, or separate `new` group is shown.
4. A single selected view brings the entire chosen list together. Search and muscle filters can help browse the catalog without clearing selections elsewhere. A count always describes the full selection, not only visible matches.
5. Tapping an exercise toggles its staged membership. The sheet stays open. The touch target is the whole row, with an unambiguous check control at its trailing edge.
6. Existing exercises keep their original order. Newly selected exercises append in selection order. Toggling filters or search does not reorder the workout. Current exercise identity stays stable if it is retained.
7. The lifter taps one persistent Apply/Done action. If nothing changed, Done simply closes without a redundant write. If choices changed, one save commits the change and only an acknowledged save closes the sheet.
8. Back, Escape or Close cancels the staged changes. It never partially adds the most recently touched item. The workout returns exactly as it was before opening.

When selection removes an existing exercise with logged sets or an unlogged draft, final application must explicitly explain what would be removed and allow going back. An empty active workout is not silently discarded. The existing destructive-workout flow remains responsible for that action. A storage failure leaves the staged selection and recovery action visible.

Old exercise instances are retained by stable instance ID. Catalog ID is only a discovery key and a way to prevent duplicate new additions. Existing historical/legacy records absent from the current catalog must remain represented in the selected list or be preserved explicitly. Several existing instances with the same catalog ID must never be collapsed or silently deleted by a catalog-based selection reducer.

### Picker layout

The sheet uses a bounded flex column: fixed header, search and filter controls; a single scrolling results region with `min-height: 0`; and a fixed footer inside the sheet. Bottom safe-area spacing is included in the footer. The sheet fits the dynamic viewport rather than relying on document height. Keyboard opening must leave the relevant search and an attainable completion action usable.

Each row has three stable columns: fixed muscle glyph, wrapping title and equipment text, fixed selection control. The middle column is `minmax(0, 1fr)`. Long names wrap rather than ellipsize. No extra status badge changes the grid. All interactive targets are at least 44 px. Selected rows retain readable contrast, rather than using disabled styling. Filters may scroll horizontally within their own region; the page and sheet must not overflow horizontally.

## Journey 2: a machine is occupied

1. The lifter opens the current exercise's ellipsis and chooses Swap exercise.
2. The replacement sheet names the source movement. It immediately shows alternatives for the same canonical target, with search available in the same sheet. A suitable cable lateral raise is visible for a dumbbell lateral raise.
3. The lifter taps a replacement once. There is no separate add flow and no empty intermediary screen when the catalog contains alternatives.
4. If no actual sets or draft exist, the selected exercise replaces the old entry at the same position. Planned targets, relevant rest preference and other valid plan values carry forward; equipment and catalog identity come from the replacement. No weight is automatically recorded.
5. If actual sets exist, they remain under the movement where they occurred, with original IDs, units, setup and timestamps. The replacement becomes the active exercise for the remaining work. A short success message explains that the previous sets were kept.
6. A typed but unlogged weight/reps entry is never silently lost. Before discarding it, show the values and two explicit choices: keep entry or discard entry and swap. This applies even when earlier sets have already been logged.
7. On success the sheet closes and the lifter can log immediately. Cancellation keeps the original exercise and draft unchanged. A failed save does not show a replacement that was not persisted.

The catalog target for a known catalog ID is authoritative for matching; fallback to stored group/target only for unknown legacy IDs. Recommendations retain the biceps/triceps distinction. A search can broaden the replacement choice without changing the operation into Add. Current exercise and already present catalog entries should not be silently duplicated. If no eligible result remains, state why and retain search/filter controls and a clear way to return.

## Journey 3: change sets, reps and rest for one exercise

1. The lifter opens the exercise overflow and chooses Edit exercise.
2. The first controls are working-set target, rep range and rest duration. Their current values are visible. Common values are reachable without unnecessary typing; numeric entry remains possible.
3. Equipment, gym label and weight increment remain accessible under a setup disclosure. Opening them is an intentional action because changing labels affects future comparisons.
4. Edits remain local to the form until Save. Cancel and Close leave both the plan and actual records untouched.
5. Saving updates the targeted exercise only. Lowering a target never removes previously logged sets. If the target is below the already logged count, show that all recorded sets remain.
6. The existing pending next-set weight/reps, actual IDs, timestamps, effort and load values remain unchanged.

Field errors appear next to or immediately before the save area and keep the user's input intact. Empty or invalid set counts/rep ranges cannot save. The save button reflects pending persistence. No success message appears before the transaction commits.

## Journey 4: apply the same targets across the workout

The useful bulk operation is an explicit workout-target editor. It is entered from workout options and lists all current exercises with check controls. All may initially be selected, but the selected count and names are visible. Select all/none is useful for a six-movement session.

Changes are opt-in by field: working sets, rep range, rest duration. Inactive fields mean keep each exercise's existing value. Mixed values must never be replaced merely because the form opened. A user can choose `4 sets` for six movements while leaving their different rep ranges and rest durations unchanged.

The primary action names its scope, such as `Save to 6 exercises`. It is disabled when no exercise or no change is selected. The update is one acknowledged transaction. Cancel makes no writes. A failed transaction keeps the same selected exercise IDs, chosen fields and values for Retry.

Gym, equipment, unit and actual recorded sets are outside this target operation. Targets lower than actual counts do not delete history; applicable preservation copy is visible. Pending next-set drafts survive.

## Journey 5: correct several recorded sets

Recorded-set corrections are a separate explicit action for one exercise and setup, because they change performance data rather than a future target. The heading says which exercise and that these are recorded sets. Each row shows its current weight and reps and can be selected. Select all is optional and visible.

Weight and reps are individually opt-in changes. Unselected fields are unchanged even when existing values differ. The confirmation action says `Correct N recorded sets`, with no implication that a new set is being logged. Corrections preserve each set's ID, logging timestamp and effort value, and leave the unlogged next-set draft alone. They never relabel the equipment or convert a unit. Cancel is a no-op. A save failure remains retryable without creating duplicate sets.

Deletion should retain the existing explicit single-set menu and Undo flow unless a separate bulk-delete specification is implemented with equivalent recovery. Bulk correction is not implicit permission to erase a selection.

## Journey 6: rest between sets

Rest is optional, with Off and common durations available. The duration control uses familiar time labels rather than requiring raw seconds arithmetic. A small inline rest control sits near the logging task; it does not compete with the Log or Finish action.

When rest is enabled, an acknowledged successful set log starts a countdown. Validation errors and failed storage do not start it. The user can start a rest manually, add 30 seconds, or stop it. Expiry leaves a calm ready state rather than opening a modal or moving focus. No set is automatically logged.

The remaining time is derived from a deadline, not from decrementing an in-memory number that stops when the phone sleeps. Backgrounding, opening a sheet and switching exercises do not reset time. Reload recovery should retain an active timer for the same workout. Completing/discarding the workout clears it. A changed rest target applies to subsequent sets; it should not unexpectedly reset a countdown already in progress.

Rest's local preference/recovery data must not jeopardize workout persistence. Backups retain any durable new exercise-duration values and continue to accept older records without them.

## Acceptance and evaluation

These are acceptance criteria for implementation and automated/synthetic evaluation; this document does not claim that they have passed.

- Select three additional movements in one picker visit; review all existing and new choices together; Apply once; reload with exact stable old instances and only the intended new instances.
- Cancel after toggling both an existing and a new movement; verify zero workout mutations.
- Change search and muscle filter while several selections are staged; none disappear from the full selected count or selected view.
- Check 320 px, 390 px, short mobile viewports, expanded text and keyboard use. Header/close and footer remain attainable; names wrap; row columns align; no horizontal page overflow.
- Swap lateral raise to cable lateral raise from a stored record with older target wording. Verify position and target carryover, replacement setup and unchanged recorded history.
- Swap after logging one set and typing the next one. Verify the draft guard and both keep/discard outcomes.
- Simulate no compatible alternative and broaden search without leaving replacement mode. Verify biceps does not silently receive a triceps suggestion.
- Bulk-change only working-set targets for a subset, then only rest duration for all. Verify unchanged rep ranges, actual data, pending drafts and unselected exercises.
- Correct selected recorded sets in one exercise. Verify exact identity, timestamps, effort and unrelated receipts before/after; Cancel writes nothing.
- Start rest after a successful log, background/reload, add time, stop, finish the workout. Test failed log does not start rest.
- Inject a save failure into each mutation path. The UI must not announce success, lose draft selections or apply the same change twice after Retry.
- Re-run existing backup, revision-conflict, actual-set editing/Undo and full-workout tests. Confirm the deployed project subpath and offline shell still work.

Delivery evidence belongs in the sprint/QA records after checks actually run. The screenshots in the user report provide problem evidence; they do not substitute for mobile-browser verification of the change.

## Independent rendered review — 2026-10-19

A separate UX agent exercised the integrated app in isolated Chromium mobile contexts at 390 × 844, 320 × 740 and 320 × 420. The fixture contained Lateral raise, Reverse fly and Overhead press; Lateral raise deliberately had an older stored target name. The reviewer inspected the captured images as well as viewport measurements. This was a synthetic browser walkthrough, not a human participant study or a physical iPhone keyboard test.

The picker now opens with the heading focused rather than the search field. Existing shoulder exercises appear first, followed by other shoulder choices. Selecting Cable lateral raise and opening Selected produces one uniform list of all four choices, with consistent check controls and no old/new status distinction. The full name `Overhead triceps extension` wraps to two lines at 320 px while the search is focused.

At 320 × 420 the exercise sheet occupies y=12–420. Its header remains at y=23–79, the results region at y=183–299 and completion region at y=299–408. The title, close control, one full result and Save are visible together. The list scrolls independently. No horizontal overflow occurred in the seven measured picker/swap states, and the walkthrough captured zero JavaScript page errors.

The stored-target swap fixture displayed Cable lateral raise immediately. The initial rendered review found that unrelated chest choices followed that match. After correction, the order was Cable lateral raise, Bent-over reverse fly, Shoulder press, then other muscle groups. Exact-target alternatives retain the small `Same target` cue; other choices remain explicitly available for a deliberate broader substitution.

The individual editor at 320 px presents working sets, rep range and rest clearly, with setup collapsed. The first bulk-editor rendering stretched its grid rows excessively. This was corrected and re-reviewed: fields now have natural heights. At 320 × 420, enabling Working sets leaves its stepper usable and the action footer at y=343–408. A center-point hit test confirmed the footer was uncovered; the dialog had no horizontal overflow. No blocking layout findings remained in this focused review.

Evidence is in `docs/design/workout-editing-ux/`:

- `picker-all-390.png`, `picker-selected-390.png`, `picker-selected-320.png` — context and unified selection.
- `picker-short-320.png`, `long-name-short-320.png` — bounded viewport and readable long names.
- `swap-stale-target-390.png` — final exact-target and same-group priority.
- `swap-short-320.png` — short-viewport swap layout, captured before the priority refinement.
- `edit-targets-320.png` — individual settings hierarchy.
- `bulk-targets-320.png`, `bulk-targets-short-320.png`, `bulk-targets-active-short-320.png` — final bulk-edit layouts.
- `review-metrics.json`, `final-review.json` — measured bounds, error count and final ordering.

Persistence, failed-save recovery, destructive-change confirmations and timer semantics are covered by the engineering QA run, rather than inferred from these screenshots. The review used a fake local fixture in a fresh browser context and did not touch the user's saved workout data.
