> Upstream design record, written before screen composition. Subsequent readiness decisions and delivery status are recorded in [DESIGN-DELIVERY.md](DESIGN-DELIVERY.md); the initial pause/blockers below are retained as process evidence.

# Whiteboard: user journeys and service blueprint

## Design reset and evidence boundaries

This is upstream design work, not a screen specification extracted from a feature list. App UI implementation is paused. PM and UX first identify the human job, the point of friction, the intended intervention and a task flow. Reusable design-system parts and screen composition follow those decisions. The browsable design workbench is an illustrative sandbox; it must not imply that its controls save actual workouts or touch the personal notebook database.

Evidence inputs: the user's first-person requirements (knows intended training, wants simple local logging, smart distinct-target planning, quick equipment substitutions, durable records and optional plain-language effort/progress); user-provided workout reference stills/recording; expert inspection of current source and generated screenshots. There are no user interviews, observed gym sessions, measured one-handed timings or verified emotion studies. Every emotion below is a hypothesis to test. Reference attractiveness is not proof of usability.

## Problem framing before features

| Problem ID | Human problem | Intended outcome | How an intervention could fail |
|---|---|---|---|
| P01 | Logging requires translating between a plan, editor and separate receipts while attention is on training. | Capture an actual in its lasting place with minimal cognitive movement. | A visually compact table can become tiny, unlabeled or ambiguous. |
| P02 | A machine change, keyboard, call or browser background interrupts intent. | Return to the same pending task without reconstructing it. | Auto-navigation, lost drafts or silently renamed actuals destroy continuity. |
| P03 | Local storage is invisible; a false save or lost browser data destroys trust. | Know what is committed and have an external recovery route. | Overpromising permanence or constant warnings either mislead or fatigue the user. |
| P04 | Broad muscle intent does not identify a sensible small session. | Make a deliberate lineup with understandable coverage and little setup. | Fake optimization, repetitive targets or excessive configuration undermine confidence. |
| P05 | Larger numbers can be mistaken for progress under incompatible contexts. | Understand actual recorded changes and their limits. | Growth scores, cherry-picked best sets or mixed-machine comparisons mislead. |
| P06 | Effort jargon can interrupt a simple habit. | Optionally remember perceived difficulty without studying a scale. | Mandatory RPE questions and unexplained numbers add work and false precision. |

## Service model and information architecture

Three sequential jobs anchor the experience: **Prepare** (turn intent into a lineup), **Capture** (record actual training) and **Understand** (interpret evidence later). **Protect** is a trust service across all three, with a dedicated recovery destination. This is a single-person local notebook, not a trainer service or engagement feed.

The user's mental objects are today's intention, a session, an exercise with a physical setup, an actual set, an optional effort estimate, previous evidence and an external backup. Planned targets, pending typed values and committed actuals are different objects even when they share one visual row. The IA must keep those meanings clear before styling.

Today groups Prepare and Capture because both concern the same session; an active session takes priority over generating a new one. Progress groups dated records and comparisons because the user asks what happened and what changed together. Backup groups export/import, storage protection and install explanation because they answer where the notebook lives and how it survives. Local save state follows the current action; it is not a fourth primary task. Settings stay beside the context they configure: movement setup with the movement, progression hints with evidence, storage protection with Backup.

Frequency hierarchy: weight/reps capture and the currently selected movement dominate; selecting/swapping a movement and finishing are nearby; optional effort/correction/setup are contextual; progress interpretation and backup are available when deliberately sought. Rare recovery states can temporarily override the hierarchy because silently losing work is worse than temporary friction.

## Blueprint lanes and priority

Each journey lists: human intent/context; digital touchpoint and visible UX; local backstage behavior; external browser/human dependencies; friction/emotion hypotheses; intervention and rationale; states/recovery; acceptance. P0 means data integrity or essential capture; P1 means essential setup/understanding; P2 means optional enhancement. Priority does not permit hiding necessary error recovery.

### J01 — Arrive and establish trust (P03, P02; F01; P0)

**Human intent/context:** Open a bookmark/home-screen app before or during training, perhaps on first visit or with poor reception. The immediate question is whether an unfinished session exists, not how many features exist.

**Touchpoints and visible UX:** Launch icon/browser → initial local loading → either current session, empty planning entry or actionable read failure. A first-time user sees what the tool does in one sentence and a useful first action, not a permissions carousel. A returning user sees their pending exercise and actuals. Offline readiness and save status are distinct.

**Backstage:** Read and validate IndexedDB before choosing empty/resume state. Service worker cache readiness is independent of database readiness. Do not clear corrupted/unreadable data to produce a pleasant empty state. Load failures preserve records and offer Retry/recovery information.

**External actors:** Browser supplies secure-context storage/service worker support, installation UI and OS keyboard. User chooses browser/profile/origin. Static hosting supplies assets on first visit; there is no account or workout server.

**Hypothesis:** A returning user may feel anxious if old work is temporarily absent; a first-time user may be skeptical about invisible local storage. **Intervention:** Explicit loading and an honest local-data description establish continuity without a lecture. **Test:** Observe whether users mistake loading/error for a fresh notebook.

**States/recovery and acceptance:** Initial → reading → empty/resume; reading → error → retry. An unreadable database never renders empty success. Unsupported install APIs do not block logging. No permission request is necessary just to discover the first action.

### J02 — Turn training intent into a lineup (P04; F02; P1)

**Human intent/context:** Knows Chest + Back or another broad focus and roughly how much work is practical; may be standing in the gym.

**Touchpoints and visible UX:** Group selection → bounded exercise count → compact lineup → optional local adjustments → Start. Show movement names, actual equipment, set/range summary and a concise explanation of distinct primary targets. Coverage is a useful constraint, not an anatomical growth promise. Edit selection goes back without changing anything until the user actually edits/rebuilds.

**Backstage:** Curated catalog chooses distinct primary targets before duplicates, includes every selected broad group and caps impossible requests. Preview is intention only; Start atomically saves an active draft before showing success. Do not auto-log prescriptions. Preview durability before Start is a design question to disclose; the existing app only guarantees active-draft durability, not unsaved planner survival.

**External actors:** User knows time/equipment availability; app cannot know a machine is occupied. No external AI or remote plan generation is involved.

**Hypothesis:** Choice overload or claims of optimization may create uncertainty. **Intervention:** Compact defaults with local override reduce upfront decisions; an honest coverage limit is better than a fabricated answer. **Test:** Can the user explain what the suggested lineup covers and change one movement without regenerating all others?

**States/recovery and acceptance:** Empty selection, valid selection, impossible count, generated review, inline customization, invalid prescription, starting, failed write. Cancel preserves prior preview; start failure keeps intention; one retry creates one draft. No selected group silently disappears.

### J03 — Capture the set just performed (P01, P03; F03; P0)

**Human intent/context:** Between sets, breathing heavily, one hand free, attention on training rather than a phone. Needs to remember two numbers and know they were recorded.

**Touchpoints and visible UX:** Exercise header/context → next row's weight and reps → deliberate record check → same row now recorded. Actuals remain spatially stable. Prior values are labeled reference; planned placeholders are not editable actuals. One current row avoids simultaneous-draft ambiguity. Repeating exact values is explicitly labeled as recording one additional performed set.

**Backstage:** Persist pending input separately from actual creation; serialize writes; validate load/reps; commit stable set identity with timestamp; acknowledge only after transaction completes. Duplicate taps cannot create duplicates. Revision conflict blocks overwriting a newer tab. Persist active exercise on deliberate switching without creating actuals.

**External actors:** OS keyboard and viewport resize, browser backgrounding, user's memory of actual unit/load convention. Gym/environment can interrupt at any moment.

**Hypothesis:** Users may feel hurried and distrust a transient toast they cannot reread. **Intervention:** Stable row, local saving state and durable visible actual reduce memory and navigation. **Test:** Can a user distinguish typed-but-not-recorded, target and recorded actual without explanation?

**States/recovery and acceptance:** Blank, partially typed, valid pending, invalid, committing, recorded, failed/blocked. Keep input on failure, offer retry/export/reload explicitly. Reopen after successful commit reproduces exact actuals; switching retains pending values. No green recorded state before commit. Numeric fields and check usable at 320 px with keyboard-aware layout.

### J04 — Correct a mistake without rewriting the workout (P01, P03; F04; P0)

**Human intent/context:** Realizes 40 was entered instead of 42.5, or an extra set was accidentally logged.

**Touchpoints and visible UX:** Saved row → clearly discoverable contextual Edit → inline correction → Save/Cancel; explicit Delete → nearby Undo. Do not overload the recorded check as destructive toggling. Keep correction meaning distinct from recording another set.

**Backstage:** Update same set identity; preserve timestamp and optional effort unless explicitly changed. Delete/undo restores original identity/order/metadata. Wait for write completion before closing successful edit; failed correction retains proposed values and original committed copy.

**External actors:** User is the authority on what was actually performed; no coach approval or remote audit is needed.

**Hypothesis:** A mistake may feel irritating, especially if correction is hidden. **Intervention:** Local edit affordance and reversible deletion make mistakes low cost. **Test:** Find and correct an actual without accidentally adding one.

**States/recovery and acceptance:** Saved → editing → valid/invalid → committing → saved; Cancel returns unchanged; deletion offers restoration. Storage conflict never silently overwrites; keyboard focus returns to a meaningful row. Exactly the intended record changes.

### J05 — Continue when the planned machine is occupied (P02, P04, P05; F05; P0)

**Human intent/context:** Arrives at the next machine and cannot use it; may already have performed a set before moving.

**Touchpoints and visible UX:** Exercise-level Swap → compatible same-target alternatives with equipment → choose or Cancel. Unlogged typed values require explicit discard/return choice before replacing an unperformed occurrence. If actuals exist, the original remains visible and replacement is a separate segment with remaining planned sets.

**Backstage:** New movement identity and context; no copied actuals or transferred progressive history. One of three logged leaves two planned on replacement; completed original plus chosen replacement starts one additional planned set. Preserve pending input on retained original. No candidate is a recoverable empty state, not a fake recommendation.

**External actors:** Only the human knows real-time availability and suitability. Catalog is a starting point, not a safety assessment or exercise prescription.

**Hypothesis:** An occupied station can cause frustration and urgency. **Intervention:** Local target-preserving alternatives minimize replanning while identity preservation protects future evidence. **Test:** Can the user explain why old sets retain the old machine name?

**States/recovery and acceptance:** Closed, options, none available, pending-discard confirmation, committing, replacement active, failure. Cancel changes nothing. After swap+finish, history attributes old/new actuals correctly. Substituting one movement never changes unrelated exercises.

### J06 — Survive interruptions and resume (P02, P03; F06; P0)

**Human intent/context:** Answers a call, locks phone, changes tabs, loses network or returns another day to an unfinished session.

**Touchpoints and visible UX:** Background/leave → reopen → local read → same active exercise, pending inputs and committed actuals. Offline readiness is factual; being offline is not a data-save failure by itself. A session remains unfinished until explicit finish/discard.

**Backstage:** Completed IndexedDB transactions survive normal closing; service worker caches app assets for offline reopening. Writes still in progress when the browser kills the page cannot be guaranteed. No forced reload during editing; stale tabs must resolve conflicts safely.

**External actors:** Browser can suspend/evict/clear data; OS can kill a tab; same-device installation/browser profile behavior varies. Backup is the external recovery route, not install alone.

**Hypothesis:** Users may fear lost work after reopening. **Intervention:** Restore context before new planning and make any failed save explicit. **Test:** Background/reopen, reload after commit and simulate stale-tab conflict. Human endurance and long-term eviction are not established by a synthetic test.

**States/recovery and acceptance:** Active → backgrounded → reading → restored; unready offline → unavailable shell explanation; stale conflict → retry/export/explicit reload. Never overwrite newer data or claim uncommitted work permanent. No recovery action auto-clears the database.

### J07 — Optionally remember how difficult a set felt (P06, P03; F07; P2)

**Human intent/context:** Wants extra training context after recording actuals; may have no interest in tracking effort.

**Touchpoints and visible UX:** Optional effort on saved row → good-form reps remaining question → 4+ more/3/2/1/No more → explicit choice saves; close without change. RPE is secondary expandable explanation, approximate 10 minus reps left; 4+ is about six or less. A different weight/reps edit remains a separate explicit-save operation.

**Backstage:** Optional integer repsInReserve 0–4, absent means unknown. Commit only this metadata on same set identity; removal deletes optional field. Preserve through correction, undo and backup. Old records remain valid with no migration reset.

**External actors:** Human estimates fatigue; the app cannot measure true reps remaining or technique. No sensor inference.

**Hypothesis:** Jargon or mandatory prompts may feel burdensome. **Intervention:** Everyday wording and deliberate optional entry keep essential logging short. **Test:** Can users log without answering, explain 4+ correctly and clear an estimate?

**States/recovery and acceptance:** Unrated/rated, picker open, saving, failed, removed. Never automatically open after every set. Failed effort write preserves choice without changing actual weight/reps. Missing effort is not easy effort and is explicit in comparison caveats.

### J08 — Leave with a saved session (P02, P03; F08; P0)

**Human intent/context:** Done or leaving early; wants closure without completing a program to satisfy software.

**Touchpoints and visible UX:** Finish → factual actual-set summary → conditional pending-input decision → Save or Keep logging. No actuals offers Keep draft or explicit discard. Partial training is valid. After successful save show a restrained receipt and optional backup action.

**Backstage:** Check pending values across every movement, not just visible active one. Atomically move session to history and clear draft. Preserve actual order, original setup and substitution segments. Retry cannot duplicate history.

**External actors:** User decides when finished; no adherence judgement. Browser file download may be offered later, never auto-triggered as an implied verified backup.

**Hypothesis:** User is mentally finished and impatient. **Intervention:** Conditional confirmation only for real risk avoids both accidental data loss and unnecessary ceremony. **Test:** Finish partial, cancel with pending values on a hidden movement and recover failed finish.

**States/recovery and acceptance:** Confirm, pending choice, empty draft choice, committing, saved, failed. Failure leaves draft; success never precedes transaction commit. No implied actuals for unperformed planned rows.

### J09 — Return and understand what changed (P05; F09; P1)

**Human intent/context:** At home or before another session, asks what to repeat or increase and whether performance is improving.

**Touchpoints and visible UX:** Progress → factual muscle-group comparison count → expand evidence → dates/setup/ordered actual sets → optional conservative next-load guidance. Empty/baseline/mixed/lower/harder-effort states use neutral language. One good comparison does not turn an entire muscle into a growth claim.

**Backstage:** Compare latest two finished exact movement/setup/unit/prescription occurrences with complete counts; do not replace a latest partial with an older favorable result. Count ordered nondecreasing weight/reps with strict increase; known harder effort prevents a qualified same-effort improvement; absent effort remains unknown. Mixed trade-offs are review, not inferred strength growth. Group by primary target only. Optional hints change a future editable target, never actuals.

**External actors:** Technique, ROM, recovery, body mass and machine calibration remain unmeasured. User interprets evidence in context. Research supports general progressive overload, not an individual growth score.

**Hypothesis:** User may want reassurance and be vulnerable to overconfident metrics. **Intervention:** Concrete sets first, concise summary second, explanation on demand. **Test:** Can user trace a headline to actuals and recognize why changed machines or harder effort limits it?

**States/recovery and acceptance:** No history, baseline, comparable improving/steady/mixed/lower/harder, unknown context/effort. Show numerator and denominator including eligible non-improving comparisons. Corrections recompute evidence. No chart or trophy substitutes for inspectable data.

### J10 — Protect and recover the notebook (P03; F10; P0)

**Human intent/context:** Wants confidence after several sessions, before changing device/browser/origin, or after data loss.

**Touchpoints and visible UX:** Backup → honest local status → optional persistence request → export file → keep externally; or choose file → inspect → preview merge → confirm → restored. Backup is findable but not an every-set gate. Distinguish file created from verified externally retained.

**Backstage:** Versioned checksummed JSON; validate full schema, IDs, values and optional effort; inspect before mutation; merge atomically; identical IDs dedupe, conflicting records/drafts reject without partial changes. Preserve existing settings when notebook nonempty. Never clear local data automatically to repair import.

**External actors:** Browser grants/refuses persistent storage, downloads files and supplies native picker. User must retain file outside browser; OS/cloud folder management is outside this app. First-party local storage is not cross-device sync.

**Hypothesis:** Invisible browser limits may create worry or false confidence. **Intervention:** Plain limitations plus a concrete recovery action create agency without alarmist repeated banners. **Test:** Export nontrivial notebook, restore clean sandbox, reject corrupted/conflicting file and confirm old data unchanged.

**States/recovery and acceptance:** No export yet, persistence granted/refused/unsupported, exporting, created, selecting, invalid file, validated preview, merging, restored, conflict/failure. Cancel picker/preview leaves everything untouched. Clearing site data without an external backup cannot be promised recoverable.

## Traceability handoff to flows and reusable parts

Component IDs are stable interaction contracts for UX system mapping, not instructions to create screens now: C01 local-state indicator; C02 muscle selector; C03 bounded count; C04 movement summary; C05 set ledger row; C06 contextual action/disclosure; C07 conditional confirmation; C08 inline validation/recovery; C09 effort choice group; C10 evidence summary/details; C11 backup file/merge preview; C12 app destination control. UX owns atoms, token choices, anatomy and variants beneath these contracts.

| Problem | Journey | Flow | Reusable contracts | Candidate surface only after composition |
|---|---|---|---|---|
| P03,P02 | J01 | F01 | C01,C08,C12 | Entry/read/resume |
| P04 | J02 | F02 | C02,C03,C04,C06,C08 | Intent + lineup |
| P01,P03 | J03 | F03 | C01,C05,C08 | Active ledger |
| P01,P03 | J04 | F04 | C05,C06,C07,C08 | Local correction |
| P02,P04,P05 | J05 | F05 | C04,C06,C07,C08 | Replacement choice |
| P02,P03 | J06 | F06 | C01,C05,C08,C12 | Resumed task |
| P06,P03 | J07 | F07 | C06,C09,C08 | Optional set context |
| P02,P03 | J08 | F08 | C01,C07,C08 | Session closure |
| P05 | J09 | F09 | C04,C06,C10 | Evidence notebook |
| P03 | J10 | F10 | C01,C07,C08,C11 | Protection/recovery |

## Design validation gates

The next output is an agreed IA/state-flow model and system anatomy, followed by a separate sandbox workbench showing parts/states and a small set of compositions. No production UI changes should be smuggled into this phase. Review each component against the friction it resolves; remove a part that has no journey role. Workbench states are fixtures and must be labeled illustrative. Before implementation, walk the complete end-to-end flow including keyboard, cancel, no history, no alternatives, pending hidden inputs, transaction failure and restore conflict. Real-user testing remains a future activity; synthetic walkthroughs can identify contradictions but cannot establish user feelings, delight or actual gym speed.

## Structured phase summary for the whiteboard

| Phase ID | Journey / flow | Goal | Feeling/friction hypothesis | Intervention | Frontstage | Backstage / recovery |
|---|---|---|---|---|---|---|
| PH01 Arrive | J01/F01 | Reach the right existing task | Skeptical; anxious if records appear absent | Read before empty state; honest local context | Loading → plan/resume/error | Validate local DB; retry without clearing |
| PH02 Prepare | J02/F02 | Turn muscle intent into deliberate lineup | Uncertain about coverage; configuration fatigue | Curated distinct targets and compact review | Select → bounded count → review/start | Validate coverage/prescription; persist draft on Start |
| PH03 Capture | J03/F03 | Record actual set with minimal translation | Hurried; unsure whether saved | Stable ledger row and explicit commit | Weight/reps/check → recorded row | Pending draft separate; transactional actual; retry |
| PH04 Correct | J04/F04 | Repair mistake without duplication | Annoyed; afraid of destructive edit | Local correction and reversible deletion | Edit/save/cancel/delete/undo | Stable ID/order/effort; retain failed edits |
| PH05 Adapt | J05/F05 | Continue around occupied equipment | Frustrated; needs fast decision | Same-target alternatives with attribution | Swap choices; conditional pending warning | Preserve old actuals; separate replacement setup |
| PH06 Resume | J06/F06 | Continue after interruption | Anxious about lost numbers | Restore exact context before replanning | Reopen to current exercise and pending row | Read persisted draft; stale conflict recovery |
| PH07 Context | J07/F07 | Optionally remember perceived effort | Unsure about jargon; dislikes extra chores | Plain good-form reps remaining, optional | Contextual picker; choice saves; close | Optional 0–4, preserve old records, failure retains proposal |
| PH08 Close | J08/F08 | Leave with trustworthy session record | Ready to leave; impatient with ceremony | Conditional loss warning and factual receipt | Finish → save/keep logging | Scan all pending fields; atomic finish; no duplicate retry |
| PH09 Understand | J09/F09 | See what actually changed | Curious; may overtrust a growth metric | Visible qualified count plus inspectable evidence | Group summary → dates/setup/actuals | Exact comparable pairs; neutral mixed/unknown reasons |
| PH10 Protect | J10/F10 | Retain external recovery route | Worried or falsely confident in browser | Concrete export/validated restore with honest limits | Backup status/file/merge preview | Checksum/schema validation; atomic dedupe/conflict rejection |

## Internal workbench review — first captured artifacts

PM reviewed `design-actions.png`, `design-ledger-390.png`, `design-effort.png`, `design-evidence.png` and `design-recovery.png` from the isolated library. This is an actual artifact expert review, not a human usability observation. The modeled interventions are present: stable ledger row states, a separate optional plain-language effort picker, visible performance qualification, retained-proposal recovery and distinct local/offline/external protections.

**Readiness blocked in this capture:** canvas/background and text inheritance are inconsistent. Near-white headings/helper text appear on a cream canvas, and some dark worksheet headings use dark text on dark material. Essential task labels and explanations therefore become unreadable. Functional click tests alone do not establish visual readiness. Resolve scoped canvas/text and worksheet heading inheritance, then recapture before using these components in production compositions. This is a rendered-style conflict, not a rejection of the service model or token direction. No production changes are authorized by this blocked review.

## Internal readiness re-review — corrected captures

PM re-opened the regenerated `design-actions.png`, `design-ledger-390.png`, `design-effort.png`, `design-evidence.png` and `design-recovery.png` artifacts after the scoped canvas/text/heading fix. The previously unreadable cream-canvas and dark-on-dark headings are resolved in these actual captures. Titles, helper explanations, values and conditional actions now read consistently on the intended dark materials. The 390 px ledger keeps ordinal, weight, reps and record control aligned; saved, pending and literal simulated-saving states are distinguishable. Optional effort remains separate and plain-language, the effort qualification appears beside the evidence headline, and recovery retains a proposal while explaining local/offline/external protections separately.

**Internal PM readiness: ready to compose production journeys from the reviewed shared library.** This supersedes the earlier captured-style blocker only; it does not declare production migration complete or waive regression checks. Root reports six isolated checks passing, including gallery heading contrast, keyboard/state interactions and no IndexedDB access; QA owns their executed evidence. PM acceptance here is rendered-artifact expert review, not independent re-execution of those tests or a human usability result. PM/UX readiness permits the next authorized implementation step without an additional inferred user-approval gate. Production compositions must reuse the reviewed parts and actual transaction handlers, then pass their own journey/data regression review.
