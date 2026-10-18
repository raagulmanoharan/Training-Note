# Dark visual direction: graphic design handoff

18 October 2026. This is a proposed design direction, created in collaboration with the UX agent. It is not a production redesign or a human usability result. `docs/design/dark-direction.html` is a portable interactive study with synthetic records and JavaScript memory only. Reload deliberately resets it; no database or network service is used. The earlier sprint board remains historical context rather than the visual direction to implement next.

## What changes meaningfully

The existing light Home/dark Workout scheme, repeated explanatory captions and generic flat rows are superseded for this direction by two consistently dark scenes. Home is a compact visual training notebook: an actual 28-day attendance matrix, one chosen-workout launch surface with highlighted body diagram, and a ruled lift comparison with a restrained sparkline. Workout becomes a tactile instrument: two exact-value counters, obvious decrement/increment buttons, one dominant Log action, a small completed-set rail and an optional effort/rest area. The identity comes from rich dark materials, original anatomy drawing, one generated engraved exercise illustration and one short handwritten wordmark, rather than a large motivational headline.

A full-width lime button is the primary action. A real outlined/elevated rectangle is a secondary action. No important Choose, Swap, Next or Finish action is merely decorative text. Tiny text, all-caps eyebrows, stacked labels and automatic muscle-growth scores are absent. The illustration identifies an exercise; it is not a tutorial or verification of correct technique.

## Palette and material

| Role | Value | Intent |
| --- | --- | --- |
| Canvas | `#111512` | Rich near-black; consistent across both scenes |
| Sheet | `#1A201B` | Shallow local reference surface |
| Raised control | `#252D25` | Tactile numeric input and secondary action |
| Ink | `#F3F0E7` | Warm chalk rather than harsh blue-white |
| Secondary ink | `#ADB6A9` | Actual context and qualifiers, still readable |
| Control/rule | `#414C3E` / stronger interactive borders | Separate controls without a card around every fact |
| Accent | `#D5F46A` | Single acid-lime for primary action, target highlight and actual completion |
| Ink on accent | `#19200B` | Clear action labels |
| Error | `#FFB9AB` | Actual invalid/failure state, not missing optional data |

A subtle olive radial wash within the launch surface gives depth without a neon-glow wallpaper. Primary buttons have a restrained 3px dark-lime lower edge and inset highlight; secondary controls have a visible border and surface. Numeric steppers are separate tactile hit areas inside the field material. Avoid gradients behind evidence or a pattern of ten identically rounded cards.

## Typography and the Jane Austen request

Keep 28/34 heading, 18/24 subheading,14/20 reading/action, with the same functional sans family and tabular numbers. Editable number counters may use the heading role; supporting editable fields remain at least16px. Accent is weight/color, not a fourth ramp. No tracked uppercase or monospace metadata.

The verified Jane Austen package has a personal-use/redistribution constraint and unusual operator glyphs. The portable prototype contains only `@font-face` with `local('JaneAusten')`; it embeds no licensed font bytes. If absent it falls back to a serif. Root may inject the verified local font for private screenshot review. Use the real face only for `Notebook`, never arithmetic, dates, numeric inputs or functional labels. The wordmark uses normal font-style rather than a synthetic italic. The fallback is not a claim that the intended Jane Austen font is displayed. Do not ship the font to a public repository until the intended distribution license is resolved.

## Visual anatomy and generated media

Home uses an original inline SVG body diagram. Only the selected target is lime; it indicates the intended workout target, not actual muscle growth or a precise anatomical coverage assessment. Front-facing Back selection is only a schematic target cue and would benefit from a dedicated posterior-view drawing before production; do not claim anatomically comprehensive muscle mapping.

The generated multi-screen concept was used as a visual reference for material, compact imagery and tactile controls, not as a source of UI data. Its attendance and chart numbers were inconsistent and were not copied. The generated transparent bench-press illustration is embedded unmodified in the standalone HTML. It appears only for the exact Bench press identity, is contained with padding and has empty alt because the adjacent exercise name already labels it. It disappears when swapping to a different exercise, avoiding incorrect barbell imagery for dumbbell work. It is decorative, not exercise instruction or clinical/form advice.

## Scene composition

### Home

1. Short handwritten wordmark and one identifiable settings button.
2. Factual visits count and 28 cells, with a distinct today outline. Count and filled cells share the same data. Multiple workouts on one day remain one visit day.
3. One selected-plan surface, target illustration, intended exercise/set counts and solid Review workout. Selection is a synthetic deliberate choice; not an inferred schedule.
4. Obvious outlined Choose workout and exercise-count adjustment.
5. One compact Progress example with exact lift/load/repetition delta and a visible effort/setup qualifier. A tap opens a proposed future trend view with explicit illustrative/future labeling. This is not a newly implemented Sprint1 chart.

Routine preview is a contextual sheet in Home. Target choices, exercise count, intended list and visible Gym entry fit the task. Start is explicit. A selection never creates an actual. Real stable named routine storage remains an engineering scope item; this visual study demonstrates choosing a fixture, not a completed routine data model.

### Workout

1. Home return and visible Finish button; session title and actual/planned set rail.
2. One active exercise with a small engraving only where identity matches, equipment/repetition context and visible outlined Swap.
3. Last-time factual reference with explicit Use action. Use fills draft values; it is not a recorded set. Swapped/new setup has no fabricated historical reference and asks for a working load.
4. Exact weight/reps fields with separate minus/plus controls. Weight steps0.5kg in the fixture, repetitions step1. Direct typing is always available; production increments must respect actual equipment/unit configuration, not assume0.5kg everywhere.
5. One solid Log action. On explicit action the fixture adds an actual to memory; completion marks appear only afterward. No green checked draft row.
6. Optional estimated good-form repetitions left after a log. Prototype uses a native five-stop slider with named current value and visible endpoint meanings. It begins unrecorded until the user acts. UX prefers a segmented0/1/2/3/4+ control as a precise accessible alternative; use physical tryout to settle it rather than adding both controls.
7. Optional rest toggle and skippable timer. These are proposed interactions, not an essential Sprint1 requirement or existing shipped capability. They never block logging or moving on.
8. Compact actual rows expose corrections. Next/Previous are buttons. Finish explains unperformed sets remain unrecorded; the intended plan is not silently shrunk.

## States that must survive production adaptation

The prototype distinguishes reference, typed draft and recorded fixture sets. The real app additionally needs pending transaction, failure/retry and revision conflict. Do not simulate a timeout and call it a successful database commit. Invalid input retains entered values and exposes a readable message. A storage failure must leave the draft editable with an explicit retry/export recovery path. Missing gym is not a failure to log; matching performance evidence is withheld with the actual reason. Partial finish, swapped original actuals, unknown effort and named-routine intention all retain their existing domain meanings.

The prototype explicitly retains per-set exercise/equipment identity after a swap; it clears the replacement draft weight and removes the old Last time reference. It does not equate machine loads. Sheet focus enters the dialog, Tab/Shift+Tab wrap, Escape closes, and focus returns to its trigger. These behaviors remain requirements, not reasons to introduce additional main screens.

## Actual review and limits

The graphic agent opened actual390px renders of both scenes using Chromium with `page.setContent`. A plain file navigation was blocked by browser policy, so that was not reported as a working hosted link. The reviewed initial captures showed no page overflow, clear light-on-dark fields and a visible primary logging action. The generated bench illustration was subsequently integrated as a compact heading-side visual; root must review final captures after this addition.

An executed isolated walkthrough at320 and390 completed all nine planned sets, added optional effort, swapped after an actual and verified the original exercise/equipment label, then finished and checked13 filled visit days. A second partial workout on the same synthetic date retained13 visit days. Both runs had zero page errors, zero requests and no horizontal overflow. This run preceded the final illustration-only integration; the final root check must confirm its image loads and does not push the primary capture control beyond the intended viewport.

The prototype is not a persistence test, production regression suite, real-phone ergonomic observation or human research. It cannot establish app retention, strength improvement, anatomical accuracy or the user's preference. Final review should compare actual screens with the current app, test one-handed log/correct/swap behavior and verify that visual control simplification has not removed evidence, optionality or transaction truth.
