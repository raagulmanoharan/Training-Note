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
import journeysDoc from "../../docs/DESIGN-JOURNEYS.md?raw";
import flowsDoc from "../../docs/DESIGN-FLOWS.md?raw";
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
function field(body: string, label: string) {
  return (
    body
      .match(
        new RegExp(
          `\\*\\*${label}[^*]*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[^*]+:\\*\\*|\\n\\n|$)`,
        ),
      )?.[1]
      ?.trim() || ""
  );
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
const compositionImages = import.meta.glob("../../docs/images/design-*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const jobs = [
  {
    name: "Today",
    job: "Prepare / Capture / Resume",
    flows: "F01 · F02 · F03 · F04 · F05 · F06 · F07 · F08",
    items: [
      "Choose focus → review a session",
      "Capture one performed set",
      "Correct, swap or add optional effort",
      "Finish while preserving partial work",
    ],
  },
  {
    name: "Progress",
    job: "Understand",
    flows: "F09",
    items: [
      "Dated actual records",
      "Comparable movement / setup evidence",
      "Visible effort and context qualification",
      "Correct a historical actual in context",
    ],
  },
  {
    name: "Backup",
    job: "Protect / Recover",
    flows: "F10",
    items: [
      "On-device records ≠ offline app ≠ backup",
      "Export a recovery file",
      "Inspect and safely merge an import",
      "Storage protection and install guidance",
    ],
  },
];
export default function DesignWorkbench() {
  const [view, setView] = useState<View>("journey"),
    [journeyId, setJourneyId] = useState("J03"),
    [flowId, setFlowId] = useState("F03");
  const journeys = sections(journeysDoc, "J"),
    flows = sections(flowsDoc, "F");
  const journey = journeys.find((j) => j.id === journeyId) || journeys[0],
    flow = flows.find((f) => f.id === flowId) || flows[0];
  const paths =
    flow?.body
      .match(/```text\n([\s\S]*?)```/)?.[1]
      ?.trim()
      .split("\n") || [];
  const openFlow = (id: string) => {
    setFlowId(id);
    setView("flows");
  };
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
                ? "Design the moments, then the interface. The complete service includes the browser, the gym, interruptions and recovery—not only screens."
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
                <strong>Prepare → Capture → Understand</strong>
                <span>Protect is a service across the whole journey.</span>
              </div>
              <div className="dw-blueprint" aria-label="Service blueprint">
                {journeys.map((j) => (
                  <button
                    className={`dw-journey-column ${journeyId === j.id ? "selected" : ""}`}
                    key={j.id}
                    aria-label={`${j.id}: ${j.title.replace(/\s*\(.+$/, "")} — inspect touchpoint`}
                    onClick={() => setJourneyId(j.id)}
                    aria-pressed={journeyId === j.id}
                  >
                    <span className="dw-kicker">
                      {j.id} /{" "}
                      {j.body.match(/F\d+/)?.[0] ||
                        j.title.match(/F\d+/)?.[0] ||
                        ""}
                    </span>
                    <h2>{j.title.replace(/\s*\(.+$/, "")}</h2>
                    <div>
                      <label>Human intent</label>
                      <p>{field(j.body, "Human intent/context")}</p>
                    </div>
                    <div>
                      <label>Digital touchpoint / frontstage</label>
                      <p>{field(j.body, "Touchpoints and visible UX")}</p>
                    </div>
                    <div className="dw-emotion">
                      <label>Feeling / friction · hypothesis</label>
                      <p>{field(j.body, "Hypothesis")}</p>
                    </div>
                    <div>
                      <label>UX intervention</label>
                      <p>{field(j.body, "Intervention")}</p>
                    </div>
                    <div>
                      <label>Local service / backstage</label>
                      <p>{field(j.body, "Backstage")}</p>
                    </div>
                    <div>
                      <label>External actors / environment</label>
                      <p>{field(j.body, "External actors")}</p>
                    </div>
                    <span className="dw-inspect">
                      Inspect touchpoint <ChevronRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
              {journey && (
                <section className="dw-detail">
                  <div className="dw-section-heading">
                    <div>
                      <span className="dw-kicker">
                        Selected touchpoint / full blueprint
                      </span>
                      <h2>
                        {journey.id} — {journey.title.replace(/\s*\(.+$/, "")}
                      </h2>
                    </div>
                    <button onClick={() => openFlow(`F${journey.id.slice(1)}`)}>
                      See task flow <ChevronRight size={15} />
                    </button>
                  </div>
                  <Document source={journey.body} />
                </section>
              )}
              <details className="dw-source">
                <summary>Design critique and evidence boundaries</summary>
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
                Interactive specimens · synthetic, in-memory state · no workout
                storage
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
                    title: "Prepare & review",
                    flow: "F02",
                    parts:
                      "Focus selection · Stepper · Plan line · Primary action",
                    image: "design-plan.png",
                  },
                  {
                    title: "Capture a performed set",
                    flow: "F03 / F04 / F05 / F07",
                    parts:
                      "Worksheet · Set row · Transaction status · Contextual controls",
                    image: "design-capture.png",
                  },
                  {
                    title: "Understand the evidence",
                    flow: "F09",
                    parts:
                      "Section header · Evidence summary · Disclosure · Comparison rows",
                    image: "design-evidence.png",
                  },
                ].map((screen) => (
                  <article className="dw-composition" key={screen.title}>
                    <div>
                      <span className="dw-kicker">{screen.flow}</span>
                      <h2>{screen.title}</h2>
                      <p>{screen.parts}</p>
                      <p className="dw-note">
                        {compositionImages[`../../docs/images/${screen.image}`]
                          ? "Actual rendered screen, using the shared library. Synthetic records only; the working app is the source of behavior."
                          : "Composition pending isolated component review. The app is not being replaced from a feature list."}
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
