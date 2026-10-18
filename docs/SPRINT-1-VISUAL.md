# Sprint 1 visual handoff

18 October 2026. Graphic/visual design agent; proposed specifications, not shipped components or human research. Read alongside the Sprint 1 UX handoff. Reviewed the actual retained `two-screen-home.png` and `two-screen-workout.png`, TrainingHome source/styles, shared component source/styles and current typography contract. The browser audit supplies observed defects; visual choices below remain hypotheses until tried by the user.

## What the current screenshots tell us

The light Home and dark workout are useful scene distinctions; retain both. The Workout already has a legible ruled worksheet, visible Swap, exact previous numbers and a single editable row. Preserve that spatial grammar instead of introducing another card system. The Home currently gives a large latest-session launch block most of its attention, yet cannot choose Upper after Lower. Change that block's capability before decorating it. Its progress row says unchanged weights/reps while the following paragraph combines missing and harder effort; that is a factual contradiction, not something a color change solves. A thin unlabelled performance bar communicates less than a plain count. Remove it unless its meaning can be explained adjacent to the mark.

No redesigned screenshot is claimed here. `design/sprint-1-board.html` is a portable static proposal using synthetic examples. It deliberately shows separate states together for review; the actual app would reveal each contextual state on demand.

## One visual grammar, two scenes

Home remains warm paper `#F6F5F0`, text `#19201F`, secondary `#505B58`, rule `#D9DED8`, action blue `#254CF4`. Workout remains `#121417`, sheet `#1B1E23`, raised `#272C33`, text `#F6F7F9`, secondary `#B8BEC7`, rule `#3C444E`, mint accent `#B8EDC3`. Retain existing focus and danger tokens. Routine launch may retain the pale olive material `#E5E9DD`; do not turn every row into a colored tile. Blue is an action/selected-state accent on Home, not a promise that every blue datum is an improvement. Mint denotes an explicit saved record or optional hint emphasis in Workout, not muscle growth.

Typography is exactly the existing three-role contract: heading 28/34, subheading 18/24, reading/action 14/20, system sans. Editable controls alone have a 16px minimum. Accent means weight 600 and/or semantic color, never a fourth ramp, monospace, uppercase tracking or eyebrow. Dates, evidence counts, qualifiers, button labels and chart captions use reading. No standalone section title above a section title. Large factual totals may use heading; avoid inventing a separate oversized metric role.

Use 4/8/12/16/24/32px spacing. Mobile outer margin 22px at390,16px at320. Section gap24–32; title-to-content12–16; row interior12–16. Buttons minimum48px; icon-only hit areas44px; field touchheight48–52. Light launch card radius20 and internalpadding20; dark worksheet radius18 andpadding16 match current scene. Context panels radius12; do not add pill-shaped chips for every metadata item. Use existing Lucide outline family,18–20px icons, consistent stroke, text labels for Choose, Swap, Edit, Close. No decorative dumbbells, trophies or flame icons.

## Home and workout selection

Order: header and saved-state receipt → Training heading → existing attendance → one launch card → Progress → compact recent history. Do not add a third main destination. Attendance remains recorded visit days, not a streak or inferred attendance.

The launch card shows a human routine name (`Upper A`, subheading), one body line describing intended work (`4 exercises · 12 planned sets`), and a separate body line `Last used 14 Oct · Main gym` when known. Last used is about actual use, never template edited-at. First-time state says `Plan a workout` and `Choose what you want to train.` One primary `Review workout` opens preview and setup, never commits performed sets. Beneath it place `Choose workout` and `Build workout` as direct named alternatives; remove the ambiguous `Train something else` phrase and duplicated build action further down. If active work exists, replace this content with movement/title and actual count plus `Continue workout`; chooser must not accidentally replace an active draft.

Chooser opens within Home as an accessible dialog/sheet with clear Close and title `Choose workout`. It is not a third main tab. Use two ruled lists, `Saved routines` and `Recent workouts`, not small filter pills or horizontally clipped cards. Saved routine row: name18, intended exercises/sets14, known setup14, optional selected check. Recent row: date14 + performed title18 + actual setcount14. Dates must include year when ambiguous across years. An explicit `Preview` action per row opens the common plan/setup preview directly; it never starts. The row itself may be the same action if its accessible name includes Preview. There is no intermediate selection commit or second review screen. Selected row uses blue outline/check and `Selected` text; color alone is insufficient. Long names wrap, secondary facts wrap beneath instead of truncating the information needed to distinguish routines. At320 rows stack their action under facts. Do not show an inferred next scheduled workout; user chooses.

Routine preview shows the stable intended movement list and prescribed counts, then setup confirmation and primary Start. Editing today's plan is visibly `For this workout`; it never silently updates the named routine. If current domain design supports routine updates, expose a distinct `Update saved routine` transaction. A partial finish or swap may change performed history but must leave the intended routine stable. Save-as-routine control in plan preview uses an inline name field plus `Save routine`/Cancel; no extra editor dashboard. Do not show this editor automatically after a tiring session.

## Setup confirmation before start

Place `Today's setup` at subheading after movement preview, before Start. Show Gym as a labelled input or existing choice; previous gym can be prefilled but must be visible. Direct line `Using Main gym` must not be hidden in an accordion. If unknown is allowed, expose `Gym not specified` explicitly and explain `You can log sets. Progress comparisons need a known matching setup.` This is neutral, not a red validation error. Do not block ordinary recording merely to manufacture comparison evidence.

Show inherited equipment labels alongside movements; only edits needed today expand fields. After a setup change say `Last-time numbers may use a different setup.` Do not transfer equivalent-load claims across machines. The record can still be viewed with its original setup labelled. Start button names the action, changes to `Starting…` during transaction, and enters Workout only after successful commit. On failure leave the preview and selected inputs intact with inline Retry. Cancel returns to chooser/Home with no actual records created.

## Truthful performance signals

Facts and qualification are separate lines. Primary fact14 semibold; contextual qualifier14 regular, not tiny text. Every group shows coverage, e.g. `1 of 2 lifts improved` and `2 of 3 lifts comparable`. Details must reveal exactly which movement was excluded and why. An increase with harder effort is not a globally green success. At most one small relevant icon; visible words carry meaning.

| Condition | Visible treatment and synthetic copy |
| --- | --- |
| Improved, comparable effort | Upward arrow plus `More recorded reps`; `Effort similar · 2 of 2 lifts comparable`. The underlying rule must actually support similar effort. |
| More work, harder effort | Neutral text `More recorded reps`; separate `You reported less left in reserve`. No green improvement banner implying equal difficulty. |
| Missing effort | `Recorded reps increased`; `Effort not recorded for one or both sessions`. No claim that it was harder. |
| Unchanged work/effort | `Same recorded weights and reps`; `Recorded effort unchanged`. Never the global missing-or-harder warning. |
| Reduced or mixed recorded work | `Mixed recorded results`; factual dated details. Do not label a deload failure or infer its intention. |
| Incomparable setup/prescription | `No comparable result`; `Gym changed` or `Rep target changed` as actual domain reason. Do not show a zero score. |
| Partial group evidence | `1 of 2 comparable lifts improved`; `1 other lift needs review`. Never describe the entire group as unchanged based on a subset. |
| No previous record | `First recorded workout`; next useful step `Repeat in the same setup to compare.` No empty trend line. |

If marks are retained, use one mark per lift only with an adjacent textual count and labelled status legend. Do not use filled muscle silhouettes or progress bars as biological-growth metrics. Prefer the text facts this sprint; defer longitudinal charts to Sprint2.

## Workout contextual load hint

Keep previous ordered actuals in the existing raised block. Any suggestion is below those facts and above the next editable row. Heading18 only when a separate decision block warrants it; otherwise body14. Copy follows the actual effort state: `You reached your rep target, but reported no reps left. Keep the previous load as a reference; an increase is not suggested.` Unknown effort copy names the uncertainty. Use neutral sheet material and explicit explanatory words; amber only for caution requiring attention, never every missing value. A hint never fills or logs a set, changes the planned routine or pretends to be individualized coaching. No effort gate is claimed until engineer/domain implementation and tests exist.

## Component states and ownership

| Component | Required visible states |
| --- | --- |
| Routine row | default, keyboardfocus, selected textual check, longname, nodata, unavailable source; row selection never says saved |
| Save routine editor | unnamed, named, invalid blankname, saving disabled duplicateaction, saved after commit, error retained name, retry, cancel |
| Setup confirmation | knownprefill, changed, unknownexplicit, savepending, blockedtransaction; preserve entered values |
| Progress fact | comparable,partial,missingeffort,hardereffort,unchanged,incomparable,nohistory; no fabricated fallback reason |
| Contextual hint | hints off, eligible, effortlimited, unknown effort, no matching reference; no universal increase CTA |
| Launch | firstuse, selectedroutine, recent-source, resumable active, transactionpending/error |

Reuse DSButton, DSInput/DSFormField, DSDisclosure, DSInlineNotice and existing comparison evidence. New RoutineRow/SetupConfirmation/ComparisonSummary are controlled composition contracts, not permission for them to compute progression or open IndexedDB. Container owns real transactions. Saved receipt must not imply offline availability or external backup. Destructive routine management is secondary and has explicit consequence text; deleting a routine must never delete performed history.

## Review checklist before claiming completion

Render320/390, long routine names, empty catalogue, 20+ routines in chooser, visible keyboard/focus, high text zoom and dialog return focus. Confirm minimum targets, no horizontal overflow, exact three noninput type sizes, and full readable failure message. Check actual light/dark token contrast at rendered boundaries rather than assuming inheritance. Verify history/routine distinction after partial finish and swap, same record IDs after reload, setup-specific comparisons and savepending/error states. Capture actual composed production screens after implementation; this document and static board are not that evidence. No claims about one-handed comfort, delight or human validation until the user tries the app.

## Static-board rendered review correction

Root rendered the board at1440,390 and320px with no reported page overflow, JavaScript errors or network requests. That actual review caught a missing font glyph in the Home arrow and an incorrectly mint-filled commit control on an unrecorded draft. The board now uses an inline SVG for the progress arrow and a neutral outlined `Log` action on the editable row. Mint must not imply that a pending draft has already been recorded; any saved styling waits for an actual successful transaction. Root will recapture these corrections. This review concerns the static proposal only, not production integration.

UX cross-review confirms that the underlying same-or-easier effort category must say `Same or greater reps left`, not assert identical effort when it was easier. Recent-session preview accessible names should say `Preview logged work from [date]`; they must not imply recovery of an original routine. Active Resume precedes attendance. Inactive attendance can remain above the launch card only when the launch action remains visible in the first phone viewport.
