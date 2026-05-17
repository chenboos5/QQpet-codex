# QQpet-codex

QQpet-codex is a custom Codex desktop pet converted from QQPet QGG assets. This version uses a larger motion hover animation, keeps the microphone animation as the waving state, and uses an instrument-checking animation for review.

QQpet-codex 是一个由 QQ 宠物 QGG 素材转换而来的 Codex 桌面宠物。当前版本把 hover 换成了动作更明显的动画，麦克风动作保留在 waving 状态，并把 review 换成了检查/操作仪器的动画。

## Preview / 动画预览

The previews below are animated PNGs generated from the bundled spritesheet. If they appear static in a Markdown client, open the image or view the repository on GitHub.

下面的预览图是从内置 spritesheet 生成的动态 PNG。如果某些 Markdown 客户端里看起来不动，可以打开图片或在 GitHub 页面查看。

| State / 状态 | Trigger / 触发语义 | Animated Preview / 动态预览 | Source / 来源 |
| --- | --- | --- | --- |
| `idle` / 待机 | Default resting pose / 默认待机 | <img src="assets/previews/idle.png" width="112" alt="Idle animation preview"> | `1020010241.swf` |
| `running-right` / 向右走 | Move right / 向右移动 | <img src="assets/previews/running-right.png" width="112" alt="Running right animation preview"> | `1028020241.swf` |
| `running-left` / 向左走 | Move left / 向左移动 | <img src="assets/previews/running-left.png" width="112" alt="Running left animation preview"> | `1028020241.swf` mirrored |
| `waving` / 招手 | Greeting fallback; microphone pose / 打招呼备用状态，麦克风动作 | <img src="assets/previews/waving.png" width="112" alt="Waving microphone animation preview"> | `1023010221.swf` |
| `jumping` / hover | Codex hover interaction / 鼠标悬浮触发 | <img src="assets/previews/hover.png" width="112" alt="Hover animation preview"> | `1020090221.swf` |
| `failed` / 失败 | Failed or interrupted state / 失败或中断状态 | <img src="assets/previews/failed.png" width="112" alt="Failed animation preview"> | `1020000541.swf` |
| `waiting` / 等待 | Waiting or idle timeout / 等待或长时间空闲 | <img src="assets/previews/waiting-sleep.png" width="112" alt="Waiting sleep animation preview"> | `1020041221.swf` |
| `running` / 运行中 | Active task state / 任务运行中 | <img src="assets/previews/running-active.png" width="112" alt="Running active animation preview"> | `1020070521.swf` |
| `review` / reviewing | Review mode; checking instrument / review 状态，检查/操作仪器 | <img src="assets/previews/review-instrument.png" width="112" alt="Review instrument animation preview"> | `1029200331.swf` |

## Install / 安装

Clone this repository into your Codex skills folder:

将仓库克隆到 Codex 的 skills 目录：

```bash
git clone https://github.com/chenboos5/QQpet-codex.git ~/.codex/skills/QQpet-codex
```

Run the installer:

运行安装脚本：

```bash
bash ~/.codex/skills/QQpet-codex/scripts/install_QQpet_codex.sh
```

The pet will be installed to:

宠物会安装到：

```bash
~/.codex/pets/QQpet-codex
```

Then restart Codex or refresh the pet list, and select `QQpet-codex`.

然后重启 Codex 或刷新宠物列表，选择 `QQpet-codex`。

## Included / 包含内容

- `SKILL.md`: Codex skill instructions / Codex skill 说明
- `scripts/install_QQpet_codex.sh`: installer / 安装脚本
- `assets/QQpet-codex/pet.json`: pet metadata / 宠物配置
- `assets/QQpet-codex/spritesheet.png`: pet animation sheet / 宠物动画图集
- `assets/QQpet-codex/source-mapping.json`: source animation mapping / 源动画映射
- `assets/previews/*.png`: animated README previews / README 动态预览
- `BRANCH_README.md`: living notes for the current experimental branch / 当前实验分支的持续更新说明
- `universal-pet/`: experimental cross-agent pet console / 跨 agent 通用宠物控制台实验
- `docs/universal-agent-pet.md`: prototype notes, event schema, and current limits / 原型说明、事件格式和当前边界

## Universal Agent Pet Prototype / 跨 Agent 通用宠物原型

This branch adds an experimental local console that lets QQpet-codex react to multiple coding agents through a shared status schema. It keeps the existing Codex pet package unchanged and adds a portable adapter layer for task progress and authorization alerts.

这个分支新增了一个本地原型控制台，让 QQpet-codex 可以通过统一的状态格式响应多个 coding agent。它不会破坏现有 Codex pet 资源包，而是在外层增加任务进度和授权提醒的通用适配层。

Run the prototype:

运行原型：

```bash
cd universal-pet
npm test
npm start
```

Open:

打开：

```text
http://localhost:8787
```

Codex now uses a deeper local session adapter that reads `${CODEX_HOME:-~/.codex}/sessions` and detects active tool calls, task completion, and `require_escalated` approval requests. Other agents can still use the local JSON status-file adapter.

Codex 现在会走更深一层的本地 session adapter，读取 `${CODEX_HOME:-~/.codex}/sessions`，识别工具调用、任务完成和 `require_escalated` 授权请求。其他 agent 仍然可以先用本地 JSON 状态文件适配。

Any non-Codex agent that can write this JSON shape can drive the pet:

任何能写入这个 JSON 格式的非 Codex agent 都可以驱动宠物：

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

See `docs/universal-agent-pet.md` for supported phases and current limits.

支持的状态和当前限制见 `docs/universal-agent-pet.md`。

Claude Code can be connected through official hooks. The bundled hook writer is:

Claude Code 可以通过官方 hooks 接入。内置 hook 写入脚本是：

```text
universal-pet/scripts/claude-hook-status.mjs
```

It writes to:

它会写入：

```text
~/.qqpet-agent/status/claude-code.json
```

Full Claude setup is in `docs/universal-agent-pet.md`.

完整 Claude 配置见 `docs/universal-agent-pet.md`。

The universal console can also load a custom pet asset package. Put `pet.json`, a spritesheet, and optional `source-mapping.json` in any local folder, then point `pet.assetDir` in `universal-pet/config/agents.sample.json` or your own config at that folder.

通用控制台也可以加载用户自定义宠物素材包。把 `pet.json`、spritesheet 和可选的 `source-mapping.json` 放进任意本地目录，然后在 `universal-pet/config/agents.sample.json` 或自己的配置里把 `pet.assetDir` 指向这个目录。

Validate a package:

校验素材包：

```bash
cd universal-pet
node scripts/validate-pet-package.mjs ../assets/QQpet-codex
```

## Notes / 说明

- The installer copies bundled assets into your local Codex pets directory.
- No SWF conversion is required during installation.
- If `CODEX_HOME` is set, the installer uses `$CODEX_HOME/pets/QQpet-codex`; otherwise it uses `~/.codex/pets/QQpet-codex`.

- 安装脚本会把内置资源复制到本机 Codex pets 目录。
- 安装时不需要重新转换 SWF。
- 如果设置了 `CODEX_HOME`，会安装到 `$CODEX_HOME/pets/QQpet-codex`；否则安装到 `~/.codex/pets/QQpet-codex`。
