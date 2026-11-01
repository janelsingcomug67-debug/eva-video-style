---
name: ai-video-course
description: AI 剪辑课三个模块：模块一「一句话出片」（没有素材，靠一段描述出动画小片）、模块二「个人事业口播」（竖版 9:16，四种形式：IP 口播风格 / 杂志封面 / 卡片讲解 / 访谈宽幅）、模块三「横版杂志风」（16:9，四种配色：杂志米白 / 青柠撞色 / 科技蓝 / 暗黑金）。用户说「一句话出片」「XX 的一生」「个人事业口播」「竖版口播」「横版杂志风」，或给口播原片要成片时使用。依赖开源引擎 eva-video-style（同目录的兄弟技能）。
---

# AI 剪辑课

在开源引擎 Eva Video Style（`eva-video-style` 技能，MIT）上出片。本技能补了：杂志版式和人像框（`magazine.js`）、竖版个人事业口播四种形式（`vertical/ip.js`）、竖屏渲染（`scripts/render.mjs --size`）、打包字体（`fonts/`）、转写 / 字幕 / 混音脚本（`scripts/`），以及下面的出片规矩。引擎用法以 `eva-video-style/references/` 为准，本文件的规矩优先于引擎默认。

使用者是不懂技术的学员：全程用中文、说人话，每一步报一句进度，不要让用户碰终端，也不要解释技术细节。

## 三个模块各做什么

| 模块 | 用户怎么说 | 画幅 | 素材 | 模板 |
|---|---|---|---|---|
| 一 · 一句话出片 | 「做一条 XX 的一生……先出 15 秒样片」 | 用户说竖就竖，没说用竖版 | 不要素材 | 自己写 scenes.js（用 `K` 和 `MAG` 的零件），参考 `example/scenes.js` 的写法 |
| 二 · 个人事业口播 | 「用个人事业口播，<形式>，剪这条」 | 竖版 1080×1920 | 口播原片 | `vertical/example/`：f1 IP 口播风格（默认）/ f2 杂志封面 / f3 卡片讲解 / f4 访谈宽幅 |
| 三 · 横版杂志风 | 「用横版杂志风，<风格>，剪这条」 | 横版 1920×1080 | 口播原片 + 截图 / 录屏 | `example/`：paper 杂志米白（默认）/ lime 青柠撞色 / tech 科技蓝 / noir 暗黑金 |

## 用户的素材怎么认

学员按下面的名字起名后直接传进对话（也可以打成一个 zip 传）。先 `find / -xdev -type f \( -name '*原片*' -o -name '*逐字稿*' -o -name '*分镜*' -o -name 'BGM*' \) -not -path '*/proc/*' -not -path '*/skills/*' 2>/dev/null` 找到它们，复制进项目的 `raw/`、`media/`，不改原文件：

| 文件名 | 是什么 | 用在 |
|---|---|---|
| `原片.mp4`（或 `原片_片名.mp4`） | 口播原片 | 模块二、三 |
| `逐字稿.txt` | 口播稿，一句一行 | 改字幕错字 |
| `分镜01_讲到哪句.mp4/.png`、`分镜02_….png`… | 截图或录屏，编号就是讲到的先后顺序，下划线后面写讲到哪句话 | 模块三的素材镜头 |
| `BGM_曲名.mp3`（可选） | 可商用音乐 | 混音 |

名字不全也照常做：按文件类型和内容判断，拿不准的列出来问用户一句。分镜按编号顺序对到口播里最贴近下划线后文字的那句话。

用户没选形式或风格时，先各出一张截图给他挑（模块二：四种形式同一帧；模块三：四种配色同一帧），挑定了再出样片。

## 成片规矩（三个模块都要做到）

1. **字体**：只用 `fonts/` 里的两套——中文 Noto Sans SC Black，英文 Montserrat Bold。画面和字幕都用这两套。
2. **第一帧就是封面**：第 0 帧标题（口播片还有人像）就完整出现，不从白屏、黑屏淡入，不闪白。
3. **先样片后整片**：先出 15 秒样片 + 4 张关键帧截图给用户看，用户回「确认」再出整条。不覆盖原片，每一版放新文件夹（v1、v2…）。成片发给用户下载（网页版用文件卡片发）。
4. **不编内容**：画面上的字只写口播里说过的事（模块一只写用户描述里的内容）；不编数据、不编软件界面；讲到提示词时用原文。
5. **节奏**：1.5–4 秒换一个画面，每个画面只讲一个点，元素在说到那个词的那一刻弹出（时间取自转写的字级时间）。

口播片（模块二、三）另外：
6. **人像**：人要大，脸在框里居中，头顶到下巴完整，绝不裁脸。不整段用角落小圆头像（小圆只在讲录屏、提示词、素材时短暂出现）。原片人像偏小就把关键帧里的 `s` 调大（自动限幅，头始终完整）。
7. **素材撑满**：截图、录屏一律撑满框（`MAG.clip` 已是 object-fit: cover），不留黑边；素材底部自带文字用 `pos='50% 100%'`（贴底），顶部有字用 `pos='50% 0%'`，出截图确认字没被切。
8. **字幕**：中英双语，中文在上、英文在下，烧进画面，每行一个青柠色关键词。有逐字稿时以逐字稿为准改错字；SRT 文件也交给用户。
9. **声音**：保留原声，只加短音效。用户给了 BGM 才加，说话时比人声低约 11 dB（模块二纯口播低约 16 dB：`--bgm-db -16`）。整片 −14 LUFS。
10. **原片开头没说话的几秒先剪掉**；结尾说完留约 0.5 秒。
11. **口播红线**：不说、不写收入数字，不说「私信我」；别人的经历只能转述。碰到红线提醒用户剪掉或重录，不能只改字幕。

## 制作步骤

`EVA` = `eva-video-style` 技能目录，`MAGS` = 本技能目录。node 命令都在 `EVA` 目录下运行（它的 `node_modules` 在那里），渲染一律用 `MAGS/scripts/render.mjs`（比引擎原版多一个 `--size`）。

1. **建项目**：在 `~/作品/`（本机用用户指定的文件夹）里新建 `<片名>/v1/`，放 `engine/`（复制 `EVA/engine`）、`raw/`、`media/`、`sec/`、`out/`、`srt/`、`check/`。把 `MAGS/magazine.js`、`MAGS/vertical/ip.js`、`MAGS/vertical/vertical.css` 复制进 `engine/`，`MAGS/fonts/*.otf`、`*.ttf` 复制进 `engine/fonts/`。
2. **模块一**直接跳到第 7 步：复制 `MAGS/example/` 当 `s1/`；竖版在 `index.html` 里 engine.css 后面加一行 `<link rel="stylesheet" href="../engine/vertical.css">`，scenes.js 开头关掉人像窗 `C.evaKeys = [{ t: 0, d: 0, L: { x: 0, y: 0, w: 10, h: 10, o: 0 } }]`。把用户说的每一幕写成一个 `C.scene`，实心撞色、超大字、数字跳动、快速转场，最后一幕停 2 秒。15 秒样片要把所有幕都放进去（每幕约 2 秒，最后一幕留 3 秒），让用户看到完整起承转合；确认后整条按用户说的时长展开。没有口播：混音人声位置写 `none`（见第 11 步）。
3. **剪开头静音**：`ffmpeg -i 原片 -af silencedetect=n=-35dB:d=0.4 -f null -` 找第一段说话前的静音，从说话前约 0.3 秒开始：`ffmpeg -ss <起点> -i 原片 -r 30 -c:v libx264 -crf 16 -c:a aac -b:a 256k raw/talk.mp4`。之后所有时间都以 `talk.mp4` 为准。
4. **转写**（用户没给逐字稿就先问一句要不要发；没有也照做，把拿不准的词列出来请用户确认，比如「提示词」常被听成「体质词」）：`python3 MAGS/scripts/transcribe.py raw/talk.mp4 srt [medium] [逐字稿.txt]`，得到 `srt/words.json`（字级时间）和 `srt/cn.srt`。下载模型报 403 / CONNECT tunnel failed 时，看文末「网页版网络」。
5. **双语字幕**：对照逐字稿改错字，长句按停顿拆成 1–2.5 秒的短句，逐句翻成自然的英文。写一份 SRT：先放全部中文条，再放全部英文条（英文条时间和对应中文条一样），存 `srt/talk_CN-EN.srt`。
6. **抽帧、量人脸**：`EVA/scripts/extract_frames.sh raw/talk.mp4 media/eva <宽>`，竖屏原片 `<宽>` 写 **1080**，横屏写 1920；素材也抽到 `media/<名字>/`。记下原片帧数。抽 3–4 帧量人头位置，填 `face: {x 脸中心, y 头中心, h 头高}`（占原片宽 / 高的比例）。
7. **写分段**（每段 15–40 秒，在停顿处切）：
   - **模块二**：复制 `MAGS/vertical/example/` 成 `s1/`，用对应形式的页面（`f1.html`…`f4.html`）。`IP.form({form, dir, srcW, srcH, face})` 搭底和人像；`IP.beats([{t, step, viz}])` 逐句出图形，`viz.type` 有 `big` 大字、`pills` 关键词胶囊、`vs` 对比卡、`flow` 流程箭头、`stamp` 红色印章，每个元素的 `at` 填说到那个词的时间（示例里的时间只是示范，必须按本片 `words.json` 重填）；第一个节拍 `t: 0` 放开场大字。
   - **模块三**：复制 `MAGS/example/` 成 `s1/`，按 `scenes.js` 里四种版式（A 开场封面 / B 素材镜头 + 小圆头像 / C 人像在右 / D 人像在左 + 关键词）改文字、时间、素材；`M.theme('paper'|'lime'|'tech'|'noir')` 选风格。`M.presenter` 的 `srcW/srcH` 填原片帧真实宽高——**不要用引擎自带的 Eva 窗口**，它按 16:9 算，竖屏会被拉伸或切头。
   - `C.src0` = 这一段在 `talk.mp4` 里的起始秒数（帧号 ÷ 30），`C.end` = 这一段时长，各段加起来等于原片帧数。后一段第一个人像关键帧要和前一段最后的位置一样。
8. **看截图**：`node MAGS/scripts/render.mjs <项目>/s1/<页面>.html [--size 1080x1920] --stills <项目>/check/s1 --times 0,1.5,4,8`，逐张查：头完整、字不压人像、素材不留黑边、字不出框、第 0 帧是完整封面、画面最下面留出字幕的位置。改到没问题再往下。
9. **渲染**：`node MAGS/scripts/render.mjs <页面> [--size 1080x1920] --out sec/s1.mp4`，再 `--cues sec/s1_cues.json` 导出音效点；多段用 `python3 EVA/scripts/merge_cues.py` 合并；`python3 EVA/scripts/sfx.py sec/all_cues.json <总秒数> sec/sfx.wav`。
10. **字幕文件**：`python3 EVA/scripts/captions.py srt/talk_CN-EN.srt 0 99999 out/<片名>_CN-EN srt/cfg.json`（`cfg.json` 写 `{"keys": [每句一个关键词]}`），再 `python3 MAGS/scripts/ass_style.py out/<片名>_CN-EN.ass`（竖版加 `--vertical --y <capY>`，capY 见 `vertical/ip.js` 里每种形式的值）。
11. **混音**（不用引擎的 `assemble.sh`，它固定 −16 LUFS）：`python3 MAGS/scripts/mix.py raw/talk.mp4 sec/sfx.wav sec/mix.wav [--dur 15] [--bgm 音乐.mp3] [--bgm-db -16]`（样片加 `--dur 15`；模块一没有人声把 `raw/talk.mp4` 换成 `none`），打印实测响度，应在 −14 ±0.3。
12. **合成**：多段先 concat 成 `sec/video.mp4`，再
    `ffmpeg -i sec/video.mp4 -i sec/mix.wav -vf "ass=out/<片名>_CN-EN.ass:fontsdir=engine/fonts" -map 0:v -map 1:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart out/<片名>.mp4`
13. **验收**：帧数等于这一版的时长 × 30（整片等于 `talk.mp4`，样片 450）；`ffmpeg -i 成片 -af ebur128=peak=true -f null -` 的 I 约 −14、Peak 不高于 −1；全片能完整解码；截 4 张关键帧（含第 0 帧）一起交给用户。

15 秒样片：只做第一个 15 秒的 `s1`，第 8–13 步照做。

## 实测耗时（网页版云端，15 秒样片）

转写 medium 约 40 秒（首次下载模型约 3 分钟）；渲染 450 帧约 50–80 秒；混音 3 秒；压字幕 10 秒。1 分钟成片渲染约 3–5 分钟，可以分段并行渲染。

## 常见坑

- `av` 必须 15.1.0（19 会报 metadata_errors），`faster-whisper` 用 1.2.1。
- Playwright 报 `Executable doesn't exist`：云端用 `npm install --no-save playwright@1.63.0`（配套云端预装的 Chromium）；本机用 `npx playwright install chromium`。
- 竖版画面只有左上角一块：渲染忘了加 `--size 1080x1920`，或页面没加载 `vertical.css`。
- 字幕中文变方块：检查合成命令里的 `fontsdir=engine/fonts`，以及第 10 步的 `ass_style.py` 有没有跑。
- 网页版网络：转写模型从 huggingface.co 下载，默认网络会 403。请用户点会话标题旁边的小箭头 ▾ →「编辑云环境」→ 网络访问选「自定义（Custom）」，勾上包管理器默认列表，Allowed domains 加三行 `huggingface.co`、`*.huggingface.co`、`*.hf.co`，保存后新开一个会话。用一句大白话说，不要贴技术解释。

## 授权

引擎 Eva Video Style 作者 RoverEva，MIT 许可（`scripts/render.mjs` 是在它的基础上加了 `--size`）；字体 Noto Sans SC、Montserrat 为 SIL OFL 1.1（许可文本在 `fonts/licenses/`）。只用用户自己的或有授权的真人出镜素材和音乐。
