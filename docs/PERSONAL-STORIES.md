# Personal MVP — PM journey handoffs

These journeys are ready product contracts for the personal-only pivot. Preparation and implementation may overlap after this document exists. Executed acceptance evidence is required before Done. Labels below are semantic contracts; an implementer may choose an equivalent clearer label but must update this document to the implemented wording before acceptance.

## PERS01 — Prepare today's session

**Actor/need:** One gym user already knows the broad muscle groups and wants a quick sensible exercise list. **Prerequisite:** App loads locally; no login or network required after offline assets are installed. **Entry:** Today on first use, or planning on Today after a completed session.

1. Select one or more labeled muscle chips. Selection state is announced and visible without color alone.
2. Set Number of exercises using labeled increment/decrement or numeric control; display permitted minimum/maximum. No muscle selected disables Generate workout with a nearby explanation. If selected group count exceeds requested exercise count, explain Increase exercise count or deselect a group; never silently omit a selected group.
3. Tap Generate workout. Curated selection prefers distinct primary subtargets across selected groups. Each card displays exercise name, primary target, equipment, sets and rep range. Secondary overlap is disclosed in concise text.
4. Edit exercise count, sets, range or an exercise inline. Swap exercise opens choices in place. Choosing a candidate updates the preview without losing other edits. Cancel preserves the original.
5. If no unique target remains, show a coverage limit and cap the count and allow fewer exercises; never silently label overlap complete coverage.
6. Tap Start workout. Persist a draft with stable IDs before displaying its ready state. If an existing unfinished draft exists, offer Resume workout or explicitly Discard and start new; preserve it until confirmation.

**States:** Empty selection gives a brief example, not a dashboard. Generation is local and does not imply remote AI. No candidates shows Change muscles or reduce count. Started draft appears on Today. **Validation:** Positive integer sets; lower/upper reps positive integers with lower ≤ upper; exercise count constrained to catalog. **Failure/recovery:** Failed local write keeps the planner and choices with Retry; no success announcement. **Privacy:** No upload of selections. **Mobile/keyboard:** Inline choices, ≥44 px buttons, logical tab order and visible focus. **Acceptance:** Generate Chest + Back with feasible count; inspect distinct primary targets and disclosed overlaps; change one exercise while retaining others; reload/resume identical draft; invalid range cannot start; never fabricate isolation.

## PERS02 — Record sets and replace unavailable equipment

**Actor/need:** User with one hand free logs what just happened. **Prerequisite:** Active draft from PERS01, or explicit blank session if supported. **Entry:** Today; automatically restore unfinished draft.

1. See current exercise name, position, optional target, and Last time reference if comparable. Actual fields are blank. Weight shows explicit kg/lb or bodyweight convention; Reps is separately labeled.
2. Enter actual weight and reps and tap Log set. Validate locally, persist transaction, then show a numbered receipt. During write show Saving and prevent a second commit of the same action.
3. Tap Repeat [exact weight] × [exact reps] to record one new actual set. Prior values are visible in the button. It never records without this tap.
4. Tap Edit on a receipt. Inputs appear inline prefilled with that actual; Save changes commits the same set ID. Cancel retains existing values. Delete set immediately offers Undo; restoration preserves identity/order.
5. Move to another exercise using visible exercise switcher/Next exercise. Switching retains uncommitted input and all receipts. It never logs inputs merely because navigation occurs.
6. Tap Swap exercise when equipment is unavailable. Inline candidates prioritize compatible primary target and available equipment, with overlap shown. Cancel keeps the original. Before any actual, replace planned movement. After an actual, keep the original with its receipts and add replacement as a separately named occurrence with only the remaining planned sets (for example one logged of three leaves two planned on the replacement). If the original target was already met or exceeded, an explicitly chosen replacement starts with one extra planned set; this is additional work, not a claim that a prior target remains unfinished. Replacement Last time comes only from the replacement movement/context.
7. Tap Finish workout. If there is unlogged typed input, offer Log this set or Finish without this set; no silent loss. If no actual sets, offer Keep draft or Discard draft explicitly. Otherwise choose complete/partial if supported and confirm Save workout. Save stores history and removes active draft atomically only after success.

**States:** Fresh, typing, saving, recorded, editing, swapping, draft recovered, finished and write failed are visibly distinct. **Validation:** Finite nonnegative load where meaningful; positive integer reps; blank ≠ zero; prevent NaN/Infinity and accidental duplicate action. **Failure/recovery:** Storage failure keeps entered values and receipts; Retry preserves IDs. Refresh restores inputs and current exercise. Finish retry never duplicates history. **Privacy:** Device-local only; existing trainer data is not imported implicitly. **Mobile/keyboard:** Large numeric pair, thumb-zone Log set, no horizontal scrolling at 320 px, maintain useful focus after record/edit/cancel, no automatic drilldown. **Acceptance:** Log two sets/repeat/edit/delete/undo; navigate and reload; swap after a set preserves attribution; finish partial; failed commit retains work; no planned or prior set silently becomes actual.

## PERS03 — Protect, export and recover local records

**Actor/need:** User expects progress to survive weeks and wants a recovery path. **Prerequisite:** Same browser profile and app origin. **Entry:** Home settings/backup panel, first successful save or browser-persistence status notice.

1. See Local storage status, Last backup timestamp and the plain limitation that site-data clearing/device loss can erase records. Do not show a permanent modal or alarm every session.
2. Tap Protect local storage to request persistent storage if supported. Show Granted, Not granted or Unsupported truthfully; refusal does not block tracking.
3. Tap Export backup to download complete versioned JSON. Include workouts, draft, settings, units and stable identities. Record export time only after export has been initiated successfully; never call it a verified external/cloud backup.
4. Tap Import backup, select a local file, validate size/shape/schema/IDs/value bounds/referential data before mutation. Show a summary of incoming workouts and whether a draft exists.
5. Show an Import and merge confirmation. Identical record IDs deduplicate; conflicting IDs reject the entire import. Existing history is preserved. Cancel leaves all data untouched. Commit validated data atomically. Existing local settings are retained whenever local workouts or a draft exist; incoming settings are adopted only for an empty local notebook. Conflicting drafts reject the whole import; identical drafts deduplicate. These policies appear in the preview. Success returns a fresh view of imported records. An interrupted/failed transaction leaves original data intact.

**States:** No backups yet, exporting, validated preview, merging, restored, unsupported storage and failed import. **Validation/recovery:** Reject malformed JSON, unsupported future versions, invalid dates/numbers, duplicate conflicting IDs and oversized files; show useful error without dumping private data. Keep existing data and offer another file. Database upgrades preserve earlier supported schemas or stop with a recovery/export path; never clear automatically. **Privacy:** File selection/download are local; no telemetry or upload required. **Mobile/keyboard:** Native file picker and inline confirmation, accessible labels and focus. **Acceptance:** Export nontrivial history/draft/settings; restore into clean synthetic database and compare semantic equality; malformed/future-version import leaves existing data unchanged; persistence refusal remains usable; reload keeps data.

## PERS04 — Understand progress without misleading coaching

**Actor/need:** Returning user chooses an appropriate next session load using their own records. **Prerequisite:** At least one actual saved session; equipment/load convention known for qualified comparisons. **Entry:** Last time in Workout or Home’s training-history panel.

1. Read dated ordered prior sets for the same movement/context. Explicitly separate Last time, Target and Today. No record says No previous sets for this setup.
2. Open training history and inspect visible dated sessions and all actual sets; no nested history drilldown is needed. Partial sessions and substitutions remain labeled; correction uses the same validation and stable identities as PERS02.
3. Compare all ordered comparable working sets, showing descriptive rep/load changes. If equipment, movement or units differ, explain why no direct comparison is shown. Do not infer nonadherence from missing sessions.
4. Opt into a double-progression hint and set available load increment and rep range. Only a fully logged intended working-set count, same load, all at the upper rep bound may yield Consider [current + configured increment] next time. Otherwise retain current load/range as neutral context; a lower-performance day is not failure.
5. Accepting a hint changes an editable future target only. Declining does nothing. Neither action creates actual sets or rewrites history. The user remains free to choose a different load.

**States:** No history, comparable, incomparable, partial, suggestion eligible/ineligible, opt-out and correction pending/failed. **Validation:** Finite positive increment, valid rep range, no mixed-context progression; bodyweight exercises receive no fabricated weighted increment; timed logging is outside this MVP. **Failure/recovery:** Failed history read offers Retry instead of false empty state; failed correction preserves original record and edit fields. **Privacy:** Device-local comparison. **Mobile/keyboard:** Compact all-set rows with expandable explanation, no chart required to understand actuals. **Acceptance:** 40 kg × 10/10/8 versus 10/10/10 shows +2 recorded reps; mixed equipment suppresses qualified claim; 3 × 12 at 40 kg with 8–12 target and 2.5 kg increment can suggest 42.5 kg; 12/12/10 cannot; partial session cannot; suggestions never log actuals.

## PERS05 — Install, reopen and work offline

**Actor/need:** User pins the app on the home screen and trusts it during poor gym connectivity. **Prerequisite:** First visit over supported secure origin or localhost; offline assets cached successfully. **Entry:** App in mobile browser.

1. Load personal app with useful initial content and no trainer login. See Add to home screen instructions only when useful; use native install prompt where supported, platform instructions otherwise.
2. Reopen the same origin/bookmark or installed app. Load durable data before rendering empty states. Display loading while reading storage; failure shows Retry with recovery guidance.
3. After offline readiness, disable network and reopen. Core planning, draft logging, history and export work locally. Status states Offline ready only after service worker/cache actually ready.
4. Background and return; draft and uncommitted inputs remain. App update does not discard records; prompt to refresh at a safe point if necessary. Never force-refresh mid-entry.

**States:** Initial uncached visit, installing cache, offline ready, offline unavailable, reading local data, opened installed and update available. **Validation/errors:** Unsupported install/persistence APIs do not crash; storage permission/quota error shows local write failure, not success. **Privacy:** Static asset requests only as needed; no workout payload goes to a server. **Mobile/keyboard:** Safe-area padding, numeric keyboard and one-hand controls; no fabricated universal iOS install button. **Acceptance:** Manifest and service-worker scope valid; browser offline reload after cache succeeds; unfinished draft intact; no auth/backend network dependency; 320/390 px layouts and keyboard path tested. Real iOS/Android keyboard, browser eviction and installation require actual-device observation and remain unproven until measured.

## Current delivery boundaries

The implemented MVP supports load/reps, two primary Home/Workout screens with contextual history and backup panels, curated unique-target suggestions with count caps, deliberate manual exercise selection including same-target variations, and same-target substitutions. Biceps and Triceps are separate new-plan choices; legacy Arms records remain valid. The persistent session card shows elapsed session time and Finish; the clock may be hidden without pausing. It does not claim duration-based exercise logging, session notes, or anatomical isolation. These are outside the user's essential requested loop, not shipped features. Any remaining unexecuted acceptance condition stays a gap until verified.
