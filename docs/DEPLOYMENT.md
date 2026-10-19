# DEPLOY01 — Publish the personal app to GitHub Pages

Actor: app owner. Need: stable HTTPS URL to try, bookmark and install the app. User explicitly requested repository creation and a Pages link.

Journey recorded before deployment implementation: open the published project URL, wait for local records to load, choose Chest/Back, build and start a session, explicitly log weight and reps, reload and verify saved actuals. Open Backup and confirm production offline readiness. After first successful online visit, reopen offline; the shell and records must remain accessible. Installation follows the browser Home Screen action. Publish only personal-app source and synthetic documentation; no private workout database or credentials are uploaded. Empty data on this new origin is expected: export/import from the old origin if transferring existing records.

Loading/failure: GitHub Actions builds and uploads static dist; a failed build does not count as a successful release. Missing Pages configuration is repaired or reported. Asset, manifest and service-worker URLs must work under /gym-notebook/. No account or backend is required. Validate HTTPS response, exercise/log/reload, manifest scope and offline use on the published URL. Real-phone installation remains a manual check; persistent storage is not an external backup.

## Executed results

- Standalone production build passed.
- One Chromium Pages-subpath journey passed: assets/manifest/icons, /gym-notebook/ service-worker scope, explicit actual logging, reload persistence, offline reopen and additional offline actuals; zero API requests.
- GitHub identified account raagulmanoharan successfully. Both GraphQL createRepository and REST POST /user/repos returned Resource not accessible by integration (REST 403). No remote repository or Pages deployment was created. This is a GitHub authorization limitation, not an automatic approval-review rejection.
- Remaining action: an empty accessible repository must exist before pushing and enabling Pages. After publication verify the actual HTTPS URL with the same smoke test before calling the release live.

## 19 October2026 — user-provided destination

The user supplied `raagulmanoharan/Training-Note` and authorized deployment for a same-day gym trial. Repository access and admin/push permissions verified; remote is empty. Current release is the real card-based React app with local IndexedDB, backup, offline fonts and the persistent collapsible session clock. Relative assets and manifest scope work with `/Training-Note/`; the production smoke test now derives its expected scope from PAGES_URL. No private browser data or secrets are published. Earlier repository-creation failure above is historical. Live verification results will follow.

### Live publication verified

- Public repository: https://github.com/raagulmanoharan/Training-Note
- Live HTTPS app: https://raagulmanoharan.github.io/Training-Note/
- Initial release commit: f2ba07a70faa08146a77a60a664a8cc91d046a48.
- Deploy GitHub Pages workflow succeeded: https://github.com/raagulmanoharan/Training-Note/actions/runs/39247711392.
- Direct integration attempt to create the Pages site returned403, but the repository workflow successfully deployed; no user settings action is required for the now-live site.
- HTTPS returned200. Real Chromium production smoke test passed on the public URL: project-relative manifest/icons, saved actuals, reload, correct `/Training-Note/` service worker scope, cached fonts and additional offline logging. One live browser test passed in3seconds. Browser fetch is used for manifest/icon checks so requests honor browser networking/proxy configuration.
- A separate isolated live-browser walkthrough verified Back+Arms with3exercises previews Lat pulldown, Dumbbell curl and Seated cable row; no triceps movement. User records were not seeded or changed: all test data lived in fresh isolated browser contexts.
- On iPhone, open the live URL in Safari and use Share→Add to Home Screen. Load once online before offline use. The app stores records on that browser/device; export a backup after a session. Changing devices/origins requires backup import.

## Modern UI and complete action flows — published19October2026

- Release commit: `24b3df272c527c8eb996fed07d6925abc8220841`.
- Successful Pages workflow: https://github.com/raagulmanoharan/Training-Note/actions/runs/39258128485.
- Same live origin: https://raagulmanoharan.github.io/Training-Note/.
- Local release regression:48passed,1intentional production-onlyskip. Build and PWA generation passed.
- Public Pages smoke:1passed in2.9seconds; real project-path assets, manifest/icons, self-hosted fonts, explicit actuals, reload, service-worker scope, offline reopen and additional offline logging.
- A separate live isolated browser confirmed Biceps suggestions exclude triceps, Add Hammercurl works, remove/Undo restores both movements, and a logged set survives reload. The assertion waits for IndexedDB hydration before inspecting the reopened UI.
- Storage schema/engine and existing data identities are unchanged. No user browser database was accessed or reset. Undo is the latest in-memory removal and is not a trash archive across reloads.
