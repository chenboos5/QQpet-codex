import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { readCodexSessionEvent } from "../src/adapters/codex-session-adapter.mjs";

async function writeCodexSession(codexHome, id, records) {
  const sessionDir = join(codexHome, "sessions", "2026", "05", "17");
  await mkdir(sessionDir, { recursive: true });
  await writeFile(
    join(codexHome, "session_index.jsonl"),
    JSON.stringify({ id, thread_name: "QQpet deep adapter", updated_at: "2026-05-17T10:10:00Z" }) + "\n",
  );
  const sessionPath = join(sessionDir, `rollout-2026-05-17T18-10-00-${id}.jsonl`);
  await writeFile(sessionPath, records.map((record) => JSON.stringify(record)).join("\n") + "\n");
  return sessionPath;
}

test("detects pending Codex approval requests from rollout JSONL", async () => {
  const codexHome = await mkdtemp(join(tmpdir(), "qqpet-codex-home-"));
  try {
    await writeCodexSession(codexHome, "session-approval", [
      {
        timestamp: "2026-05-17T10:10:01.000Z",
        type: "response_item",
        payload: {
          type: "function_call",
          name: "exec_command",
          call_id: "call_1",
          arguments: JSON.stringify({
            cmd: "npm start",
            sandbox_permissions: "require_escalated",
            justification: "Need local preview",
          }),
        },
      },
    ]);

    const event = await readCodexSessionEvent({ id: "codex", codexHome });

    assert.equal(event.agent, "codex");
    assert.equal(event.phase, "needs_authorization");
    assert.equal(event.requiresAuthorization, true);
    assert.equal(event.integration, "codex-session");
    assert.equal(event.action, "npm start");
    assert.match(event.message, /Need local preview/);
  } finally {
    await rm(codexHome, { recursive: true, force: true });
  }
});

test("maps unmatched running calls and task completion from Codex rollout JSONL", async () => {
  const codexHome = await mkdtemp(join(tmpdir(), "qqpet-codex-home-"));
  try {
    await writeCodexSession(codexHome, "session-running", [
      {
        timestamp: "2026-05-17T10:11:01.000Z",
        type: "response_item",
        payload: {
          type: "function_call",
          name: "exec_command",
          call_id: "call_2",
          arguments: JSON.stringify({ cmd: "npm test" }),
        },
      },
    ]);

    const running = await readCodexSessionEvent({ id: "codex", codexHome });
    assert.equal(running.phase, "running");
    assert.equal(running.action, "npm test");

    await writeCodexSession(codexHome, "session-done", [
      {
        timestamp: "2026-05-17T10:12:01.000Z",
        type: "event_msg",
        payload: { type: "task_complete" },
      },
    ]);

    const done = await readCodexSessionEvent({ id: "codex", codexHome });
    assert.equal(done.phase, "done");
  } finally {
    await rm(codexHome, { recursive: true, force: true });
  }
});
