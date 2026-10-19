# Modern app pass — 19 October 2026

## Actor and outcome

An intermediate lifter opens Training Note at the gym, already knowing today's muscle groups. They choose a suggestion or pick their usual six exercises, check the plan, and start. Between sets they enter two numbers and log. A machine is busy; they swap it. A movement was added or skipped; they change the live session without losing completed work. A typo is corrected in place. They finish a partial or complete session, check the receipt and return next week to their real history.

## UI contract before implementation

Two primary destinations remain: Home and Workout. History, settings and contextual actions are sheets. Home has a single dark launch card, a quiet attendance visualization and readable performance cards; a first visit does not show a dashboard of empty metrics. Planning uses a true segmented Suggest/Pick control, illustrated muscle choices, one clear primary action and a review list with one prescription line per exercise. The workout keeps a persistent elapsed-time/Finish bar, one current input pair, compact tappable actual rows and calm secondary exercise cards. Correction temporarily replaces new-set entry; Cancel restores its existing draft. Add, remove, swap, finish and history deletion have explicit exits and appropriate confirmations. Undo is offered for removal.

## Component language

- Chalk canvas, white working surfaces, graphite launch/session surfaces and vermilion primary actions. Green means a recorded/saved outcome, never a planned set.
- Self-hosted Manrope for headings/actions/body; IBM Plex Mono for actual numbers. Three text roles: 28/34 heading, 18/24 subheading, 14/20 body. Editable controls retain at least 16px; weight/reps use 32/40 as a numeric display role.
- Spacing uses 4/8/12/16/20/24. Surfaces have consistent 24px corners, controls 12–16px; touch targets at least 44px.
- A card is either a readable group or an obvious full-width tap target. No duplicate equipment labels, faux technical eyebrows or decorative metrics. Dotted muscle glyphs indicate target location only.
- Contextual sheets use a named header, visible Close, native modal focus containment and scrollable choices. Edit and destructive states have distinct tinted surfaces; Cancel is always visible.
- Motion is brief feedback, respects reduced motion, and never gates logging or saving.

## Acceptance

Audit first-use, historical Home, suggestion/manual planning, empty search, preview edits/removal, active add/remove/swap, set edit/delete/Undo, draft restoration, empty/partial finish, workout deletion/Undo, settings/backup and error states. Check 320/390px and larger layouts, focus visibility, readable contrast and absence of horizontal overflow. Keep IndexedDB schema and original identities intact. Run existing durability tests and new action-flow tests, build, then verify the deployed Pages subpath and offline reopen. Automated and synthetic checks are not physical-device usability studies.

## Delivered and checked

The UX agent used the app in Chromium at 320/390px; the engineer implemented the missing action flows; an independent QA agent exercised eight complete synthetic journeys. Root integrated the shared components and visual system and reviewed actual rendered screenshots. This is not a claim of human gym research.

Final consolidated browser suite: **48 passed, 1 intentional production-only skip**, 2.0 minutes, using `npm test -- --output=/tmp/modern-stable-results --reporter=list`. The separate Pages production check covers the skipped offline context. TypeScript/Vite/PWA build passed; local data schema, storage engine and exercise suggestion classification were not changed.

Actual React screenshots: `design/production-redesign/home.png`, `workout.png`, `logged.png`, `workout-compact.png`, and `sixth-set-320.png`/`sixth-set-390.png`. These use synthetic history in an isolated context. The sixth-set Log and Next controls remain within the initial 320×740 and 390×844 viewport; fonts load locally; reload retains actual set identities; no console errors or external font/API requests occurred.

Late audit fixes include review/start scroll reset, edit focus/return focus, compact catalog chips, readable menu controls, singular set copy, and access to a historical workout after deleting its final recorded set. The current-session footer gives Add exercise its own full-width row. Undo retains the latest removal only while the app stays open; confirmations explain that boundary. Physical iPhone keyboard/VoiceOver and sweaty-hand use still require device testing.
