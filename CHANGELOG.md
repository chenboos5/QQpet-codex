# Changelog

## v0.1.0 - 2026-05-17

- Added project agent notes and pull request template.
- Added `universal-pet/`, a local prototype for using QQpet-codex as a cross-agent coding pet.
- Added a shared state machine that normalizes Codex, Claude Code, Cursor, OpenCode, and generic agent events into pet states.
- Added a file-status adapter, sample multi-agent config, sample status files, and a browser console using the existing QQpet spritesheet.
- Added a deeper Codex session adapter that reads local rollout JSONL and detects active calls, completion, and `require_escalated` approval requests.
- Added a Claude Code hook writer and setup docs for routing Claude Code events into QQpet.
- Added configurable pet asset packages so users can swap in custom pet spritesheets and animation mappings without changing agent adapters.
- Documented current prototype limits in `docs/universal-agent-pet.md`.

## 2026-05-12

- Updated the hover animation to `1020090221.swf`.
- Updated the review animation to `1029200331.swf` with a larger fitted size.
- Kept the microphone animation in the waving state.
- Replaced static README screenshots with animated preview images.
- Updated README and skill metadata to describe the current animation set.
