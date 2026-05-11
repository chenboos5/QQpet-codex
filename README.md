# QQpet-codex

QGG Hover Mic is a custom Codex desktop pet converted from QQPet QGG assets. It includes a microphone hover animation and comes packaged as a Codex skill for easy installation.

QGG Hover Mic 是一个由 QQ 宠物 QGG 素材转换而来的 Codex 桌面宠物，hover 状态使用麦克风动作，并以 Codex skill 的形式打包，方便安装和分享。

## Preview / 动画预览

| State / 状态 | Screenshot / 截图 | Source / 来源 |
| --- | --- | --- |
| Idle / 待机 | <img src="assets/previews/idle.png" width="96" alt="Idle preview"> | `1020010241.swf` |
| Running Right / 向右走 | <img src="assets/previews/running-right.png" width="96" alt="Running right preview"> | `1028020241.swf` |
| Running Left / 向左走 | <img src="assets/previews/running-left.png" width="96" alt="Running left preview"> | `1028020241.swf` mirrored |
| Waving / 招手 | <img src="assets/previews/waving.png" width="96" alt="Waving preview"> | `1023010221.swf` |
| Hover Mic / hover 麦克风 | <img src="assets/previews/hover-mic.png" width="96" alt="Hover microphone preview"> | `1023010221.swf` |
| Failed / 失败 | <img src="assets/previews/failed.png" width="96" alt="Failed preview"> | `1020000541.swf` |
| Waiting Sleep / 等待睡觉 | <img src="assets/previews/waiting-sleep.png" width="96" alt="Waiting sleep preview"> | `1020041221.swf` |
| Running Active / 运行中 | <img src="assets/previews/running-active.png" width="96" alt="Running active preview"> | `1020070521.swf` |
| Review Book / 读书检查 | <img src="assets/previews/review-book.png" width="96" alt="Review book preview"> | `1020100221.swf` |

## Install / 安装

Clone this repository into your Codex skills folder:

将仓库克隆到 Codex 的 skills 目录：

```bash
git clone https://github.com/chenboos5/QQpet-codex.git ~/.codex/skills/qgg-hover-mic-pet
```

Run the installer:

运行安装脚本：

```bash
bash ~/.codex/skills/qgg-hover-mic-pet/scripts/install_qgg_hover_mic.sh
```

The pet will be installed to:

宠物会安装到：

```bash
~/.codex/pets/qgg-hover-mic
```

Then restart Codex or refresh the pet list, and select `QGG Hover Mic`.

然后重启 Codex 或刷新宠物列表，选择 `QGG Hover Mic`。

## Included / 包含内容

- `SKILL.md`: Codex skill instructions / Codex skill 说明
- `scripts/install_qgg_hover_mic.sh`: installer / 安装脚本
- `assets/qgg-hover-mic/pet.json`: pet metadata / 宠物配置
- `assets/qgg-hover-mic/spritesheet.png`: pet animation sheet / 宠物动画图集
- `assets/qgg-hover-mic/source-mapping.json`: source animation mapping / 源动画映射
- `assets/previews/*.png`: README screenshots / README 预览截图

## Notes / 说明

- The installer copies bundled assets into your local Codex pets directory.
- No SWF conversion is required during installation.
- If `CODEX_HOME` is set, the installer uses `$CODEX_HOME/pets/qgg-hover-mic`; otherwise it uses `~/.codex/pets/qgg-hover-mic`.

- 安装脚本会把内置资源复制到本机 Codex pets 目录。
- 安装时不需要重新转换 SWF。
- 如果设置了 `CODEX_HOME`，会安装到 `$CODEX_HOME/pets/qgg-hover-mic`；否则安装到 `~/.codex/pets/qgg-hover-mic`。
