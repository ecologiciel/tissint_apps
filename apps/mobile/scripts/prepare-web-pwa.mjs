import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileDir = path.resolve(scriptDir, "..");
const distDir = path.join(mobileDir, "dist");

const manifest = {
  name: "Tissint Expert Mobile",
  short_name: "Tissint Expert",
  description: "Interface mobile d'annotation des images Vision Trio.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#0f1419",
  theme_color: "#123f5a",
  lang: "fr",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
};

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#123f5a"/><circle cx="256" cy="256" r="136" fill="#f39a2b"/><path d="M178 300c39 36 117 36 156 0M194 212h1M318 212h1" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round"/><path d="M256 110v44M256 358v44M110 256h44M358 256h44" stroke="#fff" stroke-width="18" stroke-linecap="round"/></svg>`;
const serviceWorker = `const CACHE = "tissint-expert-v1";\nself.addEventListener("install", event => { self.skipWaiting(); });\nself.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });\nself.addEventListener("fetch", event => { const url = new URL(event.request.url); if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) return; event.respondWith(fetch(event.request).then(response => { if (response.ok && url.origin === self.location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())); return response; }).catch(() => caches.match(event.request))); });\n`;

await mkdir(path.join(distDir, "api"), { recursive: true });
await copyFile(path.join(mobileDir, "api", "proxy.js"), path.join(distDir, "api", "proxy.js"));
await writeFile(path.join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
await writeFile(path.join(distDir, "icon.svg"), icon);
await writeFile(path.join(distDir, "sw.js"), serviceWorker);

const indexPath = path.join(distDir, "index.html");
let index = await readFile(indexPath, "utf8");
const pwaHead = '<link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#123f5a"><link rel="icon" href="/icon.svg" type="image/svg+xml">';
const pwaScript = '<script>if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"));}</script>';
if (!index.includes('rel="manifest"')) index = index.replace("</head>", `${pwaHead}</head>`);
if (!index.includes("navigator.serviceWorker.register")) index = index.replace("</body>", `${pwaScript}</body>`);
await writeFile(indexPath, index);

await writeFile(path.join(distDir, "vercel.json"), JSON.stringify({
  rewrites: [
    { source: "/api/proxy/:path*", destination: "/api/proxy?path=/:path*" },
    { source: "/expert", destination: "/index.html" },
  ],
  functions: { "api/proxy.js": { maxDuration: 120 } },
}, null, 2));

console.log("Prepared Expo web PWA with Vercel proxy.");
