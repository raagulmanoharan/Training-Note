# Reference-led redesign sprint

## Outcome

The owner supplied two workout UI stills and a 15.24-second recording and explicitly requested a deep joint PM/UX redesign. Active app: standalone /workspace/gym-notebook. Publication remains separately blocked by GitHub repository-creation permissions; no live site is implied.

## Actual kickoff and design handoff

- PM inspected current app and identified persistent chooser controls above the generated lineup, verbose repeated settings and disconnected editor/receipt layout.
- UX inspected the supplied stills and extracted recording frames 02/08/13. The recording demonstrates compact rows, per-set check, contextual set menu and an RPE sheet. These are source observations, not user interviews.
- PM and UX agreed Choose → Review lineup → Active session states within Today. One active exercise card combines saved rows, current editable weight/reps/check and muted future placeholders. Other exercises remain directly reachable on the same page.
- Full PM journeys in REDESIGN-PM.md and the DOM/visual handoff in REDESIGN-UX.md were recorded before implementation pickup.
- Engineering then picked up PersonalApp; UX picked up personal.css; root owns original MuscleGlyph SVG, integration and sprint evidence. QA owns adaptation of existing safety tests and reference-driven synthetic checks.

## Board

| Story | Deliverable | Owner | State |
|---|---|---|---|
| RD01 | Deep reference analysis and complete user journeys | PM + UX | Done: inspected handoff docs |
| RD02 | Clear chooser and compact review lineup | Engineer + UX | Done: implementation and browser evidence |
| RD03 | Compact same-page exercise/set logging | Engineer + UX | Done: implementation and browser evidence |
| RD04 | Correct/repeat/swap/finish without losing work | Engineer | Done: transaction and recovery regression checks |
| RD05 | Durability, keyboard/layout, offline and visual acceptance | QA + root | Done: 16 personal checks + Pages offline check |

## Non-negotiable acceptance

No schema reset or migration needed for visual redesign. Saved actuals remain tied to their movement/setup and units. A checked row means its transaction completed; pending values or suggested references are never completed sets. Quota failure, stale-tab conflicts, backup restore, retry identity and offline production operation remain required. Blank actuals remain blank until user supplies or explicitly copies values. Future rows do not fabricate actuals. Keep 44px touch actions, readable 320px layout and clear numeric input labels. Real-phone keyboard/comfort still requires owner testing; synthetic walkthroughs do not establish delight or intuition.

## Actual final review and acceptance

- Root build passed with offline shell `gym-notebook-75ca64cfc94f6283`. No database schema was changed or cleared.
- QA executed 16 personal checks (one separate production-root check deliberately skipped) plus one passing production Pages-subpath/offline check. See REDESIGN-QA.md for exact commands and scope.
- PM and UX inspected actual 390px captures. Root also inspected 320px rendering. No core journey blockers were found. Images are retained in docs/images/redesign-choose.png, redesign-lineup.png, redesign-session.png and redesign-320.png; these contain synthetic records only.
- Review caught and fixed duplicate correction actions, premature close after failed deletion, silent draft loss on a zero-actual swap, invalid-input ambiguity and Repeat overwriting pending input. Existing IDB transactions, safe backup merge, revision conflict protection and retry identity survived.
- Nonblocking follow-up: test discoverability of the saved-check edit action with the owner on a phone. Screen-reader labels and titles exist, but a touch user's interpretation is not established. Physical keyboard/viewport behavior, thumb comfort and delight remain real-device checks, not completed research.
- Production preview refreshed at localhost:5176. GitHub publication remains blocked by the previously recorded repository-creation 403; no public Pages release is claimed.
