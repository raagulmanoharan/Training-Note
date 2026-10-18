# Intermediate lifter: accelerated browser audit

18 October 2026. Product commit audited: `0c1631d`. No application functionality was changed for this audit.

## Method and limits

A delegated synthetic intermediate-lifter agent inspected the implementation and wrote `INTERMEDIATE-LIFTER-WALKTHROUGH.md`. The coordinating agent then executed actual browser interactions in four isolated contexts. Alex is fictional: 18 months of lifting, roughly four visits per week, a main gym and an independently chosen upper/lower rotation. No recruited person, interview, real exercise, measured strength gain or hundred-day retention study is implied.

The day numbers are elapsed calendar days. Day 0 starts without app records and uses the actual UI to complete a two-movement, six-set session. Days 5, 10 and 100 are accelerated snapshots with respectively 3, 6 and 55 completed synthetic sessions. Later snapshots explicitly configure a gym label and enable hints; this is a favourable informed-user condition, not proof that an unaided first-time user discovers those settings. We use an executable upper/lower pair; the persona report also critiques the richer four-routine rotation from source. Sessions are seeded, not pretended to have been manually performed across actual months.

Synthetic loads illustrate data interpretation only. They are neither a forecast nor exercise advice. Each later snapshot opens Home, opens and closes history, starts/rebuilds a session, records a real app set through the UI, returns Home, resumes, reloads, and verifies the same recorded set ID. Export plus checksum inspection verifies serialization of history and the active actual. This does not test external backup retention or real-time browser eviction over 100 days.

## Observed checkpoints

| Checkpoint | Actual tasks and observations | Product verdict |
|---|---|---|
| Day 0 | Started from empty Home with default blank gym and hints off. Chose Chest/Back, two movements, logged 60kg/45kg ×10 for three sets each, finished and saw one recorded visit. | Working-set recording is viable for supported movements. No app explanation introduces working-set-only policy, known setup or hint settings. |
| Day 5 | Loaded 3 finished sessions / 54 sets. Home shows comparable upper movements improving as synthetic reps rose from10 to11. Last numbers can fill a draft; a newly recorded set survives Home/resume/reload. | Repeated logging adds value. Home still offers upper again, although this scenario's next rotation is lower. No older-routine repeat is available in history. |
| Day 10 | Loaded 6 sessions  / 108 sets. Last session is lower, intended session upper. Used Train something else, reselected muscles/count, rebuilt upper and manually set bench to6–8. Last bench had three 60 kg × 8 sets with 0 reps left. The actual active UI offered considering 62.5 kg. | Can change prescriptions and keep logging. Routine reconstruction and optional progression's lack of effort gating become real gaps. |
| Day 100 | Loaded 55 completed sessions  / 990 actual sets. Home shows 14 recorded visit days in its 28-day window and 55 workouts total. Opened all 55 history cards, started a new session, recorded another actual, verified the same ID after reload, exported and verified 55 historical sessions plus 1 active actual. | At this size storage and basic logging work. Remembering programme rotation, finding older records and understanding long-term changes remain weak. |

All four contexts completed without page JavaScript errors. Later active pages had no horizontal overflow at 390px. These observations are not universal browser/device guarantees. There was no product/schema migration or reset of real user records: each synthetic run used a separate browser context.

## Day-100 structure and data evidence

- Before the new active set:55 historical sessions,990 actual sets; the verified exported historical snapshot was 439,267 bytes (about 0.44 MB).
- History overlay rendered 55 cards and 12,963 descendant elements. Its scrollable content was 66,932px with an 844px viewport: approximately 79 viewport heights. No exercise/date search or pagination is available.
- The final Home was usable and the history opened in this desktop Chromium run; we do **not** claim the UI froze or that storage failed. One-run automation-inclusive timings in the JSON are diagnostic only, not phone benchmarks.
- Synthetic bench began at 60 kg × 10 and ended at 65 kg × 10 after a deliberate reduction from the most recent heavier session. Both records remain stored. Home only compares recent matching occurrences, so it says mixed results and has no first-week-to-now chart. That recent-session classification is distinct from longitudinal performance or biological muscle growth.

## Confirmed product gaps and correctness defects

1. **Routine recall:** `TrainingHome.next` is the latest finished session. It is honestly labelled as a repeat, but provides no A/B selection or earlier-session repeat. A lifter repeatedly rebuilds the intended alternative with default prescriptions.
2. **Movement coverage:** the catalogue contains 31 entries, including goblet squat and Romanian deadlift variants, but no barbell back squat or conventional deadlift. There is no custom-exercise escape. A known missing main lift is blocked on day 0; it cannot be faithfully represented by changing another movement's equipment label.
3. **Effort is collected but omitted from the load hint:** the day 10 active bench UI offered 62.5 kg after 3×8 at 60 kg with zero recorded reps left. The advice is optional and conditional, not forced or auto-logged. Nevertheless the recorded effort does not inform it. `personalLogic.progression` checks repetitions, counts and setup, not effort.
4. **Day 100 effort caption is factually misleading:** every synthetic compared set had two reps left, yet the mixed/lower-result Home says “Effort was missing or harder in some comparisons.” The review insight defaults `effortComparable` to false, and Home interprets that as missing/harder. A review classification is not proof of either. This remains an identified defect; the audit has not silently changed the product.
5. **Group summaries hide partial comparison coverage:** day 10 bench changed to6–8, so it needs prescription review; incline remained unchanged and comparable. The Chest row nevertheless says “Same recorded weights and reps” without exposing that only part of the group was compared. A useful overview should state coverage and review state.
6. **Longitudinal evidence:** latest-two comparisons cannot answer first-week-versus-now or distinguish a recent deload from the full trajectory. Add dated lift history/trend with setup and prescription context, not a fabricated muscle-growth percentage.
7. **Context defaults:** removing all synthetic gym labels resulted in zero eligible group comparisons even with repeated records. That safety guard is sound; the user needs a visible setup choice before this silently becomes permanent “No matching sessions yet.” Repeat also retains historical gym context, so a travel session needs explicit confirmation.
8. **Reusable intention versus performed work:** repeat deliberately copies performed blocks/counts. After a partial session this can reduce next session's intended workload; after a mid-exercise swap it repeats both recorded variants. It preserves data, but is not a stable routine template. The audit does not propose changing history or equating machine loads.

## Minimum growth loop, still within two screens

First fix the two progress-summary defects and make effort-aware hint qualification explicit. Then add only:

- Home **choose a recent routine/session to repeat**, keeping stable intended plan distinct from last performed work. No calendar scheduler required.
- Workout **pick/add an exercise with a custom-entry escape**, plus explicit session setup. Warm-ups can remain a declared untracked policy until a set-type control is justified.
- Home progress detail **one lift over time**, matching setup, dates and rep context; reuse that selector to filter a compact history instead of rendering all sessions eagerly.

These deepen Home and Workout rather than requiring a third main tab. No nutrition, social feed, full coaching engine or autonomous programme changes are justified by this scenario. An intermediate can continue getting stronger while using a simple logger; what is missing is the application's memory and retrieval support as that person's training evolves.

## Reproduce and inspect

Run Vite, then `COACHLINE_URL=http://127.0.0.1:5190 node scripts/audit-lifter-lifecycle.mjs`. It needs Chromium (`/usr/bin/chromium` by default), creates isolated contexts and writes ignored `tests/artifacts/lifter-lifecycle/` evidence. Managed environments may require normal process/network permission to run the browser. It never uses the user's browser profile.

The retained `INTERMEDIATE-LIFTER-OBSERVATIONS.json` contains the measured snapshot counts, actual visible text, backup checks, page-error arrays and diagnostic timings. `docs/images/lifter-day-{0,5,10,100}-{home,workout}.png` are actual browser screenshots with synthetic data. The persona document is source-based critique; this document and JSON distinguish executed browser observations.
