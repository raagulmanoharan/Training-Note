# Design-system and journey verification

Status: isolated component/workbench verification passed after PM/UX handoff. Production integration and its stable regression run passed.

## Layered acceptance

1. Review the PM/UX contracts before writing selectors. Retain the existing actual-logging, effort, comparison, backup, conflict and offline guarantees.
2. Test atoms and molecules in the isolated design workbench: visible keyboard focus, semantic names, numeric input labels/modes/errors, selected state, disclosure expansion, disabled/busy controls and no duplicate action while busy. Demonstrate pending, committed, draft and failed variants without implying that display fixtures are persisted actuals.
3. Verify the workbench does not read, write, create or reset the workout database. It must be a visibly labeled component demonstration, never a second workout notebook or a way to modify real progress.
4. Verify integrated journeys and actual screenshots at 320 px and 390 px: choose, lineup, active logging, correction, effort, progress/evidence and backup. Inspect visual hierarchy, long labels, wrapping, thumb-sized controls and page overflow. Screenshot assertions alone do not establish clarity.
5. After integration freeze, run the existing personal and effort suites plus the Pages project-path/offline check. Preserve original regression tests; coordinate obsolete copy/selectors with implementation instead of weakening safety assertions.

## Evidence and limits

PM journeys, flow/IA contracts and DESIGN-SYSTEM.md were reviewed before test implementation. `COACHLINE_URL=http://127.0.0.1:5180 npx playwright test design-system.spec.ts` passed **6 checks in 12.0 seconds** on the corrected isolated workbench.

The checks cover 10 journey columns, three IA destinations, 10 task flows; workbench navigation and all tested specimen interactions with zero IndexedDB open/delete calls; 320/390 page overflow; visible keyboard focus; native busy/disabled duplicate prevention; field labels, input mode and attached error messages; selection and native disclosure; explicit draft→saving→failure→retry→saved simulation; wrapped 44 px optional effort actions; visible comparison qualification; reduced-motion controls; primary-button contrast and every rendered gallery h2/h3 against its actual nearest opaque background.

The first actual screenshot review found a real boundary defect despite passing functional controls: pale DS headings and selection labels inherited a light whiteboard canvas, and worksheet headings inherited dark text. The component engineer added a scoped dark gallery material and explicit heading ink; root separated workbench focus styles from DS descendants. QA reran all six checks and visually inspected the refreshed 320 px ledger and 390 px fields. The text and row states are now readable. Functional checks alone did not establish visual readiness.

Current captures: `tests/artifacts/design-components-320.png`, `design-components-390.png`, `design-ledger-320.png`, `design-fields-390.png`. UX recorded corrected-library readiness in DESIGN-SYSTEM.md section 12 before production composition began. Production uses controlled DS adapters with the existing domain and transaction handlers.

## Integrated verification

On the final frozen source, `COACHLINE_URL=http://127.0.0.1:5180 npx playwright test personal.spec.ts effort.spec.ts design-system.spec.ts` passed **29 checks with one intentional skip in 40.2 seconds**. Eight checks are in the new design-system suite: six isolated component/whiteboard checks plus delayed effort-save semantics and native compact backup-checkbox persistence. The other 22 retain the previous personal/effort behavior, with only obsolete presentation selectors/copy changed: explicit Log set N for NAME, canonical context-scoped effort choices, Inspect comparison evidence and Saved on this device. Stored identities, actuals, failure/retry, backup, comparison and revision assertions were retained.

The extra delayed effort-write check confirms an optional metadata save does not label the next actual row Saving set. The native checkbox check confirms a compact checkbox below 28 px in both dimensions, checked state persisting after reload, and no 320 px horizontal overflow. Its label remains the human action target.

An intermediate full run overlapped a live source correction and the delayed-write test failed. The same unchanged race scenario passed immediately on stable source and again in the final full frozen-source run; its safety assertions were not relaxed. No full passing result is claimed for the interrupted intermediate run.

Actual screenshot review caught and fixed a second composition issue: new shared comparison markup no longer matched the earlier expanded-card selector, constraining evidence to half the mobile width. UX changed the minimum overview width, single-card span and descendant-open expansion selector. The refreshed 390 px evidence render is full width and readable. QA inspected actual planning, capture and evidence images rather than relying only on selectors.

Final captures: `tests/artifacts/design-app-choose-320.png`, `design-app-plan-390.png`, `design-app-capture-320.png`, `design-app-capture-390.png`, `muscle-performance-390.png`, `muscle-evidence-390.png`, and `design-whiteboard-desktop.png`. The initial desktop whiteboard capture caught its Suspense loading placeholder and is not evidence of the rendered board; root replaced the published `docs/images/design-whiteboard.png` with a capture taken after all 10 journey columns were ready. Full-page browser screenshots place the viewport-fixed navigation at its captured viewport position; this is not evidence of a real scrolling obstruction. Real-device keyboard and scroll behavior still require a manual tryout.

`npx playwright test pages.spec.ts` passed **1 check in 2.0 seconds** against production Pages subpath `/gym-notebook/`, build cache `18ca10cd47efcc9d`: manifest/assets/scope, durable actual recovery, offline reload and additional offline logging with no API calls. The root-preview-only check remains intentionally skipped in the development suite; this separate production check covers the project-path deployment. After adding the real screen-preview images, final artifact build `89125eaae2d25363` passed the same Pages/offline check again (**1 check, 1.9 seconds**). A separate production workbench smoke waited for all 10 journey columns, opened Screen composition and verified **three loaded preview images** with nonzero intrinsic widths and **zero IndexedDB opens**. App functionality was unchanged, so the full domain suite was not repeated for this image-only build.

 All usability reviews are synthetic or expert inspection unless a real participant session is explicitly recorded. Real-device keyboard behavior, physical thumb reach and perceived simplicity remain manual tryout items.
