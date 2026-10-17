# Journey-led delivery record

The user requested a process reset: PM and UX whiteboard the complete service, agree IA and detailed flows, design reusable atoms/molecules with deliberate states and composition rules, then use those parts to implement screens. The current app was not used as the design spec.

## Gates and actual handoffs

1. PM and UX audited the current source, user requirements and previous reference-based screens. Emotional claims are explicitly hypotheses; no interviews or observed gym feelings are invented.
2. PM recorded P01–P06 human problems, J01–J10 full service blueprints, PH01–PH10 phase summary, information model, F01–F10 task-state/cancel/recovery flows and component traceability. UX agreed IA and flow IDs.
3. UX recorded the Training Ledger design direction, materials, exact semantic tokens, contrast calculations, typography, geometry, interaction states and component anatomy. Both contracts existed before isolated library implementation started.
4. The isolated library and browsable workbench are built first. Their fixtures use local React state, not workout persistence. Internal PM/UX review precedes production composition; no extra user permission requirement is inferred.
5. Production composition and regression verification follow the reviewed components. Transaction logic, record identity and local storage remain the controller's responsibility, outside presentational components.

## Artifacts

- DESIGN-JOURNEYS.md: user goals, emotion hypotheses, touchpoints, frontstage/backstage/environment, interventions, recovery, acceptance and traceability.
- DESIGN-FLOWS.md: IA, information meaning and ten full state flows with explicit cancel/back/failure loops.
- DESIGN-CRITIQUE.md: why the current assembly is insufficient and what interventions should be tested.
- DESIGN-SYSTEM.md: deliberate foundations, atoms, molecules, behaviors and composition rules.
- DESIGN-QA.md: component-state, isolated-workbench and application verification evidence.
- The design workbench at `?design=1` makes the blueprint, IA, flows, library and screen composition inspectable in one place.

This document records phases rather than pretending multiple agents constitute observed user research. Physical phone keyboard, interruption behavior and comprehension require owner tryout after the technical work.

## Isolated library review and production pickup

The first actual rendered specimens failed PM/UX review: the light whiteboard canvas leaked into the dark component gallery, and some worksheet headings inherited dark text. Production composition stayed paused despite passing click tests. The library gained its own explicit dark material boundary and foreground rules; badges were corrected to fit content and busy actions preserve geometry. Root, PM and UX re-inspected regenerated specimens. Six isolated checks then passed, including computed heading contrast, keyboard/state behavior and zero workout database access.

PM recorded internal readiness in DESIGN-JOURNEYS.md and UX in DESIGN-SYSTEM.md section12. Only then did the application engineer pick up production composition and UX pick up personal.css. Shared components remain stateless; real transaction handlers and the existing database remain in the application controller. This handoff is expert/design readiness, not observed user validation.

## Production composition and final technical verification

The working app now consumes the same typed atoms and molecules shown in the library: actions, numeric inputs, focus choices, bounded stepper, transaction status, notices, headers, worksheet surfaces, set rows, effort choices, disclosures and comparison evidence. The app controller still owns the original IndexedDB transactions, stable identities, revision protection and backup merge; no schema or stored records were changed by the visual refactor.

Actual composition review caught context-specific issues beyond the isolated examples: oversized implicit loading-label reservations, long illustrated choice names, a duplicated legacy save marker, a native checkbox accidentally using text-field geometry, metadata saving incorrectly resembling actual-set saving, and a nested evidence disclosure failing to expand to reading width. These were fixed in their responsible component or composition boundary; the findings and rerender reviews are preserved in DESIGN-SYSTEM.md and DESIGN-QA.md.

The stable complete personal/effort/design suite passed 29 checks with one intentional production-root offline skip. A separate production Pages-path/offline check passed. All original domain, persistence, backup, conflict, quota and retry-identity assertions remain; changes to existing tests only adapted intentional semantic labels/copy. The final 320/390 app captures and regenerated specimens were inspected by QA, UX and root. Physical keyboard, hand comfort and comprehension still need owner tryout.

The Screens section uses actual synthetic-record viewport captures under docs/images/design-plan.png, design-capture.png and design-evidence.png. The whiteboard capture is design-whiteboard.png; component review is design-components.png. These images are implementation evidence, not observed user research. The workbench contains the complete reasoning and memory-only interactive specimens.
