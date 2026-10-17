# Reference-led personal notebook redesign — PM journey contract

Status: product handoff prepared before engineering pickup. This document narrows the redesign of the existing personal app; PERSONAL-PRD.md remains the data and progression authority. References are user-provided inspiration, not evidence of tested usability. No human usability result is claimed.

## The user problem and outcome

I arrive at the gym knowing the muscle groups I want to train. I need a sensible short list, then a notebook that makes it obvious where to enter the set I just performed. Between sets I should see the relevant previous values and my recorded work without translating between a dashboard, a form and a history list. If equipment is occupied I need a quick replacement without falsifying what I already did. After training I leave; my work remains local and recoverable.

Success means the active set row is visually recognizable immediately, weight and reps can be entered directly there, a single explicit check records it, and a completed row remains in the same place. Completion never depends on reaching a prescribed volume. Saving is truthful; no aesthetic change weakens recovery.

## Reference analysis and the product decisions it produces

### Screenshot one: Push day workout sheet

The session title anchors the context, followed by stacked exercise cards. Each card uses a familiar numbered table: set, weight, multiplication, reps, completion. Completed rows preserve spatial position rather than moving into a second history component. Dark surfaces establish hierarchy without adding a border around every item. Rounded numeric fields make editable values visually different from exercise metadata. A brief comparative sentence belongs to the exercise, not a separate dashboard. The next exercise remains visible below, preserving a sense of the workout as one document.

Borrow the notebook structure, stable row positions, strong exercise heading and restrained completion color. Do not copy the trophy, implied personalized progress claims, workout notes or rest timer. Color alone cannot establish recorded state: use an explicit check and accessible recorded label. A white timer pill floating over content risks keyboard/action occlusion; a persistent extra control is unnecessary for this user's essential loop.

### Screenshot two: Today's workout preview

The compact lineup makes the planned session scan in one glance. A single Start workout action clearly separates planning from performing. Exercise names and set counts are sufficient to review the default plan. The muscle cards explain what is being trained visually, but their Growing labels and volume dots imply physiological knowledge the current app does not have. The green 2.5 kg marker is only defensible when a comparable actual history supports optional progression guidance.

Borrow the compact lineup, selected-muscle summary and single start action. Replace unsupported growth labels with factual selected groups or primary-target coverage. Keep equipment and rep prescriptions available inline, initially collapsed. Never call the default generated selection an optimized program or anatomical isolation.

### Screen recording: Pull ups, set actions and RPE sheet

The extracted contact sheet and frames show a compact Pull ups logger with weight/reps pills, set completion checkboxes, Add set, and per-row overflow. Opening a row menu reveals warmup, dropset, RPE, copy/paste and delete; an RPE sheet adjusts from eight to ten and explains the chosen score. The valuable pattern is local contextual editing and progressive disclosure: a secondary action appears near the row it affects rather than occupying permanent screen space.

Borrow direct row editing, explicit completion and a small local action surface for corrections. Do not add RPE, dropsets, warmups, exercise notes or a timer in this redesign. They add concepts and persisted state beyond the user's essential requirements. Avoid copying the recording's separate editor sheet for routine weight/reps: native inline numeric input is less navigation and preserves notebook context. If a contextual panel is necessary for swap or settings, keep it in the same page with a clear cancel/close and proper keyboard behavior.

## Current-flow diagnosis and bounded change

1. The current planning controls remain above a lengthy generated preview, with three fields on every exercise before Start. Replace this with choose → compact review. Retain controls through an explicit Edit selection action; do not duplicate the full form above the review.
2. The active screen repeats full exercise names in a horizontal switcher and then a separate exercise heading. Replace the switcher with the session's own compact exercise headers. Expand one exercise at a time in the same scrolling document.
3. Last time and Target currently precede a large standalone weight/reps form, which precedes a second receipt list. Replace these three regions with one stable set table. Keep previous context concise and secondary.
4. Settings, explanatory prose and recovery controls belong to their moment of need. Keep setup collapsed; retain storage errors prominently when a write fails. A quiet saved indicator is useful; a persistent storage lecture during every set is not.
5. Progress and Backup remain directly accessible, with the active draft intact when switching. No new account, backend, analytics, cloud sync or nutrition module.

## Agreed information architecture

Today has three in-place states: Choose muscles → Review workout → Active session. It is one app and one page, not a routed multistep wizard. A compact back/edit action returns from Review to Choose without throwing away an adjusted plan unless the selection actually changes. Progress and Backup remain bottom destinations. During training, the current exercise is expanded; other exercise cards show name, equipment if needed and recorded/planned set count. Tapping a header activates that exercise in place. Exactly one next editable set row exists per exercise under the current persisted model. Future prescribed rows may be shown as quiet placeholders, never falsely completed or active inputs.

Aesthetic target: near-black background, charcoal surfaces, crisp large exercise titles, restrained type hierarchy, generous row hit areas, lime/green only for selection or actual recorded state, clear white primary CTA. No decorative metrics, inaccessible grey-on-grey labels or full-screen hero illustration.

## RED01 — Choose and review with minimum effort

**Actor and entry:** User opens Today without an active draft. Data read must finish before an empty planner is shown. No login or introductory carousel.

1. Read a short prompt such as What are you training? and select labeled muscle chips. Selection is visually and accessibly explicit.
2. Adjust a compact exercise count control. Minimum equals selected-group count; maximum equals feasible distinct primary targets and the existing cap. Fewer/more controls expose accessible names, values and disabled limits.
3. Build workout remains disabled without a selection, with one short explanation. Pressing it produces a compact review containing selected groups, number of exercises, and a row per movement: name and sets × rep range. Equipment can be a secondary line.
4. One Start workout action dominates the review. Each movement has an explicit accessible Edit/Swap affordance; opening it reveals prescriptions or alternatives inline. The default review does not present every numeric field at once.
5. Editing sets or reps preserves the other movements. Canceling a swap/settings panel preserves current choices. Invalid values prevent Start, show a local reason, retain edits and focus the invalid field; no generic toast-only error.
6. Edit selection returns to chips with previous selections. Changing groups/count invalidates the old generated preview visibly; rebuilding is explicit. If no actual changes were made, retain the prior adjusted plan.
7. Start creates and commits the durable draft before declaring the session ready. Pending start disables repeated submission. Failure retains the plan and offers Retry without a fabricated active/saved state.

**Coverage:** Show factual distinct-target summary and one concise overlap explanation; do not label muscles growing. Chest+Back with count ≥2 includes both groups. Shoulder selection prefers front/side/rear targets before duplicates. Requests beyond feasible coverage explain the cap.

**Acceptance:** At 390 px a short default lineup and Start are easy to locate; there is no full form repeated above the preview. At 320 px there is no horizontal scrolling. Edit one movement, cancel an alternative, start, reload and recover the exact durable draft.

## RED02 — Log in a notebook row

**Actor and entry:** User has just performed a set. Existing unfinished session opens directly on its persisted active exercise. Session title/date and Finish are compact; no planning controls remain above it.

1. See the active exercise title, concise equipment/target and set table. Column labels identify Set, Weight (unit), Reps and completion. A simple one-time/local instruction such as Enter your set, then tap ✓ is sufficient; no long paragraph.
2. Recorded sets occupy stable numbered rows. The next row contains blank or previously typed actual fields. Planned rows below are visually muted and cannot count as actuals. Prior-session values are labeled Last time and stay references: they are not ordinary filled actual inputs.
3. Tap weight, receive decimal keyboard, enter a finite nonnegative value. Tap/Next focuses reps, receiving numeric keyboard. Blank is not zero; decimal reps are invalid. Zero explicitly means bodyweight/no added load under the existing convention.
4. Tap the row check, named accessibly Log set N for [exercise]. The commit validates both fields. Invalid values remain in place with a concise local reason. During transaction show Saving, disable duplicate commit and never turn the row green/recorded early.
5. On committed success the row stays in place as actual, with a visible check and accessible recorded state. Clear the next actual row only after success. Keep current exercise stable; do not auto-switch machines or steal focus. No separate duplicate receipt list.
6. If another set is performed at identical values, an explicit Repeat [weight] × [reps] records one new actual. Repeat remains a secondary deliberate action, never automatic. If the UI instead offers Use previous values, that only fills editable inputs and still needs the explicit check; the chosen semantics must be named accurately.
7. Reaching the planned count means Target recorded, not Workout finished. Show a small Add set/next blank-row affordance to support additional actual work. Never force a set into a different movement or erase excess sets.
8. Tapping another exercise header preserves pending values and recorded rows, commits active exercise selection safely, and reveals its own pending row. Do not generate actuals on navigation. Return restores its typed values.

**Failure and concurrency:** On failed write, keep the typed values on screen and show Not saved with Retry and export/reload recovery. A stale tab cannot overwrite newer saved data. Retry cannot duplicate a set ID. A row must not falsely look committed when its transaction failed. Background/reopen restores persisted pending fields; a device ending before a transaction completes remains a documented browser limitation.

**Acceptance:** Blank → type 40 and 10 → check → exactly one saved row → repeat once → two actuals; reload preserves both; switching away and back retains unfinished 42.5/8; injected write failure never displays recorded state and retry commits once.

## RED03 — Correct, undo and swap at the point of need

**Correction journey:** Tap a recorded row's clear Edit action or its editable-value affordance. Reveal inline weight/reps inputs prefilled from that set, with Save changes and Cancel. Changing values alone does not silently alter history. Save validates and commits the same set ID; failure preserves both the original record and current edit values. Cancel restores the original visible row. Deleting a set requires an explicit contextual Delete set action and offers Undo nearby; undo restores its identity and order. Do not make a checked row's check silently delete actual work.

**Swap journey:** Tap labeled Swap beside the active exercise heading or its explicit menu. Expand compatible alternatives immediately beneath that heading. Show name and equipment; same primary target comes first. The page does not route away, and Cancel retains the original. Selecting an alternative before any actual replaces the planned occurrence. After one logged of three, retain the original with its real logged set and add a replacement with two planned sets, activate replacement, and show a short preserved-work message. If the original target was already met, replacement starts with one explicitly additional set. Never rename old actuals, transfer previous-history comparisons or pretend different machines use comparable loads.

**No candidate:** State No alternative for this target with a close action; retain original. No fabricated suggestion or blocked finish. Swapping one movement does not rearrange all other movements.

**Acceptance:** Edit/cancel/save/delete/undo remains discoverable at 320 px. Swap after one logged set preserves attribution and remaining-set math. Original/replacement are separately visible in history after finish. Pending original input must not disappear silently: either preserve on retained original or ask the existing explicit discard/save choice before an unperformed occurrence is replaced.

## RED04 — Finish and return without losing work

1. Tap compact Finish in the session header. Keep the session visible behind an inline confirmation.
2. If any pending weight/reps exist, identify the affected movement(s), and offer Return to log or Finish without unlogged entries explicitly. Do not imply partially filled inputs are actuals; multiple exercises may hold pending values.
3. With recorded actuals, show a factual summary: exercises with actuals and recorded set count. Save workout stores the session and clears the draft atomically only after commit. Partial prescribed sessions are valid.
4. No actuals offers Keep draft or explicit Discard draft. Default should preserve work. Cancel returns to the same current row.
5. Success shows Workout saved, a small summary and an optional Back up now action. It does not nag every set or automatically download files. Today returns to the planner; Progress contains the completed/partial actual session.
6. Failure leaves the entire draft available and Finish retry cannot create duplicate history.

**Acceptance:** Finish with pending values on a non-active exercise prompts; Cancel retains them. Partial finish persists all actuals with no new implied sets. Failed finish shows no success and preserves draft. Returning another day offers usable history without a forced onboarding journey.

## RED05 — Progress, backup, keyboard and reliability continuity

**Progress:** Keep dated session cards and actual set rows readable and compact. Show descriptive comparisons only for matching movement/equipment/gym/unit context. Optional progression hint may say Consider 42.5 kg only when the existing conservative eligibility test passes; it is not a trophy or verified strength outcome. Mixed context/partial sessions retain their original restrictions. No mandatory chart or growth badge.

**Backup:** Keep a clearly named Backup destination. Show local status and last export initiation timestamp truthfully. Export, inspect/import preview, merge confirmation, checksum/schema conflict rejection and persistence request continue unchanged. Never label file creation as verified external backup. No database reset, automatic migration loss or upload in this redesign. A concise settings/backup destination may carry install help without crowding training.

**Keyboard:** Use real labeled inputs with at least 16 px input text, inputMode decimal/numeric, Next/Done behavior and visible focus. Scroll the focused row above keyboard if needed. Sticky tab bars/actions must not cover the row or primary commit; disable/adjust decorative sticky bars while keyboard is open if necessary. Do not depend on swipe or hover. At least 44×44 px tap targets including icon checks, swap, card headers and close.

**Accessibility:** Non-color recorded/selected/error states; sufficient text contrast; icon buttons have movement/set-specific names; expand controls expose aria-expanded; logical DOM order mirrors visible order; errors are announced without announcing every typed character. Avoid forced autofocus on initial page load, respect reduced motion and preserve focus when saving a row.

**Offline and updates:** Service worker, base-path hosting and existing IndexedDB schema remain intact. No forced reload mid-workout. Loading errors are not rendered as an empty notebook. Saved indicator follows transaction completion; offline-ready indicator follows actual cache readiness.

## Delivery and validation gates

Engineering may pick up after this handoff and UX agreement. Validate the changed primary loop in production build, preserve existing meaningful storage and domain checks, and add browser journeys for compact-row completion/correction, keyboard ordering, swap continuity, finish with pending non-active entries, backup access, and 320/390 px overflow. Capture actual redesigned screens; do not call a visual comparison a human usability study.

A synthetic walkthrough can inspect: a confident returning lifter repeating sets; a first-time user uncertain about checkboxes; a gym user swapping an occupied machine after a set; a user with a storage failure; and a keyboard/screen-reader user. For each record concrete observed interface behavior and unresolved friction. These scenarios are evaluation plans until executed, not evidence of delight or measured one-handed speed. Real iOS/Android thumb reach, numeric keyboard, installation and perceived simplicity require the user's actual-device trial.

## Final PM expert review of implemented redesign

Reviewed actual generated screenshots `redesign-choose-390.png`, `redesign-lineup-390.png`, `redesign-first-set-390.png` and `redesign-notebook-320.png`, alongside current PersonalApp.tsx. This is a source-and-artifact expert acceptance review; browser regression execution is recorded separately by QA. It is not a human test or a measured one-handed-speed result.

- Choose is a focused muscle-selection screen with visible selected checks, bounded exercise count and one Build CTA. Review replaces the chooser and presents compact named movements, prescriptions, local Customize/Swap actions, a coverage disclosure and Start. Planning controls no longer compete with session logging.
- Active session presents one expanded exercise, compact other movement cards and stable numbered weight/reps/check rows. At 320 px the reviewed screenshot keeps the numeric fields and completion control within the viewport without horizontal overflow. Secondary setup is collapsed. This directly adopts the useful notebook hierarchy of the supplied references without adding their RPE/timer complexity.
- Current source explicitly guards replacement of an unperformed occurrence with typed input using a discard-and-swap confirmation. Swaps with performed sets keep the original occurrence, create a separate replacement and allocate remaining planned sets. Repeat is disabled while that exercise has unlogged typed actuals. Invalid finite/positive-integer conditions produce a reason rather than an unexplained disabled action.
- Current source checks pending inputs across all exercises before finishing, names the save-without-unlogged-input choice, preserves partial actuals and offers Keep logging. Saved-row correction and delete wait for successful write; existing recovery paths remain present. IndexedDB schema, backup merge policy and context-qualified progression are retained.

No core user-journey blocker was found in this expert review. One nonblocking discoverability improvement remains: the saved check is accessibly named Edit set and has an explanatory title, but touch users do not see hover titles. A short first-save hint or visible Edit wording could make correction easier to discover. Actual iOS/Android keyboard behavior, physical thumb reach, subjective simplicity and long-term browser retention remain real-device validation items.
