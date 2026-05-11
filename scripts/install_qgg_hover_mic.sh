#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSET_DIR="$SKILL_DIR/assets/qgg-hover-mic"

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
TARGET_DIR="$CODEX_HOME/pets/qgg-hover-mic"

required_files=(
  "pet.json"
  "spritesheet.png"
  "source-mapping.json"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$ASSET_DIR/$file" ]]; then
    echo "Missing bundled asset: $ASSET_DIR/$file" >&2
    exit 1
  fi
done

mkdir -p "$TARGET_DIR"

for file in "${required_files[@]}"; do
  cp "$ASSET_DIR/$file" "$TARGET_DIR/$file"
done

echo "Installed QGG Hover Mic pet to: $TARGET_DIR"
echo "Restart Codex or refresh the pet list, then select: QGG Hover Mic"
echo "已安装 QGG Hover Mic 宠物到：$TARGET_DIR"
echo "请重启 Codex 或刷新宠物列表，然后选择：QGG Hover Mic"
