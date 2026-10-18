# Training notebook as a small instrument

18 October 2026. Graphic design handoff in collaboration with UX. The latest user direction supersedes the prior athlete illustration, anatomy diagram, acid-lime palette and Jane Austen wordmark. Previous studies are preserved; this proposal is `docs/design/instrument-direction.html`.

## References and evidence

Official product references:

- https://teenage.engineering/products/ep-133
- https://teenage.engineering/products/op-1
- https://teenage.engineering/products/op-1/original/overview

Root actually opened and inspected these references in Chromium and retained captures in `docs/design/references/`; see `INSTRUMENT-REFERENCE-STUDY.md` for its research record. The graphic agent's own direct shell fetch was blocked by network permissions, so no independent source inspection is claimed. Design decisions below combine root's reported visual observations with the user's requested direction and UX constraints. This is visual reference research, not interviews or human usability testing.

The useful observations are physical: square off-white/black keys, a few orange controls, recessed dark readouts and aligned utilitarian lettering. OP-1's light casing is not copied wholesale; the user asked for dark. We translate the relationship between tactile keys and readable displays into two dark phone scenes. No Teenage Engineering logo, proprietary typeface, product photograph or exact product interface is copied. The reference site's reported `te-20, Unicode, sans-serif` does not mean our system fonts are its official fonts.

## Material, typography and palette

| Role | Token | Function |
| --- | --- | --- |
| Outer surround | `#181818` | Quiet frame around the mobile panel |
| Graphite case | `#252525` | Both primary screens |
| Panel | `#313131` | Context and secondary structure |
| Raised case | `#373737` | Separate readable ownership surfaces |
| Recessed register | `#191919` | Exact entered numbers |
| Ink | `#EAE8DE` | Warm readable foreground |
| Secondary ink | `#BEBEBE` | Context and qualifiers |
| Keycap | `#E2E1D6` | Clearly physical secondary controls |
| Keycap ink | `#292B26` | Dark labels on off-white keys |
| Signal orange | `#FF6A35` | Primary Log/Start, actual-set marks and visit days |
| Strong border | `#626262` | Structure, with lighter control borders where needed |

Radii are3–5px for controls/registers/panels; contextual bottom sheet8px. Shallow lower-edge shadows distinguish a key from its recess. Controls are at least44px high; primary actions retain52px. Grain is a static inline SVG feTurbulence texture at0.045opacity on a background-only pseudo-element behind the content. It replaces the earlier regular dot pattern. The pseudo-element cannot intercept pointer events and does not overlay text or control ink. Number registers and reference panels have opaque backgrounds: no noise crosses their data ink. No animated static or fake live signal.

Functional words use system sans. Numbers, exact results and matrix axes use `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, all locally available fallbacks. Keep the existing three text roles28/18/14 with editable fields at least16; the large weight/reps register uses28. The utilitarian character comes from alignment, restrained material and exact numerical reading, not tiny uppercase labels or cryptic abbreviations. The wordmark is a plain18px mono Notebook with one orange square; no font asset or personal-use font license is involved in this new prototype.

## The visualizations mean actual things

**Attendance:**28 cells represent21Sep–18Oct2026 in the fixed synthetic study. Twelve initial filled days match the count. Finishing a workout on the example's today fills one additional day and changes both to13. A second same-day workout remains one visit day. Individual cells have date and recorded/no-recorded accessible labels. This is not a streak, schedule or estimate of unlogged attendance.

**Workout sequencer:** each row represents one planned exercise, each cell one of its three planned working sets. In a prepared plan all cells are unfilled; in a resumed workout only explicitly logged fixture sets light up. The adjacent actual/planned number describes the same data. It is not a muscle-volume score or decorative random dots.

**Progress:** the compact example says60kg and2more reps with setup/effort qualification. The proposed future trend remains labelled illustrative/future in its contextual sheet. The chart is not silently presented as an implemented Sprint1 history feature, nor a muscle-growth measurement. No body diagram, athlete image or physique metaphor remains in the new study.

## Interaction translation

Home keeps the attendance readout, one chosen-workout panel and compact factual progress. Choose workout and exercise count are physical-looking controls. Review opens a contextual plan/setup sheet, not a third primary screen. Selection does not start a session. Start creates the synthetic session in page memory.

Workout exposes a distinct Last time reference above the two current numeric registers. Use fills the draft; Log is the only action that creates a fixture actual. Weight and reps can be typed directly or changed with plus/minus keys. Orange completion marks appear after explicit logging, never on an unperformed future row. Swap is a labelled visible control rather than a cryptic icon hidden in a menu.

Optional effort uses five discrete0/1/2/3/4+ keys. Initially none is pressed and the value says Not recorded. This avoids a centered slider falsely appearing to record2reps left. Full accessible names say estimated good-form repetitions left. Removal restores unknown, not zero.

The optional rest timer is an explicitly proposed interaction retained from the previous study; it is not a required Sprint1 feature. It can be skipped and never blocks Next or logging. Finished actuals have explicit correction controls. Finish states how many sets were logged and leaves unperformed sets absent. The original intended counts remain stable.

## Scope and handoff

The HTML is approximately40KB, standalone and self-contained: inline SVG icons, CSS materials and JavaScript memory. There are no external font/image assets, base64 athlete payload, network services, storage calls or production imports. The only image data URI is the small procedural SVG grain, not a photograph or illustration. Reload resets fixtures; the prototype never claims persistence. The previous `dark-direction.html` is unchanged.

All earlier interaction paths are retained: Home → choose/review → setup → Start → exact entry/steppers → Log → optional effort/rest → next/previous → finish → Home; correction, Home/resume, partial finish and safe replacement remain available. Per-set source exercise/equipment labels survive swaps; replacement weight is cleared and an unlike setup is not shown as matching Last time. Error messages retain invalid input for correction.

Sheets retain initial focus, Escape, Tab trapping and trigger-focus return. Real production integration still needs actual saving/failure/retry/revision states bound to IndexedDB rather than timed simulation. Those semantics must not be lost when importing the graphic vocabulary.

Root owns final browser captures, source-reference inspection and executable flow verification for this study. Root reports the new study passed a full nine-set workout including swap, correction, effort, rest and a second same-day workout. That execution preceded the final neutral-graphite/background-grain adjustment, which requires a final visual recheck. The old study's browser results are not reused as evidence that this new styling passes. Physical one-handed comfort, legibility in gym lighting and the user's preference remain unvalidated until actual use. No production files have been edited for this direction.
