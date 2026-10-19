import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRightLeft, Check, Search, X } from "lucide-react";
import { DSButton } from "./design-system/components";
import MuscleGlyph from "./MuscleGlyph";
import { groups, type CatalogExercise } from "./personalCatalog";
import type { MuscleGroup } from "./personalStore";
import "./exercise-picker.css";

export interface ExercisePickerProps {
  items: CatalogExercise[];
  selectedIds: string[];
  mode: "multiple" | "swap";
  onToggle?: (id: string) => void;
  onPick?: (item: CatalogExercise) => void;
  preferredIds?: string[];
  disabled?: boolean;
  busy?: boolean;
  disabledApply?: boolean;
  onApply?: () => void;
  onCancel: () => void;
  note?: ReactNode;
}

/**
 * Journey/acceptance: docs/WORKOUT-EDITING-UX.md, journeys 1 and 2.
 * Selection is staged by the parent. Search/filter never mutate it; all selected
 * rows share one treatment. Only the parent acknowledges a successful save.
 */
export default function ExercisePicker({
  items,
  selectedIds,
  mode,
  onToggle,
  onPick,
  preferredIds = [],
  disabled = false,
  busy = false,
  disabledApply = false,
  onApply,
  onCancel,
  note,
}: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "all">("all");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const searchId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selection = useMemo(() => new Set(selectedIds), [selectedIds]);
  const preferred = useMemo(() => new Set(preferredIds), [preferredIds]);
  const locked = disabled || busy;
  const selectionCount = selection.size;
  const selectedOrder = useMemo(
    () => new Map(selectedIds.map((id, index) => [id, index])),
    [selectedIds],
  );
  const availableGroups = groups.filter((candidate) =>
    items.some((item) => item.group === candidate.id),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleItems = useMemo(() => {
    const matches = items.filter((item) => {
      if (selectedOnly && !selection.has(item.id)) return false;
      if (group !== "all" && group !== item.group) return false;
      const groupName = groups.find((entry) => entry.id === item.group)?.name;
      return (
        !normalizedQuery ||
        `${item.name} ${item.equipment} ${groupName} ${item.target}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      );
    });
    if (selectedOnly) {
      return matches.sort(
        (a, b) =>
          (selectedOrder.get(a.id) ?? 0) - (selectedOrder.get(b.id) ?? 0),
      );
    }
    if (mode === "swap") {
      return matches.sort(
        (a, b) => Number(preferred.has(b.id)) - Number(preferred.has(a.id)),
      );
    }
    return matches;
  }, [
    items,
    selectedOnly,
    selection,
    group,
    normalizedQuery,
    selectedOrder,
    mode,
    preferred,
  ]);

  const resetScroll = () => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  };
  const showSelected = () => {
    setSelectedOnly(true);
    setGroup("all");
    setQuery("");
    resetScroll();
  };
  const clearFilters = () => {
    setSelectedOnly(false);
    setGroup("all");
    setQuery("");
    resetScroll();
  };

  return (
    <div className="nb-exercise-picker-panel" aria-busy={busy || undefined}>
      <div className="nb-picker-controls">
        {note && <div className="nb-picker-note">{note}</div>}
        <div className="nb-picker-search">
          <Search size={19} aria-hidden="true" />
          <label className="ds-visually-hidden" htmlFor={searchId}>
            Search exercises
          </label>
          <input
            id={searchId}
            ref={searchRef}
            className="ds-input nb-picker-search-input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search exercises or equipment"
            value={query}
            disabled={busy}
            onChange={(event) => {
              setQuery(event.target.value);
              resetScroll();
            }}
          />
          {query && (
            <button
              type="button"
              className="ds-picker-clear nb-picker-clear"
              aria-label="Clear search"
              disabled={busy}
              onClick={() => {
                setQuery("");
                resetScroll();
                searchRef.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <div
          className="nb-picker-filters"
          role="group"
          aria-label="Filter exercises"
        >
          <button
            type="button"
            className="ds-picker-filter nb-picker-filter"
            aria-pressed={!selectedOnly && group === "all"}
            disabled={busy}
            onClick={clearFilters}
          >
            All
          </button>
          {mode === "multiple" && (
            <button
              type="button"
              className="ds-picker-filter nb-picker-filter"
              aria-label="Selected exercises"
              aria-pressed={selectedOnly}
              disabled={busy}
              onClick={showSelected}
            >
              Selected{" "}
              <span className="nb-picker-filter-count">{selectionCount}</span>
            </button>
          )}
          {availableGroups.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className="ds-picker-filter nb-picker-filter"
              aria-pressed={!selectedOnly && group === candidate.id}
              disabled={busy}
              onClick={() => {
                setSelectedOnly(false);
                setGroup(candidate.id);
                resetScroll();
              }}
            >
              {candidate.name}
            </button>
          ))}
        </div>
      </div>

      <div className="nb-picker-results" ref={resultsRef}>
        <div
          className="nb-picker-options"
          role="group"
          aria-label="Exercise choices"
        >
          {visibleItems.map((item) => {
            const selected = selection.has(item.id);
            const isMatch = mode === "swap" && preferred.has(item.id);
            const groupName = groups.find(
              (entry) => entry.id === item.group,
            )?.name;
            return (
              <button
                key={item.id}
                type="button"
                role={mode === "multiple" ? "checkbox" : undefined}
                aria-checked={mode === "multiple" ? selected : undefined}
                aria-label={
                  mode === "multiple" ? item.name : `Swap to ${item.name}`
                }
                className="ds-picker-option nb-exercise-option"
                data-selected={
                  mode === "multiple" && selected ? "true" : undefined
                }
                disabled={
                  locked ||
                  (mode === "multiple" && !selected && selectionCount >= 100)
                }
                onClick={() =>
                  mode === "multiple" ? onToggle?.(item.id) : onPick?.(item)
                }
              >
                <MuscleGlyph group={item.group} selected={selected} />
                <span className="nb-exercise-option-copy">
                  <span className="nb-exercise-option-name">{item.name}</span>
                  <span className="nb-exercise-option-detail">
                    {item.equipment} · {groupName}
                  </span>
                  {isMatch && (
                    <span className="nb-exercise-option-match">
                      Same target
                    </span>
                  )}
                </span>
                <span className="nb-exercise-option-control" aria-hidden="true">
                  {mode === "swap" ? (
                    <ArrowRightLeft size={19} />
                  ) : (
                    <span className="nb-picker-check">
                      {selected && <Check size={18} strokeWidth={2.5} />}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {!visibleItems.length && (
          <div className="nb-picker-empty" role="status">
            <p>
              {selectedOnly && !selectionCount
                ? "No exercises selected yet."
                : items.length
                  ? "No exercises match these filters."
                  : "No other exercises are available to swap to."}
            </p>
            {items.length > 0 && (
              <DSButton onClick={clearFilters} disabled={busy}>
                {selectedOnly && !selectionCount
                  ? "Browse exercises"
                  : "Clear filters"}
              </DSButton>
            )}
          </div>
        )}
      </div>

      <div className="nb-picker-footer">
        {mode === "multiple" ? (
          <>
            <div className="nb-picker-footer-summary">
              <button
                type="button"
                className="ds-picker-selection nb-picker-selection"
                aria-label={`Review ${selectionCount} selected exercises`}
                disabled={busy}
                onClick={showSelected}
              >
                <span aria-live="polite" aria-atomic="true">
                  {selectionCount} selected
                </span>
              </button>
              <DSButton variant="text" onClick={onCancel} disabled={busy}>
                Cancel
              </DSButton>
            </div>
            {selectionCount >= 100 && (
              <p className="nb-picker-limit">Choose up to 100 exercises.</p>
            )}
            <DSButton
              className="nb-picker-save"
              variant="primary"
              onClick={onApply}
              loading={busy}
              loadingLabel="Saving exercises…"
              disabled={
                disabled ||
                disabledApply ||
                !selectionCount ||
                selectionCount > 100
              }
            >
              Save exercises
            </DSButton>
          </>
        ) : (
          <DSButton variant="text" onClick={onCancel} disabled={busy}>
            Cancel swap
          </DSButton>
        )}
      </div>
    </div>
  );
}
