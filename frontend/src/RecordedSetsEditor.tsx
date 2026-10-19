import { useState } from "react";
import { DSButton, DSInput } from "./design-system";
import type { PersonalExercise, PersonalSet } from "./personalStore";
import { isWholeNumber } from "./WorkoutEditorControls";
import "./workout-editors.css";

export type RecordedSetPatch = Pick<Partial<PersonalSet>, "weight" | "reps">;
type Props = {
  exercise: PersonalExercise;
  busy: boolean;
  disabled: boolean;
  onSave: (setIds: string[], patch: RecordedSetPatch) => void;
  onCancel: () => void;
};
const common = (values: number[]) =>
  values.length && values.every((value) => value === values[0])
    ? String(values[0])
    : "";

export default function RecordedSetsEditor({
  exercise,
  busy,
  disabled,
  onSave,
  onCancel,
}: Props) {
  const [selected, setSelected] = useState(() =>
    exercise.sets.map((set) => set.id),
  );
  const [enabled, setEnabled] = useState({ weight: false, reps: false });
  const [values, setValues] = useState({
    weight: common(exercise.sets.map((set) => set.weight)),
    reps: common(exercise.sets.map((set) => set.reps)),
  });
  const [error, setError] = useState("");
  const selectedSets = exercise.sets.filter((set) => selected.includes(set.id));
  const count = selectedSets.length;
  const active = enabled.weight || enabled.reps;
  return (
    <form
      className="nb-workout-editor"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || disabled || !count || !active) return;
        const patch: RecordedSetPatch = {};
        if (enabled.weight) {
          const weight = Number(values.weight);
          if (
            !values.weight.trim() ||
            !Number.isFinite(weight) ||
            weight < 0 ||
            weight > 2000
          ) {
            setError("Use a weight from 0 to 2000. Use 0 for bodyweight.");
            return;
          }
          patch.weight = weight;
        }
        if (enabled.reps) {
          if (!isWholeNumber(values.reps, 1, 1000)) {
            setError("Use whole reps from 1 to 1000.");
            return;
          }
          patch.reps = Number(values.reps);
        }
        onSave(
          selectedSets.map((set) => set.id),
          patch,
        );
      }}
    >
      <p className="nb-editor-context">{exercise.name}</p>
      <div className="nb-editor-selection-heading">
        <span>
          {count} of {exercise.sets.length} sets selected
        </span>
        <DSButton
          variant="text"
          disabled={busy || disabled || !exercise.sets.length}
          onClick={() =>
            setSelected(
              count === exercise.sets.length
                ? []
                : exercise.sets.map((set) => set.id),
            )
          }
        >
          {count === exercise.sets.length
            ? "Clear selection"
            : "Select all sets"}
        </DSButton>
      </div>
      <div
        className="nb-editor-checklist"
        role="group"
        aria-label="Recorded sets to correct"
      >
        {exercise.sets.map((set, index) => (
          <label
            className="nb-editor-check-row nb-editor-actual-row"
            key={set.id}
          >
            <input
              type="checkbox"
              aria-label={`Select recorded set ${index + 1}`}
              checked={selected.includes(set.id)}
              disabled={busy || disabled}
              onChange={() => {
                setSelected((previous) =>
                  previous.includes(set.id)
                    ? previous.filter((id) => id !== set.id)
                    : [...previous, set.id],
                );
                setError("");
              }}
            />
            <span>Set {index + 1}</span>
            <strong>
              {set.weight} {exercise.unit} × {set.reps}
            </strong>
          </label>
        ))}
      </div>
      <p className="nb-editor-hint">
        Choose the values to correct. Other values stay as recorded.
      </p>
      <section className="nb-editor-field">
        <label className="nb-editor-field-toggle">
          <input
            type="checkbox"
            aria-label="Weight"
            checked={enabled.weight}
            disabled={busy || disabled}
            onChange={() => {
              setEnabled((previous) => ({
                ...previous,
                weight: !previous.weight,
              }));
              setError("");
            }}
          />
          <span>Weight</span>
          {!enabled.weight && <small>Keep current</small>}
        </label>
        {enabled.weight && (
          <label>
            Weight ({exercise.unit})
            <DSInput
              aria-label={`Weight for selected sets (${exercise.unit})`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="any"
              value={values.weight}
              disabled={busy || disabled}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  weight: event.target.value,
                }));
                setError("");
              }}
            />
          </label>
        )}
      </section>
      <section className="nb-editor-field">
        <label className="nb-editor-field-toggle">
          <input
            type="checkbox"
            aria-label="Reps"
            checked={enabled.reps}
            disabled={busy || disabled}
            onChange={() => {
              setEnabled((previous) => ({ ...previous, reps: !previous.reps }));
              setError("");
            }}
          />
          <span>Reps</span>
          {!enabled.reps && <small>Keep current</small>}
        </label>
        {enabled.reps && (
          <label>
            Reps per set
            <DSInput
              aria-label="Reps for selected sets"
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={values.reps}
              disabled={busy || disabled}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  reps: event.target.value,
                }));
                setError("");
              }}
            />
          </label>
        )}
      </section>
      {!count && (
        <p className="nb-editor-hint">Select at least one recorded set.</p>
      )}
      {error && (
        <p className="nb-field-error" role="alert">
          {error}
        </p>
      )}
      <div className="nb-editor-footer">
        <DSButton variant="secondary" disabled={busy} onClick={onCancel}>
          Cancel
        </DSButton>
        <DSButton
          variant="primary"
          type="submit"
          disabled={busy || disabled || !count || !active}
        >
          {busy
            ? "Saving…"
            : `Correct ${count} ${count === 1 ? "set" : "sets"}`}
        </DSButton>
      </div>
    </form>
  );
}
