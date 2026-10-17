# DEPLOY01 — Publish the personal app to GitHub Pages

Actor: app owner. Need: stable HTTPS URL to try, bookmark and install the app. User explicitly requested repository creation and a Pages link.

Journey recorded before deployment implementation: open the published project URL, wait for local records to load, choose Chest/Back, build and start a session, explicitly log weight and reps, reload and verify saved actuals. Open Backup and confirm production offline readiness. After first successful online visit, reopen offline; the shell and records must remain accessible. Installation follows the browser Home Screen action. Publish only personal-app source and synthetic documentation; no private workout database or credentials are uploaded. Empty data on this new origin is expected: export/import from the old origin if transferring existing records.

Loading/failure: GitHub Actions builds and uploads static dist; a failed build does not count as a successful release. Missing Pages configuration is repaired or reported. Asset, manifest and service-worker URLs must work under /gym-notebook/. No account or backend is required. Validate HTTPS response, exercise/log/reload, manifest scope and offline use on the published URL. Real-phone installation remains a manual check; persistent storage is not an external backup.

## Executed results

- Standalone production build passed.
- One Chromium Pages-subpath journey passed: assets/manifest/icons, /gym-notebook/ service-worker scope, explicit actual logging, reload persistence, offline reopen and additional offline actuals; zero API requests.
- GitHub identified account raagulmanoharan successfully. Both GraphQL createRepository and REST POST /user/repos returned Resource not accessible by integration (REST 403). No remote repository or Pages deployment was created. This is a GitHub authorization limitation, not an automatic approval-review rejection.
- Remaining action: an empty accessible repository must exist before pushing and enabling Pages. After publication verify the actual HTTPS URL with the same smoke test before calling the release live.
