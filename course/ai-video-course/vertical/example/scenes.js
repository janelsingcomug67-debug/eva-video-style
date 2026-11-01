/* 个人事业口播 · 竖版 15 秒示例。同一份 scenes.js，f1–f4 四个页面各出一种形式（页面里写了 window.FORM）。
 * 换成自己的口播：改 C.end、face、每个节拍的时间和文字。节拍时间 = 说到那个关键词的时间（看转写的字级时间）。
 * 画面上的字只写口播里说过的事；每个节拍 1.5–4 秒、只讲一个点。 */
(function () {
  const C = EV;
  C.src0 = 0; C.end = 15;
  IP.form({
    form: window.FORM || 'f1',
    dir: '../media/eva', srcW: 1080, srcH: 1920,      // 竖屏原片
    face: { x: .555, y: .44, h: .35 },                // 每条新原片都要重新量
    masthead: 'AI FASHION', issue: 'SIDE BUSINESS · ISSUE 01',   // 杂志封面（f2）的刊头
  });
  IP.beats([
    { t: 0, step: 0, viz: { type: 'big', text: '报告！', sub: 'ONE PHOTO, ONE PROMPT' } },            // 第 0 秒：人 + 大字
    { t: 1.25, step: 0, viz: { type: 'flow', title: '一张图让模特穿上', items: ['服装图', '提示词', '模特上身'], at: [1.6, 2.9, 4.7] } },
    { t: 6.35, step: 1, viz: { type: 'vs', leftHead: 'PROMPT A', left: '模特上身', rightHead: 'PROMPT B', right: '服装平铺图', at: [6.5, 8.8] } },
    { t: 10.85, step: 2, viz: { type: 'pills', title: '描述就能调整', items: ['肤色', '外貌', '描述'], at: [11.46, 12.24, 13.84] } },
  ], ['一张图上身', '换组提示词', '描述来调整']);   // 卡片讲解（f3）每一步的标题
})();
