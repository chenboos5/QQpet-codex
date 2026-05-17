import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readConfiguredAgentEvents } from "./src/adapters/file-status-adapter.mjs";
import { loadAgentConfig } from "./src/core/config.mjs";
import { loadPetPackage, petPackageClientPayload, safePetAssetPath } from "./src/core/pet-package.mjs";
import { selectPetState } from "./src/core/state-machine.mjs";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const universalDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(universalDir, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

const configPath = resolve(universalDir, argValue("config", "config/agents.sample.json"));
const port = Number(argValue("port", process.env.PORT ?? 8787));
const host = argValue("host", "127.0.0.1");
let cachedPetPackage;

async function currentPetPackage() {
  cachedPetPackage ??= await loadPetPackage(configPath);
  return cachedPetPackage;
}

async function statusPayload() {
  const agentConfig = await loadAgentConfig(configPath);
  const events = await readConfiguredAgentEvents(agentConfig);
  const pets = events.map((event) => ({
    ...selectPetState(event),
    agent: event.agent,
    integration: event.integration,
    taskId: event.taskId,
    title: event.title,
    phase: event.phase,
    progress: event.progress,
    requiresAuthorization: event.requiresAuthorization,
    updatedAt: event.updatedAt,
  }));

  return {
    generatedAt: new Date().toISOString(),
    attentionCount: pets.filter((pet) => pet.priority === "urgent").length,
    events,
    pets,
  };
}

async function sendFile(response, filePath) {
  const content = await readFile(filePath);
  response.writeHead(200, { "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream" });
  response.end(content);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (url.pathname === "/api/status") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(await statusPayload(), null, 2));
      return;
    }

    if (url.pathname === "/api/pet") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(petPackageClientPayload(await currentPetPackage()), null, 2));
      return;
    }

    if (url.pathname.startsWith("/pet-assets/")) {
      const petPackage = await currentPetPackage();
      await sendFile(response, safePetAssetPath(petPackage, url.pathname.slice("/pet-assets/".length)));
      return;
    }

    if (url.pathname.startsWith("/assets/")) {
      await sendFile(response, join(rootDir, url.pathname));
      return;
    }

    const filePath = url.pathname === "/"
      ? join(publicDir, "index.html")
      : join(publicDir, url.pathname);
    await sendFile(response, filePath);
  } catch (error) {
    response.writeHead(error?.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.message);
  }
});

server.listen(port, host, () => {
  console.log(`QQpet universal agent pet listening on http://${host}:${port}`);
  console.log(`Config: ${configPath}`);
});
