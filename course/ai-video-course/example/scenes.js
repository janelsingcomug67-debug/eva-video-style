/* 横版杂志风 · 15 秒样片示例（四种版式各一镜）。复制这个文件夹当一个 section，按口播改文字、时间点和素材。
 * 时间都是 section 内的秒数；关键词的弹出时间取自转写的字级时间（说到那个词的那一刻）。
 * 版式：A 开场封面（人像约 40% 宽、近满高）→ B 素材镜头（素材大框 + 小圆头像）
 *      → C 讲话（人像在右，≥ 1/4 宽、≥ 6 成高）→ D 讲话（人像在左，右边素材 + 关键词）。 */
(function () {
  const C = EV, { el, tf, pop, slide, wipe, P, ease } = C, k = K, M = MAG;
  M.theme(window.THEME || 'paper');   // 风格：paper 杂志米白 / lime 青柠撞色 / tech 科技蓝 / noir 暗黑金
  C.src0 = 0;     // 本段从原片第几秒开始（已剪掉开头没说话的部分）
  C.end = 15;     // 本段时长；各段加起来必须等于原片帧数 / 30

  M.presenter({
    dir: '../media/eva',
    srcW: 1080, srcH: 1920,                  // 竖屏原片；横屏写 1920, 1080
    face: { x: .555, y: .44, h: .35 },       // 每条新原片都要重新量：看 3–4 帧，量脸中心、头中心、头高
    keys: [
      { t: 0, d: 0, L: { x: 96, y: 56, w: 768, h: 968 } },                // A 开场：第 0 帧就完整可见
      { t: 2.05, d: .5, L: { x: 1585, y: 70, w: 250, h: 250, r: 125 } },  // B 素材镜头：小圆头像（只短暂出现）
      { t: 6.3, d: .55, L: { x: 1320, y: 90, w: 520, h: 720, s: 1.15 } }, // C 讲话：人像在右
      { t: 10.75, d: .55, L: { x: 92, y: 90, w: 520, h: 720, s: 1.15 } }, // D 讲话：人像在左
    ],
  });

  // A · 开场封面：第 0 帧就是一张完整封面（大标题已在场，不从白屏/黑屏淡入）
  C.scene({ t0: 0, t1: 2.33, bg: M.PAPER, quiet: true, build(L) {
      const st = {};
      M.small(L, 'AI STYLE · ISSUE 01', 960, 70, M.INK, 22); M.small(L, 'NOV 2026', 1700, 70, M.MUTE, 22); M.rule(L, 960, 110, 865);
      st.big = k.O(M.word(L, '大标题！', 230, 940, 150, M.RED, { letterSpacing: '-.02em' }), '0 60%');   // 第一句话的钩子
      st.l1 = M.word(L, '第一个关键词', 120, 948, 470);
      st.u1 = M.rule(L, 952, 625, 640, M.RED, 10);
      st.en = M.en(L, 'One line in English.', 54, 952, 660);
      st.tag = k.O(k.chip(L, '+ 关键词', M.INK, M.PAPER, 56, 952, 760, { boxShadow: 'none', borderRadius: '4px' }));
      M.rule(L, 960, 880, 865, M.INK, 1); M.small(L, '本期主题 · 三个要点', 960, 900, M.INK, 22, { letterSpacing: '.12em' });
      M.en(L, 'The issue — a one-line English subtitle', 30, 960, 936, M.MUTE);
      k.sfx('pop', .5, .12, { f: 700 }); k.sfx('click', 1.3, .2); k.sfx('pop', 2.25, .12);
      return st; },
    update(lt, st) {
      tf(st.big, { s: 1 + .025 * Math.sin(lt * 2.2) * P(lt, .45, .4) });
      tf(st.l1, slide(lt, 1.28, .5, 0, 40)); wipe(st.l1, ease.outExpo(P(lt, 1.28, .5)), 'l');   // 1.28 = 说到这个词的时间
      tf(st.u1, { sx: ease.outExpo(P(lt, 1.7, .45)) }); tf(st.en, slide(lt, 1.55, .5, 0, 24));
      tf(st.tag, pop(lt, 2.1, .3));
    } });

  // B · 素材镜头：素材大框撑满，小圆头像在右上角短暂出现
  C.scene({ t0: 2.3, t1: 6.43, bg: M.PAPER, build(L) {
      const st = {};
      M.header(L, 'FIG. 01 — 素材标题', 96, 1350);
      st.c1 = M.clip(L, 96, 130, 1240, 780);
      st.k1 = M.word(L, '小字', 64, 1390, 380, M.MUTE); st.k2 = M.word(L, '关键词', 120, 1384, 450);
      st.u = M.rule(L, 1390, 600, 420, M.RED, 8);
      st.k3 = M.word(L, '小字', 64, 1390, 650, M.MUTE); st.k4 = M.word(L, '第二个', 120, 1384, 720, M.RED);
      k.sfx('impact', 3.1, .14); k.sfx('pop', 5.2, .14);
      return st; },
    update(lt, st) {
      M.play(st.c1, '../media/shot1', lt); tf(st.c1.i, { s: 1 + .05 * lt / 4 });   // 素材慢慢推近
      tf(st.k1, slide(lt, 0, .4, 40, 0)); tf(st.k2, pop(lt, .8, .4));
      tf(st.u, { sx: ease.outExpo(P(lt, 1.1, .4)) });
      tf(st.k3, slide(lt, 2.15, .4, 40, 0)); tf(st.k4, pop(lt, 2.9, .4));
    } });

  // C · 讲话：人像在右，左边素材 + 底部大标题卡
  C.scene({ t0: 6.4, t1: 10.83, bg: M.PAPER, build(L) {
      const st = {};
      M.header(L, 'FIG. 02 — 第二部分', 96, 1130);
      st.c = M.clip(L, 96, 130, 1130, 650, '50% 100%');
      st.chip = k.O(k.chip(L, '一句短句', M.INK, M.PAPER, 50, 130, 160, { boxShadow: 'none', borderRadius: '4px' }));
      st.cap = el(L, 'div', 'abs', { left: '96px', top: '700px', width: '760px', height: '170px', background: M.PAPER,
        padding: '24px 34px', boxShadow: '0 18px 40px rgba(20,16,10,.18)' });
      M.word(st.cap, '大标题卡', 96, 34, 18); st.hen = M.en(st.cap, 'english', 32, 540, 58, M.RED);
      k.sfx('pop', 6.5, .12); k.sfx('impact', 8.8, .13);
      return st; },
    update(lt, st) {
      M.play(st.c, '../media/shot2', lt * .7); tf(st.c.i, { s: 1.04 + .06 * lt / 4.4 });
      tf(st.chip, pop(lt, .1, .35));
      tf(st.cap, slide(lt, 2.35, .5, 0, 60)); st.hen.style.opacity = P(lt, 2.75, .3);
    } });

  // D · 讲话：人像在左，右边素材 + 三个关键词按说到的时间依次弹出
  C.scene({ t0: 10.8, t1: C.end + .05, bg: M.PAPER, build(L) {
      const st = {};
      M.header(L, 'FIG. 03 — 第三部分', 690, 1135);
      st.c = M.clip(L, 690, 130, 760, 720);
      const tag = (cn, en, y) => { const g = el(L, 'div', 'abs', { left: '1500px', top: y + 'px', transformOrigin: '0 50%' });
        M.word(g, cn, 92, 0, 0); M.en(g, en, 32, 4, 108, M.RED); return g; };
      st.t = [tag('要点一', 'point one', 140), tag('要点二', 'point two', 340), tag('要点三', 'point three', 540)];
      st.at = [11.4, 12.2, 13.8];   // 每个词说出来的时间（section 内秒数）
      st.u = M.rule(L, 1500, 730, 330, M.RED, 8);
      st.at.forEach(x => k.sfx('pop', x + .05, .13, { f: 900 }));
      return st; },
    update(lt, st, t) {
      M.play(st.c, '../media/shot3', lt * .7); tf(st.c.i, { s: 1.03 + .05 * lt / 4.2 });
      st.t.forEach((g, i) => tf(g, slide(t, st.at[i], .45, 50, 0)));
      tf(st.u, { sx: ease.outExpo(P(t, 14.5, .4)) });
    } });
})();
