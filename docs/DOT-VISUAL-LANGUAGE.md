# A quiet, dotted visual language

18 October 2026. The latest user references replace the hardware metaphor. This is a clean, spacious mobile UI study: warm off-white, charcoal text, vermilion signals and dotted numerals/visualizations. It is not a synthesizer/device skin or a production app release.

## Review artifacts

- `docs/design/dot-muscle-contact-sheet.html`: all nine original muscle-target glyphs together, with visible group name and front/rear orientation. Self-contained inline SVG; no image/font request is needed.
- `docs/design/dot-muscles/{chest,back,shoulders,arms,core,quads,hamstrings,glutes,calves}.svg`: reusable standalone SVG assets.
- `docs/design/dot-direction.html`: portable interactive two-screen composition using those same asset geometries on Home, workout selection and the active exercise header. Example records, JavaScript memory only; reload clears the fixture.

The earlier dark and instrument studies remain available as superseded explorations. No production source, storage or real workout records were changed.

## Asset contract

All nine drawings share one112×180viewBox, body scale and deterministic4-unit dot lattice. Neutral base dots identify a coherent body silhouette. Larger vermilion dots localize the target region. Target dot density and color are fixed design constants; they never encode improvement, hypertrophy, recovery or training quality. These are schematic location aids, not comprehensive anatomy or exercise instruction.

Front: Chest, Shoulders, Arms, Core and Quads. Rear: Back, Hamstrings, Glutes and Calves. The rear body uses a neutral spinal seam; front anatomy retains slightly different negative space. View orientation is stated visibly on the contact sheet and in each standalone SVG title/description. Group selection uses a visible name and selected outline/check in addition to color; a glyph alone is insufficient to identify ambiguous muscle groups.

Assets expose CSS custom properties `--muscle-accent` (default`#F34A2C`) and `--muscle-base` (default`#C3C4BF`). Keep aspect ratio; do not stretch or crop limbs. Contact-sheet standalone instances have unique title/description IDs. Repeated decorative inline instances in the prototype strip that metadata and use `aria-hidden="true"` because adjacent visible names supply the meaning. If used without adjacent text in production, expose a proper accessible name and the target's view orientation.

Current fixture exercises map Chest→Chest, Back→Back, squat/leg plan→Quads, deadlift→Hamstrings and calf raise→Calves. The remaining assets are present for reuse, not a claim that all nine groups are already selectable in the current three-choice synthetic plan. A broad Legs plan showing Quads is a primary-target cue, not a claim that Quads represent every leg muscle. Production integration should supply the actual target identity instead of inferring it from display-name regex.

## Composition rules

Canvas`#F6F5F1`, ink`#292A26`, secondary`#696C64`, rule`#D6D7CF`, signal`#F34A2C`. No athlete imagery, keycap shadows, fake device panel, grain overlay, noisy numerals or enclosure around every fact. Open space, alignment and a few thin rules do most of the grouping. Buttons remain obvious through one vermilion primary and restrained outlined secondary actions, each at least44px high.

Use functional system sans with28/18/14roles and editable fields at least16. The actual visit total is drawn with deterministic dot-matrix numeral geometry, with the corresponding real count retained for assistive access. This is a graphical encoding of the same count, not an additional type ramp or decorative fake data. Weight/reps remain exact plain editable numerals; do not sacrifice in-gym precision to a stylized digit font.

Home: short wordmark, visit total/period and dated attendance matrix, one launch area with target glyph, then compact factual progress. It removes repeated Training/Today's workout/Next workout headings. A visible group name occurs once in the launch title, not again inside the glyph. Workout: session count rail, active exercise name/glyph, separate Last reference, exact load/repetition fields and obvious Log action. Swap/Finish/Close, units, references and saving/error meaning cannot be removed merely to make a screenshot sparse.

The workout chooser uses a small glyph plus visible name and a noncolor selected outline/check. Attendance cells and dot-chart paths retain their data meaning. The future trend sheet stays explicitly illustrative/future; no muscle-growth meter is introduced. No hover-only legend or cryptic abbreviation is necessary to use a control.

## Behavior and evidence boundary

The new study derives the existing two-screen fixture behavior: Home/review/setup/start; direct entry and numeric steppers; log actual; optional none-selected effort keys and skippable rest; correction; safe swap with original per-set attribution; next/previous; partial or complete finish; Home/resume. Body glyphs and light layout do not create performed sets. Twenty-eight attendance cells and the visit count still share the same synthetic recorded-day data; another workout on the same day is not another visit day.

Root visually inspected the new contact sheet and both composed screens, and reports the new nine-set walkthrough passed at320/390px with zero page errors, external requests or database calls. Retained evidence is `docs/design/dot-prototype-review.json`, `dot-home.png` and `dot-workout.png`. This is evidence for the new fixture, not reused results from an earlier study. The only subsequent HTML change removed the legacy phrase Use the keys from the footer. The graphic agent does not claim human usability research, real gym testing, scientifically exact anatomy or a completed production migration. Real app adaptation must retain actual IndexedDB transaction receipts, failure/retry and revision protection; page-memory updates in this study are not durable saves.

## Final root verification

Root inspected the contact sheet and both rendered screens. `node scripts/capture-dot-contact-sheet.mjs` passed at1200px/390px. `node scripts/review-dot-direction.mjs` passed at320px/390px through nine sets, correction, equipment swap preserving original actuals, optional effort initially unselected, rest, finish and repeat-day attendance deduplication. Zero page errors, external HTTP requests or IndexedDB opens. Log control at390×844 occupies y689–741. Artifacts: `design/dot-muscle-contact-sheet.png`, `design/dot-home.png`, `design/dot-workout.png`, `design/dot-prototype-review.json`. This is prototype validation, not a human usability study or production data-storage verification.
