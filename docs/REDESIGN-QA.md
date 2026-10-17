# Reference-led redesign verification

Status: implementation browser verification passed. The two supplied stills, recording review in REDESIGN-UX.md, existing app tests and current PM/UX handoff inform this plan. This is synthetic browser verification and expert inspection; no human usability study or real-device keyboard assessment has occurred.

## Required journeys

1. Choose muscles with distinct primary target coverage; adjust bounded exercise count; build a compact lineup; return to change muscles; customize or swap a movement; start without losing edits.
2. Open a session and see numbered rows with aligned load, reps and explicit completion. Type actuals in the next row, confirm once, and show persisted completion only after IndexedDB succeeds. Explicit Repeat records exactly one identical actual; it is labeled as an action. Add set reveals input without creating an actual.
3. Move between exercise cards while values are pending; reload and reopen the browser page to recover the same draft and actuals. At 320 px and 390 px the page has no horizontal overflow. Primary input and completion targets are at least 44 px; numeric controls use appropriate input modes and readable text size.
4. Swap an unavailable movement before or after performing sets. Original actuals remain attributed to the original catalog movement and equipment, while the replacement has separate remaining planned sets and comparable history.
5. Correct or delete an actual, undo deletion, finish, correct historical actuals, reload and verify stable identity and corrected values.
6. Inject a quota failure and delayed earlier typing acknowledgement. Failed actuals remain uncommitted and unstyled as saved; retry commits exactly once. A stale tab cannot overwrite newer saved state.
7. Export and verify a backup, safely preview import, reject corruption without mutation, restore after synthetic device loss, and preserve existing work during merges.
8. Preserve conservative progression: compare the same movement, gym, equipment and unit; hold or review when sets, targets or assisted movement invalidate a simple load increase. All-set rep progress never fabricates weight progress.
9. Build and load the Pages project subpath, check assets/manifest scope, install the service worker, reload offline and log another actual without backend traffic.

## Evidence

Final source verification on 2026-10-17:

- `COACHLINE_URL=http://127.0.0.1:5180 npx playwright test personal.spec.ts`: **16 passed, 1 intentionally skipped** (21.5 s). The skipped check requires a production root preview; production offline behavior was tested independently under the actual Pages project path below.
- `npx playwright test pages.spec.ts`: **1 passed** (2.2 s), using `http://127.0.0.1:5178/gym-notebook/` and the root-confirmed final build cache `75ca64cfc94f6283`. Assets and manifest icons responded, worker scope matched the subpath, actuals recovered after offline reload, a second actual was logged offline, and no API requests occurred.
- All six original module durability, conflict, checksum, restore, catalog and progression checks remain. UI regression checks retained corrections, deletion/undo, swap attribution, history correction identity, draft recovery, quota rejection, delayed acknowledgement race, backup preview and whole-session rep comparison.
- Four new redesign journeys passed: reversible compact planning; aligned 44 px controls and card switching; explicit confirmation before discarding an unlogged movement's draft; and invalid-input explanations with blocked Repeat plus finish detection of an inactive movement's pending entry.

Screenshots in `tests/artifacts/`: `redesign-choose-390.png`, `redesign-lineup-390.png`, `redesign-session-390.png`, `redesign-first-set-390.png`, `redesign-notebook-390.png`, and `redesign-notebook-320.png`. The UX agent inspected the three initial 390 px captures and found no visual blocker. The automated 320 px checks confirm no horizontal page overflow and minimum 44×44 px load/reps/check controls.

Initial development runs encountered expected obsolete copy/selectors and one live Vite reload during concurrent implementation; selectors were adapted to the agreed semantic controls and final runs above were clean. A default sandbox Chromium launch was blocked by socket permissions; final runs used the environment's permitted network-enabled execution.

Synthetic personas covered the returning lifter, first-time planner, busy-gym swap, interrupted offline lifter and failed-storage recovery. Their observed behavior is represented by the journeys and browser checks above. This does not establish real-person comprehension, thumb comfort, iOS/Android keyboard behavior or home-screen installation. Those remain real-device tryout items. Browser retention still requires independently stored exported backups.
