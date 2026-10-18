# Gym notebook usability and production design sprint

## Actor and full journey before implementation pickup

An intermediate lifter arrives knowing today's muscle groups, carrying a phone in one hand. They want to start rather than inspect analytics. On first use they choose groups and exercise count, review proposed distinct targets and gym/setup, then explicitly start. On later visits they resume unfinished work or review a previous session. No plan value counts as a performed set.

At the machine they identify the current exercise and see the relevant previous actuals/setup without hunting through other exercises. They enter exact load and whole repetitions, then explicitly log once. Saving, saved and failure remain distinct; failed transactions do not display successful actuals. Their recorded set remains visible and correctable. Optional effort is plain-language and starts unanswered. Optional advice must remain identifiable as advice.

If a machine is occupied, they swap from that exercise's controls, inspect the replacement/setup and enter an appropriate new load. Prior performed work retains its source. If they move around the gym, an exercise switcher keeps the original plan order and allows selecting any exercise without changing stored order or losing draft input. The selected exercise's logging controls remain visible; long history may extend below them.

They may finish all work or end early. Finish shows the number of actual recorded sets and asks for a deliberate confirmation; unperformed work stays unrecorded. Back/home preserves the active session. A reload restores saved drafts and actuals from IndexedDB. The following visit presents recorded performance and source context, without claiming measured muscle growth. Backup/settings remain accessible without occupying the logging task.

## Acceptance and responsibilities

- Exactly Home and Workout as primary scenes, contextual review/settings/progress/correction surfaces.
- Fresh synthetic evaluator receives only persona and app, performs actual browser actions before source review. Evidence is synthetic evaluation, not human research.
- UX handoff follows the independent findings. Image-generated composition is separately critiqued; generated numbers/controls are not accepted as evidence.
- Production integrates reusable dot glyphs, self-hosted open-license typography, coherent spacing/type tokens and a focused logging layout. No hardware/keycap aesthetic.
- Controls have readable units/names and at least44px targets; core task fits normal mobile width without horizontal scrolling. Focus states, dialog recovery, error feedback and reduced motion remain supported.
- Preserve IndexedDB schema, transaction acknowledgements, revision guards, explicit actual logging, setup-specific comparisons, safe swap, import and backup behavior. Do not reset user data.
- Run build, relevant production browser regression and project-subpath offline checks; inspect actual mobile captures. Report remaining limitations honestly.

## Team and evidence

Fresh evaluator: `/root/fresh_gym_usability` (no conversation context). UX: `/root/sprint1_ux`. Graphic design: `/root/sprint1_visual`. Production engineering: `/root/production_redesign`. Root integrates design-system tokens, font licensing/assets and verification.

Image generation used both actual dot-prototype screenshots as references and produced `design/generated-layout-exploration.png`. It is a composition exploration, not an app screenshot or usability result. Review must reject fake prefilled future actuals, six-dot/nine-set mismatch and repeated tiny controls.

## Final standup / completed work

| Story | Owner | Result |
| --- | --- | --- |
| Fresh gym walkthrough without prior design context | Fresh usability agent | Done; observed prototype failures and synthetic judgments recorded separately |
| Journey and control-placement revisions | UX designer | Done; source-aware handoff, no prototype persistence gap mislabeled as production bug |
| Generated composition + visual critique | Graphic designer / root | Done; both screenshots supplied, invalid generated completion/actual values rejected |
| Real Home and Workout composition | Production engineer | Done; active-first, one editable set, launch-first Home, explicit repeat logging and finish receipt |
| Shared design system and typography | Root | Done; labelled Log control, reusable dotted art, Manrope/Plex with OFL assets and offline cache |
| Independent production recheck and feedback fixes | Fresh evaluator / engineer | Done; latest Edit visible, compact sixth-set controls, receipt scroll restored |
| Regression, persistence and Pages offline | QA / root | Done; relevant browser checks and actual production path/font tests passed |
| Physical gym/phone trial | User | Not performed; no fabricated human evidence |

Full evidence and scope limits: `REDESIGN-DELIVERY.md`. Source changes preserve the original storage schema; no user database was cleared. Synthetic state used only isolated browser contexts.
