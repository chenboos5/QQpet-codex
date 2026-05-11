---
name: qgg-hover-mic-pet
description: Install the bundled QGG Hover Mic Codex desktop pet, a QQPet QGG conversion with a microphone hover animation. Use when the user wants to install, restore, or share this custom Codex pet. 中文：安装、恢复或分享 QGG 麦克风 hover 版 Codex 桌面宠物。
---

# QGG Hover Mic Pet

## English

This skill installs a bundled Codex desktop pet into:

```bash
${CODEX_HOME:-$HOME/.codex}/pets/qgg-hover-mic
```

## Install

If this skill is already installed under Codex skills, run:

```bash
bash "${CODEX_HOME:-$HOME/.codex}/skills/qgg-hover-mic-pet/scripts/install_qgg_hover_mic.sh"
```

If you are inside the unpacked skill folder, run:

```bash
bash scripts/install_qgg_hover_mic.sh
```

After installation, restart Codex or refresh the pet list, then select `QGG Hover Mic`.

## What It Installs

- Pet id: `qgg-hover-mic`
- Display name: `QGG Hover Mic`
- Hover animation: microphone pose
- Assets: `pet.json`, `spritesheet.png`, and `source-mapping.json`

The installer verifies the bundled files before copying them.

## 中文

这个 skill 会把内置的 QGG 麦克风 hover 版 Codex 桌面宠物安装到：

```bash
${CODEX_HOME:-$HOME/.codex}/pets/qgg-hover-mic
```

### 安装

如果这个 skill 已经放在 Codex 的 skills 目录里，运行：

```bash
bash "${CODEX_HOME:-$HOME/.codex}/skills/qgg-hover-mic-pet/scripts/install_qgg_hover_mic.sh"
```

如果你正在解压后的 skill 文件夹里，运行：

```bash
bash scripts/install_qgg_hover_mic.sh
```

安装完成后，重启 Codex 或刷新宠物列表，然后选择 `QGG Hover Mic`。

### 安装内容

- 宠物 id：`qgg-hover-mic`
- 展示名称：`QGG Hover Mic`
- hover 动画：麦克风姿势
- 资源文件：`pet.json`、`spritesheet.png`、`source-mapping.json`

安装脚本会先检查内置资源是否齐全，再复制到 Codex 的 pets 目录。
