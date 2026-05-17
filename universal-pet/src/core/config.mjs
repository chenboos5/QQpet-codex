import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export function resolvePath(value, baseDir) {
  if (!value) return value;
  if (value.startsWith("~/")) {
    return resolve(process.env.HOME ?? process.cwd(), value.slice(2));
  }
  return resolve(baseDir, value);
}

export async function loadUniversalConfig(configPath) {
  const absoluteConfigPath = resolve(configPath);
  const baseDir = dirname(absoluteConfigPath);
  const content = await readFile(absoluteConfigPath, "utf8");
  const config = JSON.parse(content);

  return { config, baseDir, configPath: absoluteConfigPath };
}

export async function loadAgentConfig(configPath) {
  const { config, baseDir } = await loadUniversalConfig(configPath);

  return (config.agents ?? []).map((agent) => ({
    ...agent,
    statusFile: resolvePath(agent.statusFile, baseDir),
  }));
}
