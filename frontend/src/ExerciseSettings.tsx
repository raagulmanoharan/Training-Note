import { useState } from "react";
import { DSButton, DSInput } from "./design-system";
import type { PersonalExercise } from "./personalStore";

type Props = {
  exercise: PersonalExercise;
  busy: boolean;
  disabled: boolean;
  onSave: (patch: Partial<PersonalExercise>) => void;
  onCancel: () => void;
};

export default function ExerciseSettings({
  exercise,
  busy,
  disabled,
  onSave,
  onCancel,
}: Props) {
  const [values, setValues] = useState({
    plannedSets: String(exercise.plannedSets),
    repMin: String(exercise.repMin),
    repMax: String(exercise.repMax),
    increment: String(exercise.increment),
    gym: exercise.gym,
    equipment: exercise.equipment,
  });
  const [error, setError] = useState("");
  const field = (key: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setError("");
  };
  return (
    <form
      className="nb-exercise-settings"
      onSubmit={(event) => {
        event.preventDefault();
        const plannedSets = Number(values.plannedSets),
          repMin = Number(values.repMin),
          repMax = Number(values.repMax),
          increment = Number(values.increment);
        if (
          !values.plannedSets.trim() ||
          !Number.isInteger(plannedSets) ||
          plannedSets < 1 ||
          plannedSets > 20
        ) {
          setError("Choose 1–20 working sets.");
          return;
        }
        if (
          !values.repMin.trim() ||
          !values.repMax.trim() ||
          !Number.isInteger(repMin) ||
          !Number.isInteger(repMax) ||
          repMin < 1 ||
          repMax < repMin ||
          repMax > 100
        ) {
          setError(
            "Use a rep range from 1 to 100, with the upper target at least as high as the lower target.",
          );
          return;
        }
        if (
          !values.increment.trim() ||
          !Number.isFinite(increment) ||
          increment < 0.1 ||
          increment > 50
        ) {
          setError("Use a weight increment from 0.1 to 50.");
          return;
        }
        if (!values.equipment.trim()) {
          setError("Add an equipment label so future visits can be compared.");
          return;
        }
        onSave({
          plannedSets,
          repMin,
          repMax,
          increment,
          gym: values.gym.trim(),
          equipment: values.equipment.trim(),
        });
      }}
    >
      <p className="personal-muted nb-sheet-context">{exercise.name}</p>
      <div className="personal-grid nb-target-fields">
        <label>
          Working sets
          <DSInput
            aria-label="Working sets target"
            type="number"
            inputMode="numeric"
            min="1"
            max="20"
            value={values.plannedSets}
            disabled={busy}
            onChange={(event) => field("plannedSets", event.target.value)}
          />
        </label>
        <label>
          Min reps
          <DSInput
            aria-label="Lower rep target"
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            value={values.repMin}
            disabled={busy}
            onChange={(event) => field("repMin", event.target.value)}
          />
        </label>
        <label>
          Max reps
          <DSInput
            aria-label="Upper rep target"
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            value={values.repMax}
            disabled={busy}
            onChange={(event) => field("repMax", event.target.value)}
          />
        </label>
      </div>
      <label>
        Gym / setup label
        <DSInput
          value={values.gym}
          maxLength={120}
          placeholder="My gym"
          disabled={busy}
          onChange={(event) => field("gym", event.target.value)}
        />
      </label>
      <label>
        Equipment label
        <DSInput
          value={values.equipment}
          maxLength={120}
          disabled={busy}
          onChange={(event) => field("equipment", event.target.value)}
        />
      </label>
      <label>
        Available weight increment ({exercise.unit})
        <DSInput
          aria-label={`Available weight increment (${exercise.unit})`}
          type="number"
          inputMode="decimal"
          min="0.1"
          max="50"
          step="0.1"
          value={values.increment}
          disabled={busy}
          onChange={(event) => field("increment", event.target.value)}
        />
      </label>
      <p className="personal-muted">
        Progress compares the same exercise, gym, equipment and unit. Use the
        same weight convention each visit.
      </p>
      {exercise.sets.length > 0 && (
        <p className="personal-muted">
          Setup labels also apply to the sets already logged in this exercise.
        </p>
      )}
      {error && (
        <p className="nb-field-error" role="alert">
          {error}
        </p>
      )}
      <div className="nb-confirm-actions">
        <DSButton
          variant="secondary"
          type="button"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </DSButton>
        <DSButton variant="primary" type="submit" disabled={busy || disabled}>
          {busy ? "Saving…" : "Save changes"}
        </DSButton>
      </div>
    </form>
  );
}
