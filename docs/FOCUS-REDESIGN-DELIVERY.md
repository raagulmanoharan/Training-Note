# Focus edition — visual and interaction redesign

This release responds to the request for a visible redesign and a simpler hierarchy. It keeps the personal logger on the existing Training-Note origin, with Home and Workout as the two primary screens. Planning, review and active logging are Workout states; history, settings and occasional actions use sheets.

## Actual collaboration and decisions

- An explicitly selected `gpt-6-astra` design director inspected actual screenshots and wrote `ASTRA-DESIGN-DIRECTION.md`, then reviewed the implemented screens again. The director identified cropped receipts in the first implementation; the final UI uses explicit disclosure.
- The hierarchy engineer recorded actor journeys in `FOCUS-FLOWS.md` before implementing the menu/editor/finish flow.
- Root rebuilt the production composition and shared tokens, integrated the changes and inspected actual mobile screenshots.
- An independent fresh-context synthetic gym persona and a regression agent exercised the real app in isolated Chromium contexts. `FOCUS-QA.md` records the results. This is not a human usability study.

## What changed

Home is a dark session cover with a large workout title, a numbered preview, one primary action, a recorded-visit dot strip and a simple progress/history ledger. Progress describes comparable recorded lifts; the methodology remains inside Details. Empty Home has no invented activity.

Workout keeps the clock, Finish, current exercise, weight/reps, Log and Next visible. Finish has a different fill from the yellow-green logging action. The clock can be hidden without pausing or changing the workout. Exercise More opens Swap, Edit exercise, optional effort and Remove. Session More groups Add and Discard; Add also remains at the end of the exercise list. Historical sessions use More for Repeat/Delete.

Two complete recent receipts are shown by default. Show all N sets reveals older rows and their direct correction actions; there is no hidden nested scroll cutting a row in half. Targets explicitly say Target, previous performance says Last time, and receipts remain actual recorded sets.

Setup edits use an explicit validated Save/Cancel form. A correction draft blocks changing exercise until Save/Cancel rather than silently disappearing. Finish opens a native dialog, states what is kept and warns about unlogged input or an unsaved correction. Removal retains confirmation and Undo. Failed writes retain recovery through the existing queued transaction/retry mechanism.

Long titles wrap. Manual exercise names and equipment have separate lines. Numeric fields wrap into a single column when enlarged text needs more space. Active-exercise changes bring the new title above the sticky session controls. Focused action checks use actual hit-testing, not merely DOM visibility.

## Reusable visual language

Canvas #111413, surface #1B201D, fields #232A25, warm text #F2F1E9, secondary #ADB6AA, rules #394239, primary #D9F279, saved #91D5B0. Self-hosted Manrope is used for words and IBM Plex Mono for numerical information. Display titles, section headings, body copy and compact metadata have consistent roles. Inputs retain a mobile-safe minimum font; controls retain at least 44px targets. Reduced motion is respected. PWA browser/launch colors match the app.

The shared button, field, choice, receipt, notice and disclosure components remain the primitives. SessionCard and ExerciseSettings are reusable compositions. Production CSS was rewritten as one coherent composition instead of appending another palette override.

## Verification and boundaries

Final run evidence is recorded in FOCUS-QA.md and DEPLOYMENT.md. `scripts/review-production-redesign.mjs` captures the actual UI, checks local font loading and no external requests, verifies 320/390px bounds and sixth-set Log/Next reachability, and verifies actuals after reload.

No data schema, store engine, catalog identity, revision guard, backup format or comparison algorithm changed. Existing records stay on the same browser origin. Local-only browser storage still needs exported backups; this release cannot guarantee retention if the user or browser clears site data. Real iPhone keyboard, installation and comfort testing remain user-device checks. Undo restores the most recent in-memory removal, not a persistent trash archive.
