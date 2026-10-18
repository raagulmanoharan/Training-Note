# Production usability recheck

18 October 2026, against `http://localhost:5173/`. Same synthetic persona: Arun, intermediate lifter, four weekly visits, knows planned exercises, one-handed phone use between sets, busy machines and next-week comparison. This follow-up is informed by the earlier evaluation; it is not a fresh blind first visit or human research. Production code was not inspected or edited.

Used Chromium/Playwright in fresh isolated browser contexts with no seeded records. No existing browser database was deleted or changed. Viewports: 390 × 844 and 320 × 740. Screenshots: `tests/artifacts/production-usability/`; text/control bounds: `tests/artifacts/production-{initial,log,edit,five,finish,reload,history,six}.txt`. Automation does not emulate sweat, actual thumb reach, a mobile keyboard, or screen-reader navigation. App was under active development during the check, so findings describe the captured build.

## Outcome

The production app substantially improves the original flow. Plan/start works, numeric logging saves, visible latest-set correction works, five sets including two additional sets work, next/swap work, partial completion works, and saved history survives reload. The main remaining gym friction is Next falling below the viewport while an extra-set entry form is open. One observed navigation scroll issue hides completion feedback.

## Actual journey

1. Fresh notebook → Plan a workout → Chest → Build my workout. Default generated Bench press and Incline dumbbell press, three sets each. Start workout at 390 was visible at y609–663, addressing the prior below-fold review action.
2. Started, entered 60 kg and 8 reps, logged set1. Saved count updated and latest record appeared above entry, with a visible “Edit set 1” action. Opened correction, changed reps to9 and saved via the action whose visible text is Save correction (accessible name Save changes).
3. Logged sets2–3 explicitly; used Add set to open and log sets4–5. Latest-first records keep recent correction near the top. Five-set count displays “5 / 3 sets”; the original target remains understandable alongside actual count.
4. Checked both widths after five sets; checked again after opening Add set for a sixth entry. The form was left unlogged.
5. Next exercise moved to Incline dumbbell press. Swap offered Incline chest press (machine). Accepted; replacement notice appeared, new exercise had no working values carried over.
6. Finish confirmation stated “5 actual sets will be kept. Unfinished exercises stay visible as partial.” Save workout returned home with “Workout finished · 5 sets recorded. Export a backup to protect it.”
7. Reload retained one visit and five sets. Opened Last workout: Training history listed the corrected 60×9 followed by four 60×8 records; Incline chest press was marked Partial with No sets logged. History truthfully says two matching complete sessions are needed for comparisons. This verifies local reload persistence and accurate partial records; a second-session trend calculation was not exercised.

## Measured reach and controls

Bounds below were measured after resetting page scroll to zero. Widths are CSS pixels.

| State | 390 × 844 | 320 × 740 |
| --- | --- | --- |
| Five sets logged: latest Edit set5 | x24 y341, 105 × 44 | x18 y341, 105 × 44 |
| Five sets logged: Add set | x24 y489, 108 × 48 | x18 y489, 108 × 48 |
| Five sets logged: Next exercise | x24 y667, 342 × 52 | x18 y667, 284 × 52 |
| Sixth entry open: latest Edit set5 | x24 y341, 105 × 44 | x18 y341, 105 × 44 |
| Sixth entry open: Log set6 | x24 y641, 342 × 56 | x18 y641, 284 × 56 |
| Sixth entry open: Next exercise | x24 y895, 342 × 52 | x18 y895, 284 × 52 |

The bounded history exposes about two recent rows while preserving access to older records. Latest record and Edit are now prominent; they no longer sit beneath optional effort. Log remains visible when adding a sixth set. At 320, Next is visible after completing five sets but requires scrolling once entry is reopened. Screens `05-five-390`, `06-five-320`, `14-sixth-entry-320`, `15-sixth-entry-390` document the distinction. Text wraps cleanly at 320 in these captures; no horizontal overlap observed. Principal log/edit/next controls are at least44 pixels high. Keyboard-open reach remains untested.

## Remaining findings

| Severity | Observed behavior | Synthetic persona implication |
| --- | --- | --- |
| Medium | After Finish → Save workout at320, prior scroll offset was retained (~412px). Success notice and home actions appeared above the viewport: dismiss notice y−272, Repeat action y−62. `11-saved.png`, production-reload.txt. | Arun can miss confirmation and lose page orientation. Reset scroll on completed-session navigation or bring the receipt into view. Reported immediately to engineering. |
| Medium | Opening Add set after five logged sets places Next at y895–947 at both widths, after Repeat, optional effort and setup. `14-sixth-entry-320.png`. | A lifter deciding to move on after opening an additional set must scroll. Keep Next nearer the logging action or move secondary controls beneath it. This is residual friction, not a logging blocker. |
| Low–Medium | This incline swap offered one machine alternative. | If that station is also busy, Arun needs another option or to defer to the next exercise. Next remains available, reducing the original blockage. More alternatives would improve busy-gym resilience. |
| Low–Medium | Dumbbell copy now explicitly says “Keep the same weight convention each visit: per dumbbell or combined,” while entry remains generic kg. | Disclosure improves ambiguity but relies on remembering a personal convention. An explicit saved per-dumbbell/combined convention would improve future accuracy. No actual comparison error was observed. |
| Low | “Save correction” has accessible name “Save changes.” | Align visible and accessible names to help voice-control users; keyboard/screen-reader behavior was not tested. |

The earlier high persistence gap is resolved for same-device reload in this run. Actual next-week behavior, backup restore, cross-device access and comparison math are outside this recheck. No claim of physical one-handed ease or actual human completion performance is made.
