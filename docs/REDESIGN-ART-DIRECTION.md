# Production redesign art direction

18 October 2026. Graphic/visual designer review for the personal workout notebook. Inspected the actual `docs/design/dot-home.png` and `dot-workout.png` captures alongside the generated two-screen layout `/workspace/generated_images/exec-33a7bc8e-b9d9-4d42-929a-cc3d96854d48.png`. This is a concrete design handoff, not a claim that generated artwork is executable or that humans have validated the proposed changes. Root owns shared design-system styling/font assets; the production engineer owns app composition. No production files are edited by this handoff.

## Keep the clarity; remove the prototype composition defects

The generated image gives the title, factual numbers and primary action more decisive visual weight than the current prototype. Its horizontal registration is useful: exercise title, separate Last reference, aligned load/repetition columns and one strong Log action. The off-white/vermilion palette and dot-target identity are worth keeping.

Do not copy its data. It shows six session markers against nine planned sets, a filled marker while the count says0/9, identical filled numeric controls on every unperformed row, and additional target text that repeats the prescription. These are generated-image artifacts, not an accepted interaction or domain model. Do not add a calendar, routine persistence, extra set type, chart statistic or automatic load recommendation merely because a generated mockup implies one.

The current actual prototype has different concrete defects: Bench press wraps needlessly while the target glyph and Swap consume its horizontal space; Chest day and Bench press compete as equally large headings; the Home target illustration is given more vertical space than its informational value warrants; Progress plus View plus a fully tappable evidence row duplicates a navigation affordance. Fix those relationships rather than decorating them with another card.

## Font choice

Use **Manrope** for functional words and **IBM Plex Mono** for exact numerical values. Both families are published under the SIL Open Font License in their canonical distributions; root must verify and retain the licenses for the exact downloaded assets. Self-host WOFF2, use `font-display:swap`, and use no remote font calls. Do not include the earlier personal-use Jane Austen font or represent a system fallback as the selected face.

Suggested font files: Manrope variable normal400–700, IBM Plex Mono regular400 and medium500, preferably Latin subsets covering multiplication sign and required punctuation. Avoid downloading an entire multilingual/typeface collection without a need. The app must remain legible while a font is loading and offline after precaching. Font load failure is a fallback, not a blank interface.

Manrope has a measured, slightly open geometric character without the hardware aesthetic. IBM Plex Mono is limited to ordered weight/repetition values, concise numerical results and axis numbers, not dates, section headings or every label. Tabular numbers remain enabled even if the fallback font is used.

| Role | Size / line | Weight | Application |
| --- | --- | --- | --- |
| Heading |28/34px|600|One dominant title for the current task: Home workout name or active exercise |
| Subheading |18/24px|600|Wordmark, section heading, subordinate movement names |
| Reading/action |14/20px|400/600|Body, labels, dates, setup, button text, caveats |
| Numeric entry, explicit optional display role |32/40px|500|Only the current weight/repetition register when sufficient width exists; otherwise existing18px grid input is valid |
| Editable control floor |16px minimum|400/500|Input text to prevent mobile focus zoom; this is an accessibility constraint, not another display hierarchy |

The dot-matrix visit total is a drawing of the actual count with an accessible textual equivalent, not another text ramp. Accent means weight/color. No letter-spaced uppercase, tiny captions, duplicated eyebrows, mixture of decorative headings or artificial hardware labels.

## Shared tokens

| Token | Value | Intended use |
| --- | --- | --- |
| Canvas |`#F6F5F1`|Warm off-white main background |
| Surface |`#FFFDF8`|Only a genuinely separate worksheet/editor, if needed |
| Ink |`#292A26`|Primary reading and heading text |
| Secondary |`#696C64`|Supporting context; keep readable at14px |
| Rule |`#D6D7CF`|Noninteractive section division |
| Control border |`#9FA596`|Actual input/secondary-action boundaries, stronger than decorative rules |
| Accent |`#D83B22`|Primary action and small actual/target signals; darker than illustration vermilion so white action labels can meet contrast |
| Accent ink |`#FFFFFF`|Primary action text, verify actual computed contrast |
| Target illustration accent |`#F34A2C`|Decorative target location or chart dot, not small reading text |
| Active draft tint |`#FFF0EC`|Optional very shallow editable-row emphasis; not completion |
| Danger |`#A83022`|Actual invalid/failed state |
| Focus |`#292A26`|2px outline with3px offset |

Do not use the lighter glyph accent as a general14px text color on the canvas. Color pairing needs actual rendered contrast checks, including disabled state and composited surfaces. A primary button can be darkened to the accessible action accent while the tiny target dots keep their brighter identity. Color alone never distinguishes draft, completed or selected states.

Spacing uses4/8/12/16/24/32px. Outer phone inset24px at390;18px at320. Main reading column max620px. Main buttons min48px, primary52px; icon/control hit areas44px. Corner radius12px primary/secondary buttons,8px input controls,16px only when a separate worksheet really needs a surface. No drop shadow, bevel, grain, ambient glow or border around every paragraph. One thin rule separates major ownership areas; do not put rules both above and below every tiny label.

## Home composition

The production engineer is prioritizing launch/resume before attendance based on the gym-entry journey; that order is appropriate. The inventory below specifies each block, not a requirement to place attendance above the action. Resume always wins when work is active.

1. Compact header: Notebook18px and one44px settings control. No extra Training title above the actual workout name.
2. Attendance summary: count drawing at left; Gym visits and Last4weeks at right. Count graphic no taller than56px. Twenty-eight dated cells and their endpoints follow with16px separation. Avoid pushing the useful launch action below a large decorative masthead.
3. One launch area: selected workout name28px;14px intended exercises/sets; target glyph roughly88×142px at the side. It must not force a short title to wrap. Selection is user-chosen, not a guessed programme rotation. Resume takes precedence when a session exists.
4. Primary Review/Continue action, then at most two outlined alternatives. Remove duplicate Build/Choose affordances elsewhere on the same viewport unless their semantics differ and the user needs both.
5. Compact progress overview: a single direct Details action or a fully tappable summary row, rather than View plus row-arrow plus repeated labels. Exact coverage and effort qualification remain visible. A tiny dotted trend requires actual historical data and a named unit; do not manufacture it for an empty or incomparable state.

At390×844, the launch action and the beginning of actual progress should be visible without the synthetic prototype disclaimer. Real product UI must not include the study footer or fixture labels. Empty records should show one useful next action, not a fake attendance count or sample progress.

## Workout composition

Session metadata is one14px line such as Chest day · Main gym; it is not another large title competing with the exercise. Home and Finish remain visible44px actions. Actual/planned count and its truthful rail use the same source: all unperformed marks neutral; optional current-position outline is separate from a completed mark.

The active exercise is the dominant28px title. Bench press must fit on one line at390px. A40–48px wide target glyph may sit beside equipment metadata or at the trailing edge; it cannot consume the column needed to read the exercise name. For longer names allow natural wrapping, never shrink type or clip it. Swap is explicitly labelled with a44px target. Keep this row independent enough that opening a replacement chooser does not jump the entire page unpredictably.

Last reference remains a factual, compact row: previous date/setup available in context, ordered prior values where needed, and one action that clearly fills a draft. It is never styled as the current actual. A new/swapped setup must not show an old machine load as though it matched.

Use one editable next-set row. If the engineer retains the existing ledger geometry, preserve its aligned ordinal / weight / repetitions / explicit commit columns. At narrow widths, two separate registers with steppers may be used if the same direct typing and commit semantics remain. Do not try to fit three fully editable rows of minus/input/plus controls into a tiny phone width just because the generated image showed them. Three6-control rows produce clutter and suggest unperformed sets are already known.

Future rows show blank actuals and their intended target, not copied60kg×8 values. A draft may show a deliberately copied last value, but it stays editable and visibly unrecorded. Once logged, collapse it into an exact actual row with an explicit Edit control. Add set is secondary and creates intention only, never an actual. The commit label is Log set/Record set, not a bare green checkbox that ambiguously toggles a performed actual.

The primary logging action should remain in the first phone viewport for an ordinary empty active exercise; extra reference detail, effort and utility settings can be disclosed. Do not use fixed overlays that cover the keyboard or saved rows. After logging avoid autofocus that reopens the keyboard or auto-advance that hides what was just recorded.

## Visible states, not just colors

| State | Art-direction contract |
| --- | --- |
| Future planned set |Neutral ordinal, blank actual weight/reps, clear intended target; no completed check |
| Draft |Editable exact input, optional shallow warm tint, active boundary; explicit Log action |
| Saving actual |Input retained; action disabled/busy with Recording…; no completion mark or saved receipt yet |
| Recorded actual |Exact values, small tick plus recorded semantics; quiet row and explicit Edit |
| Invalid input |Concise field-specific text and boundary; preserve values and offer correction |
| Transaction failure/conflict |Persistent readable explanation and existing retry/export/reload consequences; never a success-colored toast |
| Editing recorded actual |Original actual remains until commit; Save correction/Cancel; deletion is explicit and reversible through existing Undo |
| Optional effort absent |No selection; no inferred zero or2reps left. Plain good-form reps-left explanation remains available |
| Empty/incomparable progress |Actual reason, not a dimmed zero-growth score or arbitrary chart |
| Unknown setup |Logging remains possible with an explicit comparison limitation; do not imply storage failed |

## Handoff and review

The generated image is reference material only. The app engineer must compose from the existing production models, real transaction handlers and evidence objects. No fabricated data, changed database schema, implicit template update or automatic logging is authorized by a visual instruction. The nine original dot assets remain reusable location illustrations; density does not encode growth.

Before delivery, inspect actual320/390px Home, empty first-session state, one active draft, a successful record, invalid/failure recovery, correction, swap after one actual, and partial finish. Verify actual typefaces and source-license files, offline cache paths, font fallback, minimum hit areas, computed contrast and long-title layout. Run relevant production regression/offline checks. Physical gym comfort and user preference still need real use; screenshots alone do not establish either.
