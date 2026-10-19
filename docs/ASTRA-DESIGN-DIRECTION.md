# Astra visual direction — Training Note

## Decision

Build a dark, typographic training notebook. The home screen feels like a deliberately composed session cover; the workout screen feels like a precise, calm place to enter two numbers. Warm white type, a sulfur-yellow action, fine rules, and measured dots establish the identity. The visual change must be evident before any interaction.

This direction is based on the actual 390 px production screenshots in `docs/design/production-redesign/home.png` and `logged.png`, the authoritative personal PRD, the story acceptance contracts, and the current Home/SessionCard code. It is a design judgment, not evidence of human usability or real-device behavior. Local database behavior, transaction receipts, revisions, imports, and backups are unchanged requirements.

## What the current mobile screens reveal

Home currently stacks four rounded containers with essentially equal visual weight. Its session heading is only slightly larger than the attendance number; a large pale dashboard continues below the main action. The red CTA, red attendance dots and red comparison marks all compete. Tiny anatomical figures consume space without helping choose the next action. The progress disclaimer occupies almost as much vertical space as an actual result.

The logged workout screen has a timer card, exercise card, nested history pill, receipt table, pair of fields, primary action, two outlined actions, effort panel, setup disclosure, next exercise card, Add exercise and Workout options. There are roughly ten distinct controls around one recorded set. The first input sits approximately halfway down the screen and the exercise card has no strong numeric focal point. Secondary actions look as important as logging. The full-width Last time pill and quiet outlined inputs give reference values more weight than actual entry. Rounded boxes within rounded boxes create visual noise.

The answer is a new composition and prioritization, not merely replacing the background color.

## Visual system

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#111413` | Entire app, including browser theme color |
| Raised surface | `#1B201D` | Active exercise, contextual panels, dialogs |
| Quiet surface | `#232A25` | Inputs, selected rows, neutral chips |
| Main ink | `#F2F1E9` | Titles, actual numbers, primary content |
| Secondary ink | `#ADB6AA` | Targets, dates, setup, reference labels |
| Fine rule | `#394239` | Separators and input outlines |
| Action | `#D9F279` | One dominant action and selected planning state |
| Action ink | `#172014` | Text/icons on action fill |
| Saved | `#91D5B0` | Truthful saved indicator, recorded visit dots |
| Destructive/error | `#FF9D89` | Error message or destructive menu action only |

Keep the neutral palette slightly green; avoid neon, pure black/white contrast, glowing controls, gradients, shadows resembling a device, ornamental grids, and fake bolts or switches. Dots represent recorded information or form a restrained abstract identity mark. No gym photography or bodybuilder imagery.

Use a clean local/system grotesk for words: `Inter, ui-sans-serif, system-ui, sans-serif`. Do not introduce a remote font dependency. Use `ui-monospace, SFMono-Regular, Menlo, monospace` with tabular figures for set counts, attendance counts, weight/reps and time; not for explanatory prose.

Home main title: 44–48 px at 390 px, 38–40 px at 320 px, 1.04 line height, -0.045 em tracking, medium weight. Active exercise: 30–34 px, 1.08 line height, -0.035 em. Main number fields: 40–48 px, medium weight. Body: 15–16 px. Compact contextual labels: 12–13 px, normal sentence case. Small tracking or uppercase is reserved for a single short section eyebrow; avoid a dashboard full of labels.

Use 20 px screen gutters at 390 px and 16 px at 320 px. Layout on an 8 px spacing rhythm. Primary button height 56 px; other hit targets at least 44 px. Surface radius 18–22 px, input/button radius 10–12 px, quiet list rows have no enclosing radius. Remove shadows except a restrained backdrop separation for an open overlay. A section should be separated by space or a fine rule before adding another box.

## Home composition

1. **Header:** Training Note at the upper left. A compact saved dot/check and concise truthful status beside the settings/overflow target on the right. Header height approximately 48 px. The status must wrap or simplify without clipping the app name; never falsely label unsaved work saved.
2. **Session cover:** An open composition on the dark canvas, or a single subtly raised panel. A short contextual eyebrow such as “Your next session” / “In progress” may precede the large title. “Back + Biceps” wraps intentionally with Back on the first line and + Biceps on the second when needed. Do not make the title fit by shrinking it to body scale. A small dot matrix or existing muscle glyph can occupy a dedicated side region only if it never steals title width; abstract dots are preferable to another tiny figure.
3. **Session contents:** A restrained numbered list: `01 Deadlift`, `02 Lat pulldown`, `03 Seated row`, followed by a clear “+3 exercises” summary for the familiar six-exercise plan. Use narrow monospaced indices, freely wrapping names, and compact right-aligned `3 sets` or `1 / 3`. Do not truncate the individual exercise names. The summary is intentional disclosure of additional items, not clipped text.
4. **Primary action:** One full-width sulfur action: Continue workout, Repeat this workout, or Plan a workout. Keep its exact existing transaction behavior. A quiet 44 px Train something else text action may sit directly below for a returning user with no active session. Avoid multiple arrows and play icons around a single label; one right arrow suffices.
5. **Attendance:** A compact full-width strip separated with a rule. Large monospaced visit count at left; “visits · last 4 weeks” alongside or underneath. Exactly 28 small dots, with completed visits in saved green and today an explicit ring; no streak framing. At narrow width, use a deliberate 14 × 2 arrangement, never accidental wrapping. Label the date span underneath. Keep the attendance section approximately 120–150 px tall, not a dashboard tile.
6. **Progress:** A simple ledger. One small heading and one Details affordance. Each muscle group row shows its name and truthful comparison phrase; dot summary or one directional icon at the right. Remove miniature anatomical glyphs from these rows. Put the long methodological explanation inside Details; the visible copy must still say lifts, never imply muscle growth.
7. **Last workout:** One date + session-title ledger row, with its recorded-set total. A compact separator is enough. Do not put it in a fourth independent card. Long session names wrap and push the trailing arrow to the row's top edge.

First use replaces progress/attendance emptiness with the large planning invitation and one restrained sentence explaining that next time the prior sets will be available. No motivational pseudo-statistics. Existing records with no comparable setup get neutral explanatory copy, not a failure state.

## Workout composition

The hierarchy is session → active exercise → actual entry → recorded sets → remaining exercises. The user should identify the exercise and the two entry fields in under a glance.

**Top region.** Keep Home as a simple back affordance and a compact save status. Immediately below, use a slim session bar with elapsed time / saved count and a quiet but unmistakable Finish action. Finish remains accessible throughout the session. Do not use the same bright yellow fill for Finish and Log set. The clock toggle is a session preference; put it in session overflow where feasible, or keep its existing single compact icon if the component cannot be safely changed in this pass. Hiding time never pauses the session.

**Active exercise.** One raised surface, or one open surface with a fine top rule. Its title is the largest text in the workout. A 44 px ellipsis is top-right in a reserved column; the title has `min-width: 0`, natural wrapping and no ellipsis. Under the name: one concise equipment + target line, for example `Barbell · Target 3 × 8–12`. Never label planned targets as actuals.

**Last time.** A quiet inline reference with its own label, visually secondary to actual entry. Keep every prior set available and maintain order. Example: `Last time 60 × 10 · 60 × 10 · 60 × 8 kg`. At 320 px allow two or more lines rather than tiny type or horizontal scrolling. The reference should not be the highest-contrast block. A no-history reference is a brief neutral line.

**Entry.** The weight and reps fields form the dominant pair. Labels remain above the fields, including kg/lb/bodyweight convention. Each field is at least 78 px tall, with large monospaced entry values, a visible focused outline, and sufficient empty-state distinction. Use blank actual fields; zero must never substitute for blank. At 320 px the pair still fits with 12 px gap. The single bright action underneath reads `Log set 2`, and becomes `Saving…` only during the write. Disabled input-required actions look quiet but readable.

**Receipts.** Today is explicitly distinguished from Last time and Target. Compact set rows use aligned set number, actual load and reps, and a quiet edit affordance. Each edit target remains at least 44 px and receives a useful accessible label. Do not replace editable rows with decorative progress dots. Keep a few receipts compact enough that entry remains visible; a long set list can grow naturally without trapping scrolling inside the card. Successful transactions produce one recorded receipt and truthful status. Never prepopulate a receipt from the target.

**Repeat and navigation.** Exact-value Repeat remains discoverable as one quiet text/outline action directly below the logging area; it must name the actual values, for example `Repeat 60 kg × 10`. Next exercise remains visible as the navigation action, with a right arrow. At 320 px stack these if their full labels cannot fit. Do not squeeze or truncate them. Repeating records one additional performed set only upon its explicit tap.

**Remaining exercises.** Compact ruled rows, not another stack of big cards. Each shows the full exercise name and saved/target count; the active row is visually unmistakable. A row can be tapped to switch. Keep the user's deliberate six-exercise order: deadlift, pulldown, row, curls, preacher, hammer. Support additional exercises without making unfinished work appear failed.

**Bottom action.** Add exercise is a single quiet full-width 44–48 px affordance after the list. Workout options becomes an ellipsis/menu trigger rather than another expanding section competing with actual entry. Respect safe-area padding.

## Overflow and interaction contract

| Location | Visible by default | Overflow / disclosure |
| --- | --- | --- |
| Home | Plan/repeat/resume, attendance, comparison rows, last workout | Settings, backup/import, storage protection, install guidance |
| Session | Home, saved state, optional time, Finish | Clock preference, whole-workout discard and contextual session options |
| Active exercise | Full title, Target/context, Last time, actual entry, Log, exact Repeat, Next | Swap exercise, setup/equipment, target settings, optional effort details, remove exercise |
| Inactive exercise | Full name, saved/target count, activate affordance | Swap/remove as relevant |
| Actual set | Number, load, reps, Edit | Delete only in edit state; Undo immediately after removal |
| History | Dated session and actual set evidence | Correction/removal actions, explanatory comparison details |

Menus must be anchored to the invoked item, at least 220 px wide when possible, viewport-contained with 12–16 px edge clearance, and open away from the right edge. Use text + simple icon rows at least 44 px high; do not make users decode an unlabeled icon grid. Destructive items have a separating rule and restrained error color. Only one item menu is open. Opening another closes the previous one; Escape/outside click dismisses; focus returns to the trigger. Do not attach unrelated backup controls to an exercise menu.

The menu reveals an inline editor or selection panel for the selected action. It should not create another primary screen. Editing hides the new-set form until Save changes/Cancel; swap keeps performed records intact; destructive confirmation names exactly what would be removed and any retained history. One extra overflow tap is appropriate for occasional actions, but Log, Repeat, navigation and Finish stay directly reachable.

## State matrix and acceptance checks

| State | Expected presentation | Required preservation / recovery |
| --- | --- | --- |
| First use | Large planning invitation; one action; short helpful sentence | No fabricated attendance, progress or history |
| Returning, no active session | Familiar session cover + repeat action; secondary change-plan action | Repeating opens editable plan, does not create actual sets |
| Active draft, zero sets | In-progress cover and Continue workout | Reload restores draft and selected exercise |
| Active draft, some sets | Saved count and Continue workout; recorded/target preview | Actuals and uncommitted inputs survive navigation/reload |
| Planner, no selection | Clearly selectable muscle chips; short nearby explanation | Cannot generate invalid selection |
| Planner, suggested / manual | Clearly distinguish the two planning modes; selected state uses text/check + color | Back + Biceps manual variants retain deliberate order |
| Review, six exercises | Full names, compact targets, contextual ellipsis | Start action remains obvious; no horizontal clipping |
| Fresh exercise | Large blank entry pair; Target and Last time separated | No silent copying of prior or prescribed actuals |
| Typing / numeric keyboard | Inputs and action remain reachable in normal document flow | No fixed footer obscures fields or validation |
| Saving | Action indicates pending state and resists duplicate tap | No success before committed write |
| Recorded | One new receipt; exact Repeat available; clear next input | Correct occurrence, set order and IDs preserved |
| Edit set | Inline correction form with Save changes and Cancel | New-set form does not compete; identity retained |
| Delete / remove | Precise confirmation where required and visible Undo | No loss of unrelated actuals; stable restore semantics |
| Swap before first set | Inline replacement choices | Replaces intended occurrence only |
| Swap after actuals | Explain retained performed work; replacement has its own title/context | No transferring history or relabeling recorded sets |
| All intended sets logged | Calm completion count, Next / Finish available | Additional intentional sets remain possible; no false auto-finish |
| Finish with typed input | Clear choice to log or finish without that set | No silent commit/loss |
| Finish empty / partial | Explicit keep/discard or partial save choices | Incomplete actual work can still be retained |
| Storage read/write failure | High-contrast inline error near affected action + Retry | Do not show false empty state or saved status; retain inputs |
| Unknown or incomparable setup | Neutral contextual explanation | No unqualified strength or improvement claim |
| Backup/import/contextual panel | Same dark tokens, full labels, readable preview | Existing validation/merge/confirmation remains intact |
| Offline / update | Compact truthful status in context | No forced refresh mid-entry; no false offline-ready claim |
| 320 px / long text / zoom | Wrap titles, equipment names, values and actions; vertical growth | No `text-overflow: ellipsis`, line clamp, clipped labels or document x-scroll |
| Reduced motion / keyboard | Visible focus, predictable order, reduced transitions | Menus and dialogs close and restore focus reliably |

## Implementation priority and review standard

First change the global neutral palette, typography scale and main surface hierarchy. Then recompose Home's hero/ledger and simplify Workout controls. Apply the same tokens to every contextual panel, confirmation, error, picker and empty state; a dark Home with pale legacy dialogs is unfinished.

The completion screenshots must show 390 px and 320 px Home plus active Back + Biceps logging with realistic six-exercise data. Capture first use, long exercise names, open overflow, editing, unavailable equipment, finish and settings/backup. Review at least one 390 × 844 viewport rather than relying exclusively on full-page captures. Check that the title, entry fields and Log action are visually dominant and that long labels wrap. Evidence must distinguish browser checks from real-phone or human research.

The strongest acceptance question is visual: without reading the copy, does this clearly look like a new product, and is it obvious where the user's next tap belongs? Merely recoloring the existing stack of cards does not satisfy this direction.
