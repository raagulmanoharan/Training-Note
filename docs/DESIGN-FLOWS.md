> Upstream design record, written before screen composition. Subsequent readiness decisions and delivery status are recorded in [DESIGN-DELIVERY.md](DESIGN-DELIVERY.md); the initial pause/blockers below are retained as process evidence.

# Whiteboard: information architecture and task-state flows

Read DESIGN-JOURNEYS.md first. These flows resolve the user jobs and exceptional paths before reusable parts or screen layouts are implemented. State names are conceptual interaction contracts, not assertions that every current implementation already has that exact state. Production UI remains paused. Fixtures in a design workbench must use their own local state and never the real workout database.

## IA agreement and ownership of meaning

PM and UX agree: Today owns Prepare/Capture/Resume, Progress owns Understand/Evidence, Backup owns Protect/Restore. Critical local recovery is cross-cutting rather than hidden in Backup. Optional effort belongs to a saved set; the RPE explanation is educational secondary content, not a main destination. Movement setup belongs with its movement; a global preference may supply a default but must not silently rewrite a performed exercise's identity.

Session object hierarchy: notebook → active draft or finished sessions → movement occurrences with physical setup → ordered actual sets → optional estimated effort. A plan is intention; a pending value is unfinished input; a recorded actual exists only after explicit commit. A comparison is a derived explanation, never authoritative actual data. An exported file is a recovery artifact, not another synchronizing notebook.

Navigation: changing Today/Progress/Backup preserves active draft and per-exercise pending fields. Returning Today resumes its active exercise. No new session replaces a draft without explicit preservation/discard decision. Browser Back must not delete data; ordinary same-page disclosure close/cancel returns to its originating context. Platform Back details need real-device testing before release.

## Shared transaction and focus contract

All flows that mutate actual data use: **ready → proposed local change → committing → committed** or **failed/blocked**. A visible proposal may remain after failure; it must never carry a committed check. Stable IDs and revision checks prevent duplicate retry and stale overwrite. Error state offers contextual Retry, external export of on-screen proposal where valid, and explicit reload of the saved copy with a discard warning. Do not label a generic stale conflict as a network problem. Do not clear the database.

Focus follows intentional task order. Open contextual action focuses/announces its heading or first useful control; Cancel returns to trigger if present. Load does not pop a numeric keyboard. Weight Next targets reps; an explicit commit action records. A committed row stays spatially stable; no auto-switch at planned volume. A numerical error is adjacent and announced once, not every keystroke. Targets remain at least 44 px, readable at 320 px, non-color states, reduced-motion-compatible. Keyboard layout must not bury focused input under persistent navigation.

## F01 — Boot and choose the right existing context

**Trace:** P03/P02 → J01 → C01/C08/C12.

```text
LAUNCH → READ_LOCAL
READ_LOCAL → [valid active draft] RESUME_ACTIVE (F06)
READ_LOCAL → [valid no draft] TODAY_INTENT (F02)
READ_LOCAL → [read/validation failure] READ_FAILED
READ_FAILED → Retry → READ_LOCAL
READ_FAILED → protection/help → RECOVERY_INFORMATION (not fresh empty state)
```

**Parallel concern:** asset cache unknown/installing/ready/failed is independent of record status. Offline-ready means confirmed shell cache, not permanent workout backup. Request install/persistence only deliberately or at an appropriate explanatory moment; denial keeps app usable.

**Exit/acceptance:** A user reaches the correct existing task without a mandatory onboarding wizard. No blank-looking notebook before successful local read. Controls never imply server sync.

## F02 — Prepare intention and review a lineup

**Trace:** P04 → J02 → C02/C03/C04/C06/C08.

```text
INTENT_EMPTY → select group(s) → INTENT_VALID
INTENT_VALID → edit count/groups → VALID or COVERAGE_LIMIT
INTENT_VALID → Build → REVIEW_LINEUP
REVIEW_LINEUP → Customize movement → LOCAL_PLAN_EDIT → Apply/Cancel → REVIEW_LINEUP
REVIEW_LINEUP → Swap → PLAN_ALTERNATIVES → Choose/Cancel → REVIEW_LINEUP
REVIEW_LINEUP → Change muscles → INTENT_WITH_PRIOR_VALUES
INTENT_WITH_PRIOR_VALUES → no change/return → REVIEW_LINEUP unchanged
INTENT_WITH_PRIOR_VALUES → actual change → PREVIEW_INVALIDATED → Build → REVIEW_LINEUP
REVIEW_LINEUP → Start → START_COMMITTING → ACTIVE_SESSION
START_COMMITTING → write failure → REVIEW_RETAINED + recovery
```

**Validation:** At least one group, count ≥selected groups and ≤available distinct targets/cap; valid set count and ordered positive rep range. Coverage limit gives a reason and smaller viable choice rather than silently omitting a group. Local adjustment does not regenerate unrelated movements. Planned defaults are not recorded actuals or individualized optimal training.

**Back/cancel:** All local edit/swap cancellations retain prior choice. Start failure retains plan. Pre-Start preview storage is not guaranteed by the existing model; disclose this product boundary rather than falsely marking it saved. A future persistence change requires its own explicit design/data contract.

## F03 — Capture actual sets

**Trace:** P01/P03 → J03 → C01/C05/C08.

```text
ACTIVE_EXERCISE → next blank row → PENDING_PARTIAL
PENDING_PARTIAL → type weight/reps → PENDING_VALID or INVALID
INVALID → explain adjacent reason → correct → PENDING_VALID
PENDING_VALID → explicit check/record → SET_COMMITTING
SET_COMMITTING → success → RECORDED_ROW + next pending row
SET_COMMITTING → failure → PENDING_RETAINED + NOT_SAVED → retry
RECORDED_ROW → Repeat exact values → SET_COMMITTING (one new actual)
PLANNED_COUNT_REACHED → Add set → EXTRA_PENDING_ROW → same capture loop
ACTIVE_EXERCISE → choose another header → SAVE_SELECTION → OTHER_EXERCISE
```

**Meaning:** Only one next pending row per exercise, all actual rows stay fixed; future rows are quiet targets/placeholders. Prior data stays explicitly Last time. Repeat is disabled with nonempty pending inputs to avoid hiding/discarding them. It names exact values and deliberately commits one actual; a future Copy action would fill inputs only and must not share that name/behavior.

**Failure/cancel:** Switching preserves each pending pair. A failed set write leaves proposal visible, no green actual and no duplicate retry. Actual count is independent from target; extra recorded sets never turn into a false percent-complete judgement. User can abandon a row without committing it, but final discard requires the explicit finish decision in F08.

## F04 — Correct or reverse a recorded mistake

**Trace:** P01/P03 → J04 → C05/C06/C07/C08.

```text
RECORDED_ROW → Edit → CORRECTION_DRAFT
CORRECTION_DRAFT → Cancel → original RECORDED_ROW
CORRECTION_DRAFT → invalid save → INLINE_REASON → CORRECTION_DRAFT
CORRECTION_DRAFT → Save changes → CORRECTION_COMMITTING → corrected RECORDED_ROW
CORRECTION_COMMITTING → failure → retain correction + original saved state + recovery
CORRECTION_DRAFT → Delete set → DELETE_COMMITTING → REMOVED_WITH_UNDO
REMOVED_WITH_UNDO → Undo → RESTORE_COMMITTING → original row/order/metadata
```

**Identity:** Correct the same set ID, do not append a new set. Keep effort unless explicitly edited through its own flow; delete/undo includes effort. Saving a correction is separate from logging a fresh actual. A saved check can open edit only with discoverable wording/help, never silently uncheck/delete. Failure must not close the editor early.

## F05 — Replace unavailable equipment without falsifying history

**Trace:** P02/P04/P05 → J05 → C04/C06/C07/C08.

```text
EXERCISE → Swap → SAME_TARGET_ALTERNATIVES
SAME_TARGET_ALTERNATIVES → none → NO_ALTERNATIVE → Close → EXERCISE
SAME_TARGET_ALTERNATIVES → Cancel → EXERCISE unchanged
SAME_TARGET_ALTERNATIVES → Choose candidate → inspect original occurrence
[zero actuals + no pending] → REPLACE_OCCURRENCE → commit → REPLACEMENT_ACTIVE
[zero actuals + pending] → DISCARD_PENDING_CONFIRM
DISCARD_PENDING_CONFIRM → Return → original pending row
DISCARD_PENDING_CONFIRM → Explicit discard and swap → REPLACE_OCCURRENCE → commit
[actuals exist] → RETAIN_ORIGINAL + ADD_NEW_SEGMENT → commit → REPLACEMENT_ACTIVE
```

**Rules:** Keep original actual identity. Remaining target is max(1, original planned minus original actual count); once target already met, explain one extra planned set rather than unfinished original work. Retained original keeps its pending values. Replacement starts without actuals; its previous evidence comes from its own setup. On failure retain originals/proposed change with a Not saved state; retry safe. Undoing a movement substitution is not implicitly promised by set undo.

## F06 — Interrupt and resume safely

**Trace:** P02/P03 → J06 → C01/C05/C08/C12.

```text
ACTIVE/PENDING/RECORDED → background or leave → SUSPENDED
SUSPENDED → return same live document → EXISTING_CONTEXT
SUSPENDED → reload/new document → READ_LOCAL → RESTORED_ACTIVE
RESTORED_ACTIVE → matching revision → continue F03
RESTORED_ACTIVE → stale competing edit → BLOCKED_CONFLICT
BLOCKED_CONFLICT → Export proposal OR explicit reload saved copy OR safe retry
```

**Boundary:** Browser/OS termination before a completed transaction may lose pending work; browser clearing/device loss can erase everything without external backup. Offline caching protects app availability, not permanent data. No forced refresh while actual entry is underway. Persistence request cannot be described as a guarantee. A reopened unfinished session stays unfinished even if its date is old; elapsed days do not auto-finish it.

## F07 — Optional effort in everyday language

**Trace:** P06/P03 → J07 → C06/C09/C08.

```text
SAVED_SET (rated/unrated) → optional effort action → EFFORT_PICKER
EFFORT_PICKER → Close → same SAVED_SET unchanged
EFFORT_PICKER → choose 4+/3/2/1/No more → EFFORT_COMMITTING
EFFORT_COMMITTING → success → saved phrase + return focus
EFFORT_COMMITTING → failure → proposed choice retained + Not saved
RATED_SET → picker → Remove effort → commit → UNRATED_SET
```

**Semantics:** Separate effort-only picker explicitly says Tap a choice to save; this is not a mixed weight/reps draft form where only one field autosaves. Choices answer good-form reps the user estimates remained. Optional RPE help approximates 10 minus remaining; four-plus maps to six or less. It is not sensor measurement. No automatically opened prompt, no extra required logging column, no missing-effort judgement. Removal deletes the field. Older records/backups remain valid.

## F08 — End a session deliberately

**Trace:** P02/P03 → J08 → C01/C07/C08.

```text
ACTIVE → Finish → INSPECT_ALL_PENDING_AND_ACTUALS
[no actuals] → KEEP_OR_DISCARD_DRAFT
KEEP_OR_DISCARD_DRAFT → Keep → ACTIVE unchanged
KEEP_OR_DISCARD_DRAFT → Explicit discard → commit → INTENT
[actuals + pending anywhere] → PENDING_DECISION
PENDING_DECISION → Keep logging → original task/pending context
PENDING_DECISION → Save without unlogged input → FINISH_COMMITTING
[actuals + no pending] → FACTUAL_SUMMARY → Save → FINISH_COMMITTING
FINISH_COMMITTING → success → SAVED_SESSION + optional backup + INTENT
FINISH_COMMITTING → failure → original draft retained + recovery
```

**Acceptance:** Pending detection includes collapsed exercises. Keep logging preserves input; a later design may focus the first pending movement as a deliberate intervention rather than leaving the user searching. Partial performed training remains history; unperformed plan is not invented actual data. History insertion and draft removal are one atomic transaction. No duplicate finished session after retry.

## F09 — Understand evidence before accepting a summary

**Trace:** P05 → J09 → C04/C06/C10.

```text
PROGRESS → [none] EMPTY_BASELINE + useful return action
PROGRESS → [history] GROUP_EVIDENCE_SUMMARIES
GROUP_EVIDENCE_SUMMARIES → inspect group → MOVEMENT_EVIDENCE
MOVEMENT_EVIDENCE → current/prior date + exactsetup + ordered actuals + reason
MOVEMENT_EVIDENCE → optional next-load explanation → editable future intention only
MOVEMENT_EVIDENCE → Close → same GROUP_EVIDENCE_SUMMARIES
HISTORY_CORRECTION (F04) → recompute derived summaries, actual history authoritative
```

**Classification:** Latest two exact-setup finished occurrences only; incomplete, extra-set, ambiguous repeats, changed prescription, unknown context or assistance/bodyweight ambiguity get review rather than a qualified increase. Nondecreasing ordered load+reps with one strict increase qualifies numerically; harder known effort removes comparable-effort improvement count; unknown effort is explicit. Mixed/lower eligible comparisons remain denominator. Summaries count exercise/setup comparisons, not hypertrophy or isolated-muscle coverage.

**Intervention refinement from cross-functional audit:** A caveat necessary to interpret a headline cannot live only behind evidence disclosure. Group-summary anatomy must surface relevant Effort not compared or Some sets felt harder qualification alongside the numerator/denominator where applicable. This is a design requirement for the workbench contract, not a claim that the currently shipped screen already meets it. Evidence remains expandable for full dates/sets. No unsupported Growing badge or collapsed false-confidence claim.

## F10 — Create and restore an external recovery route

**Trace:** P03 → J10 → C01/C07/C08/C11.

```text
BACKUP → request persistent storage → GRANTED/REFUSED/UNSUPPORTED → BACKUP usable
BACKUP → Export → BUILD_VALIDATED_FILE → initiate browser download → FILE_CREATED
FILE_CREATED → human retains outside browser (external, not app-verifiable)
BACKUP → Import → native picker → [cancel] unchanged BACKUP
native picker → VALIDATE_FILE → [invalid] REJECT_WITHOUT_MUTATION
VALIDATE_FILE → [valid] PREVIEW_COUNTS_AND_POLICY
PREVIEW → Cancel → BACKUP unchanged
PREVIEW → Confirm merge → IMPORT_COMMITTING
IMPORT_COMMITTING → success → merged notebook + receipt
IMPORT_COMMITTING → conflict/failure → original notebook unchanged + useful reason
```

**Rules:** Schema/hash/size/value validation before mutation; identical records dedupe; conflicting same IDs or incompatible active drafts reject atomically. Existing nonempty notebook settings win. No import is replacement/reset by implication. Browser save dialog cancellation may not be detectable; timestamp means export initiated/file created, not verified external backup. Moving to a new origin/browser requires exported transfer; app has no remote sync.

## Flow-to-component handoff and composition order

| Contract | Minimum anatomy and states | Required flow coverage |
|---|---|---|
| C01 local-state indicator | pending/saving/committed/failed distinct; offline separate; concise normal, prominent actionable failure | F01,F03,F06,F08,F10 |
| C02 muscle selector | named target, selected state, keyboard/focus, factual visualization | F02 |
| C03 bounded count | label/value/min/max/disabled reason | F02 |
| C04 movement summary | stable name, setup, planned/actual distinction, local action | F02,F05,F09 |
| C05 set ledger row | ordinal, labeled weight/unit, reps, explicit commit or recorded/edit state, no hidden color meaning | F03,F04,F06 |
| C06 contextual disclosure/action | clear trigger/expanded state/close, non-nested buttons, focus return | F02,F04,F05,F07,F09 |
| C07 conditional confirmation | concrete affected data, safe cancel, explicit discard/commit semantics | F04,F05,F08,F10 |
| C08 validation/recovery | adjacent reason, retained proposal, retry/explicit saved-copy reload/export | all mutating flows |
| C09 effort choice group | everyday question, optional marker, five choices/removal, explicit save semantics | F07 |
| C10 evidence summary/details | count and caveat visible, dates/setup/actuals behind details, no false growth inference | F09 |
| C11 backup preview | file identity/validation/counts/merge policy/confirm/cancel/conflict | F10 |
| C12 destination control | current destination, accessible labels, safe-area/keyboard adaptation, draft continuity | F01,F06 + crosscutting |

System sequencing: define typography/spacing/color/focus/motion tokens → atoms for type/input/button/status → molecules C01–C12 → state examples including failure → composed low-fidelity journey fragments → critique/test → polished screens only after PM/UX readiness review of the model. A component without a traced human problem is not automatically justified because the reference app contains it. A component inventory alone is not a user journey.

## Review checklist before any implementation resumes

1. Can PM and UX walk F01→F02→F03→F05→F03→F07→F06→F08→F09→F10 without an unspecified state transition?
2. Do cancel/back preserve intent and actuals at every local disclosure?
3. Can the workbench independently demonstrate pending, committed, failed and stale-conflict states without accessing production storage?
4. Can each molecule point to the P/J/F IDs that justify its anatomy and priority?
5. Are displayed emotions explicitly hypotheses, progress explicitly performance evidence, storage explicitly limited and tests explicitly synthetic unless truly observed?
6. Is the next deliverable a reviewable design model/system rather than another premature production screen revision?

## Structured transition tables for the whiteboard

These tables supplement the narrative guards above; they do not replace data-validation or transaction requirements.

### F01 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Launch | Open app | Reading local data | No false empty state |
| Reading | Valid active draft | Resume F06 | Existing context wins |
| Reading | Valid no draft | Intent F02 | No onboarding gate |
| Reading | Read/validation fails | Read failure | Retry reading; no database clear |

### F02 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Empty intent | Select muscle groups | Valid intent or coverage limit | Deselect freely |
| Valid intent | Build | Compact lineup review | Coverage failure explains limit |
| Review | Customize/swap movement | Local plan editor/alternatives | Cancel returns unchanged review |
| Review | Change selection | Prior selected intention | No changes retains review; changed selection needs rebuild |
| Review | Start | Starting transaction | Write failure retains preview |
| Starting | Commit success | Active F03 | One durable draft |

### F03 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Next blank row | Type weight/reps | Partial/valid/invalid pending | Values persist separately from actuals |
| Invalid pending | Correct field | Valid pending | Adjacent reason |
| Valid pending | Explicit record check | Committing set | Disable duplicate action |
| Committing | Success | Recorded stable row + next pending | No automatic exercise jump |
| Committing | Failure | Retained pending + Not saved | Retry/export/explicit reload |
| Recorded with clean pending | Repeat exact values | Committing one new actual | Disabled if dirty pending |
| Planned target reached | Add set | Extra pending row | No auto actual |
| Active exercise | Choose other header | Other active exercise | Retain pending/actuals |

### F04 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Recorded row | Edit | Correction draft | Same set identity |
| Correction | Cancel | Original recorded row | No mutation |
| Correction | Save valid values | Correction transaction | Invalid values retain draft |
| Transaction | Success/failure | Corrected row / retained edit | No early close on failure |
| Correction | Delete | Removed with Undo after commit | Explicit destructive action |
| Removed | Undo | Original identity/order/effort | Failed restore remains actionable |

### F05 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Exercise | Swap | Same-target alternatives | Cancel unchanged |
| Alternatives | No catalog candidate | Empty alternatives | Close retains original |
| Chosen candidate | No actual/pending | Replacement transaction | Failure no false saved state |
| Chosen candidate | No actual but typed pending | Pending-discard confirmation | Return to pending row |
| Confirmation | Explicit discard and swap | Replacement transaction | No silent typed loss |
| Chosen candidate | Actuals exist | Retained original + replacement segment | Old attribution and pending preserved |
| Transaction | Success | Replacement active | New context, no copied actuals |

### F06 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Active/pending | Background or leave | Suspended | Completed transactions durable within browser limits |
| Suspended | Return live document | Existing context | No forced reload |
| Suspended | Reload/reopen | Local read F01 | Restore persisted draft |
| Restored | Compatible revision | Continue capture F03 | Current exercise preserved |
| Restored/action | Competing newer revision | Blocked conflict | Export proposal or explicit reload saved copy; no overwrite |

### F07 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Saved set | Optional effort action | Plain-language picker | Does not auto-open |
| Picker | Close | Same saved set | No mutation |
| Picker | Choose remaining reps | Effort transaction | Explicit tap-to-save wording |
| Effort transaction | Success | Saved effort phrase | Return focus |
| Effort transaction | Failure | Proposed choice + Not saved | Retry retained proposal |
| Rated picker | Remove effort | Unrated after commit | Unknown, not zero remaining |

### F08 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Active session | Finish | Inspect all pending/actuals | Current data unchanged |
| Inspection | No actuals | Keep/discard draft choice | Keep is safe continuation |
| Inspection | Actuals + any pending | Pending decision | Keep logging retains all fields |
| Inspection | Actuals without pending | Factual summary | Cancel active unchanged |
| Pending decision | Explicit save without unlogged fields | Finish transaction | Never log omitted values |
| Summary | Save | Finish transaction | Duplicate action blocked |
| Finish transaction | Success/failure | History+receipt / draft+recovery | Atomic history/draft change |

### F09 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Progress | No history | Baseline guidance | Return Today |
| Progress | History exists | Qualified group summaries | Caveat visible with headline |
| Group summary | Inspect evidence | Dates/setup/ordered actuals/reason | Close returns summary |
| Evidence | Missing/mixed/ineligible context | Review explanation | No fabricated increase |
| Evidence | Optional next-load hint | Editable future target | Never actual creation |
| Actual correction | Save history change | Recomputed summaries | Saved records remain authority |

### F10 transition table

| Entry/state | Action or condition | Next state | Back/cancel/recovery |
|---|---|---|---|
| Backup | Request persistence | Granted/refused/unsupported | Tracking remains available |
| Backup | Export | Validated file/download initiated | External retention not verified |
| Backup | Import/select file | File validation | Picker cancel unchanged |
| Validation | Invalid checksum/schema/conflict | Rejected without mutation | Explain, choose another file |
| Validation | Valid file | Merge preview | Cancel unchanged |
| Preview | Confirm merge | Import transaction | No implicit replacement/reset |
| Import transaction | Success/failure | Restored / original retained | Atomic dedupe/conflict behavior |
