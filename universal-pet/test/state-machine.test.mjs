import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAgentEvent, selectPetState } from "../src/core/state-machine.mjs";

test("normalizes progress events from different agents into one task model", () => {
  const codex = normalizeAgentEvent({
    source: "codex",
    type: "tool_call",
    taskId: "task-1",
    title: "Update README",
    progress: 42,
    detail: "running tests",
  });

  const claude = normalizeAgentEvent({
    source: "claude-code",
    kind: "working",
    session_id: "session-2",
    summary: "Refactor adapter",
    percent_complete: 65,
  });

  assert.equal(codex.agent, "codex");
  assert.equal(codex.phase, "running");
  assert.equal(codex.progress, 42);
  assert.equal(codex.message, "running tests");
  assert.equal(claude.agent, "claude-code");
  assert.equal(claude.taskId, "session-2");
  assert.equal(claude.phase, "running");
  assert.equal(claude.progress, 65);
});

test("maps permission requests to the review animation and authorization alert", () => {
  const event = normalizeAgentEvent({
    source: "cursor",
    type: "permission_required",
    taskId: "task-3",
    title: "Install dependency",
    action: "npm install",
  });

  const petState = selectPetState(event);

  assert.equal(event.phase, "needs_authorization");
  assert.equal(event.requiresAuthorization, true);
  assert.equal(petState.animation, "review");
  assert.equal(petState.priority, "urgent");
  assert.match(petState.message, /Install dependency/);
});

test("maps terminal outcomes to stable pet animations", () => {
  assert.equal(selectPetState(normalizeAgentEvent({ source: "opencode", type: "done" })).animation, "waving");
  assert.equal(selectPetState(normalizeAgentEvent({ source: "codex", type: "error" })).animation, "failed");
  assert.equal(selectPetState(normalizeAgentEvent({ source: "codex", type: "idle" })).animation, "idle");
});
