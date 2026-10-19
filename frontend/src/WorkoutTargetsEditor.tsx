import { useState } from "react";
import { DSButton, DSDisclosure } from "./design-system";
import type { PersonalExercise } from "./personalStore";
import {
  WorkingSetsControl,
  RepRangeControl,
  RestDurationControl,
  isWholeNumber,
} from "./WorkoutEditorControls";

export type WorkoutTargetPatch = Pick<
  Partial<PersonalExercise>,
  "plannedSets" | "repMin" | "repMax" | "restSeconds"
>;
type Props = {
  exercises: PersonalExercise[];
  busy: boolean;
  disabled: boolean;
  onSave: (exerciseIds: string[], patch: WorkoutTargetPatch) => void;
  onCancel: () => void;
};
const common = (values: number[]) =>
  values.length && values.every((value) => value === values[0])
    ? String(values[0])
    : "";

export default function WorkoutTargetsEditor({
  exercises,
  busy,
  disabled,
  onSave,
  onCancel,
}: Props) {
  const [selected, setSelected] = useState(() =>
    exercises.map((exercise) => exercise.id),
  );
  const [enabled, setEnabled] = useState({
    sets: false,
    reps: false,
    rest: false,
  });
  const [values, setValues] = useState({
    plannedSets: common(exercises.map((x) => x.plannedSets)),
    repMin: common(exercises.map((x) => x.repMin)),
    repMax: common(exercises.map((x) => x.repMax)),
    restSeconds: common(exercises.map((x) => x.restSeconds ?? 0)),
  });
  const [error, setError] = useState("");
  const selectedExercises = exercises.filter((x) => selected.includes(x.id));
  const count = selectedExercises.length;
  const active = enabled.sets || enabled.reps || enabled.rest;
  const field = (key: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setError("");
  };
  const toggleField = (key: keyof typeof enabled) => {
    setEnabled((previous) => ({ ...previous, [key]: !previous[key] }));
    setError("");
  };
  return (
    <form
      className="nb-workout-editor"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || disabled || !count || !active) return;
        const patch: WorkoutTargetPatch = {};
        if (enabled.sets) {
          if (!isWholeNumber(values.plannedSets, 1, 20)) {
            setError("Choose 1–20 working sets.");
            return;
          }
          patch.plannedSets = Number(values.plannedSets);
        }
        if (enabled.reps) {
          if (
            !isWholeNumber(values.repMin, 1, 100) ||
            !isWholeNumber(values.repMax, Number(values.repMin), 100)
          ) {
            setError(
              "Use a rep range from 1 to 100, with the maximum at least as high as the minimum.",
            );
            return;
          }
          patch.repMin = Number(values.repMin);
          patch.repMax = Number(values.repMax);
        }
        if (enabled.rest) {
          if (!isWholeNumber(values.restSeconds, 0, 3600)) {
            setError(
              "Use whole seconds from 0 to 3600. Use 0 to turn rest off.",
            );
            return;
          }
          patch.restSeconds = Number(values.restSeconds);
        }
        onSave(
          selectedExercises.map((x) => x.id),
          patch,
        );
      }}
    >
      <p className="nb-editor-context">
        Choose what to change. Everything else stays as it is.
      </p>
      <DSDisclosure
        title={`Choose exercises · ${count} selected`}
        className="nb-editor-selection"
      >
        <DSButton
          variant="text"
          disabled={busy || disabled || !exercises.length}
          onClick={() => {
            setSelected(
              count === exercises.length ? [] : exercises.map((x) => x.id),
            );
            setError("");
          }}
        >
          {count === exercises.length
            ? "Clear selection"
            : "Select all exercises"}
        </DSButton>
        <div className="nb-editor-checklist">
          {exercises.map((exercise) => (
            <label className="nb-editor-check-row" key={exercise.id}>
              <input
                type="checkbox"
                aria-label={`Select ${exercise.name}`}
                checked={selected.includes(exercise.id)}
                disabled={busy || disabled}
                onChange={() => {
                  setSelected((previous) =>
                    previous.includes(exercise.id)
                      ? previous.filter((id) => id !== exercise.id)
                      : [...previous, exercise.id],
                  );
                  setError("");
                }}
              />
              <span>
                <strong>{exercise.name}</strong>
                <small>
                  {exercise.plannedSets} sets · {exercise.repMin}–
                  {exercise.repMax} reps ·{" "}
                  {exercise.restSeconds
                    ? `${exercise.restSeconds}s rest`
                    : "Rest off"}
                </small>
              </span>
            </label>
          ))}
        </div>
      </DSDisclosure>
      <section className="nb-editor-field">
        <label className="nb-editor-field-toggle">
          <input
            type="checkbox"
            aria-label="Working sets"
            checked={enabled.sets}
            disabled={busy || disabled}
            onChange={() => toggleField("sets")}
          />
          <span>Working sets</span>
          {!enabled.sets && <small>Keep current</small>}
        </label>
        {enabled.sets && (
          <WorkingSetsControl
            value={values.plannedSets}
            disabled={busy || disabled}
            onChange={(v) => field("plannedSets", v)}
          />
        )}
      </section>
      <section className="nb-editor-field">
        <label className="nb-editor-field-toggle">
          <input
            type="checkbox"
            aria-label="Rep range"
            checked={enabled.reps}
            disabled={busy || disabled}
            onChange={() => toggleField("reps")}
          />
          <span>Rep range</span>
          {!enabled.reps && <small>Keep current</small>}
        </label>
        {enabled.reps && (
          <RepRangeControl
            min={values.repMin}
            max={values.repMax}
            disabled={busy || disabled}
            onMinChange={(v) => field("repMin", v)}
            onMaxChange={(v) => field("repMax", v)}
          />
        )}
      </section>
      <section className="nb-editor-field">
        <label className="nb-editor-field-toggle">
          <input
            type="checkbox"
            aria-label="Rest between sets"
            checked={enabled.rest}
            disabled={busy || disabled}
            onChange={() => toggleField("rest")}
          />
          <span>Rest between sets</span>
          {!enabled.rest && <small>Keep current</small>}
        </label>
        {enabled.rest && (
          <RestDurationControl
            value={values.restSeconds}
            disabled={busy || disabled}
            onChange={(v) => field("restSeconds", v)}
          />
        )}
      </section>
      {selectedExercises.some((x) => x.sets.length > 0) && (
        <p className="nb-editor-hint">
          Recorded sets stay unchanged. These are targets for your workout.
        </p>
      )}
      {!count && (
        <p className="nb-editor-hint">Select at least one exercise.</p>
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
            : `Apply to ${count} ${count === 1 ? "exercise" : "exercises"}`}
        </DSButton>
      </div>
    </form>
  );
}
