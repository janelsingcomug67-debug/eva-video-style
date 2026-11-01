#!/usr/bin/env python3
"""混音到目标响度：原声 + 音效（+ 可选 BGM），压缩 → 补增益 → 限幅，反复测量直到响度落在目标 ±0.3 LU。

用法：python3 mix.py 原片或人声 音效.wav 输出.wav [--dur 秒数] [--bgm 音乐文件] [--target -14] [--bgm-db -11]
  - 没有人声（模块一动画片）：人声位置写 none，长度取 --dur（不写就跟音效一样长）
  - 样片：--dur 15 只混前 15 秒
  - 引擎自带的 assemble.sh 固定 −16 LUFS、只跑一遍 loudnorm，短片打不到目标，所以单独用这个脚本混
  - BGM：整体比人声低约 11 dB（--bgm-db 可改），首尾各淡入淡出 1 秒，长度跟人声一致
  - 最后打印实测 I（整体响度）和 Peak（真峰值）
"""
import argparse, re, subprocess, tempfile, os

ap = argparse.ArgumentParser()
ap.add_argument("voice"); ap.add_argument("sfx"); ap.add_argument("out")
ap.add_argument("--dur", type=float); ap.add_argument("--bgm"); ap.add_argument("--target", type=float, default=-14.0); ap.add_argument("--bgm-db", type=float, default=-11.0)
a = ap.parse_args()
if os.path.exists(a.out): raise SystemExit(f"不覆盖已有文件：{a.out}")
tmp = tempfile.mkdtemp()

def run(*args): subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args], check=True)
def measure(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]); p = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1])
    return i, p
def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)

voice = os.path.join(tmp, "voice.wav")
if a.voice == "none":
    run("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "%.3f" % (a.dur or dur(a.sfx)), voice)
else:
    run("-i", a.voice, "-vn", "-ac", "2", "-ar", "48000", *(["-t", "%.3f" % a.dur] if a.dur else []), voice)
D = dur(voice)
pre = os.path.join(tmp, "pre.wav")
run("-i", voice, "-i", a.sfx, "-filter_complex",
    "[1]aformat=channel_layouts=stereo,volume=0.8[s];[0][s]amix=inputs=2:normalize=0,atrim=0:%.3f" % D, "-ar", "48000", pre)
if a.bgm:
    vi = measure(voice)[0] if a.voice != "none" else a.target
    b = os.path.join(tmp, "bgm.wav"); run("-stream_loop", "-1", "-i", a.bgm, "-t", "%.3f" % D, "-ac", "2", "-ar", "48000", b)
    bi, _ = measure(b)
    g = vi + a.bgm_db - bi
    pre2 = os.path.join(tmp, "pre2.wav")
    run("-i", pre, "-i", b, "-filter_complex",
        f"[1]volume={g:.2f}dB,afade=t=in:d=1,afade=t=out:st={max(D - 1, 0):.3f}:d=1[m];[0][m]amix=inputs=2:normalize=0", "-ar", "48000", pre2)
    pre = pre2
i0, _ = measure(pre)
gain = a.target - i0 + 0.4
for _ in range(6):
    mixed = os.path.join(tmp, "mix.wav")
    run("-i", pre, "-af", f"acompressor=threshold=0.25:ratio=3:attack=5:release=120:makeup=1,volume={gain:.2f}dB,"
        "aresample=192000,alimiter=limit=0.8:attack=2:release=80:level=disabled,aresample=48000", "-ar", "48000", mixed)
    i, p = measure(mixed)
    if abs(i - a.target) <= 0.3 and p <= -1.0: break
    gain += a.target - i
if p > -1.0:   # 真峰值还高：整体再压 (p+1.2) dB，响度会略低于目标但不破音
    fixed = os.path.join(tmp, "fixed.wav"); run("-i", mixed, "-af", f"volume={-(p + 1.2):.2f}dB", "-ar", "48000", fixed)
    mixed = fixed; i, p = measure(mixed)
os.replace(mixed, a.out)
print(f"混音完成：I = {i:.1f} LUFS，Peak = {p:.1f} dBFS → {a.out}")
