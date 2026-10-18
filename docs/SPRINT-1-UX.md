# Sprint 1 UX handoff: choose deliberately, record honestly

18 October 2026. **Design proposal, not shipped functionality.** Based on the user's firsthand requirements, the real gym journey, source inspection and the recorded accelerated browser audit. Alex is a synthetic intermediate lifter, not an interviewed participant. Feelings and physical ergonomics below are hypotheses. No new human research or physical workout was performed for this document.

Related: [Sprint board](SPRINT-1-BOARD.md), [visual handoff](SPRINT-1-VISUAL.md), and [portable layout proposal](design/sprint-1-board.html). UX/visual cross-review found no blocking flow contradiction; these remain proposed designs.

## Decision and scope

Keep exactly two primary destinations: **Home** (return, choose, understand) and **Workout** (perform, record, adapt). A chooser/dialog and inline plan review are contextual states, not additional primary screens. Their cancel, failure and focus paths still require design and implementation.

This sprint addresses truthful summaries/hints and repeating the intended workout. It does not add custom exercises, long-term charts, history search, automatic programming, food tracking, timers, warm-up set types or a calendar. Those remain later work. Existing backup, actual-set recording, correction, interruption recovery and partial finish must keep working.

## Human journey before application placement

| Real-world moment | Human job and likely friction | Emotional hypothesis | Minimum intervention | Deliberately no interaction |
|---|---|---|---|---|
| Before leaving | Recall Upper A after Lower; memory or Notes currently carry the rotation | Want certainty without admin | Home chooses a saved routine or earlier session | No automatic schedule or readiness form |
| Arrive and assess equipment | Decide whether using usual or travel gym; one machine may differ | Hurry, uncertainty about comparable loads | Review setup before Start; per-exercise equipment override | No location permission, mandatory full gym registration |
| Set up first station | Recall appropriate previous numbers | Want reassurance, not pressure | Setup-specific last actuals plus optional qualified hint | No claim app knows technique or recovery |
| Lift, rest, record | Perform work then capture actual load/reps | Tired; minimal attention available | Existing explicit actual log; optional plain-language effort | No forced scoring or routine maintenance |
| Equipment unavailable | Substitute remaining work without rewriting training intention | Frustration; desire to continue | Existing swap preserves original actuals; change is session-only | No forced routine update |
| Leave early | Keep useful work; intended routine is still full next week | Relief, possible concern about losing work | Finish partial keeps actuals; routine untouched | No mandatory explanation or post-workout form |
| Return days later | Choose the intended routine; interpret improvement/deload honestly | Confidence if context clear | Saved intention retained; factual performance and coverage | No guilt/streak messaging or assumed progression |

## Information architecture and definitions

- **Saved routine:** named reusable intention: ordered exercise identities, working-set prescription and default setup. Contains no completed sets, effort, pending inputs, session times or actual-set IDs.
- **Session draft:** today's editable copy. It can come from a routine, generated plan, or the logged work of a prior session. Source is visibly distinguishable.
- **Performed session:** immutable source history except explicit actual corrections. Repeating logged work means copying recorded movements/counts into a new intention, not reconstructing an unavailable original plan.
- **Actual:** explicitly recorded working set with transaction-backed receipt. Routine selection, load hints and prefills never create an actual.
- **Selected routine:** user's explicit preference, not a prescribed next workout or rotation engine. If persisted, store its identity and handle deletion/missing identity by clearing selection safely.
- **Setup:** gym label, per-movement equipment identity and unit. Choosing an unspecified setup must remain possible; logging works, comparison is withheld with a reason. Do not invent a default known gym.

Home hierarchy: Resume above other content if active; compact attendance may sit above the launch when inactive, without pushing the primary start action beyond the first viewport at normal text size. Otherwise explicitly selected routine's launch card or Choose workout. Build workout remains a quiet alternative. Visits and performance follow. Saved routines and Recent workouts appear as plain sections in a single chooser; no third main destination, carousel, programme dashboard or routine count limit that hides entries. Labels communicate whether a row is reusable intention or recorded work.

## Stories and full actor flows

### S1-01. Understand a performance change without false reassurance

**Trigger:** Back at home or before training, the user asks whether Chest is improving. Evidence may be a recent deload, one changed rep range, unknown setup or incomplete effort. Desired outcome is an intelligible statement grounded in actual records, not a muscle-growth score.

1. Open Home. Render loading without invented counts, then actual visit/performance data.
2. Show the measured result separately from comparison coverage: e.g. “Recorded weights and reps unchanged · 1 of 2 movements compared.” If other movements need review, say so; do not summarize the entire group as unchanged.
3. Tap the row to open existing evidence detail in place/context. List included movement, exact dates/setup/prescription and actual sets; list excluded movements with their specific reasons.
4. Show effort as an independent qualification: “Effort not recorded for every matched set,” “Latest effort was harder on at least one matched set,” or “Estimated reps left were the same or greater on every matched set.” A lower/mixed load result does not establish missing or harder effort.
5. Close returns to same Home scroll and triggering row. Correction remains an explicit existing history action; recomputation reflects committed values.

**Required model contract:** comparison eligibility (`comparable`, reason), observed load/rep direction, and effort (`missing`, `harder`, `same-or-easier`, `not-assessed`) are independent facts. Avoid deriving effort text from result/review status or a default false boolean. If effort is partially missing and harder on a known pair, communicate both rather than collapsing into a vague “or.” Biological growth, comprehensive programme quality and unlogged gym attendance are outside inference.

**Acceptance:** synthetic deload with all effort=2 never says effort missing/harder. A changed bench prescription plus comparable incline exposes 1/2 coverage. Missing setup gives its own reason. No history gives a neutral first-record state, no zero-percent failure. A correction that fails does not update the evidence as though saved.

### S1-02. Decide today's working load with optional effort-aware guidance

**Trigger:** At the machine, the user remembers completing the top of the rep range but may have struggled. They want last numbers, not an order to lift more.

1. Enter Workout; previous matching actuals are visible regardless of hint setting.
2. If hints are off, do not display an increase suggestion. Existing optional setting remains discoverable; do not introduce a setup wizard.
3. With hints enabled, run identity, known setup, unit, set-count, prescription, variable-load, assistance/bodyweight guards first. Show the relevant review reason if a guard fails.
4. If the top-of-range condition is met, inspect previous effort. Any recorded 0/1 reps left blocks an increase recommendation: “Last time was close to your limit. Repeat a manageable load; no increase is required.” If effort is missing, show “You reached the rep target. Effort wasn't recorded for every set; review last time before changing load.” Do not silently treat missing effort as easy.
5. Only with all expected sets having at least two estimated good-form reps left may the optional increment suggestion appear: factual premise, optional candidate, “repeat if needed.” This is a conservative product assumption for review, not a validated exercise prescription, clinical recommendation or algorithmic safety guarantee. Missing effort never forces entry to log.
6. A suggestion does not fill or record values by itself. Existing Use last time remains a draft action; user may enter any valid actual irrespective of hint.
7. Optional effort is recorded/changed after actual logging using existing plain-language choices; saving effort cannot say “Saving set.” Errors retain actual and offer retry.

**Acceptance:** 3×8 at 0 reps left never offers an increase; unknown effort never produces an unqualified increase; assistance never gets added-load arithmetic; changing hints never mutates history; workout completion never depends on effort. Root/PM should explicitly adopt or adjust the conservative 2+ threshold before implementation.

### S1-03. Select Upper A after Lower, without rebuilding

**Trigger:** On day five, the last completed workout is Lower, but the lifter has independently decided Upper A today.

1. Home shows Resume if an active session exists. It must not invite a second active session. If active, chooser/start attempt redirects to Resume without destroying draft.
2. Otherwise Choose workout opens a single accessible chooser. Saved routines first, Recent workouts second, each with meaningful name, movement count, set prescription/actual count and last recorded date where relevant.
3. No routines: “No saved routines” plus Build workout. Recent sessions still selectable. No sessions: keep build path. No misleading Next/Today schedule labels.
4. Selecting Upper A opens today's existing plan review, copied from the routine. Cancel/Back leaves original routine/history/previous prepared intention unchanged; if replacing an already edited unstarted draft, ask before discarding those draft edits.
5. There is no intermediate selection confirmation or separate Preview screen. Review lists movements and prescribed working sets/rep ranges, source “Upper A,” and setup. Today's modifications remain session-only. Start never happens on row selection.
6. Review Start creates one current session with new IDs/empty actuals, timestamp at committed start (not chooser time). Disable duplicate start; show saving status. Only commit success enters active Workout with truthful saved status.
7. Failed start retains reviewed plan and offers Retry; no actuals and no extra session appear. Reload before starting must either recover a deliberately persisted plan or honestly return Home without claiming it saved. Recommendation: persist prepared plan separately; this needs a store/migration decision, not accidental React-only durability.

**Earlier session route:** row explicitly says “Repeat logged work.” Preview reflects performed blocks and actual counts, with no completed actuals copied. A partial old session is not presented as the original full routine. Show “Based on logged work; review sets before starting.” Editing/updating a routine is a separate act.

**Acceptance:** Lower history does not prevent choosing Upper A; preview retains all intended Upper A movements; selection/cancel causes no recorded visit; duplicate Start safe; an existing active draft/actual survives navigation and attempted alternative selection.

### S1-04. Save and maintain a reusable intention

**Trigger:** Before training, the user has reviewed a workout they expect to repeat. They should not need to build a programme hierarchy.

1. In reviewed plan, optional Save as routine opens a small name form. No saved-routine step is mandatory to log a workout. Never ask “Update routine?” automatically at Finish; routine maintenance happens only through this intentional action.
2. Name is trimmed, required, maximum 60 characters. Keep draft name on validation/save failure. Duplicate names get a visible warning and allow a distinct new routine; never overwrite by name alone. Identity determines update.
3. Save commits the reviewed intention only, including fully planned but unperformed movements; excludes pending input, actuals and effort. Show Saving routine, then receipt only after commit. Keep plan available to Start.
4. Cancel name form returns to same review unchanged. Save failure retains name and intention. Revision conflict follows existing protection: preserve current copy and ask reload/review; never overwrite concurrent stored data silently.
5. Reviewing an existing routine allows session-only edits by default: “Changes apply to this workout.” Optional Update routine displays old/new movement/set differences and explicit confirmation. Cancel leaves both template and draft available unchanged.
6. Saving a new routine derived from prior logged work is allowed after review; it does not infer original missing intention. Do not offer silently saving current mid-swap/partial actual state as the old routine.
7. Rename/remove live in the chooser's selected routine actions, not a new admin page. Removal confirms that history and active workouts remain. If a session references a removed routine, it remains usable using its copied intention; no dangling-reference crash.

**Acceptance:** 3-set planned bench remains 3 in routine after finishing with 1 actual. Swapping today never changes routine catalogue IDs. Explicit Update changes only target routine and future copies, not current historical actuals. Old backups load with an empty routine collection; exports include routines and safe import validates/merges their identities. Architects own schema compatibility and merge conflicts; do not ship templates without recoverable export/import.

### S1-05. Confirm setup before starting, especially when travelling

**Trigger:** User arrives at a different gym, or selects a routine saved at their usual gym. They need accurate last numbers without relabelling past work.

1. Review shows “Gym” with current copied label or “Not specified.” Start requires a deliberate known gym choice or explicit “Continue without a gym label”; don't require account/location setup.
2. Choosing a session-wide gym applies to today's exercise copies only; retain per-exercise equipment labels visibly and allow overrides. State “Different equipment? Adjust its setup.” A gym label alone does not establish identical equipment.
3. Unit changes must not relabel a numeric weight as a different unit. Existing actual history remains untouched. Clear/recompute pending suggestions if context changed; don't carry a historical machine number as a trusted baseline for another setup.
4. Unknown gym is allowed for recording, accompanied by one concise explanation: “Sets save normally. Progress comparisons need a known setup.” No repeated blocking notice each set.
5. Start shows matching history only for confirmed known identity. New setup has first-record state, not a reset-progress claim.
6. In Workout, setup edit after actuals must not retrospectively relabel completed sets. Either lock source identity for a block with actuals and create a fresh block for remaining work, or reuse existing safe swap semantics. UI must never rewrite earlier set meaning just because setup text changed.

**Acceptance:** Travel gym selection doesn't alter routine default or old session gym. Returning to usual routine restores usual default. Changing equipment doesn't compare unlike machines. Explicit unknown allows complete end-to-end logging/finish/backup. Setup changes invalidate queued suggestions/typed numbers only with visible warning and cancel, preserving input on cancel.

## Shared states and recovery contracts

| Surface | Empty / initial | Draft / ready | Saving | Failure / conflict | Cancel / return |
|---|---|---|---|---|---|
| Home launch | Choose workout; Build available | User-selected routine, never guessed schedule | Disable initiating duplicate commit only | Retry/local-store error without fake saved receipt | Home orientation preserved |
| Chooser | Separate truthful routine/history empties | Selected source identifiable | Loading only if actual async read | Keep source/draft accessible; no invisible overwrite | Focus to launcher, same scroll |
| Plan review | Invalid/empty plan cannot Start | Full intention + setup visible | Saving workout, disabled duplicate action | Values retained; Retry; protected revision resolution | Prior draft restored or explicit discard confirm |
| Routine name/update | Name field; no auto-generated invented meaning | Valid name + reviewed changes | Saving routine; form blocked against double submit | Inline field/global failure; preserve name | Focus back to Save/Update; no commit |
| Setup | Not specified + explicit choice | Known or explicitly unknown | Included in session start transaction | Don't enter Workout as if start committed | Return to review without losing prescription |
| Progress evidence | No matching records + reason | Result + coverage + separate effort fact | No false transient result from pending corrections | Show last committed evidence plus save failure | Same Home row/scroll |
| Actual/effort | Existing draft states preserved | Explicit Log or effort metadata action | Operation-specific status | Typed input/actual retained, safe Retry | Existing exact resume/correction behavior |

## Mobile interaction and accessibility contracts

- One modal layer at a time. Chooser → review closes chooser; naming/setup lives in review context, not stacked sheets. Prefer inline setup; naming can be inline region with focus transfer.
- Dialog has accessible title, close button, focus trap, Escape/Back close, inert background and scroll containment. Restore triggering focus on close. Browser Back closes transient context before leaving app. Warn only when dismissing actual edited uncommitted intention.
- Large selection row is one button with accessible name containing source type; don't nest overflow button within row button. Routine actions appear after selection or as sibling controls.
- At least 44px touch targets, logical keyboard order, 16px editable fields to avoid iOS zoom. Primary Start/Log reachable without scrolling a separate destination; mobile keyboard must not cover field/error/commit. Respect safe-area inset.
- Keep contrast, reduced motion, screen-reader state announcements and focus-visible styles. Saving uses aria-busy; success/error live announcement once, not per keystroke. Colors never carry sole meaning.
- Loading/saving reserve space to avoid layout jumps, but generic quiet actions do not inherit invisible loading-label widths.
- No timed dismissal of validation failures. Unknown setup and missing effort are understandable states, not red emergency errors.

## S1-06. Reusable composition, aligned with graphic design

Reuse existing DSButton, DSFormField/DSInput, DSDisclosure, DSInlineNotice, DSStatus, DSScreenHeader, DSSetRow and comparison evidence. Add only:

1. **WorkoutSourceRow:** source ID/type, title, explicit intention/actual metadata, selected/focus/disabled; used in saved/recent chooser.
2. **RoutineLaunch:** selected intention or no-selection state, Choose workout and Build workout; Resume supersedes it when active.
3. **SetupSummary:** known/unknown gym, equipment review action and explicit decision state, never interprets unknown as comparable.
4. **ComparisonFacts:** observed result, eligible/total coverage, separately computed effort qualification and reasons; shared Home/evidence.
5. **RoutineNameForm:** validation + commit states, update difference confirmation; builds from existing form controls.

Preserve light Home/dark Workout. Typography: 28px heading, 18px subheading, 14px reading/actions; editable inputs at least 16px; weight/color provide accent. No decorative eyebrow, all-caps tracking, invented celebratory badges or extra metric cards. Graphic designer's separate handoff owns dimensions/color/layout examples; these flow/meaning contracts govern composition.

## S1-07. Pickup order and review gates

1. P0 comparison facts and optional effort-aware hints; test known counterexamples before rendering variants.
2. Stable intention/storage compatibility contract agreed; templates cannot accidentally contain actuals or become unexportable.
3. Chooser → review/setup → explicit Start, then routine save/update, then preserve-through-swap/partial-return loop.
4. Review static component states with UX/visual before screen composition. Review real rendered mobile states before claiming ready.
5. Browser acceptance: empty first workout; Upper/Lower selection; cancel dirty review; failed/duplicate start; routine save/update failure; travel/unknown setup; swap; partial finish; return next week full intention; pending input/reload; external backup round trip and old-backup import. Retain existing full logging/correction tests and Pages offline/subpath checks.

Success here means a coherent and truthful two-screen loop. Synthetic walkthroughs can falsify inconsistent behavior; only the user's actual gym trial can validate hesitation, fatigue, one-hand comfort and whether this is easier than Notes.
