import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Layers,
  Map,
  Route,
  Grid2X2,
  LayoutTemplate,
  ChevronRight,
} from "lucide-react";
import realJourneyDoc from "../../docs/REAL-GYM-JOURNEY.md?raw";
import flowsDoc from "../../docs/DESIGN-FLOWS.md?raw";
import twoScreenDoc from "../../docs/TWO-SCREEN-UX.md?raw";
import systemDoc from "../../docs/DESIGN-SYSTEM.md?raw";
import critiqueDoc from "../../docs/DESIGN-CRITIQUE.md?raw";
import ComponentGallery from "./design-system/ComponentGallery";
import "./design-workbench.css";

type View = "journey" | "architecture" | "flows" | "components" | "screens";
const views: { id: View; name: string; icon: typeof Map }[] = [
  { id: "journey", name: "Journey & blueprint", icon: Map },
  { id: "architecture", name: "Information architecture", icon: Layers },
  { id: "flows", name: "Task flows", icon: Route },
  { id: "components", name: "Component library", icon: Grid2X2 },
  { id: "screens", name: "Screen composition", icon: LayoutTemplate },
];
function sections(doc: string, prefix: string) {
  return Array.from(
    doc.matchAll(new RegExp(`^#{2,3} (${prefix}\\d+) [—–-] (.+)$`, "gm")),
  ).map((m, index, all) => ({
    id: m[1],
    title: m[2],
    body: doc
      .slice((m.index ?? 0) + m[0].length, all[index + 1]?.index ?? doc.length)
      .trim(),
  }));
}
function inline(s: string): ReactNode {
  return s
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    );
}
function Document({ source }: { source: string }) {
  const blocks = source.split(/\n\s*\n/);
  return (
    <div className="dw-document">
      {blocks.map((block, i) => {
        if (block.startsWith("```"))
          return (
            <pre key={i}>
              {block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")}
            </pre>
          );
        if (/^#{1,4} /.test(block)) {
          const [title, ...rest] = block.split("\n");
          return (
            <section key={i}>
              <h3>{inline(title.replace(/^#+ /, ""))}</h3>
              {rest.length > 0 && <p>{inline(rest.join(" "))}</p>}
            </section>
          );
        }
        if (block.trim().startsWith("|")) {
          const rows = block
            .split("\n")
            .filter((r) => !/^\|[ :|-]+\|?$/.test(r));
          return (
            <div className="dw-table-scroll" key={i}>
              <table>
                <tbody>
                  {rows.map((row, n) => (
                    <tr key={n}>
                      {row
                        .split("|")
                        .slice(1, -1)
                        .map((cell, j) =>
                          n === 0 ? (
                            <th key={j}>{inline(cell.trim())}</th>
                          ) : (
                            <td key={j}>{inline(cell.trim())}</td>
                          ),
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}
const compositionImages = import.meta.glob(
  ["../../docs/images/two-screen-home.png", "../../docs/images/two-screen-workout.png"],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;
// Derive the visual map from the canonical off-app journey rather than maintaining
// a second, screen-led version of the research synthesis.
const realPhases = realJourneyDoc
  .split("## End-to-end journey and app overlay")[1]
  .split("## The week is a loop")[0]
  .split("\n")
  .filter((line) => /^\| \d+\./.test(line))
  .map((line, index) => {
    const [title, actions, friction, feeling, intervention, noApp] = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    return {
      id: `G${String(index + 1).padStart(2, "0")}`,
      title,
      actions,
      friction,
      feeling,
      intervention,
      noApp,
    };
  });
const jobs = [
  {
    name: "Home",
    job: "Orient / Plan / Understand",
    flows: "Plan and progress share one place",
    items: [
      "Resume an active session, or start the chosen next workout",
      "See actual visit dates and supported performance changes",
      "Repeat or prepare a workout inline",
      "Expand exact history; access backup and settings contextually",
    ],
  },
  {
    name: "Session",
    job: "Recall / Perform / Record / Adapt",
    flows: "One continuous worksheet",
    items: [
      "See last matching actuals beside today's set rows",
      "Record weight and reps explicitly",
      "Jump exercises or swap equipment without losing work",
      "Correct, optionally record effort, and finish partially",
    ],
  },
];
export default function DesignWorkbench() {
  const [view, setView] = useState<View>("journey"),
    [journeyId, setJourneyId] = useState("G07"),
    [flowId, setFlowId] = useState("F03");
  const flows = sections(flowsDoc, "F");
  const journey = realPhases.find((j) => j.id === journeyId) || realPhases[0],
    flow = flows.find((f) => f.id === flowId) || flows[0];
  const paths =
    flow?.body
      .match(/```text\n([\s\S]*?)```/)?.[1]
      ?.trim()
      .split("\n") || [];
  return (
    <div className="design-workbench">
      <header className="dw-header">
        <a className="dw-wordmark" href="?design=1">
          <span className="dw-mark">N°</span> Gym Notebook{" "}
          <small>Design workbench</small>
        </a>
        <a className="dw-app-link" href="./">
          Open working app <ArrowUpRight size={16} />
        </a>
      </header>
      <div className="dw-layout">
        <aside className="dw-sidebar">
          <p className="dw-kicker">From intent to interface</p>
          <nav aria-label="Design workbench">
            {views.map(({ id, name, icon: Icon }, i) => (
              <button
                key={id}
                aria-current={view === id ? "page" : undefined}
                onClick={() => setView(id)}
              >
                <span className="dw-nav-index">0{i + 1}</span>
                <Icon size={17} />
                {name}
              </button>
            ))}
          </nav>
          <p className="dw-note">
            Design evidence, not a usability study. Feelings are hypotheses.
            Interactive examples use memory only.
          </p>
        </aside>
        <main className="dw-main">
          <div className="dw-title">
            <span className="dw-kicker">
              Personal gym notebook · Working design record
            </span>
            <h1>{views.find((v) => v.id === view)?.name}</h1>
            <p>
              {view === "journey"
                ? "Start outside the app: deciding to train, finding equipment, lifting, remembering, and returning next week. Application touchpoints are an overlay, not the journey itself."
                : view === "architecture"
                  ? "Organize around the job the person is doing. Keep intentions, pending entries, recorded actuals and interpreted evidence distinct."
                  : view === "flows"
                    ? "Every action has a destination. Every failure and interruption needs an intentional route back."
                    : view === "components"
                      ? "Inspect the parts before composing the page: material, typography, action hierarchy, field behavior and every meaningful state."
                      : "The screens follow the flow and use the same components as the working app. This is a composition record, not a second product."}
            </p>
          </div>
          {view === "journey" && (
            <>
              <div className="dw-principle">
                <strong>
                  Decide → Arrive → Lift → Rest → Record → Leave → Return
                </strong>
                <span>
                  User statements are evidence. Feelings and other behaviour
                  remain hypotheses, not observed research.
                </span>
              </div>
              <div
                className="dw-blueprint"
                aria-label="Real gym week and application touchpoint overlay"
              >
                {realPhases.map((j) => (
                  <button
                    className={`dw-journey-column ${journeyId === j.id ? "selected" : ""}`}
                    key={j.id}
                    aria-label={`${j.id}: ${j.title} — inspect real-world moment`}
                    onClick={() => setJourneyId(j.id)}
                    aria-pressed={journeyId === j.id}
                  >
                    <span className="dw-kicker">
                      {j.id} / Outside the app first
                    </span>
                    <h2>{j.title}</h2>
                    <div>
                      <label>Person, environment and artefacts</label>
                      <p>{j.actions}</p>
                    </div>
                    <div>
                      <label>Friction to investigate</label>
                      <p>{j.friction}</p>
                    </div>
                    <div className="dw-emotion">
                      <label>Feeling · hypothesis</label>
                      <p>{j.feeling}</p>
                    </div>
                    <div>
                      <label>Optional app touchpoint · overlay</label>
                      <p>{j.intervention}</p>
                    </div>
                    <div>
                      <label>Leave these moments alone</label>
                      <p>{j.noApp}</p>
                    </div>
                    <span className="dw-inspect">
                      Inspect moment <ChevronRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
              {journey && (
                <section className="dw-detail">
                  <span className="dw-kicker">
                    Selected real-world moment / application overlay
                  </span>
                  <h2>{journey.title}</h2>
                  <Document
                    source={`**Outside the app:** ${journey.actions}\n\n**Friction to investigate:** ${journey.friction}\n\n**Feeling hypothesis:** ${journey.feeling}\n\n**Possible intervention:** ${journey.intervention}\n\n**No app interaction required:** ${journey.noApp}`}
                  />
                  <button onClick={() => setView("architecture")}>
                    See two-screen architecture <ChevronRight size={15} />
                  </button>
                </section>
              )}
              <details className="dw-source">
                <summary>
                  Full gym-week map, service ecosystem, evidence boundaries and
                  validation plan
                </summary>
                <Document source={realJourneyDoc} />
              </details>
              <details className="dw-source">
                <summary>
                  Earlier implementation critique · historical context
                </summary>
                <Document source={critiqueDoc} />
              </details>
            </>
          )}
          {view === "architecture" && (
            <>
              <div className="dw-ia-grid">
                {jobs.map((job) => (
                  <section className="dw-ia-card" key={job.name}>
                    <span className="dw-kicker">{job.job}</span>
                    <h2>{job.name}</h2>
                    <ul>
                      {job.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="dw-mono">{job.flows}</p>
                  </section>
                ))}
              </div>
              <section className="dw-detail">
                <span className="dw-kicker">
                  Information model / ownership of meaning
                </span>
                <h2>One notebook. Different kinds of truth.</h2>
                <div className="dw-object-model">
                  {[
                    "Intention / plan",
                    "Pending entry",
                    "Recorded actual",
                    "Derived evidence",
                    "External backup",
                  ].map((label, i) => (
                    <div key={label}>
                      <span className="dw-nav-index">0{i + 1}</span>
                      <strong>{label}</strong>
                      <p>
                        {
                          [
                            "What you mean to do. Never marked performed.",
                            "Typed values, retained but not yet a performed set.",
                            "Explicitly recorded and acknowledged by local storage.",
                            "A comparison of matched records, with visible caveats.",
                            "A recovery artifact you keep outside the browser.",
                          ][i]
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <details className="dw-source">
                <summary>
                  Full architecture and cross-cutting state contracts
                </summary>
                <Document source={flowsDoc.split("## F01")[0]} />
              </details>
            </>
          )}
          {view === "flows" && (
            <>
              <section className="dw-detail">
                <span className="dw-kicker">Current two-screen task model</span>
                <h2>The physical gym week determines the interaction.</h2>
                <Document source={twoScreenDoc} />
              </section>
              <p className="dw-note">
                Historical implementation contracts below: F01–F10 preserve
                useful transaction and recovery rules. Their earlier screen
                architecture is not the current two-screen design.
              </p>
              <div className="dw-flow-selector" aria-label="Choose a task flow">
                {flows.map((f) => (
                  <button
                    key={f.id}
                    aria-pressed={flowId === f.id}
                    onClick={() => setFlowId(f.id)}
                  >
                    <span>{f.id}</span>
                    {f.title}
                  </button>
                ))}
              </div>
              {flow && (
                <section className="dw-detail">
                  <span className="dw-kicker">
                    {flow.id} / state and recovery paths
                  </span>
                  <h2>{flow.title}</h2>
                  <div className="dw-flow-diagram">
                    {paths.map((path, i) => (
                      <div
                        className={`dw-path ${/FAILED|failure|Cancel|retry|discard|Undo|blocked/i.test(path) ? "recovery" : ""}`}
                        key={i}
                      >
                        {path.split("→").map((node, n) => (
                          <span className="dw-path-part" key={n}>
                            {n > 0 && (
                              <span className="dw-arrow" aria-hidden="true">
                                →
                              </span>
                            )}
                            <span className="dw-state">{node.trim()}</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <details className="dw-source">
                    <summary>Complete flow, conditions and acceptance</summary>
                    <Document source={flow.body} />
                  </details>
                </section>
              )}
            </>
          )}
          {view === "components" && (
            <>
              <div className="dw-sandbox-label">
                Legacy shared-state specimens · synthetic, in-memory state · no
                workout storage. These demonstrate reusable behavior and
                transaction states; their green ledger material is the earlier
                theme. The current Home and Workout scenes are shown in Screen
                composition.
              </div>
              <ComponentGallery />
              <details className="dw-source">
                <summary>
                  Design-system contract, anatomy, variants and traceability
                </summary>
                <Document source={systemDoc} />
              </details>
            </>
          )}
          {view === "screens" && (
            <>
              <div className="dw-composition-list">
                {[
                  {
                    title: "Home · visits, performance, next workout",
                    flow: "Current primary screen 1 of 2",
                    parts:
                      "Visit strip · Next-workout action · Comparable performance · Recent session · Contextual settings",
                    image: "two-screen-home.png",
                  },
                  {
                    title: "Workout · recall, record, adapt",
                    flow: "Current primary screen 2 of 2",
                    parts:
                      "Exercise outline · Previous actuals · Set worksheet · Optional effort · Swap · Finish",
                    image: "two-screen-workout.png",
                  },
                ].map((screen) => (
                  <article className="dw-composition" key={screen.title}>
                    <div>
                      <span className="dw-kicker">{screen.flow}</span>
                      <h2>{screen.title}</h2>
                      <p>{screen.parts}</p>
                      <p className="dw-note">
                        {compositionImages[`../../docs/images/${screen.image}`]
                          ? "Actual rendered current app screen. Synthetic records only; the working app is the source of behavior. Temporary planning, history and data sheets are not additional primary destinations."
                          : "Current screenshot is being captured; do not substitute an earlier three-screen image."}
                      </p>
                    </div>
                    {compositionImages[`../../docs/images/${screen.image}`] ? (
                      <img
                        src={
                          compositionImages[`../../docs/images/${screen.image}`]
                        }
                        alt={`${screen.title}: composed screen preview`}
                      />
                    ) : (
                      <div className="dw-pending-composition">
                        Journey → flow → parts → composition
                        <br />
                        Screen preview follows component readiness.
                      </div>
                    )}
                  </article>
                ))}
              </div>
              <a className="dw-open-working" href="./">
                Try the composed working app <ArrowUpRight size={16} />
              </a>
            </>
          )}
        </main>
      </div>
      <footer className="dw-footer">
        User need → journey → task flow → component contract → screen
        composition → verified behavior
      </footer>
    </div>
  );
}
