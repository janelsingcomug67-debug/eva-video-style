#!/usr/bin/env python3
"""把引擎 captions.py 生成的 .ass 字幕换成本技能的打包字体，并适配横 / 竖屏。

用法：python3 ass_style.py 字幕.ass [--vertical] [--y 字幕底边离画面顶的像素]
  - 字体：中文 Noto Sans SC Black，英文 Montserrat Bold（合成时 fontsdir 指向 engine/fonts）
  - 横屏：1920×1080，字幕在底部
  - 竖屏：1080×1920，左右各留 60 像素；--y 按版式给（个人事业口播四种形式见 vertical/ip.js 里的 capY）
"""
import argparse, re

ap = argparse.ArgumentParser(); ap.add_argument("ass"); ap.add_argument("--vertical", action="store_true"); ap.add_argument("--y", type=int)
a = ap.parse_args()
s = open(a.ass, encoding="utf-8").read()
W, H = (1080, 1920) if a.vertical else (1920, 1080)
margin_lr = 60 if a.vertical else 380
margin_v = (H - a.y) if a.y else (120 if a.vertical else 34)
s = re.sub(r"PlayResX: \d+", f"PlayResX: {W}", s); s = re.sub(r"PlayResY: \d+", f"PlayResY: {H}", s)
def style(line, font, size):
    f = line.split(",")
    f[1], f[2] = font, str(size)
    f[19], f[20], f[21] = str(margin_lr), str(margin_lr), str(margin_v)
    return ",".join(f)
out = []
for line in s.splitlines():
    if line.startswith("Style: CN,"): line = style(line, "Noto Sans SC Black", 62 if a.vertical else 56)
    elif line.startswith("Style: EN,"): line = style(line, "Montserrat", 36 if a.vertical else 34)
    elif line.startswith("Style: ENB,"): line = style(line, "Montserrat", 52 if a.vertical else 50)
    out.append(line)
open(a.ass, "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"字幕已换成打包字体：{W}×{H}，字幕底边在 y={H - margin_v}")
