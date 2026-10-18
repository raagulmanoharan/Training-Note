import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  Check,
  ChevronDown,
  LoaderCircle,
  Minus,
  Plus,
  Pencil,
  AlertCircle,
} from "lucide-react";
import "./design-system.css";

const cx = (...values: (string | undefined | false)[]) =>
  values.filter(Boolean).join(" ");
export type DSButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "text" | "danger";
  loading?: boolean;
  loadingLabel?: string;
  size?: "regular" | "compact";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};
/** Native button behavior is preserved; loading blocks duplicate actions. */
export const DSButton = forwardRef<HTMLButtonElement, DSButtonProps>(
  function DSButton(
    {
      variant = "secondary",
      loading = false,
      loadingLabel,
      size = "regular",
      startIcon,
      endIcon,
      disabled,
      children,
      className,
      type = "button",
      ...props
    },
    ref,
  ) {
    const pendingLabel = loadingLabel || "Working…";
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={cx(
          "ds-button",
          `ds-button--${variant}`,
          size === "compact" && "ds-button--compact",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={loading ? pendingLabel : props["aria-label"]}
      >
        <span className="ds-button__content">
          <span
            className="ds-button__normal"
            style={{ visibility: loading ? "hidden" : "visible" }}
            aria-hidden={loading || undefined}
          >
            {startIcon}
            {children}
            {endIcon}
          </span>
          {(loadingLabel || loading) && (
            <span
              className="ds-button__loading"
              style={{ visibility: loading ? "visible" : "hidden" }}
              aria-hidden={!loading || undefined}
            >
              <LoaderCircle
                size={17}
                className="ds-spinner"
                aria-hidden="true"
              />
              {pendingLabel}
            </span>
          )}
        </span>
      </button>
    );
  },
);
export type DSIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> & {
  label: string;
  icon: ReactNode;
  pressed?: boolean;
  loading?: boolean;
  variant?: "utility" | "filled";
};
export const DSIconButton = forwardRef<HTMLButtonElement, DSIconButtonProps>(
  function DSIconButton(
    {
      label,
      icon,
      pressed,
      loading = false,
      variant = "utility",
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-label={label}
        title={props.title || label}
        aria-pressed={pressed}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cx(
          "ds-icon-button",
          `ds-icon-button--${variant}`,
          className,
        )}
      >
        {loading ? (
          <LoaderCircle className="ds-spinner" size={18} aria-hidden="true" />
        ) : (
          icon
        )}
      </button>
    );
  },
);
export const DSInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function DSInput({ className, ...props }, ref) {
  return <input {...props} ref={ref} className={cx("ds-input", className)} />;
});
export type DSFormFieldProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
};
export function DSFormField({
  label,
  htmlFor,
  hint,
  error,
  hideLabel = false,
  hintId,
  errorId,
  children,
  className,
  ...props
}: DSFormFieldProps) {
  return (
    <div
      {...props}
      className={cx(
        "ds-field",
        !!error && "ds-field--invalid",
        hideLabel && "ds-field--row",
        className,
      )}
    >
      <label
        className={hideLabel ? "ds-visually-hidden" : "ds-field__label"}
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="ds-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ds-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export type DSFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  fieldClassName?: string;
};
export const DSField = forwardRef<HTMLInputElement, DSFieldProps>(
  function DSField(
    {
      label,
      hint,
      error,
      hideLabel = false,
      id,
      fieldClassName,
      "aria-describedby": describedBy,
      ...input
    },
    ref,
  ) {
    const generated = useId(),
      inputId = id || `ds-field-${generated}`,
      hintId = `${inputId}-hint`,
      errorId = `${inputId}-error`;
    return (
      <DSFormField
        label={label}
        htmlFor={inputId}
        hint={hint}
        error={error}
        hideLabel={hideLabel}
        hintId={hintId}
        errorId={errorId}
        className={fieldClassName}
      >
        <DSInput
          {...input}
          id={inputId}
          ref={ref}
          aria-invalid={!!error || input["aria-invalid"] || undefined}
          aria-describedby={
            [describedBy, hint ? hintId : "", error ? errorId : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
      </DSFormField>
    );
  },
);
export function DSLabel({
  variant = "register",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "register" | "supporting" | "body";
}) {
  return (
    <span
      {...props}
      className={cx("ds-label", `ds-label--${variant}`, className)}
    />
  );
}
export type DSStatusState =
  | "opening"
  | "saving"
  | "saved"
  | "error"
  | "conflict"
  | "offline-ready"
  | "offline-unknown"
  | "backup-needed";
const statusText: Record<DSStatusState, string> = {
  opening: "Opening local notebook",
  saving: "Saving on this device",
  saved: "Saved on this device",
  error: "Not saved",
  conflict: "Newer saved copy in another tab",
  "offline-ready": "Offline app ready",
  "offline-unknown": "Offline app not confirmed",
  "backup-needed": "External backup needed",
};
export function DSStatus({
  state,
  text,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { state: DSStatusState; text?: string }) {
  return (
    <span
      {...props}
      className={cx("ds-status", `ds-status--${state}`, className)}
      role="status"
      aria-live="polite"
    >
      <span className="ds-status__mark" aria-hidden="true">
        {state === "saving" || state === "opening" ? (
          <LoaderCircle size={13} className="ds-spinner" />
        ) : state === "saved" ? (
          <Check size={13} />
        ) : state === "error" || state === "conflict" ? (
          <AlertCircle size={13} />
        ) : null}
      </span>
      {text || statusText[state]}
    </span>
  );
}
export type DSCommitState = "ready" | "disabled" | "saving" | "saved" | "error";
export function DSCommitControl({
  state,
  label,
  onCommit,
  disabled = false,
  className,
}: {
  state: DSCommitState;
  label: string;
  onCommit?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  if (state === "saved")
    return (
      <span
        className={cx("ds-commit", "ds-commit--saved", className)}
        role="img"
        aria-label={label}
      >
        <Check size={20} aria-hidden="true" />
      </span>
    );
  return (
    <button
      type="button"
      className={cx("ds-commit", `ds-commit--${state}`, className)}
      aria-label={label}
      aria-busy={state === "saving" || undefined}
      disabled={disabled || state === "disabled" || state === "saving"}
      onClick={onCommit}
    >
      {state === "saving" ? (
        <LoaderCircle size={18} className="ds-spinner" aria-hidden="true" />
      ) : (
        <Check size={20} aria-hidden="true" />
      )}
    </button>
  );
}
export type DSChoiceProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed"
> & { selected: boolean; description?: ReactNode; icon?: ReactNode };
export function DSChoice({
  selected,
  description,
  icon,
  children,
  className,
  ...props
}: DSChoiceProps) {
  return (
    <button
      {...props}
      type="button"
      className={cx(
        "ds-choice",
        !!icon && "ds-choice--illustrated",
        selected && "ds-choice--selected",
        className,
      )}
      aria-pressed={selected}
    >
      {icon && (
        <span className="ds-choice__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ds-choice__copy">
        <span className="ds-choice__label">{children}</span>
        {description && <small>{description}</small>}
      </span>
      <span className="ds-choice__mark" aria-hidden="true">
        {selected ? <Check size={17} /> : null}
      </span>
    </button>
  );
}
export function DSDivider({ label }: { label?: string }) {
  return (
    <div className="ds-divider" aria-hidden="true">
      {label && <DSLabel>{label}</DSLabel>}
    </div>
  );
}
export function DSBadge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  return (
    <span
      {...props}
      className={cx("ds-badge", `ds-badge--${tone}`, className)}
    />
  );
}
export function DSLoading({ children = "Loading…" }: { children?: ReactNode }) {
  return (
    <div className="ds-loading" role="status">
      <LoaderCircle size={17} className="ds-spinner" aria-hidden="true" />
      {children}
    </div>
  );
}
export type DSSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  variant?: "worksheet" | "utility" | "inset" | "plain";
  children?: ReactNode;
};
export function DSSurface({
  as: Element = "div",
  variant = "plain",
  className,
  ...props
}: DSSurfaceProps) {
  return (
    <Element
      {...props}
      className={cx("ds-surface", `ds-surface--${variant}`, className)}
    />
  );
}
export function DSScreenHeader({
  title,
  description,
  register,
  action,
  status,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  register?: ReactNode;
  action?: ReactNode;
  status?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("ds-screen-header", className)}>
      <div>
        {register && <DSLabel>{register}</DSLabel>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {status}
      </div>
      {action && <div className="ds-screen-header__action">{action}</div>}
    </header>
  );
}
export function DSSectionHeading({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ds-section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export type DSDisclosureProps = Omit<
  HTMLAttributes<HTMLDetailsElement>,
  "title"
> & {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  variant?: "plain" | "inset";
  onToggle?: React.ReactEventHandler<HTMLDetailsElement>;
};
export function DSDisclosure({
  title,
  children,
  className,
  variant = "plain",
  ...props
}: DSDisclosureProps) {
  return (
    <details
      {...props}
      className={cx("ds-disclosure", `ds-disclosure--${variant}`, className)}
    >
      <summary>
        <span>{title}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="ds-disclosure__content">{children}</div>
    </details>
  );
}
export type DSStepperProps = {
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  boundaryHint?: ReactNode;
  error?: string;
  disabled?: boolean;
};
export function DSStepper({
  label,
  value,
  min,
  max,
  onChange,
  onIncrement,
  onDecrement,
  boundaryHint,
  error,
  disabled = false,
}: DSStepperProps) {
  const id = useId(),
    parsed = value.trim() ? Number(value) : NaN;
  return (
    <div className="ds-stepper">
      <label className="ds-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="ds-stepper__controls">
        <DSIconButton
          label={`Fewer ${label.toLowerCase()}`}
          icon={<Minus size={17} />}
          disabled={disabled || (Number.isFinite(parsed) && parsed <= min)}
          onClick={onDecrement}
        />
        <DSInput
          id={id}
          aria-describedby={`${id}-bounds${error ? ` ${id}-error` : ""}`}
          aria-invalid={!!error || undefined}
          value={value}
          inputMode="numeric"
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
        />
        <DSIconButton
          label={`More ${label.toLowerCase()}`}
          icon={<Plus size={17} />}
          disabled={disabled || (Number.isFinite(parsed) && parsed >= max)}
          onClick={onIncrement}
        />
      </div>
      <p id={`${id}-bounds`} className="ds-field__hint">
        {boundaryHint || `${min}–${max} ${label.toLowerCase()}`}
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="ds-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
export type DSSetRowState =
  "future" | "draft" | "saving" | "saved" | "editing" | "error";
export function DSSetGridRow({
  state,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { state: DSSetRowState }) {
  return (
    <div
      {...props}
      data-state={state}
      className={cx("ds-set-grid-row", `ds-set-grid-row--${state}`, className)}
    />
  );
}
export function DSSetColumnLabels({ unit = "kg" }: { unit?: string }) {
  return (
    <div className="ds-set-column-labels" aria-hidden="true">
      <span>Set</span>
      <span>{unit}</span>
      <span>Reps</span>
      <span>Record</span>
    </div>
  );
}
type RowBase = {
  number: number;
  unit: string;
  name: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
};
type EditableRow = {
  weight: string;
  reps: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onCommit: () => void;
  error?: string;
  commitDisabled?: boolean;
  weightLabel?: string;
  repsLabel?: string;
  commitLabel?: string;
  onWeightKeyDown?: InputHTMLAttributes<HTMLInputElement>["onKeyDown"];
  onRepsKeyDown?: InputHTMLAttributes<HTMLInputElement>["onKeyDown"];
  weightRef?: Ref<HTMLInputElement>;
  repsRef?: Ref<HTMLInputElement>;
  onCancel?: () => void;
  onDelete?: () => void;
};
export type DSSetRowProps = RowBase &
  (
    | { state: "future"; targetLabel?: string }
    | {
        state: "saved";
        weight: number | string;
        reps: number | string;
        onEdit: () => void;
        editLabel?: string;
        recordedLabel?: string;
        effort?: ReactNode;
      }
    | ({ state: "draft" | "saving" | "editing" | "error" } & EditableRow)
  );
/** Controlled row. A parent owns validation, state transitions and every write. */
export function DSSetRow(props: DSSetRowProps) {
  const id = useId(),
    base = `${props.name} set ${props.number}`,
    editing = props.state === "editing";
  if (props.state === "future")
    return (
      <DSSetGridRow
        state="future"
        className={props.className}
        data-testid={props["data-testid"]}
        aria-label={`${base}: planned, not recorded`}
      >
        <span className="ds-set-ordinal">{props.number}</span>
        <span className="ds-set-placeholder">—</span>
        <span className="ds-set-placeholder">—</span>
        <span className="ds-set-placeholder" aria-hidden="true">
          —
        </span>
        <span className="ds-visually-hidden">
          {props.targetLabel || "Planned only"}
        </span>
      </DSSetGridRow>
    );
  if (props.state === "saved")
    return (
      <div className="ds-set-record">
        <DSSetGridRow
          state="saved"
          className={props.className}
          data-testid={props["data-testid"]}
          aria-label={`${base}: recorded`}
        >
          <span className="ds-set-ordinal">{props.number}</span>
          <span className="ds-set-value">
            <span className="ds-visually-hidden">Weight </span>
            {props.weight}
            <span className="ds-visually-hidden"> {props.unit}</span>
          </span>
          <span className="ds-set-value">
            <span className="ds-visually-hidden">Reps </span>
            {props.reps}
          </span>
          <DSCommitControl
            state="saved"
            label={props.recordedLabel || `Recorded set ${props.number}`}
          />
        </DSSetGridRow>
        <div className="ds-set-record__actions">
          {props.effort && (
            <span className="ds-supporting">{props.effort}</span>
          )}
          <DSButton
            variant="text"
            size="compact"
            startIcon={<Pencil size={13} aria-hidden="true" />}
            onClick={props.onEdit}
            disabled={props.disabled}
          >
            {props.editLabel || `Edit set ${props.number}`}
          </DSButton>
        </div>
      </div>
    );
  const busy = props.state === "saving";
  return (
    <div className="ds-set-entry" aria-busy={busy || undefined}>
      <DSSetGridRow
        state={props.state}
        className={props.className}
        data-testid={props["data-testid"]}
        aria-label={`${base}: ${busy ? "saving, not yet recorded" : editing ? "correction draft" : "draft, not recorded"}`}
      >
        <span className="ds-set-ordinal ds-entry-ordinal">
          {editing ? "Correct set" : "Set"} {props.number}
        </span>
        <div className="ds-entry-field">
          <span aria-hidden="true" className="ds-entry-label">
            Weight · {props.unit}
          </span>
          <DSField
            hideLabel
            label={
              props.weightLabel ||
              `${editing ? "Edit " : ""}${base} weight (${props.unit})`
            }
            value={props.weight}
            inputMode="decimal"
            maxLength={30}
            disabled={busy || props.disabled}
            ref={props.weightRef}
            onKeyDown={props.onWeightKeyDown}
            aria-invalid={!!props.error || undefined}
            aria-describedby={props.error ? `${id}-error` : undefined}
            onChange={(e) => props.onWeightChange(e.target.value)}
            enterKeyHint="next"
          />
        </div>
        <div className="ds-entry-field">
          <span aria-hidden="true" className="ds-entry-label">
            Reps
          </span>
          <DSField
            hideLabel
            label={props.repsLabel || `${editing ? "Edit " : ""}${base} reps`}
            value={props.reps}
            inputMode="numeric"
            maxLength={30}
            disabled={busy || props.disabled}
            ref={props.repsRef}
            onKeyDown={props.onRepsKeyDown}
            aria-invalid={!!props.error || undefined}
            aria-describedby={props.error ? `${id}-error` : undefined}
            onChange={(e) => props.onRepsChange(e.target.value)}
            enterKeyHint="done"
          />
        </div>
        <DSButton
          className="ds-set-log"
          variant="primary"
          loading={busy}
          loadingLabel={`Saving set ${props.number}…`}
          disabled={props.commitDisabled || props.disabled}
          aria-label={
            props.commitLabel ||
            (editing ? `Save correction for ${base}` : `Log ${base}`)
          }
          onClick={props.onCommit}
          endIcon={<Check size={18} aria-hidden="true" />}
        >
          {editing ? "Save correction" : `Log set ${props.number}`}
        </DSButton>
      </DSSetGridRow>
      {props.error && (
        <p className="ds-field__error" id={`${id}-error`} role="alert">
          {props.error}
        </p>
      )}
      {editing && (
        <div className="ds-actions">
          <DSButton
            variant="text"
            disabled={busy || props.disabled}
            onClick={props.onCancel}
          >
            Cancel correction
          </DSButton>
          {props.onDelete && (
            <DSButton
              variant="danger"
              disabled={busy || props.disabled}
              onClick={props.onDelete}
            >
              Delete set
            </DSButton>
          )}
        </div>
      )}
    </div>
  );
}
export type DSEffortValue = 0 | 1 | 2 | 3 | 4;
const effortOptions: { value: DSEffortValue; label: string }[] = [
  { value: 4, label: "4+ more" },
  { value: 3, label: "3 more" },
  { value: 2, label: "2 more" },
  { value: 1, label: "1 more" },
  { value: 0, label: "No more" },
];
export function DSEffortChoices({
  value,
  onChange,
  onClose,
  loading = false,
  disabled = false,
  error,
  onRetry,
}: {
  value: DSEffortValue | undefined;
  onChange: (value: DSEffortValue | undefined) => void;
  onClose?: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <DSSurface variant="inset" className="ds-effort">
      <DSLabel>Optional set context</DSLabel>
      <h3>How many good-form reps were left?</h3>
      <p>Tap a choice to save only this effort estimate.</p>
      <div
        className="ds-effort__choices"
        role="group"
        aria-label="Good-form reps remaining"
      >
        {effortOptions.map((option) => (
          <DSButton
            key={option.value}
            aria-pressed={value === option.value}
            disabled={loading || disabled}
            className={
              value === option.value ? "ds-effort__choice--selected" : ""
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DSButton>
        ))}
      </div>
      {loading && <DSLoading>Saving effort estimate…</DSLoading>}
      {error && (
        <DSInlineNotice
          tone="error"
          title="Effort estimate not saved"
          actions={
            onRetry ? (
              <DSButton onClick={onRetry}>Retry effort save</DSButton>
            ) : undefined
          }
        >
          {error}
        </DSInlineNotice>
      )}
      <div className="ds-actions">
        {value !== undefined && (
          <DSButton
            variant="text"
            disabled={loading || disabled}
            onClick={() => onChange(undefined)}
          >
            Remove effort
          </DSButton>
        )}
        {onClose && (
          <DSButton variant="text" disabled={loading} onClick={onClose}>
            Close effort
          </DSButton>
        )}
      </div>
      <DSDisclosure title="What is RPE?">
        <p>
          RPE is an approximate effort scale: about 10 minus the good-form reps
          you estimate remained. Four or more left is roughly RPE 6 or less.
          This is your estimate, not a measurement.
        </p>
      </DSDisclosure>
    </DSSurface>
  );
}
export type DSComparisonEvidenceProps = {
  title: ReactNode;
  summary: ReactNode;
  qualification: ReactNode;
  evidence: ReactNode;
  expanded?: boolean;
};
export function DSComparisonEvidence({
  title,
  summary,
  qualification,
  evidence,
  expanded,
}: DSComparisonEvidenceProps) {
  return (
    <section className="ds-comparison">
      <h3>{title}</h3>
      <p className="ds-comparison__summary">{summary}</p>
      <p className="ds-comparison__qualification">{qualification}</p>
      <DSDisclosure title="Inspect comparison evidence" open={expanded}>
        {evidence}
      </DSDisclosure>
    </section>
  );
}
export type DSInlineNoticeProps = {
  tone?: "info" | "warning" | "error" | "success";
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};
export function DSInlineNotice({
  tone = "info",
  title,
  children,
  actions,
  className,
}: DSInlineNoticeProps) {
  return (
    <div
      className={cx("ds-notice", `ds-notice--${tone}`, className)}
      role={tone === "error" ? "alert" : undefined}
    >
      <strong>{title}</strong>
      {children && <div className="ds-notice__body">{children}</div>}
      {actions && <div className="ds-actions">{actions}</div>}
    </div>
  );
}
