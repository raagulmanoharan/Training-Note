import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Check,
  TrendingUp,
} from "lucide-react";
import type { PersonalState, PersonalWorkout } from "./personalStore";
import { groups } from "./personalCatalog";
import { groupInsights } from "./personalInsights";
import MuscleGlyph from "./MuscleGlyph";
import "./training-home.css";
const localDay = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const title = (w: PersonalWorkout) =>
  w.groups.map((g) => groups.find((x) => x.id === g)?.name).join(" + ");
export default function TrainingHome({
  state,
  onPlan,
  onRepeat,
  onResume,
  onEvidence,
}: {
  state: PersonalState;
  onPlan: () => void;
  onRepeat: (w: PersonalWorkout) => void;
  onResume: () => void;
  onEvidence: () => void;
}) {
  const history = state.history
    .filter((w) => w.finishedAt && w.exercises.some((e) => e.sets.length))
    .slice()
    .sort((a, b) => Date.parse(b.finishedAt!) - Date.parse(a.finishedAt!));
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - 27 + i);
    return d;
  });
  const visits = new Set(history.map((w) => localDay(new Date(w.startedAt))));
  const count = days.filter((d) => visits.has(localDay(d))).length;
  const next = history[0];
  const insights = groupInsights(history);
  const active = state.current;
  const recorded =
    active?.exercises.reduce((n, e) => n + e.sets.length, 0) || 0;
  return (
    <div className={`training-home ${!history.length ? "is-first-visit" : ""}`}>
      <section
        className="home-next"
        aria-label={active ? "Current workout" : "Next workout suggestion"}
      >
        <div className="home-next-heading">
          <div>
            <h1>
              {active
                ? title(active)
                : next
                  ? title(next)
                  : "What are you training?"}
            </h1>
            <p>
              {active
                ? `${recorded} ${recorded === 1 ? "set" : "sets"} saved · ready when you are`
                : next
                  ? `${next.exercises.length} exercises · adjust before you start`
                  : "Your workout. Your pace. Every set in one place."}
            </p>
          </div>
          <MuscleGlyph
            group={active?.groups[0] || next?.groups[0] || "chest"}
            groups={active?.groups || next?.groups}
            selected
          />
        </div>
        {(active || next) && (
          <div className="home-workout-preview" aria-label="Workout exercises">
            {(active || next)!.exercises.slice(0, 3).map((exercise) => (
              <div key={exercise.id}>
                <span>{exercise.name}</span>
                <span>
                  {active
                    ? `${exercise.sets.length}/${exercise.plannedSets}`
                    : exercise.plannedSets}{" "}
                  sets
                </span>
              </div>
            ))}
            {(active || next)!.exercises.length > 3 && (
              <p>+{(active || next)!.exercises.length - 3} more exercises</p>
            )}
          </div>
        )}
        <button
          className="home-start"
          onClick={active ? onResume : next ? () => onRepeat(next) : onPlan}
        >
          <Play size={17} fill="currentColor" />
          {active
            ? "Continue workout"
            : next
              ? "Repeat this workout"
              : "Plan a workout"}
          <ArrowRight size={19} />
        </button>
        {!active && next && (
          <button
            className="home-alternate"
            onClick={active ? onResume : onPlan}
          >
            Train something else
            <ArrowUpRight size={15} />
          </button>
        )}
      </section>
      {!history.length ? (
        <section className="home-first-note" aria-label="Getting started">
          <div className="home-first-symbol" aria-hidden="true">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2>A little stronger, every visit.</h2>
            <p>
              Log the weight and reps you actually do. Next time, your last
              session is right there.
            </p>
            <span>
              <Check size={14} /> Saved on this device as you go.
            </span>
            {state.history.length > 0 && (
              <button
                className="home-history-link"
                aria-label="View progress details"
                onClick={onEvidence}
              >
                View history <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          <section
            className="home-attendance"
            aria-label="Recorded gym visits in the last four weeks"
          >
            <div className="home-attendance-heading">
              <div>
                <strong>
                  {count}
                  <span> gym {count === 1 ? "visit" : "visits"}</span>
                </strong>
                <p>Last 4 weeks</p>
              </div>
            </div>
            <div className="home-visit-grid">
              {days.map((d, i) => (
                <span
                  key={i}
                  className={`home-day ${visits.has(localDay(d)) ? "visited" : ""} ${i === 27 ? "is-today" : ""}`}
                  title={`${d.toLocaleDateString()}: ${visits.has(localDay(d)) ? "recorded gym visit" : "no recorded visit"}`}
                  aria-label={`${d.toLocaleDateString()}: ${visits.has(localDay(d)) ? "recorded gym visit" : "no recorded visit"}`}
                >
                  {visits.has(localDay(d)) ? "•" : ""}
                </span>
              ))}
            </div>
            <div className="home-chart-legend">
              <span>
                {days[0].toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>28 days</span>
              <span>Today</span>
            </div>
          </section>
          <section
            className="home-performance"
            aria-label="Your muscle group performance"
          >
            <div className="home-section-title">
              <h2>Progress</h2>
              <button onClick={onEvidence} aria-label="View progress details">
                Details <ArrowUpRight size={16} />
              </button>
            </div>
            {!insights.length ? (
              <div className="home-empty">
                Log a workout, then repeat it in the same setup to compare your
                lifts.
              </div>
            ) : (
              <div className="home-muscle-list">
                {insights.map((g) => (
                  <button
                    className="home-muscle-row"
                    key={g.group}
                    onClick={onEvidence}
                  >
                    <MuscleGlyph group={g.group} />
                    <div>
                      <strong>
                        {groups.find((x) => x.id === g.group)?.name}
                      </strong>
                      <span>
                        {g.improved
                          ? `${g.improved} of ${g.comparable} lifts improved`
                          : g.comparable
                            ? g.movements.some(
                                (m) => m.comparable && m.status === "review",
                              )
                              ? "Mixed results · see details"
                              : "Same recorded weights and reps"
                            : "No matching sessions yet"}
                      </span>
                    </div>
                    <div
                      className="home-comparison-dots"
                      aria-label={`${g.improved} improving out of ${g.comparable} comparable movements`}
                    >
                      {g.movements.map((m) => (
                        <i
                          key={m.key}
                          className={
                            m.status === "improved"
                              ? "improved"
                              : m.comparable
                                ? "comparable"
                                : ""
                          }
                        />
                      ))}
                    </div>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
            )}
            {insights.some((g) =>
              g.movements.some((m) => m.comparable && !m.effortComparable),
            ) && (
              <p className="home-caption">
                Effort was missing or harder in some comparisons. Open Details
                to see the matched sets.
              </p>
            )}
            {insights.length > 0 && (
              <p className="home-caption">
                These are lift comparisons, not a measurement of muscle growth.
              </p>
            )}
          </section>
          <section className="home-recent">
            <div className="home-section-title">
              <h2>Last workout</h2>
              <span>
                {history.length} {history.length === 1 ? "workout" : "workouts"}{" "}
                total
              </span>
            </div>
            {next ? (
              <button className="home-recent-row" onClick={onEvidence}>
                <span className="home-date-block">
                  <b>{new Date(next.startedAt).getDate()}</b>
                  {new Date(next.startedAt).toLocaleDateString(undefined, {
                    month: "short",
                  })}
                </span>
                <span>
                  <strong>{title(next)}</strong>
                  <small>
                    {next.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                    recorded
                  </small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ) : (
              <p className="home-caption">No workouts recorded yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
