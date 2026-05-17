import test from "node:test";
import assert from "node:assert/strict";

import { eventFromClaudeHookInput } from "../scripts/claude-hook-status.mjs";

test("maps Claude Code PermissionRequest to a QQpet authorization event", () => {
  const event = eventFromClaudeHookInput({
    session_id: "abc123",
    hook_event_name: "PermissionRequest",
    tool_name: "Bash",
    tool_input: {
      command: "npm install",
      description: "Install dependencies",
    },
    cwd: "/repo",
  });

  assert.equal(event.source, "claude-code");
  assert.equal(event.type, "permission_required");
  assert.equal(event.taskId, "abc123");
  assert.equal(event.title, "Claude Code needs permission");
  assert.equal(event.action, "npm install");
});

test("maps Claude Code tool and stop hooks to running and done events", () => {
  const running = eventFromClaudeHookInput({
    session_id: "abc123",
    hook_event_name: "PreToolUse",
    tool_name: "Edit",
    tool_input: {
      file_path: "/repo/src/app.ts",
    },
  });

  const done = eventFromClaudeHookInput({
    session_id: "abc123",
    hook_event_name: "Stop",
    last_assistant_message: "Done.",
  });

  assert.equal(running.type, "tool_call");
  assert.equal(running.title, "Claude Code: Edit");
  assert.equal(running.action, "/repo/src/app.ts");
  assert.equal(done.type, "done");
  assert.equal(done.title, "Claude Code finished");
});

test("maps Claude Code failures to failed events", () => {
  const event = eventFromClaudeHookInput({
    session_id: "abc123",
    hook_event_name: "PostToolUseFailure",
    tool_name: "Bash",
    tool_input: {
      command: "npm test",
    },
  });

  assert.equal(event.type, "error");
  assert.equal(event.action, "npm test");
});
