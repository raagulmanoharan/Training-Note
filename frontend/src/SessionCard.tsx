import { forwardRef, useEffect, useState } from "react";
import { Clock3, EyeOff, Square } from "lucide-react";
import { DSButton } from "./design-system";
const preferenceKey = "gym-notebook:hide-session-time";
export function sessionClock(startedAt: string, now: number) {
  const start = Date.parse(startedAt);
  const seconds = Number.isFinite(start)
    ? Math.max(0, Math.floor((now - start) / 1000))
    : 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return {
    seconds,
    text: `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
  };
}
export default forwardRef<
  HTMLButtonElement,
  { startedAt: string; savedSets: number; onFinish: () => void }
>(function SessionCard({ startedAt, savedSets, onFinish }, ref) {
  const [now, setNow] = useState(Date.now);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(preferenceKey) === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  function toggle() {
    const next = !hidden;
    setHidden(next);
    try {
      localStorage.setItem(preferenceKey, String(next));
    } catch {
      /* A preference failure never blocks workout logging. */
    }
  }
  const elapsed = sessionClock(startedAt, now);
  return (
    <section
      className={`nb-session-card ${hidden ? "is-compact" : ""}`}
      aria-label="Active workout session"
    >
      {!hidden && (
        <div
          className="nb-session-clock"
          title="Elapsed since starting this session, including time away"
        >
          <time
            aria-label="Elapsed session time"
            dateTime={`PT${elapsed.seconds}S`}
          >
            {elapsed.text}
          </time>
          <span>
            {savedSets} {savedSets === 1 ? "set" : "sets"} saved
          </span>
        </div>
      )}
      <div className="nb-session-card-actions">
        <DSButton
          variant="text"
          className="nb-session-toggle"
          aria-label={hidden ? "Show elapsed time" : "Hide elapsed time"}
          aria-expanded={!hidden}
          onClick={toggle}
        >
          {hidden ? <Clock3 size={20} /> : <EyeOff size={20} />}
        </DSButton>
        <DSButton
          ref={ref}
          className="nb-session-finish"
          variant="primary"
          onClick={onFinish}
          startIcon={<Square size={14} fill="currentColor" />}
        >
          Finish
        </DSButton>
      </div>
    </section>
  );
});
