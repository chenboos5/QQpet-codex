import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { loadPetPackage, petPackageClientPayload, safePetAssetPath } from "../src/core/pet-package.mjs";
import { validatePetPackage } from "../scripts/validate-pet-package.mjs";

async function writePetFixture() {
  const dir = await mkdtemp(join(tmpdir(), "qqpet-package-"));
  const configDir = join(dir, "config");
  const assetDir = join(dir, "pets", "custom-cat");
  await mkdir(configDir, { recursive: true });
  await mkdir(assetDir, { recursive: true });
  await writeFile(join(assetDir, "spritesheet.webp"), "fake-image");
  await writeFile(join(assetDir, "pet.json"), JSON.stringify({
    id: "custom-cat",
    displayName: "Custom Cat",
    description: "A local custom pet package",
    spritesheetPath: "spritesheet.webp",
    cellWidth: 64,
    cellHeight: 72,
    columns: 4,
    rows: 3,
    scale: 2,
  }));
  await writeFile(join(assetDir, "source-mapping.json"), JSON.stringify([
    { state: "idle", row: 0, frames: 2 },
    { state: "running", row: 1, frames: 4 },
  ]));
  const configPath = join(configDir, "agents.json");
  await writeFile(configPath, JSON.stringify({
    pet: { assetDir: "../pets/custom-cat" },
    agents: [],
  }));
  return { dir, configPath, assetDir };
}

test("loads a configured pet asset package for the browser UI", async () => {
  const fixture = await writePetFixture();
  try {
    const pet = await loadPetPackage(fixture.configPath);
    const payload = petPackageClientPayload(pet);

    assert.equal(pet.id, "custom-cat");
    assert.equal(pet.displayName, "Custom Cat");
    assert.equal(pet.cellWidth, 64);
    assert.equal(pet.cellHeight, 72);
    assert.equal(pet.columns, 4);
    assert.equal(pet.rows, 3);
    assert.equal(pet.scale, 2);
    assert.equal(payload.spritesheetUrl, "/pet-assets/spritesheet.webp");
    assert.deepEqual(payload.mapping.map((entry) => entry.state), ["idle", "running"]);
  } finally {
    await rm(fixture.dir, { recursive: true, force: true });
  }
});

test("loads the bundled QQpet package when no custom pet is configured", async () => {
  const dir = await mkdtemp(join(tmpdir(), "qqpet-default-package-"));
  try {
    const configPath = join(dir, "agents.json");
    await writeFile(configPath, JSON.stringify({ agents: [] }));

    const pet = await loadPetPackage(configPath);

    assert.equal(pet.id, "QQpet-codex");
    assert.equal(pet.spritesheetFile, "spritesheet.png");
    assert.equal(pet.mapping.some((entry) => entry.state === "review"), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("keeps served pet assets inside the configured package", async () => {
  const fixture = await writePetFixture();
  try {
    const pet = await loadPetPackage(fixture.configPath);
    assert.equal(safePetAssetPath(pet, "spritesheet.webp"), join(fixture.assetDir, "spritesheet.webp"));
    assert.throws(() => safePetAssetPath(pet, "../secrets.txt"), /inside the pet package/);
  } finally {
    await rm(fixture.dir, { recursive: true, force: true });
  }
});

test("validates custom pet packages", async () => {
  const fixture = await writePetFixture();
  try {
    const result = await validatePetPackage(fixture.assetDir);
    assert.equal(result.ok, true);
    assert.equal(result.id, "custom-cat");
    assert.equal(result.displayName, "Custom Cat");
    assert.match(result.spritesheetPath, /spritesheet\.webp$/);
  } finally {
    await rm(fixture.dir, { recursive: true, force: true });
  }
});
