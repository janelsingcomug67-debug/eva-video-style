#!/bin/bash
# 每次新开云端会话自动装好「AI 剪辑课」的两个技能（eva-video-style + ai-video-course）和依赖。
# 已经装好的步骤会自动跳过。
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

REPO="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
SK="$HOME/.claude/skills"
EVA="$SK/eva-video-style"
MAGS="$SK/ai-video-course"
mkdir -p "$SK"

# 1. 剪辑引擎：复制仓库本身（不含 .git、课程文件和 hook 配置）
if [ ! -f "$EVA/engine/engine.js" ]; then
  mkdir -p "$EVA"
  tar -C "$REPO" --exclude=./.git --exclude=./course --exclude=./.claude --exclude=./node_modules -cf - . | tar -C "$EVA" -xf -
fi

# 2. 课程技能：从仓库里的 course/ai-video-course 复制（含字体）
if [ ! -f "$MAGS/fonts/NotoSansSC-Black.otf" ]; then
  rm -rf "$MAGS"
  cp -a "$REPO/course/ai-video-course" "$MAGS"
fi

# 3. 视频工具 ffmpeg（必须带 libass）
if ! ffmpeg -hide_banner -filters 2>/dev/null | grep -q " subtitles "; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq -o Dpkg::Options::=--force-confold ffmpeg
fi

# 4. 引擎的 Node 依赖：配套云端预装 Chromium 的 playwright 1.63.0
if [ "$(node -p "try{require('$EVA/node_modules/playwright/package.json').version}catch(e){''}")" != "1.63.0" ]; then
  (cd "$EVA" && npm install --no-save --no-audit --no-fund playwright@1.63.0)
fi

# 5. Python 依赖（版本锁死，av 不能用 19）
if ! python3 -c "import faster_whisper, av, numpy; assert av.__version__ == '15.1.0' and faster_whisper.__version__ == '1.2.1'" 2>/dev/null; then
  python3 -m pip install -q "faster-whisper==1.2.1" "av==15.1.0" numpy \
    || python3 -m pip install -q --break-system-packages "faster-whisper==1.2.1" "av==15.1.0" numpy
fi

echo "AI 剪辑课技能已就绪"
