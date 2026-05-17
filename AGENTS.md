# Agent Notes

## Project

Codex desktop pet skill built from QQPet QGG animation assets.

## Before Editing

- Run `git status --short --branch`.
- Keep the packaged skill installable from a fresh checkout.

## Common Checks

```bash
bash scripts/install_QQpet_codex.sh
```

Only run install commands when the user wants to update the local Codex pet.

## Editing Guidelines

- Preserve `SKILL.md`, README, and `agents/openai.yaml` consistency.
- When changing animation assets or mappings, update previews and `CHANGELOG.md`.
- Do not rewrite generated binary assets unless the task is specifically about animation output.
- Keep install instructions reversible and clear.

## Release Notes

- Record every pet behavior, mapping, asset, or installer change in `CHANGELOG.md`.
