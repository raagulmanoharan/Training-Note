# Gym Notebook

Publication prepared for `raagulmanoharan/gym-notebook`. Remote repository creation is currently blocked by GitHub integration permissions; the intended Pages URL is not live yet.

A personal, mobile-first gym log. No account, backend, analytics or subscription. Your workout records live in this browser's IndexedDB database.

Choose muscle groups and an exercise count, review a compact plan, start, and log actual weight and reps. Switch exercises or swap equipment inline. Finished sessions retain every set. Optional progression hints compare the same exercise and setup; the final decision stays with you.

## Run

```sh
npm install
npm run dev
```

For the installable, offline version:

```sh
npm run build
npm run preview -- --port 5176
```

Open the production URL online once. On iPhone use Share → Add to Home Screen; on Android use the browser's Install/Add to Home Screen action. A phone installation needs a stable HTTPS URL (localhost is accepted for desktop development). The included GitHub Pages workflow deploys automatically from main once the repository exists and Pages is enabled. The app checks offline readiness after its production service worker installs.

## Keep your records

Records and the active workout persist across reloads and browser sessions. A set is marked saved only after its IndexedDB transaction completes. Browser/device deletion and storage eviction can still remove local data. Backup offers persistent-storage permission and a complete JSON export/import. Keep a recent downloaded file outside browser storage, especially before changing browser, device, or site address. Imports validate integrity and merge safely; conflicting records are rejected without replacing existing data. Files are unencrypted personal data: keep them private. Offline caching protects app availability, not against losing the device or clearing its data.

## Verify

Run the dev server on port 5175, then:

```sh
COACHLINE_URL=http://127.0.0.1:5175 npm test
```

The suite uses isolated synthetic browser data; production offline checks use a separate built preview. See [QA evidence](docs/PERSONAL-QA.md), [requirements](docs/PERSONAL-PRD.md), [journeys](docs/PERSONAL-STORIES.md), [UX](docs/PERSONAL-UX.md), [research decisions](docs/PERSONAL-RESEARCH.md).


## GitHub Pages deployment

The workflow in `.github/workflows/pages.yml` builds with Node 22 and deploys `dist`. Relative asset URLs, the manifest and the scoped service worker support project hosting at `/gym-notebook/`. No secrets, private records or backend are required.

Pages-path smoke check (against a server mounting dist at /gym-notebook/):

```sh
PAGES_URL=http://127.0.0.1:5178/gym-notebook/ npm run test:pages
```

You can also use the published URL after deployment. The test writes only isolated synthetic browser records.
