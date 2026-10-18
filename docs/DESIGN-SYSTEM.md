> Current type rules: see “Current typography contract — 18 October workout audit” below. Earlier typography examples are historical and superseded.

> Upstream design record, written before screen composition. Subsequent readiness decisions and delivery status are recorded in [DESIGN-DELIVERY.md](DESIGN-DELIVERY.md); the initial pause/blockers below are retained as process evidence.

# Training ledger — design-system contract

Status: design handoff for an isolated, browsable library and subsequent screen review. The library is illustrative and must never open or write the production workout database. This document follows the jobs, service blueprint, emotions-as-hypotheses and flows in DESIGN-JOURNEYS.md and DESIGN-FLOWS.md. Its existence does not authorize skipping their review or claiming human usability validation.

## 1. Intent and character

The product should feel like a carefully kept training ledger: direct, concentrated and personal. It helps someone put down what actually happened, then find it again. It is not a motivational dashboard or a coaching score. Its character comes from typography, ordered marks, ruled alignment and the distinction between a working draft and a recorded line.

Use warm chalk on an ink-green charcoal canvas, a shallow worksheet material, restrained engraved-looking indexes, readable tabular actuals and a single decisive action at each moment. Material boundaries explain ownership: one active exercise is a worksheet; its sets are ruled entries within it; other exercises are indexed lines, not competing worksheets. A quieter utility surface serves backup and recovery. The visual system must still work without decorative illustration.

The references supply useful behavioral ideas: compact repeated set rows, a visible completion action and secondary disclosures. Do not copy unsupported growth labels, dot scores, trophies, RPE-first language, video heroes or a maze of workout detail screens. Do not treat dark rounded cards as the design idea.

### Five composition principles

1. **The record is the hero.** The current load/reps row has the strongest local contrast. App branding and helper prose stay subordinate.
2. **Alignment does work.** Stable numeric columns, ordinals and ruled rows make the page scannable without adding boxes around every fact.
3. **One material, one responsibility.** A worksheet contains a task; a disclosure contains a secondary explanation; neither nests arbitrary cards inside cards.
4. **Actuals carry receipts.** A saved state is a transaction outcome, not a visual optimism convention. Suggestions, drafts and placeholders never borrow the exact completed treatment.
5. **Useful restraint.** A short session, lower weight, missing effort estimate or incomparable setup is not a failure state. The app says what it knows and what it does not.

## 2. Flow and information architecture agreement

| Flow ID | Job / user intention | Primary composition | Crosscutting obligation |
| --- | --- | --- | --- |
| F01 Boot | Open a trustworthy record | Identity + Loading/Resume/Empty branch | Never reset storage as an error fallback |
| F02 Plan | Choose what to train and review a session | Focus selector → Session draft | Distinguish muscles, exercises and sets |
| F03 Capture | Record this performed set | Active worksheet + Set ledger | Explicit actual commit; durable acknowledgement |
| F04 Correct | Fix a mistaken actual | Inline correction within ledger | Stable ID; cancel reversible; whole-record undo |
| F05 Swap | Continue when equipment is unavailable | Replacement chooser + attribution note | Retain original actuals and setup identity |
| F06 Resume | Recover intent after an interruption | Recovered worksheet / Recovery block | Draft remains draft; stale tab cannot overwrite |
| F07 Effort | Optionally annotate a performed set | Separate effort-only inline module | Choice is explicit metadata commit, not required |
| F08 Finish | Leave with actual work kept | Completion summary | Warn about unlogged values; preserve partial work |
| F09 Evidence | Understand comparable performance | Group summary → Evidence ledger | Real actuals, context and effort qualification |
| F10 Backup | Keep an independent recovery copy | Protection states + Export/Import preview | Validate before atomic merge; do not promise permanence |

Today owns prepare, review, capture and resume states. Progress owns understanding and evidence. Backup owns protection and recovery tools. Transaction status and loss prevention are crosscutting. No extra screen destination is introduced for an exercise, a set, effort, a swap or a comparison.

## 3. Foundations and exact tokens

Token names are semantic, not named after screens. Components consume these tokens; screen CSS must not restyle component internals. The production stylesheet can alias legacy hooks at the boundary while its handlers are retained.

### Color and material

| Token | Value | Meaning / allowed use |
| --- | --- | --- |
| --ds-canvas | #141713 | App background / negative space |
| --ds-sheet | #1C211B | Active worksheet or distinct utility section |
| --ds-raised | #272E25 | Editable field / local raised control |
| --ds-ink | #F1EEE3 | Main text; primary-action fill |
| --ds-secondary | #B9C0B1 | Supporting text / contextual facts |
| --ds-muted | #98A28F | Dates, helper text, column labels; not opacity-reduced body copy |
| --ds-rule | #414C3D | Decorative separators; never the sole boundary of an input |
| --ds-control-border | #6D7B66 | Control boundary against raised material |
| --ds-accent | #ADD2B3 | Committed indicator / measured positive evidence / selected state |
| --ds-accent-surface | #263D2C | Subtle selected or committed tint |
| --ds-danger | #F4AD9A | Error and destructive action text |
| --ds-danger-surface | #402B25 | Error material |
| --ds-warning | #DFC17A | Pending-data caution / conflict qualification |
| --ds-warning-surface | #3A3322 | Warning material |
| --ds-focus | #D6E2BD | Keyboard focus ring, independent of committed state |
| --ds-action-ink | #141713 | Text/icon on primary fill |

Calculated sRGB text contrast on canvas/sheet/raised respectively: ink 15.56/14.09/12.02; secondary 9.67/8.76/7.47; muted 6.80/6.16/5.25; accent 10.89/9.86/8.41. Control border against raised is approximately 3.11:1. These are token-pair calculations, not a claim that every final composition has been audited. Recheck actual opacity, blending and text size in the built workbench. Never reduce an enabled helper label below 4.5:1 to imitate a reference screenshot. Rules can be lower contrast because they do not carry essential state by themselves.

The palette is warm and desaturated. Bright green is not the whole brand. A committed set uses an accent marker and quiet tint; do not fill every saved row with a high-saturation band. A primary action is chalk, not green, so a planning CTA cannot be mistaken for a successful save.

### Typography

No external network font is needed. Main stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Record metadata stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Numerals use `font-variant-numeric: tabular-nums lining-nums`.

| Role | Size / line height | Weight / tracking | Usage |
| --- | --- | --- | --- |
| Display / workout title | 32 / 36 px; 28 / 32 at320 | 650; -1.1px | One task title, never repeated per card |
| Section | 22 / 28 px | 620; -.5px | Evidence/backup section |
| Movement title | 18 / 24 px | 600; -.25px | Exercise identity |
| Actual value | 22 / 28 px; 20 / 26 at320 | 600; -.35px | Performed and current numeric values |
| Body | 15 / 23 px | 400; 0 | Explanations and evidence |
| Control label | 14 / 20 px | 600; 0 | Action and choice text |
| Supporting | 13 / 20 px | 400; 0 | Equipment, context, caution |
| Register / index | 11 / 16 px | 500; .7px; mono | Date, ordinal, sheet label, column heading |

Uppercase is limited to short register text, such as SET, KG, REPS or SESSION 04. Do not uppercase paragraph guidance. Long movement names wrap; never truncate essential identity to force a one-line title. Avoid huge hero text, generic slogans and redundant eyebrows. A helpful title names the action or session rather than making a marketing claim.

### Space, geometry and layout

Spacing scale: `--ds-space-1:4px`, 2:8px, 3:12px, 4:16px, 5:20px, 6:24px, 8:32px, 10:40px. Use this scale; 6px is allowed only for narrow numeric-grid gutters. Page gutter is16px at390,12px at320,24px above720. Content maximum is680px for working screens,1120px for the design workbench.

Geometry: primary/secondary action radius8px; input radius6px; commit control radius10px; worksheet radius12px; utility/inset radius8px; selected focus tile radius8px. Circular controls are reserved for an actual circular metaphor, not every icon. No pill-shaped generic buttons. Selection chips can use8px radius; they are not decorative capsules.

Use a 1px rule between repeated lines. The active worksheet has a thin edge and a2px accent registration mark at its left title edge; collapsed exercises are transparent indexed rows separated by rules. Do not show multiple large elevated active cards at once. No drop shadow on the normal dark page. A contextual floating layer, if unavoidable, may use `0 12px 32px #0006`; primary journeys should work inline.

Minimum actionable target44×44px, primary48px high, numeric46px high. Space unrelated actions by8px. An icon may be18px inside a44px target. Main control text must be at least14px; metadata may be11px only when nonessential and readable. Inputs must render at least16px to avoid iOS auto-zoom; actual-number inputs use20–22px.

Set grid at390: `28px minmax(0,1fr) minmax(0,1fr) 44px`, gap8px. At320: `24px minmax(0,1fr) minmax(0,1fr) 44px`, gap6px. Rows min-height52px. All children min-width0. Never add Previous or Effort as a fifth column. Compare evidence below or in an inline expansion, not squeezed into the work row.

### Motion and response

Control color response120ms ease-out. Disclosure entry160ms opacity/translateY4px at most. Committed marker may crossfade120ms after success; it never appears ahead of the transaction. No confetti, spring bounce, auto-scrolling after every set or animation that changes a value's apparent meaning. Respect prefers-reduced-motion by removing movement and nonessential transitions. Loading uses a static status plus an optional subtle spinner; ensure announced text carries the meaning without motion.

## 4. Shared interaction state contract

| State | Appearance | Behavior | Accessibility / truth |
| --- | --- | --- | --- |
| Rest | Material and label define role | Ready to act | Visible name and native element semantics |
| Hover | Slight raised-material shift or text underline | Pointer affordance only | Never required on touch |
| Pressed | Darken fill /1px inset, not scale shrinking | Single deliberate action | Does not imply operation completed |
| Focus-visible | 2px focus ring,3px offset | Keyboard location preserved | Ring not removed by selected/error styling |
| Selected | Accent edge + check/text/state | Reversible intent selection | aria-pressed/radio checked as appropriate |
| Disabled | Explicit disabled property, muted label/control | No operation | If reason is not obvious, adjacent text explains it; do not rely on opacity alone |
| Loading / saving | Stable size, status label, optional spinner | Duplicate commit disabled; unrelated read-only context remains | aria-busy; polite status; no success marker |
| Saved | Quiet committed marker and actual values | May open explicit correction | Only after transaction completion |
| Invalid | Danger boundary + short inline explanation | Preserve input; no commit | aria-invalid and describedby; focus stays controllable |
| Blocked / conflict | Persistent recovery notice | No stale overwrite; preserve draft | Alert with clear recovery choices |
| Destructive pending | Plain consequence explanation | Explicit confirmation/cancel for loss | Never generic OK/Cancel when consequence can be named |

Library fixtures can simulate loading/saved/error by controlled local React state; every fixture must say it is a demonstration. A simulated Saved marker must never be presented as a real workout write. Production behavior continues to use the existing durable transaction handlers.

## 5. Atoms: exact responsibilities and variants

Atom IDs are stable review references. Flow mappings are not decorative: every component must have an actual job. TypeScript examples describe the public contract; native props/ref passthrough is required where appropriate.

### A01 Action / DSButton

Flows F01–F10. Props: native button props plus `variant:'primary'|'secondary'|'text'|'danger'`, `loading?:boolean`, `loadingLabel?:string`, `size?:'regular'|'compact'`, `startIcon?:ReactNode`, `endIcon?:ReactNode`. Default type button. All variants retain44px targets; compact changes padding/density, not target height. Primary is chalk fill; secondary is explicit outline; text is an underlined-on-hover verb without a containing box; danger uses danger text and clear wording. Loading retains width and replaces the visual label with a meaningful verb such as Saving set; the accessible name also states the operation. Disabled is native and cannot call onClick.

Usage: one primary per local task, e.g. Start workout, Save correction, Export backup. Do not render every optional action as secondary outline. Never use primary styling to mean saved. Inline Cancel is text; Delete set is danger text subordinate to Save correction.

### A02 Icon action / DSIconButton

Flows F03–F06,F09. Required label, icon ReactNode, optional pressed and loading.44px rounded-square hit target, visible icon18–20px, no generic circle. Utility variant is transparent at rest; filled variant is for meaningful local control. A commit check has its own A06 contract and cannot be implemented as an unlabeled generic icon. Tooltip is optional supplementary text, never the sole accessible name. Hover and focus cannot reveal a required action that is otherwise absent.

### A03 Numeric/text field / DSField

Flows F02–F06,F10. Props: label, optional hint/error, id, native input props and forwarded ref. Component owns label htmlFor, error ID and aria-describedby composition; caller can supply additional describedby IDs. Numeric values remain strings while typing; no coercion on every keystroke. Correct decimal/numeric inputMode, min/max validation in domain handler, support0weight as actual. Input has default/focus/invalid/disabled/saving variants. A form field does not display Saved on its own; surrounding transaction owns that state. Row-layout variant may visually hide label only when an external column heading plus accessible per-set label remain.

### A04 Register label / DSLabel

Flows F01–F10. Mono short index/date/column heading; supporting/body variants use sans. No interaction. A required unit is visible, not merely a placeholder. Register metadata cannot replace meaningful field labels. Truncation allowed only for redundant decorative index, never actual/equipment identity.

### A05 State marker / DSStatus

Flows F01,F03–F10. `state:'opening'|'saving'|'saved'|'error'|'conflict'|'offline-ready'|'offline-unknown'|'backup-needed'`, text override only when semantics remain truthful. Status includes text plus optional marker; color alone is insufficient. Transaction state and backup/offline state must be separate instances with separate labels. Saved text means Saved on this device, not Safe forever. Polite live region on change; blocking failure uses an alert in recovery molecule, not an endlessly repeated live status.

### A06 Actual commit / DSCommitControl

Flows F03,F04. Props: `state:'ready'|'disabled'|'saving'|'saved'|'error'`, required label, onCommit; saved state may instead expose a separate edit callback at molecule level.44×44px,10px radius, hollow check before commit, loading status while saving, accent solid small marker after success. Do not use the saved check as a silent toggle that removes an actual. Label is Log set 2 for Bench press, Saving set2, or Saved set2; Edit action is explicit. Future state is decorative placeholder, not a disabled clickable-looking promise.

### A07 Choice / DSChoice

Flows F02,F07. Native checkbox/radio semantics or aria-pressed button according to interaction. Selection intent (muscle) toggles without saving a performed record; effort uses explicit labeled action-to-save buttons in a distinct molecule. The same surface style does not imply the same persistence behavior: helper copy states it.44px height, check plus edge for selected, focus independent. No hidden radio behavior on an action that immediately commits.

### A08 Rule / DSDivider

Flows F02–F10. Decorative1px rule with optional register index. No card surface, shadow or extra semantic role unless it separates actual page regions. Helps build the ledger; never the only error/selected indicator.

### A09 Target illustration / DSMuscleGlyph

Flows F02,F09. Existing original MuscleGlyph may be wrapped. Decorative aria-hidden,40×56px selection,28×40px summary. Primary target highlighting is illustrative, not a measured map of activation, growth or recovery. No per-person intensity heatmap. Every illustration has a text muscle label beside it.

### A10 Progress/qualification label / DSBadge

Flows F05,F08,F09,F10. `tone:'neutral'|'positive'|'warning'|'danger'`, small text12px with subtle8px rectangular tint; no trophy or percentage. Valid examples: Partial, Different setup, Effort not compared. Never Growth +12%. A badge is not clickable unless a separate action label explains it. Long caveats become body copy, not tiny clipped badges.

### A11 Loading / DSLoading

Flows F01,F03,F04,F07,F10. Text plus optional spinner; constant minimum height to reduce jumps. Reduced-motion static marker. Never replaces error with endless spinner. IDB failure exposes recovery. Skeletons cannot look like actual historical records or guessed values.

### A12 Native disclosure trigger

Flows F02,F04,F07,F09,F10. Implemented inside DSDisclosure molecule using details/summary or controlled button with aria-expanded/controls. Entire trigger44px minimum; chevron14px plus text. Default borderless with a bottom rule; do not add a new rounded bordered card for every explanation. Open state preserves focus. Escape may close a controlled inline editor without discarding a saved record; native details follows native behavior.

## 6. Molecules: composition and behavior

### M01 ScreenHeader

F01–F10. Composes A04 + title + optional A05 + A01/A02. Names the current job and one contextual action. Identity is small; heading does not repeat the same section twice. Header can wrap at320 without covering title. Save status never crowds the user's actual record. No slogan.

### M02 Navigation

F01–F10. Three text+icon destinations Today/Progress/Backup, active indicated by underline/registration mark and accessible current state.44px minimum target,48–56px navigation height plus safe area. Reserve bottom content space. No bright pill per destination. Switching preserves current session and draft; navigation never logs or finishes. Workbench navigation is a separate illustrative control, not production routing.

### M03 FocusSelector

F02. Composes A07+A09+A04. Six focus choices in a two-column compact grid at320/390, three above560. Default tile min-height76px, illustration supporting name, radius8 and a left-edge/check selected mark. Distinct selected state beyond color. This is the only place where multiple equal selection tiles are appropriate. Text remains legible with long Shoulders label. Do not describe broad muscle group selection as a guarantee of exhaustive isolation.

### M04 BoundedStepper

F02. Label Exercises, decrement, value input, increment;44px controls and visible bound reason. Domain provides min/max. Disabled boundary explains available primary-target count. Keep user's intent clear instead of silently clamping arbitrary input with no explanation. Optional direct input must handle partial empty typing before validation.

### M05 PlanLine

F02,F05. Composes ordinal, movement title, equipment/primary target, prescription, text Customize/Swap. Default presentation is a ruled row, not a card. Displays 3 sets ·8–12reps in words. Optional editors open inline beneath this same line; only the selected line expands. Group coverage is a shared explanation, not a repeated paragraph. No saved-actual styling on plan targets. Start is outside the repeated rows as the one primary action.

### M06 WorksheetHeader

F03,F05,F06. Ordinal/date register, movement title, setup/equipment, target, swap utility. One active worksheet at a time. Other exercises show collapsed indexed rows with performed/planned counts. Header activation has an accessible expanded state; utility action is a sibling, never nested inside a button. Last time context is secondary and may expand. Unknown setup is named. No automatic equivalence of different machines.

### M07 SetGridRow and SetRow

F03,F04,F06. Export low-level `SetGridRow` for semantic geometry and a controlled higher-level `SetRow` fixture/API. State is discriminated, not a collection of contradictory booleans:

- `future`: ordinal + em dash/explicit target label + noninteractive placeholder. No actual values and no completion callback.
- `draft`: ordinal, weight string, reps string, commit control; onWeightChange/onRepsChange/onCommit. Values are intent, even when copied from prior sets.
- `saving`: same entered values remain; controls block duplicate commit; loading label. Does not render actual receipt.
- `saved`: durable actual values and committed marker; explicit onEdit affordance. Optional effort caption is a separate line outside the four-column grid.
- `editing`: string drafts within existing saved row, Save correction/Cancel plus subordinate Delete. Underlying actual remains until commit; ID unchanged.
- `error`: entered values retained, invalid field explanation or transaction failure; commit never turns green. Persistence conflict belongs in M13 recovery with this row still visible.

Use one editable next-set row. Future planned rows are not writable controls. Add set reveals an additional draft after targets complete, never an actual. Repeat exact values is an explicit new actual action and must name the exact values; Copy last set would mean fill-only and cannot be used as a misleading synonym. Enter may move weight to reps; committing on Enter must be explicit, documented and identical to tapping Log set, never triggered by blur. No autofocus opens a keyboard after each successful commit. UI adapters must reuse production transaction handlers, not recreate domain storage in the component library.

### M08 CorrectionEditor

F04. Composes M07 edit mode + A01. One local correction context for current/history. Save correction commits once, Cancel retains saved actual, Delete removes the complete actual only through explicit action and gives Undo restoring all fields including optional effort. No saved-checkbox toggle deletion. Busy and error states retain drafts. Focus returns to originating Edit after cancel/save where feasible.

### M09 ReplacementChooser

F05. Composes a short explanation + ruled candidate list + text Cancel + attribution warning when needed. Candidate includes movement, equipment and target rationale. No fullscreen screen takeover. With existing actuals show original segment and replacement segment clearly; prior sets never relabel. Pending unlogged values require an explicit keep/clear resolution before replacement if they cannot be preserved. Multiple same-target choices are alternatives, not proof of exact biomechanical equivalence.

### M10 EffortChoices

F07,F04. Separate effort-only inline panel; question, helper, five action choices4+more/3more/2more/1more/No more; unknown/removal; Close; What is RPE? disclosure. Minimum44px, wrap naturally. Choice tap explicitly commits only optional metadata; no separate ambiguous Save button. Copy says Tap a choice to save. Loading disables duplicate choices, error preserves the proposed choice and exposes Retry. Closed panel never prompts after every set. Previously recorded selection is accessible beyond color. Approximate RPE stays secondary. No more means no more controlled good-form reps estimated, not encouragement toward injury or breakdown. Removing means unknown, never zero.

### M11 CompletionSummary

F08. Shows actual sets kept, partial exercises and any pending input warning. The primary action names the consequence: Save workout; when pending input exists, Save without unlogged input. Keep logging is a visible alternate. Empty draft uses Discard empty draft, not Save workout. No confetti or completion percentage that marks unperformed targets as done. Finishing is a separate transaction from logging; blocked storage prevents false completion.

### M12 GroupPerformance + ComparisonEvidence

F09. Summary is an unboxed/ruled section or compact shallow material when multiple distinct groups need scannability, not a biological-growth card. Illustration, group name, qualified result count and visible effort/context caveat. Detail is full reading width: movement, prior date/setup/ordered actuals, latest date/setup/ordered actuals, exact reason and subjective-effort qualifier. At390 comparison facts can stack; do not force two unreadably narrow columns. Card detail expansion should span the overview grid.

Components receive evidence and qualifiers; they do not compute progression or fabricate status. Domain logic owns eligibility: same movement/gym/equipment/unit/prescription, complete ordered actuals and conservative nondecreasing-load/reps comparisons. Mixed loads/reps, partial sessions and unknown context are neutral explanations. Harder effort qualifies the headline visibly. Missing effort is explicitly not compared. No percent growth, muscle fullness animation, recovery readiness, tonnage-only increase or automatic load change.

### M13 RecoveryBlock / InlineNotice

F01,F03,F04,F06,F07,F10. Composes A05 + concise problem + grouped A01 actions. Distinguish invalid input, unavailable storage, quota/transaction failure and stale revision. Retry save is primary when safe; Export on-screen data preserves work; Reload saved copy warns that unsaved changes will be lost. Do not hide these behind a transient toast. Dismiss may hide redundant notice but cannot make blocked saving look healthy. Alert announced once; no infinite polling or automatic reset. Workbench demonstrates these with fixture state only.

### M14 ProtectionSummary

F10. Three separate rows: Local record, Offline app, External backup. Each has distinct status and explanation. Storage permission does not prevent device loss; installing does not create backup; file download initiated does not prove external safe retention. Export is the clear primary utility action. No giant shield claiming security or permanence. Request persistence is optional secondary action.

### M15 ImportPreview

F10. Native file input + validation state + preview summary + explicit merge confirmation. Show relevant counts and active-draft conflict before mutation. Invalid schema/checksum/unsupported version/conflict preserve all current data and explain what to do. Identical records dedupe; differing same-ID records reject under existing policy. Preview is not a restore. Loading is not success. Import success reports actual merged result. File names wrap safely and are not raw HTML.

### M16 EmptyState / ResumeSummary

F01,F06,F09. Short title naming the next useful action, factual body and one action. First session history says No finished workouts yet, not Your best self starts here. Resume names movement/date/actual count and pending intent where known; cannot say All saved if failure is unresolved. A skeleton or empty record must not resemble a completed set. Offline with no precached app is explained honestly rather than promising eventual background recovery.

### M17 Surface / DSDisclosure

F01–F10. `Surface variant:'worksheet'|'utility'|'inset'|'plain'`, semantic `as` when needed; default plain unless ownership warrants material. Worksheet: one active task,12pxradius,16pxpadding, rule edge. Utility: backup/recovery independent section,8pxradius. Inset: a distinct subtask inside a sheet,8pxradius with subtle material; avoid nested inset-depth>1. DSDisclosure: borderless ruled default, optional inset only when it contains a separate editor or validation subtask. State is controlled or native with correct labels; no nested interactive buttons in summary.

## 7. Initial implementation API and ownership

The component library should export the reusable core before screen migration: DSButton, DSIconButton, DSField, DSStatus, DSSurface, DSDisclosure, DSChoice, DSStepper, DSScreenHeader, DSSetGridRow, DSSetRow, DSEffortChoices, DSComparisonEvidence, DSInlineNotice. Lightweight primitives may live in the same module; separate files are not a product requirement. Flow-specific molecules not yet extracted can be composed from those exports in the workbench and then migrated deliberately. Document any incomplete contract; do not silently claim every inventory item is already coded.

All native button/input/ref attributes must remain usable. Domain state and storage stay outside the library. Components accept controlled values, callbacks and renderable evidence; they must not import personalStore.ts or open IndexedDB. An app adapter can connect the library to existing handlers after review. The DS namespace is `.ds-*`, tokens `--ds-*`. Root workbench is `.design-workbench`; legacy production is `.personal-app`.

Cascade: no broad `.personal-app button/input` rule may overwrite `.ds-button/.ds-field`. During migration either scope legacy baselines to `:not(.ds-*)` or wrap DS styles with deliberate higher specificity at a documented boundary. Prefer removing redundant migrated legacy rules rather than accumulating `!important`. Screen CSS controls composition only; state/material/typography of a DS control stays in its component stylesheet. QA's data/aria hooks can remain stable independently of class names.

The root owns workbench routing/content shell. DS engineer owns `frontend/src/design-system/*`. UX owns this contract and later production composition CSS only after journey/contract handoff. App engineer owns production adapters and preserves transaction semantics. QA owns isolated component checks and existing functional regressions. No active-app screen overhaul during this library review stage.

## 8. Workbench content and review sequence

The workbench must make the design inspectable as a system, not just show another dashboard screenshot. Label every example Illustrative sandbox; no real workout data. Include:

1. Direction board: title, principle, typography scale, color/material tokens and contrast notes.
2. Atoms: every action variant and focus/disabled/loading/error state; fields with hint/error; transaction states separated from backup/offline statuses.
3. Molecules: focus selection/count, plan line, active/draft/saved/future/error/correction set rows, optional effort, swap attribution, completion, comparison evidence, recovery and import preview.
4. Small state demonstrations: edit a fixture draft, tap Simulate saving, then explicitly choose Commit succeeds or Commit fails. A failure retains values; Retry can return to saving. Do not represent arbitrary timeouts as real reliability.
5. Flow-to-component map with canonical F01–F10 and the component IDs above. Link to full PM journeys/flows.
6. Narrow viewport fixtures320 and390, normal browser zoom and keyboard focus path. No fake phone bezel that makes the content too small to inspect.

Review order: service blueprint and jobs → IA and flows → direction/tokens → atoms/states → molecules → composed screens. Only then migrate production. A component gallery is a design review artifact; its example values are not personalized exercise advice and its simulated persistence is not real storage.

## 9. Acceptance and evidence boundary

Before handoff is treated as implemented: inspect320/390 and desktop, test keyboard focus/labels/disabled actions and reduced motion, compare actual computed contrasts, verify state fixture draft/error retention, ensure all library examples are data-isolated, and record which exports/inventory items exist. After integration, rerun real logging/correction/swap/effort/progress/backup/offline/revision checks. Do not substitute a screenshot for transaction testing.

Human validation remains future work. Ask the actual user to try a short real-device scenario: reopen a session, log two sets one-handed, correct one, swap a busy machine, finish partial work and identify why a progress comparison qualified. Observe confusion and hand travel rather than asking only whether it looks good. Until then, low cognitive load, comfort, delight and speed are design hypotheses.

## 10. PM component-ID crosswalk and readiness review

The PM's C01–C12 IDs describe flow-level responsibilities; A/M IDs above describe design-system building blocks. They are complementary, not competing naming schemes.

| PM contract | Design-system parts |
| --- | --- |
| C01 local-state indicator | A05,A11,M01,M14 |
| C02 muscle selector | A07,A09,M03 |
| C03 bounded count | A03,A01,M04 |
| C04 movement summary | A04,A09,M05,M06,M12 |
| C05 set ledger row | A03,A06,M07,M08 |
| C06 contextual disclosure/action | A01,A02,A12,M08,M09,M10,M17 |
| C07 conditional confirmation | A01,A10,M08,M09,M11,M15 |
| C08 validation/recovery | A03,A05,A11,M13,M15 |
| C09 effort choice group | A07,M10 |
| C10 evidence summary/details | A04,A09,A10,M12 |
| C11 backup preview | A03,A05,M14,M15 |
| C12 destination control | M01,M02,M16 |

UX reviewed the completed PM journeys, IA and transition tables. Agreement: canonical F01–F10 map to this system; primary frequency hierarchy and crosscutting preservation constraints are retained. The visible qualification next to C10's numerator/denominator is mandatory, not an optional buried detail. Library implementation may now proceed as an isolated sandbox against this contract. This readiness means PM/UX artifact consistency, not user approval of polished screens or permission to bypass actual-app regression checks. Production screen changes remain paused until the component workbench is reviewed.

## 11. First rendered-library review — contrast blocker

UX inspected actual captures tests/artifacts/design-actions.png, design-fields.png, design-ledger.png, design-effort.png, design-evidence.png, design-recovery.png and design-ledger-390.png. The ledger itself demonstrates the intended alignment, restrained worksheet, rectangular controls and explicit row states. However, the component gallery inherited the light workbench paper while its labels used light DS ink; some headings inside dark surfaces inherited dark workbench ink. That made task titles, field labels and evidence headings unreadable. The token-pair calculations above do not validate a composition that uses the wrong background.

Readiness was withheld. Required fix: an explicit dark DS gallery boundary independent from the light research whiteboard, explicit DS text/headings on their actual material, and repeated screenshots/computed checks of the rendered result. No production composition work begins until that blocker is resolved. This review is deliberately specific: passing isolated control tests did not catch the inherited heading/canvas conflict.

## 12. Corrected rendered-library review — internal composition ready

UX re-inspected the refreshed actual captures design-actions.png, design-fields.png, design-ledger.png, design-effort.png, design-evidence.png, design-recovery.png and design-ledger-390.png in tests/artifacts. The gallery now has its own dark canvas and readable chalk headings; worksheet headings no longer inherit dark research-page ink. Qualification labels have content-sized geometry instead of stretching into banners. The action hierarchy, controlled numeric strings, distinct saved/draft/future/saving rows, explicit saved-row Edit, optional wrapped effort module, visible evidence caveat and consequence-led recovery controls match the reviewed anatomy and F01–F10 interventions. The earlier contrast blocker is resolved in these renders.

QA independently reports six isolated checks passed, including actual nearest-background heading contrast and narrow-layout/state behavior. This permits internal production composition using the reviewed components and existing transaction handlers. It is not a claim that all screen compositions are finished, that human users validated the design, or that browser data is permanently safe. Production adapters, CSS boundaries and complete existing app regressions still need verification. No further visual change should bypass the same flow/component reasoning.

## 13. Production composition review in progress

UX inspected the first actual adapted planning, lineup and session captures (/tmp/ds-plan.png, /tmp/ds-lineup.png, /tmp/ds-session.png). The application now uses the same warm materials, ruled lineup, active worksheet, explicit saved-row Edit and controlled numeric-row anatomy as the library. Review found two integration issues that isolated fixtures did not reveal: an unconditional hidden generic loading label widened small header actions and forced unnecessary title wrapping; legacy save-marker styling added a second marker around DSStatus. The former was assigned to the component owner; the latter and an incorrect legacy row-exclusion selector were corrected at the production composition boundary. These are composition defects, not permission to change storage/domain behavior. Final captures and existing app regression evidence remain required before delivery is marked complete.

## 14. Final main-capture composition review

UX independently opened a fresh isolated Chromium context against the actual app at port5180, selected Chest + Back, built the lineup and started a session. The resulting /tmp/ux-final-ledger-session.png shows the corrected intrinsic-width Finish action, one-line session title, single save indicator, all three planned row positions, unchanged four-column input/commit geometry, shallow worksheet and compact ruled collapsed exercise. The main capture composition is ready for delivery subject to final narrow-viewport/backup and functional regression checks. This independent visual walkthrough used an ephemeral browser profile; it did not inspect or alter a user's existing notebook. It establishes rendered hierarchy at390px, not real-gym usability or a human preference result.

## 15. Progress composition blocker and correction

The final QA capture tests/artifacts/muscle-evidence-390.png exposed a separate F09 composition defect: the production overview retained two columns at390px, and its old direct-child `details[open]` expansion selector did not match the nested DSComparisonEvidence anatomy. Actual evidence was squeezed into a narrow left column with wasted space beside it. UX inspected that capture and withheld Progress visual completion.

The composition grid now requires a280px minimum reading column, so phone summaries use the full width and multiple columns appear only when sufficient space exists. A lone summary always spans the grid, and any descendant open details expands its enclosing evidence group across the grid. The fix restores the existing F09 reading-width contract; it does not change eligibility or progress data. A refreshed actual evidence capture is required to confirm resolution.

**Resolved after actual reinspection:** UX reviewed the refreshed tests/artifacts/muscle-evidence-390.png and muscle-performance-390.png. The summary and opened evidence now use the full available phone reading width, the numerator/denominator and effort qualification are visible before expansion, and dates/ordered actuals are legible without the previous empty right column. The F09 width blocker is resolved.

UX also reviewed final design-app-capture-320.png and design-app-choose-320.png. The selected muscle tiles retain complete names and supporting glyphs without clipped text; the actual worksheet keeps ordinal, weight, reps and explicit record control aligned at320px; the session title and Finish fit their intended roles. Final visual composition review is complete. QA reports29 checks passed with one intentionally skipped development-only offline case; the separate production Pages/offline verification remains the release evidence for that capability. Human physical-device comfort and subjective preference are still unverified.

## Current typography contract — 18 October workout audit

This supersedes earlier per-component size and monospaced-register rules. Shared tokens now define three text roles, used by both scenes and the interactive component library:

| Role | Token | Size / line | Use |
|---|---|---|---|
| Heading | `--ds-type-heading-size`, `--ds-type-heading-line` | 28 / 34 px | Screen titles and large factual numbers |
| Subheading | `--ds-type-subheading-size`, `--ds-type-subheading-line` | 18 / 24 px | Section and exercise titles |
| Reading / action | `--ds-type-body-size`, `--ds-type-body-line` | 14 / 20 px | Body, metadata, labels, actions, supporting text |

Accent is weight/color, never another font family or size. All roles use the same system sans family; numbers may use tabular alignment. Uppercase tracking and monospaced eyebrows are removed. Editable inputs alone retain `--ds-type-input-size:16px` minimum to prevent mobile focus zoom; prominent numeric entry can use the existing subheading size. Screen width does not invent new sizes. Home loses its motivational hero/eyebrow; section names are direct. Chart endpoints and totals share the reading role, not tiny captions.

A real rendered Home inspection after this change found exactly 14, 18 and 28 px among its visible text leaves. Narrow layouts and the complete workout are checked in `TWO-SCREEN-WORKOUT-AUDIT.md`. These are browser checks, not proof of physical gym usability.
