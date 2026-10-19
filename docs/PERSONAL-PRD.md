# Personal gym notebook — authoritative product scope

This personal-only pivot supersedes the coach/client requirements for the active app. Historical coach implementation and evidence remain historical. The product is a mobile-first, installable, offline-capable web notebook for one person, with no required account, backend, trainer, cloud sync, or food tracking.

## Outcome and boundaries

At the gym, choose intended muscle groups, assemble a sensible session, record actual weight and reps after each set, replace unavailable equipment quickly, and return next time to trustworthy history. The app must be understandable in a short glance and operable with one hand. No nested screen journey should be needed to log, correct, repeat, swap or finish a workout.

Local durability is the first product priority. IndexedDB is authoritative storage; localStorage alone is insufficient. Explicit writes must complete before the UI says recorded. A versioned backup/export and validated import are essential, alongside a persistent-storage request where supported. Browser storage can still be lost through clearing site data, device loss, private browsing or browser eviction. Installation is not a backup, and persistence permission is not an absolute guarantee. Never promise otherwise.

## Planning and exercise coverage

A muscle group is a broad user selection such as Chest, Back, Shoulders, Legs, Biceps, Triceps or Core (historical Arms records remain valid). Suggestions use curated primary subtargets, such as shoulder front/side/rear or back horizontal pull/vertical pull. These are practical movement-emphasis planning categories, not a guarantee of anatomical isolation or complete muscle coverage. Selecting more broad muscle groups than the requested exercise count is rejected with an explanation so no chosen group silently disappears. Each suggested exercise has a stable movement ID, primary target, secondary targets, equipment and supported load mode. Distinct primary targets are preferred before another exercise in the same bucket. Compound secondary overlap is disclosed rather than silently treated as a duplicate. If requested count exceeds available distinct targets, explain the limitation; offer fewer exercises rather than fabricate coverage. Suggested plans cap the requested count to available distinct targets and support same-target substitutions. A separate Pick exercises mode allows deliberate same-target variations, such as dumbbell, preacher and hammer curls, in the user’s selected order. The two modes must be clear about this difference; neither may suggest triceps work when only Biceps is selected.

Defaults: three working sets per exercise and a rep range of 8–12, editable before and during the session; these are convenience defaults, not a universal prescription. Do not auto-record prescribed sets. Equipment identity matters: different machines and load conventions are not interchangeable records. The current MVP logs load and reps, including an explicit bodyweight load convention where supported. Timed exercises are outside this delivery; no duration logger is claimed.

## Logging and substitution

A workout is a dated container; an exercise occurrence records a specific movement and equipment context; a set is an explicitly recorded actual. The main task is one weight/reps pair and Log set. Planned targets and last session values are references only. Repeat must name exact values and require a tap for each newly performed set. Receipts are editable and deletions reversible. Do not silently copy last time into actuals.

Swapping before any set replaces the planned occurrence. Swapping after a performed set retains the old occurrence and its actuals and adds the replacement occurrence. Neither action rewrites historical identity or transfers progressive-overload history to a different movement. The unavailable exercise can be returned to later. Session finish preserves partial sessions; session notes are outside this delivery. It is no need to complete a prescription to retain useful work.

## Progressive overload policy

Progressive overload means gradually increasing training demand over time; load is only one variable. More reps at the same load and comparable execution can represent progress. The app provides descriptive comparisons and optional double-progression guidance, not automatic coaching. For a configured rep range, show a load-increment suggestion only when all intended working sets in a comparable session are logged at the upper bound with the same load. Use user-configured available equipment increments. Otherwise suggest retaining load and working within the range, with no insistence on improvement every session. The user can decline suggestions. Pain, fatigue, technique, changed equipment and recovery cannot be inferred reliably from logged numbers.

A comparison requires the same movement, equipment context and unit/load convention. Unknown equipment, mixed units, changed movement or partial sessions must be clearly labeled and must not generate unqualified strength claims. Preserve every set in order instead of comparing only a best set. No estimated 1RM or automatic program generation is required.

## Information architecture and visual contract

Two primary screens: Home (plan/resume, attendance, lift progress and last workout) and Workout (planning, review, active logging and completion). History and settings/backup open as contextual panels; they are not primary navigation destinations. Workout holds primary thumb-reachable actions; secondary metadata and explanations expand inline. A persistent session card contains Finish and optional elapsed time; hiding the clock does not pause the session. Large numeric input, at least 44 px targets, clear contrast, visible labels, keyboard-friendly inputMode and predictable focus. No autoplay exercise video, badges, daily streaks or ornamental dashboard. Last time, Target and Today must remain distinct. Dates use the user's local day; saved records include unambiguous timestamps.

## Acceptance and release limits

Stories PERS01–PERS05 in PERSONAL-STORIES.md are required. Technical acceptance needs build, pure domain/storage tests and browser journeys with synthetic local data, including reload, offline reload, failed write, import rejection and substitution after logged work. Human usability and real-device browser/storage behavior are separate evidence gates; synthetic personas do not establish delight, speed or reliability across all phones. Publication evidence is tracked separately in docs/DEPLOYMENT.md; the current app is deployed to the authorized Training-Note GitHub Pages origin.

## Research provenance

See PERSONAL-RESEARCH.md for the coordinator's progressive-overload and browser-storage/PWA research sources. Research informs conservative suggestions; it does not establish individual suitability or actual-device durability.
