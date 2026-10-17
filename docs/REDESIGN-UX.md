# Personal notebook interaction redesign

This is the PM/UX handoff for the user's reference-led redesign. It supersedes the oversized separate input/receipt workbench in PERSONAL-UX.md while retaining its storage and accessibility guarantees. Review inputs: the two supplied still references; recording frames 02, 08 and 13 and contact sheet; current PersonalApp.tsx and personal.css. This is expert review and synthetic walkthrough, not human usability evidence.

## What the references teach

The active-workout still treats each movement as a small self-contained notebook: title and equipment, repeatable numbered rows, values at a stable horizontal position, and an explicit completion control. Logged rows are visibly different without becoming a separate receipt list. The dominant visual device is alignment, not decoration. One can glance at a weight and reps and act without translating a large editor into a second list elsewhere.

The planning still separates deciding what to do from doing it. Its muscle cards establish coverage, its exercise rows summarize the plan, and one Start workout action makes the state transition clear. We borrow that hierarchy, but do not reproduce claims like Growing or unsupported muscle-volume scores. Our coverage labels describe actual selected primary targets and acknowledge compound overlap.

The recording shows a compact exercise sheet, small inline load/reps controls, a per-set completion checkbox, Add set, and a contextual menu exposing RPE, warmup, dropset, copy and delete. It demonstrates progressive disclosure: exceptional editing does not occupy the default logging layout. Its RPE sheet and all-out language add concepts the personal MVP does not need. We borrow the compact rows and disclosure, not its deeper navigation, RPE, workout classifications or implied coaching intelligence.

## Current friction and replacement

The current Today screen keeps muscle selection, count, long instructional copy, generated plan and repeated three-field editors in the same vertical stream. Starting is far below the moment the user is ready. The active screen then makes the user reconcile horizontal exercise navigation, an exercise title, previous/target columns, giant input boxes and a separate receipt list. Switching and editing are spatially disconnected. Ubiquitous outlined boxes have almost the same emphasis. Lime everywhere weakens the distinction between a CTA and a persisted actual.

Replace this with three states inside Today: Choose muscles; Review lineup; Log session. Keep Today, Progress and Backup destinations. Progress and Backup remain secondary, never prerequisites to a workout. Plan review replaces the chooser visually but offers an obvious Change muscles control in place. No browser route or modal drill-down is necessary.

## Visual language

Use neutral black #0d0e10, charcoal surface #191a1d, raised row/input #25272b, border #34363b, text #f5f5f6, muted text #a2a5ad. White #f5f5f6 is the main planning/start/finish CTA with dark lettering. Emerald #36d786 communicates selected muscles and committed actuals, with a subtle #17372a tint. Reserve amber for warnings, red for failure; no gold trophy or strength-growth claims. Keep body 15–16px, headings 28–32px, card titles 17–19px, row values 18–20px tabular numbers. Space 4/8/12/16/24. Cards radius 22px; buttons and numeric fields 12–16px; pills only for brief tags and optional tool controls. No external fonts or image dependency.

Top header is compact: small notebook mark/name left, transactional save status right. Avoid the decorative eyebrow and slogan. Page heading names the current task: Your workout before planning, Today's workout in review, selected muscle combination in session. Workout metadata uses one muted line. Navigation is a compact three-item bottom bar with text labels, respecting safe area. Current destination has a subtle neutral highlight, not a large bright button.

## DOM and layout handoff

The root remains .personal-app with .personal-header, main.personal-main and .personal-tabs. Add modifier .is-session while active. Main phone padding 16px (12px at <=360px), maximum width 680px. All flex/grid children have min-width:0. Keep 44px hit targets even where visible glyphs are smaller.

Choose state uses section.personal-setup: title plus one concise explanation, .personal-muscle-grid with six cards in two columns (three columns above 480px). Each button contains a small neutral target icon, muscle name and selected check. It has aria-pressed, no fake anatomical precision. Count appears in a single .personal-count-row: label and bounded decrement/value/increment control. Explain available distinct primary targets in one secondary line. Build workout spans the content width. Optional gym/unit configuration belongs in details, not onboarding.

Review state uses .personal-lineup with title, selected-muscle chips and movement rows .personal-lineup-row. Each row is numbered, movement name and equipment/primary target, brief sets and rep-range summary, and labeled Swap or icon with accessible name. A Customize button exposes existing set/rep editors inline for that movement only. Coverage explanation is one shared disclosure, not repeated paragraphs. Start workout is full width after rows; on a small phone the list scrolls naturally. Do not pin a CTA over the software keyboard. Change muscles remains visible near the title.

Session header .personal-session-heading has selected group title, date or exercise count and Finish. No large timer, fake duration or extra progress score. A thin factual counter such as 2 of 12 planned sets logged may appear; extra sets do not produce an impossible 110% ring. The session list is .personal-exercise-stack. Each article.personal-exercise-card is either .active or .collapsed. The header button occupies the movement title area; a separate Swap button is a sibling, never nested inside another button. Header has equipment/target in small type and movement name. Collapsed cards show performed/planned set counts and tap-to-open affordance. Only active card renders the row editor. Switching preserves pending values and logged work without saving a false actual.

Inside active card use .personal-set-head and .personal-set-row CSS grids with columns 28px minmax(0,1fr) minmax(0,1fr) 46px and gap8px (gap6px at320px). Header text Set / kg or lb / Reps / Done. Column headers remain visible; inputs have precise accessible labels including set number and exercise. The completion action uses a check icon and aria-label Log set N for MOVEMENT. A hollow pending check is visually distinct from a green committed check. It is disabled when current draft fields are invalid, busy, or writes blocked. Do not use color alone: committed row shows check plus accessible Saved state, and logged actual values; pending row has editable input surfaces. Future rows show em dashes or explicit targets, never apparently performed numbers. There is exactly one editable next-set row; future placeholders are not writable until active, avoiding extra unsaved draft shape.

Saved rows display actual numbers at the same columns and offer an Edit set control via tapping the row or a clearly labeled small edit button. Inline edit reuses row columns and has Save correction and Cancel actions directly below; deleting an actual exposes Undo. Do not overload the completion checkbox as deletion. When an actual is committed only update the completed styling after IndexedDB transaction success. Focus must not jump to another exercise after reaching planned count. Once planned rows are complete, Add set reveals the next editable row. It does not log anything. Retain the clearly labeled secondary Repeat [weight] [unit] × [reps] action: one intentional tap explicitly commits exactly one new performed set after durable write success. Its label includes exact values; it is not called Copy last set, which would imply draft-only filling. Add set only reveals a pending row and never commits an actual.

Reference context is one short line below header or below the row table: Last time 40 kg × 10 · 10 · 9, plus optional Use suggestion control if genuinely available. Multiple prior weights can remain a concise summary or expand Previous sets. Do not squeeze a fifth Previous column into a 320px viewport. Target detail reads 3 sets · 8–12 reps; advanced gym, equipment identity, increment and progression settings are collapsed below logging. A contextual improvement sentence is allowed only when comparable actual data supports it; never show target performance as actual progress.

Swap opens an inline alternative panel inside the same card, with movement/equipment and same-primary-target explanation. Previously performed sets remain with their original movement. The user can cancel. Replacement after performed sets creates a second segment/card preserving original actual attribution. No fullscreen chooser and no accidental relabeling of saved sets.

## State handling and reach

At 390×844 the active title and at least the first three row positions should fit before secondary settings. At 320×568 the current row and commit check remain usable with ordinary vertical scrolling and without horizontal page scroll. Numeric keyboard uses decimal for load and integer for reps; 16px minimum input text prevents iOS zoom. Enter moves load to reps, then commits only through an explicit actual action; never automatically record a set because focus left the field. Editing and switching do not erase typed values. Bottom navigation has reserved padding and safe-area inset; no sticky bar covers the current numeric field.

Saving is a temporary muted state, Saved on device follows commit, Not saved is an alert with recovery actions. A blocked stale-tab or quota failure leaves typed inputs visible and offers retry, export on-screen data and explicit reload of saved data. Healthy-save state is not a promise of backup. Backup explains local-browser limits, offers export/import with preview and preserves current merge/conflict behavior. Progress is compact history; expand a session inline and retain correction capabilities.

## Acceptance walkthroughs

Returning lifter: reopen unfinished session → active exercise and saved rows restore → type weight/reps in next row → tap check → wait for persisted styling → move to another card → return and see the same pending/actual data. No duplicate actual from one rapid double tap.

Busy gym: planned machine unavailable → Swap → read same-target alternative → choose → pending unperformed replacement uses new exercise identity; existing actuals retain old identity and setup → log new movement separately. No false equivalent-load comparison.

First-time lifter: choose Chest and Back → bounded exercise count → Build → scan compact lineup and equipment → optionally change one movement → Start → see unlogged rows, not a precompleted workout. Defaults are suggestions, not prescribed performance.

Interrupted or offline lifter: type values → reload or background → saved draft resumes; log then offline reload restores the committed actual. Simulated persistence failure visibly keeps values without green completion. Export/import roundtrip survives clearing only when the external backup was independently retained.

These journeys are required implementation checks. Human comfort, visual delight and true home-screen/keyboard behavior still require a real-device tryout and are not established by these synthetic walkthroughs.

## Implementation class agreement

Engineering and UX agreed nb-* components for the new notebook while retaining personal-* shell, errors, backup, progress and navigation. New classes are nb-muscle-grid/card, nb-count-row, nb-lineup/row, nb-plan-summary, nb-exercise-stack/card/top/heading/title/meta/content, nb-set-table/head/row/number/value/check/editor/footer, nb-previous and nb-session-progress. Row states use is-saved/is-current/is-future and active cards use is-active/is-collapsed. These map directly to the layout behavior described above; the stylesheet implements the nb-* names.

## Implemented visual review

UX reviewed the actual browser captures tests/artifacts/redesign-choose-390.png, redesign-lineup-390.png and redesign-session-390.png after implementation. The 390px captures show the agreed neutral charcoal surfaces, target silhouettes, white main actions, compact lineup, emerald committed actual rows and adjacent current load/reps/check controls. No blocking visual discrepancy was found in those captures. This is a screenshot review, not evidence of real-device keyboard ergonomics or a human usability study. A minor singular/plural session-count copy issue was reported to integration. Automated narrow-viewport and behavioral checks remain owned by QA.
