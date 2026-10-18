# Dark, visual two-screen direction

18 October 2026. This is a new interactive design prototype, not a replacement for the production logger. Existing production screens, stored workouts and IndexedDB schema were not changed. UX and graphic design agents coordinated directly; a separate image-generation agent produced the composition reference and transparent bench illustration. Root inspected the generated images and independently exercised the prototype. No human research, real training session or medical technique instruction is claimed.

## Art direction and information design

Both scenes use the same dark palette: canvas `#111512`, sheet `#1A201B`, raised olive `#252D25`, warm ink `#F3F0E7`, secondary `#ADB6A9`, rule `#414C3E`, acid-lime action `#D5F46A`, action ink `#19200B`, error `#FFB9AB`. Filled raised lime buttons are primary; outlined, filled secondary controls look and behave like buttons rather than navigation prose. Shadows are restrained and motion respects reduced-motion preference.

The short editorial wordmark uses Jane Austen when installed, with a serif fallback. Functional headings, names, arithmetic, units and actions stay sans-serif. The functional type roles remain heading28, subheading18 and reading/action14, with editable fields at least16. Accent is weight/color rather than a collection of extra text ramps.

The same facts are represented more visually: exactly28 attendance cells, target-muscle illustration, a workout set-progress rail, discrete completed/current set marks, precise numeric steppers and optional plain-language effort range. Important facts remain words/numbers where a picture would be ambiguous. Muscle highlights identify the chosen target, not measured growth or recovery. The trend panel is explicitly labelled a proposed future view and uses synthetic records; it is not a newly implemented long-term analytics feature.

Home and Workout remain the only primary scenes. Choose/review/setup, correction, swap, progress, finish and settings are contextual sheets. There is no hidden production routine persistence or fabricated personal record history behind the study.

## Actual imagery and font handling

`design/dark-generated-reference.png` is the generated composition reference. Its attendance/chart arithmetic is inconsistent, so it supplies materials and visual hierarchy only. The interactive prototype does not copy those values.

`design/bench-illustration.png` is generated transparent artwork, embedded into the portable HTML. It appears only for the exact barbell bench exercise, with contain/padding. It disappears on a dumbbell replacement instead of showing the wrong equipment. It is decorative illustration, not form coaching or a user video.

Jane Austen is by Pia Frauss. The original package was downloaded from the [DaFont distribution](https://www.dafont.com/jane-austen.font) and its included `JaneAusten.txt` was read. It restricts use to personal purposes, requires permission for commercial ends, and permits redistribution of the unaltered original zip. The font also maps ordinary plus/equal signs to handwriting ligatures. Those are reasons to keep the typeface out of numeric controls and functional labels.

The prototype references `local('JaneAusten')` and does not redistribute the font binary or embed a remote font. The retained Home screenshot used the original font loaded privately into the review browser. The portable HTML falls back unless Jane Austen is installed locally. Font licensing for any future public/commercial web embedding remains separate; no such permission is claimed here.

## Executed interactive review

Root ran `node scripts/review-dark-direction.mjs` in isolated Chromium, using `page.setContent` because managed file navigation is blocked. The original Jane Austen font was injected only into the private review browser. The execution:

- Verified no horizontal page overflow at320/390 and exactly28 attendance cells.
- Verified sheet initial focus, Escape dismissal and restoration to the launch trigger.
- Loaded the actual transparent image and captured both screens.
- Changed60 to60.5kg and8 to9 reps with the steppers; the Log control created the example actual only after explicit action.
- Enabled optional rest, saw and skipped the timer; chose optional effort and applied a correction.
- Swapped after an actual, retained its original Bench press attribution, hid barbell artwork and cleared the replacement weight.
- Completed all9 sets across3 exercise slots, finished and saw13 recorded visit days/13 filled cells.
- Finished another example workout on the same day without inflating the visit-day count.
- Observed zero page JavaScript errors, zero external HTTP requests and zero IndexedDB open calls.

The first root review found that moving the effort slider updated its model/label without refreshing the recorded row. The prototype now refreshes the row on completed slider change and restores slider focus; the full flow passed afterward. A screenshot with decorative handwriting has a44px wordmark line box to avoid clipping while retaining28px type size.

At390×844, the first Log button occupied y710.9–762.9, inside the viewport including the prototype-only disclosure banner. This is a browser geometry check, not proof of thumb comfort or keyboard ergonomics on a real device.

Machine-readable evidence: `design/dark-prototype-review.json`. Actual rendered captures: `design/dark-home.png` and `design/dark-workout.png` (synthetic data). These are distinct from the generated reference image.

## Try and hand off

Open `design/dark-direction.html` or the identical `/workspace/shared/gym-dark-prototype.html` in a browser. It is portable and uses in-memory fixture data only; it intentionally forgets the example on reload and cannot replace a durable gym log. The optional review script reproduces checks without a server; set `CHROMIUM_PATH` if required. Actual-font review is optional and reads the private local font path when present.

Before production adoption, compose these materials and controls with the real application's persistence handlers and reviewed Sprint1 journeys. Counter increments must use configured equipment/unit increments, current-set focus must survive interactions, essential save/error and unknown-setup meanings must remain explicit, and production history/backup/offline regression must pass. Do not replace those systems with the prototype's simplified fixture model or mistake a future-view chart for delivered analytics.
