# Branch README: universal-agent-pet

This branch is a living note for the `universal-agent-pet` experiment. Keep it updated whenever the branch changes direction, adds an adapter, changes a state mapping, or learns a new limit.

这个文件是 `universal-agent-pet` 分支的持续更新说明。后续只要分支方向、agent adapter、状态映射、边界判断发生变化，都可以继续补在这里。

## Current Split / 当前分工

| Area | Purpose | Stable or Experimental |
| --- | --- | --- |
| Main pet package / 本体 | Install `QQpet-codex` as a Codex desktop pet with bundled QQPet QGG animations. | Stable package behavior |
| Universal branch / 当前分支 | Explore QQpet-codex as a shared status companion for Codex, Claude Code, Cursor, OpenCode, and other coding agents. | Experimental local prototype |

## Main Pet Package / 本体功能

The repository's stable core is still the Codex pet package:

- Installs to `${CODEX_HOME:-$HOME/.codex}/pets/QQpet-codex`.
- Ships `pet.json`, `spritesheet.png`, and `source-mapping.json`.
- Keeps the current animation mapping:
  - `idle`: resting pose
  - `running-right` and `running-left`: movement
  - `waving`: microphone pose
  - `jumping`: large-motion hover animation
  - `failed`: failed or interrupted state
  - `waiting`: sleep or waiting state
  - `running`: active task state
  - `review`: instrument-checking review state
- Uses `scripts/install_QQpet_codex.sh` as the reversible local installer.
- Is described by `SKILL.md`, `README.md`, and `agents/openai.yaml`.

本体可以理解为“把 QQpet-codex 安装进 Codex 的稳定宠物包”。它的目标是资源完整、安装清楚、动画映射稳定。

## Branch Prototype / 分支功能

The `universal-agent-pet` branch adds a local prototype around the stable pet package. It does not replace the Codex pet install flow.

Current branch additions:

- `universal-pet/`: local browser console for viewing multiple coding-agent states.
- Shared state machine that normalizes events into `idle`, `running`, `waiting`, `review`, `failed`, and done-like UI states.
- Codex session adapter that reads local Codex rollout JSONL from `${CODEX_HOME:-~/.codex}/sessions`.
- Status-file adapter for any agent that can write a small JSON file.
- Claude Code hook writer that outputs `~/.qqpet-agent/status/claude-code.json`.
- Sample status files for Codex, Claude Code, Cursor, and OpenCode.
- Custom pet package loading, so the same status layer can drive a different spritesheet package.
- Package validator for checking `pet.json`, spritesheet paths, and optional source mappings.

分支可以理解为“让同一只宠物看懂多个 coding agent 状态”的实验层。它把 agent 进度、授权请求、失败、完成等事件转成统一宠物状态，再用 QQpet-codex 的动画表现出来。

## Current Version / 当前版本

- Branch: `universal-agent-pet`
- Version tag: `v0.1.0`
- Initial prototype commit: `60ebd4b Add universal agent pet prototype`
- Status: local prototype, pushed to GitHub

The branch head can move as this README and the prototype keep evolving. Treat `v0.1.0` as the first tagged prototype snapshot, not the end state of the branch.

## How To Run / 如何运行

```bash
cd universal-pet
npm test
npm start
```

Open:

```text
http://localhost:8787
```

Validate the bundled pet package:

```bash
cd universal-pet
npm run validate:pet
```

## What To Update Here / 后续怎么更新

Update this file when:

- A new agent gets a dedicated adapter.
- A state mapping changes.
- Claude Code, Cursor, OpenCode, or another agent moves from sample status file to real integration.
- The branch gains a release tag.
- The prototype graduates into the stable install path.
- A known limitation becomes solved or explicitly deferred.

## Update Log / 更新记录

| Date | Version | Notes |
| --- | --- | --- |
| 2026-05-17 | `v0.1.0` | Added the first universal-agent prototype with Codex rollout reading, file-status events, Claude Code hook output, custom pet package loading, docs, tests, and validator. |

## Next Notes / 下一步备忘

- Decide whether the universal console should stay branch-only or become part of the main README.
- Add real Cursor and OpenCode adapters if their local event surfaces are stable enough.
- Decide whether Codex approval alerts should prefer the `review` animation or a separate future animation row.
- Add screenshots or short recordings of the universal console once the UI settles.
