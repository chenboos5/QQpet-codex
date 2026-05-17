#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_STATUS_FILE = "~/.qqpet-agent/status/claude-code.json";

function expandHome(path) {
  if (path.startsWith("~/")) {
    return resolve(process.env.HOME ?? process.cwd(), path.slice(2));
  }
  return resolve(path);
}

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function actionFromToolInput(input = {}) {
  return firstText(
    input.command,
    input.description,
    input.file_path,
    input.path,
    input.pattern,
    input.url,
    input.prompt,
  );
}

export function eventFromClaudeHookInput(input = {}) {
  const hook = input.hook_event_name ?? "Unknown";
  const tool = input.tool_name ?? "Claude";
  const action = actionFromToolInput(input.tool_input);
  const base = {
    source: "claude-code",
    taskId: input.session_id ?? "claude-code",
    action,
    updatedAt: new Date().toISOString(),
  };

  switch (hook) {
    case "PermissionRequest":
      return {
        ...base,
        type: "permission_required",
        title: "Claude Code needs permission",
        detail: action || `${tool} permission request`,
      };
    case "PreToolUse":
      return {
        ...base,
        type: "tool_call",
        title: `Claude Code: ${tool}`,
        detail: action || `${tool} running`,
      };
    case "PostToolUseFailure":
    case "StopFailure":
      return {
        ...base,
        type: "error",
        title: `Claude Code ${hook === "StopFailure" ? "turn" : tool} failed`,
        detail: action || "Claude Code needs attention",
      };
    case "TaskCompleted":
      return {
        ...base,
        type: "done",
        title: input.task_subject ? `Claude Code completed: ${input.task_subject}` : "Claude Code task completed",
        detail: input.task_description ?? input.task_subject ?? "Task completed",
      };
    case "Stop":
    case "SessionEnd":
      return {
        ...base,
        type: "done",
        title: "Claude Code finished",
        detail: firstText(input.last_assistant_message, input.reason, "Finished"),
      };
    case "Notification":
      return {
        ...base,
        type: input.notification_type === "permission_prompt" ? "permission_required" : "working",
        title: "Claude Code notification",
        detail: firstText(input.message, input.notification_type, "Notification"),
      };
    default:
      return {
        ...base,
        type: "working",
        title: `Claude Code: ${hook}`,
        detail: action || hook,
      };
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const raw = await readStdin();
  const input = raw.trim().length > 0 ? JSON.parse(raw) : {};
  const event = eventFromClaudeHookInput(input);
  const statusFile = expandHome(process.env.QQPET_STATUS_FILE ?? DEFAULT_STATUS_FILE);
  await mkdir(dirname(statusFile), { recursive: true });
  await writeFile(statusFile, JSON.stringify(event, null, 2) + "\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error?.stack ?? String(error));
    process.exit(1);
  });
}
