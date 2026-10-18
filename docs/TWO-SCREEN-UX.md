# A gym week first, two screens second

Status: proposed direction with an implementation audit, October 18, 2026. The audit below distinguishes delivered behavior from design proposals. This is a synthesis of the user's own account and the current implementation. It is not an interview study, observed gym session, or evidence that the design is intuitive. Feelings below are hypotheses to validate. External reference research belongs in the research report; this document makes no Pinterest-browsing claim.

## The experience being supported

The user's job is to train, remember what actually happened, and make a sensible decision when the movement comes around again. Their job is not to maintain an app. The service exists across a week, with the application appearing only at selected moments.

| Real-world moment | Person's goal / action | Other actors and tools | Likely friction / feeling (hypothesis) | Appropriate app touchpoint | Deliberately absent interaction |
|---|---|---|---|---|---|
| Earlier in the day | Decide whether and what to train | Calendar, work, fatigue, travel | Want reassurance that showing up matters | Optional Home glance: visits, last trained, next workout | No daily task list, red overdue state, or forced commitment |
| Arrive at gym | Find a viable route through intended muscles | Equipment, people, gym layout | Ready to start; unwilling to configure software | Start recent routine, or quick muscle/count sheet | No onboarding questionnaire or mandatory readiness score |
| Approach first machine | Recall setup and last performance | Machine labels, personal memory | Unsure which weight was used last time | Active exercise shows last actual sets, equipment and gym | No history navigation necessary |
| Complete a set | Catch breath; retain weight/reps | Body, bottle, towel, phone lock | Tired, distracted, one hand occupied | Edit two large numeric cells; tap one check | No mandatory effort, note, celebration, timer dismissal |
| Rest | Recover and prepare for another set | Clock, surroundings, messages | Wants a useful cue with no cognitive overhead | Current draft repeats last actual; optional effort chip | No demand to watch app throughout rest |
| Equipment occupied | Keep intended training moving | Other gym users and available alternatives | Irritated; does not want to lose work | Swap sheet lists same primary-target alternatives | No rebuilding whole workout or silently erasing performed sets |
| Interrupted / screen locked | Resume without reconstructing events | Phone OS, conversation | Worries whether entry saved | Reopen directly to active movement with saved rows/draft intact | No login, loading tutorial, or data-loss warning on every visit |
| Leave early or finish | Get on with day; retain partial work | Travel, shower, next appointment | Satisfaction or disappointment | Finish summary sheet with actual sets, Save workout | No punishment for incomplete prescribed sets |
| Between visits | See consistency without detailed analysis | Memory, calendar | Wants small recognition of effort | Home attendance marks and concise movement changes | No streak guilt, invented muscle-growth score, or notifications |
| Return next week | Decide repeat, more reps, or more load | Same/different machine; current fatigue | Wants confidence, not algorithmic orders | Same-setup previous sets beside today's editable values | No auto-marked performed sets, false equivalent machines, or automatic load increase |

The most valuable intervention is the connection between the final and third rows: turn last week's actuals into useful context at the machine. The attendance chart supports motivation; it must not displace that job.

## Information architecture: exactly two primary screens

### 1. Home: “Where am I, and what do I do next?”

Reading order at a 390 px viewport:

1. Small identity/date line and an accessible settings icon. No marketing headline.
2. One strong summary: **“8 gym visits”** with explicit period **“Last 4 weeks.”** A four-week strip of day marks sits alongside or immediately below. Multiple sessions on one local calendar day count as one visit. Only finished workouts with at least one actual set count. A mark shows a recorded visit, never an attendance prediction. A compact legend appears once, not on every cell.
3. Primary next-action panel. With an active session: **“Continue chest + back”**, actual sets recorded, **Continue workout**. Otherwise: **“Next workout”**, suggested/recent routine, readable exercise count, **Start workout**, secondary **Choose something else**. A historical routine is a suggestion, not a scheduled appointment. If nothing planned, use **“What are you training?”** and **Plan a workout**, without a fake next date.
4. **“Getting stronger”**: compact movement/per-muscle evidence. Example **“Chest · incline press +1 rep”**, accompanied by a small correctly scaled sparkline only when comparable data exists. Group summaries aggregate actual comparable movements, not anatomy growth. Neutral states **“First session recorded”**, **“Building a baseline”**, **“No comparable session yet.”** The metric is “performance,” never “muscle growth.”
5. **Recent workouts**: three quiet rows with date, muscle groups, sets; tapping opens a history sheet. No entire historical set tables on Home.

If there is no history, show an attractive but literal empty chart (unfilled visit marks), “Your first session starts the story,” and the start action. Do not fill it with demo progress. If there is active work, continuing it outranks starting a different routine.

No permanent three-item bottom navigation. Home has one stable main action; Workout has an explicit Back/Home action that does not discard the session. Settings/backup is accessed by a labelled icon, not treated as a training destination.

### 2. Workout: “What did I do, and what is next?”

1. Compact back control; workout label, optional actual elapsed duration, and Finish. Duration is descriptive, never a score. No separate start/stop session timer feature is required.
2. An ordered list of exercises; one is expanded, all others remain visible as short name + completed/planned sets rows. The user can tap any movement, so machine availability does not enforce an artificial sequence. Row status is textual as well as visual.
3. Expanded exercise: name, target/equipment as one subordinate line, obvious **Swap** text action. Avoid hiding swap behind an ellipsis.
4. **Last time** in one line: actual weight × reps for the same setup/date. If changed setup, show “New setup” instead of carrying over apparently comparable numbers. Tapping “Last time” opens the comparison sheet without leaving the workout.
5. A true notebook grid: Set | kg | reps | check. Completed rows remain readable and correctable; the next draft is visually prominent. Planned later rows are understated. Values are editable native numeric inputs with enough space for decimal weights. The check target is at least 48 × 48 px. A tap commits once, displays saving, then saved only after the database transaction completes. Failed save keeps typed values and exposes Retry in place.
6. After record: focus stays predictable, the next draft uses the previous actual values, and a small optional **“How many more good reps?”** affordance appears on the just-saved row. Do not make it a modal or required follow-up. Answer choices: **0 / 1 / 2 / 3 / 4+** with a clear explanatory sentence; no RPE jargon as the entry point.
7. **Add set** below the table; switching to the next movement remains one tap. No giant fixed footer obscuring last set or keyboard.

A quiet chart icon can appear next to Last time only if its accessible name is specific; the visible value must remain useful without opening it.

## Temporary sheets, not extra destinations

A sheet is subordinate to one of the two screens and returns to the same scroll/focus context. Back/escape dismisses it; cancellation never changes actual records. Desktop uses a constrained dialog with the same content hierarchy. Do not stack nested dialogs.

| Sheet | Entry | Content and primary action | State and recovery |
|---|---|---|---|
| Plan | Home “Choose something else” / first start | Muscle multi-select → exercise count → immediate exercise preview; **Start workout** | Single sheet with inline content, not a three-screen wizard. Changing groups regenerates only unstarted draft. Selection before Start is explicitly uncommitted. |
| Swap | Expanded exercise **Swap** | Same-target alternatives first, name + equipment; **Use this instead** | Already performed sets remain attributed to original; remaining work uses replacement. Pending typed input requires an explicit choice before replacement. |
| Exercise details | Last time or Home performance row | Date, same-setup previous/current actuals; complete evidence and effort qualification | No claim when comparison is incomplete. Long explanatory caveats live here, while an essential short qualifier stays with Home headline. |
| Workout history | Home recent row | Actual sets, date, correction controls | Edits clearly identified; no silent retroactive plan changes. |
| Finish | Workout **Finish** | Actual exercise/set count, unfinished draft warning when needed; **Save workout** | Save failure leaves active workout; no fake success. Partial workout can finish. |
| Data & settings | Home settings | Backup download, import preview/merge, storage protection, units/gym, progression preference | Protect existing backend contracts. Truthful “On this device”; never “Safe forever.” Import preview precedes mutation. |

## Flow examples expressed as physical tasks

### Returning next week

Open bookmark → Home shows last visits and recent chest/back routine → Start → Workout expands first movement → see last week's actual 20 kg × 10, 10, 9 → today's default is editable → perform set → record 20 × 10 → optional effort → leave app alone during rest. If full prescribed sessions and comparable effort justify a suggestion, show **“Try 11 reps”** or **“Consider 22 kg”**, subordinate to last actuals. Suggestion is intention until a set is recorded. User can ignore it without dismissing warnings.

### Occupied machine

See machine busy → tap movement row → Swap → choose same-target alternative → sheet closes into new exercise → old performed sets retain identity → new setup explicitly has no comparable baseline. No network, search typing, or plan recreation required for common alternatives.

### Interrupted set entry

Type weight and reps → lock phone → reopen pinned app → current workout and typed draft remain → finish entry → tap check. An offline badge is only shown when relevant, not a persistent warning dominating the table. Error messages are local to affected action.

### Leaving early

Only two movements done → Finish → summary says exactly those actuals and warns if there is a typed unrecorded draft → Save → Home increments visit count and lists the actual session. Unperformed planned work is never promoted to actual work.

## Visual direction: a meaningful break from the old ledger

The old implementation is dark green, text-heavy, and places several comparable rectangular surfaces on every screen. Removing one navigation item while keeping that composition would not solve the problem.

**Home is a bright, quiet personal training journal:** warm near-white canvas, near-black typography, large editorial attendance number, generous spacing, delicate day marks, neutral dividers. Use one saturated cobalt for navigational action and a restrained spring-green for actual positive performance signals. Avoid a stack of equally weighted cards. The next workout may be a single bold cobalt panel; progress below should read as a lightweight list/data visual, not more equally sized tiles.

**Workout is a focused graphite worksheet:** neutral near-black background, white numbers, charcoal rows, crisp light borders. The same type scale, spacing and control geometry connect it to Home. Bright green reserved for saved actual status, not all decorative accents. This scene change is intentional: the user is performing rather than browsing.

Suggested starting tokens (must be checked on actual renders): Home canvas #F7F7F2, ink #171A20, secondary #5C626B, rule #D9DDD8, cobalt #254CF4; session canvas #121417, row #20242A, session ink #F6F7F9, secondary #ADB4BE, saved #A7E6B0. Never assume muted text or thin chart lines pass contrast because the palette looks restrained.

Avoid uppercase microcopy everywhere, pseudo-scientific body glow, arbitrary percentages, identical card stacks, decorative sparkline without axes/meaning, or a mandatory video hero consuming the set-entry viewport. Reference screens can inform rhythm and touch ergonomics; copying their implausible muscle growth indicator is not evidence.

## Components and exact responsibilities

- **VisitStrip:** 28 local-day cells; today outline distinct from visit fill; accessible text alternative lists visit dates and count. No stroke is the sole indication of a meaningful record.
- **NextWorkoutPanel:** discriminated empty / recent-suggestion / active; one dominant CTA, one quiet alternate. It never creates records merely by rendering or selecting a suggestion.
- **PerformanceRow:** group + movement + actual change + period; sparkline optional; essential qualifier such as “effort not recorded” remains visible. Expanded evidence only on demand.
- **ExerciseOutlineRow:** name, completed/target counts, active state; full-width 48px minimum target. No horizontal exercise-number carousel as the only navigation.
- **SetWorksheet:** distinct previous context, committed actual rows, current editable draft and future intentions. Shared correction state. Preserve decimal keyboard and semantic labels. Drafts must not look checked.
- **InlineCommit:** idle, committing, recorded, failed; non-destructive saved marker; explicit Edit action. No timed animation pretending persistence succeeded.
- **EffortPicker:** plain-language question, five labelled options, optional Skip/clear; no slider requiring precision.
- **ActionSheet:** focus trap, labelled heading, close action and escape; restore focus to trigger; never require swipe gesture. Keep gym-critical choices above the keyboard when shown.
- **DataSafetyPanel:** transaction errors and backup/import controls reused from existing app; routine reassurance compact, detailed explanation disclosed.

Use existing data and domain logic where correct. New composition must not rewrite persistence simply to match a new visual system. Retain the backup path even though it is no longer primary navigation.

## What this design intentionally does not add

No food diary, coach messaging, login, routine calendar, social feed, badges, arbitrary readiness score, push reminders, rest-timer configurator, or biological muscle-growth estimate. No third primary screen is necessary. A third screen should only be reconsidered if actual observed use shows that detailed history dominates Home or cannot fit a usable sheet.

## Validation before claiming success

Synthetic walkthroughs are a design critique, not user testing. Rehearse user tasks with: (a) familiar routine, (b) first visit, (c) occupied equipment after one set, (d) interruption while typing, (e) partial session, (f) same movement a week later at a different gym. Record expected states and failure branches. Then ask the actual user to try the next gym session.

Proposed observable checks, not proven results: can identify next action without explanation; can find last actual performance without leaving workout; can record a set by editing two values and one commit; can swap without losing original actuals; can explain what the Home progress indicator means; can recover an interrupted typed entry. Verify 320px/390px layouts, large text, reduced motion, keyboard focus, offline reload, save failure and backup restore. Real one-handed comfort, fatigue and motivational effects require actual use.


## Implementation audit: actual app, October 18

Reviewed `TrainingHome.tsx`, `training-home.css`, `PersonalApp.tsx`, actual screenshot `docs/images/two-screen-empty.png`, and a fresh synthetic browser context at 390 × 844 on the local server. Browser walkthrough: empty Home → Plan a workout → Chest → Build my workout → review two exercises → Start workout → first active exercise. No horizontal overflow was observed in these states. This was a designer inspection, not a user test or a complete regression pass.

### Implemented and visible

- There are two primary application scenes, Home and Workout; no separate permanent Progress or Backup destination. The Home return control preserves the active session.
- Home is genuinely different from the earlier green ledger: warm light canvas, large visit count, 28 day cells, next-action panel, compact performance rows and most-recent session. Workout uses neutral graphite and large numeric cells.
- Visit count uses distinct local calendar days in the last 28 days with a finished nonempty workout. Dates use session start; a session finishing after midnight retains its start day. Multiple sessions on one date count once.
- Home prioritizes an active session, otherwise offers the most recent routine as an explicitly repeated suggestion. It does not invent a future calendar booking.
- Home separates supported performance from biological growth. Group comparisons use actual same-setup domain calculations. Qualifiers and fuller evidence remain available.
- Workout shows an ordered exercise outline, one expanded set worksheet, explicit actual-record commit controls and optional effort. Matching previous actuals are shown when available. All movements remain selectable rather than forcing machine order.
- Data settings and evidence/history are modal dialogs. Existing local-data contracts were retained rather than replaced for visual convenience.

### Differences from the proposal above

- **Planning is not a sheet.** Plan and plan review are states within Workout. They have a Home return action. This keeps two primary destinations but is still more than two visual states; saying there are only two literal views would be misleading.
- **Swap is inline, not a sheet.** This may be a reasonable lower-navigation choice; it needs an actual occupied-machine trial. The proposed sheet is not claimed as delivered.
- **Performance uses small comparison segments, not a time-series sparkline.** Segments represent movements/comparison status, not repeated visits or longitudinal growth. A chart would need actual matched time-series data and clear labels.
- **Recent sessions currently show only the most recent session**, plus the total count; fuller history is in the evidence dialog. The proposed three recent rows are not delivered.
- **The first captured Home had a large introductory heading.** Its plan action was around 610 px down in the initial empty screenshot. Following review, the implementer reduced heading size and top spacing. The final refreshed capture, rather than that initial image, is the reference. Short-height/large-text ergonomics remain to be tested.
- **Duplicate active-session actions were found and removed during review.** The implementer reports that the subordinate duplicate and repeated bottom resume action have been removed, leaving one dominant Continue workout route. This is a change after the first inspection, not a claimed initial design success.
- **First-session set rows retain future placeholders and labels.** The fresh active worksheet has one draft plus two planned rows. This is clear about intention versus actual, but the user's next gym trial should determine whether future placeholder rows help or add unnecessary visual noise.
- **Swap discoverability was raised in review.** The first inspection found an icon-only accessible trigger. The engineer is adding a visible Swap label; final QA should confirm this rendered change. The engineer is also adding Use last time to explicitly fill a draft without recording a performed set. Neither change establishes discoverability or comprehension without user use.

### What remains uncertain

Real fatigued one-hand operation, machine substitution discovery, whether the landing headline is worth its space, and whether attendance/performance visuals motivate this specific user have not been observed. The user should try: record one real session, return a week later, and find the last matching actuals without assistance. Do not call these findings validated research.

### Final rendered follow-up

Final QA confirmed a visible Swap label and Use last time action. The latter fills pending weight/reps without creating actual sets; explicit Log is still required. The redundant Next exercise control is absent for a single-movement session. Updated actual screenshots are in `docs/images/two-screen-home.png` and `docs/images/two-screen-workout.png`; these are synthetic fixture captures.

## Workout audit follow-up

See `TWO-SCREEN-WORKOUT-AUDIT.md` for the later executable multi-exercise walkthrough, the performed-work repeat policy, finish-confirmation focus fix, and typography cleanup. Current Home has a plain Training title, no motivational hero/eyebrow, and three shared text roles. Older captures and proposed heading sizes above are historical.
