import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { normalizeAgentEvent } from "../core/state-machine.mjs";

function codexHome(config = {}) {
  return resolve(config.codexHome ?? process.env.CODEX_HOME ?? join(process.env.HOME ?? "", ".codex"));
}

function safeJson(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

async function newestSessionId(home) {
  const indexPath = join(home, "session_index.jsonl");
  const content = await readFile(indexPath, "utf8");
  const records = content.trim().split("\n").map(safeJson).filter(Boolean);
  const latest = records.at(-1);
  return latest?.id ?? null;
}

async function findSessionFile(dir, sessionId) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findSessionFile(path, sessionId);
      if (found) return found;
    } else if (entry.isFile() && entry.name.includes(sessionId) && entry.name.endsWith(".jsonl")) {
      return path;
    }
  }
  return null;
}

async function recentRecords(path, maxLines = 300) {
  const content = await readFile(path, "utf8");
  return content.trim().split("\n").slice(-maxLines).map(safeJson).filter(Boolean);
}

function parseFunctionArguments(payload) {
  if (typeof payload?.arguments !== "string") return {};
  try {
    return JSON.parse(payload.arguments);
  } catch {
    return {};
  }
}

function commandText(args) {
  if (typeof args.cmd === "string") return args.cmd;
  if (Array.isArray(args.command)) return args.command.join(" ");
  return "";
}

function activeFunctionCalls(records) {
  const completed = new Set();
  for (const record of records) {
    const payload = record.payload;
    if (payload?.type === "function_call_output" || payload?.type === "custom_tool_call_output") {
      completed.add(payload.call_id);
    }
    if (record.type === "event_msg" && payload?.type?.endsWith?.("_end")) {
      completed.add(payload.call_id);
    }
  }

  return records
    .filter((record) => record.type === "response_item")
    .map((record) => record.payload)
    .filter((payload) => payload?.type === "function_call" || payload?.type === "custom_tool_call")
    .filter((payload) => payload.call_id && !completed.has(payload.call_id));
}

function latestTerminalEvent(records) {
  for (const record of records.toReversed()) {
    const payload = record.payload;
    if (record.type === "event_msg" && payload?.type === "task_complete") {
      return normalizeAgentEvent({
        source: "codex",
        type: "done",
        title: "Codex session",
        detail: "Task complete",
        updatedAt: record.timestamp,
      });
    }
  }
  return null;
}

export async function readCodexSessionEvent(config = {}) {
  const home = codexHome(config);
  const sessionId = config.sessionId ?? await newestSessionId(home);
  if (!sessionId) {
    return normalizeAgentEvent({ source: config.id ?? "codex", type: "idle", detail: "No Codex session found" });
  }

  const sessionsDir = join(home, "sessions");
  const sessionFile = config.sessionFile ?? await findSessionFile(sessionsDir, sessionId);
  if (!sessionFile) {
    return normalizeAgentEvent({ source: config.id ?? "codex", type: "idle", detail: "No rollout file found" });
  }

  const fileStat = await stat(sessionFile);
  const records = await recentRecords(sessionFile);
  const pendingCalls = activeFunctionCalls(records);
  const pendingApproval = pendingCalls
    .map((payload) => ({ payload, args: parseFunctionArguments(payload) }))
    .find(({ args }) => args.sandbox_permissions === "require_escalated");

  if (pendingApproval) {
    return normalizeAgentEvent({
      source: config.id ?? "codex",
      type: "permission_required",
      taskId: sessionId,
      title: "Codex approval request",
      action: commandText(pendingApproval.args) || pendingApproval.payload.name,
      detail: pendingApproval.args.justification ?? "Codex is waiting for approval",
      updatedAt: fileStat.mtime.toISOString(),
      integration: "codex-session",
    });
  }

  const pendingCall = pendingCalls.at(-1);
  if (pendingCall) {
    const args = parseFunctionArguments(pendingCall);
    return normalizeAgentEvent({
      source: config.id ?? "codex",
      type: "tool_call",
      taskId: sessionId,
      title: "Codex is running",
      action: commandText(args) || pendingCall.name,
      detail: commandText(args) || pendingCall.name,
      updatedAt: fileStat.mtime.toISOString(),
      integration: "codex-session",
    });
  }

  const terminal = latestTerminalEvent(records);
  if (terminal) return { ...terminal, agent: config.id ?? "codex", taskId: sessionId, integration: "codex-session" };

  return normalizeAgentEvent({
    source: config.id ?? "codex",
    type: "idle",
    taskId: sessionId,
    title: "Codex session",
    detail: "No active tool call",
    updatedAt: fileStat.mtime.toISOString(),
    integration: "codex-session",
  });
}
