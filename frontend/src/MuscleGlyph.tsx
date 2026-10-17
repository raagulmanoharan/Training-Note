import type { MuscleGroup } from "./personalStore";

/** Original, decorative movement-area illustration; not an anatomical assessment. */
export default function MuscleGlyph({
  group,
  selected = false,
}: {
  group: MuscleGroup;
  selected?: boolean;
}) {
  const base = "var(--ds-rule, #454952)",
    line = "var(--ds-sheet, #1c211b)",
    highlight = selected
      ? "var(--ds-accent, #add2b3)"
      : "var(--ds-secondary, #b9c0b1)";
  const fill = (target: MuscleGroup) => (target === group ? highlight : base);
  return (
    <svg
      viewBox="0 0 64 88"
      width="48"
      height="64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="personal-muscle-glyph"
    >
      <ellipse cx="32" cy="9" rx="6.5" ry="8" fill={base} />
      <path d="M28 16h8l2 6H26l2-6Z" fill={base} />
      <g stroke={line} strokeWidth="1.1" strokeLinejoin="round">
        <path
          d="M26 21 19 22l-6 6-2 10 8 3 5-10 8-3 8 3 5 10 8-3-2-10-6-6-7-1-6 3-6-3Z"
          fill={base}
        />
        <path
          d="m19 22-6 6-2 10 6 2 6-13-4-5Zm26 0 6 6 2 10-6 2-6-13 4-5Z"
          fill={fill("shoulders")}
        />
        <path
          d="m11 38-3 12 5 3 6-12-8-3Zm42 0 3 12-5 3-6-12 8-3Z"
          fill={fill("arms")}
        />
        <path
          d="M8 50 5 65l4 2 5-14-6-3Zm48 0 3 15-4 2-5-14 6-3Z"
          fill={fill("arms")}
        />
        {group === "back" ? (
          <>
            <path
              d="m24 24 8 4 8-4 3 10-5 12-6 5-6-5-5-12 3-10Z"
              fill={highlight}
            />
            <path d="M32 29v20m-10-15 10 4 10-4" stroke={line} />
          </>
        ) : (
          <>
            <path
              d="m24 25 7 3v10l-9 1-3-5 5-9Zm16 0-7 3v10l9 1 3-5-5-9Z"
              fill={fill("chest")}
            />
            <path
              d="m23 39 8 1v13l-6-1-2-13Zm18 0-8 1v13l6-1 2-13Z"
              fill={fill("core")}
            />
            <path d="M25 45h5m4 0h5m-13 5h4m4 0h4" stroke={line} />
          </>
        )}
        <path d="m25 52 7 3 7-3 2 8-9 5-9-5 2-8Z" fill={base} />
        <path
          d="m23 60 8 4-3 13-7-1 2-16Zm18 0-8 4 3 13 7-1-2-16Z"
          fill={fill("legs")}
        />
        <path
          d="m21 76 7 1-2 9h-5V76Zm22 0-7 1 2 9h5V76Z"
          fill={fill("legs")}
        />
      </g>
    </svg>
  );
}
