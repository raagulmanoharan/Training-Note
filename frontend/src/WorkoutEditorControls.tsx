import { DSButton, DSIconButton, DSInput } from "./design-system";
import { Minus, Plus } from "lucide-react";
import "./workout-editors.css";

export function WorkingSetsControl({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const parsed = value.trim() ? Number(value) : NaN;
  const step = (amount: number) =>
    onChange(
      String(
        Math.min(
          20,
          Math.max(1, Number.isFinite(parsed) ? parsed + amount : 3),
        ),
      ),
    );
  return (
    <div className="nb-editor-stepper">
      <DSIconButton
        label="Fewer working sets"
        icon={<Minus size={18} />}
        disabled={disabled || (Number.isFinite(parsed) && parsed <= 1)}
        onClick={() => step(-1)}
      />
      <DSInput
        aria-label="Working sets target"
        type="number"
        inputMode="numeric"
        min="1"
        max="20"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Sets"
      />
      <DSIconButton
        label="More working sets"
        icon={<Plus size={18} />}
        disabled={disabled || (Number.isFinite(parsed) && parsed >= 20)}
        onClick={() => step(1)}
      />
    </div>
  );
}

export function RepRangeControl({
  min,
  max,
  disabled,
  onMinChange,
  onMaxChange,
}: {
  min: string;
  max: string;
  disabled: boolean;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}) {
  return (
    <div className="nb-editor-range">
      <label>
        Minimum
        <DSInput
          aria-label="Lower rep target"
          type="number"
          inputMode="numeric"
          min="1"
          max="100"
          value={min}
          disabled={disabled}
          onChange={(e) => onMinChange(e.target.value)}
        />
      </label>
      <span aria-hidden="true">–</span>
      <label>
        Maximum
        <DSInput
          aria-label="Upper rep target"
          type="number"
          inputMode="numeric"
          min="1"
          max="100"
          value={max}
          disabled={disabled}
          onChange={(e) => onMaxChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export function RestDurationControl({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="nb-editor-rest">
      <div className="nb-editor-presets" role="group" aria-label="Rest presets">
        {[
          [0, "Off"],
          [60, "60s"],
          [90, "90s"],
          [120, "2m"],
          [180, "3m"],
        ].map(([seconds, label]) => (
          <DSButton
            key={seconds}
            aria-pressed={
              value.trim() !== "" && Number(value) === Number(seconds)
            }
            disabled={disabled}
            onClick={() => onChange(String(seconds))}
          >
            {label}
          </DSButton>
        ))}
      </div>
      <label className="nb-editor-rest-custom">
        Seconds
        <DSInput
          aria-label="Rest duration in seconds"
          type="number"
          inputMode="numeric"
          min="0"
          max="3600"
          step="1"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <p className="nb-editor-hint">
        Starts after you log a set. Off skips the timer.
      </p>
    </div>
  );
}

export function isWholeNumber(value: string, min: number, max: number) {
  const parsed = Number(value);
  return (
    !!value.trim() && Number.isInteger(parsed) && parsed >= min && parsed <= max
  );
}
