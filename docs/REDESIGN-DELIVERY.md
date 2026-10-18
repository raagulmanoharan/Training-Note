# Production redesign: evidence and delivery

18 October2026. This iteration changes the actual React/IndexedDB application, not only a disposable HTML design study.

## Work performed

A new agent with no conversation history received only an intermediate gym-goer persona, app location and evaluation tasks. It used the rendered dot prototype at390×844 and320×740 without inspecting source or product docs. `FRESH-GYM-USABILITY.md` separates observed browser behavior from persona judgments. This is synthetic expert evaluation, not real-user research, a measured physical one-hand study or an experiment with human participants.

UX then mapped those findings to real production behavior in `REDESIGN-UX-HANDOFF.md`. The graphic designer reviewed the two actual screenshots and generated image, specifying typography, spacing and state semantics in `REDESIGN-ART-DIRECTION.md`. Root supplied both screenshots to the image-generation model; its result is `design/generated-layout-exploration.png`. It influenced alignment and compact logging hierarchy. Generated fake future values, inconsistent completion dots and repeated tiny controls were explicitly rejected. The generated image is not a screenshot of the resulting app.

Production engineer integrated active-exercise-first composition, one editable current set, visible correction, compact prior records, fewer headings, launch-first Home, review Start positioning, dotted target art and truthful finish feedback. Root integrated shared components, exact labels, self-hosted fonts and offline precaching. The existing IndexedDB schema, revision checks, transaction acknowledgement and backup/import logic were retained.

## Research supporting the interaction decisions

- NN/G, [Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/): target size and placement matter especially when moving. We use44px minimum targets and56px primary Log rather than measuring physical thumb comfort from automation.
- NN/G, [Mobile User Experience](https://www.nngroup.com/articles/mobile-ux/): typing and accidental touch costs motivate one editable set and visible correction.
- Hevy, [Previous Workout Values](https://www.hevyapp.com/features/track-exercises/): previous performance stays available during logging. Here it is a separate reference, with explicit draft fill or log actions, never unperformed actuals.
- Hevy, [Previous Values and Routine Context](https://help.hevyapp.com/hc/en-us/articles/36011896355479-How-to-Use-Previous-Workout-Values-to-Improve-Performance-in-Hevy): context matters to comparison. This app preserves its own movement/gym/equipment/unit matching rules.

These are external published design/product descriptions consulted during this sprint, not evidence that another app's users validated this implementation. The user's supplied images are the direct visual reference: spare hierarchy, dots and flat typography, not hardware controls.

## Typography and components

Manrope variable normal is used for words; IBM Plex Mono regular for exact workout values. The actual original TTF files and SIL OFL licenses are in `public/fonts/`, with exact source URLs in its README. They are self-hosted and precached with the offline shell. No remote font or analytics requests. The app uses28/34 title,18/24 subordinate heading and14/20 reading/action, plus a deliberate32/40 numeric-input role. Editable controls remain at least16px. No Jane Austen or purported proprietary Teenage Engineering font is shipped.

Warm off-white canvas, charcoal ink and darker vermilion primary actions give sufficient contrast; decorative target dots are independent of performance. Current numeric input stays editable and unrecorded until a successful explicit logging transaction. Saved values retain a check and Edit action. Font loading has readable fallback rather than invisible text.

## Limits

The model cannot reproduce sweat, real phone keyboards or physical thumb reach. A real-device gym trial remains necessary. Browser retention is not guaranteed: local backups remain the recovery path. The earlier prototype's memory-only behavior is not a production storage bug. Full food logging, trainer dashboards, new integrations, custom exercise catalog and a new workout-template data model were not added during this design pass. Legacy dumbbell weights lack a stored per-dumbbell/combined convention, so the UI reminds users to remain consistent rather than silently relabeling old records.

## Verified outcome and remaining physical trial

- Production build passes TypeScript/Vite. Open-license fonts and licenses are precached under the project subpath.
- 35 distinct development browser tests passed across the complete suite and focused reruns after changed selectors; one intentional production-shell skip is covered by the separate Pages production test. The final compact-header change was rechecked with19 affected workflow tests; all8 design-system tests passed after the shared library structure fix. Assertions retain data/transaction semantics, stable exercise identity, backup restore and error recovery rather than matching obsolete copy or DOM positions.
- The actual built Pages-path test passed, covering manifest/icons, actual logging, reload, offline logging, and both new fonts in cache and loaded offline. No external workout API.
- `scripts/review-production-redesign.mjs` renders the real app with12 synthetic history sessions in a new isolated browser context. It measures initial Log within the viewport at320×740 and390×844. The returning-history/sixth-draft case also passes: at320px Log y600–656 and Next y676–734; at390px Log y580–636 and Next y656–704. Latest correction remains immediately available; actuals survive reload. Zero page errors or external requests.
- Production captures in `design/production-redesign/` show actual rendered React UI using synthetic records; they are not generated mockups. The independent production usability recheck is `PRODUCTION-USABILITY-RECHECK.md`. Its retained-scroll and sixth-entry Next findings were subsequently fixed and remeasured, rather than erased from the original report.

A real phone's keyboard, thumb reach and gym distraction remain untested. This is the next practical usability check, not grounds to describe synthetic personas as human validation.
