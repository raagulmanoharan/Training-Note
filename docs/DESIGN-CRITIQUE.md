> Upstream design record, written before screen composition. Subsequent readiness decisions and delivery status are recorded in [DESIGN-DELIVERY.md](DESIGN-DELIVERY.md); the initial pause/blockers below are retained as process evidence.

# Design reset: critique of the current app

Status: discovery and design contract, not approval to replace the live app. Current app screen changes are paused. The user's request is to work from service blueprint and user journeys through information architecture, flows, components and screen composition. A new paint layer on the existing cards would not answer that request.

Review basis: current PersonalApp.tsx, personal.css, MuscleGlyph.tsx, docs/images/redesign-choose.png, redesign-lineup.png, redesign-session.png, redesign-320.png, effort-picker.png, muscle-performance.png and muscle-evidence.png; earlier supplied still references and extracted recording. The references are inspiration, not evidence that any pattern fits this person's use. No real-user interview, moderated usability session or physical-device hand-reach study has been conducted. Feelings below are hypotheses to validate, not observed findings.

## What should survive

The essential service is small and useful: prepare a deliberate session, record real work, and understand a comparable record later. Local-only data, actuals requiring explicit completion, separation of suggestions from history, preservation of original exercise identity during swaps, revision protection, recoverable failure and external backup are product strengths. These belong in the new experience even when the present layout changes.

The compact row experiment also established an important structural direction: weight and reps work better as adjacent aligned fields than as giant fields above a separate receipt list. Actuals and pending intent can share a ledger, provided their status is unambiguous. Optional effort must remain optional. Muscle progress must remain traceable to underlying recorded lifts, not a claim of growth.

## Why the present design still feels generic

The previous iteration started by reproducing visible reference motifs: dark background, rounded cards, body glyphs, green rows and white actions. It did not first show the user a service blueprint, journey tradeoffs, information model and component contract. The resulting screens therefore look assembled from useful controls rather than composed around a considered ritual. This critique acknowledges that process gap; the next artifact must make the reasoning and system inspectable before further app implementation.

There is too little differentiation between levels of information. A muscle selection, exercise preview, active worksheet, history session, backup notice and expanded effort panel all inherit similar outlined containers and rounded corners. When nearly everything is a card, the boundary no longer explains what belongs together. The current stylesheet contains both old and new hooks, with incremental overrides for rows, exercises, controls and evidence. Those overrides preserve working behavior, but they do not constitute a design system: there is no shared semantic rule that tells a new component which material, spacing and action treatment to use.

Typography is mostly one system sans with small variations. Workout titles are large but not part of a deliberate editorial hierarchy; metadata, helper text, evidence and warnings depend heavily on tiny gray text. Indexes and dates could give the notebook a recognizable character, but currently appear as incidental labels. Numeric alignment is the strongest authored element; it should become the visual organizing principle rather than one component among many boxes.

The top-level information architecture is reasonable, but the composition spends too much space on app chrome and explanatory copy. The generic brand, saved badge, broad heading, subtitle, second section heading and disclaimer can appear before a single useful record. Progress in particular can introduce an empty half-width area when only one muscle card exists and then use a very long evidence block. Evidence needs reading width and deliberate hierarchy, not another nested card.

## Journey critique and intervention hypotheses

| Flow | Current observed interface | Hypothesized user friction | Intervention to test | What would falsify it |
| --- | --- | --- | --- | --- |
| F01 Boot / J01 first open | Branded header, saved status, setup prompt, no visible distinction between a fresh notebook and recovered local history | A skeptical first-time user may mistake a device-local notebook for an account-backed app | Quiet identity plus one explicit local-data sentence and an optional Protect link; resumed history is concrete, not a permanent safety badge | User still believes reinstalling or changing browser restores their data automatically |
| F02 Plan / J02 | Six same-shaped muscle cards, count stepper and Build; preview repeats bordered exercise cards and action pairs | Planning may feel like configuring software before lifting; count and anatomical targets may be misunderstood | A short focus selection plus a ruled session draft, one clear Start, concise coverage rationale on demand | User cannot tell exercises from sets, cannot see what will happen on Start, or needs more upfront context |
| F03 Capture / J03 | Active exercise boxed above future/actual rows; successful commit creates a large green band; repeat and setup consume vertical space | A hurried user may be distracted by secondary controls or interpret future rows as editable/logged | One concentrated worksheet, stable column positions, current row distinguished by input material and explicit commit, secondary controls in a quiet footer | User still taps a future check, mistakes suggested values for actuals, or needs to scroll repeatedly to find the current row |
| F04 Correct / J04 | Check on saved row opens editing; correction actions appear as another button cluster | A user may assume the check toggles completion off; errors and delete carry similar action weight | Saved row has an explicit labeled Edit affordance in context; correction mode is local with clear Save correction/Cancel and subordinate Remove | People still accidentally delete or cannot tell what is saved versus edited |
| F05 Swap / J05 | Separate swap icon, inline alternatives and split-history behavior | Busy-gym frustration may make a long selection explanation easy to skip; preserving attribution is not visually obvious | Target-preserving replacement list with equipment labels and a clear original/replacement segment marker only when actuals exist | User believes old machine weights apply to the replacement or loses their unlogged intent |
| F06 Resume / J06 | Persisted current session restores; stale-tab recovery is a long error with several buttons | An interrupted user may feel anxious about whether the visible record is trusted | Explicit recovered-session heading and transactional status; a recovery block groups Retry / Export / Reload by consequence | User retries blindly, overwrites a newer tab, or cannot preserve on-screen data before reload |
| F07 Effort / J07 | Separate optional picker with five actions and approximate RPE explanation | Optional estimates may feel like an imposed coaching protocol, and jargon can distract | Plain-language question in a secondary inline module, no forced prompt, clear unknown state and click-to-save semantics | User thinks effort is required or reads No more as encouragement to break form |
| F08 Finish / J08 | Finish opens inline confirmation with saved actual count and pending input warning | Ready-to-leave user may confuse Finish with discarding draft input or claim everything completed | A completion summary centered on kept actuals and explicit handling of pending entries; no congratulatory pressure or navigation surprise | Partial work disappears or a user confirms before understanding unlogged entries are excluded |
| F09 Evidence / J09 | Overview cards, expandable text, long history; unknown/harder effort can be buried | A curious user may accept an arrow/headline without understanding matched setup or subjective effort | Compact evidence-led summary with visible qualification and side-by-side/stacked prior/latest actuals; full-width reading on expansion | A user cannot identify why a lift counted as improved, or believes the app measured muscle growth |
| F10 Backup / J10 | Local retention warning, protection request, offline status, installation instructions, export/import and settings | Worried user may confuse installation, persistence and backup as equivalent safety mechanisms | Three distinct concepts: on-device record, offline app, external recovery file; obvious export, validated preview before import | User believes persistent-storage permission protects against device loss, or import silently replaces newer work |

The causal statements in the intervention column are hypotheses. The current browser tests establish behavior and layout under tested conditions; they do not establish those feelings, speed, delight or hand comfort.

## Component audit: what needs a contract

Seventeen recurring patterns were audited. This count is an inventory of interface patterns, not a claim of seventeen independently implemented reusable components.

| Pattern | Present inconsistency or cost | New system contract |
| --- | --- | --- |
| 1. Primary action | White action works but shape/width follows generic button baseline | Deliberate rectangular action, one primary per local task, defined disabled/loading/error behavior |
| 2. Secondary action | Outlined, text and filled gray actions overlap | Text verb for local optional actions; secondary outline only for a consequential alternate path |
| 3. Icon action | Circular swaps/checks look like interchangeable utilities | Rounded-square commit distinguished from plain icon utility; accessible action name mandatory |
| 4. Numeric field | Large standalone fields remain in history correction; row fields elsewhere | Shared numeric field with draft, invalid, blocked, saving and read-only roles |
| 5. Selection tile | Large body-glyph cards dominate early composition | Selection is a restrained focus tile; target illustration supports the name rather than becoming decoration |
| 6. Count stepper | Custom wrapper with three controls and direct number entry | One labeled bounded stepper with minimum/maximum reasons and no hidden coercion |
| 7. Save status | Same header green dot can imply blanket safety | Transaction status reflects loading/saving/committed/blocked, separate from backup status |
| 8. Disclosure | Every details is another bordered rounded box | Borderless ruled disclosure by default; inset only for a distinct subtask |
| 9. Exercise preview | Each plan row repeats surface/action styling | Ruled draft line with ordinal, movement, target/equipment and concise prescription |
| 10. Exercise worksheet | One active and many collapsed cards all boxed | A single active worksheet; other exercises become compact indexed lines |
| 11. Set row | Saved/future/draft rely on scattered classes | Discriminated row states and stable four-column geometry |
| 12. Correction editor | Repeated current/history field and action markup | Shared correction module preserving stable IDs and optional effort |
| 13. Swap chooser | Candidate buttons and explanatory text composed ad hoc | Replacement option + attribution warning + explicit resolution of pending input |
| 14. Effort picker | Optional panel recently added with its own styling | Separate optional transaction module; unknown/remove states explicit |
| 15. Evidence module | Card, details, tiny dates, long text can nest deeply | Full-width evidence ledger with reason, actuals, context and effort caveat |
| 16. Backup/recovery | Many unrelated status concepts on one utility page | Distinct local/offline/backup statuses and safe merge preview/recovery actions |
| 17. Navigation/section header | Generic three-tab shell plus repetitive intro hierarchy | Restrained task navigation and purposeful header that names the current job |

## Whiteboard decisions to settle before screens

Adopt the PM's ten flows and crosscutting trust constraints. Agree that Today has prepare/review/capture/resume states rather than more destinations. Agree that changing a current field is intent, while tapping commit records an actual. Agree that optional effort is a separate explicit action-to-save module. Agree that Progress qualifies performance from comparable actuals and never claims biological growth. Agree that Backup protects against a different class of failure than app installation or persistent storage.

Then inspect the isolated component library at 320px and 390px, with real state transitions represented by fixture state, before composing screens. Approve one visual direction and the behavioral contracts. Only after that should the production flow be reassembled. The existing app and its database remain untouched during this design review stage.
