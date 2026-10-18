# Source ledger for a simpler personal gym notebook

Research date: 18 October 2026 (UTC). Scope: secondary research of official public product documentation. This is not a hands-on trial, independent app review, interview, or evidence that these patterns work for this particular user. Product claims below are attributed to their publisher; ratings and marketing testimonials were not independently verified or used as usability proof.

## Retrieval and observation log

| Source | Actual access | What can legitimately be concluded |
| --- | --- | --- |
| [Strong homepage](https://www.strong.app/) | HTTP 200; HTML retrieved and visible text read | Publisher positions the product as a workout notebook that stays out of the way; advertises best-set/max-1RM charts, CSV export, RPE and timers. Does not establish exact set-entry or substitution interaction. |
| [Strong features](https://www.strong.app/features) | HTTP 401 | Not inspected; no claims based on this page. |
| [Hevy homepage](https://www.hevyapp.com/) and [features](https://www.hevyapp.com/features/) | HTTP 403 (also tested bare hevyapp.com) | Not inspected in this research pass. No invented visual or interaction comparison. |
| [FitNotes workout tracking](https://www.fitnotesapp.com/workout_tracking/) | HTTP 200; official instructions read; embedded annotated image downloaded and visually inspected | Precisely documented last-workout prefilling, explicit Save, edit/delete, exercise navigation and optional completion tracking. Actual screenshot layout described below. |
| [FitNotes home](https://www.fitnotesapp.com/home_screen/) | HTTP 200; official instructions read | Today as default, previous-workout copying and dated workout access are documented. |
| [FitNotes progress](https://www.fitnotesapp.com/progress_tracking/) | HTTP 200; official instructions read | Documents actual-vs-estimated records and graphs, including their limitations. |
| [FitNotes calendar](https://www.fitnotesapp.com/calendar/) | HTTP 200; official instructions read | Documents date dots by exercise category, total workout counts, list summaries and category filters. |
| [FitNotes routines](https://www.fitnotesapp.com/routines/) and [tools](https://www.fitnotesapp.com/workout_tools/) | HTTP 200; official instructions read | Structured routines and optional auto-start rest timers are documented. Not necessary to copy their full feature scope. |
| [Alpha Progression homepage](https://alphaprogression.com/en) | HTTP 200; official product text and FAQ read | Publisher describes actual workout-dependent recommendations, optional RIR, equipment constraints and today-only versus permanent exercise swaps. |
| [Alpha progression recommendations](https://alphaprogression.com/en/blog/alpha-progression-progression-recommendations) | HTTP 200; detailed official article read | Clear distinction between previous result, recommendation and actual logged result; no previous result means no recommendation. |
| [Pinterest search: workout tracker dashboard](https://www.pinterest.com/search/pins/?q=workout%20tracker%20dashboard) | HTTP 200, but extracted HTML visible text only says JavaScript required | Raw HTML retrieval is not visual research. This agent did not inspect rendered Pinterest pins. Root is separately attempting a real browser; its observation must be recorded separately. |

Temporary downloaded pages/images are in `/tmp/gym-reference-research/`; they are research evidence, not app assets. No source screenshot has been copied into the product as our own design.

## Patterns with direct documentary support

### FitNotes: one exercise, one pair of numbers, one explicit save

The tracking instructions state that the weight/reps fields are automatically populated with the first set from the last workout when history exists. The user can type values or use increment controls, then explicitly Save each actual set. Tapping a saved set exposes Update/Delete rather than silently changing an already-performed result.

The actual [annotated screenshot](https://www.fitnotesapp.com/images/Training_Track_Filled_With_Comments_Annotated.png) was viewed. It shows an exercise header, Track/History/Graph tabs, large weight/reps controls, Save/Clear buttons and a compact list of completed sets with optional note/record icons. It is visually dated; the useful pattern is the low-memory capture loop, not copying its appearance.

**Our recommendation:** keep all movements visible in the workout worksheet, but only the active row needs a large editable pair of values and a commit action. Show `Last: 40 kg × 10` beside the current row. Values can be suggested/pre-filled, but completion requires explicit actual logging. Do not introduce separate exercise-detail, graph and history screens into the workout loop.

### FitNotes: attendance and muscle category are separate signals

The calendar describes coloured category dots under trained dates and a workout count. Category dots indicate what was trained, not biological growth or strength improvement. Its graphs include weight at a fixed rep count as well as estimated 1RM and volume. Its documentation explicitly warns that high-rep estimates can be unrealistic and that truncated graph axes can exaggerate changes.

**Our recommendation:** a compact four-week attendance strip and a count of completed training visits answer “Have I been showing up?” A distinct group-performance summary answers “What am I improving at?” These must not be conflated. Use a plain factual evidence line such as `Chest · Bench: 40 × 10 → 42.5 × 10` under the group, with equivalent setup/effort caveats. A body silhouette can select/highlight the group; it cannot truthfully show muscle size gained from log data.

### Alpha Progression: recommendation is not history or actual performance

The detailed article says recommendations consider previous performance, sets already done today, planned reps, available weight increments and optional RIR. It explains why another rep may be more realistic than a large dumbbell jump. It also says a recommendation can decrease when fatigue or logged performance warrants it, and that progression does not require every set to beat the last.

An especially relevant documented ambiguity: Alpha’s blue recommendation bubble belongs to the set directly above it, while editable fields initially contain the reference result. The article must explicitly explain these can differ. This is evidence of conceptual complexity, not proof of a measured usability failure.

**Our recommendation:** use exactly three distinguishable meanings: `Last time` (reference), `Try` (optional guidance), and `Logged` (actual). Never add a second lookalike editable row just to show a recommendation. First-time exercise gets `First time here—log a comfortable starting set`, not fabricated progress. Optional effort asks “Could you do another clean rep?” rather than requiring RPE knowledge.

### Alpha Progression: an occupied machine need not rewrite the routine

The homepage FAQ says an exercise can be swapped just for today or retained in the plan. This is a product-documented capability, not an observed hands-on interaction.

**Our recommendation:** offer `Swap` beside the movement, open a contained replacement sheet, default to today-only. Explain the same target and equipment of the alternatives. Keep already logged work intact. Do not transfer a machine’s previous weight onto a different machine or exercise as if equivalent.

### Strong: notebook proposition, restrained evidence

The public homepage’s language—“Workout. Notebook. Reinvented.” and “designed to stay out of your way”—supports notebook simplicity as a familiar product direction. Its advertised charts and RPE do not establish a friction-free implementation. Its duplicated homepage counts and selected testimonials were not treated as independent evidence.

**Our recommendation:** match the notebook’s durable, chronological record and low need for navigation. Avoid importing social feeds, body measurements, subscriptions, detailed calculators or a dashboard full of competing stats just because a competitor has them.

## Two destinations rather than a separate progress area

This is our design synthesis, not a competitor claim:

1. **Home:** See attendance, a small honest group-performance view, the upcoming/repeatable workout and a clear Start/Resume action. Open the workout editor and backup controls in contained sheets. An expanded chart is an inline disclosure, not a new permanent destination.
2. **Workout:** See planned movements, reference values and actual-set entry together; reorder/skip/swap without leaving the worksheet; record, correct, resume and finish. Return Home after finishing with a brief factual receipt.

A third permanent screen has no demonstrated need for this personal app. Backup is essential but infrequent; it can live behind a labelled Home control. Two screens is not permission to hide many pages inside modal stacks: each sheet gets one task, one return, no nested sheet chain.

## Limits and falsifiable checks

- No participant research was performed in this pass. Fatigue, divided attention and re-entry problems are hypotheses informed by the user’s stated experience and the physical workflow, not new interview findings.
- No Hevy interaction was verified. Pinterest visual inspiration cannot be claimed from raw HTML. Add separately recorded real browser results when available.
- Test with this user: after a set, can they identify last performance, change one value and commit without leaving the worksheet? On return next week, can they decide repeat/add-rep/raise-load without hunting through history? After an occupied-machine swap, do they understand that previous setup weights may not apply?
- Attendance requires a documented policy: completed sessions with at least one actual set, deduplicated by local calendar date for “days trained”; sessions and days are not interchangeable. Import duplicates must not inflate totals.
- Performance summaries must show missing baseline honestly. Mixed exercises/equipment and extra sets are not direct proof of muscle growth; colour cannot replace text/evidence.

## Root browser observation, October 18, 2026

Unlike the raw-HTML fetch above, a real Chromium session loaded https://www.pinterest.com/search/pins/?q=workout%20app%20dashboard . Screenshot `docs/images/research-www.pinterest.com.png` shows a sign-in dialog obscuring most results. Only peripheral thumbnails were visible (dark fitness dashboards, bright overview tiles); individual pin details/interactions were not verified. No account login or gate bypass was attempted.

The same browser viewed https://dribbble.com/search/workout-tracker . Screenshot `docs/images/research-dribbble.com.png` shows GymSync desktop/mobile concepts and a watch concept. Observed visual patterns: strong metric hierarchy, restrained dark surfaces, compact activity bars, one contrasting action. These are visual concepts, not proof of gym usability; decorative videos, calorie clutter and unrelated dashboard metrics were rejected.

Root also read https://www.hevyapp.com/ in Chromium successfully (the research agent's raw request had returned 403). Its homepage advertises workout logging, routine planning, rest timers, exercise notes, charts, personal records and complete exercise history. This is a product-marketing observation, not a tested app interaction or independently verified review score. No claim was made that our app should copy its full feature set.
