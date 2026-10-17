# Optional effort and honest muscle progress

Design response to the user's request to permit RPE in simple language and visual muscle progress. This extends the approved compact notebook; it must not introduce a fifth logging column, a compulsory post-set questionnaire or claims about measured muscle growth. PM journey approval was provided in docs/EFFORT-PROGRESS-PM.md before engineering pickup.

## Optional effort: ordinary words first

After a set has been explicitly logged and committed, the user may choose a small secondary **How did that set feel?** action. This opens a separate effort-only inline editor, not the weight/reps correction editor. Helper: **How many more reps could you have done with good form?** Explain **Your estimate. Optional.** No definition of RPE is required to use the app. Existing saved effort can be opened to change or remove it; historic sets may expose the same optional affordance. No automatic prompt interrupts logging.

Inside this panel, a wrapping group of explicit action buttons reads **4+ more**, **3 more**, **2 more**, **1 more**, **No more**. Each has a minimum 44px hit target; already recorded value is indicated by accessible pressed state or accompanying text. No more means no further controlled repetitions estimated, not encouragement to push past form. Do not express options as difficulty judgments such as Easy/Bad or demand an all-out effort. No selection is valid.

Tapping an effort choice explicitly saves just that optional field, retaining set identity, weight, reps, timestamp and order. Disable duplicate actions during the write, and do not acknowledge committed effort before the transaction completes. A failed save keeps the effort panel and proposal recoverable under existing Not saved / Retry handling. Cancel or Close makes no change. Remove effort explicitly deletes the optional property, making the estimate unknown; it does not delete the set or mean zero remaining repetitions. Keep this effort-only transaction model separate from weight/reps correction drafts so there is no mixed autosave/Save ambiguity. Existing actual correction retains recorded effort unless a distinct effort action changes it.

A secondary **About this scale** disclosure may show **4+ more ≈ RPE 6 or lower; 3 more ≈ 7; 2 more ≈ 8; 1 more ≈ 9; no more ≈ 10**. State that this is an estimate. Do not store or display an unqualified physiological measurement. Do not alter progression advice automatically from optional effort in this release.

Outside edit mode, the default row remains # / load / reps / check. If effort exists, expose it through the Edit control's accessible label/title or a quiet one-line summary immediately below the row only on request; do not append another required field. Existing history correction affords the same optional set-level effort controls. Unrecorded past sets show Not recorded when edited; no inferred effort is generated during migration.

## Muscle progress: recorded performance, not biological growth

Progress may open with compact muscle cards using the existing original target glyphs. Each card shows a muscle name and a factual state anchored in actual performed data: **Performance improving**, **Similar performance**, **Mixed results**, **No comparable session**, or **No logged sets**. Prefer a concrete movement comparison directly beneath: **Bench press: +2 reps at 40 kg**, with the comparable session dates and a compact **View comparison** inline disclosure. Labels must be derived by a documented comparable-session rule; design is not permission to infer causality or muscle growth.

Use exact movement, gym/setup, equipment and unit matching. Compare the same number of performed sets and consistent per-set load when showing a total-rep delta. If there are several movements for a muscle, an isolated positive movement must not imply that all movements improved. Show **1 movement improved** or **Mixed results** instead of an unsupported blanket verdict. Higher load with lower repetitions is not automatically improvement; label **Different loads** and show actuals unless an explicit defensible rule supports the comparison. Unknown gym/setup means **Add a setup label to compare**. A first session gives a baseline rather than a score.

Muscle cards have no growth percentages, readiness rings, fake scientific dot scales, inferred recovery or anatomical fullness changes. Emerald can mark an evidenced positive delta; neutral text marks baselines/mixed/incomparable results; no red punishment for lighter or shorter sessions. The history underneath remains the audit trail. The user can correct an actual and see recalculated results after durable write success.

## Approved layout contract

A separate effort-only panel uses `.nb-effort-picker`; `.nb-effort-options` is a wrapping flex row, `.nb-effort-option[aria-pressed=true]` uses emerald border/tint, and `.nb-effort-helper` is muted 12px copy. The scale explanation uses native details/summary. No sticky effort UI.

Progress overview uses `.nb-muscle-progress-grid` in two columns at390px and one column below360px when comparison text becomes cramped; `.nb-muscle-progress-card`, `.nb-progress-state`, `.nb-progress-evidence` and `.nb-progress-date` hold the content. Cards retain charcoal surfaces; glyphs are decorative. Disclosure content spans the card; long names wrap. Status text never relies solely on color. Existing bottom navigation and safe-area spacing remain.

## Required checks

Log without effort remains the fastest path and creates an ordinary set. Add, change and clear effort on a current or historical actual; reload restores the exact optional value and never changes performed weight/reps or ID. Cancel preserves saved values. Inject a save failure: no saved effort confirmation and the edit remains recoverable. Import older backups without effort safely; roundtrip newer optional values without invented defaults. Compare true matching sessions and show exact evidence; mismatched machines, units, loads or unknown setups never receive a false growth badge. These are synthetic/automated acceptance scenarios, not human test findings. PM and integration explicitly settled the separate effort-only, action-to-commit model before source implementation; the earlier combined correction-draft proposal is superseded.

## Screenshot review

Reviewed actual browser captures tests/artifacts/effort-picker-320.png, muscle-performance-390.png and muscle-evidence-390.png. The optional effort panel keeps the four-column actual logger intact and offers wrapped touch actions with the plain-language scale. Collapsed performance cards are compact and name comparable evidence rather than biological growth. The expanded evidence capture exposed an overly narrow reading column; the stylesheet now makes an opened evidence card span the full overview grid while keeping closed cards compact. The full-page captures include fixed navigation at the original viewport edge; content remains scrollable with reserved bottom padding. Screenshot review does not prove real-device comfort or accuracy of subjective effort estimates.
