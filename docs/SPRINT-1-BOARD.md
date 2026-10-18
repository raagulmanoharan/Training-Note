# Sprint 1: reliable feedback and reusable workouts

18 October 2026. This is the current sprint design board. Earlier REDESIGN-SPRINT.md is historical. This kickoff adds UX and graphic/visual design before engineering pickup; it does not claim that planned features have shipped.

## Goal and boundaries

An intermediate lifter can choose the intended previous routine, confirm the equipment context, log actual work and understand qualified feedback. Home and Workout remain the only primary screens. Preserve the shared 28/18/14 text roles, the functional 16px input minimum, explicit actual logging, local records, safe import/export, revision protection and offline operation. No decorative eyebrows, marketing headlines or additional dashboard navigation.

Sprint 1 covers trustworthy comparison/hint messaging and routine reuse. Custom exercises and longitudinal trend/filter features remain Sprint 2. The day0 catalogue gap is real; it is deferred, not solved by this sprint.

## Team and responsibilities

- PM/integration: root agent. Keep the scope small, resolve product semantics and verify the design handoff against the existing app.
- UX designer: `sprint1_ux`. Own the lifter's journeys, task flow, information order, state transitions, entry/cancel/recovery and focus contracts.
- Graphic/visual designer: `sprint1_visual`. Own component composition, visual hierarchy, icons/status encoding, spacing and concrete visual proposals using the established type roles.
- Engineering and QA: pickup after design handoff. No new engineering or testing agent is implied to be active by this board.

## Work board

| Story | User outcome | Design owner | Status | Required engineering/QA evidence |
|---|---|---|---|---|
| S1-01 | Understand which records are comparable, what changed and whether effort is known | UX + visual | Design reviewed; implementation not started | Known-equal-effort deload never says missing/harder; mixed coverage is explicit |
| S1-02 | Get optional load guidance consistent with recorded effort | UX | Design reviewed; implementation not started | Target ceiling plus zero reps left never produces unqualified increase advice; effort stays optional |
| S1-03 | Pick an earlier session or saved routine without rebuilding upper/lower | UX + visual | Design reviewed; implementation not started | Earlier-session choice, clear repeat meaning, cancel without changing current draft/history |
| S1-04 | Keep an intended named routine independent of performed work | UX + PM | Design reviewed; implementation not started | Early finish/swap never silently updates routine; explicit save/update failure and recovery; routine version/backup contract reviewed |
| S1-05 | Confirm gym/setup before recording in a different place | UX + visual | Design reviewed; implementation not started | Historical setup not silently reused as today's fact; unknown allowed with comparison limitation; draft safe on cancellation |
| S1-06 | Compose states from reusable, legible components | Visual + UX | Design reviewed; implementation not started | Mobile layouts, labelled focus order, non-color status distinction, three text roles, transaction-aware saving states |
| S1-07 | Re-run the intermediate-lifter journey after implementation | PM + QA, later | Not started | Actual day0/5/10/100 browser checks, backup compatibility and offline evidence; human comfort explicitly unverified |

## Design handoff before engineering pickup

For each picked-up story the UX document must provide the real-world trigger and existing tools/context before describing the app. It then specifies intent, entry, actions, decisions, cancellation, empty/draft/loading/saving/success/failure states, return path and acceptance. Visual composition follows those flows, with named components and all relevant state variants. Each decision must distinguish proposal, code observation, rendered mock review and tested working behavior.

Routine persistence requires an engineering data-contract review before implementation: stable routine ID and version, copied session snapshot versus template reference, explicit update transactions, old-backup import and merge behavior, conflict protection and deletion/archive semantics. A visual mock is not approval of an unreviewed migration or proof of persistence.

## Actual design sync

- Root assigned UX and visual agents and asked them to coordinate directly. Both received the real-world journey, intermediate-lifter browser audit, current source and typography constraints.
- UX's first source-based recommendation separates saved routine intention from repeat performed work; it retains exactly two primary screens, requires explicit setup at start, allows honest unspecified setup for logging, and keeps routine updates independent from finish/swap.
- Visual designer is preparing a standalone component/layout board as a review artifact. Its states are synthetic proposals, not screenshots of shipped features or user testing.

## Review artifacts

- `SPRINT-1-UX.md`: journeys and interaction/state contracts.
- `SPRINT-1-VISUAL.md`: graphic design and component handoff.
- `design/sprint-1-board.html`: proposed visual/component board, once delivered.

Status updates below will record actual delivered artifacts and outstanding implementation gates.

## Completed design handoff and actual review

UX delivered five detailed actor journeys plus shared state/focus/recovery contracts. Visual delivered component specifications and a portable six-state proposal board. Both cross-reviewed one another's flows. Root reviewed the actual rendered board and the written contracts.

The first render caught an unsupported arrow glyph and a mint-filled unrecorded Log action. Visual replaced the arrow with inline SVG and made the draft action neutral and explicitly labelled Log; a final browser check confirmed the Log set control was visible with transparent background and light text. The corrected static board rendered with zero JavaScript errors, zero external requests and no page overflow at320px or390px. Desktop/mobile captures are in `design/sprint-1-board.png` and `design/sprint-1-board-mobile.png`. These establish proposal rendering only, not interactive flow, transaction or production acceptance.

Aligned interaction: Choose workout → row Preview → common plan/setup → Start; no additional selection confirmation. Home's explicitly selected routine may go directly to Review → setup/Start. Active Resume precedes attendance; inactive compact attendance may precede launch only while leaving the main start action in the first normal-text viewport. Saved routine intention and performed session history remain visibly distinct.

Engineering pickup order: S1-01/S1-02 feedback facts and guidance, then routine/backup data-contract review, then S1-03/S1-04 chooser and explicit template save/update, then S1-05 setup and S1-06 production composition. Each story starts with its UX journey. Confirm prepared-plan durability and the conservative optional-effort policy during domain review; do not infer those from static visuals. S1-07 production regression and renewed day0/5/10/100 walkthrough remain not started.

No production files, stored workouts or database schema were changed during this design kickoff.

## Visual direction pivot: instrument study

User selected Teenage Engineering as the new visual reference. UX and graphic designers reconvened; root inspected the official EP–133 and OP–1 product panels in Chromium. `INSTRUMENT-REFERENCE-STUDY.md` records observations and journey translations. `design/instrument-direction.html` is the new interactive two-screen proposal, superseding the script/athlete art direction for future composition. Production integration remains S1-06; this does not mark production stories complete or change stored workouts.
