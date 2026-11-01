/* 个人事业口播 · 竖版四种形式（1080×1920），在 magazine.js 之后加载。
 *   f1 IP 口播风格：真人铺满全屏、脸居中，顶部深色图形区 + 渐变压暗（默认）
 *   f2 杂志封面：青柠底 + 刊头，中间大人像框，身后压一块蓝色色块，图形在刊头下方
 *   f3 卡片讲解：纸张底，上半屏白卡（第 N 步胶囊 + 标题 + 进度条，图形在卡里），下半屏大人像
 *   f4 访谈宽幅：黑底，中间一条 1080×900 宽幅人像，图形在上，字幕在下
 * 用法见 vertical/example/scenes.js：IP.form({form, dir, srcW, srcH, face}) 搭好底和人像，
 * IP.beats([{t, end, viz}]) 按说到关键词的时间逐句出图形（每 1.5–4 秒一个画面、一个点）。 */
(function () {
  const C = window.EV, { el, tf, pop, slide, P, ease, clamp } = C, M = window.MAG, k = window.K;
  const IP = { W: 1080, H: 1920, BLUE: '#2a2cf2', LIME: '#d4ff2e', PAPER: '#f2ede3', INK: '#16130f', RED: '#e0322a', WHITE: '#ffffff' };

  /* 每种形式：背景层、人像框、图形区、主题色（图形区是深底还是浅底）、字幕高度（给 ASS 用） */
  IP.FORMS = {
    f1: { name: 'IP 口播风格', box: { x: 0, y: 0, w: 1080, h: 1920, r: 0 }, area: { x: 70, y: 176, w: 940, h: 410 }, dark: true, capY: 1720 },
    f2: { name: '杂志封面', box: { x: 150, y: 640, w: 780, h: 900, r: 6 }, area: { x: 70, y: 300, w: 940, h: 300 }, dark: false, capY: 1800 },
    f3: { name: '卡片讲解', box: { x: 60, y: 930, w: 960, h: 760, r: 18 }, area: { x: 110, y: 300, w: 860, h: 520 }, dark: false, capY: 1880 },
    f4: { name: '访谈宽幅', box: { x: 0, y: 660, w: 1080, h: 900, r: 0 }, area: { x: 70, y: 150, w: 940, h: 460 }, dark: true, capY: 1800 },
  };

  IP.form = function (opt) {
    const F = IP.FORMS[opt.form || 'f1']; IP.F = F; IP.opt = opt;
    // 背景层（z 10，在人像下面）
    C.scene({ t0: 0, t1: C.end + .05, z: 10, quiet: true, build(L) {
        const st = {};
        if (opt.form === 'f2') {
          L.style.background = IP.LIME;
          M.small(L, opt.issue || 'SIDE BUSINESS · ISSUE 01', 70, 96, IP.INK, 24);
          el(L, 'div', 'abs', { left: '66px', top: '128px', fontFamily: M.EN, fontWeight: 700, fontSize: '128px', letterSpacing: '-.02em', color: IP.INK, lineHeight: 1 }, opt.masthead || 'MY WORK');
          M.rule(L, 70, 270, 940, IP.INK, 4);
          el(L, 'div', 'abs', { left: '210px', top: '700px', width: '780px', height: '900px', background: IP.BLUE });   // 人像身后的蓝色色块
        } else if (opt.form === 'f3') {
          L.style.background = IP.PAPER;
          st.card = el(L, 'div', 'abs', { left: '60px', top: '120px', width: '960px', height: '760px', background: IP.WHITE, borderRadius: '28px', boxShadow: '0 24px 60px rgba(20,16,10,.14)' });
          st.pill = el(L, 'div', 'abs', { left: '110px', top: '170px', padding: '8px 22px', borderRadius: '999px', background: IP.INK, color: IP.WHITE, fontFamily: M.CN, fontWeight: 900, fontSize: '32px' }, '第 1 步');
          st.title = M.word(L, opt.title || '标题', 56, 300, 168, IP.INK);
          el(L, 'div', 'abs', { left: '110px', top: '258px', width: '860px', height: '10px', borderRadius: '5px', background: '#ece6da' });
          st.bar = el(L, 'div', 'abs', { left: '110px', top: '258px', width: '860px', height: '10px', borderRadius: '5px', background: IP.RED, transformOrigin: '0 50%' });
        } else if (opt.form === 'f4') {
          L.style.background = '#08080a';
          M.rule(L, 0, 650, 1080, '#2c2c30', 2); M.rule(L, 0, 1568, 1080, '#2c2c30', 2);
        } else { L.style.background = '#000'; }
        return st; },
      update(lt, st, t) {
        if (st.bar) {   // 卡片讲解：第 N 步和进度条跟着节拍走
          const i = IP.stepAt(t); st.pill.textContent = `第 ${i + 1} 步`;
          if (IP.titles) st.title.textContent = IP.titles[Math.min(i, IP.titles.length - 1)];
          tf(st.bar, { sx: clamp(t / C.end) });
        }
      } });
    M.presenter({ dir: opt.dir, srcW: opt.srcW, srcH: opt.srcH, face: opt.face, z: 50,
      frame: opt.form === 'f2', frameColor: IP.INK, shadow: opt.form === 'f2' || opt.form === 'f3',
      keys: [{ t: 0, d: 0, L: Object.assign({ s: opt.s || 1 }, F.box) }] });
    if (opt.form === 'f1' || !opt.form) {   // 真人铺满时：顶部压暗，保证图形和字看得清
      C.scene({ t0: 0, t1: C.end + .05, z: 55, quiet: true, build(L) {
          L.style.background = 'transparent';
          el(L, 'div', 'abs', { left: 0, top: 0, width: '1080px', height: '760px', background: 'linear-gradient(rgba(8,8,10,.88) 0%, rgba(8,8,10,.72) 55%, rgba(8,8,10,0) 100%)' });
          el(L, 'div', 'abs', { left: 0, top: '1340px', width: '1080px', height: '580px', background: 'linear-gradient(rgba(8,8,10,0), rgba(8,8,10,.7))' });
        } });
    }
  };

  /* 逐句图形。beats: [{t 出现时间, end 结束时间, step? 第几步(卡片讲解用), viz: {type, ...}}]
   * type: big 大字 | pills 关键词胶囊 | vs 对比卡 | flow 流程箭头 | stamp 红色印章
   * 每个 viz 都可以带 at: [每个元素出现的时间]，取自转写的字级时间 */
  IP.beats = function (beats, titles) {
    IP.list = beats; IP.titles = titles;
    beats.forEach((b, n) => C.scene({ t0: b.t, t1: (b.end ?? (beats[n + 1] ? beats[n + 1].t : C.end)) + .03, z: 60, quiet: n === 0,
      build(L) { L.style.background = 'transparent'; const st = { v: IP.viz[b.viz.type](L, IP.F.area, b.viz, IP.F.dark) };
        if (b.t > 0) k.sfx(b.viz.type === 'stamp' ? 'impact' : 'pop', b.t + .05, .12); return st; },
      update(lt, st, t) { st.v.at(t, b); } }));
  };
  IP.stepAt = t => { let s = 0; (IP.list || []).forEach(b => { if (t >= b.t && b.step != null) s = b.step; }); return s; };

  const ink = d => d ? IP.WHITE : IP.INK;
  IP.viz = {
    big(L, A, v, dark) {   // 一个大字 + 一行小字
      const g = el(L, 'div', 'abs', { left: A.x + 'px', top: A.y + 'px', width: A.w + 'px', height: A.h + 'px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transformOrigin: '50% 50%' });
      el(g, 'div', '', { fontFamily: M.CN, fontWeight: 900, fontSize: (v.size || 170) + 'px', color: v.color || (dark ? IP.LIME : IP.INK), lineHeight: 1.05, whiteSpace: 'nowrap', letterSpacing: '-.02em' }, v.text);
      let s; if (v.sub) s = el(g, 'div', '', { marginTop: '18px', fontFamily: M.EN, fontWeight: 700, fontSize: '40px', color: ink(dark), opacity: .85, whiteSpace: 'nowrap' }, v.sub);
      return { at(t, b) { const st = b.t; tf(g, st === 0 ? { s: 1, o: 1 } : pop(t, st, .38, 1.8)); if (s) s.style.opacity = st === 0 ? 1 : P(t, st + .25, .3); } };   // 第 0 秒的大字直接完整出现（第一帧就是封面）
    },
    pills(L, A, v, dark) {   // 2–4 个关键词胶囊，按说到的时间依次弹出
      const g = el(L, 'div', 'abs', { left: A.x + 'px', top: A.y + 'px', width: A.w + 'px', height: A.h + 'px', display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '22px' });
      if (v.title) el(g, 'div', '', { width: '100%', textAlign: 'center', fontFamily: M.CN, fontWeight: 900, fontSize: '64px', color: ink(dark), marginBottom: '10px' }, v.title);
      const ps = v.items.map((w, i) => el(g, 'div', '', { padding: '14px 34px', borderRadius: '999px', background: i % 2 ? IP.RED : (dark ? IP.LIME : IP.INK), color: i % 2 ? IP.WHITE : (dark ? IP.INK : IP.WHITE), fontFamily: M.CN, fontWeight: 900, fontSize: '58px', transformOrigin: '50% 50%' }, w));
      return { at(t, b) { ps.forEach((p, i) => tf(p, pop(t, (v.at || [])[i] ?? b.t + .2 + i * .35, .34, 2))); } };
    },
    vs(L, A, v, dark) {   // 左右对比卡：之前 vs 之后
      const w = (A.w - 60) / 2, mk = (x, bg, fg, head, body) => { const c = el(L, 'div', 'abs', { left: x + 'px', top: A.y + 'px', width: w + 'px', height: A.h + 'px', background: bg, borderRadius: '24px', padding: '30px', transformOrigin: '50% 60%' });
        el(c, 'div', '', { fontFamily: M.EN, fontWeight: 700, fontSize: '30px', letterSpacing: '.18em', color: fg, opacity: .7 }, head);
        el(c, 'div', '', { marginTop: '18px', fontFamily: M.CN, fontWeight: 900, fontSize: (v.size || 64) + 'px', color: fg, lineHeight: 1.15 }, body); return c; };
      const a = mk(A.x, dark ? '#2a2a2e' : '#e7e1d5', dark ? '#cfcfd4' : '#6b6458', v.leftHead || 'BEFORE', v.left);
      const c = mk(A.x + w + 60, IP.RED, IP.WHITE, v.rightHead || 'AFTER', v.right);
      const vs = el(L, 'div', 'abs', { left: (A.x + w - 10) + 'px', top: (A.y + A.h / 2 - 40) + 'px', width: '80px', height: '80px', borderRadius: '40px', background: dark ? IP.LIME : IP.INK, color: dark ? IP.INK : IP.WHITE, fontFamily: M.EN, fontWeight: 700, fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }, 'VS');
      return { at(t, b) { const at = v.at || [b.t + .1, b.t + 1]; tf(a, slide(t, at[0], .45, -60, 0)); tf(c, slide(t, at[1], .45, 60, 0)); tf(vs, pop(t, at[1] + .15, .3)); } };
    },
    flow(L, A, v, dark) {   // 流程：A → B → C
      const n = v.items.length, gap = 70, w = (A.w - gap * (n - 1)) / n, els = [];
      if (v.title) els.push(el(L, 'div', 'abs', { left: A.x + 'px', top: A.y + 'px', width: A.w + 'px', textAlign: 'center', fontFamily: M.CN, fontWeight: 900, fontSize: '56px', color: ink(dark) }, v.title));
      const y = A.y + (v.title ? 110 : 40), h = A.h - (v.title ? 110 : 40) - 20, boxes = [], arrows = [];
      v.items.forEach((it, i) => {
        const x = A.x + i * (w + gap);
        const b = el(L, 'div', 'abs', { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', borderRadius: '22px', background: i === n - 1 ? IP.RED : (dark ? '#1f1f23' : IP.WHITE), border: dark ? '2px solid #3a3a40' : '2px solid ' + IP.INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%' });
        el(b, 'div', '', { fontFamily: M.EN, fontWeight: 700, fontSize: '34px', color: i === n - 1 ? IP.WHITE : (dark ? IP.LIME : IP.RED) }, String(i + 1).padStart(2, '0'));
        el(b, 'div', '', { marginTop: '8px', fontFamily: M.CN, fontWeight: 900, fontSize: (v.size || 46) + 'px', color: i === n - 1 ? IP.WHITE : ink(dark), textAlign: 'center', lineHeight: 1.15, padding: '0 10px' }, it);
        boxes.push(b);
        if (i < n - 1) arrows.push(el(L, 'div', 'abs', { left: (x + w + 12) + 'px', top: (y + h / 2 - 30) + 'px', fontFamily: M.EN, fontWeight: 700, fontSize: '48px', color: ink(dark), transformOrigin: '0 50%' }, '→'));
      });
      return { at(t, b) { boxes.forEach((x, i) => tf(x, pop(t, (v.at || [])[i] ?? b.t + .15 + i * .5, .36, 1.8))); arrows.forEach((x, i) => tf(x, slide(t, ((v.at || [])[i + 1] ?? b.t + .15 + (i + 1) * .5) - .1, .3, -20, 0))); if (els[0]) tf(els[0], slide(t, b.t, .4, 0, -20)); } };
    },
    stamp(L, A, v, dark) {   // 红色印章：结论 / 金句
      const g = el(L, 'div', 'abs', { left: A.x + 'px', top: A.y + 'px', width: A.w + 'px', height: A.h + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
      const s = el(g, 'div', '', { border: '10px solid ' + IP.RED, color: IP.RED, borderRadius: '18px', padding: '18px 44px', fontFamily: M.CN, fontWeight: 900, fontSize: (v.size || 110) + 'px', transform: 'rotate(-6deg)', transformOrigin: '50% 50%', background: dark ? 'rgba(0,0,0,.35)' : 'transparent', whiteSpace: 'nowrap' }, v.text);
      return { at(t, b) { const u = P(t, (v.at || [])[0] ?? b.t + .1, .28); s.style.opacity = u > 0 ? 1 : 0; s.style.transform = `rotate(-6deg) scale(${u > 0 ? 1 + 1.4 * (1 - ease.outBack(u, 2.2)) : 0})`; } };
    },
  };

  window.IP = IP;
})();
