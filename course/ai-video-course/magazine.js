/* 横版杂志风 · 版式助手（给 Eva Video Style 引擎用，放在 engine/ 里，在 templates.js 之后加载）
 * 解决两件引擎默认不管的事：
 *   1. 人像框按原片的真实宽高 cover 撑满（引擎自带的 Eva 窗口按 1920×1080 素材算，竖屏原片会被拉伸或切头）
 *   2. 杂志版式的常用零件：米白纸底、粗黑体大字、细线、FIG. 小字、撑满不留黑边的素材框
 * 用法见 example/scenes.js。 */
(function () {
  const C = window.EV, { el, lerp, clamp, ease, seq, setSrc } = C;
  /* 字体随模板一起走（fonts/ 和本文件放在同一个 engine/ 目录下），不依赖电脑里装没装：
   * 中文 Noto Sans SC Black（粗黑体），英文 Montserrat Bold，都是 SIL OFL 免费商用 */
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  const css = document.createElement('style');
  css.textContent = `@font-face{font-family:'Mag CN';src:url('${BASE}fonts/NotoSansSC-Black.otf');font-weight:900}
@font-face{font-family:'Mag EN';src:url('${BASE}fonts/Montserrat-Bold.ttf');font-weight:700}`;
  document.head.appendChild(css);
  const MAG = {
    PAPER: '#f2ede3', INK: '#16130f', RED: '#c8372d', MUTE: '#8b8273', LIME: '#d4ff2e',
    CN: "'Mag CN', 'Noto Sans SC', 'Noto Sans CJK SC', sans-serif", EN: "'Mag EN', 'Montserrat', sans-serif",
  };

  /* 四种配色风格：一句话切换（在 scenes.js 最前面调用 M.theme('lime')）
   *   paper 杂志米白（默认）· lime 青柠撞色 · tech 科技蓝 · noir 暗黑金 */
  MAG.THEMES = {
    paper: { PAPER: '#f2ede3', INK: '#16130f', RED: '#c8372d', MUTE: '#8b8273' },
    lime: { PAPER: '#d4ff2e', INK: '#0b0b0d', RED: '#2a2cf2', MUTE: '#4a5a10' },
    tech: { PAPER: '#0a1a4a', INK: '#ffffff', RED: '#22e3ff', MUTE: '#8fa3d6' },
    noir: { PAPER: '#0e0e10', INK: '#f2ede3', RED: '#d9a441', MUTE: '#8a8578' },
  };
  MAG.theme = name => { Object.assign(MAG, MAG.THEMES[name] || MAG.THEMES.paper); document.getElementById('stage').style.background = MAG.PAPER; return MAG; };

  /* 人像框。opt:
   *   keys  [{t, d, L:{x,y,w,h,r,s}}]：t 开始、d 过渡秒数；r = w/2 是圆；s 放大倍数（自动限幅，整个头始终可见）
   *         第一个关键帧就是第 0 帧的样子：要完整可见，不要从透明淡入
   *   dir   原片帧目录（相对 section 的 index.html），如 '../media/eva'
   *   srcW / srcH  原片帧的真实宽高（竖屏 1080×1920，横屏 1920×1080）
   *   face  {x, y, h}：脸中心 x、头中心 y、头高 h（发顶到下巴），都是占原片宽 / 高的比例；每条新原片都要重新量
   *   frame false 不画杂志偏移细框；frameColor 细框颜色；shadow false 不要投影；z 图层（默认 50） */
  MAG.presenter = function (opt) {
    const keys = opt.keys, W = opt.srcW, H = opt.srcH, F = opt.face;
    C.evaKeys = [{ t: 0, d: 0, L: { x: 0, y: 0, w: 10, h: 10, o: 0 } }];   // 关掉引擎自带的 16:9 窗口
    const lerpL = (a, b, u) => { const o = {}; for (const q in a) o[q] = lerp(a[q], b[q] ?? a[q], u); return o; };
    const poseAt = t => {
      let cur = Object.assign({ r: 4, s: 1 }, keys[0].L);
      for (let i = 1; i < keys.length; i++) {
        const kk = keys[i]; if (t < kk.t) break;
        cur = lerpL(cur, Object.assign({ r: 4, s: 1 }, kk.L), ease.smooth5(clamp((t - kk.t) / (kk.d || .5))));
      }
      return cur;
    };
    MAG.poseAt = poseAt;
    C.scene({ t0: 0, t1: C.end + .05, z: opt.z || 50, quiet: true, build(L) {
        L.style.background = 'transparent';
        const st = {};
        st.frame = el(L, 'div', 'abs', { border: `2px solid ${opt.frameColor || MAG.INK}`, pointerEvents: 'none', display: opt.frame === false ? 'none' : 'block' });
        st.box = el(L, 'div', 'abs', { overflow: 'hidden', background: '#222', boxShadow: opt.shadow === false ? 'none' : '0 24px 60px rgba(20,16,10,.28)' });
        st.img = el(st.box, 'img', 'abs', { maxWidth: 'none' });
        return st; },
      update(lt, st, t) {
        const g = poseAt(t), round = clamp(g.r / (Math.min(g.w, g.h) / 2));
        const c0 = Math.max(g.w / W, g.h / H), fill = .62 - .08 * round;
        const cap = Math.max(1, fill * g.h / (F.h * H * c0)), c = c0 * Math.min(g.s, cap);
        const iw = W * c, ih = H * c, ty = lerp(.45, .5, round);
        Object.assign(st.box.style, { left: g.x + 'px', top: g.y + 'px', width: g.w + 'px', height: g.h + 'px',
          borderRadius: g.r + 'px', outline: round > .9 ? `6px solid ${MAG.PAPER}` : 'none' });
        Object.assign(st.img.style, { width: iw + 'px', height: ih + 'px',
          left: clamp(g.w / 2 - F.x * iw, g.w - iw, 0) + 'px', top: clamp(g.h * ty - F.y * ih, g.h - ih, 0) + 'px' });
        setSrc(st.img, seq(opt.dir, C.src0 + t));
        const m = 16;   // 杂志式偏移细框（圆形时隐藏）
        Object.assign(st.frame.style, { left: (g.x + m) + 'px', top: (g.y + m) + 'px', width: g.w + 'px', height: g.h + 'px',
          opacity: round > .9 ? 0 : 1, borderRadius: g.r + 'px' });
      } });
  };

  /* 素材框：object-fit cover 撑满不留黑边；素材底部自带文字时把 pos 设成 '50% 100%'（贴底），顶部有字用 '50% 0%'，避免切半截 */
  MAG.clip = (L, x, y, w, h, pos) => {
    const b = el(L, 'div', 'abs', { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', overflow: 'hidden',
      borderRadius: '4px', boxShadow: '0 24px 60px rgba(20,16,10,.25)', background: '#ddd' });
    const i = el(b, 'img', 'abs', { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos || '50% 30%' });
    return { b, i };
  };
  /* 播素材帧序列（extract_frames.sh 抽的 30fps JPG），播完停在最后一帧 */
  MAG.play = (c, dir, lt, frames) => setSrc(c.i, seq(dir, Math.min(lt, ((frames || 90) - 1) / 30)));
  MAG.word = (L, txt, size, x, y, color, extra) => el(L, 'div', 'abs', Object.assign({ left: x + 'px', top: y + 'px',
    fontFamily: MAG.CN, fontWeight: 900, fontSize: size + 'px', color: color || MAG.INK, lineHeight: 1.05, whiteSpace: 'nowrap' }, extra || {}), txt);
  /* 英文副标：Montserrat Bold */
  MAG.en = (L, txt, size, x, y, color) => el(L, 'div', 'abs', { left: x + 'px', top: y + 'px', fontFamily: MAG.EN,
    fontWeight: 700, fontSize: size + 'px', color: color || MAG.INK, whiteSpace: 'nowrap', letterSpacing: '.01em' }, txt);
  MAG.small = (L, txt, x, y, color, size, extra) => el(L, 'div', 'abs', Object.assign({ left: x + 'px', top: y + 'px',
    fontFamily: MAG.EN, fontWeight: 700, fontSize: (size || 20) + 'px', letterSpacing: '.22em', color: color || MAG.MUTE,
    whiteSpace: 'nowrap', textTransform: 'uppercase' }, extra || {}), txt);
  MAG.rule = (L, x, y, w, color, h) => el(L, 'div', 'abs', { left: x + 'px', top: y + 'px', width: w + 'px',
    height: (h || 2) + 'px', background: color || MAG.INK, transformOrigin: '0 50%' });
  /* 页眉：FIG. 编号小字 + 细线 */
  MAG.header = (L, txt, x, w) => { MAG.small(L, txt, x, 66, MAG.INK, 20); MAG.rule(L, x, 100, w); };

  window.MAG = MAG;
})();
