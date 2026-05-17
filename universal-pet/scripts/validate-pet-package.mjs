#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requiredStates = new Set([
  "idle",
  "running-right",
  "running-left",
  "waving",
  "jumping",
  "failed",
  "waiting",
  "running",
  "review",
]);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function validatePetPackage(assetDir) {
  const absoluteAssetDir = resolve(assetDir);
  const manifestPath = resolve(absoluteAssetDir, "pet.json");
  const manifest = await readJson(manifestPath);
  const spritesheetPath = resolve(dirname(manifestPath), manifest.spritesheetPath ?? "spritesheet.png");
  await access(spritesheetPath);

  const warnings = [];
  const mappingPath = resolve(absoluteAssetDir, "source-mapping.json");
  try {
    const mapping = await readJson(mappingPath);
    const states = new Set(Array.isArray(mapping) ? mapping.map((entry) => entry?.state) : []);
    for (const state of requiredStates) {
      if (!states.has(state)) warnings.push(`Missing animation state in source-mapping.json: ${state}`);
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push("source-mapping.json is missing; default one-frame rows will be used");
    } else {
      throw error;
    }
  }

  return {
    ok: true,
    id: manifest.id ?? basename(absoluteAssetDir),
    displayName: manifest.displayName ?? manifest.id ?? basename(absoluteAssetDir),
    spritesheetPath,
    warnings,
  };
}

async function main() {
  const assetDir = process.argv[2];
  if (!assetDir) {
    console.error("Usage: node scripts/validate-pet-package.mjs <pet-asset-dir>");
    process.exit(2);
  }

  const result = await validatePetPackage(assetDir);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error?.stack ?? String(error));
    process.exit(1);
  });
}
