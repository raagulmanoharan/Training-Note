# Training notebook: instrument reference study

User direction, 18 October 2026: Teenage Engineering as visual reference, with utilitarian fonts, restrained color and noise rather than generic gym imagery. This supersedes the script wordmark and athlete illustration in the previous dark study.

## Research actually performed

Root searched the web, opened the official EP–133 and OP–1 product pages in Chromium, captured the pages and visually inspected the product controls. The UX designer reviewed logging semantics and the graphic designer composed the new interactive study. These are design reviews, not interviews or human usability research.

Sources:
- https://teenage.engineering/products/ep-133
- https://teenage.engineering/products/op-1
- https://teenage.engineering/products/op-1/original/overview

Local captures: `docs/design/references/te-ep-133-panel.png`, `te-op-1-panel.png` and `te-ep133.png`. The EP–133 page itself uses a noisy photographic campaign; the relevant inspiration here is the physical instrument panel, not that campaign's subject.

Observed: silver/off-white casing, recessed black display, aligned modular controls, black/off-white keycaps, a few orange controls and fine utilitarian lettering on EP–133. OP–1 pairs light physical controls with a small black display and restrained colored visual feedback. These are observations of the displayed references, not a claim that every product shares one palette.

The EP–133 website body reports `te-20, Unicode, sans-serif`. We are not bundling or claiming to use its official font. The prototype uses system sans for words and system monospace for numbers, chosen for a similar utilitarian character and portable offline rendering.

## Translation into the gym journey

Before training: a date matrix answers 'have I been showing up?' Each lit cell is a visit day, not an arbitrary texture. The workout launch action stays prominent.

At a machine: weight and repetitions are editable registers, with direct numeric entry and increment controls. Last time is a distinct reference, never silently counted as performed work. Log set is a strong physical-looking action.

Between sets: the sequence marks actual versus remaining sets. Optional effort is expressed as good-form reps left, with no initial selection. The optional rest timer is the only time-driven display.

At an occupied machine: a contextual replacement sheet clears the new load and retains the source of any already logged sets.

Next week: progress describes comparable recorded performance. No muscle-growth meter: overloading is evidence of performance change, not a measurement of tissue growth.

## Component rules

Keep two primary screens and contextual sheets. Reuse the existing heading/subheading/reading hierarchy; numeric inputs remain large and editable. Small corner radii, aligned borders, shallow keycap shadows, off-white secondary keys and a restrained orange primary action establish the new vocabulary. Keep grain low contrast and outside text, input and chart ink. No flashing static, random live waveform, athlete photographs or anatomy decoration.

This iteration is a standalone memory-only design prototype. It does not replace the production IndexedDB logger or implement persistence, routines or history upgrades. Production storage must keep its existing transaction and backup guarantees when the approved components are integrated.

## Executed final prototype check

After the final neutral-palette and static-grain changes, root ran `node scripts/review-instrument-direction.mjs` in Chromium. Passed: 320/390px overflow checks; dialog focus/Escape return; nine-set session; weight/reps steppers; correction; source-preserving swap with cleared replacement load; optional effort initially unselected and then recorded; optional rest; finish; and deduplication of repeat visits on the same day. Zero page errors, external HTTP requests or IndexedDB opens. The initial Log control is y660–710 at390×844. Captures: `design/instrument-home.png`, `design/instrument-workout.png`; machine-readable evidence: `design/instrument-prototype-review.json`. These checks establish prototype behavior, not production persistence or human usability.
