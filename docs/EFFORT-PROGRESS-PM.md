# Optional effort and evidence-based muscle-group progress

Status: PM handoff ready before implementation. The user now explicitly authorizes adding plain-language effort tracking and muscle-progress information informed by progressive overload. This extends, rather than weakens, the reference-led notebook redesign. No new account, remote storage, compulsory questionnaire or speculative muscle-growth claim.

## Product decision

Record performance first. Optionally attach how many more good-form reps the user thinks they could have performed. Keep this human phrasing primary; an RPE explanation is secondary and approximate. Progress cards describe comparable recorded exercise performance for a muscle group. They cannot establish that the muscle grew, recovered or was fully trained.

Effort data is optional `repsInReserve` on a recorded set, restricted to integers 0–4. Four means four or more, not exactly four. Absence means unknown. Older sets and valid older backups remain usable without resetting the database or requiring effort completion. The optional field follows the set through correction, undo, export and import. Unknown fields must not be silently discarded during a roundtrip.

## EFF01 — Attach, change or remove effort without interrupting logging

**Actor:** User has just logged a real set and remembers its difficulty. **Entry:** Existing active-workout saved row or saved-set inline edit. Weight/reps logging remains unchanged and sufficient.

1. Log actual weight/reps with the usual explicit check. Wait for durable transaction success; effort never becomes a prerequisite for this action or causes a modal to open automatically.
2. Choose a discreet contextual effort action on the saved set. Show an inline question: How did that set feel? Explain briefly: How many more reps could you have done with good form? Estimation is optional.
3. Offer five understandable choices: 4+ more, 3 more, 2 more, 1 more, No more. Accessible names include the full good-form-reps meaning and relevant set. Selection is visible beyond color and reversible.
4. Selecting a choice explicitly saves that optional field on the same set identity. Show saving/disable duplicate action; only acknowledge success after commit. Weight, reps, timestamp, order and other sets do not change.
5. Close/cancel without selecting leaves the prior optional value intact. Existing effort can be changed by choosing another value or cleared with Remove effort. Removal means unknown; it is not equivalent to easy effort or zero remaining reps.
6. Read recorded effort as a brief secondary phrase, such as 2 reps left, 4+ reps left or No reps left. An expandable What is RPE? explanation may say RPE is a rough effort scale: approximately 10 minus reps left, with 4+ mapping to about RPE 6 or less. Do not show a fabricated exact RPE 6 for an open-ended bucket. User-estimated effort is not a measurement of actual remaining capacity.
7. If persistence fails, keep the proposed edit and existing committed set visible, label Not saved and retain Retry/recovery. No quiet rollback of input or false Saved state. A stale tab cannot overwrite newer data.

**During correction:** Editing weight/reps retains existing effort unless explicitly changed/removed. Delete/undo restores the whole original set including optional effort. Swapping a movement preserves recorded effort with its original exercise identity. History display may expose effort inline; collecting it retrospectively is optional, never forced.

**Acceptance:** A user can log a workout without discovering or answering effort; add 2-more to one saved set and reload; change to 4+; remove and reload; export/import preserves the value; an older file without effort still imports; invalid negative, fractional or >4 effort rejects atomically; failed effort save never changes other actuals or claims success.

## EFF02 — Read factual progress by muscle group

**Actor:** Returning user wants to know whether their recorded lifting performance is moving forward. **Entry:** Progress destination after completed sessions exist. This is secondary to gym logging.

1. Show compact cards for muscle groups with real relevant history. If space requires an inactive group card, say No comparable sessions yet. Do not imply zero growth or failure.
2. Use a qualified headline such as Performance improving only when the underlying eligible pair provides actual evidence. Show a factual count, for example 1 of 2 comparable exercises improved. The denominator is compared exercises, not every catalog movement or every anatomical muscle.
3. Each exercise comparison uses the latest two eligible finished occurrences for the same movement identity, gym/equipment identity, unit/load convention, intended set count and rep-range prescription. Both occurrences must have the full planned actual working-set count. No alternate movement, unknown context, mixed-unit pair, unlogged placeholder or partial occurrence contributes a qualified improvement claim. Comparison requires matching ordered set counts; do not cherry-pick a best set or silently skip the latest recorded partial result to claim recent improvement.
4. Count clear increases through conservative dominance of ordered actuals: at unchanged loads, every corresponding set has at least the prior reps and at least one set has more; at unchanged reps, every corresponding set has at least the prior load and at least one has more. More generally, only non-decreasing corresponding loads and reps with at least one strict improvement may count. A heavier load with fewer reps is a mixed result; tonnage alone, estimated one-rep max and differing prescribed sets do not establish improvement.
5. Tapping/expanding the card exposes actual evidence: movement, dates, prior ordered sets, latest ordered sets and the change explanation. Do not stop at a colored arrow without traceable records. Assign each movement to its curated primary muscle group; compound secondary overlap does not double count a single movement as proof of improvement in every secondary group.
6. When no qualified increases exist, show neutral language such as No clear increase in comparable records, with counts and any mixed/incomplete-context reason. Avoid Declining muscles, Losing progress or bad-session labels.
7. Effort adds context, not false certainty. If matching effort entries indicate the latest work felt harder (fewer estimated reps left), qualify any performance headline: Higher recorded performance; effort was harder. If effort is missing in either session, say Effort not compared or otherwise make unknown effort clear. Do not equate absent effort with matched exertion. Similar/lower subjective effort may be described cautiously, but never asserted as measured physiological improvement.

**Progressive-overload relation:** Increased load or reps can be useful evidence of increased demand; consistent technique, range of motion, fatigue and recovery cannot be inferred from these fields. Existing optional next-load suggestion remains conservative and separate. Group cards never automatically change prescribed loads or log an actual. No rule guarantees improvement every workout.

**Acceptance:** 40 kg ×10/10/8 →40 kg ×10/10/10 counts a comparable movement improvement; 40×10/10/10→42.5×10/10/10 can count. 40×12/12/12→42.5×8/8/8 is mixed, not a clear increase. Different machine/gym/unit, missing setup, changed prescription or incomplete occurrence suppresses qualified comparison. A more difficult estimated effort qualifies the language. Tap evidence and verify the shown sets match saved history exactly.

## EFF03 — Reliability, mobile and accessibility continuity

The same IndexedDB revision guard and explicit transaction acknowledgement apply to every effort edit. Do not introduce an upgrade that clears older records. Optional field validation must run on database reads, saves, backup inspection and import before mutation. Existing SHA-256 backup integrity covers the new field automatically. Stable IDs deduplicate identical imports; differing effort on the same stable record is a conflicting record under existing safe-merge policy, not permission to overwrite silently.

Inline effort chips wrap within 320 px, remain at least 44 px actionable targets and expose selected state. No added fifth numeric column, compulsory bottom sheet or auto-focus that opens a keyboard after saving. Removing/closing preserves the current workout and return focus. Group cards have text labels and reasons independent of color. Dates are localized and records remain device-local/offline.

Run build and meaningful browser/domain checks for optional effort write/edit/remove/reload, valid older backups, invalid-field atomic rejection, correction/undo retention, plus comparison fixtures covering clear increases, mixed changes, harder/unknown effort and incomplete/mismatched contexts. Synthetic fixtures verify logic; they do not validate actual muscle hypertrophy, RPE accuracy or human delight.

## Implemented PM acceptance review

Reviewed current PersonalApp.tsx, personalInsights.ts and personalStore.ts after implementation. This is source-based expert review; executed regression and browser evidence belongs to QA. No human RPE accuracy, perceived ease or muscle-growth result is claimed.

The implemented effort surface is a distinct, optional effort-only inline picker. It explicitly says Tap a choice to save. Its chip selection commits only effort metadata; the weight/reps correction editor remains a separate explicit-save action. This separation resolves the risk of mixed semantics inside one edit form. The plain good-form-reps question leads, RPE is expandable secondary explanation, and the open-ended 4+ bucket is about RPE 6 or less. The picker is not automatically opened after logging. Existing rated rows expose a change caption; the latest unrated set has a discreet optional question. Removal deletes the field rather than writing an invalid null/undefined own-property value.

The source keeps IDs, original weight/reps and logging timestamps while editing effort, handles completed history or current draft separately, waits for commit before closing, preserves the proposed choice on failure, disables duplicate operations and restores trigger focus where it still exists. Strict optional-field validation accepts absence and only integer 0–4 when present. Existing checksum/export/import structures naturally include the field without a schema reset.

Performance calculations use the latest two finished occurrences in each exact setup bucket; they do not skip a latest partial occurrence to find older flattering data. Ambiguous repeated blocks, missing setup, assisted/bodyweight contexts, changed prescription and incomplete/extra set counts receive review explanations. Complete eligible mixed/lower/harder-effort comparisons remain in the denominator, so one improvement plus one lower result reads one of two comparisons improved rather than one of one. Clear increases require corresponding nondecreasing actual loads/reps and at least one strict increase. The delivered policy is more conservative than merely qualifying harder effort: any known harder matched set excludes that result from the improved count and explains why. Missing effort can still support a recorded-load/reps improvement but is explicitly identified as effort not compared; no claim of equal exertion follows.

Group cards say Performance by muscle group and explicitly distinguish recorded lifts from muscle growth. Evidence exposes actual dates, gym/equipment and ordered values. Empty comparison counts show baseline instructions instead of a misleading zero-of-zero score. Movement/setup buckets are counted as exercise comparisons, not unique anatomical muscles or verified physiological change. A card can say performance improving when some comparisons improve; the immediately visible numerator/denominator limits that claim and the evidence may show other mixed/lower results.

No core product blocker found in this review. Exact physical execution, estimated effort accuracy, subjective simplicity and real-device keyboard/one-handed comfort remain outside source review. Final release still requires QA's actual build/browser/fixture results, and the app must retain the browser-storage/backup limitations already disclosed.
