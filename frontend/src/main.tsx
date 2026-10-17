import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./PersonalApp";
const isDesignWorkbench =
  new URLSearchParams(window.location.search).get("design") === "1";
const DesignWorkbench = lazy(() => import("./DesignWorkbench"));
if (isDesignWorkbench) document.title = "Gym Notebook — Design workbench";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isDesignWorkbench ? (
      <Suspense
        fallback={
          <p style={{ padding: 24, color: "#f1eee3" }}>
            Opening design workbench…
          </p>
        }
      >
        <DesignWorkbench />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
if (
  !isDesignWorkbench &&
  "serviceWorker" in navigator &&
  import.meta.env.PROD
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(
        new URL(`${import.meta.env.BASE_URL}sw.js`, document.baseURI).href,
      )
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        document.documentElement.dataset.offlineReady = "true";
        window.dispatchEvent(new Event("personal-offline-ready"));
      })
      .catch(() => {
        /* Local logging still works; offline readiness is not claimed. */
      });
  });
}
