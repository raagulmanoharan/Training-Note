import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const assets = (await readdir("dist/assets")).map((name) => `/assets/${name}`);
const files = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  ...assets,
];
const hash = createHash("sha256");
for (const file of files.filter((f) => f !== "/"))
  hash.update(await readFile(`dist${file}`));
const version = `gym-notebook-${hash.digest("hex").slice(0, 16)}`;
await writeFile(
  "dist/sw.js",
  `
const PREFIX = 'gym-notebook:' + self.registration.scope + ':';
const CACHE = PREFIX + ${JSON.stringify(version)};
const FILES = ${JSON.stringify(files.map((file) => "." + file))};
const PATHS = FILES.map(file => new URL(file, self.location.href).pathname);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(new URL('./index.html', self.location.href).href))));
  } else if (PATHS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(hit => hit || fetch(event.request)));
  }
});
`,
);
console.log(`Offline shell built: ${version} (${files.length} files).`);
