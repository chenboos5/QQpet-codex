import { readFile } from "node:fs/promises";

import { readCodexSessionEvent } from "./codex-session-adapter.mjs";
import { normalizeAgentEvent } from "../core/state-machine.mjs";

async function readJsonFile(path) {
  const content = await readFile(path, "utf8");
  return JSON.parse(content);
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

export async function readConfiguredAgentEvents(agentConfigs = []) {
  const results = await Promise.all(agentConfigs.map(async (agentConfig) => {
    if (agentConfig.adapter === "codex-session") {
      return [await readCodexSessionEvent(agentConfig)];
    }

    try {
      const payload = await readJsonFile(agentConfig.statusFile);
      return asArray(payload).map((event) => normalizeAgentEvent({
        ...event,
        source: event.source ?? event.agent ?? agentConfig.id,
      }));
    } catch (error) {
      if (error?.code !== "ENOENT") {
        return [normalizeAgentEvent({
          source: agentConfig.id,
          type: "error",
          message: `Could not read ${agentConfig.statusFile}: ${error.message}`,
        })];
      }

      return [normalizeAgentEvent({
        source: agentConfig.id,
        type: "idle",
        message: "No status file yet",
      })];
    }
  }));

  return results.flat();
}
