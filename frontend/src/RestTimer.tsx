import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { DSButton } from "./design-system/components";
import type { PersonalRestTimer, PersonalWorkout } from "./personalStore";
import {
  extendRestTimer,
  formatRestTime,
  remainingRestSeconds,
} from "./restLogic";
import "./rest-timer.css";

export interface RestTimerProps {
  workout: PersonalWorkout;
  disabled?: boolean;
  onChange: (timer: PersonalRestTimer | undefined) => void;
}

/** Presentation ticks are local only. Explicit actions use the parent's queue. */
export function RestTimer({ workout, disabled, onChange }: RestTimerProps) {
  const timer = workout.restTimer;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const interval = window.setInterval(refresh, 250);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [timer?.endsAt]);

  if (!timer || workout.finishedAt) return null;
  const remaining = remainingRestSeconds(timer, now);
  const completed = remaining === 0;

  return (
    <section
      className="nb-rest-timer"
      aria-label="Rest timer"
      data-state={completed ? "complete" : "running"}
    >
      <div className="nb-rest-timer__readout">
        <Timer size={19} aria-hidden="true" />
        <span className="nb-rest-timer__label">
          {completed ? "Rest complete" : "Rest"}
        </span>
        {!completed && (
          <span
            className="nb-rest-timer__time"
            role="timer"
            aria-label={`${remaining} seconds remaining`}
          >
            {formatRestTime(remaining)}
          </span>
        )}
      </div>
      <div className="nb-rest-timer__actions">
        <DSButton
          size="compact"
          variant="text"
          disabled={disabled}
          aria-label="Add 30 seconds to rest"
          onClick={() => onChange(extendRestTimer(timer))}
        >
          +30s
        </DSButton>
        <DSButton
          size="compact"
          variant="secondary"
          disabled={disabled}
          aria-label={completed ? "Dismiss completed rest" : "Skip rest"}
          onClick={() => onChange(undefined)}
        >
          {completed ? "Done" : "Skip"}
        </DSButton>
      </div>
      <span className="ds-visually-hidden" role="status" aria-live="polite">
        {completed ? "Rest complete. Ready for your next set." : ""}
      </span>
    </section>
  );
}

export default RestTimer;
