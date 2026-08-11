import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");
const outputDir = join(root, ".vercel", "output");
const outputStaticDir = join(outputDir, "static");
const outputFunctionsDir = join(outputDir, "functions");
const serverFunctionDir = join(outputFunctionsDir, "__server.func");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(clientDir))) {
  throw new Error("dist/client is missing. Run npm run build before preparing Vercel output.");
}

if (
  !(await exists(join(serverDir, "index.mjs"))) ||
  !(await exists(join(serverDir, ".vc-config.json")))
) {
  throw new Error("dist/server is missing the Nitro Vercel server output.");
}

await mkdir(outputStaticDir, { recursive: true });
await mkdir(outputFunctionsDir, { recursive: true });
await rm(serverFunctionDir, { recursive: true, force: true });

for (const entry of await readdir(clientDir, { withFileTypes: true })) {
  await cp(join(clientDir, entry.name), join(outputStaticDir, entry.name), {
    recursive: entry.isDirectory(),
    force: true,
  });
}

await cp(serverDir, serverFunctionDir, { recursive: true, force: true });

console.log("Prepared Vercel Build Output with Nitro server and static client assets.");
