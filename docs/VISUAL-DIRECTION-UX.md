# Visual direction: a dark training notebook

19 October 2026. Proposed visual/interaction direction, not an implementation or usability finding. No human research was conducted for this handoff. Preserve the existing Home/Workout architecture; the named-routine selector remains proposed Sprint 1 work, not a shipped capability. Read alongside [Sprint 1 UX](SPRINT-1-UX.md) and the graphic designer's new visual handoff.

## The change in emphasis

Give the person a place to act, rather than a page explaining the app. Home answers **what to train and what changed**. Workout answers **what I did before and what I just did**. Both use a dark material palette; distinguish orientation from capture through layout and density, not a light/dark mode switch.

Use visual grouping, alignment, meaningful marks and controlled disclosure to remove repetitive text. Do not replace useful facts with ambiguous icons. Exact recorded numbers, dates, setup and draft/saved distinctions remain available at their decision point.

## Home composition

1. A single decorative heading may say **Training** or the user's chosen routine name. Avoid stacked eyebrow/heading/subtitle blocks. A small date is justified only if it anchors recorded information.
2. A compact four-week visit strip is the attendance visual. Filled day marks mean recorded visit dates, with adjacent `14 visits · 4 weeks`; screen-reader labels expose actual dates. No flame, broken streak or “growth” bar. Tapping reveals exact recorded sessions in the existing contextual history surface.
3. One dominant workout launch area: selected routine title, compact overlapping muscle-region illustration if accurate, and ordered exercise names in a horizontal/vertical readable list. Show `4 exercises · 12 sets` once. Use a broad tactile Review/Continue button, not several equal CTAs. Existing latest-session repeat must remain honestly labelled as logged-work repeat until saved routines exist.
4. Secondary Choose/Build controls sit together below launch, visually quieter but with generous hit areas. These are proposed new choice semantics for Sprint 1; existing Build remains available.
5. Progress uses compact ruled muscle rows: muscle name, direction glyph, actual fact such as `+2 reps`, and coverage such as `1/2 lifts comparable`. Only compute a numeric delta where the underlying exact comparison supports that number; otherwise use `Mixed`/`No match`. Tap opens the existing evidence detail, including dated actuals, exclusions and effort. Do not hide harder/missing effort if it changes the headline's meaning: a small explicit `Harder effort` or `Effort unknown` line stays visible.

Keep first-use Home genuinely empty: zero recorded visits, Choose/Build action, neutral progress placeholder. Do not fabricate a populated body illustration or trend.

## Workout composition: notebook first

- Header: human workout name, compact completed/planned working-set count, Home/close control. Decorative header face is allowed here only if legible; controls use the functional face.
- A compact exercise rail/list exposes all exercise titles and completed counts, allowing direct jumps. Avoid one numbered onboarding step per exercise. Swapped original and replacement remain distinguishable, not one merged performance.
- Active exercise: readable functional title, target/setup in one secondary line, visible Swap control. Setup expands in context; new setup is not equivalent to last machine.
- Previous results occupy a short aligned reference row above today's worksheet, e.g. `Last · 60 × 10 / 10 / 9`. The word Last and date/context must establish that these are history, not today's completion. Expand for exact set/setup details if they do not fit.
- Worksheet columns are consistent: Set / kg / reps / record. Current editable row is the strongest surface; saved rows carry a check and actual numbers, future rows remain visually quiet. Do not make a filled field look saved.
- **Weight and reps:** exact keyboard input is primary, with meaningful minus/plus controls. Weight step follows configured equipment increment; reps step is one. Values never change merely because a slider thumb moved accidentally. Large hold-to-repeat can be explored only with deterministic keyboard/touch behavior and no unwanted commits. No free-running slider for weight/reps.
- **Log control:** large rounded-square check with accessible `Log set N` label, visible pending spinner during real transaction, saved mark only after commit. A check alone is acceptable with column context and accessible naming, but first-use hint may briefly clarify “Tap after your set”; never imply auto-save actuals.
- Add set is one quiet full-width or inline control below rows. Finish is reachable and reveals the existing actual-count/pending-warning confirmation; no mandatory celebration or effort questionnaire.
- Optional effort appears after saved actual as a compact segmented choice `0 / 1 / 2 / 3 / 4+` with heading **Good reps left?** and endpoint words `None` / `Plenty`. No RPE acronym required. Choice labels remain accessible as “2 good-form reps left.” Selection is an explicit metadata save, may be cleared, and never blocks continuing. If text reduction makes this unclear, retain full plain-language choices instead of forcing unfamiliar iconography.

## Functional versus expressive typography

Keep the agreed functional hierarchy: 28px heading, 18px subheading, 14px reading/actions, minimum16px editable input. Use weight/color as accent, not additional tiny metadata ramps.

The requested Jane Austen typeface is an **expressive header candidate pending verified font source/license/readability**, not a reason to use script throughout. Limit to one short page/routine heading per viewport. Avoid it for exercise names, load/reps, charts, error text, setup identity, buttons and anything read under fatigue. Provide system-font fallback. If `Upper A`, numerals or common movement names become hard to distinguish at28px, keep those functional and use the decorative face only for a short notebook title. Do not ship a font with unresolved embedding rights.

## Rich controls with clear meaning

Buttons can feel physical through restrained fill, border and pressed-state depth. No thick ornament, fake hardware, universal pills or excessive animation. Haptics are optional enhancement when available; visual state must remain sufficient. Sliders are appropriate only for bounded approximate preference, not precise actuals. This app currently has no essential slider task; a counter is better for planned sets and exact load/reps. Do not add sliders simply to satisfy a visual motif.

Muscle imagery can orient broad group selection if paired with names and correct highlighting. It must not imply measured hypertrophy, anatomical completeness or automatic training assessment. Exercise photos/videos are optional secondary aids for a knowledgeable user, not large backgrounds competing with the log. Root owns image/font sourcing and licensing.

## Disclosure and honesty rules

- Replace repetition with one visible source of meaning; never remove essential qualifier to achieve a clean mockup.
- Hint off: no advisory block. Hint on: one short contextual sentence with expandable factual basis. Hard recorded effort must not become an increase CTA.
- Actual save failure stays visible at row/operation, preserving input and Retry. Success remains transaction-backed; no timed animation substitutes for storage.
- Dark palette requires measured contrast across default, disabled, focus, selected, saved and error. Do not encode status only in mint, amber or opacity.
- Dialogs remain one layer, with accessible title, close, focus trap/return, preserved draft and safe-area/keyboard handling. Two main screens do not eliminate these states.
- Active session always wins Home priority; new selection cannot overwrite it. Partial finish and swaps never mutate a saved routine silently.

## States to render before implementation sign-off

Home: empty; active resume; latest logged-work repeat; proposed selected routine; partial comparison; harder effort; no comparable setup. Workout: empty current row; typed unlogged row; saving; saved; failed retry; correction; swapped movement; setup unknown; keyboard open; finish partial/pending warning. Include narrow320px, long exercise names, text zoom and reduced motion.

The static visual proposal must label synthetic data and planned capabilities. After implementation capture real screens and run real save/reload/partial/swap/backup checks. Human ease, one-hand comfort and delight remain to be tested by this user at the gym.
