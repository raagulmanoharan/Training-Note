# Workout editing journeys

## Before implementation

The actor is an intermediate lifter using one hand between sets. They know the exercises they want and need to adjust the workout without repeating the same form for every exercise. This is a planned interaction review, not a claim of human usability testing.

### Change one exercise

1. Open an exercise's options, then Edit exercise.
2. See the exercise name and its working-set target, rep range and rest preference immediately. Increase or decrease the set target with a 44 px control, or type a value.
3. Choose a rest preset or enter seconds. Off remains a valid choice. The preference starts a timer after the next logged set; it does not retroactively start or alter a running timer.
4. Open Equipment & setup only when gym, equipment or weight increment needs changing. Explain that these labels affect comparison and existing receipts for this exercise.
5. Save acknowledges the root's durable write. Cancel makes no write. Invalid values stay editable with a concrete error. Saving disables duplicate submission.
6. Reducing a target never removes recorded sets. If the new target is below the recorded count, state explicitly that all recorded sets stay.

### Change targets across a workout

1. Open Edit workout targets from workout options. All existing exercises are selected, and the selection count is visible; expand Choose exercises to select one, several or all.
2. No fields are active initially. Independently select Working sets, Rep range or Rest between sets. Unselected fields mean Keep current.
3. Common existing values can be shown when a field is enabled. Mixed values remain blank and need an explicit input. Do not infer that all exercises should inherit the first exercise's settings.
4. Read the affected exercise count on the save button. The patch contains only enabled fields and the stable IDs selected.
5. Cancel writes nothing. The root saves once, preserves saved sets, pending values, IDs, units, gym and equipment, and closes only after success. A failed save leaves the form and selection available for retry.

### Correct several recorded sets

1. Open Edit recorded sets for one exercise. This is separate from target editing and also available for a finished workout.
2. See numbered receipts with their actual weight and reps; choose one, several or all sets.
3. Explicitly enable Weight and/or Reps. Mixed values remain blank. Select one exercise/setup/unit at a time so a shared value has an unambiguous meaning.
4. Save with an explicit Correct N sets action. The callback contains selected set IDs and only enabled weight/reps fields. The root preserves loggedAt, effort, identity, order and the pending next-set values.
5. Cancel and validation failure write nothing. No bulk-delete action or automatic creation of actual sets is offered.

## Acceptance

- Controls stay inside a 320 px viewport, wrap descriptive text, and provide at least 44 px hit targets.
- Inputs are labelled, checkbox selections expose checked state, keyboard input works and errors use role=alert.
- Buttons communicate selected scope; no selected rows or no enabled fields cannot submit.
- Sets: integer 1–20. Target reps: integers 1–100 with maximum at least minimum. Rest: integer 0–3600 seconds. Actual weight: finite 0–2000. Actual reps: integer 1–1000.
- All writes remain parent-owned, revision protected and acknowledged only after IndexedDB commits.
- Existing data with no rest preference opens with rest off.

## Implementation evidence

Implementation and verification are recorded after the components and integration are complete.

### Component delivery

- Implemented `ExerciseSettings`, `WorkoutTargetsEditor` and `RecordedSetsEditor` with shared `WorkoutEditorControls` and scoped `workout-editors.css`.
- Read-only save-error state disables inputs, checkboxes, presets and submission so retry cannot diverge from the pending write. Cancel remains available after error.
- Isolated Chromium component smoke at **320 × 740** passed on 2026-10-19. This used synthetic fixtures, not an end-user study and not the parent transaction integration.
- Verified a single-exercise 90-second rest patch; a two-exercise patch containing only `plannedSets: 5` and `restSeconds: 120`; and a selected-receipt correction containing only its stable ID and `weight: 21`.
- No horizontal overflow and every visible button at least 44 px in both dimensions. Inspected the actual rendered screenshots and corrected a legacy label-style collision discovered in that review.
- Component screenshots: [single editor](design/workout-editing/single-editor-320.png), [bulk targets](design/workout-editing/bulk-targets-320.png), [recorded corrections](design/workout-editing/bulk-recorded-320.png).
- Parent integration tests separately cover storage acknowledgement, write failures/retry, selection scope, history corrections and pending-draft preservation.
