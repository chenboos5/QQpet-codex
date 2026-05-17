import { access, readFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadUniversalConfig, resolvePath } from "./config.mjs";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const defaultAssetDir = resolve(repoRoot, "assets/QQpet-codex");

const defaultMapping = [
  { state: "idle", row: 0, frames: 1 },
  { state: "running-right", row: 1, frames: 1 },
  { state: "running-left", row: 2, frames: 1 },
  { state: "waving", row: 3, frames: 1 },
  { state: "jumping", row: 4, frames: 1 },
  { state: "failed", row: 5, frames: 1 },
  { state: "waiting", row: 6, frames: 1 },
  { state: "running", row: 7, frames: 1 },
  { state: "review", row: 8, frames: 1 },
];

function normalizeMapping(mapping) {
  if (!Array.isArray(mapping)) return defaultMapping;
  return mapping
    .filter((entry) => typeof entry?.state === "string")
    .map((entry) => ({
      ...entry,
      row: Number.isInteger(entry.row) ? entry.row : 0,
      frames: Number.isInteger(entry.frames) && entry.frames > 0 ? entry.frames : 1,
    }));
}

async function readOptionalJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

function assertInside(root, candidate) {
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith("../") || rel.startsWith("..\\")) {
    throw new Error(`Pet asset must stay inside the pet package: ${candidate}`);
  }
}

export function safePetAssetPath(petPackage, assetName) {
  const cleanName = decodeURIComponent(assetName).replace(/^\/+/, "");
  const assetPath = resolve(petPackage.assetDir, cleanName);
  assertInside(petPackage.assetDir, assetPath);
  return assetPath;
}

export async function loadPetPackage(configPath) {
  const { config, baseDir } = await loadUniversalConfig(configPath);
  const petConfig = config.pet ?? {};
  const assetDir = petConfig.assetDir ? resolvePath(petConfig.assetDir, baseDir) : defaultAssetDir;
  const manifestPath = petConfig.manifestPath
    ? resolvePath(petConfig.manifestPath, baseDir)
    : resolve(assetDir, "pet.json");
  const manifest = await readOptionalJson(manifestPath, {});
  const manifestDir = dirname(manifestPath);
  const spritesheetPath = resolve(manifestDir, petConfig.spritesheetPath ?? manifest.spritesheetPath ?? "spritesheet.png");
  assertInside(assetDir, spritesheetPath);
  await access(spritesheetPath);

  const mappingPath = petConfig.mappingPath
    ? resolvePath(petConfig.mappingPath, baseDir)
    : resolve(assetDir, "source-mapping.json");
  const mapping = normalizeMapping(await readOptionalJson(mappingPath, defaultMapping));
  const cellWidth = Number(petConfig.cellWidth ?? manifest.cellWidth ?? 192);
  const cellHeight = Number(petConfig.cellHeight ?? manifest.cellHeight ?? 208);
  const columns = Number(petConfig.columns ?? manifest.columns ?? 8);
  const rows = Number(petConfig.rows ?? manifest.rows ?? 9);

  return {
    id: petConfig.id ?? manifest.id ?? basename(assetDir),
    displayName: petConfig.displayName ?? manifest.displayName ?? petConfig.id ?? basename(assetDir),
    description: petConfig.description ?? manifest.description ?? "",
    assetDir,
    spritesheetPath,
    spritesheetFile: basename(spritesheetPath),
    spritesheetExt: extname(spritesheetPath),
    cellWidth,
    cellHeight,
    columns,
    rows,
    scale: Number(petConfig.scale ?? manifest.scale ?? 1.35),
    mapping,
  };
}

export function petPackageClientPayload(petPackage) {
  return {
    id: petPackage.id,
    displayName: petPackage.displayName,
    description: petPackage.description,
    spritesheetUrl: `/pet-assets/${encodeURIComponent(petPackage.spritesheetFile)}`,
    cellWidth: petPackage.cellWidth,
    cellHeight: petPackage.cellHeight,
    columns: petPackage.columns,
    rows: petPackage.rows,
    scale: petPackage.scale,
    mapping: petPackage.mapping,
  };
}
