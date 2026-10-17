import React from "react";
import ReactDOM from "react-dom/client";
import App from "./PersonalApp";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD) {
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
