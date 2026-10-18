# Synthetic intermediate lifter: day 0 to day 100

18 October 2026. This is a critical scenario walkthrough of the implementation, not a recruited participant, interview, observed gym workout, or evidence of training outcomes. The person and training records below are constructed. Statements about what the person needs or feels are hypotheses. Implementation findings come from source inspection; the coordinating agent separately owns executable browser evidence. No simulated quote is presented as a user quote.

## Person, calendar and definition of success

Alex has lifted consistently for 18 months, trains three or four times weekly, knows the movements and usually arrives knowing what to do. A normal session takes 50–65 minutes. Alex uses a main commercial gym, occasionally travels, and wants a record that is easier to revisit than Notes. A representative bench working load is 60 kg for three sets of 8–10 repetitions, not a prediction of strength or a prescribed starting load. Working-set effort is often around two good repetitions left. Alex does not need a coach, nutrition diary, social feed, or training certification from the app.

Day numbers are elapsed calendar days, not workout numbers. Day 0 begins with no app records; approximately three completed sessions exist by day 5, six by day 10, and 55 by day 100 in a relatively consistent four-session week. Missed weeks could lower these totals. A conventional three-session week would produce closer to 43 sessions by day 100; 55 is an upper plausible scenario, not a universal expectation.

For this critique Alex alternates upper A, lower A, upper B and lower B. This deliberately tests an ordinary intermediate's rotation rather than giving the app only the routine it happens to support. A second, constrained scenario uses only the available catalogue and a self-managed routine. The difference matters: successful set recording is not the same as supporting Alex's whole training practice.

Success means starting the intended workout quickly; recording actual work under fatigue; retaining it through interruption; substituting available equipment without false comparisons; finding the right last numbers; noticing meaningful change over weeks; and keeping personal data recoverable. The app need not decide a programme or promise continued physiological improvement.

## Day 0: establish a usable notebook

### Before entering the gym

Alex wants to pin the web app, keep existing training knowledge, and know whether records will survive. Home correctly starts empty and offers Plan a workout, rather than requiring a profile or pretending to know historical attendance. Data settings provide local backup/import and storage protection. The data remains browser-local; pinning and a storage request do not guarantee retention or cross-device recovery.

Likely friction: the empty gym/setup setting is not established by the primary plan flow. Gym context is necessary for supported performance comparisons but can be discovered only later in settings or the active movement's setup disclosure. Alex can successfully record several workouts without understanding why no comparable improvement appears. A small contextual prompt at the first relevant comparison is preferable to a large onboarding questionnaire.

### Arrive and prepare upper A

The app can select Chest + Back, choose four distinct primary targets, preview four movements, customize planned sets and rep bounds, swap available equivalents, then explicitly start. It does not manufacture actuals before Start. With four movements it can generate bench, pulldown, incline press and cable row. Alex can select movement order during recording, even though there is no dedicated reorder control.

The first immediate limit is the curated catalogue. There is no barbell squat, conventional deadlift, arbitrary custom exercise or general exercise picker/addition after starting. A lifter who already knows today's barbell squat cannot faithfully represent it by renaming equipment on a goblet squat: catalogue identity would be wrong. This is a genuine blocked task, not a request for another main screen.

### During the session

Alex warms up independently. The model has no warm-up-versus-working-set type. Logging warm-ups as ordinary sets can contaminate working-set counts and suppress the strict progression comparison. Leaving them unlogged is a viable declared policy if this is intentionally a working-set notebook; silently assuming all lifters know that is not.

For bench, Alex records actual 60 kg × 10, 9, 8, optionally enters two good reps left, corrects a typo inline, changes movement, and returns after a phone interruption. The implementation supports current actuals, pending input, explicit commit, visible saving/error and transaction-based receipt. No network or login is needed. Actual physical one-hand comfort is not observed here.

There is no rest timer, superset mode or mandatory session note. An intermediate can use a clock and ordinary exercise selection; these omissions do not block basic logging and do not justify a third main screen by themselves. A note can matter when recalling technique, discomfort or a changed seat setting; free-form notes are currently absent from the stored model.

### Leave

Finish preserves partial performed work and warns about typed unlogged entries. Empty sessions can be explicitly discarded. Home attendance counts the completed session's local start date. Backup is manual. Before using real data, Alex should perform an export and understand where that file lives; a browser-only notebook is not an external backup.

**Day-0 verdict:** the available-catalogue working-set session is supported; Alex's unconstrained existing programme is not fully supported. The catalogue gap occurs immediately, not only at day 100.

## Day 5: repeat the right workout, not merely the last workout

### Before and on arrival

Alex has roughly three completed sessions. The task is to return to upper A after lower A and upper B. Home's dominant repeat action chooses the most recently finished workout. It is a literal last-session repeat, not a split rotation, scheduled next workout, recovery recommendation or A/B routine picker.

Alex can choose Train something else and build Chest + Back again. That preserves the two-scene structure, but redoing movement count, substitutions and prescription changes is more maintenance than the intended notebook experience. The historical records panel renders old sessions and corrections but has no Repeat this workout action for an arbitrary earlier session. There are no named saved templates.

### During

When gym, equipment label, catalogue identity and unit match, the app can show previous actuals for that movement even if another session intervened. Use last time fills pending values; actual performance still needs explicit Log. The double-progression hint is off by default. Once enabled, a consistent three-set bench of 60 × 12, 12, 12 can suggest a configurable increment such as 62.5 kg next time; less than that produces a build-reps/hold message.

Recorded effort is optional and understandable through good reps left. However the progression suggestion itself does not use recorded effort. Even three maximal 12-repetition sets with zero reps left satisfy its load-increase test. Its conditional form/appropriateness wording limits the claim but does not make it effort-aware. In contrast, the retrospective muscle performance calculation does qualify missing or harder effort. These are separate algorithms and should not be conflated.

### After

The visit strip now recognizes consistency. A repeated, fully comparable movement can acquire a first comparison. A changed rep prescription, missing gym, partial set count or altered equipment correctly prevents simplistic comparison, but a new user may perceive that as broken progress unless the short explanation is discoverable.

**Day-5 verdict:** useful movement memory and deliberate logging; repeated routine setup is already a recurring friction. Prioritize reuse of an earlier session over more dashboard metrics.

## Day 10: normal variation tests meaning, not storage

### Before

About six completed sessions exist. Alex wants to run upper A at a travel gym or use a second machine in the main gym. The setup label must distinguish those contexts. A new generated plan takes the current default gym setting, while repeating a prior workout clones the historical exercise gym/equipment fields. Changing global gym then repeating does not automatically transform every copied exercise to the travel setup. Alex needs to notice and change each relevant movement's setup label before relying on the baseline.

### During

An occupied bench can be swapped for a same-primary-target dumbbell or machine alternative. Original actuals remain attributed to the original block; replacement inherits remaining target work with its own identity. This is suitable for an honest notebook. Some catalogue movements have no alternatives, so swapping is not universally available. A custom movement route would provide an escape without pretending different machines are equivalent.

If Alex logs a partial workout due to time, repeating it currently copies performed set counts and omits wholly unperformed blocks. That avoids adding the abandoned prescription twice after a swap, but creates another consequence: a single short day can become the new default workload when blindly repeated. The preview permits correction, yet the person must remember the original intended session. A stable reusable plan separate from performed history would resolve this better than silently changing repeat semantics.

Adding extra sets is possible; changing planned sets, rep bounds and increment is possible in the setup disclosure. Logging mixed loads remains possible. However the hint defers to review when previous loads varied, and strict paired-set comparisons may report mixed or noncomparable results. An intermediate using top sets/back-offs can still record work but receives less guidance than the headline progressive-overload promise suggests.

### After

Alex can correct saved weights/reps and effort later. The entire historical record is presented together. Six sessions are manageable; the task is becoming finding a particular exercise or session, rather than merely having storage.

**Day-10 verdict:** substitutions and interruptions are covered, but setup identity, unstable repetition of partial sessions, and mixed-load programmes create avoidable cognitive overhead. These need contextual states and better reuse, not a third destination.

## Day 100: has the notebook become an archive or a useful training memory?

### Before

With approximately 55 sessions, Home still shows the latest 28 days and a total workout count. That is a useful short-term attendance view, but it cannot show consistency across the whole 100 days or a month-to-month pattern. The primary action still repeats only the last completed session; routine rotation has not become easier through accumulated records.

### During

A supported repeated movement can still expose the latest matching actuals. Set-count, rep-range and increment controls allow manual changes; there is no arbitrary 100-day cap inherent in those controls. Alex can continue using the app indefinitely as a narrow working-set notebook if the catalogue fits and Alex manages programming independently.

Growth in training complexity reveals the ceiling: missing movements/custom additions, no warm-up distinction, no exercise/session note, no stable named routine, and limited handling of variable-load progression. A deload, new rep range or programme block is loggable through edits but intentionally breaks immediate apples-to-apples performance classification. The app does not provide a programme history or interpret the reason for the change. It must not turn this honest restraint into a false claim of no training progress.

### After: try answering the important question

“How much has my bench changed since I began?” cannot be answered directly by the current latest-two-occurrences insight. It compares the most recent two occurrences per exact setup, not the first week against today or a full time series. A synthetic 60 kg × 8,8,8 baseline progressing toward a later higher load illustrates the question; no specific gain by day 100 is asserted. A recent steady session could display unchanged performance despite substantial longer-term improvement.

Likewise, “Which muscle groups improved across these three months?” cannot be answered by the Home comparison dots: they encode latest movement comparison status, not muscle growth, accumulated trend or longitudinal dose. It is correct not to claim biological growth, but the app still needs a useful view of recorded performance over time.

The history overlay directly renders every stored workout, movement and actual summary, with correction disclosures per movement. There is no exercise filter, date search, pagination or single selected-session detail. At 55 sessions a specific old row is increasingly difficult to find. This is an information-retrieval finding from code, not a measured rendering-performance failure. No slow-device benchmark is claimed.

Local data protection also becomes more consequential at 100 days. Existing export, checksummed import and safe merge are valuable. Manual backup can be forgotten; browser retention still is not guaranteed. Before claiming long-term reliability, test recoverability with realistic large history and actual external export/import, not just a successful render.

**Day-100 verdict:** the app can continue recording a restricted routine, but currently underserves accumulated training memory. It is not yet a convincing long-term progress tool for a typical intermediate's existing programme. More primary screens do not solve that ceiling.

## Priorities and two-screen decision

| Priority | User task/gap | Smallest suitable intervention | Where |
|---|---|---|---|
| P1 | Record an exercise outside the catalogue | Exercise picker with custom-entry escape; preserve explicit identity/setup | Workout planning/add/swap panel |
| P1 | Return to upper A after lower day | Select a recent routine/earlier session to repeat; eventually distinguish template from actual history | Home contextual chooser |
| P1 | See change from first week through week 14 | Exercise-specific matched history/trend with date range and actual values; keep caveats | Home progress detail |
| P1 | Avoid misleading travel baseline | Display copied setup on repeat; explicit session-wide setup choice with per-movement overrides | Review/start and Workout |
| P2 | A partial day should not silently redefine normal session | Clearly distinguish repeat performed work from reusable intended plan | Repeat preview/chooser |
| P2 | Find one old record among 55 sessions | Exercise/date filter and compact selected-session expansion | History panel |
| P2 | Keep warm-up/context from contaminating meaning | Explicit working-set policy now; consider optional warm-up flag and a short note only when justified | Workout row/disclosure |
| P2 | Make hints consistent with effort capture | Gate or qualify increase advice for very hard sets; preserve user control and no automatic actuals | Workout hint |
| P2 | Retain confidence after 100 days | Check export age and a recovery exercise; avoid pretending local persistence is infallible | Existing settings/backup panel |
| Later | Timer, supersets, coaching or nutrition | Add only if the actual user needs them | Not a reason to expand now |

Home and Workout remain sufficient primary destinations. Planning, selection, draft/saving/failure, corrections, effort, swap, setup, finish, history and backup are necessary states. “Two screens” should describe stable navigation, not a promise to eliminate these interactions. The best next step is a minimum long-term loop: select the intended prior routine → log with matching context → inspect the same lift over time. It adds depth to existing surfaces rather than adding an analytics dashboard, programme builder or third main tab.

## Source anchors and evidence boundaries

Reviewed `PersonalApp.tsx` (`repeatWorkout`, planning customization, active setup disclosure, history overlay), `TrainingHome.tsx` (last-session repeat, rolling 28-day visits, latest aggregate comparison), `personalLogic.ts` (curated planning/swap and progression rules), `personalInsights.ts` (latest two occurrences and comparability guards), `personalCatalog.ts` (31 movements and target alternatives), `personalStore.ts` (stored model/defaults and local transactions), and current two-screen UX/workout-audit documents.

No human success rate, emotion observation, training benefit, record-loss guarantee, latency benchmark or real gym trial is claimed. The root audit's browser tests should be read separately to distinguish executable behavior from these source-based scenario findings. This document intentionally changes no product code.
