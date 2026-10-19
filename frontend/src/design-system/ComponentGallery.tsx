import { useEffect, useRef, useState } from "react";
import MuscleGlyph from "../MuscleGlyph";
import { ArrowRight, ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
import {
  DSBadge,
  DSButton,
  DSChoice,
  DSComparisonEvidence,
  DSDisclosure,
  DSEffortChoices,
  DSField,
  DSIconButton,
  DSInlineNotice,
  DSLabel,
  DSLoading,
  DSScreenHeader,
  DSSectionHeading,
  DSSetColumnLabels,
  DSSetRow,
  DSStatus,
  DSStepper,
  DSSurface,
  type DSEffortValue,
  type DSSetRowState,
} from "./components";

/** Isolated design fixtures. No production state, database or storage imports. */
export default function ComponentGallery() {
  const [clicks, setClicks] = useState(0),
    [weight, setWeight] = useState("42.5"),
    [reps, setReps] = useState("10"),
    [phase, setPhase] = useState<DSSetRowState>("draft"),
    [rowError, setRowError] = useState(""),
    [record, setRecord] = useState({ weight: "42.5", reps: "10" }),
    [deleted, setDeleted] = useState(false);
  const [choice, setChoice] = useState<string[]>(["Chest"]),
    [count, setCount] = useState("4"),
    [field, setField] = useState(""),
    [badReps, setBadReps] = useState("eight");
  const [firstEditing, setFirstEditing] = useState(false),
    [firstDeleted, setFirstDeleted] = useState(false),
    [firstDraft, setFirstDraft] = useState({ weight: "40", reps: "10" }),
    [firstRecord, setFirstRecord] = useState({ weight: "40", reps: "10" });
  const [optionsSet, setOptionsSet] = useState<1 | 2 | null>(null);
  const optionsRef = useRef<HTMLDialogElement>(null);
  const optionsTrigger = useRef<HTMLElement | null>(null);
  const firstWeightRef = useRef<HTMLInputElement>(null);
  const secondWeightRef = useRef<HTMLInputElement>(null);
  const firstUndoRef = useRef<HTMLButtonElement>(null);
  const secondUndoRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = optionsRef.current;
    if (!optionsSet || !dialog) return;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>("h2")?.focus();
  }, [optionsSet]);
  function openOptions(number: 1 | 2) {
    optionsTrigger.current = document.activeElement as HTMLElement | null;
    setOptionsSet(number);
  }
  function closeOptions(focusTarget?: () => HTMLElement | null) {
    const trigger = optionsTrigger.current;
    optionsRef.current?.close();
    setOptionsSet(null);
    requestAnimationFrame(() => {
      const target = focusTarget ? focusTarget() : trigger;
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  }
  function editFixtureSet(number: 1 | 2) {
    if (number === 1) {
      setFirstDraft(firstRecord);
      setFirstEditing(true);
    } else {
      setWeight(record.weight);
      setReps(record.reps);
      setPhase("editing");
    }
    closeOptions(() =>
      number === 1 ? firstWeightRef.current : secondWeightRef.current,
    );
  }
  function deleteFixtureSet(number: 1 | 2) {
    if (number === 1) setFirstDeleted(true);
    else {
      setDeleted(true);
      setRowError("");
    }
    closeOptions(() =>
      number === 1 ? firstUndoRef.current : secondUndoRef.current,
    );
  }
  const [effort, setEffort] = useState<DSEffortValue | undefined>(),
    [effortPending, setEffortPending] = useState(false),
    [effortMessage, setEffortMessage] = useState(
      "No estimate in this fixture.",
    ),
    [effortOpen, setEffortOpen] = useState(true),
    [effortError, setEffortError] = useState("");
  const [importPhase, setImportPhase] = useState<
      "empty" | "preview" | "saving" | "success" | "error"
    >("empty"),
    [backupName, setBackupName] = useState(""),
    [recovery, setRecovery] = useState("blocked"),
    [swap, setSwap] = useState(""),
    [finish, setFinish] = useState(false);
  function validate() {
    if (
      !weight.trim() ||
      !reps.trim() ||
      !Number.isFinite(Number(weight)) ||
      Number(weight) < 0 ||
      !Number.isInteger(Number(reps)) ||
      Number(reps) < 1
    ) {
      setRowError("Enter a nonnegative weight and positive whole reps.");
      setPhase("error");
      return false;
    }
    return true;
  }
  function beginCommit() {
    if (!validate()) return;
    setRowError("");
    setPhase("saving");
  }
  function resetRow() {
    setWeight("42.5");
    setReps("10");
    setPhase("draft");
    setRowError("");
    setDeleted(false);
  }
  const countValid =
    count.trim() &&
    Number.isInteger(Number(count)) &&
    Number(count) >= 2 &&
    Number(count) <= 6;
  return (
    <div className="ds-gallery ds-theme" data-testid="ds-component-gallery">
      <DSInlineNotice title="Illustrative component sandbox" tone="info">
        Every value below is a fixture. Simulated saving never opens or writes
        your gym notebook database. These are reusable controls and states, not
        a workout or personalized advice.
      </DSInlineNotice>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-direction-heading"
      >
        <DSSectionHeading
          title={
            <span id="ds-direction-heading">Training ledger foundations</span>
          }
          description="Warm chalk, ink-green charcoal, measured spacing and ruled records. The record—not a decorative dashboard—is the hero."
        />
        <div className="ds-gallery__tokens">
          {[
            { label: "Canvas", value: "#141713" },
            { label: "Worksheet", value: "#1C211B" },
            { label: "Editable", value: "#272E25" },
            { label: "Ink", value: "#F1EEE3" },
            { label: "Committed", value: "#ADD2B3" },
            { label: "Qualification", value: "#DFC17A" },
          ].map((t) => (
            <div
              className="ds-gallery__token"
              key={t.label}
              style={{
                background: t.value,
                color:
                  t.label === "Ink" ||
                  t.label === "Committed" ||
                  t.label === "Qualification"
                    ? "#141713"
                    : "#F1EEE3",
              }}
            >
              <strong>{t.label}</strong>
              <DSLabel variant="body">{t.value}</DSLabel>
            </div>
          ))}
        </div>
        <p className="ds-gallery__trace">
          Foundations → all F01–F10 · Body 15/23 · Record 22/28 · Index 11/16 ·
          Minimum action 44 × 44
        </p>
        <p>
          Text contrast at specified token pairs is at least 4.5:1 for enabled
          text; control borders are distinct from decorative rules. Actual
          rendered states still require inspection.
        </p>
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-actions-heading"
      >
        <DSSectionHeading
          title={
            <span id="ds-actions-heading">Actions and transaction truth</span>
          }
          description="A primary action asks for intent. A recorded marker reports an acknowledged outcome."
        />
        <p className="ds-gallery__trace">A01/A02/A05/A11 → C01/C08 → F01–F10</p>
        <div className="ds-gallery__inline">
          <DSButton
            variant="primary"
            onClick={() => setClicks((n) => n + 1)}
            endIcon={<ArrowRight size={16} aria-hidden="true" />}
          >
            Primary example
          </DSButton>
          <DSButton onClick={() => setClicks((n) => n + 1)}>
            Secondary example
          </DSButton>
          <DSButton variant="text" onClick={() => setClicks((n) => n + 1)}>
            Text example
          </DSButton>
          <DSButton variant="danger" onClick={() => setClicks((n) => n + 1)}>
            Danger example
          </DSButton>
          <DSButton disabled onClick={() => setClicks((n) => n + 1)}>
            Disabled example
          </DSButton>
          <DSButton
            loading
            loadingLabel="Saving sample action"
            onClick={() => setClicks((n) => n + 1)}
          >
            Sample action
          </DSButton>
          <DSIconButton
            label="Example swap action"
            icon={<ArrowLeftRight size={18} />}
            onClick={() => setClicks((n) => n + 1)}
          />
        </div>
        <p role="status">Illustrative action count: {clicks}</p>
        <div className="ds-gallery__grid">
          <div className="ds-gallery__stack">
            <DSStatus state="opening" />
            <DSStatus state="saving" />
            <DSStatus
              state="saved"
              text="Fixture state: saved on this device"
            />
            <DSStatus state="error" />
            <DSStatus state="conflict" />
          </div>
          <div className="ds-gallery__stack">
            <DSStatus state="offline-ready" text="Fixture: offline app ready" />
            <DSStatus state="offline-unknown" />
            <DSStatus state="backup-needed" />
            <DSBadge tone="neutral">Partial</DSBadge>
            <DSBadge tone="warning">Effort not compared</DSBadge>
            <DSBadge tone="positive">More recorded reps</DSBadge>
            <DSLoading>Example operation pending</DSLoading>
          </div>
        </div>
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-fields-heading"
      >
        <DSSectionHeading
          title={<span id="ds-fields-heading">Fields, choices and bounds</span>}
          description="Strings stay editable while typing; useful labels, units and local reasons remain attached."
        />
        <p className="ds-gallery__trace">
          A03/A07 + M03/M04 → C02/C03/C08 → F02/F03
        </p>
        <div className="ds-gallery__grid">
          <div className="ds-gallery__stack">
            <DSField
              label="Example weight (kg)"
              value={field}
              onChange={(e) => setField(e.target.value)}
              inputMode="decimal"
              hint="Use 0 for no added load. This field is a fixture."
            />
            <DSField
              label="Invalid reps example"
              value={badReps}
              onChange={(e) => setBadReps(e.target.value)}
              inputMode="numeric"
              error={
                !/^\d+$/.test(badReps) || Number(badReps) < 1
                  ? "Use positive whole reps."
                  : undefined
              }
              data-testid="ds-demo-field-error"
            />
            <DSField
              label="Disabled field example"
              value="Read only while saving"
              disabled
            />
          </div>
          <div className="ds-gallery__stack">
            <div
              className="ds-gallery__choices"
              role="group"
              aria-label="Example muscle selection"
              data-testid="ds-demo-choice"
            >
              {["Chest", "Back", "Shoulders", "Legs"].map((name) => (
                <DSChoice
                  key={name}
                  icon={
                    <MuscleGlyph
                      group={
                        name.toLowerCase() as
                          "chest" | "back" | "shoulders" | "legs"
                      }
                      selected={choice.includes(name)}
                    />
                  }
                  selected={choice.includes(name)}
                  onClick={() =>
                    setChoice((s) =>
                      s.includes(name)
                        ? s.filter((n) => n !== name)
                        : [...s, name],
                    )
                  }
                >
                  {name}
                </DSChoice>
              ))}
            </div>
            <p className="ds-supporting">
              Selection intent only:{" "}
              {choice.length ? choice.join(" + ") : "No muscles selected"}.
            </p>
            <DSStepper
              label="Exercises"
              value={count}
              min={2}
              max={6}
              onChange={setCount}
              onIncrement={() =>
                setCount(String(Math.min(6, (Number(count) || 2) + 1)))
              }
              onDecrement={() =>
                setCount(String(Math.max(2, (Number(count) || 2) - 1)))
              }
              error={!countValid ? "Choose 2–6 exercises." : undefined}
              boundaryHint="2–6 distinct primary targets available in this example."
            />
          </div>
        </div>
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-ledger-heading"
      >
        <DSSectionHeading
          title={<span id="ds-ledger-heading">One row, honest states</span>}
          description="Edit the fixture, request saving, then choose the simulated result. No timeout pretends a write happened."
        />
        <p className="ds-gallery__trace">
          A03/A06 + M07/M08 → C05/C08 → F03/F04/F06
        </p>
        <div className="ds-gallery__grid">
          <DSSurface variant="worksheet">
            <DSScreenHeader
              title="Bench press"
              register="Controlled set fixture"
              description="Barbell · kg · Enter actuals, then deliberately record."
            />
            <DSSetColumnLabels unit="kg" />
            {firstDeleted ? (
              <DSInlineNotice
                title="Fixture set 1 removed"
                actions={
                  <DSButton
                    ref={firstUndoRef}
                    onClick={() => setFirstDeleted(false)}
                  >
                    Undo example set 1 deletion
                  </DSButton>
                }
              >
                Undo restores the fixture values; no real record changed.
              </DSInlineNotice>
            ) : firstEditing ? (
              <DSSetRow
                state="editing"
                number={1}
                name="Example bench press"
                unit="kg"
                weight={firstDraft.weight}
                weightRef={firstWeightRef}
                reps={firstDraft.reps}
                onWeightChange={(v) =>
                  setFirstDraft((d) => ({ ...d, weight: v }))
                }
                onRepsChange={(v) => setFirstDraft((d) => ({ ...d, reps: v }))}
                onCommit={() => {
                  if (
                    firstDraft.weight.trim() &&
                    firstDraft.reps.trim() &&
                    Number.isFinite(Number(firstDraft.weight)) &&
                    Number(firstDraft.weight) >= 0 &&
                    Number.isInteger(Number(firstDraft.reps)) &&
                    Number(firstDraft.reps) > 0
                  ) {
                    setFirstRecord(firstDraft);
                    setFirstEditing(false);
                  }
                }}
                onCancel={() => setFirstEditing(false)}
              />
            ) : (
              <DSSetRow
                state="saved"
                number={1}
                name="Example bench press"
                unit="kg"
                weight={firstRecord.weight}
                reps={firstRecord.reps}
                onOptions={() => openOptions(1)}
              />
            )}
            {deleted ? (
              <DSInlineNotice
                title="Fixture set removed"
                actions={
                  <DSButton
                    ref={secondUndoRef}
                    onClick={() => {
                      setDeleted(false);
                      setPhase("saved");
                    }}
                  >
                    Undo example deletion
                  </DSButton>
                }
              >
                Undo restores the fixture values; no real record changed.
              </DSInlineNotice>
            ) : phase === "saved" ? (
              <DSSetRow
                state="saved"
                number={2}
                unit="kg"
                name="Example bench press"
                weight={record.weight}
                reps={record.reps}
                onOptions={() => openOptions(2)}
                data-testid="ds-demo-row"
              />
            ) : (
              <DSSetRow
                state={phase === "future" ? "draft" : phase}
                number={2}
                unit="kg"
                name="Example bench press"
                weight={weight}
                weightRef={secondWeightRef}
                reps={reps}
                onWeightChange={setWeight}
                onRepsChange={setReps}
                onCommit={beginCommit}
                error={rowError || undefined}
                onCancel={() => {
                  setWeight(record.weight);
                  setReps(record.reps);
                  setRowError("");
                  setPhase("saved");
                }}
                onDelete={() => {
                  setDeleted(true);
                  setRowError("");
                }}
                data-testid="ds-demo-row"
              />
            )}
            <DSSetRow
              state="future"
              number={3}
              name="Example bench press"
              unit="kg"
              targetLabel="Planned only; not recorded"
            />
            {optionsSet && (
              <dialog
                ref={optionsRef}
                className="nb-action-sheet ds-theme"
                aria-label={`Set ${optionsSet} options`}
                onCancel={(event) => {
                  event.preventDefault();
                  closeOptions();
                }}
              >
                <div className="nb-action-sheet-header">
                  <h2 tabIndex={-1}>Set {optionsSet} options</h2>
                  <DSButton variant="text" onClick={() => closeOptions()}>
                    Close
                  </DSButton>
                </div>
                <div className="nb-menu-list">
                  <DSButton
                    variant="text"
                    startIcon={<Pencil size={18} aria-hidden="true" />}
                    aria-label={`Edit set ${optionsSet}`}
                    onClick={() => editFixtureSet(optionsSet)}
                  >
                    Edit
                  </DSButton>
                  <DSButton
                    variant="danger"
                    startIcon={<Trash2 size={18} aria-hidden="true" />}
                    aria-label={`Delete set ${optionsSet}`}
                    onClick={() => deleteFixtureSet(optionsSet)}
                  >
                    Delete
                  </DSButton>
                </div>
              </dialog>
            )}
            <div className="ds-actions">
              {phase === "saving" && (
                <>
                  <DSButton
                    variant="primary"
                    onClick={() => {
                      setRecord({ weight, reps });
                      setPhase("saved");
                    }}
                  >
                    Commit succeeds
                  </DSButton>
                  <DSButton
                    variant="danger"
                    onClick={() => {
                      setPhase("error");
                      setRowError(
                        "Simulated storage failure. Entered values are retained and are not recorded.",
                      );
                    }}
                  >
                    Commit fails
                  </DSButton>
                </>
              )}
              {phase === "error" && (
                <DSButton onClick={beginCommit}>Retry example save</DSButton>
              )}
              <DSButton variant="text" onClick={resetRow}>
                Reset row fixture
              </DSButton>
            </div>
            <p className="ds-supporting" role="status">
              Fixture state: {deleted ? "removed" : phase}. Nothing in this
              example is persisted.
            </p>
          </DSSurface>
          <div className="ds-gallery__stack">
            <DSSurface variant="worksheet">
              <h3>Literal pending state</h3>
              <p className="ds-supporting">
                The same proposal stays visible. No receipt appears before a
                result.
              </p>
              <DSSetColumnLabels />
              <DSSetRow
                state="saving"
                number={4}
                name="Pending example"
                unit="kg"
                weight="45"
                reps="8"
                onWeightChange={() => undefined}
                onRepsChange={() => undefined}
                onCommit={() => undefined}
                data-testid="ds-demo-saving"
              />
            </DSSurface>
            <DSSurface variant="worksheet">
              <h3>Literal correction state</h3>
              <p className="ds-supporting">
                Read-only anatomy specimen. Open a recorded set’s options and
                choose Edit in the interactive worksheet to try a correction.
              </p>
              <DSSetRow
                state="editing"
                number={1}
                name="Correction example"
                unit="kg"
                disabled
                weight="40"
                reps="10"
                onWeightChange={() => undefined}
                onRepsChange={() => undefined}
                onCommit={() => undefined}
                onCancel={() => undefined}
                onDelete={() => undefined}
              />
            </DSSurface>
          </div>
        </div>
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-effort-heading"
      >
        <DSSectionHeading
          title={
            <span id="ds-effort-heading">Secondary context stays optional</span>
          }
          description="Disclosure and separate metadata actions keep the essential logging row uncluttered."
        />
        <p className="ds-gallery__trace">M09/M10/M17 → C06/C09 → F05/F07</p>
        <div className="ds-gallery__grid">
          <div className="ds-gallery__stack">
            {effortOpen ? (
              <DSEffortChoices
                value={effort}
                loading={effortPending}
                error={effortError || undefined}
                onChange={(value) => {
                  setEffort(value);
                  setEffortPending(true);
                  setEffortError("");
                }}
                onClose={() => setEffortOpen(false)}
                onRetry={() => {
                  setEffortPending(true);
                  setEffortError("");
                }}
              />
            ) : (
              <DSButton onClick={() => setEffortOpen(true)}>
                Open optional effort fixture
              </DSButton>
            )}
            {effortPending && (
              <div className="ds-actions">
                <DSButton
                  onClick={() => {
                    setEffortPending(false);
                    setEffortMessage(
                      effort === undefined
                        ? "Fixture effort removed."
                        : `Fixture selected: ${effort === 4 ? "4+" : effort} good-form reps remaining.`,
                    );
                  }}
                >
                  Effort commit succeeds
                </DSButton>
                <DSButton
                  variant="danger"
                  onClick={() => {
                    setEffortPending(false);
                    setEffortError(
                      "Simulated metadata write failed; the proposed choice remains visible.",
                    );
                  }}
                >
                  Effort commit fails
                </DSButton>
              </div>
            )}
            <p className="ds-supporting" role="status">
              {effortMessage}
            </p>
          </div>
          <div className="ds-gallery__stack">
            <DSDisclosure
              title="Example movement alternatives"
              data-testid="ds-demo-disclosure"
            >
              <p>
                One of three sets was recorded on the original machine. A
                replacement keeps its own name and the two remaining planned
                sets.
              </p>
              <div className="ds-actions">
                <DSButton onClick={() => setSwap("Dumbbell press")}>
                  Choose dumbbell press
                </DSButton>
                <DSButton variant="text" onClick={() => setSwap("")}>
                  Cancel example swap
                </DSButton>
              </div>
              {swap && (
                <p role="status">
                  Fixture replacement: {swap}. Original actuals retain the
                  original equipment.
                </p>
              )}
            </DSDisclosure>
            <DSSurface variant="inset">
              <h3>Conditional completion</h3>
              <p>Fixture: 4 actual sets plus one unlogged pair.</p>
              <DSButton onClick={() => setFinish(true)}>
                Open finish fixture
              </DSButton>
              {finish && (
                <DSInlineNotice
                  tone="warning"
                  title="Unlogged values remain"
                  actions={
                    <>
                      <DSButton onClick={() => setFinish(false)}>
                        Save without unlogged input
                      </DSButton>
                      <DSButton variant="text" onClick={() => setFinish(false)}>
                        Keep logging
                      </DSButton>
                    </>
                  }
                >
                  Finishing a partial session is valid. The proposal above is
                  not an actual.
                </DSInlineNotice>
              )}
            </DSSurface>
          </div>
        </div>
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-evidence-heading"
      >
        <DSSectionHeading
          title={
            <span id="ds-evidence-heading">Evidence before reassurance</span>
          }
          description="The qualifier is visible beside the summary. Actual dates, setup and ordered sets are inspectable."
        />
        <p className="ds-gallery__trace">M12 → C10 → F09</p>
        <DSComparisonEvidence
          title="Chest — illustrative comparison"
          summary="1 of 2 eligible exercise/setup comparisons increased numerically"
          qualification="Effort not compared for one movement. This is recorded performance, not a muscle-growth measurement."
          evidence={
            <div className="ds-gallery__evidence">
              <div>
                <DSLabel>Prior · 11 Oct · same gym / barbell / kg</DSLabel>
                <p>Bench press: 40 kg × 10 / 10 / 8</p>
              </div>
              <div>
                <DSLabel>Latest · 17 Oct · same gym / barbell / kg</DSLabel>
                <p>Bench press: 40 kg × 10 / 10 / 10</p>
              </div>
              <p>
                Two additional recorded reps across these three sets at the same
                load. Effort estimates were absent; technique and range of
                motion were not measured.
              </p>
              <p>
                The second eligible movement was unchanged. A changed-machine
                occurrence is excluded from this exact-setup comparison.
              </p>
            </div>
          }
        />
      </section>
      <section
        className="ds-gallery__section"
        aria-labelledby="ds-recovery-heading"
      >
        <DSSectionHeading
          title={<span id="ds-recovery-heading">Recovery and protection</span>}
          description="Failure stays actionable; a local save, an offline shell and an external file are different protections."
        />
        <p className="ds-gallery__trace">
          M13/M14/M15 → C01/C07/C08/C11 → F01/F06/F10
        </p>
        <div className="ds-gallery__grid">
          <div className="ds-gallery__stack">
            {recovery === "blocked" ? (
              <DSInlineNotice
                tone="error"
                title="Another tab has newer saved data"
                actions={
                  <>
                    <DSButton onClick={() => setRecovery("retry")}>
                      Simulate safe retry
                    </DSButton>
                    <DSButton onClick={() => setRecovery("export")}>
                      Simulate proposal export
                    </DSButton>
                    <DSButton
                      variant="text"
                      onClick={() => setRecovery("reload")}
                    >
                      Review saved-copy reload
                    </DSButton>
                  </>
                }
              >
                The proposal remains visible. Do not overwrite the newer saved
                copy.
              </DSInlineNotice>
            ) : (
              <DSInlineNotice
                tone="warning"
                title="Recovery fixture selected"
                actions={
                  <DSButton
                    variant="text"
                    onClick={() => setRecovery("blocked")}
                  >
                    Reset recovery fixture
                  </DSButton>
                }
              >
                {recovery === "reload"
                  ? "Reloading the saved copy would discard unsaved proposals; this sandbox does not reload your notebook."
                  : recovery === "export"
                    ? "A real proposal export would create an external file; this fixture creates no file."
                    : "A real safe retry must recheck revisions; this fixture does not write."}
              </DSInlineNotice>
            )}
            <DSSurface variant="utility">
              <h3>Three separate protections</h3>
              <p>
                <DSStatus
                  state="saved"
                  text="Fixture: local record committed"
                />
              </p>
              <p>
                <DSStatus
                  state="offline-ready"
                  text="Fixture: app shell cached"
                />
              </p>
              <p>
                <DSStatus
                  state="backup-needed"
                  text="Fixture: external copy not confirmed"
                />
              </p>
              <p className="ds-supporting">
                Installing the app is not a backup. Browser clearing or device
                loss can erase local records.
              </p>
            </DSSurface>
          </div>
          <DSSurface variant="utility">
            <h3>Backup merge preview fixture</h3>
            <p className="ds-supporting">
              No file is read or imported. The selector only demonstrates the
              native file control and preview states.
            </p>
            <DSField
              label="Example backup file"
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                setBackupName(e.target.files?.[0]?.name || "");
                setImportPhase(e.target.files?.length ? "preview" : "empty");
              }}
            />
            <div className="ds-actions">
              <DSButton
                onClick={() => {
                  setBackupName("example-notebook.json");
                  setImportPhase("preview");
                }}
              >
                Load sample preview
              </DSButton>
              <DSButton variant="text" onClick={() => setImportPhase("error")}>
                Show invalid-file state
              </DSButton>
            </div>
            {importPhase === "preview" && (
              <DSInlineNotice
                title={backupName || "Example backup"}
                actions={
                  <>
                    <DSButton onClick={() => setImportPhase("saving")}>
                      Confirm example merge
                    </DSButton>
                    <DSButton
                      variant="text"
                      onClick={() => setImportPhase("empty")}
                    >
                      Cancel example import
                    </DSButton>
                  </>
                }
              >
                Illustrative preview: 3 finished workouts and no active draft.
                Identical IDs dedupe; conflicting IDs reject. Real imports
                require validation before this step.
              </DSInlineNotice>
            )}
            {importPhase === "saving" && (
              <>
                <DSLoading>Simulated merge pending</DSLoading>
                <div className="ds-actions">
                  <DSButton onClick={() => setImportPhase("success")}>
                    Merge succeeds
                  </DSButton>
                  <DSButton
                    variant="danger"
                    onClick={() => setImportPhase("error")}
                  >
                    Merge conflicts
                  </DSButton>
                </div>
              </>
            )}
            {importPhase === "success" && (
              <DSInlineNotice tone="success" title="Simulated merge complete">
                Fixture result only. Your notebook was not accessed.
              </DSInlineNotice>
            )}
            {importPhase === "error" && (
              <DSInlineNotice
                tone="error"
                title="Example file cannot be merged"
              >
                Unsupported, invalid or conflicting records would leave the
                original notebook unchanged. Choose another file.
              </DSInlineNotice>
            )}
          </DSSurface>
        </div>
      </section>
      <section className="ds-gallery__section">
        <DSSectionHeading
          title="Inventory boundary"
          description="Implemented shared primitives and controlled molecules support the agreed flows. Plan lines, navigation, completion and protection are compositions of these parts; no production migration is implied."
        />
        <p className="ds-gallery__trace">
          Canonical trace: DESIGN-JOURNEYS.md → DESIGN-FLOWS.md →
          DESIGN-SYSTEM.md → these reusable parts
        </p>
        <DSButton
          variant="text"
          startIcon={<Pencil size={15} />}
          onClick={() => setClicks((n) => n + 1)}
        >
          Example contextual action
        </DSButton>
      </section>
    </div>
  );
}
