# Production redesign UX handoff

18 October 2026. This handoff follows the independently executed [fresh usability walkthrough](FRESH-GYM-USABILITY.md) of the standalone dot-direction prototype. That evaluator inspected only rendered prototype behavior, not source or earlier design documentation. Its persona is synthetic: browser observations are real, but sweat, thumb comfort and feelings are not empirically tested. The recommendations below are UX interpretation, not further findings.

## Boundary: fix the real app

Implement these changes in the actual IndexedDB-backed personal tracker, not just the memory-only prototype. Preserve current actual IDs, pending inputs, revision protection, transaction receipts, export/import and offline behavior. The prototype's high-severity inability to retain newly entered history is not evidence of a production persistence defect: it was disclosed as memory-only. Production acceptance must demonstrate its existing persistence rather than copy prototype reset behavior.

Keep two primary screens. Existing latest-session repeat remains labelled as repeating logged work. Named routines, arbitrary earlier-session selection and longitudinal chart capability remain separate proposed Sprint 1/2 work unless actually implemented and tested; mockups must not make them look shipped.

## Findings translated into delivery contracts

| Observed finding | Production intervention | Acceptance |
|---|---|---|
| Set 1 Edit at y930.5 after optional effort; Next at y1003 on390×844 | Actual ledger and latest result/edit precede optional effort. Visible `Edit`, not pencil alone. Effort disclosure stays secondary, initially collapsed. | Log first actual; result and Edit do not get pushed down by a newly inserted optional question. Correction/Cancel returns to same actual. |
| Log near bottom at320×740; large header/art before inputs | Active exercise rendered first, compact header/reference, no hero exercise image. Exactly one draft entry. Other exercises become compact original-order switcher. | At320/390 the active title, Swap, last reference and draft are clear; normal log is initially reachable without repeated scrolling. Keyboard checks remain required separately. |
| Review Start below initial viewport (y844) | Reduce decorative review content; existing movement list plus prescriptions/setup. Keep Start visible in review with contained scrolling or action footer, safe-area padding. | No entire-sheet hunt for Start. Invalid field focuses and stays visible; footer cannot cover input/error or disable scrolling to last movement. |
| One offered replacement strands user if also occupied | Production's existing catalogue alternatives render as an honest list; Cancel and switch to another planned exercise remain obvious. | No automatic first-choice substitution. Original actuals preserved; replacement gets no trusted old-machine load. If no alternatives, show explicit empty state and direct other-exercise navigation. No fake custom-exercise capability. |
| Dumbbell kg convention unspecified | Show explicit record convention next to equipment/load where reliably known. Do not infer meaning for legacy values. | New copies must not silently reinterpret existing combined/per-hand history. If model lacks convention, use an honest setup reminder (`Keep the same per-dumbbell/combined convention`) and flag richer persisted convention as separate domain work. Do not claim historical comparability established by copy. |
| Partial finish lacks clear receipt; `1 sets` | Brief factual completed receipt, singular/plural correct. Actual count first; unperformed planned count only if accurately computable after swap. | Finish one actual: `Workout finished · 1 set recorded`. Never fill unperformed actuals or claim stable routine persistence that is not implemented. |
| Prototype resets/history illustrative | Verify production end-to-end actual log, correction, swap, partial finish, reload and backup. | Same real actual IDs survive; muscle performance derives from actual records and setup, no hardcoded illustrative trend. |

## Core journeys and screen order

### Arrive knowing the workout

Home: compact notebook header → active Continue or existing repeat/build action → compact attendance → factual progress. Put the useful action before a large attendance graphic. Existing empty Home offers Plan workout, not seeded Chest day. Review opens directly; Start is visible and commits one current session. Cancel preserves prior data. A selected routine chooser shown in image concepts is not permission to imply one exists.

### Between sets

Workout: compact Home/Finish header → active title with adjacent Swap → prescription/setup line → concise Last time reference → actual ledger → one editable row with explicit Log → compact secondary controls/exercise navigation. If actual ledger becomes long, retain clear access to current entry; do not bury it behind future ghost rows.

Saved rows show exact actual numbers + saved check + Edit. Future plan is summarized by completed/planned count; remove placeholder rows containing values or repeated steppers. Draft has distinct input boundaries and Log label; it is not marked completed. Loading is operation-specific: `Saving set`, `Saving effort`, etc. Save failure keeps numbers and Retry, with no fake check. Existing current/history correction and delete/undo continue to work.

Use last time fills a draft only. If keeping existing immediate actual-repeat action, its label must explicitly say Log/Repeat set; never make clicking historical reference silently record a new actual. Do not automatically switch exercises on third set: the person may add, correct or stop.

### Machine busy, interruption, leave

Swap belongs beside active title, alternatives inline/contextual, cancel exact prior draft. Switching exercise preserves all other pending input. Visually foreground active exercise without changing stored exercise order or IDs. Original actuals remain on original identity after swapping remaining work. Phone reload restores current actual/draft. Finish warns about typed unlogged values in any exercise; partial finish preserves actuals and returns to Home with receipt. No forced effort, timer, routine-update or celebration step.

## Generated reference critique

Reviewed `/workspace/generated_images/exec-33a7bc8e-b9d9-4d42-929a-cc3d96854d48.png` as inspiration only. Retain its compact set ledger, obvious Swap, clear units and broad explicit Log. Reject duplicated steppers for all future sets, large attendance taking priority over launch, decorative progression sparkline without real data, misleading checkless prefilled rows and proposed chooser/routine capabilities masquerading as existing functionality. It is a generated image, not tested layout or functional evidence.

## Visual meaning, not decorative complexity

Offwhite/charcoal/orange flat direction can remain. Dot muscle glyphs orient target selection, not measured growth. Group progress requires coverage and truthful missing/harder effort qualification; keep these visible when they change interpretation. No fake equalizer, hardware panel labels, noisy numeric background or chart without actual dated setup-specific data. Existing functional type roles remain28/18/14 with editable inputs at least16; a large input may reuse28, not invent multiple extra ramps. Accent is orange/action weight, not an eyebrow category.

Exact weight/reps inputs remain keyboard-editable; steppers use configured load increment and reps1. Root owns shared DS implementation and CSS; engineer owns screen layout and existing state handlers. Optional effort uses plain-language choices and no default selected score. Accessible names include units/record action; targets at least44px, focus states, live saving/error status, safe area and zoom honored.

## Ownership and verification

Engineer: `PersonalApp.tsx`, `TrainingHome.tsx`, `MuscleGlyph.tsx`, `personal.css`, `training-home.css`. Root: shared design-system component/CSS and typography integration. UX: this handoff only. No independent model/migration changes implied here.

Capture actual production Home, draft, saved/edit, swap and partial-finish states at320/390 after implementation. Exercise the real persistence controller, not the prototype script. Relevant regression tests + production Pages offline/subpath check required. Check keyboard occlusion on a real phone when available; do not claim that a headless screenshot establishes one-handed comfort.
