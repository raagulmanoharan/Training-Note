import { useState } from "react";
import { DSButton, DSDisclosure, DSInput } from "./design-system";
import type { PersonalExercise } from "./personalStore";
import {
  WorkingSetsControl,
  RepRangeControl,
  RestDurationControl,
  isWholeNumber,
} from "./WorkoutEditorControls";

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
    restSeconds: String(exercise.restSeconds ?? 0),
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
      className="nb-workout-editor nb-exercise-settings"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || disabled) return;
        if (!isWholeNumber(values.plannedSets, 1, 20)) {
          setError("Choose 1–20 working sets.");
          return;
        }
        if (
          !isWholeNumber(values.repMin, 1, 100) ||
          !isWholeNumber(values.repMax, Number(values.repMin), 100)
        ) {
          setError(
            "Use a rep range from 1 to 100, with the maximum at least as high as the minimum.",
          );
          return;
        }
        if (!isWholeNumber(values.restSeconds, 0, 3600)) {
          setError("Use whole seconds from 0 to 3600. Use 0 to turn rest off.");
          return;
        }
        const increment = Number(values.increment);
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
          plannedSets: Number(values.plannedSets),
          repMin: Number(values.repMin),
          repMax: Number(values.repMax),
          restSeconds: Number(values.restSeconds),
          increment,
          gym: values.gym.trim(),
          equipment: values.equipment.trim(),
        });
      }}
    >
      <p className="nb-editor-context">{exercise.name}</p>
      <div className="nb-editor-field">
        <span className="nb-editor-field-title">Working sets</span>
        <WorkingSetsControl
          value={values.plannedSets}
          disabled={busy || disabled}
          onChange={(v) => field("plannedSets", v)}
        />
      </div>
      {exercise.sets.length > Number(values.plannedSets) &&
        values.plannedSets.trim() && (
          <p className="nb-editor-hint">
            {exercise.sets.length} sets are already recorded. All stay in your
            history.
          </p>
        )}
      <div className="nb-editor-field">
        <span className="nb-editor-field-title">Rep range</span>
        <RepRangeControl
          min={values.repMin}
          max={values.repMax}
          disabled={busy || disabled}
          onMinChange={(v) => field("repMin", v)}
          onMaxChange={(v) => field("repMax", v)}
        />
      </div>
      <div className="nb-editor-field">
        <span className="nb-editor-field-title">Rest between sets</span>
        <RestDurationControl
          value={values.restSeconds}
          disabled={busy || disabled}
          onChange={(v) => field("restSeconds", v)}
        />
      </div>
      <DSDisclosure title="Equipment & setup" className="nb-editor-advanced">
        <label>
          Gym / setup label
          <DSInput
            value={values.gym}
            maxLength={120}
            placeholder="My gym"
            disabled={busy || disabled}
            onChange={(event) => field("gym", event.target.value)}
          />
        </label>
        <label>
          Equipment label
          <DSInput
            value={values.equipment}
            maxLength={120}
            disabled={busy || disabled}
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
            disabled={busy || disabled}
            onChange={(event) => field("increment", event.target.value)}
          />
        </label>
        <p className="nb-editor-hint">
          Progress compares the same exercise, gym, equipment and unit. Use the
          same weight convention each visit.
        </p>
        {exercise.sets.length > 0 && (
          <p className="nb-editor-hint">
            Setup labels also apply to the sets already logged in this exercise.
          </p>
        )}
      </DSDisclosure>
      {error && (
        <p className="nb-field-error" role="alert">
          {error}
        </p>
      )}
      <div className="nb-editor-footer">
        <DSButton variant="secondary" disabled={busy} onClick={onCancel}>
          Cancel
        </DSButton>
        <DSButton variant="primary" type="submit" disabled={busy || disabled}>
          {busy ? "Saving…" : "Save changes"}
        </DSButton>
      </div>
    </form>
  );
}
