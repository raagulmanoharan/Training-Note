# The gym week before the app

Status: desk synthesis of this user's account, 18 October 2026. This is a real-world journey hypothesis for one person's personal tracker, not a completed interview study or observed usability study. It replaces an application-navigation map as the starting point. The original application service maps remain implementation records, not evidence about gym behaviour.

## Evidence boundary

**Firsthand statements from the user (U):**

- U1: They generally arrive knowing what they want to train, for example chest and back.
- U2: They want assistance choosing a small set of movements that covers distinct intended targets rather than repeating the same primary target unnecessarily.
- U3: After every set they want to record weight; reps must accompany weight to interpret performance.
- U4: A needed machine may be occupied; they need to swap quickly during the session.
- U5: Next week's workout should draw on the previous performance to support progressive overload.
- U6: The phone should work one-handed, with very little clutter and no drill-down through many screens.
- U7: Storage must survive sessions and weeks; the preferred product is a personal, home-screen-pinnable local web app.
- U8: They previously used Notes. Logging, assembling weekly updates and reconnecting feedback with the next workout were difficult. Workout video feedback, weight and food records were separated.
- U9: They do not understand RPE terminology but welcome an effortless plain-language way to express effort.
- U10: They now want a quick visual overview of gym attendance, progress across muscle groups and the upcoming workout, with only two or three screens overall.

**Hypotheses (H):** everything about fatigue, embarrassment, hurry, motivation, attention, phone handling, forgetting, unreliable connectivity and existing habits below is plausible but unobserved unless directly tied to U1–U10. Feelings are hypotheses, not findings.

**External evidence (E):** no new external sources were opened by the author of this document. Competitor/source research must be recorded separately with actual URLs, access results and observations. Screenshots and Pinterest inspiration can inform visual hypotheses; they cannot establish actual user behaviour or training efficacy.

## Service ecosystem: what produces the experience

The outcome is a useful training session and an understandable next session. The phone is one supporting object.

| Person, object or service | Work it does outside our app | Constraint the product must respect |
| --- | --- | --- |
| The lifter | Chooses a time, travels, assesses readiness, lifts, rests, remembers and adapts | Training and recovery take priority over phone attention |
| Gym and other members | Provide or occupy machines, benches and floor space | The intended exercise order and equipment are provisional |
| Equipment and plates | Define possible loads and increments | Different machines, dumbbells and setups are not automatically comparable |
| Body and readiness | Produce fatigue, pain, confidence and day-to-day performance variation | A lower result must not automatically become failure or a demand to increase load |
| Memory, paper or Notes | Hold the plan, last weight, shorthand and exceptions | A tracker must beat retrieving and marking a simple notebook |
| Phone, browser and OS | Provide input, storage, screen lock and installation | Input can be interrupted; browser retention is finite |
| Time, travel and obligations | Determine arrival, session length and early departure | An unfinished plan can still represent a completed useful visit |
| Optional trainer or trusted guidance | Helps choose safe technique, movements and appropriate targets | The personal tracker cannot infer technique or substitute for this judgement |
| External backup destination | Preserves an exported copy outside browser storage | A local save is not an independent backup |

## End-to-end journey and app overlay

The first four columns describe the experience even if the app does not exist. The overlay comes afterwards. A dash means the app should not demand involvement.

| Stage and human job | Real-world actions and artefacts | Friction / failure to investigate | Feeling hypothesis | Minimum useful app touchpoint | Moments deliberately left alone |
| --- | --- | --- | --- | --- | --- |
| 1. Between visits: decide whether/when to train | Fit a visit around the day; remember last attendance and intended training | Unsure when last trained or what comes next; missed visit becomes guilt | Want orientation, possibly apprehension | Home: actual logged visit dates and the last prepared/repeated workout. Label a suggested next workout as a suggestion, not an invented schedule | No streak nagging, attendance notification or daily engagement requirement |
| 2. Before leaving: settle the intention | Decide chest/back or repeat a familiar session; recall available time | Building a plan from scratch can cost more than Notes; overlong planned session | Confidence if familiar, impatience if planning is forced | Optional inline planner on Home; repeat last session or choose groups/count. Clearly show movements before Start | No mandatory readiness questionnaire, body measurement or nutrition form |
| 3. Travel and entry | Commute, change, place bag, warm up | App setup or connectivity can interrupt arrival | Attention on environment | Resume an active session or start the prepared session in one obvious action; cached shell and retained draft | No geolocation, gym check-in ritual or automatic visit counted just from opening |
| 4. Survey gym and choose first station | Look for a free bench/machine; choose sensible order | First intended station occupied; rigid list conflicts with reality (U4) | Mild frustration or hurry | Session: movement list immediately available; jump to any exercise without losing another exercise's draft | Do not require following a prescribed sequence |
| 5. Set up and remember last performance | Adjust seat, collect plates, recall previous weight/reps and setup | Last week's Notes entry hard to find; machine names ambiguous; wrong setup compared | Uncertainty about starting load | At the exercise, show matching previous actuals next to today's rows; explicit absence if no comparable history | No dashboard hunt or hidden chart needed to answer “what did I do last time?” |
| 6. Perform the set | Lift with attention on technique and sensations | Phone interaction during lifting distracts; planned load may differ from actual | Physical effort; concentration | — | No need to watch, tap or keep the screen awake while lifting |
| 7. Rest and make a trace | Put weight down; breathe; remember load/reps; possibly jot one line | Fatigue, small targets, typo, failure to submit; checking a suggestion accidentally counts it as actual (U3/U6) | Want certainty with minimal effort | One row: editable weight, reps, a large explicit record control. Previous values may prefill as editable intention, never recorded fact. Immediate pending then transaction-backed saved state. Optional “good-form reps left” after recording | No compulsory effort score, timer, note, photo or celebration blocking the next set |
| 8. Continue or adapt | Repeat, lower weight, add reps, wait or change station | Machine becomes unavailable; target changes; original completed sets get overwritten | Want control, avoid restarting | Inline Swap under exercise; show equivalent intended target and available setup options; preserve completed original work and separate replacement history. Cancel returns exactly to prior input | No full plan editor or loss of earlier work |
| 9. Handle interruption | Lock phone, answer message, lose signal, put it in pocket | Typed entry lost, duplicate tap, unsure whether set saved | Distracted; concern about losing work (U7) | Durable draft; distinct committed actual; resume exact point. If save fails retain input, explain and offer retry. No silent duplicate record | No re-login or compulsory re-entry after ordinary interruptions |
| 10. End the visit | Leave station, gather belongings, possibly stop early | Finishing checklist demands unperformed sets; forgotten draft; accidental abandonment | Tired, wanting to leave | Finish from Session: factual actual-set summary, explicit pending-input warning, ability to finish partially. Return Home with visit and history reflected | No required weekly report, subjective rating, social share or nutrition logging |
| 11. Recover and live | Eat, sleep, work; possibly reflect on one exercise | Tracker asks for an ongoing admin habit; storage anxiety only appears after loss | Satisfaction, indifference or uncertainty | No necessary touchpoint. Home has quiet data-safety access and a backup reminder when warranted; export/import in an overlay | No daily data-entry requirement |
| 12. Next week: decide what to repeat or increase | Recall last session; compare load, reps, effort and readiness; choose today's starting point | Cannot distinguish more load/fewer reps, harder effort or different machine; “growth” inferred from a single number | Want justified confidence, not pressure | Home quick evidence of attendance and comparable performance; Repeat workout. Session carries last actuals plus conservative optional next-target guidance and caveat. User confirms actuals after lifting | No automatic promise of muscle growth or command to increase weight |

## The week is a loop, not a funnel

Decide → arrive → choose an available station → recall → perform → rest/record → repeat/adapt → leave → recover → return and compare.

The inner loop is **perform → rest → record → perform**. This is the highest-frequency touchpoint, so the interface must optimise this loop even when it makes Home less feature-rich. The outer loop is **last visit → understandable evidence → today's intention**. A good dashboard that does not help choose today's load is incomplete. A good logger that cannot recover last week's result is also incomplete.

## Proposed two-screen architecture, derived from those jobs

### 1. Home: “Where am I, and what am I doing next?”

Order by consequence rather than feature categories:

1. **Resume**, if there is an active session. Otherwise **next workout** with a clear Start or Repeat action. “Next” must mean a plan the user chose or a plainly labelled repeat suggestion; no fictional calendar commitment.
2. **Visits**: compact calendar/dots for actual recorded session dates, with readable period and count. Visits come from completed sessions containing real performed work, not app opens. Missing or unlogged visits are not proof of not training.
3. **Performance by target**: a compact scannable muscle-group view with supported direction and sample count. Use “performance improving” only where matching exercise/setup evidence supports it. “No comparable sessions yet” is a first-class state. This is not a measured muscle-growth map.
4. A short recent-session list, expandable in place for exact history and corrections. Planner, backup, units and data management live in contextual sheets or disclosures on this screen.

Do not make the user choose “Today” versus “Progress”: they are two parts of the same return-to-gym question. Keep the first viewport focused on one dominant action and a small amount of interpretable evidence. Planner sheets must preserve Home scroll and cancellation must leave the prior intention unchanged.

### 2. Session: “What am I doing, what did I do last time, and what did I just do?”

One continuous worksheet, not separate exercise detail routes. Exercise title and relevant previous actuals, then set rows; the next useful empty/draft row has primary visual emphasis. Collapsed/compact other exercises stay reachable. Swap, add/remove set, edit, optional effort and finish stay in context. Preserve session and pending input on navigation or reload. A late correction changes the actual record, not the original prescribed intention.

No third top-level screen is presently justified. A settings destination would only house occasional actions; a separate progress destination would separate evidence from planning. A sheet is still an interaction and must be designed/tested, but it need not become a new navigation destination.

## Critical design choices and risks

- **Fast repeat is not false logging.** Reusing last numbers can reduce typing; only an explicit actual-record action makes them history.
- **Muscle labels are summaries.** One movement can train several muscles. Curated primary-target coverage helps avoid redundant suggestions but does not prove comprehensive programming or equate every exercise one-to-one with a muscle.
- **Comparison is setup-specific.** Do not join a replacement machine's numbers to the original machine as one continuous strength curve. Avoid aggregate kilograms across different exercises as a universal improvement score.
- **Progressive overload is an interpretation across visits.** More reps at the same weight or more weight for comparable reps may support a performance increase; effort, range and setup affect that interpretation. Present evidence and optional guidance, not a guaranteed biological result.
- **Completion is factual.** Early departure must not destroy a useful session or turn unperformed planned rows into actuals.
- **Low touch is a success criterion.** Time in app, notification opens and daily active use are inappropriate success metrics for this personal tool.

## Failure paths the screens must settle

| Scenario | Expected human outcome | Required UI/data behaviour |
| --- | --- | --- |
| Arrive to occupied first machine | Begin elsewhere without replanning | Jump exercise; preserve all drafts and actuals |
| Different machine substituted | Finish target work and understand next comparison | Preserve original sets; distinct replacement identity and last comparable values |
| Typo after recording | Correct one number without restarting | Inline edit/cancel; confirmation only after durable commit |
| Lock phone before recording | Recover entered numbers | Restore draft; visibly distinguish from recorded actual |
| Save fails or repeated tap | Keep work and know its state | No success receipt until commit; keep values; safe retry without duplicates |
| Leave early | Retain the real visit | Finish partial; summary counts only actual sets; warn about unrecorded typed input |
| Return with no history | Start without fake evidence | Clear empty state, optional starting values entered by user, no fabricated progress |
| Return after several weeks | Reorient without punishment | Explain last recorded date; no broken-streak framing or forced load increase |
| Browser data cleared | Recover from an external copy if available | Honest local-storage limits, validated safe import; never promise infallible retention |

## Validation before claiming this works

No new participants were recruited and no actual gym observation has occurred. Synthetic walkthroughs can uncover inconsistent flows but cannot prove intuition, delight, physical comfort or adherence.

First personal trial should cover: repeat a known session; change the first exercise because a machine is occupied; record with one hand after a set; correct a typo; lock and reopen mid-draft; finish early; return the next week and decide a starting load using the record. Capture where the user hesitates, opens another tool, loses context or cannot distinguish saved from proposed values.

Proposed success criteria to validate, not measured findings:

- No navigation away from Session is needed to record, swap or recall the comparable previous set.
- A normal unchanged set requires one explicit record action once its weight/reps are correct.
- The user can state whether the shown row is planned, pending or actually saved.
- Next week, the user can explain which actual evidence supports a suggested change.
- The user can ignore optional effort and still complete every essential job.
- Home communicates actual visits and one actionable next session without charts requiring interpretation training.

A proposed timed target such as “record within five seconds” should only become a requirement after an observed baseline. First measure the user's real Notes workflow and new flow with representative conditions; do not invent benchmark results.
