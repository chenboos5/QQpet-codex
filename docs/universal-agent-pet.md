# Universal Agent Pet Prototype

This branch explores QQpet-codex as a universal pet layer for multiple coding agents.

## Goal

Keep the QQpet animation package intact, then add a small adapter layer that can show:

- active task progress
- waiting-for-permission alerts
- done, failed, idle, and running states
- multiple agents in one view

The prototype supports two adapter depths:

- `codex-session`: reads local Codex rollout JSONL under `${CODEX_HOME:-~/.codex}/sessions` and `session_index.jsonl`.
- `statusFile`: reads a JSON status file written by any agent.

Codex gets the deeper local session adapter first. Claude Code, Cursor, OpenCode, or another runner can drive the pet by writing the same event shape until dedicated adapters are added.

## Install For Claude Code

Claude Code has official hooks. The practical install path is:

1. Run QQpet's local companion server.
2. Add Claude Code hooks that write `~/.qqpet-agent/status/claude-code.json`.
3. Keep the QQpet config pointed at that status file.

Run the companion:

```bash
cd universal-pet
npm start
```

Add this to `~/.claude/settings.json` for all Claude Code projects, or to `.claude/settings.json` inside one project:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/Users/chenboos/Documents/Codex/github-projects/QQpet-codex/universal-pet/scripts/claude-hook-status.mjs"]
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/Users/chenboos/Documents/Codex/github-projects/QQpet-codex/universal-pet/scripts/claude-hook-status.mjs"]
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/Users/chenboos/Documents/Codex/github-projects/QQpet-codex/universal-pet/scripts/claude-hook-status.mjs"]
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/Users/chenboos/Documents/Codex/github-projects/QQpet-codex/universal-pet/scripts/claude-hook-status.mjs"]
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/Users/chenboos/Documents/Codex/github-projects/QQpet-codex/universal-pet/scripts/claude-hook-status.mjs"]
          }
        ]
      }
    ]
  }
}
```

Claude Code normally picks up direct settings edits automatically. You can also run `/hooks` inside Claude Code to inspect whether the hooks are registered.

The default output path is:

```text
~/.qqpet-agent/status/claude-code.json
```

To use a different path, set `QQPET_STATUS_FILE` in the hook command environment and update `universal-pet/config/agents.sample.json` to match.

## Custom Pet Assets

The universal console separates agent state from pet visuals. Codex, Claude Code, Cursor, OpenCode, and future adapters can all drive the same state layer while the user swaps the pet package.

A pet package is a local folder:

```text
my-pet/
├── pet.json
├── spritesheet.png
└── source-mapping.json
```

`spritesheet.webp` also works. The bundled QQpet package uses a 9-row animation sheet with 8 columns and 192x208 cells, but the browser console can read custom dimensions from config or from `pet.json`.

Minimal `pet.json`:

```json
{
  "id": "my-pet",
  "displayName": "My Pet",
  "description": "A custom agent pet.",
  "spritesheetPath": "spritesheet.png",
  "cellWidth": 192,
  "cellHeight": 208,
  "columns": 8,
  "rows": 9,
  "scale": 1.35
}
```

Optional `source-mapping.json`:

```json
[
  { "state": "idle", "row": 0, "frames": 6 },
  { "state": "running-right", "row": 1, "frames": 8 },
  { "state": "running-left", "row": 2, "frames": 8 },
  { "state": "waving", "row": 3, "frames": 4 },
  { "state": "jumping", "row": 4, "frames": 5 },
  { "state": "failed", "row": 5, "frames": 8 },
  { "state": "waiting", "row": 6, "frames": 6 },
  { "state": "running", "row": 7, "frames": 6 },
  { "state": "review", "row": 8, "frames": 8 }
]
```

Point the universal config at the custom folder:

```json
{
  "pet": {
    "id": "my-pet",
    "displayName": "My Pet",
    "assetDir": "/Users/me/Pictures/agent-pets/my-pet",
    "cellWidth": 192,
    "cellHeight": 208,
    "columns": 8,
    "rows": 9,
    "scale": 1.35
  },
  "agents": []
}
```

Validate the package before running:

```bash
cd universal-pet
node scripts/validate-pet-package.mjs /Users/me/Pictures/agent-pets/my-pet
```

The validator checks `pet.json`, the referenced spritesheet, and warns if `source-mapping.json` does not include the expected agent states. Missing mapping is allowed, but the console will fall back to one-frame default rows.

## Event Shape

```json
{
  "source": "codex",
  "type": "tool_call",
  "taskId": "task-1",
  "title": "Update README",
  "progress": 42,
  "detail": "running tests"
}
```

Permission requests use:

```json
{
  "source": "cursor",
  "type": "permission_required",
  "taskId": "task-2",
  "title": "Install dependency",
  "action": "pnpm install"
}
```

Supported phase inputs:

- running: `running`, `working`, `tool_call`, `thinking`, `streaming`
- authorization: `permission_required`, `needs_authorization`, `approval_required`, `confirm`
- done: `done`, `complete`, `completed`, `success`
- failed: `error`, `failed`, `failure`, `interrupted`
- idle: `idle`, `sleeping`, `waiting`

## Prototype

```bash
cd universal-pet
npm test
npm start
```

Then open:

```text
http://localhost:8787
```

The sample config is `universal-pet/config/agents.sample.json`. Codex uses the local session adapter. Other configured agents point to local status files. Missing files become idle states instead of breaking the pet.

```json
{
  "id": "codex",
  "displayName": "Codex",
  "adapter": "codex-session"
}
```

## What Works Now

- A shared state machine for Codex, Claude Code, Cursor, OpenCode, and other agents.
- A Codex session adapter that reads local rollout JSONL and detects active tool calls, task completion, and `require_escalated` approval requests.
- A Claude Code hook writer that records tool activity, permission requests, task completion, and failures into a QQpet-readable status file.
- A configurable pet package loader so users can point the console at their own local spritesheet and mapping.
- A file-status adapter that can read one event or an array of events per non-Codex agent.
- A local browser UI that can use the existing QQpet spritesheet or a custom pet package.
- Authorization requests trigger the `review` animation and an urgent bubble.
- Running tasks show progress and use the `running` animation.
- Done, failed, and idle states map to existing QQpet animations.

## What Is Not Solved Yet

- It does not inject new UI into the Codex Desktop pet renderer.
- It cannot approve permissions inside those products; it only surfaces the request.
- It reads local Codex session state, but cannot access private internal state from Claude Code, Cursor, or OpenCode unless those products expose logs, events, or a hook.
- It is a browser-based companion, not a native floating desktop window.
- It does not yet include an in-browser upload/gallery UI for managing custom pet packages.
- It does not yet generate spritesheets from arbitrary images; users need to provide a ready spritesheet package.
- It does not yet persist pet mood, XP, friendship, or long-term memory.

## Why Native Codex Pet Injection Is Limited

The local pet contract currently found on this machine only defines a manifest and a fixed 8x9 spritesheet package:

```text
${CODEX_HOME:-$HOME/.codex}/pets/<pet-name>/
├── pet.json
└── spritesheet.webp
```

There is no public JavaScript runtime, event subscription, permission callback, or custom renderer entry in that contract. The Codex app bundle does include UI strings for approval request cards and avatar waiting states, which means the first-party app has internal UI for those moments, but that does not expose a custom pet plugin API.

So the deepest safe integration available from this repo today is:

1. Use Codex's native pet package for the visual asset.
2. Read Codex's local session JSONL as a status source.
3. Run a companion UI that mirrors Codex progress and approval requests.

Changing the native Codex app renderer would require patching the signed Electron app bundle, which is brittle across updates and not a reasonable product path.

## Competitive Pattern To Match

For the next iteration, the closest known patterns are:

- Clawd on Desk: adapter-based multi-agent dashboard, permission bubble, task/session awareness.
- Happy: remote control, phone notifications, and approval flows.
- Buddy: long-term companion layer with memory, XP, and guard mode.
- VS Code Pets and Codex pet galleries: lightweight animation and collectible pet packaging.

The practical path is to keep this repo compatible with Codex pet assets while moving the agent control layer into a portable adapter system.
