#!/usr/bin/env python3
"""口播转写：faster-whisper 中文转写，输出字级时间和中文 SRT。

用法：python3 transcribe.py 原片.mp4 输出目录 [模型，默认 medium] [逐字稿.txt]
输出：输出目录/words.json（每段的字级时间）、输出目录/cn.srt（中文字幕，一句一条）
  - 有逐字稿时作为提示词喂给模型，错字会少很多；最后仍要人工对照逐字稿改一遍
  - small 模型中文不准（实测把「报告」听成「8 号」），默认用 medium
  - 需要 faster-whisper==1.2.1 + av==15.1.0；模型首次使用从 huggingface.co 下载（约 1.5 GB）
"""
import json, os, subprocess, sys, tempfile, time

src, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "medium"
script = open(sys.argv[4], encoding="utf-8").read().strip() if len(sys.argv) > 4 else ""
os.makedirs(out, exist_ok=True)

wav = os.path.join(tempfile.mkdtemp(), "a16.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)

from faster_whisper import WhisperModel
t0 = time.time()
model = WhisperModel(model_name, device="cpu", compute_type="int8")
prompt = "以下是普通话的句子，使用简体中文。" + (script[:200] if script else "")
segs, _ = model.transcribe(wav, language="zh", word_timestamps=True, initial_prompt=prompt, vad_filter=True)

def ts(t):
    ms = round(max(t, 0) * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

rows, srt = [], []
for i, s in enumerate(segs, 1):
    text = s.text.strip()
    rows.append({"start": s.start, "end": s.end, "text": text, "words": [[w.start, w.end, w.word] for w in (s.words or [])]})
    srt.append(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{text}\n")
    print(f"{s.start:6.2f} {s.end:6.2f} {text}")
json.dump(rows, open(os.path.join(out, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(out, "cn.srt"), "w", encoding="utf-8").write("\n".join(srt))
print(f"转写完成，用时 {time.time() - t0:.0f} 秒 → {out}/words.json, {out}/cn.srt")
