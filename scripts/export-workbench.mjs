import { build } from "esbuild";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const images = {};
for (const name of await readdir(path.join(root, "docs/images"))) {
  if (/^two-screen-(home|workout)\.png$/.test(name))
    images[`../../docs/images/${name}`] =
      `data:image/png;base64,${(await readFile(path.join(root, "docs/images", name))).toString("base64")}`;
}
const result = await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import Workbench from './frontend/src/DesignWorkbench'; createRoot(document.getElementById('root')).render(<Workbench/>);`,
    resolveDir: root,
    loader: "tsx",
  },
  bundle: true,
  write: false,
  outdir: "export",
  format: "iife",
  jsx: "automatic",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "standalone-assets",
      setup(b) {
        b.onResolve({ filter: /\.md\?raw$/ }, (args) => ({
          path: path.resolve(args.resolveDir, args.path.replace(/\?raw$/, "")),
          namespace: "raw",
        }));
        b.onLoad({ filter: /.*/, namespace: "raw" }, async (args) => ({
          contents: await readFile(args.path, "utf8"),
          loader: "text",
        }));
        b.onLoad({ filter: /DesignWorkbench\.tsx$/ }, async (args) => ({
          contents: (await readFile(args.path, "utf8"))
            .replace(/import\.meta\.glob\([\s\S]*?\},?\s*\)/, JSON.stringify(images))
            .replaceAll('href="?design=1"', 'href="#"')
            .replaceAll('href="./"', 'href="#"')
            .replace("Open working app", "Offline design review")
            .replace(
              "Try the composed working app",
              "App preview is not included in this offline file",
            ),
          loader: "tsx",
          resolveDir: path.dirname(args.path),
        }));
      },
    },
  ],
});
const js = result.outputFiles
  .find((f) => f.path.endsWith(".js"))
  .text.replaceAll("</script", "<\\/script");
const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text || "";
await mkdir("/workspace/shared", { recursive: true });
await writeFile(
  "/workspace/shared/gym-design-workbench.html",
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gym Notebook — Design workbench</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
);
console.log("Exported /workspace/shared/gym-design-workbench.html");
