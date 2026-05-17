import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { readConfiguredAgentEvents } from "../src/adapters/file-status-adapter.mjs";

test("reads configured agent status files and normalizes events", async () => {
  const dir = await mkdtemp(join(tmpdir(), "qqpet-universal-"));
  try {
    const codexPath = join(dir, "codex.json");
    const cursorPath = join(dir, "cursor.json");

    await writeFile(codexPath, JSON.stringify({
      type: "tool_call",
      taskId: "codex-1",
      title: "Run tests",
      progress: 25,
    }));

    await writeFile(cursorPath, JSON.stringify([
      {
        type: "permission_required",
        taskId: "cursor-1",
        title: "Install package",
        action: "pnpm install",
      },
    ]));

    const events = await readConfiguredAgentEvents([
      { id: "codex", statusFile: codexPath },
      { id: "cursor", statusFile: cursorPath },
    ]);

    assert.equal(events.length, 2);
    assert.deepEqual(events.map((event) => event.agent), ["codex", "cursor"]);
    assert.equal(events[0].phase, "running");
    assert.equal(events[1].phase, "needs_authorization");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("keeps missing status files from breaking the pet", async () => {
  const events = await readConfiguredAgentEvents([
    { id: "claude-code", statusFile: "/tmp/does-not-exist-qqpet.json" },
  ]);

  assert.equal(events.length, 1);
  assert.equal(events[0].agent, "claude-code");
  assert.equal(events[0].phase, "idle");
});
