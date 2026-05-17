const RUNNING_TYPES = new Set(["running", "working", "tool_call", "thinking", "streaming"]);
const AUTH_TYPES = new Set(["permission_required", "needs_authorization", "approval_required", "confirm"]);
const DONE_TYPES = new Set(["done", "complete", "completed", "success"]);
const ERROR_TYPES = new Set(["error", "failed", "failure", "interrupted"]);
const IDLE_TYPES = new Set(["idle", "sleeping", "waiting"]);

function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function eventKind(rawEvent) {
  return String(rawEvent.type ?? rawEvent.kind ?? rawEvent.status ?? "idle").toLowerCase();
}

function eventPhase(kind) {
  if (AUTH_TYPES.has(kind)) return "needs_authorization";
  if (DONE_TYPES.has(kind)) return "done";
  if (ERROR_TYPES.has(kind)) return "failed";
  if (RUNNING_TYPES.has(kind)) return "running";
  if (IDLE_TYPES.has(kind)) return "idle";
  return "running";
}

export function normalizeAgentEvent(rawEvent = {}) {
  const kind = eventKind(rawEvent);
  const phase = eventPhase(kind);
  const title = firstText(rawEvent.title, rawEvent.summary, rawEvent.task, rawEvent.name);
  const action = firstText(rawEvent.action, rawEvent.command, rawEvent.tool, rawEvent.detail);
  const message = firstText(rawEvent.detail, rawEvent.message, rawEvent.summary, action, title);

  return {
    agent: firstText(rawEvent.source, rawEvent.agent, rawEvent.provider) || "unknown-agent",
    taskId: firstText(rawEvent.taskId, rawEvent.session_id, rawEvent.sessionId, rawEvent.id) || "default",
    title: title || "Agent task",
    message,
    action,
    phase,
    progress: clampProgress(rawEvent.progress ?? rawEvent.percent_complete ?? rawEvent.percentComplete),
    requiresAuthorization: phase === "needs_authorization",
    integration: rawEvent.integration,
    updatedAt: rawEvent.updatedAt ?? new Date().toISOString(),
    rawType: kind,
  };
}

export function selectPetState(event) {
  const normalized = event.phase ? event : normalizeAgentEvent(event);
  const title = normalized.title || normalized.agent;

  switch (normalized.phase) {
    case "needs_authorization":
      return {
        animation: "review",
        priority: "urgent",
        message: `${title}: waiting for permission${normalized.action ? ` (${normalized.action})` : ""}`,
      };
    case "running":
      return {
        animation: "running",
        priority: "normal",
        message: normalized.progress === null
          ? `${title}: working`
          : `${title}: ${normalized.progress}%`,
      };
    case "done":
      return {
        animation: "waving",
        priority: "normal",
        message: `${title}: finished`,
      };
    case "failed":
      return {
        animation: "failed",
        priority: "urgent",
        message: `${title}: needs attention`,
      };
    case "idle":
    default:
      return {
        animation: "idle",
        priority: "low",
        message: `${normalized.agent}: idle`,
      };
  }
}
