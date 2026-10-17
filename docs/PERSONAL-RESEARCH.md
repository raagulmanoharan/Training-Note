# Research decisions for the personal notebook

Reviewed 17 October 2026. This is a practical planning and logging tool, not an individualized training prescription or an AI coach.

## Progressive overload

[ACSM's 2026 position-stand overview](https://acsm.org/resistance-training-guidelines-update-2026/) summarizes 137 systematic reviews involving more than 30,000 participants. It emphasizes consistent participation, individualized programs, and tailoring load/volume to goals; complicated programming is not a prerequisite for general progress. The article was opened and read. Its findings do not establish one universally best rep range or increase rule.

The paper [Progressive overload without progressing load?](https://pubmed.ncbi.nlm.nih.gov/36199287/) compares load and repetition progression. Search-indexed abstract material indicates both are useful progression approaches in its study context. Full article retrieval was blocked by publisher/PubMed access challenges, so this implementation does not claim a comprehensive full-text appraisal or proof that its exact algorithm is superior.

Product decision: record both actual weight and reps. Show every set from the last comparable session. Optional double-progression hints support building reps within a user-editable range before a small user-editable load increase. Defaults (three sets, 8–12 reps, 2.5kg/5lb increments) are editable conveniences, not an optimal program claim. No automatic logged actuals, mandatory increase, failure training, or estimated maximum is needed.

Only propose an increase after all planned sets met the upper rep bound, with a consistent prior load and matching exercise, gym/setup, equipment, unit, set count and rep prescription. Missing or incomparable data prompts review/repetition. Assistance machines need inverse-load interpretation and should not receive generic heavier-is-harder advice. User controls the final choice based on form and how the sets felt; the app cannot infer readiness from numbers alone.

## Movement coverage

Distinct primary movement/target labels are a planning heuristic, not a promise that muscles never overlap or a complete individualized weekly program. Compound presses recruit front delts/triceps; rows can involve rear delts. Show this secondary involvement. Round-robin selected groups so each chosen group is represented, avoid duplicate primary targets where the available catalog permits, and cap/explain the exercise count honestly. A same-target equipment swap should preserve coverage and keep historical actuals attached to the performed exercise.

## Durable local storage

[WebKit's storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/) was opened and read. Browser storage normally uses best-effort retention; quota pressure, inactivity policy and user clearing can remove it. StorageManager.persist can request stronger protection, with browser-dependent approval heuristics. Home-screen installation is helpful but cannot guarantee survival of user deletion, device loss or all browser behavior.

Product decision: IndexedDB transactions acknowledge completion before calling a set saved. Store unfinished work and typed entries; reject stale-tab revisions; keep import atomic. Offer full JSON backup with schema checks and SHA-256 integrity validation, preview before merge, and no silent overwrite of conflicts. A checksum detects corruption, not maliciously authored files. Exported files are unencrypted personal data; store privately. No backend, analytics or cloud synchronization is required.

The same browser profile and stable origin are essential: changing host, port or browser does not carry the database automatically. Use downloaded backups before moving. Do not claim an automatic seven-day deletion rule or infallible permanence. The installed production web app caches its shell for offline use after the first successful online load; service-worker updates never delete the database.
