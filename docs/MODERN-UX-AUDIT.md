# Modern UI/UX pass — synthetic expert evaluation

Date: 2026-10-19. This is an independent expert walkthrough of the actual React application in isolated Chromium contexts at 390 × 844 CSS pixels. It is not human usability research. No real workout records were opened or modified. Initial screenshots were taken before this sprint’s implementation; the secondary walkthrough picked up concurrent HMR changes, so those captures are explicitly in-progress rather than a frozen baseline. The coordinator must run final acceptance on the completed implementation.

Evidence: `/tmp/modern-ux-audit/observations.txt`, `secondary.txt`, and the corresponding PNGs. Actual interactions included first-use Home; Back + Biceps selection; manual six-movement selection; review/customize; start; log 60 kg × 5; edit; independent Biceps-only suggestion; same-target swap options; effort; finish partial; completed Home; and history. Save-failure, offline, backup conflict and undo identity behavior require automated acceptance evidence; those were assessed from existing contracts rather than re-injected in this visual walkthrough.

## Product decision

Keep Home and Workout as the two primary screens. Planning, review and active logging are states of Workout. The user should not need a separate route for adding, swapping, editing or removing an exercise. History and settings/backup remain contextual sheets. Two screens does not mean two UI states: every destructive action, failed save and partial draft must have a designed state.

The main at-gym question is “What did I just do, and where do I log it?” The next question is “What do I do when my plan changes?” Progress and suggestions support those tasks without competing with the current numeric input.

## Priority findings and interventions

| Priority | Observed friction | Intervention | Acceptance |
|---|---|---|---|
| P0 | Preview has Customize/Swap, no removal or direct addition. Active logger has no arbitrary add/remove. An erroneous triceps movement cannot be corrected through Biceps-only same-target swapping. | One consistent exercise action menu: edit target, swap, remove. Add exercise is explicit after the list, with search and muscle filter. “Swap” remains target-preserving; Add lets the user choose outside the original groups. | Remove/add before start; add during session; remove empty exercise; explicitly confirm removal of logged actuals and provide Undo; surviving actual IDs/context unchanged. |
| P0 | Edit set creates two Weight/Reps pairs and leaves Log next set alongside Save correction. | Editing temporarily replaces the entry area. Clearly label Editing set N; preserve the next-set draft while hidden. Save and Cancel return to the original current-set context. | Only one editable pair and one commit action while correcting; Cancel leaves original actual and draft untouched; Save corrects same set ID. |
| P0 | Finished workouts support set corrections but lack a clean workout removal journey. | Date-card menu with Delete workout, explicit workout/date/set-count confirmation, and Undo after completed transaction. | Cancel no-op; failed deletion keeps record; successful deletion removes only intended workout and updates derived progress; Undo restores original IDs and date. |
| P1 | Preview repeats equipment in two columns; prescription wraps into a paragraph; “Not saved until you start” register and Change muscles squeeze title to two lines. | Fullwidth title, quiet summary, compact exercise cards: name, one metadata line, trailing menu. Remove duplicate equipment/target text. Start in a visually stable action area. | Six-movement review remains easy to scan at 320/390 px; no overlapping columns; editable sets/reps discoverable in menu; Start visually primary. |
| P1 | Planner’s Suggest/Pick modes look like competing action buttons. Manual list pushes Build far below the fold. | One segmented mode control, concise selected count, sticky or clearly separated Build action. A mode change does not masquerade as submission. | Both modes have selected state beyond color, keyboard operation, preserved intended selections where appropriate, truthful no-result/zero-selection state. |
| P1 | Empty Home has four large cards repeating zero/no-workout/no-history. | Keep a useful first-workout hero and one quiet explanation that progress appears after logging. Retain structured progress cards once actual history exists. | Day-zero user reaches muscle choice in one tap; no invented sample activity; settings/backup discoverable. |
| P1 | Active logger has strong entry controls but edit affordance occupies a separate line below each ledger row. | A compact saved row with a clear pencil/edit target; set number, weight and reps align. Do not make a green tick look like a logging action on an already saved row. | Each saved row is at least 44 px tappable; actuals and pending entry remain visually distinct; keyboard users can identify which set is being edited. |
| P1 | New overflow alongside Swap forces even “Dumbbell curl” into two lines at 390 px. | Reserve full title width; put one 44 px overflow at trailing edge or move the compact action row below the title. | Names remain readable at 320 px, no controls collide; Swap remains quick without a dense header. |
| P1 | Optional effort panel is roughly 500 px tall, with three introductory texts before choices. | “Reps left?” plus one plain-language helper and five compact options. Keep RPE explanation collapsed. | The user can choose 2 more without knowing the acronym; no preselected effort; actual set remains saved whether effort is skipped. |
| P1 | History stacks Training history, Your training record and Performance by muscle group; first workout is below repeated comparison explanations. | One sheet title; dated workout cards first. Secondary performance details behind a disclosure. Avoid duplicating global success notices in the sheet. | First recorded workout is immediately discoverable; set edit/delete and workout delete are visible from the relevant card; close restores trigger focus. |
| P2 | Collapsed exercises resemble plain text cards; desktop hover underlines the full title, and position/status are weak. | Explicit chevron or completed check, compact set progress, whole-card target; remove web-link underline styling. | Selected/current, planned and completed are distinguishable without color alone. |
| P2 | Completion copy says “1 exercises”, “1 sets”, and “1 actual sets”. | Correct singular/plural and use natural words such as “1 set saved.” | Empty, one and many counts all read correctly. |

## End-to-end actor journeys and state contracts

### 1. Arrive at the gym and choose today’s work

The user knows Back + Biceps. On first visit they see one clear Plan action. They choose Back and Biceps; suggested mode offers a balanced list whose actual catalog groups match those choices. They can instead select deadlift, pulldown, row, dumbbell curl, preacher curl and hammer curl in that order. Shared elbow-flexion targets are allowed in manual selection. A zero-result search offers a clear way to clear search, and no selected exercises leaves Build disabled with useful context. Biceps selection must never include pushdowns or overhead triceps work.

Review shows exercise names and editable prescription once each. The user can remove one, add another or swap an unavailable option without restarting the whole plan. Start persists the workout before showing it as started. If saving fails, the review and all edits remain visible with Retry. Review is not falsely marked as a durable saved session.

### 2. Finish a set, log it and correct a mistake

The active exercise is the visual focus. The user enters load and reps, then deliberately taps Log set. Last-time values are references until explicitly used; they never become performed actuals automatically. Saving prevents duplicate submission. Saved state appears only after transaction completion. If a save fails, preserve the draft and offer one retry without creating duplicate IDs.

The user taps an actual row, edits one number and saves. During correction, the next-set input is hidden but retained. Cancel restores the previous actual and draft. Delete set offers Undo and recalculates count. Optional effort is attached to the correct actual by ID, uses plain language and remains skippable. It must not claim that an effort guess measures muscular growth.

### 3. Equipment is occupied or the plan changes

Before any logged sets, Swap replaces the planned movement. After logged sets, Swap keeps the existing occurrence and its actuals, then creates a separately identified replacement for the remaining intended work. A new movement receives its own prior-history comparison; it never inherits the old exercise’s performance.

Add exercise is a separate task: search the catalog, optionally change muscle filter, add one known exercise, and return to active logging. Removing an unperformed exercise is lightweight and reversible. Removing an exercise with actuals must state how many recorded sets would be removed and require explicit confirmation; Cancel preserves everything, Undo restores identity/order. A single remaining exercise is not removed in a way that leaves the app without a recoverable workout state: either offer replacement or treat it as an explicit whole-session discard. Never silently relabel or move actuals between muscles.

### 4. End early, finish normally or discard a false start

Finish remains visually persistent with elapsed time optionally hidden. The clock is wall-clock session duration; hiding it does not pause it. Finish opens a focused confirmation containing saved set count and whether unlogged input exists. Keep logging returns to the same exercise and focus. Save without unlogged input requires an explicit choice when pending fields exist. Empty sessions use Discard empty draft; sessions with actuals use Save workout. A user who started accidentally needs a deliberate discard action; destroying a nonempty session needs an explicit count-based confirmation.

Successful completion returns to Home with a concise receipt, updated attendance and last workout. Failure keeps the active session. A success message must not remain as duplicated visual baggage inside every subsequent sheet.

### 5. Return next week, inspect progress and correct history

Home distinguishes visits from sets and never fills the chart with mock activity. With one matching session, show that a comparison needs another recorded session in a short phrase. With comparable sessions, show concrete changed reps/load, not an unsupported “muscle growing” claim. Repeat returns to editable review, preserving intended exercise identity and allowing changes before Start.

History opens from the relevant card and begins with dated workouts. Expanding a workout reveals actual sets and corrections. Deleting the wrong session is reversible and does not affect another session with the same date. Records remain stable through reload, updates, offline use and imports within the established persistence contracts. Storage and backup warnings belong in settings and useful contextual moments, not a continuous alarm on the logger.

## Visual grammar

- Retain warm neutral canvas, clean white card surfaces, charcoal primary text and restrained vermilion for the current commit action. Use red only for danger within destructive confirmation; do not turn all secondary actions orange.
- Three text roles: heading, body/action, quiet metadata. Use tabular mono specifically for logged numbers and clock, not as decorative eyebrow text. Avoid an uppercase register above every heading.
- One clear card radius, consistent 16–24 px internal spacing, 12–16 px rhythm between controls. Inputs look editable, buttons look pressable, and menus have predictable placement.
- Dot muscle glyphs remain schematic supporting visuals. Biceps and Triceps require distinct text even if the tiny schematic arm location is shared.
- One primary commit at a time: Build, Start, Log, Save correction, or Save workout. Secondary navigation is lower emphasis. Overflow organizes uncommon actions, but core logging and Finish remain visible.
- Use inline/sheet error summaries close to the action, with recovery. Do not call a pending or failed transaction saved. Destructive confirmation text should name the actual exercise/workout and count.

## Release checks

The final implementation should be exercised at 320, 390 and 430 px with the exact six-movement routine, existing historical Arms data, saved and unsaved entries, repeated same-name exercises, one- and zero-record states, long exercise names, no search matches, logged exercise deletion/Undo, whole workout deletion/Undo, invalid numeric corrections, save failure/retry and reload. Existing backup, stale-revision and offline tests remain release gates. Physical phone keyboard, sweaty one-hand use and genuine perceived ease remain unmeasured; synthetic expert review cannot establish those outcomes.

## Implementation recheck — intermediate build

A second isolated browser pass exercised the rebuilt UI at both 390 × 844 and 320 × 844, with screenshots and focus/scroll measurements in `/tmp/modern-ux-final/`. This pass confirmed cleaner preview cards, a useful empty Home, one edit input pair, add/remove exercise dialogs, history deletion confirmation and no document-level horizontal overflow in every captured state. Canceling Add returned focus to Add exercise; canceling removal returned to the removal trigger; canceling workout deletion returned to the dated Delete trigger.

Issues sent back for immediate correction: stale preview menu persisted after Start; Start retained a lower page scroll position; edit input did not receive focus; Add exercise muscle filters were fullwidth rows instead of compact chips; exercise-menu labels were mistakenly constrained to 44 px; title + Swap + overflow squeezed names, and collapsed cards exposed too many controls. The coordinator and engineer are correcting these. This intermediate pass is not final signoff; subsequent acceptance must establish their resolution.

### Follow-up visual verification

After corrections landed, fresh 390 px and 320 px walkthroughs verified the compact catalog chips/search, natural-width menu actions, readable fullwidth exercise names, reduced controls on collapsed cards, and Start resetting scroll to zero and clearing the prior menu. The fresh 320 px edit walkthrough also confirmed focus moves into the weight field and selects its existing value. Add/remove/delete Cancel paths retained correct trigger focus; all captured states had no document horizontal overflow. Evidence: `/tmp/modern-ux-final/v2-*.png`, `observations-v2.jsonl` and `observations-320.jsonl`.

Remaining issues reported to the coordinator at this checkpoint: Build-to-review retained lower scroll position (207 px at 320 px), duplicate Editing/Correct set labels, singular “1 actual sets” copy, and link-style underline on hovered collapsed exercise cards. These are separate from the resolved Start transition. The fullpage screenshots alone cannot prove scroll position; use the JSON measurements. This pass did not repeat destructive commits or failure injection; the engineer/QA tests provide that evidence.
